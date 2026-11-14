import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Montrose Resource Chat",
  description: "First sprint chat starter for fictional resource data",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
