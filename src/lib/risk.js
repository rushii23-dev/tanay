// Preliminary, rule-based disease-risk index.
// This is NOT a trained or validated prediction model. It scores how closely a set of
// average weather conditions matches the conditions commonly reported as favourable for
// each disease in plant-pathology literature, on a 0–100 scale.
//
//   score = 100 × T × (wH × H + wR × R)
//   T = temperature suitability (trapezoid: 0 outside [min, max], 1 inside the optimum band)
//   H = humidity suitability    (linear ramp from `hum[0]` to `hum[1]` % relative humidity)
//   R = rainfall suitability    (linear ramp on monthly rainfall, or a suppression curve)

export const DISEASES = [
  {
    id: 'rice-blast',
    name: 'Rice blast',
    crop: 'Rice',
    pathogen: 'Magnaporthe oryzae (fungus)',
    temp: [18, 24, 28, 32],
    hum: [60, 90],
    rain: { type: 'ramp', from: 50, to: 200 },
    weights: [0.6, 0.4],
    favoured: 'Warm days, cool humid nights and long periods of leaf wetness.',
    signs: 'Spindle-shaped grey lesions with brown edges on leaves; neck rot at heading.',
  },
  {
    id: 'bacterial-blight',
    name: 'Bacterial leaf blight',
    crop: 'Rice',
    pathogen: 'Xanthomonas oryzae pv. oryzae (bacterium)',
    temp: [20, 25, 34, 38],
    hum: [65, 90],
    rain: { type: 'ramp', from: 100, to: 300 },
    weights: [0.5, 0.5],
    favoured: 'Hot, humid weather with heavy, wind-driven rain and flooded fields.',
    signs: 'Yellow, wavy-edged stripes from the leaf tip that turn straw-coloured.',
  },
  {
    id: 'yellow-rust',
    name: 'Yellow rust',
    crop: 'Wheat',
    pathogen: 'Puccinia striiformis f. sp. tritici (fungus)',
    temp: [5, 10, 15, 20],
    hum: [55, 85],
    rain: { type: 'ramp', from: 10, to: 60 },
    weights: [0.6, 0.4],
    favoured: 'Cool weather with dew, fog or light rain.',
    signs: 'Yellow powdery pustules in stripes along the leaf veins.',
  },
  {
    id: 'leaf-rust',
    name: 'Leaf rust',
    crop: 'Wheat',
    pathogen: 'Puccinia triticina (fungus)',
    temp: [10, 15, 25, 30],
    hum: [55, 85],
    rain: { type: 'ramp', from: 10, to: 60 },
    weights: [0.6, 0.4],
    favoured: 'Mild temperatures with dew or light rain on the leaves.',
    signs: 'Small, round orange-brown pustules scattered on the upper leaf surface.',
  },
  {
    id: 'late-blight',
    name: 'Late blight',
    crop: 'Potato, tomato',
    pathogen: 'Phytophthora infestans (oomycete)',
    temp: [10, 18, 22, 27],
    hum: [70, 95],
    rain: { type: 'ramp', from: 30, to: 150 },
    weights: [0.6, 0.4],
    favoured: 'Cool, very humid, overcast weather with frequent rain.',
    signs: 'Water-soaked dark patches on leaves with white growth underneath.',
  },
  {
    id: 'powdery-mildew',
    name: 'Powdery mildew',
    crop: 'Pea, wheat, cucurbits',
    pathogen: 'Erysiphales (fungi)',
    temp: [15, 20, 25, 30],
    hum: [45, 75],
    rain: { type: 'suppress', from: 20, to: 150 },
    weights: [0.7, 0.3],
    favoured: 'Warm, dry days with humid nights. Heavy rain washes spores off.',
    signs: 'White, flour-like patches on leaves and stems.',
  },
];

const clamp01 = (x) => Math.max(0, Math.min(1, x));

export function tempSuit(t, [min, lo, hi, max]) {
  if (t <= min || t >= max) return 0;
  if (t < lo) return (t - min) / (lo - min);
  if (t <= hi) return 1;
  return (max - t) / (max - hi);
}
export const humSuit = (h, [a, b]) => clamp01((h - a) / (b - a));
export function rainSuit(r, rain) {
  const x = clamp01((r - rain.from) / (rain.to - rain.from));
  return rain.type === 'suppress' ? 1 - 0.7 * x : x;
}

export function level(score) {
  if (score < 25) return { key: 'good', label: 'Low' };
  if (score < 50) return { key: 'warning', label: 'Moderate' };
  if (score < 75) return { key: 'serious', label: 'High' };
  return { key: 'critical', label: 'Very high' };
}

export function scoreDisease(d, { temperature, humidity, rainfall }) {
  const T = tempSuit(temperature, d.temp);
  const H = humSuit(humidity, d.hum);
  const R = rainSuit(rainfall, d.rain);
  const score = Math.round(100 * T * (d.weights[0] * H + d.weights[1] * R));
  return { score, T, H, R, level: level(score) };
}

export const diseaseById = Object.fromEntries(DISEASES.map((d) => [d.id, d]));
