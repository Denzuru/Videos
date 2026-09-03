# Some measured values could not be interpreted

Status: Stopped, action needed

## What happened
7 value(s) in the 'value' column are written in a way the approved data structure does not recognise, for example: 'ND' (text where a number was expected); '' (empty cell (not an approved missing representation)); '12,5' (comma used as the decimal separator); and 4 other kind(s).

## Why it matters
The runner will not guess what these values mean. Guessing could silently turn a missing or below-detection result into a number, which would change the analysis.

## Your work is safe
Nothing you entered or produced earlier has been changed or lost.

## What to do next
Decide with the data custodian how each of these should be written. Approved representations are: missing = 'NA'; below detection = '<LOD'; numbers written with a decimal point. Then update the file and start again.

## Who can resolve this
The data custodian or the person who prepared the data file.

## All items found in this attempt
- Some measured values could not be interpreted: 7 value(s) in the 'value' column are written in a way the approved data structure does not recognise, for example: 'ND' (text where a number was expected); '' (empty cell (not an approved missing representation)); '12,5' (comma used as the decimal separator); and 4 other kind(s).
- Some measured values are outside the approved range: 1 value(s) in the 'value' column fall outside the approved range of 0 to 45.

## Steps
- Step 1 of 6, Checking the analysis environment: Completed
- Step 2 of 6, Checking that your data structure is ready: Stopped, action needed
- Step 3 of 6, Confirming the approved analysis plan: Not run
- Step 4 of 6, Running the approved analysis: Not run
- Step 5 of 6, Checking outputs before saving: Not run
- Step 6 of 6, Saving the reproducibility record: Completed

## Details for support
Support reference: FR-20260903-ff68af-DATA_VALUES_MALFORMED
Technical log: support/technical_log.txt (for research support; not needed to understand this page)
