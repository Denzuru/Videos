# R runner evidence, cycle 1 (2026-09-03)

Produced by the Brother C / Claude Code lane. Everything here is synthetic.
Reviewers should replay rather than trust this page.

## Contents

| File | What it is |
|---|---|
| `test-output.txt` | Full console output of `./run.sh test`: 45 test blocks, 569 expectations, 0 failures (re-run after cycle-2 hardening) |
| `commands-and-output.md` | Exact commands and console output for five runs and one replay |
| `guard-staged-output.txt` | Guard run over the 114 staged files of the first lane commit: clean |
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

## Limits

- The CRAN network path of `renv::restore()` was not exercised (proxy denies
  CRAN in the build sandbox). The offline restore from cache was.
- Codex's contracts were not available in this repository, so the manifest is
  a draft against the Build Plan field list.
- The original v0.1.0 archive was not supplied; no baseline fingerprint exists yet.
