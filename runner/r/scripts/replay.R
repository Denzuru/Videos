#!/usr/bin/env Rscript
# Independent replay (F07). Usage:
#   Rscript scripts/replay.R --reference PATH/manifest.json [--config PATH] [--out DIR] [--run-id ID]
args <- commandArgs(trailingOnly = TRUE)
opt <- list(config = "config/synthetic_locked.yml", reference = NULL, out = NULL, run_id = NULL, quiet = FALSE)
i <- 1
while (i <= length(args)) {
  a <- args[i]
  if (a == "--config") { opt$config <- args[i + 1]; i <- i + 2 }
  else if (a == "--reference") { opt$reference <- args[i + 1]; i <- i + 2 }
  else if (a == "--out") { opt$out <- args[i + 1]; i <- i + 2 }
  else if (a == "--run-id") { opt$run_id <- args[i + 1]; i <- i + 2 }
  else if (a == "--quiet") { opt$quiet <- TRUE; i <- i + 1 }
  else { cat("Unknown option:", a, "\n"); quit(status = 2) }
}
if (is.null(opt$reference)) { cat("--reference PATH/manifest.json is required\n"); quit(status = 2) }
script_dir <- dirname(sub("--file=", "", grep("--file=", commandArgs(), value = TRUE)[1]))
root <- normalizePath(file.path(script_dir, ".."))
Sys.setenv(FIRDOUS_RUNNER_ROOT = root)
source(file.path(root, "R", "utils.R")); source_runner(root)
cfg_path <- if (grepl("^/", opt$config)) opt$config else file.path(root, opt$config)
rep <- replay_run(cfg_path, opt$reference, out_root = opt$out, run_id = opt$run_id, quiet = opt$quiet)
quit(status = if (identical(rep$verdict, "MATCH")) 0 else 1)
