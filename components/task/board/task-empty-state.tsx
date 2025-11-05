import { Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty"

interface TaskEmptyStateProps {
	variant: "column" | "search" | "filter" | "initial"
	statusName?: string
	onCreateTask?: () => void
	onClearFilters?: () => void
}

export function TaskEmptyState({
	variant,
	statusName,
	onCreateTask,
	onClearFilters,
}: TaskEmptyStateProps) {
	if (variant === "column") {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Plus className="w-6 h-6" />
					</EmptyMedia>
					<EmptyTitle>No tasks in {statusName}</EmptyTitle>
					<EmptyDescription>
						There are no tasks in this column yet. Tasks will appear here when
						you create or move them.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		)
	}

	if (variant === "search") {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Search className="w-6 h-6" />
					</EmptyMedia>
					<EmptyTitle>No results found</EmptyTitle>
					<EmptyDescription>
						We couldnt find any tasks matching your search. Try different
						keywords or clear your search.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		)
	}

	if (variant === "filter") {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Filter className="w-6 h-6" />
					</EmptyMedia>
					<EmptyTitle>No tasks match your filters</EmptyTitle>
					<EmptyDescription>
						Try adjusting your filters to see more results.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button onClick={onClearFilters} variant="outline">
						Clear Filters
					</Button>
				</EmptyContent>
			</Empty>
		)
	}

	// initial - no tasks at all
	return (
		<Empty className="min-h-[600px]">
			<EmptyHeader>
				<EmptyMedia variant="illustration">
					<div className="flex items-center justify-center w-full h-full">
						<div className="text-8xl">📋</div>
					</div>
				</EmptyMedia>
				<EmptyTitle>Welcome to Task Management</EmptyTitle>
				<EmptyDescription>
					You havent created any tasks yet. Get started by creating your first
					task to organize your work.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button onClick={onCreateTask} size="lg">
					<Plus className="mr-2" />
					Create Your First Task
				</Button>
			</EmptyContent>
		</Empty>
	)
}
