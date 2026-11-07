import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { patient } = await req.json();
  const model = getGeminiModel();

  const prompt = `Ti je një mjek specialist. Bazuar në informacionin e mëposhtëm të pacientit, shkruaj një përmbledhje klinike koncize dhe profesionale në gjuhën shqipe.

Pacienti: ${patient.firstName} ${patient.lastName}, ${new Date().getFullYear() - new Date(patient.dob).getFullYear()} vjeç
Grupi i gjakut: ${patient.bloodType}
Kushtet kronike: ${patient.conditions?.join(", ") || "asnjë"}
Alergji: ${patient.allergies?.map((a: {substance: string; severity: string}) => `${a.substance} (${a.severity})`).join(", ") || "asnjë"}
Medikamentet aktive: ${patient.medications?.filter((m: {active: boolean}) => m.active).map((m: {name: string; dose: string}) => `${m.name} ${m.dose}`).join(", ") || "asnjë"}
Vizita e fundit: ${patient.visits?.[0] ? `${patient.visits[0].date} - ${patient.visits[0].reason}` : "asnjë"}
Rezultate laboratorike: ${patient.labResults?.slice(0, 3).map((l: {test: string; value: string; unit: string; status: string}) => `${l.test}: ${l.value} ${l.unit} (${l.status})`).join(", ") || "asnjë"}
Shenjat vitale të fundit: ${patient.vitalSigns?.[0] ? `BP ${patient.vitalSigns[0].bp_sys}/${patient.vitalSigns[0].bp_dia}, HR ${patient.vitalSigns[0].hr}, O2 ${patient.vitalSigns[0].o2sat}%` : "asnjë"}

Shkruaj përmbledhjen klinike (3-4 fjali) që thekson: gjendjen aktuale, rreziqet kryesore, alergji të rëndësishme, dhe rekomandimet. Mos përdor tituj apo lista — vetëm paragraf të qartë klinik.`;

  const result = await model.generateContent(prompt);
  const summary = result.response.text();
  return NextResponse.json({ summary });
}
