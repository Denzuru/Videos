# Review checklist: Codex contracts and domain core (reviewer: Brother C)

To be executed against the Codex candidate when its branch is available.
Each item needs an executable test, an invariant or an observed behaviour;
prose alone is advisory. Verdicts: ACCEPT, ACCEPT_WITH_P2, REVISE, BLOCK.

## Research semantics

- [ ] Protocol states and transitions match DRAFT, PENDING_AUTHORITY, LOCKED, SUPERSEDED, REVOKED, and a protocol is LOCKED only with the required human authority records (not because placeholders contain text).
- [ ] Association versus prediction is an explicit field, and outcome drift between protocol and run plan blocks approval.
- [ ] The statistical boundary items in `docs/protocol/statistical-boundary.md` have a home in the protocol model, each with a resolving role.
- [ ] Target panel changes propagate to multiplicity and panel-dependent results but not to unrelated source records.

## Feasibility for the runner

- [ ] `RunPlan` carries everything the runner needs to build its configuration: dataset version fingerprints, panel, value representations, seed, permitted outputs, processing location.
- [ ] `RunBundleManifest` ingestion accepts the runner's record (see `contract-alignment-request-runbundle.md`) or the delta is small and named.
- [ ] Ingestion rejects a manifest with `participant_rows_included: true` or with any input flagged as containing participant rows.
- [ ] A FAILED or BLOCKED manifest is ingested as such and never surfaces as a current result.

## Human-authority boundaries

- [ ] No model response or automated step can create an AuthorityRecord, approve a RunPlan or lock a protocol.
- [ ] A run cannot become APPROVED without the required human authority and an approved processing location (tested).
- [ ] Human dispositions (ACCEPT, MODIFY, REJECT, DEFER) are recorded with author and reason.

## Fail-closed protocol and governance behaviour

- [ ] Governance authority removal blocks execution and stales dependent runs.
- [ ] A revoked or superseded protocol invalidates dependent claims; historical versions remain reconstructable.
- [ ] Every state-changing action produces an audit event.

## Researcher-safe explanation fields

- [ ] Every blocked, stale, invalid, failed or review-required response carries plain_language_title, plain_language_summary, why_it_matters, next_action, resolving_role, can_continue_elsewhere, work_preserved, support_reference.
- [ ] A test proves raw technical errors never become the primary message.
- [ ] Wording passes the vocabulary table in the Researcher Experience Standard section 5 (no raw enums, IDs, JSON in primary fields).

## Evidence to record

Candidate branch and commit, commands run, raw output, P0/P1/P2 findings,
unresolved questions, verdict, in `docs/reviews/`.
