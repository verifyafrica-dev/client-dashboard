import {
	ActivityIcon,
	ArrowClockwiseIcon,
	ArrowsCounterClockwiseIcon,
	CheckCircleIcon,
	CreditCardIcon,
	LightningIcon,
	TrendUpIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Pie,
	PieChart,
	type PieSectorShapeProps,
	Sector,
	XAxis,
} from "recharts";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "#/components/ui/chart";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Skeleton } from "#/components/ui/skeleton";
import { cn } from "#/lib/utils.ts";
import {
	type DashboardData,
	fetchDashboardData,
	TIME_RANGE_OPTIONS,
	type TimeRange,
} from "./-data";

export const Route = createFileRoute("/(auth)/_layout/dashboard/")({
	component: DashboardPage,
});

const trendChartConfig = {
	total: {
		label: "Total",
		color: "oklch(0.55 0.15 250)",
	},
	successful: {
		label: "Successful",
		color: "oklch(0.65 0.15 155)",
	},
} satisfies ChartConfig;

const typeChartConfig = {
	id: { label: "National ID", color: "var(--chart-1)" },
	passport: { label: "Passport", color: "var(--chart-2)" },
	faceMatch: { label: "Face Match", color: "var(--chart-3)" },
	address: { label: "Address", color: "var(--chart-4)" },
} satisfies ChartConfig;

function VerificationTypeSector(props: PieSectorShapeProps) {
	const type = String(props.payload?.type ?? "");
	return <Sector {...props} fill={`var(--color-${type})`} />;
}

function formatCurrency(value: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0,
	}).format(value);
}

function MetricCard({
	icon: Icon,
	iconClassName,
	value,
	label,
}: {
	icon: ComponentType<{ className?: string; weight?: "fill" | "regular" }>;
	iconClassName: string;
	value: string;
	label: string;
}) {
	return (
		<Card>
			<CardContent className="flex flex-col gap-3">
				<div
					className={cn(
						"flex size-10 items-center justify-center rounded-xl",
						iconClassName,
					)}
				>
					<Icon className="size-5" weight="fill" />
				</div>
				<div>
					<p className="text-2xl font-semibold tracking-tight">{value}</p>
					<p className="text-sm text-muted-foreground">{label}</p>
				</div>
			</CardContent>
		</Card>
	);
}

function MetricCardSkeleton() {
	return (
		<Card>
			<CardContent className="flex flex-col gap-3">
				<Skeleton className="size-10 rounded-xl" />
				<div className="space-y-2">
					<Skeleton className="h-8 w-20" />
					<Skeleton className="h-4 w-36" />
				</div>
			</CardContent>
		</Card>
	);
}

function VerificationTrendsSkeleton() {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0">
				<Skeleton className="h-5 w-36" />
				<div className="flex items-center gap-4">
					<Skeleton className="h-3 w-12" />
					<Skeleton className="h-3 w-16" />
				</div>
			</CardHeader>
			<CardContent>
				<Skeleton className="h-[280px] w-full rounded-xl" />
			</CardContent>
		</Card>
	);
}

function VerificationTypesSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-5 w-36" />
			</CardHeader>
			<CardContent>
				<div className="mx-auto flex h-[280px] w-full max-w-[320px] items-center justify-center">
					<Skeleton className="size-[200px] rounded-full" />
				</div>
				<div className="mt-4 grid grid-cols-2 gap-2">
					{["id", "passport", "faceMatch", "address"].map((type) => (
						<div key={type} className="flex items-center justify-between gap-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-10" />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function FinancialSummarySkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-5 w-52" />
			</CardHeader>
			<CardContent>
				<div className="grid gap-6 sm:grid-cols-3">
					<div className="flex flex-col items-center gap-2 text-center">
						<Skeleton className="size-12 rounded-full" />
						<Skeleton className="h-8 w-24" />
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-3 w-32" />
					</div>
					<div className="flex flex-col items-center gap-2 text-center">
						<Skeleton className="size-12 rounded-full" />
						<Skeleton className="h-8 w-16" />
						<Skeleton className="h-4 w-24" />
					</div>
					<div className="flex flex-col items-center gap-2 text-center">
						<Skeleton className="size-12 rounded-full" />
						<Skeleton className="h-8 w-24" />
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-3 w-32" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function DashboardMetricsSkeleton() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{["total", "success", "topups", "credits"].map((metric) => (
				<MetricCardSkeleton key={metric} />
			))}
		</div>
	);
}

function DashboardContentSkeleton() {
	return (
		<>
			<DashboardMetricsSkeleton />
			<div className="grid gap-4 lg:grid-cols-2">
				<VerificationTrendsSkeleton />
				<VerificationTypesSkeleton />
			</div>
			<FinancialSummarySkeleton />
		</>
	);
}

type DashboardContentProps = DashboardData & {
	chartKey: string;
};

function DashboardContent({
	stats,
	trendData,
	typeData,
	chartKey,
}: DashboardContentProps) {
	return (
		<>
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<MetricCard
					icon={ActivityIcon}
					iconClassName="bg-blue-100 text-blue-600"
					value={stats.totalVerifications.toLocaleString()}
					label="Total Verifications"
				/>
				<MetricCard
					icon={CheckCircleIcon}
					iconClassName="bg-emerald-100 text-emerald-600"
					value={`${stats.successRate.toFixed(1)}%`}
					label="Success Rate"
				/>
				<MetricCard
					icon={CreditCardIcon}
					iconClassName="bg-violet-100 text-violet-600"
					value={formatCurrency(stats.topUps)}
					label="Top-ups (30 days)"
				/>
				<MetricCard
					icon={LightningIcon}
					iconClassName="bg-amber-100 text-amber-600"
					value={stats.creditsUsed.toLocaleString()}
					label="Credits Used (30 days)"
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0">
						<CardTitle>Verification Trends</CardTitle>
						<div className="flex items-center gap-4 text-xs text-muted-foreground">
							<span className="flex items-center gap-1.5">
								<span className="size-2 rounded-full bg-[oklch(0.55_0.15_250)]" />
								Total
							</span>
							<span className="flex items-center gap-1.5">
								<span className="size-2 rounded-full bg-[oklch(0.65_0.15_155)]" />
								Successful
							</span>
						</div>
					</CardHeader>
					<CardContent>
						<ChartContainer
							key={chartKey}
							config={trendChartConfig}
							className="aspect-auto h-[280px] w-full"
						>
							<AreaChart
								data={trendData}
								margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
							>
								<CartesianGrid vertical={false} strokeDasharray="3 3" />
								<XAxis
									dataKey="label"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
								/>
								<ChartTooltip content={<ChartTooltipContent />} />
								<Area
									type="monotone"
									dataKey="total"
									stroke="var(--color-total)"
									fill="var(--color-total)"
									fillOpacity={0.15}
									strokeWidth={2}
								/>
								<Area
									type="monotone"
									dataKey="successful"
									stroke="var(--color-successful)"
									fill="var(--color-successful)"
									fillOpacity={0.15}
									strokeWidth={2}
								/>
							</AreaChart>
						</ChartContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Verification Types</CardTitle>
					</CardHeader>
					<CardContent>
						<ChartContainer
							key={chartKey}
							config={typeChartConfig}
							className="mx-auto aspect-square h-[280px] w-full max-w-[320px]"
						>
							<PieChart>
								<ChartTooltip content={<ChartTooltipContent hideLabel />} />
								<Pie
									data={typeData}
									dataKey="count"
									nameKey="type"
									innerRadius={60}
									outerRadius={100}
									paddingAngle={2}
									shape={VerificationTypeSector}
								/>
							</PieChart>
						</ChartContainer>
						<div className="mt-4 grid grid-cols-2 gap-2">
							{typeData.map((entry) => (
								<div
									key={entry.type}
									className="flex items-center justify-between gap-2 text-sm"
								>
									<span className="flex items-center gap-2 text-muted-foreground">
										<span
											className="size-2 shrink-0 rounded-full"
											style={{
												backgroundColor: `var(--color-${entry.type})`,
											}}
										/>
										{typeChartConfig[entry.type as keyof typeof typeChartConfig]
											?.label ?? entry.type}
									</span>
									<span className="font-medium tabular-nums">
										{entry.count.toLocaleString()}
									</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Financial Summary (Last 30 Days)</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-6 sm:grid-cols-3">
						<div className="flex flex-col items-center gap-2 text-center">
							<div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
								<TrendUpIcon className="size-6" weight="fill" />
							</div>
							<p className="text-2xl font-semibold">
								{formatCurrency(stats.topUps)}
							</p>
							<p className="text-sm font-medium">Total Top-ups</p>
							<p className="text-xs text-muted-foreground">
								{stats.topUpTransactions} transactions
							</p>
						</div>
						<div className="flex flex-col items-center gap-2 text-center">
							<div className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
								<LightningIcon className="size-6" weight="fill" />
							</div>
							<p className="text-2xl font-semibold">
								{stats.creditsUsed.toLocaleString()}
							</p>
							<p className="text-sm font-medium">Credits Used</p>
						</div>
						<div className="flex flex-col items-center gap-2 text-center">
							<div className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
								<ArrowsCounterClockwiseIcon className="size-6" weight="fill" />
							</div>
							<p className="text-2xl font-semibold">
								{formatCurrency(stats.refunds.amount)}
							</p>
							<p className="text-sm font-medium">Total Refunds</p>
							<p className="text-xs text-muted-foreground">
								{stats.refunds.transactions} transactions
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</>
	);
}

function DashboardPage() {
	const [timeRange, setTimeRange] = useState<TimeRange>("all");
	const [refreshKey, setRefreshKey] = useState(0);

	const { data, isPending, isFetching } = useQuery({
		queryKey: ["dashboard", timeRange, refreshKey],
		queryFn: () => fetchDashboardData(timeRange),
	});

	const isLoading = isPending || isFetching;
	const chartKey = `${timeRange}-${refreshKey}`;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Welcome back! Here&apos;s your verification overview.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Select
						value={timeRange}
						onValueChange={(value) => setTimeRange(value as TimeRange)}
						disabled={isLoading}
					>
						<SelectTrigger className="w-[160px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{TIME_RANGE_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						onClick={() => setRefreshKey((key) => key + 1)}
						disabled={isLoading}
					>
						<ArrowClockwiseIcon
							className={isLoading ? "animate-spin" : undefined}
						/>
						Refresh
					</Button>
				</div>
			</div>

			{isLoading || !data ? (
				<DashboardContentSkeleton />
			) : (
				<DashboardContent
					stats={data.stats}
					trendData={data.trendData}
					typeData={data.typeData}
					chartKey={chartKey}
				/>
			)}
		</div>
	);
}
