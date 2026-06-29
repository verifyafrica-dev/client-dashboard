import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
} from "react";
import { toast } from "sonner";

import {
	useSaveKycSectionMutation,
} from "#/api/http/v1/kyc/kyc.hooks";
import type { KYBApplication } from "#/api/http/v1/kyc/kyc.types";
import type {
	KycComplianceSection,
	KycSectionUpdatePayload,
} from "#/api/http/v2/tenants/tenants.types";
import type { KycStatus } from "#/api/http/v2/tenants/tenants.types";
import { getUserTenantMembership } from "../../team/-data";
import { useAuthStore } from "#/stores/auth-store";
import type { KycSectionPath } from "../-data";
import { KYC_SECTION_PATHS } from "../-data";
import {
	getKycCompletionStatus,
	getNextIncompleteSectionPath,
	isKycSectionCompleted,
	type KycCompletionStatus,
} from "../-utils";

type KycContextValue = {
	tenantId: string;
	kycData: KYBApplication;
	isKycApproved: boolean;
	kycStatus: KycStatus;
	kycLastSubmissionDate: string | null;
	isReadOnly: boolean;
	isSaving: boolean;
	completionStatus: KycCompletionStatus;
	allSectionsCompleted: boolean;
	saveSection: (
		section: KycComplianceSection,
		payload: KycSectionUpdatePayload,
		options?: { navigateNext?: boolean; currentSection?: KycSectionPath },
	) => Promise<void>;
	onNavigateToSection: (path: KycSectionPath | null) => void;
};

const KycContext = createContext<KycContextValue | null>(null);

export function KycProvider({
	children,
	tenantId,
	kycData,
	isKycApproved,
	kycStatus,
	kycLastSubmissionDate,
	onNavigateToSection,
}: {
	children: ReactNode;
	tenantId: string;
	kycData: KYBApplication;
	isKycApproved: boolean;
	kycStatus: KycStatus;
	kycLastSubmissionDate: string | null;
	onNavigateToSection: (path: KycSectionPath | null) => void;
}) {
	const saveMutation = useSaveKycSectionMutation(tenantId);
	const isReadOnly =
		isKycApproved ||
		kycStatus === "submitted" ||
		kycStatus === "verified";

	const completionStatus = useMemo(
		() => getKycCompletionStatus(kycData),
		[kycData],
	);

	const allSectionsCompleted = useMemo(
		() => Object.values(completionStatus).every(Boolean),
		[completionStatus],
	);

	const saveSection = useCallback(
		async (
			section: KycComplianceSection,
			payload: KycSectionUpdatePayload,
			options?: { navigateNext?: boolean; currentSection?: KycSectionPath },
		) => {
			if (isReadOnly) {
				return;
			}

			await saveMutation.mutateAsync(
				{ section, payload },
				{
					onSuccess: () => {
						toast.success("Compliance data saved successfully");

						if (options?.navigateNext !== false && options?.currentSection) {
							const nextPath = getNextIncompleteSectionPath(
								options.currentSection,
								completionStatus,
								KYC_SECTION_PATHS,
							);
							onNavigateToSection(nextPath);
						}
					},
					onError: () => {
						toast.error("Failed to save compliance data. Please try again.");
					},
				},
			);
		},
		[isReadOnly, saveMutation, completionStatus, onNavigateToSection],
	);

	const value = useMemo<KycContextValue>(
		() => ({
			tenantId,
			kycData,
			isKycApproved,
			kycStatus,
			kycLastSubmissionDate,
			isReadOnly,
			isSaving: saveMutation.isPending,
			completionStatus,
			allSectionsCompleted,
			saveSection,
			onNavigateToSection,
		}),
		[
			tenantId,
			kycData,
			isKycApproved,
			kycStatus,
			kycLastSubmissionDate,
			isReadOnly,
			saveMutation.isPending,
			completionStatus,
			allSectionsCompleted,
			saveSection,
			onNavigateToSection,
		],
	);

	return <KycContext.Provider value={value}>{children}</KycContext.Provider>;
}

export function useKyc() {
	const context = useContext(KycContext);

	if (!context) {
		throw new Error("useKyc must be used within KycProvider");
	}

	return context;
}

export function useKycSectionCompletion(path: KycSectionPath) {
	const { completionStatus } = useKyc();

	return isKycSectionCompleted(path, completionStatus);
}

export function useKycTenantId() {
	const user = useAuthStore((state) => state.user);

	return user ? getUserTenantMembership(user)?.id : undefined;
}
