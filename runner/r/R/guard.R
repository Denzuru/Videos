# F06: restricted-data and secret guard.
#
# Scans staged files (pre-commit), all tracked files (CI) or explicit paths for
# participant data, direct identifiers, secrets and prohibited paths. Rules
# live in config/guard_rules.yml so reviewers can read exactly what is checked.

load_guard_rules <- function(root) {
  yaml::read_yaml(file.path(root, "config", "guard_rules.yml"))
}

# Luhn check used by South African identity numbers and most card numbers.
luhn_valid <- function(s) {
  d <- as.integer(strsplit(s, "")[[1]])
  n <- length(d)
  total <- 0
  for (i in seq_len(n)) {
    v <- d[n - i + 1]
    if (i %% 2 == 0) { v <- v * 2; if (v > 9) v <- v - 9 }
    total <- total + v
  }
  total %% 10 == 0
}

has_utf16_bom <- function(path) {
  con <- file(path, "rb"); on.exit(close(con))
  b <- readBin(con, "raw", n = 2)
  length(b) == 2 && (identical(b, as.raw(c(0xff, 0xfe))) || identical(b, as.raw(c(0xfe, 0xff))))
}

is_probably_binary <- function(path, max_bytes = 8000) {
  con <- file(path, "rb"); on.exit(close(con))
  bytes <- readBin(con, "raw", n = max_bytes)
  any(bytes == as.raw(0))
}

guard_file_type <- function(path) {
  ext <- tolower(tools::file_ext(path))
  if (ext %in% c("csv", "tsv")) return("tabular")
  if (ext %in% c("json", "yml", "yaml", "txt")) return("data_text")
  if (ext %in% c("r", "rmd", "py", "sh", "js", "ts", "sql")) return("code")
  if (ext %in% c("md", "markdown")) return("prose")
  "other"
}

# Scan a set of repo-relative paths. Returns a data.frame of findings.
guard_scan <- function(paths, rules, root, repo_root = root) {
  findings <- data.frame(path = character(0), rule = character(0), line = integer(0),
                         description = character(0), stringsAsFactors = FALSE)
  add <- function(path, rule, line, description) {
    findings[nrow(findings) + 1, ] <<- list(path, rule, as.integer(line), description)
  }
  allow <- unlist(rules$allow_paths %||% list())
  for (rel in paths) {
    if (rel %in% allow) next
    abs <- file.path(repo_root, rel)
    if (dir.exists(abs)) next
    if (!file.exists(abs)) {
      add(rel, "FILE_NOT_INSPECTED", NA, "The file named by git could not be opened, so it was not inspected. Rename it using plain characters or ask research support.")
      next
    }

    # Path rules apply whether or not the content is readable.
    for (pr in rules$path_rules) {
      scope_ok <- is.null(pr$applies_to_prefix) || startsWith(rel, pr$applies_to_prefix)
      if (!scope_ok) next
      if (grepl(pr$pattern, rel, perl = TRUE)) {
        if (!is.null(pr$unless_pattern) && grepl(pr$unless_pattern, rel, perl = TRUE)) next
        add(rel, pr$id, NA, pr$description)
      }
    }

    ftype <- guard_file_type(rel)
    size <- file.info(abs)$size
    if (is.na(size) || size > (rules$scope$max_text_bytes %||% 5e6)) {
      if (ftype != "other") add(rel, "FILE_NOT_INSPECTED", NA,
        sprintf("The file is larger than the %d-byte inspection limit, so its content was not checked. Large data files may not enter the repository.", as.integer(rules$scope$max_text_bytes %||% 5e6)))
      next
    }
    if (size == 0) next
    if (has_utf16_bom(abs)) {
      add(rel, "FILE_NOT_INSPECTED", NA, "The file is UTF-16 encoded, which the guard cannot read. Save it as UTF-8 and try again.")
      next
    }
    if (is_probably_binary(abs)) {
      if (ftype != "other") add(rel, "FILE_NOT_INSPECTED", NA,
        "The file has a text extension but contains binary content, so it could not be inspected. Save it as plain UTF-8 text.")
      next
    }
    lines <- tryCatch(readLines(abs, warn = FALSE, encoding = "UTF-8"), error = function(e) character(0))

    for (cr in rules$content_rules) {
      types <- unlist(cr$file_types %||% list("tabular", "data_text", "code", "prose", "other"))
      if (!(ftype %in% types)) next
      hits <- grep(cr$pattern, lines, perl = TRUE)
      if (identical(cr$id, "ID_NATIONAL_ID_NUMBER") && length(hits)) {
        hits <- Filter(function(i) {
          m <- regmatches(lines[i], gregexpr("(?<![0-9])[0-9]{13}(?![0-9])", lines[i], perl = TRUE))[[1]]
          any(vapply(m, luhn_valid, logical(1)))
        }, hits)
      }
      for (h in head(hits, 5)) add(rel, cr$id, h, cr$description)
    }

    if (ftype == "tabular" && length(lines) > 0) {
      header <- tolower(trimws(strsplit(gsub('"', "", lines[1]), "[,\t]")[[1]]))
      bad <- intersect(header, tolower(unlist(rules$identifier_headers %||% list())))
      if (length(bad)) add(rel, "HEADER_DIRECT_IDENTIFIER", 1,
                           paste0("column name(s) suggest direct identifiers: ", paste(bad, collapse = ", ")))
      id_cols <- intersect(tolower(unlist(rules$synthetic_id_columns %||% list("participant_id"))), header)
      if (length(id_cols) && !is.null(rules$synthetic_id_pattern)) {
        df <- tryCatch(utils::read.csv(abs, colClasses = "character", check.names = FALSE), error = function(e) NULL)
        if (!is.null(df)) {
          idc <- names(df)[tolower(names(df)) %in% id_cols][1]
          nbad <- sum(!grepl(rules$synthetic_id_pattern, df[[idc]]))
          if (nbad > 0) add(rel, "ID_NOT_SYNTHETIC", NA,
                            sprintf("%d participant identifier(s) do not match the synthetic pattern %s", nbad, rules$synthetic_id_pattern))
        }
      }
    }
  }
  findings
}

# Paths are read NUL-separated (-z) so that names with spaces, quotes,
# backslashes or non-ASCII characters arrive verbatim rather than C-quoted;
# a quoted name would otherwise fail to resolve and escape inspection.
git_paths_z <- function(repo_root, args) {
  tmp <- tempfile(); on.exit(unlink(tmp))
  status <- suppressWarnings(system2("git", c("-C", shQuote(repo_root), args), stdout = tmp, stderr = FALSE))
  if (!identical(status, 0L) || !file.exists(tmp)) return(character(0))
  raw <- readBin(tmp, "raw", n = file.info(tmp)$size)
  if (!length(raw)) return(character(0))
  zeros <- which(raw == as.raw(0))
  starts <- c(1L, zeros + 1L); ends <- c(zeros - 1L, length(raw))
  parts <- vapply(seq_along(starts), function(i) {
    if (ends[i] < starts[i]) return("")
    p <- rawToChar(raw[starts[i]:ends[i]]); Encoding(p) <- "UTF-8"; p
  }, character(1))
  parts[nzchar(parts)]
}

git_staged_files <- function(repo_root) {
  git_paths_z(repo_root, c("diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"))
}

git_tracked_files <- function(repo_root, prefixes = NULL) {
  out <- git_paths_z(repo_root, c("ls-files", "-z"))
  if (!is.null(prefixes) && length(prefixes)) {
    keep <- Reduce(`|`, lapply(prefixes, function(p) startsWith(out, p)))
    out <- out[keep]
  }
  out
}

guard_report_text <- function(findings) {
  if (nrow(findings) == 0) return("Restricted-data guard: no problems found.")
  lines <- c(sprintf("Restricted-data guard: %d problem(s) found. The commit or build must not proceed.", nrow(findings)), "")
  for (i in seq_len(nrow(findings))) {
    loc <- if (is.na(findings$line[i])) findings$path[i] else paste0(findings$path[i], ":", findings$line[i])
    lines <- c(lines, sprintf("  [%s] %s", findings$rule[i], loc), sprintf("      %s", findings$description[i]))
  }
  c(lines, "", "Nothing has been committed or changed. Remove or replace the flagged content and try again.",
    "If a file is genuinely synthetic and safe, a reviewer may add it to allow_paths in config/guard_rules.yml with a reason.")
}
