import {
	ArrowsClockwiseIcon,
	CheckIcon,
	ClockIcon,
	CopyIcon,
	EyeIcon,
	EyeSlashIcon,
	KeyIcon,
	ShieldCheckIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Separator } from "#/components/ui/separator";
import { Switch } from "#/components/ui/switch";
import { cn } from "#/lib/utils.ts";

export const Route = createFileRoute("/(auth)/_layout/dashboard/apikeys/")({
	component: ApiKeysPage,
});

const API_KEY = {
	full: "VA-G3KuleQxkkdBjKqu4mN8pRt2wXyZ1aBcDeFgHiJk",
	masked: "VA-G3Ku1••••••••••••••••••••",
	preview: "VA-G3KuleQxkkdBjKqu4...",
	lastUsed: "Never",
	expires: "Never",
} as const;

function ApiKeysPage() {
	const [isKeyVisible, setIsKeyVisible] = useState(false);
	const [isKeyActive, setIsKeyActive] = useState(true);
	const [copied, setCopied] = useState(false);

	const displayedKey = isKeyVisible ? API_KEY.full : API_KEY.masked;

	async function handleCopy() {
		const valueToCopy = isKeyVisible ? API_KEY.full : API_KEY.full;
		await navigator.clipboard.writeText(valueToCopy);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
			<div className="flex items-start gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<ShieldCheckIcon className="size-5" weight="duotone" />
				</div>
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						API Access Key
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Manage your API key to authenticate requests to the VerifyAfrica
						API.
					</p>
				</div>
			</div>

			<Card>
				<CardHeader className="flex sm:flex-row items-start justify-between gap-4 space-y-0 flex-col">
					<div className="flex items-start gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
							<KeyIcon className="size-5 text-muted-foreground" />
						</div>
						<div>
							<CardTitle className="font-semibold">
								Production API Key
							</CardTitle>
							<CardDescription>Active and ready to use</CardDescription>
						</div>
					</div>
					<Badge
						variant="outline"
						className="border-emerald-200 bg-emerald-50 text-emerald-700"
					>
						<CheckIcon className="size-3" weight="bold" />
						Active
					</Badge>
				</CardHeader>

				<CardContent className="flex flex-col gap-6">
					<div className="space-y-2">
						<Label htmlFor="api-key">API Key</Label>
						<div className="flex gap-2">
							<Input
								id="api-key"
								readOnly
								value={displayedKey}
								className="font-mono text-sm"
							/>
							<Button
								type="button"
								variant="outline"
								size="icon"
								onClick={() => setIsKeyVisible((visible) => !visible)}
								aria-label={isKeyVisible ? "Hide API key" : "Reveal API key"}
								className="cursor-pointer"
							>
								{isKeyVisible ? (
									<EyeSlashIcon className="size-4" />
								) : (
									<EyeIcon className="size-4" />
								)}
							</Button>
							<Button
								type="button"
								variant="outline"
								size="icon"
								onClick={handleCopy}
								aria-label="Copy API key"
								className="cursor-pointer"
							>
								{copied ? (
									<CheckIcon className="size-4 text-emerald-600" />
								) : (
									<CopyIcon className="size-4" />
								)}
							</Button>
						</div>
						<p className="text-xs text-muted-foreground">
							Click the eye icon to reveal the full key before copying
						</p>
					</div>

					<div className="grid gap-3 sm:grid-cols-3">
						<div className="rounded-lg border bg-muted/30 px-4 py-3">
							<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
								Last Used
							</p>
							<div className="mt-1 flex items-center gap-2 text-sm font-medium">
								<ClockIcon className="size-4 text-muted-foreground" />
								{API_KEY.lastUsed}
							</div>
						</div>
						<div className="rounded-lg border bg-muted/30 px-4 py-3">
							<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
								Status
							</p>
							<div className="mt-1">
								<Badge
									variant="outline"
									className={cn(
										"border-emerald-200 bg-emerald-50 text-emerald-700",
										!isKeyActive &&
											"border-muted bg-muted text-muted-foreground",
									)}
								>
									{isKeyActive ? "Active" : "Inactive"}
								</Badge>
							</div>
						</div>
						<div className="rounded-lg border bg-muted/30 px-4 py-3">
							<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
								Expires
							</p>
							<p className="mt-1 text-sm font-medium">{API_KEY.expires}</p>
						</div>
					</div>

					<Separator />

					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-3">
							<Switch
								id="key-status"
								checked={isKeyActive}
								onCheckedChange={setIsKeyActive}
								className="cursor-pointer"
							/>
							<Label htmlFor="key-status" className="font-medium">
								Key Status
							</Label>
						</div>
						<Button
							type="button"
							variant="outline"
							className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 cursor-pointer"
						>
							<ArrowsClockwiseIcon className="size-4" />
							Rotate Key
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<KeyIcon className="size-5 text-muted-foreground" />
						<CardTitle>Usage Instructions</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="rounded-lg border bg-muted/20 p-4">
						<div className="flex gap-3 flex-col sm:flex-row items-start">
							<div className="flex items-center gap-2">
								<div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
									1
								</div>
								<h3 className="font-medium block sm:hidden">
									Authentication Header
								</h3>
							</div>
							<div className="flex min-w-0 flex-1 flex-col gap-2">
								<h3 className="font-medium hidden sm:block">
									Authentication Header
								</h3>
								<p className="text-sm text-muted-foreground">
									Include your API key in the X-API-KEY header:
								</p>
								<pre className="min-w-full overflow-x-auto rounded-lg bg-zinc-900 px-4 py-3 text-sm text-emerald-400">
									<code className="break-all whitespace-pre-wrap">{`X-API-KEY: ${API_KEY.preview}`}</code>
								</pre>
							</div>
						</div>
					</div>

					<div className="rounded-lg border bg-muted/20 p-4">
						<div className="flex gap-3 flex-col sm:flex-row items-start">
							<div className="flex items-center gap-2">
								<div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
									2
								</div>
								<h3 className="font-medium block sm:hidden">
									Security Best Practices
								</h3>
							</div>
							<div className="flex min-w-0 flex-1 flex-col gap-2">
								<h3 className="font-medium hidden sm:block">
									Security Best Practices
								</h3>
								<ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
									<li>Store keys in environment variables, never in code</li>
									<li>Rotate keys periodically or when compromised</li>
									<li>Deactivate keys when not in use</li>
								</ul>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
