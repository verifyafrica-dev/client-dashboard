import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/_layout/dashboard/")({
	component: DashboardPage,
});

function DashboardPage() {
	return (
		<div>
			<h1 className="text-2xl font-semibold">Dashboard</h1>
			<p className="mt-2 text-muted">
				Welcome to your authenticated dashboard.
			</p>
		</div>
	);
}
