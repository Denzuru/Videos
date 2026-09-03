# Project Firdous R runner (v0.1.1, synthetic only)

The R execution layer for Project Firdous. It runs an approved analysis from
one command, refuses to run when the research plan or data structure is not
confirmed, and always leaves a complete, participant-free reproducibility
record. Everything here works on synthetic data only.

Owner: Brother C / Claude Code lane. Reviewers: Brother G (scientific gate,
reproducibility, manifest) and OpenClaw (clean replay).

## The one command

```sh
cd runner/r
./run.sh                 # run the synthetic analysis with config/synthetic_locked.yml
./run.sh test            # run the test suite
./run.sh guard --all     # restricted-data and secret guard over tracked files in scope
./run.sh replay --reference <analysis record>/manifest.json
./run.sh export <analysis record>   # write bundle_request.json, the platform ingestion request
./run.sh restore         # restore the recorded R environment (renv)
./run.sh fingerprint PATH_TO_V0.1.0_ARCHIVE
```

Requirements: R 4.3.x with the packages recorded in `renv.lock` (digest,
jsonlite, yaml; testthat for the tests). On Ubuntu 24.04 these install with
`apt-get install r-base-core r-cran-jsonlite r-cran-digest r-cran-yaml r-cran-renv r-cran-testthat`.

## What a researcher sees

Six steps, in the language of research, never an R console:

1. Checking the analysis environment
2. Checking that your data structure is ready
3. Confirming the approved analysis plan
4. Running the approved analysis
5. Checking outputs before saving
6. Saving the reproducibility record

When a step stops, the runner says what happened, why it matters, that
earlier work is safe, the next action, who can resolve it, and a separate
support reference. Raw R errors go only to `support/technical_log.txt`.
The full catalogue of messages is in `docs/researcher-messages.md`.

## What the runner proves and does not prove

It proves that a run used a confirmed plan, confirmed data structure,
recorded environment, recorded seed and recorded inputs, and that its
outputs are the recorded aggregates. Replaying the same record on the same
environment reproduces the same output checksums.

It does not prove that the analysis is scientifically appropriate. The only
analysis kind it contains today is `SYNTHETIC_DESCRIPTIVE_PLACEHOLDER`, which
computes descriptive aggregates on synthetic data and makes no claim. The
seven verified scripts from v0.1.0 have not been supplied; when they arrive
they are mapped in as new analysis kinds (see `baseline/v0.1.0/README.md`).

## Findings F01 to F07

| Finding | Where | Behaviour |
|---|---|---|
| F01 assay-value typing | `R/assay_typing.R` | Only approved missing and below-detection tokens and plain decimal numbers are accepted. Anything else fails with the offending forms and reasons. Nothing is coerced. |
| F02 participant/assay reconciliation | `R/reconcile.R` | Orphan assays, missing required assays, duplicate keys, duplicate participants and approved exceptions. Counts go to the researcher; identifier-level detail stays in the run's `local/` folder and is never returned. |
| F03 schema lock | `R/schema_lock.R` | Runs only when data are declared synthetic, `protocol_status` and `schema_status` are `LOCKED`, required authority records exist, governance is approved, the location is approved and no decision is unresolved. |
| F04 reproducible environment | `renv.lock`, `run.sh restore` | Explicit renv snapshot; the environment step blocks when installed runtime packages differ from the lockfile. Restore proof in `docs/evidence/r-runner`. |
| F05 complete analysis record | `R/manifest.R` | `manifest.json` (RunBundleManifest, contracts-v0.1 fields plus detail): R, platform, packages, lockfile hash, Git revision, protocol, dataset, config, environment and seed fingerprints, input and output checksums, permitted logs, stages, researcher status. Written for failed and blocked runs too. |
| F06 restricted-data guard | `R/guard.R`, `config/guard_rules.yml` | Staged-file, CI and explicit-path scans for identifiers, secrets and prohibited paths. `scripts/install_git_hooks.sh` installs it as a pre-commit hook. |
| F07 independent replay | `R/replay.R`, `run.sh replay` | Re-runs from a reference record and reports MATCH or MISMATCH with the differing fields. |
| Platform hand-off | `R/export_bundle.R`, `run.sh export` | Packages a record as the `POST /projects/:id/run-bundles` request; proven against the Codex API handler in the test suite when `CODEX_CORE_ROOT` is set. |

## Layout

```
run.sh                 one-command entry point
R/                     runner modules (messages, stages, checks, manifest, guard, replay)
scripts/               command-line entry points used by run.sh
config/                synthetic plans, the BLOCKED template for the real study, guard rules
data/synthetic/        committed synthetic fixtures (study_id column, SYN-#### identifiers only)
tests/                 testthat suite and negative fixtures
manifests/fixtures/    example RunBundleManifest and run status records
baseline/v0.1.0/       reserved for the original archive fingerprint
outputs/synthetic/runs/  analysis records (not committed)
docs/                  message catalogue, CI snippet
```

## An analysis record

```
<run_id>/
  run_status.json        machine + researcher status, stages, findings
  manifest.json          RunBundleManifest (F05)
  researcher_summary.md  the plain-language page
  outputs/               approved aggregate tables only
  checks/                data readiness and plan-gate summaries (counts only)
  support/technical_log.txt   support-only log
  local/                 identifier-level detail and quarantined files; never returned
```

## Limits in this cycle

- Real data are refused at step 1 regardless of the rest of the plan.
- The analysis stage is a placeholder until verified scripts are supplied.
- The manifest carries the `contracts-v0.1` fields verified against the
  Codex core at commit 0400cc8; what the protocol and dataset fingerprints
  hash is interim until Codex confirms (`docs/protocol/contract-alignment-request-runbundle.md`).
- The CRAN network restore of `renv.lock` could not be exercised in the
  build sandbox; the offline restore from the local cache was.
