import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	Input,
	KycDatePicker,
	KycFileUpload,
	KycFormField,
	KycSaveButton,
	KycSectionHeader,
} from "./kyc-form-primitives";

const SIGNATURE_METHODS = ["Type Signature", "Upload Signature"] as const;

export function AuthorizedSignatureForm() {
	const [signatureDate, setSignatureDate] = useState<Date>(new Date());
	const [signatureMethod, setSignatureMethod] =
		useState<(typeof SIGNATURE_METHODS)[number]>("Type Signature");
	const [signatureFiles, setSignatureFiles] = useState<File[]>([]);

	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(event) => event.preventDefault()}
		>
			<KycSectionHeader
				title="Authorized Signature"
				description="Provide your authorized signature."
			/>

			<KycFormField id="signatoryName" label="Full Name" required>
				<Input
					id="signatoryName"
					placeholder="Enter the full name of the authorized signatory"
				/>
			</KycFormField>

			<KycFormField id="signatoryPosition" label="Position Title" required>
				<Input
					id="signatoryPosition"
					placeholder="Enter the position title of the authorized signatory"
				/>
			</KycFormField>

			<KycFormField id="signatureDate" label="Date" required>
				<KycDatePicker
					id="signatureDate"
					value={signatureDate}
					onChange={(date) => date && setSignatureDate(date)}
				/>
			</KycFormField>

			<KycFormField id="signatureMethod" label="Signature Method" required>
				<Select
					value={signatureMethod}
					onValueChange={(value) =>
						setSignatureMethod(value as (typeof SIGNATURE_METHODS)[number])
					}
				>
					<SelectTrigger id="signatureMethod" className="w-full">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{SIGNATURE_METHODS.map((method) => (
							<SelectItem key={method} value={method}>
								{method}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</KycFormField>

			<KycFormField
				label="Signature"
				required
				description="Please provide your signature using the selected method"
			>
				{signatureMethod === "Type Signature" ? (
					<Input
						placeholder="Type your signature (e.g., John Smith)"
						className="font-[family-name:var(--font-signature,cursive)] text-lg italic"
					/>
				) : (
					<KycFileUpload
						value={signatureFiles}
						onValueChange={setSignatureFiles}
						accept="image/*,.pdf"
						multiple={false}
					/>
				)}
			</KycFormField>

			<KycSaveButton />
		</form>
	);
}
