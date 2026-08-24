import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediaLink — Instagram Media Linker",
  description: "Organize available Instagram media links by profile, type and date.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
