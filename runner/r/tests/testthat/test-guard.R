# Offending content is constructed at test time in a temporary directory so
# that nothing prohibited is ever committed to the repository.
make_repo <- function() { d <- tempfile("guardrepo-"); dir.create(d); d }
put <- function(repo, rel, lines) {
  p <- file.path(repo, rel); dir.create(dirname(p), recursive = TRUE, showWarnings = FALSE)
  writeLines(lines, p); rel
}
rules <- load_guard_rules(RUNNER_ROOT)
scan <- function(repo, rels) guard_scan(rels, rules, RUNNER_ROOT, repo)

test_that("clean synthetic fixtures and configs pass the guard (F06)", {
  rels <- c(file.path("data/synthetic", list.files(file.path(RUNNER_ROOT, "data/synthetic"))),
            file.path("config", list.files(file.path(RUNNER_ROOT, "config"))),
            file.path("tests/fixtures", list.files(file.path(RUNNER_ROOT, "tests/fixtures"))))
  # Scan relative to the runner root, but the tabular rule keys on the repo path.
  repo_rels <- file.path("runner/r", rels)
  repo_root <- normalizePath(file.path(RUNNER_ROOT, "..", ".."))
  f <- guard_scan(repo_rels, rules, RUNNER_ROOT, repo_root)
  expect_equal(nrow(f), 0, info = paste(capture.output(print(f)), collapse = "\n"))
})

test_that("direct-identifier headers and non-synthetic identifiers are rejected (F06)", {
  repo <- make_repo()
  a <- put(repo, "runner/r/data/synthetic/bad_header.csv", c("study_id,surname,dob,value", "SYN-0001,X,1980-01-01,1"))
  b <- put(repo, "runner/r/data/synthetic/bad_ids.csv", c("study_id,value", "P-1001,1", "SYN-0002,2"))
  f <- scan(repo, c(a, b))
  expect_true("HEADER_DIRECT_IDENTIFIER" %in% f$rule)
  expect_true("ID_NOT_SYNTHETIC" %in% f$rule)
})

test_that("national identity numbers, emails and phone numbers in data files are rejected (F06)", {
  repo <- make_repo()
  luhn_ok <- "8001015009087"   # a widely published EXAMPLE identity number; passes the check digit
  expect_true(luhn_valid(luhn_ok))
  a <- put(repo, "runner/r/data/synthetic/idnum.csv", c("study_id,value,note", paste0("SYN-0001,1,", luhn_ok)))
  b <- put(repo, "runner/r/data/synthetic/contact.csv", c("study_id,value,contact", "SYN-0001,1,someone@example.org", "SYN-0002,2,0821234567"))
  c_ <- put(repo, "runner/r/data/synthetic/not_an_id.csv", c("study_id,value,note", "SYN-0001,1,1234567890123"))  # fails check digit
  f <- scan(repo, c(a, b, c_))
  expect_true("ID_NATIONAL_ID_NUMBER" %in% f$rule[f$path == a])
  expect_true("ID_EMAIL_ADDRESS" %in% f$rule[f$path == b])
  expect_true("ID_PHONE_NUMBER" %in% f$rule[f$path == b])
  expect_false("ID_NATIONAL_ID_NUMBER" %in% f$rule[f$path == c_])
})

test_that("secrets are rejected in any text file (F06)", {
  repo <- make_repo()
  a <- put(repo, "runner/r/R/oops.R", c("x <- 1", paste0("key <- '", "AKIA", strrep("Q", 16), "'")))
  b <- put(repo, "docs/protocol/note.md", c("# note", paste0("-----BEGIN ", "RSA PRIVATE KEY-----")))
  c_ <- put(repo, "runner/r/config/x.yml", c(paste0("api_key: '", strrep("z", 24), "'")))
  d <- put(repo, "runner/r/scripts/t.sh", paste0("TOKEN=", "ghp_", strrep("a", 30)))
  f <- scan(repo, c(a, b, c_, d))
  expect_setequal(unique(f$rule), c("SECRET_AWS_ACCESS_KEY", "SECRET_PRIVATE_KEY", "SECRET_ASSIGNMENT", "SECRET_GITHUB_TOKEN"))
})

test_that("prohibited paths are rejected even when content is unreadable (F06)", {
  repo <- make_repo()
  a <- put(repo, "runner/r/data/real/participants.csv", c("study_id", "SYN-0001"))
  b <- put(repo, "runner/r/data/synthetic/.env", "SECRET=1")
  c_ <- put(repo, "runner/r/other/table.csv", c("study_id", "SYN-0001"))
  d <- put(repo, "runner/r/data/synthetic/export.xlsx", "not really binary")
  e <- put(repo, "apps/web/.env.local", "X=1")
  f <- scan(repo, c(a, b, c_, d, e))
  expect_true("PATH_REAL_DATA_DIR" %in% f$rule[f$path == a])
  expect_true("PATH_SECRET_FILE" %in% f$rule[f$path == b])
  expect_true("PATH_TABULAR_OUTSIDE_SYNTHETIC" %in% f$rule[f$path == c_])
  expect_true("PATH_BINARY_DATA_CONTAINER" %in% f$rule[f$path == d])
  expect_true("PATH_SECRET_FILE" %in% f$rule[f$path == e])
})

test_that("the guard report tells the committer what happens and what to do", {
  repo <- make_repo()
  a <- put(repo, "runner/r/data/real/notes.txt", "some notes")
  txt <- guard_report_text(scan(repo, a))
  expect_match(txt[1], "1 problem\\(s\\) found")
  expect_true(any(grepl("Nothing has been committed or changed", txt)))
  expect_equal(guard_report_text(scan(repo, character(0))), "Restricted-data guard: no problems found.")
})

test_that("a participant_id column header in a synthetic fixture is still checked for the synthetic pattern", {
  repo <- make_repo()
  a <- put(repo, "runner/r/data/synthetic/legacy.csv", c("participant_id,value", "REAL-1,1"))
  expect_true("ID_NOT_SYNTHETIC" %in% scan(repo, a)$rule)
})
