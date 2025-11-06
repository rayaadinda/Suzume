"use client"

import { useEffect, useMemo, useState } from "react"
import { useTasksStore } from "@/store/tasks-store"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
	Home,
	Calendar,
	Clock,
	ListChecks,
	Target,
	Plus,
	GripVertical,
	X,
} from "lucide-react"
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Task } from "@/db/schema"
import {
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
	closestCenter,
} from "@dnd-kit/core"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { toast } from "sonner"

// Time slots from 6 AM to 10 PM
const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => {
	const hour = i + 6
	return {
		time: `${hour.toString().padStart(2, "0")}:00`,
		label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`,
	}
})

// Type for checklist items
interface ChecklistItem {
	id: string
	text: string
	completed: boolean
}

// Draggable Task Component
function DraggableTask({
	task,
	inTimeBlock = false,
}: {
	task: Task
	inTimeBlock?: boolean
}) {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: task.id,
			data: { task },
		})

	const style = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
		  }
		: undefined

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"flex items-center gap-2 p-2 rounded-md cursor-grab active:cursor-grabbing transition-all",
				inTimeBlock
					? "bg-primary/10 border border-primary/20"
					: "hover:bg-muted/50",
				isDragging && "opacity-50"
			)}
			{...listeners}
			{...attributes}
		>
			<GripVertical className="size-4 text-muted-foreground shrink-0" />
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium truncate">{task.title}</p>
				{inTimeBlock && task.timeBlockEnd && (
					<p className="text-xs text-muted-foreground">
						Until {task.timeBlockEnd}
					</p>
				)}
			</div>
			{task.priority !== "no-priority" && (
				<Badge variant="outline" className="text-xs shrink-0">
					{task.priority}
				</Badge>
			)}
		</div>
	)
}

// Droppable Time Slot Component
function DroppableTimeSlot({
	slot,
	tasks,
	onRemoveTask,
}: {
	slot: { time: string; label: string }
	tasks: Task[]
	onRemoveTask: (taskId: string) => void
}) {
	const { setNodeRef, isOver } = useDroppable({
		id: `slot-${slot.time}`,
		data: { timeSlot: slot.time },
	})

	return (
		<div className="flex gap-3 group hover:bg-muted/50 p-2 rounded-md transition-colors">
			{/* Time Label */}
			<div className="w-20 shrink-0 text-sm font-medium text-muted-foreground">
				{slot.label}
			</div>

			{/* Time Block Area */}
			<div
				ref={setNodeRef}
				className={cn(
					"flex-1 min-h-[60px] border-2 border-dashed rounded-md p-2 transition-colors",
					isOver ? "border-primary bg-primary/5" : "border-muted",
					tasks.length === 0 && "flex items-center justify-center"
				)}
			>
				{tasks.length > 0 ? (
					<div className="space-y-2">
						{tasks.map((task) => (
							<div key={task.id} className="relative group/task">
								<DraggableTask task={task} inTimeBlock />
								<Button
									size="icon"
									variant="ghost"
									className="absolute -top-1 -right-1 size-5 opacity-0 group-hover/task:opacity-100 transition-opacity"
									onClick={() => onRemoveTask(task.id)}
								>
									<X className="size-3" />
								</Button>
							</div>
						))}
					</div>
				) : (
					<p className="text-xs text-muted-foreground text-center">
						Drop task here or click to schedule
					</p>
				)}
			</div>
		</div>
	)
}

export default function PlanningPage() {
	const { tasks, loading, fetchTasks, updateTaskAction } = useTasksStore()

	// Initialize state from localStorage
	const [dailyGoals, setDailyGoals] = useState<string>(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("dailyGoals") || ""
		}
		return ""
	})

	const [morningChecklist, setMorningChecklist] = useState<ChecklistItem[]>(
		() => {
			if (typeof window !== "undefined") {
				const saved = localStorage.getItem("morningChecklist")
				if (saved) {
					try {
						return JSON.parse(saved)
					} catch {
						// Return default if parsing fails
					}
				}
			}
			return [
				{ id: "1", text: "Review yesterday's progress", completed: false },
				{ id: "2", text: "Set top 3 priorities for today", completed: false },
				{ id: "3", text: "Check calendar and meetings", completed: false },
				{ id: "4", text: "Clear inbox", completed: false },
			]
		}
	)

	const [activeTask, setActiveTask] = useState<Task | null>(null)

	// DnD sensors
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		})
	)

	useEffect(() => {
		fetchTasks()
	}, [fetchTasks])

	// Filter today's tasks (tasks with today's date)
	const todaysTasks = useMemo(() => {
		const today = format(new Date(), "yyyy-MM-dd")
		return tasks.filter((task) => {
			if (!task.date) return false
			// Check if task date matches today (dates are stored as yyyy-MM-dd)
			return task.date === today
		})
	}, [tasks])

	// Group tasks by time block
	const timeBlockedTasks = useMemo(() => {
		const grouped: Record<string, Task[]> = {}
		tasks.forEach((task) => {
			if (task.timeBlockStart) {
				if (!grouped[task.timeBlockStart]) {
					grouped[task.timeBlockStart] = []
				}
				grouped[task.timeBlockStart].push(task)
			}
		})
		return grouped
	}, [tasks])

	// Handle checklist toggle
	const toggleChecklistItem = (id: string) => {
		const updated = morningChecklist.map((item: ChecklistItem) =>
			item.id === id ? { ...item, completed: !item.completed } : item
		)
		setMorningChecklist(updated)
		localStorage.setItem("morningChecklist", JSON.stringify(updated))
	}

	// Save daily goals
	const saveDailyGoals = () => {
		localStorage.setItem("dailyGoals", dailyGoals)
	}

	// Handle drag start
	const handleDragStart = (event: DragStartEvent) => {
		const task = event.active.data.current?.task as Task
		if (task) {
			setActiveTask(task)
		}
	}

	// Handle drag end
	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event
		setActiveTask(null)

		if (!over) return

		const task = active.data.current?.task as Task
		const timeSlot = over.data.current?.timeSlot as string | undefined

		if (!task || !timeSlot) return

		// Calculate end time (1 hour later)
		const [hours] = timeSlot.split(":")
		const endHour = (parseInt(hours) + 1).toString().padStart(2, "0")
		const timeBlockEnd = `${endHour}:00`

		try {
			// Update task with time block
			await updateTaskAction(task.id, {
				timeBlockStart: timeSlot,
				timeBlockEnd: timeBlockEnd,
			})
			toast.success("Task scheduled", {
				description: `${task.title} scheduled for ${timeSlot}`,
			})
		} catch {
			toast.error("Failed to schedule task")
		}
	}

	// Remove task from time block
	const removeFromTimeBlock = async (taskId: string) => {
		try {
			await updateTaskAction(taskId, {
				timeBlockStart: null,
				timeBlockEnd: null,
			})
			toast.success("Task removed from schedule")
		} catch {
			toast.error("Failed to remove task from schedule")
		}
	}

	if (loading && tasks.length === 0) {
		return (
			<div className="flex h-full items-center justify-center">
				<p className="text-muted-foreground">Loading planning view...</p>
			</div>
		)
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div className="flex flex-col h-full">
				<div className="border-b px-6 py-3">
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link href="/tasks" className="flex items-center gap-1.5">
										<Home className="size-3.5" />
										Home
									</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>Daily Planning</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>

				{/* Main Content */}
				<div className="flex-1 overflow-auto">
					<div className="flex flex-col gap-6 p-6">
						{/* Header */}
						<div className="flex items-start justify-between">
							<div>
								<h1 className="text-3xl font-bold tracking-tight">
									{format(new Date(), "EEEE, MMMM d, yyyy")}
								</h1>
								<p className="text-muted-foreground">
									Plan your day and schedule your tasks
								</p>
							</div>
							<Button>
								<Plus className="size-4 mr-2" />
								Add Task
							</Button>
						</div>

						<div className="grid gap-6 md:grid-cols-3">
							{/* Left Column - Morning Planning */}
							<div className="space-y-6">
								{/* Morning Checklist */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<ListChecks className="size-5" />
											Morning Checklist
										</CardTitle>
										<CardDescription>
											Start your day with these tasks
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											{morningChecklist.map((item) => (
												<div key={item.id} className="flex items-start gap-3">
													<Checkbox
														checked={item.completed}
														onCheckedChange={() => toggleChecklistItem(item.id)}
														className="mt-1"
													/>
													<span
														className={cn(
															"text-sm flex-1",
															item.completed &&
																"line-through text-muted-foreground"
														)}
													>
														{item.text}
													</span>
												</div>
											))}
										</div>
									</CardContent>
								</Card>

								{/* Daily Goals */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Target className="size-5" />
											Today&apos;s Goals
										</CardTitle>
										<CardDescription>
											What are your top 3 priorities?
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-3">
										<Textarea
											placeholder="1. Complete project proposal&#10;2. Review pull requests&#10;3. Team meeting at 2 PM"
											value={dailyGoals}
											onChange={(e) => setDailyGoals(e.target.value)}
											onBlur={saveDailyGoals}
											className="min-h-[120px] resize-none"
										/>
										<p className="text-xs text-muted-foreground">
											Goals are auto-saved
										</p>
									</CardContent>
								</Card>

								{/* Today's Tasks Summary */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Calendar className="size-5" />
											Today&apos;s Tasks
										</CardTitle>
										<CardDescription>
											{todaysTasks.length} task{todaysTasks.length !== 1 && "s"}{" "}
											due today
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ScrollArea className="h-[200px]">
											{todaysTasks.length === 0 ? (
												<p className="text-sm text-muted-foreground text-center py-8">
													No tasks due today
												</p>
											) : (
												<div className="space-y-2">
													{todaysTasks
														.filter((task) => !task.timeBlockStart)
														.map((task) => (
															<DraggableTask key={task.id} task={task} />
														))}
													{todaysTasks.filter((task) => !task.timeBlockStart)
														.length === 0 && (
														<p className="text-sm text-muted-foreground text-center py-8">
															All tasks are scheduled
														</p>
													)}
												</div>
											)}
										</ScrollArea>
									</CardContent>
								</Card>
							</div>

							{/* Right Column - Time Blocking */}
							<div className="md:col-span-2">
								<Card className="h-fit">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Clock className="size-5" />
											Time Blocking Schedule
										</CardTitle>
										<CardDescription>
											Drag tasks into time slots to plan your day
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ScrollArea className="h-[600px] pr-4">
											<div className="space-y-1">
												{TIME_SLOTS.map((slot) => (
													<DroppableTimeSlot
														key={slot.time}
														slot={slot}
														tasks={timeBlockedTasks[slot.time] || []}
														onRemoveTask={removeFromTimeBlock}
													/>
												))}
											</div>
										</ScrollArea>
									</CardContent>
								</Card>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Drag Overlay */}
			<DragOverlay>
				{activeTask ? <DraggableTask task={activeTask} inTimeBlock /> : null}
			</DragOverlay>
		</DndContext>
	)
}
