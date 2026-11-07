import Link from "next/link";

export default function LandingPage() {
  const features = [
    {
      icon: "⚡",
      title: "Smart Medical Summarizer",
      desc: "AI analizon historikun e plotë të pacientit dhe gjeneron një përmbledhje klinike në sekonda."
    },
    {
      icon: "📷",
      title: "AI OCR Digjitizues",
      desc: "Ngarko dokument fizik — AI nxjerr të dhënat strukturuar dhe i shton automatikisht në rekord."
    },
    {
      icon: "💊",
      title: "Drug Interaction Detector",
      desc: "Para çdo recete të re, AI kontrollon ndërveprimet e rrezikshme me medikamentet aktuale."
    },
    {
      icon: "🎙️",
      title: "Voice-to-Text Raporte",
      desc: "Diktoni raportin mjekësor me zë — AI e strukturon dhe e kategorizon automatikisht."
    },
    {
      icon: "🚨",
      title: "Smart Emergency Triage",
      desc: "Futni simptomat dhe shenjat vitale — AI vlerëson urgjencën dhe arsyeton vendimin."
    },
    {
      icon: "🏥",
      title: "Tërheqja Automatike e Dokumenteve",
      desc: "Kur pacienti viziton klinikë private, dokumenti i tij tërhiqet automatikisht nga sistemi."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Nav */}
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Shendeti.AI.png" className="w-8 h-8 object-contain" alt="Shendeti AI" />
          <span className="font-bold text-slate-800 text-lg">Shendeti AI</span>
        </div>
        <Link href="/login?role=doctor">
          <button className="px-5 py-2 rounded-xl bg-[#3D8EF8] text-white text-sm font-medium hover:bg-[#2F7AE5] transition-colors">
            Hyr në Panel
          </button>
        </Link>
      </nav>

      {/* Hero */}
      <div className="px-6 pt-24 pb-20 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#3D8EF8]/30 bg-[#3D8EF8]/8 text-[#3D8EF8] text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3D8EF8]" />
          Platform Mjekësor me AI · Kosovë
        </div>
        <h1 className="text-5xl font-extrabold leading-tight mb-5 text-slate-800">
          Historiku i plotë shëndetësor <br />
          <span className="text-[#3D8EF8]">gjithmonë pranë</span>
        </h1>
        <p className="text-slate-500 text-lg leading-relaxed mb-10">
          Shendeti AI centralizon të dhënat mjekësore të pacientëve dhe përdor AI për të ndihmuar mjekët të marrin vendime më të shpejta dhe më të sigurta.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/login?role=doctor">
            <button className="px-7 py-3 rounded-xl bg-[#3D8EF8] text-white font-semibold hover:bg-[#2F7AE5] transition-colors shadow-md">
              Hyr si doktor
            </button>
          </Link>
          <Link href="/login?role=patient">
            <button className="px-7 py-3 rounded-xl border border-gray-200 text-slate-600 font-semibold hover:border-blue-300 transition-colors">
              Hyr si pacient
            </button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-[#3D8EF8]/30 transition-all duration-300">
              <span className="text-3xl mb-4 block">{f.icon}</span>
              <h3 className="text-slate-800 font-semibold mb-2 text-sm">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-8 text-center">
        <p className="text-slate-500 text-sm">Shendeti AI · E ndërtuar për sistemin shëndetësor shqiptar</p>
      </div>
    </div>
  );
}
