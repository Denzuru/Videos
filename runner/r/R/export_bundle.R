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
  pat <- manifest$configuration$participant_id_pattern
  if (!is.null(pat) && !is.na(pat) && nzchar(pat)) {
    hit <- redact_identifiers(manifest, sub("\\$$", "", sub("^\\^", "", pat)))$count
    if (hit > 0) stop_firdous("OUTPUT_CONTAINS_PARTICIPANT_ROWS", list(file = "manifest.json"),
      technical = paste(hit, "identifier-shaped value(s) found in the manifest"))
  }
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

# Proposed result records, one per approved aggregate output, in the shape the
# platform's POST /projects/:id/results accepts (assertResultArtifact). They are
# proposals: currentness is PENDING_REVIEW and the platform refuses anything
# else. Only aggregate metadata travels (row and column counts, checksum);
# never table contents.
export_result_proposals <- function(run_dir, project_id = NULL) {
  req <- export_bundle_request(run_dir, project_id = project_id)
  m <- req$manifest
  if (!identical(m$status, "SUCCEEDED")) return(list())
  lapply(m$outputs, function(o) {
    name <- sub("^outputs/", "", o$path)
    list(
      id = paste0(m$run_id, ":", sub("\\.[^.]+$", "", name)),
      project_id = req$project_id,
      run_id = m$run_id,
      artifact_type = "TABLE",
      currentness = "PENDING_REVIEW",
      plain_language_summary = result_summary_text(name, o, m),
      aggregate_metadata = list(rows = o$rows, columns = length(o$columns %||% list()),
                                sha256 = o$sha256, kind = o$kind,
                                analysis_kind = m$analysis$kind, scientific_claim = m$analysis$scientific_claim)
    )
  })
}

result_summary_text <- function(name, output, manifest) {
  what <- switch(name,
    "group_counts.csv" = "the number of participants in each group",
    "target_summary_by_group.csv" = "descriptive summaries (count, mean, spread, range) for each target within each group",
    "data_readiness_summary.csv" = "counts describing the data check: rows read, values observed, missing or below detection, and exceptions applied",
    paste0("the aggregate table '", name, "'"))
  paste0("An aggregate table of ", what, ", produced on ", tolower(manifest$data_classification %||% "synthetic"),
         " data by the analysis record ", manifest$run_id, ". No statistical test was applied and no scientific claim is made.")
}

write_result_proposals <- function(run_dir, path = file.path(run_dir, "result_proposals.json"), ...) {
  props <- export_result_proposals(run_dir, ...)
  write_json_file(props, path)
  invisible(path)
}
