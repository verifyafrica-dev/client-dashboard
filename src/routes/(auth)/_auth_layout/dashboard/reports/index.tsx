import {
	ArrowsClockwiseIcon,
	EyeIcon,
	StackIcon,
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import {
	useTenantVerificationBatchesV2Query,
	useTenantVerificationRequestsV2Query,
	VERIFICATIONS_V2_QUERY_KEYS,
} from "#/api/http/v2/verifications/verifications.hooks";
import type { ReportsFiltersFormValues } from "#/api/http/v1/verifications/verifications.types";
import { paginateItems, TablePagination } from "#/components/table-pagination";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { cn } from "#/lib/utils.ts";
import { useCurrentTenant } from "../team/-data";
import { ReportsFiltersForm } from "./-components/reports-filters-form";
import { ReportsTableShell } from "./-components/reports-table-shell";
import {
	ReportsPaginationSkeleton,
	ReportsTableSkeleton,
} from "./-components/reports-table-skeleton";
import {
	BatchCountBadge,
	VerificationStatusBadge,
	VerificationTypeBadge,
} from "./-components/verification-badges";
import {
	BATCH_VERIFICATIONS_LIST_PAGE_SIZE,
	type BatchVerificationReport,
	filterVerifications,
	formatReportDate,
	formatVerificationType,
	getVerificationCountries,
	getVerificationStatuses,
	getVerificationTypes,
	mapVerificationBatchesToReports,
	mapVerificationRequestsToReports,
	REPORTS_PAGE_SIZE,
	type VerificationReport,
	VERIFICATIONS_LIST_PAGE_SIZE,
} from "./-data";

const INDIVIDUAL_COLUMNS = [
	"ID",
	"Batch ID",
	"Type",
	"Status",
	"Name",
	"Mode",
	"Date",
	"Cost",
	"Actions",
];

const REPORTS_TABLE_CLASSNAME = "w-max! min-w-full";

const BATCH_COLUMNS = [
	"Batch ID",
	"Status",
	"Total Count",
	"Success",
	"Failed",
	"Success Rate",
	"Created At",
	"Actions",
];

const DEFAULT_FILTERS: ReportsFiltersFormValues = {
	search: "",
	verificationType: "all",
	status: "all",
	country: "all",
};

export const Route = createFileRoute("/(auth)/_auth_layout/dashboard/reports/")(
	{
		component: ReportsPage,
	},
);

function ReportsPage() {
	const queryClient = useQueryClient();
	const { tenantId } = useCurrentTenant();
	const [activeTab, setActiveTab] = useState<"individual" | "batch">(
		"individual",
	);
	const [filters, setFilters] =
		useState<ReportsFiltersFormValues>(DEFAULT_FILTERS);
	const [individualPage, setIndividualPage] = useState(1);
	const [batchPage, setBatchPage] = useState(1);

	const verificationRequestsQuery = useTenantVerificationRequestsV2Query(
		tenantId,
		{
			has_batch: false,
			per_page: VERIFICATIONS_LIST_PAGE_SIZE,
		},
		Boolean(tenantId),
	);

	const verificationBatchesQuery = useTenantVerificationBatchesV2Query(
		tenantId,
		{
			per_page: BATCH_VERIFICATIONS_LIST_PAGE_SIZE,
			is_test: false,
		},
		Boolean(tenantId),
	);

	const verifications = useMemo(
		() =>
			mapVerificationRequestsToReports(
				verificationRequestsQuery.data?.items ?? [],
				"live",
			),
		[verificationRequestsQuery.data?.items],
	);

	const batchVerifications = useMemo(
		() =>
			mapVerificationBatchesToReports(
				verificationBatchesQuery.data?.items ?? [],
			),
		[verificationBatchesQuery.data?.items],
	);

	const isIndividualLoading =
		verificationRequestsQuery.isPending || verificationRequestsQuery.isFetching;
	const isBatchLoading =
		verificationBatchesQuery.isPending || verificationBatchesQuery.isFetching;
	const isRefreshing =
		activeTab === "individual"
			? verificationRequestsQuery.isFetching &&
				!verificationRequestsQuery.isPending
			: verificationBatchesQuery.isFetching &&
				!verificationBatchesQuery.isPending;

	const verificationTypes = useMemo(
		() => getVerificationTypes(verifications),
		[verifications],
	);
	const verificationStatuses = useMemo(
		() => getVerificationStatuses(verifications),
		[verifications],
	);
	const countries = useMemo(
		() => getVerificationCountries(verifications),
		[verifications],
	);

	const filteredVerifications = useMemo(
		() => filterVerifications(verifications, filters),
		[verifications, filters],
	);

	const { items: paginatedVerifications, safePage: individualSafePage } =
		useMemo(
			() =>
				paginateItems(filteredVerifications, individualPage, REPORTS_PAGE_SIZE),
			[filteredVerifications, individualPage],
		);

	const { items: paginatedBatches, safePage: batchSafePage } = useMemo(
		() => paginateItems(batchVerifications, batchPage, REPORTS_PAGE_SIZE),
		[batchVerifications, batchPage],
	);

	const handleFiltersChange = useCallback((values: ReportsFiltersFormValues) => {
		setFilters(values);
		setIndividualPage(1);
	}, []);

	async function handleRefresh() {
		if (activeTab === "individual") {
			await queryClient.invalidateQueries({
				queryKey: VERIFICATIONS_V2_QUERY_KEYS.tenantRequests(tenantId ?? ""),
			});
			return;
		}

		await queryClient.invalidateQueries({
			queryKey: VERIFICATIONS_V2_QUERY_KEYS.tenantBatches(tenantId ?? ""),
		});
	}

	return (
		<div className="flex min-w-0 flex-col gap-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
					<p className="text-sm text-muted-foreground">
						View and manage all verification reports
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button
						type="button"
						variant="outline"
						className="cursor-pointer tracking-wide"
						disabled={isIndividualLoading || isBatchLoading || !tenantId}
						onClick={() => void handleRefresh()}
					>
						<ArrowsClockwiseIcon
							className={cn(isRefreshing && "animate-spin")}
							weight="bold"
						/>
						Refresh
					</Button>
					<Button className="cursor-pointer tracking-wide">
						New Verification
					</Button>
				</div>
			</div>

			<Card className="min-w-0 overflow-visible">
				<CardContent className="min-w-0 pt-0">
					<Tabs
						className="min-w-0 w-full"
						value={activeTab}
						onValueChange={(value) =>
							setActiveTab(value as "individual" | "batch")
						}
					>
						<TabsList className="mb-6 w-full justify-start">
							<TabsTrigger value="individual">
								<EyeIcon />
								Individual Verifications
							</TabsTrigger>
							<TabsTrigger value="batch">
								<StackIcon />
								Batch Verifications
							</TabsTrigger>
						</TabsList>

						<TabsContent
							value="individual"
							className="flex min-w-0 flex-col gap-6"
						>
							<ReportsFiltersForm
								verificationTypes={verificationTypes}
								statuses={verificationStatuses}
								countries={countries}
								totalCount={verifications.length}
								filteredCount={filteredVerifications.length}
								disabled={verificationRequestsQuery.isPending}
								onChange={handleFiltersChange}
							/>

							{verificationRequestsQuery.isPending ? (
								<>
									<ReportsTableSkeleton columns={INDIVIDUAL_COLUMNS} />
									<ReportsPaginationSkeleton />
								</>
							) : verificationRequestsQuery.isError ? (
								<div className="flex min-h-[320px] items-center justify-center px-6 text-sm text-muted-foreground">
									Failed to load verifications. Please try again.
								</div>
							) : (
								<>
									<ReportsTableShell>
										<Table className={REPORTS_TABLE_CLASSNAME}>
											<TableHeader>
												<TableRow className="bg-muted/40 hover:bg-muted/40">
													{INDIVIDUAL_COLUMNS.map((column, index) => (
														<TableHead
															key={column}
															className={cn(
																"text-xs font-semibold tracking-wide uppercase",
																index === 0 && "pl-4 sm:pl-6",
																index === INDIVIDUAL_COLUMNS.length - 1 &&
																	"pr-4 text-center sm:pr-6",
															)}
														>
															{column}
														</TableHead>
													))}
												</TableRow>
											</TableHeader>
											<TableBody>
												{paginatedVerifications.length === 0 ? (
													<TableRow>
														<TableCell
															colSpan={INDIVIDUAL_COLUMNS.length}
															className="h-24 text-center text-sm text-muted-foreground"
														>
															{verifications.length === 0
																? "No verifications found. Start by creating your first verification."
																: "No verifications match your search or filters."}
														</TableCell>
													</TableRow>
												) : (
													paginatedVerifications.map((verification) => (
														<IndividualVerificationRow
															key={verification.id}
															verification={verification}
														/>
													))
												)}
											</TableBody>
										</Table>
									</ReportsTableShell>
									<TablePagination
										page={individualSafePage}
										pageSize={REPORTS_PAGE_SIZE}
										total={filteredVerifications.length}
										onPageChange={setIndividualPage}
									/>
								</>
							)}
						</TabsContent>

						<TabsContent value="batch" className="flex min-w-0 flex-col gap-6">
							{verificationBatchesQuery.isPending ? (
								<>
									<ReportsTableSkeleton columns={BATCH_COLUMNS} />
									<ReportsPaginationSkeleton />
								</>
							) : verificationBatchesQuery.isError ? (
								<div className="flex min-h-[320px] items-center justify-center px-6 text-sm text-muted-foreground">
									Failed to load batch verifications. Please try again.
								</div>
							) : (
								<>
									<ReportsTableShell>
										<Table className={REPORTS_TABLE_CLASSNAME}>
											<TableHeader>
												<TableRow className="bg-muted/40 hover:bg-muted/40">
													{BATCH_COLUMNS.map((column, index) => (
														<TableHead
															key={column}
															className={cn(
																"text-xs font-semibold tracking-wide uppercase",
																index === 0 && "pl-4 sm:pl-6",
																index === BATCH_COLUMNS.length - 1 &&
																	"pr-4 text-center sm:pr-6",
															)}
														>
															{column}
														</TableHead>
													))}
												</TableRow>
											</TableHeader>
											<TableBody>
												{paginatedBatches.length === 0 ? (
													<TableRow>
														<TableCell
															colSpan={BATCH_COLUMNS.length}
															className="h-24 text-center text-sm text-muted-foreground"
														>
															No batch verifications found.
														</TableCell>
													</TableRow>
												) : (
													paginatedBatches.map((batch) => (
														<BatchVerificationRow
															key={batch.id}
															batch={batch}
														/>
													))
												)}
											</TableBody>
										</Table>
									</ReportsTableShell>
									<TablePagination
										page={batchSafePage}
										pageSize={REPORTS_PAGE_SIZE}
										total={batchVerifications.length}
										onPageChange={setBatchPage}
									/>
								</>
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}

function IndividualVerificationRow({
	verification,
}: {
	verification: VerificationReport;
}) {
	return (
		<TableRow>
			<TableCell className="pl-4 font-mono text-xs sm:pl-6">
				<p className="truncate max-w-[15ch]">{verification.id}</p>
			</TableCell>
			<TableCell className="font-mono text-xs">
				<p className="truncate max-w-[15ch]">
					{verification.batch_id ?? "N/A"}
				</p>
			</TableCell>
			<TableCell>
				<VerificationTypeBadge label={formatVerificationType(verification)} />
			</TableCell>
			<TableCell>
				<VerificationStatusBadge status={verification.status} />
			</TableCell>
			<TableCell className="text-sm">{verification.name}</TableCell>
			<TableCell className="text-sm capitalize text-muted-foreground">
				{verification.mode}
			</TableCell>
			<TableCell className="text-sm text-muted-foreground">
				{formatReportDate(verification.created_at)}
			</TableCell>
			<TableCell className="text-sm font-medium tabular-nums">
				{verification.currency} {verification.cost_charged}
			</TableCell>
			<TableCell className="pr-4 text-center sm:pr-6">
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="cursor-pointer uppercase tracking-wide"
				>
					<EyeIcon className="size-4" />
					View
				</Button>
			</TableCell>
		</TableRow>
	);
}

function BatchVerificationRow({ batch }: { batch: BatchVerificationReport }) {
	const successRate =
		batch.total_count > 0
			? ((batch.success_count / batch.total_count) * 100).toFixed(1)
			: "0";

	return (
		<TableRow>
			<TableCell className="pl-4 font-mono text-xs sm:pl-6">
				<p className="truncate max-w-[15ch]">{batch.id}</p>
			</TableCell>
			<TableCell>
				<VerificationStatusBadge status={batch.status} />
			</TableCell>
			<TableCell className="text-sm font-medium tabular-nums">
				{batch.total_count}
			</TableCell>
			<TableCell>
				<BatchCountBadge count={batch.success_count} variant="success" />
			</TableCell>
			<TableCell>
				<BatchCountBadge count={batch.failed_count} variant="error" />
			</TableCell>
			<TableCell>
				<div className="flex items-center gap-2 whitespace-nowrap">
					<span className="text-sm font-medium tabular-nums">
						{successRate}%
					</span>
					<div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
						<div
							className={cn(
								"h-full rounded-full",
								Number(successRate) >= 80
									? "bg-emerald-500"
									: Number(successRate) >= 50
										? "bg-amber-500"
										: "bg-red-500",
							)}
							style={{ width: `${successRate}%` }}
						/>
					</div>
				</div>
			</TableCell>
			<TableCell className="text-sm text-muted-foreground">
				{formatReportDate(batch.created_at)}
			</TableCell>
			<TableCell className="pr-4 text-center sm:pr-6">
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="cursor-pointer uppercase tracking-wide"
				>
					<EyeIcon className="size-4" />
					View
				</Button>
			</TableCell>
		</TableRow>
	);
}
