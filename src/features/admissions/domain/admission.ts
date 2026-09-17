import type { TFunction } from "i18next"
import type { Admission, AdmissionFilters } from "./types"

type LegacyAdmission = Array<string | number | null>

const clean = (value: unknown) => String(value ?? "").replace(/\r?\n/g, "").trim()

export function normalizeLegacyAdmission(row: LegacyAdmission, index: number): Admission {
  const percent = Number.parseFloat(clean(row[4]))
  const degreeAll = Number.parseFloat(clean(row[3]))
  return {
    key: index,
    id: index + 1,
    sourceId: clean(row[1]),
    code: clean(row[5]),
    name: clean(row[2]),
    degreeAll: Number.isFinite(degreeAll) ? degreeAll : null,
    percent: Number.isFinite(percent) ? percent : 0,
    rawType: clean(row[6]),
    type: clean(row[6]),
    sex: clean(row[7])
  }
}

export function applyAdmissionFilters(rows: Admission[], filters: AdmissionFilters): Admission[] {
  const max = filters.maximumPercent.trim() === "" ? null : Number.parseFloat(filters.maximumPercent)
  const name = filters.name.trim().toLocaleLowerCase("ar")
  return rows.filter((row) => {
    if (max !== null && Number.isFinite(max) && row.percent > max) return false
    if (filters.branch && row.type !== filters.branch) return false
    if (filters.sex && row.sex !== filters.sex) return false
    if (name && !row.name.toLocaleLowerCase("ar").includes(name)) return false
    return true
  })
}

export function percentTone(percent: number): "destructive" | "warning" | "success" {
  if (percent < 60) return "destructive"
  if (percent < 80) return "warning"
  return "success"
}

const branchKeys: Record<string, string> = {
  "علمي": "branches.scientific",
  "ادبي": "branches.literary",
  "أدبي": "branches.literary",
  "مهني": "branches.vocational",
  "فنون": "branches.arts"
}

const sexKeys: Record<string, string> = {
  "مختلط": "sex.mixed",
  "ذكر": "sex.male",
  "انثى": "sex.female",
  "أنثى": "sex.female"
}

export function translateBranch(value: string, t: TFunction) {
  const key = branchKeys[value]
  return key ? t(key) : value
}

export function translateSex(value: string, t: TFunction) {
  const key = sexKeys[value]
  return key ? t(key) : value
}

export function uniqueAdmissionValues(rows: Admission[], field: "type" | "sex") {
  const values = [...new Set(rows.map((row) => row[field]).filter(Boolean))]
  const preferred = field === "type"
    ? ["علمي", "ادبي", "أدبي", "مهني", "فنون"]
    : ["مختلط", "ذكر", "انثى", "أنثى"]
  return values.sort((a, b) => {
    const aIndex = preferred.indexOf(a)
    const bIndex = preferred.indexOf(b)
    if (aIndex >= 0 || bIndex >= 0) {
      if (aIndex < 0) return 1
      if (bIndex < 0) return -1
      return aIndex - bIndex
    }
    return a.localeCompare(b, "ar")
  })
}
