import {
	CameraIcon,
	EnvelopeSimpleIcon,
	EyeIcon,
	EyeSlashIcon,
	FloppyDiskIcon,
	LockIcon,
	PhoneIcon,
	ShieldCheckIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import {
	type ChangeEvent,
	type ComponentProps,
	type ComponentType,
	useId,
	useRef,
	useState,
} from "react";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";

export const Route = createFileRoute("/(auth)/_layout/dashboard/profile/")({
	component: ProfilePage,
});

const PROFILE = {
	firstName: "Adetunji",
	lastName: "Adeyinka",
	email: "support@verifyafrica.io",
	phone: "",
	avatarUrl: "",
} as const;

function IconInput({
	id,
	label,
	icon: Icon,
	type = "text",
	placeholder,
	defaultValue,
}: {
	id: string;
	label: string;
	icon: ComponentType<{ className?: string }>;
	type?: ComponentProps<"input">["type"];
	placeholder?: string;
	defaultValue?: string;
}) {
	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<div className="relative">
				<Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					id={id}
					type={type}
					placeholder={placeholder}
					defaultValue={defaultValue}
					className="pl-10"
				/>
			</div>
		</div>
	);
}

function PasswordField({
	id,
	label,
	placeholder,
}: {
	id: string;
	label: string;
	placeholder: string;
}) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<div className="relative">
				<LockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					id={id}
					type={showPassword ? "text" : "password"}
					placeholder={placeholder}
					className="pr-10 pl-10"
				/>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					onClick={() => setShowPassword((visible) => !visible)}
					aria-label={showPassword ? "Hide password" : "Show password"}
				>
					{showPassword ? (
						<EyeSlashIcon className="size-4" />
					) : (
						<EyeIcon className="size-4" />
					)}
				</Button>
			</div>
		</div>
	);
}

function UpdateProfileTab() {
	const avatarInputId = useId();
	const avatarInputRef = useRef<HTMLInputElement>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

	function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;

		const previewUrl = URL.createObjectURL(file);
		setAvatarPreview(previewUrl);
	}

	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(event) => event.preventDefault()}
		>
			<div className="flex flex-col items-center gap-3 text-center">
				<div className="relative">
					<Avatar className="size-24">
						{avatarPreview ? (
							<AvatarImage src={avatarPreview} alt="Profile avatar" />
						) : PROFILE.avatarUrl ? (
							<AvatarImage src={PROFILE.avatarUrl} alt="Profile avatar" />
						) : null}
						<AvatarFallback className="bg-muted text-muted-foreground">
							<UserIcon className="size-10" />
						</AvatarFallback>
					</Avatar>
					<Button
						type="button"
						size="icon-sm"
						className="absolute right-0 bottom-0 size-8 rounded-full"
						onClick={() => avatarInputRef.current?.click()}
					>
						<CameraIcon className="size-4" weight="fill" />
					</Button>
					<input
						ref={avatarInputRef}
						id={avatarInputId}
						type="file"
						accept="image/png,image/jpeg"
						className="sr-only"
						onChange={handleAvatarChange}
					/>
				</div>
				<div className="space-y-1">
					<p className="text-sm text-muted-foreground">
						Click the camera icon to upload a new avatar
					</p>
					<p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<IconInput
					id="firstName"
					label="First Name"
					icon={UserIcon}
					defaultValue={PROFILE.firstName}
				/>
				<IconInput
					id="lastName"
					label="Last Name"
					icon={UserIcon}
					defaultValue={PROFILE.lastName}
				/>
				<IconInput
					id="email"
					label="Email Address"
					icon={EnvelopeSimpleIcon}
					type="email"
					defaultValue={PROFILE.email}
				/>
				<IconInput
					id="phone"
					label="Phone Number"
					icon={PhoneIcon}
					type="tel"
					placeholder="Enter your phone number"
					defaultValue={PROFILE.phone}
				/>
			</div>

			<Button type="submit" className="w-full">
				<FloppyDiskIcon className="size-4" weight="fill" />
				Update Profile
			</Button>
		</form>
	);
}

function ChangePasswordTab() {
	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(event) => event.preventDefault()}
		>
			<div className="grid gap-4">
				<PasswordField
					id="currentPassword"
					label="Current Password"
					placeholder="Enter your current password"
				/>
				<PasswordField
					id="newPassword"
					label="New Password"
					placeholder="Enter your new password"
				/>
				<PasswordField
					id="confirmPassword"
					label="Confirm New Password"
					placeholder="Confirm your new password"
				/>
			</div>

			<Button type="submit" className="w-full">
				<LockIcon className="size-4" weight="fill" />
				Change Password
			</Button>
		</form>
	);
}

function ProfilePage() {
	return (
		<Card className="mx-auto w-full max-w-3xl">
			<CardHeader>
				<CardTitle className="text-xl">Profile Settings</CardTitle>
				<CardDescription>
					Manage your personal information and security
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="profile" className="flex w-full flex-col gap-6">
					<TabsList>
						<TabsTrigger value="profile">
							<UserIcon />
							Update Profile
						</TabsTrigger>
						<TabsTrigger value="password">
							<ShieldCheckIcon />
							Change Password
						</TabsTrigger>
					</TabsList>

					<TabsContent value="profile">
						<UpdateProfileTab />
					</TabsContent>
					<TabsContent value="password">
						<ChangePasswordTab />
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
