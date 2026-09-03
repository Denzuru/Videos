// Reviewer probes for the Codex core candidate (lane/g-core-impact @ 0400cc8).
// Run from the ROOT of a checkout of that candidate:
//   node path/to/2026-09-03-codex-core-0400cc8-probes.mjs
// Expected after the P1 fixes in the review record:
//   PROBE1  FAILED/BLOCKED manifests ingest (201) but a result attached to them is refused (422); unknown status refused (422)
//   PROBE2  ingest and run-request against an APPROVED plan lacking authority/location are refused / not allowed
//   PROBE3  manifest with fingerprints that do not match the plan is refused (422)
//   PROBE4  LOCKED is unreachable while decisions are unresolved
//   PROBE5  today.analysis_status is a research-language label, not a raw state
//   PROBE6  the R runner manifest is accepted (set R_MANIFEST to a fixture path)
//   PROBE7  identifier values are rejected, not only identifier keys
import { ResearchStore } from "./packages/database/store.js";
import { createResearchService } from "./apps/api/src/service.js";
import { createApiHandler } from "./apps/api/src/http.js";
import { transitionProtocol, runPlanGate } from "./packages/domain/state-machine.js";
import { assertRunBundleManifest } from "./packages/contracts/schemas.js";
import { readFileSync } from "node:fs";
const P = "project-firdous-synthetic";
const base = { run_id: "b", protocol_fingerprint: "a", dataset_fingerprint: "b", code_fingerprint: "c", config_fingerprint: "d", environment_fingerprint: "e", seed: 1, output_checksums: {}, status: "SUCCEEDED" };
function api(seed) { const store = new ResearchStore(seed); return { store, h: createApiHandler({ store, service: createResearchService({ store }) }) }; }

// PROBE 1: a FAILED manifest is ingested like a success, and a result can then be attached to it
{
  const { store, h } = api({ runPlans: [{ id: "rp", project_id: P, protocol_id: "pr", dataset_version_id: "d1", state: "APPROVED", authority_id: "a1", processing_location_approved: true }] });
  const r1 = await h({ method: "POST", path: `/projects/${P}/run-bundles`, actor: { project_ids: [P] }, body: { project_id: P, run_plan_id: "rp", manifest: { ...base, run_id: "failed-run", status: "FAILED" } } });
  const r2 = await h({ method: "POST", path: `/projects/${P}/results`, actor: { project_ids: [P] }, body: { project_id: P, result: { id: "res", project_id: P, run_id: "failed-run", artifact_type: "TABLE", currentness: "PENDING_REVIEW", plain_language_summary: "table from a failed run" } } });
  console.log("PROBE1 failed-manifest ingest status:", r1.status, "| result attached to FAILED bundle status:", r2.status, "| results stored:", store.state.results.length);
  const r3 = await h({ method: "POST", path: `/projects/${P}/run-bundles`, actor: { project_ids: [P] }, body: { project_id: P, run_plan_id: "rp", manifest: { ...base, run_id: "blocked-run", status: "BLOCKED" } } });
  const r4 = await h({ method: "POST", path: `/projects/${P}/run-bundles`, actor: { project_ids: [P] }, body: { project_id: P, run_plan_id: "rp", manifest: { ...base, run_id: "nonsense", status: "NOT_A_STATE" } } });
  console.log("PROBE1b BLOCKED manifest:", r3.status, "| unknown status string:", r4.status);
}
// PROBE 2: an APPROVED plan lacking authority/location is not re-validated at ingestion or run request
{
  const { h } = api({ protocols: [{ id: "pr", project_id: P, version: 1, state: "LOCKED", authority_ids: ["x"] }], runPlans: [{ id: "rp", project_id: P, protocol_id: "pr", dataset_version_id: "d1", state: "APPROVED" }] });
  const r1 = await h({ method: "POST", path: `/projects/${P}/run-bundles`, actor: { project_ids: [P] }, body: { project_id: P, run_plan_id: "rp", manifest: base } });
  const r2 = await h({ method: "POST", path: `/projects/${P}/run-requests`, actor: { project_ids: [P] }, body: { project_id: P, run_plan_id: "rp" } });
  console.log("PROBE2 ingest with APPROVED plan lacking authority_id/location:", r1.status, "| run-request allowed:", r2.body.allowed);
}
// PROBE 3: manifest fingerprints are not cross-checked against the plan
{
  const { h } = api({ runPlans: [{ id: "rp", project_id: P, protocol_id: "pr", dataset_version_id: "d1", state: "APPROVED", authority_id: "a1", processing_location_approved: true }] });
  const r1 = await h({ method: "POST", path: `/projects/${P}/run-bundles`, actor: { project_ids: [P] }, body: { project_id: P, run_plan_id: "rp", manifest: { ...base, dataset_fingerprint: "some-other-dataset", protocol_fingerprint: "some-other-protocol" } } });
  console.log("PROBE3 manifest with foreign dataset/protocol fingerprints accepted:", r1.status);
}
// PROBE 4: transitionProtocol PENDING_AUTHORITY -> LOCKED with unresolved decisions
{
  const p = transitionProtocol({ id: "pr", project_id: P, version: 1, state: "PENDING_AUTHORITY", authority_ids: ["a1"], unresolved_decision_ids: ["primary-outcome"] }, "LOCKED", { is_human_authority: true });
  console.log("PROBE4 LOCKED via transitionProtocol with unresolved decisions:", p.state, "unresolved:", p.unresolved_decision_ids);
  console.log("PROBE4b protocolGate afterwards:", runPlanGate({ id: "rp", protocol_id: "pr" }, p).allowed);
}
// PROBE 5: raw enum leaks in today.analysis_status
{
  const { h } = api({ protocols: [{ id: "pr", project_id: P, version: 1, state: "LOCKED", authority_ids: ["x"] }], runPlans: [{ id: "rp", project_id: P, protocol_id: "pr", dataset_version_id: "d1", state: "PENDING_APPROVAL" }] });
  const r = await h({ method: "GET", path: `/projects/${P}/today`, actor: { project_ids: [P] } });
  console.log("PROBE5 today.analysis_status:", JSON.stringify(r.body.analysis_status));
}
// PROBE 6: the R runner's actual manifest against assertRunBundleManifest
{
  const m = JSON.parse(readFileSync(process.env.R_MANIFEST ?? "runner/r/manifests/fixtures/RunBundleManifest.synthetic-succeeded.json", "utf8"));
  try { assertRunBundleManifest(m); console.log("PROBE6 R manifest accepted"); } catch (e) { console.log("PROBE6 R manifest rejected:", e.code, e.message); }
  const flat = { ...m, protocol_fingerprint: "x", dataset_fingerprint: "y", code_fingerprint: m.code.revision, config_fingerprint: m.configuration.content_fingerprint, environment_fingerprint: m.environment.renv_lockfile_sha256, seed: m.configuration.seed, output_checksums: {}, status: m.run_state };
  try { assertRunBundleManifest(flat); console.log("PROBE6b R manifest + nine flat fields accepted (nested detail tolerated)"); } catch (e) { console.log("PROBE6b rejected:", e.code, e.message); }
}
// PROBE 7: value-level identifiers pass the key-based restricted check
{
  try { assertRunBundleManifest({ ...base, orphan_ids: ["SYN-0001", "SYN-0002"], note: "participant SYN-0003 excluded" }); console.log("PROBE7 identifier VALUES accepted by key-only check: yes"); } catch (e) { console.log("PROBE7 rejected:", e.code); }
}
