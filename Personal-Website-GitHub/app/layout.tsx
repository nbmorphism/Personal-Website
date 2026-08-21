import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
