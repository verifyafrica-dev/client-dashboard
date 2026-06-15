import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "../-components";

export const Route = createFileRoute(
	"/(auth)/_layout/dashboard/products/address-verification/",
)({
	component: AddressVerificationPage,
});

function AddressVerificationPage() {
	return <ProductDetailPage slug="address-verification" />;
}
