import { formatCompactDate } from "./src/dose.js";
import { demoState, STORAGE_KEY } from "./src/seed.js";

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

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    return {
      ...clone(demoState),
      ...parsed,
      confirmations: { ...clone(demoState.confirmations), ...(parsed.confirmations || {}) },
      feverLogs: parsed.feverLogs || clone(demoState.feverLogs || []),
      appointments: parsed.appointments || clone(demoState.appointments || []),
      emergencyCards: parsed.emergencyCards || clone(demoState.emergencyCards || []),
      emergencyFilterChildId: parsed.emergencyFilterChildId || "all",
      emergencySelectedChildId: parsed.emergencySelectedChildId || parsed.selectedChildId || demoState.selectedChildId
    };
  } catch (error) {
    console.warn("Could not load M.O.M. Emergency Card state", error);
    return {
      ...clone(demoState),
      emergencyCards: clone(demoState.emergencyCards || []),
      emergencyFilterChildId: "all",
      emergencySelectedChildId: demoState.selectedChildId
    };
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

function ensureEmergencyTab() {
  const tabs = document.querySelector(".tabs");
  if (!tabs || tabs.querySelector('[data-tab="emergency"]')) return;

  const button = document.createElement("button");
  button.className = "tab-button";
  button.type = "button";
  button.setAttribute("role", "tab");
  button.setAttribute("aria-selected", "false");
  button.dataset.tab = "emergency";
  button.textContent = "Emergency Card";

  const anchor = tabs.querySelector('[data-tab="appointments"]') || tabs.querySelector('[data-tab="fever"]') || tabs.querySelector('[data-tab="calculate"]');
  anchor?.insertAdjacentElement("afterend", button) || tabs.append(button);
}

function markEmergencyTabActive() {
  document.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.setAttribute("aria-selected", tab.dataset.tab === "emergency" ? "true" : "false");
  });
}

function validChildIds(state) {
  return new Set((state.children || []).map((child) => child.id));
}

function getSelectedEmergencyChild(state) {
  const ids = validChildIds(state);
  const childId = ids.has(state.emergencySelectedChildId)
    ? state.emergencySelectedChildId
    : ids.has(state.selectedChildId)
      ? state.selectedChildId
      : state.children[0]?.id;
  return state.children.find((child) => child.id === childId) || null;
}

function getCardForChild(state, childId) {
  return (state.emergencyCards || []).find((card) => card.childId === childId) || null;
}

function getFilteredEmergencyCards(state) {
  const cards = [...(state.emergencyCards || [])].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  if (state.emergencyFilterChildId === "all") return cards;
  return cards.filter((card) => card.childId === state.emergencyFilterChildId);
}

function childOptions(state, selectedId) {
  return state.children.map((child) => (
    `<option value="${child.id}" ${child.id === selectedId ? "selected" : ""}>${escapeHtml(child.name)} · ${child.weightKg} kg</option>`
  )).join("");
}

function valueAttr(value = "") {
  return escapeHtml(value ?? "");
}

function renderEmergencyModule() {
  const main = document.querySelector("#main");
  if (!main) return;

  const state = loadState();
  state.activeTab = "emergency";
  if (!Array.isArray(state.emergencyCards)) state.emergencyCards = [];
  if (!state.emergencyFilterChildId) state.emergencyFilterChildId = "all";

  const selectedChild = getSelectedEmergencyChild(state);
  if (selectedChild) state.emergencySelectedChildId = selectedChild.id;
  saveState(state);

  ensureEmergencyTab();
  markEmergencyTabActive();

  const currentCard = selectedChild ? getCardForChild(state, selectedChild.id) : null;
  const filteredCards = getFilteredEmergencyCards(state);

  main.innerHTML = `
    <section class="grid two" aria-labelledby="emergency-title">
      <div class="panel">
        <p class="eyebrow">Emergency Card</p>
        <h2 id="emergency-title">One clean handoff when nobody has time to dig.</h2>
        <p class="help">Create a copy-ready child emergency card with allergies, conditions, pediatrician details, insurance, preferred hospital, and trusted contacts.</p>

        <div class="notice" style="margin: 16px 0;">
          <strong>Privacy and safety frame</strong>
          <span>This module stores caregiver-entered details locally in this browser. It does not verify medical information or replace emergency services. For a public portfolio demo, avoid real sensitive data.</span>
        </div>

        <form id="emergency-form">
          <label class="field">
            Child profile
            <select id="emergency-child-select" name="childId">
              ${childOptions(state, selectedChild?.id)}
            </select>
          </label>

          <div class="field-grid">
            <label class="field">
              Allergies and reactions
              <textarea name="allergies" placeholder="Example: Penicillin rash, peanut allergy, no known allergies...">${escapeHtml(currentCard?.allergies || "")}</textarea>
            </label>
            <label class="field">
              Conditions / important medical notes
              <textarea name="conditions" placeholder="Example: asthma, seizures, heart condition, none recorded...">${escapeHtml(currentCard?.conditions || "")}</textarea>
            </label>
          </div>

          <label class="field">
            Current medications / routine notes
            <textarea name="currentMeds" placeholder="Example: inhaler instructions, regular meds, recent Dose & Go logs...">${escapeHtml(currentCard?.currentMeds || "")}</textarea>
          </label>

          <div class="field-grid">
            <label class="field">
              Pediatrician / doctor
              <input name="pediatricianName" maxlength="100" placeholder="Doctor or clinic name" value="${valueAttr(currentCard?.pediatricianName)}" />
            </label>
            <label class="field">
              Doctor phone
              <input name="pediatricianPhone" type="tel" maxlength="40" placeholder="Phone number" value="${valueAttr(currentCard?.pediatricianPhone)}" />
            </label>
          </div>

          <div class="field-grid">
            <label class="field">
              Preferred hospital / clinic
              <input name="preferredHospital" maxlength="120" placeholder="Hospital, urgent care, clinic" value="${valueAttr(currentCard?.preferredHospital)}" />
            </label>
            <label class="field">
              Insurance provider
              <input name="insuranceProvider" maxlength="100" placeholder="Provider name" value="${valueAttr(currentCard?.insuranceProvider)}" />
            </label>
          </div>

          <label class="field">
            Insurance / policy number
            <input name="insuranceNumber" maxlength="100" placeholder="Policy or membership number" value="${valueAttr(currentCard?.insuranceNumber)}" />
          </label>

          <div class="field-grid">
            <label class="field">
              Emergency contact 1
              <input name="contactOneName" maxlength="80" placeholder="Name" value="${valueAttr(currentCard?.contactOneName)}" />
            </label>
            <label class="field">
              Relationship
              <input name="contactOneRelation" maxlength="40" placeholder="Mother, father, guardian..." value="${valueAttr(currentCard?.contactOneRelation)}" />
            </label>
          </div>
          <label class="field">
            Contact 1 phone
            <input name="contactOnePhone" type="tel" maxlength="40" placeholder="Phone number" value="${valueAttr(currentCard?.contactOnePhone)}" />
          </label>

          <div class="field-grid">
            <label class="field">
              Emergency contact 2
              <input name="contactTwoName" maxlength="80" placeholder="Name" value="${valueAttr(currentCard?.contactTwoName)}" />
            </label>
            <label class="field">
              Relationship
              <input name="contactTwoRelation" maxlength="40" placeholder="Grandparent, friend, neighbor..." value="${valueAttr(currentCard?.contactTwoRelation)}" />
            </label>
          </div>
          <label class="field">
            Contact 2 phone
            <input name="contactTwoPhone" type="tel" maxlength="40" placeholder="Phone number" value="${valueAttr(currentCard?.contactTwoPhone)}" />
          </label>

          <label class="field">
            Access / handoff notes
            <textarea name="accessNotes" placeholder="Example: speaks Greek/English, bring insurance card, custody/handoff notes, consent context...">${escapeHtml(currentCard?.accessNotes || "")}</textarea>
          </label>

          <div class="form-actions">
            <button class="button" type="submit">Save emergency card</button>
            <button class="ghost-button" type="reset">Clear form</button>
          </div>
        </form>
      </div>

      <aside class="panel">
        <div class="section-title">
          <div>
            <p class="eyebrow">Wallet view</p>
            <h2>${currentCard ? `${escapeHtml(currentCard.childName)} card ready` : selectedChild ? `${escapeHtml(selectedChild.name)} card not saved yet` : "No child profile yet"}</h2>
            <p class="help">Copy a card for babysitters, family handoff, school forms, or emergency context. Keep real details private.</p>
          </div>
        </div>

        <div class="inline-actions" style="margin-bottom: 14px;">
          <select id="emergency-filter" aria-label="Filter emergency cards by child">
            <option value="all" ${state.emergencyFilterChildId === "all" ? "selected" : ""}>All cards</option>
            ${childOptions(state, state.emergencyFilterChildId)}
          </select>
          <button class="ghost-button" data-emergency-action="copy-all">Copy all cards</button>
          <button class="danger-button" data-emergency-action="clear-cards">Clear</button>
        </div>

        <div class="timeline">
          ${filteredCards.length ? filteredCards.map((card) => renderEmergencyCard(state, card)).join("") : renderEmpty("No emergency cards yet.", "Fill in a child's emergency card and save it here.")}
        </div>
      </aside>
    </section>
  `;

  main.focus({ preventScroll: true });
}

function renderEmergencyCard(state, card) {
  const child = state.children.find((item) => item.id === card.childId);
  const age = getAge(card.dateOfBirth || child?.dateOfBirth);
  const weight = card.weightKg || child?.weightKg;

  return `
    <article class="log-card">
      <div class="log-head">
        <div>
          <h3>${escapeHtml(card.childName)} · Emergency Card</h3>
          <p class="muted">${age}${weight ? ` · ${weight} kg` : ""} · Updated ${formatCompactDate(card.updatedAt)}</p>
        </div>
        <span class="warning-badge">Keep current</span>
      </div>
      ${card.allergies ? `<p class="help"><strong>Allergies:</strong> ${escapeHtml(card.allergies)}</p>` : `<p class="help"><strong>Allergies:</strong> Not recorded.</p>`}
      ${card.conditions ? `<p class="help"><strong>Conditions:</strong> ${escapeHtml(card.conditions)}</p>` : ""}
      ${card.currentMeds ? `<p class="help"><strong>Current meds:</strong> ${escapeHtml(card.currentMeds)}</p>` : ""}
      ${card.pediatricianName || card.pediatricianPhone ? `<p class="help"><strong>Doctor:</strong> ${escapeHtml([card.pediatricianName, card.pediatricianPhone].filter(Boolean).join(" · "))}</p>` : ""}
      ${card.contactOneName || card.contactOnePhone ? `<p class="help"><strong>Contact 1:</strong> ${escapeHtml([card.contactOneName, card.contactOneRelation, card.contactOnePhone].filter(Boolean).join(" · "))}</p>` : ""}
      ${card.contactTwoName || card.contactTwoPhone ? `<p class="help"><strong>Contact 2:</strong> ${escapeHtml([card.contactTwoName, card.contactTwoRelation, card.contactTwoPhone].filter(Boolean).join(" · "))}</p>` : ""}
      ${card.preferredHospital ? `<p class="help"><strong>Preferred hospital:</strong> ${escapeHtml(card.preferredHospital)}</p>` : ""}
      <div class="log-actions">
        <button class="text-button" data-emergency-action="edit-card" data-id="${card.childId}">Edit</button>
        <button class="text-button" data-emergency-action="copy-card" data-id="${card.id}">Copy card</button>
        <button class="text-button" data-emergency-action="print-card" data-id="${card.id}">Print view</button>
        <button class="text-button" data-emergency-action="delete-card" data-id="${card.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderEmpty(title, description) {
  return `<div class="empty-state"><h3>${escapeHtml(title)}</h3><p class="help">${escapeHtml(description)}</p></div>`;
}

function fieldLine(label, value, fallback = "Not recorded") {
  const text = value && String(value).trim() ? String(value).trim() : fallback;
  return `${label}: ${text}`;
}

function summarizeEmergencyCard(state, card) {
  const child = state.children.find((item) => item.id === card.childId);
  const dateOfBirth = card.dateOfBirth || child?.dateOfBirth || "Not recorded";
  const weight = card.weightKg || child?.weightKg || "Not recorded";

  return [
    `M.O.M. EMERGENCY CARD — ${card.childName}`,
    `Last updated: ${formatCompactDate(card.updatedAt)}`,
    fieldLine("Date of birth", dateOfBirth),
    fieldLine("Age", getAge(dateOfBirth)),
    fieldLine("Weight", weight === "Not recorded" ? weight : `${weight} kg`),
    fieldLine("Allergies/reactions", card.allergies),
    fieldLine("Conditions/medical notes", card.conditions),
    fieldLine("Current medications/routine notes", card.currentMeds),
    fieldLine("Pediatrician/doctor", [card.pediatricianName, card.pediatricianPhone].filter(Boolean).join(" · ")),
    fieldLine("Preferred hospital/clinic", card.preferredHospital),
    fieldLine("Insurance", [card.insuranceProvider, card.insuranceNumber].filter(Boolean).join(" · ")),
    fieldLine("Emergency contact 1", [card.contactOneName, card.contactOneRelation, card.contactOnePhone].filter(Boolean).join(" · ")),
    fieldLine("Emergency contact 2", [card.contactTwoName, card.contactTwoRelation, card.contactTwoPhone].filter(Boolean).join(" · ")),
    fieldLine("Access/handoff notes", card.accessNotes),
    "Safety note: caregiver-entered record only. Verify details and contact emergency services when needed."
  ].join("\n");
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch {
    showToast(text);
  }
}

function hasMeaningfulEmergencyDetail(data) {
  return [
    data.allergies,
    data.conditions,
    data.currentMeds,
    data.pediatricianName,
    data.pediatricianPhone,
    data.preferredHospital,
    data.insuranceProvider,
    data.insuranceNumber,
    data.contactOneName,
    data.contactOnePhone,
    data.contactTwoName,
    data.contactTwoPhone,
    data.accessNotes
  ].some((value) => value && String(value).trim());
}

function saveEmergencyCard(form) {
  const state = loadState();
  const data = Object.fromEntries(new FormData(form).entries());
  const child = state.children.find((item) => item.id === data.childId);

  if (!child) {
    showToast("Choose a child profile first.");
    return;
  }

  if (!hasMeaningfulEmergencyDetail(data)) {
    showToast("Add at least one emergency detail before saving.");
    return;
  }

  const existingCard = getCardForChild(state, child.id);
  const card = {
    id: existingCard?.id || uid("emergency"),
    childId: child.id,
    childName: child.name,
    dateOfBirth: child.dateOfBirth || existingCard?.dateOfBirth || "",
    weightKg: child.weightKg || existingCard?.weightKg || null,
    allergies: (data.allergies || "").trim(),
    conditions: (data.conditions || "").trim(),
    currentMeds: (data.currentMeds || "").trim(),
    pediatricianName: (data.pediatricianName || "").trim(),
    pediatricianPhone: (data.pediatricianPhone || "").trim(),
    preferredHospital: (data.preferredHospital || "").trim(),
    insuranceProvider: (data.insuranceProvider || "").trim(),
    insuranceNumber: (data.insuranceNumber || "").trim(),
    contactOneName: (data.contactOneName || "").trim(),
    contactOneRelation: (data.contactOneRelation || "").trim(),
    contactOnePhone: (data.contactOnePhone || "").trim(),
    contactTwoName: (data.contactTwoName || "").trim(),
    contactTwoRelation: (data.contactTwoRelation || "").trim(),
    contactTwoPhone: (data.contactTwoPhone || "").trim(),
    accessNotes: (data.accessNotes || "").trim(),
    updatedAt: new Date().toISOString()
  };

  const cards = (state.emergencyCards || []).filter((item) => item.childId !== child.id);
  state.emergencyCards = [card, ...cards];
  state.emergencySelectedChildId = child.id;
  state.emergencyFilterChildId = child.id;
  state.selectedChildId = child.id;
  state.activeTab = "emergency";
  saveState(state);
  renderEmergencyModule();
  showToast(`${child.name} emergency card saved.`);
}

function printEmergencyCard(state, card) {
  const summary = summarizeEmergencyCard(state, card);
  const printWindow = window.open("", "_blank", "width=520,height=760");
  if (!printWindow) {
    copyText(summary, "Card copied. Pop-up blocked the print view.");
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>${escapeHtml(card.childName)} emergency card</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 32px; line-height: 1.5; color: #2B211E; }
          pre { white-space: pre-wrap; font: inherit; }
          .card { border: 1px solid #d8c8bd; border-radius: 18px; padding: 24px; }
        </style>
      </head>
      <body>
        <div class="card"><pre>${escapeHtml(summary)}</pre></div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function handleEmergencyAction(target) {
  const state = loadState();
  const action = target.dataset.emergencyAction;
  const id = target.dataset.id;

  if (action === "edit-card") {
    if (!state.children.some((child) => child.id === id)) return;
    state.emergencySelectedChildId = id;
    state.activeTab = "emergency";
    saveState(state);
    renderEmergencyModule();
    setTimeout(() => document.querySelector("#emergency-form")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  }

  if (action === "copy-card") {
    const card = state.emergencyCards?.find((item) => item.id === id);
    if (card) copyText(summarizeEmergencyCard(state, card), "Emergency card copied.");
  }

  if (action === "copy-all") {
    const cards = getFilteredEmergencyCards(state);
    if (!cards.length) return showToast("No emergency cards to copy yet.");
    const summary = ["M.O.M. Emergency Cards", ...cards.map((card) => summarizeEmergencyCard(state, card))].join("\n\n---\n\n");
    copyText(summary, "Emergency cards copied.");
  }

  if (action === "print-card") {
    const card = state.emergencyCards?.find((item) => item.id === id);
    if (card) printEmergencyCard(state, card);
  }

  if (action === "delete-card") {
    const card = state.emergencyCards?.find((item) => item.id === id);
    if (!card || !confirm(`Delete ${card.childName}'s emergency card?`)) return;
    state.emergencyCards = state.emergencyCards.filter((item) => item.id !== id);
    saveState(state);
    renderEmergencyModule();
    showToast("Emergency card deleted.");
  }

  if (action === "clear-cards") {
    if (!state.emergencyCards?.length) return showToast("Emergency Card is already empty.");
    if (!confirm("Clear all emergency cards? Copy/export anything important first.")) return;
    state.emergencyCards = [];
    saveState(state);
    renderEmergencyModule();
    showToast("Emergency cards cleared.");
  }
}

document.addEventListener("click", (event) => {
  const tabButton = event.target.closest?.('[data-tab="emergency"]');
  if (tabButton) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const state = loadState();
    state.activeTab = "emergency";
    saveState(state);
    renderEmergencyModule();
    return;
  }

  const actionTarget = event.target.closest?.("[data-emergency-action]");
  if (actionTarget) {
    event.preventDefault();
    event.stopImmediatePropagation();
    handleEmergencyAction(actionTarget);
  }
}, true);

document.addEventListener("submit", (event) => {
  if (event.target?.id !== "emergency-form") return;
  event.preventDefault();
  event.stopImmediatePropagation();
  saveEmergencyCard(event.target);
}, true);

document.addEventListener("change", (event) => {
  if (event.target?.id === "emergency-child-select") {
    event.preventDefault();
    event.stopImmediatePropagation();
    const state = loadState();
    state.emergencySelectedChildId = event.target.value;
    state.activeTab = "emergency";
    saveState(state);
    renderEmergencyModule();
    return;
  }

  if (event.target.closest?.("#emergency-form")) {
    event.stopImmediatePropagation();
    return;
  }

  if (event.target?.id === "emergency-filter") {
    event.preventDefault();
    event.stopImmediatePropagation();
    const state = loadState();
    state.emergencyFilterChildId = event.target.value;
    state.activeTab = "emergency";
    saveState(state);
    renderEmergencyModule();
  }
}, true);

const observer = new MutationObserver(ensureEmergencyTab);
observer.observe(document.body, { childList: true, subtree: true });

ensureEmergencyTab();

if (loadState().activeTab === "emergency") {
  renderEmergencyModule();
}
