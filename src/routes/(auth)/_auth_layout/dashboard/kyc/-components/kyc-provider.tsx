import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
} from "react";
import { toast } from "sonner";

import { useSaveKycComplianceMutation } from "#/api/http/v1/kyc/kyc.hooks";
import type { KYBApplication } from "#/api/http/v1/kyc/kyc.types";
import { getUserTenantMembership } from "../../team/-data";
import { useAuthStore } from "#/stores/auth-store";
import type { KycSectionPath } from "../-data";
import { KYC_SECTION_PATHS } from "../-data";
import {
	getKycCompletionStatus,
	getNextIncompleteSectionPath,
	isKycSectionCompleted,
} from "../-utils";

type KycContextValue = {
	tenantId: string;
	kycData: KYBApplication;
	isKycApproved: boolean;
	isKycSubmitted: boolean;
	isReadOnly: boolean;
	isSaving: boolean;
	completionStatus: ReturnType<typeof getKycCompletionStatus>;
	allSectionsCompleted: boolean;
	saveCompliance: (
		buildPayload: (current: KYBApplication) => KYBApplication,
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
	onNavigateToSection,
}: {
	children: ReactNode;
	tenantId: string;
	kycData: KYBApplication;
	isKycApproved: boolean;
	onNavigateToSection: (path: KycSectionPath | null) => void;
}) {
	const saveMutation = useSaveKycComplianceMutation(tenantId);
	const isKycSubmitted = Boolean(kycData.submittedForReview);
	const isReadOnly = isKycApproved || isKycSubmitted;

	const completionStatus = useMemo(
		() => getKycCompletionStatus(kycData),
		[kycData],
	);

	const allSectionsCompleted = useMemo(
		() => Object.values(completionStatus).every(Boolean),
		[completionStatus],
	);

	const saveCompliance = useCallback(
		async (
			buildPayload: (current: KYBApplication) => KYBApplication,
			options?: { navigateNext?: boolean; currentSection?: KycSectionPath },
		) => {
			if (isReadOnly) {
				return;
			}

			const payload = buildPayload(kycData);

			await saveMutation.mutateAsync(payload, {
				onSuccess: () => {
					toast.success("Compliance data saved successfully");

					if (options?.navigateNext !== false && options?.currentSection) {
						const updatedStatus = getKycCompletionStatus(payload);
						const nextPath = getNextIncompleteSectionPath(
							options.currentSection,
							updatedStatus,
							KYC_SECTION_PATHS,
						);
						onNavigateToSection(nextPath);
					}
				},
				onError: () => {
					toast.error("Failed to save compliance data. Please try again.");
				},
			});
		},
		[kycData, isReadOnly, saveMutation, onNavigateToSection],
	);

	const value = useMemo<KycContextValue>(
		() => ({
			tenantId,
			kycData,
			isKycApproved,
			isKycSubmitted,
			isReadOnly,
			isSaving: saveMutation.isPending,
			completionStatus,
			allSectionsCompleted,
			saveCompliance,
			onNavigateToSection,
		}),
		[
			tenantId,
			kycData,
			isKycApproved,
			isKycSubmitted,
			isReadOnly,
			saveMutation.isPending,
			completionStatus,
			allSectionsCompleted,
			saveCompliance,
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
