import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TENANTS_V2_API } from "#/api/http/v2/tenants/tenants.api";
import { TENANTS_V2_QUERY_KEYS } from "#/api/http/v2/tenants/tenants.hooks";
import type {
	KycComplianceSection,
	KycSectionUpdatePayload,
	SectionRejectedReason,
} from "#/api/http/v2/tenants/tenants.types";
import type { KycStatus } from "#/api/http/v2/tenants/tenants.types";

import {
	normalizeComplianceData,
	type KYBApplication,
} from "./kyc.types";

const KYC_STALE_TIME = 60_000;

export const KYC_QUERY_KEYS = {
	all: ["kyc"] as const,
	tenant: (tenantId: string) => TENANTS_V2_QUERY_KEYS.detail(tenantId),
} as const;

export type KycTenantQueryData = {
	tenant: Awaited<ReturnType<typeof TENANTS_V2_API.DETAIL>>;
	kycData: KYBApplication;
	isKycApproved: boolean;
	kycStatus: KycStatus;
	kycSubmittedAt: string | null;
	kycLastSubmissionDate: string | null;
	rejectedAt: string | null;
	generalRejectedReason: string | null;
	sectionRejectedReason: SectionRejectedReason;
};

export const useKycTenantQuery = (
	tenantId: string | undefined,
	enabled = true,
) =>
	useQuery({
		queryKey: KYC_QUERY_KEYS.tenant(tenantId ?? ""),
		queryFn: () => TENANTS_V2_API.DETAIL(tenantId ?? ""),
		enabled: enabled && Boolean(tenantId),
		staleTime: KYC_STALE_TIME,
		select: (tenant): KycTenantQueryData => ({
			tenant,
			kycData: normalizeComplianceData(tenant.compliance_data),
			isKycApproved: tenant.kyc.kyc_verified,
			kycStatus: tenant.kyc.kyc_status,
			kycSubmittedAt: tenant.kyc.kyc_submitted_at,
			kycLastSubmissionDate: tenant.kyc.kyc_last_submission_date,
			rejectedAt: tenant.kyc.kyc_rejected_at,
			generalRejectedReason: tenant.general_rejected_reason,
			sectionRejectedReason: tenant.section_rejected_reason,
		}),
	});

export const useSaveKycSectionMutation = (tenantId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			section,
			payload,
		}: {
			section: KycComplianceSection;
			payload: KycSectionUpdatePayload;
		}) => TENANTS_V2_API.UPDATE_COMPLIANCE_SECTION(tenantId, section, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: TENANTS_V2_QUERY_KEYS.detail(tenantId),
			});
		},
	});
};

export const useSubmitKycForReviewMutation = (tenantId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => TENANTS_V2_API.SUBMIT_COMPLIANCE(tenantId),
		onSuccess: (tenant) => {
			queryClient.setQueryData(TENANTS_V2_QUERY_KEYS.detail(tenantId), tenant);
		},
	});
};
