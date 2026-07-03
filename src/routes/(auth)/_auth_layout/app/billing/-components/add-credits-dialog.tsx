import { CurrencyDollarIcon, WalletIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { type ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
	BILLING_V2_QUERY_KEYS,
} from "#/api/http/v2/billing/billing.hooks";
import {
	useTopUpCreateSessionV2Mutation,
	WALLET_V2_QUERY_KEYS,
} from "#/api/http/v2/wallet/wallet.hooks";
import { WALLET_V2_API } from "#/api/http/v2/wallet/wallet.api";
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
import { StripeCheckoutDialog } from "./stripe-checkout-dialog";

const TOP_UP_VERIFY_INTERVAL_MS = 3_000;
const TOP_UP_VERIFY_TIMEOUT_MS = 300_000;

type TopUpFormValues = {
	amount: string;
};

type AddCreditsDialogProps = ComponentProps<typeof Dialog> & {
	userEmail?: string;
	tenantId?: string;
	onSuccess?: () => void;
};

function createTopUpFormSchema(minAmount: number) {
	return z.object({
		amount: z
			.string()
			.trim()
			.min(1, "Amount is required")
			.refine((value) => /^\d+$/.test(value), {
				message: "Please enter a whole dollar amount",
			})
			.refine((value) => Number.parseInt(value, 10) >= minAmount, {
				message: `Minimum top-up amount is $${minAmount.toLocaleString()}`,
			})
			.refine((value) => Number.parseInt(value, 10) <= TOP_UP_MAX_AMOUNT, {
				message: `Maximum top-up amount is $${TOP_UP_MAX_AMOUNT.toLocaleString()}`,
			}),
	});
}

function isTopUpComplete(
	verifyAmount: string | number | null | undefined,
	requestedAmount: number,
	status?: string,
) {
	if (status === "success" || status === "already_credited") {
		return true;
	}

	if (verifyAmount == null) {
		return false;
	}

	return Number.parseFloat(String(verifyAmount)) === requestedAmount;
}

export function AddCreditsDialog({
	open,
	onOpenChange,
	userEmail,
	tenantId,
	onSuccess,
}: AddCreditsDialogProps) {
	const queryClient = useQueryClient();
	const minAmount = getTopUpMinAmount(userEmail);
	const suggestedAmounts = getTopUpSuggestedAmounts(userEmail);
	const TopUpFormSchema = createTopUpFormSchema(minAmount);
	const createSessionMutation = useTopUpCreateSessionV2Mutation();

	const [submitError, setSubmitError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showStripeCheckout, setShowStripeCheckout] = useState(false);
	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearVerificationTimers = useCallback(() => {
		if (pollIntervalRef.current) {
			clearInterval(pollIntervalRef.current);
			pollIntervalRef.current = null;
		}

		if (pollTimeoutRef.current) {
			clearTimeout(pollTimeoutRef.current);
			pollTimeoutRef.current = null;
		}
	}, []);

	const resetPaymentState = useCallback(() => {
		clearVerificationTimers();
		setSubmitError(null);
		setIsSubmitting(false);
		setShowStripeCheckout(false);
		setClientSecret(null);
		createSessionMutation.reset();
	}, [clearVerificationTimers, createSessionMutation]);

	useEffect(() => {
		return () => {
			clearVerificationTimers();
		};
	}, [clearVerificationTimers]);

	const form = useForm({
		defaultValues: {
			amount: "",
		} satisfies TopUpFormValues,
		validators: {
			onSubmit: TopUpFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (!tenantId) {
				toast.error("Tenant information is unavailable");
				return;
			}

			const requestedAmount = Number.parseInt(value.amount, 10);
			setSubmitError(null);
			setIsSubmitting(true);

			try {
				const session = await createSessionMutation.mutateAsync({
					tenantId,
					payload: {
						amount: requestedAmount,
						currency: "USD",
					},
				});

				if (!session.client_secret || !session.session_id) {
					throw new Error("Failed to retrieve checkout session");
				}

				setClientSecret(session.client_secret);
				setShowStripeCheckout(true);
				startPaymentVerification(session.session_id, requestedAmount);
			} catch (error) {
				const message =
					error instanceof Error
						? error.message
						: "Failed to process top-up. Please try again.";
				setSubmitError(message);
				toast.error(message);
				setIsSubmitting(false);
			}
		},
	});

	useEffect(() => {
		if (open) {
			form.reset();
			return;
		}

		resetPaymentState();
	}, [open, form, resetPaymentState]);

	const startPaymentVerification = (sessionId: string, requestedAmount: number) => {
		if (!tenantId) {
			return;
		}

		clearVerificationTimers();

		pollIntervalRef.current = setInterval(() => {
			void (async () => {
				try {
					const response = await WALLET_V2_API.TOP_UP_VERIFY(
						tenantId,
						sessionId,
					);

					if (isTopUpComplete(response.amount, requestedAmount, response.status)) {
						clearVerificationTimers();
						setShowStripeCheckout(false);
						toast.success(
							`Successfully added $${requestedAmount.toLocaleString()} to your account.`,
						);
						setIsSubmitting(false);
						onOpenChange?.(false);

						await Promise.all([
							queryClient.invalidateQueries({
								queryKey: WALLET_V2_QUERY_KEYS.balance(tenantId),
							}),
							queryClient.invalidateQueries({
								queryKey: WALLET_V2_QUERY_KEYS.all,
							}),
							queryClient.invalidateQueries({
								queryKey: BILLING_V2_QUERY_KEYS.all,
							}),
						]);

						onSuccess?.();
						return;
					}

					if (response.status === "failed") {
						clearVerificationTimers();
						setShowStripeCheckout(false);
						setIsSubmitting(false);
						toast.error("Payment was not completed. Please try again.");
					}
				} catch {
					clearVerificationTimers();
					setShowStripeCheckout(false);
					setIsSubmitting(false);
					toast.error("Payment verification failed. Please try again.");
				}
			})();
		}, TOP_UP_VERIFY_INTERVAL_MS);

		pollTimeoutRef.current = setTimeout(() => {
			clearVerificationTimers();
			setShowStripeCheckout(false);
			setIsSubmitting(false);
			toast.error(
				"Payment verification timed out. Please check your account balance.",
			);
		}, TOP_UP_VERIFY_TIMEOUT_MS);
	};

	const handleStripeCheckoutClose = () => {
		clearVerificationTimers();
		setShowStripeCheckout(false);
		setClientSecret(null);

		if (isSubmitting) {
			setSubmitError("Payment was not completed. Please try again.");
			toast.error("Payment was not completed. Please try again.");
		}

		setIsSubmitting(false);
	};

	const amountHelperText = `Enter a whole dollar amount between ${formatTopUpAmountLabel(minAmount)} and ${formatTopUpAmountLabel(TOP_UP_MAX_AMOUNT)}`;

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={(nextOpen) => {
					if (isSubmitting) {
						return;
					}

					onOpenChange?.(nextOpen);
				}}
			>
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
							void form.handleSubmit();
						}}
					>
						<FieldGroup>
							<form.Field name="amount">
								{(field) => (
									<Field
										className="flex flex-col gap-2"
										data-invalid={
											field.state.meta.errors.length > 0 || Boolean(submitError)
										}
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
													if (value === "" || /^\d+$/.test(value)) {
														field.handleChange(value);
														if (submitError) {
															setSubmitError(null);
														}
													}
												}}
												placeholder="500"
												className="pl-10"
												autoFocus
												disabled={isSubmitting}
												aria-invalid={
													field.state.meta.errors.length > 0 ||
													Boolean(submitError)
												}
											/>
										</div>
										{field.state.meta.errors.length > 0 ? (
											<FieldError errors={field.state.meta.errors} />
										) : submitError ? (
											<p className="text-sm text-destructive">{submitError}</p>
										) : (
											<p className="text-sm text-muted-foreground">
												{amountHelperText}
											</p>
										)}
									</Field>
								)}
							</form.Field>
						</FieldGroup>

						<div className="space-y-1.5">
							<p className="text-sm text-muted-foreground">Quick select</p>
							<div className="flex flex-wrap gap-2">
								{suggestedAmounts.map((suggestedAmount) => (
									<Button
										key={suggestedAmount}
										type="button"
										variant="outline"
										size="sm"
										className="cursor-pointer"
										disabled={isSubmitting}
										onClick={() =>
											form.setFieldValue("amount", String(suggestedAmount))
										}
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
								disabled={isSubmitting}
								onClick={() => onOpenChange?.(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								className="cursor-pointer"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Processing..." : "Continue to Payment"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<StripeCheckoutDialog
				open={showStripeCheckout}
				onOpenChange={setShowStripeCheckout}
				clientSecret={clientSecret}
				onCloseCheckout={handleStripeCheckoutClose}
			/>
		</>
	);
}
