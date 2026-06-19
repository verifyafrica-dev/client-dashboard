import type { KYBApplication } from "#/api/http/v1/kyc/kyc.types";
import type { KycSectionPath } from "./-data";
import { SECTION_NAMES } from "./-data";

export type KycCompletionStatus = {
	basicInformation: boolean;
	primaryContact: boolean;
	directorsAndShareholders: boolean;
	businessActivity: boolean;
	onboardingQuestionnaire: boolean;
	documentsUpload: boolean;
	complianceDocuments: boolean;
	authorizedSignature: boolean;
};

function hasStructuredDirectorAddress(
	address: KYBApplication["company"]["directors"][number]["address"],
) {
	if (typeof address === "string") {
		return false;
	}

	return Boolean(
		address?.address && address?.postalCode && address?.country,
	);
}

export function getKycCompletionStatus(kycData: KYBApplication): KycCompletionStatus {
	const primaryContact = kycData.company?.primaryContact ?? {
		name: "",
		email: "",
		phone: "",
		position: "",
	};
	const directors = kycData.company?.directors ?? [];
	const ubos = kycData.company?.ubos ?? [];
	const businessActivity = kycData.company?.businessActivity ?? {
		natureOfBusiness: "",
		descriptionOfProductsServices: "",
		expectedMonthlyVerificationVolume: "",
		mainGeographiesOfClients: [],
		regulatoryLicensesHeld: [],
	};
	const documents = kycData.documents ?? {
		directorsIdentification: [],
		proofOfBusinessAddress: [],
		proofOfDirectorsAddress: [],
		proofOfWebsiteDomainOwnership: [],
		legalCompanyLicense: [],
	};
	const complianceDeclarations = kycData.complianceDeclarations ?? {
		notEngagedInProhibitedActivities: false,
		noDirectorsUbosOnSanctionsLists: false,
		informationTrueAndComplete: false,
		agreeToProvideSupportingDocuments: false,
	};
	const onboardingQuestionnaire = kycData.onboardingQuestionnaire ?? {
		purposeOfAccount: "",
		targetClients: "",
		averageClientTransactionSizeEur: 0,
		highRiskJurisdictionsFATFExposure: "",
		mainBankingPaymentPartners: "",
		kycKybProcess: "",
	};
	const authorizedSignature = kycData.authorizedSignatory ?? {
		fullName: "",
		positionTitle: "",
		date: "",
	};

	const allDirectorsHaveCompleteAddress =
		directors.length > 0 &&
		directors.every((director) => hasStructuredDirectorAddress(director.address));

	return {
		basicInformation: Boolean(
			kycData.company?.legalName &&
				kycData.company?.dateOfIncorporation &&
				kycData.company?.registrationNumber &&
				kycData.company?.registeredAddress?.address,
		),
		primaryContact: Boolean(
			primaryContact.name && primaryContact.email && primaryContact.phone,
		),
		directorsAndShareholders: Boolean(
			directors.length > 0 && ubos.length > 0 && allDirectorsHaveCompleteAddress,
		),
		businessActivity: Boolean(
			businessActivity.natureOfBusiness &&
				businessActivity.descriptionOfProductsServices &&
				businessActivity.mainGeographiesOfClients?.length > 0,
		),
		onboardingQuestionnaire: Boolean(
			onboardingQuestionnaire.purposeOfAccount &&
				onboardingQuestionnaire.amlCtfOfficer?.name &&
				onboardingQuestionnaire.amlCtfOfficer?.email,
		),
		documentsUpload: Boolean(
			documents.directorsIdentification?.length > 0 &&
				documents.proofOfBusinessAddress?.length > 0 &&
				documents.proofOfDirectorsAddress?.length > 0 &&
				documents.proofOfWebsiteDomainOwnership?.length > 0 &&
				documents.legalCompanyLicense?.length > 0,
		),
		complianceDocuments: Boolean(
			complianceDeclarations.notEngagedInProhibitedActivities &&
				complianceDeclarations.noDirectorsUbosOnSanctionsLists &&
				complianceDeclarations.informationTrueAndComplete &&
				complianceDeclarations.agreeToProvideSupportingDocuments,
		),
		authorizedSignature: Boolean(
			authorizedSignature.fullName &&
				authorizedSignature.positionTitle &&
				authorizedSignature.signature,
		),
	};
}

export function isKycSectionCompleted(
	path: KycSectionPath,
	completionStatus: KycCompletionStatus,
) {
	switch (path) {
		case SECTION_NAMES.BASIC_INFORMATION:
			return completionStatus.basicInformation;
		case SECTION_NAMES.PRIMARY_CONTACT:
			return completionStatus.primaryContact;
		case SECTION_NAMES.DIRECTORS_AND_SHAREHOLDERS:
			return completionStatus.directorsAndShareholders;
		case SECTION_NAMES.BUSINESS_ACTIVITY:
			return completionStatus.businessActivity;
		case SECTION_NAMES.ONBOARDING_QUESTIONNAIRE:
			return completionStatus.onboardingQuestionnaire;
		case SECTION_NAMES.DOCUMENTS_UPLOAD:
			return completionStatus.documentsUpload;
		case SECTION_NAMES.COMPLIANCE_DOCUMENTS:
			return completionStatus.complianceDocuments;
		case SECTION_NAMES.AUTHORIZED_SIGNATURE:
			return completionStatus.authorizedSignature;
		default:
			return false;
	}
}

export function getNextIncompleteSectionPath(
	currentPath: KycSectionPath,
	completionStatus: KycCompletionStatus,
	sectionPaths: readonly KycSectionPath[],
) {
	const currentIndex = sectionPaths.indexOf(currentPath);

	if (currentIndex === -1 || currentIndex >= sectionPaths.length - 1) {
		return null;
	}

	const remainingPaths = sectionPaths.slice(currentIndex + 1);
	return (
		remainingPaths.find((path) => !isKycSectionCompleted(path, completionStatus)) ??
		null
	);
}

export function getKycDisplayStatus({
	isKycApproved,
	isKycSubmitted,
	complianceStatus,
}: {
	isKycApproved: boolean;
	isKycSubmitted: boolean;
	complianceStatus?: string;
}) {
	if (isKycApproved) {
		return "approved" as const;
	}

	if (complianceStatus === "rejected") {
		return "rejected" as const;
	}

	if (isKycSubmitted) {
		return "submitted" as const;
	}

	return "pending" as const;
}

export function parseRejectedReasons(reason?: string | null) {
	if (!reason?.trim()) {
		return [];
	}

	return reason
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => line.replace(/^\d+\.\s*/, ""));
}

export function formatRejectedAt(rejectedAt?: string | null) {
	if (!rejectedAt) {
		return null;
	}

	return new Date(rejectedAt).toLocaleString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}
