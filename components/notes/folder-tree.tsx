"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, Folder, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotesStore } from "@/store/notes-store"
import type { NoteFolder } from "@/db/schema"
import { cn } from "@/lib/utils"

export function FolderTree({ folders }: { folders: NoteFolder[] }) {
	const { selectedFolderId, setSelectedFolder } = useNotesStore()
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
		new Set()
	)

	const toggleFolder = (id: string) => {
		const newExpanded = new Set(expandedFolders)
		if (newExpanded.has(id)) {
			newExpanded.delete(id)
		} else {
			newExpanded.add(id)
		}
		setExpandedFolders(newExpanded)
	}

	const renderFolder = (folder: NoteFolder, level: number = 0) => {
		const children = folders.filter((f) => f.parentId === folder.id)
		const hasChildren = children.length > 0
		const isExpanded = expandedFolders.has(folder.id)
		const isSelected = selectedFolderId === folder.id

		return (
			<div key={folder.id}>
				<div
					className={cn(
						"flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted transition-colors",
						isSelected && "bg-muted"
					)}
					style={{ paddingLeft: `${level * 16 + 8}px` }}
					onClick={() => setSelectedFolder(folder.id)}
				>
					{hasChildren && (
						<button
							onClick={(e) => {
								e.stopPropagation()
								toggleFolder(folder.id)
							}}
							className="p-0.5 hover:bg-muted-foreground/10 rounded"
						>
							{isExpanded ? (
								<ChevronDown className="h-3 w-3" />
							) : (
								<ChevronRight className="h-3 w-3" />
							)}
						</button>
					)}
					<span className="text-lg">{folder.iconEmoji || "📁"}</span>
					<span className="text-sm flex-1">{folder.name}</span>
				</div>

				{hasChildren && isExpanded && (
					<div>
						{children.map((child) => renderFolder(child, level + 1))}
					</div>
				)}
			</div>
		)
	}

	const rootFolders = folders.filter((f) => !f.parentId)

	return (
		<div className="p-4">
			<div className="flex items-center justify-between mb-4">
				<h2 className="font-semibold">Folders</h2>
			</div>

			<div
				className={cn(
					"px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted mb-2 transition-colors",
					!selectedFolderId && "bg-muted"
				)}
				onClick={() => setSelectedFolder(null)}
			>
				<div className="flex items-center gap-2">
					<Folder className="h-4 w-4" />
					<span className="text-sm">All Notes</span>
				</div>
			</div>

			{rootFolders.map((folder) => renderFolder(folder))}
		</div>
	)
}
