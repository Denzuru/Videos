# Cross-lane contract check against the Codex core candidate
# (packages/contracts/schemas.js, lane/g-core-impact @ 0400cc8a863c4446e994bcdec390aa72cd6d08ba).
# The R mirror always runs; the real JavaScript assertion runs too when
# CODEX_CORE_ROOT points at a checkout of that candidate and node is present.
LOCKED <- file.path(RUNNER_ROOT, "config", "synthetic_locked.yml")
MALFORMED <- file.path(RUNNER_ROOT, "tests", "fixtures", "config_malformed_values.yml")

test_that("every emitted manifest carries the nine fields the platform requires, for success and failure alike", {
  for (cfg in c(LOCKED, MALFORMED)) {
    res <- run_quiet(cfg, run_id = paste0("t-codex-", basename(cfg)))
    m <- read_json_file(res$manifest_path)
    for (f in CODEX_REQUIRED_FIELDS) expect_false(is.null(m[[f]]), info = paste(basename(cfg), f))
    expect_true(m$status %in% c("SUCCEEDED", "FAILED", "BLOCKED"))
    expect_equal(m$status, m$run_state)
    expect_equal(m$config_fingerprint, m$configuration$content_fingerprint)
    expect_equal(m$code_fingerprint, m$code$revision)
    expect_true(is.list(m$output_checksums))
    if (m$status == "SUCCEEDED") {
      expect_setequal(names(m$output_checksums), vapply(m$outputs, `[[`, "", "path"))
      expect_equal(nchar(m$dataset_fingerprint), 64)
    } else {
      expect_length(m$output_checksums, 0)
    }
  }
})

test_that("no key the platform treats as participant-level appears anywhere in a manifest or run status", {
  res <- run_quiet(LOCKED, run_id = "t-codex-keys")
  expect_length(restricted_keys_present(read_json_file(res$manifest_path)), 0)
  expect_length(restricted_keys_present(read_json_file(res$status_path)), 0)
  expect_equal(restricted_keys_present(list(a = 1, b = list(participant_id = "x"))), "b.participant_id")
})

test_that("the committed manifest fixtures pass the Codex assertion when the candidate is available", {
  root <- Sys.getenv("CODEX_CORE_ROOT", "")
  skip_if(!nzchar(root) || !file.exists(file.path(root, "packages", "contracts", "schemas.js")), "CODEX_CORE_ROOT not set")
  skip_if(Sys.which("node") == "", "node not available")
  fixtures <- list.files(file.path(RUNNER_ROOT, "manifests", "fixtures"), pattern = "^RunBundleManifest.*json$", full.names = TRUE)
  expect_true(length(fixtures) >= 3)
  script <- tempfile(fileext = ".mjs")
  writeLines(c(
    sprintf("import { assertRunBundleManifest } from '%s/packages/contracts/schemas.js';", root),
    "import { readFileSync } from 'node:fs';",
    "for (const f of process.argv.slice(2)) { assertRunBundleManifest(JSON.parse(readFileSync(f, 'utf8'))); console.log('ok', f); }"
  ), script)
  out <- system2("node", c(script, fixtures), stdout = TRUE, stderr = TRUE)
  expect_equal(attr(out, "status") %||% 0L, 0L, info = paste(out, collapse = "\n"))
  expect_equal(sum(grepl("^ok ", out)), length(fixtures))
})
