import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "#/components/ui/alert-dialog";

export type DeleteUserDialogTarget = {
	id: string;
	email: string;
	name?: string;
};

type DeleteUserDialogProps = {
	target: DeleteUserDialogTarget | null;
	type: "invitation" | "user";
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm?: (target: DeleteUserDialogTarget) => void;
};

export function DeleteUserDialog({
	target,
	type,
	open,
	onOpenChange,
	onConfirm,
}: DeleteUserDialogProps) {
	if (!target) {
		return null;
	}

	const isInvitation = type === "invitation";
	const displayName = target.name ?? target.email;

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{isInvitation ? "Delete invitation?" : "Delete user?"}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{isInvitation ? (
							<>
								This will permanently remove the invitation sent to{" "}
								<span className="font-medium text-foreground">
									{target.email}
								</span>
								. This action cannot be undone.
							</>
						) : (
							<>
								This will permanently remove{" "}
								<span className="font-medium text-foreground">
									{displayName}
								</span>{" "}
								from your team. This action cannot be undone.
							</>
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={() => onConfirm?.(target)}
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
