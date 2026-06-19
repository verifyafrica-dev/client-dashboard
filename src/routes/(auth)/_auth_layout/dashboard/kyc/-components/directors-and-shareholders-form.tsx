import { PlusIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { useEffect } from "react";

import {
	KycDirectorsAndShareholdersFormSchema,
	type KycDirectorsAndShareholdersFormValues,
} from "#/api/http/v1/kyc/kyc.types";
import { Button } from "#/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { SECTION_NAMES } from "../-data";
import {
	CountrySelect,
	Input,
	KycDatePicker,
	KycEntryCard,
	KycFormGrid,
	KycSaveButton,
	KycSectionHeader,
	Textarea,
} from "./kyc-form-primitives";
import { useKyc } from "./kyc-provider";

function normalizeDirectorAddress(
	address: KycDirectorsAndShareholdersFormValues["directors"][number]["address"],
) {
	if (typeof address === "string") {
		return { address, postalCode: "", country: "" };
	}

	return address;
}

function getDefaultValues(
	kycData: ReturnType<typeof useKyc>["kycData"],
): KycDirectorsAndShareholdersFormValues {
	const directors =
		kycData.company.directors.length > 0
			? kycData.company.directors.map((director) => ({
					name: director.name,
					dateOfBirth: director.dateOfBirth,
					nationality: director.nationality,
					address: normalizeDirectorAddress(
						director.address as KycDirectorsAndShareholdersFormValues["directors"][number]["address"],
					),
					idNumber: director.idNumber,
				}))
			: [
					{
						name: "",
						dateOfBirth: "",
						nationality: "",
						address: { address: "", postalCode: "", country: "" },
						idNumber: "",
					},
				];

	const ubos =
		kycData.company.ubos.length > 0
			? kycData.company.ubos.map((ubo) => ({
					name: ubo.name,
					ownershipPercentage: ubo.ownershipPercentage,
					idNumber: ubo.idNumber,
				}))
			: [{ name: "", ownershipPercentage: 0, idNumber: "" }];

	return { directors, ubos };
}

export function DirectorsAndShareholdersForm() {
	const { kycData, isReadOnly, isSaving, saveCompliance } = useKyc();

	const form = useForm({
		defaultValues: getDefaultValues(kycData),
		validators: {
			onSubmit: KycDirectorsAndShareholdersFormSchema,
		},
		onSubmit: async ({ value }) => {
			await saveCompliance(
				(current) => ({
					...current,
					company: {
						...current.company,
						directors: value.directors,
						ubos: value.ubos,
					},
				}),
				{ currentSection: SECTION_NAMES.DIRECTORS_AND_SHAREHOLDERS },
			);
		},
	});

	useEffect(() => {
		form.reset(getDefaultValues(kycData));
	}, [form, kycData]);

	return (
		<form
			className="flex flex-col gap-8"
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
		>
			<KycSectionHeader
				title="Directors and Shareholders"
				description="Provide your directors and shareholders details."
			/>

			<form.Field name="directors" mode="array">
				{(directorsField) => (
					<section className="flex flex-col gap-4">
						<h3 className="text-base font-semibold">Directors</h3>
						{directorsField.state.value.map((director, index) => (
							<KycEntryCard
								key={`director-${director.name}`}
								title={`Director ${index + 1}`}
								onRemove={
									!isReadOnly && directorsField.state.value.length > 1
										? () => directorsField.removeValue(index)
										: undefined
								}
							>
								<FieldGroup className="flex flex-col gap-4">
									<form.Field name={`directors[${index}].name`}>
										{(field) => (
											<Field
												className="gap-1.5"
												data-invalid={field.state.meta.errors.length > 0}
											>
												<FieldLabel>
													Full Name{" "}
													<span className="text-destructive">*</span>
												</FieldLabel>
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
										<form.Field name={`directors[${index}].dateOfBirth`}>
											{(field) => (
												<Field
													className="gap-1.5"
													data-invalid={field.state.meta.errors.length > 0}
												>
													<FieldLabel>
														Date of Birth{" "}
														<span className="text-destructive">*</span>
													</FieldLabel>
													<KycDatePicker
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
										<form.Field name={`directors[${index}].nationality`}>
											{(field) => (
												<Field
													className="gap-1.5"
													data-invalid={field.state.meta.errors.length > 0}
												>
													<FieldLabel>
														Nationality{" "}
														<span className="text-destructive">*</span>
													</FieldLabel>
													<CountrySelect
														value={field.state.value}
														onValueChange={field.handleChange}
														placeholder="Select nationality"
														disabled={isReadOnly}
													/>
													<FieldError errors={field.state.meta.errors} />
												</Field>
											)}
										</form.Field>
									</KycFormGrid>
									<form.Field name={`directors[${index}].address.address`}>
										{(field) => (
											<Field
												className="gap-1.5"
												data-invalid={field.state.meta.errors.length > 0}
											>
												<FieldLabel>
													Address{" "}
													<span className="text-destructive">*</span>
												</FieldLabel>
												<Textarea
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(event) =>
														field.handleChange(event.target.value)
													}
													rows={3}
													disabled={isReadOnly}
												/>
												<FieldError errors={field.state.meta.errors} />
											</Field>
										)}
									</form.Field>
									<KycFormGrid>
										<form.Field name={`directors[${index}].address.postalCode`}>
											{(field) => (
												<Field
													className="gap-1.5"
													data-invalid={field.state.meta.errors.length > 0}
												>
													<FieldLabel>
														Postal Code{" "}
														<span className="text-destructive">*</span>
													</FieldLabel>
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
										<form.Field name={`directors[${index}].address.country`}>
											{(field) => (
												<Field
													className="gap-1.5"
													data-invalid={field.state.meta.errors.length > 0}
												>
													<FieldLabel>
														Country{" "}
														<span className="text-destructive">*</span>
													</FieldLabel>
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
									<form.Field name={`directors[${index}].idNumber`}>
										{(field) => (
											<Field
												className="gap-1.5"
												data-invalid={field.state.meta.errors.length > 0}
											>
												<FieldLabel>
													ID Number{" "}
													<span className="text-destructive">*</span>
												</FieldLabel>
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
								</FieldGroup>
							</KycEntryCard>
						))}
						{!isReadOnly && (
							<Button
								type="button"
								variant="outline"
								className="uppercase tracking-wide"
								onClick={() =>
									directorsField.pushValue({
										name: "",
										dateOfBirth: "",
										nationality: "",
										address: { address: "", postalCode: "", country: "" },
										idNumber: "",
									})
								}
							>
								<PlusIcon className="size-4" weight="bold" />
								Add Another Director
							</Button>
						)}
					</section>
				)}
			</form.Field>

			<form.Field name="ubos" mode="array">
				{(ubosField) => (
					<section className="space-y-4">
						<h3 className="text-base font-semibold">
							Ultimate Beneficial Owners (UBOs)
						</h3>
						{ubosField.state.value.map((ubo, index) => (
							<KycEntryCard
								key={`ubo-${ubo.name}`}
								title={`UBO ${ubo.name}`}
								onRemove={
									!isReadOnly && ubosField.state.value.length > 1
										? () => ubosField.removeValue(index)
										: undefined
								}
							>
								<FieldGroup className="flex flex-col gap-4">
									<form.Field name={`ubos[${index}].name`}>
										{(field) => (
											<Field
												className="gap-1.5"
												data-invalid={field.state.meta.errors.length > 0}
											>
												<FieldLabel>
													Full Name{" "}
													<span className="text-destructive">*</span>
												</FieldLabel>
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
										<form.Field name={`ubos[${index}].ownershipPercentage`}>
											{(field) => (
												<Field
													className="gap-1.5"
													data-invalid={field.state.meta.errors.length > 0}
												>
													<FieldLabel>
														Ownership Percentage{" "}
														<span className="text-destructive">*</span>
													</FieldLabel>
													<Input
														type="number"
														min={0}
														max={100}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(event) =>
															field.handleChange(Number(event.target.value))
														}
														disabled={isReadOnly}
													/>
													<FieldError errors={field.state.meta.errors} />
												</Field>
											)}
										</form.Field>
										<form.Field name={`ubos[${index}].idNumber`}>
											{(field) => (
												<Field
													className="gap-1.5"
													data-invalid={field.state.meta.errors.length > 0}
												>
													<FieldLabel>
													ID Number{" "}
													<span className="text-destructive">*</span>
												</FieldLabel>
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
									</KycFormGrid>
								</FieldGroup>
							</KycEntryCard>
						))}
						{!isReadOnly && (
							<Button
								type="button"
								variant="outline"
								className="uppercase tracking-wide"
								onClick={() =>
									ubosField.pushValue({
										name: "",
										ownershipPercentage: 0,
										idNumber: "",
									})
								}
							>
								<PlusIcon className="size-4" weight="bold" />
								Add Another UBO
							</Button>
						)}
					</section>
				)}
			</form.Field>

			{!isReadOnly && <KycSaveButton isSaving={isSaving} />}
		</form>
	);
}
