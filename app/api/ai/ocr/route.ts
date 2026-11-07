import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { imageBase64, mediaType } = await req.json();
  const model = getGeminiModel();

  const result = await model.generateContent([
    { inlineData: { mimeType: mediaType || "image/jpeg", data: imageBase64 } },
    `Ky është një dokument mjekësor. Nxjerr të gjitha të dhënat e strukturuara dhe ktheje si JSON saktësisht në këtë format (pa tekst tjetër):
{
  "patientName": "emri i pacientit nëse gjendet",
  "date": "data e dokumentit",
  "doctor": "emri i mjekut",
  "clinic": "emri i klinikës/spitalit",
  "diagnosis": "diagnoza kryesore",
  "medications": ["medikamenti 1", "medikamenti 2"],
  "labResults": ["rezultati 1: vlera", "rezultati 2: vlera"],
  "rawText": "teksti i plotë i nxjerrë nga dokumenti"
}

Nëse nuk e gjen ndonjë fushë, lëre null. Nëse nuk ka medikamente ose rezultate, lëri si array bosh.`
  ]);

  const text = result.response.text();
  const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
  return NextResponse.json(json);
}
