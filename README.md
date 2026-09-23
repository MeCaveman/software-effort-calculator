# Software Effort Lab

A Vercel-ready, client-side calculator for the software-estimation methods used in the supplied lecture material.

## Included calculators

### Function Point + LOC

- Optimistic / Realistic / Pessimistic count estimation:
  - `Estimated count = (O + 4R + P) / 6`
- Direct-count mode for exercises that already provide a count
- Simple / Average / Complex weights for:
  - User inputs: 3 / 4 / 6
  - User outputs: 4 / 5 / 7
  - User inquiries: 3 / 4 / 6
  - Internal files: 7 / 10 / 15
  - External interfaces: 5 / 7 / 10
- Direct ΣFi input or all 14 General System Characteristics (0–5 each)
- `TCF = 0.65 + 0.01 × ΣFi`
- `FP = UFC × TCF`
- LOC backfiring using selectable, editable LOC/FP language factors
- Optional productivity, labor rate, cost/FP, total project cost, and effort
- Lecture examples 1–3 can be loaded from the UI

### Basic COCOMO

Uses the constants from the supplied lecture:

| Mode | C | K |
| --- | ---: | ---: |
| Organic | 3.2 | 1.05 |
| Semi-detached | 3.0 | 1.12 |
| Embedded | 2.8 | 1.20 |

Formula: `Effort = C × (KLOC)^K`

## LOC/FP source data

Primary source: QSM Function Point Languages Table v5.0. QSM describes these as empirical gearing factors and recommends calibrating against an organization's own completed projects when available.

Additional modern-language reference values are taken from published web/academic tables that cite empirical SPR-style backfiring ratios. Every factor in the UI is editable because LOC/FP is not a fixed property of a language.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production output is written to `dist/`.

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import the repository in Vercel.
3. Vercel will detect Vite.
4. Build command: `npm run build`
5. Output directory: `dist`

The included `vercel.json` already supplies these settings.
