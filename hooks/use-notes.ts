"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
	getNotes,
	getNote,
	createNote,
	updateNote,
	deleteNote,
	searchNotes,
} from "@/app/actions/notes"
import type { NoteWithRelations } from "@/db/schema"
import { toast } from "sonner"

export function useNotes(folderId?: string) {
	return useQuery({
		queryKey: ["notes", folderId],
		queryFn: () => getNotes(folderId),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
	})
}

export function useNote(noteId: string | null) {
	return useQuery({
		queryKey: ["note", noteId],
		queryFn: () => (noteId ? getNote(noteId) : Promise.resolve(null)),
		enabled: !!noteId,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
	})
}

export function useSearchNotes(query: string) {
	return useQuery({
		queryKey: ["notes", "search", query],
		queryFn: () => searchNotes(query),
		enabled: query.length > 0,
		staleTime: 1000 * 30,
	})
}

export function useCreateNote() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: createNote,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notes"] })
			toast.success("Note created successfully")
		},
		onError: (error: Error) => {
			toast.error(`Failed to create note: ${error.message}`)
		},
	})
}

export function useUpdateNote() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			id,
			updates,
		}: {
			id: string
			updates: Parameters<typeof updateNote>[1]
		}) => updateNote(id, updates),
		onMutate: async ({ id, updates }) => {
			await queryClient.cancelQueries({ queryKey: ["note", id] })
			await queryClient.cancelQueries({ queryKey: ["notes"] })

			const previousNote = queryClient.getQueryData<NoteWithRelations>([
				"note",
				id,
			])
			const previousNotes = queryClient.getQueryData<NoteWithRelations[]>([
				"notes",
			])

			if (previousNote) {
				queryClient.setQueryData(["note", id], {
					...previousNote,
					...updates,
					updatedAt: new Date(),
				})
			}

			if (previousNotes) {
				queryClient.setQueryData(
					["notes"],
					previousNotes.map((note) =>
						note.id === id
							? { ...note, ...updates, updatedAt: new Date() }
							: note
					)
				)
			}

			return { previousNote, previousNotes }
		},
		onError: (error: Error, variables, context) => {
			if (context?.previousNote) {
				queryClient.setQueryData(["note", variables.id], context.previousNote)
			}
			if (context?.previousNotes) {
				queryClient.setQueryData(["notes"], context.previousNotes)
			}
			toast.error(`Failed to update note: ${error.message}`)
		},
		onSettled: (data, error, variables) => {
			queryClient.invalidateQueries({ queryKey: ["note", variables.id] })
			queryClient.invalidateQueries({ queryKey: ["notes"] })
		},
	})
}

export function useDeleteNote() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: deleteNote,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notes"] })
			toast.success("Note deleted successfully")
		},
		onError: (error: Error) => {
			toast.error(`Failed to delete note: ${error.message}`)
		},
	})
}
