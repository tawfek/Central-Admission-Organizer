import { createHash } from "node:crypto"
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises"
import path from "node:path"
import { extractAdmissionsFromPdf } from "./admission-pdf/parser"
import { normalizeAdmissions } from "./admission-pdf/normalize"
import type { AdmissionImportReport } from "./admission-pdf/types"
import { validateAdmissions } from "./admission-pdf/validate"

const DEFAULT_PDF = path.resolve("public/admission-minimums.pdf")
const OUTPUT_DIR = path.resolve("src/features/admissions/data")
const OUTPUT_FILE = path.join(OUTPUT_DIR, "admissions.json")
const REPORT_FILE = path.join(OUTPUT_DIR, "admission-import-report.json")
const REJECTED_FILE = path.join(OUTPUT_DIR, "admission-import-rejected.json")

function parseArgs() {
  const args = process.argv.slice(2) as string[]
  return {
    allowRejected: args.includes("--allow-rejected"),
    pdfPath: path.resolve(args.find((arg) => !arg.startsWith("--")) ?? DEFAULT_PDF),
  }
}

function relativeToProject(filePath: string) {
  return path.relative(process.cwd(), filePath).replaceAll("\\", "/")
}

async function main() {
  const { allowRejected, pdfPath } = parseArgs()
  const pdf = await readFile(pdfPath)
  const sourceStat = await stat(pdfPath)
  const sha256 = createHash("sha256").update(pdf).digest("hex")

  console.log(`Reading admission PDF: ${relativeToProject(pdfPath)}`)

  const extraction = await extractAdmissionsFromPdf(new Uint8Array(pdf))
  const admissions = normalizeAdmissions(extraction.records)
  const validation = validateAdmissions(admissions)

  await mkdir(OUTPUT_DIR, { recursive: true })

  if (extraction.rejectedRows.length > 0) {
    await writeFile(REJECTED_FILE, `${JSON.stringify(extraction.rejectedRows, null, 2)}\n`, "utf8")
    if (!allowRejected) {
      throw new Error(
        `${extraction.rejectedRows.length} PDF row(s) could not be parsed. ` +
        `Review ${relativeToProject(REJECTED_FILE)} or rerun with --allow-rejected while debugging.`,
      )
    }
  } else {
    await rm(REJECTED_FILE, { force: true })
  }

  const report: AdmissionImportReport = {
    schemaVersion: 1,
    source: {
      file: relativeToProject(pdfPath),
      sha256,
      sizeBytes: sourceStat.size,
    },
    extraction: {
      physicalPages: extraction.physicalPages,
      tablePages: extraction.tablePages,
      records: admissions.length,
      rejectedRows: extraction.rejectedRows.length,
      duplicateSourceIds: validation.duplicateSourceIds.length,
    },
    values: {
      branches: validation.branches,
      sexes: validation.sexes,
    },
    pages: extraction.pages,
  }

  await writeFile(OUTPUT_FILE, `${JSON.stringify(admissions, null, 2)}\n`, "utf8")
  await writeFile(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`, "utf8")

  console.log(`Physical pages: ${extraction.physicalPages}`)
  console.log(`Table pages:    ${extraction.tablePages}`)
  for (const page of extraction.pages) {
    console.log(`  PDF page ${page.physicalPage}: ${page.records} records`)
  }
  console.log("")
  console.log(`Records:        ${admissions.length}`)
  console.log(`Rejected rows:  ${extraction.rejectedRows.length}`)
  console.log(`Duplicate IDs:  ${validation.duplicateSourceIds.length}`)
  console.log(`Output:         ${relativeToProject(OUTPUT_FILE)}`)
  console.log(`Report:         ${relativeToProject(REPORT_FILE)}`)
}

main().catch((error) => {
  console.error("")
  console.error("Admission PDF import failed.")
  console.error(error)
  process.exit(1)
})
