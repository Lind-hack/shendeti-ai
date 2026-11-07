"use client";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getPatient, getAge, triageLevelConfig } from "@/lib/mock-patients";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import {
  AlertCircle, Pill, FlaskConical, Activity, Calendar,
  Phone, MapPin, Shield, Zap, ChevronRight, Loader2,
  Building2, FileDown, CheckCircle, TriangleAlert, X, Clock
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, Legend, AreaChart, Area,
} from "recharts";

const TABS = ["Pasqyra", "Vizitat", "Analizat", "Medikamentet", "Klinika", "AI Përmbledhje"] as const;
type Tab = typeof TABS[number];

const labStatusColor = {
  normal: "text-emerald-600",
  low: "text-amber-600",
  high: "text-orange-600",
  critical: "text-red-600",
};

export default function PatientPage() {
  const { id } = useParams<{ id: string }>();
  const patient = getPatient(id);
  const [activeTab, setActiveTab] = useState<Tab>("Pasqyra");
  const [aiSummary, setAiSummary] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [pullingDoc, setPullingDoc] = useState<string | null>(null);
  const [drugCheckLoading, setDrugCheckLoading] = useState(false);
  const [drugCheckResult, setDrugCheckResult] = useState<{
    safe: boolean;
    interactions: { drug: string; severity: string; description: string }[];
  } | null>(null);
  const [showDrugModal, setShowDrugModal] = useState(false);

  if (!patient) return (
    <div className="flex items-center justify-center h-full text-slate-500">Pacienti nuk u gjet</div>
  );

  const cfg = triageLevelConfig[patient.triageLevel ?? "low"];

  async function checkDrugInteractions() {
    setDrugCheckLoading(true);
    setDrugCheckResult(null);
    setShowDrugModal(true);
    try {
      const meds = patient!.medications.filter(m => m.active).map(m => m.name);
      const res = await fetch("/api/ai/drug-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentMeds: meds, newMed: null }),
      });
      setDrugCheckResult(await res.json());
    } catch {
      toast.error("Gabim gjatë kontrollit të ndërveprimeve");
      setShowDrugModal(false);
    }
    setDrugCheckLoading(false);
  }

  async function generateSummary() {
    setLoadingAI(true);
    setAiSummary("");
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient }),
      });
      const data = await res.json();
      if (data.summary) {
        let i = 0;
        const interval = setInterval(() => {
          setAiSummary(data.summary.slice(0, i));
          i += 3;
          if (i > data.summary.length) { setAiSummary(data.summary); clearInterval(interval); }
        }, 20);
      }
    } catch {
      setAiSummary("Gabim gjatë gjenerimit të përmbledhjes. Kontrolloni lidhjen.");
    }
    setLoadingAI(false);
  }

  async function pullClinicDocument(docId: string, clinicName: string) {
    setPullingDoc(docId);
    await new Promise(r => setTimeout(r, 1800));
    setPullingDoc(null);
    toast.success(`Dokumenti nga ${clinicName} u tërhoq me sukses`, { description: "I disponueshëm në skedën Klinika" });
  }

  // Chart data for Analizat tab
  const chartData = [...patient.vitalSigns]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((v) => ({
      date: new Date(v.date).toLocaleDateString("sq-AL", { day: "2-digit", month: "short" }),
      sys: v.bp_sys,
      dia: v.bp_dia,
      hr: v.hr,
      o2: v.o2sat,
      weight: v.weight,
    }));

  const latestVital = patient.vitalSigns[0];
  const vitalMiniCards = latestVital ? [
    {
      label: "Presion Sistolik",
      value: `${latestVital.bp_sys}/${latestVital.bp_dia}`,
      unit: "mmHg",
      status: latestVital.bp_sys > 140 ? "high" : "normal",
    },
    {
      label: "Rrahjet e Zemrës",
      value: latestVital.hr,
      unit: "bpm",
      status: latestVital.hr > 100 ? "high" : latestVital.hr < 55 ? "low" : "normal",
    },
    {
      label: "O₂ Saturimi",
      value: `${latestVital.o2sat}%`,
      unit: "",
      status: latestVital.o2sat < 92 ? "critical" : latestVital.o2sat < 95 ? "high" : "normal",
    },
    {
      label: "Pesha",
      value: `${latestVital.weight}`,
      unit: "kg",
      status: "normal" as const,
    },
  ] : [];

  const activeMeds = patient.medications.filter(m => m.active);
  const inactiveMeds = patient.medications.filter(m => !m.active);

  return (
    <div className="min-h-full bg-slate-50 p-6 space-y-5">
      {/* Patient header card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl shrink-0">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-slate-800">{patient.firstName} {patient.lastName}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color} font-medium`}>
                  {cfg.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                <span>{getAge(patient.dob)} vjeç • {patient.gender === "M" ? "Mashkull" : "Femër"}</span>
                <span>Gjaku: <span className="text-blue-600 font-semibold">{patient.bloodType}</span></span>
                <span>ID: {patient.idNumber}</span>
                <span>Sigurimi: {patient.insuranceNumber}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{patient.phone}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{patient.address}</span>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-slate-500">Kontakti emergjent</p>
              <p className="text-sm text-slate-800 font-medium">{patient.emergencyContact.name}</p>
              <p className="text-xs text-slate-500">{patient.emergencyContact.relation} • {patient.emergencyContact.phone}</p>
            </div>
          </div>

          {patient.allergies.length > 0 && (
            <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-red-600 text-sm font-semibold">ALERGJI: </span>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map(a => (
                  <span key={a.substance} className="text-sm text-red-600">
                    {a.substance} <span className="text-red-400 text-xs">({a.severity})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative ${
              activeTab === tab ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

          {/* PASQYRA */}
          {activeTab === "Pasqyra" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" /> Kushtet Kronike
                </h3>
                <div className="space-y-2">
                  {patient.conditions.map(c => (
                    <div key={c} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {c}
                    </div>
                  ))}
                  {patient.conditions.length === 0 && <p className="text-slate-400 text-sm">Nuk ka kushte kronike</p>}
                </div>
              </div>

              {patient.vitalSigns.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" /> Shenjat Vitale
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: "Presion gjaku", value: `${patient.vitalSigns[0].bp_sys}/${patient.vitalSigns[0].bp_dia} mmHg` },
                      { label: "Rrahjet e zemrës", value: `${patient.vitalSigns[0].hr} bpm` },
                      { label: "Temperatura", value: `${patient.vitalSigns[0].temp}°C` },
                      { label: "O₂ Saturimi", value: `${patient.vitalSigns[0].o2sat}%` },
                      { label: "Pesha", value: `${patient.vitalSigns[0].weight} kg` },
                    ].map(v => (
                      <div key={v.label} className="flex justify-between text-sm">
                        <span className="text-slate-500">{v.label}</span>
                        <span className="text-slate-700 font-medium">{v.value}</span>
                      </div>
                    ))}
                    <p className="text-xs text-slate-400 mt-2">{formatDate(patient.vitalSigns[0].date)}</p>
                  </div>
                </div>
              )}

              {patient.visits.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500" /> Vizita e Fundit
                  </h3>
                  <div className="space-y-1.5 text-sm">
                    <p className="text-blue-600 font-medium">{formatDate(patient.visits[0].date)}</p>
                    <p className="text-slate-800">{patient.visits[0].doctor}</p>
                    <p className="text-slate-500">{patient.visits[0].specialty}</p>
                    <p className="text-slate-400 text-xs">{patient.visits[0].clinic}</p>
                    <p className="text-slate-600 text-xs mt-2 leading-relaxed">{patient.visits[0].notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIZITAT — vertical timeline */}
          {activeTab === "Vizitat" && (
            <div className="relative">
              {/* Date rail */}
              <div className="absolute left-[88px] top-0 bottom-0 w-px bg-slate-200" />

              <div className="space-y-5">
                {patient.visits.map((v, i) => (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex gap-4"
                  >
                    {/* Date column */}
                    <div className="w-20 shrink-0 text-right pt-3">
                      <p className="text-xs font-semibold text-slate-700 leading-tight">
                        {new Date(v.date).toLocaleDateString("sq-AL", { day: "2-digit", month: "short" })}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(v.date).getFullYear()}
                      </p>
                    </div>

                    {/* Dot */}
                    <div className="flex flex-col items-center pt-3.5 shrink-0">
                      <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-white ring-offset-1 z-10" />
                    </div>

                    {/* Card */}
                    <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-slate-800 font-semibold text-sm">{v.doctor}</span>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{v.specialty}</span>
                      </div>
                      <p className="text-slate-600 text-sm">{v.reason}</p>
                      <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {v.clinic}
                      </p>
                      <p className="text-slate-500 text-xs mt-2 leading-relaxed">{v.notes}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ANALIZAT — recharts */}
          {activeTab === "Analizat" && (
            <div className="space-y-5">
              {/* Mini stat cards */}
              {latestVital && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {vitalMiniCards.map((card) => {
                    const statusStyle: Record<string, string> = {
                      normal: "text-emerald-600 bg-emerald-50 border-emerald-200",
                      low: "text-amber-600 bg-amber-50 border-amber-200",
                      high: "text-orange-600 bg-orange-50 border-orange-200",
                      critical: "text-red-600 bg-red-50 border-red-200",
                    };
                    return (
                      <div key={card.label} className={`rounded-xl border p-4 ${statusStyle[card.status]}`}>
                        <p className="text-xs font-medium opacity-70">{card.label}</p>
                        <p className="text-2xl font-bold mt-1">{card.value}</p>
                        {card.unit && <p className="text-xs opacity-60 mt-0.5">{card.unit}</p>}
                      </div>
                    );
                  })}
                </div>
              )}

              {chartData.length > 1 ? (
                <>
                  {/* BP + HR chart */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4">Presioni Gjaku & Rrahjet e Zemrës</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                          labelStyle={{ fontWeight: 600, color: "#1e293b" }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
                        <Line type="monotone" dataKey="sys" name="Sistolik" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="dia" name="Diastolik" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="hr" name="Rrahjet/min" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* O2 Sat chart */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4">Saturimi i Oksigjenit (%)</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="o2Gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis domain={[85, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                          labelStyle={{ fontWeight: 600, color: "#1e293b" }}
                        />
                        <Area type="monotone" dataKey="o2" name="O₂ Sat%" stroke="#22c55e" strokeWidth={2} fill="url(#o2Gradient)" dot={{ r: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                /* Fall back to table if not enough data points for charts */
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {["Testi", "Data", "Vlera", "Intervali Normal", "Statusi"].map(h => (
                          <th key={h} className="text-left text-xs font-medium text-slate-500 px-5 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {patient.labResults.map(l => (
                        <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5 text-sm text-slate-800">{l.test}</td>
                          <td className="px-5 py-3.5 text-xs text-slate-500">{formatDate(l.date)}</td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">{l.value} <span className="text-xs font-normal text-slate-400">{l.unit}</span></td>
                          <td className="px-5 py-3.5 text-xs text-slate-500">{l.normalRange}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs font-medium ${labStatusColor[l.status]}`}>
                              {l.status === "normal" ? "Normal" : l.status === "low" ? "Nën normë" : l.status === "high" ? "Mbi normë" : "Kritik"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* MEDIKAMENTET — grouped active / historical */}
          {activeTab === "Medikamentet" && (
            <div className="space-y-6">
              {/* Action bar */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{activeMeds.length} medikamente aktive · {inactiveMeds.length} historike</p>
                <button
                  onClick={checkDrugInteractions}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors"
                >
                  <TriangleAlert className="w-3.5 h-3.5" /> Kontrollo Ndërveprimet
                </button>
              </div>

              {/* Active */}
              {activeMeds.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h3 className="text-sm font-semibold text-slate-700">Aktive</h3>
                  </div>
                  <div className="space-y-3">
                    {activeMeds.map(m => (
                      <div key={m.id} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                          <Pill className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-800 font-semibold text-sm">{m.name}</span>
                            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">{m.dose}</span>
                            <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full">Aktiv</span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                            <span>Frekuenca: {m.frequency}</span>
                            <span>Nga: {formatDate(m.startDate)}</span>
                            <span>Mjeku: {m.doctor}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historical */}
              {inactiveMeds.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-500">Historike</h3>
                  </div>
                  <div className="space-y-3">
                    {inactiveMeds.map(m => (
                      <div key={m.id} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Pill className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex-1 opacity-75">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-600 font-medium text-sm line-through">{m.name}</span>
                            <span className="text-xs bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{m.dose}</span>
                            <span className="text-xs bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">Joaktiv</span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
                            <span>Frekuenca: {m.frequency}</span>
                            <span>Nga: {formatDate(m.startDate)}</span>
                            <span>Mjeku: {m.doctor}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* KLINIKA */}
          {activeTab === "Klinika" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50">
                <Building2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-800 font-medium">Tërheqja Automatike e Dokumenteve</p>
                  <p className="text-xs text-slate-500 mt-0.5">Kur pacienti viziton një klinikë private, dokumenti tërhiqet automatikisht dhe shtohet këtu.</p>
                </div>
              </div>
              {patient.clinicDocuments.map(doc => (
                <div key={doc.id} className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-slate-800 font-semibold text-sm">{doc.clinicName}</span>
                          <span className="text-xs bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded">{doc.type}</span>
                        </div>
                        <p className="text-xs text-slate-400">{doc.doctor} • {formatDate(doc.date)}</p>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{doc.summary}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => pullClinicDocument(doc.id, doc.clinicName)}
                      disabled={pullingDoc === doc.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors disabled:opacity-50 shrink-0"
                    >
                      {pullingDoc === doc.id ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Duke tërhequr...</>
                      ) : (
                        <><FileDown className="w-3.5 h-3.5" /> Tërheq</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
              {patient.clinicDocuments.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm">Nuk ka dokumente nga klinika</div>
              )}
            </div>
          )}

          {/* AI PËRMBLEDHJE */}
          {activeTab === "AI Përmbledhje" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Smart Medical Summarizer</h3>
                    <p className="text-xs text-slate-500 mt-0.5">AI analizon historikun e plotë dhe krijon një përmbledhje klinike</p>
                  </div>
                  <button
                    onClick={generateSummary}
                    disabled={loadingAI}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {loadingAI ? "Duke gjeneruar..." : "Gjenero Përmbledhje"}
                  </button>
                </div>

                {aiSummary && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg border border-blue-100 bg-blue-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Zap className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{aiSummary}</p>
                    </div>
                  </motion.div>
                )}

                {!aiSummary && !loadingAI && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    Kliko "Gjenero Përmbledhje" për të marrë analizën AI
                  </div>
                )}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Drug Interaction Modal — keep dark overlay context */}
      <AnimatePresence>
        {showDrugModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDrugModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-lg rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <TriangleAlert className="w-4 h-4 text-amber-400" />
                  <h2 className="text-slate-800 font-semibold text-sm">Kontrolli i Ndërveprimeve të Barnave</h2>
                </div>
                <button onClick={() => setShowDrugModal(false)}>
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                </button>
              </div>

              <div className="p-5">
                {drugCheckLoading && (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <Loader2 className="w-7 h-7 text-[#3D8EF8] animate-spin" />
                    <p className="text-slate-500 text-sm">AI po analizon ndërveprimet...</p>
                  </div>
                )}

                {!drugCheckLoading && drugCheckResult && (
                  <>
                    <div className={`flex items-center gap-2.5 p-3 rounded-xl border mb-4 ${
                      drugCheckResult.safe
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-red-500/30 bg-red-500/10 text-red-400"
                    }`}>
                      {drugCheckResult.safe
                        ? <CheckCircle className="w-5 h-5 shrink-0" />
                        : <TriangleAlert className="w-5 h-5 shrink-0" />}
                      <p className="text-sm font-medium">
                        {drugCheckResult.safe
                          ? "Asnjë ndërveprim i rrezikshëm i gjetur"
                          : `${drugCheckResult.interactions.length} ndërveprim${drugCheckResult.interactions.length > 1 ? "e" : ""} i gjetur`}
                      </p>
                    </div>

                    {drugCheckResult.interactions.length > 0 && (
                      <div className="space-y-3">
                        {drugCheckResult.interactions.map((item, i) => {
                          const sevColor = item.severity === "high" || item.severity === "severe"
                            ? "border-red-500/20 bg-red-500/5 text-red-400"
                            : item.severity === "moderate" || item.severity === "medium"
                            ? "border-amber-500/20 bg-amber-500/5 text-amber-400"
                            : "border-yellow-500/20 bg-yellow-500/5 text-yellow-400";
                          return (
                            <div key={i} className={`p-3 rounded-xl border ${sevColor}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-sm">{item.drug}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-black/20">{item.severity}</span>
                              </div>
                              <p className="text-xs opacity-80 leading-relaxed">{item.description}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
