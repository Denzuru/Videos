gate_codes <- function(cfg) vapply(check_research_plan_gate(cfg)$findings, `[[`, "", "code")

test_that("a fully resolved, locked synthetic plan passes the gate (F03)", {
  g <- check_research_plan_gate(locked_config())
  expect_true(g$locked)
  expect_length(g$findings, 0)
})

test_that("draft protocol or draft schema blocks (F03)", {
  cfg <- locked_config(); cfg$research_plan$protocol_status <- "DRAFT"
  expect_true("PLAN_PROTOCOL_NOT_LOCKED" %in% gate_codes(cfg))
  cfg <- locked_config(); cfg$research_plan$protocol_status <- "PENDING_AUTHORITY"
  expect_true("PLAN_PROTOCOL_NOT_LOCKED" %in% gate_codes(cfg))
  cfg <- locked_config(); cfg$research_plan$schema_status <- "DRAFT"
  expect_true("PLAN_SCHEMA_NOT_LOCKED" %in% gate_codes(cfg))
  cfg <- locked_config(); cfg$research_plan$schema_status <- NULL
  expect_true("PLAN_SCHEMA_NOT_LOCKED" %in% gate_codes(cfg))
})

test_that("unresolved scientific placeholders block with named decisions (F03)", {
  cfg <- locked_config()
  cfg$analysis_plan$primary_outcome <- "BLOCKED"
  cfg$analysis_plan$multiplicity$correction <- "TBD"
  cfg$analysis_plan$missing_data_rule <- "<decide with statistician>"
  cfg$analysis_plan$covariates <- list()
  g <- check_research_plan_gate(cfg)
  expect_false(g$locked)
  f <- Filter(function(x) x$code == "PLAN_DECISIONS_UNRESOLVED", g$findings)[[1]]
  expect_equal(f$values$count, 4)
  expect_setequal(f$detail$field, c("analysis_plan.primary_outcome", "analysis_plan.multiplicity.correction",
                                    "analysis_plan.missing_data_rule", "analysis_plan.covariates"))
  expect_true("The primary outcome" %in% f$detail$decision)
  expect_true(all(nzchar(f$detail$resolving_role)))
})

test_that("missing authority, governance or location approval blocks (F03)", {
  cfg <- locked_config(); cfg$research_plan$authority_records <- cfg$research_plan$authority_records[1]
  g <- check_research_plan_gate(cfg)
  expect_true("PLAN_AUTHORITY_MISSING" %in% vapply(g$findings, `[[`, "", "code"))
  expect_match(Filter(function(x) x$code == "PLAN_AUTHORITY_MISSING", g$findings)[[1]]$values$roles, "supervisor")

  cfg <- locked_config(); cfg$governance$approval_status <- "PENDING"
  expect_true("PLAN_GOVERNANCE_NOT_APPROVED" %in% gate_codes(cfg))
  cfg <- locked_config(); cfg$governance$approval_reference <- "BLOCKED"
  expect_true("PLAN_GOVERNANCE_NOT_APPROVED" %in% gate_codes(cfg))
  cfg <- locked_config(); cfg$governance$processing_location_approved <- FALSE
  expect_true("PLAN_LOCATION_NOT_APPROVED" %in% gate_codes(cfg))
})

test_that("non-synthetic data classification is refused and the BLOCKED template never passes (F03)", {
  cfg <- locked_config(); cfg$data_classification <- "REAL"
  expect_true("PLAN_REAL_DATA_NOT_PERMITTED" %in% gate_codes(cfg))
  tmpl <- yaml::read_yaml(file.path(RUNNER_ROOT, "config", "firdous_template_BLOCKED.yml"))
  g <- check_research_plan_gate(tmpl)
  expect_false(g$locked)
  cs <- vapply(g$findings, `[[`, "", "code")
  expect_true(all(c("PLAN_REAL_DATA_NOT_PERMITTED", "PLAN_PROTOCOL_NOT_LOCKED", "PLAN_SCHEMA_NOT_LOCKED",
                    "PLAN_DECISIONS_UNRESOLVED", "PLAN_AUTHORITY_MISSING", "PLAN_GOVERNANCE_NOT_APPROVED") %in% cs))
})

test_that("placeholder detection covers the usual unresolved forms", {
  expect_true(is_unresolved_value(NULL)); expect_true(is_unresolved_value(""))
  expect_true(is_unresolved_value("BLOCKED")); expect_true(is_unresolved_value("tbd"))
  expect_true(is_unresolved_value("{{primary_outcome}}")); expect_true(is_unresolved_value(list()))
  expect_false(is_unresolved_value("association")); expect_false(is_unresolved_value(5))
  expect_false(is_unresolved_value("not_applicable"))
})
