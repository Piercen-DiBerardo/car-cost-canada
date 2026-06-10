import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Car Cost Calculator",
  description: "Canadian vehicle ownership cost estimator",
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