import type { TFunction } from "i18next"
import type { Admission, AdmissionFilters } from "./types"

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
