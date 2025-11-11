"use client"

import * as React from "react"
import { Plus, Trash2, Pencil, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
	getLabels,
	createLabel,
	updateLabel,
	deleteLabel,
	type LabelData,
} from "@/app/actions/labels"

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

interface LabelManagerProps {
	onLabelsChange?: () => void
}

export function LabelManager({ onLabelsChange }: LabelManagerProps) {
	const [open, setOpen] = React.useState(false)
	const [labels, setLabels] = React.useState<LabelData[]>([])
	const [loading, setLoading] = React.useState(false)
	const [editingId, setEditingId] = React.useState<string | null>(null)

	// Form state
	const [newLabelName, setNewLabelName] = React.useState("")
	const [newLabelColor, setNewLabelColor] = React.useState(PRESET_COLORS[0])
	const [editLabelName, setEditLabelName] = React.useState("")
	const [editLabelColor, setEditLabelColor] = React.useState("")

	// Load labels when dialog opens
	React.useEffect(() => {
		if (open) {
			loadLabels()
		}
	}, [open])

	const loadLabels = async () => {
		try {
			const data = await getLabels()
			setLabels(data)
		} catch (error) {
			toast.error("Failed to load labels")
			console.error(error)
		}
	}

	const handleCreateLabel = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!newLabelName.trim()) {
			toast.error("Label name is required")
			return
		}

		setLoading(true)
		try {
			await createLabel({
				name: newLabelName.trim(),
				color: newLabelColor,
			})
			toast.success("Label created successfully")
			setNewLabelName("")
			setNewLabelColor(PRESET_COLORS[0])
			await loadLabels()
			onLabelsChange?.()
		} catch (error) {
			toast.error("Failed to create label")
			console.error(error)
		} finally {
			setLoading(false)
		}
	}

	const handleUpdateLabel = async (id: string) => {
		if (!editLabelName.trim()) {
			toast.error("Label name is required")
			return
		}

		setLoading(true)
		try {
			await updateLabel(id, {
				name: editLabelName.trim(),
				color: editLabelColor,
			})
			toast.success("Label updated successfully")
			setEditingId(null)
			await loadLabels()
			onLabelsChange?.()
		} catch (error) {
			toast.error("Failed to update label")
			console.error(error)
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteLabel = async (id: string, name: string) => {
		if (!confirm(`Are you sure you want to delete "${name}"?`)) {
			return
		}

		setLoading(true)
		try {
			await deleteLabel(id)
			toast.success("Label deleted successfully")
			await loadLabels()
			onLabelsChange?.()
		} catch (error) {
			toast.error("Failed to delete label")
			console.error(error)
		} finally {
			setLoading(false)
		}
	}

	const startEditing = (label: LabelData) => {
		setEditingId(label.id)
		setEditLabelName(label.name)
		setEditLabelColor(label.color)
	}

	const cancelEditing = () => {
		setEditingId(null)
		setEditLabelName("")
		setEditLabelColor("")
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Plus className="size-4 mr-2" />
					Manage Labels
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Manage Labels</DialogTitle>
					<DialogDescription>
						Create, edit, and organize your custom labels for better task
						categorization.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Create New Label Form */}
					<form onSubmit={handleCreateLabel} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="label-name">New Label</Label>
							<Input
								id="label-name"
								placeholder="Enter label name..."
								value={newLabelName}
								onChange={(e) => setNewLabelName(e.target.value)}
								disabled={loading}
							/>
						</div>

						<div className="space-y-2">
							<Label>Color</Label>
							<div className="grid grid-cols-5 gap-2">
								{PRESET_COLORS.map((color) => (
									<button
										key={color}
										type="button"
										onClick={() => setNewLabelColor(color)}
										className={`h-10 rounded-md border-2 transition-all ${color} ${
											newLabelColor === color
												? "border-foreground scale-105"
												: "border-transparent hover:scale-105"
										}`}
										disabled={loading}
									/>
								))}
							</div>
						</div>

						<Button type="submit" disabled={loading} className="w-full">
							<Plus className="size-4 mr-2" />
							Create Label
						</Button>
					</form>

					{/* Existing Labels List */}
					<div className="space-y-2">
						<Label>Your Labels ({labels.length})</Label>
						<div className="space-y-2 border rounded-md p-4 max-h-[400px] overflow-y-auto">
							{labels.length === 0 ? (
								<p className="text-sm text-muted-foreground text-center py-8">
									No labels yet. Create your first label above.
								</p>
							) : (
								labels.map((label) => (
									<div
										key={label.id}
										className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
									>
										{editingId === label.id ? (
											<>
												{/* Edit Mode */}
												<Input
													value={editLabelName}
													onChange={(e) => setEditLabelName(e.target.value)}
													className="flex-1"
													disabled={loading}
												/>
												<div className="flex gap-1">
													{PRESET_COLORS.map((color) => (
														<button
															key={color}
															type="button"
															onClick={() => setEditLabelColor(color)}
															className={`size-6 rounded border-2 transition-all ${color} ${
																editLabelColor === color
																	? "border-foreground scale-110"
																	: "border-transparent"
															}`}
															disabled={loading}
														/>
													))}
												</div>
												<Button
													size="icon"
													variant="ghost"
													onClick={() => handleUpdateLabel(label.id)}
													disabled={loading}
												>
													<Check className="size-4" />
												</Button>
												<Button
													size="icon"
													variant="ghost"
													onClick={cancelEditing}
													disabled={loading}
												>
													<X className="size-4" />
												</Button>
											</>
										) : (
											<>
												{/* Display Mode */}
												<Badge className={`${label.color}`}>{label.name}</Badge>
												<div className="flex-1" />
												<Button
													size="icon"
													variant="ghost"
													onClick={() => startEditing(label)}
													disabled={loading}
												>
													<Pencil className="size-4" />
												</Button>
												<Button
													size="icon"
													variant="ghost"
													onClick={() =>
														handleDeleteLabel(label.id, label.name)
													}
													disabled={loading}
												>
													<Trash2 className="size-4" />
												</Button>
											</>
										)}
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
