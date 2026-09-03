# Researcher-facing messages (generated from R/messages.R)

Every stop the runner can make is listed here with the exact wording a researcher sees.
Placeholders in braces are filled with counts, column names or examples at run time.
Raw R errors never appear in these fields; they go to the support log only.

## Steps

- Checking the analysis environment
- Checking that your data structure is ready
- Confirming the approved analysis plan
- Running the approved analysis
- Checking outputs before saving
- Saving the reproducibility record

## Stops

### The analysis plan file could not be found

- Support code: `CONFIG_MISSING` (stopped, action needed)
- What happened: The runner looked for the analysis plan at '{path}' and could not find it.
- Why it matters: The analysis plan tells the runner which data, checks and outputs were approved. Nothing can run without it.
- Next action: Check the location of the analysis plan file, or choose the plan again and start the analysis once more.
- Who can resolve it: You (the researcher) can resolve this.
- Other work can continue: yes
- Work preserved: yes

### The analysis plan file could not be read

- Support code: `CONFIG_INVALID` (stopped, action needed)
- What happened: The analysis plan file exists, but part of it could not be understood: {detail}.
- Why it matters: An incomplete plan could lead to the wrong data or settings being used.
- Next action: Open the analysis plan and correct the section named above, or ask research support to check it.
- Who can resolve it: Research support (quote the support reference).
- Other work can continue: yes
- Work preserved: yes

### The analysis environment does not match the recorded one

- Support code: `ENV_NOT_REPRODUCIBLE` (waiting for a decision)
- What happened: The software packages available on this computer differ from the versions recorded for this analysis ({detail}).
- Why it matters: Results produced with different software versions might not match earlier results, so the runner stops rather than produce an analysis record that cannot be trusted.
- Next action: Ask research support to restore the recorded analysis environment, then start the analysis again.
- Who can resolve it: Research support (quote the support reference).
- Other work can continue: yes
- Work preserved: yes

### A data file could not be found

- Support code: `DATA_FILE_MISSING` (stopped, action needed)
- What happened: The {role} file was expected at '{path}' but is not there.
- Why it matters: The analysis cannot check or use data it cannot find.
- Next action: Confirm the dataset version you intended to use and that the file is in the expected place, then start again.
- Who can resolve it: You (the researcher) can resolve this.
- Other work can continue: yes
- Work preserved: yes

### Required columns are missing from the {role} file

- Support code: `DATA_COLUMNS_MISSING` (stopped, action needed)
- What happened: The {role} file does not contain these required columns: {columns}.
- Why it matters: Without these columns the runner cannot match assays to participants or read the measured values.
- Next action: Check the column names in the file against the approved data structure. Column names must match exactly.
- Who can resolve it: The data custodian or the person who prepared the data file.
- Other work can continue: yes
- Work preserved: yes

### Some participant identifiers are not in the expected format

- Support code: `DATA_IDS_MALFORMED` (stopped, action needed)
- What happened: {count} identifier(s) in the {role} file do not follow the approved study-identifier format.
- Why it matters: Identifiers in an unexpected format may be real identifying information, or may stop assays from matching participants.
- Next action: Check the identifier column with the data custodian. Only approved study identifiers may be used.
- Who can resolve it: The data custodian or the person who prepared the data file.
- Other work can continue: yes
- Work preserved: yes

### Some measured values could not be interpreted

- Support code: `DATA_VALUES_MALFORMED` (stopped, action needed)
- What happened: {count} value(s) in the '{column}' column are written in a way the approved data structure does not recognise, for example: {examples}.
- Why it matters: The runner will not guess what these values mean. Guessing could silently turn a missing or below-detection result into a number, which would change the analysis.
- Next action: Decide with the data custodian how each of these should be written. Approved representations are: {approved}. Then update the file and start again.
- Who can resolve it: The data custodian or the person who prepared the data file.
- Other work can continue: yes
- Work preserved: yes

### Some measured values are outside the approved range

- Support code: `DATA_VALUES_OUT_OF_RANGE` (stopped, action needed)
- What happened: {count} value(s) in the '{column}' column fall outside the approved range of {range}.
- Why it matters: Values outside the expected range often point to a units problem or a transcription error.
- Next action: Check these values with the data custodian. If the range itself is wrong, the approved data structure must be updated first.
- Who can resolve it: The data custodian or the person who prepared the data file.
- Other work can continue: yes
- Work preserved: yes

### Some assay results belong to participants who are not in the participant file

- Support code: `DATA_ORPHAN_ASSAYS` (stopped, action needed)
- What happened: {count} assay row(s) refer to {n_ids} participant identifier(s) that do not appear in the participant file.
- Why it matters: Results that cannot be linked to a participant cannot be analysed, and may indicate that the two files come from different dataset versions.
- Next action: Check that the participant and assay files are from the same dataset version. If an assay is a known exception, record it in the approved-exceptions list.
- Who can resolve it: The data custodian or the person who prepared the data file.
- Other work can continue: yes
- Work preserved: yes

### Some participants are missing required assay results

- Support code: `DATA_MISSING_ASSAYS` (stopped, action needed)
- What happened: {count} required assay result(s) are missing across {n_ids} participant(s).
- Why it matters: The approved plan expects every participant to have a result for each target in the panel. Missing rows change the sample size.
- Next action: Add the missing results, or record each missing result as an approved exception with the reason and who approved it.
- Who can resolve it: The data custodian or the person who prepared the data file.
- Other work can continue: yes
- Work preserved: yes

### Some assay results are duplicated

- Support code: `DATA_DUPLICATE_KEYS` (stopped, action needed)
- What happened: {count} participant-and-target combination(s) appear more than once in the assay file.
- Why it matters: Duplicated rows would count a participant more than once. Whether repeat measurements are allowed is a decision for the research plan, not for the runner.
- Next action: Remove accidental duplicates. If repeat measurements are intended, the research plan must say how they are handled before the analysis can run.
- Who can resolve it: Your supervisor, statistician or methodologist.
- Other work can continue: yes
- Work preserved: yes

### Some participants appear more than once in the participant file

- Support code: `DATA_DUPLICATE_PARTICIPANTS` (stopped, action needed)
- What happened: {count} participant identifier(s) appear more than once in the participant file.
- Why it matters: Each participant must appear exactly once so that results are counted correctly.
- Next action: Remove the duplicate rows from the participant file and start again.
- Who can resolve it: The data custodian or the person who prepared the data file.
- Other work can continue: yes
- Work preserved: yes

### An exception in the exceptions list has not been approved

- Support code: `DATA_EXCEPTION_UNAPPROVED` (waiting for a decision)
- What happened: {count} entry(ies) in the approved-exceptions list have no approval reference or approver.
- Why it matters: Exceptions change which participants and results are used. Only approved exceptions may be applied.
- Next action: Ask the person who approved the exception to add their name and the approval reference, or remove the entry.
- Who can resolve it: Your supervisor or the person who confirms the research plan.
- Other work can continue: yes
- Work preserved: yes

### This version of the runner works with synthetic data only

- Support code: `PLAN_REAL_DATA_NOT_PERMITTED` (waiting for a decision)
- What happened: The analysis plan describes the data as '{classification}'. This runner is approved for synthetic (made-up) data only.
- Why it matters: Real participant data may only be processed once ethics approval, data-custodian authority, an approved processing location and a confirmed research plan are all in place and verified.
- Next action: Continue using synthetic data for development and testing. Real-data execution is a separate, human-approved step.
- Who can resolve it: The ethics or data-governance contact for the study.
- Other work can continue: yes
- Work preserved: yes

### Your research plan has not been confirmed yet

- Support code: `PLAN_PROTOCOL_NOT_LOCKED` (waiting for a decision)
- What happened: The research plan is currently '{status_label}'. The analysis can only run against a confirmed research plan.
- Why it matters: Running an analysis before the plan is confirmed could produce results that later have to be discarded when a decision changes.
- Next action: Complete the outstanding decisions in the research plan and send it for confirmation. You can keep preparing data in the meantime.
- Who can resolve it: Your supervisor or the person who confirms the research plan.
- Other work can continue: yes
- Work preserved: yes

### The data structure has not been confirmed yet

- Support code: `PLAN_SCHEMA_NOT_LOCKED` (waiting for a decision)
- What happened: The data structure (required columns and how values are written) is still marked as '{status}'.
- Why it matters: Until the data structure is confirmed, the runner cannot be sure it is reading values the way the study intends.
- Next action: Review the data structure with the data custodian and mark it as confirmed in the research plan.
- Who can resolve it: The data custodian or the person who prepared the data file.
- Other work can continue: yes
- Work preserved: yes

### {count} decision(s) are needed before this analysis can run

- Support code: `PLAN_DECISIONS_UNRESOLVED` (waiting for a decision)
- What happened: The following parts of the research plan are still waiting for a decision: {decisions}.
- Why it matters: These are scientific or governance choices. The runner will never fill them in on your behalf.
- Next action: Discuss the open decisions with your supervisor and record the outcome in the research plan. Nothing else needs to change.
- Who can resolve it: Your supervisor, statistician or methodologist.
- Other work can continue: yes
- Work preserved: yes

### The research plan is missing a required approval record

- Support code: `PLAN_AUTHORITY_MISSING` (waiting for a decision)
- What happened: No approval record was found for: {roles}.
- Why it matters: A confirmed research plan must show who confirmed it and where that decision is recorded.
- Next action: Ask the named person to record their confirmation, then start the analysis again.
- Who can resolve it: Your supervisor or the person who confirms the research plan.
- Other work can continue: yes
- Work preserved: yes

### Governance approval for this analysis is not in place

- Support code: `PLAN_GOVERNANCE_NOT_APPROVED` (waiting for a decision)
- What happened: The governance approval status is '{status}'{reference_note}.
- Why it matters: The study's ethics and data-governance conditions decide whether this analysis may be run at all.
- Next action: Confirm the approval status with the governance contact and record the approval reference in the research plan.
- Who can resolve it: The ethics or data-governance contact for the study.
- Other work can continue: yes
- Work preserved: yes

### The place where this analysis would run has not been approved

- Support code: `PLAN_LOCATION_NOT_APPROVED` (waiting for a decision)
- What happened: The processing location '{location}' is not recorded as approved.
- Why it matters: Data may only be processed in locations the data custodian has approved.
- Next action: Confirm the approved processing location with the data custodian and update the research plan.
- Who can resolve it: The ethics or data-governance contact for the study.
- Other work can continue: yes
- Work preserved: yes

### The target panel in the research plan is empty

- Support code: `PLAN_PANEL_EMPTY` (waiting for a decision)
- What happened: The research plan does not list any targets to analyse.
- Why it matters: The panel decides which assays are required and which results are produced.
- Next action: Record the confirmed target panel in the research plan.
- Who can resolve it: Your supervisor, statistician or methodologist.
- Other work can continue: yes
- Work preserved: yes

### The analysis named in the plan is not available in this runner yet

- Support code: `ANALYSIS_KIND_UNKNOWN` (waiting for a decision)
- What happened: The plan asks for an analysis of kind '{kind}', which this version of the runner does not contain.
- Why it matters: The runner only executes analysis steps that have been supplied and verified. It does not improvise a method.
- Next action: No action is needed from you. Research support will map the verified analysis scripts to this step.
- Who can resolve it: Research support (quote the support reference).
- Other work can continue: yes
- Work preserved: yes

### The analysis plan and the analysis step do not agree on the outputs

- Support code: `ANALYSIS_OUTPUTS_MISMATCH` (waiting for a decision)
- What happened: For the step '{kind}': {detail}.
- Why it matters: Only outputs that both the plan allows and the step produces may be saved, so the record always matches what was approved.
- Next action: No action is needed from you. Research support will align the plan's output list with the analysis step.
- Who can resolve it: Research support (quote the support reference).
- Other work can continue: yes
- Work preserved: yes

### The analysis stopped before it finished

- Support code: `ANALYSIS_STAGE_FAILED` (stopped, action needed)
- What happened: A problem occurred while running the approved analysis. No results from this attempt have been saved as final.
- Why it matters: A partly completed analysis must never be mistaken for a finished one.
- Next action: Start the analysis again. If it stops at the same point, send the support reference to research support.
- Who can resolve it: Research support (quote the support reference).
- Other work can continue: yes
- Work preserved: yes

### The analysis produced a file that is not on the approved output list

- Support code: `OUTPUT_NOT_ALLOWED` (stopped, action needed)
- What happened: {count} file(s) were produced that the research plan did not approve for saving: {files}.
- Why it matters: Only approved aggregate outputs may leave the analysis. This protects participants and keeps the analysis record honest.
- Next action: No action is needed from you. Research support will review the output list.
- Who can resolve it: Research support (quote the support reference).
- Other work can continue: yes
- Work preserved: yes

### An output file appears to contain participant-level rows

- Support code: `OUTPUT_CONTAINS_PARTICIPANT_ROWS` (stopped, action needed)
- What happened: The file '{file}' contains a participant identifier column or individual-level rows. It was not saved to the analysis record.
- Why it matters: Analysis records may only contain aggregate results, never individual participants.
- Next action: No action is needed from you. Research support will correct the analysis step.
- Who can resolve it: Research support (quote the support reference).
- Other work can continue: yes
- Work preserved: yes

### An output contains a group smaller than the minimum reportable size

- Support code: `OUTPUT_SMALL_CELL` (stopped, action needed)
- What happened: The file '{file}' contains {count} group(s) with fewer than {minimum} participants.
- Why it matters: Very small groups can identify individuals. The minimum reportable group size is a governance rule.
- Next action: Discuss with the governance contact whether these groups should be combined or suppressed.
- Who can resolve it: The ethics or data-governance contact for the study.
- Other work can continue: yes
- Work preserved: yes

### This analysis record cannot be linked to an analysis plan

- Support code: `EXPORT_PLAN_UNKNOWN` (stopped, action needed)
- What happened: The record does not say which project and analysis plan it belongs to, so it cannot be saved to the platform.
- Why it matters: Every saved analysis record must be traceable to the approved plan it ran under.
- Next action: Start the analysis again from the approved analysis plan, or ask research support to supply the project and plan identifiers.
- Who can resolve it: Research support (quote the support reference).
- Other work can continue: yes
- Work preserved: yes

### The reproducibility record could not be saved

- Support code: `RECORD_WRITE_FAILED` (stopped, action needed)
- What happened: The analysis ran, but the record describing how it ran could not be written to disk.
- Why it matters: Without the record, the result cannot be traced or defended later, so it is not treated as complete.
- Next action: Check that there is space to save files, then start the analysis again.
- Who can resolve it: Research support (quote the support reference).
- Other work can continue: yes
- Work preserved: yes

### Something unexpected stopped the analysis

- Support code: `UNEXPECTED_ERROR` (stopped, action needed)
- What happened: The step '{stage_label}' stopped because of a problem the runner did not anticipate.
- Why it matters: The runner stops rather than continue in an unknown state.
- Next action: Start the analysis again. If it stops at the same point, send the support reference to research support.
- Who can resolve it: Research support (quote the support reference).
- Other work can continue: yes
- Work preserved: yes

## Success

- Your analysis finished and the record was saved: All steps completed. The approved outputs and the reproducibility record are saved together in the analysis record.

