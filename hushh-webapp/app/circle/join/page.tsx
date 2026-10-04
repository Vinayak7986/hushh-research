import { Suspense } from "react";
import type { Metadata } from "next";
import CircleJoinPageClient from "./page-client";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const codeParam = resolvedParams["code"];
  let code = "";
  if (Array.isArray(codeParam)) {
    code = codeParam[0] ?? "";
  } else if (typeof codeParam === "string") {
    code = codeParam;
  }

  const baseMetadata: Metadata = {
    title: "Join Circle | Hussh",
    description: "You've been invited to join a Circle on Hussh.",
    openGraph: {
      title: "Join Circle | Hussh",
      description: "You've been invited to join a Circle on Hussh.",
      images: [
        {
          url: "https://hushh.ai/images/og-share-fallback.png",
          width: 1200,
          height: 630,
          alt: "Hussh Circle Invitation",
        },
      ],
    },
  };

  if (!code) return baseMetadata;

  try {
    const backendUrl = process.env.NEXT_PUBLIC_ONE_LOCATION_API_URL || "http://localhost:8000";
    const res = await fetch(`${backendUrl.replace(/\/+$/, '')}/api/one/location/circle-codes/public-preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
      // Don't cache this heavily since circles might change names
      next: { revalidate: 60 } 
    });

    if (!res.ok) return baseMetadata;
    const data = await res.json();
    if (!data.circle) return baseMetadata;
    
    const preview = data.circle;
    return {
      title: `Join ${preview.name} | Hussh`,
      description: `You've been invited by ${preview.ownerDisplayName} to join ${preview.name}.`,
      openGraph: {
        title: `Join ${preview.name}`,
        description: `You've been invited by ${preview.ownerDisplayName} to join their private circle.`,
        images: [
          {
            url: "https://hushh.ai/images/og-share-fallback.png",
            width: 1200,
            height: 630,
            alt: `Join ${preview.name}`,
          },
        ],
      },
    };
  } catch (err) {
    return baseMetadata;
  }
}

export default async function CircleJoinPage() {
  return (
    <Suspense fallback={null}>
      <CircleJoinPageClient />
    </Suspense>
  );
}
