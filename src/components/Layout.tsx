import Link from "next/link";
import React from "react";

type Props = {
  children: React.ReactNode;
  title?: string;
};

export default function Layout({ children, title }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur sticky top-0 z-20 border-b">
        <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg">FundiConnect</Link>
          <div className="flex gap-4 items-center">
            <Link href="/services">Services</Link>
            <Link href="/fundis">Fundis</Link>
            <Link href="/about">About</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/auth/login" className="ml-4 px-3 py-1 border rounded">Log in</Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full">
        {title ? <h1 className="text-2xl font-semibold mb-6">{title}</h1> : null}
        {children}
      </main>

      <footer className="border-t py-6 mt-12">
        <div className="max-w-5xl mx-auto px-6 text-sm text-center text-muted-foreground">
          © {new Date().getFullYear()} FundiConnect — Built with care.
        </div>
      </footer>
    </div>
  );
}
