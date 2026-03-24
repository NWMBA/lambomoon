import type { NormalizedCryptoRecord } from "./schema.ts";

export interface SourceAdapter<TInput> {
  sourceName: string;
  map(input: TInput): NormalizedCryptoRecord;
}

export interface AdapterBatchResult<TInput> {
  source: string;
  rawCount: number;
  normalized: NormalizedCryptoRecord[];
  raw?: TInput[];
}

export function runAdapter<TInput>(
  sourceName: string,
  inputs: TInput[],
  mapper: (input: TInput) => NormalizedCryptoRecord
): AdapterBatchResult<TInput> {
  return {
    source: sourceName,
    rawCount: inputs.length,
    normalized: inputs.map(mapper),
    raw: inputs,
  };
}
