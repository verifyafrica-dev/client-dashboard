import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/_auth_layout/app/team/")({
	beforeLoad: () => {
		throw redirect({ to: "/app/team/active-users" });
	},
});
