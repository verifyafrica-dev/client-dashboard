import { CloudArrowUpIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadItem,
	FileUploadItemDelete,
	FileUploadItemMetadata,
	FileUploadItemPreview,
	FileUploadList,
	FileUploadTrigger,
} from "#/components/ui/file-upload";
import { Field, FieldLabel } from "@/components/ui/field";
import { useCurrentTenant } from "../../team/-data";

import {
	type VerificationStorageName,
	UPLOAD_MAX_FILE_SIZE,
	uploadProductProofFile,
	validateUploadFile,
} from "../-upload-utils";

type ProductProofUploadProps = {
	label: string;
	verificationName: VerificationStorageName;
	proofUrl: string | null;
	onProofUrlChange: (url: string | null) => void;
	accept?: string;
	allowedMimeTypes?: readonly string[];
	emptyStateText: string;
	disabled?: boolean;
	onUploadingChange?: (isUploading: boolean) => void;
};

export function ProductProofUpload({
	label,
	verificationName,
	proofUrl,
	onProofUrlChange,
	accept = "image/*,application/pdf",
	allowedMimeTypes,
	emptyStateText,
	disabled = false,
	onUploadingChange,
}: ProductProofUploadProps) {
	const { tenantSlug } = useCurrentTenant();
	const [files, setFiles] = useState<File[]>([]);
	const [isUploading, setIsUploading] = useState(false);

	useEffect(() => {
		onUploadingChange?.(isUploading);
	}, [isUploading, onUploadingChange]);

	return (
		<Field className="gap-1.5">
			<FieldLabel>{label}</FieldLabel>
			<FileUpload
				value={files}
				onValueChange={(nextFiles) => {
					setFiles(nextFiles);

					if (nextFiles.length === 0) {
						onProofUrlChange(null);
					}
				}}
				accept={accept}
				maxFiles={1}
				maxSize={UPLOAD_MAX_FILE_SIZE}
				disabled={disabled || isUploading}
				onFileValidate={(file) => {
					const validation = validateUploadFile(file, allowedMimeTypes);
					return validation.valid ? undefined : validation.error;
				}}
				onFileReject={(_file, message) => {
					toast.error(message);
				}}
				onUpload={async (uploadFiles, { onProgress, onSuccess, onError }) => {
					const file = uploadFiles[0];
					if (!file) {
						onProofUrlChange(null);
						return;
					}

					if (!tenantSlug) {
						toast.error("Tenant is required to upload files.");
						setFiles([]);
						onProofUrlChange(null);
						return;
					}

					setIsUploading(true);
					try {
						const url = await uploadProductProofFile({
							file,
							tenantSlug,
							verificationName,
							onProgress: (progress) => {
								onProgress(file, progress);
							},
						});

						onProofUrlChange(url);
						onSuccess(file);
					} catch (error) {
						const message =
							error instanceof Error ? error.message : "Upload failed";
						onError(
							file,
							error instanceof Error ? error : new Error("Upload failed"),
						);
						toast.error(`Failed to upload file: ${message}`);
						setFiles([]);
						onProofUrlChange(null);
					} finally {
						setIsUploading(false);
					}
				}}
			>
				<FileUploadDropzone className="flex min-h-36 flex-col items-center justify-center gap-2 border-dashed py-8">
					<CloudArrowUpIcon className="size-8 text-secondary" />
					<p className="text-sm text-muted-foreground">
						{isUploading
							? "Uploading..."
							: proofUrl
								? "File uploaded"
								: emptyStateText}
					</p>
					<FileUploadTrigger asChild>
						<Button
							type="button"
							variant="link"
							className="h-auto p-0"
							disabled={disabled || isUploading}
						>
							Choose file
						</Button>
					</FileUploadTrigger>
				</FileUploadDropzone>
				{files.length > 0 ? (
					<FileUploadList>
						{files.map((file) => (
							<FileUploadItem
								key={`${file.name}-${file.lastModified}`}
								value={file}
								className="justify-between gap-3 p-2"
							>
								<div className="flex min-w-0 items-center gap-2.5">
									<FileUploadItemPreview className="size-8 shrink-0" />
									<FileUploadItemMetadata
										size="sm"
										className="min-w-0 flex-initial"
									/>
								</div>
								<FileUploadItemDelete asChild>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="h-8 shrink-0 px-2"
										disabled={disabled || isUploading}
									>
										Remove
									</Button>
								</FileUploadItemDelete>
							</FileUploadItem>
						))}
					</FileUploadList>
				) : null}
			</FileUpload>
		</Field>
	);
}
