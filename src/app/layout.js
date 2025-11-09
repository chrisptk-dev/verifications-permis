import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Matomo from "@/components/Matomo.jsx";
import { Suspense } from "react";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Vérifications Permis B - Appli interactive",
  description: "Révise facilement les vérifications pour le permis B.",
  metadataBase: new URL("https://verifications-permis.netlify.app/"),
  icons: {
    icon: "/favicon.png", // ton nouveau PNG
  },

  openGraph: {
    title: "Vérifications Permis B - Appli interactive",
    description: "Révise facilement les vérifications pour le permis B.",
    url: "https://verifications-permis.netlify.app/",
    siteName: "Vérifications Permis B",
    // Tu peux laisser l’image relative grâce à metadataBase
    images: [
      {
        url: "/logo-application-permis-verifications.png",
        width: 500,
        height: 500,
        alt: "Logo de l'application",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Vérifications Permis B - Appli interactive",
    description: "Révise facilement les vérifications pour le permis B.",
    images: ["/logo-application-permis-verifications.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <Matomo /> {/* Active Matomo partout */}
        </Suspense>

        {children}
      </body>
    </html>
  );
}
