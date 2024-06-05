import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HeaderSplit } from "../components/common/HeaderSplit"


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Split Bill",
  description: "Split Bill",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <HeaderSplit />
        <main>
          {children}

        </main>
      </body>

    </html>
  );
}