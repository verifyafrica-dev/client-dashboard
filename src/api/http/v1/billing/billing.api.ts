import $http from "../../xhr";

import type {
	AllInvoicesListResponse,
	BillingInformation,
	BillingInformationCreatePayload,
	BillingInformationListQuery,
	BillingInformationListResponse,
	BillingInformationTenantQuery,
	BillingInformationUpdatePayload,
	BillingPricing,
	BillingPricingListResponse,
	Invoice,
	TenantInvoicesListResponse,
	Wallet,
	WalletAdminCreditsPayload,
	WalletAdminCreditsResponse,
	WalletFundingRequestsListResponse,
	WalletTenantQuery,
	WalletTopUpCreateSessionPayload,
	WalletTopUpCreateSessionResponse,
	WalletTopUpVerifyResponse,
	WalletTransactionsListResponse,
	WalletTransactionsQuery,
} from "./billing.types";

const BILLING_ENDPOINTS = {
	billingInformation: "/billing/billing-information/",
	billingPricing: "/billing/billing-pricing/",
	billingPricingDetail: (id: string) => `/billing/billing-pricing/${id}/`,
	allInvoices: "/billing/all-invoices/",
	allInvoiceDetail: (id: string) => `/billing/all-invoices/${id}/`,
	invoicesByTenant: (tenantId: string) => `/billing/invoices/${tenantId}/`,
	walletBalance: "/wallet/balance/",
	walletFundingRequests: "/wallet/funding-requests/",
	walletTransactions: "/wallet/transactions/",
	walletTopUpCreateSession: (tenantId: string) =>
		`/wallet/${tenantId}/top-up/create-session/`,
	walletTopUpVerify: (tenantId: string) => `/wallet/${tenantId}/top-up/verify/`,
	walletAdminCredits: (tenantId: string) =>
		`/wallet/admin/${tenantId}/credits/`,
} as const;

export const BILLING_API = {
	BILLING_INFORMATION_LIST: async (params?: BillingInformationListQuery) =>
		await $http
			.get<BillingInformationListResponse>(
				BILLING_ENDPOINTS.billingInformation,
				{
					params,
				},
			)
			.then((res) => res.data),

	BILLING_INFORMATION_CREATE: async (data: BillingInformationCreatePayload) =>
		await $http
			.post<BillingInformation>(BILLING_ENDPOINTS.billingInformation, data)
			.then((res) => res.data),

	BILLING_INFORMATION_UPDATE: async (
		params: BillingInformationTenantQuery,
		data: BillingInformationUpdatePayload,
	) =>
		await $http
			.put<BillingInformation>(BILLING_ENDPOINTS.billingInformation, data, {
				params,
			})
			.then((res) => res.data),

	BILLING_INFORMATION_PARTIAL_UPDATE: async (
		params: BillingInformationTenantQuery,
		data: BillingInformationUpdatePayload,
	) =>
		await $http
			.patch<BillingInformation>(BILLING_ENDPOINTS.billingInformation, data, {
				params,
			})
			.then((res) => res.data),

	BILLING_INFORMATION_DELETE: async (params: BillingInformationTenantQuery) =>
		await $http
			.delete(BILLING_ENDPOINTS.billingInformation, { params })
			.then((res) => res.data),

	BILLING_PRICING_LIST: async (params?: {
		offset?: number;
		page_size?: number;
	}) =>
		await $http
			.get<BillingPricingListResponse>(BILLING_ENDPOINTS.billingPricing, {
				params,
			})
			.then((res) => res.data),

	BILLING_PRICING_DETAIL: async (id: string) =>
		await $http
			.get<BillingPricing>(BILLING_ENDPOINTS.billingPricingDetail(id))
			.then((res) => res.data),

	BILLING_PRICING_CREATE: async (data: Partial<BillingPricing>) =>
		await $http
			.post<BillingPricing>(BILLING_ENDPOINTS.billingPricing, data)
			.then((res) => res.data),

	BILLING_PRICING_UPDATE: async (id: string, data: Partial<BillingPricing>) =>
		await $http
			.put<BillingPricing>(BILLING_ENDPOINTS.billingPricingDetail(id), data)
			.then((res) => res.data),

	BILLING_PRICING_PARTIAL_UPDATE: async (
		id: string,
		data: Partial<BillingPricing>,
	) =>
		await $http
			.patch<BillingPricing>(BILLING_ENDPOINTS.billingPricingDetail(id), data)
			.then((res) => res.data),

	BILLING_PRICING_DELETE: async (id: string) =>
		await $http
			.delete(BILLING_ENDPOINTS.billingPricingDetail(id))
			.then((res) => res.data),

	ALL_INVOICES_LIST: async (params?: { offset?: number; page_size?: number }) =>
		await $http
			.get<AllInvoicesListResponse>(BILLING_ENDPOINTS.allInvoices, { params })
			.then((res) => res.data),

	ALL_INVOICE_DETAIL: async (id: string) =>
		await $http
			.get<Invoice>(BILLING_ENDPOINTS.allInvoiceDetail(id))
			.then((res) => res.data),

	INVOICES_BY_TENANT: async (
		tenantId: string,
		params?: { offset?: number; page_size?: number },
	) =>
		await $http
			.get<TenantInvoicesListResponse>(
				BILLING_ENDPOINTS.invoicesByTenant(tenantId),
				{
					params,
				},
			)
			.then((res) => res.data),

	WALLET_BALANCE: async (params: WalletTenantQuery) =>
		await $http
			.get<Wallet>(BILLING_ENDPOINTS.walletBalance, { params })
			.then((res) => res.data),

	WALLET_TRANSACTIONS: async (params?: WalletTransactionsQuery) =>
		await $http
			.get<WalletTransactionsListResponse>(
				BILLING_ENDPOINTS.walletTransactions,
				{
					params,
				},
			)
			.then((res) => res.data),

	WALLET_TRANSACTIONS_EXPORT: async (params?: WalletTransactionsQuery) => {
		const pageSize = 100;
		let offset = 0;
		const results: WalletTransactionsListResponse["results"] = [];

		while (true) {
			const response = await BILLING_API.WALLET_TRANSACTIONS({
				...params,
				offset,
				page_size: pageSize,
			});

			results.push(...response.results);

			if (!response.next) {
				break;
			}

			offset += pageSize;
		}

		return results;
	},

	WALLET_FUNDING_REQUESTS: async (params?: {
		offset?: number;
		page_size?: number;
	}) =>
		await $http
			.get<WalletFundingRequestsListResponse>(
				BILLING_ENDPOINTS.walletFundingRequests,
				{ params },
			)
			.then((res) => res.data),

	WALLET_TOP_UP_CREATE_SESSION: async (
		tenantId: string,
		data: WalletTopUpCreateSessionPayload,
	) =>
		await $http
			.post<WalletTopUpCreateSessionResponse>(
				BILLING_ENDPOINTS.walletTopUpCreateSession(tenantId),
				data,
			)
			.then((res) => res.data),

	WALLET_TOP_UP_VERIFY: async (tenantId: string) =>
		await $http
			.get<WalletTopUpVerifyResponse>(
				BILLING_ENDPOINTS.walletTopUpVerify(tenantId),
			)
			.then((res) => res.data),

	WALLET_ADMIN_CREDITS: async (
		tenantId: string,
		data: WalletAdminCreditsPayload,
	) =>
		await $http
			.post<WalletAdminCreditsResponse>(
				BILLING_ENDPOINTS.walletAdminCredits(tenantId),
				data,
			)
			.then((res) => res.data),
};
