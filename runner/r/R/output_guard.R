# Output guard: only approved aggregate artifacts may be recorded, and none
# may contain participant-level rows or groups below the reportable minimum.

check_outputs <- function(ctx) {
  out_dir <- file.path(ctx$run_dir, "outputs")
  files <- list.files(out_dir, recursive = TRUE, all.files = TRUE, no.. = TRUE)
  allow <- cfg_get(ctx$cfg, "outputs.allow_list", default = list())
  allow_names <- vapply(allow, function(a) a$name, character(1))
  allow_kinds <- setNames(vapply(allow, function(a) a$kind %||% "aggregate_table", character(1)), allow_names)

  findings <- list()

  not_allowed <- setdiff(files, allow_names)
  if (length(not_allowed) > 0) {
    findings[[length(findings) + 1]] <- new_finding("OUTPUT_NOT_ALLOWED",
      list(count = length(not_allowed), files = paste(not_allowed, collapse = ", ")))
  }

  id_col <- ctx$cfg$data$participant_id_column
  id_pattern <- ctx$cfg$data$participant_id_pattern
  min_cell <- cfg_get(ctx$cfg, "governance.minimum_reportable_cell_size", default = NA)

  records <- list()
  for (f in files) {
    path <- file.path(out_dir, f)
    rec <- list(path = file.path("outputs", f), sha256 = sha256_file(path),
                bytes = file.info(path)$size,
                kind = unname(allow_kinds[f]) %||% "unapproved",
                approved = f %in% allow_names)
    if (grepl("\\.csv$", f, ignore.case = TRUE)) {
      df <- tryCatch(read_csv_character(path), error = function(e) NULL)
      if (!is.null(df)) {
        rec$rows <- nrow(df); rec$columns <- names(df)
        has_id_col <- id_col %in% names(df)
        has_id_values <- any(vapply(df, function(col) any(grepl(id_pattern, col)), logical(1)))
        if (has_id_col || has_id_values) {
          findings[[length(findings) + 1]] <- new_finding("OUTPUT_CONTAINS_PARTICIPANT_ROWS", list(file = f))
          rec$quarantined <- TRUE
        }
        if (!is.na(min_cell)) {
          n_cols <- names(df)[names(df) == "n" | grepl("^n_participants$", names(df))]
          small <- 0L
          for (nc in n_cols) {
            v <- suppressWarnings(as.numeric(df[[nc]]))
            small <- small + sum(!is.na(v) & v > 0 & v < as.numeric(min_cell))
          }
          if (small > 0) {
            findings[[length(findings) + 1]] <- new_finding("OUTPUT_SMALL_CELL",
              list(file = f, count = small, minimum = min_cell))
          }
        }
      }
    }
    records[[length(records) + 1]] <- rec
  }

  # Quarantine anything unapproved or identifying: move out of outputs/ so it
  # can never be mistaken for an approved artifact.
  bad <- unique(c(not_allowed, vapply(Filter(function(r) isTRUE(r$quarantined), records),
                                      function(r) basename(r$path), character(1))))
  if (length(bad) > 0) {
    qdir <- file.path(ctx$run_dir, "local", "quarantined_outputs")
    dir.create(qdir, recursive = TRUE, showWarnings = FALSE)
    for (b in bad) file.rename(file.path(out_dir, b), file.path(qdir, b))
  }

  list(findings = findings, records = records,
       summary = list(files_checked = length(files), approved = sum(files %in% allow_names),
                      quarantined = length(bad)))
}
