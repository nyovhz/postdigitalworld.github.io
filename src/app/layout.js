import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import { AudioProvider } from "@/app/components/Audio/AudioProvider";

const trenchFont = localFont({
  src: "./fonts/TrenchThin.ttf",
  variable: "--font-trench",
  weight: "100 900",
});

export const metadata = {
  title: "Post-digital World",
  description: "Post-digital world",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${trenchFont.variable} antialiased select-none`}
      >
        <AudioProvider>
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}
