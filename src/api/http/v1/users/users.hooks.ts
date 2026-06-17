import { useMutation } from "@tanstack/react-query";
import { USERS_API } from "./users.api";
import type {
	UserLoginError,
	UserLoginPayload,
	UserLoginResponse,
} from "./users.types";

export const useUserLoginMutation = () => {
	return useMutation<UserLoginResponse, UserLoginError, UserLoginPayload>({
		mutationFn: USERS_API.LOGIN,
	});
};
