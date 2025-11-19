import type { Adapter } from "@vercel/flags";
import { BasestackFlagsClient } from "./client";
import { BasestackAdapterError, isBasestackAdapterError } from "./errors";
import type {
  BasestackAdapterOptions,
  BasestackFlag,
  BasestackFlagValueResolver
} from "./types";

const defaultResolver: BasestackFlagValueResolver<unknown> = (flag) =>
  (flag.payload ?? flag.enabled) as unknown;

const normalizeOptions = <ValueType, EntitiesType>(
  options: BasestackAdapterOptions<ValueType, EntitiesType>
) => ({
  ...options,
  prefetch: options.prefetch ?? "none"
});

export const createBasestackAdapter = <ValueType = unknown, EntitiesType = undefined>(
  rawOptions: BasestackAdapterOptions<ValueType, EntitiesType>
): Adapter<ValueType, EntitiesType> => {
  if (!rawOptions?.projectKey) {
    throw new BasestackAdapterError("'projectKey' is required to create the adapter");
  }

  if (!rawOptions.environmentKey) {
    throw new BasestackAdapterError(
      "'environmentKey' is required to create the adapter"
    );
  }

  const options = normalizeOptions(rawOptions);

  const client = new BasestackFlagsClient({
    projectKey: options.projectKey,
    environmentKey: options.environmentKey,
    endpoint: options.endpoint,
    headers: options.headers,
    fetch: options.fetch,
    cacheTtlMs: options.cacheTtlMs,
    requestTimeoutMs: options.requestTimeoutMs
  });

  const resolver: BasestackFlagValueResolver<ValueType> =
    (options.resolveValue as BasestackFlagValueResolver<ValueType>) ??
    ((flag: BasestackFlag) => defaultResolver(flag) as ValueType);

  const handleError = (error: unknown): void => {
    const adapterError = isBasestackAdapterError(error)
      ? error
      : new BasestackAdapterError("Failed to resolve flag value", { cause: error });

    options.onError?.(adapterError);
  };

  const adapter: Adapter<ValueType, EntitiesType> = {
    origin: options.origin,
    config: options.reportValue === undefined ? { reportValue: true } : { reportValue: options.reportValue },
    identify: options.identify,
    initialize:
      options.prefetch === "all"
        ? async () => {
            try {
              await client.listFlags();
            } catch (error) {
              handleError(error);
            }
          }
        : undefined,
    decide: async ({ key }) => {
      try {
        const flag = await client.getFlag(key);

        if (!flag) {
          return undefined as ValueType;
        }

        return resolver(flag) ?? (undefined as ValueType);
      } catch (error) {
        handleError(error);
        return undefined as ValueType;
      }
    }
  };

  return adapter;
};
