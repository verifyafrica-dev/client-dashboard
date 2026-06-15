import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "#/components/app-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
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
				<header className="flex min-h-14 items-center gap-2 border-b px-4 justify-between">
					<SidebarTrigger />
					<div className="flex items-center gap-4">
						<Avatar>
							<AvatarImage src="https://github.com/shadcn.pngdeqd" />
							<AvatarFallback>CN</AvatarFallback>
						</Avatar>
						<div>
							<p className="text-sm font-semibold">John Doe</p>
							<p className="text-sm text-muted-foreground font-medium">
								john.doe@example.com
							</p>
						</div>
					</div>
				</header>
				<div className="flex flex-1 flex-col p-4">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
