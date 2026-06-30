import { FloppyDiskIcon } from "@phosphor-icons/react";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import {
	useCreateBillingInformationV2Mutation,
	useTenantBillingInformationV2Query,
	useUpdateTenantBillingInformationV2Mutation,
} from "#/api/http/v2/billing/billing.hooks";
import { Button } from "#/components/ui/button";
import { Separator } from "#/components/ui/separator";
import { Skeleton } from "#/components/ui/skeleton";
import { cn } from "#/lib/utils.ts";
import { BillingInformationFormFields } from "../../billing/-components/billing-information-form-fields";
import {
	type BillingFormState,
	EMPTY_BILLING_FORM,
	getBillingFormState,
	getBillingInformationCreatePayload,
	getBillingInformationUpdatePayload,
	isBillingNotFoundError,
} from "../../billing/-data";
import { useCurrentTenant } from "../../team/-data";

export function BillingInformationSection() {
	const { tenantId } = useCurrentTenant();
	const billingInformationQuery = useTenantBillingInformationV2Query(
		tenantId,
		Boolean(tenantId),
	);
	const billingInfo = billingInformationQuery.data;
	const isBillingNotFound = isBillingNotFoundError(
		billingInformationQuery.error,
	);

	const [form, setForm] = useState<BillingFormState>(EMPTY_BILLING_FORM);
	const createMutation = useCreateBillingInformationV2Mutation();
	const updateMutation = useUpdateTenantBillingInformationV2Mutation(
		tenantId ?? "",
	);

	const isLoading =
		billingInformationQuery.isPending || billingInformationQuery.isFetching;
	const isSaving = createMutation.isPending || updateMutation.isPending;

	useEffect(() => {
		setForm(getBillingFormState(billingInfo));
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
			updateMutation.mutate(getBillingInformationUpdatePayload(form), {
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

		createMutation.mutate(getBillingInformationCreatePayload(form, tenantId), {
			onSuccess: () => {
				toast.success("Billing information saved");
			},
			onError: () => {
				toast.error("Failed to save billing information");
			},
		});
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
				<BillingInformationFormFields
					form={form}
					onFieldChange={updateField}
					isEmailDisabled={Boolean(billingInfo)}
				/>

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
