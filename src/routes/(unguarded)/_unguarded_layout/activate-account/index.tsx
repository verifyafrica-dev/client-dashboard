import { ArrowRightIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	Link,
	Navigate,
	useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
	useUserActivateAccountMutation,
	useUserResendActivationCodeMutation,
} from "#/api/http/v1/users/users.hooks";
import {
	type UserActivateAccountPayload,
	UserActivateAccountSchema,
	type UserLoginError,
} from "#/api/http/v1/users/users.types";
import { Button } from "#/components/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "#/components/ui/input-otp";
import { Label } from "#/components/ui/label";
import {
	getUserLoginErrorFieldErrors,
	toUserLoginError,
} from "#/lib/api-errors";
import { Field, FieldError } from "@/components/ui/field";
import { AuthPageShell } from "../-components";

const activateAccountSearchSchema = z.object({
	email: z.email({ message: "Invalid email address" }),
});

export const Route = createFileRoute(
	"/(unguarded)/_unguarded_layout/activate-account/",
)({
	validateSearch: activateAccountSearchSchema,
	component: ActivateAccountPage,
});

function maskEmail(email: string) {
	const [localPart, domain] = email.split("@");
	if (!localPart || !domain) {
		return email;
	}

	return `${localPart.slice(0, 2)}***@${domain}`;
}

function ActivateAccountPage() {
	const navigate = useNavigate();
	const { email } = Route.useSearch();
	const activateAccountMutation = useUserActivateAccountMutation();
	const resendActivationCodeMutation = useUserResendActivationCodeMutation();
	// const [formError, setFormError] = useState<UserLoginError | null>(null);
	const [resendError, setResendError] = useState<UserLoginError | null>(null);

	const form = useForm({
		defaultValues: {
			email,
			code: "",
		} satisfies UserActivateAccountPayload,
		validators: {
			onSubmit: UserActivateAccountSchema,
		},
		onSubmit: async ({ value }) => {
			// setFormError(null);

			await activateAccountMutation.mutateAsync(value, {
				onSuccess: () => {
					toast.success("Account activated successfully");
					navigate({ to: "/login" });
				},
				onError: () => {
					toast.error("Invalid activation code");
					// setFormError(toUserLoginError(error));
				},
			});
		},
	});

	const handleResendCode = async () => {
		setResendError(null);

		await resendActivationCodeMutation.mutateAsync(
			{ email },
			{
				onSuccess: () => {
					toast.success("Verification code resent");
				},
				onError: (error) => {
					setResendError(toUserLoginError(error));
				},
			},
		);
	};

	if (!email) {
		return <Navigate to="/register" />;
	}

	return (
		<AuthPageShell
			title="Check your email"
			subtitle={`We sent a verification code to ${maskEmail(email)}`}
			footer={
				<p className="mt-6 text-center text-sm text-muted-foreground">
					Already verified?{" "}
					<Link
						to="/login"
						className="font-semibold text-foreground hover:underline"
					>
						Sign in here
					</Link>
				</p>
			}
		>
			<div className="flex flex-col items-center gap-3 text-center">
				<div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
					<EnvelopeSimpleIcon className="size-7" weight="duotone" />
				</div>
			</div>

			<form
				id="activate-account-form"
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="flex flex-col gap-4"
			>
				<form.Field name="code">
					{(field) => (
						<Field className="flex flex-col gap-2">
							<Label
								htmlFor="verification-code"
								className="text-muted-foreground"
							>
								Enter verification code
							</Label>
							<InputOTP
								id="verification-code"
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

				{/* {formError && (
					<FieldError errors={getUserLoginErrorFieldErrors(formError)} />
				)} */}

				{resendError && (
					<FieldError errors={getUserLoginErrorFieldErrors(resendError)} />
				)}

				<Field orientation="horizontal">
					<Button
						type="submit"
						className="w-full cursor-pointer"
						disabled={activateAccountMutation.isPending}
					>
						Verify Code
						<ArrowRightIcon className="size-4" weight="bold" />
					</Button>
				</Field>

				<div className="space-y-2 text-center">
					<p className="text-sm text-muted-foreground">
						Didn&apos;t receive the code?
					</p>
					<Button
						type="button"
						variant="link"
						className="h-auto p-0 font-semibold text-primary"
						disabled={resendActivationCodeMutation.isPending}
						onClick={handleResendCode}
					>
						Resend Code
					</Button>
				</div>
			</form>
		</AuthPageShell>
	);
}
