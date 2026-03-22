"use client";

import { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function ClientShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // pages sans sidebar (avec startsWith pour éviter les bugs)
  const hideSidebarOn = ["/login", "/signup", "/onboarding"];

  const shouldShowSidebar = !hideSidebarOn.some((p) => pathname.startsWith(p));


  return (
    <div className="min-h-screen md:flex">
      {shouldShowSidebar && (
        <>
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {isSidebarOpen && (
            <button
              type="button"
              aria-label="Fermer la barre latérale"
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
            />
          )}

          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-4 top-4 z-40 rounded-lg bg-white/10 p-2 shadow-lg shadow-black/30 transition hover:bg-white/20 md:hidden"
            aria-label="Ouvrir la barre latérale"
          >
            <Menu size={20} />
          </button>
        </>
      )}

      <main
        className={shouldShowSidebar ? "w-full pt-16 md:ml-64 md:pt-0" : "w-full"}
      >
        {children}
      </main>
    </div>
  );
}
