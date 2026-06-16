import { useState } from "react";
import {
	CountrySelect,
	Input,
	KycDatePicker,
	KycFormField,
	KycFormGrid,
	KycFormSeparator,
	KycSaveButton,
	KycSectionHeader,
	Textarea,
} from "./kyc-form-primitives";

export function BasicInformationForm() {
	const [incorporationDate, setIncorporationDate] = useState<Date>();

	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(event) => event.preventDefault()}
		>
			<KycSectionHeader
				title="Basic Information"
				description="Provide your basic information to get started."
			/>

			<KycFormGrid>
				<KycFormField id="legalName" label="Legal Name" required>
					<Input
						id="legalName"
						placeholder="Enter the official legal name of the company"
					/>
				</KycFormField>
				<KycFormField id="tradingName" label="Trading Name">
					<Input
						id="tradingName"
						placeholder="Enter trading or doing business as name"
					/>
				</KycFormField>
			</KycFormGrid>

			<KycFormGrid>
				<KycFormField
					id="countryOfIncorporation"
					label="Country of Incorporation"
					required
				>
					<CountrySelect id="countryOfIncorporation" />
				</KycFormField>
				<KycFormField
					id="registrationNumber"
					label="Registration Number"
					required
				>
					<Input
						id="registrationNumber"
						placeholder="Enter company registration number"
					/>
				</KycFormField>
			</KycFormGrid>

			<KycFormGrid>
				<KycFormField
					id="dateOfIncorporation"
					label="Date of Incorporation"
					required
				>
					<KycDatePicker
						id="dateOfIncorporation"
						value={incorporationDate}
						onChange={setIncorporationDate}
					/>
				</KycFormField>
				<KycFormField id="website" label="Website">
					<Input id="website" placeholder="https://example.com" type="url" />
				</KycFormField>
			</KycFormGrid>

			<KycFormSeparator />

			<KycFormField id="registeredAddress" label="Registered Address" required>
				<Textarea
					id="registeredAddress"
					placeholder="Enter the complete registered address including street and city"
					rows={3}
				/>
			</KycFormField>

			<KycFormGrid>
				<KycFormField id="registeredPostalCode" label="Postal Code" required>
					<Input id="registeredPostalCode" placeholder="Enter postal code" />
				</KycFormField>
				<KycFormField id="registeredCountry" label="Country" required>
					<CountrySelect id="registeredCountry" />
				</KycFormField>
			</KycFormGrid>

			<KycFormSeparator />

			<KycFormField id="businessAddress" label="Business Address">
				<Textarea
					id="businessAddress"
					placeholder="Enter the complete business address including street and city"
					rows={3}
				/>
			</KycFormField>

			<KycFormGrid>
				<KycFormField id="businessPostalCode" label="Postal Code">
					<Input id="businessPostalCode" placeholder="Enter postal code" />
				</KycFormField>
				<KycFormField id="businessCountry" label="Country">
					<CountrySelect id="businessCountry" />
				</KycFormField>
			</KycFormGrid>

			<KycFormField id="taxId" label="Tax ID / VAT Number">
				<Input
					id="taxId"
					placeholder="Enter tax identification or VAT number"
				/>
			</KycFormField>

			<KycSaveButton />
		</form>
	);
}
