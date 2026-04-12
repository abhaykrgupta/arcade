import { LimsApiResponse } from "@/types/lims";

export async function fetchYearBaseData(): Promise<LimsApiResponse | null> {
  const apiKey = process.env.LIMS_API_KEY;

  if (!apiKey) {
    console.error("Missing LIMS_API_KEY environment variable. Have you set it in .env.local?");
    return null;
  }

  try {
    const res = await fetch("https://developer-lims.taggnx.com/wp-json/lims/v1/year-base", {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      // The API payload is ~11.5MB, which exceeds Next.js's 2MB default fetch cache.
      // We must tell Next.js not to attempt caching this fetch request.
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`API Error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data: LimsApiResponse = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch Year Base data:", error);
    return null;
  }
}
