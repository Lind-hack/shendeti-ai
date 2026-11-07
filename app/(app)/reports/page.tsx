"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Zap, Loader2, Printer, Download } from "lucide-react";
import { toast } from "sonner";

interface StructuredReport {
  category: string;
  date: string;
  doctor: string;
  patient: string;
  chiefComplaint: string;
  findings: string[];
  diagnosis: string;
  plan: string;
  rawText: string;
}

function buildReportHtml(report: StructuredReport): string {
  const findings = report.findings?.length
    ? `<div class="section"><h2>Gjetjet Klinike</h2><ul>${report.findings.map(f => `<li>${f}</li>`).join("")}</ul></div>`
    : "";
  return `<!DOCTYPE html>
<html lang="sq">
<head>
<meta charset="UTF-8"/>
<title>Raport Mjekësor — ${report.patient || "Pacient"}</title>
<style>
body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;color:#1e293b;font-size:14px}
.header{border-bottom:2px solid #3b82f6;padding-bottom:12px;margin-bottom:20px}
.logo{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.logo-icon{width:32px;height:32px;background:#3b82f6;border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:16px;line-height:1}
.logo-name{font-size:18px;font-weight:bold}
h1{font-size:20px;margin:0}
.badge{display:inline-block;background:#eff6ff;color:#3b82f6;border:1px solid #bfdbfe;border-radius:20px;padding:2px 10px;font-size:12px;font-weight:600;margin-right:6px}
.meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin:20px 0}
.meta div{background:#f8fafc;padding:10px 14px;border-radius:8px;border:1px solid #e2e8f0}
.meta label{font-size:11px;color:#64748b;display:block;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.04em}
.meta span{font-size:14px;font-weight:600}
.section{margin:16px 0}
.section h2{font-size:11px;color:#64748b;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.06em}
.section p{margin:0;line-height:1.6}
ul{margin:4px 0 0 18px;padding:0}
li{margin:3px 0;line-height:1.5}
.footer{margin-top:40px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8}
@media print{body{margin:20px}@page{margin:2cm}}
</style>
</head>
<body>
<div class="header">
  <div class="logo"><div class="logo-icon">S</div><span class="logo-name">Shendeti AI</span></div>
  <h1>${report.category ? `<span class="badge">${report.category}</span>` : ""}Raport Mjekësor</h1>
</div>
<div class="meta">
  <div><label>Pacienti</label><span>${report.patient || "—"}</span></div>
  <div><label>Mjeku</label><span>${report.doctor || "—"}</span></div>
  <div><label>Data</label><span>${report.date || new Date().toLocaleDateString("sq-AL")}</span></div>
</div>
<div class="section"><h2>Ankesa Kryesore</h2><p>${report.chiefComplaint || "—"}</p></div>
${findings}
<div class="section"><h2>Diagnoza</h2><p>${report.diagnosis || "—"}</p></div>
<div class="section"><h2>Plani i Trajtimit</h2><p>${report.plan || "—"}</p></div>
<div class="footer">Gjeneruar nga Shendeti AI · ${new Date().toLocaleString("sq-AL")}</div>
</body>
</html>`;
}

function handlePrint(report: StructuredReport) {
  const html = buildReportHtml(report);
  const win = window.open("", "_blank");
  if (!win) { return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

function handleDownload(report: StructuredReport) {
  const html = buildReportHtml(report);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `raport-${(report.patient || "pacient").replace(/\s+/g, "-").toLowerCase()}-${report.date || new Date().toISOString().slice(0, 10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<StructuredReport | null>(null);
  const recognitionRef = useRef<any>(null);

  function toggleRecording() {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Shfletuesi juaj nuk e mbështet zërin. Përdorni Chrome.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = "sq-AL";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e: any) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setTranscript(text);
    };

    rec.onerror = () => {
      setRecording(false);
      toast.error("Gabim gjatë regjistrimit");
    };

    rec.onend = () => setRecording(false);

    recognitionRef.current = rec;
    rec.start();
    setRecording(true);
  }

  async function structureReport() {
    if (!transcript.trim()) { toast.error("Nuk ka transkript"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/structure-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript })
      });
      const data = await res.json();
      setReport(data);
    } catch {
      toast.error("Gabim gjatë strukturimit");
    }
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">Raporte Voice-to-Text</h1>
        <p className="text-slate-500 text-sm mt-0.5">Diktoni raportin mjekësor — AI e strukturon automatikisht</p>
      </motion.div>

      {/* Record button */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={toggleRecording}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                recording
                  ? "bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                  : "bg-[#3D8EF8] hover:bg-[#2F7AE5] shadow-[0_0_20px_rgba(61,142,248,0.3)]"
              }`}
            >
              {recording && (
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
              )}
              {recording ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
            </button>
            <p className="text-sm text-slate-500">
              {recording ? "Duke regjistruar — kliko për të ndalur" : "Kliko për të filluar regjistrimin"}
            </p>
          </div>

          {/* Live transcript */}
          <div className="mt-5">
            <label className="text-xs font-medium text-slate-500 mb-2 block">Transkript</label>
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              rows={5}
              placeholder="Transkripti do shfaqet këtu gjatë diktimit. Mund ta editosh manualisht gjithashtu..."
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#3D8EF8]/50 resize-none transition-colors"
            />
          </div>

          {transcript && (
            <button
              onClick={structureReport}
              disabled={loading}
              className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3D8EF8] text-white text-sm font-medium hover:bg-[#2F7AE5] transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {loading ? "Duke strukturuar..." : "Strukturo me AI"}
            </button>
          )}
        </div>
      </motion.div>

      {/* Structured output */}
      <AnimatePresence>
        {report && (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#3D8EF8]" />
                  <span className="text-sm font-semibold text-slate-800">Raporti i Strukturuar</span>
                  <span className="text-xs bg-[#3D8EF8]/10 text-[#3D8EF8] border border-[#3D8EF8]/20 px-2 py-0.5 rounded-full">{report.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(report)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Shkarko
                  </button>
                  <button
                    onClick={() => handlePrint(report)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Printo / PDF
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Pacienti", val: report.patient },
                    { label: "Mjeku", val: report.doctor },
                    { label: "Data", val: report.date },
                  ].map(f => (
                    <div key={f.label} className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-0.5">{f.label}</p>
                      <p className="text-sm text-slate-800 font-medium">{f.val || "—"}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Ankesa Kryesore</p>
                    <p className="text-sm text-slate-600">{report.chiefComplaint}</p>
                  </div>
                  {report.findings.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Gjetjet Klinike</p>
                      <ul className="space-y-1">
                        {report.findings.map((f, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-1.5">
                            <span className="text-[#3D8EF8]">•</span>{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Diagnoza</p>
                    <p className="text-sm text-slate-600">{report.diagnosis}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Plani i Trajtimit</p>
                    <p className="text-sm text-slate-600">{report.plan}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
