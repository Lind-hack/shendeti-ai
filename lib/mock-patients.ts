export type Allergy = { substance: string; severity: "mild" | "moderate" | "severe" };
export type Medication = { id: string; name: string; dose: string; frequency: string; startDate: string; doctor: string; active: boolean };
export type Diagnosis = { id: string; code: string; description: string; date: string; severity: "mild" | "moderate" | "severe" | "chronic" };
export type Visit = { id: string; date: string; doctor: string; specialty: string; reason: string; notes: string; clinic: string };
export type LabResult = { id: string; test: string; date: string; value: string; unit: string; normalRange: string; status: "normal" | "low" | "high" | "critical" };
export type VitalSign = { date: string; bp_sys: number; bp_dia: number; hr: number; temp: number; o2sat: number; weight: number; height?: number; bmi?: number; muscleMass?: number };
export type ClinicDocument = { id: string; clinicName: string; date: string; type: string; doctor: string; summary: string; fileUrl?: string };

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: "M" | "F";
  bloodType: string;
  idNumber: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: { name: string; relation: string; phone: string };
  allergies: Allergy[];
  conditions: string[];
  medications: Medication[];
  diagnoses: Diagnosis[];
  visits: Visit[];
  labResults: LabResult[];
  vitalSigns: VitalSign[];
  clinicDocuments: ClinicDocument[];
  triageLevel?: "critical" | "high" | "medium" | "low";
  triageReason?: string;
  lastUpdated: string;
  insuranceNumber: string;
};

export const mockPatients: Patient[] = [
  {
    id: "P001",
    firstName: "Artan",
    lastName: "Berisha",
    dob: "1975-03-14",
    gender: "M",
    bloodType: "A+",
    idNumber: "1234567890",
    phone: "+383 44 123 456",
    email: "artan.berisha@email.com",
    address: "Rr. Nënë Tereza 12, Prishtinë",
    emergencyContact: { name: "Mimoza Berisha", relation: "Grua", phone: "+383 44 789 012" },
    allergies: [
      { substance: "Penicillin", severity: "severe" },
      { substance: "Aspirin", severity: "moderate" }
    ],
    conditions: ["Hipertension", "Diabet tip 2"],
    medications: [
      { id: "M1", name: "Lisinopril", dose: "10mg", frequency: "1x ditë", startDate: "2022-01-15", doctor: "Dr. Gashi", active: true },
      { id: "M2", name: "Metformin", dose: "500mg", frequency: "2x ditë", startDate: "2021-06-01", doctor: "Dr. Krasniqi", active: true },
      { id: "M3", name: "Atorvastatin", dose: "20mg", frequency: "1x natë", startDate: "2023-03-10", doctor: "Dr. Gashi", active: true }
    ],
    diagnoses: [
      { id: "D1", code: "I10", description: "Hipertension esencial", date: "2021-05-20", severity: "chronic" },
      { id: "D2", code: "E11", description: "Diabet mellitus tip 2", date: "2021-06-01", severity: "chronic" },
      { id: "D3", code: "E78", description: "Hiperlipidemi", date: "2023-03-10", severity: "moderate" }
    ],
    visits: [
      { id: "V1", date: "2024-05-15", doctor: "Dr. Gashi", specialty: "Kardiologji", reason: "Kontroll rutinë", notes: "BP: 138/88. Medikamentet po funksionojnë mirë. Rekomandohet ushtrim fizik.", clinic: "Klinika Universitar" },
      { id: "V2", date: "2024-03-02", doctor: "Dr. Krasniqi", specialty: "Endokrinologji", reason: "Kontroll diabeti", notes: "HbA1c: 7.2%. Doza e Metformin mbetet e njëjtë.", clinic: "Klinika Universitar" },
      { id: "V3", date: "2023-11-20", doctor: "Dr. Osmani", specialty: "Mjekësi e Përgjithshme", reason: "Ethe dhe lodhje", notes: "Infeksion viral i rrugëve të sipërme respiratore. Rekomandim: pushim dhe hidratim.", clinic: "Ambulanca Prishtinë" }
    ],
    labResults: [
      { id: "L1", test: "HbA1c", date: "2024-03-02", value: "7.2", unit: "%", normalRange: "< 7.0", status: "high" },
      { id: "L2", test: "Glukoza e agjërimit", date: "2024-03-02", value: "6.8", unit: "mmol/L", normalRange: "3.9-5.5", status: "high" },
      { id: "L3", test: "Kolesterol total", date: "2024-02-15", value: "5.1", unit: "mmol/L", normalRange: "< 5.2", status: "normal" },
      { id: "L4", test: "Kreatinina", date: "2024-02-15", value: "88", unit: "µmol/L", normalRange: "62-115", status: "normal" }
    ],
    vitalSigns: [
      { date: "2024-05-15", bp_sys: 138, bp_dia: 88, hr: 72, temp: 36.6, o2sat: 98, weight: 82, height: 178, bmi: 29.2, muscleMass: 35 },
      { date: "2024-03-02", bp_sys: 142, bp_dia: 92, hr: 76, temp: 36.8, o2sat: 97, weight: 83 },
      { date: "2023-11-20", bp_sys: 135, bp_dia: 85, hr: 88, temp: 37.9, o2sat: 96, weight: 84 },
      { date: "2023-08-10", bp_sys: 140, bp_dia: 90, hr: 74, temp: 36.5, o2sat: 98, weight: 83 }
    ],
    clinicDocuments: [
      { id: "CD1", clinicName: "Klinika Medicom", date: "2024-04-10", type: "Ekzaminim Kardiologjik", doctor: "Dr. Hasani", summary: "EKG normale. Ekokardiografi tregon funksion normal të ventrikulit të majtë. Rekomandohet kontroll vjetor." },
      { id: "CD2", clinicName: "Laboratori Eurolabs", date: "2024-03-02", type: "Analizë gjaku", doctor: "Lab Tech", summary: "Panel i plotë biokimik. Rezultate brenda normës përveç HbA1c të ngritur lehtë." }
    ],
    triageLevel: "medium",
    triageReason: "Presion i ngritur",
    lastUpdated: "2024-05-15",
    insuranceNumber: "INS-2024-001234"
  },
  {
    id: "P002",
    firstName: "Vjosa",
    lastName: "Kelmendi",
    dob: "1990-07-22",
    gender: "F",
    bloodType: "O-",
    idNumber: "9876543210",
    phone: "+383 45 678 901",
    email: "vjosa.kelmendi@email.com",
    address: "Rr. Agim Ramadani 45, Prizren",
    emergencyContact: { name: "Besim Kelmendi", relation: "Vëlla", phone: "+383 45 234 567" },
    allergies: [
      { substance: "Latex", severity: "severe" },
      { substance: "Ibuprofen", severity: "mild" }
    ],
    conditions: ["Astmë", "Migrena"],
    medications: [
      { id: "M4", name: "Salbutamol", dose: "100mcg", frequency: "sipas nevojës", startDate: "2018-09-01", doctor: "Dr. Morina", active: true },
      { id: "M5", name: "Fluticasone", dose: "125mcg", frequency: "2x ditë", startDate: "2019-01-15", doctor: "Dr. Morina", active: true },
      { id: "M6", name: "Sumatriptan", dose: "50mg", frequency: "sipas nevojës", startDate: "2020-03-20", doctor: "Dr. Lahu", active: true }
    ],
    diagnoses: [
      { id: "D4", code: "J45", description: "Astma bronkiale", date: "2018-09-01", severity: "moderate" },
      { id: "D5", code: "G43", description: "Migrenë pa aura", date: "2020-03-20", severity: "moderate" }
    ],
    visits: [
      { id: "V4", date: "2024-04-28", doctor: "Dr. Morina", specialty: "Pulmonologji", reason: "Kontroll astme", notes: "Funksioni pulmonar stabil. FEV1 82%. Vazhdo me terapinë aktuale.", clinic: "Klinika SHEK Prizren" },
      { id: "V5", date: "2024-02-14", doctor: "Dr. Lahu", specialty: "Neurologji", reason: "Migrenë e fortë", notes: "3 episode migrene javën e fundit. Rrit dozën profilaktike. Shto Propranolol.", clinic: "Klinika SHEK Prizren" }
    ],
    labResults: [
      { id: "L5", test: "Spirometri FEV1", date: "2024-04-28", value: "82", unit: "%", normalRange: "> 80", status: "normal" },
      { id: "L6", test: "IgE totale", date: "2024-01-10", value: "340", unit: "IU/mL", normalRange: "< 100", status: "high" }
    ],
    vitalSigns: [
      { date: "2024-04-28", bp_sys: 118, bp_dia: 75, hr: 78, temp: 36.7, o2sat: 97, weight: 62, height: 162, bmi: 22.1, muscleMass: 32 },
      { date: "2024-02-14", bp_sys: 122, bp_dia: 78, hr: 92, temp: 36.5, o2sat: 96, weight: 62 }
    ],
    clinicDocuments: [
      { id: "CD3", clinicName: "Diagnostika Pro", date: "2024-01-10", type: "Teste Alergjike", doctor: "Dr. Bytyqi", summary: "Sensitizim ndaj poleneve, acarianeve dhe lateksit. IgE specifike pozitive për latex dhe albulina e peshkut." }
    ],
    triageLevel: "low",
    lastUpdated: "2024-04-28",
    insuranceNumber: "INS-2024-005678"
  },
  {
    id: "P003",
    firstName: "Driton",
    lastName: "Haliti",
    dob: "1958-11-03",
    gender: "M",
    bloodType: "B+",
    idNumber: "5678901234",
    phone: "+383 44 345 678",
    email: "driton.haliti@email.com",
    address: "Rr. Skënderbeu 88, Gjilan",
    emergencyContact: { name: "Shpresa Haliti", relation: "Bashkëshortja", phone: "+383 44 901 234" },
    allergies: [
      { substance: "Kontrastet Jodike", severity: "severe" },
      { substance: "Sulfonamide", severity: "moderate" }
    ],
    conditions: ["Sëmundja Koronare", "Insuficiencë Renale Kronike", "Fibrilacion Atrial"],
    medications: [
      { id: "M7", name: "Warfarin", dose: "5mg", frequency: "1x ditë", startDate: "2020-06-15", doctor: "Dr. Berisha", active: true },
      { id: "M8", name: "Bisoprolol", dose: "5mg", frequency: "1x ditë", startDate: "2020-06-15", doctor: "Dr. Berisha", active: true },
      { id: "M9", name: "Ramipril", dose: "2.5mg", frequency: "1x ditë", startDate: "2021-01-10", doctor: "Dr. Berisha", active: true },
      { id: "M10", name: "Furosemide", dose: "40mg", frequency: "1x mëngjes", startDate: "2022-03-05", doctor: "Dr. Berisha", active: true }
    ],
    diagnoses: [
      { id: "D6", code: "I25", description: "Sëmundja kronike ischemike kardiake", date: "2020-06-10", severity: "severe" },
      { id: "D7", code: "N18", description: "Sëmundja kronike renale st.3", date: "2021-01-10", severity: "moderate" },
      { id: "D8", code: "I48", description: "Fibrilacion atrial persistent", date: "2020-06-15", severity: "severe" }
    ],
    visits: [
      { id: "V6", date: "2024-05-20", doctor: "Dr. Berisha", specialty: "Kardiologji", reason: "URGJENCË - dhembje gjoksi", notes: "EKG: Fibrilacion atrial me rritje të HR. Troponin negativ. Kontroll INR: 1.8. Shto Digoxin.", clinic: "QKUK Gjilan" },
      { id: "V7", date: "2024-04-05", doctor: "Dr. Sopi", specialty: "Nefrologi", reason: "Kontroll renal", notes: "GFR: 42 mL/min. Kalium normal. Vazhdo me dozën aktuale të Ramiprilit.", clinic: "QKUK Gjilan" }
    ],
    labResults: [
      { id: "L7", test: "INR", date: "2024-05-20", value: "1.8", unit: "", normalRange: "2.0-3.0", status: "low" },
      { id: "L8", test: "Kreatinina", date: "2024-04-05", value: "168", unit: "µmol/L", normalRange: "62-115", status: "critical" },
      { id: "L9", test: "GFR", date: "2024-04-05", value: "42", unit: "mL/min", normalRange: "> 60", status: "low" },
      { id: "L10", test: "BNP", date: "2024-05-20", value: "820", unit: "pg/mL", normalRange: "< 100", status: "critical" }
    ],
    vitalSigns: [
      { date: "2024-05-20", bp_sys: 155, bp_dia: 98, hr: 112, temp: 37.1, o2sat: 94, weight: 78, height: 171, bmi: 31.4, muscleMass: 29 },
      { date: "2024-04-05", bp_sys: 148, bp_dia: 94, hr: 88, temp: 36.8, o2sat: 96, weight: 79 }
    ],
    clinicDocuments: [
      { id: "CD4", clinicName: "Klinika Kardio-Kosova", date: "2024-03-15", type: "Ekokardiografi", doctor: "Dr. Gjinovci", summary: "EF 38%. Dilatim i ventrikulit të majtë. Regurgitim mitral i moderuar. Rekomandohet kateterizim kardiak." },
      { id: "CD5", clinicName: "Klinika Kardio-Kosova", date: "2023-09-20", type: "Koronarografi", doctor: "Dr. Gjinovci", summary: "Stenozë 70% në LAD proksimal. Stentim me sukses. Pacient i qëndrueshëm post-procedurë." }
    ],
    triageLevel: "critical",
    triageReason: "Dhembje gjoksi + Fibrilacion Atrial",
    lastUpdated: "2024-05-20",
    insuranceNumber: "INS-2024-009876"
  },
  {
    id: "P004",
    firstName: "Blerta",
    lastName: "Sejdiu",
    dob: "2002-01-18",
    gender: "F",
    bloodType: "AB+",
    idNumber: "2345678901",
    phone: "+383 49 456 789",
    email: "blerta.sejdiu@email.com",
    address: "Rr. Fehmi Agani 23, Pejë",
    emergencyContact: { name: "Agron Sejdiu", relation: "Babë", phone: "+383 49 789 012" },
    allergies: [],
    conditions: ["Tiroidit Hashimoto"],
    medications: [
      { id: "M11", name: "Levothyroxine", dose: "75mcg", frequency: "1x mëngjes", startDate: "2023-02-01", doctor: "Dr. Gashi", active: true }
    ],
    diagnoses: [
      { id: "D9", code: "E06.3", description: "Tiroidit autoimune (Hashimoto)", date: "2023-02-01", severity: "mild" }
    ],
    visits: [
      { id: "V8", date: "2024-05-10", doctor: "Dr. Gashi", specialty: "Endokrinologji", reason: "Kontroll TSH", notes: "TSH 3.2 mU/L - brenda normës. Pacientia raporton lodhje të lehtë. Vazhdo me dozën.", clinic: "Klinika Endokrin Pejë" }
    ],
    labResults: [
      { id: "L11", test: "TSH", date: "2024-05-10", value: "3.2", unit: "mU/L", normalRange: "0.4-4.0", status: "normal" },
      { id: "L12", test: "fT4", date: "2024-05-10", value: "14.2", unit: "pmol/L", normalRange: "12-22", status: "normal" },
      { id: "L13", test: "Anti-TPO", date: "2024-05-10", value: "450", unit: "IU/mL", normalRange: "< 35", status: "critical" }
    ],
    vitalSigns: [
      { date: "2024-05-10", bp_sys: 112, bp_dia: 72, hr: 68, temp: 36.4, o2sat: 99, weight: 58, height: 165, bmi: 24.8, muscleMass: 34 }
    ],
    clinicDocuments: [
      { id: "CD6", clinicName: "Sonografia Pejë", date: "2024-05-10", type: "Ekografi tiroide", doctor: "Dr. Kuçi", summary: "Tiroide me teksturë heterogjenike, tipike për tiroidit Hashimoto. Pa nyje të dyshimta. Kontroll vjetor." }
    ],
    triageLevel: "low",
    lastUpdated: "2024-05-10",
    insuranceNumber: "INS-2024-003421"
  },
  {
    id: "P005",
    firstName: "Mentor",
    lastName: "Rrustemi",
    dob: "1980-09-05",
    gender: "M",
    bloodType: "A-",
    idNumber: "3456789012",
    phone: "+383 44 567 890",
    email: "mentor.rrustemi@email.com",
    address: "Rr. Lidhja e Prizrenit 7, Mitrovicë",
    emergencyContact: { name: "Zana Rrustemi", relation: "Grua", phone: "+383 44 890 123" },
    allergies: [
      { substance: "Codeine", severity: "moderate" }
    ],
    conditions: ["Artrit Reumatoid", "Osteoporozë"],
    medications: [
      { id: "M12", name: "Methotrexate", dose: "15mg", frequency: "1x javë", startDate: "2021-08-10", doctor: "Dr. Dushi", active: true },
      { id: "M13", name: "Folic Acid", dose: "5mg", frequency: "1x ditë (jo ditën e MTX)", startDate: "2021-08-10", doctor: "Dr. Dushi", active: true },
      { id: "M14", name: "Calcium + Vit D3", dose: "1000mg/800IU", frequency: "1x ditë", startDate: "2022-01-01", doctor: "Dr. Dushi", active: true }
    ],
    diagnoses: [
      { id: "D10", code: "M06.0", description: "Artrit reumatoid seropozitiv", date: "2021-08-10", severity: "moderate" },
      { id: "D11", code: "M81", description: "Osteoporozë pa frakturë", date: "2022-01-01", severity: "mild" }
    ],
    visits: [
      { id: "V9", date: "2024-05-08", doctor: "Dr. Dushi", specialty: "Reumatologji", reason: "Kontroll + nyje të fryrë", notes: "DAS28: 3.8. Aktivitet i moderuar. Shto Hydroxychloroquine 200mg 2x ditë.", clinic: "Klinika Reumatike Mitrovicë" }
    ],
    labResults: [
      { id: "L14", test: "RF (Faktor Reumatoid)", date: "2024-05-08", value: "142", unit: "IU/mL", normalRange: "< 14", status: "critical" },
      { id: "L15", test: "CRP", date: "2024-05-08", value: "28", unit: "mg/L", normalRange: "< 5", status: "high" },
      { id: "L16", test: "ALT (transaminaza)", date: "2024-05-08", value: "38", unit: "IU/L", normalRange: "7-40", status: "normal" }
    ],
    vitalSigns: [
      { date: "2024-05-08", bp_sys: 125, bp_dia: 80, hr: 74, temp: 36.9, o2sat: 98, weight: 77, height: 180, bmi: 26.3, muscleMass: 31 }
    ],
    clinicDocuments: [
      { id: "CD7", clinicName: "Radiologjia Mitrovicë", date: "2024-02-20", type: "Radiografi duarsh", doctor: "Dr. Mustafa", summary: "Erosion të lehta në artikulimet MCF II-III bilateral. Osteopeni difuze. Gjetje tipike për AR aktiv." }
    ],
    triageLevel: "medium",
    triageReason: "Inflamacion aktiv, nyje të fryrë",
    lastUpdated: "2024-05-08",
    insuranceNumber: "INS-2024-007654"
  }
];

export const getPatient = (id: string) => mockPatients.find(p => p.id === id);

export const getAge = (dob: string) => {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export const conditionToRegion: Record<string, { region: string; severity: "critical" | "high" | "medium" | "low" }> = {
  "Sëmundja Koronare":            { region: "chest",   severity: "critical" },
  "Fibrilacion Atrial":           { region: "chest",   severity: "critical" },
  "Insuficiencë Renale Kronike":  { region: "abdomen", severity: "high" },
  "Hipertension":                 { region: "head",    severity: "medium" },
  "Diabet tip 2":                 { region: "abdomen", severity: "medium" },
  "Astmë":                        { region: "chest",   severity: "low" },
  "Migrena":                      { region: "head",    severity: "low" },
  "Tiroidit Hashimoto":           { region: "neck",    severity: "low" },
  "Artrit Reumatoid":             { region: "joints",  severity: "medium" },
  "Osteoporozë":                  { region: "spine",   severity: "medium" },
};

export const severityColor: Record<string, string> = {
  critical: "#dc2626",
  high:     "#f97316",
  medium:   "#eab308",
  low:      "#22c55e",
  none:     "#94a3b8",
};

export const triageLevelConfig = {
  critical: { label: "Kritike", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", dot: "bg-red-500" },
  high: { label: "E Lartë", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", dot: "bg-orange-500" },
  medium: { label: "Mesatare", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", dot: "bg-amber-500" },
  low: { label: "E Ulët", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", dot: "bg-emerald-500" },
};
