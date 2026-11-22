# CropShield AI

A web-based agricultural analytics prototype for eight Indian states (Punjab, Uttar Pradesh, Maharashtra, Karnataka, Tamil Nadu,
West Bengal, Gujarat, Madhya Pradesh). It brings together weather, soil and crop-yield data, validates uploaded CSV datasets,
visualises indicators on interactive dashboards, compares regions, and calculates a preliminary rule-based disease-risk score.

Built with React 19, Vite, React Router, Recharts and PapaParse.

## Run it

```
npm install
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173). For a production build: `npm run build`, then `npm run preview`.

## Pages

| Page | What it shows |
|---|---|
| Home | Animated farm landscape, key numbers, the problem, 10 years of monsoon stripes, insights, state cards, pinned "how it works" scroll |
| States / state profile | Cards for all 8 states; each profile has insights, climate charts, soil, yields, crop calendar and disease calendar |
| Weather | Rain by season, wet and dry years (IMD categories), rainfall reliability, temperature and humidity heat maps, extremes |
| Soil | pH scale, soil texture triangle, organic carbon ratings, full property table, glossary |
| Crop yields | Small-multiple trends for 6 crops, ten-year summary table, top state per crop |
| Compare | Any combination of states on one chart |
| Check a dataset | CSV upload with 11 validation checks, cleaned download and issue list |
| Disease risk | Rule-based score for six diseases with the full calculation |
| Disease library | Cause, signs, favourable conditions, good practice and riskiest state-months for each disease |
| How it works | Pipeline, data integration, risk-score curves, technology |
| Data sources | Every dataset with coverage, licence and CSV download |
| About the project | Background, problems, objectives, scope, outcome and future work |

Animations use GSAP ScrollTrigger and Lenis smooth scrolling, and switch off for users who prefer reduced motion.

## Data (all real, all public)

| Data | Source | Coverage |
|---|---|---|
| Weather | NASA POWER monthly point API (MERRA-2): temperature, humidity, precipitation | 2015–2024, one location per state, 960 records |
| Soil | ISRIC SoilGrids 2.0 (250 m): pH, organic carbon, nitrogen, sand/silt/clay, CEC, bulk density | 0–30 cm, 2–3 farmland points per state |
| Crop yield | Ministry of Agriculture & Farmers Welfare, via RBI Handbook of Statistics on Indian States (Nov 2023) | 2013-14 to 2022-23, 6 crops, 8 states + All India |

To rebuild the dataset:

```
node scripts/fetch-data.mjs data-raw/nasa-power-and-soilgrids.json
node scripts/build-data.mjs data-raw/nasa-power-and-soilgrids.json data-raw/rbi-state-yields.json
```

`data-raw/` keeps the original downloads; `src/data/` holds the processed files the site uses.

## Disease-risk method

`score = 100 × T × (w₁·H + w₂·R)` where T, H and R are temperature, humidity and rainfall suitability (0–1) based on ranges
described in plant-pathology literature. It is a transparent rule-based index, **not** a trained or validated machine-learning
model. See `src/lib/risk.js`.
