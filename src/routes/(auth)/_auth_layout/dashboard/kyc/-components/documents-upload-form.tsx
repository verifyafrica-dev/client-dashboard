import {
	CheckCircleIcon,
	InfoIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import type {
	KYBDocuments,
	UploadedDocument,
} from "#/api/http/v1/kyc/kyc.types";
import { Alert, AlertDescription } from "#/components/ui/alert";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader } from "#/components/ui/card";
import { useAuthStore } from "#/stores/auth-store";
import { KYC_DOCUMENT_CATEGORIES } from "../-constants";
import { SECTION_NAMES } from "../-data";
import {
	createUploadedDocument,
	readFileAsDataUrl,
	validateKycFile,
} from "../-upload-utils";
import { useKyc } from "./kyc-provider";
import { KycFileUpload, KycSectionHeader } from "./kyc-form-primitives";

type DocumentCategoryKey = (typeof KYC_DOCUMENT_CATEGORIES)[number]["key"];

function getDocumentCount(documents: KYBDocuments) {
	const completed = KYC_DOCUMENT_CATEGORIES.filter(
		(category) => (documents[category.key]?.length ?? 0) > 0,
	).length;

	return {
		completed,
		total: KYC_DOCUMENT_CATEGORIES.length,
		percent: Math.round((completed / KYC_DOCUMENT_CATEGORIES.length) * 100),
	};
}

function formatFileSize(bytes: number) {
	if (bytes === 0) {
		return "0 Bytes";
	}

	const units = ["Bytes", "KB", "MB", "GB"];
	const index = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${Math.round((bytes / 1024 ** index) * 100) / 100} ${units[index]}`;
}

function formatUploadDate(isoDate: string) {
	return new Date(isoDate).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function DocumentList({
	documents,
	isReadOnly,
	onDelete,
}: {
	documents: UploadedDocument[];
	isReadOnly: boolean;
	onDelete: (documentId: string) => void;
}) {
	if (documents.length === 0) {
		return null;
	}

	return (
		<div className="space-y-2 border-t pt-4">
			<p className="text-sm font-medium">
				Uploaded Files ({documents.length})
			</p>
			<ul className="space-y-2">
				{documents.map((document) => (
					<li
						key={document.id}
						className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
					>
						<div className="min-w-0 flex-1">
							<p className="truncate font-medium">{document.fileName}</p>
							<p className="text-xs text-muted-foreground">
								{formatFileSize(document.fileSize)} • Uploaded on{" "}
								{formatUploadDate(document.uploadedAt)}
							</p>
						</div>
						<div className="flex items-center gap-2">
							<a
								href={document.url}
								target="_blank"
								rel="noreferrer"
								className="text-primary hover:underline"
							>
								View
							</a>
							{!isReadOnly && (
								<Button
									type="button"
									variant="ghost"
									size="icon-xs"
									onClick={() => onDelete(document.id)}
									aria-label={`Remove ${document.fileName}`}
								>
									<TrashIcon className="size-4 text-destructive" />
								</Button>
							)}
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

function DocumentCategoryCard({
	categoryKey,
	title,
	description,
	documents,
	isReadOnly,
	isSaving,
	onUpload,
	onDelete,
}: {
	categoryKey: DocumentCategoryKey;
	title: string;
	description: string;
	documents: UploadedDocument[];
	isReadOnly: boolean;
	isSaving: boolean;
	onUpload: (categoryKey: DocumentCategoryKey, files: File[]) => Promise<void>;
	onDelete: (categoryKey: DocumentCategoryKey, documentId: string) => Promise<void>;
}) {
	const [pendingFiles, setPendingFiles] = useState<File[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const hasFiles = documents.length > 0;

	async function handleFilesChange(files: File[]) {
		if (files.length === 0) {
			setPendingFiles([]);
			return;
		}

		const newFiles = files.filter(
			(file) =>
				!pendingFiles.some(
					(existing) =>
						existing.name === file.name &&
						existing.lastModified === file.lastModified,
				),
		);

		setPendingFiles(files);

		if (newFiles.length === 0) {
			return;
		}

		setIsUploading(true);
		try {
			await onUpload(categoryKey, newFiles);
			setPendingFiles([]);
		} finally {
			setIsUploading(false);
		}
	}

	return (
		<Card
			className={
				hasFiles ? "border-emerald-200 bg-emerald-50/40" : undefined
			}
		>
			<CardHeader className="gap-1 pb-3">
				<div className="flex flex-wrap items-center gap-2">
					<h3 className="text-base font-semibold">{title}</h3>
					{hasFiles ? (
						<Badge
							variant="outline"
							className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700 uppercase"
						>
							{documents.length} file{documents.length === 1 ? "" : "s"}
						</Badge>
					) : (
						<Badge variant="destructive" className="text-[10px] uppercase">
							Required
						</Badge>
					)}
				</div>
				<p className="text-sm text-muted-foreground">{description}</p>
			</CardHeader>
			<CardContent className="space-y-4">
				{!isReadOnly && (
					<KycFileUpload
						value={pendingFiles}
						onValueChange={(files) => void handleFilesChange(files)}
						disabled={isSaving || isUploading}
					/>
				)}

				{isUploading && (
					<p className="text-sm text-muted-foreground">Uploading...</p>
				)}

				<DocumentList
					documents={documents}
					isReadOnly={isReadOnly}
					onDelete={(documentId) => void onDelete(categoryKey, documentId)}
				/>
			</CardContent>
		</Card>
	);
}

export function DocumentsUploadForm() {
	const { kycData, isReadOnly, isSaving, saveCompliance, onNavigateToSection } =
		useKyc();
	const user = useAuthStore((state) => state.user);
	const documents = kycData.documents;

	const progress = useMemo(() => getDocumentCount(documents), [documents]);

	async function persistDocuments(updatedDocuments: KYBDocuments) {
		await saveCompliance(
			(current) => ({
				...current,
				documents: updatedDocuments,
			}),
			{ currentSection: SECTION_NAMES.DOCUMENTS_UPLOAD, navigateNext: false },
		);
	}

	async function handleUpload(categoryKey: DocumentCategoryKey, files: File[]) {
		const uploadedDocuments: UploadedDocument[] = [];

		for (const file of files) {
			const validation = validateKycFile(file);
			if (!validation.valid) {
				toast.error(validation.error);
				continue;
			}

			try {
				const dataUrl = await readFileAsDataUrl(file);
				uploadedDocuments.push(
					createUploadedDocument({
						file,
						url: dataUrl,
						folder: `kyc-documents/${categoryKey}`,
						author: user?.email,
					}),
				);
				toast.success(`File uploaded successfully: ${file.name}`);
			} catch {
				toast.error(`Failed to upload ${file.name}`);
			}
		}

		if (uploadedDocuments.length === 0) {
			return;
		}

		const updatedDocuments = {
			...documents,
			[categoryKey]: [...(documents[categoryKey] ?? []), ...uploadedDocuments],
		};

		await persistDocuments(updatedDocuments);
	}

	async function handleDelete(
		categoryKey: DocumentCategoryKey,
		documentId: string,
	) {
		const updatedDocuments = {
			...documents,
			[categoryKey]: (documents[categoryKey] ?? []).filter(
				(document) => document.id !== documentId,
			),
		};

		await persistDocuments(updatedDocuments);
		toast.success("File removed");
	}

	async function handleContinue() {
		const incomplete = KYC_DOCUMENT_CATEGORIES.filter(
			(category) => (documents[category.key]?.length ?? 0) === 0,
		);

		if (incomplete.length > 0) {
			toast.error(
				"Please upload at least one document for each required category to continue.",
			);
			return;
		}

		await saveCompliance((current) => current, {
			currentSection: SECTION_NAMES.DOCUMENTS_UPLOAD,
			navigateNext: true,
		});

		onNavigateToSection(null);
	}

	return (
		<div className="flex flex-col gap-6">
			<KycSectionHeader
				title="Documents Upload"
				description="Upload required business and identification documents."
				badge={
					<Badge variant="outline" className="font-normal">
						{progress.percent === 100 ? "Complete" : "In Progress"} (
						{progress.percent}%)
					</Badge>
				}
			/>

			<Alert className="border-sky-200 bg-sky-50 text-sky-950">
				<InfoIcon className="size-4 text-sky-600" weight="fill" />
				<AlertDescription className="space-y-1.5 text-sky-900">
					<p>
						All document categories are required. You can upload multiple files
						per category. Accepted formats: Images (JPEG, PNG, GIF) and PDF
						documents. Maximum file size: 10MB per file.
					</p>
					<p className="flex items-center gap-2">
						<CheckCircleIcon className="size-4 shrink-0 text-sky-600" />
						Documents are automatically saved after each upload
					</p>
				</AlertDescription>
			</Alert>

			<div className="space-y-4">
				{KYC_DOCUMENT_CATEGORIES.map((category) => (
					<DocumentCategoryCard
						key={category.key}
						categoryKey={category.key}
						title={category.title}
						description={category.description}
						documents={documents[category.key] ?? []}
						isReadOnly={isReadOnly}
						isSaving={isSaving}
						onUpload={handleUpload}
						onDelete={handleDelete}
					/>
				))}
			</div>

			{!isReadOnly && (
				<div className="flex justify-end">
					<Button
						type="button"
						className="cursor-pointer uppercase tracking-wide"
						onClick={() => void handleContinue()}
						disabled={isSaving}
					>
						Continue
					</Button>
				</div>
			)}
		</div>
	);
}
