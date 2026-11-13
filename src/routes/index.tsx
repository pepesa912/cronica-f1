import { createFileRoute } from "@tanstack/react-router";
import { CronicaApp } from "@/components/f1/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <CronicaApp />;
}
