test_that("approved representations are typed without coercion (F01)", {
  r <- type_assay_values(c("27.30", "NA", "<LOD", "1e1", ".5", "-0.25"), "value", "NA", "<LOD")
  expect_equal(r$status, c("observed", "missing", "below_detection", "observed", "observed", "observed"))
  expect_equal(r$numeric, c(27.30, NA, NA, 10, 0.5, -0.25))
  expect_equal(r$counts$malformed, 0)
})

test_that("malformed mixed representations are rejected, never silently coerced (F01)", {
  bad <- c("ND", "", "12,5", " 23.10", "Undetermined", "1,234.5", "<lod", "n/a", "23.1a")
  r <- type_assay_values(bad, "value", "NA", "<LOD")
  expect_true(all(r$status == "malformed"))
  expect_true(all(is.na(r$numeric)))
  expect_equal(nrow(r$malformed), length(bad))
  expect_match(r$malformed$reason[r$malformed$token == "12,5"], "comma used as the decimal separator")
  expect_match(r$malformed$reason[r$malformed$token == " 23.10"], "leading or trailing spaces")
  expect_match(r$malformed$reason[r$malformed$token == ""], "empty cell")
  expect_match(r$malformed$reason[r$malformed$token == "1,234.5"], "thousands separators")
  expect_match(r$malformed$reason[r$malformed$token == "<lod"], "not an approved below-detection")
})

test_that("out-of-range values are reported separately (F01)", {
  r <- type_assay_values(c("10", "50", "-1"), "value", "NA", "<LOD", allowed_range = list(min = 0, max = 45))
  expect_equal(r$counts$out_of_range, 2)
  expect_equal(r$out_of_range$row, c(2L, 3L))
})

test_that("typing findings speak in research language and show approved forms (F01)", {
  r <- type_assay_values(c("ND", "27.1"), "value", "NA", "<LOD")
  f <- typing_findings(r, "value", "NA", "<LOD", NULL)
  expect_equal(f[[1]]$code, "DATA_VALUES_MALFORMED")
  st <- build_researcher_status(f[[1]]$code, f[[1]]$values, "FR-TEST")
  expect_match(st$plain_language_summary, "1 value\\(s\\) in the 'value' column")
  expect_match(st$plain_language_summary, "'ND' \\(text where a number was expected\\)")
  expect_match(st$next_action, "missing = 'NA'")
  expect_match(st$next_action, "below detection = '<LOD'")
})
