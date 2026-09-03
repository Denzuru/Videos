#!/usr/bin/env sh
# Clean-clone replay (F07 / OpenClaw independent replay).
# Clones the repository at the given ref into a temporary directory, runs the
# test suite, one synthetic run, a replay against that run and the guard, and
# prints a verdict. Nothing in the working clone is used.
#   scripts/verify_fresh_clone.sh [REPO_URL_OR_PATH] [REF]
set -eu
repo="${1:-$(git -C "$(dirname "$0")/../../.." rev-parse --show-toplevel)}"
ref="${2:-$(git -C "$(dirname "$0")" rev-parse --abbrev-ref HEAD)}"
work="$(mktemp -d)"
echo "Fresh clone of $repo at $ref into $work"
git clone -q --branch "$ref" "$repo" "$work/clone"
cd "$work/clone/runner/r"
echo "--- library mode probe ---"
Rscript -e 'cat("library mode:", Sys.getenv("FIRDOUS_LIBRARY_MODE"), "\n")'
status=0
echo "--- tests ---";  ./run.sh test || status=1
echo "--- run ---";    ./run.sh run --run-id fresh-run --out "$work/runs" --quiet || status=1
echo "--- replay ---"; ./run.sh replay --reference "$work/runs/fresh-run/manifest.json" --run-id fresh-replay --out "$work/runs" --quiet || status=1
echo "--- export ---"; ./run.sh export "$work/runs/fresh-run" || status=1
echo "--- guard ---";  ./run.sh guard --all || status=1
if [ "$status" -eq 0 ]; then echo "FRESH CLONE REPLAY: PASS ($work)"; else echo "FRESH CLONE REPLAY: FAIL ($work)"; fi
exit "$status"
