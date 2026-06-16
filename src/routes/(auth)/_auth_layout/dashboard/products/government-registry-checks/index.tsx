import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "../-components";

export const Route = createFileRoute(
	"/(auth)/_auth_layout/dashboard/products/government-registry-checks/",
)({
	component: GovernmentRegistryChecksPage,
});

function GovernmentRegistryChecksPage() {
	return <ProductDetailPage slug="government-registry-checks" />;
}
