import assert from "node:assert/strict";
import { calculateDose, getNextEligibleTime, roundTo, sortLogsNewestFirst } from "../src/dose.js";

const child = { weightKg: 18.4 };
const medication = {
  dosePerKg: 0.4,
  doseUnit: "units",
  concentration: 2,
  volumeUnit: "ml"
};

const dose = calculateDose(child, medication);
assert.equal(dose.valid, true);
assert.equal(dose.totalDose, 7.36);
assert.equal(dose.volume, 3.68);
assert.equal(dose.formula, "18.4 kg × 0.4 units/kg");

assert.equal(calculateDose({ weightKg: 0 }, medication).valid, false);
assert.equal(calculateDose(child, { dosePerKg: null }).valid, false);
assert.equal(roundTo(1.005, 2), 1.01);

const base = "2026-01-01T10:00:00.000Z";
assert.equal(getNextEligibleTime(base, 6), "2026-01-01T16:00:00.000Z");
assert.equal(getNextEligibleTime(base, null), null);

const sorted = sortLogsNewestFirst([
  { takenAt: "2026-01-01T10:00:00.000Z" },
  { takenAt: "2026-01-02T10:00:00.000Z" }
]);
assert.equal(sorted[0].takenAt, "2026-01-02T10:00:00.000Z");

console.log("Dose utility tests passed.");
