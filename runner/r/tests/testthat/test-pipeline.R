LOCKED <- file.path(RUNNER_ROOT, "config", "synthetic_locked.yml")
DRAFT <- file.path(RUNNER_ROOT, "config", "synthetic_draft.yml")
MALFORMED <- file.path(RUNNER_ROOT, "tests", "fixtures", "config_malformed_values.yml")
RECON <- file.path(RUNNER_ROOT, "tests", "fixtures", "config_reconciliation_problems.yml")
TEMPLATE <- file.path(RUNNER_ROOT, "config", "firdous_template_BLOCKED.yml")
stage_states <- function(res) { s <- read_json_file(res$status_path)$stages; setNames(vapply(s, `[[`, "", "state"), vapply(s, `[[`, "", "id")) }

test_that("a fully locked synthetic configuration runs end to end and leaves a complete record", {
  res <- run_quiet(LOCKED, run_id = "t-locked")
  expect_equal(res$run_state, "SUCCEEDED")
  expect_true(all(stage_states(res) == "SUCCEEDED"))
  m <- read_json_file(res$manifest_path)
  expect_equal(m$schema, "RunBundleManifest")
  expect_equal(m$run_state, "SUCCEEDED")
  expect_false(m$participant_rows_included)
  expect_true(m$record_complete)
  expect_length(manifest_missing_fields(m), 0)
  expect_setequal(vapply(m$outputs, `[[`, "", "path"),
                  c("outputs/group_counts.csv", "outputs/target_summary_by_group.csv", "outputs/data_readiness_summary.csv"))
  expect_true(all(nchar(vapply(m$outputs, `[[`, "", "sha256")) == 64))
  expect_equal(length(m$inputs), 3)
  expect_true(m$environment$renv_lockfile_present)
  expect_true(m$code$available)
  expect_equal(m$configuration$seed, 20260903)
  expect_equal(m$seed, 20260903); expect_equal(m$status, "SUCCEEDED")
  expect_equal(m$analysis$scientific_claim, "none")
  expect_equal(m$researcher_status$state, "SUCCEEDED")
  expect_true(file.exists(file.path(res$run_dir, "researcher_summary.md")))
  expect_no_participant_ids(res$run_dir)
})

test_that("the same seed and configuration reproduce identical outputs (F07 determinism)", {
  a <- run_quiet(LOCKED, run_id = "t-det-a")
  b <- run_quiet(LOCKED, run_id = "t-det-b")
  ma <- read_json_file(a$manifest_path); mb <- read_json_file(b$manifest_path)
  sha <- function(m) setNames(vapply(m$outputs, `[[`, "", "sha256"), vapply(m$outputs, `[[`, "", "path"))
  expect_identical(sha(ma), sha(mb))
  expect_identical(ma$configuration$content_fingerprint, mb$configuration$content_fingerprint)
  expect_identical(ma$configuration$seed_fingerprint, mb$configuration$seed_fingerprint)
  cmp <- replay_compare(ma, mb)
  expect_equal(cmp$verdict, "MATCH")
  # And byte-identical files, not just matching hashes in the record.
  for (f in names(sha(ma))) expect_identical(readLines(file.path(a$run_dir, f)), readLines(file.path(b$run_dir, f)))
})

test_that("replay_run against a reference record reports MATCH, and a tampered record reports MISMATCH (F07)", {
  ref <- run_quiet(LOCKED, run_id = "t-ref")
  rep <- replay_run(LOCKED, ref$manifest_path, out_root = tempfile("replay-"), run_id = "t-replay", quiet = TRUE)
  expect_equal(rep$verdict, "MATCH")
  expect_true(file.exists(file.path(dirname(rep$candidate_manifest), "replay_report.json")))
  m <- read_json_file(ref$manifest_path)
  m$outputs[[1]]$sha256 <- strrep("0", 64)
  cmp <- replay_compare(m, read_json_file(rep$candidate_manifest))
  expect_equal(cmp$verdict, "MISMATCH")
  expect_true(any(grepl("^outputs\\.outputs/.*sha256$", vapply(cmp$differences, `[[`, "", "field"))))
})

test_that("malformed assay values stop the run at the data step with a precise, researcher-safe failure", {
  res <- run_quiet(MALFORMED, run_id = "t-malformed")
  expect_equal(res$run_state, "FAILED")
  st <- stage_states(res)
  expect_equal(unname(st[c("environment", "data", "plan", "analysis", "outputs", "record")]),
               c("SUCCEEDED", "FAILED", "SKIPPED", "SKIPPED", "SKIPPED", "SUCCEEDED"))
  expect_equal(res$researcher_status$code, "DATA_VALUES_MALFORMED")
  expect_match(res$researcher_status$plain_language_summary, "7 value\\(s\\) in the 'value' column")
  codes <- vapply(res$findings, `[[`, "", "code")
  expect_setequal(codes, c("DATA_VALUES_MALFORMED", "DATA_VALUES_OUT_OF_RANGE"))
  m <- read_json_file(res$manifest_path)
  expect_equal(m$run_state, "FAILED")
  expect_true(m$record_complete)
  expect_length(m$outputs, 0)
  expect_length(list.files(file.path(res$run_dir, "outputs")), 0)
  # A failed run never looks successful anywhere a person or the platform reads.
  texts <- read_run_files(res$run_dir)
  expect_false(any(grepl("\"run_state\": \"SUCCEEDED\"", unlist(texts))))
  expect_false(grepl("Completed", readLines(file.path(res$run_dir, "researcher_summary.md"))[3]))
  summary <- paste(readLines(file.path(res$run_dir, "researcher_summary.md")), collapse = "\n")
  expect_false(grepl("Error in|traceback", summary))
  expect_true(all(nzchar(unlist(res$researcher_status[c("plain_language_title", "why_it_matters", "next_action", "resolving_role", "support_reference")]))))
  expect_no_participant_ids(res$run_dir)
})

test_that("orphan, missing and duplicate identifiers are reported together and identifiers stay local", {
  res <- run_quiet(RECON, run_id = "t-recon")
  expect_equal(res$run_state, "FAILED")
  codes <- vapply(res$findings, `[[`, "", "code")
  expect_setequal(codes, c("DATA_ORPHAN_ASSAYS", "DATA_MISSING_ASSAYS", "DATA_DUPLICATE_KEYS"))
  expect_true(all(vapply(res$findings, function(f) nzchar(f$support_reference), logical(1))))
  local <- list.files(file.path(res$run_dir, "local"))
  expect_true(all(c("data_orphan_assays_detail.csv", "data_missing_assays_detail.csv", "data_duplicate_keys_detail.csv") %in% local))
  m <- read_json_file(res$manifest_path)
  expect_true(all(!vapply(m$local_only_files, `[[`, TRUE, "returned_to_platform")))
  expect_no_participant_ids(res$run_dir)   # excludes local/
  expect_true(any(grepl("SYN-0099", readLines(file.path(res$run_dir, "local", "data_orphan_assays_detail.csv")))))
})

test_that("an unapproved exception blocks and names the resolver", {
  p <- temp_config(function(c) { c$data$exceptions_file <- "tests/fixtures/exceptions_unapproved.csv"; c })
  res <- run_quiet(p, run_id = "t-exc")
  codes <- vapply(res$findings, `[[`, "", "code")
  expect_true("DATA_EXCEPTION_UNAPPROVED" %in% codes)
  expect_true("DATA_MISSING_ASSAYS" %in% codes)
  f <- Filter(function(x) x$code == "DATA_EXCEPTION_UNAPPROVED", res$findings)[[1]]
  expect_equal(f$state, "BLOCKED"); expect_match(f$resolving_role, "supervisor")
})

test_that("a draft research plan blocks before the analysis and lists the open decisions", {
  res <- run_quiet(DRAFT, run_id = "t-draft")
  expect_equal(res$run_state, "BLOCKED")
  st <- stage_states(res)
  expect_equal(unname(st["data"]), "SUCCEEDED")     # data work can continue while decisions are pending
  expect_equal(unname(st["plan"]), "BLOCKED")
  expect_equal(unname(st["analysis"]), "SKIPPED")
  expect_equal(res$researcher_status$code, "PLAN_PROTOCOL_NOT_LOCKED")
  expect_true(res$researcher_status$can_continue_elsewhere)
  m <- read_json_file(res$manifest_path)
  expect_equal(length(m$unresolved_decisions), 2)
  expect_setequal(vapply(m$unresolved_decisions, `[[`, "", "decision"), c("The primary outcome", "The multiple-testing correction"))
  expect_length(m$outputs, 0)
})

test_that("a locked plan with one unresolved scientific choice still blocks", {
  p <- temp_config(function(c) { c$analysis_plan$below_detection_rule <- "BLOCKED"; c })
  res <- run_quiet(p, run_id = "t-oneblocked")
  expect_equal(res$run_state, "BLOCKED")
  expect_equal(res$researcher_status$code, "PLAN_DECISIONS_UNRESOLVED")
  expect_match(res$researcher_status$plain_language_summary, "How below-detection values are handled")
})

test_that("missing governance approval blocks even when the plan is locked", {
  p <- temp_config(function(c) { c$governance$approval_status <- "REVOKED"; c })
  res <- run_quiet(p, run_id = "t-gov")
  expect_equal(res$run_state, "BLOCKED")
  expect_equal(res$researcher_status$code, "PLAN_GOVERNANCE_NOT_APPROVED")
  expect_match(res$researcher_status$resolving_role, "governance")
})

test_that("the real-study template is refused at the first step, before any data file is read", {
  res <- run_quiet(TEMPLATE, run_id = "t-template")
  expect_equal(res$run_state, "BLOCKED")
  expect_equal(res$researcher_status$code, "PLAN_REAL_DATA_NOT_PERMITTED")
  st <- stage_states(res)
  expect_equal(unname(st["environment"]), "BLOCKED")
  expect_equal(unname(st["data"]), "SKIPPED")
  m <- read_json_file(res$manifest_path)
  expect_length(m$inputs, 0)
})

test_that("an output not on the approved list is quarantined and the run fails", {
  # A step that writes more than it declared: the output guard, not the registry, must catch it.
  on.exit(rm("LEAKY_KIND", envir = .analysis_registry))
  register_analysis_kind("LEAKY_KIND", "Leaky test kind", function(ctx) {
    write_csv_deterministic(data.frame(metric = "n", value = 1), file.path(ctx$run_dir, "outputs", "one_number.csv"))
    write_csv_deterministic(data.frame(metric = "n", value = 2), file.path(ctx$run_dir, "outputs", "extra.csv"))
    list(outputs_written = c("one_number.csv", "extra.csv"))
  }, declared_outputs = "one_number.csv")
  p <- temp_config(function(c) { c$stages$analysis$kind <- "LEAKY_KIND"; c$outputs$allow_list <- list(list(name = "one_number.csv", kind = "aggregate_table")); c })
  res <- run_quiet(p, run_id = "t-allow")
  expect_equal(res$run_state, "FAILED")
  expect_equal(res$researcher_status$code, "OUTPUT_NOT_ALLOWED")
  expect_false(file.exists(file.path(res$run_dir, "outputs", "extra.csv")))
  expect_true(file.exists(file.path(res$run_dir, "local", "quarantined_outputs", "extra.csv")))
  m <- read_json_file(res$manifest_path)
  expect_false("outputs/extra.csv" %in% vapply(m$outputs, `[[`, "", "path"))
})

test_that("groups below the minimum reportable size fail the output check", {
  p <- temp_config(function(c) { c$governance$minimum_reportable_cell_size <- 13; c })
  res <- run_quiet(p, run_id = "t-cell")
  expect_equal(res$run_state, "FAILED")
  expect_equal(res$researcher_status$code, "OUTPUT_SMALL_CELL")
})

test_that("an analysis kind the runner does not contain is blocked, not improvised", {
  p <- temp_config(function(c) { c$stages$analysis$kind <- "REAL_SCRIPT_03_MODELLING"; c })
  res <- run_quiet(p, run_id = "t-kind")
  expect_equal(res$run_state, "BLOCKED")
  expect_equal(res$researcher_status$code, "ANALYSIS_KIND_UNKNOWN")
})

test_that("a missing data file is explained in plain language", {
  p <- temp_config(function(c) { c$data$assays_file <- "data/synthetic/does_not_exist.csv"; c })
  res <- run_quiet(p, run_id = "t-nofile")
  expect_equal(res$run_state, "FAILED")
  expect_equal(res$researcher_status$code, "DATA_FILE_MISSING")
  expect_match(res$researcher_status$plain_language_summary, "assay file was expected at")
})

test_that("an environment that differs from the lockfile is blocked (F04 enforcement)", {
  alt <- tempfile("altroot-"); dir.create(alt)
  for (d in c("R", "config", "data")) file.copy(file.path(RUNNER_ROOT, d), alt, recursive = TRUE)
  lock <- read_json_file(file.path(RUNNER_ROOT, "renv.lock"))
  lock$Packages$jsonlite$Version <- "0.0.1"
  write_json_file(lock, file.path(alt, "renv.lock"))
  old <- Sys.getenv("FIRDOUS_RUNNER_ROOT"); Sys.setenv(FIRDOUS_RUNNER_ROOT = alt); on.exit(Sys.setenv(FIRDOUS_RUNNER_ROOT = old))
  res <- run_pipeline(file.path(alt, "config", "synthetic_locked.yml"), out_root = tempfile("runs-"), run_id = "t-env", quiet = TRUE)
  expect_equal(res$run_state, "BLOCKED")
  expect_equal(res$researcher_status$code, "ENV_NOT_REPRODUCIBLE")
  expect_match(res$researcher_status$plain_language_summary, "jsonlite 0.0.1 recorded")
})

test_that("an unexpected R error never reaches the researcher as raw text", {
  # A malformed range setting makes the typing code hit a genuine R error.
  p <- temp_config(function(c) { c$data$value_representations$allowed_range <- "0-45"; c })
  res <- run_quiet(p, run_id = "t-unexpected")
  expect_equal(res$run_state, "FAILED")
  expect_equal(res$researcher_status$code, "UNEXPECTED_ERROR")
  expect_match(res$researcher_status$plain_language_summary, "Checking that your data structure is ready")
  expect_false(grepl("operator|atomic|Error|object", res$researcher_status$plain_language_summary))
  log <- readLines(file.path(res$run_dir, "support", "technical_log.txt"))
  expect_true(any(grepl("technical detail \\(support only\\)", log)))
  expect_true(any(grepl("operator|atomic", log)))     # the raw detail lives in the support log only
  summary <- paste(readLines(file.path(res$run_dir, "researcher_summary.md")), collapse = "\n")
  expect_false(grepl("operator|atomic", summary))
  expect_true(nzchar(res$researcher_status$support_reference))
})

test_that("unresolved data-structure decisions stop the run before any file is opened", {
  p <- temp_config(function(c) { c$data$value_representations$below_detection_tokens <- "BLOCKED"; c })
  res <- run_quiet(p, run_id = "t-data-unresolved")
  expect_equal(res$run_state, "BLOCKED")
  expect_equal(res$researcher_status$code, "PLAN_DECISIONS_UNRESOLVED")
  expect_match(res$researcher_status$plain_language_summary, "How below-detection values are written in the data")
  m <- read_json_file(res$manifest_path)
  expect_length(m$inputs, 0)
  expect_equal(m$unresolved_decisions[[1]]$field, "data.value_representations.below_detection_tokens")
})

test_that("the one-command entry point returns exit status 0 on success and 1 otherwise", {
  skip_if(Sys.which("Rscript") == "", "Rscript not on PATH")
  out_root <- tempfile("cli-")
  run_cli <- function(...) {
    system2("Rscript", c(file.path(RUNNER_ROOT, "scripts", "run_pipeline.R"), "--quiet", "--out", out_root, ...),
            stdout = NULL, stderr = NULL)
  }
  expect_equal(run_cli("--config", LOCKED, "--run-id", "cli-ok"), 0L)
  expect_equal(run_cli("--config", DRAFT, "--run-id", "cli-blocked"), 1L)
  expect_equal(run_cli("--config", MALFORMED, "--run-id", "cli-failed"), 1L)
  expect_equal(run_cli("--config", "/no/such/plan.yml", "--run-id", "cli-noconfig"), 1L)
  expect_true(file.exists(file.path(out_root, "cli-noconfig", "manifest.json")))   # a record exists even then
  expect_equal(read_json_file(file.path(out_root, "cli-noconfig", "run_status.json"))$researcher_status$code, "CONFIG_MISSING")
  rep <- system2("Rscript", c(file.path(RUNNER_ROOT, "scripts", "replay.R"), "--quiet", "--out", out_root,
                              "--reference", file.path(out_root, "cli-ok", "manifest.json"), "--run-id", "cli-replay"),
                 stdout = NULL, stderr = NULL)
  expect_equal(rep, 0L)
  expect_equal(read_json_file(file.path(out_root, "cli-replay", "replay_report.json"))$verdict, "MATCH")
})

test_that("identifier-shaped or free-text content in a value column never reaches the returned record", {
  # Build an assay file whose value column carries a study identifier and a name-like string.
  a <- read_csv_character(file.path(RUNNER_ROOT, "data", "synthetic", "assays.csv"))
  a$value[1] <- "SYN-0142"; a$value[2] <- "see note for Mrs Naidoo"; a$value[3] <- "8001015009087"
  tmp <- tempfile(fileext = ".csv"); write.csv(a, tmp, row.names = FALSE)
  p <- temp_config(function(c) { c$data$assays_file <- tmp; c })
  res <- run_quiet(p, run_id = "t-value-leak")
  expect_equal(res$run_state, "FAILED")
  expect_equal(res$researcher_status$code, "DATA_VALUES_MALFORMED")
  texts <- read_run_files(res$run_dir)
  joined <- paste(unlist(texts), collapse = "\n")
  expect_false(grepl("SYN-0142|Naidoo|8001015009087", joined))
  expect_match(res$researcher_status$plain_language_summary, "mixed text and symbols of 8 character|text of 23 character|a long number of 13 character")
  m <- read_json_file(res$manifest_path)
  expect_equal(m$identifier_redactions, 0)   # masked at source, nothing left to redact
})

test_that("the record-stage redaction catches an identifier that slips into a researcher message", {
  res <- run_quiet(LOCKED, run_id = "t-redact")
  red <- redact_identifiers(list(a = "participant SYN-0001 and SYN-0002", b = list(c = "clean", d = "SYN-0003")), "SYN-[0-9]{4}")
  expect_equal(red$count, 3)
  expect_equal(red$value$a, "participant [identifier removed] and [identifier removed]")
  expect_equal(red$value$b$d, "[identifier removed]")
})
