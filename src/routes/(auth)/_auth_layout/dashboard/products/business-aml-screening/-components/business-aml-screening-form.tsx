import {
	LinkIcon,
	MagnifyingGlassIcon,
	PaperPlaneTiltIcon,
	SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { format, isValid, parse } from "date-fns";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { useSupportedCountriesQuery } from "#/api/http/v1/tenants/tenants.hooks";
import type { SupportedCountry } from "#/api/http/v1/tenants/tenants.types";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "#/components/ui/accordion";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Checkbox } from "#/components/ui/checkbox";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Slider } from "#/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "#/components/ui/toggle-group";
import { cn } from "#/lib/utils.ts";
import { KycDatePicker } from "../../../kyc/-components/kyc-form-primitives";
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
import {
	AML_SCREENING_FILTERS,
	DEFAULT_AML_SCREENING_FILTERS,
	DEFAULT_MATCH_SCORE,
	type AmlScreeningFilterKey,
} from "../../aml-screening/-data";

const businessFieldsSchema = {
	screeningCountry: z.string(),
	businessName: z.string().trim().min(1, "Business name is required"),
	incorporationDate: z.string(),
};

const linkFormSchema = z.object({
	email: z.email("Enter a valid email address"),
	...businessFieldsSchema,
	urlLimit: z.string().min(1, "Select a verification URL limit"),
	consent: verificationConsentSchema,
});

const directFormSchema = z.object({
	email: z.email("Enter a valid email address"),
	...businessFieldsSchema,
	consent: verificationConsentSchema,
});

function parseIncorporationDate(value: string) {
	if (!value) {
		return undefined;
	}

	const parsed = parse(value, "yyyy-MM-dd", new Date());
	return isValid(parsed) ? parsed : undefined;
}

export function BusinessAmlScreeningForm() {
	const [mode, setMode] = useState<VerificationMode>("link");
	const [filters, setFilters] = useState(DEFAULT_AML_SCREENING_FILTERS);
	const [matchScore, setMatchScore] = useState(DEFAULT_MATCH_SCORE);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const countriesQuery = useSupportedCountriesQuery();

	const countries = useMemo(
		() => (countriesQuery.data as SupportedCountry[]) ?? [],
		[countriesQuery.data],
	);

	const hasSelectedFilters = useMemo(
		() => Object.values(filters).some(Boolean),
		[filters],
	);

	const linkForm = useForm({
		defaultValues: {
			email: "",
			screeningCountry: "",
			businessName: "",
			incorporationDate: "",
			urlLimit: DEFAULT_VERIFICATION_URL_LIMIT,
			consent: false,
		},
		validators: {
			onChange: linkFormSchema,
			onSubmit: linkFormSchema,
		},
		onSubmit: async () => {
			if (!hasSelectedFilters) {
				toast.error("Select at least one filter");
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

	const directForm = useForm({
		defaultValues: {
			email: "",
			screeningCountry: "",
			businessName: "",
			incorporationDate: "",
			consent: false,
		},
		validators: {
			onChange: directFormSchema,
			onSubmit: directFormSchema,
		},
		onSubmit: async () => {
			if (!hasSelectedFilters) {
				toast.error("Select at least one filter");
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
	const canSubmit = activeForm.state.canSubmit && hasSelectedFilters;

	function toggleFilter(key: AmlScreeningFilterKey, checked: boolean) {
		setFilters((current) => ({ ...current, [key]: checked }));
	}

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
						<p className="text-sm font-medium text-muted-foreground">
							Verification Mode
						</p>
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

					<FieldGroup className="gap-4">
						{mode === "link" ? (
							<linkForm.Field name="email">
								{(field) => (
									<Field className="gap-1.5">
										<FieldLabel htmlFor="business-aml-link-email">
											Email Address
										</FieldLabel>
										<Input
											id="business-aml-link-email"
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
						) : (
							<directForm.Field name="email">
								{(field) => (
									<Field className="gap-1.5">
										<FieldLabel htmlFor="business-aml-direct-email">
											Email Address
										</FieldLabel>
										<Input
											id="business-aml-direct-email"
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
						)}

						{mode === "link" ? (
							<linkForm.Field name="screeningCountry">
								{(field) => (
									<ScreeningCountryField
										id="business-aml-link-country"
										value={field.state.value}
										onValueChange={field.handleChange}
										countries={countries}
										isLoading={countriesQuery.isPending}
									/>
								)}
							</linkForm.Field>
						) : (
							<directForm.Field name="screeningCountry">
								{(field) => (
									<ScreeningCountryField
										id="business-aml-direct-country"
										value={field.state.value}
										onValueChange={field.handleChange}
										countries={countries}
										isLoading={countriesQuery.isPending}
									/>
								)}
							</directForm.Field>
						)}

						<div className="grid gap-4 sm:grid-cols-2">
							{mode === "link" ? (
								<linkForm.Field name="businessName">
									{(field) => (
										<Field className="gap-1.5">
											<FieldLabel htmlFor="business-aml-link-name">
												Business Name
											</FieldLabel>
											<Input
												id="business-aml-link-name"
												placeholder="Business Name"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
											/>
										</Field>
									)}
								</linkForm.Field>
							) : (
								<directForm.Field name="businessName">
									{(field) => (
										<Field className="gap-1.5">
											<FieldLabel htmlFor="business-aml-direct-name">
												Business Name
											</FieldLabel>
											<Input
												id="business-aml-direct-name"
												placeholder="Business Name"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
											/>
										</Field>
									)}
								</directForm.Field>
							)}

							{mode === "link" ? (
								<linkForm.Field name="incorporationDate">
									{(field) => (
										<Field className="gap-1.5">
											<FieldLabel htmlFor="business-aml-link-incorporation-date">
												Business Incorporation Date (Optional)
											</FieldLabel>
											<KycDatePicker
												id="business-aml-link-incorporation-date"
												value={parseIncorporationDate(field.state.value)}
												onChange={(date) =>
													field.handleChange(
														date ? format(date, "yyyy-MM-dd") : "",
													)
												}
											/>
										</Field>
									)}
								</linkForm.Field>
							) : (
								<directForm.Field name="incorporationDate">
									{(field) => (
										<Field className="gap-1.5">
											<FieldLabel htmlFor="business-aml-direct-incorporation-date">
												Business Incorporation Date (Optional)
											</FieldLabel>
											<KycDatePicker
												id="business-aml-direct-incorporation-date"
												value={parseIncorporationDate(field.state.value)}
												onChange={(date) =>
													field.handleChange(
														date ? format(date, "yyyy-MM-dd") : "",
													)
												}
											/>
										</Field>
									)}
								</directForm.Field>
							)}
						</div>

						{mode === "link" && (
							<linkForm.Field name="urlLimit">
								{(field) => (
									<Field className="gap-1.5">
										<FieldLabel htmlFor="business-aml-url-limit">
											Verification URL Limit
										</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={field.handleChange}
										>
											<SelectTrigger
												id="business-aml-url-limit"
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
						)}
					</FieldGroup>

					<Accordion type="single" collapsible className="rounded-lg border px-4">
						<AccordionItem value="advanced" className="border-none">
							<AccordionTrigger className="py-4 hover:no-underline">
								<div className="flex items-center gap-3 text-left">
									<SlidersHorizontalIcon className="size-5 shrink-0 text-secondary" />
									<div>
										<p className="text-sm font-medium">Advanced Settings</p>
										<p className="text-xs font-normal text-muted-foreground">
											Filters and match score
										</p>
									</div>
								</div>
							</AccordionTrigger>
							<AccordionContent className="space-y-6 pb-4">
								<Field className="gap-3">
									<FieldLabel>Filters</FieldLabel>
									<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
										{AML_SCREENING_FILTERS.map((filter) => (
											<div key={filter.key} className="flex items-center gap-2">
												<Checkbox
													id={`business-aml-filter-${filter.key}`}
													checked={filters[filter.key]}
													onCheckedChange={(checked) =>
														toggleFilter(filter.key, checked === true)
													}
												/>
												<Label
													htmlFor={`business-aml-filter-${filter.key}`}
													className="text-sm font-normal"
												>
													{filter.label}
												</Label>
											</div>
										))}
									</div>
								</Field>

								<Field className="gap-3">
									<FieldLabel htmlFor="business-aml-match-score">
										Match Score
									</FieldLabel>
									<div className="flex items-center gap-3">
										<span className="text-sm text-muted-foreground">0</span>
										<Slider
											id="business-aml-match-score"
											value={[matchScore]}
											onValueChange={(value) => setMatchScore(value[0] ?? 0)}
											min={0}
											max={100}
											step={1}
											className="flex-1"
										/>
										<span className="min-w-8 text-sm font-medium">
											{matchScore}
										</span>
									</div>
									<FieldDescription>
										Set the matching threshold from 0 to 100. A score of 100
										applies the strictest accuracy.
									</FieldDescription>
								</Field>
							</AccordionContent>
						</AccordionItem>
					</Accordion>

					{mode === "link" ? (
						<linkForm.Field name="consent">
							{(field) => (
								<VerificationConsentCheckbox
									id="business-aml-link-consent"
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							)}
						</linkForm.Field>
					) : (
						<directForm.Field name="consent">
							{(field) => (
								<VerificationConsentCheckbox
									id="business-aml-direct-consent"
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

function ScreeningCountryField({
	id,
	value,
	onValueChange,
	countries,
	isLoading,
}: {
	id: string;
	value: string;
	onValueChange: (value: string) => void;
	countries: SupportedCountry[];
	isLoading: boolean;
}) {
	return (
		<Field className="gap-1.5">
			<FieldLabel htmlFor={id}>Screening Countries</FieldLabel>
			<Select
				value={value || undefined}
				onValueChange={onValueChange}
				disabled={isLoading}
			>
				<SelectTrigger id={id} className="w-full">
					<SelectValue
						placeholder={
							isLoading ? "Loading countries..." : "Select a country"
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
			<FieldDescription>Choose the country to screen against</FieldDescription>
		</Field>
	);
}
