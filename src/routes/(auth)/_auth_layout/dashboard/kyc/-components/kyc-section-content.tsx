import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import type { KycSection } from "../-data";

export function KycSectionContent({ section }: { section: KycSection }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{section.title}</CardTitle>
				<CardDescription>{section.description}</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground">
					Section form for {section.title} is coming soon.
				</p>
			</CardContent>
		</Card>
	);
}
