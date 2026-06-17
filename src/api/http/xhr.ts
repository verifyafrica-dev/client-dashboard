import type { InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { COUNTRIES } from "@/lib/constants";
import { isPlainObject } from "@/lib/validators";
import { env } from "../../config/env";

const isBrowser = typeof window !== "undefined";

const getBrowserHost = () => (isBrowser ? window.location.host : "");

const getBaseUrl = () => {
	const host = getBrowserHost();
	if (host.includes("verifyafrica.io")) {
		return "https://api.verifyafrica.io/api";
	}

	return env.apiBaseUrl;
};

// set the base url from the environment variable or default to a specific URL
const BASE_URL = getBaseUrl();

const getTokenPrefix = (): string => {
	const host = getBrowserHost();
	if (host.includes("localhost")) return "local:";
	if (host.includes("dashboard.verifyafrica.io")) return "dashboard:";
	if (host.includes("admin.verifyafrica.io")) return "admin:";
	return "local:";
};

export const getAccessTokenKey = (): string => `${getTokenPrefix()}accessToken`;
export const getRefreshTokenKey = (): string =>
	`${getTokenPrefix()}refreshToken`;

const getTokens = () => {
	if (!isBrowser) {
		return {
			accessToken: "",
			refreshToken: "",
		};
	}

	return {
		accessToken: localStorage.getItem(getAccessTokenKey()),
		refreshToken: localStorage.getItem(getRefreshTokenKey()),
	};
};

export const setTokens = (accessToken: string, refreshToken = "") => {
	if (!isBrowser) return;

	localStorage.setItem(getAccessTokenKey(), accessToken);
	if (refreshToken) localStorage.setItem(getRefreshTokenKey(), refreshToken);
};

const clearTokensAndLogout = () => {
	if (!isBrowser) return;

	localStorage.removeItem(getAccessTokenKey());
	localStorage.removeItem(getRefreshTokenKey());
	window.location.href = "/login";
};

const $http = axios.create({
	baseURL: BASE_URL,
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

let isRefreshing = false;
let failedRequestsQueue: any[] = [];
const COUNTRY_NAME_BY_CODE = COUNTRIES.reduce<Record<string, string>>(
	(acc, country) => {
		acc[country.code.toUpperCase()] = country.name;
		return acc;
	},
	{},
);

const DISABLED_COUNTRY_PATTERN =
	/Country '([A-Z]{2})' is not enabled for this tenant\./g;

const mapCountryCodesToNamesInMessage = (message: string) => {
	return message.replace(DISABLED_COUNTRY_PATTERN, (_, countryCode: string) => {
		const countryName = COUNTRY_NAME_BY_CODE[countryCode] || countryCode;
		return `Country '${countryName}' is not enabled for this tenant.`;
	});
};

const normalizeErrorPayload = (payload: any): any => {
	if (typeof payload === "string") {
		return mapCountryCodesToNamesInMessage(payload);
	}

	if (Array.isArray(payload)) {
		return payload.map((item) => normalizeErrorPayload(item));
	}

	if (isPlainObject(payload)) {
		return Object.fromEntries(
			Object.entries(payload).map(([key, value]) => [
				key,
				normalizeErrorPayload(value),
			]),
		);
	}

	return payload;
};

const shouldUseAccessToken = (url: string) => {
	const urlsToIgnore = [
		"/users/register/",
		"/users/login/",
		"/users/lookup",
		"/users/activate-account/",
		"/tenants/invitations/complete",
		"/tenants/invitations/accept",
	];
	const matchFound = urlsToIgnore.some((ignoredUrl) =>
		url.includes(ignoredUrl),
	);
	return !matchFound;
};

const isTokenExpiredError = (error: any) => {
	return (
		error?.response?.status === 401 &&
		error?.response?.data?.code === "token_not_valid"
	);
};

$http.interceptors.request.use(
	async (config: InternalAxiosRequestConfig) => {
		const { accessToken } = getTokens();
		if (accessToken && shouldUseAccessToken(config.url as string)) {
			config.headers.Authorization = `JWT ${accessToken}`;
		}
		return config;
	},
	(error) => {
		// Handle request errors
		return Promise.reject(error);
	},
);

$http.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (isTokenExpiredError(error) && !originalRequest._retry) {
			originalRequest._retry = true;

			if (!isRefreshing) {
				isRefreshing = true;
				try {
					const { refreshToken } = getTokens();
					const newTokenResponse = await axios.post(
						`${BASE_URL}/users/token/refresh/`,
						{ refresh: refreshToken },
					);
					const accessToken = newTokenResponse.data.access;
					setTokens(accessToken);

					isRefreshing = false;
					// Retry all queued requests with the new access token
					failedRequestsQueue.forEach((req) => {
						req.resolve($http(req.config));
					});
					failedRequestsQueue = [];
					return $http(originalRequest); // Retry the original failed request
				} catch (refreshError) {
					isRefreshing = false;
					// Handle refresh token failure (e.g., logout user)
					clearTokensAndLogout();
					return Promise.reject(refreshError);
				}
			} else {
				// Queue the request if a refresh is already in progress
				return new Promise((resolve, reject) => {
					failedRequestsQueue.push({
						resolve,
						reject,
						config: originalRequest,
					});
				});
			}
		}
		// return error message from backend if available
		if (isPlainObject(error.response?.data)) {
			const normalizedData = normalizeErrorPayload(error.response.data);
			return Promise.reject({
				message: normalizedData?.detail || normalizedData,
				status: error.response?.status,
			});
		}
		return Promise.reject(error);
	},
);

export default $http;
