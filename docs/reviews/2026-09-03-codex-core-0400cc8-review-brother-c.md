# Review: Codex contracts and domain core candidate

| | |
|---|---|
| Candidate | branch `lane/g-core-impact`, commit `0400cc8a863c4446e994bcdec390aa72cd6d08ba` (bundle `firdouscore0400cc8.bundle`, sha256 `97495a64014801dde48397f43f60c5131961d31dadc148765bf8b0ca19b44e68`) |
| Reviewer | Brother C / Claude Code (R runner lane), first reviewer for research and runner semantics |
| Date | 2026-09-03 |
| Scope | `packages/contracts`, `packages/domain`, `packages/impact-engine`, `packages/lineage`, `packages/reporting`, `packages/database/store.js`, `apps/api`, `scripts/verify-no-restricted-data.js`, migrations (static), all tests |
| Verdict | **REVISE** (seven P1 findings, no P0). The candidate is sound in its core invariants and its tests replay; the P1 items are seam gaps that would let a failed or mismatched analysis record enter the platform unnoticed, plus two researcher-language leaks. Each has a small, named fix. |

## Tests actually run

```text
$ git bundle verify firdouscore0400cc8.bundle          -> okay, complete history
$ node --test $(find tests -name '*.test.js' -print)   -> 42 passed, 0 failed
$ node scripts/verify-no-restricted-data.js            -> passed
$ node scripts/verify-migrations.js                    -> passed for 4 migrations and 13 tables
$ node probe.mjs   (reviewer probes: 2026-09-03-codex-core-0400cc8-probes.mjs, output in 2026-09-03-codex-core-0400cc8-probe-output.txt; Codex can run the same file against its fixes)
$ node scripts/verify-no-restricted-data.js run from the R runner repository root
$ cd runner/r && CODEX_CORE_ROOT=<checkout> ./run.sh test  -> 49 blocks, 609 expectations, 0 failed
```

The checkpoint's validation claim (42 passed, both verify scripts passing) replays exactly in an independent container.

## Accepted evidence (what is right)

- Explanation contract is enforced in code (`assertResearcherExplanation`) and every blocking API route returns it; a project-mismatched change returns no raw `error` field (test proves it).
- Protocol `LOCKED` requires a non-empty authority list; `lockResearchPlan` requires every required decision `RESOLVED` with a disposition, and a human actor.
- Run approval requires `authority_id` and `processing_location_approved` (`assertRunPlan`); `RUNNING` is unreachable without `APPROVED`.
- Store is append-only, rejects duplicate ids, freezes records and audits every append; earlier versions remain reconstructable (adversarial tests).
- Results and findings are review-first: `CURRENT` cannot be asserted at creation; read models translate currentness into research language and tests assert no raw enum in those responses.
- Impact rules cover all ten change types in the Build Plan; unaffected items are returned explicitly; governance, protocol and location changes carry `execution_state: BLOCKED`.
- Supervisor packet is role-gated; cross-project access fails closed with `work_preserved: true`.
- Restricted-data rejection produces a plain-language privacy explanation, never a stack trace.
- RLS is enabled on all 13 tables with no policies yet, which fails closed by construction; this is declared, not hidden.

## P0 findings

None.

## P1 findings

| ID | Finding | Evidence | Proposed fix |
|---|---|---|---|
| P1-1 | `ingestRunBundle` accepts a manifest whose `status` is `FAILED`, `BLOCKED` or any string, stores it like a successful record, and `recordResult` then attaches a result to it. A failed analysis can therefore acquire a reviewable result. | PROBE1: FAILED ingest 201, result attached 201, results stored 1; PROBE1b: BLOCKED 201, `NOT_A_STATE` 201 | `assertEnum(manifest.status, RunState)`; store `run_state` on the bundle; `recordResult` rejects unless the bundle status is `SUCCEEDED` (or `REVIEW_REQUIRED`), with an explanation "This analysis did not finish, so no result can be recorded from it". Failed and blocked records should still be ingestible so the platform can show why the run stopped. |
| P1-2 | `ingestRunBundle` and `requestRunById` never call `assertRunPlan`; a stored plan with `state: APPROVED` but no `authority_id` or location approval passes both. | PROBE2: ingest 201, run-request `allowed: true` | Call `assertRunPlan(plan)` in both paths, and in `runPlanGate`. |
| P1-3 | No cross-check between the manifest and the approved plan: foreign `dataset_fingerprint` and `protocol_fingerprint` are accepted. The contract does not say what these fingerprints hash, so no check is possible yet. | PROBE3: 201 | Define in `contracts-v0.1.md`: `protocol_fingerprint` = fingerprint of the `ProtocolVersion` the plan references; `dataset_fingerprint` = fingerprint of the `DatasetVersion`; `config_fingerprint` = the runner configuration fingerprint recorded on the `RunPlan`. Then reject a manifest whose fingerprints differ from the plan's. The R runner now emits all three (see alignment below) and can adopt whichever definitions Codex fixes. |
| P1-4 | `researchToday` returns `analysis_status: activeRun.state`, a raw run-state enum (`PENDING_APPROVAL`, `RUNNING`), on the home screen seam. Standard section 5 forbids raw enums on the primary path. | PROBE5: `"PENDING_APPROVAL"` | Translate through a map like the one in `researcher-evidence.js` (for example "Waiting for approval", "Running", "Needs review"). |
| P1-5 | `traceClaim` returns a fixed sentence claiming the claim is linked to "its approved research plan, dataset, method, code, settings and analysis record" regardless of what the graph actually contains, and gives no currentness. Standard 8.1 requires the result view to say whether it is up to date and not to overstate. | `packages/lineage/trace.js` line 6; synthetic graph has no ProtocolVersion, CodeVersion or EnvironmentVersion nodes | Build the summary from the upstream node types actually found; include `effective_currentness` of the claim and of each upstream item. |
| P1-6 | Restricted-data protection in the contract is key-name only. Identifier values (`orphan_ids: ["SYN-0001"]`, free text naming a participant) pass. | PROBE7: accepted | Add a value-level scan for the project's identifier pattern (the runner can supply `participant_id_pattern` on the RunPlan) and require an explicit `participant_rows_included: false`. Extend `restrictedKeys` with `participant_ids`, `subject_ids`, `rows`, `records`. |
| P1-7 | Runner feasibility: `RunPlan` carries `protocol_id`, `dataset_version_id`, `state`, `authority_id`, `processing_location_approved` only. The runner needs the value representations, panel, seed, permitted outputs and processing location to be bound to the plan, otherwise the plan a human approved and the configuration the runner executed cannot be shown to be the same thing. | `assertRunPlan` and fixtures | Add `runner_configuration_fingerprint` (and optionally the configuration payload) to `RunPlan`; ingestion compares it with the manifest's `config_fingerprint`. |

## P2 findings

| ID | Finding | Proposed fix |
|---|---|---|
| P2-1 | `transitionProtocol` can move `PENDING_AUTHORITY` to `LOCKED` while `unresolved_decision_ids` is non-empty (PROBE4). The gate still blocks afterwards (PROBE4b), so no execution risk, but the state is contradictory. | Route locking through `lockResearchPlan` only, or check unresolved decisions in `transitionProtocol`. |
| P2-2 | Impact items carry `confidence: "HIGH"` unconditionally and a system-set `human_disposition: "DEFER"`. The plan asks for confidence only where ambiguity exists, and a human-disposition field should not be pre-filled by software. | Omit `confidence` for deterministic rules; use `human_disposition: null` with `disposition_status: "AWAITING_HUMAN"`. |
| P2-3 | `toResearcherImpact` gives every item the same reason ("connected to the change you recorded") and does not pass `dependency_path` for "See how this was determined". | Include a short reason from the rule and the path under a `technical_detail` key. |
| P2-4 | `createSupervisorBrief` exposes raw protocol and run states and raw decision records. Acceptable as a structured seam if OpenClaw translates, but the Standard puts the translation duty on the contract. | Add translated labels next to each raw state. |
| P2-5 | `verify-no-restricted-data.js` flags any CSV containing `participant_id`, which rejected all six synthetic R fixtures before the R lane renamed its identifier column to `study_id`. The rule is a useful smell test but too coarse for approved synthetic fixture directories. | Exempt `runner/r/data/synthetic/` and `runner/r/tests/fixtures/` when every identifier matches the synthetic pattern, or accept the rename (done) and keep the rule. |
| P2-6 | Contract test for `assertRunBundleManifest` accepts `output_checksums: {}` for a `SUCCEEDED` record. | Require at least one checksum when status is `SUCCEEDED`. |

## Runner alignment performed in this review

The R runner now emits the nine fields `assertRunBundleManifest` requires at the top level of every manifest, including failed and blocked ones, alongside its detailed record. All four committed fixtures (`runner/r/manifests/fixtures/RunBundleManifest.*.json`) pass the Codex assertion executed with node, and this is a standing test (`test-contract-codex.R`) that runs whenever `CODEX_CORE_ROOT` points at the candidate. Interim fingerprint definitions are in `docs/protocol/contract-alignment-request-runbundle.md` pending P1-3.

## Unresolved questions for Codex

1. What exactly do `protocol_fingerprint` and `dataset_fingerprint` hash (P1-3)?
2. Should failed and blocked analysis records be ingested (as failure records) or rejected? The runner recommends ingesting them so the researcher can see why a run stopped, with results blocked (P1-1).
3. Will `RunPlan` carry the runner configuration fingerprint (P1-7)?

## Verdict

**REVISE.** Fix P1-1, P1-2 and P1-4 before the first convergence (each is a few lines and testable with the probes above); P1-3, P1-5, P1-6 and P1-7 need a small contract-change note per Build Plan 6.4 and can land in the same cycle. P2 items are logged and deferred. One verifier replay of the fixes is expected before ACCEPT.
