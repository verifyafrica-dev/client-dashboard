import type {
	Invitation,
	InvitationStatus as ApiInvitationStatus,
} from "#/api/http/v1/tenants/tenants.types";
import type { TenantUserRole } from "../-data";

export type InvitationStatus = "pending" | "accepted" | "expired" | "cancelled";

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
	cancelled: "Cancelled",
};

export function mapApiInvitationStatus(
	status: ApiInvitationStatus,
): InvitationStatus {
	if (
		status === "pending" ||
		status === "accepted" ||
		status === "expired" ||
		status === "cancelled"
	) {
		return status;
	}

	return "expired";
}

export function mapInvitationToUserInvitation(
	invitation: Invitation,
): UserInvitation {
	return {
		id: invitation.id,
		email: invitation.email,
		role: invitation.role,
		status: mapApiInvitationStatus(invitation.status),
		expiresAt: new Date(invitation.expires_at),
	};
}

export function mapInvitationsToUserInvitations(
	invitations: Invitation[],
): UserInvitation[] {
	return invitations.map(mapInvitationToUserInvitation);
}
