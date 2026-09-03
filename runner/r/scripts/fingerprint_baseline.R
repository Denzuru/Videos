#!/usr/bin/env Rscript
# Fingerprints the original v0.1.0 archive BEFORE any remediation.
# Usage: Rscript scripts/fingerprint_baseline.R PATH_TO_ARCHIVE_OR_DIR
# Writes baseline/v0.1.0/FINGERPRINT.json. Never modifies the archive.
args <- commandArgs(trailingOnly = TRUE)
if (!length(args)) { cat("Usage: fingerprint_baseline.R PATH\n"); quit(status = 2) }
script_dir <- dirname(sub("--file=", "", grep("--file=", commandArgs(), value = TRUE)[1]))
root <- normalizePath(file.path(script_dir, ".."))
Sys.setenv(FIRDOUS_RUNNER_ROOT = root)
source(file.path(root, "R", "utils.R")); source_runner(root)
target <- normalizePath(args[1], mustWork = TRUE)
files <- if (dir.exists(target)) list.files(target, recursive = TRUE, full.names = TRUE, all.files = TRUE) else target
members <- lapply(sort(files), function(f) list(
  path = if (dir.exists(target)) sub(paste0("^", target, "/?"), "", f) else basename(f),
  bytes = file.info(f)$size, sha256 = sha256_file(f)))
record <- list(
  baseline_version = "v0.1.0", source = target, fingerprinted_at = now_utc(),
  member_count = length(members),
  combined_sha256 = sha256_string(paste(vapply(members, `[[`, "", "sha256"), collapse = "\n")),
  members = members,
  note = "Original archive preserved unchanged. Any remediation happens in a separate working tree.")
out <- file.path(root, "baseline", "v0.1.0", "FINGERPRINT.json")
write_json_file(record, out)
cat("Fingerprint written to", out, "\n")
