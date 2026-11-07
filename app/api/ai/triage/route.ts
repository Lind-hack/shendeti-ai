import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { symptoms, vitals } = await req.json();
  const model = getGeminiModel();

  const prompt = `Ti je mjek urgjence. Vlerëso urgjencën e rastit mjekësor dhe kthe përgjigje VETËM si JSON.

Simptomat: ${Array.isArray(symptoms) ? symptoms.join(", ") : symptoms}
Shenjat vitale: ${vitals ? `BP ${vitals.bp_sys}/${vitals.bp_dia} mmHg, HR ${vitals.hr} bpm, Temperatura ${vitals.temp}°C, O2 ${vitals.o2sat}%` : "nuk u dhanë"}

Kthe saktësisht këtë format JSON (pa tekst tjetër):
{
  "level": "critical|high|medium|low",
  "reasoning": "shpjegim i shkurtër klinik në shqip (2-3 fjali) pse ky nivel urgjence"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
  return NextResponse.json(json);
}
