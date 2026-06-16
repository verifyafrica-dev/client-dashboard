import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	Input,
	KycFormField,
	KycFormGrid,
	KycSaveButton,
	KycSectionHeader,
} from "./kyc-form-primitives";

const POSITIONS = [
	"Chief Executive Officer (CEO)",
	"Chief Financial Officer (CFO)",
	"Chief Operating Officer (COO)",
	"Managing Director",
	"Director",
	"Company Secretary",
	"Other",
];

export function PrimaryContactForm() {
	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(event) => event.preventDefault()}
		>
			<KycSectionHeader
				title="Primary Contact"
				description="Provide your primary contact details."
			/>

			<KycFormField id="contactName" label="Name" required>
				<Input
					id="contactName"
					placeholder="Enter the primary contact's full name"
				/>
			</KycFormField>

			<KycFormField id="contactPosition" label="Position" required>
				<Select>
					<SelectTrigger id="contactPosition" className="w-full">
						<SelectValue placeholder="Select position" />
					</SelectTrigger>
					<SelectContent>
						{POSITIONS.map((position) => (
							<SelectItem key={position} value={position}>
								{position}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</KycFormField>

			<KycFormGrid>
				<KycFormField id="contactEmail" label="Email" required>
					<Input
						id="contactEmail"
						type="email"
						placeholder="Enter the primary contact's email address"
					/>
				</KycFormField>
				<KycFormField id="contactPhone" label="Phone" required>
					<Input
						id="contactPhone"
						type="tel"
						placeholder="Enter the primary contact's phone number"
					/>
				</KycFormField>
			</KycFormGrid>

			<KycSaveButton />
		</form>
	);
}
