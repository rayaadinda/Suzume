"use client"

import {
	Copy,
	Edit,
	Trash2,
	Archive,
	MoveRight,
	Link as LinkIcon,
} from "lucide-react"
import { toast } from "sonner"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useTasksStore } from "@/store/tasks-store"
import { statuses as statusesData } from "@/mock-data/statuses"
import type { TaskWithRelations } from "@/app/actions/tasks"

interface TaskContextMenuProps {
	task: TaskWithRelations
	children: React.ReactNode
	onOpenDetails?: () => void
}

export function TaskContextMenu({
	task,
	children,
	onOpenDetails,
}: TaskContextMenuProps) {
	const { deleteTaskAction, updateTaskStatusAction } = useTasksStore()

	const handleDuplicate = async () => {
		toast.info("Duplicate task feature coming soon!")
	}

	const handleCopyLink = async () => {
		// Copy task link to clipboard
		const url = `${window.location.origin}?task=${task.id}`
		await navigator.clipboard.writeText(url)
		toast.success("Task link copied to clipboard")
	}

	const handleDelete = async () => {
		try {
			await deleteTaskAction(task.id)
			toast.success("Task deleted successfully", {
				action: {
					label: "Undo",
					onClick: () => toast.info("Undo feature coming soon!"),
				},
			})
		} catch (error) {
			toast.error("Failed to delete task")
		}
	}

	const handleArchive = async () => {
		toast.info("Archive feature coming soon!")
	}

	const handleMoveToStatus = async (statusId: string) => {
		try {
			await updateTaskStatusAction(task.id, statusId)
			const status = statusesData.find((s) => s.id === statusId)
			toast.success(`Task moved to ${status?.name}`)
		} catch (error) {
			toast.error("Failed to move task")
		}
	}

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
			<ContextMenuContent className="w-56">
				<ContextMenuItem onClick={onOpenDetails}>
					<Edit />
					Open Details
					<ContextMenuShortcut>Enter</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem onClick={handleCopyLink}>
					<LinkIcon />
					Copy Link
					<ContextMenuShortcut>⌘C</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem onClick={handleDuplicate}>
					<Copy />
					Duplicate Task
					<ContextMenuShortcut>⌘D</ContextMenuShortcut>
				</ContextMenuItem>

				<ContextMenuSeparator />

				<ContextMenuSub>
					<ContextMenuSubTrigger>
						<MoveRight />
						Move to
					</ContextMenuSubTrigger>
					<ContextMenuSubContent className="w-48">
						{statusesData.map((status) => (
							<ContextMenuItem
								key={status.id}
								onClick={() => handleMoveToStatus(status.id)}
								disabled={task.statusId === status.id}
							>
								<div className="flex items-center gap-2">
									<div className="size-4">{status.icon && <status.icon />}</div>
									<span>{status.name}</span>
								</div>
							</ContextMenuItem>
						))}
					</ContextMenuSubContent>
				</ContextMenuSub>

				<ContextMenuSeparator />

				<ContextMenuItem onClick={handleArchive}>
					<Archive />
					Archive
				</ContextMenuItem>
				<ContextMenuItem onClick={handleDelete} className="text-destructive">
					<Trash2 />
					Delete
					<ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)
}
