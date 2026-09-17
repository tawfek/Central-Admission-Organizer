import { queryOptions } from "@tanstack/react-query"
import { localAdmissionRepository } from "./admission-repository"

export const admissionsQueryOptions = queryOptions({
  queryKey: ["admissions", "local-json"],
  queryFn: () => localAdmissionRepository.list(),
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: Number.POSITIVE_INFINITY
})
