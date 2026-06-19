import { createFileRoute } from '@tanstack/react-router'
import {
	CalendarBlankIcon,
	MagnifyingGlassIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import { cn } from "#/lib/utils.ts";
import { useMemo, useState } from "react";

import { useTenantUsersQuery } from "#/api/http/v1/tenants/tenants.hooks";
import {
	paginateItems,
	TablePagination,
	TablePaginationSkeleton,
} from "#/components/table-pagination";
import { Avatar, AvatarFallback } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import {
	DeleteUserDialog,
	type DeleteUserDialogTarget,
} from "../-components/delete-user-dialog";
import { TeamTableSkeleton } from "../-components/team-table-skeleton";
import { TeamTableShell } from "../-components/team-table-shell";
import { UserRoleBadge } from "../-components/user-role-badge";
import type { TenantUserRole } from "../-data";
import { TEAM_LIST_PAGE_SIZE, useCurrentTenant } from "../-data";
import { InviteUserDialog } from "../invitations/-components/invite-user-dialog";
import { ActiveUserStatusBadge } from "./-components/user-status-badge";
import {
	ACTIVE_USER_STATUS_LABELS,
	ACTIVE_USER_STATUSES,
	type ActiveUser,
	type ActiveUserStatus,
	formatTeamDate,
	getUserInitials,
	mapUserDetailsToActiveUsers,
	ROLE_LABELS,
	TEAM_PAGE_SIZE,
	TEAM_ROLES,
} from "./-data";

const ACTIVE_USER_TABLE_COLUMNS = [
	"Customer",
	"Email",
	"Role",
	"Date",
	"Status",
	"Actions",
];

export const Route = createFileRoute(
	"/(auth)/_auth_layout/dashboard/team/active-users/",
)({
	component: ActiveUsersPage,
});

function ActiveUsersPage() {
	const { user, tenantId, isTenantAdmin } = useCurrentTenant();
	const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<ActiveUser | null>(null);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<ActiveUserStatus | "all">(
		"all",
	);
	const [roleFilter, setRoleFilter] = useState<TenantUserRole | "all">("all");
	const [page, setPage] = useState(1);

	const usersQuery = useTenantUsersQuery(
		tenantId,
		{ page_size: TEAM_LIST_PAGE_SIZE },
		Boolean(tenantId),
	);

	const users = useMemo(
		() =>
			mapUserDetailsToActiveUsers(
				usersQuery.data?.results ?? [],
				tenantId ?? "",
				user?.id,
			),
		[usersQuery.data?.results, tenantId, user?.id],
	);

	const isLoading = usersQuery.isPending || usersQuery.isFetching;

	const filteredUsers = useMemo(() => {
		const query = search.trim().toLowerCase();

		return users.filter((activeUser) => {
			const matchesSearch =
				query.length === 0 ||
				activeUser.name.toLowerCase().includes(query) ||
				activeUser.email.toLowerCase().includes(query);
			const matchesStatus =
				statusFilter === "all" || activeUser.status === statusFilter;
			const matchesRole =
				roleFilter === "all" || activeUser.role === roleFilter;

			return matchesSearch && matchesStatus && matchesRole;
		});
	}, [users, search, statusFilter, roleFilter]);

	const { items: paginatedUsers, safePage } = useMemo(
		() => paginateItems(filteredUsers, page, TEAM_PAGE_SIZE),
		[filteredUsers, page],
	);

	function openDeleteDialog(activeUser: ActiveUser) {
		setUserToDelete(activeUser);
		setDeleteDialogOpen(true);
	}

	function handleDeleteSuccess(_target: DeleteUserDialogTarget) {
		setUserToDelete(null);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold tracking-tight">
						Active Users
					</h1>
					<p className="text-sm text-muted-foreground">
						View and manage users on your team
					</p>
				</div>
				<Button
					className="cursor-pointer tracking-wide"
					onClick={() => setInviteDialogOpen(true)}
					disabled={!tenantId || !isTenantAdmin || isLoading}
				>
					Invite User
				</Button>
			</div>

			<Card className="gap-0 py-4 sm:py-6">
				<CardHeader className="border-b">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<CardTitle className="text-base font-semibold">Users</CardTitle>
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
							<div className="relative min-w-[200px] flex-1 sm:max-w-xs">
								<MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="Search users..."
									value={search}
									onChange={(event) => {
										setSearch(event.target.value);
										setPage(1);
									}}
									className="pl-9"
									disabled={isLoading}
								/>
							</div>
							<div className="flex flex-wrap items-center gap-2">
								<Label htmlFor="user-status-filter" className="sr-only">
									Status
								</Label>
								<Select
									value={statusFilter}
									onValueChange={(value) => {
										setStatusFilter(value as ActiveUserStatus | "all");
										setPage(1);
									}}
									disabled={isLoading}
								>
									<SelectTrigger id="user-status-filter" className="w-[150px]">
										<SelectValue placeholder="Status: All" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Status: All</SelectItem>
										{ACTIVE_USER_STATUSES.map((status) => (
											<SelectItem key={status} value={status}>
												{ACTIVE_USER_STATUS_LABELS[status]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Label htmlFor="user-role-filter" className="sr-only">
									Role
								</Label>
								<Select
									value={roleFilter}
									onValueChange={(value) => {
										setRoleFilter(value as TenantUserRole | "all");
										setPage(1);
									}}
									disabled={isLoading}
								>
									<SelectTrigger id="user-role-filter" className="w-[150px]">
										<SelectValue placeholder="Role: All" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Role: All</SelectItem>
										{TEAM_ROLES.map((role) => (
											<SelectItem key={role} value={role}>
												{ROLE_LABELS[role]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					{usersQuery.isPending ? (
						<TeamTableShell>
							<TeamTableSkeleton columns={ACTIVE_USER_TABLE_COLUMNS} />
							<TablePaginationSkeleton />
						</TeamTableShell>
					) : usersQuery.isError ? (
						<div className="flex min-h-[320px] items-center justify-center px-6 text-sm text-muted-foreground">
							Failed to load users. Please try again.
						</div>
					) : (
						<TeamTableShell>
							<Table
								className={cn(paginatedUsers.length === 0 && "h-full flex-1")}
							>
								<TableHeader>
									<TableRow className="hover:bg-transparent">
										{ACTIVE_USER_TABLE_COLUMNS.map((column, index) => (
											<TableHead
												key={column}
												className={
													index === 0
														? "pl-4 text-xs font-semibold tracking-wide uppercase sm:pl-6"
														: index === ACTIVE_USER_TABLE_COLUMNS.length - 1
															? "pr-4 text-xs font-semibold tracking-wide uppercase sm:pr-6"
															: "text-xs font-semibold tracking-wide uppercase"
												}
											>
												{column}
											</TableHead>
										))}
									</TableRow>
								</TableHeader>
								<TableBody>
									{paginatedUsers.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={ACTIVE_USER_TABLE_COLUMNS.length}
												className="h-24 text-center text-sm text-muted-foreground"
											>
												{users.length === 0
													? "No active users yet."
													: "No users match your search or filters."}
											</TableCell>
										</TableRow>
									) : (
										paginatedUsers.map((activeUser) => (
											<TableRow key={activeUser.id}>
												<TableCell className="pl-4 sm:pl-6">
													<div className="flex items-center gap-3">
														<Avatar size="sm">
															<AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
																{getUserInitials(activeUser.name)}
															</AvatarFallback>
														</Avatar>
														<span className="text-sm font-medium">
															{activeUser.name}
															{activeUser.isCurrentUser && (
																<span className="font-normal text-muted-foreground">
																	{" "}
																	(You)
																</span>
															)}
														</span>
													</div>
												</TableCell>
												<TableCell className="text-sm">
													{activeUser.email}
												</TableCell>
												<TableCell>
													<UserRoleBadge role={activeUser.role} />
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2 text-sm text-muted-foreground">
														<CalendarBlankIcon className="size-4 shrink-0" />
														{formatTeamDate(activeUser.joinedAt)}
													</div>
												</TableCell>
												<TableCell>
													<ActiveUserStatusBadge status={activeUser.status} />
												</TableCell>
												<TableCell className="pr-4 sm:pr-6">
													{isTenantAdmin && (
														<Button
															type="button"
															variant="destructive"
															size="sm"
															className="cursor-pointer tracking-wide"
															disabled={activeUser.isCurrentUser}
															onClick={() => openDeleteDialog(activeUser)}
														>
															<TrashIcon className="size-4" />
															Delete
														</Button>
													)}
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
							<TablePagination
								page={safePage}
								pageSize={TEAM_PAGE_SIZE}
								total={filteredUsers.length}
								onPageChange={setPage}
							/>
						</TeamTableShell>
					)}
				</CardContent>
			</Card>

			<InviteUserDialog
				open={inviteDialogOpen}
				onOpenChange={setInviteDialogOpen}
				tenantId={tenantId}
			/>

			<DeleteUserDialog
				target={
					userToDelete
						? {
								id: userToDelete.id,
								email: userToDelete.email,
								name: userToDelete.name,
							}
						: null
				}
				type="user"
				tenantId={tenantId}
				open={deleteDialogOpen}
				onOpenChange={(open) => {
					setDeleteDialogOpen(open);
					if (!open) {
						setUserToDelete(null);
					}
				}}
				onSuccess={handleDeleteSuccess}
			/>
		</div>
	);
}
