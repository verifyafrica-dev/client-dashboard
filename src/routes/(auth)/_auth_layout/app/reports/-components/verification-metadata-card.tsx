import type { VerificationRequestDetail } from "#/api/http/v2/verifications/verifications.types";
import { Card, CardContent } from "#/components/ui/card";
import {
	formatReportDate,
	formatVerificationType,
	getVerificationTargetName,
	mapVerificationRequestToReport,
} from "../-data";
import { ReportDetailField } from "./report-detail-field";
import { VerificationStatusBadge } from "./verification-badges";

type VerificationMetadataCardProps = {
	verification: VerificationRequestDetail;
};

export function VerificationMetadataCard({
	verification,
}: VerificationMetadataCardProps) {
	const report = mapVerificationRequestToReport(verification, "live");

	return (
		<Card className="bg-muted/20">
			<CardContent className="grid gap-4 pt-0 sm:grid-cols-2">
				<ReportDetailField
					label="Verification ID"
					value={verification.id}
					mono
				/>
				<ReportDetailField
					label="Batch ID"
					value={verification.batch_id ?? "N/A"}
					mono
				/>
				<ReportDetailField
					label="Type"
					value={formatVerificationType(report)}
				/>
				<ReportDetailField
					label="Status"
					value={<VerificationStatusBadge status={verification.status} />}
				/>
				<ReportDetailField
					label="Subject"
					value={getVerificationTargetName(verification)}
				/>
				<ReportDetailField
					label="Cost"
					value={`${verification.currency} ${verification.cost_charged}`}
				/>
				<ReportDetailField
					label="Created At"
					value={formatReportDate(verification.created_at)}
				/>
				{verification.reference ? (
					<ReportDetailField
						label="Reference"
						value={verification.reference}
						mono
					/>
				) : null}
			</CardContent>
		</Card>
	);
}
