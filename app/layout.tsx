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
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="PingPong WebApp" />
        <meta name="theme-color" content="#000000" />
        <meta name="google" content="notranslate" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
