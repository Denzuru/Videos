# Original pipeline v0.1.0: not yet supplied

Status on 2026-09-03: the v0.1.0 archive and the seven R scripts have not
been received by this lane. Nothing in this directory is a reconstruction,
and no script names, stages, variables or methods have been inferred.

When the archive arrives:

1. Place it here unchanged (or point at its location).
2. Run `./run.sh fingerprint <path>` before any other step. This writes
   `FINGERPRINT.json` with a SHA-256 for the archive and every member.
3. Record the fingerprint in `docs/source-manifest.yml` (Codex owns the file;
   raise the record through the contracts owner).
4. Create the v0.1.1 working copy elsewhere under `runner/r`; never edit here.
5. Map each script to a stage, inputs, outputs, configuration fields, hidden
   paths and assumptions in `docs/protocol/seven-script-map.md` (to be created
   from the actual files, not from questionnaire answers).

The restricted-data guard treats any tabular file placed in this directory as
prohibited unless it is under an approved synthetic fixture path.
