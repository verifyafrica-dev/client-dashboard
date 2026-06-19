import { CurrencyDollarIcon, WalletIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { type ComponentProps, useEffect } from "react";
import { z } from "zod";

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
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	formatTopUpAmountLabel,
	getTopUpMinAmount,
	getTopUpSuggestedAmounts,
	TOP_UP_MAX_AMOUNT,
} from "../-data";

type TopUpFormValues = {
	amount: string;
};

type AddCreditsDialogProps = ComponentProps<typeof Dialog> & {
	userEmail?: string;
};

function createTopUpFormSchema(minAmount: number) {
	return z.object({
		amount: z
			.string()
			.trim()
			.min(1, "Amount is required")
			.refine((value) => /^\d*\.?\d+$/.test(value), {
				message: "Please enter a valid amount",
			})
			.refine((value) => Number.parseFloat(value) >= minAmount, {
				message: `Minimum top-up amount is $${minAmount.toLocaleString()}`,
			})
			.refine((value) => Number.parseFloat(value) <= TOP_UP_MAX_AMOUNT, {
				message: `Maximum top-up amount is $${TOP_UP_MAX_AMOUNT.toLocaleString()}`,
			}),
	});
}

export function AddCreditsDialog({
	open,
	onOpenChange,
	userEmail,
}: AddCreditsDialogProps) {
	const minAmount = getTopUpMinAmount(userEmail);
	const suggestedAmounts = getTopUpSuggestedAmounts(userEmail);
	const TopUpFormSchema = createTopUpFormSchema(minAmount);

	const form = useForm({
		defaultValues: {
			amount: "",
		} satisfies TopUpFormValues,
		validators: {
			onSubmit: TopUpFormSchema,
		},
		onSubmit: () => {
			// Payment flow will be wired up separately.
		},
	});

	useEffect(() => {
		if (!open) {
			return;
		}

		form.reset();
	}, [open, form]);

	const amountHelperText = `Enter amount between ${formatTopUpAmountLabel(minAmount)} and ${formatTopUpAmountLabel(TOP_UP_MAX_AMOUNT)}`;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<WalletIcon className="size-5 text-primary" weight="duotone" />
						Add Credits
					</DialogTitle>
				</DialogHeader>

				<form
					className="flex flex-col gap-4"
					onSubmit={(event) => {
						event.preventDefault();
						form.handleSubmit();
					}}
				>
					<FieldGroup>
						<form.Field name="amount">
							{(field) => (
								<Field
									className="flex flex-col gap-2"
									data-invalid={field.state.meta.errors.length > 0}
								>
									<FieldLabel htmlFor="top-up-amount">Amount</FieldLabel>
									<div className="relative">
										<CurrencyDollarIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											id="top-up-amount"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) => {
												const value = event.target.value;
												if (value === "" || /^\d*\.?\d*$/.test(value)) {
													field.handleChange(value);
												}
											}}
											placeholder="0.00"
											className="pl-10"
											autoFocus
											aria-invalid={field.state.meta.errors.length > 0}
										/>
									</div>
									{field.state.meta.errors.length > 0 ? (
										<FieldError errors={field.state.meta.errors} />
									) : (
										<p className="text-sm text-muted-foreground">
											{amountHelperText}
										</p>
									)}
								</Field>
							)}
						</form.Field>
					</FieldGroup>

					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">Quick select</p>
						<div className="flex flex-wrap gap-2">
							{suggestedAmounts.map((suggestedAmount) => (
								<Button
									key={suggestedAmount}
									type="button"
									variant="outline"
									size="sm"
									className="cursor-pointer"
									onClick={() => form.setFieldValue("amount", String(suggestedAmount))}
								>
									{formatTopUpAmountLabel(suggestedAmount)}
								</Button>
							))}
						</div>
					</div>

					<Alert>
						<AlertDescription>
							A secure payment window will open. Credits are added after payment
							confirmation.
						</AlertDescription>
					</Alert>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							className="cursor-pointer"
							onClick={() => onOpenChange?.(false)}
						>
							Cancel
						</Button>
						<Button type="submit" className="cursor-pointer">
							Continue to Payment
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
