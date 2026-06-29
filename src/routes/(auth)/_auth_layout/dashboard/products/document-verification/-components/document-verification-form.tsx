import {
	LinkIcon,
	MagnifyingGlassIcon,
	PaperPlaneTiltIcon,
} from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { useSupportedCountriesV2Query } from "#/api/http/v2/tenants/tenants.hooks";
import type { SupportedCountry } from "#/api/http/v2/tenants/tenants.types";
import { useAuthStore } from "#/stores/auth-store";
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
import { ToggleGroup, ToggleGroupItem } from "#/components/ui/toggle-group";
import { cn } from "#/lib/utils.ts";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { VerificationConsentCheckbox } from "../../../-components/VerificationConsentCheckbox";
import { ProductProofUpload } from "../../-components/product-proof-upload";
import { PRODUCT_UPLOAD_FOLDERS } from "../../-upload-utils";
import {
	DEFAULT_VERIFICATION_URL_LIMIT,
	VERIFICATION_MODES,
	VERIFICATION_URL_LIMITS,
	type VerificationMode,
	verificationConsentSchema,
} from "../../../-components/VerificationConsentCheckbox/data";
import { getUserTenantMembership } from "../../../team/-data";

function filterCountriesByTenant(
	countries: SupportedCountry[],
	enabledCountries: string[] | undefined,
) {
	if (enabledCountries === undefined) {
		return countries;
	}

	const enabledCodes = new Set(
		enabledCountries
			.map((code) => code.trim().toLowerCase())
			.filter(Boolean),
	);

	return countries.filter((country) =>
		enabledCodes.has(country.code.trim().toLowerCase()),
	);
}

const linkFormSchema = z.object({
	email: z.email("Enter a valid email address"),
	urlLimit: z.string().min(1, "Select a verification URL limit"),
	consent: verificationConsentSchema,
});

const directFormSchema = z.object({
	email: z.email("Enter a valid email address"),
	country: z.string().min(1, "Select a country"),
	firstName: z.string().trim().min(1, "First name is required"),
	lastName: z.string().trim().min(1, "Last name is required"),
	consent: verificationConsentSchema,
});

export function DocumentVerificationForm() {
	const [mode, setMode] = useState<VerificationMode>("link");
	const [documentProofUrl, setDocumentProofUrl] = useState<string | null>(null);
	const [isDocumentUploading, setIsDocumentUploading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const user = useAuthStore((state) => state.user);
	const tenant = user ? getUserTenantMembership(user) : undefined;
	const countriesQuery = useSupportedCountriesV2Query();

	const countries = useMemo(() => {
		const supportedCountries = countriesQuery.data ?? [];

		return filterCountriesByTenant(
			supportedCountries,
			tenant?.enabled_countries,
		).sort((left, right) => left.name.localeCompare(right.name));
	}, [countriesQuery.data, tenant?.enabled_countries]);

	const linkForm = useForm({
		defaultValues: {
			email: "",
			urlLimit: DEFAULT_VERIFICATION_URL_LIMIT,
			consent: false,
		},
		validators: {
			onChange: linkFormSchema,
			onSubmit: linkFormSchema,
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

	const directForm = useForm({
		defaultValues: {
			email: "",
			country: "",
			firstName: "",
			lastName: "",
			consent: false,
		},
		validators: {
			onChange: directFormSchema,
			onSubmit: directFormSchema,
		},
		onSubmit: async () => {
			if (!documentProofUrl) {
				toast.error("Please upload a document");
				return;
			}

			setIsSubmitting(true);
			try {
				toast.success("Verification request submitted");
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	const activeForm = mode === "link" ? linkForm : directForm;

	useEffect(() => {
		if (mode !== "direct") {
			return;
		}

		const selectedCountry = directForm.getFieldValue("country");
		if (!selectedCountry) {
			return;
		}

		const isSelectedCountryEnabled = countries.some(
			(country) => country.code === selectedCountry,
		);

		if (!isSelectedCountryEnabled) {
			directForm.setFieldValue("country", "");
		}
	}, [countries, mode, directForm]);

	return (
		<Card>
			<CardContent className="pt-0">
				<form
					className="flex flex-col gap-6"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void activeForm.handleSubmit();
					}}
				>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-sm font-medium text-muted-foreground">
							Verification Mode
						</p>
						<ToggleGroup
							type="single"
							value={mode}
							onValueChange={(value) => {
								if (!value) {
									return;
								}

								setMode(value as VerificationMode);

								if (value === "link") {
									setDocumentProofUrl(null);
									setIsDocumentUploading(false);
								}
							}}
							variant="outline"
							spacing={0}
							className="w-full sm:w-auto"
						>
							{VERIFICATION_MODES.map((option) => {
								const Icon =
									option.value === "link" ? LinkIcon : MagnifyingGlassIcon;

								return (
									<ToggleGroupItem
										key={option.value}
										value={option.value}
										className={cn("flex-1 sm:flex-none")}
									>
										<Icon className="size-4" />
										{option.label}
									</ToggleGroupItem>
								);
							})}
						</ToggleGroup>
					</div>

					{mode === "link" ? (
						<FieldGroup>
							<linkForm.Field name="email">
								{(field) => (
									<Field className="gap-1.5">
										<FieldLabel htmlFor="document-verification-email">
											Email Address
										</FieldLabel>
										<Input
											id="document-verification-email"
											type="email"
											autoComplete="email"
											placeholder="Email Address"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
										/>
									</Field>
								)}
							</linkForm.Field>

							<linkForm.Field name="urlLimit">
								{(field) => (
									<Field className="gap-1.5">
										<FieldLabel htmlFor="document-verification-url-limit">
											Verification URL Limit
										</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={field.handleChange}
										>
											<SelectTrigger
												id="document-verification-url-limit"
												className="w-full"
											>
												<SelectValue placeholder="Select duration" />
											</SelectTrigger>
											<SelectContent>
												{VERIFICATION_URL_LIMITS.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FieldDescription>
											How long the verification link stays active
										</FieldDescription>
									</Field>
								)}
							</linkForm.Field>
						</FieldGroup>
					) : (
						<FieldGroup className="gap-4">
							<directForm.Field name="email">
								{(field) => (
									<Field className="gap-1.5">
										<FieldLabel htmlFor="document-verification-direct-email">
											Email Address
										</FieldLabel>
										<Input
											id="document-verification-direct-email"
											type="email"
											autoComplete="email"
											placeholder="Email Address"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
										/>
									</Field>
								)}
							</directForm.Field>

							<directForm.Field name="country">
								{(field) => (
									<Field className="gap-1.5">
										<FieldLabel htmlFor="document-verification-country">
											Country
										</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={field.handleChange}
											disabled={countriesQuery.isPending}
										>
											<SelectTrigger
												id="document-verification-country"
												className="w-full"
											>
												<SelectValue
													placeholder={
														countriesQuery.isPending
															? "Loading countries..."
															: "Select a country"
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
									</Field>
								)}
							</directForm.Field>

							<div className="grid gap-4 sm:grid-cols-2">
								<directForm.Field name="firstName">
									{(field) => (
										<Field className="gap-1.5">
											<FieldLabel htmlFor="document-verification-first-name">
												First Name
											</FieldLabel>
											<Input
												id="document-verification-first-name"
												autoComplete="given-name"
												placeholder="First Name"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
											/>
										</Field>
									)}
								</directForm.Field>

								<directForm.Field name="lastName">
									{(field) => (
										<Field className="gap-1.5">
											<FieldLabel htmlFor="document-verification-last-name">
												Last Name
											</FieldLabel>
											<Input
												id="document-verification-last-name"
												autoComplete="family-name"
												placeholder="Last Name"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
											/>
										</Field>
									)}
								</directForm.Field>
							</div>

							<ProductProofUpload
								label="Document"
								folder={PRODUCT_UPLOAD_FOLDERS.documentVerification}
								proofUrl={documentProofUrl}
								onProofUrlChange={setDocumentProofUrl}
								onUploadingChange={setIsDocumentUploading}
								emptyStateText="Click to upload a document (image or PDF)"
								disabled={isSubmitting}
							/>
						</FieldGroup>
					)}

					{mode === "link" ? (
						<linkForm.Field name="consent">
							{(field) => (
								<VerificationConsentCheckbox
									id="document-verification-link-consent"
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							)}
						</linkForm.Field>
					) : (
						<directForm.Field name="consent">
							{(field) => (
								<VerificationConsentCheckbox
									id="document-verification-direct-consent"
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							)}
						</directForm.Field>
					)}

					{mode === "link" ? (
						<linkForm.Subscribe selector={(state) => state.canSubmit}>
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
						</linkForm.Subscribe>
					) : (
						<directForm.Subscribe selector={(state) => state.canSubmit}>
							{(canSubmit) => (
								<Button
									type="submit"
									className="w-full cursor-pointer"
									disabled={
										!canSubmit ||
										!documentProofUrl ||
										isDocumentUploading ||
										isSubmitting
									}
								>
									<PaperPlaneTiltIcon className="size-4" />
									{isSubmitting ? "Submitting..." : "Submit Verification"}
								</Button>
							)}
						</directForm.Subscribe>
					)}
				</form>
			</CardContent>
		</Card>
	);
}
