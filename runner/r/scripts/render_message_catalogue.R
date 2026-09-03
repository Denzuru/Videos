#!/usr/bin/env Rscript
# Renders docs/researcher-messages.md from R/messages.R so the documented
# wording is always the shipped wording.
script_dir <- dirname(sub("--file=", "", grep("--file=", commandArgs(), value = TRUE)[1]))
root <- normalizePath(file.path(script_dir, ".."))
Sys.setenv(FIRDOUS_RUNNER_ROOT = root)
source(file.path(root, "R", "utils.R")); source_runner(root)
out <- c("# Researcher-facing messages (generated from R/messages.R)", "",
         "Every stop the runner can make is listed here with the exact wording a researcher sees.",
         "Placeholders in braces are filled with counts, column names or examples at run time.",
         "Raw R errors never appear in these fields; they go to the support log only.", "",
         "## Steps", "")
for (s in STAGES) out <- c(out, paste0("- ", s$label))
out <- c(out, "", "## Stops", "")
for (code in names(MESSAGES)) {
  m <- MESSAGES[[code]]
  out <- c(out, paste0("### ", m$plain_language_title), "",
           paste0("- Support code: `", code, "` (", if (m$state == "BLOCKED") "waiting for a decision" else "stopped, action needed", ")"),
           paste0("- What happened: ", m$plain_language_summary),
           paste0("- Why it matters: ", m$why_it_matters),
           paste0("- Next action: ", m$next_action),
           paste0("- Who can resolve it: ", m$resolving_role),
           paste0("- Other work can continue: ", if (isTRUE(m$can_continue_elsewhere)) "yes" else "no"),
           paste0("- Work preserved: ", if (isTRUE(m$work_preserved)) "yes" else "no"), "")
}
out <- c(out, "## Success", "", paste0("- ", success_status()$plain_language_title, ": ", success_status()$plain_language_summary), "")
writeLines(out, file.path(root, "docs", "researcher-messages.md"))
cat("wrote docs/researcher-messages.md with", length(MESSAGES), "stops\n")
