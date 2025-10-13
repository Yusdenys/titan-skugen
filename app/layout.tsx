import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Metadata } from "next";
import { Header } from "@/components/header";
import { ScrollArea } from "@/components/ui/scroll-area";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Titan SKUGen",
  description: "Titan SKUGen for product pieces and variants",
  icons: {
    icon: [
      {
        url: '/favicon.png',
        sizes: '64x64',
        type: 'image/png',
      }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className={`antialiased`}>
        <ScrollArea className="h-screen flex flex-col">
          <Header />
          {children}
        </ScrollArea>
        <Toaster />
      </body>
    </html>
  );
}
