import { createFileRoute } from "@tanstack/react-router";

import { AuthCard } from "@/components/AuthCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bivo – Sign in" },
      { name: "description", content: "Sign in or create your Bivo account." },
      { property: "og:title", content: "Bivo – Sign in" },
      { property: "og:description", content: "Sign in or create your Bivo account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="bg-page flex min-h-screen items-center justify-center px-4 py-10">
      <AuthCard />
    </main>
  );
}
