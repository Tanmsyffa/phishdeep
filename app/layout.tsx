import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://phishdeep.vercel.app'),
  applicationName: "PhishDeep",
  appleWebApp: {
    title: "PhishDeep",
    statusBarStyle: "default",
    capable: true,
  },
  verification: {
    google: '_b9NX6YFJiCTfMjqqNefgiFxu5oVMIXiDwCl_R-M9s0',
  },
  title: {
    default: "PhishDeep - Deteksi Phishing & Malware dengan Bukti Visual",
    template: "%s | PhishDeep"
  },
  description: "PhishDeep adalah platform cerdas untuk mendeteksi phishing, malware, dan ancaman siber pada link dan APK dengan laporan forensik visual.",
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
    description: "Cek link dan APK Anda dari bahaya phishing dan malware. Dapatkan bukti visual nyata dengan PhishDeep.",
    url: 'https://phishdeep.vercel.app',
    siteName: 'PhishDeep',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PhishDeep - Deteksi Phishing & Malware',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PhishDeep - Deteksi Phishing & Malware',
    description: 'Platform cerdas deteksi ancaman siber dengan bukti visual forensik.',
    images: ['/og-image.jpg'],
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PhishDeep',
    alternateName: 'PhishDeep - Deteksi Phishing & Malware',
    url: 'https://phishdeep.vercel.app',
    description: 'Platform cerdas untuk mendeteksi phishing, malware, dan ancaman siber pada link dan APK dengan laporan forensik visual.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://phishdeep.vercel.app/scan',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const nonce = headers().get('x-nonce') || '';

  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent dark mode FOUC - runs before React hydration */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased text-gray-900 bg-gray-50 dark:bg-slate-950 dark:text-gray-100`}>
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
