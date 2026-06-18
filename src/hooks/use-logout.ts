import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { USERS_API } from "#/api/http/v1/users/users.api";
import { deleteAllCookies } from "#/lib/cookies";
import { useAuthStore } from "#/stores/auth-store";

function clearClientAuthState() {
	deleteAllCookies();
	localStorage.clear();
	useAuthStore.getState().clearAuth();
}

export function useLogout() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: USERS_API.LOGOUT,
		onSettled: () => {
			clearClientAuthState();
			queryClient.clear();
			navigate({ to: "/login", replace: true });
		},
	});

	return {
		logout: () => mutation.mutate(),
		isLoggingOut: mutation.isPending,
	};
}
