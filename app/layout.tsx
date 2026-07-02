import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/context/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ChauffeurOS — Luxury Chauffeur Operations Platform",
    template: "%s | ChauffeurOS",
  },
  description:
    "Enterprise-grade operating system for luxury limousine and chauffeur companies. Manage bookings, dispatch, fleet, CRM, and revenue in one platform.",
  metadataBase: new URL("https://chauffeuros.ca"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: "ChauffeurOS",
    title: "ChauffeurOS — Luxury Chauffeur Operations Platform",
    description:
      "Enterprise-grade operating system for luxury limousine and chauffeur companies. Manage bookings, dispatch, fleet, CRM, and revenue in one platform.",
    url: "https://chauffeuros.ca",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChauffeurOS — Luxury Chauffeur Operations Platform",
    description:
      "Enterprise-grade operating system for luxury limousine and chauffeur companies. Manage bookings, dispatch, fleet, CRM, and revenue in one platform.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-neutral-25 text-neutral-800 antialiased">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
