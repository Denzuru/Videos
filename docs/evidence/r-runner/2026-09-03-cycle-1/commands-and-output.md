# Commands and console output, Project Firdous R runner, cycle 1, regenerated after the security-review fixes (2026-09-03T13:53:45Z)

Working directory: runner/r. Git revision at time of run: e131070cc2684b910a37aafe6e5bca8dbc4fbb3e (working tree contained the uncommitted fixes).

```
$ ./run.sh run --config config/synthetic_locked.yml --run-id ev-locked-0001 --out <out>
Project Firdous analysis run
Analysis record: <out>/ev-locked-0001

Step 1 of 6  Checking the analysis environment ...
    done
Step 2 of 6  Checking that your data structure is ready ...
    done
Step 3 of 6  Confirming the approved analysis plan ...
    done
Step 4 of 6  Running the approved analysis ...
    done
Step 5 of 6  Checking outputs before saving ...
    done
Step 6 of 6  Saving the reproducibility record ...
    done

Your analysis finished and the record was saved.
All steps completed. The approved outputs and the reproducibility record are saved together in the analysis record.

Support reference: FR-20260903-7d2eb1-OK
Details for support: <out>/ev-locked-0001/support/technical_log.txt
exit=0
```

```
$ ./run.sh run --config config/synthetic_draft.yml --run-id ev-draft-0001 --out <out>
Project Firdous analysis run
Analysis record: <out>/ev-draft-0001

Step 1 of 6  Checking the analysis environment ...
    done
Step 2 of 6  Checking that your data structure is ready ...
    done
Step 3 of 6  Confirming the approved analysis plan ...
    stopped
Step 6 of 6  Saving the reproducibility record ...
    done

The analysis stopped at step 3: Confirming the approved analysis plan.

Your research plan has not been confirmed yet
  What happened:     The research plan is currently 'still a draft'. The analysis can only run against a confirmed research plan.
  Why it matters:    Running an analysis before the plan is confirmed could produce results that later have to be discarded when a decision changes.
  Your work is safe: nothing entered or produced earlier has been changed.
  Next action:       Complete the outstanding decisions in the research plan and send it for confirmation. You can keep preparing data in the meantime.
  Who can resolve it: Your supervisor or the person who confirms the research plan.
  2 item(s) were found in total. The full list is in researcher_summary.md.

Support reference: FR-20260903-d1fa5a-PLAN_PROTOCOL_NOT_LOCKED
Details for support: <out>/ev-draft-0001/support/technical_log.txt
exit=1
```

```
$ ./run.sh run --config tests/fixtures/config_malformed_values.yml --run-id ev-malformed-0001 --out <out>
Project Firdous analysis run
Analysis record: <out>/ev-malformed-0001

Step 1 of 6  Checking the analysis environment ...
    done
Step 2 of 6  Checking that your data structure is ready ...
    stopped
Step 6 of 6  Saving the reproducibility record ...
    done

The analysis stopped at step 2: Checking that your data structure is ready.

Some measured values could not be interpreted
  What happened:     7 value(s) in the 'value' column are written in a way the approved data structure does not recognise, for example: text of 2 character(s) (text where a number was expected); an empty cell (empty cell (not an approved missing representation)); '12,5' (comma used as the decimal separator); and 4 other kind(s).
  Why it matters:    The runner will not guess what these values mean. Guessing could silently turn a missing or below-detection result into a number, which would change the analysis.
  Your work is safe: nothing entered or produced earlier has been changed.
  Next action:       Decide with the data custodian how each of these should be written. Approved representations are: missing = 'NA'; below detection = '<LOD'; numbers written with a decimal point. Then update the file and start again.
  Who can resolve it: The data custodian or the person who prepared the data file.
  2 item(s) were found in total. The full list is in researcher_summary.md.

Support reference: FR-20260903-ff68af-DATA_VALUES_MALFORMED
Details for support: <out>/ev-malformed-0001/support/technical_log.txt
exit=1
```

```
$ ./run.sh run --config tests/fixtures/config_reconciliation_problems.yml --run-id ev-recon-0001 --out <out>
Project Firdous analysis run
Analysis record: <out>/ev-recon-0001

Step 1 of 6  Checking the analysis environment ...
    done
Step 2 of 6  Checking that your data structure is ready ...
    stopped
Step 6 of 6  Saving the reproducibility record ...
    done

The analysis stopped at step 2: Checking that your data structure is ready.

Some assay results belong to participants who are not in the participant file
  What happened:     1 assay row(s) refer to 1 participant identifier(s) that do not appear in the participant file.
  Why it matters:    Results that cannot be linked to a participant cannot be analysed, and may indicate that the two files come from different dataset versions.
  Your work is safe: nothing entered or produced earlier has been changed.
  Next action:       Check that the participant and assay files are from the same dataset version. If an assay is a known exception, record it in the approved-exceptions list.
  Who can resolve it: The data custodian or the person who prepared the data file.
  3 item(s) were found in total. The full list is in researcher_summary.md.

Support reference: FR-20260903-33d3d0-DATA_ORPHAN_ASSAYS
Details for support: <out>/ev-recon-0001/support/technical_log.txt
exit=1
```

```
$ ./run.sh run --config config/firdous_template_BLOCKED.yml --run-id ev-template-0001 --out <out>
Project Firdous analysis run
Analysis record: <out>/ev-template-0001

Step 1 of 6  Checking the analysis environment ...
    stopped
Step 6 of 6  Saving the reproducibility record ...
    done

The analysis stopped at step 1: Checking the analysis environment.

This version of the runner works with synthetic data only
  What happened:     The analysis plan describes the data as 'REAL'. This runner is approved for synthetic (made-up) data only.
  Why it matters:    Real participant data may only be processed once ethics approval, data-custodian authority, an approved processing location and a confirmed research plan are all in place and verified.
  Your work is safe: nothing entered or produced earlier has been changed.
  Next action:       Continue using synthetic data for development and testing. Real-data execution is a separate, human-approved step.
  Who can resolve it: The ethics or data-governance contact for the study.

Support reference: FR-20260903-068333-PLAN_REAL_DATA_NOT_PERMITTED
Details for support: <out>/ev-template-0001/support/technical_log.txt
exit=1
```

```
$ ./run.sh replay --reference <out>/ev-locked-0001/manifest.json --run-id ev-replay-0001 --out <out>
Project Firdous analysis run
Analysis record: <out>/ev-replay-0001

Step 1 of 6  Checking the analysis environment ...
    done
Step 2 of 6  Checking that your data structure is ready ...
    done
Step 3 of 6  Confirming the approved analysis plan ...
    done
Step 4 of 6  Running the approved analysis ...
    done
Step 5 of 6  Checking outputs before saving ...
    done
Step 6 of 6  Saving the reproducibility record ...
    done

Your analysis finished and the record was saved.
All steps completed. The approved outputs and the reproducibility record are saved together in the analysis record.

Support reference: FR-20260903-5aac2b-OK
Details for support: <out>/ev-replay-0001/support/technical_log.txt

Replay verdict: MATCH
The replay produced the same outputs from the same data, plan and seed. The earlier result is reproducible on this computer.
Replay report: <out>/ev-replay-0001/replay_report.json
exit=0
```

```
$ ./run.sh run --run-id ev-locked-seed2 --seed 1 --out <out> --quiet   # different seed, same config
exit=0
```

```
$ ./run.sh export <out>/ev-locked-0001
Ingestion request written to <out>/ev-locked-0001/bundle_request.json 
Result proposals written to <out>/ev-locked-0001/result_proposals.json 
exit=0
```
