"use client"

import * as React from "react"
import {
	Search,
	SlidersHorizontal,
	Calendar as CalendarIcon,
	Tag,
	Layers,
	Bookmark,
	Plus,
	Trash2,
	X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useTasksStore } from "@/store/tasks-store"
import { getLabels, type LabelData } from "@/app/actions/labels"
import { MultiSelect } from "@/components/ui/multi-select"
import { Calendar } from "@/components/ui/calendar"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

interface FilterPreset {
	id: string
	name: string
	filters: {
		search?: string
		priority?: string
		assigneeId?: string
		labelIds?: string[]
		dateFrom?: string
		dateTo?: string
	}
}

const PRESETS_STORAGE_KEY = "task-filter-presets"

export function AdvancedFilters() {
	const [open, setOpen] = React.useState(false)
	const [labels, setLabels] = React.useState<LabelData[]>([])
	const [dateFrom, setDateFrom] = React.useState<Date | undefined>()
	const [dateTo, setDateTo] = React.useState<Date | undefined>()
	const [presets, setPresets] = React.useState<FilterPreset[]>([])
	const [newPresetName, setNewPresetName] = React.useState("")

	const { filters, setFilters } = useTasksStore()
	const [localFilters, setLocalFilters] = React.useState(filters)

	// Load labels on mount
	React.useEffect(() => {
		getLabels()
			.then(setLabels)
			.catch((error) => console.error("Error fetching labels:", error))
	}, [])

	// Load presets from localStorage
	React.useEffect(() => {
		const stored = localStorage.getItem(PRESETS_STORAGE_KEY)
		if (stored) {
			try {
				setPresets(JSON.parse(stored))
			} catch (error) {
				console.error("Error loading presets:", error)
			}
		}
	}, [])

	// Sync local filters with store filters when dialog opens
	React.useEffect(() => {
		if (open) {
			setLocalFilters(filters)
			if (filters.dateFrom) {
				try {
					setDateFrom(new Date(filters.dateFrom))
				} catch {
					setDateFrom(undefined)
				}
			}
			if (filters.dateTo) {
				try {
					setDateTo(new Date(filters.dateTo))
				} catch {
					setDateTo(undefined)
				}
			}
		}
	}, [open, filters])

	const handleApplyFilters = () => {
		const filtersToApply = {
			...localFilters,
			dateFrom: dateFrom ? format(dateFrom, "MMM dd") : undefined,
			dateTo: dateTo ? format(dateTo, "MMM dd") : undefined,
		}
		setFilters(filtersToApply)
		setOpen(false)
	}

	const handleClearFilters = () => {
		setLocalFilters({})
		setDateFrom(undefined)
		setDateTo(undefined)
		setFilters({})
	}

	const handleSavePreset = () => {
		if (!newPresetName.trim()) return

		const newPreset: FilterPreset = {
			id: Date.now().toString(),
			name: newPresetName,
			filters: {
				...localFilters,
				dateFrom: dateFrom ? format(dateFrom, "MMM dd") : undefined,
				dateTo: dateTo ? format(dateTo, "MMM dd") : undefined,
			},
		}

		const updatedPresets = [...presets, newPreset]
		setPresets(updatedPresets)
		localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets))
		setNewPresetName("")
	}

	const handleLoadPreset = (preset: FilterPreset) => {
		setLocalFilters(preset.filters)
		if (preset.filters.dateFrom) {
			try {
				setDateFrom(new Date(preset.filters.dateFrom))
			} catch {
				setDateFrom(undefined)
			}
		}
		if (preset.filters.dateTo) {
			try {
				setDateTo(new Date(preset.filters.dateTo))
			} catch {
				setDateTo(undefined)
			}
		}
	}

	const handleDeletePreset = (presetId: string) => {
		const updatedPresets = presets.filter((p) => p.id !== presetId)
		setPresets(updatedPresets)
		localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets))
	}

	const activeFilterCount = React.useMemo(() => {
		let count = 0
		if (filters.search) count++
		if (filters.priority) count++
		if (filters.assigneeId) count++
		if (filters.labelIds && filters.labelIds.length > 0) count++
		if (filters.dateFrom) count++
		if (filters.dateTo) count++
		return count
	}, [filters])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="secondary" size="sm" className="gap-2 relative">
					<SlidersHorizontal className="size-4" />
					<span className="hidden sm:inline">Advanced Filters</span>
					{activeFilterCount > 0 && (
						<Badge
							variant="default"
							className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
						>
							{activeFilterCount}
						</Badge>
					)}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<SlidersHorizontal className="size-5" />
						Advanced Filters
					</DialogTitle>
					<DialogDescription>
						Filter tasks by multiple criteria and save your filter presets.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Search */}
					<div className="space-y-2">
						<Label className="flex items-center gap-2">
							<Search className="size-4" />
							Search
						</Label>
						<Input
							placeholder="Search tasks by title or description..."
							value={localFilters.search || ""}
							onChange={(e) =>
								setLocalFilters({
									...localFilters,
									search: e.target.value || undefined,
								})
							}
						/>
					</div>

					{/* Priority */}
					<div className="space-y-2">
						<Label className="flex items-center gap-2">
							<Layers className="size-4" />
							Priority
						</Label>
						<Select
							value={localFilters.priority || "all"}
							onValueChange={(value) =>
								setLocalFilters({
									...localFilters,
									priority: value === "all" ? undefined : value,
								})
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select priority" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All priorities</SelectItem>
								<SelectItem value="urgent">Urgent</SelectItem>
								<SelectItem value="high">High</SelectItem>
								<SelectItem value="medium">Medium</SelectItem>
								<SelectItem value="low">Low</SelectItem>
								<SelectItem value="no-priority">No priority</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Labels */}
					<div className="space-y-2">
						<Label className="flex items-center gap-2">
							<Tag className="size-4" />
							Labels
						</Label>
						<MultiSelect
							options={labels.map((label) => ({
								label: label.name,
								value: label.id,
								color: label.color,
							}))}
							selected={localFilters.labelIds || []}
							onChange={(values) =>
								setLocalFilters({
									...localFilters,
									labelIds: values.length > 0 ? values : undefined,
								})
							}
							placeholder="Select labels..."
						/>
					</div>

					{/* Date Range */}
					<div className="space-y-2">
						<Label className="flex items-center gap-2">
							<CalendarIcon className="size-4" />
							Date Range
						</Label>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label className="text-xs text-muted-foreground">From</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"w-full justify-start text-left font-normal",
												!dateFrom && "text-muted-foreground"
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{dateFrom ? (
												format(dateFrom, "MMM dd, yyyy")
											) : (
												<span>Pick a date</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={dateFrom}
											onSelect={setDateFrom}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>

							<div className="space-y-2">
								<Label className="text-xs text-muted-foreground">To</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"w-full justify-start text-left font-normal",
												!dateTo && "text-muted-foreground"
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{dateTo ? (
												format(dateTo, "MMM dd, yyyy")
											) : (
												<span>Pick a date</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={dateTo}
											onSelect={setDateTo}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>
						</div>
					</div>

					<Separator />

					{/* Filter Presets */}
					<div className="space-y-3">
						<Label className="flex items-center gap-2">
							<Bookmark className="size-4" />
							Filter Presets
						</Label>

						{/* Saved Presets */}
						{presets.length > 0 && (
							<div className="space-y-2">
								{presets.map((preset) => (
									<div
										key={preset.id}
										className="flex items-center justify-between p-2 border rounded-lg hover:bg-accent/50 transition-colors"
									>
										<Button
											variant="ghost"
											size="sm"
											className="flex-1 justify-start"
											onClick={() => handleLoadPreset(preset)}
										>
											{preset.name}
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDeletePreset(preset.id)}
										>
											<Trash2 className="size-4 text-destructive" />
										</Button>
									</div>
								))}
							</div>
						)}

						{/* Save New Preset */}
						<div className="flex gap-2">
							<Input
								placeholder="Preset name..."
								value={newPresetName}
								onChange={(e) => setNewPresetName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleSavePreset()
									}
								}}
							/>
							<Button
								variant="outline"
								size="sm"
								onClick={handleSavePreset}
								disabled={!newPresetName.trim()}
							>
								<Plus className="size-4 mr-1" />
								Save
							</Button>
						</div>
					</div>
				</div>

				<DialogFooter className="flex gap-2">
					<Button variant="outline" onClick={handleClearFilters}>
						<X className="size-4 mr-2" />
						Clear All
					</Button>
					<Button onClick={handleApplyFilters}>Apply Filters</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
