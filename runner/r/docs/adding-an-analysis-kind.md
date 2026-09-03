# Adding an analysis kind (how the seven scripts plug in)

An analysis kind is one verified, fingerprinted analysis step. The runner
executes registered kinds only; it never improvises. Each of the seven
v0.1.0 scripts becomes one kind once it has been received, fingerprinted and
mapped in `docs/protocol/seven-script-map-template.md`.

## Steps

1. Fingerprint the original script (`./run.sh fingerprint`), never edit it.
2. Fill the script's row in the seven-script map from the file itself.
3. Record every hard-coded statistical choice as a BLOCKED decision in
   `docs/protocol/statistical-boundary.md` and add it to
   `config/firdous_template_BLOCKED.yml`; the gate then requires it.
4. Write the v0.1.1 copy under `R/kinds/<id>.R` as a function `run(ctx)` that
   reads only `ctx$data`, `ctx$cfg`, `ctx$seed`, writes only into
   `file.path(ctx$run_dir, "outputs")`, and returns a list with `outputs_written`.
   No absolute paths, no manual hand-offs, no participant identifiers in outputs.
5. Register it:

```r
register_analysis_kind(
  id = "<UPPER_SNAKE_ID>",
  label = "<what the researcher sees in the record>",
  run = run_<id>,
  declared_outputs = c("<file>.csv", ...),        # must equal the plan's allow-list
  requires_participant_columns = c("<column>", ...),
  scientific_claim = "<none | descriptive | as approved in the research plan>",
  note = "<one sentence bounding what this step does and does not claim>")
```

6. Add `R/kinds/<id>.R` to `source_runner()` and write three tests: a
   synthetic SUCCEEDED run, a determinism replay, and one failure path.
7. Regenerate the message catalogue and the evidence bundle.

## What the runner enforces for every kind

- The plan's `outputs.allow_list` must equal the kind's `declared_outputs`;
  any difference blocks the run before anything is written.
- Required participant columns must be present.
- The seed is set before `run(ctx)` and recorded.
- Outputs pass the output guard (allow-list, no identifiers, minimum cell size)
  and the record-stage redaction before the record is written.
- The kind id and its `scientific_claim` appear in the analysis record and in
  every result proposal sent to the platform.
