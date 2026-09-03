TECH_WORDS <- "Error in|stack ?trace|traceback|NULL|NA_character|\\.R\\b|Rscript|renv|JSON|enum|sha256|SHA-256|exception was|segfault|stdout|stderr|\\$|<-"

test_that("every catalogue entry carries the full researcher-safe contract", {
  for (code in names(MESSAGES)) {
    m <- MESSAGES[[code]]
    expect_true(m$state %in% c("FAILED", "BLOCKED"), info = code)
    for (f in c("plain_language_title", "plain_language_summary", "why_it_matters", "next_action", "resolving_role")) {
      expect_true(is.character(m[[f]]) && nzchar(m[[f]]), info = paste(code, f))
    }
    expect_true(is.logical(m$can_continue_elsewhere), info = code)
    expect_true(is.logical(m$work_preserved), info = code)
  }
})

test_that("researcher messages contain no console or developer language", {
  for (code in names(MESSAGES)) {
    m <- MESSAGES[[code]]
    for (f in c("plain_language_title", "plain_language_summary", "why_it_matters", "next_action", "resolving_role")) {
      expect_false(grepl(TECH_WORDS, m[[f]], perl = TRUE), info = paste(code, f, m[[f]]))
    }
  }
})

test_that("templates are filled and never leave placeholders or R errors behind", {
  st <- build_researcher_status("DATA_ORPHAN_ASSAYS", list(count = 3, n_ids = 2), "FR-1")
  expect_match(st$plain_language_summary, "^3 assay row\\(s\\) refer to 2 participant")
  expect_false(grepl("\\{", paste(unlist(st), collapse = " ")))
  st2 <- build_researcher_status("DATA_ORPHAN_ASSAYS", list(), "FR-2")   # missing values
  expect_match(st2$plain_language_summary, "\\(not recorded\\)")
  st3 <- build_researcher_status("NOT_A_CODE", list(), "FR-3")            # unknown code
  expect_equal(st3$code, "NOT_A_CODE"); expect_equal(st3$state, "FAILED")
  expect_equal(st3$plain_language_title, MESSAGES$UNEXPECTED_ERROR$plain_language_title)
})

test_that("every stage has a researcher-facing label and every decision has a plain label", {
  expect_equal(length(STAGES), 6)
  expect_true(all(vapply(STAGES, function(s) nzchar(s$label) && !grepl("_", s$label), logical(1))))
  expect_equal(decision_label("analysis_plan.primary_outcome")$label, "The primary outcome")
  expect_match(decision_label("analysis_plan.something_new")$label, "analysis plan something new")
})
