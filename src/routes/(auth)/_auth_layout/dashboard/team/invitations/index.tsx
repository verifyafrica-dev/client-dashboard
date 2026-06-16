import { CalendarBlankIcon, TrashIcon, UserIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Avatar, AvatarFallback } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { DeleteInvitationDialog } from "./-components/delete-invitation-dialog";
import {
	InvitationRoleBadge,
	InvitationStatusBadge,
} from "./-components/invitation-badges";
import { InviteUserDialog } from "./-components/invite-user-dialog";
import {
	formatInvitationExpiry,
	MOCK_INVITATIONS,
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

	function handleInvite(payload: { email: string; role: TenantUserRole }) {
		const newInvitation: UserInvitation = {
			id: crypto.randomUUID(),
			email: payload.email,
			role: payload.role,
			status: "pending",
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		};

		setInvitations((current) => [newInvitation, ...current]);
	}

	function openDeleteDialog(invitation: UserInvitation) {
		setInvitationToDelete(invitation);
		setDeleteDialogOpen(true);
	}

	function handleDeleteInvitation(invitation: UserInvitation) {
		setInvitations((current) =>
			current.filter((item) => item.id !== invitation.id),
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
			</div>

			<Card className="gap-0">
				<CardHeader className="border-b flex justify-between items-center">
					<CardTitle className="text-base font-semibold">Invitations</CardTitle>
					<Button
						className="cursor-pointer tracking-wide"
						onClick={() => setInviteDialogOpen(true)}
					>
						Invite User
					</Button>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader className="">
							<TableRow className="hover:bg-transparent ">
								<TableHead className="text-xs font-semibold tracking-wide uppercase pl-6">
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
								<TableHead className="text-xs font-semibold tracking-wide uppercase pr-6">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{invitations.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="h-24 text-center text-sm text-muted-foreground"
									>
										No invitations yet. Click &quot;Invite User&quot; to send
										one.
									</TableCell>
								</TableRow>
							) : (
								invitations.map((invitation) => (
									<TableRow key={invitation.id}>
										<TableCell className="pl-6">
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
										<TableCell className="pr-6">
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
				</CardContent>
			</Card>

			<InviteUserDialog
				open={inviteDialogOpen}
				onOpenChange={setInviteDialogOpen}
				onInvite={handleInvite}
			/>

			<DeleteInvitationDialog
				invitation={invitationToDelete}
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
