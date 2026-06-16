import { EyeIcon, EyeSlashIcon, LockIcon } from "@phosphor-icons/react";
import { type ComponentProps, type ComponentType, type ReactNode, useState } from "react";
import { Card, CardContent } from "#/components/ui/card";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { cn } from "#/lib/utils.ts";

export function AuthPageShell({
	title,
	subtitle,
	children,
	footer,
	className,
}: {
	title: string;
	subtitle: string;
	children: ReactNode;
	footer?: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex min-h-screen flex-col items-center justify-center px-4 py-12",
				className,
			)}
		>
			<div className="mb-8 w-full max-w-md text-center">
				<h1 className="text-3xl font-semibold tracking-tight text-foreground">
					{title}
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
			</div>
			<Card className="w-full max-w-md shadow-lg">
				<CardContent className="flex flex-col gap-6 pt-6">{children}</CardContent>
			</Card>
			{footer}
		</div>
	);
}

export function AuthCard({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex min-h-screen flex-col items-center justify-center px-4 py-12",
				className,
			)}
		>
			<Card className="w-full max-w-md shadow-lg">
				<CardContent className="flex flex-col gap-6 pt-6">{children}</CardContent>
			</Card>
		</div>
	);
}

export function IconField({
	id,
	label,
	icon: Icon,
	type = "text",
	placeholder,
	className,
	...props
}: {
	id: string;
	label: string;
	icon: ComponentType<{ className?: string }>;
	placeholder?: string;
	className?: string;
} & Omit<ComponentProps<"input">, "id" | "type" | "placeholder" | "className">) {
	return (
		<div className={cn("space-y-2", className)}>
			<Label htmlFor={id}>{label}</Label>
			<div className="relative">
				<Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					id={id}
					type={type}
					placeholder={placeholder}
					className="pl-10"
					{...props}
				/>
			</div>
		</div>
	);
}

export function PasswordField({
	id,
	label,
	placeholder = "Enter your password",
	value,
	onChange,
}: {
	id: string;
	label: string;
	placeholder?: string;
	value?: string;
	onChange?: (value: string) => void;
}) {
	const [visible, setVisible] = useState(false);

	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<div className="relative">
				<LockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					id={id}
					type={visible ? "text" : "password"}
					placeholder={placeholder}
					className="pr-10 pl-10"
					value={value}
					onChange={
						onChange ? (event) => onChange(event.target.value) : undefined
					}
				/>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
					onClick={() => setVisible((current) => !current)}
					aria-label={visible ? "Hide password" : "Show password"}
				>
					{visible ? (
						<EyeSlashIcon className="size-4" />
					) : (
						<EyeIcon className="size-4" />
					)}
				</Button>
			</div>
		</div>
	);
}
