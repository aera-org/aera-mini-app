import type {
  ContentItemType,
  IScenarioDetails,
  IScenarioMedia,
  MediaQuery,
  Paginated,
  ScenarioMediaTotals,
  UnblurScenarioVideoResponse,
} from '@/common/types';

import { apiFetch } from './client';

const SCENARIOS_PATH = '/characters/scenarios';
export const SCENARIO_MEDIA_DEFAULT_TAKE = 32;

export const scenarioKeys = {
  all: ['scenarios'] as const,
  details: () => [...scenarioKeys.all, 'detail'] as const,
  detail: (id: string) => [...scenarioKeys.details(), id] as const,
  mediaLists: () => [...scenarioKeys.all, 'media'] as const,
  media: (
    id: string,
    type: ContentItemType,
    params: MediaQuery = {},
  ) => [...scenarioKeys.mediaLists(), id, type, params] as const,
  mediaTotals: (id: string) => [...scenarioKeys.all, 'media-totals', id] as const,
};

function buildQuery(params: MediaQuery = {}) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

async function readJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      text ? `${text} (${response.status})` : `${fallbackMessage} (${response.status})`,
    );
  }

  return (await response.json()) as T;
}

function unwrapScenario(
  data: IScenarioDetails | { data: IScenarioDetails },
): IScenarioDetails {
  if ('id' in data) {
    return data;
  }

  return data.data;
}

function unwrapPaginated<T>(
  data: Paginated<T> | { data: Paginated<T> },
): Paginated<T> {
  if ('total' in data && 'skip' in data && 'take' in data) {
    return data;
  }

  return data.data;
}

function unwrapTotals(
  data: ScenarioMediaTotals | { data: ScenarioMediaTotals },
): ScenarioMediaTotals {
  if ('images' in data && 'videos' in data) {
    return data;
  }

  return data.data;
}

function isScenarioMedia(value: unknown): value is IScenarioMedia {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'url' in value &&
    'type' in value
  );
}

function unwrapMedia(data: unknown): IScenarioMedia {
  if (isScenarioMedia(data)) {
    return data;
  }

  if (typeof data !== 'object' || data === null) {
    throw new Error('Failed to read media response');
  }

  const record = data as Record<string, unknown>;

  if ('data' in record) {
    return unwrapMedia(record.data);
  }

  if ('item' in record) {
    return unwrapMedia(record.item);
  }

  if ('video' in record) {
    return unwrapMedia(record.video);
  }

  throw new Error('Failed to read media response');
}

export async function getScenario(id: string): Promise<IScenarioDetails> {
  const response = await apiFetch(`${SCENARIOS_PATH}/${id}`);
  const data = await readJson<IScenarioDetails | { data: IScenarioDetails }>(
    response,
    'Failed to load scenario',
  );

  return unwrapScenario(data);
}

export async function getScenarioMedia(
  id: string,
  type: ContentItemType,
  params: MediaQuery = {
    skip: 0,
    take: SCENARIO_MEDIA_DEFAULT_TAKE,
  },
): Promise<Paginated<IScenarioMedia>> {
  const response = await apiFetch(
    `${SCENARIOS_PATH}/${id}/${type}${buildQuery(params)}`,
  );
  const data = await readJson<
    Paginated<IScenarioMedia> | { data: Paginated<IScenarioMedia> }
  >(response, 'Failed to load scenario media');

  return unwrapPaginated(data);
}

export async function getScenarioMediaTotals(
  id: string,
): Promise<ScenarioMediaTotals> {
  const response = await apiFetch(`${SCENARIOS_PATH}/${id}/media-totals`);
  const data = await readJson<
    ScenarioMediaTotals | { data: ScenarioMediaTotals }
  >(response, 'Failed to load scenario media totals');

  return unwrapTotals(data);
}

export async function unlockScenario(
  id: string,
): Promise<void> {
  const response = await apiFetch(`${SCENARIOS_PATH}/${id}/unlock`, {
    method: 'POST',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      text
        ? `${text} (${response.status})`
        : `Failed to unlock scenario (${response.status})`,
    );
  }
}

export async function unblurScenarioVideo(
  scenarioId: string,
  videoId: string,
): Promise<IScenarioMedia> {
  const response = await apiFetch(
    `${SCENARIOS_PATH}/${scenarioId}/video/${videoId}/unblur`,
    {
      method: 'POST',
    },
  );
  const data = await readJson<
    | IScenarioMedia
    | UnblurScenarioVideoResponse
    | { data: IScenarioMedia | UnblurScenarioVideoResponse }
  >(response, 'Failed to unlock video');

  return unwrapMedia(data);
}
