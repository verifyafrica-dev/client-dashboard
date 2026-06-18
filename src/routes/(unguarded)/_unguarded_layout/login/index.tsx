import { ArrowRightIcon, LockIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { useUserLoginMutation } from "#/api/http/v1/users/users.hooks";
import {
	type UserLoginPayload,
	UserLoginSchema,
	type UserLoginError,
} from "#/api/http/v1/users/users.types";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	getUserLoginErrorFieldErrors,
	toUserLoginError,
} from "#/lib/api-errors";
import { deleteAllCookies } from "#/lib/cookies";
import { useAuthStore } from "#/stores/auth-store";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { AuthPageShell } from "../-components";

export const Route = createFileRoute("/(unguarded)/_unguarded_layout/login/")({
	component: LoginPage,
});

function LoginPage() {
	const [rememberMe, setRememberMe] = useState(true);
	const navigate = useNavigate();
	const userLoginMutation = useUserLoginMutation();
	const [formError, setFormError] = useState<UserLoginError | null>(null);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		} satisfies UserLoginPayload,
		validators: {
			onSubmit: UserLoginSchema,
		},
		onSubmit: async ({ value }) => {
			setFormError(null);
			deleteAllCookies();

			await userLoginMutation.mutateAsync(
				{ payload: value, rememberMe },
				{
					onSuccess: () => {
						const user = useAuthStore.getState().user;

						if (!user?.is_active) {
							toast.error(
								"Your account is not active. Please contact support.",
								{
									duration: 10_000,
								},
							);
							return;
						}

						toast.success("Login successful");
						navigate({ to: "/dashboard" });
					},
					onError: (error) => {
						setFormError(toUserLoginError(error));
					},
				},
			);
		},
	});

	return (
		<AuthPageShell
			title="Welcome back"
			subtitle="Sign in to your VerifyAfrica account"
			footer={
				<p className="mt-6 text-center text-sm text-muted-foreground">
					Don&apos;t have an account?{" "}
					<Link
						to="/register"
						className="font-semibold text-foreground hover:underline"
					>
						Create an account
					</Link>
				</p>
			}
		>
			<form
				id="login-form"
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
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									autoComplete="email"
									placeholder="Enter your email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={
										field.state.meta.isTouched && !field.state.meta.isValid
									}
									aria-describedby={field.state.meta.errors?.join(" ")}
								/>
								{field.state.meta.isTouched && !field.state.meta.isValid && (
									<FieldError errors={field.state.meta.errors} />
								)}
							</Field>
						)}
					</form.Field>
				</FieldGroup>

				<form.Field name="password">
					{(field) => (
						<Field className="flex flex-col gap-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<LockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id="password"
									type="password"
									placeholder="Enter your password"
									autoComplete="current-password"
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
				{formError && (
					<FieldError errors={getUserLoginErrorFieldErrors(formError)} />
				)}
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						<Checkbox
							id="remember-me"
							checked={rememberMe}
							onCheckedChange={(checked) => setRememberMe(checked === true)}
						/>
						<Label htmlFor="remember-me" className="font-normal">
							Remember me
						</Label>
					</div>
					<Link
						to="/forgot-password"
						className="text-sm font-semibold text-foreground hover:underline"
					>
						Forgot password?
					</Link>
				</div>
				<Field orientation="horizontal">
					<Button
						type="submit"
						className="w-full cursor-pointer"
						disabled={userLoginMutation.isPending}
					>
						Sign In
						<ArrowRightIcon className="size-4" weight="bold" />
					</Button>
				</Field>
			</form>
		</AuthPageShell>
	);
}

export default LoginPage;
