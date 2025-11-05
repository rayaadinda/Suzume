"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Field,
	FieldLabel,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLegend,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, X } from "lucide-react"
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

interface TaskDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	task?: TaskWithRelations // If provided, edit mode
	defaultStatusId?: string // If provided, pre-select status (for create)
}

export function TaskDialog({
	open,
	onOpenChange,
	task,
	defaultStatusId,
}: TaskDialogProps) {
	const [users, setUsers] = useState<UserData[]>([])
	const [labels, setLabels] = useState<LabelData[]>([])
	const [statuses, setStatuses] = useState<StatusData[]>([])
	const [loading, setLoading] = useState(false)

	const { addTask, updateTaskAction } = useTasksStore()

	const isEditMode = !!task

	const form = useForm<TaskFormValues>({
		resolver: zodResolver(taskFormSchema),
		defaultValues: {
			title: task?.title || "",
			description: task?.description || "",
			statusId: task?.statusId || defaultStatusId || "",
			priority: (task?.priority as TaskFormValues["priority"]) || "no-priority",
			date: task?.date || "",
			assigneeIds: task?.assignees.map((a) => a.id) || [],
			labelIds: task?.labels.map((l) => l.id) || [],
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

	// Reset form when dialog opens/closes or task changes
	useEffect(() => {
		if (open) {
			form.reset({
				title: task?.title || "",
				description: task?.description || "",
				statusId: task?.statusId || defaultStatusId || "",
				priority:
					(task?.priority as TaskFormValues["priority"]) || "no-priority",
				date: task?.date || "",
				assigneeIds: task?.assignees.map((a) => a.id) || [],
				labelIds: task?.labels.map((l) => l.id) || [],
			})
		}
	}, [open, task, defaultStatusId, form])

	const onSubmit = async (data: TaskFormValues) => {
		setLoading(true)
		try {
			if (isEditMode) {
				await updateTaskAction(task.id, data)
			} else {
				await addTask(data)
			}
			onOpenChange(false)
			form.reset()
		} catch (error) {
			console.error("Error saving task:", error)
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

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? "Edit Task" : "Create New Task"}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? "Update the task details below."
							: "Fill in the details for the new task."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						{/* Task Details Section */}
						<FieldSet>
							<FieldLegend>Task Details</FieldLegend>
							<FieldDescription>
								{isEditMode
									? "Update the core information for this task."
									: "Provide the essential information for your new task."}
							</FieldDescription>
							<FieldGroup>
								{/* Title */}
								<Field>
									<FieldLabel htmlFor="title">
										Title <span className="text-destructive">*</span>
									</FieldLabel>
									<Input
										id="title"
										placeholder="Enter a clear, descriptive title"
										{...form.register("title")}
									/>
									<FieldDescription>
										Choose a concise title that clearly describes the task.
									</FieldDescription>
									<FieldError errors={[form.formState.errors.title]} />
								</Field>

								{/* Description */}
								<Field>
									<FieldLabel htmlFor="description">Description</FieldLabel>
									<Textarea
										id="description"
										placeholder="Add more details about this task (optional)"
										rows={3}
										className="resize-none"
										{...form.register("description")}
									/>
									<FieldDescription>
										Provide additional context, requirements, or notes.
									</FieldDescription>
									<FieldError errors={[form.formState.errors.description]} />
								</Field>

								{/* Status and Priority */}
								<div className="grid grid-cols-2 gap-4">
									<Field>
										<FieldLabel htmlFor="status">
											Status <span className="text-destructive">*</span>
										</FieldLabel>
										<Select
											value={form.watch("statusId")}
											onValueChange={(value) =>
												form.setValue("statusId", value)
											}
										>
											<SelectTrigger id="status">
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
										<FieldError errors={[form.formState.errors.statusId]} />
									</Field>

									<Field>
										<FieldLabel htmlFor="priority">
											Priority <span className="text-destructive">*</span>
										</FieldLabel>
										<Select
											value={form.watch("priority")}
											onValueChange={(value) =>
												form.setValue(
													"priority",
													value as TaskFormValues["priority"]
												)
											}
										>
											<SelectTrigger id="priority">
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
									</Field>
								</div>

								{/* Due Date */}
								<Field>
									<FieldLabel htmlFor="date">Due Date</FieldLabel>
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
									<FieldDescription>
										Select a due date for this task.
									</FieldDescription>
								</Field>
							</FieldGroup>
						</FieldSet>

						<FieldSeparator />

						{/* Assignment Section */}
						<FieldSet>
							<FieldLegend>Assignment & Labels</FieldLegend>
							<FieldDescription>
								Assign team members and add labels to organize this task.
							</FieldDescription>
							<FieldGroup>
								{/* Assignees */}
								<Field>
									<FieldLabel>Assignees</FieldLabel>
									<FieldDescription>
										Select team members who will work on this task.
									</FieldDescription>
									<div className="flex flex-wrap gap-2 mb-2">
										{selectedAssignees.map((userId) => {
											const user = users.find((u) => u.id === userId)
											if (!user) return null
											return (
												<Badge
													key={userId}
													variant="secondary"
													className="gap-1"
												>
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
								</Field>

								{/* Labels */}
								<Field>
									<FieldLabel>Labels</FieldLabel>
									<FieldDescription>
										Add labels to categorize and filter tasks easily.
									</FieldDescription>
									<div className="flex flex-wrap gap-2 mb-2">
										{selectedLabels.map((labelId) => {
											const label = labels.find((l) => l.id === labelId)
											if (!label) return null
											return (
												<Badge
													key={labelId}
													variant="secondary"
													className="gap-1"
												>
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
								</Field>
							</FieldGroup>
						</FieldSet>

						{/* Action Buttons */}
						<Field orientation="horizontal">
							<Button type="submit" disabled={loading}>
								{loading
									? "Saving..."
									: isEditMode
									? "Update Task"
									: "Create Task"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
						</Field>
					</FieldGroup>
				</form>
			</DialogContent>
		</Dialog>
	)
}
