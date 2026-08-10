import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { ExpensesProvider } from "@/context/ExpensesContext";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "Expensely - Suivi de dépenses",
  description: "Suivez et comprenez vos dépenses personnelles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <ToastProvider>
          <ExpensesProvider>
            <NavBar />
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
          </ExpensesProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
