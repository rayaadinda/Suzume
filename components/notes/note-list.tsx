"use client"

import { type NoteWithRelations } from "@/db/schema"
import { cn } from "@/lib/utils"
import { FileText, Pin } from "lucide-react"
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NoteListProps {
	notes: NoteWithRelations[]
	currentNote: NoteWithRelations | null
	onSelectNote: (note: NoteWithRelations) => void
	loading: boolean
}

export function NoteList({
	notes,
	currentNote,
	onSelectNote,
	loading,
}: NoteListProps) {
	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-sm text-muted-foreground">Loading notes...</div>
			</div>
		)
	}

	if (notes.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-8 text-center">
				<FileText className="h-12 w-12 text-muted-foreground mb-4" />
				<p className="text-sm text-muted-foreground">No notes found</p>
			</div>
		)
	}

	return (
		<ScrollArea className="h-full">
			<div className="p-4 space-y-2">
				{notes.map((note) => (
					<button
						key={note.id}
						onClick={() => onSelectNote(note)}
						className={cn(
							"w-full text-left p-3 rounded-lg border transition-colors hover:bg-muted/50",
							currentNote?.id === note.id
								? "bg-muted border-primary"
								: "border-transparent"
						)}
					>
						<div className="flex items-start justify-between gap-2">
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									{note.iconEmoji && (
										<span className="text-lg">{note.iconEmoji}</span>
									)}
									<h3 className="font-medium truncate text-sm">
										{note.title}
									</h3>
									{note.isPinned && (
										<Pin className="h-3 w-3 text-primary" />
									)}
								</div>
								{note.plainText && (
									<p className="text-xs text-muted-foreground mt-1 line-clamp-2">
										{note.plainText}
									</p>
								)}
								<p className="text-xs text-muted-foreground mt-2">
									{format(new Date(note.updatedAt), "MMM d, yyyy")}
								</p>
							</div>
						</div>
					</button>
				))}
			</div>
		</ScrollArea>
	)
}
