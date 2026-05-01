const convert = require("convert-units");

// Map common cooking unit aliases → convert-units symbols
const UNIT_ALIAS = {
  // volume
  tablespoon: "Tbs", tablespoons: "Tbs", tbsp: "Tbs", tbsps: "Tbs",
  teaspoon: "tsp", teaspoons: "tsp", tsps: "tsp",
  cup: "cup", cups: "cup",
  "fl oz": "fl-oz", "fl. oz": "fl-oz", "fluid ounce": "fl-oz", "fluid ounces": "fl-oz",
  milliliter: "ml", milliliters: "ml", millilitre: "ml", millilitres: "ml", ml: "ml",
  liter: "l", liters: "l", litre: "l", litres: "l", l: "l",
  dl: "dl", cl: "cl",
  pint: "pnt", pints: "pnt",
  quart: "qt", quarts: "qt",
  gallon: "gal", gallons: "gal",
  // mass
  gram: "g", grams: "g", g: "g",
  kilogram: "kg", kilograms: "kg", kg: "kg",
  milligram: "mg", milligrams: "mg", mg: "mg",
  ounce: "oz", ounces: "oz", oz: "oz",
  pound: "lb", pounds: "lb", lb: "lb", lbs: "lb",
};

// Which base unit to aggregate into per measurement type
const MASS_BASE = "g";
const VOLUME_BASE = "ml";

const MASS_UNITS = new Set(["mcg","mg","g","kg","mt","oz","lb","t"]);
const VOLUME_UNITS = new Set(["mm3","cm3","ml","cl","dl","l","kl","m3","tsp","Tbs","fl-oz","cup","pnt","qt","gal"]);

/**
 * Normalise a raw unit string to a convert-units symbol, or null if unknown.
 */
function normaliseUnit(raw) {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  // direct symbol lookup (e.g. "g", "ml", "tsp")
  const allSymbols = [...MASS_UNITS, ...VOLUME_UNITS];
  if (allSymbols.includes(raw.trim())) return raw.trim();
  return UNIT_ALIAS[trimmed] || null;
}

/**
 * Convert a quantity from `fromUnit` to the base unit for that measurement type.
 * Returns { quantity, unit } in the base unit, or the original if conversion not possible.
 */
function toBase(quantity, fromUnit) {
  if (!quantity || !fromUnit) return { quantity: quantity || 0, unit: fromUnit || null };

  const symbol = normaliseUnit(fromUnit);
  if (!symbol) return { quantity, unit: fromUnit };

  try {
    if (MASS_UNITS.has(symbol)) {
      return { quantity: convert(quantity).from(symbol).to(MASS_BASE), unit: MASS_BASE };
    }
    if (VOLUME_UNITS.has(symbol)) {
      return { quantity: convert(quantity).from(symbol).to(VOLUME_BASE), unit: VOLUME_BASE };
    }
  } catch (_) {
    // incompatible conversion — return as-is
  }

  return { quantity, unit: fromUnit };
}

/**
 * Convert a base-unit quantity to a human-readable display unit.
 * e.g. 1500 ml → "1.5 l", 2500 g → "2.5 kg"
 */
function toDisplay(quantity, unit) {
  if (!unit) return { quantity, unit };
  try {
    if (unit === MASS_BASE && quantity >= 1000) {
      return { quantity: +(quantity / 1000).toFixed(2), unit: "kg" };
    }
    if (unit === VOLUME_BASE && quantity >= 1000) {
      return { quantity: +(quantity / 1000).toFixed(2), unit: "l" };
    }
  } catch (_) {}
  return { quantity: +quantity.toFixed(2), unit };
}

module.exports = { toBase, toDisplay, normaliseUnit };
