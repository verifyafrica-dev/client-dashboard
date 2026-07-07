import type { VerificationRequestDetail } from "#/api/http/v2/verifications/verifications.types";

type UnknownRecord = Record<string, unknown>;

type AmlBackgroundChecksName = {
	full_name?: string;
	first_name?: string;
	last_name?: string;
};

type AmlBackgroundChecksInput = {
	name?: AmlBackgroundChecksName;
	filters?: string[];
	countries?: string[];
	match_score?: number;
	rca_search?: string;
	alias_search?: string;
};

type AmlVerificationData = {
	background_checks?: {
		name?: AmlBackgroundChecksName;
		aml_data?: {
			filters?: string[];
			hits?: UnknownRecord[];
		};
	};
};

type AmlGeoLocation = {
	ip?: string;
	city?: string;
	region?: string;
	country?: string;
	timezone?: string;
	isp?: string;
};

type AmlAgentInfo = {
	is_desktop?: boolean;
	is_phone?: boolean;
	device_name?: string;
	useragent?: string;
	browser_name?: string;
	platform_name?: string;
};

export type AmlScreeningResponsePayload = UnknownRecord & {
	reference?: string;
	event?: string;
	country?: string;
	email?: string;
	customer_unique_id?: string;
	verification_data?: AmlVerificationData;
	verification_result?: {
		background_checks?: boolean | string | number;
	};
	info?: {
		agent?: AmlAgentInfo;
		geolocation?: AmlGeoLocation;
	};
	background_checks?: AmlBackgroundChecksInput;
};

export type AmlScreeningVerificationRequestDetail = Omit<
	VerificationRequestDetail,
	"verification_type" | "input_data" | "response_data"
> & {
	verification_type: "aml_screening";
	input_data: UnknownRecord & {
		email?: string;
		country?: string;
		language?: string;
		reference?: string;
		background_checks?: AmlBackgroundChecksInput;
	};
	response_data: AmlScreeningResponsePayload
	
};

export function isAmlScreeningVerificationDetail(
	verification: VerificationRequestDetail,
): verification is AmlScreeningVerificationRequestDetail {
	return verification.verification_type === "aml_screening";
}

type DocumentVerificationInputName = {
	first_name?: string;
	last_name?: string;
	fuzzy_match?: string;
};

type DocumentVerificationInputDocument = {
	name?: DocumentVerificationInputName;
	proof?: string;
	allow_online?: string;
	allow_offline?: string;
	verification_mode?: string;
	fetch_enhanced_data?: string;
	backside_proof_required?: string;
};

type DocumentVerificationDataDocument = {
	name?: {
		first_name?: string;
		last_name?: string;
	};
	country?: string;
	selected_type?: string[];
	supported_types?: string[];
};

type DocumentVerificationResultDocument = {
	document?: number | null;
	document_country?: number | null;
	document_must_not_be_expired?: number | null;
	document_proof?: number | null;
	document_visibility?: number | null;
	name?: number | null;
	selected_type?: number | null;
};

type DocumentVerificationGeoLocation = UnknownRecord & {
	ip?: string;
	city?: string;
	region_name?: string;
	country_name?: string;
	country_code?: string;
	timezone?: string;
	isp?: string;
};

type DocumentVerificationAgentInfo = {
	is_desktop?: boolean;
	is_phone?: boolean;
	device_name?: string;
	useragent?: string;
	browser_name?: string;
	platform_name?: string;
};

type DocumentVerificationAdditionalProof = UnknownRecord & {
	dob?: string;
	gender?: string;
	full_name?: string;
	first_name?: string;
	last_name?: string;
	nationality?: string;
	place_of_birth?: string;
	document_number?: string;
	document_type?: string;
	document_country?: string;
	document_country_code?: string;
	document_official_name?: string;
};

export type DocumentVerificationResponsePayload = UnknownRecord & {
	reference?: string;
	event?: string;
	country?: string | null;
	email?: string;
	customer_unique_id?: string;
	verification_data?: {
		document?: DocumentVerificationDataDocument;
	};
	verification_result?: {
		document?: DocumentVerificationResultDocument;
	};
	info?: {
		agent?: DocumentVerificationAgentInfo;
		geolocation?: DocumentVerificationGeoLocation;
	};
	additional_data?: {
		document?: {
			proof?: DocumentVerificationAdditionalProof;
		};
	};
	status?: string;
};

export type DocumentVerificationRequestDetail = Omit<
	VerificationRequestDetail,
	"verification_type" | "input_data" | "response_data"
> & {
	verification_type: "id_document";
	input_data: UnknownRecord & {
		ttl?: number;
		email?: string;
		country?: string;
		language?: string;
		reference?: string;
		document?: DocumentVerificationInputDocument;
	};
	response_data: DocumentVerificationResponsePayload;	
};

export function isDocumentVerificationDetail(
	verification: VerificationRequestDetail,
): verification is DocumentVerificationRequestDetail {
	return verification.verification_type === "id_document";
}
