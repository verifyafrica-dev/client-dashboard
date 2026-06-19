import type { UploadedDocument } from "#/api/http/v1/kyc/kyc.types";

export const KYC_ALLOWED_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"application/pdf",
] as const;

export const KYC_SIGNATURE_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
] as const;

export const KYC_MAX_FILE_SIZE = 10 * 1024 * 1024;

export function validateKycFile(
	file: File,
	allowedTypes: readonly string[] = KYC_ALLOWED_MIME_TYPES,
) {
	if (file.size > KYC_MAX_FILE_SIZE) {
		return {
			valid: false as const,
			error: "File size exceeds 10MB",
		};
	}

	if (!allowedTypes.includes(file.type)) {
		return {
			valid: false as const,
			error: "File type is not allowed",
		};
	}

	return { valid: true as const };
}

export function readFileAsDataUrl(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result ?? ""));
		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.readAsDataURL(file);
	});
}

export function createUploadedDocument({
	file,
	url,
	folder,
	author,
}: {
	file: File;
	url: string;
	folder: string;
	author?: string;
}): UploadedDocument {
	const storagePath = `${folder}/${Date.now()}-${file.name}`;

	return {
		id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
		fileName: file.name,
		fileSize: file.size,
		fileType: file.type,
		uploadedAt: new Date().toISOString(),
		url,
		storagePath,
		author,
	};
}

export function isDataUrlSignature(value: string) {
	return value.startsWith("data:image/");
}

export function inferSignatureMethod(signature: string): "type" | "upload" {
	return isDataUrlSignature(signature) ? "upload" : "type";
}

export function getDocumentPreviewType(fileType: string): "pdf" | "image" {
	if (fileType === "application/pdf") {
		return "pdf";
	}

	return "image";
}
