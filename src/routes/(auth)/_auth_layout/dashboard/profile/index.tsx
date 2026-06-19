import {
	EnvelopeSimpleIcon,
	EyeIcon,
	EyeSlashIcon,
	FloppyDiskIcon,
	LockIcon,
	ShieldCheckIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
	useMeQuery,
	useUpdateMeMutation,
	useUserChangePasswordMutation,
} from "#/api/http/v1/users/users.hooks";
import type { UserDetail } from "#/api/http/v1/users/users.types";
import {
	type UserChangePasswordErrorResponse,
	UserChangePasswordFormSchema,
	type UserChangePasswordFormValues,
	UserProfileUpdateFormSchema,
	type UserProfileUpdateFormValues,
} from "#/api/http/v1/users/users.types";
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
import { Skeleton } from "#/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { PhoneInput } from "#/components/ui-extended/phone-input";
import { getUserChangePasswordFieldError } from "#/lib/api-errors";
import { cn } from "#/lib/utils.ts";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { getProfileInitials } from "./-data";
import { BillingInformationSection } from "./-components/billing-information-section";

export const Route = createFileRoute("/(auth)/_auth_layout/dashboard/profile/")(
	{
		component: ProfilePage,
	},
);

function ProfilePage() {
	const meQuery = useMeQuery();
	const user = meQuery.data;
	const isLoading = meQuery.isPending || meQuery.isFetching;

	if (meQuery.isError) {
		return (
			<Card className="mx-auto w-full max-w-3xl">
				<CardContent className="py-10 text-center text-sm text-muted-foreground">
					Failed to load profile. Please try again.
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="mx-auto w-full max-w-3xl">
			<CardHeader>
				<CardTitle className="text-xl font-semibold">
					Profile Settings
				</CardTitle>
				<CardDescription>
					Manage your personal information and security
				</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading || !user ? (
					<ProfilePageSkeleton />
				) : (
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
							<UpdateProfileTab
								key={user.id}
								user={user}
								tenantId={user.tenants[0]?.id}
							/>
						</TabsContent>
						<TabsContent value="password">
							<ChangePasswordTab />
						</TabsContent>
					</Tabs>
				)}
			</CardContent>
		</Card>
	);
}

function UpdateProfileTab({
	user,
	tenantId,
}: {
	user: UserDetail;
	tenantId?: string;
}) {
	const updateMeMutation = useUpdateMeMutation();

	const form = useForm({
		defaultValues: {
			first_name: user.first_name ?? "",
			last_name: user.last_name ?? "",
			phone_number: user.phone_number ?? "",
		} satisfies UserProfileUpdateFormValues,
		validators: {
			onSubmit: UserProfileUpdateFormSchema,
		},
		onSubmit: async ({ value }) => {
			await updateMeMutation.mutateAsync(
				{
					first_name: value.first_name,
					last_name: value.last_name,
					phone_number: value.phone_number || undefined,
				},
				{
					onSuccess: () => {
						toast.success("Profile updated successfully");
					},
					onError: () => {
						toast.error("Failed to update profile. Please try again.");
					},
				},
			);
		},
	});

	useEffect(() => {
		form.reset({
			first_name: user.first_name ?? "",
			last_name: user.last_name ?? "",
			phone_number: user.phone_number ?? "",
		});
	}, [form, user.first_name, user.last_name, user.phone_number]);

	const isSubmitting = updateMeMutation.isPending;

	return (
		<div className="flex flex-col gap-8">
			<form
				className="flex flex-col gap-6"
				onSubmit={(event) => {
					event.preventDefault();
					form.handleSubmit();
				}}
			>
			<div className="flex flex-col items-center gap-2 text-center">
				<Avatar className="size-24">
					{user.avatar_url ? (
						<AvatarImage src={user.avatar_url} alt="Profile avatar" />
					) : null}
					<AvatarFallback className="bg-muted text-lg text-muted-foreground">
						{getProfileInitials(user.first_name, user.last_name)}
					</AvatarFallback>
				</Avatar>
				<p className="text-sm text-muted-foreground">
					Your profile photo is shown across the dashboard
				</p>
			</div>

			<FieldGroup className="grid gap-4 sm:grid-cols-2">
				<form.Field name="first_name">
					{(field) => (
						<Field
							className="flex flex-col gap-2"
							data-invalid={field.state.meta.errors.length > 0}
						>
							<FieldLabel htmlFor="first-name">First Name</FieldLabel>
							<div className="relative">
								<UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id="first-name"
									placeholder="Enter your first name"
									className="pl-10"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									aria-invalid={field.state.meta.errors.length > 0}
								/>
							</div>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>

				<form.Field name="last_name">
					{(field) => (
						<Field
							className="flex flex-col gap-2"
							data-invalid={field.state.meta.errors.length > 0}
						>
							<FieldLabel htmlFor="last-name">Last Name</FieldLabel>
							<div className="relative">
								<UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id="last-name"
									placeholder="Enter your last name"
									className="pl-10"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									aria-invalid={field.state.meta.errors.length > 0}
								/>
							</div>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>

				<Field className="flex flex-col gap-2">
					<FieldLabel htmlFor="email">Email Address</FieldLabel>
					<div className="relative">
						<EnvelopeSimpleIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id="email"
							type="email"
							value={user.email}
							disabled
							className="pl-10"
						/>
					</div>
				</Field>

				<form.Field name="phone_number">
					{(field) => (
						<Field
							className="flex flex-col gap-2"
							data-invalid={field.state.meta.errors.length > 0}
						>
							<FieldLabel htmlFor="phone">Phone Number</FieldLabel>
							<PhoneInput
								id="phone"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={field.handleChange}
							/>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>
			</FieldGroup>

			<Button type="submit" className="w-full" disabled={isSubmitting}>
				<FloppyDiskIcon
					className={cn("size-4", isSubmitting && "animate-pulse")}
					weight="fill"
				/>
				{isSubmitting ? "Updating Profile..." : "Update Profile"}
			</Button>
			</form>

			<BillingInformationSection tenantId={tenantId} />
		</div>
	);
}

function ChangePasswordTab() {
	const changePasswordMutation = useUserChangePasswordMutation();
	const [formError, setFormError] =
		useState<UserChangePasswordErrorResponse | null>(null);
	const [showOldPassword, setShowOldPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const form = useForm({
		defaultValues: {
			old_password: "",
			new_password: "",
			confirm_password: "",
		} satisfies UserChangePasswordFormValues,
		validators: {
			onSubmit: UserChangePasswordFormSchema,
		},
		onSubmit: async ({ value }) => {
			setFormError(null);

			await changePasswordMutation.mutateAsync(
				{
					old_password: value.old_password,
					new_password: value.new_password,
				},
				{
					onSuccess: () => {
						toast.success("Password changed successfully");
						form.reset();
						setShowOldPassword(false);
						setShowNewPassword(false);
						setShowConfirmPassword(false);
					},
					onError: (error) => {
						setFormError(error as UserChangePasswordErrorResponse);
						toast.error("Failed to change password. Please try again.");
					},
				},
			);
		},
	});

	const isSubmitting = changePasswordMutation.isPending;

	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
		>
			<FieldGroup className="grid gap-4">
				<form.Field name="old_password">
					{(field) => {
						const errors = [
							...field.state.meta.errors,
							...getUserChangePasswordFieldError(formError, "old_password"),
						];

						return (
							<Field
								className="flex flex-col gap-2"
								data-invalid={errors.length > 0}
							>
								<FieldLabel htmlFor="old-password">Current Password</FieldLabel>
								<div className="relative">
									<LockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										id="old-password"
										type={showOldPassword ? "text" : "password"}
										placeholder="Enter your current password"
										autoComplete="current-password"
										className="pr-10 pl-10"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) =>
											field.handleChange(event.target.value)
										}
										aria-invalid={errors.length > 0}
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										onClick={() => setShowOldPassword((visible) => !visible)}
										aria-label={
											showOldPassword ? "Hide password" : "Show password"
										}
									>
										{showOldPassword ? (
											<EyeSlashIcon className="size-4" />
										) : (
											<EyeIcon className="size-4" />
										)}
									</Button>
								</div>
								<FieldError errors={errors} />
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="new_password">
					{(field) => {
						const errors = [
							...field.state.meta.errors,
							...getUserChangePasswordFieldError(formError, "new_password"),
						];

						return (
							<Field
								className="flex flex-col gap-2"
								data-invalid={errors.length > 0}
							>
								<FieldLabel htmlFor="new-password">New Password</FieldLabel>
								<div className="relative">
									<LockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										id="new-password"
										type={showNewPassword ? "text" : "password"}
										placeholder="Enter your new password"
										autoComplete="new-password"
										className="pr-10 pl-10"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) =>
											field.handleChange(event.target.value)
										}
										aria-invalid={errors.length > 0}
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										onClick={() => setShowNewPassword((visible) => !visible)}
										aria-label={
											showNewPassword ? "Hide password" : "Show password"
										}
									>
										{showNewPassword ? (
											<EyeSlashIcon className="size-4" />
										) : (
											<EyeIcon className="size-4" />
										)}
									</Button>
								</div>
								<FieldError errors={errors} />
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="confirm_password">
					{(field) => (
						<Field
							className="flex flex-col gap-2"
							data-invalid={field.state.meta.errors.length > 0}
						>
							<FieldLabel htmlFor="confirm-password">
								Confirm New Password
							</FieldLabel>
							<div className="relative">
								<LockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id="confirm-password"
									type={showConfirmPassword ? "text" : "password"}
									placeholder="Confirm your new password"
									autoComplete="new-password"
									className="pr-10 pl-10"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									aria-invalid={field.state.meta.errors.length > 0}
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
									onClick={() => setShowConfirmPassword((visible) => !visible)}
									aria-label={
										showConfirmPassword ? "Hide password" : "Show password"
									}
								>
									{showConfirmPassword ? (
										<EyeSlashIcon className="size-4" />
									) : (
										<EyeIcon className="size-4" />
									)}
								</Button>
							</div>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>
			</FieldGroup>

			<Button type="submit" className="w-full" disabled={isSubmitting}>
				<LockIcon
					className={cn("size-4", isSubmitting && "animate-pulse")}
					weight="fill"
				/>
				{isSubmitting ? "Changing Password..." : "Change Password"}
			</Button>
		</form>
	);
}

function ProfilePageSkeleton() {
	return (
		<>
			<div className="flex flex-col gap-2">
				<Skeleton className="h-7 w-40" />
				<Skeleton className="h-4 w-64" />
			</div>
			<Skeleton className="h-10 w-full max-w-md" />
			<div className="flex flex-col items-center gap-2">
				<Skeleton className="size-24 rounded-full" />
				<Skeleton className="h-4 w-56" />
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				{["first", "last", "email", "phone"].map((field) => (
					<div key={field} className="flex flex-col gap-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
				))}
			</div>
			<Skeleton className="h-10 w-full" />
		</>
	);
}
