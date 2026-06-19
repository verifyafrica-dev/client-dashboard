import { DownloadSimpleIcon, LightningIcon } from "@phosphor-icons/react";
import { type ComponentProps, useRef, useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Separator } from "#/components/ui/separator";
import { generatePDFWithColorSupport } from "#/lib/pdfHelpers";
import { cn } from "#/lib/utils.ts";
import { formatSignedAmount, type Transaction } from "../-data";

export function TransactionDetailsDialog({
	open,
	onOpenChange,
	transaction,
}: ComponentProps<typeof Dialog> & { transaction: Transaction | null }) {
	const receiptRef = useRef<HTMLDivElement>(null);
	const [isDownloading, setIsDownloading] = useState(false);

	async function handleDownloadReceipt() {
		if (!transaction || !receiptRef.current) return;

		setIsDownloading(true);
		try {
			await generatePDFWithColorSupport(receiptRef, {
				filename: `receipt-${transaction.reference}.pdf`,
			});
		} finally {
			setIsDownloading(false);
		}
	}

	if (!transaction) return null;

	const isDebit = transaction.type === "debit";
	const formattedAmount = formatSignedAmount(
		transaction.amount,
		transaction.currency,
	);

	const metadataFields = getMetadataFields(transaction.meta.metadata);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<div ref={receiptRef} className="flex flex-col gap-6 bg-popover">
					<DialogHeader>
						<div className="flex items-start gap-3">
							<LightningIcon
								className={cn(
									"mt-0.5 size-5",
									isDebit ? "text-red-500" : "text-emerald-600",
								)}
								weight="duotone"
							/>
							<div className="flex flex-col gap-2">
								<DialogTitle>Transaction Details</DialogTitle>
								<Badge
									variant="outline"
									className={cn(
										"w-fit uppercase",
										isDebit
											? "border-red-200 bg-red-50 text-red-700"
											: "border-emerald-200 bg-emerald-50 text-emerald-700",
									)}
								>
									{transaction.type}
								</Badge>
							</div>
						</div>
					</DialogHeader>

					<div className="rounded-lg border px-6 py-8 text-center">
						<p className="text-sm text-muted-foreground">Amount</p>
						<p
							className={cn(
								"mt-1 text-4xl font-semibold tracking-tight",
								isDebit ? "text-red-600" : "text-emerald-600",
							)}
						>
							{formattedAmount}
						</p>
					</div>

					<div className="flex flex-col gap-4">
						<div>
							<h3 className="mb-2 font-medium">Transaction Information</h3>
							<div className="space-y-1 text-sm">
								<DetailRow
									label="Reference Number"
									value={transaction.reference}
								/>
								<DetailRow label="Date & Time" value={transaction.dateTime} />
								<DetailRow
									label="Description"
									value={transaction.description}
								/>
								<DetailRow
									label="Transaction ID"
									value={transaction.transactionId}
									valueClassName="max-w-[220px] break-all font-mono text-xs"
								/>
							</div>
						</div>

						<Separator />

						<div>
							<h3 className="mb-2 font-medium">Balance Impact</h3>
							<DetailRow
								label="Balance Before"
								value={formatSignedAmount(
									transaction.balanceBefore,
									transaction.currency,
								)}
							/>
							<DetailRow
								label="Transaction Amount"
								value={formattedAmount}
								valueClassName={isDebit ? "text-red-600" : "text-emerald-600"}
							/>
							<DetailRow
								label="Balance After"
								value={formatSignedAmount(
									transaction.balanceAfter,
									transaction.currency,
								)}
								valueClassName="font-semibold text-primary"
							/>
						</div>

						{metadataFields.length > 0 && (
							<>
								<Separator />
								<div>
									<h3 className="mb-2 font-medium">Additional Information</h3>
									{metadataFields.map(([key, value]) => (
										<DetailRow
											key={key}
											label={formatMetadataLabel(key)}
											value={formatMetaValue(value)}
											valueClassName="max-w-[220px] break-all font-mono text-xs"
										/>
									))}
								</div>
							</>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						className="cursor-pointer"
						disabled={isDownloading}
						onClick={handleDownloadReceipt}
					>
						<DownloadSimpleIcon className="size-4" />
						{isDownloading ? "Downloading..." : "Download Receipt"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function DetailRow({
	label,
	value,
	valueClassName,
}: {
	label: string;
	value: string;
	valueClassName?: string;
}) {
	return (
		<div className="flex items-start justify-between gap-4 py-2 text-sm">
			<span className="text-muted-foreground">{label}</span>
			<span className={cn("text-right font-medium", valueClassName)}>
				{value}
			</span>
		</div>
	);
}

function formatMetadataLabel(key: string) {
	return key
		.replaceAll("_", " ")
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatMetaValue(value: unknown) {
	if (value === null || value === undefined || value === "") {
		return "—";
	}

	if (typeof value === "boolean") {
		return value ? "true" : "false";
	}

	return String(value);
}

function getMetadataFields(metadata: unknown): Array<[string, unknown]> {
	if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
		return [];
	}

	return Object.entries(metadata as Record<string, unknown>);
}
