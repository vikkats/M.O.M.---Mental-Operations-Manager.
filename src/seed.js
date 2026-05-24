export const STORAGE_KEY = "mom-dose-and-go-v1";

export const tabs = [
  { id: "dashboard", label: "Command Center" },
  { id: "calculate", label: "Dose & Go" },
  { id: "fever", label: "Fever Log" },
  { id: "appointments", label: "Appointments" },
  { id: "emergency", label: "Emergency Card" },
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
  feverFilterChildId: "all",
  appointmentFilterChildId: "all",
  appointmentFilterStatus: "all",
  emergencyFilterChildId: "all",
  emergencySelectedChildId: "child-demo-mia",
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
  ],
  feverLogs: [
    {
      id: "fever-demo-1",
      childId: "child-demo-mia",
      childName: "Mia",
      temperature: 38.2,
      unit: "C",
      method: "Ear",
      symptoms: ["Cough", "Low energy"],
      fluids: "Drank water twice after lunch.",
      appetite: "Low appetite",
      energy: "Tired",
      note: "Demo fever entry to show the symptom timeline.",
      loggedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
    }
  ],
  appointments: [
    {
      id: "appt-demo-1",
      childId: "child-demo-mia",
      childName: "Mia",
      title: "Pediatrician follow-up",
      type: "Pediatrician",
      status: "prep",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 27).toISOString(),
      location: "Demo pediatric clinic",
      provider: "Dr. Demo",
      agenda: "Ask about fever pattern and whether symptoms need follow-up.",
      documents: "Bring fever timeline and medication log export if useful.",
      followUp: "Update profile notes after visit.",
      note: "Seed appointment showing the prep workflow."
    }
  ],
  emergencyCards: [
    {
      id: "emergency-demo-mia",
      childId: "child-demo-mia",
      childName: "Mia",
      dateOfBirth: "2021-06-12",
      weightKg: 18.4,
      allergies: "Demo allergy note: replace with caregiver-entered verified details.",
      conditions: "No demo conditions recorded.",
      currentMeds: "Use Dose & Go logs for recent medication history.",
      pediatricianName: "Dr. Demo Pediatrician",
      pediatricianPhone: "+30 210 000 0000",
      preferredHospital: "Demo Children's Clinic",
      insuranceProvider: "Demo Insurance",
      insuranceNumber: "Policy demo-0000",
      contactOneName: "Parent / Guardian A",
      contactOneRelation: "Mother",
      contactOnePhone: "+30 690 000 0000",
      contactTwoName: "Trusted Contact B",
      contactTwoRelation: "Grandparent",
      contactTwoPhone: "+30 690 000 0001",
      accessNotes: "Demo only. Do not store real sensitive data in a public portfolio demo.",
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
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
    status: "Module active",
    description: "Track temperature, symptoms, fluids, energy, appetite, and notes before a doctor call.",
    locked: false
  },
  {
    title: "Appointments",
    status: "Module active",
    description: "Store visits, school deadlines, forms, prep questions, and follow-up actions.",
    locked: false
  },
  {
    title: "Emergency Card",
    status: "Module active",
    description: "One-tap allergies, doctor details, insurance, contacts, and copy-ready emergency handoff.",
    locked: false
  },
  {
    title: "Family Ops",
    status: "Next module",
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
