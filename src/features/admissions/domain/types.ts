export interface Admission {
  sourceId: string
  code: string
  name: string
  degreeAll: number
  percent: number
  type: string
  sex: string
}

export interface AdmissionFilters {
  maximumPercent: string
  branch: string
  sex: string
  name: string
}
