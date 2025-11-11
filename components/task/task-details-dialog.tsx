"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import {
	X,
	Trash2,
	Calendar as CalendarIcon,
	MessageSquare,
	Paperclip,
	Link2,
	CheckCircle2,
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useTasksStore } from "@/store/tasks-store"
import { getUsers } from "@/app/actions/users"
import { getLabels } from "@/app/actions/labels"
import { getStatuses } from "@/app/actions/statuses"
import type { TaskWithRelations } from "@/app/actions/tasks"
import type { UserData } from "@/app/actions/users"
import type { LabelData } from "@/app/actions/labels"
import type { StatusData } from "@/app/actions/statuses"
import { SubtaskList } from "./subtask-list"
import { PomodoroTimer } from "./pomodoro-timer"
import { LinkedNotes } from "./linked-notes"

const taskFormSchema = z.object({
	title: z.string().min(1, "Title is required").max(255),
	description: z.string().max(1000),
	statusId: z.string().min(1, "Status is required"),
	priority: z.enum(["urgent", "high", "medium", "low", "no-priority"]),
	date: z.string().optional(),
	assigneeIds: z.array(z.string()),
	labelIds: z.array(z.string()),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

interface TaskDetailsDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	task: TaskWithRelations
}

export function TaskDetailsDialog({
	open,
	onOpenChange,
	task,
}: TaskDetailsDialogProps) {
	const [users, setUsers] = useState<UserData[]>([])
	const [labels, setLabels] = useState<LabelData[]>([])
	const [statuses, setStatuses] = useState<StatusData[]>([])
	const [loading, setLoading] = useState(false)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

	const { updateTaskAction, deleteTaskAction } = useTasksStore()

	const form = useForm<TaskFormValues>({
		resolver: zodResolver(taskFormSchema),
		defaultValues: {
			title: task.title,
			description: task.description || "",
			statusId: task.statusId,
			priority: task.priority as TaskFormValues["priority"],
			date: task.date || "",
			assigneeIds: task.assignees.map((a) => a.id),
			labelIds: task.labels.map((l) => l.id),
		},
	})

	// Load users, labels, and statuses
	useEffect(() => {
		if (open) {
			Promise.all([getUsers(), getLabels(), getStatuses()])
				.then(([usersData, labelsData, statusesData]) => {
					setUsers(usersData)
					setLabels(labelsData)
					setStatuses(statusesData)
				})
				.catch((error) => {
					console.error("Error loading data:", error)
				})
		}
	}, [open])

	// Reset form when task changes
	useEffect(() => {
		if (open) {
			form.reset({
				title: task.title,
				description: task.description || "",
				statusId: task.statusId,
				priority: task.priority as TaskFormValues["priority"],
				date: task.date || "",
				assigneeIds: task.assignees.map((a) => a.id),
				labelIds: task.labels.map((l) => l.id),
			})
			setShowDeleteConfirm(false)
		}
	}, [open, task, form])

	const onSubmit = async (data: TaskFormValues) => {
		setLoading(true)
		try {
			await updateTaskAction(task.id, data)
			onOpenChange(false)
		} catch (error) {
			console.error("Error updating task:", error)
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async () => {
		setLoading(true)
		try {
			await deleteTaskAction(task.id)
			onOpenChange(false)
		} catch (error) {
			console.error("Error deleting task:", error)
		} finally {
			setLoading(false)
		}
	}

	const selectedAssignees = form.watch("assigneeIds")
	const selectedLabels = form.watch("labelIds")

	const toggleAssignee = (userId: string) => {
		const current = form.getValues("assigneeIds")
		if (current.includes(userId)) {
			form.setValue(
				"assigneeIds",
				current.filter((id) => id !== userId)
			)
		} else {
			form.setValue("assigneeIds", [...current, userId])
		}
	}

	const toggleLabel = (labelId: string) => {
		const current = form.getValues("labelIds")
		if (current.includes(labelId)) {
			form.setValue(
				"labelIds",
				current.filter((id) => id !== labelId)
			)
		} else {
			form.setValue("labelIds", [...current, labelId])
		}
	}

	const progressPercentage =
		task.progressTotal > 0
			? (task.progressCompleted / task.progressTotal) * 100
			: 0

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-start justify-between">
						<DialogTitle className="text-2xl">Task Details</DialogTitle>
						<Button
							variant="ghost"
							size="icon"
							className="text-destructive hover:text-destructive hover:bg-destructive/10"
							onClick={() => setShowDeleteConfirm(true)}
						>
							<Trash2 className="size-4" />
						</Button>
					</div>
				</DialogHeader>

				{showDeleteConfirm ? (
					<div className="space-y-4 p-4 border rounded-lg bg-destructive/10">
						<p className="text-sm font-medium">
							Are you sure you want to delete this task? This action cannot be
							undone.
						</p>
						<div className="flex gap-2">
							<Button
								variant="destructive"
								size="sm"
								onClick={handleDelete}
								disabled={loading}
							>
								{loading ? "Deleting..." : "Delete Task"}
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowDeleteConfirm(false)}
							>
								Cancel
							</Button>
						</div>
					</div>
				) : (
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Title */}
						<div className="space-y-2">
							<Label htmlFor="title">
								Title <span className="text-destructive">*</span>
							</Label>
							<Input
								id="title"
								placeholder="Enter task title"
								className="text-lg"
								{...form.register("title")}
							/>
							{form.formState.errors.title && (
								<p className="text-sm text-destructive">
									{form.formState.errors.title.message}
								</p>
							)}
						</div>

						{/* Description */}
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								placeholder="Enter task description"
								rows={4}
								{...form.register("description")}
							/>
							{form.formState.errors.description && (
								<p className="text-sm text-destructive">
									{form.formState.errors.description.message}
								</p>
							)}
						</div>

						{/* Status, Priority, Date - Grid */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="status">
									Status <span className="text-destructive">*</span>
								</Label>
								<Select
									value={form.watch("statusId")}
									onValueChange={(value) => form.setValue("statusId", value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										{statuses.map((status) => (
											<SelectItem key={status.id} value={status.id}>
												{status.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{form.formState.errors.statusId && (
									<p className="text-sm text-destructive">
										{form.formState.errors.statusId.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="priority">Priority</Label>
								<Select
									value={form.watch("priority")}
									onValueChange={(value) =>
										form.setValue(
											"priority",
											value as TaskFormValues["priority"]
										)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select priority" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="urgent">Urgent</SelectItem>
										<SelectItem value="high">High</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="low">Low</SelectItem>
										<SelectItem value="no-priority">No Priority</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="date">Due Date</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											type="button"
											variant="outline"
											className={cn(
												"w-full justify-start text-left font-normal",
												!form.watch("date") && "text-muted-foreground"
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{form.watch("date") ? (
												format(new Date(form.watch("date")!), "PPP")
											) : (
												<span>Pick a date</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={
												form.watch("date")
													? new Date(form.watch("date")!)
													: undefined
											}
											onSelect={(date) => {
												form.setValue(
													"date",
													date ? format(date, "yyyy-MM-dd") : ""
												)
											}}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>
						</div>

						<Separator />

						{/* Assignees */}
						<div className="space-y-2">
							<Label>Assignees</Label>
							<div className="flex flex-wrap gap-2 mb-2">
								{selectedAssignees.map((userId) => {
									const user = users.find((u) => u.id === userId)
									if (!user) return null
									return (
										<Badge key={userId} variant="secondary" className="gap-1">
											{user.name}
											<button
												type="button"
												onClick={() => toggleAssignee(userId)}
												className="ml-1 hover:text-destructive"
											>
												<X className="size-3" />
											</button>
										</Badge>
									)
								})}
							</div>
							<div className="border rounded-md p-2 space-y-1 max-h-32 overflow-y-auto">
								{users.map((user) => (
									<button
										key={user.id}
										type="button"
										onClick={() => toggleAssignee(user.id)}
										className={`w-full text-left px-2 py-1.5 rounded-sm text-sm hover:bg-accent ${
											selectedAssignees.includes(user.id) ? "bg-accent" : ""
										}`}
									>
										{user.name} ({user.email})
									</button>
								))}
							</div>
						</div>

						{/* Labels */}
						<div className="space-y-2">
							<Label>Labels</Label>
							<div className="flex flex-wrap gap-2 mb-2">
								{selectedLabels.map((labelId) => {
									const label = labels.find((l) => l.id === labelId)
									if (!label) return null
									return (
										<Badge key={labelId} variant="secondary" className="gap-1">
											{label.name}
											<button
												type="button"
												onClick={() => toggleLabel(labelId)}
												className="ml-1 hover:text-destructive"
											>
												<X className="size-3" />
											</button>
										</Badge>
									)
								})}
							</div>
							<div className="border rounded-md p-2 space-y-1">
								{labels.map((label) => (
									<button
										key={label.id}
										type="button"
										onClick={() => toggleLabel(label.id)}
										className={`w-full text-left px-2 py-1.5 rounded-sm text-sm hover:bg-accent ${
											selectedLabels.includes(label.id) ? "bg-accent" : ""
										}`}
									>
										{label.name}
									</button>
								))}
							</div>
						</div>

						<Separator />

						{/* Pomodoro Timer */}
						<div className="space-y-2">
							<Label>Pomodoro Timer</Label>
							<PomodoroTimer taskId={task.id} taskTitle={task.title} />
						</div>

						<Separator />

						{/* Subtasks/Checklist */}
						<SubtaskList taskId={task.id} />

						<Separator />

						{/* Linked Notes */}
						<LinkedNotes task={task} />

						<Separator />

						{/* Progress & Metadata */}
						<div className="space-y-4">
							<div className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<Label className="flex items-center gap-2">
										<CheckCircle2 className="size-4" />
										Progress
									</Label>
									<span className="text-muted-foreground">
										{task.progressCompleted} / {task.progressTotal}
									</span>
								</div>
								<div className="w-full bg-secondary rounded-full h-2">
									<div
										className="bg-primary h-2 rounded-full transition-all"
										style={{ width: `${progressPercentage}%` }}
									/>
								</div>
							</div>

							<div className="grid grid-cols-3 gap-4 text-sm">
								<div className="flex items-center gap-2 text-muted-foreground">
									<MessageSquare className="size-4" />
									<span>{task.commentsCount} comments</span>
								</div>
								<div className="flex items-center gap-2 text-muted-foreground">
									<Paperclip className="size-4" />
									<span>{task.attachmentsCount} attachments</span>
								</div>
								<div className="flex items-center gap-2 text-muted-foreground">
									<Link2 className="size-4" />
									<span>{task.linksCount} links</span>
								</div>
							</div>

							<div className="flex items-center gap-4 text-xs text-muted-foreground">
								<div className="flex items-center gap-1">
									<CalendarIcon className="size-3" />
									<span>
										Created: {new Date(task.createdAt).toLocaleDateString()}
									</span>
								</div>
								<div className="flex items-center gap-1">
									<CalendarIcon className="size-3" />
									<span>
										Updated: {new Date(task.updatedAt).toLocaleDateString()}
									</span>
								</div>
							</div>
						</div>

						<Separator />

						{/* Action Buttons */}
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={loading}>
								{loading ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</form>
				)}
			</DialogContent>
		</Dialog>
	)
}
