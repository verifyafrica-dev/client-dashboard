export const SECTION_NAMES = {
	BASIC_INFORMATION: "basic-information",
	PRIMARY_CONTACT: "primary-contact",
	DIRECTORS_AND_SHAREHOLDERS: "directors-and-shareholders",
	BUSINESS_ACTIVITY: "business-activity",
	ONBOARDING_QUESTIONNAIRE: "onboarding-questionnaire",
	DOCUMENTS_UPLOAD: "documents-upload",
	COMPLIANCE_DOCUMENTS: "compliance-documents",
	AUTHORIZED_SIGNATURE: "authorized-signature",
} as const;

export const KYC_SECTION_PATHS = [
	SECTION_NAMES.BASIC_INFORMATION,
	SECTION_NAMES.PRIMARY_CONTACT,
	SECTION_NAMES.DIRECTORS_AND_SHAREHOLDERS,
	SECTION_NAMES.BUSINESS_ACTIVITY,
	SECTION_NAMES.ONBOARDING_QUESTIONNAIRE,
	SECTION_NAMES.DOCUMENTS_UPLOAD,
	SECTION_NAMES.COMPLIANCE_DOCUMENTS,
	SECTION_NAMES.AUTHORIZED_SIGNATURE,
] as const;

export type KycSectionPath = (typeof KYC_SECTION_PATHS)[number];

export type KycSectionStatus = "pending" | "completed";

export type KycSection = {
	title: string;
	description: string;
	status: KycSectionStatus;
	path: KycSectionPath;
};

export const sections: KycSection[] = [
	{
		title: "Basic Information",
		description: "Provide your basic information to get started.",
		status: "pending",
		path: SECTION_NAMES.BASIC_INFORMATION,
	},
	{
		title: "Primary Contact",
		description: "Provide your primary contact details.",
		status: "pending",
		path: SECTION_NAMES.PRIMARY_CONTACT,
	},
	{
		title: "Directors and Shareholders",
		description: "Provide your directors and shareholders details.",
		status: "pending",
		path: SECTION_NAMES.DIRECTORS_AND_SHAREHOLDERS,
	},
	{
		title: "Business Activity",
		description: "Provide your business activity details.",
		status: "pending",
		path: SECTION_NAMES.BUSINESS_ACTIVITY,
	},
	{
		title: "Onboarding Questionnaire",
		description: "Answer the onboarding questionnaire to get started.",
		status: "pending",
		path: SECTION_NAMES.ONBOARDING_QUESTIONNAIRE,
	},
	{
		title: "Documents Upload",
		description: "Upload required business and identification documents.",
		status: "pending",
		path: SECTION_NAMES.DOCUMENTS_UPLOAD,
	},
	{
		title: "Compliance Declarations",
		description:
			"Please confirm the following declarations by checking the boxes below:",
		status: "pending",
		path: SECTION_NAMES.COMPLIANCE_DOCUMENTS,
	},
	{
		title: "Authorized Signature",
		description: "Provide your authorized signature.",
		status: "pending",
		path: SECTION_NAMES.AUTHORIZED_SIGNATURE,
	},
];

export function getKycOverallStatus(sectionList: KycSection[]) {
	const completedCount = sectionList.filter(
		(section) => section.status === "completed",
	).length;

	if (completedCount === 0) {
		return { label: "Not Started", variant: "not-started" as const };
	}

	if (completedCount === sectionList.length) {
		return { label: "Completed", variant: "completed" as const };
	}

	return {
		label: "In Progress",
		variant: "in-progress" as const,
	};
}

export function getSectionByPath(path: string | undefined) {
	if (!path) {
		return undefined;
	}

	return sections.find((section) => section.path === path);
}
