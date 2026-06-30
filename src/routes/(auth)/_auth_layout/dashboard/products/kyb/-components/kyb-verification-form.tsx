import { PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { VerificationConsentCheckbox } from "../../../-components/VerificationConsentCheckbox";
import { verificationConsentSchema } from "../../../-components/VerificationConsentCheckbox/data";
import { useTenantSupportedCountries } from "../../-countries";

const kybFormSchema = z.object({
	email: z.email("Enter a valid email address"),
	businessJurisdiction: z.string().min(1, "Business jurisdiction is required"),
	companyName: z.string().trim().min(1, "Company name is required"),
	companyRegistrationNumber: z
		.string()
		.trim()
		.min(1, "Company registration number is required"),
	consent: verificationConsentSchema,
});

export function KybVerificationForm() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { countries, isPending: isCountriesPending } =
		useTenantSupportedCountries();

	const form = useForm({
		defaultValues: {
			email: "",
			businessJurisdiction: "",
			companyName: "",
			companyRegistrationNumber: "",
			consent: false,
		},
		validators: {
			onChange: kybFormSchema,
			onSubmit: kybFormSchema,
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
									<FieldLabel htmlFor="kyb-verification-email">
										Email Address
									</FieldLabel>
									<Input
										id="kyb-verification-email"
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

						<form.Field name="businessJurisdiction">
							{(field) => (
								<Field className="gap-1.5">
									<FieldLabel htmlFor="kyb-verification-jurisdiction">
										Business Jurisdiction{" "}
										<span className="text-destructive">*</span>
									</FieldLabel>
									<Select
										value={field.state.value || undefined}
										onValueChange={field.handleChange}
										disabled={isCountriesPending}
									>
										<SelectTrigger
											id="kyb-verification-jurisdiction"
											className="w-full"
										>
											<SelectValue
												placeholder={
													isCountriesPending
														? "Loading jurisdictions..."
														: "Select a jurisdiction"
												}
											/>
										</SelectTrigger>
										<SelectContent className="max-h-60">
											{countries.map((country) => (
												<SelectItem key={country.code} value={country.code}>
													{country.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldDescription>
										Choose the jurisdiction where the company is registered
									</FieldDescription>
								</Field>
							)}
						</form.Field>

						<form.Field name="companyName">
							{(field) => (
								<Field className="gap-1.5">
									<FieldLabel htmlFor="kyb-verification-company-name">
										Company Name{" "}
										<span className="text-destructive">*</span>
									</FieldLabel>
									<Input
										id="kyb-verification-company-name"
										placeholder="Company Name"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
								</Field>
							)}
						</form.Field>

						<form.Field name="companyRegistrationNumber">
							{(field) => (
								<Field className="gap-1.5">
									<FieldLabel htmlFor="kyb-verification-registration-number">
										Company Registration Number{" "}
										<span className="text-destructive">*</span>
									</FieldLabel>
									<Input
										id="kyb-verification-registration-number"
										placeholder="Company Registration Number"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
								</Field>
							)}
						</form.Field>
					</FieldGroup>

					<form.Field name="consent">
						{(field) => (
							<VerificationConsentCheckbox
								id="kyb-verification-consent"
								checked={field.state.value}
								onCheckedChange={field.handleChange}
							/>
						)}
					</form.Field>

					<form.Subscribe selector={(state) => state.canSubmit}>
						{(canSubmit) => (
							<Button
								type="submit"
								className="w-full cursor-pointer"
								disabled={!canSubmit || isSubmitting}
							>
								<PaperPlaneTiltIcon className="size-4" />
								{isSubmitting ? "Submitting..." : "Submit Verification"}
							</Button>
						)}
					</form.Subscribe>
				</form>
			</CardContent>
		</Card>
	);
}
