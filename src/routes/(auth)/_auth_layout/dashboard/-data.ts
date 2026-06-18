import type { UserDetail } from "#/api/http/v1/users/users.types";

export type TimeRange = "all" | "7d" | "30d" | "90d";

const calendarDayFormatter = new Intl.DateTimeFormat("en-NG", {
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

function getCalendarDayKey(value: string | Date) {
	return calendarDayFormatter.format(new Date(value));
}

export function isSameCalendarDay(left: string | Date, right: string | Date) {
	return getCalendarDayKey(left) === getCalendarDayKey(right);
}

export function shouldShowDashboardOnboarding(user: UserDetail | null) {
	if (!user?.last_login) {
		return false;
	}

	return isSameCalendarDay(user.created_at, user.last_login);
}

export const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
	{ value: "all", label: "All time" },
	{ value: "7d", label: "Last 7 days" },
	{ value: "30d", label: "Last 30 days" },
	{ value: "90d", label: "Last 90 days" },
];

export type TrendPoint = {
	label: string;
	total: number;
	successful: number;
};

export type VerificationTypePoint = {
	type: string;
	count: number;
};

const trendData: Record<TimeRange, TrendPoint[]> = {
	all: [
		{ label: "Jan", total: 820, successful: 756 },
		{ label: "Feb", total: 940, successful: 881 },
		{ label: "Mar", total: 1105, successful: 1024 },
		{ label: "Apr", total: 980, successful: 912 },
		{ label: "May", total: 1240, successful: 1168 },
		{ label: "Jun", total: 1180, successful: 1105 },
	],
	"7d": [
		{ label: "Mon", total: 142, successful: 131 },
		{ label: "Tue", total: 168, successful: 155 },
		{ label: "Wed", total: 151, successful: 140 },
		{ label: "Thu", total: 189, successful: 176 },
		{ label: "Fri", total: 203, successful: 191 },
		{ label: "Sat", total: 96, successful: 88 },
		{ label: "Sun", total: 78, successful: 71 },
	],
	"30d": [
		{ label: "Week 1", total: 620, successful: 578 },
		{ label: "Week 2", total: 710, successful: 662 },
		{ label: "Week 3", total: 685, successful: 641 },
		{ label: "Week 4", total: 748, successful: 701 },
	],
	"90d": [
		{ label: "Apr", total: 980, successful: 912 },
		{ label: "May", total: 1240, successful: 1168 },
		{ label: "Jun", total: 1180, successful: 1105 },
	],
};

const typeData: Record<TimeRange, VerificationTypePoint[]> = {
	all: [
		{ type: "id", count: 1840 },
		{ type: "passport", count: 1120 },
		{ type: "faceMatch", count: 890 },
		{ type: "address", count: 520 },
	],
	"7d": [
		{ type: "id", count: 312 },
		{ type: "passport", count: 198 },
		{ type: "faceMatch", count: 156 },
		{ type: "address", count: 89 },
	],
	"30d": [
		{ type: "id", count: 1180 },
		{ type: "passport", count: 720 },
		{ type: "faceMatch", count: 540 },
		{ type: "address", count: 310 },
	],
	"90d": [
		{ type: "id", count: 2640 },
		{ type: "passport", count: 1580 },
		{ type: "faceMatch", count: 1210 },
		{ type: "address", count: 680 },
	],
};

export function getDashboardStats(range: TimeRange) {
	const trends = getTrendData(range);
	const types = getTypeData(range);

	const totalVerifications = trends.reduce(
		(sum, point) => sum + point.total,
		0,
	);
	const successfulVerifications = trends.reduce(
		(sum, point) => sum + point.successful,
		0,
	);
	const successRate =
		totalVerifications > 0
			? (successfulVerifications / totalVerifications) * 100
			: 0;

	const topUpsByRange: Record<TimeRange, number> = {
		all: 12450,
		"7d": 850,
		"30d": 3200,
		"90d": 8900,
	};

	const creditsByRange: Record<TimeRange, number> = {
		all: 42650,
		"7d": 1027,
		"30d": 3840,
		"90d": 11200,
	};

	const refundsByRange: Record<
		TimeRange,
		{ amount: number; transactions: number }
	> = {
		all: { amount: 420, transactions: 8 },
		"7d": { amount: 0, transactions: 0 },
		"30d": { amount: 120, transactions: 2 },
		"90d": { amount: 280, transactions: 5 },
	};

	const topUpTransactions: Record<TimeRange, number> = {
		all: 42,
		"7d": 3,
		"30d": 12,
		"90d": 28,
	};

	return {
		totalVerifications,
		successRate,
		topUps: topUpsByRange[range],
		topUpTransactions: topUpTransactions[range],
		creditsUsed: creditsByRange[range],
		refunds: refundsByRange[range],
		typesTotal: types.reduce((sum, point) => sum + point.count, 0),
	};
}

export type DashboardData = {
	stats: ReturnType<typeof getDashboardStats>;
	trendData: TrendPoint[];
	typeData: VerificationTypePoint[];
};

export function getTrendData(range: TimeRange) {
	return trendData[range];
}

export function getTypeData(range: TimeRange) {
	return typeData[range];
}

export async function fetchDashboardData(
	range: TimeRange,
): Promise<DashboardData> {
	// Replace with a real API call when the dashboard endpoint is available.
	return {
		stats: getDashboardStats(range),
		trendData: getTrendData(range),
		typeData: getTypeData(range),
	};
}
