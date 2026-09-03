# F01: assay-value typing.
#
# Every value in an expression/assay value column must be exactly one of:
#   * an approved missing token (e.g. "NA")
#   * an approved below-detection token (e.g. "<LOD")
#   * a plain decimal number using "." as the decimal separator
# Anything else is malformed and the run fails with a precise report.
# Values are never coerced silently.

NUMERIC_PATTERN <- "^[+-]?([0-9]+\\.?[0-9]*|\\.[0-9]+)([eE][+-]?[0-9]+)?$"

classify_assay_value <- function(token, missing_tokens, below_detection_tokens) {
  if (is.na(token)) return("malformed")
  if (token %in% missing_tokens) return("missing")
  if (token %in% below_detection_tokens) return("below_detection")
  if (grepl(NUMERIC_PATTERN, token)) return("observed")
  "malformed"
}

# Give a plain reason for a malformed token so the custodian knows what to fix.
malformed_reason <- function(token) {
  if (is.na(token) || !nzchar(token)) return("empty cell (not an approved missing representation)")
  if (token != trimws(token)) return("value has leading or trailing spaces")
  if (grepl("^[+-]?[0-9]+,[0-9]+$", token)) return("comma used as the decimal separator")
  if (grepl("^[+-]?[0-9]{1,3}(,[0-9]{3})+(\\.[0-9]+)?$", token)) return("thousands separators are not allowed")
  if (grepl("^[<>]", token)) return("comparison symbol that is not an approved below-detection representation")
  if (grepl("[0-9]", token) && grepl("[A-Za-z]", token)) return("mixes letters and digits")
  if (grepl("^[A-Za-z. /_-]+$", token)) return("text where a number was expected")
  "not a recognised number or approved representation"
}

# Type one value column. Returns a list with the typed vector, per-row status
# and a report. `row_offset` lets the caller report real file line numbers.
type_assay_values <- function(values, column, missing_tokens, below_detection_tokens,
                              allowed_range = NULL) {
  status <- vapply(values, classify_assay_value, character(1),
                   missing_tokens = missing_tokens,
                   below_detection_tokens = below_detection_tokens,
                   USE.NAMES = FALSE)
  numeric <- rep(NA_real_, length(values))
  obs <- status == "observed"
  numeric[obs] <- as.numeric(values[obs])

  malformed_idx <- which(status == "malformed")
  malformed <- data.frame(
    row = malformed_idx,
    column = rep(column, length(malformed_idx)),
    token = values[malformed_idx],
    reason = vapply(values[malformed_idx], malformed_reason, character(1), USE.NAMES = FALSE),
    stringsAsFactors = FALSE
  )

  out_of_range <- data.frame(row = integer(0), column = character(0), value = numeric(0),
                             stringsAsFactors = FALSE)
  if (!is.null(allowed_range) && any(obs)) {
    lo <- allowed_range$min %||% -Inf
    hi <- allowed_range$max %||% Inf
    bad <- which(obs & (numeric < lo | numeric > hi))
    out_of_range <- data.frame(row = bad, column = rep(column, length(bad)),
                               value = numeric[bad], stringsAsFactors = FALSE)
  }

  list(
    numeric = numeric,
    status = status,
    counts = list(
      total = length(values),
      observed = sum(status == "observed"),
      missing = sum(status == "missing"),
      below_detection = sum(status == "below_detection"),
      malformed = length(malformed_idx),
      out_of_range = nrow(out_of_range)
    ),
    malformed = malformed,
    out_of_range = out_of_range
  )
}

# Build researcher findings from a typing result. Example tokens shown to the
# researcher are distinct malformed representations (never identifiers), capped.
typing_findings <- function(typing, column, missing_tokens, below_detection_tokens, allowed_range) {
  findings <- list()
  if (typing$counts$malformed > 0) {
    ex <- unique(paste0("'", typing$malformed$token, "' (", typing$malformed$reason, ")"))
    ex_shown <- head(ex, 3)
    if (length(ex) > 3) ex_shown <- c(ex_shown, paste0("and ", length(ex) - 3, " other kind(s)"))
    approved <- c(
      if (length(missing_tokens)) paste0("missing = ", paste0("'", missing_tokens, "'", collapse = " or ")),
      if (length(below_detection_tokens)) paste0("below detection = ", paste0("'", below_detection_tokens, "'", collapse = " or ")),
      "numbers written with a decimal point"
    )
    findings[[length(findings) + 1]] <- new_finding(
      "DATA_VALUES_MALFORMED",
      list(count = typing$counts$malformed, column = column,
           examples = paste(ex_shown, collapse = "; "),
           approved = paste(approved, collapse = "; ")),
      detail = typing$malformed
    )
  }
  if (typing$counts$out_of_range > 0) {
    rng <- paste0(allowed_range$min %||% "-infinity", " to ", allowed_range$max %||% "+infinity")
    findings[[length(findings) + 1]] <- new_finding(
      "DATA_VALUES_OUT_OF_RANGE",
      list(count = typing$counts$out_of_range, column = column, range = rng),
      detail = typing$out_of_range
    )
  }
  findings
}
