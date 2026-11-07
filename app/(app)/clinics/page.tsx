"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, FileDown, CheckCircle2, Loader2, MapPin, Phone, Clock, Shield } from "lucide-react";

type PullState = "idle" | "loading" | "done";

interface Clinic {
  id: string;
  name: string;
  specialty: string;
  address: string;
  phone: string;
  hours: string;
  docLabel: string;
  docId: string;
  verified: boolean;
}

const CLINICS: Clinic[] = [
  {
    id: "c1",
    name: "Klinika Shëndeti Plus",
    specialty: "Kardiologji & Mjekësi e Përgjithshme",
    address: "Rr. Nënë Tereza 42, Prishtinë",
    phone: "+383 44 123 456",
    hours: "E Hënë – E Shtunë, 08:00–20:00",
    docLabel: "Raport Kardiologjik — 14 mar 2024",
    docId: "DOC-KSP-2024-0314",
    verified: true,
  },
  {
    id: "c2",
    name: "Poliklina Medigroup",
    specialty: "Neurologji & Ortopedi",
    address: "Rr. Fehmi Agani 18, Prishtinë",
    phone: "+383 44 987 654",
    hours: "E Hënë – E Premte, 07:30–19:00",
    docLabel: "Ekografi Kolone — 02 qer 2024",
    docId: "DOC-MGP-2024-0602",
    verified: true,
  },
  {
    id: "c3",
    name: "Qendra Mjekësore Vita",
    specialty: "Laborator & Diagnostikë",
    address: "Bulevardi Bill Clinton 88, Prishtinë",
    phone: "+383 45 321 789",
    hours: "E Hënë – E Diel, 07:00–22:00",
    docLabel: "Analizë Gjaku — 28 maj 2024",
    docId: "DOC-VIT-2024-0528",
    verified: false,
  },
];

function FadeUp({ i, children }: { i: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: i * 0.08 }}
    >
      {children}
    </motion.div>
  );
}

function ClinicCard({ clinic }: { clinic: Clinic }) {
  const [state, setState] = useState<PullState>("idle");

  async function handlePull() {
    setState("loading");
    await new Promise((r) => setTimeout(r, 1800));
    setState("done");
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-5 shadow-sm hover:border-[#3D8EF8]/30 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3D8EF8]/10 border border-[#3D8EF8]/20 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-[#3D8EF8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 text-sm">{clinic.name}</h3>
              {clinic.verified && (
                <Shield className="w-3.5 h-3.5 text-[#10B981]" aria-label="Klinikë e verifikuar" />
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{clinic.specialty}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>{clinic.address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 shrink-0" />
          <span>{clinic.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>{clinic.hours}</span>
        </div>
      </div>

      {/* Document section */}
      <div className="rounded-lg bg-slate-50 border border-gray-200 p-3.5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-0.5">Dokument i disponueshëm</p>
          <p className="text-xs text-slate-600 font-medium">{clinic.docLabel}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{clinic.docId}</p>
        </div>
        <FileDown className="w-4 h-4 text-[#3D8EF8] shrink-0" />
      </div>

      {/* Pull button */}
      <button
        onClick={handlePull}
        disabled={state !== "idle"}
        className={
          "relative w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 " +
          (state === "done"
            ? "bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] cursor-default"
            : state === "loading"
            ? "bg-[#3D8EF8]/10 border border-[#3D8EF8]/20 text-[#3D8EF8] cursor-not-allowed"
            : "bg-[#3D8EF8] hover:bg-[#3D8EF8]/90 text-white border border-[#3D8EF8]")
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          {state === "idle" && (
            <motion.span
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Tërhiq Dokumentin
            </motion.span>
          )}
          {state === "loading" && (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Duke tërhequr…
            </motion.span>
          )}
          {state === "done" && (
            <motion.span
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Dokumenti u tërhoq
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

export default function ClinicsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <FadeUp i={0}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Klinika Private</h1>
          <p className="text-slate-500 text-sm">
            Tërheqja automatike e dokumenteve mjekësore nga klinika partnere.
          </p>
        </div>
      </FadeUp>

      {/* Info banner */}
      <FadeUp i={1}>
        <div className="mb-8 rounded-xl border border-[#3D8EF8]/20 bg-[#3D8EF8]/5 px-5 py-4 flex items-start gap-3">
          <Shield className="w-4 h-4 text-[#3D8EF8] shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="text-[#3D8EF8] font-semibold">Tërheqja e sigurt e të dhënave. </span>
            <span className="text-slate-500">
              Dokumentet tërhiqen me autorizimin tuaj dhe ruhen direkt në profilin e pacientit. Të dhënat janë të enkriptuara gjatë transferimit.
            </span>
          </div>
        </div>
      </FadeUp>

      {/* Clinic grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CLINICS.map((clinic, i) => (
          <FadeUp key={clinic.id} i={i + 2}>
            <ClinicCard clinic={clinic} />
          </FadeUp>
        ))}
      </div>
    </div>
  );
}
