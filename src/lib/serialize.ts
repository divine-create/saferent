/**
 * Recursively convert BigInt to number for JSON serialization.
 * Without this, JSON.stringify throws "TypeError: Do not know how to serialize a BigInt".
 */
export function serializePrisma<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );
}
