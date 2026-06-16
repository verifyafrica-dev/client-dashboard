import { ArrowRightIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { Label } from "#/components/ui/label";
import { AuthPageShell, IconField, PasswordField } from "../-components";

export const Route = createFileRoute("/(unguarded)/_unguarded_layout/login/")({
	component: LoginPage,
});

function LoginPage() {
	const [rememberMe, setRememberMe] = useState(false);

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
			<IconField
				id="email"
				label="Email Address"
				icon={EnvelopeSimpleIcon}
				type="email"
				placeholder="Enter your email"
				autoComplete="email"
			/>

			<PasswordField id="password" label="Password" />

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

			<Button type="button" className="w-full cursor-pointer" asChild>
				<Link to="/dashboard">
					Sign In
					<ArrowRightIcon className="size-4" weight="bold" />
				</Link>
			</Button>
		</AuthPageShell>
	);
}
