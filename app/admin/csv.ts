import Papa from "papaparse";

// Parse a CSV File into lowercase-keyed row objects. Uses papaparse so
// quoted fields (e.g. a team name containing a comma) are handled.
export function parseCsv(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (res) => resolve(res.data),
      error: (err) => reject(err),
    });
  });
}

export function requireCols(
  rows: Record<string, string>[],
  cols: string[]
): string | null {
  if (rows.length === 0) return "CSV has no data rows.";
  const have = new Set(Object.keys(rows[0]));
  const missing = cols.filter((c) => !have.has(c));
  return missing.length ? `Missing column(s): ${missing.join(", ")}` : null;
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;
export function isISODate(s: string): boolean {
  return ISO.test(s.trim());
}

// "3-1" -> [3, 1]; "" -> null; throws on malformed.
export function parseScore(s: string): [number, number] | null {
  const v = s.trim();
  if (!v) return null;
  const parts = v.split("-").map((n) => Number(n.trim()));
  if (parts.length !== 2 || parts.some(Number.isNaN)) {
    throw new Error(`Bad score "${s}" — use blue-gold like 3-1`);
  }
  return [parts[0], parts[1]];
}

export const KINDS = ["pickup", "tournament", "social"] as const;
