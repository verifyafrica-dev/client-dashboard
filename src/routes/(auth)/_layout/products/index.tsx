import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { PRODUCTS } from "./-data";

export const Route = createFileRoute("/(auth)/_layout/products/")({
	component: ProductsPage,
});

function ProductsPage() {
	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Products</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Explore our suite of verification and compliance products.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{PRODUCTS.map((product) => {
					const Icon = product.icon;

					return (
						<Card key={product.slug} className="h-full">
							<CardContent className="flex h-full flex-col gap-4">
								<div className="flex size-12 items-center justify-center rounded-md bg-secondary/10 text-secondary">
									<Icon className="size-6" weight={product.iconWeight} />
								</div>
								<div className="flex flex-1 flex-col gap-2">
									<h2 className="font-semibold text-base">{product.title}</h2>
									<p className="text-sm text-muted-foreground">
										{product.description}
									</p>
								</div>
								<Button variant="outline" className="w-full" asChild>
									<Link to={`/products/${product.slug}`}>Get Started</Link>
								</Button>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
