"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
	getLabels,
	createLabel,
	updateLabel,
	deleteLabel,
	type LabelData,
} from "@/app/actions/labels"
import { toast } from "sonner"

export function useLabels() {
	return useQuery({
		queryKey: ["labels"],
		queryFn: getLabels,
		staleTime: 10 * 60 * 1000,
		refetchOnWindowFocus: false,
	})
}

export function useCreateLabel() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: createLabel,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["labels"] })
			queryClient.invalidateQueries({ queryKey: ["tasks"] })
			toast.success("Label created successfully")
		},
		onError: () => {
			toast.error("Failed to create label")
		},
	})
}

export function useUpdateLabel() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: { name?: string; color?: string } }) =>
			updateLabel(id, data),
		onMutate: async ({ id, data }) => {
			await queryClient.cancelQueries({ queryKey: ["labels"] })
			const previousLabels = queryClient.getQueryData<LabelData[]>(["labels"])

			queryClient.setQueryData<LabelData[]>(["labels"], (old) => {
				if (!old) return []
				return old.map((label) =>
					label.id === id ? { ...label, ...data } : label
				)
			})

			return { previousLabels }
		},
		onError: (err, variables, context) => {
			if (context?.previousLabels) {
				queryClient.setQueryData(["labels"], context.previousLabels)
			}
			toast.error("Failed to update label")
		},
		onSuccess: () => {
			toast.success("Label updated successfully")
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["labels"] })
			queryClient.invalidateQueries({ queryKey: ["tasks"] })
		},
	})
}

export function useDeleteLabel() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: deleteLabel,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["labels"] })
			queryClient.invalidateQueries({ queryKey: ["tasks"] })
			toast.success("Label deleted successfully")
		},
		onError: () => {
			toast.error("Failed to delete label")
		},
	})
}
