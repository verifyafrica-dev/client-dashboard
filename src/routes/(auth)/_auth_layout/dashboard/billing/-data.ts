import { subDays } from "date-fns";
import type { DateRange } from "react-day-picker";

import type {
	BillingInformation,
	Invoice,
} from "#/api/http/v1/billing/billing.types";
import type { WalletTransaction } from "#/api/http/v1/wallet/wallet.types";

export type TransactionType = "debit" | "credit";

export type Transaction = {
	id: string;
	reference: string;
	date: string;
	dateTime: string;
	description: string;
	amount: number;
	type: TransactionType;
	balanceBefore: number;
	balanceAfter: number;
	transactionId: string;
	currency: string;
	meta: Record<string, unknown>;
};

export type ExportDurationPreset =
	| "custom"
	| "7d"
	| "14d"
	| "30d"
	| "90d"
	| "alltime";

export const EXPORT_DURATION_OPTIONS: {
	value: ExportDurationPreset;
	label: string;
}[] = [
	{ value: "custom", label: "Custom" },
	{ value: "7d", label: "Last 7 days" },
	{ value: "14d", label: "Last 14 days" },
	{ value: "30d", label: "Last 30 days" },
	{ value: "90d", label: "Last 90 days" },
	{ value: "alltime", label: "All time" },
];

export const TRANSACTIONS_PAGE_SIZE = 10;
export const INVOICES_PAGE_SIZE = 10;

const moneyFormatter = new Intl.NumberFormat("en-US", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "numeric",
	day: "numeric",
	year: "numeric",
});

const longDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
	month: "long",
	day: "numeric",
	year: "numeric",
	hour: "numeric",
	minute: "2-digit",
});

const invoiceDateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
});

const isoDateFormatter = new Intl.DateTimeFormat("en-CA", {
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

const EXPORT_DURATION_DAYS: Record<
	Exclude<ExportDurationPreset, "custom" | "alltime">,
	number
> = {
	"7d": 7,
	"14d": 14,
	"30d": 30,
	"90d": 90,
};

function getCurrencyFormatter(currency: string) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

function startOfDay(date: Date) {
	const normalized = new Date(date);
	normalized.setHours(0, 0, 0, 0);
	return normalized;
}

export function formatMoney(amount: number) {
	return moneyFormatter.format(amount);
}

export function formatSignedAmount(amount: number, currency = "USD") {
	const sign = amount < 0 ? "-" : "+";
	const formatted = getCurrencyFormatter(currency).format(Math.abs(amount));
	return `${sign}${formatted}`;
}

export function formatIsoDate(date: Date) {
	return isoDateFormatter.format(date);
}

export function formatBillingDisplayAddress(
	billingInfo: BillingInformation | undefined,
) {
	if (!billingInfo) {
		return "No billing address on file";
	}

	const parts = [
		billingInfo.billing_address,
		billingInfo.billing_city,
		billingInfo.billing_state,
		billingInfo.billing_postal_code,
		billingInfo.billing_country,
	].filter(Boolean);

	return parts.length > 0 ? parts.join(", ") : "No billing address on file";
}

export function mapWalletTransaction(
	transaction: WalletTransaction,
	currency = "USD",
): Transaction {
	const isDebit = transaction.type.toUpperCase() === "DEBIT";
	const amount = Number.parseFloat(transaction.amount);
	const signedAmount = isDebit ? -Math.abs(amount) : Math.abs(amount);
	const createdAt = new Date(transaction.created_at);

	const {
		id,
		reference,
		reason,
		balance_before,
		balance_after,
		type,
		...meta
	} = transaction;

	return {
		id,
		reference,
		date: shortDateFormatter.format(createdAt),
		dateTime: longDateTimeFormatter.format(createdAt),
		description: reason,
		amount: signedAmount,
		type: isDebit ? "debit" : "credit",
		balanceBefore: Number.parseFloat(balance_before),
		balanceAfter: Number.parseFloat(balance_after),
		transactionId: id,
		currency,
		meta: {
			type,
			...meta,
		},
	};
}

export function formatInvoiceDate(value: string | null | undefined) {
	if (!value) {
		return "—";
	}

	return invoiceDateFormatter.format(new Date(value));
}

export function formatInvoiceAmount(
	amount: string | undefined,
	currency = "USD",
) {
	if (!amount) {
		return "—";
	}

	return getCurrencyFormatter(currency).format(Number.parseFloat(amount));
}

export function getDefaultExportDateRange(
	_accountCreatedAt: Date,
	today = new Date(),
): DateRange {
	return {
		from: startOfDay(subDays(today, 7)),
		to: startOfDay(today),
	};
}

export function getExportDateRangeForPreset(
	preset: ExportDurationPreset,
	accountCreatedAt: Date,
	today = new Date(),
): DateRange {
	const endDate = startOfDay(today);

	if (preset === "alltime") {
		return {
			from: startOfDay(accountCreatedAt),
			to: endDate,
		};
	}

	if (preset === "custom") {
		return getDefaultExportDateRange(accountCreatedAt, today);
	}

	return {
		from: startOfDay(subDays(today, EXPORT_DURATION_DAYS[preset])),
		to: endDate,
	};
}

export function getExportQueryDates(range: DateRange | undefined) {
	if (!range?.from || !range?.to) {
		return undefined;
	}

	return {
		from_date: formatIsoDate(range.from),
		to_date: formatIsoDate(range.to),
	};
}

function escapeCsvValue(value: string) {
	if (/[",\n]/.test(value)) {
		return `"${value.replaceAll('"', '""')}"`;
	}

	return value;
}

export function downloadTransactionsCsv(
	transactions: WalletTransaction[],
	filename: string,
	currency = "USD",
) {
	const headers = [
		"Reference",
		"Date",
		"Description",
		"Amount",
		"Type",
		"Balance Before",
		"Balance After",
	];

	const rows = transactions.map((transaction) => {
		const mapped = mapWalletTransaction(transaction, currency);

		return [
			mapped.reference,
			mapped.dateTime,
			mapped.description,
			mapped.amount.toFixed(2),
			mapped.type,
			mapped.balanceBefore.toFixed(2),
			mapped.balanceAfter.toFixed(2),
		];
	});

	const csv = [headers, ...rows]
		.map((row) => row.map((value) => escapeCsvValue(String(value))).join(","))
		.join("\n");

	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}

export function getInvoiceFilename(invoice: Invoice) {
	return invoice.invoice_id ?? invoice.id;
}

export const TOP_UP_DEFAULT_MIN_AMOUNT = 300;
export const TOP_UP_EXCLUDED_USER_MIN_AMOUNT = 30;
export const TOP_UP_MAX_AMOUNT = 50_000;

export const TOP_UP_EXCLUDED_USER_EMAILS = [
	"info@cjsolutionsltd.com",
	"kenovienadu@gmail.com",
] as const;

export const TOP_UP_SUGGESTED_AMOUNTS = {
	default: [500, 1000, 2500, 5000, 10_000],
	excluded: [50, 100, 250, 500, 1000],
} as const;

export function isTopUpExcludedUser(email?: string | null) {
	return TOP_UP_EXCLUDED_USER_EMAILS.includes(
		email as (typeof TOP_UP_EXCLUDED_USER_EMAILS)[number],
	);
}

export function getTopUpMinAmount(email?: string | null) {
	return isTopUpExcludedUser(email)
		? TOP_UP_EXCLUDED_USER_MIN_AMOUNT
		: TOP_UP_DEFAULT_MIN_AMOUNT;
}

export function getTopUpSuggestedAmounts(email?: string | null) {
	return isTopUpExcludedUser(email)
		? TOP_UP_SUGGESTED_AMOUNTS.excluded
		: TOP_UP_SUGGESTED_AMOUNTS.default;
}

export function formatTopUpAmountLabel(amount: number) {
	return `$${amount.toLocaleString()}`;
}
