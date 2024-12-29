// app/(main)/layout.tsx
import Footer from "@/components/Footer";
import HeaderMenu from "@/components/Header";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full z-50">
        <HeaderMenu />
      </header>

      {/* Add padding to the top of the main content to prevent overlap */}
      <main className="grow shrink-0 overflow-y-auto mt-[64px]">
        {children}
      </main>

      {/* Footer */}
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
