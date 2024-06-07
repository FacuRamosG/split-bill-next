import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HeaderSplit } from "../components/common/HeaderSplit"


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Split Bill - Divide tus cuentas de manera fácil y rápida",
  description: "La división de cuentas nunca fue tan facil, Split Bill te ayuda a dividir tus cuentas de manera rapida y sencilla",
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