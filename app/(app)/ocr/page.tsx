"use client";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileImage, Zap, Loader2, CheckCircle, Copy, Link2 } from "lucide-react";
import { toast } from "sonner";

interface OcrResult {
  patientName?: string;
  date?: string;
  doctor?: string;
  clinic?: string;
  diagnosis?: string;
  medications?: string[];
  labResults?: string[];
  rawText?: string;
}

export default function OcrPage() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) { toast.error("Ngarko vetëm imazhe"); return; }
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, []);

  async function runOcr() {
    if (!preview) return;
    setLoading(true);
    try {
      const base64 = preview.split(",")[1];
      const mediaType = file?.type ?? "image/jpeg";
      const res = await fetch("/api/ai/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType })
      });
      const data = await res.json();
      setResult(data);
    } catch {
      toast.error("Gabim gjatë OCR-it");
    }
    setLoading(false);
  }

  function copyField(val: string) {
    navigator.clipboard.writeText(val);
    toast.success("U kopjua");
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">AI OCR Digjitizues</h1>
        <p className="text-slate-500 text-sm mt-0.5">Ngarko dokument mjekësor fizik — AI nxjerr të dhënat strukturuar</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload zone */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer ${
              dragging ? "border-[#3D8EF8] bg-[#3D8EF8]/8" : "border-gray-300 bg-white hover:border-[#3D8EF8]/40"
            }`}
            style={{ minHeight: 280 }}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {preview ? (
              <div className="relative w-full h-full min-h-[280px]">
                <img src={preview} alt="preview" className="w-full h-full object-contain rounded-2xl p-2" />
                <div className="absolute top-3 right-3 bg-slate-900/60 backdrop-blur rounded-lg px-2.5 py-1.5 text-xs text-slate-200 flex items-center gap-1.5">
                  <FileImage className="w-3.5 h-3.5" />
                  {file?.name}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#3D8EF8]/10 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-[#3D8EF8]" />
                </div>
                <div className="text-center">
                  <p className="text-slate-800 font-medium text-sm">Zvarrit imazhin këtu</p>
                  <p className="text-slate-500 text-xs mt-1">ose kliko për të zgjedhur</p>
                  <p className="text-slate-500 text-xs mt-3">JPG, PNG, WEBP · Max 10MB</p>
                </div>
              </div>
            )}
          </div>

          {file && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={runOcr}
              disabled={loading}
              className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#3D8EF8] text-white text-sm font-medium hover:bg-[#2F7AE5] transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {loading ? "Duke analizuar dokumentin..." : "Nxjerr të Dhënat me AI"}
            </motion.button>
          )}
        </motion.div>

        {/* Results */}
        <div>
          <AnimatePresence>
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-slate-800">Të Dhënat e Nxjerra</span>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: "Emri i Pacientit", val: result.patientName },
                    { label: "Data", val: result.date },
                    { label: "Mjeku", val: result.doctor },
                    { label: "Klinika", val: result.clinic },
                    { label: "Diagnoza", val: result.diagnosis },
                  ].filter(f => f.val).map(f => (
                    <div key={f.label} className="flex items-start justify-between gap-3">
                      <span className="text-xs text-slate-500 shrink-0 mt-0.5 w-36">{f.label}</span>
                      <div className="flex items-start gap-2 flex-1">
                        <span className="text-sm text-slate-700 flex-1">{f.val}</span>
                        <button onClick={() => copyField(f.val!)} className="text-slate-400 hover:text-[#3D8EF8] transition-colors shrink-0">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {result.medications && result.medications.length > 0 && (
                    <div>
                      <span className="text-xs text-slate-500">Medikamentet</span>
                      <ul className="mt-1.5 space-y-1">
                        {result.medications.map((m, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-1.5">
                            <span className="text-[#3D8EF8]">•</span>{m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.labResults && result.labResults.length > 0 && (
                    <div>
                      <span className="text-xs text-slate-500">Rezultate Laboratorike</span>
                      <ul className="mt-1.5 space-y-1">
                        {result.labResults.map((l, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-1.5">
                            <span className="text-[#3D8EF8]">•</span>{l}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200">
                    <button className="flex items-center gap-2 text-xs text-[#3D8EF8] hover:underline">
                      <Link2 className="w-3.5 h-3.5" />
                      Lidhe me rekordin e pacientit
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                className="rounded-xl bg-white border border-gray-200 flex flex-col items-center justify-center"
                style={{ minHeight: 280 }}
              >
                <div className="w-12 h-12 rounded-xl bg-[#3D8EF8]/10 flex items-center justify-center mb-3">
                  <FileImage className="w-6 h-6 text-[#3D8EF8]/50" />
                </div>
                <p className="text-slate-500 text-sm">Rezultatet do shfaqen këtu</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
