"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
	getJobApplications,
	createJobApplication,
	updateJobApplication,
	deleteJobApplication,
	type JobApplication,
} from "@/app/actions/job-applications"
import { toast } from "sonner"

export function useJobApplications() {
	return useQuery({
		queryKey: ["jobApplications"],
		queryFn: getJobApplications,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	})
}

export function useCreateJobApplication() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: createJobApplication,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobApplications"] })
			toast.success("Application created successfully")
		},
		onError: () => {
			toast.error("Failed to create application")
		},
	})
}

export function useUpdateJobApplication() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string
			data: Parameters<typeof updateJobApplication>[1]
		}) => updateJobApplication(id, data),
		onMutate: async ({ id, data }) => {
			await queryClient.cancelQueries({ queryKey: ["jobApplications"] })
			const previousApplications =
				queryClient.getQueryData<JobApplication[]>(["jobApplications"])

			queryClient.setQueryData<JobApplication[]>(
				["jobApplications"],
				(old) => {
					if (!old) return []
					return old.map((app) =>
						app.id === id ? { ...app, ...data, updatedAt: new Date() } : app
					)
				}
			)

			return { previousApplications }
		},
		onError: (err, variables, context) => {
			if (context?.previousApplications) {
				queryClient.setQueryData(
					["jobApplications"],
					context.previousApplications
				)
			}
			toast.error("Failed to update application")
		},
		onSuccess: () => {
			toast.success("Application updated successfully")
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["jobApplications"] })
		},
	})
}

export function useDeleteJobApplication() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: deleteJobApplication,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobApplications"] })
			toast.success("Application deleted successfully")
		},
		onError: () => {
			toast.error("Failed to delete application")
		},
	})
}
