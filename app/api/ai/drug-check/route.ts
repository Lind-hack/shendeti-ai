import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { currentMeds, newMed } = await req.json();
  const model = getGeminiModel();

  const prompt = `Ti je farmacist specialist. Kontrollo nëse ka ndërveprime të rrezikshme mes medikamenteve.

Medikamenti i ri: ${newMed ?? "asnjë (kontroll i plotë)"}
Medikamentet aktuale: ${currentMeds.join(", ")}

Kthe saktësisht këtë format JSON (pa tekst tjetër):
{
  "safe": true,
  "interactions": [
    {
      "drug": "emri i medikamentit konfliktues",
      "severity": "mild|moderate|severe",
      "description": "shpjegim i shkurtër i ndërhyrjes në shqip"
    }
  ]
}

Nëse nuk ka ndërveprime, kthe interactions si array bosh dhe safe si true.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? '{"safe":true,"interactions":[]}');
  return NextResponse.json(json);
}
