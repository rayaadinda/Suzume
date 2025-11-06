"use client"

import { useState, useMemo, useEffect } from "react"
import { NoteEditor } from "@/components/notes/note-editor"
import { NoteList } from "@/components/notes/note-list"
import { FolderTree } from "@/components/notes/folder-tree"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText } from "lucide-react"
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
	useNotes,
	useSearchNotes,
	useCreateNote,
	useUpdateNote,
} from "@/hooks/use-notes"
import { useNotesStore } from "@/store/notes-store"
import type { NoteWithRelations } from "@/db/schema"

export default function NotesPage() {
	const { folders, fetchFolders } = useNotesStore()
	const [selectedFolderId] = useState<string | null>(null)
	const [searchInput, setSearchInput] = useState("")
	const [isSearching, setIsSearching] = useState(false)
	const [currentNote, setCurrentNote] = useState<NoteWithRelations | null>(null)
	const [noteTitle, setNoteTitle] = useState("")

	const { data: notes = [], isLoading: notesLoading } = useNotes(
		selectedFolderId ?? undefined
	)
	const { data: searchResults = [], isLoading: searchLoading } = useSearchNotes(
		isSearching ? searchInput : ""
	)

	const createNoteMutation = useCreateNote()
	const updateNoteMutation = useUpdateNote()

	const displayNotes = useMemo(
		() => (isSearching ? searchResults : notes),
		[isSearching, searchResults, notes]
	)

	const isLoading = isSearching ? searchLoading : notesLoading

	useEffect(() => {
		fetchFolders()
	}, [fetchFolders])

	const handleSelectNote = (note: NoteWithRelations) => {
		setCurrentNote(note)
		setNoteTitle(note.title)
	}

	const handleCreateNote = async () => {
		try {
			await createNoteMutation.mutateAsync({
				title: "Untitled Note",
				folderId: selectedFolderId || undefined,
			})
		} catch (error) {
			console.error("Failed to create note:", error)
		}
	}

	const handleUpdateNote = async (content: string, plainText: string) => {
		if (!currentNote) return

		try {
			updateNoteMutation.mutate({
				id: currentNote.id,
				updates: {
					content,
					plainText,
				},
			})
		} catch (error) {
			console.error("Failed to update note:", error)
		}
	}

	const handleUpdateTitle = async (title: string) => {
		if (!currentNote) return

		try {
			updateNoteMutation.mutate({
				id: currentNote.id,
				updates: { title },
			})
		} catch (error) {
			console.error("Failed to update title:", error)
		}
	}

	const handleSearch = () => {
		if (searchInput.trim()) {
			setIsSearching(true)
		} else {
			setIsSearching(false)
		}
	}

	return (
		<div className="flex flex-col h-screen">
			<div className="border-b p-4 flex items-center justify-between">
				<h1 className="text-2xl font-bold">Notes</h1>
				<div className="flex gap-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search notes..."
							className="pl-9 w-64"
							value={searchInput}
							onChange={(e) => {
								setSearchInput(e.target.value)
								if (!e.target.value.trim()) {
									setIsSearching(false)
								}
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleSearch()
								}
							}}
						/>
					</div>
					<Button
						onClick={handleCreateNote}
						disabled={createNoteMutation.isPending}
					>
						<Plus className="h-4 w-4 mr-2" />
						New Note
					</Button>
				</div>
			</div>

			<ResizablePanelGroup direction="horizontal" className="flex-1">
				<ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
					<FolderTree folders={folders} />
				</ResizablePanel>

				<ResizableHandle />

				<ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
					<NoteList
						notes={displayNotes}
						currentNote={currentNote}
						onSelectNote={handleSelectNote}
						loading={isLoading}
					/>
				</ResizablePanel>

				<ResizableHandle />

				<ResizablePanel defaultSize={55}>
					{currentNote ? (
						<div className="flex flex-col h-full">
							<div className="border-b p-4">
								<Input
									value={noteTitle}
									onChange={(e) => setNoteTitle(e.target.value)}
									onBlur={() => handleUpdateTitle(noteTitle)}
									className="text-3xl font-bold border-none focus-visible:ring-0 px-0"
									placeholder="Untitled"
								/>
							</div>
							<div className="flex-1 overflow-auto">
								<NoteEditor
									content={currentNote.content}
									onUpdate={handleUpdateNote}
								/>
							</div>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center h-full text-muted-foreground">
							<FileText className="h-16 w-16 mb-4" />
							<p className="text-lg">Select a note to start editing</p>
							<p className="text-sm mt-2">or create a new one</p>
						</div>
					)}
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	)
}
