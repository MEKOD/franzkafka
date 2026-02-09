import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ledger — FranzKafka.xyz",
  description: "A bureaucratic notebook. / Burokratik bir defter.",
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
      </body>
    </html>
  );
}
