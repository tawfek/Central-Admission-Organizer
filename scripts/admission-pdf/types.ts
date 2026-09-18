export interface PdfTextItem {
  text: string
  x: number
  y: number
  width: number
  height: number
}

export interface VisualRow {
  y: number
  items: PdfTextItem[]
}

export interface ExtractedAdmissionRow {
  university: string
  total: string
  average: string
  preference: string
  branch: string
  gender: string
}

export interface RejectedPdfRow {
  physicalPage: number
  tablePage: number
  y: number
  genderText: string
  branchText: string
  averageText: string
  mainText: string
}

export interface PdfPageReport {
  physicalPage: number
  tablePage: number
  records: number
}

export interface PdfExtractionResult {
  physicalPages: number
  tablePages: number
  records: ExtractedAdmissionRow[]
  rejectedRows: RejectedPdfRow[]
  pages: PdfPageReport[]
}

export interface GeneratedAdmission {
  sourceId: string
  code: string
  name: string
  degreeAll: number
  percent: number
  type: string
  sex: string
}

export interface AdmissionImportReport {
  schemaVersion: 1
  source: {
    file: string
    sha256: string
    sizeBytes: number
  }
  extraction: {
    physicalPages: number
    tablePages: number
    records: number
    rejectedRows: number
    duplicateSourceIds: number
  }
  values: {
    branches: string[]
    sexes: string[]
  }
  pages: PdfPageReport[]
}
