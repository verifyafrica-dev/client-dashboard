export const BALANCE = {
	amount: 8.3,
	currency: "USD",
} as const;

export const BILLING_INFO = {
	name: "VerifyAfrica",
	email: "info@verifyafrica.io",
	address: "—",
	city: "—",
	state: "—",
	postalCode: "—",
	country: "Cyprus",
	displayAddress: "--, --, Cyprus",
} as const;

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
	meta: {
		type: string;
		isCustom: boolean;
		journeyId: string | null;
		mixedVerificationId: string | null;
	};
};

export const TRANSACTIONS: Transaction[] = [
	{
		id: "1",
		reference: "a994b7cd28",
		date: "6/3/2026",
		dateTime: "June 3, 2026 at 10:12 AM",
		description: "Mixed verification",
		amount: -4.1,
		type: "debit",
		balanceBefore: 12.4,
		balanceAfter: 8.3,
		transactionId: "06a1fefe-2c26-7315-8000-a41b349f84cd",
		meta: {
			type: "mixed_verification",
			isCustom: true,
			journeyId: null,
			mixedVerificationId: "06a1fefd-ae92-74e8-8000-eabe105efa69",
		},
	},
	{
		id: "2",
		reference: "20f1a510a2",
		date: "6/2/2026",
		dateTime: "June 2, 2026 at 3:45 PM",
		description: "Verification",
		amount: -4.0,
		type: "debit",
		balanceBefore: 16.4,
		balanceAfter: 12.4,
		transactionId: "12b2fefa-3a27-8316-9000-b52c460g95de",
		meta: {
			type: "verification",
			isCustom: false,
			journeyId: "journey-abc-123",
			mixedVerificationId: null,
		},
	},
	{
		id: "3",
		reference: "cded54629d",
		date: "5/30/2026",
		dateTime: "May 30, 2026 at 9:00 AM",
		description: "Admin Credit",
		amount: 20.0,
		type: "credit",
		balanceBefore: 6.4,
		balanceAfter: 26.4,
		transactionId: "34c4gffc-5b48-9427-a111-d74e682h17fg",
		meta: {
			type: "admin_credit",
			isCustom: false,
			journeyId: null,
			mixedVerificationId: null,
		},
	},
	{
		id: "4",
		reference: "c8dde51b3a",
		date: "5/30/2026",
		dateTime: "May 30, 2026 at 8:30 AM",
		description: "Admin Credit",
		amount: 20.0,
		type: "credit",
		balanceBefore: -13.6,
		balanceAfter: 6.4,
		transactionId: "56e6hhhe-7c69-a638-b333-f96g804j39hi",
		meta: {
			type: "admin_credit",
			isCustom: false,
			journeyId: null,
			mixedVerificationId: null,
		},
	},
];

export const QUICK_AMOUNTS = [500, 1000, 2500, 5000, 10000] as const;

export const MIN_TOPUP = 300;
export const MAX_TOPUP = 50_000;

const moneyFormatter = new Intl.NumberFormat("en-US", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

function getCurrencyFormatter(currency: string) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export function formatMoney(amount: number) {
	return moneyFormatter.format(amount);
}

export function formatSignedAmount(amount: number, currency = BALANCE.currency) {
	const sign = amount < 0 ? "-" : "+";
	const formatted = getCurrencyFormatter(currency).format(Math.abs(amount));
	return `${sign}${formatted}`;
}
