import type { TenantUserRole } from "../-data";

export type InvitationStatus = "pending" | "accepted" | "expired";

export type UserInvitation = {
	id: string;
	email: string;
	role: TenantUserRole;
	status: InvitationStatus;
	expiresAt: Date;
};

export {
	formatTeamDate as formatInvitationExpiry,
	ROLE_LABELS,
	TEAM_PAGE_SIZE,
	TEAM_ROLES as INVITATION_ROLES,
	type TenantUserRole,
} from "../-data";

export const STATUS_LABELS: Record<InvitationStatus, string> = {
	pending: "Pending",
	accepted: "Accepted",
	expired: "Expired",
};

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
	{
		id: "inv-4",
		email: "jane.doe@example.com",
		role: "member",
		status: "pending",
		expiresAt: new Date("2026-07-01T08:00:00"),
	},
	{
		id: "inv-5",
		email: "ops@verifyafrica.io",
		role: "admin",
		status: "pending",
		expiresAt: new Date("2026-06-28T15:30:00"),
	},
	{
		id: "inv-6",
		email: "finance@verifyafrica.io",
		role: "member",
		status: "accepted",
		expiresAt: new Date("2026-06-15T12:00:00"),
	},
	{
		id: "inv-7",
		email: "legacy@example.com",
		role: "admin",
		status: "expired",
		expiresAt: new Date("2026-04-12T09:45:00"),
	},
];

export async function fetchInvitations(): Promise<UserInvitation[]> {
	await new Promise((resolve) => setTimeout(resolve, 600));

	return MOCK_INVITATIONS.map((invitation) => ({
		...invitation,
		expiresAt: new Date(invitation.expiresAt),
	}));
}
