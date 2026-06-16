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
import type { UserInvitation } from "../-data";

type DeleteInvitationDialogProps = {
	invitation: UserInvitation | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm?: (invitation: UserInvitation) => void;
};

export function DeleteInvitationDialog({
	invitation,
	open,
	onOpenChange,
	onConfirm,
}: DeleteInvitationDialogProps) {
	if (!invitation) {
		return null;
	}

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete invitation?</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently remove the invitation sent to{" "}
						<span className="font-medium text-foreground">
							{invitation.email}
						</span>
						. This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={() => onConfirm?.(invitation)}
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
