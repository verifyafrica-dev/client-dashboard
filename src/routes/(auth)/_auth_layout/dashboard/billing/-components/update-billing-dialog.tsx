import {
	BuildingsIcon,
	EnvelopeSimpleIcon,
	HouseIcon,
} from "@phosphor-icons/react";
import {
	type ComponentProps,
	type ComponentType,
	useEffect,
	useState,
} from "react";
import { toast } from "sonner";

import {
	useCreateBillingInformationV2Mutation,
	useUpdateTenantBillingInformationV2Mutation,
} from "#/api/http/v2/billing/billing.hooks";
import type { BillingInformation } from "#/api/http/v2/billing/billing.types";
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
import { CountryStateCityFields } from "#/components/ui-extended/country-state-city-fields";
import { cn } from "#/lib/utils.ts";

type BillingFormState = {
	billing_name: string;
	billing_email: string;
	billing_address: string;
	billing_city: string;
	billing_state: string;
	billing_postal_code: string;
	billing_country: string;
};

const EMPTY_FORM: BillingFormState = {
	billing_name: "",
	billing_email: "",
	billing_address: "",
	billing_city: "",
	billing_state: "",
	billing_postal_code: "",
	billing_country: "",
};

function getFormState(billingInfo?: BillingInformation): BillingFormState {
	if (!billingInfo) {
		return EMPTY_FORM;
	}

	return {
		billing_name: billingInfo.billing_name ?? "",
		billing_email: billingInfo.billing_email ?? "",
		billing_address: billingInfo.billing_address ?? "",
		billing_city: billingInfo.billing_city ?? "",
		billing_state: billingInfo.billing_state ?? "",
		billing_postal_code: billingInfo.billing_postal_code ?? "",
		billing_country: billingInfo.billing_country ?? "",
	};
}

function IconField({
	id,
	label,
	icon: Icon,
	value,
	onChange,
	className,
	disabled,
}: {
	id: string;
	label: string;
	icon?: ComponentType<{ className?: string }>;
	value: string;
	onChange: (value: string) => void;
	className?: string;
	disabled?: boolean;
}) {
	return (
		<div className={cn("space-y-1.5", className)}>
			<Label htmlFor={id}>{label}</Label>
			<div className="relative">
				{Icon && (
					<Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				)}
				<Input
					id={id}
					value={value}
					onChange={(event) => onChange(event.target.value)}
					className={Icon ? "pl-10" : undefined}
					disabled={disabled}
				/>
			</div>
		</div>
	);
}

export function UpdateBillingDialog({
	open,
	onOpenChange,
	billingInfo,
	tenantId,
}: ComponentProps<typeof Dialog> & {
	billingInfo?: BillingInformation;
	tenantId?: string;
}) {
	const [form, setForm] = useState<BillingFormState>(EMPTY_FORM);
	const createMutation = useCreateBillingInformationV2Mutation();
	const updateMutation = useUpdateTenantBillingInformationV2Mutation(
		tenantId ?? "",
	);

	const isSaving = createMutation.isPending || updateMutation.isPending;

	useEffect(() => {
		if (open) {
			setForm(getFormState(billingInfo));
		}
	}, [open, billingInfo]);

	function updateField<K extends keyof BillingFormState>(
		field: K,
		value: BillingFormState[K],
	) {
		setForm((current) => ({ ...current, [field]: value }));
	}

	function handleSubmit() {
		if (billingInfo) {
			const { billing_email: _billingEmail, ...updatePayload } = form;
			updateMutation.mutate(updatePayload, {
				onSuccess: () => {
					toast.success("Billing information updated");
					onOpenChange?.(false);
				},
				onError: () => {
					toast.error("Failed to update billing information");
				},
			});
			return;
		}

		if (!tenantId) {
			toast.error("Tenant information is unavailable");
			return;
		}

		createMutation.mutate(
			{
				tenant: tenantId,
				billing_plan: "payg",
				...form,
			},
			{
				onSuccess: () => {
					toast.success("Billing information saved");
					onOpenChange?.(false);
				},
				onError: () => {
					toast.error("Failed to save billing information");
				},
			},
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 font-semibold">
						<BuildingsIcon className="size-5 text-primary" weight="duotone" />
						Update Billing Information
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<IconField
						id="billing-name"
						label="Billing Name"
						icon={BuildingsIcon}
						value={form.billing_name}
						onChange={(value) => updateField("billing_name", value)}
					/>
					<IconField
						id="billing-email"
						label="Billing Email"
						icon={EnvelopeSimpleIcon}
						value={form.billing_email}
						onChange={(value) => updateField("billing_email", value)}
						disabled={Boolean(billingInfo)}
					/>
					<IconField
						id="billing-address"
						label="Billing Address"
						icon={HouseIcon}
						value={form.billing_address}
						onChange={(value) => updateField("billing_address", value)}
					/>
					<CountryStateCityFields
						country={form.billing_country}
						state={form.billing_state}
						city={form.billing_city}
						postalCode={form.billing_postal_code}
						onCountryChange={(value) => updateField("billing_country", value)}
						onStateChange={(value) => updateField("billing_state", value)}
						onCityChange={(value) => updateField("billing_city", value)}
						onPostalCodeChange={(value) =>
							updateField("billing_postal_code", value)
						}
					/>
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
					<Button
						type="button"
						className="cursor-pointer"
						disabled={isSaving}
						onClick={handleSubmit}
					>
						{isSaving ? "Saving..." : "Update Billing Info"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
