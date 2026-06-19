import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { useEffect } from "react";

import {
	KycAuthorizedSignatureFormSchema,
	type KycAuthorizedSignatureFormValues,
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
	Input,
	KycDatePicker,
	KycSaveButton,
	KycSectionHeader,
} from "./kyc-form-primitives";

function getDefaultValues(
	kycData: ReturnType<typeof useKyc>["kycData"],
): KycAuthorizedSignatureFormValues {
	return {
		fullName: kycData.authorizedSignatory?.fullName ?? "",
		positionTitle: kycData.authorizedSignatory?.positionTitle ?? "",
		date:
			kycData.authorizedSignatory?.date ||
			format(new Date(), "yyyy-MM-dd"),
		signature: kycData.authorizedSignatory?.signature ?? "",
	};
}

export function AuthorizedSignatureForm() {
	const { kycData, isReadOnly, isSaving, saveCompliance } = useKyc();

	const form = useForm({
		defaultValues: getDefaultValues(kycData),
		validators: {
			onSubmit: KycAuthorizedSignatureFormSchema,
		},
		onSubmit: async ({ value }) => {
			await saveCompliance(
				(current) => ({
					...current,
					authorizedSignatory: value,
				}),
				{ currentSection: SECTION_NAMES.AUTHORIZED_SIGNATURE },
			);
		},
	});

	useEffect(() => {
		form.reset(getDefaultValues(kycData));
	}, [form, kycData]);

	const signatureDate = form.state.values.date
		? new Date(form.state.values.date)
		: undefined;

	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
		>
			<KycSectionHeader
				title="Authorized Signature"
				description="Provide your authorized signature."
			/>

			<FieldGroup>
				<form.Field name="fullName">
					{(field) => (
						<Field data-invalid={field.state.meta.errors.length > 0}>
							<FieldLabel htmlFor="signatoryName">
								Full Name <span className="text-destructive">*</span>
							</FieldLabel>
							<Input
								id="signatoryName"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								placeholder="Enter the full name of the authorized signatory"
								disabled={isReadOnly}
							/>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>

				<form.Field name="positionTitle">
					{(field) => (
						<Field data-invalid={field.state.meta.errors.length > 0}>
							<FieldLabel htmlFor="signatoryPosition">
								Position Title <span className="text-destructive">*</span>
							</FieldLabel>
							<Input
								id="signatoryPosition"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								placeholder="Enter the position title of the authorized signatory"
								disabled={isReadOnly}
							/>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>

				<form.Field name="date">
					{(field) => (
						<Field data-invalid={field.state.meta.errors.length > 0}>
							<FieldLabel htmlFor="signatureDate">
								Date <span className="text-destructive">*</span>
							</FieldLabel>
							<KycDatePicker
								id="signatureDate"
								value={signatureDate}
								onChange={(date) =>
									field.handleChange(date ? format(date, "yyyy-MM-dd") : "")
								}
								disabled={isReadOnly}
							/>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>

				<form.Field name="signature">
					{(field) => (
						<Field data-invalid={field.state.meta.errors.length > 0}>
							<FieldLabel htmlFor="signature">
								Signature <span className="text-destructive">*</span>
							</FieldLabel>
							<Input
								id="signature"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								placeholder="Type your signature (e.g., John Smith)"
								className="font-[family-name:var(--font-signature,cursive)] text-lg italic"
								disabled={isReadOnly}
							/>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>
			</FieldGroup>

			{!isReadOnly && <KycSaveButton isSaving={isSaving} />}
		</form>
	);
}
