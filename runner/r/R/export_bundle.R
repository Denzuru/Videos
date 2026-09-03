# Run-bundle export: packages a finished analysis record into the request the
# platform ingests (POST /projects/:projectId/run-bundles in the Codex core,
# ADR 0002). Only the manifest travels; outputs, checks and logs stay local
# and are referenced by checksum. Nothing under local/ is ever included.

export_bundle_request <- function(run_dir, project_id = NULL, run_plan_id = NULL) {
  manifest_path <- file.path(run_dir, "manifest.json")
  if (!file.exists(manifest_path)) stop_firdous("RECORD_WRITE_FAILED", list(),
    technical = paste("no manifest.json in", run_dir))
  manifest <- read_json_file(manifest_path)
  # Defence in depth: refuse to export anything the platform would reject.
  leaked <- restricted_keys_present(manifest)
  if (length(leaked)) stop_firdous("OUTPUT_CONTAINS_PARTICIPANT_ROWS", list(file = "manifest.json"),
    technical = paste("restricted keys:", paste(leaked, collapse = ", ")))
  missing <- CODEX_REQUIRED_FIELDS[vapply(CODEX_REQUIRED_FIELDS, function(f) is.null(manifest[[f]]), logical(1))]
  if (length(missing)) stop_firdous("RECORD_WRITE_FAILED", list(),
    technical = paste("manifest lacks contract fields:", paste(missing, collapse = ", ")))
  pid <- project_id %||% manifest$project$project_id
  rid <- run_plan_id %||% manifest$project$run_plan_id
  usable <- function(x) !is.null(x) && length(x) == 1 && !is.na(x) && nzchar(x)
  if (!usable(pid) || !usable(rid)) stop_firdous("EXPORT_PLAN_UNKNOWN", list(),
    technical = paste0("project_id=", pid %||% "NULL", " run_plan_id=", rid %||% "NULL"))
  list(project_id = pid, run_plan_id = rid, manifest = manifest)
}

# Researcher-safe failure printing for entry points that run outside the
# stage engine (currently the export script).
report_failure_and_quit <- function(e, reference_seed = "export") {
  if (inherits(e, "firdous_failure")) {
    st <- build_researcher_status(e$code, e$values, make_support_reference(reference_seed, e$code))
    cat(st$plain_language_title, "\n", sep = "")
    cat("  What happened:     ", st$plain_language_summary, "\n", sep = "")
    cat("  Your work is safe: nothing has been changed.\n")
    cat("  Next action:       ", st$next_action, "\n", sep = "")
    if (!is.null(st$resolving_role)) cat("  Who can resolve it: ", st$resolving_role, "\n", sep = "")
    cat("Support reference: ", st$support_reference, "\n", sep = "")
    if (!is.null(e$technical)) message("Technical detail (support only): ", e$technical)
  } else {
    st <- build_researcher_status("UNEXPECTED_ERROR", list(stage_label = "preparing the analysis record for saving"),
                                  make_support_reference(reference_seed, "UNEXPECTED_ERROR"))
    cat(st$plain_language_title, "\n  ", st$plain_language_summary, "\n  ", st$next_action, "\n", sep = "")
    cat("Support reference: ", st$support_reference, "\n", sep = "")
    message("Technical detail (support only): ", conditionMessage(e))
  }
  quit(status = 1)
}

write_bundle_request <- function(run_dir, path = file.path(run_dir, "bundle_request.json"), ...) {
  req <- export_bundle_request(run_dir, ...)
  write_json_file(req, path)
  invisible(path)
}
