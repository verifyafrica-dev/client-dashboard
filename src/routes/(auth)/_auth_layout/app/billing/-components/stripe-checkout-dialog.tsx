import {
	EmbeddedCheckout,
	EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { XIcon } from "@phosphor-icons/react";
import type { ComponentProps } from "react";

import { env } from "#/config/env";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Skeleton } from "#/components/ui/skeleton";

const stripePromise = env.stripePublishableKey
	? loadStripe(env.stripePublishableKey)
	: null;

type StripeCheckoutDialogProps = ComponentProps<typeof Dialog> & {
	clientSecret: string | null;
	onCloseCheckout?: () => void;
};

export function StripeCheckoutDialog({
	open,
	onOpenChange,
	clientSecret,
	onCloseCheckout,
}: StripeCheckoutDialogProps) {
	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			onCloseCheckout?.();
		}

		onOpenChange?.(nextOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
				<DialogHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
					<DialogTitle>Complete Payment</DialogTitle>
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						className="cursor-pointer"
						onClick={() => handleOpenChange(false)}
						aria-label="Close payment window"
					>
						<XIcon className="size-4" />
					</Button>
				</DialogHeader>

				<div className="min-h-[420px] overflow-y-auto p-4">
					{!clientSecret || !stripePromise ? (
						<div className="flex min-h-[420px] items-center justify-center">
							{!env.stripePublishableKey ? (
								<p className="text-sm text-muted-foreground">
									Stripe is not configured. Set VITE_STRIPE_PUBLISHABLE_KEY.
								</p>
							) : (
								<Skeleton className="h-80 w-full rounded-lg" />
							)}
						</div>
					) : (
						<EmbeddedCheckoutProvider
							stripe={stripePromise}
							options={{ clientSecret }}
						>
							<EmbeddedCheckout />
						</EmbeddedCheckoutProvider>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
