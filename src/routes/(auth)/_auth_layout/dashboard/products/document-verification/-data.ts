import type { VerificationRequestCreatePayload } from "#/api/http/v2/verifications/verifications.types";
import type { VerificationType } from "#/api/http/v2/verifications/verifications.types";
import { SHUFTI_CHOICES } from "#/lib/constants";

const DOCUMENT_VERIFICATION_TYPE = "id_document" satisfies VerificationType;

type LinkFormValues = {
	email: string;
	urlLimit: string;
};

type DirectFormValues = {
	email: string;
	country: string;
	firstName: string;
	lastName: string;
};

function buildDocumentBlock(direct?: {
	firstName: string;
	lastName: string;
	proof: string;
}) {
	const document: Record<string, unknown> = {
		backside_proof_required: SHUFTI_CHOICES.NO,
		allow_online: SHUFTI_CHOICES.YES,
		allow_offline: SHUFTI_CHOICES.YES,
		verification_mode: SHUFTI_CHOICES.ANY,
		fetch_enhanced_data: SHUFTI_CHOICES.YES,
	};

	if (direct) {
		document.name = {
			first_name: direct.firstName,
			last_name: direct.lastName,
			fuzzy_match: SHUFTI_CHOICES.YES,
		};
		document.proof = direct.proof;
	}

	return document;
}

export function buildDocumentVerificationLinkPayload(
	values: LinkFormValues,
	isTest = false,
): VerificationRequestCreatePayload {
	return {
		verification_type: DOCUMENT_VERIFICATION_TYPE,
		method_type: "onsite",
		is_test: isTest,
		input_data: {
			language: "EN",
			email: values.email.trim(),
			ttl: Number(values.urlLimit),
			document: buildDocumentBlock(),
		},
	};
}

export function buildDocumentVerificationDirectPayload(
	values: DirectFormValues,
	proof: string,
	isTest = false,
): VerificationRequestCreatePayload {
	return {
		verification_type: DOCUMENT_VERIFICATION_TYPE,
		method_type: "offsite",
		is_test: isTest,
		input_data: {
			country: values.country.trim().toUpperCase(),
			language: "EN",
			email: values.email.trim(),
			document: buildDocumentBlock({
				firstName: values.firstName.trim(),
				lastName: values.lastName.trim(),
				proof,
			}),
		},
	};
}
