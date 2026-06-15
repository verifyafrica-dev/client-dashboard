import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "../-components";

export const Route = createFileRoute(
	"/(auth)/_layout/dashboard/products/business-aml-screening/",
)({
	component: BusinessAmlScreeningPage,
});

function BusinessAmlScreeningPage() {
	return <ProductDetailPage slug="business-aml-screening" />;
}
