import {
	ArrowRightIcon,
	BuildingsIcon,
	EnvelopeSimpleIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { Label } from "#/components/ui/label";
import { AuthPageShell, IconField, PasswordField } from "../-components";

export const Route = createFileRoute("/(unguarded)/_unguarded_layout/register/")({
	component: registerPage,
});

function registerPage() {
	const [acceptedTerms, setAcceptedTerms] = useState(false);

	return (
		<AuthPageShell
			title="Create Account"
			subtitle="Join us today and get started"
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
			<div className="grid gap-4 sm:grid-cols-2">
				<IconField
					id="first-name"
					label="First Name"
					icon={UserIcon}
					placeholder="John"
					autoComplete="given-name"
				/>
				<IconField
					id="last-name"
					label="Last Name"
					icon={UserIcon}
					placeholder="Doe"
					autoComplete="family-name"
				/>
			</div>

			<IconField
				id="company-name"
				label="Company Name"
				icon={BuildingsIcon}
				placeholder="Acme Inc."
				autoComplete="organization"
			/>

			<IconField
				id="email"
				label="Email Address"
				icon={EnvelopeSimpleIcon}
				type="email"
				placeholder="john.doe@example.com"
				autoComplete="email"
			/>

			<PasswordField id="password" label="Password" />

			<div className="flex items-start gap-3">
				<Checkbox
					id="terms"
					checked={acceptedTerms}
					onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
				/>
				<Label
					htmlFor="terms"
					className="text-sm leading-relaxed font-normal text-muted-foreground"
				>
					By creating an account, I agree to VerifyAfrica&apos;s Terms of
					Service, Privacy Policy, and Cookie Policy.
				</Label>
			</div>

			<Button
				type="button"
				className="w-full cursor-pointer"
				disabled={!acceptedTerms}
				asChild
			>
				<Link to="/activate-account">
					Create Account
					<ArrowRightIcon className="size-4" weight="bold" />
				</Link>
			</Button>
		</AuthPageShell>
	);
}
