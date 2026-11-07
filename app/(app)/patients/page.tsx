"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { mockPatients, getAge, triageLevelConfig } from "@/lib/mock-patients";
import { formatDate } from "@/lib/utils";
import { Search, Plus, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PatientsPage() {
  const [query, setQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");

  const filtered = mockPatients.filter(p => {
    const name = `${p.firstName} ${p.lastName}`.toLowerCase();
    const matchSearch = query === "" || name.includes(query.toLowerCase()) ||
      p.idNumber.includes(query) || p.conditions.some(c => c.toLowerCase().includes(query.toLowerCase()));
    const matchLevel = filterLevel === "all" || p.triageLevel === filterLevel;
    return matchSearch && matchLevel;
  });

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Baza e Pacientëve</h1>
          <p className="text-slate-500 text-sm mt-0.5">{mockPatients.length} pacientë të regjistruar</p>
        </div>
        <Link href="/patients/new">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3D8EF8] text-white text-sm font-medium hover:bg-[#2F7AE5] transition-colors">
            <Plus className="w-4 h-4" />
            Pacient i Ri
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Kërko sipas emrit, ID ose diagnozës..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#3D8EF8]/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {["all", "critical", "high", "medium", "low"].map(level => {
            const labels: Record<string, string> = { all: "Të gjithë", critical: "Kritikë", high: "Të Lartë", medium: "Mesatare", low: "Të Ulët" };
            return (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  filterLevel === level
                    ? "bg-[#3D8EF8]/20 text-[#3D8EF8] border border-[#3D8EF8]/30"
                    : "text-slate-500 border border-gray-200 hover:border-[#3D8EF8]/20"
                }`}
              >
                {labels[level]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {["Pacienti", "Mosha / Gjaku", "Diagnozat", "Alergji", "Triage", "Vizita e Fundit"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-500 px-5 py-3.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((p, i) => {
                const cfg = triageLevelConfig[p.triageLevel ?? "low"];
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/patients/${p.id}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#3D8EF8]/15 flex items-center justify-center text-[#3D8EF8] font-semibold text-sm shrink-0">
                          {p.firstName[0]}{p.lastName[0]}
                        </div>
                        <div>
                          <p className="text-slate-800 text-sm font-medium">{p.firstName} {p.lastName}</p>
                          <p className="text-slate-500 text-xs">{p.idNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {getAge(p.dob)} vjeç &bull; <span className="text-[#3D8EF8]">{p.bloodType}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {p.conditions.slice(0, 2).map(c => (
                          <span key={c} className="text-xs px-2 py-0.5 bg-slate-50 border border-gray-200 rounded-md text-slate-600">{c}</span>
                        ))}
                        {p.conditions.length > 2 && <span className="text-xs text-slate-500">+{p.conditions.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {p.allergies.length > 0 ? (
                        <div className="flex items-center gap-1.5 text-red-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span className="text-xs">{p.allergies[0].substance}{p.allergies.length > 1 ? ` +${p.allergies.length - 1}` : ""}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${cfg.dot} ${p.triageLevel === "critical" ? "pulse-critical" : ""}`} />
                        <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{formatDate(p.lastUpdated)}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            Nuk u gjetën pacientë për kërkimin "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
