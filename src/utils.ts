import type {
  BasestackErrorResponse,
  BasestackFlag,
  BasestackFlagsResponse,
  BasestackRawFlag,
} from "./types";

export const DEFAULT_ENDPOINT = "https://flags-api.basestack.co/v1";

export const trimTrailingSlash = (value: string): string =>
  value.replace(/\/+$/, "");

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const parseJson = (raw: string): unknown => {
  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

export const isErrorResponse = (
  value: unknown
): value is BasestackErrorResponse => isRecord(value) && value.error === true;

const isValidDate = (value: string | null | undefined): value is string =>
  typeof value === "string" && value.length > 0;

export const normalizeFlag = (raw: BasestackRawFlag): BasestackFlag => ({
  slug: raw.slug,
  enabled: Boolean(raw.enabled),
  payload: raw.payload ?? null,
  expiredAt: isValidDate(raw.expiredAt) ? new Date(raw.expiredAt) : null,
  description: raw.description ?? null,
  createdAt: isValidDate(raw.createdAt) ? new Date(raw.createdAt) : null,
  updatedAt: isValidDate(raw.updatedAt) ? new Date(raw.updatedAt) : null,
});

export const isRawFlag = (value: unknown): value is BasestackRawFlag => {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.slug === "string" && typeof value.enabled === "boolean";
};

export const isFlagsResponse = (
  value: unknown
): value is BasestackFlagsResponse => {
  if (!isRecord(value) || !Array.isArray(value.flags)) {
    return false;
  }

  return value.flags.every(isRawFlag);
};
