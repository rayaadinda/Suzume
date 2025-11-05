"use client"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { Status } from "@/mock-data/statuses"
import type { TaskWithRelations } from "@/app/actions/tasks"
import { TaskCard } from "./task-card"
import { TaskDialog } from "../task-dialog"
import { Plus, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TaskColumnProps {
	status: Status
	tasks: TaskWithRelations[]
}

export function TaskColumn({ status, tasks }: TaskColumnProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const { setNodeRef, isOver } = useDroppable({
		id: status.id,
	})
	const StatusIcon = status.icon

	return (
		<div className="shrink-0 w-[300px] lg:w-[360px] flex flex-col h-full flex-1">
			<div className="rounded-lg border border-border/40 p-3 bg-linear-to-b from-muted/40 via-muted/30 to-muted/20 backdrop-blur-sm flex flex-col max-h-full shadow-sm">
				<div className="flex items-center justify-between mb-2 rounded-lg">
					<div className="flex items-center gap-2">
						<div className="size-4 flex items-center justify-center">
							<StatusIcon />
						</div>
						<span className="text-sm font-medium">{status.name}</span>
					</div>
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={() => setIsDialogOpen(true)}
						>
							<Plus className="size-4" />
						</Button>
						<Button variant="ghost" size="icon" className="h-6 w-6">
							<MoreHorizontal className="size-4" />
						</Button>
					</div>
				</div>

				<div
					ref={setNodeRef}
					className={cn(
						"flex flex-col gap-3 overflow-y-auto h-full rounded-md transition-all duration-200",
						isOver &&
							"bg-primary/5 ring-2 ring-primary/30 ring-offset-1 ring-offset-background"
					)}
				>
					{tasks.map((task) => (
						<TaskCard key={task.id} task={task} />
					))}

					<Button
						variant="ghost"
						size="sm"
						className="gap-2 text-xs h-auto py-1 px-0 self-start hover:bg-background"
						onClick={() => setIsDialogOpen(true)}
					>
						<Plus className="size-4" />
						<span>Add task</span>
					</Button>
				</div>
			</div>

			<TaskDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				defaultStatusId={status.id}
			/>
		</div>
	)
}
