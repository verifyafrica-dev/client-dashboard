import { getUserInitials } from "../team/-data";

export function getProfileDisplayName(
	firstName?: string,
	lastName?: string,
) {
	return [firstName, lastName].filter(Boolean).join(" ").trim();
}

export function getProfileInitials(
	firstName?: string,
	lastName?: string,
) {
	const displayName = getProfileDisplayName(firstName, lastName);

	if (!displayName) {
		return "U";
	}

	return getUserInitials(displayName);
}
