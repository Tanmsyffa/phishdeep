import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://phishdeep.vercel.app'),
  verification: {
    google: '_b9NX6YFJiCTfMjqqNefgiFxu5oVMIXiDwCl_R-M9s0',
  },
  title: {
    default: "PhishDeep - Deteksi Phishing & Malware dengan Bukti Visual",
    template: "%s | PhishDeep"
  },
  description: "PhishDeep adalah platform cerdas untuk mendeteksi phishing, malware, dan ancaman siber pada link, APK, dan dokumen dengan laporan forensik visual.",
  keywords: [
    "PhishDeep", "deteksi phishing", "scan malware", "cek link aman", 
    "cek APK berbahaya", "keamanan siber", "bukti visual phishing", 
    "anti malware indonesia", "cybersecurity indonesia"
  ],
  authors: [{ name: "PhishDeep Team" }],
  creator: "PhishDeep",
  publisher: "PhishDeep",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "PhishDeep - Deteksi Phishing & Malware",
    description: "Cek link, APK, dan dokumen Anda dari bahaya phishing dan malware. Dapatkan bukti visual nyata dengan PhishDeep.",
    url: 'https://phishdeep.vercel.app',
    siteName: 'PhishDeep',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PhishDeep - Deteksi Phishing & Malware',
    description: 'Platform cerdas deteksi ancaman siber dengan bukti visual forensik.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} antialiased text-gray-900 bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}
