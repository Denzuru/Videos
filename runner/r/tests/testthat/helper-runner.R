# Test helpers. Sources the runner and provides temp-config utilities.
root <- Sys.getenv("FIRDOUS_RUNNER_ROOT", unset = "")
if (!nzchar(root)) root <- normalizePath(file.path(testthat::test_path(), "..", ".."))
Sys.setenv(FIRDOUS_RUNNER_ROOT = root)
source(file.path(root, "R", "utils.R")); source_runner(root)
RUNNER_ROOT <- root

locked_config <- function() yaml::read_yaml(file.path(RUNNER_ROOT, "config", "synthetic_locked.yml"))

# Write a modified copy of the locked config to a temp file and return its path.
temp_config <- function(modify = identity, base = locked_config()) {
  cfg <- modify(base)
  p <- tempfile(fileext = ".yml")
  yaml::write_yaml(cfg, p)
  p
}

# Run the pipeline quietly into a temp output root.
run_quiet <- function(config_path, run_id = NULL, seed = NULL, out_root = tempfile("runs-")) {
  run_pipeline(config_path, out_root = out_root, run_id = run_id, seed = seed, quiet = TRUE,
               command = "test")
}

read_run_files <- function(run_dir) {
  files <- list.files(run_dir, recursive = TRUE, full.names = TRUE)
  files <- files[!grepl("/local/", files)]
  setNames(lapply(files, function(f) paste(readLines(f, warn = FALSE), collapse = "\n")), files)
}

expect_no_participant_ids <- function(run_dir, pattern = "SYN-[0-9]{4}") {
  texts <- read_run_files(run_dir)
  leaked <- names(texts)[vapply(texts, function(t) grepl(pattern, t), logical(1))]
  expect_length(leaked, 0)
}
