import {
	CloudArrowUpIcon,
	GlobeHemisphereWestIcon,
	PaperPlaneTiltIcon,
} from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { useSupportedCountriesQuery } from "#/api/http/v1/tenants/tenants.hooks";
import type { SupportedCountry } from "#/api/http/v1/tenants/tenants.types";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Checkbox } from "#/components/ui/checkbox";
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadItem,
	FileUploadItemDelete,
	FileUploadItemMetadata,
	FileUploadItemPreview,
	FileUploadList,
	FileUploadTrigger,
} from "#/components/ui/file-upload";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { useAuthStore } from "#/stores/auth-store";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { VerificationConsentCheckbox } from "../../../-components/VerificationConsentCheckbox";
import { verificationConsentSchema } from "../../../-components/VerificationConsentCheckbox/data";
import { getUserTenantMembership } from "../../../team/-data";
import { KycDatePicker } from "../../../kyc/-components/kyc-form-primitives";
import {
	allowsCustomerDataValidation,
	filterRegistryCountries,
	getPrimaryInputLabel,
	getRegistryVerificationTypes,
	requiresLastNameField,
} from "../-data";

const baseFormSchema = z.object({
	country: z.string().min(1, "Country is required"),
	verificationType: z.string().min(1, "Verification type is required"),
	input: z.string(),
	lastName: z.string(),
	includeValidation: z.boolean(),
	validationFirstName: z.string(),
	validationLastName: z.string(),
	validationDateOfBirth: z.string(),
	includeSelfie: z.boolean(),
	consent: z.boolean(),
});

const governmentRegistryChecksFormSchema = baseFormSchema.superRefine(
	(values, context) => {
		const showFullForm = Boolean(values.country && values.verificationType);

		if (!showFullForm) {
			return;
		}

		if (!values.input.trim()) {
			context.addIssue({
				code: "custom",
				path: ["input"],
				message: "Input data is required",
			});
		}

		if (
			requiresLastNameField(values.verificationType) &&
			!values.lastName.trim()
		) {
			context.addIssue({
				code: "custom",
				path: ["lastName"],
				message: "Last name is required",
			});
		}

		if (values.includeValidation) {
			if (!values.validationFirstName.trim()) {
				context.addIssue({
					code: "custom",
					path: ["validationFirstName"],
					message: "First name is required for validation",
				});
			}

			if (!values.validationLastName.trim()) {
				context.addIssue({
					code: "custom",
					path: ["validationLastName"],
					message: "Last name is required for validation",
				});
			}

			if (!values.validationDateOfBirth.trim()) {
				context.addIssue({
					code: "custom",
					path: ["validationDateOfBirth"],
					message: "Date of birth is required for validation",
				});
			}
		}

		const consentResult = verificationConsentSchema.safeParse(values.consent);
		if (!consentResult.success) {
			context.addIssue({
				code: "custom",
				path: ["consent"],
				message: consentResult.error.issues[0]?.message ?? "Consent is required",
			});
		}
	},
);

const defaultValues = {
	country: "",
	verificationType: "",
	input: "",
	lastName: "",
	includeValidation: false,
	validationFirstName: "",
	validationLastName: "",
	validationDateOfBirth: "",
	includeSelfie: false,
	consent: false,
};

export function GovernmentRegistryChecksForm() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selfieFiles, setSelfieFiles] = useState<File[]>([]);
	const [country, setCountry] = useState("");
	const [verificationType, setVerificationType] = useState("");
	const [includeValidation, setIncludeValidation] = useState(false);
	const [includeSelfie, setIncludeSelfie] = useState(false);
	const user = useAuthStore((state) => state.user);
	const countriesQuery = useSupportedCountriesQuery();

	const tenant = user ? getUserTenantMembership(user) : undefined;
	const enabledCountryCodes =
		tenant?.enabled_countries && tenant.enabled_countries.length > 0
			? tenant.enabled_countries
			: undefined;

	const countries = useMemo(() => {
		const supportedCountries =
			(countriesQuery.data as SupportedCountry[] | undefined) ?? [];

		return filterRegistryCountries(supportedCountries, enabledCountryCodes);
	}, [countriesQuery.data, enabledCountryCodes]);

	const verificationTypes = useMemo(
		() => (country ? getRegistryVerificationTypes(country) : []),
		[country],
	);

	const showFullForm = Boolean(country && verificationType);
	const showLastName = requiresLastNameField(verificationType);
	const allowValidation = allowsCustomerDataValidation(verificationType);
	const inputLabel = verificationType
		? getPrimaryInputLabel(verificationType)
		: "Input Data";

	const form = useForm({
		defaultValues,
		validators: {
			onChange: governmentRegistryChecksFormSchema,
			onSubmit: governmentRegistryChecksFormSchema,
		},
		onSubmit: async () => {
			if (includeSelfie && selfieFiles.length === 0) {
				toast.error("Selfie image is required for facial matching");
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

	const resetDependentFields = () => {
		form.setFieldValue("input", "");
		form.setFieldValue("lastName", "");
		form.setFieldValue("includeValidation", false);
		form.setFieldValue("validationFirstName", "");
		form.setFieldValue("validationLastName", "");
		form.setFieldValue("validationDateOfBirth", "");
		form.setFieldValue("includeSelfie", false);
		form.setFieldValue("consent", false);
		setIncludeValidation(false);
		setIncludeSelfie(false);
		setSelfieFiles([]);
	};

	const handleReset = () => {
		form.reset();
		setCountry("");
		setVerificationType("");
		setIncludeValidation(false);
		setIncludeSelfie(false);
		setSelfieFiles([]);
	};

	const canSubmit =
		form.state.canSubmit &&
		(!includeSelfie || selfieFiles.length > 0) &&
		showFullForm;

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
						<form.Field name="country">
							{(field) => (
								<Field className="gap-1.5">
									<FieldLabel htmlFor="government-registry-checks-country">
										Select Country{" "}
										<span className="text-destructive">*</span>
									</FieldLabel>
									<Select
										value={field.state.value || undefined}
										onValueChange={(value) => {
											field.handleChange(value);
											setCountry(value);
											setVerificationType("");
											form.setFieldValue("verificationType", "");
											resetDependentFields();
										}}
										disabled={countriesQuery.isPending || isSubmitting}
									>
										<SelectTrigger
											id="government-registry-checks-country"
											className="w-full"
										>
											<div className="flex items-center gap-2">
												<GlobeHemisphereWestIcon className="size-4 text-muted-foreground" />
												<SelectValue
													placeholder={
														countriesQuery.isPending
															? "Loading countries..."
															: "Select a country"
													}
												/>
											</div>
										</SelectTrigger>
										<SelectContent>
											{countries.map((countryOption) => (
												<SelectItem
													key={countryOption.code}
													value={countryOption.code}
												>
													{countryOption.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							)}
						</form.Field>

						{country ? (
							<form.Field name="verificationType">
								{(field) => (
									<Field className="gap-1.5">
										<FieldLabel htmlFor="government-registry-checks-type">
											Select Verification Type{" "}
											<span className="text-destructive">*</span>
										</FieldLabel>
										<Select
											value={field.state.value || undefined}
											onValueChange={(value) => {
												field.handleChange(value);
												setVerificationType(value);
												resetDependentFields();
											}}
											disabled={
												isSubmitting || verificationTypes.length === 0
											}
										>
											<SelectTrigger
												id="government-registry-checks-type"
												className="w-full"
											>
												<SelectValue placeholder="Select verification type" />
											</SelectTrigger>
											<SelectContent>
												{verificationTypes.map((type) => (
													<SelectItem key={type.value} value={type.value}>
														{type.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FieldDescription>
											Select a verification type from the available options
										</FieldDescription>
									</Field>
								)}
							</form.Field>
						) : null}

						{showLastName ? (
							<form.Field name="lastName">
								{(field) => (
									<Field className="gap-1.5">
										<FieldLabel htmlFor="government-registry-checks-last-name">
											Last Name{" "}
											<span className="text-destructive">*</span>
										</FieldLabel>
										<Input
											id="government-registry-checks-last-name"
											placeholder="Enter last name"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											disabled={isSubmitting}
										/>
									</Field>
								)}
							</form.Field>
						) : null}

						{showFullForm ? (
							<form.Field name="input">
								{(field) => (
									<Field className="gap-1.5">
										<FieldLabel htmlFor="government-registry-checks-input">
											{inputLabel}{" "}
											<span className="text-destructive">*</span>
										</FieldLabel>
										<Input
											id="government-registry-checks-input"
											placeholder="Enter document number"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											disabled={isSubmitting}
										/>
									</Field>
								)}
							</form.Field>
						) : null}
					</FieldGroup>

					{showFullForm && allowValidation ? (
						<form.Field name="includeValidation">
							{(field) => (
								<div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
									<Checkbox
										id="government-registry-checks-include-validation"
										checked={field.state.value}
										onCheckedChange={(checked) => {
											const isChecked = checked === true;
											field.handleChange(isChecked);
											setIncludeValidation(isChecked);

											if (!isChecked) {
												form.setFieldValue("validationFirstName", "");
												form.setFieldValue("validationLastName", "");
												form.setFieldValue("validationDateOfBirth", "");
											}
										}}
										disabled={isSubmitting}
									/>
									<div className="space-y-1">
										<Label
											htmlFor="government-registry-checks-include-validation"
											className="font-medium"
										>
											Validate Customer Data
										</Label>
										<p className="text-sm text-muted-foreground">
											Verify identity document details and compare with data
											submitted.
										</p>
									</div>
								</div>
							)}
						</form.Field>
					) : null}

					{showFullForm && includeValidation ? (
						<div className="grid gap-4 md:grid-cols-3">
							<form.Field name="validationFirstName">
								{(field) => (
									<Field className="gap-1.5">
										<FieldLabel htmlFor="government-registry-checks-validation-first-name">
											First Name{" "}
											<span className="text-destructive">*</span>
										</FieldLabel>
										<Input
											id="government-registry-checks-validation-first-name"
											placeholder="Enter first name"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											disabled={isSubmitting}
										/>
									</Field>
								)}
							</form.Field>

							<form.Field name="validationLastName">
								{(field) => (
									<Field className="gap-1.5">
										<FieldLabel htmlFor="government-registry-checks-validation-last-name">
											Last Name{" "}
											<span className="text-destructive">*</span>
										</FieldLabel>
										<Input
											id="government-registry-checks-validation-last-name"
											placeholder="Enter last name"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											disabled={isSubmitting}
										/>
									</Field>
								)}
							</form.Field>

							<form.Field name="validationDateOfBirth">
								{(field) => (
									<Field className="gap-1.5">
										<FieldLabel htmlFor="government-registry-checks-validation-dob">
											Date of Birth{" "}
											<span className="text-destructive">*</span>
										</FieldLabel>
										<KycDatePicker
											id="government-registry-checks-validation-dob"
											value={field.state.value || undefined}
											onChange={(date) => {
												field.handleChange(
													date ? format(date, "yyyy-MM-dd") : "",
												);
											}}
											disabled={isSubmitting}
										/>
									</Field>
								)}
							</form.Field>
						</div>
					) : null}

					{showFullForm ? (
						<form.Field name="includeSelfie">
							{(field) => (
								<div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
									<Checkbox
										id="government-registry-checks-include-selfie"
										checked={field.state.value}
										onCheckedChange={(checked) => {
											const isChecked = checked === true;
											field.handleChange(isChecked);
											setIncludeSelfie(isChecked);

											if (!isChecked) {
												setSelfieFiles([]);
											}
										}}
										disabled={isSubmitting}
									/>
									<div className="space-y-1">
										<Label
											htmlFor="government-registry-checks-include-selfie"
											className="font-medium"
										>
											Include Selfie Validation
										</Label>
										<p className="text-sm text-muted-foreground">
											Compare the submitted selfie against registry identity
											data.
										</p>
									</div>
								</div>
							)}
						</form.Field>
					) : null}

					{showFullForm && includeSelfie ? (
						<Field className="gap-1.5">
							<FieldLabel>Selfie Image</FieldLabel>
							<FileUpload
								value={selfieFiles}
								onValueChange={setSelfieFiles}
								accept="image/*"
								maxFiles={1}
								maxSize={10 * 1024 * 1024}
							>
								<FileUploadDropzone className="flex min-h-36 flex-col items-center justify-center gap-2 border-dashed py-8">
									<CloudArrowUpIcon className="size-8 text-secondary" />
									<p className="text-sm text-muted-foreground">
										Click to upload a selfie image
									</p>
									<FileUploadTrigger asChild>
										<Button type="button" variant="link" className="h-auto p-0">
											Choose file
										</Button>
									</FileUploadTrigger>
								</FileUploadDropzone>
								{selfieFiles.length > 0 ? (
									<FileUploadList>
										{selfieFiles.map((file) => (
											<FileUploadItem
												key={`${file.name}-${file.lastModified}`}
												value={file}
												className="p-2"
											>
												<FileUploadItemPreview className="size-8" />
												<FileUploadItemMetadata size="sm" />
												<FileUploadItemDelete asChild>
													<Button type="button" variant="ghost" size="icon-xs">
														Remove
													</Button>
												</FileUploadItemDelete>
											</FileUploadItem>
										))}
									</FileUploadList>
								) : null}
							</FileUpload>
						</Field>
					) : null}

					{showFullForm ? (
						<form.Field name="consent">
							{(field) => (
								<VerificationConsentCheckbox
									id="government-registry-checks-consent"
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							)}
						</form.Field>
					) : null}

					{showFullForm ? (
						<div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
							<Button
								type="button"
								variant="outline"
								onClick={handleReset}
								disabled={isSubmitting}
							>
								Reset
							</Button>

							<Button
								type="submit"
								className="cursor-pointer sm:min-w-48"
								disabled={!canSubmit || isSubmitting}
							>
								<PaperPlaneTiltIcon className="size-4" />
								{isSubmitting ? "Submitting..." : "Submit Verification"}
							</Button>
						</div>
					) : null}
				</form>
			</CardContent>
		</Card>
	);
}
