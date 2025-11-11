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
import { CalendarIcon, X, Repeat, Plus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useTasksStore } from "@/store/tasks-store"
import { getUsers } from "@/app/actions/users"
import { getLabels, createLabel } from "@/app/actions/labels"
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
	// Recurring task fields
	isRecurring: z.boolean().default(false),
	recurrencePattern: z
		.enum(["daily", "weekly", "monthly", "custom"])
		.optional(),
	recurrenceInterval: z.number().min(1).max(365).default(1),
	recurrenceDays: z.array(z.string()).optional(),
	recurrenceEndDate: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

const PRESET_COLORS = [
	"bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400",
	"bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400",
	"bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-400",
	"bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
	"bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
	"bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
	"bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
	"bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400",
	"bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400",
	"bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400",
]

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
	const [showLabelCreate, setShowLabelCreate] = useState(false)
	const [newLabelName, setNewLabelName] = useState("")
	const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[0])
	const [creatingLabel, setCreatingLabel] = useState(false)

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
			isRecurring: task?.isRecurring || false,
			recurrencePattern:
				(task?.recurrencePattern as TaskFormValues["recurrencePattern"]) ||
				undefined,
			recurrenceInterval: task?.recurrenceInterval || 1,
			recurrenceDays: task?.recurrenceDays
				? JSON.parse(task.recurrenceDays)
				: [],
			recurrenceEndDate: task?.recurrenceEndDate
				? format(new Date(task.recurrenceEndDate), "yyyy-MM-dd")
				: "",
		},
	})

	// Load labels function
	const loadLabels = async () => {
		try {
			const labelsData = await getLabels()
			setLabels(labelsData)
		} catch (error) {
			console.error("Error loading labels:", error)
		}
	}

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
				isRecurring: task?.isRecurring || false,
				recurrencePattern:
					(task?.recurrencePattern as TaskFormValues["recurrencePattern"]) ||
					undefined,
				recurrenceInterval: task?.recurrenceInterval || 1,
				recurrenceDays: task?.recurrenceDays
					? JSON.parse(task.recurrenceDays)
					: [],
				recurrenceEndDate: task?.recurrenceEndDate
					? format(new Date(task.recurrenceEndDate), "yyyy-MM-dd")
					: "",
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

	const handleCreateLabel = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!newLabelName.trim()) {
			toast.error("Label name is required")
			return
		}

		setCreatingLabel(true)
		try {
			const newLabel = await createLabel({
				name: newLabelName.trim(),
				color: newLabelColor,
			})
			toast.success(`Label "${newLabel.name}" created successfully`)
			setNewLabelName("")
			setNewLabelColor(PRESET_COLORS[0])
			setShowLabelCreate(false)
			await loadLabels()
			// Auto-select the newly created label
			form.setValue("labelIds", [...form.getValues("labelIds"), newLabel.id])
		} catch (error) {
			toast.error("Failed to create label")
			console.error(error)
		} finally {
			setCreatingLabel(false)
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

						{/* Recurring Settings Section */}
						<FieldSet>
							<FieldLegend>Recurring Settings</FieldLegend>
							<FieldDescription>
								Configure if this task should repeat on a schedule.
							</FieldDescription>
							<FieldGroup>
								{/* Is Recurring Checkbox */}
								<Field>
									<div className="flex items-center space-x-2">
										<Checkbox
											id="isRecurring"
											checked={form.watch("isRecurring")}
											onCheckedChange={(checked) =>
												form.setValue("isRecurring", checked as boolean)
											}
										/>
										<div className="grid gap-1.5 leading-none">
											<FieldLabel
												htmlFor="isRecurring"
												className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
											>
												<Repeat className="size-4" />
												Make this a recurring task
											</FieldLabel>
											<FieldDescription>
												Task will repeat based on the schedule below
											</FieldDescription>
										</div>
									</div>
								</Field>

								{/* Recurring Options (only show if isRecurring is true) */}
								{form.watch("isRecurring") && (
									<>
										{/* Recurrence Pattern and Interval */}
										<div className="grid grid-cols-2 gap-4">
											<Field>
												<FieldLabel htmlFor="recurrencePattern">
													Repeat Every
												</FieldLabel>
												<Select
													value={form.watch("recurrencePattern") || ""}
													onValueChange={(value) =>
														form.setValue(
															"recurrencePattern",
															value as TaskFormValues["recurrencePattern"]
														)
													}
												>
													<SelectTrigger id="recurrencePattern">
														<SelectValue placeholder="Select pattern" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="daily">Day(s)</SelectItem>
														<SelectItem value="weekly">Week(s)</SelectItem>
														<SelectItem value="monthly">Month(s)</SelectItem>
													</SelectContent>
												</Select>
											</Field>

											<Field>
												<FieldLabel htmlFor="recurrenceInterval">
													Interval
												</FieldLabel>
												<Input
													id="recurrenceInterval"
													type="number"
													min="1"
													max="365"
													placeholder="1"
													value={form.watch("recurrenceInterval")}
													onChange={(e) =>
														form.setValue(
															"recurrenceInterval",
															parseInt(e.target.value) || 1
														)
													}
												/>
												<FieldDescription>
													Repeat every X{" "}
													{form.watch("recurrencePattern") || "period"}(s)
												</FieldDescription>
											</Field>
										</div>

										{/* Recurrence Days (only for weekly) */}
										{form.watch("recurrencePattern") === "weekly" && (
											<Field>
												<FieldLabel>Repeat On</FieldLabel>
												<FieldDescription>
													Select which days of the week to repeat
												</FieldDescription>
												<div className="flex flex-wrap gap-2">
													{[
														{ value: "monday", label: "Mon" },
														{ value: "tuesday", label: "Tue" },
														{ value: "wednesday", label: "Wed" },
														{ value: "thursday", label: "Thu" },
														{ value: "friday", label: "Fri" },
														{ value: "saturday", label: "Sat" },
														{ value: "sunday", label: "Sun" },
													].map((day) => {
														const isSelected = (
															form.watch("recurrenceDays") || []
														).includes(day.value)
														return (
															<Button
																key={day.value}
																type="button"
																variant={isSelected ? "default" : "outline"}
																size="sm"
																onClick={() => {
																	const current =
																		form.watch("recurrenceDays") || []
																	if (isSelected) {
																		form.setValue(
																			"recurrenceDays",
																			current.filter((d) => d !== day.value)
																		)
																	} else {
																		form.setValue("recurrenceDays", [
																			...current,
																			day.value,
																		])
																	}
																}}
															>
																{day.label}
															</Button>
														)
													})}
												</div>
											</Field>
										)}

										{/* Recurrence End Date */}
										<Field>
											<FieldLabel htmlFor="recurrenceEndDate">
												End Date (Optional)
											</FieldLabel>
											<Popover>
												<PopoverTrigger asChild>
													<Button
														type="button"
														variant="outline"
														className={cn(
															"w-full justify-start text-left font-normal",
															!form.watch("recurrenceEndDate") &&
																"text-muted-foreground"
														)}
													>
														<CalendarIcon className="mr-2 h-4 w-4" />
														{form.watch("recurrenceEndDate") ? (
															format(
																new Date(form.watch("recurrenceEndDate")!),
																"PPP"
															)
														) : (
															<span>No end date (repeats forever)</span>
														)}
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="single"
														selected={
															form.watch("recurrenceEndDate")
																? new Date(form.watch("recurrenceEndDate")!)
																: undefined
														}
														onSelect={(date) => {
															form.setValue(
																"recurrenceEndDate",
																date ? format(date, "yyyy-MM-dd") : ""
															)
														}}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
											<FieldDescription>
												When to stop generating recurring tasks
											</FieldDescription>
										</Field>
									</>
								)}
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

									{/* Quick Create Label Form */}
									{showLabelCreate && (
										<form
											onSubmit={handleCreateLabel}
											className="border rounded-md p-3 mb-2 space-y-3 bg-muted/50"
										>
											<div className="space-y-2">
												<Input
													placeholder="Label name..."
													value={newLabelName}
													onChange={(e) => setNewLabelName(e.target.value)}
													disabled={creatingLabel}
													autoFocus
												/>
												<div className="grid grid-cols-5 gap-1.5">
													{PRESET_COLORS.map((color) => (
														<button
															key={color}
															type="button"
															onClick={() => setNewLabelColor(color)}
															className={`h-8 rounded border-2 transition-all ${color} ${
																newLabelColor === color
																	? "border-foreground scale-105"
																	: "border-transparent hover:scale-105"
															}`}
															disabled={creatingLabel}
														/>
													))}
												</div>
											</div>
											<div className="flex gap-2">
												<Button
													type="submit"
													size="sm"
													disabled={creatingLabel}
													className="flex-1"
												>
													{creatingLabel ? "Creating..." : "Create Label"}
												</Button>
												<Button
													type="button"
													size="sm"
													variant="outline"
													onClick={() => {
														setShowLabelCreate(false)
														setNewLabelName("")
														setNewLabelColor(PRESET_COLORS[0])
													}}
													disabled={creatingLabel}
												>
													Cancel
												</Button>
											</div>
										</form>
									)}

									{/* Labels List or Empty State */}
									{labels.length === 0 ? (
										<div className="border rounded-md p-6 text-center space-y-3">
											<p className="text-sm text-muted-foreground">
												No labels yet. Create your first label to get started.
											</p>
											<Button
												type="button"
												size="sm"
												variant="outline"
												onClick={() => setShowLabelCreate(true)}
											>
												<Plus className="size-4 mr-2" />
												Create Label
											</Button>
										</div>
									) : (
										<>
											<div className="border rounded-md p-2 space-y-1 max-h-32 overflow-y-auto">
												{labels.map((label) => (
													<button
														key={label.id}
														type="button"
														onClick={() => toggleLabel(label.id)}
														className={`w-full text-left px-2 py-1.5 rounded-sm text-sm hover:bg-accent ${
															selectedLabels.includes(label.id)
																? "bg-accent"
																: ""
														}`}
													>
														<Badge className={`${label.color}`}>
															{label.name}
														</Badge>
													</button>
												))}
											</div>
											{!showLabelCreate && (
												<Button
													type="button"
													size="sm"
													variant="ghost"
													onClick={() => setShowLabelCreate(true)}
													className="w-full mt-2"
												>
													<Plus className="size-4 mr-2" />
													Create New Label
												</Button>
											)}
										</>
									)}
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
