export const STORAGE_KEY = "mom-dose-and-go-v1";

export const tabs = [
  { id: "dashboard", label: "Command Center" },
  { id: "calculate", label: "Dose & Go" },
  { id: "profiles", label: "Profiles" },
  { id: "medications", label: "Meds" },
  { id: "history", label: "History" },
  { id: "case-study", label: "Case Study" }
];

export const demoState = {
  activeTab: "dashboard",
  selectedChildId: "child-demo-mia",
  selectedMedicationId: "med-demo-a",
  historyFilterChildId: "all",
  confirmations: {
    weight: false,
    formula: false,
    guidance: false
  },
  children: [
    {
      id: "child-demo-mia",
      name: "Mia",
      weightKg: 18.4,
      dateOfBirth: "2021-06-12",
      color: "#D97059",
      notes: "Demo child profile for portfolio testing. Replace with real caregiver-entered details."
    },
    {
      id: "child-demo-niko",
      name: "Niko",
      weightKg: 11.2,
      dateOfBirth: "2023-09-03",
      color: "#8CA58B",
      notes: "Shows how the MVP handles multiple child profiles."
    }
  ],
  medications: [
    {
      id: "med-demo-a",
      name: "Demo fever syrup",
      dosePerKg: 0.4,
      doseUnit: "units",
      concentration: 2,
      volumeUnit: "ml",
      minIntervalHours: 6,
      sourceNote: "Demo-only formula. Use real products only with verified clinician, pharmacist, prescription, or label guidance.",
      color: "#D97059"
    },
    {
      id: "med-demo-b",
      name: "Demo allergy drops",
      dosePerKg: 0.2,
      doseUnit: "units",
      concentration: 1,
      volumeUnit: "ml",
      minIntervalHours: 8,
      sourceNote: "Placeholder medication used to test the interaction model. Not medical guidance.",
      color: "#A58FB5"
    }
  ],
  logs: [
    {
      id: "log-demo-1",
      childId: "child-demo-mia",
      childName: "Mia",
      medicationId: "med-demo-a",
      medicationName: "Demo fever syrup",
      totalDose: 7.36,
      doseUnit: "units",
      volume: 3.68,
      volumeUnit: "ml",
      weightKg: 18.4,
      dosePerKg: 0.4,
      takenAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      note: "Seed log to show the history timeline."
    }
  ]
};

export const futureModules = [
  {
    title: "Dose & Go",
    status: "MVP active",
    description: "Calculate from caregiver-entered, verified formulas, confirm safety checks, and log a local history trail.",
    locked: false
  },
  {
    title: "Fever Log",
    status: "Next module",
    description: "Track temperature, symptoms, fluids, and notes before a doctor call.",
    locked: true
  },
  {
    title: "Appointments",
    status: "Roadmap",
    description: "Store pediatrician visits, school deadlines, forms, and prep questions.",
    locked: true
  },
  {
    title: "Emergency Card",
    status: "Roadmap",
    description: "One-tap allergies, doctor details, insurance, and trusted contacts.",
    locked: true
  },
  {
    title: "Family Ops",
    status: "Roadmap",
    description: "A lightweight handoff board for who needs what today.",
    locked: true
  },
  {
    title: "AI Prep Layer",
    status: "Later",
    description: "Summarize logs and turn messy notes into doctor-ready questions once safety validation exists.",
    locked: true
  }
];
