import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { useEffect } from "react";

import {
	KycBasicInformationFormSchema,
	type KycBasicInformationFormValues,
	normalizeWebsiteUrl,
} from "#/api/http/v1/kyc/kyc.types";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { SECTION_NAMES } from "../-data";
import { useKyc } from "./kyc-provider";
import {
	CountrySelect,
	Input,
	KycDatePicker,
	KycFormField,
	KycFormGrid,
	KycFormSeparator,
	KycSaveButton,
	KycSectionHeader,
	Textarea,
} from "./kyc-form-primitives";

function getDefaultValues(
	kycData: ReturnType<typeof useKyc>["kycData"],
): KycBasicInformationFormValues {
	return {
		legalName: kycData.company.legalName ?? "",
		tradingName: kycData.company.tradingName ?? "",
		countryOfIncorporation: kycData.company.countryOfIncorporation ?? "",
		registrationNumber: kycData.company.registrationNumber ?? "",
		dateOfIncorporation: kycData.company.dateOfIncorporation ?? "",
		registeredAddress: kycData.company.registeredAddress?.address ?? "",
		registeredPostalCode: kycData.company.registeredAddress?.postalCode ?? "",
		registeredCountry: kycData.company.registeredAddress?.country ?? "",
		businessAddress: kycData.company.businessAddress?.address ?? "",
		businessPostalCode: kycData.company.businessAddress?.postalCode ?? "",
		businessCountry: kycData.company.businessAddress?.country ?? "",
		website: kycData.company.website ?? "",
		taxIdVatNumber: kycData.company.taxIdVatNumber ?? "",
	};
}

export function BasicInformationForm() {
	const { kycData, isReadOnly, isSaving, saveCompliance } = useKyc();

	const form = useForm({
		defaultValues: getDefaultValues(kycData),
		validators: {
			onSubmit: KycBasicInformationFormSchema,
		},
		onSubmit: async ({ value }) => {
			await saveCompliance(
				(current) => ({
					...current,
					company: {
						...current.company,
						legalName: value.legalName,
						tradingName: value.tradingName,
						countryOfIncorporation: value.countryOfIncorporation,
						registrationNumber: value.registrationNumber,
						dateOfIncorporation: value.dateOfIncorporation,
						registeredAddress: {
							address: value.registeredAddress,
							postalCode: value.registeredPostalCode,
							country: value.registeredCountry,
						},
						businessAddress:
							value.businessAddress ||
							value.businessPostalCode ||
							value.businessCountry
								? {
										address: value.businessAddress ?? "",
										postalCode: value.businessPostalCode ?? "",
										country: value.businessCountry ?? "",
									}
								: undefined,
						website: normalizeWebsiteUrl(value.website),
						taxIdVatNumber: value.taxIdVatNumber,
					},
				}),
				{ currentSection: SECTION_NAMES.BASIC_INFORMATION },
			);
		},
	});

	useEffect(() => {
		form.reset(getDefaultValues(kycData));
	}, [form, kycData]);

	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
		>
			<KycSectionHeader
				title="Basic Information"
				description="Provide your basic information to get started."
			/>

			<FieldGroup>
				<KycFormGrid>
					<form.Field name="legalName">
						{(field) => (
							<Field className="gap-1.5" data-invalid={field.state.meta.errors.length > 0}>
								<FieldLabel htmlFor="legalName">
									Legal Name <span className="text-destructive">*</span>
								</FieldLabel>
								<Input
									id="legalName"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									placeholder="Enter the official legal name of the company"
									disabled={isReadOnly}
									aria-invalid={field.state.meta.errors.length > 0}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>
					<form.Field name="tradingName">
						{(field) => (
							<Field className="gap-1.5" data-invalid={field.state.meta.errors.length > 0}>
								<FieldLabel htmlFor="tradingName">Trading Name</FieldLabel>
								<Input
									id="tradingName"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									placeholder="Enter trading or doing business as name"
									disabled={isReadOnly}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>
				</KycFormGrid>

				<KycFormGrid>
					<form.Field name="countryOfIncorporation">
						{(field) => (
							<Field className="gap-1.5" data-invalid={field.state.meta.errors.length > 0}>
								<FieldLabel htmlFor="countryOfIncorporation">
									Country of Incorporation{" "}
									<span className="text-destructive">*</span>
								</FieldLabel>
								<CountrySelect
									id="countryOfIncorporation"
									value={field.state.value}
									onValueChange={field.handleChange}
									disabled={isReadOnly}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>
					<form.Field name="registrationNumber">
						{(field) => (
							<Field className="gap-1.5" data-invalid={field.state.meta.errors.length > 0}>
								<FieldLabel htmlFor="registrationNumber">
									Registration Number{" "}
									<span className="text-destructive">*</span>
								</FieldLabel>
								<Input
									id="registrationNumber"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									placeholder="Enter company registration number"
									disabled={isReadOnly}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>
				</KycFormGrid>

				<KycFormGrid>
					<form.Field name="dateOfIncorporation">
						{(field) => (
							<Field className="gap-1.5" data-invalid={field.state.meta.errors.length > 0}>
								<FieldLabel htmlFor="dateOfIncorporation">
									Date of Incorporation{" "}
									<span className="text-destructive">*</span>
								</FieldLabel>
								<KycDatePicker
									id="dateOfIncorporation"
									value={field.state.value}
									onChange={(date) =>
										field.handleChange(
											date ? format(date, "yyyy-MM-dd") : "",
										)
									}
									disabled={isReadOnly}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>
					<form.Field name="website">
						{(field) => (
							<Field className="gap-1.5" data-invalid={field.state.meta.errors.length > 0}>
								<FieldLabel htmlFor="website">Website</FieldLabel>
								<Input
									id="website"
									type="url"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									placeholder="https://example.com"
									disabled={isReadOnly}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>
				</KycFormGrid>
			</FieldGroup>

			<KycFormSeparator />

			<form.Field name="registeredAddress">
				{(field) => (
					<Field className="gap-1.5" data-invalid={field.state.meta.errors.length > 0}>
						<FieldLabel htmlFor="registeredAddress">
							Registered Address <span className="text-destructive">*</span>
						</FieldLabel>
						<Textarea
							id="registeredAddress"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							placeholder="Enter the complete registered address including street and city"
							rows={3}
							disabled={isReadOnly}
						/>
						<FieldError errors={field.state.meta.errors} />
					</Field>
				)}
			</form.Field>

			<KycFormGrid>
				<form.Field name="registeredPostalCode">
					{(field) => (
						<KycFormField id="registeredPostalCode" label="Postal Code" required>
							<Input
								id="registeredPostalCode"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								placeholder="Enter postal code"
								disabled={isReadOnly}
							/>
							<FieldError errors={field.state.meta.errors} />
						</KycFormField>
					)}
				</form.Field>
				<form.Field name="registeredCountry">
					{(field) => (
						<KycFormField id="registeredCountry" label="Country" required>
							<CountrySelect
								id="registeredCountry"
								value={field.state.value}
								onValueChange={field.handleChange}
								disabled={isReadOnly}
							/>
							<FieldError errors={field.state.meta.errors} />
						</KycFormField>
					)}
				</form.Field>
			</KycFormGrid>

			<KycFormSeparator />

			<form.Field name="businessAddress">
				{(field) => (
					<Field className="gap-1.5" data-invalid={field.state.meta.errors.length > 0}>
						<FieldLabel htmlFor="businessAddress">Business Address</FieldLabel>
						<Textarea
							id="businessAddress"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							placeholder="Enter the complete business address including street and city"
							rows={3}
							disabled={isReadOnly}
						/>
						<FieldError errors={field.state.meta.errors} />
					</Field>
				)}
			</form.Field>

			<KycFormGrid>
				<form.Field name="businessPostalCode">
					{(field) => (
						<KycFormField id="businessPostalCode" label="Postal Code">
							<Input
								id="businessPostalCode"
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								placeholder="Enter postal code"
								disabled={isReadOnly}
							/>
						</KycFormField>
					)}
				</form.Field>
				<form.Field name="businessCountry">
					{(field) => (
						<KycFormField id="businessCountry" label="Country">
							<CountrySelect
								id="businessCountry"
								value={field.state.value}
								onValueChange={field.handleChange}
								disabled={isReadOnly}
							/>
						</KycFormField>
					)}
				</form.Field>
			</KycFormGrid>

			<form.Field name="taxIdVatNumber">
				{(field) => (
					<KycFormField id="taxIdVatNumber" label="Tax ID / VAT Number">
						<Input
							id="taxIdVatNumber"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							placeholder="Enter tax identification or VAT number"
							disabled={isReadOnly}
						/>
					</KycFormField>
				)}
			</form.Field>

			{!isReadOnly && <KycSaveButton isSaving={isSaving} />}
		</form>
	);
}
