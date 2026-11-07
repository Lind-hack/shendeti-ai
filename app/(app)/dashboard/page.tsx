"use client";
import { motion } from "framer-motion";
import { mockPatients, triageLevelConfig, getAge, conditionToRegion, severityColor } from "@/lib/mock-patients";
import { Users, AlertTriangle, Activity, FileText, ChevronRight, MousePointer2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";

const HumanBody3D = dynamic(() => import("@/components/human-body-3d"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] flex items-center justify-center text-slate-400 text-sm">
      Duke ngarkuar modelin 3D...
    </div>
  ),
});

const severityLabels: Record<string, string> = {
  critical: "Kritike",
  high: "E Lartë",
  medium: "Mesatare",
  low: "E Ulët",
};

const colorLegend = [
  { color: "#dc2626", label: "Kritike" },
  { color: "#f97316", label: "E Lartë" },
  { color: "#eab308", label: "Mesatare" },
  { color: "#22c55e", label: "E Ulët" },
  { color: "#94a3b8", label: "Normal" },
];

const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

type RegionResult = {
  layer: string;
  partAlbanian: string;
  status: "healthy" | "minor" | "critical";
  relatedConditions: string[];
  description: string;
};

const statusColor: Record<RegionResult["status"], string> = {
  critical: "#dc2626",
  minor: "#eab308",
  healthy: "#22c55e",
};

const statusLabel: Record<RegionResult["status"], string> = {
  critical: "Lëndim Kritik",
  minor: "Problem i Vogël",
  healthy: "Mirë",
};

export default function DashboardPage() {
  const [selectedRegion, setSelectedRegion] = useState<RegionResult | null>(null);
  const [loadingRegion, setLoadingRegion] = useState(false);

  const mostRecent = [...mockPatients].sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  )[0];

  const recentVitals = mostRecent.vitalSigns[0];
  const cfg = triageLevelConfig[mostRecent.triageLevel ?? "low"];
  const criticalCount = mockPatients.filter((p) => p.triageLevel === "critical").length;
  const totalVisits = mockPatients.reduce((acc, p) => acc + p.visits.length, 0);

  const stats = [
    { label: "Pacientë Gjithsej", value: mockPatients.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Raste Kritike", value: criticalCount, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Vizita Totale", value: totalVisits, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Raporte Sot", value: 3, icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const triageBreakdown = (["critical", "high", "medium", "low"] as const).map((key) => ({
    key,
    label: triageLevelConfig[key].label,
    count: mockPatients.filter((p) => p.triageLevel === key).length,
    dotClass: triageLevelConfig[key].dot,
  }));

  return (
    <div className="min-h-full bg-slate-100 p-6 space-y-6">
      {/* Header */}
      <motion.div {...fade} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold text-slate-800">Paneli Kryesor</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {new Date().toLocaleDateString("sq-AL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </motion.div>

      {/* Critical alert */}
      {criticalCount > 0 && (
        <motion.div {...fade} transition={{ duration: 0.3, delay: 0.05 }}>
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <p className="text-sm text-red-700">
              <span className="font-semibold">{criticalCount} pacient{criticalCount > 1 ? "ë" : ""} kritik</span>{" "}
              kërkon{criticalCount > 1 ? "ë" : ""} vëmendje të menjëhershme.
            </p>
            <Link href="/patients" className="ml-auto text-xs text-red-600 font-medium hover:underline shrink-0">
              Shiko →
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" {...fade} transition={{ duration: 0.3, delay: 0.1 }}>
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* 3D body + region details */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-5" {...fade} transition={{ duration: 0.3, delay: 0.15 }}>
        {/* 3D Viewer */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Pacienti i Fundit</p>
              <h2 className="text-slate-800 font-semibold mt-0.5">
                {mostRecent.firstName} {mostRecent.lastName}
                <span className="ml-2 text-xs text-slate-400 font-normal">{getAge(mostRecent.dob)} vjeç</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color} font-medium`}>
                {cfg.label}
              </span>
              <Link href={`/patients/${mostRecent.id}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
                Profili <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="h-[430px]" style={{ height: 430 }}>
            <HumanBody3D
              conditions={mostRecent.conditions}
              bmi={recentVitals?.bmi}
              height={recentVitals?.height}
              muscleMass={recentVitals?.muscleMass}
              onRegionClick={async (layer, x, y) => {
                setLoadingRegion(true);
                setSelectedRegion(null);
                try {
                  const res = await fetch("/api/ai/region-click", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      layer, x, y,
                      conditions: mostRecent.conditions,
                      patientName: `${mostRecent.firstName} ${mostRecent.lastName}`,
                    }),
                  });
                  const data = await res.json();
                  if (res.ok) setSelectedRegion({ layer, ...data });
                } finally {
                  setLoadingRegion(false);
                }
              }}
            />
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 flex-wrap px-4 py-3 border-t border-gray-100">
            {colorLegend.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Region details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-4">Detajet e Rajonit</p>

          {loadingRegion ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm">Duke analizuar...</p>
            </div>
          ) : !selectedRegion ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
              <MousePointer2 className="w-8 h-8" />
              <p className="text-sm text-center leading-snug">Kliko një rajon<br />të figurës 3D</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-start gap-2 mb-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0 mt-1"
                  style={{ backgroundColor: statusColor[selectedRegion.status] }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 leading-tight">{selectedRegion.partAlbanian}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs font-medium"
                      style={{ color: statusColor[selectedRegion.status] }}
                    >
                      {statusLabel[selectedRegion.status]}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {selectedRegion.layer}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-3">{selectedRegion.description}</p>

              {(selectedRegion.relatedConditions ?? []).length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Gjendjet e lidhura</p>
                  {selectedRegion.relatedConditions.map((cond) => {
                    const m = conditionToRegion[cond];
                    return (
                      <div key={cond} className="rounded-lg border border-gray-100 bg-slate-50 p-2.5">
                        <p className="text-xs font-medium text-slate-700">{cond}</p>
                        {m && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColor[m.severity] }} />
                            <p className="text-xs text-slate-400">{severityLabels[m.severity]}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <Link
                href={`/patients/${mostRecent.id}`}
                className="mt-auto pt-4 flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
              >
                Hap profilin e plotë <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent patients + triage breakdown */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-5" {...fade} transition={{ duration: 0.3, delay: 0.2 }}>
        {/* Recent patients */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-slate-800">Pacientët e Fundit</h3>
            <Link href="/patients" className="text-xs text-blue-600 hover:underline font-medium">Të gjithë →</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {[...mockPatients]
              .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
              .slice(0, 5)
              .map((p) => {
                const pcfg = triageLevelConfig[p.triageLevel ?? "low"];
                return (
                  <Link
                    key={p.id}
                    href={`/patients/${p.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-blue-700">{p.firstName[0]}{p.lastName[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-slate-400 truncate">{getAge(p.dob)} vjeç · {p.conditions.slice(0, 2).join(", ")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${pcfg.bg} ${pcfg.border} ${pcfg.color} font-medium`}>
                        {pcfg.label}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>

        {/* Triage breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Triazhi</h3>
          <div className="space-y-3">
            {triageBreakdown.map((t) => (
              <div key={t.key} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.dotClass}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600">{t.label}</span>
                    <span className="text-xs font-semibold text-slate-700">{t.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${t.dotClass}`}
                      style={{ width: `${(t.count / mockPatients.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-slate-500">Totali</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{mockPatients.length}</p>
            <p className="text-xs text-slate-400">pacientë aktivë</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
