# F07: independent replay.
#
# Re-runs the pipeline from the same configuration and seed and compares the
# new analysis record with a reference record. Only reproducibility-relevant
# fields are compared; timestamps and run identifiers are expected to differ.

replay_compare <- function(reference, candidate) {
  diffs <- list()
  note <- function(field, expected, actual, severity = "MISMATCH") {
    diffs[[length(diffs) + 1]] <<- list(field = field, expected = expected, actual = actual, severity = severity)
  }
  cmp <- function(field, a, b, severity = "MISMATCH") {
    if (!identical(a %||% NA, b %||% NA)) note(field, a, b, severity)
  }
  cmp("run_state", reference$run_state, candidate$run_state)
  cmp("configuration.content_fingerprint", reference$configuration$content_fingerprint, candidate$configuration$content_fingerprint)
  cmp("configuration.seed", reference$configuration$seed, candidate$configuration$seed)
  cmp("environment.r_version", reference$environment$r_version, candidate$environment$r_version)
  cmp("environment.renv_lockfile_sha256", reference$environment$renv_lockfile_sha256, candidate$environment$renv_lockfile_sha256)
  cmp("code.revision", reference$code$revision, candidate$code$revision, severity = "INFO")

  by_key <- function(items, key) setNames(items, vapply(items, function(i) i[[key]] %||% "", character(1)))
  ri <- by_key(reference$inputs, "role"); ci <- by_key(candidate$inputs, "role")
  for (k in union(names(ri), names(ci))) cmp(paste0("inputs.", k, ".sha256"), ri[[k]]$sha256, ci[[k]]$sha256)
  ro <- by_key(reference$outputs, "path"); co <- by_key(candidate$outputs, "path")
  for (k in union(names(ro), names(co))) cmp(paste0("outputs.", k, ".sha256"), ro[[k]]$sha256, co[[k]]$sha256)

  rp <- by_key(reference$environment$packages, "name"); cp <- by_key(candidate$environment$packages, "name")
  for (k in RUNTIME_PACKAGES) cmp(paste0("environment.packages.", k), rp[[k]]$version, cp[[k]]$version)

  blocking <- Filter(function(d) d$severity == "MISMATCH", diffs)
  list(verdict = if (length(blocking) == 0) "MATCH" else "MISMATCH",
       differences = diffs, outputs_compared = length(union(names(ro), names(co))))
}

replay_run <- function(config_path, reference_manifest_path, out_root = NULL, run_id = NULL, quiet = FALSE) {
  reference <- read_json_file(reference_manifest_path)
  res <- run_pipeline(config_path, out_root = out_root, run_id = run_id,
                      seed = reference$configuration$seed, quiet = quiet,
                      command = "replay")
  candidate <- read_json_file(res$manifest_path)
  cmp <- replay_compare(reference, candidate)
  report <- list(
    replay_of = reference$run_id, replay_run_id = res$run_id,
    reference_manifest = reference_manifest_path, candidate_manifest = res$manifest_path,
    verdict = cmp$verdict, outputs_compared = cmp$outputs_compared, differences = cmp$differences,
    plain_language = if (cmp$verdict == "MATCH")
      "The replay produced the same outputs from the same data, plan and seed. The earlier result is reproducible on this computer."
    else "The replay did not produce the same outputs. The differences listed here need to be reviewed by research support before the earlier result is relied on."
  )
  write_json_file(report, file.path(res$run_dir, "replay_report.json"))
  if (!quiet) {
    cat("\nReplay verdict: ", cmp$verdict, "\n", report$plain_language, "\n", sep = "")
    for (d in cmp$differences) cat(sprintf("  %-8s %s: recorded %s, now %s\n", d$severity, d$field,
                                           paste(d$expected, collapse = ","), paste(d$actual, collapse = ",")))
    cat("Replay report: ", file.path(res$run_dir, "replay_report.json"), "\n", sep = "")
  }
  invisible(report)
}
