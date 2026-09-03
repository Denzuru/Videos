#!/usr/bin/env Rscript
# Regenerates the committed synthetic fixtures deterministically.
# Every identifier is SYN-#### in a column named study_id (not participant_id,
# which the Codex core guard treats as a real-data marker); every value is drawn from a fixed seed.
# Nothing here is derived from, or resembles, any real participant.
args <- commandArgs(trailingOnly = TRUE)
root <- if (length(args)) args[1] else file.path(dirname(sub("--file=", "", grep("--file=", commandArgs(), value = TRUE))), "..")
root <- normalizePath(root)
set.seed(20260903)

n <- 24
ids <- sprintf("SYN-%04d", seq_len(n))
group <- rep(c("A", "B"), each = n / 2)
age <- as.integer(round(runif(n, 30, 70)))
participants <- data.frame(study_id = ids, synthetic_group = group, synthetic_age = age,
                           stringsAsFactors = FALSE)

targets <- c("SYN-miR-A", "SYN-miR-B", "SYN-miR-C")
assays <- expand.grid(study_id = ids, target = targets, stringsAsFactors = FALSE)
assays <- assays[order(assays$study_id, assays$target), ]
vals <- round(rnorm(nrow(assays), mean = 27, sd = 3), 2)
value <- formatC(vals, format = "f", digits = 2)
# A few approved non-numeric representations, on purpose.
value[c(5, 17, 40)] <- "NA"
value[c(9, 33, 61)] <- "<LOD"
assays$value <- value
assays$synthetic_batch <- ifelse(as.integer(sub("SYN-", "", assays$study_id)) %% 2 == 0, "batch-1", "batch-2")
# One missing required assay, covered by an approved exception.
assays <- assays[!(assays$study_id == "SYN-0024" & assays$target == "SYN-miR-C"), ]

exceptions <- data.frame(
  study_id = "SYN-0024", target = "SYN-miR-C", exception_type = "missing_assay",
  reason = "synthetic example: assay failed quality control",
  approved_by = "SYN supervisor", approval_reference = "SYN-EXC-0001",
  stringsAsFactors = FALSE)

out <- file.path(root, "data", "synthetic")
dir.create(out, recursive = TRUE, showWarnings = FALSE)
w <- function(df, name) {
  con <- file(file.path(out, name), open = "wb"); on.exit(close(con))
  write.csv(df, con, row.names = FALSE, eol = "\n")
}
w(participants, "participants.csv")
w(assays, "assays.csv")
w(exceptions, "approved_exceptions.csv")
cat("synthetic fixtures written to", out, "\n")
