const apiKeyDateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
	hour: "numeric",
	minute: "2-digit",
});

export function formatApiKeyDate(value: string | null) {
	if (!value) {
		return "Never";
	}

	return apiKeyDateFormatter.format(new Date(value));
}

export function maskApiKey(key: string, isVisible: boolean) {
	if (isVisible) {
		return key;
	}

	const prefix = key.slice(0, 8);
	return `${prefix}${"•".repeat(Math.max(key.length - 8, 0))}`;
}

export function getApiKeyPreview(key: string | undefined) {
	if (!key) {
		return "your_api_key";
	}

	return key.length > 20 ? `${key.slice(0, 20)}...` : key;
}
