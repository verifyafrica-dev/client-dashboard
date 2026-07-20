import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

import {
	getR2BucketName,
	getR2Client,
	getR2ObjectUrl,
} from "#/lib/cloudflare-r2";

export interface R2UploadOptions {
	folder?: string;
	customFileName?: string;
	metadata?: Record<string, string>;
	onProgress?: (progress: number) => void;
}

export interface R2UploadResult {
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
	metadata?: Record<string, string>,
): Record<string, string> {
	return {
		originalname: file.name,
		uploadedat: new Date().toISOString(),
		...metadata,
	};
}

export async function uploadFileToR2(
	file: File,
	options: R2UploadOptions = {},
): Promise<R2UploadResult> {
	const { folder = "uploads", customFileName, metadata, onProgress } = options;
	const fileName = customFileName ?? generateStorageFileName(file.name);
	const filePath = folder ? `${folder}/${fileName}` : fileName;
	const client = getR2Client();
	const bucket = getR2BucketName();
	const uploadMetadata = buildUploadMetadata(file, metadata);

	onProgress?.(0);

	const upload = new Upload({
		client,
		params: {
			Bucket: bucket,
			Key: filePath,
			Body: file,
			ContentType: file.type,
			Metadata: uploadMetadata,
		},
	});

	upload.on("httpUploadProgress", (progress) => {
		if (!onProgress || !progress.total || progress.total <= 0) {
			return;
		}

		onProgress(
			Math.min(100, ((progress.loaded ?? 0) / progress.total) * 100),
		);
	});

	try {
		await upload.done();
		onProgress?.(100);

		const url = await getR2ObjectUrl(filePath);

		return {
			url,
			path: filePath,
			name: fileName,
			size: file.size,
			contentType: file.type,
		};
	} catch (error) {
		throw error instanceof Error
			? error
			: new Error("Failed to upload file to Cloudflare R2.");
	}
}

export async function deleteFileFromR2(filePath: string): Promise<void> {
	const client = getR2Client();
	const bucket = getR2BucketName();

	await client.send(
		new DeleteObjectCommand({
			Bucket: bucket,
			Key: filePath,
		}),
	);
}
