import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/_auth_layout/dashboard/team/")({
	beforeLoad: () => {
		throw redirect({ to: "/dashboard/team/active-users" });
	},
});
