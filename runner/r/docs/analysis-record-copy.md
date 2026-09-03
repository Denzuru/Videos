# Copy for the analysis screens (for OpenClaw)

Ready-to-use wording for the runner-facing screens, written against the
Researcher Experience Standard. Every sentence here is bounded by what the
runner actually proves. Fields in `run_status.json` and `manifest.json` that
feed each block are named so the wording stays truthful when the data changes.

## Progress (while the analysis runs)

Heading: **Running your analysis**

Show the six steps from `run_status.json > stages[].label` with their state:

| `stages[].state` | Show |
|---|---|
| `NOT_STARTED` | Not started |
| `RUNNING` | In progress |
| `SUCCEEDED` | Done |
| `FAILED` | Stopped, action needed |
| `BLOCKED` | Waiting for a decision |
| `SKIPPED` | Not run |

Supporting line: "You can leave this page. The analysis continues and you will
find the outcome under Analysis when you return." (Only true once the web
workspace runs the runner as a background job; until then omit it.)

## Outcome: completed (`run_state = SUCCEEDED`)

Heading: `researcher_status.plain_language_title`
("Your analysis finished and the record was saved")

Body, in order:

1. `researcher_status.plain_language_summary`
2. "This record shows which data version, research plan and settings were
   used. Running it again with the same data and plan produces the same
   results." (`replay` verdict MATCH backs this.)
3. Bounded claim, always shown for the synthetic placeholder
   (`manifest.analysis.kind = SYNTHETIC_DESCRIPTIVE_PLACEHOLDER`):
   "These are descriptive tables produced on synthetic data. No statistical
   test was applied and no scientific conclusion is drawn."
4. Primary action: **Review the results**. Secondary: **View the analysis record**.

Do not say "significant", "effect", "association", "finding" or "result
shows" anywhere on this screen.

## Outcome: waiting for a decision (`run_state = BLOCKED`)

Heading: `researcher_status.plain_language_title`
Status label: **Waiting for a decision**

Body:

1. What happened: `plain_language_summary`
2. Why it matters: `why_it_matters`
3. "Your earlier work is safe. Nothing has been changed." (`work_preserved = true`)
4. Decisions needed: list `unresolved_decisions[]` as
   "`decision` (who can resolve it: `resolving_role`)".
5. Next action: `next_action`
6. If `can_continue_elsewhere = true`: "You can keep preparing data and
   documents while this decision is pending."

Primary action: **Open the research plan**. Secondary: **Details for support**.

## Outcome: stopped (`run_state = FAILED`)

Heading: `researcher_status.plain_language_title`
Status label: **Stopped, action needed**

Body:

1. What happened: `plain_language_summary`
2. Why it matters: `why_it_matters`
3. "Your earlier work is safe. Nothing you entered has been lost."
4. If `findings[]` has more than one entry: "`n` items were found in this
   attempt" followed by each `findings[].plain_language_title` and summary.
5. Next action: `next_action`
6. Who can help: `resolving_role`

Primary action: **Fix and run again** (returns to Data and inputs when the
stopping step was "Checking that your data structure is ready", otherwise to
the research plan). Secondary: **Details for support**.

## Details for support (collapsed by default)

- "Support reference: `researcher_status.support_reference`"
- "Technical log for research support: `support/technical_log.txt`"
- "You do not need to read the technical log to understand this page."

Never render the log contents inline on the primary path.

## The analysis record page ("How this result was produced")

Opening sentence: "This record shows how the analysis was produced, so the
result can be checked and repeated later."

Plain rows, each with a "Why this matters" tooltip alternative rendered as
visible text on request:

| Row | Source | Wording |
|---|---|---|
| Data version | `manifest.inputs[]` roles and `dataset_fingerprint` | "Participant file and assay file used, with their fingerprints" |
| Research plan | `manifest.research_plan.protocol_version_id`, `protocol_status` | "Research-plan version `id`, confirmed" |
| Settings | `configuration.content_fingerprint`, `seed` | "The exact analysis settings and the recorded random seed" |
| Software environment | `environment.r_version`, `renv_lockfile_sha256` | "R `version` with the recorded package set" |
| Analysis code | `code.revision`, `code.branch` | "Code version `short revision`" |
| Outputs | `outputs[]` | "`n` aggregate tables, each with a checksum" |
| Reproduced | latest `replay_report.json` verdict | "Repeated on `date`: same results" or "Not yet repeated" |

What the record proves: "Which data, plan, settings and software produced
these tables, and that repeating the analysis gives the same tables."

What it does not prove: "That the method is the right one for your research
question. That remains a decision recorded in your research plan."

Fingerprints and identifiers stay under "View technical details".

## Words to avoid on the primary path

manifest, bundle, checksum, hash, SHA, enum, JSON, YAML, stack trace, renv,
lockfile, Rscript, exit code, BLOCKED, FAILED, SUCCEEDED (as raw tokens).
Use the labels in the tables above instead.
