import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import { AudioProvider } from "@/app/components/Audio/AudioProvider";
import { SFXProvider } from "./components/Audio/SFXProvider";

const trenchFont = localFont({
  src: "./fonts/TrenchThin.ttf",
  variable: "--font-trench",
  weight: "100 900",
});

export const metadata = {
  title: "post-digital-world",
  description: "post-digital-world",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${trenchFont.variable} antialiased select-none`}
      >
        <SFXProvider>
          <AudioProvider>
            {children}
          </AudioProvider>
        </SFXProvider>
      </body>
    </html>
  );
}
