// app/(main)/layout.tsx
import Footer from "@/components/Footer";
import HeaderMenu from "@/components/Header";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <HeaderMenu />

      <main className="grow shrink-0 overflow-y-auto">{children}</main>

      <Footer />
    </div>
  );
}
