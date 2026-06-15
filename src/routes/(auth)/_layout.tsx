import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "#/components/app-sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "#/components/ui/sidebar";

export const Route = createFileRoute("/(auth)/_layout")({
	component: AuthLayout,
});

function AuthLayout() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex min-h-14 items-center gap-2 border-b px-4">
					<SidebarTrigger />
				</header>
				<div className="flex flex-1 flex-col p-4">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
