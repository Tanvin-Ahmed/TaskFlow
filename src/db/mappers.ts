type TimestampLike = Date | string | null | undefined;

const toIso = (value: TimestampLike) => {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return value;
};

type RowWithMeta = {
  id: string;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
  [key: string]: unknown;
};

const nullToUndefined = <T extends Record<string, unknown>>(obj: T) => {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    next[key] = value === null ? undefined : value;
  }
  return next as { [K in keyof T]: Exclude<T[K], null> };
};

/**
 * Map a Drizzle row to the Appwrite-compatible document shape the UI expects.
 */
export function toDocument<T extends RowWithMeta>(row: T) {
  const { id, createdAt, updatedAt, ...rest } = row;
  return {
    ...nullToUndefined(rest),
    $id: id,
    $createdAt: toIso(createdAt),
    $updatedAt: toIso(updatedAt),
  };
}

export function toList<T extends RowWithMeta>(rows: T[]) {
  return {
    documents: rows.map((row) => toDocument(row)),
    total: rows.length,
  };
}

export function toDocumentWithExtras<T extends RowWithMeta>(
  row: T,
  extras: Record<string, unknown>,
) {
  return {
    ...toDocument(row),
    ...extras,
  };
}
