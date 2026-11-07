import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { transcript } = await req.json();
  const model = getGeminiModel();

  const prompt = `Ky është një transkript i një raporti mjekësor të diktuar. Strukturoje si dokument klinik dhe ktheje si JSON saktësisht në këtë format (pa tekst tjetër):

Transkripti: "${transcript}"

{
  "category": "Raport Vizite|Raport Laboratorik|Raport Kirurgjik|Recetë|Tjetër",
  "date": "data e sotme nëse nuk përmendet tjetër",
  "doctor": "emri i mjekut nëse përmendet, ndryshe 'I panjohur'",
  "patient": "emri i pacientit nëse përmendet, ndryshe 'I panjohur'",
  "chiefComplaint": "ankesa kryesore e pacientit",
  "findings": ["gjetja klinike 1", "gjetja klinike 2"],
  "diagnosis": "diagnoza e vendosur",
  "plan": "plani i trajtimit",
  "rawText": "${transcript}"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
  return NextResponse.json(json);
}
