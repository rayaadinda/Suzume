"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Plus, X, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { getNotes, linkNoteToTask, unlinkNoteFromTask } from "@/app/actions/notes"
import type { NoteWithRelations } from "@/db/schema"
import type { TaskWithRelations } from "@/app/actions/tasks"

interface LinkedNotesProps {
	task: TaskWithRelations
	onUpdate?: () => void
}

export function LinkedNotes({ task, onUpdate }: LinkedNotesProps) {
	const [availableNotes, setAvailableNotes] = useState<NoteWithRelations[]>([])
	const [loading, setLoading] = useState(false)
	const [popoverOpen, setPopoverOpen] = useState(false)

	const loadAvailableNotes = useCallback(async () => {
		setLoading(true)
		try {
			const notes = await getNotes()
			const linkedNoteIds = task.noteLinks.map((link) => link.noteId)
			const unlinkedNotes = notes.filter(
				(note) => !linkedNoteIds.includes(note.id)
			)
			setAvailableNotes(unlinkedNotes)
		} catch (error) {
			console.error("Error loading notes:", error)
		} finally {
			setLoading(false)
		}
	}, [task.noteLinks])

	useEffect(() => {
		if (popoverOpen) {
			loadAvailableNotes()
		}
	}, [popoverOpen, loadAvailableNotes])

	const handleLinkNote = async (noteId: string) => {
		try {
			await linkNoteToTask(noteId, task.id)
			setPopoverOpen(false)
			onUpdate?.()
		} catch (error) {
			console.error("Error linking note:", error)
		}
	}

	const handleUnlinkNote = async (noteId: string) => {
		try {
			await unlinkNoteFromTask(noteId, task.id)
			onUpdate?.()
		} catch (error) {
			console.error("Error unlinking note:", error)
		}
	}

	const stripHtml = (html: string) => {
		const div = document.createElement("div")
		div.innerHTML = html
		return div.textContent || div.innerText || ""
	}

	if (task.noteLinks.length === 0 && !popoverOpen) {
		return (
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<label className="text-sm font-medium">Linked Notes</label>
					<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm" className="h-8">
								<Plus className="size-4 mr-1" />
								Add Note
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-80 p-0" align="end">
							<div className="p-3 border-b">
								<h4 className="font-medium text-sm">Link a Note</h4>
							</div>
							<ScrollArea className="h-64">
								{loading ? (
									<div className="p-8 text-center text-sm text-muted-foreground">
										Loading notes...
									</div>
								) : availableNotes.length === 0 ? (
									<div className="p-8 text-center">
										<FileText className="size-8 mx-auto mb-2 text-muted-foreground" />
										<p className="text-sm text-muted-foreground">
											No notes available to link
										</p>
									</div>
								) : (
									<div className="p-2 space-y-1">
										{availableNotes.map((note) => (
											<button
												key={note.id}
												onClick={() => handleLinkNote(note.id)}
												className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors"
											>
												<div className="flex items-start gap-2">
													{note.iconEmoji && (
														<span className="text-lg">{note.iconEmoji}</span>
													)}
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium truncate">
															{note.title}
														</p>
														{note.plainText && (
															<p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
																{note.plainText}
															</p>
														)}
													</div>
												</div>
											</button>
										))}
									</div>
								)}
							</ScrollArea>
						</PopoverContent>
					</Popover>
				</div>
				<p className="text-sm text-muted-foreground">
					No notes linked to this task
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<label className="text-sm font-medium flex items-center gap-2">
					<FileText className="size-4" />
					Linked Notes
				</label>
				<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
					<PopoverTrigger asChild>
						<Button variant="outline" size="sm" className="h-8">
							<Plus className="size-4 mr-1" />
							Add Note
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-80 p-0" align="end">
						<div className="p-3 border-b">
							<h4 className="font-medium text-sm">Link a Note</h4>
						</div>
						<ScrollArea className="h-64">
							{loading ? (
								<div className="p-8 text-center text-sm text-muted-foreground">
									Loading notes...
								</div>
							) : availableNotes.length === 0 ? (
								<div className="p-8 text-center">
									<FileText className="size-8 mx-auto mb-2 text-muted-foreground" />
									<p className="text-sm text-muted-foreground">
										No notes available to link
									</p>
								</div>
							) : (
								<div className="p-2 space-y-1">
									{availableNotes.map((note) => (
										<button
											key={note.id}
											onClick={() => handleLinkNote(note.id)}
											className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors"
										>
											<div className="flex items-start gap-2">
												{note.iconEmoji && (
													<span className="text-lg">{note.iconEmoji}</span>
												)}
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium truncate">
														{note.title}
													</p>
													{note.plainText && (
														<p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
															{note.plainText}
														</p>
													)}
												</div>
											</div>
										</button>
									))}
								</div>
							)}
						</ScrollArea>
					</PopoverContent>
				</Popover>
			</div>

			<div className="space-y-2">
				{task.noteLinks.map((link) => (
					<Card key={link.noteId} className="overflow-hidden">
						<CardHeader className="p-3 pb-2">
							<div className="flex items-start justify-between gap-2">
								<div className="flex items-center gap-2 flex-1 min-w-0">
									{link.note.iconEmoji && (
										<span className="text-base">{link.note.iconEmoji}</span>
									)}
									<CardTitle className="text-sm font-medium truncate">
										{link.note.title}
									</CardTitle>
								</div>
								<div className="flex items-center gap-1">
									<Button
										variant="ghost"
										size="icon"
										className="size-6"
										onClick={() => window.open(`/notes?noteId=${link.noteId}`, "_blank")}
									>
										<ExternalLink className="size-3" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="size-6 hover:text-destructive"
										onClick={() => handleUnlinkNote(link.noteId)}
									>
										<X className="size-3" />
									</Button>
								</div>
							</div>
							<p className="text-xs text-muted-foreground">
								Updated {format(new Date(link.note.updatedAt), "MMM d, yyyy")}
							</p>
						</CardHeader>
						<Separator />
						<CardContent className="p-3 pt-2">
							{link.note.plainText ? (
								<p className="text-xs text-muted-foreground line-clamp-3">
									{link.note.plainText}
								</p>
							) : (
								<p className="text-xs text-muted-foreground line-clamp-3">
									{stripHtml(link.note.content)}
								</p>
							)}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
