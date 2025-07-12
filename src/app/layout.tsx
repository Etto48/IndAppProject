import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TravelMate",
  description: "Find the best hotels near you",
  icons: "/favicon.svg"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
