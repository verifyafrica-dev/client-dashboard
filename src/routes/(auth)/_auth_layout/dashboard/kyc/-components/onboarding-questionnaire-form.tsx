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

const TARGET_CLIENTS = [
	"Individuals",
	"SMEs (Small and Medium Enterprises)",
	"Corporates",
	"High-risk Sectors",
];

export function OnboardingQuestionnaireForm() {
	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(event) => event.preventDefault()}
		>
			<KycSectionHeader
				title="Onboarding Questionnaire"
				description="Answer the onboarding questionnaire to get started."
			/>

			<KycFormField id="targetClients" label="Target Clients" required>
				<Select defaultValue="Individuals">
					<SelectTrigger id="targetClients" className="w-full">
						<SelectValue placeholder="Select target clients" />
					</SelectTrigger>
					<SelectContent>
						{TARGET_CLIENTS.map((client) => (
							<SelectItem key={client} value={client}>
								{client}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</KycFormField>

			<div className="space-y-4">
				<p className="text-sm font-semibold">
					AML/CTF Officer <span className="text-destructive">*</span>
				</p>
				<KycFormGrid>
					<KycFormField id="amlOfficerName" label="Name" required>
						<Input
							id="amlOfficerName"
							placeholder="Enter AML/CTF Officer's name"
						/>
					</KycFormField>
					<KycFormField id="amlOfficerEmail" label="Email" required>
						<Input
							id="amlOfficerEmail"
							type="email"
							placeholder="Enter AML/CTF Officer's email"
						/>
					</KycFormField>
				</KycFormGrid>
			</div>

			<KycSaveButton />
		</form>
	);
}
