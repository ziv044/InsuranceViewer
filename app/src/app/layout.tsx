import type { Metadata } from "next";
import { Assistant, Heebo } from "next/font/google";
import { cn } from "@/lib/utils";
import Providers from "@/components/Providers";
import "./globals.css";

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InsuranceViewer — צפה בביטוח, פנסיה וחסכונות",
  description:
    "כלי צפייה בנתוני ביטוח, פנסיה וחסכונות מקבצי מסלקה והר הביטוח",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={cn(assistant.variable, heebo.variable)}
    >
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
