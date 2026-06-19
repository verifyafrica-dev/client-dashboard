import { z } from "zod";

import type {
	PaginatedResponse,
	PaginationQuery,
	BillingInformation as TenantBillingInformation,
} from "../tenants/tenants.types";

export type BillingInformation = TenantBillingInformation;

export const BillingPaginationQuerySchema = z.object({
	offset: z.number().int().nonnegative().optional(),
	page_size: z.number().int().positive().optional(),
	format: z.enum(["json", "json-html"]).optional(),
});

export type BillingPaginationQuery = z.infer<
	typeof BillingPaginationQuerySchema
>;

export const WalletTransactionsQuerySchema =
	BillingPaginationQuerySchema.extend({
		from_date: z.string().optional(),
		to_date: z.string().optional(),
		tenant_id: z.string().optional(),
	});

export type WalletTransactionsQuery = z.infer<
	typeof WalletTransactionsQuerySchema
>;

export const WalletTenantQuerySchema = z.object({
	tenant_id: z.string(),
});

export type WalletTenantQuery = z.infer<typeof WalletTenantQuerySchema>;

export const BillingInformationListQuerySchema =
	BillingPaginationQuerySchema.extend({
		tenant_id: z.string().optional(),
	});

export type BillingInformationListQuery = z.infer<
	typeof BillingInformationListQuerySchema
>;

export const BillingInformationTenantQuerySchema = z.object({
	tenant_id: z.string(),
});

export type BillingInformationTenantQuery = z.infer<
	typeof BillingInformationTenantQuerySchema
>;

export type BillingListQuery = PaginationQuery;

export interface BillingInformationPayload {
	tenant?: string;
	billing_name?: string;
	billing_email?: string;
	billing_address?: string;
	billing_city?: string;
	billing_state?: string;
	billing_postal_code?: string;
	billing_country?: string;
	billing_plan?: string;
	status?: string;
}

export type BillingInformationCreatePayload = BillingInformationPayload;
export type BillingInformationUpdatePayload =
	Partial<BillingInformationPayload>;

export interface BillingPricing {
	id: string;
	billing_plan?: string;
	country?: string;
	price?: string;
	currency?: string;
	is_active?: boolean;
	created_at: string;
	updated_at: string;
	[key: string]: unknown;
}

export interface Invoice {
	id: string;
	invoice_id?: string;
	tenant?: string;
	description?: string;
	amount?: string;
	currency?: string;
	payment_status?: string;
	file_attachment?: string | null;
	created_at: string;
	due_at?: string | null;
	updated_at?: string;
	[key: string]: unknown;
}

export interface Wallet {
	balance: string;
	currency?: string;
	tenant?: string;
	[key: string]: unknown;
}

export interface WalletTransaction {
	id: string;
	type: "CREDIT" | "DEBIT" | string;
	amount: string;
	reference: string;
	reason: string;
	balance_before: string;
	balance_after: string;
	created_at: string;
	updated_at?: string;
	[key: string]: unknown;
}

export interface WalletFundingRequest {
	id: string;
	amount: string;
	currency?: string;
	status?: string;
	reason?: string;
	tenant?: string;
	created_at: string;
	updated_at?: string;
	[key: string]: unknown;
}

export interface WalletTopUpCreateSessionPayload {
	amount: number;
	currency?: string;
	success_url?: string;
	cancel_url?: string;
	metadata?: Record<string, unknown>;
}

export interface WalletTopUpCreateSessionResponse {
	session_id?: string;
	client_secret?: string;
	url?: string;
	[key: string]: unknown;
}

export interface WalletTopUpVerifyResponse {
	detail?: string;
	[key: string]: unknown;
}

export interface WalletAdminCreditsPayload {
	amount: number;
	reason: string;
	metadata?: Record<string, unknown>;
}

export interface WalletAdminCreditsResponse {
	detail?: string;
	wallet?: Wallet;
	[key: string]: unknown;
}

export type BillingInformationListResponse =
	PaginatedResponse<BillingInformation>;
export type BillingPricingListResponse = PaginatedResponse<BillingPricing>;
export type AllInvoicesListResponse = PaginatedResponse<Invoice>;
export type TenantInvoicesListResponse = PaginatedResponse<Invoice>;
export type WalletTransactionsListResponse =
	PaginatedResponse<WalletTransaction>;
export type WalletFundingRequestsListResponse =
	PaginatedResponse<WalletFundingRequest>;
