import {
	HouseIcon,
	type IconWeight,
	SquaresFourIcon,
	UserCircleIcon,
} from "@phosphor-icons/react";
import { Link, useRouterState } from "@tanstack/react-router";
import type { ComponentType, SVGProps } from "react";
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
import { cn } from "#/lib/utils.ts";

const navItems = [
	{
		title: "Dashboard",
		to: "/dashboard",
		icon: HouseIcon,
		isExact: true,
	},
	{
		title: "Products",
		to: "/dashboard/products",
		icon: SquaresFourIcon,
	},
	{
		title: "Profile",
		to: "/dashboard/profile",
		icon: UserCircleIcon,
	},
] as const;

function normalizePath(path: string) {
	return path.replace(/\/$/, "") || "/";
}

function isNavItemActive(
	pathname: string,
	item: { to: string; isExact?: boolean },
) {
	const currentPath = normalizePath(pathname);
	const itemPath = normalizePath(item.to);

	if (item.isExact) {
		return currentPath === itemPath;
	}

	return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

function SidebarNavItem({
	item,
}: {
	item: {
		title: string;
		to: (typeof navItems)[number]["to"];
		icon: ComponentType<SVGProps<SVGSVGElement> & { weight?: IconWeight }>;
		isExact?: boolean;
	};
}) {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const isActive = isNavItemActive(pathname, item);

	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				asChild
				isActive={isActive}
				className={cn(
					isActive
						? "bg-sidebar-accent font-medium text-sidebar-accent-foreground hover:bg-sidebar-accent"
						: "bg-transparent hover:bg-transparent active:bg-transparent",
				)}
			>
				<Link
					to={item.to}
					activeOptions={item.isExact ? { exact: true } : undefined}
				>
					<item.icon weight={isActive ? "bold" : "regular"} />
					<span className="font-medium">{item.title}</span>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

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
								<SidebarNavItem key={item.to} item={item} />
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter />
		</Sidebar>
	);
}
