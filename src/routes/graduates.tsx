import { createFileRoute } from "@tanstack/react-router";
import { GraduatesPage } from "@/pages/Graduates";

export const Route = createFileRoute("/graduates")({
  component: GraduatesPage,
});
