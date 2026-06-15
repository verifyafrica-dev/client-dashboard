import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import { COUNTRIES } from "@/lib/constants";
import { isPlainObject } from "@/lib/validators";
import { env } from "../config/env";

const getBaseUrl = () => {
	const windowUrl = window.location.host;
	if (windowUrl.includes("verifyafrica.io")) {
		return "https://api.verifyafrica.io/api";
	}

	return env.apiBaseUrl;
};

// set the base url from the environment variable or default to a specific URL
const BASE_URL = getBaseUrl();

const getTokenPrefix = (): string => {
	const host = window.location.host;
	if (host.includes("localhost")) return "local:";
	if (host.includes("dashboard.verifyafrica.io")) return "dashboard:";
	if (host.includes("admin.verifyafrica.io")) return "admin:";
	return "local:";
};

export const getAccessTokenKey = (): string => `${getTokenPrefix()}accessToken`;
export const getRefreshTokenKey = (): string =>
	`${getTokenPrefix()}refreshToken`;

const getTokens = () => {
	return {
		accessToken: localStorage.getItem(getAccessTokenKey()),
		refreshToken: localStorage.getItem(getRefreshTokenKey()),
	};
};

export const setTokens = (accessToken: string, refreshToken = "") => {
	localStorage.setItem(getAccessTokenKey(), accessToken);
	if (refreshToken) localStorage.setItem(getRefreshTokenKey(), refreshToken);
};

const clearTokensAndLogout = () => {
	localStorage.removeItem(getAccessTokenKey());
	localStorage.removeItem(getRefreshTokenKey());
	window.location.href = "/login";
};

const _client = axios.create({
	baseURL: BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
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

// @ts-ignore
_client.interceptors.request.use(
	async (config: any) => {
		const { accessToken } = getTokens();
		// @ts-ignore
		if (accessToken && shouldUseAccessToken(config.url)) {
			config.headers["Authorization"] = `JWT ${accessToken}`;
		}
		return config;
	},
	(error) => {
		// Handle request errors
		return Promise.reject(error);
	},
);

_client.interceptors.response.use(
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
					failedRequestsQueue.forEach((req) =>
						req.resolve(_client(req.config)),
					);
					failedRequestsQueue = [];
					return _client(originalRequest); // Retry the original failed request
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

const GetRequest = async function <T>(
	url: string,
	config: AxiosRequestConfig = {},
): Promise<{ error: any; data: T | null }> {
	try {
		const response = await _client.get(url, config);
		return {
			error: null,
			data: response.data as T,
		};
	} catch (error) {
		console.error("Error making GET request:", error);
		return {
			error,
			data: null,
		};
	}
};

const GetBlobRequest = async function (
	url: string,
	config: AxiosRequestConfig = {},
): Promise<{ error: any; data: Blob | null }> {
	try {
		const response = await _client.get(url, {
			...config,
			responseType: "blob",
		});
		return {
			error: null,
			data: response.data as Blob,
		};
	} catch (error) {
		console.error("Error making blob GET request:", error);
		return {
			error,
			data: null,
		};
	}
};

const PostBlobRequest = async function (
	url: string,
	data: any,
	config: AxiosRequestConfig = {},
): Promise<{ error: any; data: Blob | null }> {
	try {
		const response = await axios.post(url, data, {
			...config,
			headers: {
				"Content-Type": "application/json",
				...(config.headers || {}),
			},
			responseType: "blob",
		});
		return {
			error: null,
			data: response.data as Blob,
		};
	} catch (error) {
		console.error("Error making blob POST request:", error);
		return {
			error,
			data: null,
		};
	}
};

const PostRequest = async function <T>(
	url: string,
	data: any,
): Promise<{ error: any; data: T | null }> {
	try {
		const response = await _client.post(url, data);
		return {
			error: null,
			data: response.data as T,
		};
	} catch (error) {
		console.error("Error making POST request:", error);
		return {
			error,
			data: null,
		};
	}
};

const PutRequest = async function <T>(
	url: string,
	data: any = {},
	config = {},
): Promise<{ error: any; data: T | null }> {
	try {
		const response = await _client.put(url, data, config);
		return {
			error: null,
			data: response.data as T,
		};
	} catch (error) {
		console.error("Error making POST request:", error);
		return {
			error,
			data: null,
		};
	}
};

const PatchRequest = async function <T>(
	url: string,
	data: any = {},
	config = {},
): Promise<{ error: any; data: T | null }> {
	try {
		const response = await _client.patch(url, data, config);
		return {
			error: null,
			data: response.data as T,
		};
	} catch (error) {
		console.error("Error making POST request:", error);
		return {
			error,
			data: null,
		};
	}
};

const DeleteRequest = async function <T>(
	url: string,
): Promise<{ error: any; data: T | null }> {
	try {
		const response = await _client.delete(url);
		return {
			error: null,
			data: response.data,
		};
	} catch (error) {
		console.error("Error making DELETE request:", error);
		return {
			error,
			data: null,
		};
	}
};

/**
 * Downloads a file from the server (e.g., Excel, PDF, etc.)
 * @param url - The API endpoint URL
 * @param filename - Optional filename for the downloaded file. If not provided, extracts from Content-Disposition header
 * @returns Promise with error or success status
 */
const DownloadFileRequest = async function (
	url: string,
	filename?: string,
): Promise<{ error: any; success: boolean }> {
	try {
		const response = await _client.get(url, {
			responseType: "blob", // Important: tells axios to expect binary data
		});

		// Create a blob from the response data
		const blob = new Blob([response.data], {
			type: response.headers["content-type"] || "application/octet-stream",
		});

		// Extract filename from Content-Disposition header if not provided
		let downloadFilename = filename;
		if (!downloadFilename) {
			const contentDisposition = response.headers["content-disposition"];
			if (contentDisposition) {
				const filenameMatch = contentDisposition.match(
					/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
				);
				if (filenameMatch && filenameMatch[1]) {
					downloadFilename = filenameMatch[1].replace(/['"]/g, "");
				}
			}
		}

		// Fallback filename if none provided or extracted
		if (!downloadFilename) {
			const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
			downloadFilename = `download-${timestamp}`;
		}

		// Create a temporary URL for the blob
		const downloadUrl = window.URL.createObjectURL(blob);

		// Create a temporary anchor element and trigger the download
		const link = document.createElement("a");
		link.href = downloadUrl;
		link.download = downloadFilename;
		document.body.appendChild(link);
		link.click();

		// Clean up
		document.body.removeChild(link);
		window.URL.revokeObjectURL(downloadUrl);

		return {
			error: null,
			success: true,
		};
	} catch (error) {
		console.error("Error downloading file:", error);
		return {
			error,
			success: false,
		};
	}
};

export const HttpService = {
	apiClient: _client,
};
