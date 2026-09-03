# Typed conditions used by the runner. A firdous_failure carries a message
# code from the catalogue plus structured details. It is never shown raw to a
# researcher; the stage engine turns it into a researcher status.

firdous_failure <- function(code, values = list(), findings = list(), technical = NULL) {
  structure(
    class = c("firdous_failure", "condition"),
    list(
      message = paste0("firdous_failure: ", code),
      call = NULL,
      code = code,
      values = values,
      findings = findings,
      technical = technical
    )
  )
}

stop_firdous <- function(code, values = list(), findings = list(), technical = NULL) {
  stop(firdous_failure(code, values, findings, technical))
}

# A finding is one concrete problem discovered by a check. Several findings
# are reported together so the researcher sees the whole picture at once.
new_finding <- function(code, values = list(), detail = NULL) {
  list(code = code, values = values, detail = detail)
}
