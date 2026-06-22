import { createFileRoute, Link, Navigate, Outlet, useLocation } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { useMeQuery } from "#/api/http/v1/users/users.hooks";
import { AppSidebar } from "#/components/app-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
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
import { useLogout } from "#/hooks/use-logout";
import { deleteAllCookies } from "#/lib/cookies";
import { buildLoginRedirectUrl } from "#/lib/redirect";
import { useAuthStore } from "#/stores/auth-store";
import { cn } from "#/lib/utils.ts";
import { getUserInitials } from "#/routes/(auth)/_auth_layout/dashboard/team/-data";

const userMenuLinks = [
	{ label: "Profile", to: "/dashboard/profile" },
	{ label: "My Team", to: "/dashboard/team" },
] as const;

export const Route = createFileRoute("/(auth)/_auth_layout")({
	component: AuthLayout,
});

function AuthLayout() {
	const location = useLocation();
	const getUserQuery = useMeQuery();
	const { logout, isLoggingOut } = useLogout();

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
		return <Navigate to={buildLoginRedirectUrl(location.pathname)} replace />;
	}

	const user = getUserQuery.data;
	const displayName =
		[user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
		user?.email ||
		"";
	const initials = getUserInitials(displayName);

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
								className="flex items-center gap-4 rounded-lg text-left outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
							>
								<Avatar>
									{user?.avatar_url ? (
										<AvatarImage src={user.avatar_url} alt={displayName} />
									) : null}
									<AvatarFallback>{initials}</AvatarFallback>
								</Avatar>
								<div>
									<p className="text-sm font-semibold">{displayName}</p>
									<p className="text-sm font-medium text-muted-foreground">
										{user?.email}
									</p>
								</div>
							</button>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-40 gap-0 p-1">
							<nav className="flex flex-col">
								{userMenuLinks.map((item) => (
									<Link
										key={item.to}
										to={item.to}
										className={cn(
											"rounded-md px-3 py-2 text-sm font-medium transition-colors",
											"hover:bg-muted",
										)}
									>
										{item.label}
									</Link>
								))}
								<Button
									variant="ghost"
									size="sm"
									className="w-full justify-start px-3"
									onClick={() => logout()}
									disabled={isLoggingOut}
								>
									Logout
								</Button>
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
