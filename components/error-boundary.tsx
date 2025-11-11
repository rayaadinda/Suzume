"use client"

import { Component, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface Props {
	children: ReactNode
	fallback?: ReactNode
}

interface State {
	hasError: boolean
	error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Error caught by boundary:", error, errorInfo)
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null })
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback
			}

			return (
				<div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6">
					<div className="flex items-center gap-2 text-destructive">
						<AlertCircle className="h-8 w-8" />
						<h2 className="text-2xl font-semibold">Something went wrong</h2>
					</div>
					<p className="text-sm text-muted-foreground max-w-md text-center">
						{this.state.error?.message ||
							"An unexpected error occurred. Please try again."}
					</p>
					<div className="flex items-center gap-2">
						<Button onClick={this.handleReset}>Try Again</Button>
						<Button
							variant="outline"
							onClick={() => window.location.reload()}
						>
							Reload Page
						</Button>
					</div>
				</div>
			)
		}

		return this.props.children
	}
}
