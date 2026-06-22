import { PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { VerificationConsentCheckbox } from "../../../-components/VerificationConsentCheckbox";
import { verificationConsentSchema } from "../../../-components/VerificationConsentCheckbox/data";

const cryptoWalletScreeningFormSchema = z.object({
	email: z.email("Enter a valid email address"),
	walletAddress: z.string().trim().min(1, "Wallet address is required"),
	consent: verificationConsentSchema,
});

export function CryptoWalletScreeningForm() {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
			walletAddress: "",
			consent: false,
		},
		validators: {
			onChange: cryptoWalletScreeningFormSchema,
			onSubmit: cryptoWalletScreeningFormSchema,
		},
		onSubmit: async () => {
			setIsSubmitting(true);
			try {
				toast.success("Verification request submitted");
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	return (
		<Card>
			<CardContent className="pt-0">
				<form
					className="flex flex-col gap-6"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<FieldGroup className="gap-4">
						<form.Field name="email">
							{(field) => (
								<Field className="gap-1.5">
									<FieldLabel htmlFor="crypto-wallet-screening-email">
										Email Address
									</FieldLabel>
									<Input
										id="crypto-wallet-screening-email"
										type="email"
										autoComplete="email"
										placeholder="Email Address"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
								</Field>
							)}
						</form.Field>

						<form.Field name="walletAddress">
							{(field) => (
								<Field className="gap-1.5">
									<FieldLabel htmlFor="crypto-wallet-screening-wallet-address">
										Wallet Address
									</FieldLabel>
									<Input
										id="crypto-wallet-screening-wallet-address"
										placeholder="Wallet Address"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
									<FieldDescription>
										Supported formats: EVM, Bitcoin, Tron, and Solana wallet
										addresses.
									</FieldDescription>
								</Field>
							)}
						</form.Field>
					</FieldGroup>

					<form.Field name="consent">
						{(field) => (
							<VerificationConsentCheckbox
								id="crypto-wallet-screening-consent"
								checked={field.state.value}
								onCheckedChange={field.handleChange}
							/>
						)}
					</form.Field>

					<Button
						type="submit"
						className="w-full cursor-pointer"
						disabled={!form.state.canSubmit || isSubmitting}
					>
						<PaperPlaneTiltIcon className="size-4" />
						{isSubmitting ? "Submitting..." : "Submit Verification"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
