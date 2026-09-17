import { describe, expect, it } from "bun:test"
import { applyAdmissionFilters, normalizeLegacyAdmission, uniqueAdmissionValues } from "@/features/admissions/domain/admission"
import { canProceed, isSelectionWithinLimit } from "@/features/admissions/domain/selection"
import { prioritizeByCustomTerm, prioritizeByLocation, sortByPercentage } from "@/features/selection/domain/order"
import { IRAQ_LOCATIONS } from "@/features/selection/data/iraq-locations"

const row = ["1", "1\r\n", "جامعة بغداد/كلية الطب\r\n", "699.5\r\n", "99.9", "297\r\n", "علمي\r\n", "مختلط\r\n"]

describe("admission domain", () => {
  it("maps positional JSON and strips CRLF", () => {
    expect(normalizeLegacyAdmission(row, 0)).toMatchObject({ key: 0, id: 1, sourceId: "1", code: "297", name: "جامعة بغداد/كلية الطب", percent: 99.9, type: "علمي", sex: "مختلط" })
  })

  it("filters by maximum score", () => {
    const data = [normalizeLegacyAdmission(row, 0), { ...normalizeLegacyAdmission(row, 1), percent: 75, name: "جامعة كركوك/هندسة" }]
    const filtered = applyAdmissionFilters(data, { maximumPercent: "80", branch: "", sex: "", name: "" })
    expect(filtered.map((item) => item.percent)).toEqual([75])
  })

  it("combines branch, sex and name filters", () => {
    const item = normalizeLegacyAdmission(row, 0)
    expect(applyAdmissionFilters([item], { maximumPercent: "", branch: "علمي", sex: "مختلط", name: "طب" })).toHaveLength(1)
    expect(applyAdmissionFilters([item], { maximumPercent: "", branch: "ادبي", sex: "مختلط", name: "طب" })).toHaveLength(0)
  })

  it("derives branch values from the dataset", () => {
    const scientific = normalizeLegacyAdmission(row, 0)
    const arts = { ...scientific, key: 2, type: "فنون" }
    expect(uniqueAdmissionValues([scientific, arts], "type")).toEqual(["علمي", "فنون"])
  })

  it("preserves the runtime next-step threshold and 50 selection cap", () => {
    expect(canProceed(1)).toBe(false)
    expect(canProceed(2)).toBe(true)
    expect(isSelectionWithinLimit(Array.from({ length: 50 }, (_, index) => String(index)))).toBe(true)
    expect(isSelectionWithinLimit(Array.from({ length: 51 }, (_, index) => String(index)))).toBe(false)
  })
})

describe("selection ordering", () => {
  const base = normalizeLegacyAdmission(row, 0)
  const items = [
    { ...base, key: 1, name: "جامعة بغداد / طب", percent: 90 },
    { ...base, key: 2, name: "جامعة كركوك / هندسة", percent: 95 },
    { ...base, key: 3, name: "جامعة كركوك / علوم", percent: 80 },
    { ...base, key: 4, name: "جامعة البصرة / قانون", percent: 85 }
  ]

  it("sorts percentage highest first", () => {
    expect(sortByPercentage(items).map((item) => item.percent)).toEqual([95, 90, 85, 80])
  })

  it("prioritizes a preset location stably", () => {
    const kirkuk = IRAQ_LOCATIONS.find((location) => location.id === "kirkuk")!
    const result = prioritizeByLocation(items, kirkuk)
    expect(result.matches).toBe(2)
    expect(result.items.map((item) => item.key)).toEqual([2, 3, 1, 4])
  })

  it("prioritizes any custom city text", () => {
    const result = prioritizeByCustomTerm(items, "بغداد")
    expect(result.matches).toBe(1)
    expect(result.items[0]?.key).toBe(1)
  })

  it("resolves common English city names to Arabic source names", () => {
    const result = prioritizeByCustomTerm(items, "Kirkuk")
    expect(result.matches).toBe(2)
    expect(result.items.slice(0, 2).map((item) => item.key)).toEqual([2, 3])
  })
})
