# Analysis-kind registry.
#
# Each verified analysis step is registered here with what it needs and what
# it produces. The stage engine runs only registered kinds, and the plan's
# output allow-list must match the kind's declared outputs exactly, so a
# mapped script can neither write an undeclared file nor be asked for one it
# does not produce. When the seven v0.1.0 scripts arrive, each becomes one
# registration (see docs/adding-an-analysis-kind.md). Nothing is registered
# for them until the files exist and are fingerprinted.

.analysis_registry <- new.env(parent = emptyenv())

register_analysis_kind <- function(id, label, run, declared_outputs, requires_participant_columns = character(0),
                                   scientific_claim = "none", note = NULL) {
  stopifnot(is.character(id), length(id) == 1, nzchar(id), is.function(run), is.character(declared_outputs))
  assign(id, list(id = id, label = label, run = run, declared_outputs = declared_outputs,
                  requires_participant_columns = requires_participant_columns,
                  scientific_claim = scientific_claim, note = note), envir = .analysis_registry)
  invisible(id)
}

analysis_kinds <- function() sort(ls(.analysis_registry), method = "radix")

get_analysis_kind <- function(id) {
  if (is.null(id) || !exists(id, envir = .analysis_registry, inherits = FALSE)) return(NULL)
  get(id, envir = .analysis_registry, inherits = FALSE)
}

# Compare the plan's allow-list with the kind's declared outputs. Any
# difference is a configuration problem that must be resolved before running.
analysis_output_mismatch <- function(kind, cfg) {
  allowed <- vapply(cfg_get(cfg, "outputs.allow_list", list()), function(a) a$name, character(1))
  list(undeclared = setdiff(allowed, kind$declared_outputs),   # plan allows something the kind never writes
       unallowed = setdiff(kind$declared_outputs, allowed))    # kind writes something the plan does not allow
}
