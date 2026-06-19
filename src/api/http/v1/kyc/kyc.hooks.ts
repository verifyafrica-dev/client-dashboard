import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { KYC_API } from "./kyc.api";
import {
	normalizeComplianceData,
	type KYBApplication,
} from "./kyc.types";

const KYC_STALE_TIME = 60_000;

export const KYC_QUERY_KEYS = {
	all: ["kyc"] as const,
	tenant: (tenantId: string) => ["kyc", "tenant", tenantId] as const,
} as const;

export const useKycTenantQuery = (tenantId: string | undefined, enabled = true) =>
	useQuery({
		queryKey: KYC_QUERY_KEYS.tenant(tenantId ?? ""),
		queryFn: () => KYC_API.TENANT_DETAIL(tenantId ?? ""),
		enabled: enabled && Boolean(tenantId),
		staleTime: KYC_STALE_TIME,
		select: (tenant) => ({
			tenant,
			kycData: normalizeComplianceData(tenant.compliance_data),
			isKycApproved: Boolean(tenant.kyc_verified),
			complianceStatus: tenant.compliance_status?.status,
			rejectedAt: tenant.compliance_status?.rejected_at ?? null,
			rejectedReason:
				tenant.compliance_status?.rejected_reason ??
				tenant.reject_reason ??
				null,
		}),
	});

export const useSaveKycComplianceMutation = (tenantId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (complianceData: KYBApplication) =>
			KYC_API.SAVE_COMPLIANCE(tenantId, complianceData),
		onSuccess: (tenant) => {
			queryClient.setQueryData(KYC_QUERY_KEYS.tenant(tenantId), tenant);
		},
	});
};

export const useSubmitKycForReviewMutation = (tenantId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (complianceData: KYBApplication) =>
			KYC_API.SUBMIT_FOR_REVIEW(tenantId, complianceData),
		onSuccess: (tenant) => {
			queryClient.setQueryData(KYC_QUERY_KEYS.tenant(tenantId), tenant);
		},
	});
};
