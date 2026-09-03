#!/usr/bin/env Rscript
# Runs the runner's test suite and writes a machine-readable summary.
script_dir <- dirname(sub("--file=", "", grep("--file=", commandArgs(), value = TRUE)[1]))
root <- normalizePath(file.path(script_dir, ".."))
Sys.setenv(FIRDOUS_RUNNER_ROOT = root)
source(file.path(root, "R", "utils.R")); source_runner(root)
library(testthat)
res <- testthat::test_dir(file.path(root, "tests", "testthat"), reporter = "summary", stop_on_failure = FALSE)
df <- as.data.frame(res)
cat(sprintf("\nTEST SUMMARY: %d test blocks, %d expectations passed, %d failed, %d errors, %d skipped\n",
            nrow(df), sum(df$passed), sum(df$failed), sum(df$error), sum(df$skipped)))
quit(status = if (sum(df$failed) + sum(df$error) == 0) 0 else 1)
