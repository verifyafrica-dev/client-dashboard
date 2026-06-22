import { z } from "zod";

import { InvitationCompleteFormSchema } from "#/api/http/v1/tenants/tenants.types";

export const AcceptInvitationSearchSchema = z.object({
	email: z.email({ message: "Invalid email address" }),
	token: z.uuid({ message: "Invalid invitation token" }),
	tenant: z.uuid({ message: "Invalid tenant id" }),
});

export type AcceptInvitationSearch = z.infer<typeof AcceptInvitationSearchSchema>;

export const AcceptInvitationNewUserFormSchema =
	InvitationCompleteFormSchema.extend({
		first_name: z.string().min(1, { message: "First name is required" }),
		last_name: z.string().min(1, { message: "Last name is required" }),
	});

export type AcceptInvitationNewUserFormValues = z.infer<
	typeof AcceptInvitationNewUserFormSchema
>;
