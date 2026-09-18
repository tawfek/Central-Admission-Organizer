import type { GeneratedAdmission } from "./types"

export interface AdmissionValidationResult {
  duplicateSourceIds: string[]
  branches: string[]
  sexes: string[]
}

export function validateAdmissions(records: GeneratedAdmission[]): AdmissionValidationResult {
  if (records.length === 0) throw new Error("No admission records were extracted from the PDF")

  const seen = new Set<string>()
  const duplicateSourceIds = new Set<string>()

  for (const [index, record] of records.entries()) {
    const number = index + 1
    if (!record.sourceId) throw new Error(`Missing sourceId at record ${number}`)
    if (!record.name) throw new Error(`Missing university/department name at record ${number}`)
    if (!record.code) throw new Error(`Missing preference code at record ${number}`)
    if (!record.type) throw new Error(`Missing branch at record ${number}`)
    if (!record.sex) throw new Error(`Missing sex at record ${number}`)
    if (!Number.isFinite(record.degreeAll)) throw new Error(`Invalid total degree at record ${number}`)
    if (!Number.isFinite(record.percent)) throw new Error(`Invalid percentage at record ${number}`)

    if (seen.has(record.sourceId)) duplicateSourceIds.add(record.sourceId)
    seen.add(record.sourceId)
  }

  if (duplicateSourceIds.size > 0) {
    throw new Error(`Duplicate source IDs detected: ${[...duplicateSourceIds].join(", ")}`)
  }

  return {
    duplicateSourceIds: [...duplicateSourceIds],
    branches: [...new Set(records.map((record) => record.type))].sort((a, b) => a.localeCompare(b, "ar")),
    sexes: [...new Set(records.map((record) => record.sex))].sort((a, b) => a.localeCompare(b, "ar")),
  }
}
