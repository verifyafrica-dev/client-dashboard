import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "../-components";

export const Route = createFileRoute("/(auth)/_layout/products/aml-screening/")({
	component: AmlScreeningPage,
});

function AmlScreeningPage() {
	return <ProductDetailPage slug="aml-screening" />;
}
