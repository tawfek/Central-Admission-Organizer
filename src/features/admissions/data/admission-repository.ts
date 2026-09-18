import admissions from "./admissions.json"
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
    return admissions as Admission[]
  },
}
