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
	response_data:
		| AmlScreeningResponsePayload
		| {
				data?: AmlScreeningResponsePayload;
		  };
};

export function isAmlScreeningVerificationDetail(
	verification: VerificationRequestDetail,
): verification is AmlScreeningVerificationRequestDetail {
	return verification.verification_type === "aml_screening";
}
