import rawAdmissions from "./admissions.raw.json"
import { normalizeLegacyAdmission } from "../domain/admission"
import type { Admission } from "../domain/types"

export interface AdmissionRepository {
  list(): Promise<Admission[]>
}

/**
 * Static repository used by the public frontend. The generated JSON is bundled
 * by Vite; there is no runtime backend request.
 */
export const localAdmissionRepository: AdmissionRepository = {
  async list() {
    return (rawAdmissions as Array<Array<string | number | null>>).map(normalizeLegacyAdmission)
  }
}
