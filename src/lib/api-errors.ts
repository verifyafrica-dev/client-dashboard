import type { AxiosError } from "axios";

import type {
	UserChangePasswordErrorResponse,
	UserLoginError,
	UserResetPasswordErrorResponse,
} from "#/api/http/v1/users/users.types";
import type { V2ErrorResponse } from "#/api/http/shared";
import { isPlainObject } from "#/lib/validators";

function isUserLoginError(error: unknown): error is UserLoginError {
	if (!isPlainObject(error)) {
		return false;
	}

	const candidate = error as Record<string, unknown>;

	return (
		typeof candidate.status === "number" &&
		typeof candidate.message === "string"
	);
}

export function toUserLoginError(error: unknown): UserLoginError {
	if (isUserLoginError(error)) {
		return error;
	}

	const axiosError = error as AxiosError<
		string | { detail?: string; non_field_errors?: string[] }
	>;
	const status = axiosError.response?.status ?? 500;
	const data = axiosError.response?.data;

	if (typeof data === "string") {
		return { message: data, status };
	}

	if (isPlainObject(data)) {
		const fieldErrors = data as {
			detail?: string;
			non_field_errors?: string[];
		};

		if (fieldErrors.non_field_errors?.length) {
			return { message: fieldErrors.non_field_errors[0], status };
		}

		if (typeof fieldErrors.detail === "string") {
			return { message: fieldErrors.detail, status };
		}
	}

	return {
		message: axiosError.message || "Something went wrong",
		status,
	};
}

export function getUserLoginErrorFieldErrors(
	error: UserLoginError | null | undefined,
): Array<{ message: string }> {
	if (!error?.message) {
		return [];
	}

	return [{ message: error.message }];
}

export function getUserResetPasswordErrorFieldErrors(
	error: UserResetPasswordErrorResponse | null | undefined,
): Array<{ message: string }> {
	const nonFieldErrors = error?.response?.data?.non_field_errors;

	if (!nonFieldErrors?.length) {
		return error?.message ? [{ message: error.message }] : [];
	}

	return nonFieldErrors.map((message) => ({ message }));
}

function getFieldErrorMessages(
	errors: string[] | undefined,
): Array<{ message: string }> {
	if (!errors?.length) {
		return [];
	}

	return errors.map((message) => ({ message }));
}

export function getUserChangePasswordFieldError(
	error: UserChangePasswordErrorResponse | null | undefined,
	field: "old_password" | "new_password",
): Array<{ message: string }> {
	const fieldErrors = error?.response?.data?.[field];

	if (fieldErrors?.length) {
		return getFieldErrorMessages(fieldErrors);
	}

	if (field === "old_password" && error?.response?.data?.detail) {
		return [{ message: error.response.data.detail }];
	}

	return [];
}

export function getV2ErrorMessage(error: unknown, fallback = "Something went wrong") {
	const axiosError = error as AxiosError<V2ErrorResponse>;
	const data = axiosError.response?.data;

	if (data?.errors?.length) {
		return data.errors.join(", ");
	}

	if (data?.message) {
		return data.message;
	}

	if (error instanceof Error && error.message) {
		return error.message;
	}

	return fallback;
}
