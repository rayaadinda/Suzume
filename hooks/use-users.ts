"use client"

import { useQuery } from "@tanstack/react-query"
import { getUsers } from "@/app/actions/users"

export function useUsers() {
	return useQuery({
		queryKey: ["users"],
		queryFn: getUsers,
		staleTime: 15 * 60 * 1000,
		refetchOnWindowFocus: false,
	})
}
