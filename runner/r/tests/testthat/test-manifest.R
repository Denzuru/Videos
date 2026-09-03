test_that("manifest completeness check catches missing required fields (F05)", {
  res <- run_quiet(file.path(RUNNER_ROOT, "config", "synthetic_locked.yml"), run_id = "t-man")
  m <- read_json_file(res$manifest_path)
  expect_length(manifest_missing_fields(m), 0)
  m$environment$renv_lockfile_sha256 <- NULL
  m$code <- NULL
  miss <- manifest_missing_fields(m)
  expect_true("environment.renv_lockfile_sha256" %in% miss)
  expect_true(all(c("code.revision", "code.branch", "code.working_tree_clean") %in% miss))
})

test_that("the manifest records the environment, packages and fingerprints needed to repeat the run (F05)", {
  res <- run_quiet(file.path(RUNNER_ROOT, "config", "synthetic_locked.yml"), run_id = "t-man2")
  m <- read_json_file(res$manifest_path)
  pk <- vapply(m$environment$packages, `[[`, "", "name")
  expect_true(all(RUNTIME_PACKAGES %in% pk))
  expect_match(m$environment$r_version, "^R version")
  expect_equal(m$environment$renv_lockfile_sha256, sha256_file(file.path(RUNNER_ROOT, "renv.lock")))
  expect_equal(m$configuration$sha256, sha256_file(file.path(RUNNER_ROOT, "config", "synthetic_locked.yml")))
  expect_true(is.logical(m$code$working_tree_clean) || is.null(m$code$working_tree_clean))
  expect_equal(m$logs[[1]]$kind, "support_only")
  expect_true(all(vapply(m$inputs, function(i) !isTRUE(i$participant_rows_included), logical(1))))
  expect_true(all(vapply(m$stages, function(s) nzchar(s$researcher_label), logical(1))))
})

test_that("the installed runtime matches the lockfile on this machine (F04)", {
  expect_length(lockfile_mismatches(RUNNER_ROOT), 0)
})
