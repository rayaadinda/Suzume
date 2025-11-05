"use client"

import * as React from "react"
import { Plus, Trash2, GripVertical, CheckCircle2, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
	getSubtasks,
	createSubtask,
	updateSubtask,
	deleteSubtask,
	toggleSubtask,
	type SubtaskData,
} from "@/app/actions/subtasks"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SubtaskListProps {
	taskId: string
}

export function SubtaskList({ taskId }: SubtaskListProps) {
	const [subtasks, setSubtasks] = React.useState<SubtaskData[]>([])
	const [loading, setLoading] = React.useState(true)
	const [newSubtaskTitle, setNewSubtaskTitle] = React.useState("")
	const [isOpen, setIsOpen] = React.useState(true)
	const [editingId, setEditingId] = React.useState<string | null>(null)
	const [editTitle, setEditTitle] = React.useState("")

	// Load subtasks
	React.useEffect(() => {
		loadSubtasks()
	}, [taskId])

	const loadSubtasks = async () => {
		try {
			const data = await getSubtasks(taskId)
			setSubtasks(data)
		} catch (error) {
			console.error("Error loading subtasks:", error)
		} finally {
			setLoading(false)
		}
	}

	const handleAddSubtask = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!newSubtaskTitle.trim()) return

		try {
			const newSubtask = await createSubtask({
				taskId,
				title: newSubtaskTitle.trim(),
			})

			setSubtasks([...subtasks, newSubtask])
			setNewSubtaskTitle("")
			toast.success("Subtask added")
		} catch (error) {
			toast.error("Failed to add subtask")
		}
	}

	const handleToggleSubtask = async (subtaskId: string) => {
		try {
			const updated = await toggleSubtask(subtaskId)
			setSubtasks(
				subtasks.map((s) => (s.id === subtaskId ? updated : s))
			)
		} catch (error) {
			toast.error("Failed to toggle subtask")
		}
	}

	const handleStartEdit = (subtask: SubtaskData) => {
		setEditingId(subtask.id)
		setEditTitle(subtask.title)
	}

	const handleSaveEdit = async (subtaskId: string) => {
		if (!editTitle.trim()) return

		try {
			const updated = await updateSubtask(subtaskId, {
				title: editTitle.trim(),
			})
			setSubtasks(
				subtasks.map((s) => (s.id === subtaskId ? updated : s))
			)
			setEditingId(null)
			toast.success("Subtask updated")
		} catch (error) {
			toast.error("Failed to update subtask")
		}
	}

	const handleDeleteSubtask = async (subtaskId: string) => {
		try {
			await deleteSubtask(subtaskId)
			setSubtasks(subtasks.filter((s) => s.id !== subtaskId))
			toast.success("Subtask deleted")
		} catch (error) {
			toast.error("Failed to delete subtask")
		}
	}

	// Calculate progress
	const completedCount = subtasks.filter((s) => s.completed).length
	const totalCount = subtasks.length
	const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

	if (loading) {
		return (
			<div className="space-y-2">
				<div className="text-sm font-medium">Subtasks</div>
				<div className="text-sm text-muted-foreground">Loading...</div>
			</div>
		)
	}

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-3">
			<div className="flex items-center justify-between">
				<CollapsibleTrigger asChild>
					<Button variant="ghost" size="sm" className="gap-2 hover:bg-accent">
						<CheckCircle2 className="size-4" />
						<span className="font-medium">
							Subtasks{" "}
							{totalCount > 0 && (
								<span className="text-muted-foreground">
									({completedCount}/{totalCount})
								</span>
							)}
						</span>
					</Button>
				</CollapsibleTrigger>

				{totalCount > 0 && (
					<div className="flex items-center gap-3 flex-1 ml-4">
						<Progress value={progressPercentage} className="h-1.5 flex-1" />
						<span className="text-xs text-muted-foreground w-10 text-right">
							{Math.round(progressPercentage)}%
						</span>
					</div>
				)}
			</div>

			<CollapsibleContent className="space-y-2">
				{/* Subtask List */}
				{subtasks.length > 0 && (
					<div className="space-y-1">
						{subtasks.map((subtask) => (
							<div
								key={subtask.id}
								className={cn(
									"group flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors",
									subtask.completed && "opacity-60"
								)}
							>
								{/* Drag Handle */}
								<button className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing">
									<GripVertical className="size-4 text-muted-foreground" />
								</button>

								{/* Checkbox */}
								<button
									onClick={() => handleToggleSubtask(subtask.id)}
									className="flex-shrink-0"
								>
									{subtask.completed ? (
										<CheckCircle2 className="size-5 text-green-500" />
									) : (
										<Circle className="size-5 text-muted-foreground hover:text-foreground" />
									)}
								</button>

								{/* Title (Editable) */}
								{editingId === subtask.id ? (
									<Input
										value={editTitle}
										onChange={(e) => setEditTitle(e.target.value)}
										onBlur={() => handleSaveEdit(subtask.id)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												handleSaveEdit(subtask.id)
											} else if (e.key === "Escape") {
												setEditingId(null)
											}
										}}
										className="h-7 text-sm"
										autoFocus
									/>
								) : (
									<button
										onClick={() => handleStartEdit(subtask)}
										className={cn(
											"flex-1 text-left text-sm hover:text-foreground",
											subtask.completed && "line-through"
										)}
									>
										{subtask.title}
									</button>
								)}

								{/* Delete Button */}
								<Button
									variant="ghost"
									size="sm"
									className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0"
									onClick={() => handleDeleteSubtask(subtask.id)}
								>
									<Trash2 className="size-4 text-destructive" />
								</Button>
							</div>
						))}
					</div>
				)}

				{/* Add New Subtask */}
				<form onSubmit={handleAddSubtask} className="flex gap-2">
					<Input
						placeholder="Add a subtask..."
						value={newSubtaskTitle}
						onChange={(e) => setNewSubtaskTitle(e.target.value)}
						className="h-9 text-sm"
					/>
					<Button
						type="submit"
						size="sm"
						variant="outline"
						className="gap-1"
						disabled={!newSubtaskTitle.trim()}
					>
						<Plus className="size-4" />
						Add
					</Button>
				</form>
			</CollapsibleContent>
		</Collapsible>
	)
}
