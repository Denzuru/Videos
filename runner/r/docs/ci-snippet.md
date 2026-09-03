# CI job for the R runner (for OpenClaw to place under .github/workflows)

The R lane does not edit `.github/workflows`. This is the job the lane
expects; it runs the guard, the tests, a synthetic run and a replay.

```yaml
r-runner:
  runs-on: ubuntu-24.04
  steps:
    - uses: actions/checkout@v4
    - name: Install R and recorded packages (Ubuntu 24.04 archive)
      run: |
        sudo apt-get update
        sudo DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
          r-base-core r-cran-jsonlite r-cran-digest r-cran-yaml r-cran-renv r-cran-testthat
    - name: Restricted-data and secret guard
      run: cd runner/r && Rscript scripts/guard_restricted_data.R --all --report guard-report.json
    - name: Environment matches lockfile
      run: cd runner/r && Rscript -e 'source("R/utils.R"); source_runner(getwd()); m <- lockfile_mismatches(getwd()); if (length(m)) stop(paste(m, collapse="; "))'
    - name: Tests
      run: cd runner/r && ./run.sh test
    - name: Synthetic run and replay
      run: |
        cd runner/r
        ./run.sh run --run-id ci-$GITHUB_RUN_ID --out /tmp/firdous-runs
        ./run.sh replay --reference /tmp/firdous-runs/ci-$GITHUB_RUN_ID/manifest.json --out /tmp/firdous-runs
    - uses: actions/upload-artifact@v4
      with:
        name: r-runner-evidence
        path: |
          /tmp/firdous-runs/**/manifest.json
          /tmp/firdous-runs/**/run_status.json
          /tmp/firdous-runs/**/replay_report.json
          runner/r/guard-report.json
```

Notes: the `local/` folder of a run must not be uploaded as an artifact.
Ubuntu 24.04 ships R 4.3.3 and the exact package versions in `renv.lock`;
if the runner image changes, `renv::restore()` from CRAN is the fallback.
