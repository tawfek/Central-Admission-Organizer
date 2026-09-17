import type { Admission } from "@/features/admissions/domain/types"
import { findIraqLocationByEnglishAlias, type IraqLocation } from "../data/iraq-locations"

export function normalizeArabicSearch(value: string) {
  return value
    .toLocaleLowerCase("ar")
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[\s\-_/،,.()]+/g, " ")
    .trim()
}

function includesTerm(name: string, term: string) {
  const normalizedName = normalizeArabicSearch(name)
  const normalizedTerm = normalizeArabicSearch(term)
  return normalizedTerm.length > 0 && normalizedName.includes(normalizedTerm)
}

function prioritizeByAliases(items: Admission[], aliases: string[]) {
  const matches: Admission[] = []
  const rest: Admission[] = []
  for (const item of items) {
    if (aliases.some((alias) => includesTerm(item.name, alias))) matches.push(item)
    else rest.push(item)
  }
  return { items: [...matches, ...rest], matches: matches.length }
}

export function prioritizeByLocation(items: Admission[], location: IraqLocation) {
  return prioritizeByAliases(items, location.aliases)
}

export function prioritizeByCustomTerm(items: Admission[], term: string) {
  const presetFromEnglish = findIraqLocationByEnglishAlias(term)
  if (presetFromEnglish) return prioritizeByAliases(items, presetFromEnglish.aliases)
  return prioritizeByAliases(items, [term])
}

export function sortByPercentage(items: Admission[]) {
  return [...items].sort((a, b) => b.percent - a.percent)
}
