import type { TenantRole } from "#/api/http/v1/tenants/tenants.types";

export type TenantUserRole = TenantRole;

export const ROLE_LABELS: Record<TenantUserRole, string> = {
	admin: "Administrator",
	member: "Member",
};

export const TEAM_ROLES: TenantUserRole[] = ["admin", "member"];

export const TEAM_PAGE_SIZE = 5;

export function formatTeamDate(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}

export function getUserInitials(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}
