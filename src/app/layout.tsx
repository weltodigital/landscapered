import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/providers/session-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Landscapered - AI-Powered Garden Design & Quoting",
  description: "Transform garden photos into professional design concepts and accurate quotes with AI-powered landscaping tools.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper session={session}>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}