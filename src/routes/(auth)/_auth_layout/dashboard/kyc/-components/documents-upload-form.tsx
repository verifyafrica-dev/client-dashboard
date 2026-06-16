import { CheckCircleIcon, InfoIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "#/components/ui/alert";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader } from "#/components/ui/card";
import { KycFileUpload, KycSectionHeader } from "./kyc-form-primitives";

const DOCUMENT_CATEGORIES = [
	{
		id: "directors-id",
		title: "Directors Identification",
		description: "Passports and nationally approved IDs for all directors",
	},
	{
		id: "business-address",
		title: "Proof of Business Address",
		description:
			"Utility bill, lease agreement, or official government document",
	},
	{
		id: "directors-address",
		title: "Proof of Directors Address",
		description: "Utility bills or official documents for each director",
	},
	{
		id: "website-ownership",
		title: "Proof of Website/Domain Ownership",
		description: "Screenshot from domain registrar showing ownership",
	},
	{
		id: "company-license",
		title: "Legal Company License",
		description: "Business registration certificate or operating license",
	},
] as const;

type DocumentCategoryId = (typeof DOCUMENT_CATEGORIES)[number]["id"];

export function DocumentsUploadForm() {
	const [uploads, setUploads] = useState<Record<DocumentCategoryId, File[]>>(
		() =>
			Object.fromEntries(
				DOCUMENT_CATEGORIES.map(
					(category) => [category.id, []] as [DocumentCategoryId, File[]],
				),
			) as Record<DocumentCategoryId, File[]>,
	);

	const progress = useMemo(() => {
		const completed = DOCUMENT_CATEGORIES.filter(
			(category) => uploads[category.id].length > 0,
		).length;
		return Math.round((completed / DOCUMENT_CATEGORIES.length) * 100);
	}, [uploads]);

	return (
		<div className="flex flex-col gap-6">
			<KycSectionHeader
				title="Documents Upload"
				description="Upload required business and identification documents."
				badge={
					<Badge variant="outline" className="font-normal">
						In Progress ({progress}%)
					</Badge>
				}
			/>

			<Alert className="border-sky-200 bg-sky-50 text-sky-950">
				<InfoIcon className="size-4 text-sky-600" weight="fill" />
				<AlertDescription className="space-y-2 text-sky-900">
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
				{DOCUMENT_CATEGORIES.map((category) => (
					<Card key={category.id}>
						<CardHeader className="gap-1 pb-3">
							<div className="flex flex-wrap items-center gap-2">
								<h3 className="text-base font-semibold">{category.title}</h3>
								<Badge variant="destructive" className="text-[10px] uppercase">
									Required
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground">
								{category.description}
							</p>
						</CardHeader>
						<CardContent>
							<KycFileUpload
								value={uploads[category.id]}
								onValueChange={(files) =>
									setUploads((current) => ({
										...current,
										[category.id]: files,
									}))
								}
							/>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="flex justify-end">
				<Button type="button" className="uppercase tracking-wide">
					Continue
				</Button>
			</div>
		</div>
	);
}
