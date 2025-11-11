import { Skeleton } from "@/components/ui/skeleton"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"

export function JobApplicationsSkeleton() {
	return (
		<div className="flex flex-col h-full w-full">
			<div className="flex items-center justify-between px-6 py-4 border-b border-border">
				<div className="space-y-1">
					<Skeleton className="h-7 w-48" />
					<Skeleton className="h-4 w-64" />
				</div>
				<Skeleton className="h-10 w-40" />
			</div>

			<div className="flex items-center justify-between px-6 py-4 gap-4">
				<Skeleton className="h-10 flex-1 max-w-sm" />
				<div className="flex items-center gap-2">
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-10 w-10" />
				</div>
			</div>

			<div className="flex-1 px-6 overflow-auto">
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>
									<Skeleton className="h-4 w-20" />
								</TableHead>
								<TableHead>
									<Skeleton className="h-4 w-16" />
								</TableHead>
								<TableHead>
									<Skeleton className="h-4 w-16" />
								</TableHead>
								<TableHead>
									<Skeleton className="h-4 w-20" />
								</TableHead>
								<TableHead>
									<Skeleton className="h-4 w-16" />
								</TableHead>
								<TableHead>
									<Skeleton className="h-4 w-12" />
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 8 }).map((_, index) => (
								<TableRow key={index}>
									<TableCell>
										<Skeleton className="h-4 w-32" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-28" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-6 w-24 rounded-full" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-8 w-8 rounded-md" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>

			<div className="flex items-center justify-between px-6 py-4 border-t border-border">
				<Skeleton className="h-4 w-40" />
				<div className="flex items-center gap-2">
					<Skeleton className="h-10 w-24" />
					<Skeleton className="h-10 w-10" />
					<Skeleton className="h-10 w-10" />
					<Skeleton className="h-10 w-24" />
				</div>
			</div>
		</div>
	)
}
