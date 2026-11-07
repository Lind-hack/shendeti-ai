"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check, Plus, X, User, Heart, Pill, Phone } from "lucide-react";
import { toast } from "sonner";

type Step = 1 | 2 | 3 | 4;

interface FormData {
  firstName: string;
  lastName: string;
  dob: string;
  gender: "M" | "F" | "";
  bloodType: string;
  idNumber: string;
  phone: string;
  email: string;
  address: string;
  insuranceNumber: string;
  conditions: string[];
  newCondition: string;
  allergies: { substance: string; severity: "mild" | "moderate" | "severe" }[];
  newAllergySubstance: string;
  newAllergySeverity: "mild" | "moderate" | "severe";
  medications: { name: string; dose: string; frequency: string; startDate: string; doctor: string }[];
  newMedName: string;
  newMedDose: string;
  newMedFreq: string;
  newMedDate: string;
  newMedDoctor: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
}

const STEPS = [
  { label: "Personale", icon: User },
  { label: "Mjekësor", icon: Heart },
  { label: "Medikamente", icon: Pill },
  { label: "Kontakt", icon: Phone },
];

const BLOOD_TYPES = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];

export default function NewPatientPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  const [form, setForm] = useState<FormData>({
    firstName: "", lastName: "", dob: "", gender: "", bloodType: "", idNumber: "",
    phone: "", email: "", address: "", insuranceNumber: "",
    conditions: [], newCondition: "",
    allergies: [], newAllergySubstance: "", newAllergySeverity: "mild",
    medications: [], newMedName: "", newMedDose: "", newMedFreq: "", newMedDate: "", newMedDoctor: "",
    emergencyName: "", emergencyRelation: "", emergencyPhone: "",
  });

  const set = (field: keyof FormData, value: any) => setForm(f => ({ ...f, [field]: value }));

  function addCondition() {
    const val = form.newCondition.trim();
    if (!val) return;
    set("conditions", [...form.conditions, val]);
    set("newCondition", "");
  }

  function removeCondition(i: number) {
    set("conditions", form.conditions.filter((_, idx) => idx !== i));
  }

  function addAllergy() {
    const val = form.newAllergySubstance.trim();
    if (!val) return;
    set("allergies", [...form.allergies, { substance: val, severity: form.newAllergySeverity }]);
    set("newAllergySubstance", "");
  }

  function removeAllergy(i: number) {
    set("allergies", form.allergies.filter((_, idx) => idx !== i));
  }

  function addMedication() {
    if (!form.newMedName.trim()) return;
    set("medications", [...form.medications, {
      name: form.newMedName.trim(), dose: form.newMedDose.trim(),
      frequency: form.newMedFreq.trim(), startDate: form.newMedDate,
      doctor: form.newMedDoctor.trim()
    }]);
    set("newMedName", ""); set("newMedDose", ""); set("newMedFreq", ""); set("newMedDate", ""); set("newMedDoctor", "");
  }

  function removeMedication(i: number) {
    set("medications", form.medications.filter((_, idx) => idx !== i));
  }

  function validateStep(): boolean {
    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.dob || !form.gender || !form.phone) {
        toast.error("Plotëso fushat e detyrueshme");
        return false;
      }
    }
    if (step === 4) {
      if (!form.emergencyName || !form.emergencyPhone) {
        toast.error("Plotëso emrin dhe numrin e kontaktit urgjent");
        return false;
      }
    }
    return true;
  }

  function next() {
    if (!validateStep()) return;
    if (step < 4) setStep(s => (s + 1) as Step);
  }

  function back() {
    if (step > 1) setStep(s => (s - 1) as Step);
  }

  function submit() {
    if (!validateStep()) return;
    toast.success("Pacienti u shtua me sukses!");
    router.push("/patients");
  }

  const severityLabel = { mild: "Lehtë", moderate: "Mesatare", severe: "Rëndë" };
  const severityColor = { mild: "text-amber-400 bg-amber-500/10 border-amber-500/20", moderate: "text-orange-400 bg-orange-500/10 border-orange-500/20", severe: "text-red-400 bg-red-500/10 border-red-500/20" };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Shto Pacient të Ri</h1>
        <p className="text-slate-500 text-sm mt-1">Plotëso të dhënat mjekësore të pacientit</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => {
          const stepNum = (i + 1) as Step;
          const active = step === stepNum;
          const done = step > stepNum;
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 py-2 px-3 rounded-xl border transition-all duration-300 flex-1 ${
                active ? "border-[#3D8EF8] bg-[#3D8EF8]/10" : done ? "border-emerald-500/30 bg-emerald-500/8" : "border-gray-200 bg-white"
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  active ? "bg-[#3D8EF8]" : done ? "bg-emerald-500" : "bg-gray-200"
                }`}>
                  {done ? <Check className="w-3 h-3 text-white" /> : <Icon className={`w-3 h-3 ${active ? "text-white" : "text-slate-400"}`} />}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${active ? "text-[#3D8EF8]" : done ? "text-emerald-400" : "text-slate-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-4 h-0.5 shrink-0 rounded-full ${done ? "bg-emerald-500/50" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="p-6 space-y-5"
          >
            {/* STEP 1: Personal info */}
            {step === 1 && (
              <>
                <h2 className="text-slate-800 font-semibold mb-1">Të Dhëna Personale</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Emri *">
                    <input className={inputCls} placeholder="Artan" value={form.firstName} onChange={e => set("firstName", e.target.value)} />
                  </Field>
                  <Field label="Mbiemri *">
                    <input className={inputCls} placeholder="Berisha" value={form.lastName} onChange={e => set("lastName", e.target.value)} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Datëlindja *">
                    <input type="date" className={inputCls} value={form.dob} onChange={e => set("dob", e.target.value)} />
                  </Field>
                  <Field label="Gjinia *">
                    <select className={inputCls} value={form.gender} onChange={e => set("gender", e.target.value)}>
                      <option value="">Zgjedh...</option>
                      <option value="M">Mashkull</option>
                      <option value="F">Femër</option>
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Grupi i Gjakut">
                    <select className={inputCls} value={form.bloodType} onChange={e => set("bloodType", e.target.value)}>
                      <option value="">Zgjedh...</option>
                      {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </Field>
                  <Field label="Numri i ID">
                    <input className={inputCls} placeholder="1234567890" value={form.idNumber} onChange={e => set("idNumber", e.target.value)} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Telefoni *">
                    <input className={inputCls} placeholder="+383 44 000 000" value={form.phone} onChange={e => set("phone", e.target.value)} />
                  </Field>
                  <Field label="Email">
                    <input type="email" className={inputCls} placeholder="email@domain.com" value={form.email} onChange={e => set("email", e.target.value)} />
                  </Field>
                </div>
                <Field label="Adresa">
                  <input className={inputCls} placeholder="Rr. Nënë Tereza 12, Prishtinë" value={form.address} onChange={e => set("address", e.target.value)} />
                </Field>
                <Field label="Numri i Sigurimit">
                  <input className={inputCls} placeholder="INS-YYYY-XXXXX" value={form.insuranceNumber} onChange={e => set("insuranceNumber", e.target.value)} />
                </Field>
              </>
            )}

            {/* STEP 2: Medical history */}
            {step === 2 && (
              <>
                <h2 className="text-slate-800 font-semibold mb-1">Historiku Mjekësor</h2>

                <div>
                  <label className={labelCls}>Gjendje Kronike</label>
                  <div className="flex gap-2 mt-1.5">
                    <input
                      className={`${inputCls} flex-1`}
                      placeholder="p.sh. Hipertension"
                      value={form.newCondition}
                      onChange={e => set("newCondition", e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addCondition()}
                    />
                    <button onClick={addCondition} className={addBtnCls}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {form.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.conditions.map((c, i) => (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3D8EF8]/10 border border-[#3D8EF8]/20 text-[#3D8EF8] text-xs">
                          {c}
                          <button onClick={() => removeCondition(i)}><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Alergjitë</label>
                  <div className="flex gap-2 mt-1.5">
                    <input
                      className={`${inputCls} flex-1`}
                      placeholder="Substanca (p.sh. Penicillin)"
                      value={form.newAllergySubstance}
                      onChange={e => set("newAllergySubstance", e.target.value)}
                    />
                    <select className={`${inputCls} w-32`} value={form.newAllergySeverity} onChange={e => set("newAllergySeverity", e.target.value as any)}>
                      <option value="mild">Lehtë</option>
                      <option value="moderate">Mesatare</option>
                      <option value="severe">Rëndë</option>
                    </select>
                    <button onClick={addAllergy} className={addBtnCls}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {form.allergies.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {form.allergies.map((a, i) => (
                        <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${severityColor[a.severity]}`}>
                          <span className="font-medium">{a.substance}</span>
                          <div className="flex items-center gap-2">
                            <span>{severityLabel[a.severity]}</span>
                            <button onClick={() => removeAllergy(i)}><X className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* STEP 3: Medications */}
            {step === 3 && (
              <>
                <h2 className="text-slate-800 font-semibold mb-1">Medikamentet Aktuale</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Emri i Medikamentit">
                    <input className={inputCls} placeholder="p.sh. Lisinopril" value={form.newMedName} onChange={e => set("newMedName", e.target.value)} />
                  </Field>
                  <Field label="Doza">
                    <input className={inputCls} placeholder="p.sh. 10mg" value={form.newMedDose} onChange={e => set("newMedDose", e.target.value)} />
                  </Field>
                  <Field label="Frekuenca">
                    <input className={inputCls} placeholder="p.sh. 1x ditë" value={form.newMedFreq} onChange={e => set("newMedFreq", e.target.value)} />
                  </Field>
                  <Field label="Data e Fillimit">
                    <input type="date" className={inputCls} value={form.newMedDate} onChange={e => set("newMedDate", e.target.value)} />
                  </Field>
                  <Field label="Mjeku Përshkrues" className="col-span-2">
                    <div className="flex gap-2">
                      <input className={`${inputCls} flex-1`} placeholder="Dr. Gashi" value={form.newMedDoctor} onChange={e => set("newMedDoctor", e.target.value)} />
                      <button onClick={addMedication} className={addBtnCls}>
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </Field>
                </div>

                {form.medications.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {form.medications.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-slate-50">
                        <div>
                          <span className="text-slate-800 text-sm font-medium">{m.name}</span>
                          <span className="text-[#3D8EF8] text-xs ml-2 bg-[#3D8EF8]/10 px-2 py-0.5 rounded">{m.dose}</span>
                          <p className="text-slate-500 text-xs mt-0.5">{m.frequency} · {m.doctor}</p>
                        </div>
                        <button onClick={() => removeMedication(i)}>
                          <X className="w-4 h-4 text-slate-400 hover:text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {form.medications.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-4 border border-dashed border-gray-300 rounded-xl">
                    Asnjë medikament i shtuar — mund ta kalosh këtë hap
                  </p>
                )}
              </>
            )}

            {/* STEP 4: Emergency contact */}
            {step === 4 && (
              <>
                <h2 className="text-slate-800 font-semibold mb-1">Kontakti i Urgjencës</h2>
                <Field label="Emri i Plotë *">
                  <input className={inputCls} placeholder="Mimoza Berisha" value={form.emergencyName} onChange={e => set("emergencyName", e.target.value)} />
                </Field>
                <Field label="Lidhja Familjare">
                  <input className={inputCls} placeholder="Grua / Babë / Motër..." value={form.emergencyRelation} onChange={e => set("emergencyRelation", e.target.value)} />
                </Field>
                <Field label="Telefoni *">
                  <input className={inputCls} placeholder="+383 44 000 000" value={form.emergencyPhone} onChange={e => set("emergencyPhone", e.target.value)} />
                </Field>

                <div className="mt-2 p-4 rounded-xl border border-gray-200 bg-slate-50">
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Duke shtuar këtë pacient, konfirmoni se të gjitha të dhënat janë korrekte dhe se keni autorizimin e nevojshëm sipas rregulloreve të mbrojtjes së të dhënave (GDPR-KS).
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer buttons */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-slate-500 text-sm hover:border-blue-300 hover:text-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Prapa
          </button>
          {step < 4 ? (
            <button
              onClick={next}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3D8EF8] text-white text-sm font-medium hover:bg-[#2F7AE5] transition-colors"
            >
              Vazhdoj <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors"
            >
              <Check className="w-4 h-4" /> Ruaj Pacientin
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className={labelCls}>{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#3D8EF8]/50 transition-colors";
const labelCls = "text-slate-500 text-xs font-medium block";
const addBtnCls = "w-10 h-10 rounded-xl bg-[#3D8EF8]/10 border border-[#3D8EF8]/20 text-[#3D8EF8] flex items-center justify-center hover:bg-[#3D8EF8]/20 transition-colors shrink-0";
