import { z } from "zod";

import { isISODate, isPhoneNumber, isURL } from "#/lib/validators";

export interface UploadedDocument {
	id: string;
	fileName: string;
	fileSize: number;
	fileType: string;
	uploadedAt: string;
	url: string;
	storagePath: string;
	author?: string;
}

export interface KYBDocuments {
	directorsIdentification: UploadedDocument[];
	proofOfBusinessAddress: UploadedDocument[];
	proofOfDirectorsAddress: UploadedDocument[];
	proofOfWebsiteDomainOwnership: UploadedDocument[];
	legalCompanyLicense: UploadedDocument[];
}

export interface DirectorAddress {
	address: string;
	postalCode: string;
	country: string;
}

export interface Director {
	name: string;
	dateOfBirth: string;
	nationality: string;
	address: DirectorAddress | string;
	idNumber: string;
}

export interface UBO {
	name: string;
	ownershipPercentage: number;
	idNumber: string;
}

export interface PrimaryContact {
	name: string;
	position: string;
	email: string;
	phone: string;
}

export interface RegulatoryLicense {
	license_name: string;
	license_number: string;
	country: string;
}

export interface RegisteredAddress {
	address: string;
	postalCode: string;
	country: string;
}

export interface BusinessAddress {
	address: string;
	postalCode: string;
	country: string;
}

export interface CompanyInformation {
	legalName: string;
	tradingName?: string;
	countryOfIncorporation: string;
	registrationNumber: string;
	dateOfIncorporation: string;
	registeredAddress: RegisteredAddress;
	businessAddress?: BusinessAddress;
	website?: string;
	taxIdVatNumber?: string;
	primaryContact: PrimaryContact;
	directors: Director[];
	ubos: UBO[];
	businessActivity: {
		natureOfBusiness: string;
		descriptionOfProductsServices: string;
		expectedMonthlyVerificationVolume: string;
		mainGeographiesOfClients: string[];
		regulatoryLicensesHeld: RegulatoryLicense[];
	};
}

export interface OnboardingQuestionnaire {
	purposeOfAccount: string;
	targetClients: string;
	averageClientTransactionSizeEur: number;
	highRiskJurisdictionsFATFExposure: string;
	mainBankingPaymentPartners: string;
	amlCtfOfficer?: {
		name: string;
		email: string;
	};
	kycKybProcess: string;
}

export interface ComplianceDeclarations {
	notEngagedInProhibitedActivities: boolean;
	noDirectorsUbosOnSanctionsLists: boolean;
	informationTrueAndComplete: boolean;
	agreeToProvideSupportingDocuments: boolean;
}

export interface AuthorizedSignatory {
	fullName: string;
	positionTitle: string;
	date: string;
	signature?: string;
}

export interface KYBApplication {
	company: CompanyInformation;
	documents: KYBDocuments;
	onboardingQuestionnaire: OnboardingQuestionnaire;
	complianceDeclarations: ComplianceDeclarations;
	authorizedSignatory: AuthorizedSignatory;
	submittedForReview: boolean;
	lastSubmissionDate: string;
}

export type KycStatus = "pending" | "submitted" | "approved" | "rejected";

const optionalUrlSchema = z
	.string()
	.optional()
	.refine((value) => !value || isURL(value), {
		message: "Please enter a valid URL",
	});

export const KycBasicInformationFormSchema = z.object({
	legalName: z.string().trim().min(1, "Legal name is required"),
	tradingName: z.string().optional(),
	countryOfIncorporation: z
		.string()
		.trim()
		.min(1, "Country of incorporation is required"),
	registrationNumber: z.string().trim().min(1, "Registration number is required"),
	dateOfIncorporation: z
		.string()
		.trim()
		.min(1, "Date of incorporation is required")
		.refine(isISODate, "Please enter a valid date (YYYY-MM-DD)"),
	registeredAddress: z.string().trim().min(1, "Registered address is required"),
	registeredPostalCode: z.string().trim().min(1, "Postal code is required"),
	registeredCountry: z.string().trim().min(1, "Country is required"),
	businessAddress: z.string().optional(),
	businessPostalCode: z.string().optional(),
	businessCountry: z.string().optional(),
	website: optionalUrlSchema,
	taxIdVatNumber: z.string().optional(),
});

export type KycBasicInformationFormValues = z.infer<
	typeof KycBasicInformationFormSchema
>;

export const KycPrimaryContactFormSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	position: z.string().trim().min(1, "Position is required"),
	email: z.email("Please enter a valid email address"),
	phone: z
		.string()
		.trim()
		.min(1, "Phone number is required")
		.refine(isPhoneNumber, "Please enter a valid phone number"),
});

export type KycPrimaryContactFormValues = z.infer<
	typeof KycPrimaryContactFormSchema
>;

export const KycDirectorAddressSchema = z.object({
	address: z.string().trim().min(1, "Address is required"),
	postalCode: z.string().trim().min(1, "Postal code is required"),
	country: z.string().trim().min(1, "Country is required"),
});

export const KycDirectorFormSchema = z.object({
	name: z.string().trim().min(1, "Full name is required"),
	dateOfBirth: z
		.string()
		.trim()
		.min(1, "Date of birth is required")
		.refine(isISODate, "Please enter a valid date (YYYY-MM-DD)"),
	nationality: z.string().trim().min(1, "Nationality is required"),
	address: KycDirectorAddressSchema,
	idNumber: z.string().trim().min(1, "ID number is required"),
});

export const KycUboFormSchema = z.object({
	name: z.string().trim().min(1, "Full name is required"),
	ownershipPercentage: z.coerce
		.number()
		.gt(0, "Ownership percentage must be greater than 0")
		.max(100, "Ownership percentage cannot exceed 100%"),
	idNumber: z.string().trim().min(1, "ID number is required"),
});

export const KycDirectorsAndShareholdersFormSchema = z.object({
	directors: z
		.array(KycDirectorFormSchema)
		.min(1, "At least one director is required"),
	ubos: z.array(KycUboFormSchema).min(1, "At least one UBO is required"),
});

export type KycDirectorsAndShareholdersFormValues = z.infer<
	typeof KycDirectorsAndShareholdersFormSchema
>;

export const KycRegulatoryLicenseFormSchema = z.object({
	license_name: z.string().trim().min(1, "License name is required"),
	license_number: z.string().trim().min(1, "License number is required"),
	country: z.string().trim().min(1, "Country is required"),
});

export const KycBusinessActivityFormSchema = z.object({
	natureOfBusiness: z.string().trim().min(1, "Nature of business is required"),
	descriptionOfProductsServices: z
		.string()
		.trim()
		.min(1, "Description of products/services is required"),
	expectedMonthlyVerificationVolume: z
		.string()
		.trim()
		.min(1, "Expected monthly verification volume is required"),
	mainGeographiesOfClients: z
		.array(z.string().trim().min(1))
		.min(1, "Main geographies of clients is required"),
	regulatoryLicensesHeld: z.array(KycRegulatoryLicenseFormSchema),
});

export type KycBusinessActivityFormValues = z.infer<
	typeof KycBusinessActivityFormSchema
>;

export const KycOnboardingQuestionnaireFormSchema = z.object({
	purposeOfAccount: z.string().trim().min(1, "Purpose of account is required"),
	targetClients: z.string().trim().min(1, "Target clients is required"),
	averageClientTransactionSizeEur: z.coerce
		.number()
		.nonnegative("Average transaction size must be a positive number"),
	highRiskJurisdictionsFATFExposure: z
		.string()
		.trim()
		.min(1, "High risk jurisdictions exposure is required"),
	mainBankingPaymentPartners: z
		.string()
		.trim()
		.min(1, "Main banking/payment partners is required"),
	amlCtfOfficerName: z.string().trim().min(1, "AML/CTF Officer name is required"),
	amlCtfOfficerEmail: z.email("Please enter a valid email address"),
	kycKybProcess: z.string().trim().min(1, "KYC/KYB process is required"),
});

export type KycOnboardingQuestionnaireFormValues = z.infer<
	typeof KycOnboardingQuestionnaireFormSchema
>;

export const KycComplianceDeclarationsFormSchema = z.object({
	notEngagedInProhibitedActivities: z.boolean().refine(Boolean, {
		message: "This declaration is required",
	}),
	noDirectorsUbosOnSanctionsLists: z.boolean().refine(Boolean, {
		message: "This declaration is required",
	}),
	informationTrueAndComplete: z.boolean().refine(Boolean, {
		message: "This declaration is required",
	}),
	agreeToProvideSupportingDocuments: z.boolean().refine(Boolean, {
		message: "This declaration is required",
	}),
});

export type KycComplianceDeclarationsFormValues = z.infer<
	typeof KycComplianceDeclarationsFormSchema
>;

export const KycAuthorizedSignatureFormSchema = z.object({
	fullName: z.string().trim().min(1, "Full name is required"),
	positionTitle: z.string().trim().min(1, "Position title is required"),
	date: z
		.string()
		.trim()
		.min(1, "Date is required")
		.refine(isISODate, "Please enter a valid date (YYYY-MM-DD)"),
	signature: z.string().trim().min(1, "Signature is required"),
});

export type KycAuthorizedSignatureFormValues = z.infer<
	typeof KycAuthorizedSignatureFormSchema
>;

export type KycComplianceSavePayload = {
	compliance_data: KYBApplication;
};

export function createEmptyKYBApplication(): KYBApplication {
	return {
		company: {
			legalName: "",
			countryOfIncorporation: "",
			registrationNumber: "",
			dateOfIncorporation: "",
			registeredAddress: {
				address: "",
				postalCode: "",
				country: "",
			},
			businessAddress: {
				address: "",
				postalCode: "",
				country: "",
			},
			primaryContact: {
				name: "",
				position: "",
				email: "",
				phone: "",
			},
			directors: [],
			ubos: [],
			businessActivity: {
				natureOfBusiness: "",
				descriptionOfProductsServices: "",
				expectedMonthlyVerificationVolume: "",
				mainGeographiesOfClients: [],
				regulatoryLicensesHeld: [],
			},
		},
		documents: {
			directorsIdentification: [],
			proofOfBusinessAddress: [],
			proofOfDirectorsAddress: [],
			proofOfWebsiteDomainOwnership: [],
			legalCompanyLicense: [],
		},
		onboardingQuestionnaire: {
			purposeOfAccount: "",
			targetClients: "",
			averageClientTransactionSizeEur: 0,
			highRiskJurisdictionsFATFExposure: "",
			mainBankingPaymentPartners: "",
			kycKybProcess: "",
		},
		complianceDeclarations: {
			notEngagedInProhibitedActivities: false,
			noDirectorsUbosOnSanctionsLists: false,
			informationTrueAndComplete: false,
			agreeToProvideSupportingDocuments: false,
		},
		authorizedSignatory: {
			fullName: "",
			positionTitle: "",
			date: "",
		},
		submittedForReview: false,
		lastSubmissionDate: "",
	};
}

export function normalizeComplianceData(
	data: unknown,
): KYBApplication {
	if (
		!data ||
		data === "" ||
		(typeof data === "object" && Object.keys(data as object).length === 0)
	) {
		return createEmptyKYBApplication();
	}

	return data as KYBApplication;
}

export function normalizeWebsiteUrl(website: string | undefined) {
	if (!website?.trim()) {
		return undefined;
	}

	const value = website.trim();
	return value.match(/^https?:\/\//i) ? value : `https://${value}`;
}
