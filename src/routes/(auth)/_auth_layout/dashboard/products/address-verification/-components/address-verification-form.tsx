import {
	CloudArrowUpIcon,
	LinkIcon,
	MagnifyingGlassIcon,
	PaperPlaneTiltIcon,
} from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { useSupportedCountriesQuery } from "#/api/http/v1/tenants/tenants.hooks";
import type { SupportedCountry } from "#/api/http/v1/tenants/tenants.types";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
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
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "#/components/ui/toggle-group";
import { cn } from "#/lib/utils.ts";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { VerificationConsentCheckbox } from "../../../-components/VerificationConsentCheckbox";
import {
	DEFAULT_VERIFICATION_URL_LIMIT,
	VERIFICATION_MODES,
	VERIFICATION_URL_LIMITS,
	type VerificationMode,
	verificationConsentSchema,
} from "../../../-components/VerificationConsentCheckbox/data";

const linkFormSchema = z.object({
	email: z.email("Enter a valid email address"),
	country: z.string().min(1, "Select a country"),
	address: z.string().trim().min(1, "Address is required"),
	urlLimit: z.string().min(1, "Select a verification URL limit"),
	consent: verificationConsentSchema,
});

const directFormSchema = z.object({
	email: z.email("Enter a valid email address"),
	country: z.string().min(1, "Select a country"),
	address: z.string().trim().min(1, "Address is required"),
	consent: verificationConsentSchema,
});

export function AddressVerificationForm() {
	const [mode, setMode] = useState<VerificationMode>("link");
	const [proofOfAddressFile, setProofOfAddressFile] = useState<File[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const countriesQuery = useSupportedCountriesQuery();

	const countries = useMemo(
		() => (countriesQuery.data as SupportedCountry[]) ?? [],
		[countriesQuery.data],
	);

	const linkForm = useForm({
		defaultValues: {
			email: "",
			country: "",
			address: "",
			urlLimit: DEFAULT_VERIFICATION_URL_LIMIT,
			consent: false,
		},
		validators: {
			onChange: linkFormSchema,
			onSubmit: linkFormSchema,
		},
		onSubmit: async () => {
			setIsSubmitting(true);
			try {
				toast.success("Verification request submitted");
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	const directForm = useForm({
		defaultValues: {
			email: "",
			country: "",
			address: "",
			consent: false,
		},
		validators: {
			onChange: directFormSchema,
			onSubmit: directFormSchema,
		},
		onSubmit: async () => {
			if (proofOfAddressFile.length === 0) {
				toast.error("Please upload a proof-of-address document");
				return;
			}

			setIsSubmitting(true);
			try {
				toast.success("Verification request submitted");
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	const activeForm = mode === "link" ? linkForm : directForm;
	const canSubmit =
		activeForm.state.canSubmit &&
		(mode === "direct" ? proofOfAddressFile.length > 0 : true);

	return (
		<Card>
			<CardContent className="pt-0">
				<form
					className="flex flex-col gap-6"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void activeForm.handleSubmit();
					}}
				>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-sm font-medium text-muted-foreground">Mode</p>
						<ToggleGroup
							type="single"
							value={mode}
							onValueChange={(value) => {
								if (value) {
									setMode(value as VerificationMode);
								}
							}}
							variant="outline"
							spacing={0}
							className="w-full sm:w-auto"
						>
							{VERIFICATION_MODES.map((option) => {
								const Icon =
									option.value === "link" ? LinkIcon : MagnifyingGlassIcon;

								return (
									<ToggleGroupItem
										key={option.value}
										value={option.value}
										className={cn("flex-1 sm:flex-none")}
									>
										<Icon className="size-4" />
										{option.label}
									</ToggleGroupItem>
								);
							})}
						</ToggleGroup>
					</div>

					{mode === "link" ? (
						<FieldGroup className="gap-4">
							<linkForm.Field name="email">
								{(field) => (
									<Field className="gap-1.5">
										<FieldLabel htmlFor="address-verification-link-email">
											Email Address
										</FieldLabel>
										<Input
											id="address-verification-link-email"
											type="email"
											autoComplete="email"
											placeholder="Email Address"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
										/>
									</Field>
								)}
							</linkForm.Field>

							<linkForm.Field name="country">
								{(field) => (
									<Field className="gap-1.5">
										<FieldLabel htmlFor="address-verification-link-country">
											Country
										</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={field.handleChange}
											disabled={countriesQuery.isPending}
										>
											<SelectTrigger
												id="address-verification-link-country"
												className="w-full"
											>
												<SelectValue
													placeholder={
														countriesQuery.isPending
															? "Loading countries..."
															: "Select a country"
													}
												/>
											</SelectTrigger>
											<SelectContent className="max-h-60">
												{countries.map((country) => (
													<SelectItem key={country.code} value={country.code}>
														{country.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</Field>
								)}
							</linkForm.Field>

							<linkForm.Field name="address">
								{(field) => (
									<Field className="gap-1.5">
										<FieldLabel htmlFor="address-verification-link-address">
											Address
										</FieldLabel>
										<Textarea
											id="address-verification-link-address"
											placeholder="Address"
											rows={3}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
										/>
									</Field>
								)}
							</linkForm.Field>

							<linkForm.Field name="urlLimit">
								{(field) => (
									<Field className="gap-1.5">
										<FieldLabel htmlFor="address-verification-url-limit">
											Verification URL Limit
										</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={field.handleChange}
										>
											<SelectTrigger
												id="address-verification-url-limit"
												className="w-full"
											>
												<SelectValue placeholder="Select duration" />
											</SelectTrigger>
											<SelectContent>
												{VERIFICATION_URL_LIMITS.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FieldDescription>
											How long the verification link stays active
										</FieldDescription>
									</Field>
								)}
							</linkForm.Field>
						</FieldGroup>
					) : (
						<>
							<FieldGroup className="gap-4">
								<directForm.Field name="email">
									{(field) => (
										<Field className="gap-1.5">
											<FieldLabel htmlFor="address-verification-direct-email">
												Email Address
											</FieldLabel>
											<Input
												id="address-verification-direct-email"
												type="email"
												autoComplete="email"
												placeholder="Email Address"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
											/>
										</Field>
									)}
								</directForm.Field>

								<directForm.Field name="country">
									{(field) => (
										<Field className="gap-1.5">
											<FieldLabel htmlFor="address-verification-direct-country">
												Country
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={field.handleChange}
												disabled={countriesQuery.isPending}
											>
												<SelectTrigger
													id="address-verification-direct-country"
													className="w-full"
												>
													<SelectValue
														placeholder={
															countriesQuery.isPending
																? "Loading countries..."
																: "Select a country"
														}
													/>
												</SelectTrigger>
												<SelectContent className="max-h-60">
													{countries.map((country) => (
														<SelectItem key={country.code} value={country.code}>
															{country.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</Field>
									)}
								</directForm.Field>

								<directForm.Field name="address">
									{(field) => (
										<Field className="gap-1.5">
											<FieldLabel htmlFor="address-verification-direct-address">
												Address
											</FieldLabel>
											<Textarea
												id="address-verification-direct-address"
												placeholder="Address"
												rows={3}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
											/>
										</Field>
									)}
								</directForm.Field>
							</FieldGroup>

							<Field className="gap-1.5">
								<FieldLabel htmlFor="address-verification-proof">
									Proof of Address
								</FieldLabel>
								<FileUpload
									value={proofOfAddressFile}
									onValueChange={setProofOfAddressFile}
									accept="image/*,.pdf"
									maxFiles={1}
									maxSize={10 * 1024 * 1024}
								>
									<FileUploadDropzone className="flex min-h-36 flex-col items-center justify-center gap-2 border-dashed py-8">
										<CloudArrowUpIcon className="size-8 text-secondary" />
										<p className="text-sm text-muted-foreground">
											Click to upload proof-of-address document (image or PDF)
										</p>
										<FileUploadTrigger asChild>
											<Button
												type="button"
												variant="link"
												className="h-auto p-0"
											>
												Choose file
											</Button>
										</FileUploadTrigger>
									</FileUploadDropzone>
									{proofOfAddressFile.length > 0 && (
										<FileUploadList>
											{proofOfAddressFile.map((file) => (
												<FileUploadItem
													key={`${file.name}-${file.lastModified}`}
													value={file}
													className="p-2"
												>
													<FileUploadItemPreview className="size-8" />
													<FileUploadItemMetadata size="sm" />
													<FileUploadItemDelete asChild>
														<Button
															type="button"
															variant="ghost"
															size="icon-xs"
														>
															Remove
														</Button>
													</FileUploadItemDelete>
												</FileUploadItem>
											))}
										</FileUploadList>
									)}
								</FileUpload>
							</Field>
						</>
					)}

					{mode === "link" ? (
						<linkForm.Field name="consent">
							{(field) => (
								<VerificationConsentCheckbox
									id="address-verification-link-consent"
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							)}
						</linkForm.Field>
					) : (
						<directForm.Field name="consent">
							{(field) => (
								<VerificationConsentCheckbox
									id="address-verification-direct-consent"
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							)}
						</directForm.Field>
					)}

					<Button
						type="submit"
						className="w-full cursor-pointer"
						disabled={!canSubmit || isSubmitting}
					>
						<PaperPlaneTiltIcon className="size-4" />
						{isSubmitting ? "Submitting..." : "Submit Verification"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
