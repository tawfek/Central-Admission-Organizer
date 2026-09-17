export interface Admission {
  key: number
  id: number
  sourceId: string
  code: string
  name: string
  degreeAll: number | null
  percent: number
  rawType: string
  type: string
  sex: string
}

export interface AdmissionFilters {
  maximumPercent: string
  branch: string
  sex: string
  name: string
}
