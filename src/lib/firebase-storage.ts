import {
	deleteObject,
	getDownloadURL,
	ref,
	uploadBytesResumable,
	type UploadMetadata,
} from "firebase/storage";

import { getFirebaseStorage } from "#/lib/firebase";

export interface FirebaseUploadOptions {
	folder?: string;
	customFileName?: string;
	metadata?: UploadMetadata;
	onProgress?: (progress: number) => void;
}

export interface FirebaseUploadResult {
	url: string;
	path: string;
	name: string;
	size: number;
	contentType: string;
}

function generateStorageFileName(originalName: string) {
	const timestamp = Date.now();
	const extension = originalName.includes(".")
		? originalName.slice(originalName.lastIndexOf("."))
		: "";
	const nameWithoutExtension = extension
		? originalName.slice(0, originalName.lastIndexOf("."))
		: originalName;
	const sanitizedName = nameWithoutExtension.replace(/[^a-zA-Z0-9]/g, "_");

	return `${sanitizedName}_${timestamp}${extension}`;
}

function buildUploadMetadata(
	file: File,
	metadata?: UploadMetadata,
): UploadMetadata {
	return {
		...metadata,
		contentType: file.type,
		customMetadata: {
			originalName: file.name,
			uploadedAt: new Date().toISOString(),
			...metadata?.customMetadata,
		},
	};
}

export async function uploadFileToFirebase(
	file: File,
	options: FirebaseUploadOptions = {},
): Promise<FirebaseUploadResult> {
	const { folder = "uploads", customFileName, metadata, onProgress } = options;
	const fileName = customFileName ?? generateStorageFileName(file.name);
	const filePath = folder ? `${folder}/${fileName}` : fileName;
	const storage = getFirebaseStorage();
	const storageRef = ref(storage, filePath);
	const uploadMetadata = buildUploadMetadata(file, metadata);
	const uploadTask = uploadBytesResumable(storageRef, file, uploadMetadata);

	onProgress?.(0);

	return new Promise((resolve, reject) => {
		uploadTask.on(
			"state_changed",
			(snapshot) => {
				if (!onProgress || snapshot.totalBytes <= 0) {
					return;
				}

				onProgress(
					Math.min(
						100,
						(snapshot.bytesTransferred / snapshot.totalBytes) * 100,
					),
				);
			},
			(error) => {
				reject(
					new Error(
						error.code
							? `${error.code}: ${error.message}`
							: error.message || "Failed to upload file to Firebase Storage.",
					),
				);
			},
			async () => {
				try {
					const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
					const uploadedMetadata = uploadTask.snapshot.metadata;

					resolve({
						url: downloadUrl,
						path: filePath,
						name: fileName,
						size: uploadedMetadata.size ?? file.size,
						contentType: uploadedMetadata.contentType || file.type,
					});
				} catch (error) {
					reject(
						error instanceof Error
							? error
							: new Error("Failed to get Firebase download URL."),
					);
				}
			},
		);
	});
}

export async function deleteFileFromFirebase(filePath: string): Promise<void> {
	const storage = getFirebaseStorage();
	const fileRef = ref(storage, filePath);
	await deleteObject(fileRef);
}
