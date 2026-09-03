# Seven-script map (template, to be filled from the actual files only)

Status: EMPTY. The v0.1.0 archive and its seven scripts have not been
received. No row below may be filled from a questionnaire answer, a voice
transcription or memory. Each row is completed only after the script file is
fingerprinted with `./run.sh fingerprint`.

One table per script. Copy the block seven times once the files exist.

## Script: (file name exactly as received)

| Field | Value | Evidence (path:line or fingerprint) |
|---|---|---|
| SHA-256 of the received file | | |
| Stage in the pipeline (what it does, in one sentence) | | |
| Inputs (files, columns, prior outputs) | | |
| Outputs (tables, figures, intermediate files) | | |
| Depends on (earlier script, manual step, external file) | | |
| Hidden absolute paths or machine-specific settings | | |
| Manual hand-offs (copy, rename, spreadsheet edit) | | |
| Configuration fields it needs (map to `analysis_plan` / `data`) | | |
| Statistical choices it hard-codes (each becomes a boundary decision) | | |
| Random or order-dependent steps (seed required) | | |
| Historical artifacts it produced (table/figure names in the thesis) | | |
| Claims and chapter sections that depend on it | | |
| Smallest safe edit needed to run under the runner | | |
| Anything scientifically unclear (escalate, do not resolve) | | |

## Mapping rules

- Preserve the original file unchanged; edits go in a v0.1.1 copy.
- A hard-coded statistical choice is recorded in
  `docs/protocol/statistical-boundary.md` as BLOCKED until confirmed, even if
  the script already "does it that way".
- Each script becomes one `stages.analysis.kind` value; the runner refuses
  kinds it does not contain, so nothing runs before it is mapped and tested.
- No script name, stage or variable may be invented to fill a gap.
