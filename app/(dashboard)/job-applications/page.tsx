"use client"

import * as React from "react"
import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Plus, Briefcase } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { JobApplication } from "@/db/schema"
import {
	useJobApplications,
	useCreateJobApplication,
	useUpdateJobApplication,
	useDeleteJobApplication,
} from "@/hooks/use-job-applications"
import { JobApplicationsSkeleton } from "@/components/job-applications/job-applications-skeleton"

type JobApplicationFormData = {
	company: string
	position: string
	status: string
	salary?: string
	location?: string
	jobUrl?: string
	notes?: string
	contactEmail?: string
	contactPhone?: string
}

const statusConfig: Record<
	string,
	{ label: string; color: string; bgColor: string }
> = {
	applied: { label: "Applied", color: "text-blue-600", bgColor: "bg-blue-50" },
	interview: {
		label: "Interview",
		color: "text-purple-600",
		bgColor: "bg-purple-50",
	},
	offer: { label: "Offer", color: "text-green-600", bgColor: "bg-green-50" },
	rejected: { label: "Rejected", color: "text-red-600", bgColor: "bg-red-50" },
	accepted: {
		label: "Accepted",
		color: "text-emerald-600",
		bgColor: "bg-emerald-50",
	},
	withdrawn: {
		label: "Withdrawn",
		color: "text-gray-600",
		bgColor: "bg-gray-50",
	},
}

export default function JobApplicationsPage() {
	const { data: applications = [], isLoading: loading } = useJobApplications()
	const createApplication = useCreateJobApplication()
	const updateApplication = useUpdateJobApplication()
	const deleteApplication = useDeleteJobApplication()

	const [sorting, setSorting] = React.useState<SortingState>([])
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	)
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({})
	const [isDialogOpen, setIsDialogOpen] = React.useState(false)
	const [editingApplication, setEditingApplication] =
		React.useState<JobApplication | null>(null)
	const [formData, setFormData] = React.useState<JobApplicationFormData>({
		company: "",
		position: "",
		status: "applied",
		salary: "",
		location: "",
		jobUrl: "",
		notes: "",
		contactEmail: "",
		contactPhone: "",
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (editingApplication) {
			updateApplication.mutate(
				{ id: editingApplication.id, data: formData },
				{
					onSuccess: () => {
						setIsDialogOpen(false)
						resetForm()
					},
				}
			)
		} else {
			createApplication.mutate(formData, {
				onSuccess: () => {
					setIsDialogOpen(false)
					resetForm()
				},
			})
		}
	}

	const handleEdit = (application: JobApplication) => {
		setEditingApplication(application)
		setFormData({
			company: application.company,
			position: application.position,
			status: application.status,
			salary: application.salary || "",
			location: application.location || "",
			jobUrl: application.jobUrl || "",
			notes: application.notes || "",
			contactEmail: application.contactEmail || "",
			contactPhone: application.contactPhone || "",
		})
		setIsDialogOpen(true)
	}

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this application?")) return

		deleteApplication.mutate(id)
	}

	const resetForm = () => {
		setEditingApplication(null)
		setFormData({
			company: "",
			position: "",
			status: "applied",
			salary: "",
			location: "",
			jobUrl: "",
			notes: "",
			contactEmail: "",
			contactPhone: "",
		})
	}

	const columns: ColumnDef<JobApplication>[] = React.useMemo(
		() => [
		{
			accessorKey: "company",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="h-8 px-2"
					>
						Company
						<ArrowUpDown className="ml-2 h-3 w-3" />
					</Button>
				)
			},
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("company")}</div>
			),
		},
		{
			accessorKey: "position",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="h-8 px-2"
					>
						Position
						<ArrowUpDown className="ml-2 h-3 w-3" />
					</Button>
				)
			},
			cell: ({ row }) => <div>{row.getValue("position")}</div>,
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const application = row.original
				const status = row.getValue("status") as string
				const config = statusConfig[status] || statusConfig.applied

				const handleStatusChange = (newStatus: string) => {
					updateApplication.mutate({
						id: application.id,
						data: { status: newStatus },
					})
				}

				return (
					<Select value={status} onValueChange={handleStatusChange}>
						<SelectTrigger className="h-7 w-[130px] border-0 bg-transparent p-0">
							<SelectValue>
								<Badge
									variant="outline"
									className={`${config.color} ${config.bgColor} border-0`}
								>
									{config.label}
								</Badge>
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{Object.entries(statusConfig).map(([key, statusOption]) => (
								<SelectItem key={key} value={key}>
									<div className="flex items-center gap-2">
										<div
											className={`h-2 w-2 rounded-full ${statusOption.bgColor.replace("bg-", "bg-")}`}
										/>
										{statusOption.label}
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)
			},
		},
		{
			accessorKey: "location",
			header: "Location",
			cell: ({ row }) => {
				const location = row.getValue("location") as string
				return <div className="text-sm">{location || "-"}</div>
			},
		},
		{
			accessorKey: "salary",
			header: "Salary",
			cell: ({ row }) => {
				const salary = row.getValue("salary") as string
				return <div className="text-sm">{salary || "-"}</div>
			},
		},
		{
			accessorKey: "appliedDate",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="h-8 px-2"
					>
						Applied Date
						<ArrowUpDown className="ml-2 h-3 w-3" />
					</Button>
				)
			},
			cell: ({ row }) => {
				const date = new Date(row.getValue("appliedDate"))
				return <div className="text-sm">{date.toLocaleDateString()}</div>
			},
		},
		{
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => {
				const application = row.original

				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							{application.jobUrl && (
								<>
									<DropdownMenuItem
										onClick={() => window.open(application.jobUrl!, "_blank")}
									>
										View Job Posting
									</DropdownMenuItem>
									<DropdownMenuSeparator />
								</>
							)}
							<DropdownMenuItem onClick={() => handleEdit(application)}>
								Edit Application
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => handleDelete(application.id)}
								className="text-red-600"
							>
								Delete Application
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)
			},
		},
	],
		[updateApplication, handleEdit, handleDelete]
	)

	const table = useReactTable({
		data: applications,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
		},
	})

	if (loading) {
		return <JobApplicationsSkeleton />
	}

	return (
		<div className="flex h-full w-full flex-col">
			<div className="border-b p-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight">
							Job Applications
						</h1>
						<p className="text-muted-foreground text-sm">
							Track your job applications and interview progress
						</p>
					</div>
					<Dialog
						open={isDialogOpen}
						onOpenChange={(open) => {
							setIsDialogOpen(open)
							if (!open) resetForm()
						}}
					>
						<DialogTrigger asChild>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								New Application
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<form onSubmit={handleSubmit}>
								<DialogHeader>
									<DialogTitle>
										{editingApplication
											? "Edit Application"
											: "New Job Application"}
									</DialogTitle>
									<DialogDescription>
										{editingApplication
											? "Update the application details"
											: "Add a new job application to track"}
									</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-4">
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="company">Company *</Label>
											<Input
												id="company"
												value={formData.company}
												onChange={(e) =>
													setFormData({ ...formData, company: e.target.value })
												}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="position">Position *</Label>
											<Input
												id="position"
												value={formData.position}
												onChange={(e) =>
													setFormData({ ...formData, position: e.target.value })
												}
												required
											/>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="status">Status *</Label>
											<Select
												value={formData.status}
												onValueChange={(value) =>
													setFormData({ ...formData, status: value })
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{Object.entries(statusConfig).map(([key, config]) => (
														<SelectItem key={key} value={key}>
															{config.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label htmlFor="salary">Salary</Label>
											<Input
												id="salary"
												value={formData.salary}
												onChange={(e) =>
													setFormData({ ...formData, salary: e.target.value })
												}
												placeholder="e.g., $100k - $120k"
											/>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="location">Location</Label>
											<Input
												id="location"
												value={formData.location}
												onChange={(e) =>
													setFormData({ ...formData, location: e.target.value })
												}
												placeholder="e.g., Remote, New York"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="jobUrl">Job URL</Label>
											<Input
												id="jobUrl"
												type="url"
												value={formData.jobUrl}
												onChange={(e) =>
													setFormData({ ...formData, jobUrl: e.target.value })
												}
												placeholder="https://"
											/>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="contactEmail">Contact Email</Label>
											<Input
												id="contactEmail"
												type="email"
												value={formData.contactEmail}
												onChange={(e) =>
													setFormData({
														...formData,
														contactEmail: e.target.value,
													})
												}
												placeholder="recruiter@company.com"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="contactPhone">Contact Phone</Label>
											<Input
												id="contactPhone"
												type="tel"
												value={formData.contactPhone}
												onChange={(e) =>
													setFormData({
														...formData,
														contactPhone: e.target.value,
													})
												}
												placeholder="+1 (555) 000-0000"
											/>
										</div>
									</div>
									<div className="space-y-2">
										<Label htmlFor="notes">Notes</Label>
										<Textarea
											id="notes"
											value={formData.notes}
											onChange={(e) =>
												setFormData({ ...formData, notes: e.target.value })
											}
											placeholder="Additional notes about the application..."
											rows={4}
										/>
									</div>
								</div>
								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setIsDialogOpen(false)
											resetForm()
										}}
									>
										Cancel
									</Button>
									<Button type="submit">
										{editingApplication ? "Update" : "Create"}
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className="flex-1 p-6">
				<div className="space-y-4">
					{applications.length === 0 ? (
						<div className="flex h-[450px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
							<Briefcase className="text-muted-foreground h-12 w-12" />
							<h3 className="mt-4 text-lg font-semibold">
								No applications yet
							</h3>
							<p className="text-muted-foreground mb-4 text-sm">
								Start tracking your job applications
							</p>
							<Button onClick={() => setIsDialogOpen(true)}>
								<Plus className="mr-2 h-4 w-4" />
								Add Your First Application
							</Button>
						</div>
					) : (
						<>
							<div className="flex items-center gap-2">
								<Input
									placeholder="Filter by company..."
									value={
										(table.getColumn("company")?.getFilterValue() as string) ??
										""
									}
									onChange={(event) =>
										table
											.getColumn("company")
											?.setFilterValue(event.target.value)
									}
									className="max-w-sm"
								/>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline">Columns</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										{table
											.getAllColumns()
											.filter((column) => column.getCanHide())
											.map((column) => {
												return (
													<DropdownMenuCheckboxItem
														key={column.id}
														className="capitalize"
														checked={column.getIsVisible()}
														onCheckedChange={(value) =>
															column.toggleVisibility(!!value)
														}
													>
														{column.id}
													</DropdownMenuCheckboxItem>
												)
											})}
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
							<div className="overflow-hidden rounded-md border">
								<Table>
									<TableHeader>
										{table.getHeaderGroups().map((headerGroup) => (
											<TableRow key={headerGroup.id}>
												{headerGroup.headers.map((header) => {
													return (
														<TableHead key={header.id}>
															{header.isPlaceholder
																? null
																: flexRender(
																		header.column.columnDef.header,
																		header.getContext()
																	)}
														</TableHead>
													)
												})}
											</TableRow>
										))}
									</TableHeader>
									<TableBody>
										{table.getRowModel().rows?.length ? (
											table.getRowModel().rows.map((row) => (
												<TableRow
													key={row.id}
													data-state={row.getIsSelected() && "selected"}
												>
													{row.getVisibleCells().map((cell) => (
														<TableCell key={cell.id}>
															{flexRender(
																cell.column.columnDef.cell,
																cell.getContext()
															)}
														</TableCell>
													))}
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell
													colSpan={columns.length}
													className="h-24 text-center"
												>
													No results.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
							<div className="flex items-center justify-end space-x-2">
								<div className="text-muted-foreground flex-1 text-sm">
									{table.getFilteredRowModel().rows.length} application(s)
								</div>
								<div className="space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => table.previousPage()}
										disabled={!table.getCanPreviousPage()}
									>
										Previous
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => table.nextPage()}
										disabled={!table.getCanNextPage()}
									>
										Next
									</Button>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
