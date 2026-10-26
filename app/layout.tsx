import type { Metadata } from "next";
import "./globals.css";
import "./noura.css";

export const metadata: Metadata = {
  title: "NOURA · Твоё питание, твой ритм",
  description: "Персональный рацион, любимые рецепты и готовка шаг за шагом.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
