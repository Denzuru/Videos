# R runner lane decisions (Brother C / Claude Code)

Engineering decisions made inside the lane. None is scientific. Each can be
revisited by the convergence operator or Brother D.

| ID | Decision | Reason | Status |
|---|---|---|---|
| DEC-R-001 | Work is committed on `claude/firdous-r-runner-mhwc2j`, not `lane/c-r-runner` | The execution environment permits pushes only to its designated branch. The content is the `lane/c-r-runner` candidate; OpenClaw may create `lane/c-r-runner` from this branch at convergence. | Open for convergence |
| DEC-R-002 | R 4.3.3 and packages from the Ubuntu 24.04 archive (`r-base-core`, `r-cran-*`) | CRAN is unreachable from the build sandbox; Ubuntu's archive is reachable and ships pinned versions. The lockfile records the resulting versions exactly. | Adopted |
| DEC-R-003 | Explicit renv snapshot limited to runtime packages (digest, jsonlite, yaml) | Small, inspectable environment; testthat is a test-time dependency only. The environment step enforces these three. | Adopted |
| DEC-R-004 | Manifest carries `contract_version: 0.1.0-r-runner-draft` | Codex's `RunBundleManifest` schema was not visible to this lane (its branch is not in this repository). Field names follow the Build Plan section 6 and 8 lists. A contract-alignment request goes to Codex at first review. | Open, needs Codex |
| DEC-R-005 | Single analysis kind `SYNTHETIC_DESCRIPTIVE_PLACEHOLDER` | The seven scripts have not been supplied. The placeholder computes descriptive aggregates only, so gates, records and replay can be proven without inventing a method. | Adopted until scripts arrive |
| DEC-R-006 | Identifier-level detail from F02 stays in the run's `local/` folder | The custodian needs to know which rows to fix; the platform and logs must never receive participant rows. `local/` is declared in the manifest as not returned. | Adopted |
| DEC-R-007 | Environment mismatch with the lockfile blocks the run (`environment.enforce_lockfile: true`) | Fail closed on reproducibility. Can be relaxed per plan, never silently. | Adopted |
| DEC-R-008 | Guard scope in `--all` mode is `runner/`, `packages/test-fixtures/`, `docs/`; `--staged` scans every staged file | Other paths belong to other lanes; the staged mode still protects the whole repository at commit time. | Adopted |
| DEC-R-009 | No files written under `packages/test-fixtures` | Requires agreement with the contracts owner. Fixtures live in `runner/r/manifests/fixtures` until then. | Open, needs Codex |
| DEC-R-010 | Real data refused at step 1 by classification, before any file is opened | Defence in depth ahead of the real-data readiness gate (Build Plan 12.5). | Adopted |
| DEC-R-011 | Descriptive placeholder output is identical across seeds | It contains no stochastic step. The seed is still set and recorded so later stochastic methods are reproducible. | Documented limitation |

## Requests to other lanes

- Codex: share the `RunBundleManifest` and researcher-safe status schemas so
  the manifest can drop the `-draft` suffix; confirm whether `run_state`
  values `BLOCKED`, `FAILED`, `SUCCEEDED` map directly to the run vocabulary.
- OpenClaw: adopt `runner/r/docs/ci-snippet.md`; install the pre-commit
  guard in the integration clone; perform the clean replay with network
  access to exercise `renv::restore()` from CRAN, which the sandbox could not.
