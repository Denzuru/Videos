# F02: participant / assay reconciliation.
#
# Reports:
#   * orphan assays        assay rows whose participant is not in the participant file
#   * missing assays       participant x required-target pairs with no assay row
#   * duplicate keys       participant x target pairs that appear more than once
#   * duplicate participants
#   * approved exceptions  entries that excuse a missing or orphan row, which
#                          must carry an approver and an approval reference
#
# Researcher-facing output is counts only. Identifier-level detail is kept in
# the run's local check files, which are never part of the returned bundle.

reconcile_participants_assays <- function(participants, assays, exceptions,
                                          id_col, target_col, required_targets) {
  findings <- list()
  detail <- list()

  pid <- participants[[id_col]]
  aid <- assays[[id_col]]
  atg <- assays[[target_col]]

  # Duplicate participants
  dup_p <- unique(pid[duplicated(pid)])
  if (length(dup_p) > 0) {
    findings[[length(findings) + 1]] <- new_finding("DATA_DUPLICATE_PARTICIPANTS",
      list(count = length(dup_p)), detail = data.frame(participant_id = dup_p))
  }

  # Exceptions validation
  valid_exceptions <- data.frame(participant_id = character(0), target = character(0),
                                 exception_type = character(0), stringsAsFactors = FALSE)
  if (!is.null(exceptions) && nrow(exceptions) > 0) {
    if (id_col %in% names(exceptions) && !("participant_id" %in% names(exceptions))) {
      names(exceptions)[names(exceptions) == id_col] <- "participant_id"   # internal name only
    }
    need <- c("participant_id", "target", "exception_type", "reason", "approved_by", "approval_reference")
    missing_cols <- setdiff(need, names(exceptions))
    if (length(missing_cols) > 0) {
      findings[[length(findings) + 1]] <- new_finding("DATA_COLUMNS_MISSING",
        list(role = "approved-exceptions", columns = paste(missing_cols, collapse = ", ")))
    } else {
      unapproved <- exceptions[!nzchar(trimws(exceptions$approved_by)) |
                               !nzchar(trimws(exceptions$approval_reference)), , drop = FALSE]
      if (nrow(unapproved) > 0) {
        findings[[length(findings) + 1]] <- new_finding("DATA_EXCEPTION_UNAPPROVED",
          list(count = nrow(unapproved)), detail = unapproved[, c("participant_id", "target", "exception_type")])
      }
      valid_exceptions <- exceptions[nzchar(trimws(exceptions$approved_by)) &
                                     nzchar(trimws(exceptions$approval_reference)),
                                     c("participant_id", "target", "exception_type"), drop = FALSE]
    }
  }
  exc_key <- paste(valid_exceptions$participant_id, valid_exceptions$target, valid_exceptions$exception_type, sep = "\r")

  # Orphan assays
  orphan_rows <- which(!(aid %in% pid))
  if (length(orphan_rows) > 0) {
    keys <- paste(aid[orphan_rows], atg[orphan_rows], "orphan_assay", sep = "\r")
    excused <- keys %in% exc_key
    orphan_rows <- orphan_rows[!excused]
    if (length(orphan_rows) > 0) {
      findings[[length(findings) + 1]] <- new_finding("DATA_ORPHAN_ASSAYS",
        list(count = length(orphan_rows), n_ids = length(unique(aid[orphan_rows]))),
        detail = data.frame(row = orphan_rows, participant_id = aid[orphan_rows],
                            target = atg[orphan_rows], stringsAsFactors = FALSE))
    }
  }

  # Missing required assays
  expected <- expand.grid(participant_id = unique(pid), target = required_targets,
                          stringsAsFactors = FALSE)
  have <- paste(aid, atg, sep = "\r")
  exp_key <- paste(expected$participant_id, expected$target, sep = "\r")
  missing <- expected[!(exp_key %in% have), , drop = FALSE]
  if (nrow(missing) > 0) {
    keys <- paste(missing$participant_id, missing$target, "missing_assay", sep = "\r")
    missing <- missing[!(keys %in% exc_key), , drop = FALSE]
  }
  if (nrow(missing) > 0) {
    findings[[length(findings) + 1]] <- new_finding("DATA_MISSING_ASSAYS",
      list(count = nrow(missing), n_ids = length(unique(missing$participant_id))),
      detail = missing)
  }

  # Duplicate assay keys
  key <- paste(aid, atg, sep = "\r")
  dup_keys <- unique(key[duplicated(key)])
  if (length(dup_keys) > 0) {
    parts <- do.call(rbind, strsplit(dup_keys, "\r", fixed = TRUE))
    dup_df <- data.frame(participant_id = parts[, 1], target = parts[, 2], stringsAsFactors = FALSE)
    dup_df$n_rows <- vapply(dup_keys, function(k) sum(key == k), integer(1), USE.NAMES = FALSE)
    findings[[length(findings) + 1]] <- new_finding("DATA_DUPLICATE_KEYS",
      list(count = nrow(dup_df)), detail = dup_df)
  }

  applied <- nrow(valid_exceptions)

  list(
    findings = findings,
    summary = list(
      participants = length(unique(pid)),
      assay_rows = nrow(assays),
      required_targets = length(required_targets),
      orphan_assay_rows = length(orphan_rows),
      missing_required_assays = nrow(missing),
      duplicate_assay_keys = length(dup_keys),
      duplicate_participants = length(dup_p),
      approved_exceptions_applied = applied
    )
  )
}
