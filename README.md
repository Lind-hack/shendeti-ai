# Shendeti AI

AI-powered medical dashboard built by team **Bright Path** for a hackathon. Every patient gets a unique health profile; AI analyzes their data and helps doctors make faster decisions.

## Features

- Patient dashboard, profiles and new-patient intake
- Interactive 3D human body viewer: click a region for AI analysis
- AI triage, drug-interaction check, report structuring and summaries
- OCR for medical documents
- Clinics and reports views

## Stack

Next.js · TypeScript · Tailwind · shadcn/ui · React Three Fiber · Framer Motion · Google Gemini

## Run locally

```bash
npm install
echo "GOOGLE_AI_API_KEY=your_key" > .env.local
echo "NEXT_PUBLIC_MODELS_URL=https://shendeti-models.pages.dev" >> .env.local
npm run dev
```

The 3D anatomy models are served as meshopt-compressed `.glb` files from `NEXT_PUBLIC_MODELS_URL`. Without it, the app looks for the original `.gltf` files in `public/models/`, which are not in this repo (~316 MB).

## Credits

3D anatomy models by [Z-Anatomy](https://sketchfab.com/Z-Anatomy), licensed under [CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/) (see `public/models/*/license.txt`).
