import type { ReactNode } from "react";

export function ReportsTableShell({ children }: { children: ReactNode }) {
	return (
		<div className="w-full max-w-full min-w-0 rounded-lg border">
			{children}
		</div>
	);
}
