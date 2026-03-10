"use client";

import { useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function ClientShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="));
    setIsAuthenticated(!!cookie);
  }, []);

  // pages sans sidebar (avec startsWith pour éviter les bugs)
  const hideSidebarOn = ["/login", "/signup", "/onboarding"];

  const shouldHideSidebar = hideSidebarOn.some((path) =>
    pathname.startsWith(path)
  );

  const shouldShowSidebar = !hideSidebarOn.some((p) => pathname.startsWith(p));


  return (
    <div className="flex">
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
            className="fixed left-4 top-4 z-40 md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20"
            aria-label="Ouvrir la barre latérale"
          >
            <Menu size={20} />
          </button>
        </>
      )}

      <main className={shouldShowSidebar ? "w-full md:ml-64" : "w-full"}>
        {children}
      </main>
    </div>
  );
}
