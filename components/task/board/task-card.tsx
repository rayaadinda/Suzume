"use client"

import { useState } from "react"
import { useDraggable } from "@dnd-kit/core"
import type { TaskWithRelations } from "@/app/actions/tasks"
import { statuses as statusesData } from "@/mock-data/statuses"
import {
	Calendar,
	MessageSquare,
	FileText,
	Link,
	CheckCircle,
	InfoIcon,
	Hexagon,
	Stars,
	Repeat,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import { TaskDetailsDialog } from "../task-details-dialog"
import { TaskContextMenu } from "../task-context-menu"
import { PomodoroTimer } from "../pomodoro-timer"

interface TaskCardProps {
	task: TaskWithRelations
}

export function TaskCard({ task }: TaskCardProps) {
	const [isDetailsOpen, setIsDetailsOpen] = useState(false)
	const [isDragStarted, setIsDragStarted] = useState(false)

	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: task.id,
		})

	// Get the status icon from statusesData
	const status = statusesData.find((s) => s.id === task.statusId)
	const StatusIcon = status?.icon
	const hasProgress = task.progressTotal > 0
	const isCompleted =
		task.progressCompleted === task.progressTotal && hasProgress

	const style = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
		  }
		: undefined

	// Track when dragging starts/ends
	if (isDragging && !isDragStarted) {
		setIsDragStarted(true)
	} else if (!isDragging && isDragStarted) {
		// Reset after a small delay to prevent click from firing
		setTimeout(() => setIsDragStarted(false), 50)
	}

	const handleClick = () => {
		// Don't open details if we just finished dragging
		if (!isDragStarted) {
			setIsDetailsOpen(true)
		}
	}

	return (
		<>
			<TaskContextMenu task={task} onOpenDetails={() => setIsDetailsOpen(true)}>
				<div
					ref={setNodeRef}
					style={style}
					className={cn(
						"bg-linear-to-br from-card/90 via-card to-card/80 backdrop-blur-sm shrink-0 rounded-lg overflow-hidden border border-border/50 cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200",
						isDragging && "opacity-50"
					)}
				>
					<div
						className="px-3 py-2.5"
						{...listeners}
						{...attributes}
						onClick={handleClick}
					>
						{/* Title with status icon */}

						{/* Title with status icon */}
						<div className="flex items-center gap-2 mb-2">
							<div className="size-5 mt-0.5 shrink-0 flex items-center justify-center bg-muted rounded-sm p-1">
								{StatusIcon && <StatusIcon />}
							</div>
							<h3 className="text-sm font-medium leading-tight flex-1">
								{task.title}
							</h3>
							{task.priority === "urgent" && !isCompleted && (
								<Stars className="size-4 shrink-0 text-pink-500" />
							)}
							{task.priority === "high" && !isCompleted && (
								<InfoIcon className="size-4 shrink-0 text-red-500" />
							)}
							{task.priority === "medium" && !isCompleted && (
								<Hexagon className="size-4 shrink-0 text-cyan-500" />
							)}
							{isCompleted && (
								<CheckCircle className="size-4 shrink-0 text-green-500" />
							)}
						</div>

						{/* Description */}
						<p className="text-xs text-muted-foreground mb-3 line-clamp-2">
							{task.description}
						</p>

						{/* Labels & Recurring Badge */}
						{(task.labels.length > 0 || task.isRecurring) && (
							<div className="flex flex-wrap gap-1.5">
								{task.isRecurring && (
									<Badge
										variant="outline"
										className="text-[10px] px-1.5 py-0.5 font-medium border-primary/50 text-primary flex items-center gap-1"
									>
										<Repeat className="size-2.5" />
										Recurring
									</Badge>
								)}
								{task.labels.map((label) => (
									<Badge
										key={label.id}
										variant="secondary"
										className={cn(
											"text-[10px] px-1.5 py-0.5 font-medium",
											label.color
										)}
									>
										{label.name}
									</Badge>
								))}
							</div>
						)}
					</div>

					<div
						className="px-3 py-2.5 border-t border-border/30 border-dashed bg-muted/5"
						{...listeners}
						{...attributes}
						onClick={handleClick}
					>
						<div className="flex items-center justify-between flex-wrap gap-2">
							{/* Left side - metadata */}
							<div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
								<div onClick={(e) => e.stopPropagation()}>
									<PomodoroTimer
										taskId={task.id}
										taskTitle={task.title}
										compact
									/>
								</div>
								{task.date && (
									<div className="flex items-center gap-1.5 border border-border rounded-sm py-1 px-2">
										<Calendar className="size-3" />
										<span>{task.date}</span>
									</div>
								)}
								{task.commentsCount > 0 && (
									<div className="flex items-center gap-1.5 border border-border rounded-sm py-1 px-2">
										<MessageSquare className="size-3" />
										<span>{task.commentsCount}</span>
									</div>
								)}
								{task.attachmentsCount > 0 && (
									<div className="flex items-center gap-1.5 border border-border rounded-sm py-1 px-2">
										<FileText className="size-3" />
										<span>{task.attachmentsCount}</span>
									</div>
								)}
								{task.linksCount > 0 && (
									<div className="flex items-center gap-1.5 border border-border rounded-sm py-1 px-2">
										<Link className="size-3" />
										<span>{task.linksCount}</span>
									</div>
								)}
								{hasProgress && (
									<div className="flex items-center gap-1.5 border border-border rounded-sm py-1 px-2">
										{isCompleted ? (
											<CheckCircle className="size-3 text-green-500" />
										) : (
											<div className="size-3">
												<CircularProgressbar
													value={
														(task.progressCompleted / task.progressTotal) * 100
													}
													strokeWidth={12}
													styles={buildStyles({
														pathColor: "#10b981",
														trailColor: "#EDEDED",
														strokeLinecap: "round",
													})}
												/>
											</div>
										)}
										<span>
											{task.progressCompleted}/{task.progressTotal}
										</span>
									</div>
								)}
							</div>

							{/* Right side - avatars */}
							{task.assignees.length > 0 && (
								<div className="flex -space-x-2">
									{task.assignees.map((user) => (
										<Avatar
											key={user.id}
											className="size-5 border-2 border-background"
										>
											<AvatarImage
												src={user.image || undefined}
												alt={user.name}
											/>
											<AvatarFallback className="text-[10px]">
												{user.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</TaskContextMenu>{" "}
			<TaskDetailsDialog
				open={isDetailsOpen}
				onOpenChange={setIsDetailsOpen}
				task={task}
			/>
		</>
	)
}
