import { PlusIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";

import {
	KycBusinessActivityFormSchema,
	type KycBusinessActivityFormValues,
} from "#/api/http/v1/kyc/kyc.types";
import { Button } from "#/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	KYC_CLIENT_GEOGRAPHIES,
	KYC_VERIFICATION_VOLUMES,
} from "../-constants";
import { SECTION_NAMES } from "../-data";
import {
	CountrySelect,
	Input,
	KycEntryCard,
	KycFormGrid,
	KycSaveButton,
	KycSectionHeader,
	Textarea,
} from "./kyc-form-primitives";
import { useKyc } from "./kyc-provider";

function getDefaultValues(
	kycData: ReturnType<typeof useKyc>["kycData"],
): KycBusinessActivityFormValues {
	const activity = kycData.company.businessActivity;

	return {
		natureOfBusiness: activity.natureOfBusiness ?? "",
		descriptionOfProductsServices: activity.descriptionOfProductsServices ?? "",
		expectedMonthlyVerificationVolume:
			activity.expectedMonthlyVerificationVolume ?? "",
		mainGeographiesOfClients: activity.mainGeographiesOfClients?.length
			? activity.mainGeographiesOfClients
			: [],
		regulatoryLicensesHeld: activity.regulatoryLicensesHeld ?? [],
	};
}

export function BusinessActivityForm() {
	const { kycData, isReadOnly, isSaving, saveCompliance } = useKyc();

	const form = useForm({
		defaultValues: getDefaultValues(kycData),
		validators: {
			onSubmit: KycBusinessActivityFormSchema,
		},
		onSubmit: async ({ value }) => {
			await saveCompliance(
				(current) => ({
					...current,
					company: {
						...current.company,
						businessActivity: {
							natureOfBusiness: value.natureOfBusiness,
							descriptionOfProductsServices:
								value.descriptionOfProductsServices,
							expectedMonthlyVerificationVolume:
								value.expectedMonthlyVerificationVolume,
							mainGeographiesOfClients: value.mainGeographiesOfClients,
							regulatoryLicensesHeld: value.regulatoryLicensesHeld,
						},
					},
				}),
				{ currentSection: SECTION_NAMES.BUSINESS_ACTIVITY },
			);
		},
	});

	useEffect(() => {
		form.reset(getDefaultValues(kycData));
	}, [form, kycData]);

	const selectedGeography = form.state.values.mainGeographiesOfClients[0] ?? "";

	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
		>
			<KycSectionHeader
				title="Business Activity"
				description="Provide your business activity details."
			/>

			<FieldGroup className="flex flex-col gap-4">
				<form.Field name="natureOfBusiness">
					{(field) => (
						<Field
							className="gap-1.5"
							data-invalid={field.state.meta.errors.length > 0}
						>
							<FieldLabel htmlFor="natureOfBusiness">
								Nature of Business <span className="text-destructive">*</span>
							</FieldLabel>
							<Input
								id="natureOfBusiness"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								disabled={isReadOnly}
							/>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>

				<form.Field name="descriptionOfProductsServices">
					{(field) => (
						<Field
							className="gap-1.5"
							data-invalid={field.state.meta.errors.length > 0}
						>
							<FieldLabel htmlFor="productsDescription">
								Description of Products/Services{" "}
								<span className="text-destructive">*</span>
							</FieldLabel>
							<Textarea
								id="productsDescription"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								rows={4}
								disabled={isReadOnly}
							/>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>

				<KycFormGrid>
					<form.Field name="expectedMonthlyVerificationVolume">
						{(field) => (
							<Field
								className="gap-1.5"
								data-invalid={field.state.meta.errors.length > 0}
							>
								<FieldLabel htmlFor="verificationVolume">
									Expected Monthly Verification Volume{" "}
									<span className="text-destructive">*</span>
								</FieldLabel>
								<Select
									value={field.state.value}
									onValueChange={field.handleChange}
									disabled={isReadOnly}
								>
									<SelectTrigger id="verificationVolume" className="w-full">
										<SelectValue placeholder="Select volume range" />
									</SelectTrigger>
									<SelectContent>
										{KYC_VERIFICATION_VOLUMES.map((volume) => (
											<SelectItem key={volume} value={volume}>
												{volume}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>

					<form.Field name="mainGeographiesOfClients">
						{(field) => (
							<Field
								className="gap-1.5"
								data-invalid={field.state.meta.errors.length > 0}
							>
								<FieldLabel htmlFor="clientGeographies">
									Main Geographies of Clients{" "}
									<span className="text-destructive">*</span>
								</FieldLabel>
								<Select
									value={selectedGeography}
									onValueChange={(value) => field.handleChange([value])}
									disabled={isReadOnly}
								>
									<SelectTrigger id="clientGeographies" className="w-full">
										<SelectValue placeholder="Select geography" />
									</SelectTrigger>
									<SelectContent>
										{KYC_CLIENT_GEOGRAPHIES.map((geography) => (
											<SelectItem key={geography} value={geography}>
												{geography}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>
				</KycFormGrid>
			</FieldGroup>

			<form.Field name="regulatoryLicensesHeld" mode="array">
				{(licensesField) => (
					<section className="space-y-4">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<h3 className="text-base font-semibold">
								Regulatory Licenses Held
							</h3>
							{!isReadOnly && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="uppercase tracking-wide"
									onClick={() =>
										licensesField.pushValue({
											license_name: "",
											license_number: "",
											country: "",
										})
									}
								>
									<PlusIcon className="size-4" weight="bold" />
									Add License
								</Button>
							)}
						</div>

						{licensesField.state.value.map((_, index) => (
							<KycEntryCard
								key={`license-${index}`}
								title={`License ${index + 1}`}
								onRemove={
									!isReadOnly
										? () => licensesField.removeValue(index)
										: undefined
								}
							>
								<div className="space-y-4">
									<form.Field
										name={`regulatoryLicensesHeld[${index}].license_name`}
									>
										{(field) => (
											<Field
												className="gap-1.5"
												data-invalid={field.state.meta.errors.length > 0}
											>
												<FieldLabel>License Name</FieldLabel>
												<Input
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(event) =>
														field.handleChange(event.target.value)
													}
													disabled={isReadOnly}
												/>
												<FieldError errors={field.state.meta.errors} />
											</Field>
										)}
									</form.Field>
									<KycFormGrid>
										<form.Field
											name={`regulatoryLicensesHeld[${index}].license_number`}
										>
											{(field) => (
												<Field
													className="gap-1.5"
													data-invalid={field.state.meta.errors.length > 0}
												>
													<FieldLabel>License Number</FieldLabel>
													<Input
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(event) =>
															field.handleChange(event.target.value)
														}
														disabled={isReadOnly}
													/>
													<FieldError errors={field.state.meta.errors} />
												</Field>
											)}
										</form.Field>
										<form.Field
											name={`regulatoryLicensesHeld[${index}].country`}
										>
											{(field) => (
												<Field
													className="gap-1.5"
													data-invalid={field.state.meta.errors.length > 0}
												>
													<FieldLabel>Country</FieldLabel>
													<CountrySelect
														value={field.state.value}
														onValueChange={field.handleChange}
														disabled={isReadOnly}
													/>
													<FieldError errors={field.state.meta.errors} />
												</Field>
											)}
										</form.Field>
									</KycFormGrid>
								</div>
							</KycEntryCard>
						))}
					</section>
				)}
			</form.Field>

			{!isReadOnly && <KycSaveButton isSaving={isSaving} />}
		</form>
	);
}
