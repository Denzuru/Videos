mk_participants <- function(ids) data.frame(participant_id = ids, stringsAsFactors = FALSE)
mk_assays <- function(ids, targets) data.frame(participant_id = ids, target = targets, stringsAsFactors = FALSE)
codes <- function(res) vapply(res$findings, `[[`, "", "code")

test_that("a complete participant/assay pair reconciles cleanly (F02)", {
  p <- mk_participants(c("SYN-0001", "SYN-0002"))
  a <- mk_assays(rep(c("SYN-0001", "SYN-0002"), each = 2), rep(c("T1", "T2"), 2))
  res <- reconcile_participants_assays(p, a, NULL, "participant_id", "target", c("T1", "T2"))
  expect_length(res$findings, 0)
  expect_equal(res$summary$missing_required_assays, 0)
})

test_that("orphan, missing and duplicate identifiers are each detected (F02)", {
  p <- mk_participants(c("SYN-0001", "SYN-0002"))
  a <- mk_assays(c("SYN-0001", "SYN-0001", "SYN-0001", "SYN-0009"), c("T1", "T2", "T1", "T1"))
  res <- reconcile_participants_assays(p, a, NULL, "participant_id", "target", c("T1", "T2"))
  expect_setequal(codes(res), c("DATA_ORPHAN_ASSAYS", "DATA_MISSING_ASSAYS", "DATA_DUPLICATE_KEYS"))
  expect_equal(res$summary$orphan_assay_rows, 1)
  expect_equal(res$summary$missing_required_assays, 2)   # SYN-0002 x T1, T2
  expect_equal(res$summary$duplicate_assay_keys, 1)
})

test_that("duplicate participants are detected (F02)", {
  p <- mk_participants(c("SYN-0001", "SYN-0001"))
  a <- mk_assays("SYN-0001", "T1")
  res <- reconcile_participants_assays(p, a, NULL, "participant_id", "target", "T1")
  expect_true("DATA_DUPLICATE_PARTICIPANTS" %in% codes(res))
})

test_that("approved exceptions excuse missing and orphan rows; unapproved ones block (F02)", {
  p <- mk_participants(c("SYN-0001", "SYN-0002"))
  a <- mk_assays(c("SYN-0001", "SYN-0009"), c("T1", "T1"))
  ex <- data.frame(participant_id = c("SYN-0002", "SYN-0009"), target = c("T1", "T1"),
                   exception_type = c("missing_assay", "orphan_assay"), reason = c("qc", "qc"),
                   approved_by = c("SYN supervisor", "SYN supervisor"),
                   approval_reference = c("SYN-EXC-1", "SYN-EXC-2"), stringsAsFactors = FALSE)
  res <- reconcile_participants_assays(p, a, ex, "participant_id", "target", "T1")
  expect_length(res$findings, 0)
  expect_equal(res$summary$approved_exceptions_applied, 2)

  ex$approval_reference[1] <- ""
  res2 <- reconcile_participants_assays(p, a, ex, "participant_id", "target", "T1")
  expect_true("DATA_EXCEPTION_UNAPPROVED" %in% codes(res2))
  expect_true("DATA_MISSING_ASSAYS" %in% codes(res2))   # the unapproved exception no longer excuses it
})
