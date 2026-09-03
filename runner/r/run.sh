#!/usr/bin/env sh
# Project Firdous R runner: the one command.
#
#   ./run.sh                      run the synthetic analysis with the confirmed synthetic plan
#   ./run.sh run [options]        same, with options passed to scripts/run_pipeline.R
#   ./run.sh replay --reference PATH/manifest.json   replay and compare (F07)
#   ./run.sh test                 run the test suite
#   ./run.sh guard [--staged|--all|--paths ...]      restricted-data guard (F06)
#   ./run.sh export RUN_DIR       write RUN_DIR/bundle_request.json, the platform ingestion request
#   ./run.sh restore              restore the recorded R environment with renv (F04)
#   ./run.sh verify-clone [REPO] [REF]   clean-clone replay: tests, run, replay, export, guard
#   ./run.sh fingerprint PATH     fingerprint the original v0.1.0 archive before remediation
#
# Everything runs from runner/r so renv activates the recorded environment.
set -eu
here="$(cd "$(dirname "$0")" && pwd)"
cd "$here"
# A UTF-8 locale lets R handle file names with accented characters (data files
# named in Afrikaans or French, for example). Only set when nothing is set.
if [ -z "${LC_ALL:-}" ] && [ -z "${LANG:-}" ]; then
  if locale -a 2>/dev/null | grep -qi '^C\.utf-\?8$'; then export LC_ALL=C.UTF-8 LANG=C.UTF-8; fi
fi
cmd="${1:-run}"
[ $# -gt 0 ] && shift
case "$cmd" in
  run)         exec Rscript scripts/run_pipeline.R "$@" ;;
  replay)      exec Rscript scripts/replay.R "$@" ;;
  test)        exec Rscript scripts/run_tests.R "$@" ;;
  guard)       exec Rscript scripts/guard_restricted_data.R "${@:---staged}" ;;
  export)      exec Rscript scripts/export_bundle.R "$@" ;;
  restore)     exec Rscript -e 'renv::restore(prompt = FALSE); renv::status()' ;;
  verify-clone) exec sh scripts/verify_fresh_clone.sh "$@" ;;
  fingerprint) exec Rscript scripts/fingerprint_baseline.R "$@" ;;
  *) echo "Unknown command: $cmd"; sed -n '2,14p' "$0"; exit 2 ;;
esac
