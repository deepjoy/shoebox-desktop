import { Outlet, createFileRoute } from "@tanstack/react-router";

function SettingsLayout() {
  // Reserved for future sub-navigation across settings panels.
  return <Outlet />;
}

export const Route = createFileRoute("/settings")({
  component: SettingsLayout,
});
