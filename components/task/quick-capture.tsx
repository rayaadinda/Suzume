"use client"

import * as React from "react"
import { Plus, Inbox, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useTasksStore } from "@/store/tasks-store"
import { toast } from "sonner"
import { Kbd } from "@/components/ui/kbd"

interface QuickCaptureProps {
	trigger?: React.ReactNode
}

export function QuickCapture({ trigger }: QuickCaptureProps) {
	const [open, setOpen] = React.useState(false)
	const [title, setTitle] = React.useState("")
	const [priority, setPriority] = React.useState("medium")
	const [status, setStatus] = React.useState("backlog")
	const [loading, setLoading] = React.useState(false)

	const { addTask } = useTasksStore()

	// Keyboard shortcut: Ctrl+Shift+N / Cmd+Shift+N
	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "n") {
				e.preventDefault()
				setOpen(true)
			}
			// ESC to close
			if (e.key === "Escape" && open) {
				setOpen(false)
			}
		}

		document.addEventListener("keydown", handleKeyDown)
		return () => document.removeEventListener("keydown", handleKeyDown)
	}, [open])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!title.trim()) {
			toast.error("Task title is required")
			return
		}

		setLoading(true)
		try {
			await addTask({
				title: title.trim(),
				description: "",
				statusId: status,
				priority,
			})

			toast.success("Task captured!", {
				description: `"${title}" added to ${status}`,
			})

			// Reset form
			setTitle("")
			setPriority("medium")
			setStatus("backlog")

			// Keep drawer open for rapid entry
			// setOpen(false)
		} catch (error) {
			toast.error("Failed to capture task", {
				description: error instanceof Error ? error.message : "Please try again",
			})
		} finally {
			setLoading(false)
		}
	}

	const handleCapture Another = () => {
		setTitle("")
		// Keep other settings the same for batch entry
		document.getElementById("quick-capture-title")?.focus()
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				{trigger || (
					<Button variant="default" size="sm" className="gap-2">
						<Zap className="size-4" />
						<span className="hidden sm:inline">Quick Capture</span>
						<Kbd className="hidden lg:inline-flex">⌘+Shift+N</Kbd>
					</Button>
				)}
			</SheetTrigger>
			<SheetContent side="right" className="w-full sm:max-w-md">
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2">
						<Inbox className="size-5" />
						Quick Capture
					</SheetTitle>
					<SheetDescription>
						Rapidly capture tasks. Press{" "}
						<Kbd className="inline-flex mx-1">Enter</Kbd> to save or{" "}
						<Kbd className="inline-flex mx-1">Esc</Kbd> to close.
					</SheetDescription>
				</SheetHeader>

				<form onSubmit={handleSubmit} className="space-y-6 mt-6">
					{/* Title Input */}
					<div className="space-y-2">
						<Label htmlFor="quick-capture-title">
							Task Title <span className="text-destructive">*</span>
						</Label>
						<Input
							id="quick-capture-title"
							placeholder="What needs to be done?"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							autoFocus
							disabled={loading}
						/>
					</div>

					{/* Status Select */}
					<div className="space-y-2">
						<Label htmlFor="quick-capture-status">Status</Label>
						<Select value={status} onValueChange={setStatus} disabled={loading}>
							<SelectTrigger id="quick-capture-status">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="backlog">Backlog</SelectItem>
								<SelectItem value="to-do">To Do</SelectItem>
								<SelectItem value="in-progress">In Progress</SelectItem>
								<SelectItem value="in-review">In Review</SelectItem>
								<SelectItem value="done">Done</SelectItem>
								<SelectItem value="canceled">Canceled</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Priority Select */}
					<div className="space-y-2">
						<Label htmlFor="quick-capture-priority">Priority</Label>
						<Select value={priority} onValueChange={setPriority} disabled={loading}>
							<SelectTrigger id="quick-capture-priority">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="urgent">🔴 Urgent</SelectItem>
								<SelectItem value="high">🟠 High</SelectItem>
								<SelectItem value="medium">🟡 Medium</SelectItem>
								<SelectItem value="low">🟢 Low</SelectItem>
								<SelectItem value="no-priority">⚪ No Priority</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-2 pt-4">
						<Button
							type="submit"
							className="flex-1"
							disabled={loading || !title.trim()}
						>
							<Plus className="size-4 mr-2" />
							{loading ? "Capturing..." : "Capture Task"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={handleCaptureAnother}
							disabled={loading}
						>
							<Zap className="size-4" />
						</Button>
					</div>

					<p className="text-xs text-muted-foreground text-center">
						💡 Tip: Keep this open to batch-add multiple tasks quickly
					</p>
				</form>
			</SheetContent>
		</Sheet>
	)
}
