import { ArrowLeftIcon, InfoIcon } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils.ts";
import { KycSectionContent } from "./-components/kyc-section-content";
import { KycSectionList } from "./-components/kyc-section-list";
import {
	getKycOverallStatus,
	getSectionByPath,
	KYC_SECTION_PATHS,
	sections,
} from "./-data";

const kycSearchSchema = z.object({
	section: z.enum(KYC_SECTION_PATHS).optional(),
});

export const Route = createFileRoute("/(auth)/_auth_layout/dashboard/kyc/")({
	validateSearch: kycSearchSchema,
	component: KycPage,
});

function KycStatusBadge({
	label,
	variant,
}: {
	label: string;
	variant: "not-started" | "in-progress" | "completed";
}) {
	return (
		<Badge
			variant="outline"
			className={cn(
				"gap-1.5 px-3 py-1 text-xs font-medium",
				variant === "not-started" && "border-slate-200 bg-slate-50 text-slate-600",
				variant === "in-progress" &&
					"border-amber-200 bg-amber-50 text-amber-800",
				variant === "completed" &&
					"border-emerald-200 bg-emerald-50 text-emerald-700",
			)}
		>
			<InfoIcon className="size-3.5" weight="fill" />
			{label}
		</Badge>
	);
}

function KycPage() {
	const { section: activeSectionPath } = Route.useSearch();
	const activeSection = getSectionByPath(activeSectionPath);
	const overallStatus = getKycOverallStatus(sections);

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						KYC Verification
					</h1>
					<p className="mt-1 max-w-2xl text-sm text-muted-foreground">
						Complete your Know Your Customer verification to unlock all features
					</p>
				</div>
				<KycStatusBadge
					label={overallStatus.label}
					variant={overallStatus.variant}
				/>
			</div>

			{activeSection ? (
				<div className="flex flex-col gap-4">
					<Button
						variant="ghost"
						size="sm"
						className="w-fit cursor-pointer px-0 hover:bg-transparent"
						asChild
					>
						<Link to="/dashboard/kyc">
							<ArrowLeftIcon className="size-4" weight="bold" />
							Back to KYC overview
						</Link>
					</Button>
					<KycSectionContent section={activeSection} />
				</div>
			) : (
				<KycSectionList sections={sections} />
			)}
		</div>
	);
}
