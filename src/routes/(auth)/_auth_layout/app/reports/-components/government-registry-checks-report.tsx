import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { asRecord, displayValue } from "../-utils";
import { ReportOverviewCard } from "./report-overview-card";
import { ReportDetailField } from "./report-detail-field";
import { ProofImagePreviewDialog } from "./verification-proofs/proof-image-preview-dialog";
import type {
	GovernmentRegistryChecksVerificationRequestDetail,
	GovernmentRegistryChecksResponsePayload,
} from "#/api/http/v2/verifications/verifications.types";

type RenderField = {
	key: string;
	label: string;
	value: ReactNode;
};

function formatVerificationType(value: string) {
	return value
		.replace(/_/g, " ")
		.replace(/-/g, " ")
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

function isImageString(value: string) {
	const normalized = value.trim().toLowerCase();
	return (
		normalized.startsWith("data:image/") ||
		normalized.startsWith("http://") ||
		normalized.startsWith("https://")
	);
}

function SectionCard({
	title,
	fields,
}: {
	title: string;
	fields: RenderField[];
}) {
	if (fields.length === 0) {
		return null;
	}

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base font-semibold">{title}</CardTitle>
			</CardHeader>
			<CardContent className="grid gap-4 sm:grid-cols-2">
				{fields.map((field) => (
					<ReportDetailField
						key={field.key}
						label={field.label}
						value={field.value}
					/>
				))}
			</CardContent>
		</Card>
	);
}

export function GovernmentRegistryChecksReport({
	verification,
}: {
	verification: GovernmentRegistryChecksVerificationRequestDetail;
}) {
	const responseData = asRecord(verification.response_data) ?? {};
	const responsePayload = (asRecord(responseData.data) ??
		responseData) as GovernmentRegistryChecksResponsePayload;
	const sourceData = asRecord(responsePayload.data) ?? {};
	const addressData = asRecord(sourceData.address);

	const fullAddress = [
		addressData?.street,
		addressData?.town,
		addressData?.lga,
		addressData?.state,
	]
		.filter((part) => typeof part === "string" && part.trim().length > 0)
		.join(", ");

	const personalInformationFields: RenderField[] = [
		{
			key: "first_name",
			label: "First Name",
			value: displayValue(sourceData.first_name),
		},
		{
			key: "last_name",
			label: "Last Name",
			value: displayValue(sourceData.last_name),
		},
		{
			key: "middle_name",
			label: "Middle Name",
			value: displayValue(sourceData.middle_name),
		},
		{ key: "gender", label: "Gender", value: displayValue(sourceData.gender) },
		{
			key: "date_of_birth",
			label: "Date of Birth",
			value: displayValue(sourceData.date_of_birth),
		},
	];

	const imageFields = [
		{ key: "image", label: "Registry Photo", value: sourceData.image },
	].filter(
		(field): field is { key: string; label: string; value: string } =>
			typeof field.value === "string" && isImageString(field.value),
	);

	const documentDetailFields: RenderField[] = [
		{
			key: "id_type",
			label: "ID Type",
			value: displayValue(sourceData.id_type),
		},
		{ key: "id", label: "ID", value: displayValue(sourceData.id) },
		{
			key: "reference",
			label: "Reference",
			value: displayValue(sourceData.reference),
		},
	];

	const contactLocationFields: RenderField[] = [
		{
			key: "phone_number",
			label: "Phone Number",
			value: displayValue(sourceData.phone_number),
		},
		{
			key: "address",
			label: "Address",
			value: displayValue(fullAddress),
		},
	];

	const additionalDetailFields: RenderField[] = [
		{
			key: "religion",
			label: "Religion",
			value: displayValue(sourceData.religion),
		},
		{
			key: "birth_country",
			label: "Birth Country",
			value: displayValue(sourceData.birth_country),
		},
		{
			key: "next_of_kin_state",
			label: "Next Of Kin State",
			value: displayValue(sourceData.next_of_kin_state),
		},
		{
			key: "requested_by",
			label: "Requested By",
			value: displayValue(sourceData.requested_by),
		},
	];

	const country =
		typeof responsePayload.country === "string"
			? responsePayload.country
			: typeof verification.input_data.country === "string"
				? verification.input_data.country
				: undefined;

	const customerEmail =
		typeof responsePayload.email === "string"
			? responsePayload.email
			: typeof verification.input_data.email === "string"
				? verification.input_data.email
				: undefined;

	return (
		<div className="space-y-6">
			<ReportOverviewCard
				status={verification.status}
				verificationType={formatVerificationType(
					verification.verification_type,
				)}
				reference={verification.reference}
				createdAt={new Date(verification.created_at).toLocaleString()}
				verificationEvent={
					typeof responsePayload.event === "string"
						? responsePayload.event
						: undefined
				}
				customerEmail={customerEmail}
				customerUniqueId={
					typeof responsePayload.customer_unique_id === "string"
						? responsePayload.customer_unique_id
						: undefined
				}
				country={country}
			/>

			<SectionCard
				title="Personal Information"
				fields={personalInformationFields}
			/>

			{imageFields.length > 0 ? (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base font-semibold">Images</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-4 sm:grid-cols-2">
						{imageFields.map((field) => (
							<ReportDetailField
								key={field.key}
								label={field.label}
								value={
									<ProofImagePreviewDialog
										src={field.value}
										alt={field.label}
										label={field.label}
										thumbnailClassName="max-h-40 rounded-md border object-cover"
									/>
								}
							/>
						))}
					</CardContent>
				</Card>
			) : null}

			<SectionCard
				title="Document Details"
				fields={documentDetailFields}
			/>
			<SectionCard
				title="Contact & Location"
				fields={contactLocationFields}
			/>
			<SectionCard
				title="Additional Details"
				fields={additionalDetailFields}
			/>
		</div>
	);
}
