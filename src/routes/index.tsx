import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "#/routes/(unguarded)/_unguarded_layout/login";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return <LoginPage />;
}
