import { BasestackAdapterError } from "./errors";
import type {
  BasestackErrorResponse,
  BasestackFlag,
  BasestackFlagsClientOptions,
  BasestackFlagsResponse,
  BasestackRawFlag,
} from "./types";
import {
  DEFAULT_ENDPOINT,
  isErrorResponse,
  isFlagsResponse,
  isRawFlag,
  normalizeFlag,
  parseJson,
  trimTrailingSlash,
} from "./utils";

type CacheEntry = {
  value?: BasestackFlag;
  expiresAt: number;
};

type RequestOptions = {
  allowNotFound?: boolean;
};

export class BasestackFlagsClient {
  private readonly endpoint: string;

  private readonly projectKey: string;

  private readonly environmentKey: string;

  private readonly cacheTtlMs: number;

  private readonly requestTimeoutMs?: number;

  private readonly fetchImpl?: typeof fetch;

  private readonly baseHeaders?: HeadersInit;

  private readonly cache = new Map<string, CacheEntry>();

  private readonly pending = new Map<
    string,
    Promise<BasestackFlag | undefined>
  >();

  constructor(options: BasestackFlagsClientOptions) {
    this.projectKey = options.projectKey;
    this.environmentKey = options.environmentKey;
    this.baseHeaders = options.headers;
    this.cacheTtlMs = Math.max(0, options.cacheTtlMs ?? 30_000);
    this.requestTimeoutMs = options.requestTimeoutMs;
    this.fetchImpl = options.fetch ?? globalThis.fetch;
    this.endpoint = trimTrailingSlash(options.endpoint ?? DEFAULT_ENDPOINT);
  }

  async getFlag(slug: string): Promise<BasestackFlag | undefined> {
    const cached = this.getCachedFlag(slug);

    if (cached) {
      return cached;
    }

    const existing = this.pending.get(slug);

    if (existing) {
      return existing;
    }

    const request = this.fetchFlag(slug)
      .then((flag) => {
        if (flag) {
          this.cacheFlag(flag);
        }

        return flag;
      })
      .finally(() => {
        this.pending.delete(slug);
      });

    this.pending.set(slug, request);

    return request;
  }

  async listFlags(): Promise<BasestackFlag[]> {
    const result = await this.request<BasestackFlagsResponse>("/flags", {
      allowNotFound: false,
    });

    if (!result.body || !isFlagsResponse(result.body)) {
      throw new BasestackAdapterError(
        "Unexpected response when listing flags",
        {
          responseBody: result.body,
        }
      );
    }

    const flags = result.body.flags.map(normalizeFlag);

    for (const flag of flags) {
      this.cacheFlag(flag);
    }

    return flags;
  }

  private getCachedFlag(slug: string): BasestackFlag | undefined {
    const entry = this.cache.get(slug);

    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(slug);
      return undefined;
    }

    return entry.value;
  }

  private cacheFlag(flag: BasestackFlag): void {
    if (this.cacheTtlMs <= 0) {
      return;
    }

    this.cache.set(flag.slug, {
      value: flag,
      expiresAt: Date.now() + this.cacheTtlMs,
    });
  }

  private async fetchFlag(slug: string): Promise<BasestackFlag | undefined> {
    if (!slug) {
      throw new BasestackAdapterError("Flag slug can not be empty");
    }

    const result = await this.request<
      BasestackRawFlag | BasestackErrorResponse
    >(`/flags/${encodeURIComponent(slug)}`, {
      allowNotFound: true,
    });

    if (result.status === 404) {
      return undefined;
    }

    if (!result.body) {
      return undefined;
    }

    if (isErrorResponse(result.body)) {
      return undefined;
    }

    if (!isRawFlag(result.body)) {
      throw new BasestackAdapterError(
        "Unexpected response when fetching flag",
        {
          responseBody: result.body,
        }
      );
    }

    return normalizeFlag(result.body);
  }

  private composeHeaders(): Headers {
    const headers = new Headers(this.baseHeaders);
    headers.set("accept", "application/json");
    headers.set("x-project-key", this.projectKey);
    headers.set("x-environment-key", this.environmentKey);

    return headers;
  }

  private async request<T>(
    path: string,
    options: RequestOptions = {}
  ): Promise<{
    status: number;
    body?: T;
  }> {
    if (!this.fetchImpl) {
      throw new BasestackAdapterError(
        "fetch is not available in the current runtime. Provide a custom implementation via options.fetch."
      );
    }

    const controller = this.requestTimeoutMs
      ? new AbortController()
      : undefined;
    const timeoutId = this.requestTimeoutMs
      ? setTimeout(() => controller?.abort(), this.requestTimeoutMs)
      : undefined;

    try {
      const response = await this.fetchImpl(`${this.endpoint}${path}`, {
        method: "GET",
        headers: this.composeHeaders(),
        signal: controller?.signal,
      });

      const text = await response.text();
      const body = parseJson(text);

      if (response.status === 404 && options.allowNotFound) {
        return { status: response.status, body: body as T };
      }

      if (!response.ok) {
        throw new BasestackAdapterError(
          `Basestack API request failed with status ${response.status}`,
          {
            status: response.status,
            responseBody: body ?? text,
          }
        );
      }

      return {
        status: response.status,
        body: body as T,
      };
    } catch (error) {
      if (error instanceof BasestackAdapterError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new BasestackAdapterError(
          `Basestack API request timed out after ${this.requestTimeoutMs}ms`,
          { cause: error }
        );
      }

      throw new BasestackAdapterError(
        "Failed to call the Basestack Flags API",
        {
          cause: error,
        }
      );
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }
}
