# Statistical boundary: decisions the R runner will never make

Status: binding for the R lane. Owner of each decision: the human authority
named below (Firdous, her supervisor, a statistician or methodologist, the
ethics body or the data custodian). The runner represents each item as a
configuration field; while a field is `BLOCKED` the runner stops before the
analysis step with the message "decision(s) are needed before this analysis
can run" and names the item in research language.

Nothing in this table has been decided. No value has been inferred from
voice transcriptions, questionnaire answers or earlier drafts. The synthetic
plan (`runner/r/config/synthetic_locked.yml`) fills these fields with
labelled placeholders solely to exercise the machinery.

| Decision (as shown to the researcher) | Configuration field | Who resolves it | Why the runner cannot |
|---|---|---|---|
| Whether the study claims an association or a prediction | `analysis_plan.claim_intent` | Firdous with supervisor and methodologist | Changes the whole analysis route and the claims that may be made |
| The timing of any prediction | `analysis_plan.prediction_timing` | Supervisor and methodologist | Scientific design |
| The primary outcome | `analysis_plan.primary_outcome` | Firdous with supervisor | Defines the confirmatory question |
| The secondary outcomes | `analysis_plan.secondary_outcomes` | Firdous with supervisor | Scientific scope |
| The confirmed target panel (post-QC) | `analysis_plan.target_panel` | Firdous with supervisor and methodologist | Which assays are required and how many tests exist |
| The covariates and their roles | `analysis_plan.covariates` | Methodologist | Adjustment strategy |
| Which targets are confirmatory or exploratory | `analysis_plan.confirmatory_targets`, `exploratory_targets` | Methodologist | Multiplicity and claim strength |
| How normality is assessed | `analysis_plan.normality_rule` | Methodologist | Statistical method |
| Which transformation is applied | `analysis_plan.transformation_rule` | Methodologist | Statistical method |
| How missing values are handled | `analysis_plan.missing_data_rule` | Methodologist | Sample and bias |
| How below-detection values are handled | `analysis_plan.below_detection_rule` | Methodologist with data custodian | Assay interpretation |
| Analysis path for categorical outcomes | `analysis_plan.categorical_outcome_path` | Methodologist | Statistical method |
| Analysis path for continuous outcomes | `analysis_plan.continuous_outcome_path` | Methodologist | Statistical method |
| The post-hoc method | `analysis_plan.post_hoc_method` | Methodologist | Statistical method |
| The multiple-testing family and correction | `analysis_plan.multiplicity.family`, `.correction` | Methodologist | Error control |
| Which model diagnostics are reported | `analysis_plan.model_diagnostics` | Methodologist | Validity evidence |
| How the model is validated | `analysis_plan.validation` | Methodologist | Prediction claims |
| The sensitivity analysis | `analysis_plan.sensitivity_analysis` | Methodologist | Robustness |
| How repeat measurements are handled | `analysis_plan.replicates_rule` | Methodologist with data custodian | Determines whether a duplicate key is an error |
| Approved representation of missing and below-detection values | `data.value_representations` | Data custodian | F01 typing depends on it |
| Governance approval and reference | `governance.approval_status`, `.approval_reference` | Ethics body / data custodian | Whether any run may happen |
| The approved processing location | `governance.processing_location` | Data custodian | Where data may be processed |
| The minimum reportable group size | `governance.minimum_reportable_cell_size` | Data governance | Disclosure control on outputs |
| Which outputs may leave the analysis | `governance.permitted_outputs`, `outputs.allow_list` | Data governance with supervisor | Output guard depends on it |

## Gate conditions (F03)

The analysis step runs only when all of these hold:

- `data_classification` is `SYNTHETIC` (this runner version refuses anything else at step 1)
- `research_plan.protocol_status` is `LOCKED`
- `research_plan.schema_status` is `LOCKED`
- every role in `research_plan.required_authority_roles` has an authority record with a reference
- `governance.approval_status` is `APPROVED` with a reference
- `governance.processing_location_approved` is true
- no field in `analysis_plan` or `governance` is unresolved (`BLOCKED`, `TBD`, empty, a `<placeholder>`)
- `analysis_plan.target_panel` is not empty

## Escalation

A request to fill any of these fields for the real study is escalated, never
resolved in the lane. The runner produces the list of open decisions in the
analysis record (`unresolved_decisions`) so the platform can present them as
"Waiting for a decision" with the resolving role.
