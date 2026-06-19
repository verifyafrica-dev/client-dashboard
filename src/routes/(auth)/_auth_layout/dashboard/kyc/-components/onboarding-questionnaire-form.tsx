import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";

import {
	KycOnboardingQuestionnaireFormSchema,
	type KycOnboardingQuestionnaireFormValues,
} from "#/api/http/v1/kyc/kyc.types";
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
import { KYC_TARGET_CLIENTS } from "../-constants";
import { SECTION_NAMES } from "../-data";
import { useKyc } from "./kyc-provider";
import {
	Input,
	KycFormGrid,
	KycSaveButton,
	KycSectionHeader,
	Textarea,
} from "./kyc-form-primitives";

function getDefaultValues(
	kycData: ReturnType<typeof useKyc>["kycData"],
): KycOnboardingQuestionnaireFormValues {
	const questionnaire = kycData.onboardingQuestionnaire;

	return {
		purposeOfAccount: questionnaire.purposeOfAccount ?? "",
		targetClients: questionnaire.targetClients ?? KYC_TARGET_CLIENTS[0],
		averageClientTransactionSizeEur:
			questionnaire.averageClientTransactionSizeEur ?? 0,
		highRiskJurisdictionsFATFExposure:
			questionnaire.highRiskJurisdictionsFATFExposure ?? "",
		mainBankingPaymentPartners: questionnaire.mainBankingPaymentPartners ?? "",
		amlCtfOfficerName: questionnaire.amlCtfOfficer?.name ?? "",
		amlCtfOfficerEmail: questionnaire.amlCtfOfficer?.email ?? "",
		kycKybProcess: questionnaire.kycKybProcess ?? "",
	};
}

export function OnboardingQuestionnaireForm() {
	const { kycData, isReadOnly, isSaving, saveCompliance } = useKyc();

	const form = useForm({
		defaultValues: getDefaultValues(kycData),
		validators: {
			onSubmit: KycOnboardingQuestionnaireFormSchema,
		},
		onSubmit: async ({ value }) => {
			await saveCompliance(
				(current) => ({
					...current,
					onboardingQuestionnaire: {
						purposeOfAccount: value.purposeOfAccount,
						targetClients: value.targetClients,
						averageClientTransactionSizeEur:
							value.averageClientTransactionSizeEur,
						highRiskJurisdictionsFATFExposure:
							value.highRiskJurisdictionsFATFExposure,
						mainBankingPaymentPartners: value.mainBankingPaymentPartners,
						amlCtfOfficer: {
							name: value.amlCtfOfficerName,
							email: value.amlCtfOfficerEmail,
						},
						kycKybProcess: value.kycKybProcess,
					},
				}),
				{ currentSection: SECTION_NAMES.ONBOARDING_QUESTIONNAIRE },
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
				title="Onboarding Questionnaire"
				description="Answer the onboarding questionnaire to get started."
			/>

			<FieldGroup>
				<form.Field name="purposeOfAccount">
					{(field) => (
						<Field data-invalid={field.state.meta.errors.length > 0}>
							<FieldLabel htmlFor="purposeOfAccount">
								Purpose of Account <span className="text-destructive">*</span>
							</FieldLabel>
							<Textarea
								id="purposeOfAccount"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								placeholder="Describe the purpose of your account"
								rows={3}
								disabled={isReadOnly}
							/>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>

				<form.Field name="targetClients">
					{(field) => (
						<Field data-invalid={field.state.meta.errors.length > 0}>
							<FieldLabel htmlFor="targetClients">
								Target Clients <span className="text-destructive">*</span>
							</FieldLabel>
							<Select
								value={field.state.value}
								onValueChange={field.handleChange}
								disabled={isReadOnly}
							>
								<SelectTrigger id="targetClients" className="w-full">
									<SelectValue placeholder="Select target clients" />
								</SelectTrigger>
								<SelectContent>
									{KYC_TARGET_CLIENTS.map((client) => (
										<SelectItem key={client} value={client}>
											{client}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>

				<KycFormGrid>
					<form.Field name="averageClientTransactionSizeEur">
						{(field) => (
							<Field data-invalid={field.state.meta.errors.length > 0}>
								<FieldLabel htmlFor="averageTransactionSize">
									Average Client Transaction Size (EUR){" "}
									<span className="text-destructive">*</span>
								</FieldLabel>
								<Input
									id="averageTransactionSize"
									type="number"
									min={0}
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
					<form.Field name="highRiskJurisdictionsFATFExposure">
						{(field) => (
							<Field data-invalid={field.state.meta.errors.length > 0}>
								<FieldLabel htmlFor="highRiskJurisdictions">
									High Risk Jurisdictions (FATF){" "}
									<span className="text-destructive">*</span>
								</FieldLabel>
								<Input
									id="highRiskJurisdictions"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									disabled={isReadOnly}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>
				</KycFormGrid>

				<form.Field name="mainBankingPaymentPartners">
					{(field) => (
						<Field data-invalid={field.state.meta.errors.length > 0}>
							<FieldLabel htmlFor="bankingPartners">
								Main Banking/Payment Partners{" "}
								<span className="text-destructive">*</span>
							</FieldLabel>
							<Input
								id="bankingPartners"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								disabled={isReadOnly}
							/>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>

				<div className="space-y-4">
					<p className="text-sm font-semibold">
						AML/CTF Officer <span className="text-destructive">*</span>
					</p>
					<KycFormGrid>
						<form.Field name="amlCtfOfficerName">
							{(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel htmlFor="amlOfficerName">Name</FieldLabel>
									<Input
										id="amlOfficerName"
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
						<form.Field name="amlCtfOfficerEmail">
							{(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel htmlFor="amlOfficerEmail">Email</FieldLabel>
									<Input
										id="amlOfficerEmail"
										type="email"
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
				</div>

				<form.Field name="kycKybProcess">
					{(field) => (
						<Field data-invalid={field.state.meta.errors.length > 0}>
							<FieldLabel htmlFor="kycKybProcess">
								KYC/KYB Process <span className="text-destructive">*</span>
							</FieldLabel>
							<Textarea
								id="kycKybProcess"
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
			</FieldGroup>

			{!isReadOnly && <KycSaveButton isSaving={isSaving} />}
		</form>
	);
}
