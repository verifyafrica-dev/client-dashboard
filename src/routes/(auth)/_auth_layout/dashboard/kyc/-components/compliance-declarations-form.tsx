import { Checkbox } from "#/components/ui/checkbox";
import { Label } from "#/components/ui/label";
import { KycSaveButton, KycSectionHeader } from "./kyc-form-primitives";

const DECLARATIONS = [
	"We are not engaged in any prohibited activities as defined by applicable laws and regulations",
	"None of our directors, officers, or UBOs are listed on any sanctions lists",
	"All information provided is true, complete, and accurate to the best of our knowledge",
	"We agree to provide all supporting documents as requested during the onboarding process",
];

export function ComplianceDeclarationsForm() {
	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(event) => event.preventDefault()}
		>
			<KycSectionHeader
				title="Compliance Declarations"
				description="Please confirm the following declarations by checking the boxes below:"
			/>

			<div className="space-y-5">
				{DECLARATIONS.map((declaration, index) => (
					<div key={declaration} className="flex items-start gap-3">
						<Checkbox id={`declaration-${index}`} required />
						<Label
							htmlFor={`declaration-${index}`}
							className="text-sm leading-relaxed font-normal"
						>
							{declaration}
							<span className="text-destructive"> *</span>
						</Label>
					</div>
				))}
			</div>

			<KycSaveButton />
		</form>
	);
}
