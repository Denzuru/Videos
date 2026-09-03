# Security review: R runner lane (self-review, branch claude/firdous-r-runner-mhwc2j)

| | |
|---|---|
| Scope | All new code under `runner/r` on the lane branch (identification pass over the full diff versus the default branch, then an independent false-positive filter pass per finding) |
| Date | 2026-09-03 |
| Reviewer | Brother C / Claude Code (author lane; a non-author verifier replay is still required) |
| Method | Read-only analysis of every module, script and config; data-flow tracing from config, CSV and git-derived names to shell calls, file operations and returned artifacts; probes of the F03 gate for bypass by config content |

## Result

No High findings. Two Medium findings were identified; both scored below the
review's 8/10 reporting threshold (6/10 and 7/10) and would normally be
withheld. Both are nevertheless verified defects in controls this project
treats as invariants (no participant-level content in returned records; the
restricted-data guard never reports clean for a file it did not read), so both
were fixed on the branch, with regression tests, before this record was written.

# Vuln 1: Sensitive data exposure: `runner/r/R/assay_typing.R:84`

* Severity: Medium (filter confidence 6/10)
* Description: Malformed assay tokens were echoed verbatim into the researcher summary, and that text was serialised into `manifest.json`, `run_status.json` and `researcher_summary.md`, which the record-stage leak self-check did not scan. Exported records carried the same strings and the exporter checked key names only.
* Exploit scenario: A value column containing a study identifier, a name or a national identity number (a shifted column or a free-text annotation) stops the run at step 2 as designed, but the first three such tokens travel in the analysis record to the platform.
* Fix applied: Tokens are masked at source; only tokens up to 8 characters of digits and numeric punctuation are ever echoed, everything else is described by kind and length. The record stage now redacts identifier-shaped substrings from every in-memory field before the manifest, status and summary are written and records the count as `identifier_redactions`. `export_bundle_request()` scans string values against the plan's identifier pattern and refuses the export on a hit. Tests: `test-assay-typing.R` (masking), `test-pipeline.R` (identifier and name in a value column never reach the returned record), `test-export-bundle.R` (value-level refusal).

# Vuln 2: Security control bypass: `runner/r/R/guard.R:50`

* Severity: Medium (filter confidence 7/10)
* Description: The guard skipped, without any finding, files whose git-reported name was C-quoted (any non-ASCII byte, double quote or backslash under the default `core.quotePath`), files that looked binary (including UTF-16 CSVs), and files above the size limit, then reported "no problems found" and exited 0.
* Exploit scenario: A researcher commits a real export as `runner/r/data/synthetic/résultats participants.csv` or as a UTF-16 `participants.csv`; both the pre-commit hook and CI report clean.
* Fix applied: Git paths are read with `-z` and split on raw NUL bytes so names arrive verbatim. A file that cannot be opened, is UTF-16, is binary behind a text extension, or exceeds the inspection limit with a text extension now produces `FILE_NOT_INSPECTED` and fails the guard; genuine binaries with binary extensions are still skipped. `run.sh` selects a UTF-8 locale when none is set so R can open accented names. Tests: `test-guard.R` (four not-inspected cases; a quoted name, and an accented name under a UTF-8 locale, staged and tracked through a real git repository).

## Design note acted on

`find_unresolved()` inspected only keys present in the plan, so deleting a
decision (for example `governance.minimum_reportable_cell_size`) passed the
gate and silently disabled the small-cell check. The gate now requires every
decision path present in `config/firdous_template_BLOCKED.yml` and treats an
empty required-authority list as the principal researcher. Tests in
`test-schema-lock.R`.

## Checked and rejected

- Command injection: every `system2("git", ...)` uses a fixed argument vector with `shQuote(root)`; git-derived names reach only file functions.
- YAML and JSON deserialisation: `yaml` 2.3.8 without `eval.expr`; `jsonlite::fromJSON` has no execution path.
- Path traversal: config and CLI paths are operator-controlled; quarantine renames stay inside the run directory.
- F03 gate bypass by config content: `identical()` comparisons reject case variants, vectors and lists; the stage loop breaks on the first stop.
- Hardcoded secrets: none.

## Verifier replay requested

OpenClaw or Codex: replay `./run.sh test` (64 blocks, 696 expectations at
this commit) and run the guard against a scratch repository containing an
accented file name and a UTF-16 CSV.
