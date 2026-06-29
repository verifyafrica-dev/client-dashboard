import type { UploadedDocument } from "#/api/http/v1/kyc/kyc.types";
import { env } from "#/config/env";
import { isFirebaseConfigured } from "#/lib/firebase";
import {
	deleteFileFromFirebase,
	uploadFileToFirebase,
} from "#/lib/firebase-storage";

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

export function shouldUseFirebaseStorage() {
	if (!isFirebaseConfigured()) {
		return false;
	}

	if (env.isProduction) {
		return true;
	}

	const useFirebaseInDev = import.meta.env.VITE_USE_FIREBASE_STORAGE;
	return useFirebaseInDev === "true" || useFirebaseInDev === true;
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

export function createUploadedDocument({
	file,
	url,
	folder,
	author,
	storagePath,
}: {
	file: File;
	url: string;
	folder: string;
	author?: string;
	storagePath?: string;
}): UploadedDocument {
	const resolvedStoragePath =
		storagePath ?? `${folder}/${Date.now()}-${file.name}`;

	return {
		id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
		file_name: file.name,
		file_size: file.size,
		file_type: file.type,
		uploaded_at: new Date().toISOString(),
		url,
		storage_path: resolvedStoragePath,
		author,
	};
}

export async function uploadKycFileToStorage({
	file,
	folder,
	author,
	onProgress,
}: {
	file: File;
	folder: string;
	author?: string;
	onProgress?: (progress: number) => void;
}) {
	if (!shouldUseFirebaseStorage()) {
		const dataUrl = await readFileAsDataUrl(file, onProgress);

		return createUploadedDocument({
			file,
			url: dataUrl,
			folder,
			author,
		});
	}

	const uploadResult = await uploadFileToFirebase(file, {
		folder,
		metadata: {
			customMetadata: {
				...(author ? { author } : {}),
			},
		},
		onProgress,
	});

	return createUploadedDocument({
		file,
		url: uploadResult.url,
		folder,
		author,
		storagePath: uploadResult.path,
	});
}

export async function deleteKycFileFromStorage(storagePath: string) {
	if (!shouldUseFirebaseStorage()) {
		return;
	}

	await deleteFileFromFirebase(storagePath);
}

export function isDataUrlSignature(value: string) {
	return value.startsWith("data:image/");
}

export function isUploadedSignatureImage(value: string) {
	if (!value) {
		return false;
	}

	return isDataUrlSignature(value) || /^https?:\/\//i.test(value);
}

export function inferSignatureMethod(signature: string): "type" | "upload" {
	return isUploadedSignatureImage(signature) ? "upload" : "type";
}

export function getDocumentPreviewType(fileType: string): "pdf" | "image" {
	if (fileType === "application/pdf") {
		return "pdf";
	}

	return "image";
}
