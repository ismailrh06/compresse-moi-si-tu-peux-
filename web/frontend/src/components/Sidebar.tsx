"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Gamepad2, X } from "lucide-react";
import {
  Home,
  FileDown,
  BarChart2,
  Info,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="));
    setIsAuthenticated(!!cookie);
  }, []);

  const menuItems = [
    { label: "Accueil", href: "/", icon: Home },
    { label: "Compression", href: "/compress", icon: FileDown },
    { label: "Comparaison", href: "/compare", icon: BarChart2 },
    {
      label: "Jeu Huffman",
      href: "/game-huffman",
      icon: Gamepad2,
    },
    { label: "Info", href: "/info", icon: Info },
  ];

  // --- LOGOUT ---
  const handleLogout = () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "onboarding_done=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    window.location.href = "/login";
  };

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 z-50 h-dvh w-72 bg-white/10 backdrop-blur-2xl border-r border-white/10 shadow-xl text-white flex flex-col py-10 px-6 transition-transform duration-200
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:w-64
      `}
    >
      <button
        type="button"
        onClick={onClose}
        className="md:hidden absolute right-4 top-4 p-2 rounded-lg hover:bg-white/10"
        aria-label="Fermer la barre latérale"
      >
        <X size={20} />
      </button>

      <h1 className="text-3xl font-extrabold mb-10 text-center">
        Compressemos
      </h1>

      {/* --- CASE 1 : USER NOT CONNECTED → Show Login & Signup --- */}
      {!isAuthenticated && (
        <nav className="flex flex-col gap-4">
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"
          >
            <LogIn size={20} />
            <span className="text-lg">Se connecter</span>
          </Link>

          <Link
            href="/signup"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"
          >
            <UserPlus size={20} />
            <span className="text-lg">S’inscrire</span>
          </Link>
        </nav>
      )}

      {/* --- CASE 2 : USER CONNECTED → Show App Pages --- */}
      {isAuthenticated && (
        <>
          <nav className="flex flex-col gap-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${active ? "bg-white/20 shadow-inner" : "hover:bg-white/10"}
                  `}
                >
                  <Icon size={20} />
                  <span className="text-lg">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl mt-4 bg-white/10 hover:bg-white/20 transition-all text-white"
          >
            <LogOut size={20} />
            <span className="text-lg">Log out</span>
          </button>
        </>
      )}
    </motion.aside>
  );
}
