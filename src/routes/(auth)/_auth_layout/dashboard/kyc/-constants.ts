export const KYC_CONTACT_POSITIONS = [
	"Chief Executive Officer (CEO)",
	"Chief Financial Officer (CFO)",
	"Chief Operating Officer (COO)",
	"Managing Director",
	"Director",
	"Company Secretary",
	"Other",
] as const;

export const KYC_TARGET_CLIENTS = [
	"Individuals",
	"SMEs (Small and Medium Enterprises)",
	"Corporates",
	"High-risk Sectors",
] as const;

export const KYC_VERIFICATION_VOLUMES = [
	"0 - 1,000",
	"1,001 - 10,000",
	"10,001 - 50,000",
	"50,001 - 100,000",
	"100,000+",
] as const;

export const KYC_CLIENT_GEOGRAPHIES = [
	"Nigeria",
	"West Africa",
	"Sub-Saharan Africa",
	"Africa",
	"Global",
] as const;

export const KYC_SIGNATURE_METHODS = ["Type Signature", "Upload Signature"] as const;

export const KYC_DECLARATIONS = [
	{
		key: "notEngagedInProhibitedActivities" as const,
		label:
			"We are not engaged in any prohibited activities as defined by applicable laws and regulations",
	},
	{
		key: "noDirectorsUbosOnSanctionsLists" as const,
		label:
			"None of our directors, officers, or UBOs are listed on any sanctions lists",
	},
	{
		key: "informationTrueAndComplete" as const,
		label:
			"All information provided is true, complete, and accurate to the best of our knowledge",
	},
	{
		key: "agreeToProvideSupportingDocuments" as const,
		label:
			"We agree to provide all supporting documents as requested during the onboarding process",
	},
] as const;

export const KYC_DOCUMENT_CATEGORIES = [
	{
		key: "directorsIdentification" as const,
		title: "Directors Identification",
		description: "Passports and nationally approved IDs for all directors",
	},
	{
		key: "proofOfBusinessAddress" as const,
		title: "Proof of Business Address",
		description:
			"Utility bill, lease agreement, or official government document",
	},
	{
		key: "proofOfDirectorsAddress" as const,
		title: "Proof of Directors Address",
		description: "Utility bills or official documents for each director",
	},
	{
		key: "proofOfWebsiteDomainOwnership" as const,
		title: "Proof of Website/Domain Ownership",
		description: "Screenshot from domain registrar showing ownership",
	},
	{
		key: "legalCompanyLicense" as const,
		title: "Legal Company License",
		description: "Business registration certificate or operating license",
	},
] as const;
