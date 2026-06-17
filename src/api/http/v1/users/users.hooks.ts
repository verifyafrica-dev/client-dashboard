import {
	type UseQueryResult,
	useMutation,
	useQuery,
} from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuthStore } from "#/stores/auth-store";
import { setTokens } from "../../xhr";
import { USERS_API } from "./users.api";
import type {
	UserActivateAccountPayload,
	UserActivateAccountResponse,
	UserAdminResetPasswordResponse,
	UserChangePasswordPayload,
	UserChangePasswordResponse,
	UserDetail,
	UserDetailUpdatePayload,
	UserForgotPasswordPayload,
	UserForgotPasswordResponse,
	UserLoginError,
	UserLoginPayload,
	UserLoginResponse,
	UserLookupQuery,
	UserProfileUpdatePayload,
	UserProfileUpdateResponse,
	UserRegisterPayload,
	UserRegisterResponse,
	UserResendActivationCodePayload,
	UserResendActivationCodeResponse,
	UserResetPasswordErrorResponse,
	UserResetPasswordPayload,
	UserResetPasswordResponse,
	UserTokenRefreshPayload,
	UserTokenRefreshResponse,
} from "./users.types";

export const USER_QUERY_KEYS = {
	all: ["users"] as const,
	list: (params?: { offset?: number; page_size?: number }) =>
		["users", "list", params ?? {}] as const,
	detail: (id: string) => ["users", "detail", id] as const,
	me: ["users", "me"] as const,
	lookup: (query: UserLookupQuery) => ["users", "lookup", query] as const,
} as const;

export const useUsersListQuery = (params?: {
	offset?: number;
	page_size?: number;
}) =>
	useQuery({
		queryKey: USER_QUERY_KEYS.list(params),
		queryFn: () => USERS_API.LIST(params),
	});

export const useUserDetailQuery = (id: string) =>
	useQuery({
		queryKey: USER_QUERY_KEYS.detail(id),
		queryFn: () => USERS_API.DETAIL(id),
		enabled: Boolean(id),
	});

export const useMeQuery = (
	isEnabled = true,
): UseQueryResult<UserDetail, Error> => {
	const query = useQuery<UserDetail, Error>({
		queryKey: USER_QUERY_KEYS.me,
		queryFn: USERS_API.ME,
		enabled: isEnabled,
		staleTime: 60_000,
	});

	useEffect(() => {
		if (query.data) {
			useAuthStore.setState({
				user: query.data,
			});
		}
	}, [query.data]);

	return query;
};

export const useUserLookupQuery = (query: UserLookupQuery, enabled = true) =>
	useQuery({
		queryKey: USER_QUERY_KEYS.lookup(query),
		queryFn: () => USERS_API.LOOKUP(query),
		enabled,
	});

export const useUserLoginMutation = () => {
	return useMutation<UserLoginResponse, UserLoginError, UserLoginPayload>({
		mutationFn: USERS_API.LOGIN,
		onSuccess: (data) => {
			setTokens(data.access, data.refresh);
			useAuthStore.setState({
				access_token: data.access,
				refresh_token: data.refresh,
			});
		},
	});
};

export const useUserRegisterMutation = () =>
	useMutation<UserRegisterResponse, UserLoginError, UserRegisterPayload>({
		mutationFn: USERS_API.REGISTER,
		// onSuccess: (data) => {
		// 	useAuthStore.setState({
		// 		user: data as any,
		// 		access_token: data.access_token,
		// 		refresh_token: data.refresh_token,
		// 	});
		// },
	});

export const useUserActivateAccountMutation = () =>
	useMutation<
		UserActivateAccountResponse,
		UserLoginError,
		UserActivateAccountPayload
	>({
		mutationFn: USERS_API.ACTIVATE_ACCOUNT,
	});

export const useUserResendActivationCodeMutation = () =>
	useMutation<
		UserResendActivationCodeResponse,
		UserLoginError,
		UserResendActivationCodePayload
	>({
		mutationFn: USERS_API.RESEND_ACTIVATION_CODE,
	});

export const useUserForgotPasswordMutation = () =>
	useMutation<
		UserForgotPasswordResponse,
		UserLoginError,
		UserForgotPasswordPayload
	>({
		mutationFn: USERS_API.FORGOT_PASSWORD,
	});

export const useUserResetPasswordMutation = () =>
	useMutation<
		UserResetPasswordResponse,
		UserResetPasswordErrorResponse,
		UserResetPasswordPayload
	>({
		mutationFn: USERS_API.RESET_PASSWORD,
	});

export const useUserTokenRefreshMutation = () =>
	useMutation<
		UserTokenRefreshResponse,
		UserLoginError,
		UserTokenRefreshPayload
	>({
		mutationFn: USERS_API.TOKEN_REFRESH,
	});

export const useUserChangePasswordMutation = () =>
	useMutation<
		UserChangePasswordResponse,
		UserLoginError,
		UserChangePasswordPayload
	>({
		mutationFn: USERS_API.CHANGE_PASSWORD,
	});

export const useUpdateMeMutation = () =>
	useMutation<
		UserProfileUpdateResponse,
		UserLoginError,
		UserProfileUpdatePayload
	>({
		mutationFn: USERS_API.UPDATE_ME,
	});

export const useUpdateUserDetailMutation = (id: string) =>
	useMutation<UserDetail, UserLoginError, UserDetailUpdatePayload>({
		mutationFn: (payload) => USERS_API.UPDATE_DETAIL(id, payload),
	});

export const useAdminResetUserPasswordMutation = (userId: string) =>
	useMutation<UserAdminResetPasswordResponse, UserLoginError, void>({
		mutationFn: () => USERS_API.ADMIN_RESET_PASSWORD(userId),
	});
