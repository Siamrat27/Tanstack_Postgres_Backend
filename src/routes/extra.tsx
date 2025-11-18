import { createFileRoute } from "@tanstack/react-router";
import { SchedulesPage } from "@/pages/Extra";

export const Route = createFileRoute("/extra")({
  component: SchedulesPage,
});
