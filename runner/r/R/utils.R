# Shared helpers for the Project Firdous R runner.

`%||%` <- function(a, b) if (is.null(a)) b else a

runner_root <- function() {
  # Resolve the runner root (runner/r) from FIRDOUS_RUNNER_ROOT, or from the
  # location of this file when sourced via source_runner().
  Sys.getenv("FIRDOUS_RUNNER_ROOT", unset = getOption("firdous.runner_root", getwd()))
}

# Load every module in R/ in a defined order.
source_runner <- function(root = runner_root()) {
  files <- c("utils.R", "messages.R", "conditions.R", "io.R", "assay_typing.R",
             "reconcile.R", "schema_lock.R", "analysis_registry.R", "analysis.R", "output_guard.R",
             "manifest.R", "stages.R", "pipeline.R", "guard.R", "replay.R", "export_bundle.R")
  for (f in files) {
    p <- file.path(root, "R", f)
    if (!file.exists(p)) stop("runner module missing: ", p)
    sys.source(p, envir = globalenv())
  }
  options(firdous.runner_root = root)
  invisible(TRUE)
}

sha256_file <- function(path) {
  if (!file.exists(path)) return(NA_character_)
  digest::digest(path, algo = "sha256", file = TRUE)
}

sha256_string <- function(x) {
  digest::digest(x, algo = "sha256", serialize = FALSE)
}

now_utc <- function() format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ", tz = "UTC")

# Canonical JSON: sorted keys, no volatile pretty-printing differences.
to_canonical_json <- function(x) {
  jsonlite::toJSON(sort_keys(x), auto_unbox = TRUE, null = "null", na = "null",
                   digits = NA, pretty = FALSE)
}

sort_keys <- function(x) {
  if (is.list(x)) {
    if (!is.null(names(x)) && all(nzchar(names(x)))) {
      x <- x[order(names(x))]
    }
    return(lapply(x, sort_keys))
  }
  x
}

write_json_file <- function(x, path) {
  dir.create(dirname(path), recursive = TRUE, showWarnings = FALSE)
  txt <- jsonlite::toJSON(x, auto_unbox = TRUE, null = "null", na = "null",
                          digits = NA, pretty = TRUE)
  writeLines(txt, path, useBytes = TRUE)
  invisible(path)
}

read_json_file <- function(path) {
  jsonlite::fromJSON(path, simplifyVector = FALSE)
}

# Deterministic CSV writing: fixed row order is the caller's job; this fixes
# quoting, NA representation and line endings.
write_csv_deterministic <- function(df, path) {
  dir.create(dirname(path), recursive = TRUE, showWarnings = FALSE)
  # Format numeric columns with fixed significant digits so the same numbers
  # always produce the same bytes.
  for (nm in names(df)) {
    if (is.numeric(df[[nm]])) {
      df[[nm]] <- ifelse(is.na(df[[nm]]), "NA",
                         formatC(df[[nm]], digits = 10, format = "g", flag = ""))
      df[[nm]] <- trimws(df[[nm]])
    }
  }
  con <- file(path, open = "wb")
  on.exit(close(con))
  utils::write.csv(df, con, row.names = FALSE, na = "NA", eol = "\n", quote = TRUE)
  invisible(path)
}

# Read a CSV with every column as character. Typing is a deliberate,
# validated step (F01), never an import-time guess.
read_csv_character <- function(path) {
  utils::read.csv(path, colClasses = "character", check.names = FALSE,
                  na.strings = character(0), strip.white = FALSE,
                  stringsAsFactors = FALSE, encoding = "UTF-8")
}

git_info <- function(root) {
  run_git <- function(args) {
    res <- tryCatch(suppressWarnings(system2("git", c("-C", shQuote(root), args),
                                             stdout = TRUE, stderr = FALSE)),
                    error = function(e) NULL)
    status <- attr(res, "status")
    if (is.null(res) || (!is.null(status) && status != 0)) return(NULL)
    as.character(res)
  }
  rev    <- run_git(c("rev-parse", "HEAD"))
  branch <- run_git(c("rev-parse", "--abbrev-ref", "HEAD"))
  status <- run_git(c("status", "--porcelain", "--untracked-files=no"))
  available <- !is.null(rev) && length(rev) == 1 && nzchar(rev)
  list(
    revision = if (available) rev[1] else NA_character_,
    branch = if (!is.null(branch) && length(branch)) branch[1] else NA_character_,
    working_tree_clean = if (is.null(status)) NA else length(status[nzchar(status)]) == 0,
    available = available
  )
}

# Short, stable identifier fragment for support references.
short_id <- function(n = 6) {
  paste(sample(c(0:9, letters[1:6]), n, replace = TRUE), collapse = "")
}

make_run_id <- function(prefix = "run") {
  # Time-based, human-readable and unique enough for a local runner.
  paste0(prefix, "-", format(Sys.time(), "%Y%m%dT%H%M%S", tz = "UTC"), "-",
         substr(sha256_string(paste(Sys.getpid(), as.numeric(Sys.time()), runif(1))), 1, 6))
}

make_support_reference <- function(run_id, code) {
  paste0("FR-", format(Sys.Date(), "%Y%m%d"), "-", substr(sha256_string(run_id), 1, 6), "-", code)
}

# Deep-get with a dotted path; returns default if missing.
cfg_get <- function(cfg, path, default = NULL) {
  parts <- strsplit(path, ".", fixed = TRUE)[[1]]
  x <- cfg
  for (p in parts) {
    if (is.null(x) || !is.list(x) || is.null(x[[p]])) return(default)
    x <- x[[p]]
  }
  x
}

is_unresolved_value <- function(v) {
  if (is.null(v)) return(TRUE)
  if (is.list(v) && length(v) == 0) return(TRUE)
  if (is.list(v)) return(FALSE)
  if (length(v) == 0) return(TRUE)
  if (all(is.na(v))) return(TRUE)
  if (is.character(v)) {
    s <- trimws(toupper(v))
    tokens <- c("", "BLOCKED", "TBD", "TODO", "UNRESOLVED", "UNDECIDED", "?", "PENDING", "NULL", "NONE_YET")
    if (any(s %in% tokens)) return(TRUE)
    if (any(grepl("^<.*>$", s) | grepl("^\\{\\{.*\\}\\}$", s) | grepl("^\\[\\[.*\\]\\]$", s))) return(TRUE)
  }
  FALSE
}

# Walk a nested list and return dotted paths of unresolved leaves.
find_unresolved <- function(x, prefix = "") {
  out <- character(0)
  if (is.list(x) && !is.null(names(x)) && length(x) > 0) {
    for (nm in names(x)) {
      path <- if (nzchar(prefix)) paste0(prefix, ".", nm) else nm
      v <- x[[nm]]
      if (is.list(v) && !is.null(names(v)) && length(v) > 0) {
        out <- c(out, find_unresolved(v, path))
      } else if (is_unresolved_value(v)) {
        out <- c(out, path)
      } else if (is.list(v)) {
        # unnamed list (array): check each element
        for (el in v) if (is_unresolved_value(el)) { out <- c(out, path); break }
      }
    }
  } else if (is_unresolved_value(x)) {
    out <- c(out, prefix)
  }
  out
}
