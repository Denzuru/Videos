# F05: complete analysis record (RunBundleManifest).
#
# Captures the R and platform environment, package versions, renv lockfile
# fingerprint, Git revision, configuration and seed fingerprints, input and
# output checksums, permitted logs and the researcher-safe status. Never
# includes participant rows.

MANIFEST_SCHEMA <- "RunBundleManifest"
MANIFEST_CONTRACT_VERSION <- "contracts-v0.1"
# Field names verified against packages/contracts/schemas.js in the Codex core
# candidate (branch lane/g-core-impact, commit 0400cc8a863c4446e994bcdec390aa72cd6d08ba).
CODEX_CONTRACT_COMMIT <- "0400cc8a863c4446e994bcdec390aa72cd6d08ba"
CODEX_REQUIRED_FIELDS <- c("run_id", "protocol_fingerprint", "dataset_fingerprint", "code_fingerprint",
                           "config_fingerprint", "environment_fingerprint", "seed", "output_checksums", "status")
# Keys the Codex contract rejects anywhere in an analysis record (assertNoRestrictedData).
CODEX_RESTRICTED_KEYS <- c("participant_id", "participantid", "subject_id", "subjectid", "identity_number",
                           "identitynumber", "email", "phone", "telephone", "full_name", "fullname",
                           "raw_rows", "participant_rows")
RUNNER_VERSION <- "0.1.1-synthetic"

RUNTIME_PACKAGES <- c("jsonlite", "digest", "yaml")

collect_environment <- function(root) {
  si <- utils::sessionInfo()
  pkgs <- c(si$otherPkgs, si$loadedOnly)
  pkg_records <- lapply(sort(names(pkgs)), function(nm) {
    p <- pkgs[[nm]]
    list(name = nm, version = as.character(p$Version),
         source = p$Repository %||% (if (identical(p$Priority, "base")) "base" else "unknown"))
  })
  for (nm in RUNTIME_PACKAGES) {
    if (!(nm %in% names(pkgs))) {
      pkg_records[[length(pkg_records) + 1]] <- list(name = nm, version = as.character(utils::packageVersion(nm)), source = "installed")
    }
  }
  lock_path <- file.path(root, "renv.lock")
  list(
    r_version = R.version.string,
    r_version_short = paste(R.version$major, R.version$minor, sep = "."),
    platform = R.version$platform,
    os = paste(Sys.info()[["sysname"]], Sys.info()[["release"]]),
    locale = Sys.getlocale("LC_COLLATE"),
    base_r_only = FALSE,
    packages = pkg_records,
    renv_lockfile_present = file.exists(lock_path),
    renv_lockfile_sha256 = sha256_file(lock_path),
    library_paths = as.list(.libPaths())
  )
}

# Compare installed runtime packages with the lockfile. Returns a list of
# mismatch strings (empty when consistent).
lockfile_mismatches <- function(root) {
  lock_path <- file.path(root, "renv.lock")
  if (!file.exists(lock_path)) return("no lockfile (renv.lock) was found")
  lock <- read_json_file(lock_path)
  out <- character(0)
  lr <- lock$R$Version
  if (!is.null(lr) && !identical(lr, paste(R.version$major, R.version$minor, sep = "."))) {
    out <- c(out, sprintf("R %s recorded, R %s installed", lr, paste(R.version$major, R.version$minor, sep = ".")))
  }
  for (nm in RUNTIME_PACKAGES) {
    rec <- lock$Packages[[nm]]
    if (is.null(rec)) { out <- c(out, sprintf("%s is not recorded in the lockfile", nm)); next }
    inst <- tryCatch(as.character(utils::packageVersion(nm)), error = function(e) NA_character_)
    if (is.na(inst)) { out <- c(out, sprintf("%s is recorded but not installed", nm)); next }
    if (!identical(inst, rec$Version)) out <- c(out, sprintf("%s %s recorded, %s installed", nm, rec$Version, inst))
  }
  out
}

# Fingerprints in the shape the platform ingests. What each one hashes is
# documented in docs/protocol/contract-alignment-request-runbundle.md.
contract_fingerprints <- function(ctx) {
  cfg <- ctx$cfg
  inputs <- ctx$inputs %||% list()
  input_sha <- sort(vapply(inputs, function(i) paste0(i$role, ":", i$sha256), character(1)))
  outputs <- ctx$output_records %||% list()
  checksums <- setNames(lapply(outputs, function(o) o$sha256), vapply(outputs, function(o) o$path, character(1)))
  env <- ctx$environment
  list(
    # Sentinel strings (never null) keep failed and blocked records ingestible
    # as failure records; the platform requires every field to be present.
    protocol_fingerprint = if (is.null(cfg)) "no-plan-loaded" else sha256_string(to_canonical_json(cfg$research_plan)),
    dataset_fingerprint = if (length(input_sha)) sha256_string(paste(input_sha, collapse = "\n")) else "no-inputs-read",
    code_fingerprint = if (!is.null(ctx$git) && isTRUE(ctx$git$available)) ctx$git$revision else "unavailable",
    config_fingerprint = if (is.null(cfg)) "no-plan-loaded" else config_fingerprint(cfg),
    environment_fingerprint = sha256_string(paste(R.version.string, R.version$platform,
      if (is.null(env)) sha256_file(file.path(ctx$root, "renv.lock")) %||% "no-lockfile" else env$renv_lockfile_sha256 %||% "no-lockfile", sep = "|")),
    seed = if (is.null(ctx$seed) || is.na(ctx$seed)) -1L else ctx$seed,   # -1 = no valid seed recorded
    output_checksums = if (length(checksums)) checksums else structure(list(), names = character(0)),
    status = ctx$run_state
  )
}

# Mirror of the Codex key-based restricted-data rule so the runner fails its
# own tests before the platform would reject the record.
restricted_keys_present <- function(x, path = "") {
  out <- character(0)
  if (is.list(x)) {
    nms <- names(x)
    for (i in seq_along(x)) {
      key <- if (!is.null(nms) && nzchar(nms[i])) nms[i] else paste0("[", i, "]")
      here <- if (nzchar(path)) paste0(path, ".", key) else key
      if (tolower(key) %in% CODEX_RESTRICTED_KEYS) out <- c(out, here)
      out <- c(out, restricted_keys_present(x[[i]], here))
    }
  }
  out
}

build_manifest <- function(ctx) {
  cfg <- ctx$cfg
  fp <- contract_fingerprints(ctx)
  stages <- lapply(ctx$stages, function(s) {
    list(id = s$id, researcher_label = s$label, state = s$state,
         started_at = s$started_at, ended_at = s$ended_at,
         support_reference = s$support_reference)
  })
  status <- ctx$researcher_status
  c(list(
    schema = MANIFEST_SCHEMA,
    contract_version = MANIFEST_CONTRACT_VERSION,
    contract_verified_against = list(lane = "codex lane/g-core-impact", commit = CODEX_CONTRACT_COMMIT),
    run_id = ctx$run_id,
    run_state = ctx$run_state),
    fp[setdiff(names(fp), "run_id")],
    list(
    data_classification = if (is.null(cfg)) NA_character_ else toupper(cfg$data_classification %||% NA_character_),
    participant_rows_included = FALSE,
    project = if (is.null(cfg)) NULL else list(
      project_id = cfg$project$project_id, run_plan_id = cfg$project$run_plan_id, label = cfg$project$label),
    research_plan = if (is.null(cfg)) NULL else list(
      protocol_version_id = cfg_get(cfg, "research_plan.protocol_version_id"),
      protocol_status = cfg_get(cfg, "research_plan.protocol_status"),
      schema_status = cfg_get(cfg, "research_plan.schema_status"),
      authority_records = cfg_get(cfg, "research_plan.authority_records", list())),
    governance = if (is.null(cfg)) NULL else list(
      approval_status = cfg_get(cfg, "governance.approval_status"),
      approval_reference = cfg_get(cfg, "governance.approval_reference"),
      processing_location = cfg_get(cfg, "governance.processing_location"),
      processing_location_approved = isTRUE(cfg_get(cfg, "governance.processing_location_approved"))),
    timing = list(started_at = ctx$started_at, completed_at = ctx$completed_at),
    runner = list(name = "project-firdous-r-runner", version = RUNNER_VERSION,
                  command = ctx$command %||% NA_character_),
    environment = ctx$environment,
    code = ctx$git,
    configuration = list(
      path = if (is.null(cfg)) ctx$config_path else basename(cfg$.path),
      sha256 = if (is.null(cfg)) NA_character_ else cfg$.sha256,
      content_fingerprint = if (is.null(cfg)) NA_character_ else config_fingerprint(cfg),
      config_version = if (is.null(cfg)) NA_character_ else cfg$config_version,
      seed = ctx$seed,
      seed_fingerprint = if (is.null(ctx$seed)) NA_character_ else sha256_string(as.character(ctx$seed)),
      participant_id_pattern = if (is.null(cfg)) NA_character_ else cfg$data$participant_id_pattern %||% NA_character_),
    analysis = ctx$analysis_result,
    inputs = ctx$inputs %||% list(),
    outputs = ctx$output_records %||% list(),
    checks = ctx$checks %||% list(),
    stages = stages,
    researcher_status = status,
    findings = ctx$finding_statuses %||% list(),
    unresolved_decisions = ctx$unresolved_decisions %||% list(),
    logs = ctx$log_records %||% list(),
    local_only_files = ctx$local_files %||% list()
  ))
}

# Fields every manifest must carry for the record to be considered complete.
MANIFEST_REQUIRED_PATHS <- c(
  CODEX_REQUIRED_FIELDS,
  "schema", "contract_version", "run_id", "run_state", "data_classification",
  "participant_rows_included", "timing.started_at", "timing.completed_at",
  "runner.name", "runner.version",
  "environment.r_version", "environment.platform", "environment.os", "environment.packages",
  "environment.renv_lockfile_present", "environment.renv_lockfile_sha256",
  "code.revision", "code.branch", "code.working_tree_clean",
  "configuration.sha256", "configuration.content_fingerprint", "configuration.seed",
  "configuration.seed_fingerprint",
  "inputs", "outputs", "stages", "researcher_status.plain_language_title",
  "researcher_status.plain_language_summary", "researcher_status.why_it_matters",
  "researcher_status.next_action", "researcher_status.can_continue_elsewhere",
  "researcher_status.work_preserved", "researcher_status.support_reference", "logs"
)

manifest_missing_fields <- function(m) {
  miss <- character(0)
  for (p in MANIFEST_REQUIRED_PATHS) {
    parts <- strsplit(p, ".", fixed = TRUE)[[1]]
    x <- m
    ok <- TRUE
    for (part in parts) {
      if (!is.list(x) || is.null(x[[part]])) { ok <- FALSE; break }
      x <- x[[part]]
    }
    if (!ok) miss <- c(miss, p)
  }
  miss
}
