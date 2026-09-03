# Project Firdous R runner: activate the recorded environment.
#
# renv restores the exact package set recorded in renv.lock. On a machine that
# cannot reach CRAN (or a fresh clone with an empty project library) renv's
# bootstrap would otherwise stop R with a raw error before the runner starts.
# Here activation is attempted; if it fails the runner continues with the
# system library and the environment step still refuses to run unless the
# installed runtime packages match renv.lock exactly. The mode used is
# recorded in every analysis record (environment.library_mode).
local({
  activated <- tryCatch({
    suppressWarnings(source("renv/activate.R"))
    TRUE
  }, error = function(e) {
    Sys.setenv(FIRDOUS_RENV_BOOTSTRAP_ERROR = conditionMessage(e))
    FALSE
  })
  Sys.setenv(FIRDOUS_LIBRARY_MODE = if (activated) "renv-project" else "system-fallback")
})
