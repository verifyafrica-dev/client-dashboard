import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "../-components";

export const Route = createFileRoute(
	"/(auth)/_auth_layout/dashboard/products/document-verification/",
)({
	component: DocumentVerificationPage,
});

function DocumentVerificationPage() {
	return <ProductDetailPage slug="document-verification" />;
}
