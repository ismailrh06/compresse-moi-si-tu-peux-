"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Gamepad2, Joystick, Trophy, X } from "lucide-react";
import {
  Home,
  FileDown,
  BarChart2,
  MessageCircle,
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
    { label: "Assistant IA", href: "/assistant", icon: MessageCircle },
    {
      label: "Jeu Huffman",
      href: "/game-huffman",
      icon: Gamepad2,
    },
    {
      label: "Jeu LZW",
      href: "/game-lzw",
      icon: Joystick,
    },
    { label: "Classement", href: "/leaderboard", icon: Trophy },
    { label: "Info", href: "/info", icon: Info },
  ];

  // --- LOGOUT ---
  const handleLogout = () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "full_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "onboarding_done=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    window.location.href = "/login";
  };

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 z-50 flex h-dvh w-[calc(100vw-1rem)] max-w-[20rem] flex-col overflow-y-auto border-r border-white/10 bg-gradient-to-b from-white/15 via-white/10 to-white/5 px-4 py-8 text-white shadow-2xl backdrop-blur-3xl transition-transform duration-200 sm:px-6 sm:py-10
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:w-64
      `}
    >
      <button
        type="button"
        onClick={onClose}
        className="md:hidden absolute right-4 top-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
        aria-label="Fermer la barre latérale"
      >
        <X size={20} />
      </button>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8 sm:mb-10"
      >
        <h1 className="text-center text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
          Compresse moi si tu peux
        </h1>
        <div className="mt-3 h-1.5 w-12 mx-auto bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full shadow-lg shadow-purple-500/50" />
      </motion.div>

      {/* --- CASE 1 : USER NOT CONNECTED → Show Login & Signup --- */}
      {!isAuthenticated && (
        <nav className="flex flex-col gap-3 sm:gap-4">
          <Link
            href="/login"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-white/10"
          >
            <LogIn size={20} />
            <span className="text-base sm:text-lg">Se connecter</span>
          </Link>

          <Link
            href="/signup"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-white/10"
          >
            <UserPlus size={20} />
            <span className="text-base sm:text-lg">S’inscrire</span>
          </Link>
        </nav>
      )}

      {/* --- CASE 2 : USER CONNECTED → Show App Pages --- */}
      {isAuthenticated && (
        <>
          <nav className="flex flex-col gap-3 sm:gap-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${active ? "bg-white/20 shadow-inner" : "hover:bg-white/10"}
                  `}
                >
                  <Icon size={20} />
                  <span className="text-base sm:text-lg">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          <button
            onClick={handleLogout}
            className="mt-6 flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-white transition-all hover:bg-white/20"
          >
            <LogOut size={20} />
            <span className="text-base sm:text-lg">Log out</span>
          </button>
        </>
      )}
    </motion.aside>
  );
}
