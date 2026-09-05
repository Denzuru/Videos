#!/usr/bin/env bash
#
# Revideo builds its own encode command and lets ffmpeg fall back to CRF 23,
# which softens pencil line work. This wrapper injects a higher quality target
# into the one call that encodes the visuals (the image2pipe input) and passes
# every other call - audio, probing, concatenation - straight through.
#
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REAL_FFMPEG="${REVIDEO_REAL_FFMPEG:-$here/../node_modules/@ffmpeg-installer/linux-x64/ffmpeg}"

args=("$@")
inject=0
for a in "${args[@]}"; do
  if [ "$a" = "image2pipe" ]; then
    inject=1
    break
  fi
done

if [ "$inject" = "1" ]; then
  last=$(( ${#args[@]} - 1 ))
  out="${args[$last]}"
  unset 'args[last]'
  exec "$REAL_FFMPEG" "${args[@]}" \
    -c:v libx264 -crf 16 -preset medium -tune animation -pix_fmt yuv420p "$out"
fi

exec "$REAL_FFMPEG" "${args[@]}"
