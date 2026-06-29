import {
	VerificationStatusSchema,
	VerificationTypeSchema,
} from "#/api/http/v1/verifications/verifications.types";
import type {
	VerificationBatchListQuery,
	VerificationListQuery,
} from "#/api/http/v2/verifications/verifications.types";

export const ReportsFiltersFormSchema = {
	search: "",
	verificationType: "all",
	status: "all",
	country: "all",
} as const;

export type ReportsFiltersFormValues = {
	search: string;
	verificationType: string;
	status: string;
	country: string;
};

export type ReportsListFilterScope = "requests" | "batches";

type BuildReportsListQueryOptions = {
	page: number;
	perPage: number;
	scope: ReportsListFilterScope;
	isTest?: boolean;
};

function appendOptionalString(
	query: Record<string, unknown>,
	key: string,
	value: string,
	allValue = "all",
) {
	const trimmedValue = value.trim();
	if (trimmedValue && trimmedValue !== allValue) {
		query[key] = trimmedValue;
	}
}

export function buildReportsListQuery(
	filters: ReportsFiltersFormValues,
	options: BuildReportsListQueryOptions,
): VerificationListQuery | VerificationBatchListQuery {
	const query: Record<string, unknown> = {
		page: options.page,
		per_page: options.perPage,
		is_test: options.isTest ?? false,
	};

	appendOptionalString(query, "search", filters.search);

	if (options.scope === "batches") {
		appendOptionalString(query, "status", filters.status);
		return query as VerificationBatchListQuery;
	}

	query.has_batch = false;
	appendOptionalString(query, "status", filters.status);
	appendOptionalString(query, "verification_type", filters.verificationType);
	appendOptionalString(query, "country", filters.country);

	return query as VerificationListQuery;
}

export const REPORTS_VERIFICATION_TYPES = VerificationTypeSchema.options;
export const REPORTS_VERIFICATION_STATUSES = VerificationStatusSchema.options;

export function formatVerificationTypeLabel(type: string) {
	return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
