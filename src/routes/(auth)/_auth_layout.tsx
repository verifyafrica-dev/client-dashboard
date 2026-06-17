import {
	createFileRoute,
	Link,
	Navigate,
	Outlet,
} from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { useMeQuery } from "#/api/http/v1/users/users.hooks";
import { AppSidebar } from "#/components/app-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "#/components/ui/sidebar";
import { deleteAllCookies } from "#/lib/cookies";
import { cn } from "#/lib/utils.ts";
import { useAuthStore } from "#/stores/auth-store";

const userMenuItems = [
	{ label: "Profile", to: "/dashboard/profile" },
	{ label: "My Team", to: "/dashboard/team" },
	{ label: "Logout", to: "/" },
] as const;

export const Route = createFileRoute("/(auth)/_auth_layout")({
	component: AuthLayout,
});

function AuthLayout() {
	const getUserQuery = useMeQuery();

	if (getUserQuery.isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2Icon className="size-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!getUserQuery.isLoading && !getUserQuery.data?.id) {
		deleteAllCookies();
		useAuthStore.getState().clearAuth();

		return <Navigate to="/login" />;
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="min-w-0">
				<header className="flex min-h-14 items-center gap-2 border-b px-4 justify-between">
					<SidebarTrigger />
					<Popover>
						<PopoverTrigger asChild>
							<button
								type="button"
								className="flex items-center gap-4 rounded-lg text-left outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
							>
								<Avatar>
									<AvatarImage src="https://github.com/shadcn.pngdeqd" />
									<AvatarFallback>CN</AvatarFallback>
								</Avatar>
								<div>
									<p className="text-sm font-semibold">John Doe</p>
									<p className="text-sm font-medium text-muted-foreground">
										john.doe@example.com
									</p>
								</div>
							</button>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-40 gap-0 p-1">
							<nav className="flex flex-col">
								{userMenuItems.map((item) => (
									<Link
										key={item.to}
										to={item.to as string}
										className={cn(
											"rounded-md px-3 py-2 text-sm font-medium transition-colors",
											"hover:bg-muted",
										)}
									>
										{item.label}
									</Link>
								))}
							</nav>
						</PopoverContent>
					</Popover>
				</header>
				<div className="flex min-w-0 flex-1 flex-col p-4">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
