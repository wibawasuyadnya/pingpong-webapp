import "./globals.css";
import type { Metadata } from "next";
import FlyonuiScript from "./flyonui-script";
import { Providers } from "@/redux/provider";
import { Nunito } from "next/font/google";
import ThemeWrapper from "@/components/Layout-Components/ThemeWrapper";
import ThemeInitializer from "@/components/Layout-Components/ThemeInitializer";

const nunito = Nunito({ subsets: ['latin'] })


export const metadata: Metadata = {
  title: "PingPong WebApp",
  description: "PingPong WebApp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="referrer" content="origin" />
      </head>
      <body
        className={`${nunito.className} antialiased`}
      >
        <Providers>
          <ThemeInitializer />
          <ThemeWrapper>
            <div>
              {children}
            </div>
            <FlyonuiScript />
          </ThemeWrapper>
        </Providers>
      </body>
    </html>
  );
}
