"use client"

import { useEffect, useMemo } from "react"
import { useTasksStore } from "@/store/tasks-store"
import {
	calculateTaskMetrics,
	calculatePriorityDistribution,
	calculateStatusDistribution,
	calculateCompletionTrend,
	calculateWeeklyProgress,
	getTopAssignees,
} from "@/lib/analytics"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
} from "@/components/ui/chart"
import {
	AreaChart,
	Area,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
} from "recharts"
import {
	TrendingUp,
	TrendingDown,
	CheckCircle2,
	AlertCircle,
	ListTodo,
	Activity,
	Home,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { DashboardHeader } from "@/components/task/header/dashboard-header"

export default function DashboardPage() {
	const { tasks, loading, fetchTasks } = useTasksStore()

	useEffect(() => {
		fetchTasks()
	}, [fetchTasks])

	// Calculate all metrics
	const metrics = useMemo(() => calculateTaskMetrics(tasks), [tasks])
	const priorityDistribution = useMemo(
		() => calculatePriorityDistribution(tasks),
		[tasks]
	)
	const statusDistribution = useMemo(
		() => calculateStatusDistribution(tasks),
		[tasks]
	)
	const completionTrend = useMemo(
		() => calculateCompletionTrend(tasks, 7),
		[tasks]
	)
	const weeklyProgress = useMemo(() => calculateWeeklyProgress(tasks), [tasks])
	const topAssignees = useMemo(() => getTopAssignees(tasks, 5), [tasks])

	// Chart configurations
	const priorityChartData = [
		{ name: "Urgent", value: priorityDistribution.urgent, fill: "#ef4444" },
		{ name: "High", value: priorityDistribution.high, fill: "#f97316" },
		{ name: "Medium", value: priorityDistribution.medium, fill: "#eab308" },
		{ name: "Low", value: priorityDistribution.low, fill: "#3b82f6" },
		{
			name: "No Priority",
			value: priorityDistribution["no-priority"],
			fill: "#6b7280",
		},
	].filter((item) => item.value > 0)

	const statusChartData = statusDistribution.map((status) => ({
		name: status.statusName,
		count: status.count,
		fill: status.color,
	}))

	if (loading && tasks.length === 0) {
		return (
			<div className="flex h-full items-center justify-center">
				<p className="text-muted-foreground">Loading dashboard...</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col h-full">
			{/* Dashboard Header */}
			<DashboardHeader />

			{/* Breadcrumb */}
			<div className="border-b px-6 py-3">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link href="/tasks" className="flex items-center gap-1.5">
									<Home className="size-3.5" />
									Home
								</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>Dashboard</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			{/* Dashboard Content */}
			<div className="flex-1 overflow-auto">
				<div className="flex flex-col gap-6 p-6">
					{/* Header */}
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
						<p className="text-muted-foreground">
							Overview of your tasks and productivity metrics
						</p>
					</div>

					{/* Metrics Cards */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Tasks
								</CardTitle>
								<ListTodo className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{metrics.totalTasks}</div>
								<p className="text-xs text-muted-foreground">
									{metrics.inProgressTasks} in progress
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Completed</CardTitle>
								<CheckCircle2 className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{metrics.completedTasks}
								</div>
								<p className="text-xs text-muted-foreground">
									{metrics.completionRate}% completion rate
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">This Week</CardTitle>
								<Activity className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{weeklyProgress.thisWeek}
								</div>
								<p
									className={cn(
										"text-xs flex items-center gap-1",
										weeklyProgress.percentageChange >= 0
											? "text-green-600"
											: "text-red-600"
									)}
								>
									{weeklyProgress.percentageChange >= 0 ? (
										<TrendingUp className="h-3 w-3" />
									) : (
										<TrendingDown className="h-3 w-3" />
									)}
									{Math.abs(weeklyProgress.percentageChange)}% from last week
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Overdue</CardTitle>
								<AlertCircle className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{metrics.overdueTasks}</div>
								<p className="text-xs text-muted-foreground">
									Avg completion: {metrics.averageCompletionTime} days
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Charts */}
					<Tabs defaultValue="trends" className="space-y-4">
						<TabsList>
							<TabsTrigger value="trends">Trends</TabsTrigger>
							<TabsTrigger value="distribution">Distribution</TabsTrigger>
							<TabsTrigger value="team">Team</TabsTrigger>
						</TabsList>

						<TabsContent value="trends" className="space-y-4">
							<div className="grid gap-4 md:grid-cols-1">
								<Card>
									<CardHeader>
										<CardTitle>Task Completion Trend</CardTitle>
										<CardDescription>
											Tasks created vs completed over the last 7 days
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ChartContainer
											config={{
												completed: {
													label: "Completed",
													color: "hsl(var(--chart-1))",
												},
												created: {
													label: "Created",
													color: "hsl(var(--chart-2))",
												},
											}}
											className="h-[300px]"
										>
											<AreaChart data={completionTrend}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis
													dataKey="date"
													stroke="#888888"
													fontSize={12}
													tickLine={false}
													axisLine={false}
												/>
												<YAxis
													stroke="#888888"
													fontSize={12}
													tickLine={false}
													axisLine={false}
												/>
												<ChartTooltip content={<ChartTooltipContent />} />
												<ChartLegend content={<ChartLegendContent />} />
												<Area
													type="monotone"
													dataKey="completed"
													stroke="hsl(var(--chart-1))"
													fill="hsl(var(--chart-1))"
													fillOpacity={0.6}
												/>
												<Area
													type="monotone"
													dataKey="created"
													stroke="hsl(var(--chart-2))"
													fill="hsl(var(--chart-2))"
													fillOpacity={0.6}
												/>
											</AreaChart>
										</ChartContainer>
									</CardContent>
								</Card>
							</div>
						</TabsContent>

						<TabsContent value="distribution" className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<Card>
									<CardHeader>
										<CardTitle>Priority Distribution</CardTitle>
										<CardDescription>
											Tasks grouped by priority level
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ChartContainer
											config={{
												value: {
													label: "Tasks",
												},
											}}
											className="h-[300px]"
										>
											<PieChart>
												<Pie
													data={priorityChartData}
													cx="50%"
													cy="50%"
													labelLine={false}
													label={({ name, percent }) =>
														`${name}: ${(percent * 100).toFixed(0)}%`
													}
													outerRadius={80}
													fill="#8884d8"
													dataKey="value"
												>
													{priorityChartData.map((entry, index) => (
														<Cell key={`cell-${index}`} fill={entry.fill} />
													))}
												</Pie>
												<ChartTooltip content={<ChartTooltipContent />} />
											</PieChart>
										</ChartContainer>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Status Distribution</CardTitle>
										<CardDescription>
											Tasks grouped by current status
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ChartContainer
											config={{
												count: {
													label: "Tasks",
												},
											}}
											className="h-[300px]"
										>
											<BarChart data={statusChartData}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis
													dataKey="name"
													stroke="#888888"
													fontSize={12}
													tickLine={false}
													axisLine={false}
													angle={-45}
													textAnchor="end"
													height={80}
												/>
												<YAxis
													stroke="#888888"
													fontSize={12}
													tickLine={false}
													axisLine={false}
												/>
												<ChartTooltip content={<ChartTooltipContent />} />
												<Bar dataKey="count" radius={[4, 4, 0, 0]}>
													{statusChartData.map((entry, index) => (
														<Cell key={`cell-${index}`} fill={entry.fill} />
													))}
												</Bar>
											</BarChart>
										</ChartContainer>
									</CardContent>
								</Card>
							</div>
						</TabsContent>

						<TabsContent value="team" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle>Top Contributors</CardTitle>
									<CardDescription>
										Team members with the most assigned tasks
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{topAssignees.length === 0 ? (
											<p className="text-sm text-muted-foreground text-center py-8">
												No assignees data available
											</p>
										) : (
											topAssignees.map((assignee, index) => (
												<div
													key={assignee.id}
													className="flex items-center justify-between"
												>
													<div className="flex items-center gap-3">
														<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
															{index + 1}
														</div>
														<div>
															<p className="text-sm font-medium leading-none">
																{assignee.name}
															</p>
															<p className="text-sm text-muted-foreground">
																{assignee.completedCount} / {assignee.taskCount}{" "}
																completed
															</p>
														</div>
													</div>
													<div className="text-sm font-medium">
														{assignee.taskCount} tasks
													</div>
												</div>
											))
										)}
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	)
}
