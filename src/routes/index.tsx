import { createFileRoute } from "@tanstack/react-router";

const colors = [
	"#f0fdfa",
	"#ccfbf1",
	"#99f6e4",
	"#5eead4",
	"#2dd4bf",
	"#14b8a6",
	"#0d9488",
	"#0f766e",
	"#115e59",
	"#134e4a",
];

const brandColors = [
	"#f3fbfa",
	"#e6f6f4",
	"#ceeee9",
	"#9ddcd3",
	"#53c2b3",
	"#09a892",
	"#088f7c",
	"#067666",
	"#055c50",
	"#04433a",
];

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<div className="p-8 flex flex-col gap-[12px]">
			<div className="flex gap-[12px]">
				{colors.map((color) => (
					<div
						key={color}
						className="h-16 w-16 rounded-md"
						style={{ backgroundColor: color }}
					/>
				))}
			</div>
			<div className="flex gap-[12px]">
				{brandColors.map((color) => (
					<div
						key={color}
						className="h-16 w-16 rounded-md"
						style={{ backgroundColor: color }}
					/>
				))}
			</div>
		</div>
	);
}
