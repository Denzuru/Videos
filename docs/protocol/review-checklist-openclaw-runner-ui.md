# Review checklist: OpenClaw runner-facing screens (reviewer: Brother C)

For the analysis-plan, progress, result, recovery and analysis-record screens.
Test question for every screen: can a postgraduate researcher complete this
without knowing how the software works?

## No console-first flow

- [ ] Starting an analysis never shows a terminal, command, package name or R output on the primary path.
- [ ] Progress uses the six runner stage labels verbatim (or approved equivalents) and shows which step is in progress, done, not run.
- [ ] Support material (support reference, technical log) sits behind "Details for support" and is never the first thing shown.

## No overstated scientific claims

- [ ] A SUCCEEDED synthetic run is described as an aggregate record on synthetic data with no scientific claim, matching `analysis.scientific_claim: "none"`.
- [ ] Result views state the dataset version, research-plan version and whether the result is up to date before any number.
- [ ] Nothing converts a descriptive placeholder into an "effect", "association" or "finding".

## Clear recovery actions

- [ ] BLOCKED shows "Waiting for a decision" with the named decisions from `unresolved_decisions` and the resolving role, and states that data preparation can continue.
- [ ] FAILED shows what happened, that earlier work is safe, the next action and who can resolve it, from `researcher_status` and `findings`.
- [ ] Multiple findings are listed together, not one at a time.
- [ ] A failed or blocked run is never presented as current or successful anywhere in the workspace.

## Correct explanation of what the runner proves and does not prove

- [ ] The analysis-record screen explains that the record proves which plan, data version, environment, seed and inputs produced the outputs, and that replaying reproduces the checksums.
- [ ] It does not imply the record proves the method is scientifically correct.
- [ ] Replay MISMATCH is shown as "needs review by research support", not as an error the researcher must fix.

## Accessibility and content spot checks

- [ ] Stage progress is announced to screen readers; status never depends on colour alone.
- [ ] Keyboard-only start, wait, and read of the outcome works.
- [ ] Copy matches `runner/r/docs/researcher-messages.md`; deviations are deliberate and recorded.

## Evidence to record

Candidate branch and commit, screens exercised, fixtures used
(`runner/r/manifests/fixtures/*.json`), UX-P0/P1/P2 findings tied to
observed behaviour, verdict, in `docs/reviews/`.
