# R runner lane decisions (Brother C / Claude Code)

Engineering decisions made inside the lane. None is scientific. Each can be
revisited by the convergence operator or Brother D.

| ID | Decision | Reason | Status |
|---|---|---|---|
| DEC-R-001 | Work is committed on `claude/firdous-r-runner-mhwc2j`, not `lane/c-r-runner` | The execution environment permits pushes only to its designated branch. The content is the `lane/c-r-runner` candidate; OpenClaw may create `lane/c-r-runner` from this branch at convergence. | Open for convergence |
| DEC-R-002 | R 4.3.3 and packages from the Ubuntu 24.04 archive (`r-base-core`, `r-cran-*`) | CRAN is unreachable from the build sandbox; Ubuntu's archive is reachable and ships pinned versions. The lockfile records the resulting versions exactly. | Adopted |
| DEC-R-003 | Explicit renv snapshot limited to runtime packages (digest, jsonlite, yaml) | Small, inspectable environment; testthat is a test-time dependency only. The environment step enforces these three. | Adopted |
| DEC-R-004 | Manifest emits the nine `contracts-v0.1` fields at top level and records the Codex commit it was verified against | Aligned 2026-09-03 against `0400cc8`; the detailed record travels alongside because the contract tolerates extra fields. Fingerprint definitions are interim until Codex answers P1-3. | Aligned |
| DEC-R-005 | Single analysis kind `SYNTHETIC_DESCRIPTIVE_PLACEHOLDER` | The seven scripts have not been supplied. The placeholder computes descriptive aggregates only, so gates, records and replay can be proven without inventing a method. | Adopted until scripts arrive |
| DEC-R-006 | Identifier-level detail from F02 stays in the run's `local/` folder | The custodian needs to know which rows to fix; the platform and logs must never receive participant rows. `local/` is declared in the manifest as not returned. | Adopted |
| DEC-R-007 | Environment mismatch with the lockfile blocks the run (`environment.enforce_lockfile: true`) | Fail closed on reproducibility. Can be relaxed per plan, never silently. | Adopted |
| DEC-R-008 | Guard scope in `--all` mode is `runner/`, `packages/test-fixtures/`, `docs/`; `--staged` scans every staged file | Other paths belong to other lanes; the staged mode still protects the whole repository at commit time. | Adopted |
| DEC-R-009 | No files written under `packages/test-fixtures` | Requires agreement with the contracts owner. Fixtures live in `runner/r/manifests/fixtures` until then. | Open, needs Codex |
| DEC-R-010 | Real data refused at step 1 by classification, before any file is opened | Defence in depth ahead of the real-data readiness gate (Build Plan 12.5). | Adopted |
| DEC-R-012 | The staged guard scans the working-tree content of staged paths | Matches common pre-commit practice; a partially staged file is scanned in full, which is the safer direction. | Adopted |
| DEC-R-013 | Data-structure and run-setting decisions (`data`, `stages`, `outputs`) are checked for unresolved values before any file is opened | A BLOCKED value representation or output list means the checks would be guessing; the researcher sees "decisions are needed" with the custodian named rather than a confusing file error. | Adopted |
| DEC-R-014 | Synthetic fixtures name the identifier column `study_id`; the column name stays configurable (`data.participant_id_column`) | Codex's repository guard treats a `participant_id` column header in any CSV as a real-data marker and rejected all six fixtures. `study_id` passes both guards without weakening either, and reads as the pseudonymous study identifier it is. | Adopted |
| DEC-R-015 | Failed and blocked records still carry non-null contract fields (sentinel strings, seed -1) | The platform requires every field present; a failure record must remain ingestible so the researcher can see why a run stopped. Recommendation P1-1 to Codex asks that results be blocked on such records. | Adopted |
| DEC-R-016 | `firdous_failure` conditions inherit from `error`; handlers test the class explicitly | A plain `tryCatch(error=)` or testthat `expect_error` otherwise lets a runner failure escape as a raw halt. Found while adding the export adapter. | Adopted |
| DEC-R-017 | Run-bundle export adapter (`run.sh export`) emits exactly the Codex ingestion request `{project_id, run_plan_id, manifest}` and refuses records lacking plan identifiers or contract fields | Convergence step 3 (runner adapter and ingestion) can be exercised end to end now; the test suite posts a real record through the Codex handler when `CODEX_CORE_ROOT` is set. | Adopted |
| DEC-R-018 | Malformed value tokens are masked at source; the record stage redacts identifier-shaped text before writing; export scans values | Security self-review finding 1: raw cell content had a path into the returned record. Only short numeric-shaped tokens are ever echoed. | Adopted |
| DEC-R-019 | The guard fails closed: unreadable, UTF-16, binary-behind-text-extension and oversize text files are `FILE_NOT_INSPECTED` findings; git paths are read NUL-separated | Security self-review finding 2: quoted names and UTF-16 files were silently skipped while the guard reported clean. | Adopted |
| DEC-R-020 | `run.sh` selects `C.UTF-8` when no locale is set | R cannot open accented file names under the C locale; the manifest records the locale used. | Adopted |
| DEC-R-021 | Analysis steps are registered kinds; the plan's output allow-list must equal the kind's declared outputs | Prepares the seam for the seven scripts: each becomes one registration with declared outputs and required columns, and cannot be asked for, or write, anything undeclared. Nothing is registered for them until the files exist. | Adopted |
| DEC-R-022 | renv activation falls back to the system library when bootstrap fails; the lockfile check still gates the run; the mode is recorded in the manifest | A fresh clone with CRAN unreachable stopped R with a raw error before the runner started. The fallback keeps the researcher-safe contract and fail-closed reproducibility (versions must match) while removing the network dependency at start-up. Verified by `run.sh verify-clone` offline. | Adopted |
| DEC-R-011 | Descriptive placeholder output is identical across seeds | It contains no stochastic step. The seed is still set and recorded so later stochastic methods are reproducible. | Documented limitation |

## Requests to other lanes

- Codex: answer P1-3 (what the protocol and dataset fingerprints hash) and
  P1-7 (runner configuration fingerprint on `RunPlan`); fix P1-1, P1-2, P1-4
  before first convergence. See `docs/reviews/2026-09-03-codex-core-0400cc8-review-brother-c.md`.
- OpenClaw: adopt `runner/r/docs/ci-snippet.md`; install the pre-commit
  guard in the integration clone; perform the clean replay with network
  access to exercise `renv::restore()` from CRAN, which the sandbox could not.
