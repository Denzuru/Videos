# Configuration loading and validation.

load_config <- function(path) {
  if (!file.exists(path)) stop_firdous("CONFIG_MISSING", list(path = path))
  cfg <- tryCatch(yaml::read_yaml(path), error = function(e) {
    stop_firdous("CONFIG_INVALID", list(detail = "the file is not valid YAML"),
                 technical = conditionMessage(e))
  })
  required <- c("config_version", "data_classification", "project", "research_plan",
                "governance", "analysis_plan", "data", "stages", "outputs")
  missing <- setdiff(required, names(cfg))
  if (length(missing) > 0) {
    stop_firdous("CONFIG_INVALID",
                 list(detail = paste("missing section(s):", paste(missing, collapse = ", "))))
  }
  cfg$.path <- normalizePath(path, mustWork = TRUE)
  cfg$.sha256 <- sha256_file(cfg$.path)
  cfg
}

# Resolve a data path relative to the runner root.
resolve_data_path <- function(root, p) {
  if (is.null(p)) return(NA_character_)
  if (grepl("^/", p)) return(p)
  file.path(root, p)
}

# Effective configuration fingerprint: canonical JSON of the config content
# excluding private fields, so the same decisions always hash the same.
config_fingerprint <- function(cfg) {
  cfg[grepl("^\\.", names(cfg))] <- NULL
  sha256_string(to_canonical_json(cfg))
}
