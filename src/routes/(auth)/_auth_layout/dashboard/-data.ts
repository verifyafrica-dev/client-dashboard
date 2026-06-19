import type {
	AnalyticsDateRangeQuery,
	TenantAnalyticsResponse,
} from "#/api/http/v1/analytics/analytics.types";

export type TimeRange = "all" | "7d" | "30d" | "90d";

const chartDateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
});

const isoDateFormatter = new Intl.DateTimeFormat("en-CA", {
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

export function shouldShowDashboardOnboarding(isKycVerified: boolean) {
	return !isKycVerified;
}

export const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
	{ value: "all", label: "All time" },
	{ value: "7d", label: "Last 7 days" },
	{ value: "30d", label: "Last 30 days" },
	{ value: "90d", label: "Last 90 days" },
];

const TIME_RANGE_DAYS: Record<Exclude<TimeRange, "all">, number> = {
	"7d": 7,
	"30d": 30,
	"90d": 90,
};

export function getAnalyticsDateRange(
	range: TimeRange,
	now = new Date(),
): AnalyticsDateRangeQuery {
	if (range === "all") {
		return {};
	}

	const toDate = new Date(now);
	const fromDate = new Date(now);
	fromDate.setDate(fromDate.getDate() - TIME_RANGE_DAYS[range]);

	return {
		from_date: isoDateFormatter.format(fromDate),
		to_date: isoDateFormatter.format(toDate),
	};
}

export type TrendPoint = {
	label: string;
	total: number;
	successful: number;
};

export type VerificationTypePoint = {
	type: string;
	count: number;
};

export type DashboardStats = {
	totalVerifications: number;
	successRate: number;
	topUps: number;
	topUpTransactions: number;
	creditsUsed: number;
	refunds: {
		amount: number;
		transactions: number;
	};
	typesTotal: number;
};

export type DashboardData = {
	stats: DashboardStats;
	trendData: TrendPoint[];
	typeData: VerificationTypePoint[];
};

type DashboardVerificationTypeKey = "id" | "passport" | "faceMatch" | "address";

function mapVerificationTypeToChartKey(
	type: string,
): DashboardVerificationTypeKey {
	if (type.includes("face_match")) {
		return "faceMatch";
	}

	if (type.includes("address")) {
		return "address";
	}

	if (type.includes("passport")) {
		return "passport";
	}

	return "id";
}

function getSuccessRate(statusDistribution: Record<string, number>) {
	const total = Object.values(statusDistribution).reduce(
		(sum, count) => sum + count,
		0,
	);

	if (total === 0) {
		return 0;
	}

	const successful = statusDistribution.SUCCESS ?? 0;
	return (successful / total) * 100;
}

function mapTypeDistribution(
	typeDistribution: Record<string, number>,
): VerificationTypePoint[] {
	const grouped = new Map<DashboardVerificationTypeKey, number>();

	for (const [type, count] of Object.entries(typeDistribution)) {
		const chartKey = mapVerificationTypeToChartKey(type);
		grouped.set(chartKey, (grouped.get(chartKey) ?? 0) + count);
	}

	return Array.from(grouped.entries()).map(([type, count]) => ({
		type,
		count,
	}));
}

function mapTrendData(
	verificationVolume: TenantAnalyticsResponse["analytics"]["verifications"]["verification_volume"],
	statusDistribution: Record<string, number>,
): TrendPoint[] {
	const successRate = getSuccessRate(statusDistribution) / 100;

	return verificationVolume.map((point) => ({
		label: chartDateFormatter.format(new Date(point.date)),
		total: point.count,
		successful: Math.round(point.count * successRate),
	}));
}

export function mapTenantAnalyticsToDashboardData(
	response: TenantAnalyticsResponse,
): DashboardData {
	const { verifications, financials } = response.analytics;
	const successRate = getSuccessRate(verifications.status_distribution);
	const trendData = mapTrendData(
		verifications.verification_volume,
		verifications.status_distribution,
	);
	const typeData = mapTypeDistribution(verifications.type_distribution);

	const totalVerifications = Object.values(
		verifications.status_distribution,
	).reduce((sum, count) => sum + count, 0);

	return {
		stats: {
			totalVerifications,
			successRate,
			topUps: financials.top_ups.total_amount,
			topUpTransactions: financials.top_ups.count,
			creditsUsed: financials.credit_usage,
			refunds: {
				amount: financials.refunds.total_amount,
				transactions: financials.refunds.count,
			},
			typesTotal: typeData.reduce((sum, point) => sum + point.count, 0),
		},
		trendData,
		typeData,
	};
}
