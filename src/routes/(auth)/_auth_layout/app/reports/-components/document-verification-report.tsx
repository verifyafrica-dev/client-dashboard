import type { DocumentVerificationRequestDetail } from "../-report-detail-types";
import { DocumentVerificationIdentityCard } from "./document-verification-identity-card";
import { ReportOverviewCard } from "./report-overview-card";

function formatVerificationType(value: string) {
	return value
		.replace(/_/g, " ")
		.replace(/-/g, " ")
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function DocumentVerificationReport({
	verification,
}: {
	verification: DocumentVerificationRequestDetail;
}) {
	console.log(verification);
	return (
		<div className="flex flex-col gap-6">
			<ReportOverviewCard
				status={verification.status}
				verificationType={formatVerificationType(
					verification.verification_type,
				)}
				reference={verification.reference}
				createdAt={new Date(verification.created_at).toLocaleString()}
				verificationEvent={verification.response_data.event}
				customerEmail={verification.input_data.email}
				customerUniqueId={verification.input_data.customer_unique_id as string}
				country={verification.input_data.country as string}
			/>

			<DocumentVerificationIdentityCard
				identity={{
					fullName:
						verification.response_data.additional_data?.document?.proof
							?.first_name,
					firstName:
						verification.response_data.additional_data?.document?.proof
							?.first_name,
					lastName:
						verification.response_data.additional_data?.document?.proof
							?.last_name,
					dateOfBirth:
						verification.response_data.additional_data?.document?.proof?.dob,
					gender:
						verification.response_data.additional_data?.document?.proof?.gender,
					nationality: verification.response_data.additional_data?.document
						?.proof?.country as string,
					placeOfBirth:
						verification.response_data.additional_data?.document?.proof
							?.place_of_birth,
				}}
			/>
		</div>
	);
}
