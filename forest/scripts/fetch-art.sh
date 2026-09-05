#!/usr/bin/env bash
#
# Downloads the five illustrations from OpenArt into public/art with the names
# the shot list expects. Run this anywhere cdn.openart.ai is reachable, then
# `npm run render`. The generation ids are kept in public/art/SOURCES.md.
#
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/art

base="https://cdn.openart.ai/openart-ai/production/2026-09/create-image/xgKMCeGFJNeMThND8gh0"
declare -A art=(
  [01-redwoods]="021788622532192e0fa5d59a7b50e9f748f37815b909e28289c44_0_1788622544024_56c50d86.jpeg"
  [02-moonlit-deer]="02178862270217451d9d16403af386b151f4b49e6685515d0eff5_0_1788622710197_5c9de1c3.jpeg"
  [03-summit-stars]="0217886227062849e96f8c80ac47960a454270e9930f954ec8489_0_1788622713738_0adc0dee.jpeg"
  [04-mist-walker]="021788622719762a4a9e4d164f3c176730993b0b2e8dd9dce0bdd_0_1788622726960_3b77c1c7.jpeg"
  [05-rain-forest]="02178862272377499a3f43520201fc0164769d66e52699fdf1f8c_0_1788622732077_e6b18092.jpeg"
)
for name in "${!art[@]}"; do
  echo "fetching $name"
  curl -fsSL -o "public/art/$name.jpg" "$base/${art[$name]}"
done
echo "done: $(ls public/art/*.jpg | wc -l) images in public/art"
