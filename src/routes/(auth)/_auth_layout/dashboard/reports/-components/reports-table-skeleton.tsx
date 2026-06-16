import { ReportsTableShell } from "./reports-table-shell";
import { Skeleton } from "#/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";

const skeletonRowIds = ["one", "two", "three", "four", "five"];

type ReportsTableSkeletonProps = {
	columns: string[];
	rows?: number;
};

export function ReportsTableSkeleton({
	columns,
	rows = 5,
}: ReportsTableSkeletonProps) {
	return (
		<ReportsTableShell>
			<Table className="w-max! min-w-full">
				<TableHeader>
					<TableRow className="hover:bg-transparent bg-muted/40">
						{columns.map((column, index) => (
							<TableHead
								key={column}
								className={
									index === 0
										? "pl-4 text-xs font-semibold tracking-wide uppercase sm:pl-6"
										: index === columns.length - 1
											? "pr-4 text-center text-xs font-semibold tracking-wide uppercase sm:pr-6"
											: "text-xs font-semibold tracking-wide uppercase"
								}
							>
								{column}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{skeletonRowIds.slice(0, rows).map((rowId) => (
						<TableRow key={`reports-skeleton-${rowId}`}>
							{columns.map((column, index) => (
								<TableCell
									key={`${rowId}-${column}`}
									className={
										index === 0
											? "pl-4 sm:pl-6"
											: index === columns.length - 1
												? "pr-4 text-center sm:pr-6"
												: undefined
									}
								>
									<ReportsCellSkeleton
										columnIndex={index}
										total={columns.length}
									/>
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</ReportsTableShell>
	);
}

function ReportsCellSkeleton({
	columnIndex,
	total,
}: {
	columnIndex: number;
	total: number;
}) {
	if (columnIndex === 0 || columnIndex === 1) {
		return <Skeleton className="h-4 w-20 font-mono" />;
	}

	if (columnIndex === 2) {
		return <Skeleton className="h-6 w-32 rounded-full" />;
	}

	if (columnIndex === 3) {
		return <Skeleton className="h-6 w-16 rounded-full" />;
	}

	if (columnIndex === total - 1) {
		return <Skeleton className="mx-auto h-8 w-16" />;
	}

	return <Skeleton className="h-4 w-24" />;
}

export function ReportsPaginationSkeleton() {
	return (
		<div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
			<Skeleton className="h-4 w-44" />
			<Skeleton className="h-9 w-56" />
		</div>
	);
}
