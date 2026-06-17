import { z } from "zod";
import {
	isBlockedregisterEmailDomain,
	PUBLIC_EMAIL_DOMAIN_ERROR_MESSAGE,
} from "#/lib/validators";

export const UserLoginSchema = z.object({
	email: z
		.email({ message: "Invalid email address" })
		.refine((value) => !isBlockedregisterEmailDomain(value), {
			message: PUBLIC_EMAIL_DOMAIN_ERROR_MESSAGE,
		}),
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters long" }),
});

export type UserLoginPayload = z.infer<typeof UserLoginSchema>;

export interface UserLoginResponse {
	refresh: string;
	access: string;
}

export interface UserLoginError {
	message: string;
	status: number;
}
