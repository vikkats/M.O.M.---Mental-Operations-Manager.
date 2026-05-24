import {
  calculateDose,
  formatCompactDate,
  getNextEligibleTime,
  roundTo,
  sortLogsNewestFirst,
  toNumber
} from "./src/dose.js";
import { demoState, futureModules, STORAGE_KEY, tabs } from "./src/seed.js";

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const requiredConfirmations = ["weight", "formula", "guidance"];

let state = loadState();
let toastTimeout;

function clone(value) {
  return structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return clone(demoState);
    return { ...clone(demoState), ...JSON.parse(stored) };
  } catch (error) {
    console.warn("Could not load saved M.O.M. state", error);
    return clone(demoState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("visible"), 3000);
}

function getSelectedChild() {
  return state.children.find((child) => child.id === state.selectedChildId) || state.children[0] || null;
}

function getSelectedMedication() {
  return state.medications.find((medication) => medication.id === state.selectedMedicationId) || state.medications[0] || null;
}

function getInitials(name = "?") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

function getAge(dateOfBirth) {
  if (!dateOfBirth) return "Age not set";
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return "Age not set";
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (today.getDate() < birthDate.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years <= 0) return `${Math.max(months, 0)} mo`;
  return `${years} yr ${months} mo`;
}

function plural(count, singular, pluralForm = `${singular}s`) {
  return count === 1 ? singular : pluralForm;
}

function render() {
  ensureSelectionIntegrity();
  app.innerHTML = `
    <div class="shell">
      ${renderHero()}
      ${renderTabs()}
      <main id="main" tabindex="-1">
        ${renderActiveTab()}
      </main>
    </div>
  `;
}

function renderHero() {
  const child = getSelectedChild();
  const medication = getSelectedMedication();
  const dose = calculateDose(child, medication);
  const recentLog = sortLogsNewestFirst(state.logs)[0];

  return `
    <header class="hero">
      <section class="hero-card">
        <p class="eyebrow">M.O.M. · Mental Operations Manager</p>
        <h1>Caregiver chaos, externalized.</h1>
        <p class="lede">
          A portfolio MVP for the first sharp module: <strong>Dose & Go</strong>. Build child profiles,
          use caregiver-entered verified formulas, confirm the dose, and leave a clear local history trail.
        </p>
        <div class="hero-actions">
          <button class="button" data-tab-jump="calculate">Open Dose & Go</button>
          <button class="ghost-button" data-tab-jump="case-study">View UX case study</button>
          <button class="text-button" data-action="reset-demo">Reset demo data</button>
        </div>
      </section>
      <aside class="phone-card" aria-label="M.O.M. mobile preview">
        <div class="phone-frame">
          <div class="phone-top">
            <strong>M.O.M.</strong>
            <span class="phone-dot" aria-hidden="true"></span>
          </div>
          <div class="mini-dose">
            <span class="badge">Selected flow</span>
            <strong>${dose.valid ? `${dose.totalDose}` : "—"}<span>${dose.valid ? ` ${escapeHtml(dose.doseUnit)}` : ""}</span></strong>
            <p class="muted">${child ? escapeHtml(child.name) : "No child selected"} · ${medication ? escapeHtml(medication.name) : "No medication"}</p>
            <div class="mini-stack">
              <div class="mini-row"><span>Weight</span><strong>${child ? `${child.weightKg} kg` : "—"}</strong></div>
              <div class="mini-row"><span>Formula</span><strong>${medication ? `${medication.dosePerKg}/kg` : "—"}</strong></div>
              <div class="mini-row"><span>Last log</span><strong>${recentLog ? formatCompactDate(recentLog.takenAt) : "None"}</strong></div>
            </div>
          </div>
        </div>
      </aside>
    </header>
  `;
}

function renderTabs() {
  return `
    <nav class="tabs-wrap" aria-label="M.O.M. sections">
      <div class="tabs" role="tablist">
        ${tabs
          .map(
            (tab) => `
              <button
                class="tab-button"
                type="button"
                role="tab"
                aria-selected="${state.activeTab === tab.id}"
                data-tab="${tab.id}"
              >${escapeHtml(tab.label)}</button>
            `
          )
          .join("")}
      </div>
    </nav>
  `;
}

function renderActiveTab() {
  switch (state.activeTab) {
    case "calculate":
      return renderCalculator();
    case "profiles":
      return renderProfiles();
    case "medications":
      return renderMedications();
    case "history":
      return renderHistory();
    case "case-study":
      return renderCaseStudy();
    case "dashboard":
    default:
      return renderDashboard();
  }
}

function renderDashboard() {
  const child = getSelectedChild();
  const medication = getSelectedMedication();
  const dose = calculateDose(child, medication);
  const todayLogCount = state.logs.filter((log) => isToday(log.takenAt)).length;

  return `
    <section class="grid two" aria-labelledby="dashboard-title">
      <div class="panel">
        <div class="section-title">
          <div>
            <p class="eyebrow">Command center</p>
            <h2 id="dashboard-title">The app starts where stress peaks.</h2>
            <p class="help">Dose & Go is the MVP because it is concrete, testable, and already carries the emotional weight of the larger M.O.M. concept.</p>
          </div>
        </div>
        <div class="stat-grid" aria-label="Project stats">
          <div class="stat"><span>Child profiles</span><strong>${state.children.length}</strong></div>
          <div class="stat"><span>Saved formulas</span><strong>${state.medications.length}</strong></div>
          <div class="stat"><span>Logs today</span><strong>${todayLogCount}</strong></div>
        </div>
        <div class="notice" style="margin-top: 18px;">
          <strong>Safety frame</strong>
          <span>This MVP never suggests real medicine instructions. It only calculates from caregiver-entered formulas that must come from a clinician, pharmacist, prescription, or official label.</span>
        </div>
      </div>
      <aside class="panel">
        <p class="eyebrow">Current task</p>
        <h2>${child ? escapeHtml(child.name) : "No profile"} · ${medication ? escapeHtml(medication.name) : "No med"}</h2>
        ${dose.valid ? renderDoseSummary(dose) : `<p class="help">${escapeHtml(dose.reason)}</p>`}
        <div class="inline-actions" style="margin-top: 16px;">
          <button class="button" data-tab-jump="calculate">Calculate and log</button>
          <button class="ghost-button" data-tab-jump="history">Review history</button>
        </div>
      </aside>
    </section>
    <section class="panel" style="margin-top: 18px;" aria-labelledby="modules-title">
      <div class="section-title">
        <div>
          <p class="eyebrow">M.O.M. system map</p>
          <h2 id="modules-title">One MVP, built like the seed of a bigger operating system.</h2>
        </div>
      </div>
      <div class="grid three">
        ${futureModules.map(renderModuleCard).join("")}
      </div>
    </section>
  `;
}

function renderModuleCard(module) {
  return `
    <article class="card module-card ${module.locked ? "locked" : ""}">
      <div class="module-kicker">
        <span class="badge">${escapeHtml(module.status)}</span>
        <span aria-hidden="true">${module.locked ? "↗" : "●"}</span>
      </div>
      <h3>${escapeHtml(module.title)}</h3>
      <p class="help">${escapeHtml(module.description)}</p>
    </article>
  `;
}

function renderCalculator() {
  const child = getSelectedChild();
  const medication = getSelectedMedication();
  const dose = calculateDose(child, medication);
  const allConfirmed = requiredConfirmations.every((key) => state.confirmations[key]);
  const canLog = dose.valid && allConfirmed;
  const lastLogForMed = sortLogsNewestFirst(state.logs).find(
    (log) => log.childId === child?.id && log.medicationId === medication?.id
  );
  const nextEligible = getNextEligibleTime(lastLogForMed?.takenAt, medication?.minIntervalHours);

  return `
    <section class="grid two" aria-labelledby="calculator-title">
      <div class="panel">
        <p class="eyebrow">Dose & Go</p>
        <h2 id="calculator-title">Calculate, verify, log.</h2>
        <p class="help">This flow is intentionally frictional: child, formula, and safety confirmation before a log is created.</p>

        <div class="field-grid" style="margin: 18px 0;">
          <label class="field">
            Child profile
            <select data-change="selected-child" aria-label="Select child">
              ${state.children.map((item) => `<option value="${item.id}" ${item.id === child?.id ? "selected" : ""}>${escapeHtml(item.name)} · ${item.weightKg} kg</option>`).join("")}
            </select>
          </label>
          <label class="field">
            Medication formula
            <select data-change="selected-medication" aria-label="Select medication">
              ${state.medications.map((item) => `<option value="${item.id}" ${item.id === medication?.id ? "selected" : ""}>${escapeHtml(item.name)} · ${item.dosePerKg} ${escapeHtml(item.doseUnit)}/kg</option>`).join("")}
            </select>
          </label>
        </div>

        <div class="calculator-output">
          ${dose.valid ? renderDoseSummary(dose) : `<p class="help">${escapeHtml(dose.reason)}</p>`}
          ${dose.valid && medication?.concentration ? `<p class="formula-line">Volume estimate: ${dose.volume} ${escapeHtml(dose.volumeUnit)} using ${medication.concentration} ${escapeHtml(dose.doseUnit)}/${escapeHtml(dose.volumeUnit)} concentration.</p>` : ""}
          ${nextEligible ? `<p class="help"><strong>Next eligible reminder:</strong> ${formatCompactDate(nextEligible)} based on a ${medication.minIntervalHours}-hour interval from the last local log.</p>` : ""}
        </div>
      </div>

      <aside class="panel">
        <p class="eyebrow">Confirmation gate</p>
        <h2>Before logging</h2>
        <div class="confirm-list">
          ${renderConfirmation("weight", "The child weight is current.", child ? `${child.name} is listed as ${child.weightKg} kg.` : "Add a profile first.")}
          ${renderConfirmation("formula", "The formula source is verified.", medication?.sourceNote || "Use only professional or official label guidance.")}
          ${renderConfirmation("guidance", "I understand this is not medical advice.", "M.O.M. stores and calculates caregiver-entered data only.")}
        </div>
        <label class="field" style="margin-top: 14px;">
          Optional log note
          <textarea data-field="log-note" placeholder="Example: Taken after dinner, symptoms improving."></textarea>
        </label>
        <button class="button" style="margin-top: 14px; width: 100%;" data-action="log-dose" ${canLog ? "" : "disabled"}>
          Log dose
        </button>
        <p class="field-hint">${canLog ? "Ready to create a local history entry." : "Complete all three confirmations to unlock logging."}</p>
      </aside>
    </section>
  `;
}

function renderDoseSummary(dose) {
  return `
    <div>
      <p class="muted">Calculated dose</p>
      <div class="dose-number">${dose.totalDose}<span> ${escapeHtml(dose.doseUnit)}</span></div>
      <p class="formula-line">${escapeHtml(dose.formula)}</p>
    </div>
  `;
}

function renderConfirmation(key, title, detail) {
  return `
    <label class="confirm-item">
      <input type="checkbox" data-confirmation="${key}" ${state.confirmations[key] ? "checked" : ""} />
      <span>
        <strong>${escapeHtml(title)}</strong><br />
        <span class="help">${escapeHtml(detail)}</span>
      </span>
    </label>
  `;
}

function renderProfiles() {
  return `
    <section class="grid two" aria-labelledby="profiles-title">
      <div class="panel">
        <div class="section-title">
          <div>
            <p class="eyebrow">Profiles</p>
            <h2 id="profiles-title">Children are the anchor object.</h2>
            <p class="help">Every dose log is attached to a child snapshot so history stays readable even after profiles change.</p>
          </div>
        </div>
        <div class="child-strip">
          ${state.children.length ? state.children.map(renderChildCard).join("") : renderEmpty("No child profiles yet.", "Add a child profile to unlock Dose & Go.")}
        </div>
      </div>
      <aside class="form-card">
        <h2 id="child-form-title">Add child profile</h2>
        <form id="child-form">
          <input type="hidden" name="id" />
          <label class="field">
            Name
            <input name="name" required maxlength="40" placeholder="Child name" />
          </label>
          <div class="field-grid">
            <label class="field">
              Weight in kg
              <input name="weightKg" type="number" required min="0.1" step="0.1" placeholder="18.4" />
            </label>
            <label class="field">
              Date of birth
              <input name="dateOfBirth" type="date" />
            </label>
          </div>
          <label class="field">
            Profile color
            <input name="color" type="color" value="#D97059" />
          </label>
          <label class="field">
            Notes
            <textarea name="notes" placeholder="Allergies, reminders, profile context"></textarea>
          </label>
          <div class="form-actions">
            <button class="button" type="submit">Save profile</button>
            <button class="ghost-button" type="button" data-action="clear-child-form">Clear</button>
          </div>
        </form>
      </aside>
    </section>
  `;
}

function renderChildCard(child) {
  const active = child.id === state.selectedChildId;
  return `
    <article class="child-card ${active ? "active" : ""}">
      <div class="child-head">
        <div class="identity">
          <span class="avatar" style="background: ${escapeHtml(child.color || "#D97059")};">${escapeHtml(getInitials(child.name))}</span>
          <div>
            <h3>${escapeHtml(child.name)}</h3>
            <p class="muted">${child.weightKg} kg · ${escapeHtml(getAge(child.dateOfBirth))}</p>
          </div>
        </div>
        <span class="${active ? "ok-badge" : "badge"}">${active ? "Selected" : "Profile"}</span>
      </div>
      ${child.notes ? `<p class="help">${escapeHtml(child.notes)}</p>` : ""}
      <div class="card-actions">
        <button class="ghost-button" data-action="select-child" data-id="${child.id}">Use in calculator</button>
        <button class="text-button" data-action="edit-child" data-id="${child.id}">Edit</button>
        <button class="text-button" data-action="delete-child" data-id="${child.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderMedications() {
  return `
    <section class="grid two" aria-labelledby="medications-title">
      <div class="panel">
        <div class="section-title">
          <div>
            <p class="eyebrow">Formula library</p>
            <h2 id="medications-title">No hidden medicine database.</h2>
            <p class="help">Caregivers add formulas they already have permission to use. The MVP deliberately avoids auto-suggesting real medication instructions.</p>
          </div>
        </div>
        <div class="med-strip">
          ${state.medications.length ? state.medications.map(renderMedicationCard).join("") : renderEmpty("No formulas yet.", "Add a caregiver-verified formula to use the calculator.")}
        </div>
      </div>
      <aside class="form-card">
        <h2 id="medication-form-title">Add medication formula</h2>
        <form id="medication-form">
          <input type="hidden" name="id" />
          <label class="field">
            Medication name
            <input name="name" required maxlength="64" placeholder="Medication or formula label" />
          </label>
          <div class="field-grid">
            <label class="field">
              Dose per kg
              <input name="dosePerKg" type="number" required min="0.0001" step="0.01" placeholder="0.4" />
              <span class="field-hint">Use verified formula only.</span>
            </label>
            <label class="field">
              Dose unit
              <input name="doseUnit" required maxlength="18" value="units" />
            </label>
          </div>
          <div class="field-grid">
            <label class="field">
              Concentration
              <input name="concentration" type="number" min="0" step="0.01" placeholder="Optional" />
              <span class="field-hint">Dose units per volume unit.</span>
            </label>
            <label class="field">
              Volume unit
              <input name="volumeUnit" maxlength="18" value="ml" />
            </label>
          </div>
          <div class="field-grid">
            <label class="field">
              Minimum interval hours
              <input name="minIntervalHours" type="number" min="0" step="0.25" placeholder="Optional" />
            </label>
            <label class="field">
              Card color
              <input name="color" type="color" value="#D97059" />
            </label>
          </div>
          <label class="field">
            Source / safety note
            <textarea name="sourceNote" required placeholder="Example: Formula verified from prescription label on DD/MM/YYYY."></textarea>
          </label>
          <div class="form-actions">
            <button class="button" type="submit">Save formula</button>
            <button class="ghost-button" type="button" data-action="clear-medication-form">Clear</button>
          </div>
        </form>
      </aside>
    </section>
  `;
}

function renderMedicationCard(medication) {
  const active = medication.id === state.selectedMedicationId;
  return `
    <article class="med-card ${active ? "active" : ""}">
      <div class="med-head">
        <div class="identity">
          <span class="avatar" style="background: ${escapeHtml(medication.color || "#D97059")};">Rx</span>
          <div>
            <h3>${escapeHtml(medication.name)}</h3>
            <p class="muted">${medication.dosePerKg} ${escapeHtml(medication.doseUnit)}/kg${medication.concentration ? ` · ${medication.concentration} ${escapeHtml(medication.doseUnit)}/${escapeHtml(medication.volumeUnit || "ml")}` : ""}</p>
          </div>
        </div>
        <span class="${active ? "ok-badge" : "warning-badge"}">${active ? "Selected" : "Verify before use"}</span>
      </div>
      <p class="help">${escapeHtml(medication.sourceNote || "No source note added yet.")}</p>
      <div class="card-actions">
        <button class="ghost-button" data-action="select-medication" data-id="${medication.id}">Use in calculator</button>
        <button class="text-button" data-action="edit-medication" data-id="${medication.id}">Edit</button>
        <button class="text-button" data-action="delete-medication" data-id="${medication.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderHistory() {
  const filteredLogs = getFilteredLogs();
  return `
    <section class="panel" aria-labelledby="history-title">
      <div class="section-title">
        <div>
          <p class="eyebrow">Local history</p>
          <h2 id="history-title">A clean trail for tired-brain moments.</h2>
          <p class="help">History lives in this browser only. Export JSON before clearing or switching devices.</p>
        </div>
        <div class="inline-actions">
          <select data-change="history-filter" aria-label="Filter history by child">
            <option value="all" ${state.historyFilterChildId === "all" ? "selected" : ""}>All children</option>
            ${state.children.map((child) => `<option value="${child.id}" ${state.historyFilterChildId === child.id ? "selected" : ""}>${escapeHtml(child.name)}</option>`).join("")}
          </select>
          <button class="ghost-button" data-action="export-json">Export JSON</button>
          <button class="danger-button" data-action="clear-history">Clear history</button>
        </div>
      </div>
      <div class="timeline">
        ${filteredLogs.length ? filteredLogs.map(renderLogCard).join("") : renderEmpty("No logs match this filter.", "Create a dose log from Dose & Go to see it here.")}
      </div>
    </section>
  `;
}

function renderLogCard(log) {
  return `
    <article class="log-card">
      <div class="log-head">
        <div>
          <h3>${escapeHtml(log.medicationName)} · ${escapeHtml(log.childName)}</h3>
          <p class="muted">${formatCompactDate(log.takenAt)}</p>
        </div>
        <span class="ok-badge">${log.totalDose} ${escapeHtml(log.doseUnit)}${log.volume ? ` · ${log.volume} ${escapeHtml(log.volumeUnit)}` : ""}</span>
      </div>
      <p class="help">Formula snapshot: ${log.weightKg} kg × ${log.dosePerKg} ${escapeHtml(log.doseUnit)}/kg.</p>
      ${log.note ? `<p>${escapeHtml(log.note)}</p>` : ""}
      <div class="log-actions">
        <button class="text-button" data-action="copy-log" data-id="${log.id}">Copy summary</button>
        <button class="text-button" data-action="delete-log" data-id="${log.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderCaseStudy() {
  return `
    <section class="grid two" aria-labelledby="case-title">
      <div class="panel">
        <p class="eyebrow">UX case study spine</p>
        <h2 id="case-title">From Lovable concept to product-grade MVP.</h2>
        <p class="help">This section mirrors the portfolio write-up in the docs folder so recruiters can see both the live product thinking and the implementation.</p>
        <ol class="case-study-list">
          <li><strong>Problem:</strong> medication moments happen under fatigue, time pressure, and fear of double-dosing.</li>
          <li><strong>Audience:</strong> parents and caregivers managing children, medicine, appointments, and household mental load.</li>
          <li><strong>MVP decision:</strong> focus on Dose & Go because it is measurable, emotionally sharp, and technically small enough to ship.</li>
          <li><strong>Primary task:</strong> log a child medication dose in under 20 seconds after setup, with verification friction.</li>
          <li><strong>Constraint:</strong> the app calculates only from user-entered verified formulas; it does not recommend treatments.</li>
        </ol>
      </div>
      <aside class="panel">
        <p class="eyebrow">Design system seed</p>
        <h2>Warm command center, not sterile hospital app.</h2>
        <div class="grid">
          ${renderToken("Ink", "#2B211E", "Primary text and high-trust actions")}
          ${renderToken("Soft clay", "#F7EFE9", "App background and emotional warmth")}
          ${renderToken("Coral", "#D97059", "Critical path accent and dose confirmation")}
          ${renderToken("Sage", "#8CA58B", "Secondary child/profile state")}
        </div>
      </aside>
    </section>
    <section class="panel" style="margin-top: 18px;">
      <div class="section-title">
        <div>
          <p class="eyebrow">Portfolio proof</p>
          <h2>Deliverables already mapped</h2>
        </div>
      </div>
      <div class="grid three">
        <article class="card"><h3>Functional MVP</h3><p class="help">Static web app with profiles, formula library, calculator, safety gate, local history, and JSON export.</p></article>
        <article class="card"><h3>Figma handoff</h3><p class="help">Screen inventory, frame specs, component plan, content model, and visual tokens in <code>docs/figma-handoff.md</code>.</p></article>
        <article class="card"><h3>Use-case analysis</h3><p class="help">Actors, flows, edge cases, acceptance criteria, and risks in <code>docs/use-case-analysis.md</code>.</p></article>
      </div>
    </section>
  `;
}

function renderToken(name, color, description) {
  return `
    <div class="token-row">
      <span class="swatch" style="background: ${color};" aria-hidden="true"></span>
      <span><strong>${escapeHtml(name)}</strong><br /><span class="help">${escapeHtml(description)}</span></span>
    </div>
  `;
}

function renderEmpty(title, description) {
  return `
    <div class="empty-state">
      <h3>${escapeHtml(title)}</h3>
      <p class="help">${escapeHtml(description)}</p>
    </div>
  `;
}

function ensureSelectionIntegrity() {
  if (!state.children.some((child) => child.id === state.selectedChildId)) {
    state.selectedChildId = state.children[0]?.id || null;
  }
  if (!state.medications.some((medication) => medication.id === state.selectedMedicationId)) {
    state.selectedMedicationId = state.medications[0]?.id || null;
  }
  if (!state.confirmations) state.confirmations = clone(demoState.confirmations);
  if (!tabs.some((tab) => tab.id === state.activeTab)) state.activeTab = "dashboard";
}

function isToday(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

function getFilteredLogs() {
  const logs = sortLogsNewestFirst(state.logs);
  if (state.historyFilterChildId === "all") return logs;
  return logs.filter((log) => log.childId === state.historyFilterChildId);
}

function resetConfirmations() {
  state.confirmations = clone(demoState.confirmations);
}

function setActiveTab(tabId) {
  state.activeTab = tabId;
  saveState();
  render();
  document.querySelector("#main")?.focus({ preventScroll: true });
}

function handleClick(event) {
  const tabButton = event.target.closest("[data-tab]");
  if (tabButton) {
    setActiveTab(tabButton.dataset.tab);
    return;
  }

  const jumpButton = event.target.closest("[data-tab-jump]");
  if (jumpButton) {
    setActiveTab(jumpButton.dataset.tabJump);
    return;
  }

  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;

  const action = actionTarget.dataset.action;
  const id = actionTarget.dataset.id;

  if (action === "reset-demo") resetDemo();
  if (action === "select-child") selectChild(id);
  if (action === "edit-child") fillChildForm(id);
  if (action === "delete-child") deleteChild(id);
  if (action === "clear-child-form") clearChildForm();
  if (action === "select-medication") selectMedication(id);
  if (action === "edit-medication") fillMedicationForm(id);
  if (action === "delete-medication") deleteMedication(id);
  if (action === "clear-medication-form") clearMedicationForm();
  if (action === "log-dose") logDose();
  if (action === "delete-log") deleteLog(id);
  if (action === "copy-log") copyLog(id);
  if (action === "export-json") exportJson();
  if (action === "clear-history") clearHistory();
}

function handleChange(event) {
  const target = event.target;
  const changeType = target.dataset.change;
  const confirmation = target.dataset.confirmation;

  if (changeType === "selected-child") {
    state.selectedChildId = target.value;
    resetConfirmations();
    saveState();
    render();
  }

  if (changeType === "selected-medication") {
    state.selectedMedicationId = target.value;
    resetConfirmations();
    saveState();
    render();
  }

  if (changeType === "history-filter") {
    state.historyFilterChildId = target.value;
    saveState();
    render();
  }

  if (confirmation) {
    state.confirmations[confirmation] = target.checked;
    saveState();
    render();
  }
}

function handleSubmit(event) {
  const form = event.target;
  if (form.id === "child-form") {
    event.preventDefault();
    saveChild(form);
  }

  if (form.id === "medication-form") {
    event.preventDefault();
    saveMedication(form);
  }
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function saveChild(form) {
  const data = formData(form);
  const weightKg = toNumber(data.weightKg);

  if (!data.name.trim() || !weightKg || weightKg <= 0) {
    showToast("Add a child name and a positive weight.");
    return;
  }

  const child = {
    id: data.id || uid("child"),
    name: data.name.trim(),
    weightKg: roundTo(weightKg, 1),
    dateOfBirth: data.dateOfBirth || "",
    color: data.color || "#D97059",
    notes: data.notes.trim()
  };

  const existingIndex = state.children.findIndex((item) => item.id === child.id);
  if (existingIndex >= 0) {
    state.children[existingIndex] = child;
  } else {
    state.children.push(child);
  }

  state.selectedChildId = child.id;
  resetConfirmations();
  saveState();
  render();
  showToast(`${child.name} profile saved.`);
}

function fillChildForm(id) {
  const child = state.children.find((item) => item.id === id);
  const form = document.querySelector("#child-form");
  if (!child || !form) return;

  form.id.value = child.id;
  form.name.value = child.name;
  form.weightKg.value = child.weightKg;
  form.dateOfBirth.value = child.dateOfBirth || "";
  form.color.value = child.color || "#D97059";
  form.notes.value = child.notes || "";
  document.querySelector("#child-form-title").textContent = "Edit child profile";
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

function clearChildForm() {
  const form = document.querySelector("#child-form");
  if (!form) return;
  form.reset();
  form.id.value = "";
  form.color.value = "#D97059";
  document.querySelector("#child-form-title").textContent = "Add child profile";
}

function deleteChild(id) {
  const child = state.children.find((item) => item.id === id);
  if (!child) return;
  const logCount = state.logs.filter((log) => log.childId === id).length;
  const message = logCount
    ? `Delete ${child.name}? Existing logs will keep their snapshot, but the profile will be removed.`
    : `Delete ${child.name}?`;
  if (!confirm(message)) return;

  state.children = state.children.filter((item) => item.id !== id);
  ensureSelectionIntegrity();
  resetConfirmations();
  saveState();
  render();
  showToast(`${child.name} removed.`);
}

function selectChild(id) {
  state.selectedChildId = id;
  resetConfirmations();
  saveState();
  render();
  showToast("Child selected for Dose & Go.");
}

function saveMedication(form) {
  const data = formData(form);
  const dosePerKg = toNumber(data.dosePerKg);
  const concentration = toNumber(data.concentration);
  const minIntervalHours = toNumber(data.minIntervalHours);

  if (!data.name.trim() || !dosePerKg || dosePerKg <= 0 || !data.sourceNote.trim()) {
    showToast("Add a name, positive dose-per-kg value, and source note.");
    return;
  }

  const medication = {
    id: data.id || uid("med"),
    name: data.name.trim(),
    dosePerKg: roundTo(dosePerKg, 4),
    doseUnit: data.doseUnit.trim() || "units",
    concentration: concentration && concentration > 0 ? roundTo(concentration, 4) : null,
    volumeUnit: data.volumeUnit.trim() || "ml",
    minIntervalHours: minIntervalHours && minIntervalHours > 0 ? roundTo(minIntervalHours, 2) : null,
    sourceNote: data.sourceNote.trim(),
    color: data.color || "#D97059"
  };

  const existingIndex = state.medications.findIndex((item) => item.id === medication.id);
  if (existingIndex >= 0) {
    state.medications[existingIndex] = medication;
  } else {
    state.medications.push(medication);
  }

  state.selectedMedicationId = medication.id;
  resetConfirmations();
  saveState();
  render();
  showToast(`${medication.name} formula saved.`);
}

function fillMedicationForm(id) {
  const medication = state.medications.find((item) => item.id === id);
  const form = document.querySelector("#medication-form");
  if (!medication || !form) return;

  form.id.value = medication.id;
  form.name.value = medication.name;
  form.dosePerKg.value = medication.dosePerKg;
  form.doseUnit.value = medication.doseUnit || "units";
  form.concentration.value = medication.concentration || "";
  form.volumeUnit.value = medication.volumeUnit || "ml";
  form.minIntervalHours.value = medication.minIntervalHours || "";
  form.color.value = medication.color || "#D97059";
  form.sourceNote.value = medication.sourceNote || "";
  document.querySelector("#medication-form-title").textContent = "Edit medication formula";
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

function clearMedicationForm() {
  const form = document.querySelector("#medication-form");
  if (!form) return;
  form.reset();
  form.id.value = "";
  form.doseUnit.value = "units";
  form.volumeUnit.value = "ml";
  form.color.value = "#D97059";
  document.querySelector("#medication-form-title").textContent = "Add medication formula";
}

function deleteMedication(id) {
  const medication = state.medications.find((item) => item.id === id);
  if (!medication) return;
  if (!confirm(`Delete ${medication.name}? Existing logs will keep their snapshot.`)) return;

  state.medications = state.medications.filter((item) => item.id !== id);
  ensureSelectionIntegrity();
  resetConfirmations();
  saveState();
  render();
  showToast(`${medication.name} removed.`);
}

function selectMedication(id) {
  state.selectedMedicationId = id;
  resetConfirmations();
  saveState();
  render();
  showToast("Medication formula selected.");
}

function logDose() {
  const child = getSelectedChild();
  const medication = getSelectedMedication();
  const dose = calculateDose(child, medication);
  const allConfirmed = requiredConfirmations.every((key) => state.confirmations[key]);

  if (!dose.valid || !allConfirmed) {
    showToast("Complete the calculator and confirmation gate first.");
    return;
  }

  const noteField = document.querySelector('[data-field="log-note"]');
  const log = {
    id: uid("log"),
    childId: child.id,
    childName: child.name,
    medicationId: medication.id,
    medicationName: medication.name,
    totalDose: dose.totalDose,
    doseUnit: dose.doseUnit,
    volume: dose.volume,
    volumeUnit: dose.volumeUnit,
    weightKg: dose.weightKg,
    dosePerKg: dose.dosePerKg,
    takenAt: new Date().toISOString(),
    note: noteField?.value.trim() || ""
  };

  state.logs.unshift(log);
  resetConfirmations();
  saveState();
  render();
  showToast("Dose logged locally.");
}

function deleteLog(id) {
  const log = state.logs.find((item) => item.id === id);
  if (!log) return;
  if (!confirm("Delete this log entry?")) return;
  state.logs = state.logs.filter((item) => item.id !== id);
  saveState();
  render();
  showToast("Log deleted.");
}

async function copyLog(id) {
  const log = state.logs.find((item) => item.id === id);
  if (!log) return;
  const summary = `${log.childName}: ${log.medicationName} — ${log.totalDose} ${log.doseUnit}${log.volume ? ` (${log.volume} ${log.volumeUnit})` : ""} at ${formatCompactDate(log.takenAt)}. Formula snapshot: ${log.weightKg} kg × ${log.dosePerKg} ${log.doseUnit}/kg.${log.note ? ` Note: ${log.note}` : ""}`;

  try {
    await navigator.clipboard.writeText(summary);
    showToast("Log summary copied.");
  } catch {
    showToast(summary);
  }
}

function exportJson() {
  const data = JSON.stringify({ exportedAt: new Date().toISOString(), ...state }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `mom-dose-history-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast("JSON export started.");
}

function clearHistory() {
  if (!state.logs.length) {
    showToast("History is already empty.");
    return;
  }
  if (!confirm("Clear all local history logs? Export first if you need a record.")) return;
  state.logs = [];
  saveState();
  render();
  showToast("History cleared.");
}

function resetDemo() {
  if (!confirm("Reset the app to demo data? This replaces local profiles, formulas, and logs.")) return;
  state = clone(demoState);
  saveState();
  render();
  showToast("Demo data restored.");
}

document.addEventListener("click", handleClick);
document.addEventListener("change", handleChange);
document.addEventListener("submit", handleSubmit);

render();
