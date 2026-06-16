import {
	EnvelopeSimpleIcon,
	IdentificationCardIcon,
} from "@phosphor-icons/react";
import {
	type ComponentProps,
	type ComponentType,
	useEffect,
	useState,
} from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { cn } from "#/lib/utils.ts";
import { INVITATION_ROLES, ROLE_LABELS, type TenantUserRole } from "../-data";

type InviteUserDialogProps = ComponentProps<typeof Dialog> & {
	onInvite?: (payload: { email: string; role: TenantUserRole }) => void;
};

function IconField({
	id,
	label,
	icon: Icon,
	children,
	className,
}: {
	id: string;
	label: string;
	icon?: ComponentType<{ className?: string }>;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("space-y-2", className)}>
			<Label htmlFor={id}>{label}</Label>
			<div className="relative">
				{Icon && (
					<Icon className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
				)}
				{children}
			</div>
		</div>
	);
}

export function InviteUserDialog({
	open,
	onOpenChange,
	onInvite,
}: InviteUserDialogProps) {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<TenantUserRole>("member");

	const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

	useEffect(() => {
		if (!open) {
			setEmail("");
			setRole("member");
		}
	}, [open]);

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!isValidEmail) return;

		onInvite?.({ email, role });
		onOpenChange?.(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Invite New User</DialogTitle>
				</DialogHeader>

				<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
					<IconField
						id="invite-email"
						label="Email Address"
						icon={EnvelopeSimpleIcon}
					>
						<Input
							id="invite-email"
							type="email"
							placeholder="user@example.com"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							className="pl-10"
							required
						/>
					</IconField>

					<IconField
						id="invite-role"
						label="Role"
						icon={IdentificationCardIcon}
					>
						<Select
							value={role}
							onValueChange={(value) => setRole(value as TenantUserRole)}
						>
							<SelectTrigger id="invite-role" className="w-full pl-10">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{INVITATION_ROLES.map((option) => (
									<SelectItem key={option} value={option}>
										{ROLE_LABELS[option]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</IconField>

					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							className="cursor-pointer text-primary"
							onClick={() => onOpenChange?.(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!isValidEmail}
							className="cursor-pointer uppercase tracking-wide"
						>
							Send Invitation
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
