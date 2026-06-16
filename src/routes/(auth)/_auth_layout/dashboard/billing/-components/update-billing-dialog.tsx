import {
	BuildingsIcon,
	EnvelopeSimpleIcon,
	GlobeHemisphereWestIcon,
	HouseIcon,
} from "@phosphor-icons/react";
import { type ComponentProps, type ComponentType } from "react";
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
import { COUNTRIES } from "#/lib/constants.ts";
import { BILLING_INFO } from "../-data";

function IconField({
	id,
	label,
	icon: Icon,
	defaultValue,
	className,
}: {
	id: string;
	label: string;
	icon?: ComponentType<{ className?: string }>;
	defaultValue?: string;
	className?: string;
}) {
	return (
		<div className={cn("space-y-2", className)}>
			<Label htmlFor={id}>{label}</Label>
			<div className="relative">
				{Icon && (
					<Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				)}
				<Input
					id={id}
					defaultValue={defaultValue}
					className={Icon ? "pl-10" : undefined}
				/>
			</div>
		</div>
	);
}

export function UpdateBillingDialog({
	open,
	onOpenChange,
}: ComponentProps<typeof Dialog>) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<BuildingsIcon className="size-5 text-primary" weight="duotone" />
						Update Billing Information
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<IconField
						id="billing-name"
						label="Billing Name"
						icon={BuildingsIcon}
						defaultValue={BILLING_INFO.name}
					/>
					<IconField
						id="billing-email"
						label="Billing Email"
						icon={EnvelopeSimpleIcon}
						defaultValue={BILLING_INFO.email}
					/>
					<IconField
						id="billing-address"
						label="Billing Address"
						icon={HouseIcon}
						defaultValue={BILLING_INFO.address}
					/>
					<div className="grid gap-4 sm:grid-cols-3">
						<IconField
							id="billing-city"
							label="City"
							icon={BuildingsIcon}
							defaultValue={BILLING_INFO.city}
						/>
						<IconField
							id="billing-state"
							label="State/Province"
							defaultValue={BILLING_INFO.state}
						/>
						<IconField
							id="billing-postal"
							label="Postal Code"
							defaultValue={BILLING_INFO.postalCode}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="billing-country">Country</Label>
						<div className="relative">
							<GlobeHemisphereWestIcon className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
							<Select defaultValue={BILLING_INFO.country}>
								<SelectTrigger id="billing-country" className="w-full pl-10">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{COUNTRIES.map((country) => (
										<SelectItem key={country.code} value={country.name}>
											{country.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						className="cursor-pointer"
						onClick={() => onOpenChange?.(false)}
					>
						Cancel
					</Button>
					<Button type="button" className="cursor-pointer">
						Update Billing Info
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
