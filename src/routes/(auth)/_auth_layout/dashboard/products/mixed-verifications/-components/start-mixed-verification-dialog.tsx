import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useStartMixedVerificationV2Mutation } from "#/api/http/v2/verifications/verifications.hooks";
import type { MixedVerification } from "#/api/http/v2/verifications/verifications.types";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { mixedVerificationRequiresAddress } from "../-data";

type StartMixedVerificationDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	template: MixedVerification | null;
	tenantId: string;
};

export function StartMixedVerificationDialog({
	open,
	onOpenChange,
	template,
	tenantId,
}: StartMixedVerificationDialogProps) {
	const startMutation = useStartMixedVerificationV2Mutation();
	const [email, setEmail] = useState("");
	const [fullAddress, setFullAddress] = useState("");
	const requiresAddress = template
		? mixedVerificationRequiresAddress(template)
		: false;

	useEffect(() => {
		if (!open) {
			setEmail("");
			setFullAddress("");
		}
	}, [open]);

	async function handleStart() {
		if (!template) {
			return;
		}

		if (!email.trim()) {
			toast.error("Recipient email is required.");
			return;
		}

		if (requiresAddress && !fullAddress.trim()) {
			toast.error("Full address is required for this template.");
			return;
		}

		try {
			await startMutation.mutateAsync({
				tenantId,
				payload: {
					email: email.trim(),
					is_mixed: true,
					verification_id: template.id,
					is_test: false,
					full_address: requiresAddress ? fullAddress.trim() : undefined,
				},
			});
			toast.success("Mixed verification started successfully.");
			onOpenChange(false);
		} catch {
			toast.error("Failed to start mixed verification.");
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="font-semibold">Start Mixed Verification</DialogTitle>
					<DialogDescription>
						{template?.name ?? "Launch a hosted verification flow for a recipient."}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="mixed-verification-email">Recipient Email</Label>
						<Input
							id="mixed-verification-email"
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="recipient@example.com"
						/>
						<p className="text-xs text-muted-foreground">
							The hosted verification link will be issued for this recipient.
						</p>
					</div>

					{requiresAddress && (
						<div className="space-y-2">
							<Label htmlFor="mixed-verification-address">Full Address</Label>
							<Textarea
								id="mixed-verification-address"
								value={fullAddress}
								onChange={(event) => setFullAddress(event.target.value)}
								placeholder="Enter the recipient's full address"
								rows={3}
							/>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="ghost"
						className="cursor-pointer uppercase tracking-wide"
						disabled={startMutation.isPending}
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						type="button"
						className="cursor-pointer uppercase tracking-wide"
						disabled={startMutation.isPending}
						onClick={() => void handleStart()}
					>
						{startMutation.isPending ? "Starting..." : "Start"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
