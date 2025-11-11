"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function QueryProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
						refetchOnWindowFocus: false,
						retry: 3,
						retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
						refetchOnReconnect: true,
						refetchOnMount: true,
						networkMode: "online",
					},
					mutations: {
						retry: 1,
						retryDelay: 1000,
						networkMode: "online",
					},
				},
			})
	)

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
}
