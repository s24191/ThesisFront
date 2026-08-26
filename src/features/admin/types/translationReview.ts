export type TranslationReviewStatus =
  string;

export type TranslationReviewItem = {
  id: number;
  field_name: string;
  source_value: string;
  status: TranslationReviewStatus;
  translation_mapping_id: number | null;
  created_at: string;
  mapped_at: string | null;
  occurrence_count: number;
};

export type TranslationReviewOccurrence = {
  id: number;
  translation_review_item_id: number;
  source_url: string;
  status: string;
  created_at: string;

  original_step_run_id: number;
  original_run_id: number;
  site_key: string;
  site_name: string;

  reprocessed_at: string | null;
  reprocessed_step_run_id: number | null;
  reprocess_error: string | null;
};

export type TranslationReviewActionResponse = {
  id: number;
  field_name: string;
  source_value: string;
  status: TranslationReviewStatus;
  translation_mapping_id: number | null;
  affected_occurrences: number;
};

export type ReconcileTranslationsResponse = {
  source_run_id: number;
  source_fetch_step_id: number;

  site: string;

  mode:
    | "merge_existing_csv"
    | "create_reprocess_run";

  resolved_occurrence_count: number;
  ignored_occurrence_count: number;

  status: string;
};