"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role") === "patient" ? "patient" : "doctor";
  const [isSignUp, setIsSignUp] = useState(false);
  const [idNumber, setIdNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [idError, setIdError] = useState("");

  function handleIdChange(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    setIdNumber(digits);
    if (idError && digits.length === 10) setIdError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (idNumber.length !== 10) {
      setIdError("Numri i letërnjoftimit duhet të ketë saktësisht 10 shifra");
      return;
    }
    toast.success(isSignUp ? "Llogaria u krijua!" : "Hyrje e suksesshme!");
    router.push("/dashboard");
  }

  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#3D8EF8]/50 transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-1 text-slate-500 text-sm mb-6 hover:text-slate-700 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Kthehu
        </Link>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center gap-2.5 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Shendeti.AI.png" className="w-8 h-8 object-contain" alt="Shendeti AI" />
            <span className="font-bold text-slate-800 text-lg">Shendeti AI</span>
          </div>
          <div className="mb-6">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              role === "doctor"
                ? "bg-[#3D8EF8]/10 text-[#3D8EF8] border-[#3D8EF8]/20"
                : "bg-emerald-50 text-emerald-600 border-emerald-200"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${role === "doctor" ? "bg-[#3D8EF8]" : "bg-emerald-500"}`} />
              {role === "doctor" ? "Mjek" : "Pacient"}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-1">
            {isSignUp ? "Krijo llogari" : "Hyr në llogari"}
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            {isSignUp ? "Regjistrohu me numrin e letërnjoftimit" : "Hyr me numrin e letërnjoftimit"}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <input className={inputCls} placeholder="Emri" value={firstName} onChange={e => setFirstName(e.target.value)} />
                <input className={inputCls} placeholder="Mbiemri" value={lastName} onChange={e => setLastName(e.target.value)} />
              </>
            )}
            <div>
              <input
                className={`${inputCls} ${idError ? "border-red-300 focus:border-red-400" : ""}`}
                placeholder="Numri i letërnjoftimit (10 shifra)"
                value={idNumber}
                onChange={e => handleIdChange(e.target.value)}
                inputMode="numeric"
                maxLength={10}
              />
              {idError && <p className="text-red-500 text-xs mt-1.5">{idError}</p>}
            </div>
            <input
              type="password"
              className={inputCls}
              placeholder={isSignUp ? "Krijo fjalëkalim" : "Fjalëkalimi"}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button type="submit" className="w-full py-3 rounded-xl bg-[#3D8EF8] text-white font-semibold text-sm hover:bg-[#2F7AE5] transition-colors">
              {isSignUp ? "Regjistrohu" : "Hyr"}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-5">
            {isSignUp ? "Ke llogari? " : "Nuk ke llogari? "}
            <button onClick={() => { setIsSignUp(v => !v); setIdError(""); }} className="text-[#3D8EF8] font-medium hover:underline">
              {isSignUp ? "Hyr" : "Regjistrohu"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
