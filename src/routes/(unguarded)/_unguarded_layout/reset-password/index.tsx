import { ArrowRightIcon } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "#/components/ui/input-otp";
import { AuthPageShell, PasswordField } from "../-components";

export const Route = createFileRoute("/(unguarded)/_unguarded_layout/reset-password/")({
	component: ResetPasswordPage,
});

const MASKED_EMAIL = "he***@hemline.studio";

function ResetPasswordPage() {
	const [code, setCode] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const isCodeComplete = code.length === 5;
	const passwordsFilled = newPassword.length > 0 && confirmPassword.length > 0;
	const passwordsMatch = newPassword === confirmPassword;
	const canSubmit = isCodeComplete && passwordsFilled && passwordsMatch;

	return (
		<AuthPageShell
			title="Reset password"
			subtitle={`Enter the code sent to ${MASKED_EMAIL} and choose a new password`}
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
			<div className="space-y-3">
				<Label htmlFor="reset-code" className="text-muted-foreground">
					Reset code
				</Label>
				<InputOTP
					id="reset-code"
					maxLength={5}
					value={code}
					onChange={setCode}
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
			</div>

			<PasswordField
				id="new-password"
				label="New Password"
				placeholder="Enter your new password"
				value={newPassword}
				onChange={setNewPassword}
			/>

			<PasswordField
				id="confirm-password"
				label="Confirm New Password"
				placeholder="Confirm your new password"
				value={confirmPassword}
				onChange={setConfirmPassword}
			/>

			{passwordsFilled && !passwordsMatch && (
				<p className="text-sm text-destructive">Passwords do not match.</p>
			)}

			{canSubmit ? (
				<Button type="button" className="w-full cursor-pointer" asChild>
					<Link to="/login">
						Reset Password
						<ArrowRightIcon className="size-4" weight="bold" />
					</Link>
				</Button>
			) : (
				<Button type="button" className="w-full cursor-pointer" disabled>
					Reset Password
					<ArrowRightIcon className="size-4" weight="bold" />
				</Button>
			)}
		</AuthPageShell>
	);
}
