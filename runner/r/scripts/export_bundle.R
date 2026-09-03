#!/usr/bin/env Rscript
# Writes the platform ingestion request for a finished analysis record.
# Usage: Rscript scripts/export_bundle.R RUN_DIR [--project-id ID] [--run-plan-id ID] [--out PATH]
args <- commandArgs(trailingOnly = TRUE)
if (!length(args)) { cat("Usage: export_bundle.R RUN_DIR [--project-id ID] [--run-plan-id ID] [--out PATH]\n"); quit(status = 2) }
run_dir <- args[1]; opt <- list(project_id = NULL, run_plan_id = NULL, out = NULL); i <- 2
take <- function(i) { if (i + 1 > length(args)) { cat("Option", args[i], "needs a value\n"); quit(status = 2) }; args[i + 1] }
while (i <= length(args)) {
  a <- args[i]
  if (a == "--project-id") { opt$project_id <- take(i); i <- i + 2 }
  else if (a == "--run-plan-id") { opt$run_plan_id <- take(i); i <- i + 2 }
  else if (a == "--out") { opt$out <- take(i); i <- i + 2 }
  else { cat("Unknown option:", a, "\n"); quit(status = 2) }
}
script_dir <- dirname(sub("--file=", "", grep("--file=", commandArgs(), value = TRUE)[1]))
root <- normalizePath(file.path(script_dir, ".."))
Sys.setenv(FIRDOUS_RUNNER_ROOT = root)
source(file.path(root, "R", "utils.R")); source_runner(root)
path <- tryCatch(
  write_bundle_request(run_dir, path = opt$out %||% file.path(run_dir, "bundle_request.json"),
                       project_id = opt$project_id, run_plan_id = opt$run_plan_id),
  error = function(e) report_failure_and_quit(e, basename(run_dir)))
cat("Ingestion request written to", path, "\n")
props <- tryCatch(write_result_proposals(run_dir, project_id = opt$project_id),
                  error = function(e) report_failure_and_quit(e, basename(run_dir)))
cat("Result proposals written to", props, "\n")
