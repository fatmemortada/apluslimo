import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://chauffeuros.ca";

  // Static page routes
  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 1.0 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/bookings`, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 0.9 },
    { url: `${baseUrl}/dispatch`, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 0.8 },
    { url: `${baseUrl}/drivers`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${baseUrl}/fleet`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${baseUrl}/vehicles`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${baseUrl}/maintenance`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${baseUrl}/customers`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${baseUrl}/corporate`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${baseUrl}/calendar`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.5 },
    { url: `${baseUrl}/quotes`, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 0.7 },
    { url: `${baseUrl}/invoices`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${baseUrl}/revenue`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${baseUrl}/reports`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.5 },
    { url: `${baseUrl}/analytics`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.5 },
    { url: `${baseUrl}/email`, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 0.8 },
    { url: `${baseUrl}/notifications`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.4 },
    { url: `${baseUrl}/documents`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.5 },
    { url: `${baseUrl}/ai-assistant`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.4 },
    { url: `${baseUrl}/settings`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/portal`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${baseUrl}/portal/book`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${baseUrl}/portal/rides`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${baseUrl}/portal/invoices`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.5 },
    { url: `${baseUrl}/portal/profile`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/portal/corporate`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
  ];

  return staticRoutes;
}
