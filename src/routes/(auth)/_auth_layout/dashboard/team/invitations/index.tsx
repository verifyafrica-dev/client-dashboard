import {
	CalendarBlankIcon,
	MagnifyingGlassIcon,
	TrashIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import {
	paginateItems,
	TablePagination,
} from "../-components/table-pagination";
import {
	InvitationRoleBadge,
	InvitationStatusBadge,
} from "./-components/invitation-badges";
import { InviteUserDialog } from "./-components/invite-user-dialog";
import {
	formatInvitationExpiry,
	INVITATION_ROLES,
	type InvitationStatus,
	MOCK_INVITATIONS,
	ROLE_LABELS,
	STATUS_LABELS,
	TEAM_PAGE_SIZE,
	type TenantUserRole,
	type UserInvitation,
} from "./-data";

export const Route = createFileRoute(
	"/(auth)/_auth_layout/dashboard/team/invitations/",
)({
	component: InvitationsPage,
});

function InvitationsPage() {
	const [invitations, setInvitations] =
		useState<UserInvitation[]>(MOCK_INVITATIONS);
	const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [invitationToDelete, setInvitationToDelete] =
		useState<UserInvitation | null>(null);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<InvitationStatus | "all">(
		"all",
	);
	const [roleFilter, setRoleFilter] = useState<TenantUserRole | "all">("all");
	const [page, setPage] = useState(1);

	const filteredInvitations = useMemo(() => {
		const query = search.trim().toLowerCase();

		return invitations.filter((invitation) => {
			const matchesSearch =
				query.length === 0 || invitation.email.toLowerCase().includes(query);
			const matchesStatus =
				statusFilter === "all" || invitation.status === statusFilter;
			const matchesRole =
				roleFilter === "all" || invitation.role === roleFilter;

			return matchesSearch && matchesStatus && matchesRole;
		});
	}, [invitations, search, statusFilter, roleFilter]);

	const { items: paginatedInvitations, safePage } = useMemo(
		() => paginateItems(filteredInvitations, page, TEAM_PAGE_SIZE),
		[filteredInvitations, page],
	);

	function handleInvite(payload: { email: string; role: TenantUserRole }) {
		const newInvitation: UserInvitation = {
			id: crypto.randomUUID(),
			email: payload.email,
			role: payload.role,
			status: "pending",
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		};

		setInvitations((current) => [newInvitation, ...current]);
		setPage(1);
	}

	function openDeleteDialog(invitation: UserInvitation) {
		setInvitationToDelete(invitation);
		setDeleteDialogOpen(true);
	}

	function handleDeleteInvitation(target: DeleteUserDialogTarget) {
		setInvitations((current) =>
			current.filter((item) => item.id !== target.id),
		);
		setInvitationToDelete(null);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						User Invitations
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Manage and track user invitation status
					</p>
				</div>
				<Button
					className="cursor-pointer tracking-wide"
					onClick={() => setInviteDialogOpen(true)}
				>
					Invite User
				</Button>
			</div>

			<Card className="gap-0 py-4 sm:py-6">
				<CardHeader className="border-b">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<CardTitle className="text-base font-semibold">
							Invitations
						</CardTitle>
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
							<div className="relative min-w-[200px] flex-1 sm:max-w-xs">
								<MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="Search invitations..."
									value={search}
									onChange={(event) => {
										setSearch(event.target.value);
										setPage(1);
									}}
									className="pl-9"
								/>
							</div>
							<div className="flex flex-wrap items-center gap-2">
								<Label htmlFor="status-filter" className="sr-only">
									Status
								</Label>
								<Select
									value={statusFilter}
									onValueChange={(value) => {
										setStatusFilter(value as InvitationStatus | "all");
										setPage(1);
									}}
								>
									<SelectTrigger id="status-filter" className="w-[150px]">
										<SelectValue placeholder="Status: All" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Status: All</SelectItem>
										{(Object.keys(STATUS_LABELS) as InvitationStatus[]).map(
											(status) => (
												<SelectItem key={status} value={status}>
													{STATUS_LABELS[status]}
												</SelectItem>
											),
										)}
									</SelectContent>
								</Select>
								<Label htmlFor="role-filter" className="sr-only">
									Role
								</Label>
								<Select
									value={roleFilter}
									onValueChange={(value) => {
										setRoleFilter(value as TenantUserRole | "all");
										setPage(1);
									}}
								>
									<SelectTrigger id="role-filter" className="w-[150px]">
										<SelectValue placeholder="Role: All" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Role: All</SelectItem>
										{INVITATION_ROLES.map((role) => (
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
					<Table>
						<TableHeader>
							<TableRow className="hover:bg-transparent">
								<TableHead className="pl-4 text-xs font-semibold tracking-wide uppercase sm:pl-6">
									User Details
								</TableHead>
								<TableHead className="text-xs font-semibold tracking-wide uppercase">
									Role
								</TableHead>
								<TableHead className="text-xs font-semibold tracking-wide uppercase">
									Invitation Status
								</TableHead>
								<TableHead className="text-xs font-semibold tracking-wide uppercase">
									Expires
								</TableHead>
								<TableHead className="pr-4 text-xs font-semibold tracking-wide uppercase sm:pr-6">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedInvitations.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="h-24 text-center text-sm text-muted-foreground"
									>
										{invitations.length === 0
											? 'No invitations yet. Click "Invite User" to send one.'
											: "No invitations match your search or filters."}
									</TableCell>
								</TableRow>
							) : (
								paginatedInvitations.map((invitation) => (
									<TableRow key={invitation.id}>
										<TableCell className="pl-4 sm:pl-6">
											<div className="flex items-center gap-3">
												<Avatar size="sm">
													<AvatarFallback>
														<UserIcon className="size-4" />
													</AvatarFallback>
												</Avatar>
												<span className="text-sm">{invitation.email}</span>
											</div>
										</TableCell>
										<TableCell>
											<InvitationRoleBadge role={invitation.role} />
										</TableCell>
										<TableCell>
											<InvitationStatusBadge status={invitation.status} />
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<CalendarBlankIcon className="size-4 shrink-0" />
												{formatInvitationExpiry(invitation.expiresAt)}
											</div>
										</TableCell>
										<TableCell className="pr-4 sm:pr-6">
											<Button
												type="button"
												variant="destructive"
												size="sm"
												className="cursor-pointer tracking-wide"
												onClick={() => openDeleteDialog(invitation)}
											>
												<TrashIcon className="size-4" />
												Delete
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
					<TablePagination
						page={safePage}
						pageSize={TEAM_PAGE_SIZE}
						total={filteredInvitations.length}
						onPageChange={setPage}
					/>
				</CardContent>
			</Card>

			<InviteUserDialog
				open={inviteDialogOpen}
				onOpenChange={setInviteDialogOpen}
				onInvite={handleInvite}
			/>

			<DeleteUserDialog
				target={
					invitationToDelete
						? {
								id: invitationToDelete.id,
								email: invitationToDelete.email,
							}
						: null
				}
				type="invitation"
				open={deleteDialogOpen}
				onOpenChange={(open) => {
					setDeleteDialogOpen(open);
					if (!open) {
						setInvitationToDelete(null);
					}
				}}
				onConfirm={handleDeleteInvitation}
			/>
		</div>
	);
}
