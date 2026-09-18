import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs"
import type {
  ExtractedAdmissionRow,
  PdfExtractionResult,
  PdfTextItem,
  RejectedPdfRow,
  VisualRow,
} from "./types"

const BRANCHES = [
  "احيائي",
  "أحيائي",
  "تطبيقي",
  "علمي",
  "ادبي",
  "أدبي",
  "فنون",
  "مهني",
]

const GENDERS = [
  "مختلط",
  "انثى",
  "أنثى",
  "ذكر",
  "ذكور",
  "اناث",
  "إناث",
]

export function normalizeDigits(value: unknown) {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩"
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹"

  return String(value)
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/٫/g, ".")
    .replace(/٬/g, "")
}

export function normalizePdfText(value: unknown) {
  return normalizeDigits(
    String(value)
      .normalize("NFKC")
      .replace(/\u00A0/g, " ")
      .replace(/[\u200E\u200F\u202A-\u202E]/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  )
}

function cleanNumber(value: string) {
  let number = normalizeDigits(value).trim()
  if (!number.includes(".")) return number
  number = number.replace(/0+$/, "")
  return number.replace(/\.$/, "")
}

export function groupItemsByRow(items: PdfTextItem[], tolerance = 1.5): VisualRow[] {
  const sorted = [...items].sort((a, b) => {
    if (Math.abs(a.y - b.y) > tolerance) return b.y - a.y
    return b.x - a.x
  })

  const rows: VisualRow[] = []

  for (const item of sorted) {
    const lastRow = rows.at(-1)
    if (!lastRow || Math.abs(lastRow.y - item.y) > tolerance) {
      rows.push({ y: item.y, items: [item] })
      continue
    }

    lastRow.items.push(item)
    lastRow.y = lastRow.items.reduce((sum, current) => sum + current.y, 0) / lastRow.items.length
  }

  return rows
}

function joinItems(items: PdfTextItem[]) {
  return [...items]
    .sort((a, b) => b.x - a.x)
    .map((item) => item.text)
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
}

function findWord(text: string, values: string[]) {
  return values.find((value) => text.includes(value)) ?? null
}

function extractNumber(text: string) {
  const match = normalizeDigits(text).match(/\d+(?:\.\d+)?/)
  return match ? cleanNumber(match[0]) : null
}

function extractNameAndTotal(text: string) {
  const match = normalizePdfText(text).match(/^(.*?)\s*(\d+(?:\.\d+)?)\s*$/u)
  if (!match) return null

  const name = match[1].trim()
  const total = cleanNumber(match[2])
  return name && total ? { name, total } : null
}

function parseTableRow(row: VisualRow, pageWidth: number) {
  const genderEnd = pageWidth * 0.145
  const branchEnd = pageWidth * 0.222
  const averageEnd = pageWidth * 0.267

  const genderItems: PdfTextItem[] = []
  const branchItems: PdfTextItem[] = []
  const averageItems: PdfTextItem[] = []
  const mainItems: PdfTextItem[] = []

  for (const item of row.items) {
    if (item.x < genderEnd) genderItems.push(item)
    else if (item.x < branchEnd) branchItems.push(item)
    else if (item.x < averageEnd) averageItems.push(item)
    else mainItems.push(item)
  }

  const genderText = normalizePdfText(joinItems(genderItems))
  const branchText = normalizePdfText(joinItems(branchItems))
  const averageText = normalizePdfText(joinItems(averageItems))
  const mainText = normalizePdfText(joinItems(mainItems))

  const gender = findWord(genderText, GENDERS)
  const branch = findWord(branchText, BRANCHES)

  if (!gender || !branch) return null

  const preference = extractNumber(branchText)
  const average = extractNumber(averageText)
  const nameAndTotal = extractNameAndTotal(mainText)

  if (!preference || !average || !nameAndTotal) {
    return {
      error: true as const,
      raw: { genderText, branchText, averageText, mainText },
    }
  }

  return {
    error: false as const,
    record: {
      university: nameAndTotal.name,
      total: nameAndTotal.total,
      average,
      preference,
      branch,
      gender,
    } satisfies ExtractedAdmissionRow,
  }
}

function isTablePage(items: PdfTextItem[]) {
  const text = items.map((item) => item.text).join(" ")
  return ["اسم الجامعة", "المجموع", "المعدل", "المفاضلة", "الفرع", "الجنس"].every((heading) => text.includes(heading))
}

export async function extractAdmissionsFromPdf(data: Uint8Array): Promise<PdfExtractionResult> {
  const loadingTask = pdfjs.getDocument({ data })
  const pdf = await loadingTask.promise
  const records: ExtractedAdmissionRow[] = []
  const rejectedRows: RejectedPdfRow[] = []
  const pages: PdfExtractionResult["pages"] = []
  let tablePage = 0

  for (let physicalPage = 1; physicalPage <= pdf.numPages; physicalPage++) {
    const page = await pdf.getPage(physicalPage)
    const viewport = page.getViewport({ scale: 1 })
    const textContent = await page.getTextContent()

    const items: PdfTextItem[] = textContent.items.flatMap((rawItem: unknown) => {
      if (typeof rawItem !== "object" || rawItem === null || !("str" in rawItem) || typeof rawItem.str !== "string" || !rawItem.str.trim()) return []

      const item = rawItem as {
        str: string
        transform?: number[]
        width?: number
        height?: number
      }

      if (!Array.isArray(item.transform) || item.transform.length < 6) return []

      return [{
        text: normalizePdfText(item.str),
        x: item.transform[4],
        y: item.transform[5],
        width: typeof item.width === "number" ? item.width : 0,
        height: typeof item.height === "number" ? item.height : 0,
      }]
    })

    if (!isTablePage(items)) continue

    tablePage += 1
    const pageRecords: ExtractedAdmissionRow[] = []

    for (const row of groupItemsByRow(items)) {
      const parsed = parseTableRow(row, viewport.width)
      if (!parsed) continue

      if (parsed.error) {
        rejectedRows.push({
          physicalPage,
          tablePage,
          y: row.y,
          ...parsed.raw,
        })
        continue
      }

      pageRecords.push(parsed.record)
    }

    records.push(...pageRecords)
    pages.push({ physicalPage, tablePage, records: pageRecords.length })
  }

  return {
    physicalPages: pdf.numPages,
    tablePages: tablePage,
    records,
    rejectedRows,
    pages,
  }
}
