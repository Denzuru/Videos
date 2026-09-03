# Run-bundle export: the request shape the platform ingests, and (when the
# Codex candidate is available) real ingestion through its API handler.
LOCKED <- file.path(RUNNER_ROOT, "config", "synthetic_locked.yml")
MALFORMED <- file.path(RUNNER_ROOT, "tests", "fixtures", "config_malformed_values.yml")

test_that("a finished run exports an ingestion request carrying only the manifest", {
  res <- run_quiet(LOCKED, run_id = "t-export")
  req <- export_bundle_request(res$run_dir)
  expect_setequal(names(req), c("project_id", "run_plan_id", "manifest"))
  expect_equal(req$project_id, "SYN-PROJECT-FIRDOUS")
  expect_equal(req$run_plan_id, "SYN-RUNPLAN-0001")
  expect_equal(req$manifest$status, "SUCCEEDED")
  expect_length(restricted_keys_present(req), 0)
  p <- write_bundle_request(res$run_dir)
  expect_true(file.exists(p))
  expect_no_participant_ids(res$run_dir)
  # a failed run still exports, as a failure record
  res2 <- run_quiet(MALFORMED, run_id = "t-export-failed")
  expect_equal(export_bundle_request(res2$run_dir)$manifest$status, "FAILED")
})

test_that("export refuses a record without plan identifiers or with a null contract field", {
  res <- run_quiet("/no/such/plan.yml", run_id = "t-export-noplan")   # CONFIG_MISSING record has no project block
  expect_error(export_bundle_request(res$run_dir), class = "firdous_failure")
  err <- tryCatch(export_bundle_request(res$run_dir), error = function(e) e)
  expect_equal(err$code, "EXPORT_PLAN_UNKNOWN")
  # identifiers supplied by the caller rescue it
  expect_equal(export_bundle_request(res$run_dir, project_id = "P", run_plan_id = "RP")$run_plan_id, "RP")
  res2 <- run_quiet(LOCKED, run_id = "t-export-nullseed")
  m <- read_json_file(file.path(res2$run_dir, "manifest.json")); m$seed <- NULL
  write_json_file(m, file.path(res2$run_dir, "manifest.json"))
  err2 <- tryCatch(export_bundle_request(res2$run_dir), error = function(e) e)
  expect_equal(err2$code, "RECORD_WRITE_FAILED"); expect_match(err2$technical, "seed")
})

test_that("the export command never shows a raw R error to the researcher", {
  skip_if(Sys.which("Rscript") == "", "Rscript not on PATH")
  out <- system2("Rscript", c(file.path(RUNNER_ROOT, "scripts", "export_bundle.R"), "/no/such/dir"), stdout = TRUE, stderr = TRUE)
  expect_equal(attr(out, "status"), 1L)
  expect_false(any(grepl("firdous_failure|Execution halted|Error in|Error:", out)))
  expect_true(any(grepl("Support reference:", out)))
  expect_true(any(grepl("Technical detail \\(support only\\)", out)))
  out2 <- system2("Rscript", c(file.path(RUNNER_ROOT, "scripts", "export_bundle.R"), tempdir(), "--project-id"), stdout = TRUE, stderr = TRUE)
  expect_equal(attr(out2, "status"), 2L)
})

test_that("export refuses a record that carries a restricted key", {
  res <- run_quiet(LOCKED, run_id = "t-export-bad")
  m <- read_json_file(file.path(res$run_dir, "manifest.json"))
  m$debug <- list(participant_id = "SYN-0001")
  write_json_file(m, file.path(res$run_dir, "manifest.json"))
  expect_error(export_bundle_request(res$run_dir), class = "firdous_failure")
})

test_that("the exported request is ingested by the Codex core handler when the candidate is available", {
  root <- Sys.getenv("CODEX_CORE_ROOT", "")
  skip_if(!nzchar(root) || !file.exists(file.path(root, "apps", "api", "src", "http.js")), "CODEX_CORE_ROOT not set")
  skip_if(Sys.which("node") == "", "node not available")
  res <- run_quiet(LOCKED, run_id = "t-export-ingest")
  req_path <- write_bundle_request(res$run_dir)
  script <- tempfile(fileext = ".mjs")
  writeLines(c(
    sprintf("import { ResearchStore } from '%s/packages/database/store.js';", root),
    sprintf("import { createResearchService } from '%s/apps/api/src/service.js';", root),
    sprintf("import { createApiHandler } from '%s/apps/api/src/http.js';", root),
    "import { readFileSync } from 'node:fs';",
    sprintf("const body = JSON.parse(readFileSync('%s', 'utf8'));", req_path),
    "const store = new ResearchStore({ runPlans: [{ id: body.run_plan_id, project_id: body.project_id, protocol_id: 'SYN-PROTOCOL-v1', dataset_version_id: 'SYN-DATASET-v1', state: 'APPROVED', authority_id: 'SYN-AUTH-0002', processing_location_approved: true }] });",
    "const handler = createApiHandler({ store, service: createResearchService({ store }) });",
    "const approved = await handler({ method: 'POST', path: `/projects/${body.project_id}/run-bundles`, actor: { id: 'r-runner', project_ids: [body.project_id] }, body });",
    "const store2 = new ResearchStore({ runPlans: [{ id: body.run_plan_id, project_id: body.project_id, protocol_id: 'SYN-PROTOCOL-v1', dataset_version_id: 'SYN-DATASET-v1', state: 'PENDING_APPROVAL' }] });",
    "const handler2 = createApiHandler({ store: store2, service: createResearchService({ store: store2 }) });",
    "const pending = await handler2({ method: 'POST', path: `/projects/${body.project_id}/run-bundles`, actor: { id: 'r-runner', project_ids: [body.project_id] }, body });",
    "console.log(JSON.stringify({ approved_status: approved.status, stored: store.state.runBundles.length, stored_run_id: store.state.runBundles[0]?.id, audit: store.state.audit.length, pending_status: pending.status, pending_title: pending.body.explanation?.plain_language_title }));"
  ), script)
  out <- system2("node", script, stdout = TRUE, stderr = TRUE)
  expect_equal(attr(out, "status") %||% 0L, 0L, info = paste(out, collapse = "\n"))
  r <- jsonlite::fromJSON(tail(out, 1))
  expect_equal(r$approved_status, 201)
  expect_equal(r$stored, 1)
  expect_equal(r$stored_run_id, "t-export-ingest")
  expect_true(r$audit >= 1)
  expect_equal(r$pending_status, 422)
  expect_match(r$pending_title, "waiting for approval")
})
