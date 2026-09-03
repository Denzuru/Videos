# One-command pipeline orchestrator.
#
# run_pipeline() executes the six researcher-visible stages in order, stops
# at the first failed or blocked stage, and ALWAYS writes the reproducibility
# record (manifest + researcher status) so a failed run can never be mistaken
# for a successful one and is always explainable.

run_pipeline <- function(config_path, out_root = NULL, run_id = NULL, seed = NULL,
                         quiet = FALSE, command = NULL) {
  root <- runner_root()
  ctx <- new.env(parent = emptyenv())
  ctx$root <- root
  ctx$config_path <- config_path
  ctx$run_id <- run_id %||% make_run_id()
  ctx$quiet <- quiet
  ctx$command <- command
  ctx$started_at <- now_utc()
  ctx$run_state <- "RUNNING"
  ctx$stages <- new_stage_records()
  ctx$seed_override <- seed
  ctx$cfg <- NULL
  ctx$inputs <- list(); ctx$checks <- list(); ctx$local_files <- list()

  out_root <- out_root %||% file.path(root, "outputs", "synthetic", "runs")
  ctx$run_dir <- file.path(out_root, ctx$run_id)
  for (d in c("", "outputs", "support", "checks", "local")) {
    dir.create(file.path(ctx$run_dir, d), recursive = TRUE, showWarnings = FALSE)
  }
  ctx$support_log <- file.path(ctx$run_dir, "support", "technical_log.txt")
  writeLines(c("Project Firdous R runner: technical log (support use only)",
               paste0("run_id: ", ctx$run_id)), ctx$support_log)

  say(ctx, "Project Firdous analysis run")
  say(ctx, "Analysis record: ", ctx$run_dir)
  say(ctx, "")

  ok <- TRUE
  for (stage_id in c("environment", "data", "plan", "analysis", "outputs")) {
    fn <- switch(stage_id,
      environment = stage_environment,
      data        = stage_data,
      plan        = stage_plan,
      analysis    = stage_analysis,
      outputs     = stage_outputs)
    res <- run_stage(ctx, stage_id, fn)
    if (identical(res, FALSE)) { ok <- FALSE; skip_remaining(ctx, stage_id); break }
  }
  if (ok) {
    ctx$run_state <- "SUCCEEDED"
    ctx$researcher_status <- success_status(make_support_reference(ctx$run_id, "OK"))
  }

  # The record stage always runs.
  rec <- run_stage(ctx, "record", stage_record_write)
  if (identical(rec, FALSE)) {
    # Recording failed: the run cannot be trusted as complete.
    ctx$run_state <- "FAILED"
  }
  ctx$completed_at <- now_utc()
  print_outcome(ctx)
  invisible(list(
    run_id = ctx$run_id, run_dir = ctx$run_dir, run_state = ctx$run_state,
    researcher_status = ctx$researcher_status, findings = ctx$finding_statuses,
    manifest_path = file.path(ctx$run_dir, "manifest.json"),
    status_path = file.path(ctx$run_dir, "run_status.json")
  ))
}

# ---- stage 1: environment ---------------------------------------------------
stage_environment <- function(ctx) {
  ctx$cfg <- load_config(ctx$config_path)
  ctx$seed <- ctx$seed_override %||% cfg_get(ctx$cfg, "stages.seed")
  if (is.null(ctx$seed)) stop_firdous("CONFIG_INVALID", list(detail = "no seed is recorded under stages.seed"))
  ctx$seed <- as.integer(ctx$seed)
  # Refuse anything that is not declared synthetic before touching any file.
  if (!identical(toupper(ctx$cfg$data_classification %||% ""), "SYNTHETIC")) {
    stop_firdous("PLAN_REAL_DATA_NOT_PERMITTED",
                 list(classification = ctx$cfg$data_classification %||% "(not recorded)"))
  }
  ctx$environment <- collect_environment(ctx$root)
  ctx$git <- git_info(ctx$root)
  log_support(ctx, "R: ", R.version.string, "; platform: ", R.version$platform)
  log_support(ctx, "git: ", ctx$git$revision %||% "unavailable")

  enforce <- cfg_get(ctx$cfg, "environment.enforce_lockfile", default = TRUE)
  mism <- lockfile_mismatches(ctx$root)
  ctx$checks$environment <- list(lockfile_enforced = isTRUE(enforce),
                                 lockfile_consistent = length(mism) == 0,
                                 mismatches = as.list(mism))
  if (isTRUE(enforce) && length(mism) > 0) {
    stop_firdous("ENV_NOT_REPRODUCIBLE", list(detail = paste(mism, collapse = "; ")))
  }
  list(r_version = R.version.string)
}

# ---- stage 2: data structure (F01 + F02) -----------------------------------
stage_data <- function(ctx) {
  cfg <- ctx$cfg
  dcfg <- cfg$data
  findings <- list()

  read_input <- function(role, rel, required = TRUE) {
    path <- resolve_data_path(ctx$root, rel)
    if (is.na(path) || !file.exists(path)) {
      if (!required) return(NULL)
      stop_firdous("DATA_FILE_MISSING", list(role = role, path = rel %||% "(not recorded)"))
    }
    df <- read_csv_character(path)
    ctx$inputs[[length(ctx$inputs) + 1]] <- list(
      role = role, path = rel, sha256 = sha256_file(path), rows = nrow(df),
      columns = names(df), participant_rows_included = FALSE)
    df
  }

  participants <- read_input("participant", dcfg$participants_file)
  assays <- read_input("assay", dcfg$assays_file)
  exceptions <- read_input("approved-exceptions", dcfg$exceptions_file, required = FALSE)

  id_col <- dcfg$participant_id_column
  target_col <- dcfg$assay_target_column
  value_col <- dcfg$assay_value_column

  req_p <- unlist(dcfg$required_participant_columns %||% list(id_col))
  miss_p <- setdiff(req_p, names(participants))
  if (length(miss_p)) findings[[length(findings) + 1]] <- new_finding("DATA_COLUMNS_MISSING",
    list(role = "participant", columns = paste(miss_p, collapse = ", ")))
  req_a <- c(id_col, target_col, value_col)
  miss_a <- setdiff(req_a, names(assays))
  if (length(miss_a)) findings[[length(findings) + 1]] <- new_finding("DATA_COLUMNS_MISSING",
    list(role = "assay", columns = paste(miss_a, collapse = ", ")))
  if (length(findings)) stop_firdous(findings[[1]]$code, findings[[1]]$values, findings)

  # Identifier format (never echoes the offending identifiers to the researcher)
  pat <- dcfg$participant_id_pattern
  for (role in c("participant", "assay")) {
    ids <- if (role == "participant") participants[[id_col]] else assays[[id_col]]
    bad <- which(!grepl(pat, ids))
    if (length(bad)) {
      findings[[length(findings) + 1]] <- new_finding("DATA_IDS_MALFORMED",
        list(count = length(bad), role = role), detail = data.frame(row = bad))
    }
  }

  # F01: typing
  vr <- dcfg$value_representations %||% list()
  typing <- type_assay_values(assays[[value_col]], value_col,
                              missing_tokens = unlist(vr$missing_tokens %||% list()),
                              below_detection_tokens = unlist(vr$below_detection_tokens %||% list()),
                              allowed_range = vr$allowed_range)
  findings <- c(findings, typing_findings(typing, value_col,
                                          unlist(vr$missing_tokens %||% list()),
                                          unlist(vr$below_detection_tokens %||% list()),
                                          vr$allowed_range))
  assays$value_numeric <- typing$numeric
  assays$value_status <- typing$status

  # F02: reconciliation
  required_targets <- unlist(cfg_get(cfg, "analysis_plan.target_panel", list()))
  recon <- reconcile_participants_assays(participants, assays, exceptions,
                                         id_col, target_col, required_targets)
  findings <- c(findings, recon$findings)

  # Persist the researcher-safe summary and the local (identifier-level) detail.
  ctx$checks$assay_typing <- typing$counts
  ctx$checks$reconciliation <- recon$summary
  ctx$data_summary <- c(list(participants_file_rows = nrow(participants),
                             assay_file_rows = nrow(assays)),
                        typing$counts[c("observed", "missing", "below_detection")],
                        recon$summary[c("orphan_assay_rows", "missing_required_assays",
                                        "duplicate_assay_keys", "approved_exceptions_applied")])
  write_json_file(list(assay_typing = typing$counts, reconciliation = recon$summary,
                       findings = lapply(findings, function(f) list(code = f$code, values = f$values))),
                  file.path(ctx$run_dir, "checks", "data_readiness.json"))
  for (f in findings) {
    if (!is.null(f$detail) && is.data.frame(f$detail) && nrow(f$detail) > 0) {
      p <- file.path(ctx$run_dir, "local", paste0(tolower(f$code), "_detail.csv"))
      write_csv_deterministic(f$detail, p)
      ctx$local_files[[length(ctx$local_files) + 1]] <- list(
        path = file.path("local", basename(p)), purpose = "identifier-level detail for the data custodian",
        returned_to_platform = FALSE)
    }
  }

  if (length(findings)) {
    log_support(ctx, "data findings: ", paste(vapply(findings, `[[`, "", "code"), collapse = ", "))
    stop_firdous(findings[[1]]$code, findings[[1]]$values, findings)
  }
  ctx$data <- list(participants = participants, assays = assays, exceptions = exceptions)
  list(participants = nrow(participants), assay_rows = nrow(assays))
}

# ---- stage 3: research plan gate (F03) ------------------------------------
stage_plan <- function(ctx) {
  gate <- check_research_plan_gate(ctx$cfg)
  ctx$checks$research_plan_gate <- gate$summary
  write_json_file(list(locked = gate$locked, summary = gate$summary,
                       findings = lapply(gate$findings, function(f) list(code = f$code, values = f$values))),
                  file.path(ctx$run_dir, "checks", "research_plan_gate.json"))
  for (f in gate$findings) {
    if (identical(f$code, "PLAN_DECISIONS_UNRESOLVED") && is.data.frame(f$detail)) {
      ctx$unresolved_decisions <- lapply(seq_len(nrow(f$detail)), function(i)
        list(field = f$detail$field[i], decision = f$detail$decision[i], resolving_role = f$detail$resolving_role[i]))
    }
  }
  if (!gate$locked) stop_firdous(gate$findings[[1]]$code, gate$findings[[1]]$values, gate$findings)
  list(locked = TRUE)
}

# ---- stage 4: analysis -------------------------------------------------------
stage_analysis <- function(ctx) {
  res <- tryCatch(run_analysis_stage(ctx),
    firdous_failure = function(f) stop(f),
    error = function(e) stop_firdous("ANALYSIS_STAGE_FAILED", list(), technical = conditionMessage(e)))
  ctx$analysis_result <- res
  res
}

# ---- stage 5: outputs --------------------------------------------------------
stage_outputs <- function(ctx) {
  chk <- check_outputs(ctx)
  ctx$output_records <- Filter(function(r) isTRUE(r$approved) && !isTRUE(r$quarantined), chk$records)
  ctx$checks$output_guard <- chk$summary
  if (length(chk$findings)) stop_firdous(chk$findings[[1]]$code, chk$findings[[1]]$values, chk$findings)
  chk$summary
}

# ---- stage 6: record ---------------------------------------------------------
stage_record_write <- function(ctx) {
  ctx$completed_at <- now_utc()
  # Leak self-check on everything that could be returned or read by a person.
  id_pattern <- if (!is.null(ctx$cfg)) ctx$cfg$data$participant_id_pattern else NULL
  returned <- c(file.path(ctx$run_dir, "support", "technical_log.txt"),
                list.files(file.path(ctx$run_dir, "outputs"), full.names = TRUE),
                list.files(file.path(ctx$run_dir, "checks"), full.names = TRUE))
  if (!is.null(id_pattern)) {
    for (p in returned) {
      txt <- tryCatch(readLines(p, warn = FALSE), error = function(e) character(0))
      if (any(grepl(id_pattern, txt))) {
        log_support(ctx, "leak self-check: identifier pattern found in ", basename(p), "; file quarantined")
        q <- file.path(ctx$run_dir, "local", "quarantined_outputs"); dir.create(q, showWarnings = FALSE, recursive = TRUE)
        file.rename(p, file.path(q, basename(p)))
        ctx$run_state <- "FAILED"
        ctx$researcher_status <- build_researcher_status("OUTPUT_CONTAINS_PARTICIPANT_ROWS",
          list(file = basename(p)), make_support_reference(ctx$run_id, "OUTPUT_CONTAINS_PARTICIPANT_ROWS"))
        ctx$output_records <- Filter(function(r) basename(r$path) != basename(p), ctx$output_records %||% list())
      }
    }
  }
  # The record step is the last one; mark it complete so the files it writes
  # describe the finished run. If writing fails, the stage engine overrides this.
  set_stage(ctx, "record", state = "SUCCEEDED", ended_at = now_utc())
  ctx$log_records <- list(list(path = "support/technical_log.txt", kind = "support_only",
                               sha256 = sha256_file(ctx$support_log)))
  manifest <- build_manifest(ctx)
  manifest$timing$completed_at <- ctx$completed_at
  miss <- manifest_missing_fields(manifest)
  if (length(miss)) log_support(ctx, "manifest fields not populated: ", paste(miss, collapse = ", "))
  manifest$record_complete <- length(miss) == 0
  manifest$record_missing_fields <- as.list(miss)
  write_json_file(manifest, file.path(ctx$run_dir, "manifest.json"))

  status <- list(
    run_id = ctx$run_id, run_state = ctx$run_state,
    data_classification = manifest$data_classification,
    started_at = ctx$started_at, completed_at = ctx$completed_at,
    stages = lapply(ctx$stages, function(s) s[c("id", "label", "step", "of", "state")]),
    researcher_status = ctx$researcher_status,
    findings = ctx$finding_statuses %||% list(),
    unresolved_decisions = ctx$unresolved_decisions %||% list(),
    analysis_record = "manifest.json",
    support_log = "support/technical_log.txt"
  )
  write_json_file(status, file.path(ctx$run_dir, "run_status.json"))
  writeLines(researcher_summary_text(ctx), file.path(ctx$run_dir, "researcher_summary.md"))
  list(manifest = "manifest.json", complete = length(miss) == 0)
}

# ---- researcher-facing text --------------------------------------------------
researcher_summary_text <- function(ctx) {
  st <- ctx$researcher_status
  lines <- c(paste0("# ", st$plain_language_title), "",
             paste0("Status: ", state_label(ctx$run_state)), "",
             "## What happened", st$plain_language_summary, "",
             "## Why it matters", st$why_it_matters, "",
             "## Your work is safe",
             if (isTRUE(st$work_preserved)) "Nothing you entered or produced earlier has been changed or lost." else "Some work from this attempt may need to be repeated.",
             "",
             "## What to do next", st$next_action, "")
  if (!is.null(st$resolving_role)) lines <- c(lines, "## Who can resolve this", st$resolving_role, "")
  if (length(ctx$finding_statuses %||% list()) > 1) {
    lines <- c(lines, "## All items found in this attempt")
    for (f in ctx$finding_statuses) lines <- c(lines, paste0("- ", f$plain_language_title, ": ", f$plain_language_summary))
    lines <- c(lines, "")
  }
  lines <- c(lines, "## Steps")
  for (s in ctx$stages) lines <- c(lines, sprintf("- Step %d of %d, %s: %s", s$step, s$of, s$label, state_label(s$state)))
  lines <- c(lines, "", "## Details for support",
             paste0("Support reference: ", st$support_reference %||% "(none)"),
             "Technical log: support/technical_log.txt (for research support; not needed to understand this page)")
  lines
}

state_label <- function(state) {
  switch(state,
    SUCCEEDED = "Completed", FAILED = "Stopped, action needed", BLOCKED = "Waiting for a decision",
    RUNNING = "In progress", SKIPPED = "Not run", NOT_STARTED = "Not started", state)
}

print_outcome <- function(ctx) {
  st <- ctx$researcher_status
  say(ctx, "")
  if (identical(ctx$run_state, "SUCCEEDED")) {
    say(ctx, st$plain_language_title, ".")
    say(ctx, st$plain_language_summary)
  } else {
    failed <- Filter(function(s) s$state %in% c("FAILED", "BLOCKED"), ctx$stages)
    if (length(failed)) say(ctx, sprintf("The analysis stopped at step %d: %s.", failed[[1]]$step, failed[[1]]$label))
    say(ctx, "")
    say(ctx, st$plain_language_title)
    say(ctx, "  What happened:     ", st$plain_language_summary)
    say(ctx, "  Why it matters:    ", st$why_it_matters)
    say(ctx, "  Your work is safe: ", if (isTRUE(st$work_preserved)) "nothing entered or produced earlier has been changed." else "some work may need to be repeated.")
    say(ctx, "  Next action:       ", st$next_action)
    if (!is.null(st$resolving_role)) say(ctx, "  Who can resolve it: ", st$resolving_role)
    n <- length(ctx$finding_statuses %||% list())
    if (n > 1) say(ctx, sprintf("  %d item(s) were found in total. The full list is in researcher_summary.md.", n))
  }
  say(ctx, "")
  say(ctx, "Support reference: ", st$support_reference %||% "(none)")
  say(ctx, "Details for support: ", file.path(ctx$run_dir, "support", "technical_log.txt"))
}
