# Researcher-safe message catalogue for the Project Firdous R runner.
#
# Every failure or block the runner can produce is described here in the
# language of research, following the researcher-safe status contract in the
# Parallel Build Plan v1.1 (section 6.2). Raw R errors never reach these
# fields; they are written to the support log and referenced by a support
# reference only.
#
# Field meaning:
#   plain_language_title    short heading a researcher can act on
#   plain_language_summary  what happened, in one or two sentences
#   why_it_matters          why the runner will not continue
#   next_action             the single most useful thing to do now
#   resolving_role          who can resolve it (NULL means the researcher can)
#   can_continue_elsewhere  whether other work is unaffected
#   work_preserved          whether anything entered or produced was lost
#
# Templates may contain {placeholders} filled from the finding details.

STAGES <- list(
  list(id = "environment",  label = "Checking the analysis environment"),
  list(id = "data",         label = "Checking that your data structure is ready"),
  list(id = "plan",         label = "Confirming the approved analysis plan"),
  list(id = "analysis",     label = "Running the approved analysis"),
  list(id = "outputs",      label = "Checking outputs before saving"),
  list(id = "record",       label = "Saving the reproducibility record")
)

stage_label <- function(stage_id) {
  for (s in STAGES) if (identical(s$id, stage_id)) return(s$label)
  stage_id
}

# Roles are named in research language, not system roles.
ROLE_RESEARCHER      <- "You (the researcher) can resolve this."
ROLE_DATA_CUSTODIAN  <- "The data custodian or the person who prepared the data file."
ROLE_SUPERVISOR      <- "Your supervisor or the person who confirms the research plan."
ROLE_METHODOLOGIST   <- "Your supervisor, statistician or methodologist."
ROLE_GOVERNANCE      <- "The ethics or data-governance contact for the study."
ROLE_SUPPORT         <- "Research support (quote the support reference)."

MESSAGES <- list(

  # ---- configuration -------------------------------------------------------
  CONFIG_MISSING = list(
    state = "FAILED",
    plain_language_title = "The analysis plan file could not be found",
    plain_language_summary = "The runner looked for the analysis plan at '{path}' and could not find it.",
    why_it_matters = "The analysis plan tells the runner which data, checks and outputs were approved. Nothing can run without it.",
    next_action = "Check the location of the analysis plan file, or choose the plan again and start the analysis once more.",
    resolving_role = ROLE_RESEARCHER,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  CONFIG_INVALID = list(
    state = "FAILED",
    plain_language_title = "The analysis plan file could not be read",
    plain_language_summary = "The analysis plan file exists, but part of it could not be understood: {detail}.",
    why_it_matters = "An incomplete plan could lead to the wrong data or settings being used.",
    next_action = "Open the analysis plan and correct the section named above, or ask research support to check it.",
    resolving_role = ROLE_SUPPORT,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  # ---- environment ---------------------------------------------------------
  ENV_NOT_REPRODUCIBLE = list(
    state = "BLOCKED",
    plain_language_title = "The analysis environment does not match the recorded one",
    plain_language_summary = "The software packages available on this computer differ from the versions recorded for this analysis ({detail}).",
    why_it_matters = "Results produced with different software versions might not match earlier results, so the runner stops rather than produce an analysis record that cannot be trusted.",
    next_action = "Ask research support to restore the recorded analysis environment, then start the analysis again.",
    resolving_role = ROLE_SUPPORT,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  # ---- data structure (F01, F02) ------------------------------------------
  DATA_FILE_MISSING = list(
    state = "FAILED",
    plain_language_title = "A data file could not be found",
    plain_language_summary = "The {role} file was expected at '{path}' but is not there.",
    why_it_matters = "The analysis cannot check or use data it cannot find.",
    next_action = "Confirm the dataset version you intended to use and that the file is in the expected place, then start again.",
    resolving_role = ROLE_RESEARCHER,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  DATA_COLUMNS_MISSING = list(
    state = "FAILED",
    plain_language_title = "Required columns are missing from the {role} file",
    plain_language_summary = "The {role} file does not contain these required columns: {columns}.",
    why_it_matters = "Without these columns the runner cannot match assays to participants or read the measured values.",
    next_action = "Check the column names in the file against the approved data structure. Column names must match exactly.",
    resolving_role = ROLE_DATA_CUSTODIAN,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  DATA_IDS_MALFORMED = list(
    state = "FAILED",
    plain_language_title = "Some participant identifiers are not in the expected format",
    plain_language_summary = "{count} identifier(s) in the {role} file do not follow the approved study-identifier format.",
    why_it_matters = "Identifiers in an unexpected format may be real identifying information, or may stop assays from matching participants.",
    next_action = "Check the identifier column with the data custodian. Only approved study identifiers may be used.",
    resolving_role = ROLE_DATA_CUSTODIAN,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  DATA_VALUES_MALFORMED = list(
    state = "FAILED",
    plain_language_title = "Some measured values could not be interpreted",
    plain_language_summary = "{count} value(s) in the '{column}' column are written in a way the approved data structure does not recognise, for example: {examples}.",
    why_it_matters = "The runner will not guess what these values mean. Guessing could silently turn a missing or below-detection result into a number, which would change the analysis.",
    next_action = "Decide with the data custodian how each of these should be written. Approved representations are: {approved}. Then update the file and start again.",
    resolving_role = ROLE_DATA_CUSTODIAN,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  DATA_VALUES_OUT_OF_RANGE = list(
    state = "FAILED",
    plain_language_title = "Some measured values are outside the approved range",
    plain_language_summary = "{count} value(s) in the '{column}' column fall outside the approved range of {range}.",
    why_it_matters = "Values outside the expected range often point to a units problem or a transcription error.",
    next_action = "Check these values with the data custodian. If the range itself is wrong, the approved data structure must be updated first.",
    resolving_role = ROLE_DATA_CUSTODIAN,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  DATA_ORPHAN_ASSAYS = list(
    state = "FAILED",
    plain_language_title = "Some assay results belong to participants who are not in the participant file",
    plain_language_summary = "{count} assay row(s) refer to {n_ids} participant identifier(s) that do not appear in the participant file.",
    why_it_matters = "Results that cannot be linked to a participant cannot be analysed, and may indicate that the two files come from different dataset versions.",
    next_action = "Check that the participant and assay files are from the same dataset version. If an assay is a known exception, record it in the approved-exceptions list.",
    resolving_role = ROLE_DATA_CUSTODIAN,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  DATA_MISSING_ASSAYS = list(
    state = "FAILED",
    plain_language_title = "Some participants are missing required assay results",
    plain_language_summary = "{count} required assay result(s) are missing across {n_ids} participant(s).",
    why_it_matters = "The approved plan expects every participant to have a result for each target in the panel. Missing rows change the sample size.",
    next_action = "Add the missing results, or record each missing result as an approved exception with the reason and who approved it.",
    resolving_role = ROLE_DATA_CUSTODIAN,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  DATA_DUPLICATE_KEYS = list(
    state = "FAILED",
    plain_language_title = "Some assay results are duplicated",
    plain_language_summary = "{count} participant-and-target combination(s) appear more than once in the assay file.",
    why_it_matters = "Duplicated rows would count a participant more than once. Whether repeat measurements are allowed is a decision for the research plan, not for the runner.",
    next_action = "Remove accidental duplicates. If repeat measurements are intended, the research plan must say how they are handled before the analysis can run.",
    resolving_role = ROLE_METHODOLOGIST,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  DATA_DUPLICATE_PARTICIPANTS = list(
    state = "FAILED",
    plain_language_title = "Some participants appear more than once in the participant file",
    plain_language_summary = "{count} participant identifier(s) appear more than once in the participant file.",
    why_it_matters = "Each participant must appear exactly once so that results are counted correctly.",
    next_action = "Remove the duplicate rows from the participant file and start again.",
    resolving_role = ROLE_DATA_CUSTODIAN,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  DATA_EXCEPTION_UNAPPROVED = list(
    state = "BLOCKED",
    plain_language_title = "An exception in the exceptions list has not been approved",
    plain_language_summary = "{count} entry(ies) in the approved-exceptions list have no approval reference or approver.",
    why_it_matters = "Exceptions change which participants and results are used. Only approved exceptions may be applied.",
    next_action = "Ask the person who approved the exception to add their name and the approval reference, or remove the entry.",
    resolving_role = ROLE_SUPERVISOR,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  # ---- research plan gate (F03) -------------------------------------------
  PLAN_REAL_DATA_NOT_PERMITTED = list(
    state = "BLOCKED",
    plain_language_title = "This version of the runner works with synthetic data only",
    plain_language_summary = "The analysis plan describes the data as '{classification}'. This runner is approved for synthetic (made-up) data only.",
    why_it_matters = "Real participant data may only be processed once ethics approval, data-custodian authority, an approved processing location and a confirmed research plan are all in place and verified.",
    next_action = "Continue using synthetic data for development and testing. Real-data execution is a separate, human-approved step.",
    resolving_role = ROLE_GOVERNANCE,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  PLAN_PROTOCOL_NOT_LOCKED = list(
    state = "BLOCKED",
    plain_language_title = "Your research plan has not been confirmed yet",
    plain_language_summary = "The research plan is currently '{status_label}'. The analysis can only run against a confirmed research plan.",
    why_it_matters = "Running an analysis before the plan is confirmed could produce results that later have to be discarded when a decision changes.",
    next_action = "Complete the outstanding decisions in the research plan and send it for confirmation. You can keep preparing data in the meantime.",
    resolving_role = ROLE_SUPERVISOR,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  PLAN_SCHEMA_NOT_LOCKED = list(
    state = "BLOCKED",
    plain_language_title = "The data structure has not been confirmed yet",
    plain_language_summary = "The data structure (required columns and how values are written) is still marked as '{status}'.",
    why_it_matters = "Until the data structure is confirmed, the runner cannot be sure it is reading values the way the study intends.",
    next_action = "Review the data structure with the data custodian and mark it as confirmed in the research plan.",
    resolving_role = ROLE_DATA_CUSTODIAN,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  PLAN_DECISIONS_UNRESOLVED = list(
    state = "BLOCKED",
    plain_language_title = "{count} decision(s) are needed before this analysis can run",
    plain_language_summary = "The following parts of the research plan are still waiting for a decision: {decisions}.",
    why_it_matters = "These are scientific or governance choices. The runner will never fill them in on your behalf.",
    next_action = "Discuss the open decisions with your supervisor and record the outcome in the research plan. Nothing else needs to change.",
    resolving_role = ROLE_METHODOLOGIST,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  PLAN_AUTHORITY_MISSING = list(
    state = "BLOCKED",
    plain_language_title = "The research plan is missing a required approval record",
    plain_language_summary = "No approval record was found for: {roles}.",
    why_it_matters = "A confirmed research plan must show who confirmed it and where that decision is recorded.",
    next_action = "Ask the named person to record their confirmation, then start the analysis again.",
    resolving_role = ROLE_SUPERVISOR,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  PLAN_GOVERNANCE_NOT_APPROVED = list(
    state = "BLOCKED",
    plain_language_title = "Governance approval for this analysis is not in place",
    plain_language_summary = "The governance approval status is '{status}'{reference_note}.",
    why_it_matters = "The study's ethics and data-governance conditions decide whether this analysis may be run at all.",
    next_action = "Confirm the approval status with the governance contact and record the approval reference in the research plan.",
    resolving_role = ROLE_GOVERNANCE,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  PLAN_LOCATION_NOT_APPROVED = list(
    state = "BLOCKED",
    plain_language_title = "The place where this analysis would run has not been approved",
    plain_language_summary = "The processing location '{location}' is not recorded as approved.",
    why_it_matters = "Data may only be processed in locations the data custodian has approved.",
    next_action = "Confirm the approved processing location with the data custodian and update the research plan.",
    resolving_role = ROLE_GOVERNANCE,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  PLAN_PANEL_EMPTY = list(
    state = "BLOCKED",
    plain_language_title = "The target panel in the research plan is empty",
    plain_language_summary = "The research plan does not list any targets to analyse.",
    why_it_matters = "The panel decides which assays are required and which results are produced.",
    next_action = "Record the confirmed target panel in the research plan.",
    resolving_role = ROLE_METHODOLOGIST,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  # ---- analysis ------------------------------------------------------------
  ANALYSIS_KIND_UNKNOWN = list(
    state = "BLOCKED",
    plain_language_title = "The analysis named in the plan is not available in this runner yet",
    plain_language_summary = "The plan asks for an analysis of kind '{kind}', which this version of the runner does not contain.",
    why_it_matters = "The runner only executes analysis steps that have been supplied and verified. It does not improvise a method.",
    next_action = "No action is needed from you. Research support will map the verified analysis scripts to this step.",
    resolving_role = ROLE_SUPPORT,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  ANALYSIS_OUTPUTS_MISMATCH = list(
    state = "BLOCKED",
    plain_language_title = "The analysis plan and the analysis step do not agree on the outputs",
    plain_language_summary = "For the step '{kind}': {detail}.",
    why_it_matters = "Only outputs that both the plan allows and the step produces may be saved, so the record always matches what was approved.",
    next_action = "No action is needed from you. Research support will align the plan's output list with the analysis step.",
    resolving_role = ROLE_SUPPORT,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  ANALYSIS_STAGE_FAILED = list(
    state = "FAILED",
    plain_language_title = "The analysis stopped before it finished",
    plain_language_summary = "A problem occurred while running the approved analysis. No results from this attempt have been saved as final.",
    why_it_matters = "A partly completed analysis must never be mistaken for a finished one.",
    next_action = "Start the analysis again. If it stops at the same point, send the support reference to research support.",
    resolving_role = ROLE_SUPPORT,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  # ---- outputs -------------------------------------------------------------
  OUTPUT_NOT_ALLOWED = list(
    state = "FAILED",
    plain_language_title = "The analysis produced a file that is not on the approved output list",
    plain_language_summary = "{count} file(s) were produced that the research plan did not approve for saving: {files}.",
    why_it_matters = "Only approved aggregate outputs may leave the analysis. This protects participants and keeps the analysis record honest.",
    next_action = "No action is needed from you. Research support will review the output list.",
    resolving_role = ROLE_SUPPORT,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  OUTPUT_CONTAINS_PARTICIPANT_ROWS = list(
    state = "FAILED",
    plain_language_title = "An output file appears to contain participant-level rows",
    plain_language_summary = "The file '{file}' contains a participant identifier column or individual-level rows. It was not saved to the analysis record.",
    why_it_matters = "Analysis records may only contain aggregate results, never individual participants.",
    next_action = "No action is needed from you. Research support will correct the analysis step.",
    resolving_role = ROLE_SUPPORT,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  OUTPUT_SMALL_CELL = list(
    state = "FAILED",
    plain_language_title = "An output contains a group smaller than the minimum reportable size",
    plain_language_summary = "The file '{file}' contains {count} group(s) with fewer than {minimum} participants.",
    why_it_matters = "Very small groups can identify individuals. The minimum reportable group size is a governance rule.",
    next_action = "Discuss with the governance contact whether these groups should be combined or suppressed.",
    resolving_role = ROLE_GOVERNANCE,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  EXPORT_PLAN_UNKNOWN = list(
    state = "FAILED",
    plain_language_title = "This analysis record cannot be linked to an analysis plan",
    plain_language_summary = "The record does not say which project and analysis plan it belongs to, so it cannot be saved to the platform.",
    why_it_matters = "Every saved analysis record must be traceable to the approved plan it ran under.",
    next_action = "Start the analysis again from the approved analysis plan, or ask research support to supply the project and plan identifiers.",
    resolving_role = ROLE_SUPPORT,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  # ---- record and catch-all -----------------------------------------------
  RECORD_WRITE_FAILED = list(
    state = "FAILED",
    plain_language_title = "The reproducibility record could not be saved",
    plain_language_summary = "The analysis ran, but the record describing how it ran could not be written to disk.",
    why_it_matters = "Without the record, the result cannot be traced or defended later, so it is not treated as complete.",
    next_action = "Check that there is space to save files, then start the analysis again.",
    resolving_role = ROLE_SUPPORT,
    can_continue_elsewhere = TRUE, work_preserved = TRUE),

  UNEXPECTED_ERROR = list(
    state = "FAILED",
    plain_language_title = "Something unexpected stopped the analysis",
    plain_language_summary = "The step '{stage_label}' stopped because of a problem the runner did not anticipate.",
    why_it_matters = "The runner stops rather than continue in an unknown state.",
    next_action = "Start the analysis again. If it stops at the same point, send the support reference to research support.",
    resolving_role = ROLE_SUPPORT,
    can_continue_elsewhere = TRUE, work_preserved = TRUE)
)

# Plain-language labels for research-plan fields that may be unresolved.
# Internal field path -> what the researcher calls it, and who decides.
DECISION_LABELS <- list(
  "analysis_plan.claim_intent"              = list(label = "Whether the study claims an association or a prediction", role = ROLE_METHODOLOGIST),
  "analysis_plan.prediction_timing"         = list(label = "The timing of any prediction", role = ROLE_METHODOLOGIST),
  "analysis_plan.primary_outcome"           = list(label = "The primary outcome", role = ROLE_SUPERVISOR),
  "analysis_plan.secondary_outcomes"        = list(label = "The secondary outcomes", role = ROLE_SUPERVISOR),
  "analysis_plan.target_panel"              = list(label = "The confirmed target panel", role = ROLE_METHODOLOGIST),
  "analysis_plan.covariates"                = list(label = "The covariates and their roles", role = ROLE_METHODOLOGIST),
  "analysis_plan.confirmatory_targets"      = list(label = "Which targets are confirmatory", role = ROLE_METHODOLOGIST),
  "analysis_plan.exploratory_targets"       = list(label = "Which targets are exploratory", role = ROLE_METHODOLOGIST),
  "analysis_plan.normality_rule"            = list(label = "How normality is assessed", role = ROLE_METHODOLOGIST),
  "analysis_plan.transformation_rule"       = list(label = "Which transformation is applied", role = ROLE_METHODOLOGIST),
  "analysis_plan.missing_data_rule"         = list(label = "How missing values are handled", role = ROLE_METHODOLOGIST),
  "analysis_plan.below_detection_rule"      = list(label = "How below-detection values are handled", role = ROLE_METHODOLOGIST),
  "analysis_plan.categorical_outcome_path"  = list(label = "The analysis path for categorical outcomes", role = ROLE_METHODOLOGIST),
  "analysis_plan.continuous_outcome_path"   = list(label = "The analysis path for continuous outcomes", role = ROLE_METHODOLOGIST),
  "analysis_plan.post_hoc_method"           = list(label = "The post-hoc method", role = ROLE_METHODOLOGIST),
  "analysis_plan.multiplicity.family"       = list(label = "The multiple-testing family", role = ROLE_METHODOLOGIST),
  "analysis_plan.multiplicity.correction"   = list(label = "The multiple-testing correction", role = ROLE_METHODOLOGIST),
  "analysis_plan.model_diagnostics"         = list(label = "Which model diagnostics are reported", role = ROLE_METHODOLOGIST),
  "analysis_plan.validation"                = list(label = "How the model is validated", role = ROLE_METHODOLOGIST),
  "analysis_plan.sensitivity_analysis"      = list(label = "The sensitivity analysis", role = ROLE_METHODOLOGIST),
  "analysis_plan.replicates_rule"           = list(label = "How repeat measurements are handled", role = ROLE_METHODOLOGIST),
  "data.participants_file"                  = list(label = "Which participant file (dataset version) is used", role = ROLE_RESEARCHER),
  "data.assays_file"                        = list(label = "Which assay file (dataset version) is used", role = ROLE_RESEARCHER),
  "data.participant_id_column"              = list(label = "Which column holds the study identifier", role = ROLE_DATA_CUSTODIAN),
  "data.participant_id_pattern"             = list(label = "The approved study-identifier format", role = ROLE_DATA_CUSTODIAN),
  "data.assay_target_column"                = list(label = "Which column names the target", role = ROLE_DATA_CUSTODIAN),
  "data.assay_value_column"                 = list(label = "Which column holds the measured value", role = ROLE_DATA_CUSTODIAN),
  "data.required_participant_columns"       = list(label = "Which participant columns are required", role = ROLE_DATA_CUSTODIAN),
  "data.value_representations.missing_tokens" = list(label = "How missing values are written in the data", role = ROLE_DATA_CUSTODIAN),
  "data.value_representations.below_detection_tokens" = list(label = "How below-detection values are written in the data", role = ROLE_DATA_CUSTODIAN),
  "data.value_representations.decimal_separator" = list(label = "The decimal separator used in the data", role = ROLE_DATA_CUSTODIAN),
  "data.value_representations.allowed_range" = list(label = "The plausible range for measured values", role = ROLE_DATA_CUSTODIAN),
  "stages.seed"                             = list(label = "The recorded random seed for the analysis", role = ROLE_SUPPORT),
  "stages.analysis.kind"                    = list(label = "Which verified analysis step is run", role = ROLE_SUPPORT),
  "stages.analysis.group_by"                = list(label = "Which variable defines the groups", role = ROLE_SUPERVISOR),
  "outputs.allow_list"                      = list(label = "Which outputs may leave the analysis", role = ROLE_GOVERNANCE),
  "governance.approval_status"              = list(label = "Governance approval", role = ROLE_GOVERNANCE),
  "governance.approval_reference"           = list(label = "The governance approval reference", role = ROLE_GOVERNANCE),
  "governance.processing_location"          = list(label = "The approved processing location", role = ROLE_GOVERNANCE),
  "governance.minimum_reportable_cell_size" = list(label = "The minimum reportable group size", role = ROLE_GOVERNANCE),
  "governance.permitted_outputs"            = list(label = "Which outputs may leave the analysis", role = ROLE_GOVERNANCE)
)

decision_label <- function(path) {
  d <- DECISION_LABELS[[path]]
  if (is.null(d)) return(list(label = gsub("[._]", " ", path), role = ROLE_METHODOLOGIST))
  d
}

PROTOCOL_STATUS_LABELS <- c(
  DRAFT             = "still a draft",
  PENDING_AUTHORITY = "waiting for confirmation",
  LOCKED            = "confirmed",
  SUPERSEDED        = "replaced by a newer version",
  REVOKED           = "withdrawn"
)

protocol_status_label <- function(status) {
  if (is.null(status) || is.na(status) || !nzchar(status)) return("not recorded")
  lab <- PROTOCOL_STATUS_LABELS[[status]]
  if (is.null(lab)) return(paste0("recorded as '", status, "', which is not a recognised status"))
  lab
}

# Fill {placeholders} in a template from a named list. Missing values become
# a neutral phrase rather than an R error, so message building never fails.
fill_template <- function(template, values) {
  if (is.null(template)) return("")
  out <- template
  keys <- unique(regmatches(out, gregexpr("\\{[a-z_]+\\}", out))[[1]])
  for (k in keys) {
    name <- gsub("[{}]", "", k)
    v <- values[[name]]
    if (is.null(v) || length(v) == 0) v <- "(not recorded)"
    v <- paste(as.character(v), collapse = ", ")
    out <- gsub(k, v, out, fixed = TRUE)
  }
  out
}

# Build a complete researcher-safe status block for a code.
build_researcher_status <- function(code, values = list(), support_reference = NA_character_) {
  m <- MESSAGES[[code]]
  if (is.null(m)) {
    m <- MESSAGES$UNEXPECTED_ERROR
    values$stage_label <- values$stage_label %||% "the analysis"
  }
  list(
    code = code,
    state = m$state,
    plain_language_title   = fill_template(m$plain_language_title, values),
    plain_language_summary = fill_template(m$plain_language_summary, values),
    why_it_matters         = fill_template(m$why_it_matters, values),
    next_action            = fill_template(m$next_action, values),
    resolving_role         = m$resolving_role,
    can_continue_elsewhere = isTRUE(m$can_continue_elsewhere),
    work_preserved         = isTRUE(m$work_preserved),
    support_reference      = support_reference
  )
}

success_status <- function(support_reference = NA_character_) {
  list(
    code = "RUN_SUCCEEDED",
    state = "SUCCEEDED",
    plain_language_title   = "Your analysis finished and the record was saved",
    plain_language_summary = "All steps completed. The approved outputs and the reproducibility record are saved together in the analysis record.",
    why_it_matters         = "You can now review the results knowing exactly which data version, plan and settings produced them.",
    next_action            = "Review the outputs. If anything looks unexpected, the analysis record shows how each result was produced.",
    resolving_role         = NULL,
    can_continue_elsewhere = TRUE,
    work_preserved         = TRUE,
    support_reference      = support_reference
  )
}

`%||%` <- function(a, b) if (is.null(a)) b else a
