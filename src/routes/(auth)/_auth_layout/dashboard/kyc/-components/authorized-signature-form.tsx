import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
	KycAuthorizedSignatureFormSchema,
	type KycAuthorizedSignatureFormValues,
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
import {
	KYC_SIGNATURE_METHODS,
	type KycSignatureMethod,
} from "../-constants";
import { SECTION_NAMES } from "../-data";
import {
	inferSignatureMethod,
	isDataUrlSignature,
	KYC_SIGNATURE_MIME_TYPES,
	readFileAsDataUrl,
	validateKycFile,
} from "../-upload-utils";
import { useKyc } from "./kyc-provider";
import {
	Input,
	KycDatePicker,
	KycFileUpload,
	KycSaveButton,
	KycSectionHeader,
} from "./kyc-form-primitives";

function getDefaultValues(
	kycData: ReturnType<typeof useKyc>["kycData"],
): KycAuthorizedSignatureFormValues {
	return {
		fullName: kycData.authorizedSignatory?.fullName ?? "",
		positionTitle: kycData.authorizedSignatory?.positionTitle ?? "",
		date: format(new Date(), "yyyy-MM-dd"),
		signature: kycData.authorizedSignatory?.signature ?? "",
	};
}

export function AuthorizedSignatureForm() {
	const { kycData, isReadOnly, isSaving, saveCompliance } = useKyc();
	const [signatureMethod, setSignatureMethod] = useState<KycSignatureMethod>(
		() =>
			inferSignatureMethod(kycData.authorizedSignatory?.signature ?? ""),
	);
	const [uploadFiles, setUploadFiles] = useState<File[]>([]);

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
		setSignatureMethod(
			inferSignatureMethod(kycData.authorizedSignatory?.signature ?? ""),
		);
		setUploadFiles([]);
	}, [form, kycData]);

	async function handleSignatureUpload(files: File[]) {
		setUploadFiles(files);

		const file = files[0];
		if (!file) {
			form.setFieldValue("signature", "");
			return;
		}

		const validation = validateKycFile(file, KYC_SIGNATURE_MIME_TYPES);
		if (!validation.valid) {
			toast.error(validation.error);
			setUploadFiles([]);
			return;
		}

		try {
			const dataUrl = await readFileAsDataUrl(file);
			form.setFieldValue("signature", dataUrl);
		} catch {
			toast.error("Failed to read signature image");
			setUploadFiles([]);
		}
	}

	function handleSignatureMethodChange(method: KycSignatureMethod) {
		setSignatureMethod(method);
		setUploadFiles([]);
		form.setFieldValue("signature", "");
	}

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
						<Field
							data-invalid={field.state.meta.errors.length > 0}
							className="gap-1.5"
						>
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
						<Field
							data-invalid={field.state.meta.errors.length > 0}
							className="gap-1.5"
						>
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
						<Field
							data-invalid={field.state.meta.errors.length > 0}
							className="gap-1.5"
						>
							<FieldLabel htmlFor="signatureDate">Date</FieldLabel>
							<KycDatePicker
								id="signatureDate"
								value={field.state.value}
								onChange={(date) =>
									field.handleChange(date ? format(date, "yyyy-MM-dd") : "")
								}
								disabled
							/>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>

				<Field className="gap-1.5">
					<FieldLabel htmlFor="signatureMethod">
						Signature Method <span className="text-destructive">*</span>
					</FieldLabel>
					<Select
						value={signatureMethod}
						onValueChange={(value) =>
							handleSignatureMethodChange(value as KycSignatureMethod)
						}
						disabled={isReadOnly}
					>
						<SelectTrigger id="signatureMethod" className="w-full">
							<SelectValue placeholder="Select signature method" />
						</SelectTrigger>
						<SelectContent>
							{KYC_SIGNATURE_METHODS.map((method) => (
								<SelectItem key={method.value} value={method.value}>
									{method.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>

				<form.Field name="signature">
					{(field) => (
						<Field
							data-invalid={field.state.meta.errors.length > 0}
							className="gap-1.5"
						>
							<FieldLabel htmlFor="signature">
								Signature <span className="text-destructive">*</span>
							</FieldLabel>
							<p className="text-sm text-muted-foreground">
								Please provide your signature using the selected method
							</p>

							{signatureMethod === "type" ? (
								<Input
									id="signature"
									value={
										isDataUrlSignature(field.state.value)
											? ""
											: field.state.value
									}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									placeholder="Type your signature (e.g., John Smith)"
									className="font-[family-name:var(--font-signature,cursive)] text-lg italic"
									disabled={isReadOnly}
								/>
							) : (
								<div className="space-y-3">
									<KycFileUpload
										value={uploadFiles}
										onValueChange={(files) => void handleSignatureUpload(files)}
										accept="image/jpeg,image/png,image/gif"
										multiple={false}
										disabled={isReadOnly}
									/>
									{isDataUrlSignature(field.state.value) && (
										<div className="rounded-lg border bg-muted/30 p-4">
											<p className="mb-2 text-xs font-medium text-muted-foreground">
												Signature preview
											</p>
											<img
												src={field.state.value}
												alt="Uploaded signature"
												className="max-h-32 object-contain"
											/>
										</div>
									)}
								</div>
							)}

							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>
			</FieldGroup>

			{!isReadOnly && <KycSaveButton isSaving={isSaving} />}
		</form>
	);
}
