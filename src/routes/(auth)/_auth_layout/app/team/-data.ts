import type { UserTenantMembership } from "#/api/http/v1/tenants/tenants.types";
import type { UserDetail } from "#/api/http/v1/users/users.types";
import type { TenantRole } from "#/api/http/v2/tenants/tenants.types";
import { useAuthStore } from "#/stores/auth-store";

export type TenantUserRole = TenantRole;

export const ROLE_LABELS: Record<TenantUserRole, string> = {
	admin: "Administrator",
	member: "Member",
};

export const TEAM_ROLES: TenantUserRole[] = ["admin", "member"];

export const TEAM_PAGE_SIZE = 10;

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

export function getUserFullName(
	user: Pick<UserDetail, "first_name" | "last_name" | "email">,
) {
	const name = [user.first_name, user.last_name]
		.filter(Boolean)
		.join(" ")
		.trim();

	return name || user.email;
}

export function normalizeUserTenants(
	tenants: UserDetail["tenants"],
): UserTenantMembership[] {
	if (!tenants) {
		return [];
	}

	return Array.isArray(tenants) ? tenants : [tenants];
}

export function getUserTenantMembership(
	user: Pick<UserDetail, "tenants">,
	tenantId?: string,
): UserTenantMembership | undefined {
	const memberships = normalizeUserTenants(user.tenants);

	if (tenantId) {
		return (
			memberships.find((tenant) => tenant.id === tenantId) ?? memberships[0]
		);
	}

	return memberships[0];
}

export function useCurrentTenant() {
	const user = useAuthStore((state) => state.user);
	const tenant = user ? getUserTenantMembership(user) : undefined;

	return {
		user,
		tenant,
		tenantId: tenant?.id,
		tenantSlug: tenant?.slug,
		tenantRole: tenant?.role,
		isTenantAdmin: tenant?.role === "admin",
	};
}
