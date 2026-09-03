# R runner evidence, cycle 1 (2026-09-03)

Produced by the Brother C / Claude Code lane. Everything here is synthetic.
Reviewers should replay rather than trust this page.

## Contents

| File | What it is |
|---|---|
| `test-output.txt` | Full console output of `./run.sh test`: 64 test blocks, 696 expectations, 0 failures (re-run after the security-review fixes, with CODEX_CORE_ROOT set so the Codex assertion and ingestion tests ran) |
| `commands-and-output.md` | Exact commands and console output for five runs and one replay (regenerated after contract alignment) |
| `guard-staged-output.txt` | Latest staged guard run: clean (the first lane commit scanned 114 files clean) |
| `fresh-clone-replay-offline.txt` | `run.sh verify-clone` from a temporary clone with CRAN unreachable: renv bootstrap fails, the runner falls back to the system library, and tests, run, replay, export and guard all pass (library_mode = system-fallback) |
| `renv-restore-offline-log.txt` | Restore of the lockfile into an empty project library from the local renv cache |
| `runs/ev-locked-0001/` | Confirmed synthetic plan: SUCCEEDED, full analysis record |
| `runs/ev-replay-0001/` | Replay of the above: verdict MATCH, identical output checksums |
| `runs/ev-locked-seed2/` | Same plan, seed 1: SUCCEEDED (descriptive placeholder is seed-independent; recorded) |
| `runs/ev-draft-0001/` | Draft plan with two BLOCKED decisions: BLOCKED at step 3, data step still completes |
| `runs/ev-malformed-0001/` | Malformed assay values: FAILED at step 2, seven malformed forms and one out-of-range value named |
| `runs/ev-recon-0001/` | Orphan, missing and duplicate identifiers: FAILED at step 2, three findings, identifier detail kept local |
| `runs/ev-template-0001/` | The real-study template: BLOCKED at step 1 (synthetic only), no data file opened |

`local/` folders are deliberately excluded from this bundle.

## How to replay

```sh
cd runner/r
./run.sh test
./run.sh run --run-id replay-check --out /tmp/firdous
./run.sh replay --reference ../../docs/evidence/r-runner/2026-09-03-cycle-1/runs/ev-locked-0001/manifest.json --out /tmp/firdous
./run.sh guard --all
```

The replay against `ev-locked-0001` will report MATCH when outputs are
identical; `code.revision` will differ once the lane is committed and is
reported as INFO, not as a mismatch.

## Security

`docs/reviews/2026-09-03-r-runner-security-review-brother-c.md`: two Medium
findings identified and fixed on the branch (token leak into the record; guard
skipping uninspectable files), with regression tests.

## Cross-lane

The Codex core review with its probe output is in `docs/reviews/`. All four
committed manifest fixtures pass Codex's `assertRunBundleManifest` at commit 0400cc8, and a
real exported record is ingested (201) by their API handler in `test-export-bundle.R`.

## Limits

- The CRAN network path of `renv::restore()` was not exercised (proxy denies
  CRAN in the build sandbox). The offline restore from cache was, and a fresh
  clone replays offline in system-fallback mode with the lockfile still enforced.
- The original v0.1.0 archive was not supplied; no baseline fingerprint exists yet.
