import type { Identify, Origin } from "flags";
import type { BasestackAdapterError } from "./errors";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface BasestackRawFlag {
  slug: string;
  enabled: boolean;
  payload?: JsonValue | null;
  expiredAt?: string | null;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface BasestackFlag {
  slug: string;
  enabled: boolean;
  payload: JsonValue | null;
  expiredAt: Date | null;
  description: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface BasestackFlagsResponse {
  flags: BasestackRawFlag[];
}

export interface BasestackErrorResponse {
  error: true;
  message?: string;
}

export type BasestackFlagsClientOptions = {
  projectKey: string;
  environmentKey: string;
  endpoint?: string;
  headers?: HeadersInit;
  fetch?: typeof fetch;
  cacheTtlMs?: number;
  requestTimeoutMs?: number;
};

export type BasestackFlagValueResolver<ValueType> = (
  flag: BasestackFlag
) => ValueType | undefined;

export type BasestackAdapterOptions<
  ValueType,
  EntitiesType = undefined
> = BasestackFlagsClientOptions & {
  resolveValue?: BasestackFlagValueResolver<ValueType>;
  onError?: (error: BasestackAdapterError) => void;
  origin?: Origin | string | ((key: string) => Origin | string | undefined);
  reportValue?: boolean;
  prefetch?: "none" | "all";
  identify?: Identify<EntitiesType>;
};
