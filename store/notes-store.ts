import { create } from "zustand"
import type { NoteWithRelations, NoteFolder } from "@/db/schema"
import {
	getNotes,
	getNote,
	createNote,
	updateNote,
	deleteNote,
	searchNotes,
} from "@/app/actions/notes"
import {
	getFolders,
	createFolder,
	updateFolder,
	deleteFolder,
} from "@/app/actions/note-folders"

interface NotesState {
	notes: NoteWithRelations[]
	currentNote: NoteWithRelations | null
	folders: NoteFolder[]
	selectedFolderId: string | null
	searchQuery: string
	loading: boolean
	error: string | null

	fetchNotes: (folderId?: string) => Promise<void>
	fetchNote: (id: string) => Promise<void>
	createNoteAction: (data: {
		title: string
		content?: string
		folderId?: string
	}) => Promise<void>
	updateNoteAction: (id: string, updates: any) => Promise<void>
	deleteNoteAction: (id: string) => Promise<void>
	searchNotesAction: (query: string) => Promise<void>

	fetchFolders: () => Promise<void>
	createFolderAction: (data: {
		name: string
		parentId?: string
		color?: string
	}) => Promise<void>
	updateFolderAction: (id: string, updates: any) => Promise<void>
	deleteFolderAction: (id: string) => Promise<void>

	setSelectedFolder: (folderId: string | null) => void
	setCurrentNote: (note: NoteWithRelations | null) => void
	setSearchQuery: (query: string) => void
}

export const useNotesStore = create<NotesState>((set, get) => ({
	notes: [],
	currentNote: null,
	folders: [],
	selectedFolderId: null,
	searchQuery: "",
	loading: false,
	error: null,

	fetchNotes: async (folderId) => {
		set({ loading: true, error: null })
		try {
			const notes = await getNotes(folderId)
			set({ notes, loading: false })
		} catch (error) {
			set({ error: (error as Error).message, loading: false })
		}
	},

	fetchNote: async (id) => {
		set({ loading: true, error: null })
		try {
			const note = await getNote(id)
			set({ currentNote: note, loading: false })
		} catch (error) {
			set({ error: (error as Error).message, loading: false })
		}
	},

	createNoteAction: async (data) => {
		set({ loading: true, error: null })
		try {
			await createNote(data)
			await get().fetchNotes(get().selectedFolderId || undefined)
			set({ loading: false })
		} catch (error) {
			set({ error: (error as Error).message, loading: false })
			throw error
		}
	},

	updateNoteAction: async (id, updates) => {
		try {
			await updateNote(id, updates)
			if (get().currentNote?.id === id) {
				await get().fetchNote(id)
			}
			await get().fetchNotes(get().selectedFolderId || undefined)
		} catch (error) {
			set({ error: (error as Error).message })
			throw error
		}
	},

	deleteNoteAction: async (id) => {
		try {
			await deleteNote(id)
			await get().fetchNotes(get().selectedFolderId || undefined)
			if (get().currentNote?.id === id) {
				set({ currentNote: null })
			}
		} catch (error) {
			set({ error: (error as Error).message })
			throw error
		}
	},

	searchNotesAction: async (query) => {
		set({ loading: true, error: null, searchQuery: query })
		try {
			const notes = await searchNotes(query)
			set({ notes, loading: false })
		} catch (error) {
			set({ error: (error as Error).message, loading: false })
		}
	},

	fetchFolders: async () => {
		try {
			const folders = await getFolders()
			set({ folders })
		} catch (error) {
			set({ error: (error as Error).message })
		}
	},

	createFolderAction: async (data) => {
		try {
			await createFolder(data)
			await get().fetchFolders()
		} catch (error) {
			set({ error: (error as Error).message })
			throw error
		}
	},

	updateFolderAction: async (id, updates) => {
		try {
			await updateFolder(id, updates)
			await get().fetchFolders()
		} catch (error) {
			set({ error: (error as Error).message })
			throw error
		}
	},

	deleteFolderAction: async (id) => {
		try {
			await deleteFolder(id)
			await get().fetchFolders()
			if (get().selectedFolderId === id) {
				set({ selectedFolderId: null })
				await get().fetchNotes()
			}
		} catch (error) {
			set({ error: (error as Error).message })
			throw error
		}
	},

	setSelectedFolder: (folderId) => {
		set({ selectedFolderId: folderId })
		get().fetchNotes(folderId || undefined)
	},

	setCurrentNote: (note) => set({ currentNote: note }),
	setSearchQuery: (query) => set({ searchQuery: query }),
}))
