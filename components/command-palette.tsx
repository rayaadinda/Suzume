"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
	Plus,
	Calendar,
	CheckSquare,
	Clock,
	Tag,
	FileText,
	LayoutDashboard,
} from "lucide-react"
import { toast } from "sonner"

import { useTasksStore } from "@/store/tasks-store"
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command"

interface CommandPaletteProps {
	open: boolean
	setOpen: (open: boolean) => void
}

export function CommandPalette({ open, setOpen }: CommandPaletteProps) {
	const router = useRouter()
	const { tasks, setFilters, filters } = useTasksStore()
	const [searchValue, setSearchValue] = React.useState("")

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault()
				setOpen(!open)
			}
		}

		document.addEventListener("keydown", down)
		return () => document.removeEventListener("keydown", down)
	}, [open, setOpen])

	const runCommand = React.useCallback(
		(command: () => void) => {
			setOpen(false)
			command()
		},
		[setOpen]
	)

	// Filter tasks based on search
	const filteredTasks = React.useMemo(() => {
		if (!searchValue) return tasks.slice(0, 5)
		return tasks
			.filter(
				(task) =>
					task.title.toLowerCase().includes(searchValue.toLowerCase()) ||
					task.description?.toLowerCase().includes(searchValue.toLowerCase())
			)
			.slice(0, 5)
	}, [tasks, searchValue])

	return (
		<CommandDialog open={open} onOpenChange={setOpen}>
			<CommandInput
				placeholder="Type a command or search..."
				value={searchValue}
				onValueChange={setSearchValue}
			/>
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>

				{/* Quick Actions */}
				<CommandGroup heading="Quick Actions">
					<CommandItem
						onSelect={() =>
							runCommand(() => {
								// This will be handled by task-header component
								const event = new CustomEvent("openCreateTask")
								window.dispatchEvent(event)
							})
						}
					>
						<Plus />
						<span>Create New Task</span>
						<kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
							<span className="text-xs">C</span>
						</kbd>
					</CommandItem>
					<CommandItem
						onSelect={() =>
							runCommand(() => {
								router.push("/")
								toast.success("Navigated to Dashboard")
							})
						}
					>
						<LayoutDashboard />
						<span>Dashboard</span>
					</CommandItem>
					<CommandItem
						onSelect={() =>
							runCommand(() => {
								router.push("/")
								toast.info("Calendar view coming soon!")
							})
						}
					>
						<Calendar />
						<span>Calendar View</span>
					</CommandItem>
				</CommandGroup>

				<CommandSeparator />

				{/* Quick Filters */}
				<CommandGroup heading="Quick Filters">
					<CommandItem
						onSelect={() =>
							runCommand(() => {
								setFilters({ ...filters, priority: "high" })
								toast.success("Showing high priority tasks")
							})
						}
					>
						<CheckSquare />
						<span>High Priority Tasks</span>
					</CommandItem>
					<CommandItem
						onSelect={() =>
							runCommand(() => {
								// Due today filter - to be implemented with date filters
								toast.info("Due today filter coming soon!")
							})
						}
					>
						<Clock />
						<span>Due Today</span>
					</CommandItem>
					<CommandItem
						onSelect={() =>
							runCommand(() => {
								setFilters({})
								toast.success("Filters cleared")
							})
						}
					>
						<Tag />
						<span>Clear All Filters</span>
					</CommandItem>
				</CommandGroup>

				{/* Recent Tasks */}
				{filteredTasks.length > 0 && (
					<>
						<CommandSeparator />
						<CommandGroup heading="Tasks">
							{filteredTasks.map((task) => (
								<CommandItem
									key={task.id}
									value={task.title}
									onSelect={() =>
										runCommand(() => {
											// Open task details
											const event = new CustomEvent("openTaskDetails", {
												detail: { taskId: task.id },
											})
											window.dispatchEvent(event)
										})
									}
								>
									<FileText />
									<div className="flex flex-col">
										<span>{task.title}</span>
										{task.description && (
											<span className="text-xs text-muted-foreground truncate max-w-md">
												{task.description}
											</span>
										)}
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					</>
				)}
			</CommandList>
		</CommandDialog>
	)
}
