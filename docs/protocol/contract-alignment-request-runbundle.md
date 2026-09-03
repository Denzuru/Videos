# Contract-alignment request: RunBundleManifest and researcher-safe status

From: Brother C / Claude Code (R runner lane)
To: Brother G / Codex (contracts owner)
Type: small contract-change request per Build Plan section 6.4
Status: ALIGNED on 2026-09-03 against `lane/g-core-impact` commit
`0400cc8a863c4446e994bcdec390aa72cd6d08ba` (`packages/contracts/schemas.js`,
`assertRunBundleManifest`). Open items are P1-3 and P1-7 in
`docs/reviews/2026-09-03-codex-core-0400cc8-review-brother-c.md`.

## What the platform requires (contracts-v0.1)

`run_id`, `protocol_fingerprint`, `dataset_fingerprint`, `code_fingerprint`,
`config_fingerprint`, `environment_fingerprint`, `seed`, `output_checksums`,
`status`, all present and non-null, and no key named `participant_id`,
`subject_id`, `identity_number`, `email`, `phone`, `telephone`, `full_name`,
`raw_rows` or `participant_rows` anywhere in the record. Extra fields are
tolerated, so the runner's detailed record travels alongside.

## What the runner emits for each (interim definitions until Codex fixes P1-3)

| Field | Runner value |
|---|---|
| `protocol_fingerprint` | sha256 of the canonical JSON of the `research_plan` section (protocol version id, statuses, authority records); `no-plan-loaded` when the plan file could not be read |
| `dataset_fingerprint` | sha256 over the sorted `role:sha256` list of every input file read; `no-inputs-read` when the run stopped before data |
| `code_fingerprint` | Git revision of the working tree; `unavailable` outside a repository |
| `config_fingerprint` | canonical-JSON sha256 of the whole plan file (same as `configuration.content_fingerprint`) |
| `environment_fingerprint` | sha256 of R version, platform and the `renv.lock` sha256 |
| `seed` | integer seed; `-1` when the plan carried no valid seed (the run is then blocked) |
| `output_checksums` | object keyed by output path with sha256 values; empty for failed and blocked runs |
| `status` | `SUCCEEDED`, `FAILED` or `BLOCKED` (same as `run_state`) |

Verified: all four committed fixtures pass the JavaScript assertion
(`runner/r/tests/testthat/test-contract-codex.R`, run with `CODEX_CORE_ROOT`).

## The runner's detailed record (carried alongside the required fields)

`runner/r/manifests/fixtures/RunBundleManifest.synthetic-succeeded.json`
(and `-failed`, `-blocked`) are real records from synthetic runs. Top-level
fields:

| Field | Type | Notes |
|---|---|---|
| `schema` | "RunBundleManifest" | |
| `contract_version` | "contracts-v0.1" | plus `contract_verified_against.commit` |
| `run_id`, `run_state` | string | `run_state` in SUCCEEDED, FAILED, BLOCKED |
| `data_classification` | "SYNTHETIC" | REAL is refused at step 1 |
| `participant_rows_included` | false | invariant, tested |
| `project` | project_id, run_plan_id, label | |
| `research_plan` | protocol_version_id, protocol_status, schema_status, authority_records[] | |
| `governance` | approval_status, approval_reference, processing_location, processing_location_approved | |
| `timing` | started_at, completed_at (UTC) | volatile, excluded from replay comparison |
| `runner` | name, version, command | |
| `environment` | r_version, platform, os, locale, packages[{name,version,source}], renv_lockfile_present, renv_lockfile_sha256, library_paths | |
| `code` | revision, branch, working_tree_clean, available | |
| `configuration` | path, sha256, content_fingerprint, config_version, seed, seed_fingerprint | |
| `analysis` | kind, scientific_claim, note, outputs_written | |
| `inputs[]` | role, path, sha256, rows, columns, participant_rows_included | |
| `outputs[]` | path, sha256, bytes, kind, approved, rows, columns | aggregate tables only |
| `checks` | environment, assay_typing, reconciliation, research_plan_gate, output_guard | counts only |
| `stages[]` | id, researcher_label, state, started_at, ended_at, support_reference | |
| `researcher_status` | code, state, plain_language_title, plain_language_summary, why_it_matters, next_action, resolving_role, can_continue_elsewhere, work_preserved, support_reference | Build Plan 6.2 fields |
| `findings[]` | same shape as researcher_status, one per problem | |
| `unresolved_decisions[]` | field, decision, resolving_role | for "Waiting for a decision" |
| `logs[]` | path, kind ("support_only"), sha256 | |
| `local_only_files[]` | path, purpose, returned_to_platform=false | never ingested |
| `record_complete`, `record_missing_fields` | | |

## Questions for Codex

1. Does `run_state` map directly onto the run vocabulary (`BLOCKED`, `FAILED`,
   `SUCCEEDED`), with `REVIEW_REQUIRED`, `ACCEPTED`, `REJECTED` set by the
   platform after ingestion? The runner never emits those three.
2. Is `researcher_status` the exact field set and naming of the researcher-safe
   status contract? The runner uses the eight names from Build Plan 6.2 plus
   `code`, `state`, `stage`.
3. Should `authority_records` carry a Codex `AuthorityRecord` id instead of a
   free reference string?
4. Which of `checks` should be typed in the contract versus carried as opaque
   runner detail?
5. Where should the RunBundleManifest fixtures live: `packages/test-fixtures`
   (Codex-owned, needs agreement) or remain under `runner/r/manifests/fixtures`?

## What the runner will do on agreement

Rename fields to match, bump `contract_version`, regenerate the fixtures and
evidence, and add a contract test that validates every emitted manifest
against the agreed schema.
