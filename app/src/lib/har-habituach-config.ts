/**
 * Har Habituach Excel file parsing configuration.
 * Change these values if the Excel format changes.
 */
export const HAR_HABITUACH_CONFIG = {
  /** 0-based row index where headers are located */
  headerRow: 3,

  /** 0-based column index that, when empty, indicates a sub-section row */
  sectionIndicatorColumn: 0,

  /** 0-based column index containing the sub-section name */
  sectionNameColumn: 1,

  /** Field name added to each record to store its parent sub-section */
  sectionFieldName: "section",

  /** Rows before headerRow are metadata/title rows and will be skipped */
} as const;
