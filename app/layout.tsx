import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Poker Loop",
  description: "Treine decisões. Entenda seus erros. Leve o aprendizado para a mesa.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
