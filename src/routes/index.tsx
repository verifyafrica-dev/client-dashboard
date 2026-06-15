import { createFileRoute } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<div className="p-8">
			<Button className="bg-teal-500 text-white">Click me</Button>
		</div>
	);
}
