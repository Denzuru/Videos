# Stage engine: runs each stage, records its state, converts any failure into
# a researcher-safe status, and keeps raw technical detail in the support log.

log_support <- function(ctx, ...) {
  line <- paste0("[", now_utc(), "] ", paste0(..., collapse = ""))
  cat(line, "\n", file = ctx$support_log, append = TRUE, sep = "")
  invisible(line)
}

say <- function(ctx, ...) {
  if (!isTRUE(ctx$quiet)) cat(paste0(..., collapse = ""), "\n", sep = "")
}

new_stage_records <- function() {
  lapply(seq_along(STAGES), function(i) list(
    id = STAGES[[i]]$id, label = STAGES[[i]]$label, step = i, of = length(STAGES),
    state = "NOT_STARTED", started_at = NULL, ended_at = NULL, support_reference = NULL))
}

set_stage <- function(ctx, stage_id, ...) {
  upd <- list(...)
  for (i in seq_along(ctx$stages)) {
    if (identical(ctx$stages[[i]]$id, stage_id)) {
      for (nm in names(upd)) ctx$stages[[i]][[nm]] <- upd[[nm]]
    }
  }
}

stage_record <- function(ctx, stage_id) {
  for (s in ctx$stages) if (identical(s$id, stage_id)) return(s)
  NULL
}

# Render findings into researcher statuses (each with its own support ref).
render_findings <- function(ctx, findings, stage_id) {
  lapply(findings, function(f) {
    ref <- make_support_reference(ctx$run_id, f$code)
    st <- build_researcher_status(f$code, f$values, ref)
    st$stage <- stage_id
    st
  })
}

# Run one stage. `fn(ctx)` returns a result list on success or signals a
# firdous_failure. Any other error becomes UNEXPECTED_ERROR.
run_stage <- function(ctx, stage_id, fn) {
  s <- stage_record(ctx, stage_id)
  say(ctx, sprintf("Step %d of %d  %s ...", s$step, s$of, s$label))
  set_stage(ctx, stage_id, state = "RUNNING", started_at = now_utc())
  log_support(ctx, "stage start: ", stage_id)

  result <- tryCatch(
    withCallingHandlers(
      list(ok = TRUE, value = fn(ctx)),
      warning = function(w) {
        log_support(ctx, "warning in ", stage_id, ": ", conditionMessage(w))
        invokeRestart("muffleWarning")
      }),
    firdous_failure = function(f) list(ok = FALSE, failure = f),
    error = function(e) list(ok = FALSE, failure = firdous_failure(
      "UNEXPECTED_ERROR", list(stage_label = s$label), technical = conditionMessage(e)))
  )

  if (isTRUE(result$ok)) {
    set_stage(ctx, stage_id, state = "SUCCEEDED", ended_at = now_utc())
    log_support(ctx, "stage ok: ", stage_id)
    say(ctx, "    done")
    return(result$value)
  }

  f <- result$failure
  primary_ref <- make_support_reference(ctx$run_id, f$code)
  status <- build_researcher_status(f$code, f$values, primary_ref)
  status$stage <- stage_id
  state <- status$state
  set_stage(ctx, stage_id, state = state, ended_at = now_utc(), support_reference = primary_ref)
  ctx$run_state <- state
  ctx$researcher_status <- status
  ctx$finding_statuses <- if (length(f$findings) > 0) render_findings(ctx, f$findings, stage_id) else list(status)
  ctx$failure <- f
  log_support(ctx, "stage ", tolower(state), ": ", stage_id, " code=", f$code)
  if (!is.null(f$technical)) log_support(ctx, "technical detail (support only): ", f$technical)
  say(ctx, "    stopped")
  FALSE
}

skip_remaining <- function(ctx, after_stage_id) {
  found <- FALSE
  for (s in STAGES) {
    if (found && !identical(s$id, "record")) set_stage(ctx, s$id, state = "SKIPPED")
    if (identical(s$id, after_stage_id)) found <- TRUE
  }
}
