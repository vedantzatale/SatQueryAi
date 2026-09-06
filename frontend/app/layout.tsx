import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SatQuery AI",
  description: "Ask your satellite data a question. SatQuery finds, understands, explains and proves the answer.",
  icons: {
    icon: "/logo/satquertlogo.png",
    apple: "/logo/satquertlogo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
