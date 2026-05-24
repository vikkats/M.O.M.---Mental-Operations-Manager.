export function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function roundTo(value, precision = 2) {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function calculateDose(child, medication) {
  const weightKg = toNumber(child?.weightKg);
  const dosePerKg = toNumber(medication?.dosePerKg);
  const concentration = toNumber(medication?.concentration);

  if (!weightKg || weightKg <= 0 || !dosePerKg || dosePerKg <= 0) {
    return {
      valid: false,
      reason: "Add a child weight and a verified formula to calculate a dose."
    };
  }

  const totalDose = roundTo(weightKg * dosePerKg, 2);
  const volume = concentration && concentration > 0 ? roundTo(totalDose / concentration, 2) : null;

  return {
    valid: true,
    weightKg,
    dosePerKg,
    totalDose,
    doseUnit: medication?.doseUnit || "units",
    concentration,
    volume,
    volumeUnit: medication?.volumeUnit || "ml",
    formula: `${weightKg} kg × ${dosePerKg} ${medication?.doseUnit || "units"}/kg`
  };
}

export function getNextEligibleTime(lastTakenISO, intervalHours) {
  const hours = toNumber(intervalHours);
  if (!lastTakenISO || !hours || hours <= 0) return null;

  const lastTaken = new Date(lastTakenISO);
  if (Number.isNaN(lastTaken.getTime())) return null;

  return new Date(lastTaken.getTime() + hours * 60 * 60 * 1000).toISOString();
}

export function formatCompactDate(isoString) {
  if (!isoString) return "Not logged";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function sortLogsNewestFirst(logs = []) {
  return [...logs].sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
}
