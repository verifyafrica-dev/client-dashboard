export type TenantUserRole = "admin" | "member";

export type InvitationStatus = "pending" | "accepted" | "expired";

export type UserInvitation = {
	id: string;
	email: string;
	role: TenantUserRole;
	status: InvitationStatus;
	expiresAt: Date;
};

export const ROLE_LABELS: Record<TenantUserRole, string> = {
	admin: "Administrator",
	member: "Member",
};

export const STATUS_LABELS: Record<InvitationStatus, string> = {
	pending: "Pending",
	accepted: "Accepted",
	expired: "Expired",
};

export const INVITATION_ROLES: TenantUserRole[] = ["admin", "member"];

export const MOCK_INVITATIONS: UserInvitation[] = [
	{
		id: "inv-1",
		email: "itzadetunji.peter@gmail.com",
		role: "member",
		status: "pending",
		expiresAt: new Date("2026-06-23T11:12:00"),
	},
	{
		id: "inv-2",
		email: "admin@verifyafrica.com",
		role: "admin",
		status: "accepted",
		expiresAt: new Date("2026-06-10T09:30:00"),
	},
	{
		id: "inv-3",
		email: "expired.user@example.com",
		role: "member",
		status: "expired",
		expiresAt: new Date("2026-05-01T14:00:00"),
	},
];

export function formatInvitationExpiry(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}
