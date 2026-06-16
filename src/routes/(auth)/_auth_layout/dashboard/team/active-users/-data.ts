import {
	formatTeamDate,
	getUserInitials,
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

export const MOCK_ACTIVE_USERS: ActiveUser[] = [
	{
		id: "user-1",
		name: "VerifyAfrica Sales",
		email: "support@verifyafrica.io",
		role: "admin",
		status: "active",
		joinedAt: new Date("2026-05-06T10:06:00"),
		isCurrentUser: true,
	},
	{
		id: "user-2",
		name: "Jane Doe",
		email: "jane.doe@verifyafrica.io",
		role: "member",
		status: "active",
		joinedAt: new Date("2026-04-18T14:22:00"),
	},
	{
		id: "user-3",
		name: "Michael Okonkwo",
		email: "michael@verifyafrica.io",
		role: "admin",
		status: "active",
		joinedAt: new Date("2026-03-12T09:15:00"),
	},
	{
		id: "user-4",
		name: "Sarah Johnson",
		email: "sarah.j@verifyafrica.io",
		role: "member",
		status: "inactive",
		joinedAt: new Date("2026-02-05T16:40:00"),
	},
	{
		id: "user-5",
		name: "David Chen",
		email: "david.chen@verifyafrica.io",
		role: "member",
		status: "active",
		joinedAt: new Date("2026-01-20T11:30:00"),
	},
	{
		id: "user-6",
		name: "Amara Okafor",
		email: "amara@verifyafrica.io",
		role: "member",
		status: "active",
		joinedAt: new Date("2025-12-08T08:50:00"),
	},
	{
		id: "user-7",
		name: "James Wilson",
		email: "james.w@verifyafrica.io",
		role: "admin",
		status: "inactive",
		joinedAt: new Date("2025-11-15T13:05:00"),
	},
];

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
