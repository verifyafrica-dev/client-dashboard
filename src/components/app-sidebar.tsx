import {
	CaretRightIcon,
	ClipboardTextIcon,
	CreditCardIcon,
	HouseIcon,
	type IconWeight,
	KeyIcon,
	ShieldCheckIcon,
	SquaresFourIcon,
	UserCircleIcon,
	UsersThreeIcon,
} from "@phosphor-icons/react";
import { Link, useRouterState } from "@tanstack/react-router";
import type { ComponentType, SVGProps } from "react";
import * as React from "react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "#/components/ui/collapsible";
import {
	Sidebar,
	SidebarContent,
	// SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "#/components/ui/sidebar";
import { cn } from "#/lib/utils.ts";

const teamSubItems = [
	{ title: "Active Users", to: "/dashboard/team/active-users" },
	{ title: "Invitations", to: "/dashboard/team/invitations" },
] as const;

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
		title: "Reports",
		to: "/dashboard/reports",
		icon: ClipboardTextIcon,
	},
	{
		title: "Profile",
		to: "/dashboard/profile",
		icon: UserCircleIcon,
	},
	{
		title: "KYC",
		to: "/dashboard/kyc",
		icon: ShieldCheckIcon,
	},
	{
		title: "API Keys",
		to: "/dashboard/apikeys",
		icon: KeyIcon,
	},
	{
		title: "Billing",
		to: "/dashboard/billing",
		icon: CreditCardIcon,
	},
] as const;

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
	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				asChild
				className={cn(
					"bg-transparent hover:bg-transparent active:bg-transparent",
					"aria-[current=page]:bg-sidebar-accent aria-[current=page]:font-medium aria-[current=page]:text-sidebar-accent-foreground aria-[current=page]:hover:bg-sidebar-accent",
				)}
			>
				<Link
					to={item.to}
					activeOptions={item.isExact ? { exact: true } : undefined}
				>
					{({ isActive }) => (
						<>
							<item.icon weight={isActive ? "bold" : "regular"} />
							<span className="font-medium">{item.title}</span>
						</>
					)}
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

function SidebarTeamNav() {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const isTeamActive = pathname.startsWith("/dashboard/team");
	const [isOpen, setIsOpen] = React.useState(isTeamActive);

	React.useEffect(() => {
		if (isTeamActive) {
			setIsOpen(true);
		}
	}, [isTeamActive]);

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
			className="group/collapsible"
		>
			<SidebarMenuItem>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton
						tooltip="My Team"
						isActive={isTeamActive}
						className={cn(
							"bg-transparent hover:bg-transparent active:bg-transparent",
							"data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground data-active:hover:bg-sidebar-accent",
						)}
					>
						<UsersThreeIcon weight={isTeamActive ? "bold" : "regular"} />
						<span className="font-medium">My Team</span>
						<CaretRightIcon
							className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90"
							weight="bold"
						/>
					</SidebarMenuButton>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<SidebarMenuSub>
						{teamSubItems.map((item) => {
							const isActive =
								pathname === item.to || pathname === `${item.to}/`;

							return (
								<SidebarMenuSubItem key={item.to}>
									<SidebarMenuSubButton asChild isActive={isActive}>
										<Link to={item.to}>{item.title}</Link>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							);
						})}
					</SidebarMenuSub>
				</CollapsibleContent>
			</SidebarMenuItem>
		</Collapsible>
	);
}

export function AppSidebar() {
	return (
		<Sidebar collapsible="icon">
			<Link to="/dashboard">
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
			</Link>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{navItems.map((item) => (
								<SidebarNavItem key={item.to} item={item} />
							))}
							<SidebarTeamNav />
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			{/* <SidebarFooter>
				<SidebarUser />
			</SidebarFooter> */}
		</Sidebar>
	);
}
