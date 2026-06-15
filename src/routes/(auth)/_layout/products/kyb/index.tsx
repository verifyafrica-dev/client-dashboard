import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "../-components";

export const Route = createFileRoute("/(auth)/_layout/products/kyb/")({
	component: KybPage,
});

function KybPage() {
	return <ProductDetailPage slug="kyb" />;
}
