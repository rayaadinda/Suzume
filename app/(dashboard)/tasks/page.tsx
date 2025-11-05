"use client"

import { TaskBoard } from "@/components/task/board/task-board"
import { TaskHeader } from "@/components/task/header/task-header"

export default function TasksPage() {
	return (
		<div className="flex flex-col h-full overflow-hidden bg-linear-to-br from-background via-background to-muted/20">
			<TaskHeader />

			<div className="flex-1 overflow-x-auto overflow-y-hidden">
				<TaskBoard />
			</div>
		</div>
	)
}
