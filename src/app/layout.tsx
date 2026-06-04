import type { Metadata } from "next";
import { Suspense } from "react";
import { Source_Serif_4, Inter } from "next/font/google";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { Header } from "@/components/Header";
import { SiteFooter } from "@/components/SiteFooter";
import { ToastProvider } from "@/components/ToastProvider";
import "./globals.css";

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sourcewise — Daily India News",
    template: "%s | Sourcewise",
  },
  description:
    "No political bias — present facts as they happened; let readers judge for themselves.",
  openGraph: {
    siteName: "Sourcewise",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} h-full`}
      data-theme="system"
      suppressHydrationWarning
    >
      <head>
        <script
          // Runs before React hydration to prevent theme flash.
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var k='sourcewise-theme';var m=localStorage.getItem(k)||'system';var d=m==='dark'||(m==='system'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);var c=document.documentElement.classList;c.toggle('dark',!!d);document.documentElement.dataset.theme=m;}catch(e){}})();",
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-stone-100 font-sans text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-50"
        suppressHydrationWarning
      >
        <GoogleAnalytics />
        <ToastProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Suspense fallback={null}>
            <SiteFooter />
          </Suspense>
        </ToastProvider>
      </body>
    </html>
  );
}
