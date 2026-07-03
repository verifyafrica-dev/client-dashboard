import { useEffect, useMemo, useState } from "react";

import { VERIFICATIONS_V2_API } from "#/api/http/v2/verifications/verifications.api";
import type { VerificationProofs } from "#/api/http/v2/verifications/verifications.types";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { cn } from "#/lib/utils.ts";
import {
	getVisibleProofEntries,
	PROOF_KINDS,
	PROOF_LABELS,
	type ProofDisplayKey,
} from "../-proof-utils";
import { ReportDetailField } from "./report-detail-field";

type VerificationProofsSectionProps = {
	proofs?: VerificationProofs;
};

type LoadedProofAsset = {
	url: string;
	mimeType: string;
};

function VerificationProofsSkeleton({ count }: { count: number }) {
	return (
		<div
			className="grid gap-4 sm:grid-cols-2"
			aria-busy="true"
			aria-label="Loading verification proofs"
		>
			{Array.from({ length: count }).map((_, index) => (
				<div key={index} className="flex flex-col gap-2 sm:col-span-2">
					<Skeleton className="h-3 w-32" />
					<Skeleton className="h-40 w-full max-w-xs rounded-md" />
				</div>
			))}
		</div>
	);
}

export function VerificationProofsSection({
	proofs,
}: VerificationProofsSectionProps) {
	const proofEntries = useMemo(() => getVisibleProofEntries(proofs), [proofs]);
	const [assets, setAssets] = useState<
		Partial<Record<ProofDisplayKey, LoadedProofAsset>>
	>({});
	const [errorKeys, setErrorKeys] = useState<ProofDisplayKey[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const accessToken = proofs?.access_token;

		if (!accessToken || proofEntries.length === 0) {
			setAssets({});
			setErrorKeys([]);
			setIsLoading(false);
			return;
		}

		const createdUrls: string[] = [];
		let isCancelled = false;

		setAssets({});
		setErrorKeys([]);
		setIsLoading(true);

		void Promise.all(
			proofEntries.map(async ([key, url]) => {
				try {
					const blob = await VERIFICATIONS_V2_API.FETCH_SHUFTI_PROOF_ASSET(
						url,
						accessToken,
					);

					if (isCancelled) {
						return;
					}

					const objectUrl = window.URL.createObjectURL(blob);
					createdUrls.push(objectUrl);
					setAssets((current) => ({
						...current,
						[key]: {
							url: objectUrl,
							mimeType: blob.type,
						},
					}));
				} catch (error) {
					if (!isCancelled) {
						console.error(`Failed to load proof asset for ${key}.`, error);
						setErrorKeys((current) => [...current, key]);
					}
				}
			}),
		).finally(() => {
			if (!isCancelled) {
				setIsLoading(false);
			}
		});

		return () => {
			isCancelled = true;
			createdUrls.forEach((url) => window.URL.revokeObjectURL(url));
		};
	}, [proofEntries, proofs?.access_token]);

	if (proofEntries.length === 0) {
		return null;
	}

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base font-semibold">Proofs</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<VerificationProofsSkeleton count={proofEntries.length} />
				) : (
					<div className="grid gap-4 sm:grid-cols-2">
						{proofEntries.map(([key]) => {
							const asset = assets[key];
							const hasError = errorKeys.includes(key);

							return (
								<ReportDetailField
									key={key}
									label={PROOF_LABELS[key]}
									className="sm:col-span-2"
									value={
										hasError || !asset ? (
											<span className="text-muted-foreground">
												Not available
											</span>
										) : PROOF_KINDS[key] === "video" ? (
											<video
												src={asset.url}
												controls
												className="max-w-full rounded-md border bg-black sm:max-w-xs"
											/>
										) : (
											<img
												src={asset.url}
												alt={PROOF_LABELS[key]}
												className={cn(
													"max-h-40 rounded-md border object-cover",
													asset.mimeType === "application/pdf" &&
														"object-contain",
												)}
											/>
										)
									}
								/>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
