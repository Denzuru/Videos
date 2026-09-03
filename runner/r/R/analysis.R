# Analysis stage.
#
# The verified seven scripts from the original v0.1.0 pipeline have not been
# supplied. Until they are, the only analysis kind this runner contains is a
# SYNTHETIC_DESCRIPTIVE_PLACEHOLDER: it computes descriptive aggregates on
# synthetic data (counts, means, medians) so that the surrounding machinery
# (gates, manifests, determinism, output guards) can be proven end to end.
#
# It makes NO scientific claim, applies NO statistical test and settles NO
# analytical decision. When the real scripts arrive they are mapped in here as
# new analysis kinds without changing the gate or record logic.

run_analysis_stage <- function(ctx) {
  kind_id <- cfg_get(ctx$cfg, "stages.analysis.kind", default = NULL)
  kind <- get_analysis_kind(kind_id)
  if (is.null(kind)) stop_firdous("ANALYSIS_KIND_UNKNOWN", list(kind = kind_id %||% "(not recorded)"))
  mism <- analysis_output_mismatch(kind, ctx$cfg)
  if (length(mism$undeclared) || length(mism$unallowed)) {
    stop_firdous("ANALYSIS_OUTPUTS_MISMATCH",
                 list(kind = kind$label,
                      detail = paste(c(if (length(mism$undeclared)) paste0("the plan expects ", paste(mism$undeclared, collapse = ", "), " which this step does not produce"),
                                       if (length(mism$unallowed)) paste0("this step produces ", paste(mism$unallowed, collapse = ", "), " which the plan does not allow")),
                                     collapse = "; ")))
  }
  missing_cols <- setdiff(kind$requires_participant_columns, names(ctx$data$participants))
  if (length(missing_cols)) stop_firdous("DATA_COLUMNS_MISSING", list(role = "participant", columns = paste(missing_cols, collapse = ", ")))
  set.seed(ctx$seed)
  log_support(ctx, sprintf("analysis kind=%s seed=%s", kind$id, ctx$seed))
  res <- kind$run(ctx)
  res$kind <- kind$id
  res$scientific_claim <- kind$scientific_claim
  if (!is.null(kind$note) && is.null(res$note)) res$note <- kind$note
  res
}

run_synthetic_descriptive <- function(ctx) {
  d <- ctx$data
  group_col <- cfg_get(ctx$cfg, "stages.analysis.group_by")
  if (is.null(group_col) || !(group_col %in% names(d$participants))) {
    stop_firdous("CONFIG_INVALID",
                 list(detail = paste0("the grouping column '", group_col %||% "", "' is not in the participant file")))
  }
  id_col <- ctx$cfg$data$participant_id_column
  target_col <- ctx$cfg$data$assay_target_column

  participants <- d$participants
  assays <- d$assays  # includes value_numeric, value_status

  # 1. Participants per group (aggregate only)
  grp <- participants[[group_col]]
  group_counts <- as.data.frame(table(group = grp), stringsAsFactors = FALSE)
  names(group_counts) <- c("group", "n_participants")
  group_counts <- group_counts[order(group_counts$group), , drop = FALSE]
  group_counts$n_participants <- as.integer(group_counts$n_participants)

  # 2. Descriptive summary per target and group, observed values only.
  lookup <- setNames(grp, participants[[id_col]])
  assays$group <- unname(lookup[assays[[id_col]]])
  assays <- assays[!is.na(assays$group), , drop = FALSE]
  keys <- unique(assays[, c(target_col, "group")])
  keys <- keys[order(keys[[target_col]], keys$group), , drop = FALSE]
  rows <- lapply(seq_len(nrow(keys)), function(i) {
    sub <- assays[assays[[target_col]] == keys[[target_col]][i] & assays$group == keys$group[i], , drop = FALSE]
    obs <- sub$value_numeric[sub$value_status == "observed"]
    data.frame(
      target = keys[[target_col]][i],
      group = keys$group[i],
      n_participants = length(unique(sub[[id_col]])),
      n_observed = length(obs),
      n_missing = sum(sub$value_status == "missing"),
      n_below_detection = sum(sub$value_status == "below_detection"),
      mean = if (length(obs)) mean(obs) else NA_real_,
      sd = if (length(obs) > 1) stats::sd(obs) else NA_real_,
      median = if (length(obs)) stats::median(obs) else NA_real_,
      min = if (length(obs)) min(obs) else NA_real_,
      max = if (length(obs)) max(obs) else NA_real_,
      stringsAsFactors = FALSE
    )
  })
  target_summary <- do.call(rbind, rows)

  # 3. Data readiness summary carried forward from the data stage.
  s <- ctx$data_summary
  readiness <- data.frame(
    metric = names(s),
    value = vapply(s, function(v) as.character(v), character(1)),
    stringsAsFactors = FALSE
  )

  out_dir <- file.path(ctx$run_dir, "outputs")
  write_csv_deterministic(group_counts, file.path(out_dir, "group_counts.csv"))
  write_csv_deterministic(target_summary, file.path(out_dir, "target_summary_by_group.csv"))
  write_csv_deterministic(readiness, file.path(out_dir, "data_readiness_summary.csv"))

  list(
    note = "Descriptive aggregates on synthetic data only. No statistical test was applied and no analytical decision was made by the runner.",
    outputs_written = c("group_counts.csv", "target_summary_by_group.csv", "data_readiness_summary.csv"),
    groups = nrow(group_counts),
    targets = length(unique(target_summary$target))
  )
}

register_analysis_kind(
  id = "SYNTHETIC_DESCRIPTIVE_PLACEHOLDER",
  label = "Synthetic descriptive placeholder",
  run = run_synthetic_descriptive,
  declared_outputs = c("group_counts.csv", "target_summary_by_group.csv", "data_readiness_summary.csv"),
  requires_participant_columns = character(0),
  scientific_claim = "none",
  note = "Descriptive aggregates on synthetic data only. No statistical test was applied and no analytical decision was made by the runner.")
