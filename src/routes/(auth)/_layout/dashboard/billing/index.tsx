import {
	ArrowsClockwiseIcon,
	BuildingsIcon,
	DownloadSimpleIcon,
	EyeIcon,
	MagnifyingGlassIcon,
	PencilSimpleIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
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
	BALANCE,
	BILLING_INFO,
	formatMoney,
	formatSignedAmount,
	TRANSACTIONS,
	type Transaction,
} from "./-data";

export const Route = createFileRoute("/(auth)/_layout/dashboard/billing/")({
	component: BillingPage,
});

function BillingPage() {
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [topupOpen, setTopupOpen] = useState(false);
	const [billingOpen, setBillingOpen] = useState(false);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [selectedTransaction, setSelectedTransaction] =
		useState<Transaction | null>(null);

	const filteredTransactions = useMemo(() => {
		const query = search.trim().toLowerCase();

		return TRANSACTIONS.filter((transaction) => {
			const matchesType =
				typeFilter === "all" || transaction.type === typeFilter;
			const matchesSearch =
				query.length === 0 ||
				transaction.reference.toLowerCase().includes(query) ||
				transaction.description.toLowerCase().includes(query);

			return matchesType && matchesSearch;
		});
	}, [search, typeFilter]);

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
				<Card>
					<CardHeader className="flex flex-row items-start justify-between space-y-0">
						<div className="space-y-3">
							<p className="text-sm text-muted-foreground">Balance</p>
							<div>
								<p className="text-4xl font-semibold tracking-tight">
									{formatMoney(BALANCE.amount)}
								</p>
								<p className="text-sm font-medium text-muted-foreground">
									{BALANCE.currency}
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
								{BILLING_INFO.displayAddress}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardContent className="pt-6">
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
								<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
									<div className="relative min-w-[200px] flex-1 sm:max-w-xs">
										<MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											placeholder="Search transactions..."
											value={search}
											onChange={(event) => setSearch(event.target.value)}
											className="pl-9"
										/>
									</div>
									<div className="flex items-center gap-2">
										<Label htmlFor="type-filter" className="sr-only">
											Type
										</Label>
										<Select value={typeFilter} onValueChange={setTypeFilter}>
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
										>
											<ArrowsClockwiseIcon className="size-4" />
											Refresh
										</Button>
										<Button
											type="button"
											variant="outline"
											className="cursor-pointer"
										>
											<DownloadSimpleIcon className="size-4" />
											Export
										</Button>
									</div>
								</div>
							</div>

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
									{filteredTransactions.map((transaction) => {
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
													{formatSignedAmount(transaction.balanceBefore)}
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
														onClick={() => openTransactionDetails(transaction)}
													>
														<EyeIcon className="size-4" />
														View Details
													</Button>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
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
