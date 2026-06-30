import type { ReactNode } from "react";

import { cn } from "#/lib/utils.ts";

type ReportDetailFieldProps = {
	label: string;
	value: ReactNode;
	mono?: boolean;
	className?: string;
};

export function ReportDetailField({
	label,
	value,
	mono = false,
	className,
}: ReportDetailFieldProps) {
	return (
		<div className={cn("flex flex-col gap-1", className)}>
			<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
				{label}
			</p>
			<div
				className={cn(
					"text-sm text-foreground",
					mono && "font-mono text-xs break-all",
				)}
			>
				{value}
			</div>
		</div>
	);
}
