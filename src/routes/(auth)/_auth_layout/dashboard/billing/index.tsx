import {
	ArrowsClockwiseIcon,
	BuildingsIcon,
	DownloadSimpleIcon,
	EyeIcon,
	PencilSimpleIcon,
} from "@phosphor-icons/react";
import { type UseQueryResult, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useMemo, useState } from "react";
import {
	BILLING_QUERY_KEYS,
	useBillingInformationListQuery,
	useTenantInvoicesQuery,
} from "#/api/http/v1/billing/billing.hooks";
import type { TenantInvoicesListResponse } from "#/api/http/v1/billing/billing.types";
import {
	useWalletBalanceQuery,
	useWalletTransactionsQuery,
} from "#/api/http/v1/wallet/wallet.hooks";
import type { WalletTransactionsListResponse } from "#/api/http/v1/wallet/wallet.types";
import {
	TablePagination,
	TablePaginationSkeleton,
} from "#/components/table-pagination";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
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
import { useAuthStore } from "#/stores/auth-store";
import { ExportTransactionsDialog } from "./-components/export-transactions-dialog";
import { TransactionDetailsDialog } from "./-components/transaction-details-dialog";
import { UpdateBillingDialog } from "./-components/update-billing-dialog";
import {
	formatBillingDisplayAddress,
	formatInvoiceAmount,
	formatInvoiceDate,
	formatMoney,
	formatSignedAmount,
	getInvoiceFilename,
	INVOICES_PAGE_SIZE,
	mapWalletTransaction,
	TRANSACTIONS_PAGE_SIZE,
	type Transaction,
} from "./-data";

export const Route = createFileRoute("/(auth)/_auth_layout/dashboard/billing/")(
	{
		component: BillingPage,
	},
);

function BillingPage() {
	const queryClient = useQueryClient();
	const user = useAuthStore((state) => state.user);
	const tenantId = user?.tenants[0]?.id;
	const accountCreatedAt = useMemo(
		() => new Date(user?.created_at ?? Date.now()),
		[user?.created_at],
	);

	const [transactionPage, setTransactionPage] = useState(1);
	const [invoicePage, setInvoicePage] = useState(1);
	const [billingOpen, setBillingOpen] = useState(false);
	const [exportOpen, setExportOpen] = useState(false);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [selectedTransaction, setSelectedTransaction] =
		useState<Transaction | null>(null);

	const walletBalanceQuery = useWalletBalanceQuery(tenantId);
	const billingInformationQuery = useBillingInformationListQuery(
		{ tenant_id: tenantId },
		Boolean(tenantId),
	);
	const transactionsQuery = useWalletTransactionsQuery(
		{
			tenant_id: tenantId,
			offset: (transactionPage - 1) * TRANSACTIONS_PAGE_SIZE,
			page_size: TRANSACTIONS_PAGE_SIZE,
		},
		Boolean(tenantId),
	) as UseQueryResult<WalletTransactionsListResponse, AxiosError>;
	const invoicesQuery = useTenantInvoicesQuery(tenantId, {
		offset: (invoicePage - 1) * INVOICES_PAGE_SIZE,
		page_size: INVOICES_PAGE_SIZE,
	}) as UseQueryResult<TenantInvoicesListResponse, AxiosError>;

	const wallet = walletBalanceQuery.data;
	const billingInfo = billingInformationQuery.data?.results[0];
	const currency = wallet?.currency ?? "USD";
	const balanceAmount = Number.parseFloat(wallet?.balance ?? "0");

	const transactions = useMemo(
		() =>
			(transactionsQuery.data?.results ?? []).map((transaction) =>
				mapWalletTransaction(transaction, currency),
			),
		[transactionsQuery.data?.results, currency],
	);

	const transactionTotal = transactionsQuery.data?.count ?? transactions.length;

	const invoices = invoicesQuery.data?.results ?? [];
	const invoiceTotal = invoicesQuery.data?.count ?? invoices.length;

	const isSummaryLoading =
		walletBalanceQuery.isPending ||
		walletBalanceQuery.isFetching ||
		billingInformationQuery.isPending ||
		billingInformationQuery.isFetching;

	const isTransactionsLoading =
		transactionsQuery.isPending || transactionsQuery.isFetching;

	const isInvoicesLoading = invoicesQuery.isPending || invoicesQuery.isFetching;

	const isRefreshing =
		walletBalanceQuery.isFetching ||
		billingInformationQuery.isFetching ||
		transactionsQuery.isFetching;

	function openTransactionDetails(transaction: Transaction) {
		setSelectedTransaction(transaction);
		setDetailsOpen(true);
	}

	async function handleRefresh() {
		await queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.all });
	}

	if (walletBalanceQuery.isError || billingInformationQuery.isError) {
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
				<Card>
					<CardContent className="py-10 text-center text-sm text-muted-foreground">
						Failed to load billing information. Please try again.
					</CardContent>
				</Card>
			</div>
		);
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
				{isSummaryLoading ? (
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
											{formatMoney(balanceAmount)}
										</p>
										<p className="text-sm font-medium text-muted-foreground">
											{currency}
										</p>
									</div>
								</div>
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
										{formatBillingDisplayAddress(billingInfo)}
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
								<div className="flex flex-wrap items-center gap-2">
									<Button
										type="button"
										variant="outline"
										className="cursor-pointer"
										disabled={isTransactionsLoading || isRefreshing}
										onClick={() => void handleRefresh()}
									>
										<ArrowsClockwiseIcon
											className={cn(isRefreshing && "animate-spin")}
											weight="bold"
										/>
										Refresh
									</Button>
									<Button
										type="button"
										variant="outline"
										className="cursor-pointer"
										disabled={isTransactionsLoading}
										onClick={() => setExportOpen(true)}
									>
										<DownloadSimpleIcon className="size-4" />
										Export
									</Button>
								</div>
							</div>

							{isTransactionsLoading ? (
								<div className="min-h-[320px] flex flex-col justify-between">
									<TableSkeleton
										columns={[
											"Reference",
											"Date",
											"Description",
											"Amount",
											"Type",
											"Balance Before",
											"Balance After",
											"Actions",
										]}
									/>
									<TablePaginationSkeleton />
								</div>
							) : transactionsQuery.isError ? (
								<div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
									<p className="text-sm text-muted-foreground">
										Failed to load transactions. Please try again.
									</p>
								</div>
							) : (
								<div className="min-h-[320px] flex flex-col justify-between">
									<Table
										className={cn(transactions.length === 0 && "h-full flex-1")}
									>
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
											{transactions.length === 0 ? (
												<TableRow>
													<TableCell
														colSpan={8}
														className="h-24 text-center text-sm text-muted-foreground"
													>
														No transactions found.
													</TableCell>
												</TableRow>
											) : (
												transactions.map((transaction) => {
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
																	isDebit ? "text-red-600" : "text-emerald-600",
																)}
															>
																{formatSignedAmount(
																	transaction.amount,
																	transaction.currency,
																)}
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
																	transaction.currency,
																)}
															</TableCell>
															<TableCell>
																{formatSignedAmount(
																	transaction.balanceAfter,
																	transaction.currency,
																)}
															</TableCell>
															<TableCell>
																<Button
																	type="button"
																	variant="outline"
																	size="sm"
																	className="cursor-pointer"
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
												})
											)}
										</TableBody>
									</Table>

									<TablePagination
										page={transactionPage}
										total={transactionTotal}
										pageSize={TRANSACTIONS_PAGE_SIZE}
										onPageChange={setTransactionPage}
									/>
								</div>
							)}
						</TabsContent>

						<TabsContent value="invoices" className="flex flex-col gap-4">
							<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
								<h2 className="text-lg font-semibold">Invoices</h2>
								<Button
									type="button"
									variant="outline"
									className="cursor-pointer"
									disabled={isInvoicesLoading || isRefreshing}
									onClick={() => void handleRefresh()}
								>
									<ArrowsClockwiseIcon
										className={cn(isRefreshing && "animate-spin")}
										weight="bold"
									/>
									Refresh
								</Button>
							</div>

							{isInvoicesLoading ? (
								<div className="min-h-[320px] flex flex-col justify-between">
									<TableSkeleton
										columns={[
											"Invoice",
											"Description",
											"Amount",
											"Status",
											"Created",
											"Due",
										]}
									/>
									<TablePaginationSkeleton />
								</div>
							) : invoicesQuery.isError ? (
								<div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
									<p className="text-sm text-muted-foreground">
										Failed to load invoices. Please try again.
									</p>
								</div>
							) : (
								<div className="min-h-[320px] flex flex-col justify-between">
									<Table
										className={cn(invoices.length === 0 && "h-full flex-1")}
									>
										<TableHeader>
											<TableRow>
												<TableHead>Invoice</TableHead>
												<TableHead>Description</TableHead>
												<TableHead>Amount</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Created</TableHead>
												<TableHead>Due</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{invoices.length === 0 ? (
												<TableRow>
													<TableCell
														colSpan={6}
														className="h-24 text-center text-sm text-muted-foreground"
													>
														No invoices available yet.
													</TableCell>
												</TableRow>
											) : (
												invoices.map((invoice) => (
													<TableRow key={invoice.id}>
														<TableCell className="font-mono text-xs">
															{getInvoiceFilename(invoice)}
														</TableCell>
														<TableCell>{invoice.description ?? "—"}</TableCell>
														<TableCell>
															{formatInvoiceAmount(
																invoice.amount,
																invoice.currency ?? currency,
															)}
														</TableCell>
														<TableCell>
															<Badge variant="outline" className="capitalize">
																{invoice.payment_status ?? "unknown"}
															</Badge>
														</TableCell>
														<TableCell>
															{formatInvoiceDate(invoice.created_at)}
														</TableCell>
														<TableCell>
															{formatInvoiceDate(invoice.due_at)}
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>

									<TablePagination
										page={invoicePage}
										total={invoiceTotal}
										pageSize={INVOICES_PAGE_SIZE}
										onPageChange={setInvoicePage}
									/>
								</div>
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			<UpdateBillingDialog
				open={billingOpen}
				onOpenChange={setBillingOpen}
				billingInfo={billingInfo}
				tenantId={tenantId}
			/>
			<ExportTransactionsDialog
				open={exportOpen}
				onOpenChange={setExportOpen}
				accountCreatedAt={accountCreatedAt}
				tenantId={tenantId}
				currency={currency}
			/>
			<TransactionDetailsDialog
				open={detailsOpen}
				onOpenChange={setDetailsOpen}
				transaction={selectedTransaction}
			/>
		</div>
	);
}

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

function TableSkeleton({
	columns,
	rows = 5,
}: {
	columns: string[];
	rows?: number;
}) {
	const skeletonRows = Array.from(
		{ length: rows },
		(_, index) => `row-${index}`,
	);

	return (
		<Table>
			<TableHeader>
				<TableRow>
					{columns.map((column) => (
						<TableHead key={column}>{column}</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{skeletonRows.map((rowId) => (
					<TableRow key={rowId}>
						{columns.map((column) => (
							<TableCell key={`${rowId}-${column}`}>
								<Skeleton className="h-4 w-full" />
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
