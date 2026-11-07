import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { layer, x, y, conditions } = await req.json();
    const model = getGeminiModel("gemini-2.5-flash");

    const prompt = `You are a medical AI for a clinical platform. Identify the anatomical structure at the clicked point on a 3D body model.

System: "${layer}"
Y = ${Number(y).toFixed(3)}  (body axis: +1.27=head, +0.8=neck, +0.5=chest, +0.2=abdomen, 0=pelvis, -0.5=upper leg, -1.0=lower leg, -1.27=feet)
X = ${Number(x).toFixed(3)}  (left-right: negative=patient's left, positive=patient's right, ~0=center)

Anatomical systems:
- angiology: blood vessels (aorta, coronary arteries, carotid, femoral, iliac vessels, jugular)
- splanchnology: internal organs (heart, lungs, liver, kidneys, brain, stomach, intestines, bladder)
- myology: skeletal muscles (pectoralis, deltoid, biceps, rectus abdominis, quadriceps, gastrocnemius, trapezius)

Patient conditions: ${Array.isArray(conditions) && conditions.length > 0 ? conditions.join(", ") : "none"}

Identify the single most likely structure at those coordinates for the given system, then check if the patient's conditions affect it.

Respond ONLY with valid JSON (no markdown, no extra text, no explanation):
{
  "partAlbanian": "<anatomy name in Albanian>",
  "status": "<healthy|minor|critical>",
  "relatedConditions": [],
  "description": "<1-2 sentence clinical note in Albanian>"
}

Status rules:
- "critical": patient has a condition that directly and severely affects this structure
- "minor": patient has a condition partially related to this structure
- "healthy": no patient conditions relate to this structure
- relatedConditions: only condition strings from the patient list that directly affect this structure

Albanian anatomy name reference:
- Heart → Zemra | Lungs → Mushkëritë | Liver → Mëlçia | Kidneys → Veshkat | Brain → Truri
- Aorta → Aorta | Femoral artery → Arteria Femorare | Coronary artery → Arteria Koronare
- Stomach → Stomaku | Intestines → Zorrët | Bladder → Fshikëza
- Pectoralis → Muskuli Pektoral | Quadriceps → Quadricepsi | Deltoid → Muskuli Deltoid
- Gastrocnemius → Muskuli Gastroknemius | Trapezius → Muskuli Trapez | Biceps → Bicepsi`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");

    const isValid =
      json.partAlbanian &&
      json.partAlbanian.toLowerCase() !== layer.toLowerCase() &&
      ["healthy", "minor", "critical"].includes(json.status);

    if (!isValid) {
      return NextResponse.json({ error: "AI returned invalid anatomy data" }, { status: 500 });
    }

    json.relatedConditions = Array.isArray(json.relatedConditions) ? json.relatedConditions : [];
    return NextResponse.json(json);
  } catch (err) {
    console.error("region-click error:", err);
    return NextResponse.json({ error: "AI call failed" }, { status: 500 });
  }
}
