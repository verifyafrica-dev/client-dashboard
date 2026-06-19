import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";

import {
	KycComplianceDeclarationsFormSchema,
	type KycComplianceDeclarationsFormValues,
} from "#/api/http/v1/kyc/kyc.types";
import { Checkbox } from "#/components/ui/checkbox";
import { Label } from "#/components/ui/label";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { KYC_DECLARATIONS } from "../-constants";
import { SECTION_NAMES } from "../-data";
import { useKyc } from "./kyc-provider";
import { KycSaveButton, KycSectionHeader } from "./kyc-form-primitives";

function getDefaultValues(
	kycData: ReturnType<typeof useKyc>["kycData"],
): KycComplianceDeclarationsFormValues {
	const declarations = kycData.complianceDeclarations;

	return {
		notEngagedInProhibitedActivities:
			declarations.notEngagedInProhibitedActivities ?? false,
		noDirectorsUbosOnSanctionsLists:
			declarations.noDirectorsUbosOnSanctionsLists ?? false,
		informationTrueAndComplete:
			declarations.informationTrueAndComplete ?? false,
		agreeToProvideSupportingDocuments:
			declarations.agreeToProvideSupportingDocuments ?? false,
	};
}

export function ComplianceDeclarationsForm() {
	const { kycData, isReadOnly, isSaving, saveCompliance } = useKyc();

	const form = useForm({
		defaultValues: getDefaultValues(kycData),
		validators: {
			onSubmit: KycComplianceDeclarationsFormSchema,
		},
		onSubmit: async ({ value }) => {
			await saveCompliance(
				(current) => ({
					...current,
					complianceDeclarations: value,
				}),
				{ currentSection: SECTION_NAMES.COMPLIANCE_DOCUMENTS },
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
				title="Compliance Declarations"
				description="Please confirm the following declarations by checking the boxes below:"
			/>

			<FieldGroup className="space-y-5">
				{KYC_DECLARATIONS.map((declaration) => (
					<form.Field key={declaration.key} name={declaration.key}>
						{(field) => (
							<Field data-invalid={field.state.meta.errors.length > 0}>
								<div className="flex items-start gap-3">
									<Checkbox
										id={declaration.key}
										checked={field.state.value}
										onCheckedChange={(checked) =>
											field.handleChange(checked === true)
										}
										disabled={isReadOnly}
									/>
									<Label
										htmlFor={declaration.key}
										className="text-sm leading-relaxed font-normal"
									>
										{declaration.label}
										<span className="text-destructive"> *</span>
									</Label>
								</div>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>
				))}
			</FieldGroup>

			{!isReadOnly && <KycSaveButton isSaving={isSaving} />}
		</form>
	);
}
