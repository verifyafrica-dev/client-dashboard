import type { InternalAxiosRequestConfig } from "axios";
import axios from "axios";

import {
	getReasonPhrase,
	getStatusCode,
	ReasonPhrases,
	StatusCodes,
} from "http-status-codes";
import { deleteCookie, getCookie, setCookie } from "#/lib/cookies";
import { COUNTRY_NAME_BY_ISO_CODE } from "@/lib/country-state-city";
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
const ACCESS_TOKEN_COOKIE_EXPIRES_DAYS = 5 / 60 / 24; // 5 minutes
const REFRESH_TOKEN_COOKIE_EXPIRES_DAYS = 2; // 2 days

const getTokens = () => {
	if (!isBrowser) {
		return {
			accessToken: "",
			refreshToken: "",
		};
	}

	return {
		accessToken: getCookie(getAccessTokenKey()) ?? "",
		refreshToken: getCookie(getRefreshTokenKey()) ?? "",
	};
};

export const setTokens = (
	accessToken: string,
	refreshToken?: string,
	options?: { rememberRefreshToken?: boolean },
) => {
	if (!isBrowser) return;

	setCookie(getAccessTokenKey(), accessToken, ACCESS_TOKEN_COOKIE_EXPIRES_DAYS);

	if (refreshToken) {
		if (options?.rememberRefreshToken ?? true) {
			setCookie(
				getRefreshTokenKey(),
				refreshToken,
				REFRESH_TOKEN_COOKIE_EXPIRES_DAYS,
			);
		} else {
			deleteCookie(getRefreshTokenKey());
		}
		return;
	}

	if (options?.rememberRefreshToken === false) {
		deleteCookie(getRefreshTokenKey());
	}
};

const clearTokensAndLogout = () => {
	if (!isBrowser) return;

	deleteCookie(getAccessTokenKey());
	deleteCookie(getRefreshTokenKey());
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

const DISABLED_COUNTRY_PATTERN =
	/Country '([A-Z]{2})' is not enabled for this tenant\./g;

const mapCountryCodesToNamesInMessage = (message: string) => {
	return message.replace(DISABLED_COUNTRY_PATTERN, (_, countryCode: string) => {
		const countryName = COUNTRY_NAME_BY_ISO_CODE[countryCode] || countryCode;
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
		error?.response?.status === StatusCodes.UNAUTHORIZED ||
		error?.response?.data?.code === "token_not_valid" ||
		error?.response?.status === StatusCodes.FORBIDDEN
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
		console.log(error.response);
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
		return Promise.reject(error);
	},
);

export default $http;
