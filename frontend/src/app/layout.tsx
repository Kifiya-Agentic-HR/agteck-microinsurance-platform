import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import Footer from "../components/footer/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agtech",
  description: "Agtech Insurance System",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-gray-50 text-gray-900 antialiased flex flex-col min-h-screen">
        <MantineProvider>
          <main className="flex-1">{children}</main>
          <Footer />
        </MantineProvider>
      </body>
    </html>
  );
}