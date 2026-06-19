import { CheckCircleIcon, InfoIcon } from "@phosphor-icons/react";
import { useMemo } from "react";
import { toast } from "sonner";

import type { KYBDocuments, UploadedDocument } from "#/api/http/v1/kyc/kyc.types";
import { Alert, AlertDescription } from "#/components/ui/alert";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader } from "#/components/ui/card";
import { KYC_DOCUMENT_CATEGORIES } from "../-constants";
import { SECTION_NAMES } from "../-data";
import { useKyc } from "./kyc-provider";
import { KycSectionHeader } from "./kyc-form-primitives";

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

function DocumentList({ documents }: { documents: UploadedDocument[] }) {
	if (documents.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
		);
	}

	return (
		<ul className="space-y-2">
			{documents.map((document) => (
				<li
					key={document.id}
					className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
				>
					<span className="truncate">{document.fileName}</span>
					<a
						href={document.url}
						target="_blank"
						rel="noreferrer"
						className="text-primary hover:underline"
					>
						View
					</a>
				</li>
			))}
		</ul>
	);
}

export function DocumentsUploadForm() {
	const { kycData, isReadOnly, saveCompliance, onNavigateToSection } = useKyc();
	const documents = kycData.documents;

	const progress = useMemo(() => getDocumentCount(documents), [documents]);

	async function handleContinue() {
		const incomplete = KYC_DOCUMENT_CATEGORIES.filter(
			(category) => (documents[category.key]?.length ?? 0) === 0,
		);

		if (incomplete.length > 0) {
			toast.error("Please upload all required document categories before continuing.");
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
						{progress.percent === 100 ? "Completed" : "In Progress"} (
						{progress.percent}%)
					</Badge>
				}
			/>

			<Alert className="border-sky-200 bg-sky-50 text-sky-950">
				<InfoIcon className="size-4 text-sky-600" weight="fill" />
				<AlertDescription className="space-y-1.5 text-sky-900">
					<p>
						All document categories are required. Accepted formats: Images
						(JPEG, PNG, GIF) and PDF documents. Maximum file size: 10MB per
						file.
					</p>
					<p className="flex items-center gap-2">
						<CheckCircleIcon className="size-4 shrink-0 text-sky-600" />
						Document uploads are managed through secure storage and saved to
						your compliance profile.
					</p>
				</AlertDescription>
			</Alert>

			<div className="space-y-4">
				{KYC_DOCUMENT_CATEGORIES.map((category) => {
					const categoryDocuments = documents[category.key] ?? [];

					return (
						<Card key={category.key}>
							<CardHeader className="gap-1 pb-3">
								<div className="flex flex-wrap items-center gap-2">
									<h3 className="text-base font-semibold">{category.title}</h3>
									<Badge variant="destructive" className="text-[10px] uppercase">
										Required
									</Badge>
									{categoryDocuments.length > 0 && (
										<Badge variant="outline" className="text-[10px] uppercase">
											{categoryDocuments.length} uploaded
										</Badge>
									)}
								</div>
								<p className="text-sm text-muted-foreground">
									{category.description}
								</p>
							</CardHeader>
							<CardContent>
								<DocumentList documents={categoryDocuments} />
								{!isReadOnly && categoryDocuments.length === 0 && (
									<p className="mt-3 text-xs text-muted-foreground">
										Upload support will be connected to secure storage. Use the
										dashboard to upload documents for now if needed.
									</p>
								)}
							</CardContent>
						</Card>
					);
				})}
			</div>

			{!isReadOnly && (
				<div className="flex justify-end">
					<Button
						type="button"
						className="cursor-pointer uppercase tracking-wide"
						onClick={() => void handleContinue()}
					>
						Continue
					</Button>
				</div>
			)}
		</div>
	);
}
