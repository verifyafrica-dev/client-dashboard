import { HouseIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "#/components/ui/sidebar";

const navItems = [
	{
		title: "Dashboard",
		to: "/dashboard",
		icon: HouseIcon,
	},
] as const;

export function AppSidebar() {
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className="flex min-h-14 max-h-14 items-center border-b border-sidebar-border px-4 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
				<picture className="group-data-[collapsible=icon]:hidden">
					<img
						src="/assets/brand/logo.svg"
						alt="VerifyAfrica"
						className="h-12 w-auto"
					/>
				</picture>
				<picture className="hidden group-data-[collapsible=icon]:block">
					<img
						src="/assets/brand/logo-square.svg"
						alt="VerifyAfrica"
						className="size-8"
					/>
				</picture>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{navItems.map((item) => (
								<SidebarMenuItem key={item.to}>
									<SidebarMenuButton asChild>
										<Link to={item.to}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter />
		</Sidebar>
	);
}
