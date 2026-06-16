import { InfoIcon, PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	CountrySelect,
	Input,
	KycEntryCard,
	KycFormField,
	KycFormGrid,
	KycSaveButton,
	KycSectionHeader,
	Textarea,
} from "./kyc-form-primitives";

const VERIFICATION_VOLUMES = [
	"0 - 1,000",
	"1,001 - 10,000",
	"10,001 - 50,000",
	"50,001 - 100,000",
	"100,000+",
];

const CLIENT_GEOGRAPHIES = [
	"Nigeria",
	"West Africa",
	"Sub-Saharan Africa",
	"Africa",
	"Global",
];

type LicenseEntry = {
	id: string;
};

function createLicense(): LicenseEntry {
	return { id: crypto.randomUUID() };
}

export function BusinessActivityForm() {
	const [licenses, setLicenses] = useState<LicenseEntry[]>([]);

	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(event) => event.preventDefault()}
		>
			<KycSectionHeader
				title="Business Activity"
				description="Provide your business activity details."
			/>

			<KycFormField id="natureOfBusiness" label="Nature of Business" required>
				<Input
					id="natureOfBusiness"
					placeholder="Describe the nature of your business (e.g., retail, manufacturing, services)"
				/>
			</KycFormField>

			<KycFormField
				id="productsDescription"
				label="Description of Products/Services"
				required
			>
				<Textarea
					id="productsDescription"
					placeholder="Provide detailed description of your products or services"
					rows={4}
				/>
			</KycFormField>

			<KycFormGrid>
				<KycFormField
					id="verificationVolume"
					label="Expected Monthly Verification Volume"
					required
				>
					<Select>
						<SelectTrigger id="verificationVolume" className="w-full">
							<SelectValue placeholder="Select volume range" />
						</SelectTrigger>
						<SelectContent>
							{VERIFICATION_VOLUMES.map((volume) => (
								<SelectItem key={volume} value={volume}>
									{volume}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</KycFormField>
				<KycFormField
					id="clientGeographies"
					label="Main Geographies of Clients"
					required
				>
					<Select>
						<SelectTrigger id="clientGeographies" className="w-full">
							<SelectValue placeholder="Select geography" />
						</SelectTrigger>
						<SelectContent>
							{CLIENT_GEOGRAPHIES.map((geography) => (
								<SelectItem key={geography} value={geography}>
									{geography}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</KycFormField>
			</KycFormGrid>

			<section className="space-y-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h3 className="text-base font-semibold">Regulatory Licenses Held</h3>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="uppercase tracking-wide"
						onClick={() =>
							setLicenses((current) => [...current, createLicense()])
						}
					>
						<PlusIcon className="size-4" weight="bold" />
						Add License
					</Button>
				</div>

				{licenses.length === 0 ? (
					<Alert className="border-sky-200 bg-sky-50 text-sky-950">
						<InfoIcon className="size-4 text-sky-600" weight="fill" />
						<AlertTitle className="text-sky-950">
							No regulatory licenses added yet
						</AlertTitle>
						<AlertDescription className="text-sky-800">
							Click &quot;Add License&quot; to add one.
						</AlertDescription>
					</Alert>
				) : (
					licenses.map((license, index) => (
						<KycEntryCard
							key={license.id}
							title={`License ${index + 1}`}
							onRemove={() =>
								setLicenses((current) =>
									current.filter((item) => item.id !== license.id),
								)
							}
						>
							<div className="space-y-4">
								<KycFormField label="License Name" required>
									<Input placeholder="e.g., Payment Service Provider License" />
								</KycFormField>
								<KycFormGrid>
									<KycFormField label="License Number" required>
										<Input placeholder="e.g., PSP-2023-001" />
									</KycFormField>
									<KycFormField label="Country" required>
										<CountrySelect />
									</KycFormField>
								</KycFormGrid>
							</div>
						</KycEntryCard>
					))
				)}
			</section>

			<KycSaveButton />
		</form>
	);
}
