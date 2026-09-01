#!/usr/bin/env bash
#
# Revideo does not expose any x264 quality settings: its exporter builds the
# encode command itself and lets ffmpeg fall back to CRF 23. On flat cartoon
# art that is not enough, and you get ringing around every hard edge, which
# reads as a soft "wet ink" halo on the outlined text.
#
# This wrapper injects higher-quality settings into the one call that encodes
# the visuals (the image2pipe input) and passes every other call - audio
# processing, probing, concatenation - through untouched.
#
set -euo pipefail

REAL_FFMPEG="${REVIDEO_REAL_FFMPEG:-/usr/bin/ffmpeg}"

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
  # -tune animation is built for exactly this kind of source: large flat
  # regions and hard edges, where the default deblocking softens line work.
  exec "$REAL_FFMPEG" "${args[@]}" \
    -c:v libx264 -crf 15 -preset medium -tune animation "$out"
fi

exec "$REAL_FFMPEG" "${args[@]}"
