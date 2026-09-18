import { describe, expect, it } from "bun:test"
import admissions from "@/features/admissions/data/admissions.json"
import importReport from "@/features/admissions/data/admission-import-report.json"
import { applyAdmissionFilters, uniqueAdmissionValues } from "@/features/admissions/domain/admission"
import { canProceed, isSelectionWithinLimit } from "@/features/admissions/domain/selection"
import type { Admission } from "@/features/admissions/domain/types"
import { prioritizeByCustomTerm, prioritizeByLocation, sortByPercentage } from "@/features/selection/domain/order"
import { IRAQ_LOCATIONS } from "@/features/selection/data/iraq-locations"
import { createEmptySelectionState, pruneUnavailableSelectionState, reconcileSelectionState, resetSelectionOrderState, setOrderedSelectionState } from "@/features/selection/domain/selection-state"
import { buildSelectionShareUrl, readSharedSelectionIds } from "@/features/selection/domain/share"
import { isTelegramLaunchHash, isTelegramPlatform } from "@/integrations/telegram/telegram"
import { buildTelegramMiniAppUrl, TELEGRAM_MINI_APP_URL } from "@/config/telegram"
import { normalizeAdmissions } from "../scripts/admission-pdf/normalize"
import { validateAdmissions } from "../scripts/admission-pdf/validate"

const base: Admission = {
  sourceId: "1",
  code: "297",
  name: "جامعة بغداد/كلية الطب",
  degreeAll: 699.5,
  percent: 99.9,
  type: "علمي",
  sex: "مختلط",
}

describe("generated admission data", () => {
  it("ships semantic admission objects instead of positional rows", () => {
    expect(admissions[0]).toEqual({
      sourceId: "1",
      code: "295",
      name: "جامعة بغداد / كلية الطب",
      degreeAll: 709.84,
      percent: 101.41,
      type: "علمي",
      sex: "مختلط",
    })
  })

  it("matches the deterministic PDF import report", () => {
    expect(admissions).toHaveLength(importReport.extraction.records)
    expect(importReport.extraction.records).toBe(1222)
    expect(importReport.extraction.rejectedRows).toBe(0)
    expect(importReport.extraction.duplicateSourceIds).toBe(0)
    expect(importReport.extraction.tablePages).toBe(24)
  })

  it("normalizes extracted PDF rows into application records", () => {
    expect(normalizeAdmissions([{
      university: "جامعة بغداد / كلية الطب",
      total: "709.84",
      average: "101.41",
      preference: "295",
      branch: "علمي",
      gender: "مختلط",
    }])).toEqual([{
      sourceId: "1",
      code: "295",
      name: "جامعة بغداد / كلية الطب",
      degreeAll: 709.84,
      percent: 101.41,
      type: "علمي",
      sex: "مختلط",
    }])
  })

  it("validates unique IDs and derives dataset values", () => {
    const result = validateAdmissions([base, { ...base, sourceId: "2", type: "فنون", sex: "انثى" }])
    expect(result.duplicateSourceIds).toEqual([])
    expect(result.branches).toEqual(["علمي", "فنون"])
    expect(result.sexes).toEqual(["انثى", "مختلط"])
  })
})

describe("admission domain", () => {
  it("filters by maximum score", () => {
    const data = [base, { ...base, sourceId: "2", percent: 75, name: "جامعة كركوك/هندسة" }]
    const filtered = applyAdmissionFilters(data, { maximumPercent: "80", branch: "", sex: "", name: "" })
    expect(filtered.map((item) => item.percent)).toEqual([75])
  })

  it("combines branch, sex and name filters", () => {
    expect(applyAdmissionFilters([base], { maximumPercent: "", branch: "علمي", sex: "مختلط", name: "طب" })).toHaveLength(1)
    expect(applyAdmissionFilters([base], { maximumPercent: "", branch: "ادبي", sex: "مختلط", name: "طب" })).toHaveLength(0)
  })

  it("derives branch values from the dataset", () => {
    const arts = { ...base, sourceId: "2", type: "فنون" }
    expect(uniqueAdmissionValues([base, arts], "type")).toEqual(["علمي", "فنون"])
  })

  it("preserves the runtime next-step threshold and 50 selection cap", () => {
    expect(canProceed(1)).toBe(false)
    expect(canProceed(2)).toBe(true)
    expect(isSelectionWithinLimit(Array.from({ length: 50 }, (_, index) => String(index)))).toBe(true)
    expect(isSelectionWithinLimit(Array.from({ length: 51 }, (_, index) => String(index)))).toBe(false)
  })
})

describe("selection ordering", () => {
  const items: Admission[] = [
    { ...base, sourceId: "1", name: "جامعة بغداد / طب", percent: 90 },
    { ...base, sourceId: "2", name: "جامعة كركوك / هندسة", percent: 95 },
    { ...base, sourceId: "3", name: "جامعة كركوك / علوم", percent: 80 },
    { ...base, sourceId: "4", name: "جامعة البصرة / قانون", percent: 85 },
  ]

  it("sorts percentage highest first", () => {
    expect(sortByPercentage(items).map((item) => item.percent)).toEqual([95, 90, 85, 80])
  })

  it("prioritizes a preset location stably", () => {
    const kirkuk = IRAQ_LOCATIONS.find((location) => location.id === "kirkuk")!
    const result = prioritizeByLocation(items, kirkuk)
    expect(result.matches).toBe(2)
    expect(result.items.map((item) => item.sourceId)).toEqual(["2", "3", "1", "4"])
  })

  it("prioritizes any custom city text", () => {
    const result = prioritizeByCustomTerm(items, "بغداد")
    expect(result.matches).toBe(1)
    expect(result.items[0]?.sourceId).toBe("1")
  })

  it("resolves common English city names to Arabic source names", () => {
    const result = prioritizeByCustomTerm(items, "Kirkuk")
    expect(result.matches).toBe(2)
    expect(result.items.slice(0, 2).map((item) => item.sourceId)).toEqual(["2", "3"])
  })
})

describe("persistent selection state", () => {
  it("preserves the existing manual order, removes deselected items, and appends new choices", () => {
    let state = reconcileSelectionState(createEmptySelectionState(), ["A", "B", "C", "D"])
    state = setOrderedSelectionState(state, ["C", "A", "D", "B"])
    state = reconcileSelectionState(state, ["B", "C", "D", "E", "F"])

    expect(state.orderedIds).toEqual(["C", "D", "B", "E", "F"])
    expect(state.selectionSequenceIds).toEqual(["B", "C", "D", "E", "F"])
    expect(state.hasCustomOrder).toBe(true)
  })

  it("appends a choice to the end when it is deselected and later selected again", () => {
    let state = reconcileSelectionState(createEmptySelectionState(), ["A", "B", "C"])
    state = setOrderedSelectionState(state, ["C", "A", "B"])
    state = reconcileSelectionState(state, ["A", "C"])
    state = reconcileSelectionState(state, ["A", "C", "B"])

    expect(state.orderedIds).toEqual(["C", "A", "B"])
    expect(state.selectionSequenceIds).toEqual(["A", "C", "B"])
  })

  it("prunes saved choices that no longer exist in a newer dataset", () => {
    let state = reconcileSelectionState(createEmptySelectionState(), ["A", "B", "C"])
    state = setOrderedSelectionState(state, ["C", "A", "B"])
    state = pruneUnavailableSelectionState(state, ["A", "C"])

    expect(state.selectedIds).toEqual(["A", "C"])
    expect(state.orderedIds).toEqual(["C", "A"])
  })

  it("resets to the original selection sequence without changing membership", () => {
    let state = reconcileSelectionState(createEmptySelectionState(), ["A", "B", "C"])
    state = setOrderedSelectionState(state, ["C", "A", "B"])
    state = resetSelectionOrderState(state)

    expect(state.orderedIds).toEqual(["A", "B", "C"])
    expect(state.selectedIds).toEqual(["A", "B", "C"])
    expect(state.hasCustomOrder).toBe(false)
  })
})

describe("share links", () => {
  it("encodes the ordered source IDs in a short share URL", () => {
    const items = [
      { ...base, sourceId: "103" },
      { ...base, sourceId: "271" },
      { ...base, sourceId: "287" },
    ]

    const url = buildSelectionShareUrl(
      items,
      "https://tawfek.github.io/Central-Admission-Organizer",
    )

    expect(url).toBe(
      "https://tawfek.github.io/Central-Admission-Organizer/#/selection?choices=103%2C271%2C287",
    )
  })

  it("restores shared choice IDs from the hash without duplicates", () => {
    expect(
      readSharedSelectionIds("#/selection?choices=103%2C271%2C103%2C287"),
    ).toEqual(["103", "271", "287"])
  })
})


describe("telegram integration", () => {
  it("detects Telegram launch fragments without confusing app routes", () => {
    expect(isTelegramLaunchHash("#tgWebAppData=abc&tgWebAppVersion=9.1&tgWebAppPlatform=android")).toBe(true)
    expect(isTelegramLaunchHash("#tgWebAppVersion=9.1&tgWebAppPlatform=ios")).toBe(true)
    expect(isTelegramLaunchHash("#/")).toBe(false)
    expect(isTelegramLaunchHash("#/selection?choices=1%2C2")).toBe(false)
    expect(isTelegramLaunchHash("")).toBe(false)
  })

  it("detects Telegram platforms without treating a normal browser as Telegram", () => {
    expect(isTelegramPlatform("android")).toBe(true)
    expect(isTelegramPlatform("ios")).toBe(true)
    expect(isTelegramPlatform("tdesktop")).toBe(true)
    expect(isTelegramPlatform("unknown")).toBe(false)
    expect(isTelegramPlatform(undefined)).toBe(false)
  })
})


describe("telegram public configuration", () => {
  it("builds the configured direct Mini App URL", () => {
    expect(TELEGRAM_MINI_APP_URL).toBe("https://t.me/LuckySix7_Bot/admission")
    expect(buildTelegramMiniAppUrl("example")).toBe(
      "https://t.me/LuckySix7_Bot/admission?startapp=example",
    )
  })
})
