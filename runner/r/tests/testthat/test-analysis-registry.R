# The registry is the seam the verified scripts plug into.
LOCKED <- file.path(RUNNER_ROOT, "config", "synthetic_locked.yml")

test_that("only the placeholder is registered until verified scripts arrive", {
  expect_equal(analysis_kinds(), "SYNTHETIC_DESCRIPTIVE_PLACEHOLDER")
  k <- get_analysis_kind("SYNTHETIC_DESCRIPTIVE_PLACEHOLDER")
  expect_equal(k$scientific_claim, "none")
  expect_setequal(k$declared_outputs, c("group_counts.csv", "target_summary_by_group.csv", "data_readiness_summary.csv"))
  expect_null(get_analysis_kind("SCRIPT_03_MODELLING"))
})

test_that("a plan whose output list disagrees with the step is blocked, not run", {
  p <- temp_config(function(c) { c$outputs$allow_list <- c(c$outputs$allow_list, list(list(name = "model_coefficients.csv", kind = "aggregate_table"))); c })
  res <- run_quiet(p, run_id = "t-reg-extra")
  expect_equal(res$run_state, "BLOCKED")
  expect_equal(res$researcher_status$code, "ANALYSIS_OUTPUTS_MISMATCH")
  expect_match(res$researcher_status$plain_language_summary, "model_coefficients.csv")
  expect_length(list.files(file.path(res$run_dir, "outputs")), 0)
})

test_that("a registered kind runs through the same gates and guards as the placeholder", {
  on.exit(rm("TEST_KIND", envir = .analysis_registry))
  register_analysis_kind("TEST_KIND", "Test kind", function(ctx) {
    write_csv_deterministic(data.frame(metric = "n_participants", value = nrow(ctx$data$participants)),
                            file.path(ctx$run_dir, "outputs", "one_number.csv"))
    list(outputs_written = "one_number.csv")
  }, declared_outputs = "one_number.csv", requires_participant_columns = "synthetic_group")
  expect_true("TEST_KIND" %in% analysis_kinds())
  p <- temp_config(function(c) { c$stages$analysis$kind <- "TEST_KIND"; c$outputs$allow_list <- list(list(name = "one_number.csv", kind = "aggregate_table")); c })
  res <- run_quiet(p, run_id = "t-reg-run")
  expect_equal(res$run_state, "SUCCEEDED")
  m <- read_json_file(res$manifest_path)
  expect_equal(m$analysis$kind, "TEST_KIND")
  expect_equal(names(m$output_checksums), "outputs/one_number.csv")
  # the kind's participant-column requirement is enforced
  p2 <- temp_config(function(c) { c$stages$analysis$kind <- "TEST_KIND"; c$outputs$allow_list <- list(list(name = "one_number.csv", kind = "aggregate_table")); c$data$required_participant_columns <- list("study_id"); c })
  a <- read_csv_character(file.path(RUNNER_ROOT, "data", "synthetic", "participants.csv")); a$synthetic_group <- NULL
  tmp <- tempfile(fileext = ".csv"); write.csv(a, tmp, row.names = FALSE)
  p3 <- temp_config(function(c) { c$stages$analysis$kind <- "TEST_KIND"; c$outputs$allow_list <- list(list(name = "one_number.csv", kind = "aggregate_table")); c$data$required_participant_columns <- list("study_id"); c$data$participants_file <- tmp; c })
  res3 <- run_quiet(p3, run_id = "t-reg-cols")
  expect_equal(res3$run_state, "FAILED")
  expect_equal(res3$researcher_status$code, "DATA_COLUMNS_MISSING")
})
