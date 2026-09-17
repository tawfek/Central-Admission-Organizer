import { readdir, mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const RAW_DIR = path.resolve("src/data/raw")

const OUTPUT_FILE = path.resolve(
  "src/features/admissions/data/admissions.raw.json",
)

const LINES_PER_RECORD = 7

type RawAdmissionRow = [
  globalId: string,
  sourceId: string,
  name: string,
  degreeAll: string,
  percent: string,
  code: string,
  branch: string,
  sex: string,
]

function naturalSort(a: string, b: string) {
  return a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: "base",
  })
}

function cleanLine(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .replace(/\r/g, "")
    .trim()
}

function parseNumber(value: string, label: string, file: string) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    throw new Error(
      `Invalid ${label} "${value}" in ${file}`,
    )
  }

  return number
}

async function parseFile(
  filePath: string,
  globalOffset: number,
): Promise<RawAdmissionRow[]> {
  const fileName = path.basename(filePath)

  const text = await Bun.file(filePath).text()

  const lines = text
    .split(/\r?\n/)
    .map(cleanLine)
    .filter((line) => line.length > 0)

  if (lines.length % LINES_PER_RECORD !== 0) {
    throw new Error(
      [
        `Invalid file: ${fileName}`,
        `Expected records of ${LINES_PER_RECORD} lines.`,
        `Found ${lines.length} non-empty lines.`,
        `Remaining lines: ${lines.length % LINES_PER_RECORD}`,
      ].join("\n"),
    )
  }

  const rows: RawAdmissionRow[] = []

  for (let index = 0; index < lines.length; index += LINES_PER_RECORD) {
    const sourceId = lines[index]
    const name = lines[index + 1]
    const degreeAll = lines[index + 2]
    const percent = lines[index + 3]
    const code = lines[index + 4]
    const branch = lines[index + 5]
    const sex = lines[index + 6]

    const recordNumber = index / LINES_PER_RECORD + 1

    if (!sourceId) {
      throw new Error(
        `Missing source id in ${fileName}, record ${recordNumber}`,
      )
    }

    if (!name) {
      throw new Error(
        `Missing name in ${fileName}, record ${recordNumber}`,
      )
    }

    parseNumber(
      sourceId,
      "source id",
      fileName,
    )

    parseNumber(
      degreeAll,
      "degree",
      fileName,
    )

    const parsedPercent = parseNumber(
      percent,
      "percent",
      fileName,
    )

    parseNumber(
      code,
      "code",
      fileName,
    )



    if (!branch) {
      throw new Error(
        `Missing branch in ${fileName}, record ${recordNumber}`,
      )
    }

    if (!sex) {
      throw new Error(
        `Missing sex in ${fileName}, record ${recordNumber}`,
      )
    }

    const globalId = globalOffset + rows.length + 1

    rows.push([
      String(globalId),
      sourceId,
      name,
      degreeAll,
      percent,
      code,
      branch,
      sex,
    ])
  }

  return rows
}

async function main() {
  console.log(`Reading admission files from:`)
  console.log(RAW_DIR)
  console.log("")

  const directoryEntries = await readdir(RAW_DIR, {
    withFileTypes: true,
  })

  const files = directoryEntries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.toLowerCase().endsWith(".txt"),
    )
    .map((entry) => entry.name)
    .sort(naturalSort)

  if (files.length === 0) {
    throw new Error(
      `No .txt files were found inside ${RAW_DIR}`,
    )
  }

  console.log(`Found ${files.length} TXT files:`)

  for (const file of files) {
    console.log(`  - ${file}`)
  }

  console.log("")

  const allRows: RawAdmissionRow[] = []

  for (const fileName of files) {
    const filePath = path.join(RAW_DIR, fileName)

    const rows = await parseFile(
      filePath,
      allRows.length,
    )

    allRows.push(...rows)

    console.log(
      `✓ ${fileName}: ${rows.length} records`,
    )
  }

  await mkdir(path.dirname(OUTPUT_FILE), {
    recursive: true,
  })

  await writeFile(
    OUTPUT_FILE,
    JSON.stringify(allRows, null, 2),
    "utf8",
  )

  console.log("")
  console.log("Import completed.")
  console.log(`Files:   ${files.length}`)
  console.log(`Records: ${allRows.length}`)
  console.log(`Output:  ${OUTPUT_FILE}`)
}

main().catch((error) => {
  console.error("")
  console.error("Admission import failed.")
  console.error(error)

  process.exit(1)
})