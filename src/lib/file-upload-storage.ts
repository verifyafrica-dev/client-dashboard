import type { VERIFICATION_TYPES_BY_PRODUCT } from "#/api/http/v2/verifications/verifications.types";
import { isR2Configured } from "#/lib/cloudflare-r2";
import {
	deleteFileFromR2,
	uploadFileToR2,
} from "#/lib/cloudflare-r2-storage";

export const UPLOAD_ALLOWED_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"application/pdf",
] as const;

export const IMAGE_UPLOAD_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
] as const;

export const UPLOAD_MAX_FILE_SIZE = 10 * 1024 * 1024;

export type VerificationStorageName =
	keyof typeof VERIFICATION_TYPES_BY_PRODUCT;

export interface UploadedFileResult {
	url: string;
	storagePath: string;
	fileName: string;
	fileSize: number;
	fileType: string;
}

export function validateUploadFile(
	file: File,
	allowedTypes: readonly string[] = UPLOAD_ALLOWED_MIME_TYPES,
) {
	if (file.size > UPLOAD_MAX_FILE_SIZE) {
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

export function buildVerificationStorageFolder(
	tenantSlug: string,
	verificationName: VerificationStorageName,
) {
	return `tenants/${tenantSlug}/verifications/${verificationName}`;
}

export function buildKycStorageFolder(tenantSlug: string) {
	return `tenants/${tenantSlug}/kyc`;
}

export function readFileAsDataUrl(
	file: File,
	onProgress?: (progress: number) => void,
) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();

		reader.onprogress = (event) => {
			if (!onProgress || !event.lengthComputable) {
				return;
			}

			onProgress(
				Math.min(100, (event.loaded / event.total) * 100),
			);
		};

		reader.onload = () => {
			resolve(String(reader.result ?? ""));
		};
		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.readAsDataURL(file);
	});
}

function buildUploadedFileResult({
	file,
	url,
	folder,
	storagePath,
}: {
	file: File;
	url: string;
	folder: string;
	storagePath?: string;
}): UploadedFileResult {
	return {
		url,
		storagePath: storagePath ?? `${folder}/${Date.now()}-${file.name}`,
		fileName: file.name,
		fileSize: file.size,
		fileType: file.type,
	};
}

export async function uploadFileToStorage({
	file,
	folder,
	onProgress,
}: {
	file: File;
	folder: string;
	onProgress?: (progress: number) => void;
}): Promise<UploadedFileResult> {
	if (!isR2Configured()) {
		console.warn("R2 is not configured, using base64 data URL for upload");

		const dataUrl = await readFileAsDataUrl(file, onProgress);

		return buildUploadedFileResult({
			file,
			url: dataUrl,
			folder,
		});
	}

	const uploadResult = await uploadFileToR2(file, {
		folder,
		onProgress,
	});

	return buildUploadedFileResult({
		file,
		url: uploadResult.url,
		folder,
		storagePath: uploadResult.path,
	});
}

export async function deleteUploadedFile(storagePath: string) {
	if (!isR2Configured()) {
		console.warn("R2 is not configured, skipping file deletion");
		return;
	}

	await deleteFileFromR2(storagePath);
}
