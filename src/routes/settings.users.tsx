import { createFileRoute } from "@tanstack/react-router";
import { SettingsUsersPage } from "@/pages/SettingsUsers";

export const Route = createFileRoute("/settings/users")({
  component: SettingsUsersPage,
});
