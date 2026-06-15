import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "../-components";

export const Route = createFileRoute(
	"/(auth)/_layout/products/risk-assessment/",
)({
	component: RiskAssessmentPage,
});

function RiskAssessmentPage() {
	return <ProductDetailPage slug="risk-assessment" />;
}
