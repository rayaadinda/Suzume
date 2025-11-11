"use client"

import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { ErrorBoundary } from "./error-boundary"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface QueryErrorBoundaryProps {
	children: React.ReactNode
}

export function QueryErrorBoundary({ children }: QueryErrorBoundaryProps) {
	const { reset } = useQueryErrorResetBoundary()

	return (
		<ErrorBoundary
			fallback={
				<div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6">
					<div className="flex items-center gap-2 text-destructive">
						<AlertCircle className="h-8 w-8" />
						<h2 className="text-2xl font-semibold">Failed to load data</h2>
					</div>
					<p className="text-sm text-muted-foreground max-w-md text-center">
						We couldn't fetch the data. Please check your internet connection and try again.
					</p>
					<div className="flex items-center gap-2">
						<Button onClick={() => reset()}>
							<RefreshCw className="mr-2 h-4 w-4" />
							Retry
						</Button>
						<Button
							variant="outline"
							onClick={() => window.location.href = "/"}
						>
							Go Home
						</Button>
					</div>
				</div>
			}
		>
			{children}
		</ErrorBoundary>
	)
}
