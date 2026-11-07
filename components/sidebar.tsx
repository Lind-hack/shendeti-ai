"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, AlertTriangle, ScanLine,
  Mic, ChevronLeft, ChevronRight, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Paneli", icon: LayoutDashboard },
  { href: "/patients", label: "Pacientët", icon: Users },
  { href: "/triage", label: "Triazhi", icon: AlertTriangle },
  { href: "/clinics", label: "Klinika", icon: Building2 },
  { href: "/ocr", label: "OCR Digjitizues", icon: ScanLine },
  { href: "/reports", label: "Raportet Voice", icon: Mic },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col h-full border-r border-[#1A2D40] bg-[#0B1623] overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1A2D40]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Shendeti.AI.png" className="w-8 h-8 object-contain rounded-lg shrink-0" alt="Shendeti AI" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-base text-white whitespace-nowrap"
            >
              Shendeti AI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-hidden">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 2 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer",
                  active
                    ? "bg-[#3D8EF8]/15 text-[#3D8EF8] border border-[#3D8EF8]/20"
                    : "text-[#64748B] hover:text-[#94A3B8] hover:bg-[#0F1E2E]"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", active && "text-[#3D8EF8]")} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 py-4 border-t border-[#1A2D40]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-[#64748B] hover:text-[#94A3B8] hover:bg-[#0F1E2E] transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium whitespace-nowrap">Ngushto</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
