import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "../-components";

export const Route = createFileRoute(
	"/(auth)/_layout/products/facial-screening/",
)({
	component: FacialScreeningPage,
});

function FacialScreeningPage() {
	return <ProductDetailPage slug="facial-screening" />;
}
