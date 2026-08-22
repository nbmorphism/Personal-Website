import type { Metadata } from "next";
import "./globals.css";
import PageTransition from "./page-transition";

export const metadata: Metadata = {
  title: "Personal Website",
  description: "Personal website of a mathematics student.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PageTransition />
        {children}
      </body>
    </html>
  );
}
