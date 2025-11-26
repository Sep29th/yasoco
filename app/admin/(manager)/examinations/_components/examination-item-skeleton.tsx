import { Skeleton } from "@/components/ui/skeleton";
export default function ExaminationItemSkeleton() {
	return (
		<div className="relative flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm">
			<div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-l-lg" />
			<div className="flex justify-between items-start gap-2 pl-2">
				<div className="flex flex-col gap-2 flex-1">
					<Skeleton className="h-6 w-32" /> <Skeleton className="h-5 w-24" />
				</div>
				<Skeleton className="h-5 w-20" />
			</div>
			<div className="flex flex-col gap-1.5 pl-2">
				<div className="flex items-center gap-2">
					<Skeleton className="h-3.5 w-3.5 rounded" />
					<Skeleton className="h-4 w-28" />
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-3.5 w-3.5 rounded" />
					<Skeleton className="h-4 w-32" />
				</div>
			</div>
			<div className="mt-auto pt-2 flex items-center gap-2 border-t border-dashed border-gray-100 pl-2">
				<Skeleton className="h-3.5 w-3.5 rounded" />
				<Skeleton className="h-3 w-36" />
			</div>
		</div>
	);
}
