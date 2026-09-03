#!/usr/bin/env Rscript
# Restricted-data and secret guard (F06). Usage:
#   Rscript scripts/guard_restricted_data.R --staged            # pre-commit
#   Rscript scripts/guard_restricted_data.R --all               # CI: all tracked files in scope
#   Rscript scripts/guard_restricted_data.R --paths f1 f2 ...   # explicit repo-relative paths
# Options: --repo-root DIR   --report PATH (JSON)
# Exit status 0 = clean, 1 = findings, 2 = usage error.
args <- commandArgs(trailingOnly = TRUE)
mode <- NULL; paths <- character(0); repo_root <- NULL; report <- NULL
i <- 1
while (i <= length(args)) {
  a <- args[i]
  if (a %in% c("--staged", "--all")) { mode <- sub("--", "", a); i <- i + 1 }
  else if (a == "--paths") { mode <- "paths"; i <- i + 1; while (i <= length(args) && !startsWith(args[i], "--")) { paths <- c(paths, args[i]); i <- i + 1 } }
  else if (a == "--repo-root") { repo_root <- args[i + 1]; i <- i + 2 }
  else if (a == "--report") { report <- args[i + 1]; i <- i + 2 }
  else { cat("Unknown option:", a, "\n"); quit(status = 2) }
}
if (is.null(mode)) { cat("Specify --staged, --all or --paths\n"); quit(status = 2) }
script_dir <- dirname(sub("--file=", "", grep("--file=", commandArgs(), value = TRUE)[1]))
root <- normalizePath(file.path(script_dir, ".."))
Sys.setenv(FIRDOUS_RUNNER_ROOT = root)
source(file.path(root, "R", "utils.R")); source_runner(root)
if (is.null(repo_root)) {
  repo_root <- suppressWarnings(system2("git", c("-C", shQuote(root), "rev-parse", "--show-toplevel"), stdout = TRUE, stderr = FALSE))
  if (!length(repo_root)) repo_root <- root
}
rules <- load_guard_rules(root)
files <- switch(mode,
  staged = git_staged_files(repo_root),
  all = git_tracked_files(repo_root, unlist(rules$scope$include_prefixes)),
  paths = paths)
findings <- guard_scan(files, rules, root, repo_root)
cat(guard_report_text(findings), sep = "\n")
cat(sprintf("(%d file(s) scanned, mode: %s)\n", length(files), mode))
if (!is.null(report)) write_json_file(list(mode = mode, files_scanned = length(files),
  findings = if (nrow(findings)) split(findings, seq_len(nrow(findings))) else list(), clean = nrow(findings) == 0), report)
quit(status = if (nrow(findings) == 0) 0 else 1)
