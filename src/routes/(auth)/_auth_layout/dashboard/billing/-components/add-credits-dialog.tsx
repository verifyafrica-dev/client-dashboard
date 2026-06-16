import { InfoIcon, WalletIcon } from "@phosphor-icons/react";
import { type ComponentProps, useEffect, useState } from "react";
import { Alert, AlertDescription } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { MAX_TOPUP, MIN_TOPUP, QUICK_AMOUNTS } from "../-data";

export function AddCreditsDialog({
	open,
	onOpenChange,
}: ComponentProps<typeof Dialog>) {
	const [amount, setAmount] = useState("");

	const numericAmount = Number.parseFloat(amount.replace(/,/g, ""));
	const isValidAmount =
		!Number.isNaN(numericAmount) &&
		numericAmount >= MIN_TOPUP &&
		numericAmount <= MAX_TOPUP;

	useEffect(() => {
		if (!open) setAmount("");
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<WalletIcon className="size-5 text-primary" weight="duotone" />
						Add Credits
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<div className="space-y-2">
						<Label htmlFor="topup-amount">Amount</Label>
						<div className="relative">
							<span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
								$
							</span>
							<Input
								id="topup-amount"
								type="text"
								inputMode="decimal"
								placeholder="0.00"
								value={amount}
								onChange={(event) => setAmount(event.target.value)}
								className="pl-7"
							/>
						</div>
						<p className="text-xs text-muted-foreground">
							Enter amount between ${MIN_TOPUP.toLocaleString()} - $
							{MAX_TOPUP.toLocaleString()}
						</p>
					</div>

					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">Quick select:</p>
						<div className="flex flex-wrap gap-2">
							{QUICK_AMOUNTS.map((quickAmount) => (
								<Button
									key={quickAmount}
									type="button"
									variant="outline"
									size="sm"
									className="cursor-pointer"
									onClick={() => setAmount(quickAmount.toString())}
								>
									${quickAmount.toLocaleString()}
								</Button>
							))}
						</div>
					</div>

					<Alert className="border-sky-200 bg-sky-50 text-sky-900">
						<InfoIcon className="text-sky-600" />
						<AlertDescription className="text-sky-800">
							A secure payment window will open. Credits will be added
							immediately after payment confirmation.
						</AlertDescription>
					</Alert>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="ghost"
						className="cursor-pointer text-primary"
						onClick={() => onOpenChange?.(false)}
					>
						Cancel
					</Button>
					<Button type="button" disabled={!isValidAmount} className="cursor-pointer">
						Continue to Payment
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
