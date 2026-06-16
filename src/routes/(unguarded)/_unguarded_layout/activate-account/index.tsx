import { ArrowRightIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "#/components/ui/input-otp";
import { AuthCard } from "../-components";

export const Route = createFileRoute("/(unguarded)/_unguarded_layout/activate-account/")({
	component: ActivateAccountPage,
});

const MASKED_EMAIL = "he***@hemline.studio";

function ActivateAccountPage() {
	const [code, setCode] = useState("");
	const isCodeComplete = code.length === 5;

	return (
		<AuthCard>
			<div className="flex flex-col items-center gap-3 text-center">
				<div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
					<EnvelopeSimpleIcon className="size-7" weight="duotone" />
				</div>
				<div className="space-y-2">
					<h1 className="text-2xl font-semibold tracking-tight">
						Check your email
					</h1>
					<p className="text-sm text-muted-foreground">
						We sent a verification code to{" "}
						<span className="font-medium text-foreground">{MASKED_EMAIL}</span>
					</p>
				</div>
			</div>

			<div className="space-y-3">
				<Label htmlFor="verification-code" className="text-muted-foreground">
					Enter verification code
				</Label>
				<InputOTP
					id="verification-code"
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

			<Button
				type="button"
				className="w-full cursor-pointer"
				disabled={!isCodeComplete}
			>
				Verify Code
				<ArrowRightIcon className="size-4" weight="bold" />
			</Button>

			<div className="space-y-2 text-center">
				<p className="text-sm text-muted-foreground">
					Didn&apos;t receive the code?
				</p>
				<Button
					type="button"
					variant="link"
					className="h-auto p-0 font-semibold text-primary"
				>
					Resend Code
				</Button>
			</div>
		</AuthCard>
	);
}
