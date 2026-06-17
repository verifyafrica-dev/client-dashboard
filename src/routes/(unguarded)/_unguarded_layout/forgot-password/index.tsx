import { ArrowRightIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { useUserForgotPasswordMutation } from "#/api/http/v1/users/users.hooks";
import {
	type UserForgotPasswordPayload,
	UserForgotPasswordSchema,
	type UserLoginError,
} from "#/api/http/v1/users/users.types";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
	getUserLoginErrorFieldErrors,
	toUserLoginError,
} from "#/lib/api-errors";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { AuthPageShell } from "../-components";

export const Route = createFileRoute(
	"/(unguarded)/_unguarded_layout/forgot-password/",
)({
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	const navigate = useNavigate();
	const forgotPasswordMutation = useUserForgotPasswordMutation();
	const [formError, setFormError] = useState<UserLoginError | null>(null);

	const form = useForm({
		defaultValues: {
			email: "",
		} satisfies UserForgotPasswordPayload,
		validators: {
			onSubmit: UserForgotPasswordSchema,
		},
		onSubmit: async ({ value }) => {
			setFormError(null);

			await forgotPasswordMutation.mutateAsync(value, {
				onSuccess: () => {
					toast.success("Reset code sent to your email");
					navigate({
						to: "/reset-password",
						search: { email: value.email },
					});
				},
				onError: (error) => {
					setFormError(toUserLoginError(error));
				},
			});
		},
	});

	return (
		<AuthPageShell
			title="Forgot password?"
			subtitle="Enter your email and we'll send you a reset code"
			footer={
				<p className="mt-6 text-center text-sm text-muted-foreground">
					Remember your password?{" "}
					<Link
						to="/login"
						className="font-semibold text-foreground hover:underline"
					>
						Back to sign in
					</Link>
				</p>
			}
		>
			<form
				id="forgot-password-form"
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="flex flex-col gap-4"
			>
				<FieldGroup className="flex flex-col gap-2">
					<form.Field name="email">
						{(field) => (
							<Field className="flex flex-col gap-2">
								<FieldLabel htmlFor="email">Email Address</FieldLabel>
								<div className="relative">
									<EnvelopeSimpleIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										id="email"
										type="email"
										autoComplete="email"
										placeholder="Enter your email"
										className="pl-10"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={
											field.state.meta.isTouched && !field.state.meta.isValid
										}
										aria-describedby={field.state.meta.errors?.join(" ")}
									/>
								</div>
								{field.state.meta.isTouched && !field.state.meta.isValid && (
									<FieldError errors={field.state.meta.errors} />
								)}
							</Field>
						)}
					</form.Field>
				</FieldGroup>

				{formError && (
					<FieldError errors={getUserLoginErrorFieldErrors(formError)} />
				)}

				<Field orientation="horizontal">
					<Button
						type="submit"
						className="w-full cursor-pointer"
						disabled={forgotPasswordMutation.isPending}
					>
						Send Reset Code
						<ArrowRightIcon className="size-4" weight="bold" />
					</Button>
				</Field>
			</form>
		</AuthPageShell>
	);
}
