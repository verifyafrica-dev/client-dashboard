import {
	ArrowLeftIcon,
	ArrowsClockwiseIcon,
	DownloadSimpleIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
	useRefreshVerificationStatusV2Mutation,
	useVerificationRequestDetailV2Query,
} from "#/api/http/v2/verifications/verifications.hooks";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { generatePDFWithColorSupport } from "#/lib/pdfHelpers";
import { isPlainObject } from "#/lib/validators";
import { cn } from "#/lib/utils.ts";
import { VerificationMetadataCard } from "../-components/verification-metadata-card";
import { VerificationResultPanel } from "../-components/verification-result-panel";

export const Route = createFileRoute(
	"/(auth)/_auth_layout/dashboard/reports/$id/",
)({
	component: VerificationReportDetailPage,
});

function VerificationReportDetailPage() {
	const { id } = Route.useParams();
	const reportRef = useRef<HTMLDivElement>(null);
	const [isDownloading, setIsDownloading] = useState(false);

	const verificationQuery = useVerificationRequestDetailV2Query(id, Boolean(id));
	const refreshMutation = useRefreshVerificationStatusV2Mutation();
	const verification = verificationQuery.data;

	const resultData = useMemo(() => {
		if (!verification?.response_data) {
			return null;
		}

		const responseData = verification.response_data;

		if (isPlainObject(responseData.data)) {
			return responseData.data as Record<string, unknown>;
		}

		return isPlainObject(responseData)
			? (responseData as Record<string, unknown>)
			: null;
	}, [verification?.response_data]);

	const isRefreshEligible = useMemo(() => {
		if (!verification?.source?.toLowerCase().includes("shufti")) {
			return false;
		}

		const createdAtMs = new Date(verification.created_at).getTime();
		if (Number.isNaN(createdAtMs)) {
			return false;
		}

		return Date.now() - createdAtMs < 24 * 60 * 60 * 1000;
	}, [verification]);

	async function handleRefresh() {
		if (!verification) {
			return;
		}

		try {
			await refreshMutation.mutateAsync(verification.id);
			toast.success("Verification data refreshed.");
		} catch {
			toast.error("Failed to refresh verification data.");
		}
	}

	async function handleDownloadPdf() {
		if (!verification || !reportRef.current) {
			return;
		}

		setIsDownloading(true);

		try {
			await generatePDFWithColorSupport(reportRef, {
				filename: `verification-${verification.id}.pdf`,
			});
		} catch {
			toast.error("Failed to download PDF. Please try again.");
		} finally {
			setIsDownloading(false);
		}
	}

	return (
		<div className="flex min-w-0 flex-col gap-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex flex-col gap-3">
					<Button variant="ghost" className="w-fit px-4" asChild>
						<Link to="/dashboard/reports">
							<ArrowLeftIcon />
							Back to Reports
						</Link>
					</Button>
					<div className="space-y-1">
						<h1 className="text-2xl font-semibold tracking-tight">
							Verification Report
						</h1>
						<p className="text-sm text-muted-foreground">
							Review the complete verification outcome and downloadable report.
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					{verification && isRefreshEligible ? (
						<Button
							type="button"
							variant="outline"
							className="cursor-pointer tracking-wide"
							disabled={refreshMutation.isPending}
							onClick={() => void handleRefresh()}
						>
							<ArrowsClockwiseIcon
								className={cn(refreshMutation.isPending && "animate-spin")}
								weight="bold"
							/>
							{refreshMutation.isPending ? "Refreshing..." : "Refresh"}
						</Button>
					) : null}
					<Button
						type="button"
						variant="outline"
						className="cursor-pointer tracking-wide"
						disabled={!verification || isDownloading}
						onClick={() => void handleDownloadPdf()}
					>
						<DownloadSimpleIcon weight="bold" />
						{isDownloading ? "Downloading..." : "Download PDF"}
					</Button>
				</div>
			</div>

			{verificationQuery.isPending ? (
				<Card>
					<CardContent className="space-y-4 pt-6">
						<Skeleton className="h-6 w-48" />
						<div className="grid gap-4 sm:grid-cols-2">
							{Array.from({ length: 6 }).map((_, index) => (
								<Skeleton key={index} className="h-14 w-full" />
							))}
						</div>
						<Skeleton className="h-64 w-full" />
					</CardContent>
				</Card>
			) : verificationQuery.isError || !verification ? (
				<Card>
					<CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-4 pt-6 text-center">
						<p className="text-sm text-muted-foreground">
							Failed to load verification report. It may not exist or you may not
							have access.
						</p>
						<Button
							type="button"
							variant="outline"
							className="cursor-pointer"
							onClick={() => void verificationQuery.refetch()}
						>
							Try Again
						</Button>
					</CardContent>
				</Card>
			) : (
				<div ref={reportRef} className="flex flex-col gap-6">
					<VerificationMetadataCard verification={verification} />
					<VerificationResultPanel data={resultData} />
				</div>
			)}
		</div>
	);
}
