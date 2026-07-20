import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "#/config/env";

let r2Client: S3Client | null = null;

const PRESIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function isR2Configured() {
	const { accountId, accessKeyId, secretAccessKey, bucketName } = env.r2;

	return Boolean(accountId && accessKeyId && secretAccessKey && bucketName);
}

export function getR2Endpoint() {
	return `https://${env.r2.accountId}.r2.cloudflarestorage.com`;
}

export function getR2BucketName() {
	if (!isR2Configured()) {
		throw new Error(
			"Cloudflare R2 is not configured. Set VITE_R2_* environment variables.",
		);
	}

	return env.r2.bucketName;
}

export function getR2Client() {
	if (!isR2Configured()) {
		throw new Error(
			"Cloudflare R2 is not configured. Set VITE_R2_* environment variables.",
		);
	}

	if (!r2Client) {
		r2Client = new S3Client({
			region: "auto",
			endpoint: getR2Endpoint(),
			credentials: {
				accessKeyId: env.r2.accessKeyId,
				secretAccessKey: env.r2.secretAccessKey,
			},
		});
	}

	return r2Client;
}

function encodeObjectPath(filePath: string) {
	return filePath
		.split("/")
		.map((segment) => encodeURIComponent(segment))
		.join("/");
}

/**
 * Returns a fetchable object URL.
 * Prefer VITE_R2_PUBLIC_URL (r2.dev or custom domain). Falls back to a
 * signed GET URL when public access is not configured.
 */
export async function getR2ObjectUrl(filePath: string) {
	const publicBase = env.r2.publicUrl;

	if (publicBase) {
		return `${publicBase}/${encodeObjectPath(filePath)}`;
	}

	const client = getR2Client();
	const command = new GetObjectCommand({
		Bucket: getR2BucketName(),
		Key: filePath,
	});

	return getSignedUrl(client, command, {
		expiresIn: PRESIGNED_URL_EXPIRES_IN_SECONDS,
	});
}
