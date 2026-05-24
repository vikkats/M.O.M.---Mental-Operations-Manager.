import { formatCompactDate, roundTo, toNumber } from "./src/dose.js";
import { demoState, STORAGE_KEY } from "./src/seed.js";

const symptomOptions = [
  "Cough",
  "Runny nose",
  "Sore throat",
  "Vomiting",
  "Diarrhea",
  "Rash",
  "Ear pain",
  "Headache",
  "Low energy",
  "Poor appetite",
  "Other"
];

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
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
    const parsed = stored ? JSON.parse(stored) : {};
    return {
      ...clone(demoState),
      ...parsed,
      confirmations: { ...clone(demoState.confirmations), ...(parsed.confirmations || {}) },
      feverLogs: parsed.feverLogs || clone(demoState.feverLogs || []),
      feverFilterChildId: parsed.feverFilterChildId || "all"
    };
  } catch (error) {
    console.warn("Could not load M.O.M. Fever Log state", error);
    return { ...clone(demoState), feverLogs: clone(demoState.feverLogs || []), feverFilterChildId: "all" };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 3000);
}

function ensureFeverTab() {
  const tabs = document.querySelector(".tabs");
  if (!tabs || tabs.querySelector('[data-tab="fever"]')) return;

  const button = document.createElement("button");
  button.className = "tab-button";
  button.type = "button";
  button.setAttribute("role", "tab");
  button.setAttribute("aria-selected", "false");
  button.dataset.tab = "fever";
  button.textContent = "Fever Log";

  const doseButton = tabs.querySelector('[data-tab="calculate"]');
  doseButton?.insertAdjacentElement("afterend", button) || tabs.append(button);
}

function markFeverTabActive() {
  document.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.setAttribute("aria-selected", tab.dataset.tab === "fever" ? "true" : "false");
  });
}

function getSelectedChild(state) {
  return state.children.find((child) => child.id === state.selectedChildId) || state.children[0] || null;
}

function getFilteredFeverLogs(state) {
  const logs = [...(state.feverLogs || [])].sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));
  if (state.feverFilterChildId === "all") return logs;
  return logs.filter((log) => log.childId === state.feverFilterChildId);
}

function renderFeverModule() {
  const main = document.querySelector("#main");
  if (!main) return;

  const state = loadState();
  state.activeTab = "fever";
  if (!Array.isArray(state.feverLogs)) state.feverLogs = [];
  if (!state.feverFilterChildId) state.feverFilterChildId = "all";
  saveState(state);

  ensureFeverTab();
  markFeverTabActive();

  const child = getSelectedChild(state);
  const filteredLogs = getFilteredFeverLogs(state);

  main.innerHTML = `
    <section class="grid two" aria-labelledby="fever-title">
      <div class="panel">
        <p class="eyebrow">Fever Log</p>
        <h2 id="fever-title">Track what happened before tired brain forgets.</h2>
        <p class="help">Record temperature, measurement method, symptoms, fluids, appetite, energy, and notes. M.O.M. keeps the timeline clear for caregiver handoff or a clinician conversation.</p>

        <div class="notice" style="margin: 16px 0;">
          <strong>Safety frame</strong>
          <span>M.O.M. does not diagnose symptoms or recommend treatment. This log is only a structured record to discuss with a clinician, pharmacist, or emergency service when needed.</span>
        </div>

        <form id="fever-form">
          <div class="field-grid">
            <label class="field">
              Child profile
              <select name="childId">
                ${state.children.map((item) => `<option value="${item.id}" ${item.id === child?.id ? "selected" : ""}>${escapeHtml(item.name)} · ${item.weightKg} kg</option>`).join("")}
              </select>
            </label>
            <label class="field">
              Temperature
              <input name="temperature" type="number" min="30" max="45" step="0.1" required placeholder="38.4" />
            </label>
          </div>

          <div class="field-grid">
            <label class="field">
              Unit
              <select name="unit">
                <option value="C">°C</option>
                <option value="F">°F</option>
              </select>
            </label>
            <label class="field">
              Measurement method
              <select name="method">
                <option>Ear</option>
                <option>Forehead</option>
                <option>Oral</option>
                <option>Armpit</option>
                <option>Other</option>
              </select>
            </label>
          </div>

          <div class="field">
            Symptoms
            <div class="confirm-list" style="margin-top: 8px;">
              ${symptomOptions.map((symptom) => `
                <label class="confirm-item">
                  <input type="checkbox" name="symptoms" value="${escapeHtml(symptom)}" />
                  <span><strong>${escapeHtml(symptom)}</strong></span>
                </label>
              `).join("")}
            </div>
          </div>

          <div class="field-grid">
            <label class="field">
              Fluids
              <input name="fluids" maxlength="120" placeholder="Example: drank water twice" />
            </label>
            <label class="field">
              Appetite
              <input name="appetite" maxlength="120" placeholder="Example: low appetite" />
            </label>
          </div>

          <label class="field">
            Energy / mood
            <input name="energy" maxlength="120" placeholder="Example: tired but responsive" />
          </label>

          <label class="field">
            Notes
            <textarea name="note" placeholder="Example: slept after lunch, coughing more at night."></textarea>
          </label>

          <div class="form-actions">
            <button class="button" type="submit">Log fever entry</button>
            <button class="ghost-button" type="reset">Clear form</button>
          </div>
        </form>
      </div>

      <aside class="panel">
        <div class="section-title">
          <div>
            <p class="eyebrow">Symptom timeline</p>
            <h2>Doctor-ready context</h2>
            <p class="help">Filter by child, copy a concise summary, or remove entries created during testing.</p>
          </div>
        </div>

        <div class="inline-actions" style="margin-bottom: 14px;">
          <select id="fever-filter" aria-label="Filter fever logs by child">
            <option value="all" ${state.feverFilterChildId === "all" ? "selected" : ""}>All children</option>
            ${state.children.map((item) => `<option value="${item.id}" ${state.feverFilterChildId === item.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}
          </select>
          <button class="ghost-button" data-fever-action="copy-summary">Copy doctor summary</button>
          <button class="danger-button" data-fever-action="clear-fever">Clear</button>
        </div>

        <div class="timeline">
          ${filteredLogs.length ? filteredLogs.map(renderFeverLogCard).join("") : renderEmpty("No fever entries yet.", "Log a temperature and symptoms to build the timeline.")}
        </div>
      </aside>
    </section>
  `;

  main.focus({ preventScroll: true });
}

function renderFeverLogCard(log) {
  const symptoms = log.symptoms?.length ? log.symptoms.join(", ") : "No symptoms selected";
  return `
    <article class="log-card">
      <div class="log-head">
        <div>
          <h3>${escapeHtml(log.childName)} · ${log.temperature}°${escapeHtml(log.unit)} · ${escapeHtml(log.method)}</h3>
          <p class="muted">${formatCompactDate(log.loggedAt)}</p>
        </div>
        <span class="ok-badge">${escapeHtml(log.energy || "Logged")}</span>
      </div>
      <p class="help"><strong>Symptoms:</strong> ${escapeHtml(symptoms)}</p>
      ${log.fluids ? `<p class="help"><strong>Fluids:</strong> ${escapeHtml(log.fluids)}</p>` : ""}
      ${log.appetite ? `<p class="help"><strong>Appetite:</strong> ${escapeHtml(log.appetite)}</p>` : ""}
      ${log.note ? `<p>${escapeHtml(log.note)}</p>` : ""}
      <div class="log-actions">
        <button class="text-button" data-fever-action="copy-entry" data-id="${log.id}">Copy entry</button>
        <button class="text-button" data-fever-action="delete-entry" data-id="${log.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderEmpty(title, description) {
  return `<div class="empty-state"><h3>${escapeHtml(title)}</h3><p class="help">${escapeHtml(description)}</p></div>`;
}

function summarizeEntry(log) {
  const symptoms = log.symptoms?.length ? log.symptoms.join(", ") : "no symptoms selected";
  const details = [
    `${formatCompactDate(log.loggedAt)}: ${log.childName} ${log.temperature}°${log.unit} via ${log.method}.`,
    `Symptoms: ${symptoms}.`,
    log.fluids ? `Fluids: ${log.fluids}.` : "",
    log.appetite ? `Appetite: ${log.appetite}.` : "",
    log.energy ? `Energy/mood: ${log.energy}.` : "",
    log.note ? `Notes: ${log.note}.` : ""
  ].filter(Boolean);

  return details.join(" ");
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch {
    showToast(text);
  }
}

function saveFeverEntry(form) {
  const state = loadState();
  const data = Object.fromEntries(new FormData(form).entries());
  const temperature = toNumber(data.temperature);
  const child = state.children.find((item) => item.id === data.childId);

  if (!child || !temperature) {
    showToast("Choose a child and add a temperature.");
    return;
  }

  const symptoms = Array.from(form.querySelectorAll('input[name="symptoms"]:checked')).map((input) => input.value);
  const log = {
    id: uid("fever"),
    childId: child.id,
    childName: child.name,
    temperature: roundTo(temperature, 1),
    unit: data.unit || "C",
    method: data.method || "Other",
    symptoms,
    fluids: (data.fluids || "").trim(),
    appetite: (data.appetite || "").trim(),
    energy: (data.energy || "").trim(),
    note: (data.note || "").trim(),
    loggedAt: new Date().toISOString()
  };

  state.feverLogs = [log, ...(state.feverLogs || [])];
  state.selectedChildId = child.id;
  state.feverFilterChildId = child.id;
  state.activeTab = "fever";
  saveState(state);
  renderFeverModule();
  showToast(`${child.name} fever entry logged.`);
}

function handleFeverAction(target) {
  const state = loadState();
  const action = target.dataset.feverAction;
  const id = target.dataset.id;

  if (action === "copy-summary") {
    const logs = getFilteredFeverLogs(state);
    if (!logs.length) return showToast("No fever entries to summarize yet.");
    const childLabel = state.feverFilterChildId === "all"
      ? "All children"
      : state.children.find((child) => child.id === state.feverFilterChildId)?.name || "Selected child";
    const summary = [`M.O.M. Fever Log summary for ${childLabel}:`, ...logs.slice().reverse().map((log) => `- ${summarizeEntry(log)}`)].join("\n");
    copyText(summary, "Doctor summary copied.");
  }

  if (action === "copy-entry") {
    const log = state.feverLogs?.find((item) => item.id === id);
    if (log) copyText(summarizeEntry(log), "Fever entry copied.");
  }

  if (action === "delete-entry") {
    const log = state.feverLogs?.find((item) => item.id === id);
    if (!log || !confirm("Delete this fever entry?")) return;
    state.feverLogs = state.feverLogs.filter((item) => item.id !== id);
    saveState(state);
    renderFeverModule();
    showToast("Fever entry deleted.");
  }

  if (action === "clear-fever") {
    if (!state.feverLogs?.length) return showToast("Fever Log is already empty.");
    if (!confirm("Clear all fever log entries? Copy a summary first if you need a record.")) return;
    state.feverLogs = [];
    saveState(state);
    renderFeverModule();
    showToast("Fever Log cleared.");
  }
}

document.addEventListener("click", (event) => {
  const tabButton = event.target.closest?.('[data-tab="fever"]');
  if (tabButton) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const state = loadState();
    state.activeTab = "fever";
    saveState(state);
    renderFeverModule();
    return;
  }

  const actionTarget = event.target.closest?.("[data-fever-action]");
  if (actionTarget) {
    event.preventDefault();
    event.stopImmediatePropagation();
    handleFeverAction(actionTarget);
  }
}, true);

document.addEventListener("submit", (event) => {
  if (event.target?.id !== "fever-form") return;
  event.preventDefault();
  event.stopImmediatePropagation();
  saveFeverEntry(event.target);
}, true);

document.addEventListener("change", (event) => {
  const feverForm = event.target.closest?.("#fever-form");
  if (feverForm) {
    event.stopImmediatePropagation();
    return;
  }

  if (event.target?.id === "fever-filter") {
    event.preventDefault();
    event.stopImmediatePropagation();
    const state = loadState();
    state.feverFilterChildId = event.target.value;
    state.activeTab = "fever";
    saveState(state);
    renderFeverModule();
  }
}, true);

const observer = new MutationObserver(ensureFeverTab);
observer.observe(document.body, { childList: true, subtree: true });

ensureFeverTab();

if (loadState().activeTab === "fever") {
  renderFeverModule();
}
