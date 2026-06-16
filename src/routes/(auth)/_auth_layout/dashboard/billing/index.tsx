import {
	ArrowsClockwiseIcon,
	BuildingsIcon,
	DownloadSimpleIcon,
	EyeIcon,
	MagnifyingGlassIcon,
	PencilSimpleIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "#/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Skeleton } from "#/components/ui/skeleton";
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
import { AddCreditsDialog } from "./-components/add-credits-dialog";
import { TransactionDetailsDialog } from "./-components/transaction-details-dialog";
import { UpdateBillingDialog } from "./-components/update-billing-dialog";
import {
	type BillingData,
	fetchBillingData,
	formatMoney,
	formatSignedAmount,
	type Transaction,
} from "./-data";

export const Route = createFileRoute("/(auth)/_auth_layout/dashboard/billing/")(
	{
		component: BillingPage,
	},
);

function BalanceCardSkeleton() {
	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between space-y-0">
				<div className="space-y-3">
					<Skeleton className="h-4 w-16" />
					<div className="space-y-2">
						<Skeleton className="h-10 w-24" />
						<Skeleton className="h-4 w-10" />
					</div>
				</div>
				<Skeleton className="h-9 w-32" />
			</CardHeader>
		</Card>
	);
}

function BillingInfoCardSkeleton() {
	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between space-y-0">
				<div className="flex items-center gap-2">
					<Skeleton className="size-5 rounded-md" />
					<Skeleton className="h-5 w-36" />
				</div>
				<Skeleton className="size-8 rounded-md" />
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-40" />
				</div>
			</CardContent>
		</Card>
	);
}

function TransactionsTableSkeleton({ rows = 5 }: { rows?: number }) {
	const skeletonRows = ["one", "two", "three", "four", "five"].slice(0, rows);

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Reference</TableHead>
					<TableHead>Date</TableHead>
					<TableHead>Description</TableHead>
					<TableHead>Amount</TableHead>
					<TableHead>Type</TableHead>
					<TableHead>Balance Before</TableHead>
					<TableHead>Balance After</TableHead>
					<TableHead>Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{skeletonRows.map((rowId) => (
					<TableRow key={`transaction-skeleton-${rowId}`}>
						<TableCell>
							<Skeleton className="h-4 w-20" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-4 w-16" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-4 w-28" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-4 w-16" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-6 w-14 rounded-full" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-4 w-16" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-4 w-16" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-8 w-28" />
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function getVisiblePages(
	currentPage: number,
	totalPages: number,
): Array<number | "ellipsis"> {
	if (totalPages <= 5) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	if (currentPage <= 3) {
		return [1, 2, 3, "ellipsis", totalPages];
	}

	if (currentPage >= totalPages - 2) {
		return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
	}

	return [1, "ellipsis", currentPage, "ellipsis", totalPages];
}

function BillingPage() {
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [page, setPage] = useState(1);
	const [refreshKey, setRefreshKey] = useState(0);
	const [topupOpen, setTopupOpen] = useState(false);
	const [billingOpen, setBillingOpen] = useState(false);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [selectedTransaction, setSelectedTransaction] =
		useState<Transaction | null>(null);

	const { data, isPending, isFetching } = useQuery<BillingData>({
		queryKey: ["billing", search, typeFilter, page, refreshKey],
		queryFn: () => fetchBillingData({ search, type: typeFilter, page }),
	});

	const isLoading = isPending || isFetching;

	function openTransactionDetails(transaction: Transaction) {
		setSelectedTransaction(transaction);
		setDetailsOpen(true);
	}

	return (
		<div className="flex w-full flex-col gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">
					Billing & Invoices
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Manage your invoices, payment history, and account credits
				</p>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				{isLoading || !data ? (
					<>
						<BalanceCardSkeleton />
						<BillingInfoCardSkeleton />
					</>
				) : (
					<>
						<Card>
							<CardHeader className="flex flex-row items-start justify-between space-y-0">
								<div className="space-y-3">
									<p className="text-sm text-muted-foreground">Balance</p>
									<div>
										<p className="text-4xl font-semibold tracking-tight">
											{formatMoney(data.balance.amount)}
										</p>
										<p className="text-sm font-medium text-muted-foreground">
											{data.balance.currency}
										</p>
									</div>
								</div>
								<Button
									type="button"
									className="cursor-pointer"
									onClick={() => setTopupOpen(true)}
								>
									Topup Balance
								</Button>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-start justify-between space-y-0">
								<div className="flex items-center gap-2">
									<BuildingsIcon className="size-5 text-muted-foreground" />
									<CardTitle className="text-base font-semibold">
										Billing Information
									</CardTitle>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									className="cursor-pointer text-primary"
									onClick={() => setBillingOpen(true)}
									aria-label="Edit billing information"
								>
									<PencilSimpleIcon className="size-4" />
								</Button>
							</CardHeader>
							<CardContent>
								<div className="space-y-1">
									<p className="text-sm text-muted-foreground">Address</p>
									<p className="text-sm font-medium">
										{data.billingInfo.displayAddress}
									</p>
								</div>
							</CardContent>
						</Card>
					</>
				)}
			</div>

			<Card>
				<CardContent className="pt-0">
					<Tabs
						defaultValue="transactions"
						className="flex w-full flex-col gap-4"
					>
						<TabsList className="w-full justify-start">
							<TabsTrigger value="transactions">Transactions</TabsTrigger>
							<TabsTrigger value="invoices">Invoices</TabsTrigger>
						</TabsList>

						<TabsContent value="transactions" className="flex flex-col gap-4">
							<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
								<h2 className="text-lg font-semibold">Transaction History</h2>
								<div className="flex flex-col gap-2 sm:flex-row flex-wrap sm:items-center">
									<div className="relative min-w-[200px] flex-1 sm:max-w-xs">
										<MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											placeholder="Search transactions..."
											value={search}
											onChange={(event) => {
												setSearch(event.target.value);
												setPage(1);
											}}
											className="pl-9"
											disabled={isLoading}
										/>
									</div>
									<div className="flex items-center gap-2 flex-wrap">
										<Label htmlFor="type-filter" className="sr-only">
											Type
										</Label>
										<Select
											value={typeFilter}
											onValueChange={(value) => {
												setTypeFilter(value);
												setPage(1);
											}}
											disabled={isLoading}
										>
											<SelectTrigger id="type-filter" className="w-[140px]">
												<SelectValue placeholder="Type: All" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">Type: All</SelectItem>
												<SelectItem value="debit">Debit</SelectItem>
												<SelectItem value="credit">Credit</SelectItem>
											</SelectContent>
										</Select>
										<Button
											type="button"
											variant="outline"
											className="cursor-pointer"
											disabled={isLoading}
											onClick={() => setRefreshKey((key) => key + 1)}
										>
											<ArrowsClockwiseIcon
												className={cn(isLoading && "animate-spin")}
												weight="bold"
											/>
											Refresh
										</Button>
										<Button
											type="button"
											variant="outline"
											className="cursor-pointer"
											disabled={isLoading}
										>
											<DownloadSimpleIcon className="size-4" />
											Export
										</Button>
									</div>
								</div>
							</div>

							{isLoading || !data ? (
								<TransactionsTableSkeleton />
							) : (
								<>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Reference</TableHead>
												<TableHead>Date</TableHead>
												<TableHead>Description</TableHead>
												<TableHead>Amount</TableHead>
												<TableHead>Type</TableHead>
												<TableHead>Balance Before</TableHead>
												<TableHead>Balance After</TableHead>
												<TableHead>Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{data.transactions.transactions.length === 0 ? (
												<TableRow>
													<TableCell
														colSpan={8}
														className="h-24 text-center text-muted-foreground"
													>
														No transactions found.
													</TableCell>
												</TableRow>
											) : (
												data.transactions.transactions.map(
													(transaction: Transaction) => {
														const isDebit = transaction.type === "debit";

														return (
															<TableRow key={transaction.id}>
																<TableCell className="font-mono text-xs">
																	{transaction.reference}
																</TableCell>
																<TableCell>{transaction.date}</TableCell>
																<TableCell>{transaction.description}</TableCell>
																<TableCell
																	className={cn(
																		"font-medium",
																		isDebit
																			? "text-red-600"
																			: "text-emerald-600",
																	)}
																>
																	{formatSignedAmount(transaction.amount)}
																</TableCell>
																<TableCell>
																	<Badge
																		variant="outline"
																		className={cn(
																			"capitalize",
																			isDebit
																				? "border-red-200 bg-red-50 text-red-700"
																				: "border-emerald-200 bg-emerald-50 text-emerald-700",
																		)}
																	>
																		{transaction.type}
																	</Badge>
																</TableCell>
																<TableCell>
																	{formatSignedAmount(
																		transaction.balanceBefore,
																	)}
																</TableCell>
																<TableCell>
																	{formatSignedAmount(transaction.balanceAfter)}
																</TableCell>
																<TableCell>
																	<Button
																		type="button"
																		variant="ghost"
																		size="sm"
																		className="cursor-pointer text-primary"
																		onClick={() =>
																			openTransactionDetails(transaction)
																		}
																	>
																		<EyeIcon className="size-4" />
																		View Details
																	</Button>
																</TableCell>
															</TableRow>
														);
													},
												)
											)}
										</TableBody>
									</Table>

									<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
										<p className="text-sm text-muted-foreground">
											{data.transactions.total === 0
												? "Showing 0 results"
												: `Showing ${(data.transactions.page - 1) * data.transactions.pageSize + 1}-${Math.min(data.transactions.page * data.transactions.pageSize, data.transactions.total)} of ${data.transactions.total}`}
										</p>
										<Pagination className="mx-0 w-auto justify-end">
											<PaginationContent>
												<PaginationItem>
													<PaginationPrevious
														href="#"
														text="Previous"
														className={cn(
															data.transactions.page <= 1 &&
																"pointer-events-none opacity-50",
														)}
														onClick={(event) => {
															event.preventDefault();
															setPage((current) => Math.max(1, current - 1));
														}}
													/>
												</PaginationItem>
												{getVisiblePages(
													data.transactions.page,
													data.transactions.totalPages,
												).map((pageNumber, index) =>
													pageNumber === "ellipsis" ? (
														<PaginationItem
															key={`ellipsis-${index === 1 ? "start" : "end"}`}
														>
															<PaginationEllipsis />
														</PaginationItem>
													) : (
														<PaginationItem key={pageNumber}>
															<PaginationLink
																href="#"
																isActive={pageNumber === data.transactions.page}
																onClick={(event) => {
																	event.preventDefault();
																	setPage(pageNumber);
																}}
															>
																{pageNumber}
															</PaginationLink>
														</PaginationItem>
													),
												)}
												<PaginationItem>
													<PaginationNext
														href="#"
														text="Next"
														className={cn(
															data.transactions.page >=
																data.transactions.totalPages &&
																"pointer-events-none opacity-50",
														)}
														onClick={(event) => {
															event.preventDefault();
															setPage((current) =>
																Math.min(
																	data.transactions.totalPages,
																	current + 1,
																),
															);
														}}
													/>
												</PaginationItem>
											</PaginationContent>
										</Pagination>
									</div>
								</>
							)}
						</TabsContent>

						<TabsContent value="invoices">
							<div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
								<p className="text-sm text-muted-foreground">
									No invoices available yet.
								</p>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			<AddCreditsDialog open={topupOpen} onOpenChange={setTopupOpen} />
			<UpdateBillingDialog open={billingOpen} onOpenChange={setBillingOpen} />
			<TransactionDetailsDialog
				open={detailsOpen}
				onOpenChange={setDetailsOpen}
				transaction={selectedTransaction}
			/>
		</div>
	);
}
