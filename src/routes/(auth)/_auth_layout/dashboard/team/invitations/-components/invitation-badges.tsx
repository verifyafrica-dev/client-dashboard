import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "#/lib/utils.ts";
import {
	type InvitationStatus,
	ROLE_LABELS,
	STATUS_LABELS,
	type TenantUserRole,
} from "../-data";

export function getStatusIcon(status: InvitationStatus) {
	switch (status) {
		case "pending":
			return <Clock className="size-4 text-yellow-500" />;
		case "accepted":
			return <CheckCircle className="size-4 text-green-500" />;
		case "expired":
			return <XCircle className="size-4 text-red-500" />;
		default:
			return <AlertCircle className="size-4 text-gray-500" />;
	}
}

export function getStatusBadgeClassName(status: InvitationStatus) {
	const baseClasses =
		"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize";

	switch (status) {
		case "pending":
			return cn(baseClasses, "bg-yellow-100 text-yellow-800");
		case "accepted":
			return cn(baseClasses, "bg-green-100 text-green-800");
		case "expired":
			return cn(baseClasses, "bg-red-100 text-red-800");
		default:
			return cn(baseClasses, "bg-gray-100 text-gray-800");
	}
}

export function getRoleBadgeClassName(role: TenantUserRole) {
	const baseClasses = "inline-flex rounded px-2 py-1 text-xs font-medium";

	switch (role) {
		case "admin":
			return cn(baseClasses, "bg-purple-100 text-purple-800");
		case "member":
			return cn(baseClasses, "bg-blue-100 text-blue-800");
		default:
			return cn(baseClasses, "bg-gray-100 text-gray-800");
	}
}

export function InvitationStatusBadge({
	status,
}: {
	status: InvitationStatus;
}) {
	return (
		<span className={getStatusBadgeClassName(status)}>
			{getStatusIcon(status)}
			{STATUS_LABELS[status]}
		</span>
	);
}

export function InvitationRoleBadge({ role }: { role: TenantUserRole }) {
	return (
		<span className={getRoleBadgeClassName(role)}>{ROLE_LABELS[role]}</span>
	);
}
