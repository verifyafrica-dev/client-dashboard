import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "../-components";

export const Route = createFileRoute(
	"/(auth)/_layout/dashboard/products/crypto-wallet-screening/",
)({
	component: CryptoWalletScreeningPage,
});

function CryptoWalletScreeningPage() {
	return <ProductDetailPage slug="crypto-wallet-screening" />;
}
