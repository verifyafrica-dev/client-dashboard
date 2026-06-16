import { createFileRoute } from "@tanstack/react-router";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";

export const Route = createFileRoute(
	"/(auth)/_auth_layout/dashboard/team/active-users/",
)({
	component: ActiveUsersPage,
});

function ActiveUsersPage() {
	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Active Users</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					View and manage users on your team.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Team members</CardTitle>
					<CardDescription>
						Users who currently have access to your workspace.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Active users management is coming soon.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
