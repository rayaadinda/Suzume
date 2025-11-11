"use client"

import { useQuery } from "@tanstack/react-query"
import { getStatuses } from "@/app/actions/statuses"

export function useStatuses() {
	return useQuery({
		queryKey: ["statuses"],
		queryFn: getStatuses,
		staleTime: 30 * 60 * 1000,
		refetchOnWindowFocus: false,
	})
}
