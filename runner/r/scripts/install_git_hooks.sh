#!/usr/bin/env sh
# Installs the restricted-data guard as a pre-commit hook for this clone.
set -eu
here="$(cd "$(dirname "$0")/.." && pwd)"
repo="$(git -C "$here" rev-parse --show-toplevel)"
hook="$repo/.git/hooks/pre-commit"
cat > "$hook" <<HOOK
#!/usr/bin/env sh
# Project Firdous restricted-data guard (installed by runner/r/scripts/install_git_hooks.sh)
exec Rscript "$here/scripts/guard_restricted_data.R" --staged
HOOK
chmod +x "$hook"
echo "Pre-commit guard installed at $hook"
