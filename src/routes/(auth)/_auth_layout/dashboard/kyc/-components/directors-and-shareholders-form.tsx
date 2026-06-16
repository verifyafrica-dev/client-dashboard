import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	CountrySelect,
	Input,
	KycDatePicker,
	KycEntryCard,
	KycFormField,
	KycFormGrid,
	KycSaveButton,
	KycSectionHeader,
	Textarea,
} from "./kyc-form-primitives";

type DirectorEntry = {
	id: string;
	dateOfBirth?: Date;
};

type UboEntry = {
	id: string;
};

function createEntry<T extends object>(): T {
	return { id: crypto.randomUUID() } as T;
}

function DirectorFields({
	entry,
	onDateChange,
}: {
	entry: DirectorEntry;
	onDateChange: (date: Date | undefined) => void;
}) {
	return (
		<div className="space-y-4">
			<KycFormField label="Full Name" required>
				<Input placeholder="Enter director's full name" />
			</KycFormField>
			<KycFormGrid>
				<KycFormField label="Date of Birth" required>
					<KycDatePicker value={entry.dateOfBirth} onChange={onDateChange} />
				</KycFormField>
				<KycFormField label="Nationality" required>
					<CountrySelect placeholder="Select nationality" />
				</KycFormField>
			</KycFormGrid>
			<KycFormField label="Address" required>
				<Textarea
					placeholder="Enter the complete address including street and city"
					rows={3}
				/>
			</KycFormField>
			<KycFormGrid>
				<KycFormField label="Postal Code" required>
					<Input placeholder="Enter postal code" />
				</KycFormField>
				<KycFormField label="Country" required>
					<CountrySelect />
				</KycFormField>
			</KycFormGrid>
			<KycFormField label="ID Number" required>
				<Input placeholder="Enter government-issued ID number" />
			</KycFormField>
		</div>
	);
}

function UboFields() {
	return (
		<div className="space-y-4">
			<KycFormField label="Full Name" required>
				<Input placeholder="Enter UBO's full name" />
			</KycFormField>
			<KycFormGrid>
				<KycFormField label="Ownership Percentage" required>
					<Input type="number" min={0} max={100} defaultValue={0} />
				</KycFormField>
				<KycFormField label="ID Number" required>
					<Input placeholder="Enter government-issued ID number" />
				</KycFormField>
			</KycFormGrid>
		</div>
	);
}

export function DirectorsAndShareholdersForm() {
	const [directors, setDirectors] = useState<DirectorEntry[]>([createEntry()]);
	const [ubos, setUbos] = useState<UboEntry[]>([createEntry()]);

	return (
		<form
			className="flex flex-col gap-8"
			onSubmit={(event) => event.preventDefault()}
		>
			<KycSectionHeader
				title="Directors and Shareholders"
				description="Provide your directors and shareholders details."
			/>

			<section className="space-y-4">
				<h3 className="text-base font-semibold">Directors</h3>
				{directors.map((director, index) => (
					<KycEntryCard
						key={director.id}
						title={`Director ${index + 1}`}
						onRemove={
							directors.length > 1
								? () =>
										setDirectors((current) =>
											current.filter((item) => item.id !== director.id),
										)
								: undefined
						}
					>
						<DirectorFields
							entry={director}
							onDateChange={(date) =>
								setDirectors((current) =>
									current.map((item) =>
										item.id === director.id
											? { ...item, dateOfBirth: date }
											: item,
									),
								)
							}
						/>
					</KycEntryCard>
				))}
				<Button
					type="button"
					variant="outline"
					className="uppercase tracking-wide"
					onClick={() => setDirectors((current) => [...current, createEntry()])}
				>
					<PlusIcon className="size-4" weight="bold" />
					Add Another Director
				</Button>
			</section>

			<section className="space-y-4">
				<h3 className="text-base font-semibold">
					Ultimate Beneficial Owners (UBOs)
				</h3>
				{ubos.map((ubo, index) => (
					<KycEntryCard
						key={ubo.id}
						title={`UBO ${index + 1}`}
						onRemove={
							ubos.length > 1
								? () =>
										setUbos((current) =>
											current.filter((item) => item.id !== ubo.id),
										)
								: undefined
						}
					>
						<UboFields />
					</KycEntryCard>
				))}
				<Button
					type="button"
					variant="outline"
					className="uppercase tracking-wide"
					onClick={() => setUbos((current) => [...current, createEntry()])}
				>
					<PlusIcon className="size-4" weight="bold" />
					Add Another UBO
				</Button>
			</section>

			<KycSaveButton />
		</form>
	);
}
