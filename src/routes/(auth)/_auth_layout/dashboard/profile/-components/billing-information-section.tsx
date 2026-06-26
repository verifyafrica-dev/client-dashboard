import {
	BuildingsIcon,
	EnvelopeSimpleIcon,
	FloppyDiskIcon,
	HouseIcon,
} from "@phosphor-icons/react";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import {
	useCreateBillingInformationV2Mutation,
	useTenantBillingInformationV2Query,
	useUpdateTenantBillingInformationV2Mutation,
} from "#/api/http/v2/billing/billing.hooks";
import type { BillingInformation } from "#/api/http/v2/billing/billing.types";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Separator } from "#/components/ui/separator";
import { Skeleton } from "#/components/ui/skeleton";
import { CountryStateCityFields } from "#/components/ui-extended/country-state-city-fields";
import { cn } from "#/lib/utils.ts";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { isBillingNotFoundError } from "../../billing/-data";
import { useCurrentTenant } from "../../team/-data";

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

export function BillingInformationSection() {
	const { tenantId } = useCurrentTenant();
	const billingInformationQuery = useTenantBillingInformationV2Query(
		tenantId,
		Boolean(tenantId),
	);
	const billingInfo = billingInformationQuery.data;
	const isBillingNotFound = isBillingNotFoundError(billingInformationQuery.error);

	const [form, setForm] = useState<BillingFormState>(EMPTY_FORM);
	const createMutation = useCreateBillingInformationV2Mutation();
	const updateMutation = useUpdateTenantBillingInformationV2Mutation(
		tenantId ?? "",
	);

	const isLoading =
		billingInformationQuery.isPending || billingInformationQuery.isFetching;
	const isSaving = createMutation.isPending || updateMutation.isPending;

	useEffect(() => {
		setForm(getFormState(billingInfo));
	}, [billingInfo]);

	function updateField<K extends keyof BillingFormState>(
		field: K,
		value: BillingFormState[K],
	) {
		setForm((current) => ({ ...current, [field]: value }));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (billingInfo) {
			const { billing_email: _billingEmail, ...updatePayload } = form;
			updateMutation.mutate(updatePayload, {
				onSuccess: () => {
					toast.success("Billing information updated");
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
				},
				onError: () => {
					toast.error("Failed to save billing information");
				},
			},
		);
	}

	if (billingInformationQuery.isError && !isBillingNotFound) {
		return (
			<div className="flex flex-col gap-4">
				<Separator />
				<div className="flex flex-col gap-1">
					<h3 className="text-base font-semibold">Billing Information</h3>
					<p className="text-sm text-muted-foreground">
						Failed to load billing information. Please try again.
					</p>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return <BillingInformationSectionSkeleton />;
	}

	return (
		<div className="flex flex-col gap-6">
			<Separator />
			<div className="flex flex-col gap-1">
				<h3 className="text-base font-semibold">Billing Information</h3>
				<p className="text-sm text-muted-foreground">
					Manage the billing details used for invoices and receipts
				</p>
			</div>

			<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
				<FieldGroup className="grid gap-4">
					<Field className="flex flex-col gap-2">
						<FieldLabel htmlFor="billing-name">Billing Name</FieldLabel>
						<div className="relative">
							<BuildingsIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								id="billing-name"
								placeholder="Enter billing name"
								className="pl-10"
								value={form.billing_name}
								onChange={(event) =>
									updateField("billing_name", event.target.value)
								}
							/>
						</div>
					</Field>

					<Field className="flex flex-col gap-2">
						<FieldLabel htmlFor="billing-email">Billing Email</FieldLabel>
						<div className="relative">
							<EnvelopeSimpleIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								id="billing-email"
								type="email"
								placeholder="Enter billing email"
								className="pl-10"
								value={form.billing_email}
								onChange={(event) =>
									updateField("billing_email", event.target.value)
								}
								disabled={Boolean(billingInfo)}
							/>
						</div>
					</Field>

					<Field className="flex flex-col gap-2">
						<FieldLabel htmlFor="billing-address">Billing Address</FieldLabel>
						<div className="relative">
							<HouseIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								id="billing-address"
								placeholder="Enter billing address"
								className="pl-10"
								value={form.billing_address}
								onChange={(event) =>
									updateField("billing_address", event.target.value)
								}
							/>
						</div>
					</Field>

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
				</FieldGroup>

				<Button type="submit" className="w-full" disabled={isSaving}>
					<FloppyDiskIcon
						className={cn("size-4", isSaving && "animate-pulse")}
						weight="fill"
					/>
					{isSaving ? "Saving Billing Info..." : "Save Billing Information"}
				</Button>
			</form>
		</div>
	);
}

function BillingInformationSectionSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<Separator />
			<div className="space-y-1.5">
				<Skeleton className="h-5 w-40" />
				<Skeleton className="h-4 w-72" />
			</div>
			<div className="grid gap-4">
				{["name", "email", "address", "city", "country"].map((field) => (
					<div key={field} className="flex flex-col gap-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
				))}
			</div>
			<Skeleton className="h-10 w-full" />
		</div>
	);
}
