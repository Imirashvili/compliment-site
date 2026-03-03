import "./globals.css";
import type { Metadata } from "next";
import { Rubik, Playfair_Display } from "next/font/google";

const rubik = Rubik({
  subsets: ["cyrillic", "latin"],
  weight: ["700", "800", "900"],
});

const playfair = Playfair_Display({
  subsets: ["cyrillic", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-official",
});

export const metadata: Metadata = {
  title: "Комплимент",
  description: "Рандомный комплимент",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${rubik.className} ${playfair.variable}`}>
        {children}
      </body>
    </html>
  );
}