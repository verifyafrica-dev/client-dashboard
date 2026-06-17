import $http from "../../xhr";
import type { UserLoginPayload, UserLoginResponse } from "./users.types";

const USER_ENDPOINTS = {
	login: "/users/login/",
} as const;

export const USERS_API = {
	LOGIN: async (data: UserLoginPayload): Promise<UserLoginResponse> =>
		await $http.post(USER_ENDPOINTS.login, data).then((res) => res.data),
};
