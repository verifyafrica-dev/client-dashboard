import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(unguarded)/_unguarded_layout")({
	component: GuestLayout,
});

function GuestLayout() {
	return (
		<div className="min-h-screen bg-[#eef2f6]">
			<Outlet />
		</div>
	);
}
