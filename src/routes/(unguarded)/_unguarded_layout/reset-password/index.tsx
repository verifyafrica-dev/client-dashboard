import { ArrowRightIcon, LockIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	Link,
	Navigate,
	useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { useUserResetPasswordMutation } from "#/api/http/v1/users/users.hooks";
import {
	UserResetPasswordFormSchema,
	type UserResetPasswordFormValues,
	UserResetPasswordSearchSchema,
	type UserResetPasswordErrorResponse,
} from "#/api/http/v1/users/users.types";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "#/components/ui/input-otp";
import { Label } from "#/components/ui/label";
import { getUserResetPasswordErrorFieldErrors } from "#/lib/api-errors";
import { deleteAllCookies } from "#/lib/cookies";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { AuthPageShell } from "../-components";

export const Route = createFileRoute(
	"/(unguarded)/_unguarded_layout/reset-password/",
)({
	validateSearch: UserResetPasswordSearchSchema,
	component: ResetPasswordPage,
});

function maskEmail(email: string) {
	const [localPart, domain] = email.split("@");
	if (!localPart || !domain) {
		return email;
	}

	return `${localPart.slice(0, 2)}***@${domain}`;
}

function ResetPasswordPage() {
	const navigate = useNavigate();
	const { email } = Route.useSearch();
	const resetPasswordMutation = useUserResetPasswordMutation();
	const [formError, setFormError] =
		useState<UserResetPasswordErrorResponse | null>(null);

	const form = useForm({
		defaultValues: {
			email,
			code: "",
			new_password: "",
			confirm_password: "",
		} satisfies UserResetPasswordFormValues,
		validators: {
			onSubmit: UserResetPasswordFormSchema,
		},
		onSubmit: async ({ value }) => {
			setFormError(null);
			deleteAllCookies();

			await resetPasswordMutation.mutateAsync(
				{
					email: value.email,
					code: value.code,
					new_password: value.new_password,
				},
				{
					onSuccess: () => {
						toast.success("Password reset successful");
						navigate({ to: "/login" });
					},
					onError: (error) => {
						setFormError(error);
					},
				},
			);
		},
	});

	if (!email) {
		return <Navigate to="/forgot-password" />;
	}

	return (
		<AuthPageShell
			title="Reset password"
			subtitle={`Enter the code sent to ${maskEmail(email)} and choose a new password`}
			footer={
				<p className="mt-6 text-center text-sm text-muted-foreground">
					Didn&apos;t receive the code?{" "}
					<Link
						to="/forgot-password"
						className="font-semibold text-foreground hover:underline"
					>
						Try again
					</Link>
				</p>
			}
		>
			<form
				id="reset-password-form"
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="flex flex-col gap-4"
			>
				<form.Field name="code">
					{(field) => (
						<Field className="flex flex-col gap-2">
							<Label htmlFor="reset-code" className="text-muted-foreground">
								Reset code
							</Label>
							<InputOTP
								id="reset-code"
								maxLength={5}
								value={field.state.value}
								onChange={field.handleChange}
								onBlur={field.handleBlur}
								containerClassName="justify-center"
							>
								<InputOTPGroup>
									<InputOTPSlot index={0} className="size-12 text-base" />
									<InputOTPSlot index={1} className="size-12 text-base" />
									<InputOTPSlot index={2} className="size-12 text-base" />
									<InputOTPSlot index={3} className="size-12 text-base" />
									<InputOTPSlot index={4} className="size-12 text-base" />
								</InputOTPGroup>
							</InputOTP>
							{field.state.meta.isTouched && !field.state.meta.isValid && (
								<FieldError errors={field.state.meta.errors} />
							)}
						</Field>
					)}
				</form.Field>

				<FieldGroup className="flex flex-col gap-2">
					<form.Field name="new_password">
						{(field) => (
							<Field className="flex flex-col gap-2">
								<Label htmlFor="new-password">New Password</Label>
								<div className="relative">
									<LockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										id="new-password"
										type="password"
										placeholder="Enter your new password"
										autoComplete="new-password"
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

					<form.Field name="confirm_password">
						{(field) => (
							<Field className="flex flex-col gap-2">
								<Label htmlFor="confirm-password">Confirm New Password</Label>
								<div className="relative">
									<LockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										id="confirm-password"
										type="password"
										placeholder="Confirm your new password"
										autoComplete="new-password"
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
					<FieldError
						errors={getUserResetPasswordErrorFieldErrors(formError)}
					/>
				)}

				<Field orientation="horizontal">
					<Button
						type="submit"
						className="w-full cursor-pointer"
						disabled={resetPasswordMutation.isPending}
					>
						Reset Password
						<ArrowRightIcon className="size-4" weight="bold" />
					</Button>
				</Field>
			</form>
		</AuthPageShell>
	);
}
