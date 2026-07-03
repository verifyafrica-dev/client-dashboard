import {
	IMAGE_UPLOAD_MIME_TYPES,
	UPLOAD_ALLOWED_MIME_TYPES,
	UPLOAD_MAX_FILE_SIZE,
	uploadFileToStorage,
	validateUploadFile,
} from "#/lib/file-upload-storage";

export const PRODUCT_UPLOAD_FOLDERS = {
	documentVerification: "product-uploads/document-verification",
	addressVerification: "product-uploads/address-verification",
	facialScreening: "product-uploads/facial-screening",
	governmentRegistryChecks: "product-uploads/government-registry-checks",
} as const;

export type ProductUploadFolder =
	(typeof PRODUCT_UPLOAD_FOLDERS)[keyof typeof PRODUCT_UPLOAD_FOLDERS];

export {
	IMAGE_UPLOAD_MIME_TYPES,
	UPLOAD_ALLOWED_MIME_TYPES,
	UPLOAD_MAX_FILE_SIZE,
	validateUploadFile,
};

export async function uploadProductProofFile({
	file,
	folder,
	onProgress,
}: {
	file: File;
	folder: ProductUploadFolder;
	onProgress?: (progress: number) => void;
}) {
	const uploadedFile = await uploadFileToStorage({
		file,
		folder,
		onProgress,
	});

	return uploadedFile.url;
}
