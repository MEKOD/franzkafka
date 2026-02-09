import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/components/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ledger — FranzKafka.xyz",
  description: "A bureaucratic notebook. / Burokratik bir defter.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-mono">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
