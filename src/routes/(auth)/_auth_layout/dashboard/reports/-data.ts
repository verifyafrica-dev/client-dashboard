export type VerificationReport = {
	id: string;
	batch_id: string | null;
	verification_type: string;
	mixed_verification_name?: string;
	status: string;
	name: string;
	mode: "live" | "test";
	created_at: string;
	currency: string;
	cost_charged: string;
	country?: string;
};

export type BatchVerificationReport = {
	id: string;
	status: string;
	total_count: number;
	success_count: number;
	failed_count: number;
	created_at: string;
};

export const REPORTS_PAGE_SIZE = 5;

export const COUNTRY_CODE_MAP: Record<string, string> = {
	ng: "Nigeria",
	gh: "Ghana",
	ke: "Kenya",
	za: "South Africa",
};

export const MOCK_VERIFICATIONS: VerificationReport[] = [
	{
		id: "6651ba5bc2bc8f9b5e473420",
		batch_id: null,
		verification_type: "mixed_verification",
		mixed_verification_name: "Pasport In",
		status: "SUCCESS",
		name: "management@verifyafrica.io",
		mode: "live",
		created_at: "2026-06-03T10:12:00",
		currency: "USD",
		cost_charged: "4.10",
		country: "Nigeria",
	},
	{
		id: "8f9b5e473420a1c2d3e4f5a6",
		batch_id: null,
		verification_type: "kyb_screening",
		status: "SUCCESS",
		name: "VerifyAfrica Ltd",
		mode: "live",
		created_at: "2026-06-02T15:30:00",
		currency: "USD",
		cost_charged: "2.50",
		country: "Nigeria",
	},
	{
		id: "a1c2d3e4f5a68f9b5e473420",
		batch_id: null,
		verification_type: "aml_screening",
		status: "ERROR",
		name: "Vladimir putin",
		mode: "live",
		created_at: "2026-06-01T09:45:00",
		currency: "USD",
		cost_charged: "1.80",
	},
	{
		id: "b2c3d4e5f6a78f9b5e473421",
		batch_id: null,
		verification_type: "face_match",
		status: "FAILED",
		name: "john.doe@example.com",
		mode: "live",
		created_at: "2026-05-30T14:20:00",
		currency: "USD",
		cost_charged: "0.90",
		country: "Ghana",
	},
	{
		id: "c3d4e5f6a7b88f9b5e473422",
		batch_id: null,
		verification_type: "id_document",
		status: "SUCCESS",
		name: "Amara Okafor",
		mode: "live",
		created_at: "2026-05-28T11:05:00",
		currency: "USD",
		cost_charged: "1.20",
		country: "Nigeria",
	},
	{
		id: "d4e5f6a7b8c98f9b5e473423",
		batch_id: "batch-001",
		verification_type: "ng_nin_verification",
		status: "SUCCESS",
		name: "Chidi Eze",
		mode: "live",
		created_at: "2026-05-25T08:15:00",
		currency: "USD",
		cost_charged: "0.75",
		country: "Nigeria",
	},
	{
		id: "e5f6a7b8c9d08f9b5e473424",
		batch_id: null,
		verification_type: "aml_screening",
		status: "SUCCESS",
		name: "Sarah Johnson",
		mode: "live",
		created_at: "2026-05-22T16:40:00",
		currency: "USD",
		cost_charged: "1.80",
		country: "Kenya",
	},
	{
		id: "f6a7b8c9d0e18f9b5e473425",
		batch_id: null,
		verification_type: "kyb_screening",
		status: "FAILED",
		name: "Acme Holdings",
		mode: "live",
		created_at: "2026-05-20T13:25:00",
		currency: "USD",
		cost_charged: "2.50",
		country: "South Africa",
	},
	{
		id: "a7b8c9d0e1f28f9b5e473426",
		batch_id: null,
		verification_type: "face_match",
		status: "SUCCESS",
		name: "david.chen@verifyafrica.io",
		mode: "live",
		created_at: "2026-05-18T10:50:00",
		currency: "USD",
		cost_charged: "0.90",
		country: "Ghana",
	},
	{
		id: "b8c9d0e1f2a38f9b5e473427",
		batch_id: "batch-002",
		verification_type: "id_document",
		status: "ERROR",
		name: "Michael Okonkwo",
		mode: "live",
		created_at: "2026-05-15T07:35:00",
		currency: "USD",
		cost_charged: "1.20",
		country: "Nigeria",
	},
];

export const MOCK_BATCH_VERIFICATIONS: BatchVerificationReport[] = [
	{
		id: "batch-001-abc12345",
		status: "SUCCESS",
		total_count: 120,
		success_count: 115,
		failed_count: 5,
		created_at: "2026-06-01T08:00:00",
	},
	{
		id: "batch-002-def67890",
		status: "FAILED",
		total_count: 50,
		success_count: 32,
		failed_count: 18,
		created_at: "2026-05-28T14:30:00",
	},
	{
		id: "batch-003-ghi11223",
		status: "SUCCESS",
		total_count: 200,
		success_count: 198,
		failed_count: 2,
		created_at: "2026-05-20T09:15:00",
	},
	{
		id: "batch-004-jkl44556",
		status: "ERROR",
		total_count: 75,
		success_count: 40,
		failed_count: 35,
		created_at: "2026-05-12T16:45:00",
	},
	{
		id: "batch-005-mno77889",
		status: "SUCCESS",
		total_count: 30,
		success_count: 30,
		failed_count: 0,
		created_at: "2026-05-05T11:20:00",
	},
	{
		id: "batch-006-pqr99001",
		status: "SUCCESS",
		total_count: 88,
		success_count: 82,
		failed_count: 6,
		created_at: "2026-04-28T13:10:00",
	},
];

export function formatVerificationType(report: VerificationReport) {
	const formattedType = report.verification_type
		.replace(/_/g, " ")
		.replace(/\b\w/g, (char) => char.toUpperCase());

	if (
		report.verification_type === "mixed_verification" &&
		report.mixed_verification_name
	) {
		return `${formattedType}: ${report.mixed_verification_name}`;
	}

	return formattedType;
}

export function formatReportDate(dateString: string) {
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(dateString));
}

export function getVerificationTypes(reports: VerificationReport[]) {
	return Array.from(
		new Set(reports.map((report) => report.verification_type)),
	).sort();
}

export function getVerificationStatuses(reports: VerificationReport[]) {
	return Array.from(new Set(reports.map((report) => report.status))).sort();
}

export function getVerificationCountries(reports: VerificationReport[]) {
	return Array.from(
		new Set(
			reports
				.map((report) => report.country)
				.filter((country): country is string => Boolean(country)),
		),
	).sort();
}

export function filterVerifications(
	reports: VerificationReport[],
	filters: {
		verificationType: string;
		status: string;
		country: string;
	},
) {
	return reports.filter((report) => {
		const matchesType =
			filters.verificationType === "all" ||
			report.verification_type === filters.verificationType;
		const matchesStatus =
			filters.status === "all" || report.status === filters.status;
		const matchesCountry =
			filters.country === "all" || report.country === filters.country;

		return matchesType && matchesStatus && matchesCountry;
	});
}

export async function fetchVerifications(): Promise<VerificationReport[]> {
	await new Promise((resolve) => setTimeout(resolve, 600));
	return MOCK_VERIFICATIONS.map((report) => ({ ...report }));
}

export async function fetchBatchVerifications(): Promise<
	BatchVerificationReport[]
> {
	await new Promise((resolve) => setTimeout(resolve, 600));
	return MOCK_BATCH_VERIFICATIONS.map((report) => ({ ...report }));
}
