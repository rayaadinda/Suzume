"use client"

import { useMemo, useState } from "react"
import {
	DndContext,
	DragOverlay,
	closestCenter,
	PointerSensor,
	useSensor,
	useSensors,
	DragStartEvent,
	DragEndEvent,
} from "@dnd-kit/core"
import { useTasks, useUpdateTaskStatus } from "@/hooks/use-tasks"
import { useTasksStore } from "@/store/tasks-store"
import { statuses } from "@/mock-data/statuses"
import { TaskColumn } from "./task-column"
import { TaskCard } from "./task-card"
import { TaskBoardSkeleton } from "./task-board-skeleton"
import { ListView } from "../views/list-view"
import { CalendarView } from "../views/calendar-view"
import type { TaskWithRelations } from "@/app/actions/tasks"

export function TaskBoard() {
	const { viewMode, filters } = useTasksStore()
	const { data: tasks = [], isLoading } = useTasks(filters)
	const updateTaskStatus = useUpdateTaskStatus()
	const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null)

	const tasksByStatus = useMemo(() => {
		return tasks.reduce((acc, task) => {
			if (!acc[task.statusId]) {
				acc[task.statusId] = []
			}
			acc[task.statusId].push(task)
			return acc
		}, {} as Record<string, TaskWithRelations[]>)
	}, [tasks])

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		})
	)

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event
		const task = tasks.find((t) => t.id === active.id)
		if (task) {
			setActiveTask(task)
		}
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		setActiveTask(null)

		if (!over) return

		const taskId = active.id as string
		const newStatusId = over.id as string

		const task = tasks.find((t) => t.id === taskId)
		if (task && task.statusId !== newStatusId) {
			updateTaskStatus.mutate({ taskId, statusId: newStatusId })
		}
	}

	if (isLoading) {
		return <TaskBoardSkeleton />
	}

	if (viewMode === "list") {
		return <ListView tasks={tasks} />
	}

	if (viewMode === "calendar") {
		return <CalendarView tasks={tasks} />
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div className="flex h-full gap-4 px-6 pt-6 pb-4 min-w-max">
				{statuses.map((status) => (
					<TaskColumn
						key={status.id}
						status={status}
						tasks={tasksByStatus[status.id] || []}
					/>
				))}
			</div>

			<DragOverlay>
				{activeTask ? (
					<div className="opacity-80 rotate-3 scale-105">
						<TaskCard task={activeTask} />
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	)
}
