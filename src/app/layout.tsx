import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Hoodie Man - Premium Hoodies, T-Shirts & Apparel",
    template: "%s | Hoodie Man",
  },
  description: "Shop the best collection of hoodies, t-shirts, and apparel online. Free shipping on orders over $50. Quality streetwear for everyone.",
  keywords: [
    "hoodies",
    "t-shirts",
    "apparel",
    "streetwear",
    "fashion",
    "clothing",
    "online shopping",
    "premium hoodies",
    "graphic tees",
  ],
  authors: [{ name: "Hoodie Man" }],
  creator: "Hoodie Man",
  publisher: "Hoodie Man",
  metadataBase: new URL("https://hoodieman.com"), // Change to your actual domain
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hoodieman.com",
    siteName: "Hoodie Man",
    title: "Hoodie Man - Premium Hoodies, T-Shirts & Apparel",
    description: "Shop the best collection of hoodies, t-shirts, and apparel online. Free shipping on orders over $50.",
    images: [
      {
        url: "/og-image.jpg", // Add this image to public folder
        width: 1200,
        height: 630,
        alt: "Hoodie Man - Premium Apparel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoodie Man - Premium Hoodies, T-Shirts & Apparel",
    description: "Shop the best collection of hoodies, t-shirts, and apparel online.",
    images: ["/og-image.jpg"],
    creator: "@hoodieman", // Change to your actual Twitter handle
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification code
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
