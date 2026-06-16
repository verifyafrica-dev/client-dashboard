import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils.ts";
import type { KycSection } from "../-data";

function SectionStatusIcon({ status }: { status: KycSection["status"] }) {
	const isCompleted = status === "completed";

	return (
		<div
			className={cn(
				"flex size-8 shrink-0 items-center justify-center rounded-full border",
				isCompleted
					? "border-emerald-200 bg-emerald-50 text-emerald-600"
					: "border-slate-200 bg-slate-50 text-slate-400",
			)}
		>
			{isCompleted ? (
				<CheckIcon className="size-4" weight="bold" />
			) : (
				<XIcon className="size-4" weight="bold" />
			)}
		</div>
	);
}

export function KycSectionList({ sections }: { sections: KycSection[] }) {
	return (
		<div className="space-y-3">
			{sections.map((section) => (
				<div
					key={section.path}
					className="flex items-center gap-4 rounded-xl border bg-card px-4 py-5 sm:px-5"
				>
					<SectionStatusIcon status={section.status} />

					<div className="min-w-0 flex-1">
						<p className="font-semibold text-foreground">{section.title}</p>
						<p className="mt-1 text-sm text-muted-foreground">
							{section.description}
						</p>
					</div>

					<Button
						variant="outline"
						size="sm"
						className="shrink-0 cursor-pointer px-4 text-xs font-semibold tracking-wide text-primary uppercase"
						asChild
					>
						<Link to="/dashboard/kyc" search={{ section: section.path }}>
							Edit
						</Link>
					</Button>
				</div>
			))}
		</div>
	);
}
