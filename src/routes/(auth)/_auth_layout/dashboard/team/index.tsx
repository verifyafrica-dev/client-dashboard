import { createFileRoute } from "@tanstack/react-router";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";

export const Route = createFileRoute("/(auth)/_auth_layout/dashboard/team/")({
	component: TeamPage,
});

function TeamPage() {
	return (
		<Card className="mx-auto w-full max-w-3xl">
			<CardHeader>
				<CardTitle>My Team</CardTitle>
				<CardDescription>
					Manage your team members and permissions.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground">
					Team management is coming soon.
				</p>
			</CardContent>
		</Card>
	);
}
