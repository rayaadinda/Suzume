import { Skeleton } from "@/components/ui/skeleton"

export function TaskBoardSkeleton() {
	return (
		<div className="flex h-full gap-4 px-6 pt-6 pb-4 min-w-max">
			{Array.from({ length: 6 }).map((_, columnIndex) => (
				<div key={columnIndex} className="flex flex-col w-80 gap-3">
					<div className="flex items-center justify-between px-3 py-2">
						<div className="flex items-center gap-2">
							<Skeleton className="h-2 w-2 rounded-full" />
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-5 w-8 rounded-full" />
						</div>
						<Skeleton className="h-8 w-8 rounded-md" />
					</div>
					<div className="space-y-2.5 flex-1">
						{Array.from({ length: columnIndex === 0 ? 4 : columnIndex === 1 ? 3 : 2 }).map(
							(_, cardIndex) => (
								<div
									key={cardIndex}
									className="bg-card rounded-lg border border-border p-3 space-y-2.5"
								>
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-3 w-full" />
									<Skeleton className="h-3 w-5/6" />
									<div className="flex items-center gap-2 pt-2">
										<Skeleton className="h-5 w-16 rounded-full" />
										<Skeleton className="h-5 w-16 rounded-full" />
									</div>
									<div className="flex items-center justify-between pt-2">
										<div className="flex items-center gap-1">
											<Skeleton className="h-6 w-6 rounded-full" />
											<Skeleton className="h-6 w-6 rounded-full" />
										</div>
										<Skeleton className="h-4 w-12" />
									</div>
								</div>
							)
						)}
					</div>
				</div>
			))}
		</div>
	)
}
