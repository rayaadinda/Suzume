"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
	getTasks,
	createTask,
	updateTask,
	deleteTask,
	updateTaskStatus,
	type TaskWithRelations,
} from "@/app/actions/tasks"
import { toast } from "sonner"

export function useTasks(filters?: Parameters<typeof getTasks>[0]) {
	return useQuery({
		queryKey: ["tasks", filters],
		queryFn: () => getTasks(filters),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	})
}

export function useCreateTask() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: createTask,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] })
			toast.success("Task created successfully")
		},
		onError: () => {
			toast.error("Failed to create task")
		},
	})
}

export function useUpdateTask() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({
			taskId,
			updates,
		}: {
			taskId: string
			updates: Parameters<typeof updateTask>[1]
		}) => updateTask(taskId, updates),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] })
			toast.success("Task updated successfully")
		},
		onError: () => {
			toast.error("Failed to update task")
		},
	})
}

export function useDeleteTask() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: deleteTask,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] })
			toast.success("Task deleted successfully")
		},
		onError: () => {
			toast.error("Failed to delete task")
		},
	})
}

export function useUpdateTaskStatus() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({
			taskId,
			statusId,
		}: {
			taskId: string
			statusId: string
		}) => updateTaskStatus(taskId, statusId),
		onMutate: async ({ taskId, statusId }) => {
			await queryClient.cancelQueries({ queryKey: ["tasks"] })
			const previousTasks =
				queryClient.getQueryData<TaskWithRelations[]>(["tasks"])

			queryClient.setQueryData<TaskWithRelations[]>(["tasks"], (old) => {
				if (!old) return []
				return old.map((task) =>
					task.id === taskId ? { ...task, statusId } : task
				)
			})

			return { previousTasks }
		},
		onError: (err, variables, context) => {
			if (context?.previousTasks) {
				queryClient.setQueryData(["tasks"], context.previousTasks)
			}
			toast.error("Failed to update task status")
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] })
		},
	})
}
