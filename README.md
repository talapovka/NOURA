# NOURA

NOURA is a Russian-language nutrition planning web app. It builds a daily meal plan around a chosen goal, budget, cooking time, allergies and food preferences. Likes and dislikes influence later recommendations. The recipe view includes guided cooking steps and timers.

## Run locally

Requirements: Node.js 22.13 or newer and npm.

```bash
npm ci
npm run dev
```

Open the local URL shown in the terminal (usually `http://localhost:5173/`). For a production build, run `npm run build`.

## What is included

- Goal-based onboarding and daily calorie/macronutrient targets
- Daily meal recommendations and a multi-day planner
- Recipe catalog with filters, favorites, likes and dislikes
- Cooking steps with timers and sound notifications
- Shopping list and progress tracking
- Local browser storage for preferences and plans

The current recommendation engine is rule-based; it does not call a hosted AI model. Recipe nutrition and price values are estimates, not medical or financial advice. Recipe imagery and source information come from [TheMealDB](https://www.themealdb.com/).

The app is built with Next.js, React, TypeScript, Tailwind CSS, Vinext and Cloudflare tooling. No API key is required for local use. The public `.openai/hosting.json` has no database or storage bindings.
