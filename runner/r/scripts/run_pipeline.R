#!/usr/bin/env Rscript
# One-command runner entry point. Usage:
#   Rscript scripts/run_pipeline.R [--config PATH] [--out DIR] [--run-id ID] [--seed N] [--quiet]
args <- commandArgs(trailingOnly = TRUE)
opt <- list(config = "config/synthetic_locked.yml", out = NULL, run_id = NULL, seed = NULL, quiet = FALSE)
i <- 1
while (i <= length(args)) {
  a <- args[i]
  if (a == "--config") { opt$config <- args[i + 1]; i <- i + 2 }
  else if (a == "--out") { opt$out <- args[i + 1]; i <- i + 2 }
  else if (a == "--run-id") { opt$run_id <- args[i + 1]; i <- i + 2 }
  else if (a == "--seed") { opt$seed <- as.integer(args[i + 1]); i <- i + 2 }
  else if (a == "--quiet") { opt$quiet <- TRUE; i <- i + 1 }
  else { cat("Unknown option:", a, "\n"); quit(status = 2) }
}
script_dir <- dirname(sub("--file=", "", grep("--file=", commandArgs(), value = TRUE)[1]))
root <- normalizePath(file.path(script_dir, ".."))
Sys.setenv(FIRDOUS_RUNNER_ROOT = root)
source(file.path(root, "R", "utils.R")); source_runner(root)
cfg_path <- if (grepl("^/", opt$config)) opt$config else file.path(root, opt$config)
res <- run_pipeline(cfg_path, out_root = opt$out, run_id = opt$run_id, seed = opt$seed,
                    quiet = opt$quiet, command = paste("run_pipeline.R", paste(args, collapse = " ")))
quit(status = if (identical(res$run_state, "SUCCEEDED")) 0 else 1)
