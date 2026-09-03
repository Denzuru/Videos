#!/usr/bin/env sh
# Project Firdous R runner: the one command.
#
#   ./run.sh                      run the synthetic analysis with the confirmed synthetic plan
#   ./run.sh run [options]        same, with options passed to scripts/run_pipeline.R
#   ./run.sh replay --reference PATH/manifest.json   replay and compare (F07)
#   ./run.sh test                 run the test suite
#   ./run.sh guard [--staged|--all|--paths ...]      restricted-data guard (F06)
#   ./run.sh restore              restore the recorded R environment with renv (F04)
#   ./run.sh fingerprint PATH     fingerprint the original v0.1.0 archive before remediation
#
# Everything runs from runner/r so renv activates the recorded environment.
set -eu
here="$(cd "$(dirname "$0")" && pwd)"
cd "$here"
cmd="${1:-run}"
[ $# -gt 0 ] && shift
case "$cmd" in
  run)         exec Rscript scripts/run_pipeline.R "$@" ;;
  replay)      exec Rscript scripts/replay.R "$@" ;;
  test)        exec Rscript scripts/run_tests.R "$@" ;;
  guard)       exec Rscript scripts/guard_restricted_data.R "${@:---staged}" ;;
  restore)     exec Rscript -e 'renv::restore(prompt = FALSE); renv::status()' ;;
  fingerprint) exec Rscript scripts/fingerprint_baseline.R "$@" ;;
  *) echo "Unknown command: $cmd"; sed -n '2,12p' "$0"; exit 2 ;;
esac
