import type {
  ReconcileTranslationsResponse,
  ScrapeLog,
  ScrapeRun, ScrapeStepRun,
  SiteKey,
  StartFetchResponse,
  StartListResponse,
  StartPersistResponse, TranslationReviewActionResponse, TranslationReviewItem, TranslationReviewOccurrence
} from "@/features/admin/types";
import {client} from "@/shared/api/client.ts";
const scrapingRoutes = {
    startList:
      "/admin/scraping/start-list",

    runs:
      "/admin/scraping/runs",

    run: (
      runId: number,
    ) => `/admin/scraping/runs/${runId}`,

    startFetch: (
      runId: number,
    ) =>
      `/admin/scraping/runs/${runId}/start-fetch`,

    startPersist: (
      runId: number,
    ) =>
      `/admin/scraping/runs/${runId}/start-persist`,

    steps: (
      runId: number,
    ) =>
      `/admin/scraping/runs/${runId}/steps`,

    logs: (
      runId: number,
    ) =>
      `/admin/scraping/runs/${runId}/logs`,

    reconcileTranslations: (
      runId: number,
    ) =>
      `/admin/scraping/runs/${runId}/reconcile-translations`,
  }

const translationReviews = {
    list:
      "/admin/translation_reviews",

    item: (
      itemId: number,
    ) =>
      `/admin/translation_reviews/${itemId}`,

    occurrences: (
      itemId: number,
    ) =>
      `/admin/translation_reviews/${itemId}/occurrences`,

    resolve: (
      itemId: number,
    ) =>
      `/admin/translation_reviews/${itemId}/resolve`,

    ignore: (
      itemId: number,
    ) =>
      `/admin/translation_reviews/${itemId}/ignore`,
  }

export const adminScrapingApi = {
  async startList(
    site: SiteKey,
  ): Promise<StartListResponse> {
    const response =
      await client.post<StartListResponse>(
        scrapingRoutes.startList,
        {
          site,
        },
      );

    return response.data;
  },

  async startFetch(
    runId: number,
  ): Promise<StartFetchResponse> {
    const response =
      await client.post<StartFetchResponse>(
        scrapingRoutes.startFetch(runId),
      );

    return response.data;
  },

  async startPersist(
    runId: number,
  ): Promise<StartPersistResponse> {
    const response =
      await client.post<StartPersistResponse>(
        scrapingRoutes.startPersist(runId),
      );

    return response.data;
  },

  async getRun(
    runId: number,
  ): Promise<ScrapeRun> {
    const response =
      await client.get<ScrapeRun>(
        scrapingRoutes.run(runId),
      );

    return response.data;
  },

  async getSteps(
    runId: number,
  ): Promise<ScrapeStepRun[]> {
    const response =
      await client.get<ScrapeStepRun[]>(
        scrapingRoutes.steps(runId),
      );

    return response.data;
  },

  async getLogs(
    runId: number,
  ): Promise<ScrapeLog[]> {
    const response =
      await client.get<ScrapeLog[]>(
        scrapingRoutes.logs(runId),
      );

    return response.data;
  },

  async listRuns(
    siteKey?: SiteKey,
    limit = 20,
  ): Promise<ScrapeRun[]> {
    const response =
      await client.get<ScrapeRun[]>(
        scrapingRoutes.runs,
        {
          params: {
            site_key: siteKey,
            limit,
          },
        },
      );

    return response.data;
  },

  async listTranslationReviews(
    status?: string,
    fieldName?: string,
  ): Promise<TranslationReviewItem[]> {
    const response = await client.get<
      TranslationReviewItem[]
    >(
      translationReviews.list,
      {
        params: {
          status,
          field_name: fieldName,
        },
      },
    );

    return response.data;
  },

  async getTranslationReviewOccurrences(
    itemId: number,
  ): Promise<TranslationReviewOccurrence[]> {
    const response = await client.get<
      TranslationReviewOccurrence[]
    >(
      translationReviews.occurrences(itemId),
    );

    return response.data;
  },

  async resolveTranslationReview(
    itemId: number,
    targetValue: string,
  ): Promise<TranslationReviewActionResponse> {
    const response = await client.post<
      TranslationReviewActionResponse
    >(
      translationReviews.resolve(itemId),
      {
        target_value: targetValue,
      },
    );

    return response.data;
  },

  async ignoreTranslationReview(
    itemId: number,
  ): Promise<TranslationReviewActionResponse> {
    const response = await client.post<
      TranslationReviewActionResponse
    >(
      translationReviews.ignore(itemId),
    );

    return response.data;
  },

  async reconcileTranslations(
    runId: number,
  ): Promise<ReconcileTranslationsResponse> {
    const response = await client.post<
      ReconcileTranslationsResponse
    >(
      scrapingRoutes.reconcileTranslations(runId),
    );

    return response.data;
  },
};