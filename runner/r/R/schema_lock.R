# F03: explicit schema lock and research-plan gate.
#
# Scientific stages may run only when ALL of the following hold:
#   * data_classification is SYNTHETIC (this runner version refuses real data)
#   * research_plan.protocol_status == "LOCKED"
#   * research_plan.schema_status   == "LOCKED"
#   * every required authority role has a record
#   * governance approval is APPROVED with a reference
#   * the processing location is approved
#   * zero unresolved placeholders in analysis_plan and governance
#   * the target panel is non-empty
#
# Every failed condition becomes a BLOCKED finding with a named resolver.
# The gate never resolves a decision itself.

check_research_plan_gate <- function(cfg) {
  findings <- list()

  classification <- toupper(cfg$data_classification %||% "")
  if (!identical(classification, "SYNTHETIC")) {
    findings[[length(findings) + 1]] <- new_finding("PLAN_REAL_DATA_NOT_PERMITTED",
      list(classification = cfg$data_classification %||% "(not recorded)"))
  }

  pstatus <- cfg_get(cfg, "research_plan.protocol_status")
  if (!identical(pstatus, "LOCKED")) {
    findings[[length(findings) + 1]] <- new_finding("PLAN_PROTOCOL_NOT_LOCKED",
      list(status_label = protocol_status_label(pstatus), status = pstatus %||% "(not recorded)"))
  }

  sstatus <- cfg_get(cfg, "research_plan.schema_status")
  if (!identical(sstatus, "LOCKED")) {
    findings[[length(findings) + 1]] <- new_finding("PLAN_SCHEMA_NOT_LOCKED",
      list(status = sstatus %||% "(not recorded)"))
  }

  required_roles <- cfg_get(cfg, "research_plan.required_authority_roles",
                            default = list("principal_researcher"))
  records <- cfg_get(cfg, "research_plan.authority_records", default = list())
  have_roles <- vapply(records, function(r) {
    if (is.list(r) && !is.null(r$role) && !is.null(r$reference) && nzchar(r$reference)) r$role else NA_character_
  }, character(1))
  missing_roles <- setdiff(unlist(required_roles), have_roles[!is.na(have_roles)])
  if (length(missing_roles) > 0) {
    findings[[length(findings) + 1]] <- new_finding("PLAN_AUTHORITY_MISSING",
      list(roles = paste(gsub("_", " ", missing_roles), collapse = ", ")))
  }

  gstatus <- cfg_get(cfg, "governance.approval_status")
  gref <- cfg_get(cfg, "governance.approval_reference")
  if (!identical(gstatus, "APPROVED") || is_unresolved_value(gref)) {
    findings[[length(findings) + 1]] <- new_finding("PLAN_GOVERNANCE_NOT_APPROVED",
      list(status = gstatus %||% "(not recorded)",
           reference_note = if (is_unresolved_value(gref)) " and no approval reference is recorded" else ""))
  }

  if (!isTRUE(cfg_get(cfg, "governance.processing_location_approved"))) {
    findings[[length(findings) + 1]] <- new_finding("PLAN_LOCATION_NOT_APPROVED",
      list(location = cfg_get(cfg, "governance.processing_location", "(not recorded)")))
  }

  # Unresolved decisions across the statistical boundary and governance.
  unresolved <- c(
    find_unresolved(cfg$analysis_plan, "analysis_plan"),
    find_unresolved(cfg$governance[setdiff(names(cfg$governance), c("approval_status", "processing_location_approved"))], "governance")
  )
  # Optional fields may legitimately be empty when explicitly marked not applicable.
  unresolved <- unique(unresolved)
  if (length(unresolved) > 0) {
    labels <- vapply(unresolved, function(p) decision_label(p)$label, character(1))
    findings[[length(findings) + 1]] <- new_finding("PLAN_DECISIONS_UNRESOLVED",
      list(count = length(unresolved), decisions = paste(labels, collapse = "; ")),
      detail = data.frame(field = unresolved, decision = unname(labels),
                          resolving_role = vapply(unresolved, function(p) decision_label(p)$role, character(1)),
                          stringsAsFactors = FALSE))
  }

  panel <- cfg_get(cfg, "analysis_plan.target_panel", default = list())
  if (length(unlist(panel)) == 0 && !any(unresolved == "analysis_plan.target_panel")) {
    findings[[length(findings) + 1]] <- new_finding("PLAN_PANEL_EMPTY", list())
  }

  list(
    locked = length(findings) == 0,
    findings = findings,
    summary = list(
      data_classification = classification,
      protocol_status = pstatus %||% NA_character_,
      schema_status = sstatus %||% NA_character_,
      governance_approval_status = gstatus %||% NA_character_,
      processing_location_approved = isTRUE(cfg_get(cfg, "governance.processing_location_approved")),
      unresolved_decisions = length(unresolved),
      authority_roles_present = as.list(have_roles[!is.na(have_roles)])
    )
  )
}
