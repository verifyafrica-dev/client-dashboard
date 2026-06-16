import { ArrowRightIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { AuthPageShell, IconField } from "../-components";

export const Route = createFileRoute("/(unguarded)/_unguarded_layout/forgot-password/")({
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
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
			<IconField
				id="email"
				label="Email Address"
				icon={EnvelopeSimpleIcon}
				type="email"
				placeholder="Enter your email"
				autoComplete="email"
			/>

			<Button type="button" className="w-full cursor-pointer" asChild>
				<Link to="/reset-password">
					Send Reset Code
					<ArrowRightIcon className="size-4" weight="bold" />
				</Link>
			</Button>
		</AuthPageShell>
	);
}
