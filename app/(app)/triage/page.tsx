"use client";
import { motion } from "framer-motion";
import { mockPatients, triageLevelConfig, getAge } from "@/lib/mock-patients";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { AlertTriangle, Activity, Zap, Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const LEVELS = ["critical", "high", "medium", "low"] as const;

export default function TriagePage() {
  const [symptoms, setSymptoms] = useState("");
  const [bpSys, setBpSys] = useState("");
  const [bpDia, setBpDia] = useState("");
  const [hr, setHr] = useState("");
  const [temp, setTemp] = useState("");
  const [o2, setO2] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ level: string; reasoning: string } | null>(null);

  async function runTriage() {
    if (!symptoms.trim()) { toast.error("Shkruaj simptomat"); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: symptoms.split(",").map(s => s.trim()).filter(Boolean),
          vitals: { bp_sys: bpSys, bp_dia: bpDia, hr, temp, o2sat: o2 }
        })
      });
      const data = await res.json();
      setResult(data);
    } catch {
      toast.error("Gabim gjatë triazimit");
    }
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">Triazhi i Emergjencës</h1>
        <p className="text-slate-500 text-sm mt-0.5">Pacientët sipas nivelit të urgjencës</p>
      </motion.div>

      {/* AI Triage tool */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-[#3D8EF8]" />
            <h2 className="text-sm font-semibold text-slate-800">Smart Emergency Triage — AI Vlerësim</h2>
          </div>
          <div className="space-y-3">
            <textarea
              placeholder="Simptomat (p.sh: dhimbje gjoksi, vështirësi në frymëmarrje, të fikët)"
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#3D8EF8]/50 resize-none transition-colors"
            />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "BP Sys (mmHg)", val: bpSys, set: setBpSys },
                { label: "BP Dia (mmHg)", val: bpDia, set: setBpDia },
                { label: "Rrahjet (bpm)", val: hr, set: setHr },
                { label: "Temperatura (°C)", val: temp, set: setTemp },
                { label: "O₂ Saturimi (%)", val: o2, set: setO2 },
              ].map(f => (
                <input
                  key={f.label}
                  type="text"
                  placeholder={f.label}
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#3D8EF8]/50 transition-colors"
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={runTriage}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3D8EF8] text-white text-sm font-medium hover:bg-[#2F7AE5] transition-colors disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                {loading ? "Duke analizuar..." : "Vlerëso Urgjencën"}
              </button>
            </div>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border ${triageLevelConfig[result.level as keyof typeof triageLevelConfig]?.border} ${triageLevelConfig[result.level as keyof typeof triageLevelConfig]?.bg}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={`w-4 h-4 ${triageLevelConfig[result.level as keyof typeof triageLevelConfig]?.color}`} />
                  <span className={`font-bold text-sm ${triageLevelConfig[result.level as keyof typeof triageLevelConfig]?.color}`}>
                    Niveli: {triageLevelConfig[result.level as keyof typeof triageLevelConfig]?.label}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{result.reasoning}</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {LEVELS.map((level, colIdx) => {
          const cfg = triageLevelConfig[level];
          const patients = mockPatients.filter(p => p.triageLevel === level);
          return (
            <motion.div
              key={level}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + colIdx * 0.07 }}
            >
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${level === "critical" ? "pulse-critical" : ""}`} />
                    <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{patients.length}</span>
                </div>
                <div className="p-3 space-y-2 min-h-[120px]">
                  {patients.map(p => (
                    <Link key={p.id} href={`/patients/${p.id}`}>
                      <div className={`p-3 rounded-lg border ${cfg.border} bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-800 text-sm font-medium">{p.firstName} {p.lastName}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <p className="text-slate-500 text-xs">{getAge(p.dob)} vjeç • {p.bloodType}</p>
                        {p.triageReason && (
                          <p className={`text-xs mt-1 ${cfg.color} opacity-80`}>{p.triageReason}</p>
                        )}
                        <p className="text-slate-500 text-xs mt-1">{formatDate(p.lastUpdated)}</p>
                      </div>
                    </Link>
                  ))}
                  {patients.length === 0 && (
                    <div className="flex items-center justify-center h-16 text-slate-400 text-xs">Nuk ka raste</div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
