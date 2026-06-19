import type { UserDetail } from "#/api/http/v1/users/users.types";
import {
	formatTeamDate,
	getUserFullName,
	getUserInitials,
	getUserTenantMembership,
	ROLE_LABELS,
	TEAM_PAGE_SIZE,
	TEAM_ROLES,
	type TenantUserRole,
} from "../-data";

export type ActiveUserStatus = "active" | "inactive";

export type ActiveUser = {
	id: string;
	name: string;
	email: string;
	role: TenantUserRole;
	status: ActiveUserStatus;
	joinedAt: Date;
	isCurrentUser?: boolean;
};

export const ACTIVE_USER_STATUSES: ActiveUserStatus[] = ["active", "inactive"];

export const ACTIVE_USER_STATUS_LABELS: Record<ActiveUserStatus, string> = {
	active: "Active",
	inactive: "Inactive",
};

export {
	formatTeamDate,
	getUserInitials,
	ROLE_LABELS,
	TEAM_PAGE_SIZE,
	TEAM_ROLES,
};

export function getActiveUserStatusBadgeClassName(status: ActiveUserStatus) {
	const baseClasses =
		"inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize";

	switch (status) {
		case "active":
			return `${baseClasses} bg-green-100 text-green-800`;
		case "inactive":
			return `${baseClasses} bg-gray-100 text-gray-800`;
		default:
			return `${baseClasses} bg-gray-100 text-gray-800`;
	}
}

export function mapUserDetailToActiveUser(
	user: UserDetail,
	tenantId: string,
	currentUserId?: string,
): ActiveUser {
	const membership = getUserTenantMembership(user, tenantId);

	return {
		id: user.id,
		name: getUserFullName(user),
		email: user.email,
		role: membership?.role ?? "member",
		status: user.is_active === false ? "inactive" : "active",
		joinedAt: new Date(membership?.date_added ?? user.created_at),
		isCurrentUser: user.id === currentUserId,
	};
}

export function mapUserDetailsToActiveUsers(
	users: UserDetail[],
	tenantId: string,
	currentUserId?: string,
): ActiveUser[] {
	return users.map((user) =>
		mapUserDetailToActiveUser(user, tenantId, currentUserId),
	);
}
