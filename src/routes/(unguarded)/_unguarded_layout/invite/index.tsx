import {
	ArrowRightIcon,
	EnvelopeSimpleIcon,
	UserIcon,
	UsersThreeIcon,
} from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	Link,
	Navigate,
	useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import {
	useAcceptInvitationV2Mutation,
	useCreateUserFromInvitationV2Mutation,
	useUserV2LookupQuery,
} from "#/api/http/v2/users/users.hooks";
import {
	AcceptInvitationNewUserFormSchema,
	type AcceptInvitationNewUserFormValues,
	AcceptInvitationSearchSchema,
} from "#/api/http/v2/users/users.types";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Spinner } from "#/components/ui/spinner";
import { useAuthStore } from "#/stores/auth-store";
import type { V2AxiosError } from "#/api/http/shared";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { AuthPageShell } from "../-components";
import { PasswordField } from "../-components/password-field";

export const Route = createFileRoute("/(unguarded)/_unguarded_layout/invite/")({
	validateSearch: AcceptInvitationSearchSchema,
	component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
	const search = Route.useSearch();
	const { email, token } = search;

	const lookupQuery = useUserV2LookupQuery({ email }, Boolean(email && token));
	const isNewUser = lookupQuery.data ? !lookupQuery.data.exists : null;
	const isLoading =
		lookupQuery.isPending || lookupQuery.isFetching || isNewUser === null;

	if (!email || !token || !search.tenant) {
		return <Navigate to="/login" />;
	}

	if (lookupQuery.isError) {
		const axiosError = lookupQuery.error as V2AxiosError;
		const data = axiosError.response?.data;
		const errors = data?.errors?.length
			? data.errors.map((message) => ({ message }))
			: [{ message: data?.message || "Unable to load invitation details." }];

		return (
			<AuthPageShell
				title="Invitation unavailable"
				subtitle="We couldn't verify this invitation. The link may be invalid or expired."
				footer={
					<p className="mt-6 text-center text-sm text-muted-foreground">
						<Link
							to="/login"
							className="font-semibold text-foreground hover:underline"
						>
							Go to sign in
						</Link>
					</p>
				}
			>
				<FieldError errors={errors} />
			</AuthPageShell>
		);
	}

	if (isLoading) {
		return (
			<AuthPageShell
				title="Loading invitation"
				subtitle="Please wait while we verify your invitation"
			>
				<div className="flex justify-center py-8">
					<Spinner className="size-8 text-primary" />
				</div>
			</AuthPageShell>
		);
	}

	if (isNewUser) {
		return (
			<NewUserInvitationForm
				email={email}
				token={token}
			/>
		);
	}

	return (
		<ExistingUserInvitationPrompt
			email={email}
			token={token}
		/>
	);
}

function NewUserInvitationForm({
	email,
	token,
}: {
	email: string;
	token: string;
}) {
	const navigate = useNavigate();
	const [formErrors, setFormErrors] = useState<Array<{ message: string }>>([]);
	const createUserMutation = useCreateUserFromInvitationV2Mutation();

	const form = useForm({
		defaultValues: {
			token,
			first_name: "",
			last_name: "",
			password: "",
		} satisfies AcceptInvitationNewUserFormValues,
		validators: {
			onSubmit: AcceptInvitationNewUserFormSchema,
		},
		onSubmit: async ({ value }) => {
			setFormErrors([]);

			await createUserMutation.mutateAsync(value, {
				onSuccess: () => {
					toast.success("Account created. You can now sign in.");
					navigate({ to: "/login" });
				},
				onError: (error) => {
					const axiosError = error as V2AxiosError;
					const data = axiosError.response?.data;

					if (data?.errors?.length) {
						setFormErrors(data.errors.map((message) => ({ message })));
						return;
					}

					if (data?.message) {
						setFormErrors([{ message: data.message }]);
						return;
					}

					setFormErrors([
						{ message: axiosError.message || "Something went wrong" },
					]);
				},
			});
		},
	});

	return (
		<AuthPageShell
			title="Create Account"
			subtitle="Set up your account to accept the invitation"
			footer={
				<p className="mt-6 text-center text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link
						to="/login"
						className="font-semibold text-foreground hover:underline"
					>
						Sign in here
					</Link>
				</p>
			}
		>
			<form
				id="accept-invitation-form"
				onSubmit={(event) => {
					event.preventDefault();
					form.handleSubmit();
				}}
				className="flex flex-col gap-4"
			>
				<Field className="flex flex-col gap-2">
					<FieldLabel htmlFor="invitation-email">Email Address</FieldLabel>
					<div className="relative">
						<EnvelopeSimpleIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id="invitation-email"
							type="email"
							value={email}
							disabled
							className="pl-10"
						/>
					</div>
				</Field>

				<div className="grid gap-4 sm:grid-cols-2">
					<form.Field name="first_name">
						{(field) => (
							<Field className="flex flex-col gap-2">
								<FieldLabel htmlFor="first-name">First Name</FieldLabel>
								<div className="relative">
									<UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										id="first-name"
										placeholder="John"
										autoComplete="given-name"
										className="pl-10"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										disabled={createUserMutation.isPending}
										aria-invalid={
											field.state.meta.isTouched && !field.state.meta.isValid
										}
									/>
								</div>
								{field.state.meta.isTouched && !field.state.meta.isValid && (
									<FieldError errors={field.state.meta.errors} />
								)}
							</Field>
						)}
					</form.Field>

					<form.Field name="last_name">
						{(field) => (
							<Field className="flex flex-col gap-2">
								<FieldLabel htmlFor="last-name">Last Name</FieldLabel>
								<div className="relative">
									<UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										id="last-name"
										placeholder="Doe"
										autoComplete="family-name"
										className="pl-10"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										disabled={createUserMutation.isPending}
										aria-invalid={
											field.state.meta.isTouched && !field.state.meta.isValid
										}
									/>
								</div>
								{field.state.meta.isTouched && !field.state.meta.isValid && (
									<FieldError errors={field.state.meta.errors} />
								)}
							</Field>
						)}
					</form.Field>
				</div>

				<FieldGroup className="flex flex-col gap-2">
					<form.Field name="password">
						{(field) => (
							<Field className="flex flex-col gap-2">
								<PasswordField
									id="invitation-password"
									label="Password"
									placeholder="Create a password"
									value={field.state.value}
									onChange={field.handleChange}
								/>
								{field.state.meta.isTouched && !field.state.meta.isValid && (
									<FieldError errors={field.state.meta.errors} />
								)}
							</Field>
						)}
					</form.Field>
				</FieldGroup>

				{formErrors.length > 0 && <FieldError errors={formErrors} />}

				<Field orientation="horizontal">
					<Button
						type="submit"
						className="w-full cursor-pointer"
						disabled={createUserMutation.isPending}
					>
						{createUserMutation.isPending
							? "Creating account..."
							: "Create Account"}
						<ArrowRightIcon
							className="size-4"
							weight="bold"
						/>
					</Button>
				</Field>
			</form>
		</AuthPageShell>
	);
}

function ExistingUserInvitationPrompt({
	email,
	token,
}: {
	email: string;
	token: string;
}) {
	const navigate = useNavigate();
	const user = useAuthStore((state) => state.user);
	const accessToken = useAuthStore((state) => state.access_token);
	const isAuthenticated = Boolean(accessToken && user);
	const emailMatches =
		isAuthenticated && user?.email.toLowerCase() === email.toLowerCase();
	const [formErrors, setFormErrors] = useState<Array<{ message: string }>>([]);
	const acceptInvitationMutation = useAcceptInvitationV2Mutation();

	function handleDecline() {
		navigate({ to: "/login" });
	}

	async function handleAccept() {
		setFormErrors([]);

		if (!isAuthenticated) {
			toast.message("Sign in to accept your invitation");
			navigate({ to: "/login" });
			return;
		}

		if (!emailMatches) {
			setFormErrors([
				{
					message:
						"You are signed in with a different email address. Sign in with the invited email to continue.",
				},
			]);
			return;
		}

		await acceptInvitationMutation.mutateAsync(
			{ token },
			{
				onSuccess: () => {
					toast.success("Invitation accepted successfully");
					navigate({ to: "/dashboard" });
				},
				onError: (error) => {
					const axiosError = error as V2AxiosError;
					const data = axiosError.response?.data;

					if (data?.errors?.length) {
						setFormErrors(data.errors.map((message) => ({ message })));
						return;
					}

					if (data?.message) {
						setFormErrors([{ message: data.message }]);
						return;
					}

					setFormErrors([
						{ message: axiosError.message || "Something went wrong" },
					]);
				},
			},
		);
	}

	return (
		<AuthPageShell
			title="You're invited"
			subtitle={
				isAuthenticated && !emailMatches
					? "This invitation was sent to a different email address"
					: "Join your team on VerifyAfrica"
			}
			footer={
				<p className="mt-6 text-center text-sm text-muted-foreground">
					<Link
						to="/login"
						className="font-semibold text-foreground hover:underline"
					>
						Go to sign in
					</Link>
				</p>
			}
		>
			<div className="flex flex-col items-center gap-3 text-center">
				<div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
					<UsersThreeIcon
						className="size-7"
						weight="duotone"
					/>
				</div>
				<p className="text-sm text-muted-foreground">
					Hi <span className="font-medium text-foreground">{email}</span>,
					you&apos;ve been invited to join a team on VerifyAfrica. Would you
					like to accept this invitation?
				</p>
			</div>

			{formErrors.length > 0 && <FieldError errors={formErrors} />}

			<div className="grid gap-3 sm:grid-cols-2">
				<Button
					type="button"
					className="w-full cursor-pointer"
					disabled={acceptInvitationMutation.isPending}
					onClick={handleAccept}
				>
					{acceptInvitationMutation.isPending
						? "Accepting..."
						: isAuthenticated
							? "Accept"
							: "Sign in to accept"}
				</Button>
				<Button
					type="button"
					variant="outline"
					className="w-full cursor-pointer"
					disabled={acceptInvitationMutation.isPending}
					onClick={handleDecline}
				>
					Decline
				</Button>
			</div>
		</AuthPageShell>
	);
}
