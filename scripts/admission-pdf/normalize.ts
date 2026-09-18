import type { ExtractedAdmissionRow, GeneratedAdmission } from "./types"

function parseFiniteNumber(value: string, label: string, recordNumber: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid ${label} "${value}" at extracted record ${recordNumber}`)
  }
  return parsed
}

export function normalizeAdmissions(rows: ExtractedAdmissionRow[]): GeneratedAdmission[] {
  return rows.map((row, index) => {
    const recordNumber = index + 1
    return {
      sourceId: String(recordNumber),
      code: row.preference.trim(),
      name: row.university.trim(),
      degreeAll: parseFiniteNumber(row.total, "total degree", recordNumber),
      percent: parseFiniteNumber(row.average, "percentage", recordNumber),
      type: row.branch.trim(),
      sex: row.gender.trim(),
    }
  })
}
