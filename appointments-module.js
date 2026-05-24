import { formatCompactDate } from "./src/dose.js";
import { demoState, STORAGE_KEY } from "./src/seed.js";

const appointmentTypes = [
  "Pediatrician",
  "Dentist",
  "Vaccination",
  "School",
  "Therapy",
  "Forms / paperwork",
  "Family admin",
  "Other"
];

const statusLabels = {
  planned: "Planned",
  prep: "Prep needed",
  done: "Done"
};

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

function toLocalInputValue(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
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
      appointmentFilterChildId: parsed.appointmentFilterChildId || "all",
      appointmentFilterStatus: parsed.appointmentFilterStatus || "all"
    };
  } catch (error) {
    console.warn("Could not load M.O.M. Appointments state", error);
    return {
      ...clone(demoState),
      appointments: clone(demoState.appointments || []),
      appointmentFilterChildId: "all",
      appointmentFilterStatus: "all"
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

function ensureAppointmentsTab() {
  const tabs = document.querySelector(".tabs");
  if (!tabs || tabs.querySelector('[data-tab="appointments"]')) return;

  const button = document.createElement("button");
  button.className = "tab-button";
  button.type = "button";
  button.setAttribute("role", "tab");
  button.setAttribute("aria-selected", "false");
  button.dataset.tab = "appointments";
  button.textContent = "Appointments";

  const feverButton = tabs.querySelector('[data-tab="fever"]') || tabs.querySelector('[data-tab="calculate"]');
  feverButton?.insertAdjacentElement("afterend", button) || tabs.append(button);
}

function markAppointmentsTabActive() {
  document.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.setAttribute("aria-selected", tab.dataset.tab === "appointments" ? "true" : "false");
  });
}

function getChildOptions(state, selectedId = "") {
  const childOptions = state.children.map((child) => (
    `<option value="${child.id}" ${child.id === selectedId ? "selected" : ""}>${escapeHtml(child.name)} · ${child.weightKg} kg</option>`
  )).join("");

  return `<option value="family" ${selectedId === "family" ? "selected" : ""}>Family / all children</option>${childOptions}`;
}

function getFilteredAppointments(state) {
  let items = [...(state.appointments || [])];

  if (state.appointmentFilterChildId !== "all") {
    items = items.filter((item) => item.childId === state.appointmentFilterChildId);
  }

  if (state.appointmentFilterStatus !== "all") {
    items = items.filter((item) => item.status === state.appointmentFilterStatus);
  }

  return items.sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
}

function getRelevantRecentContext(state, appointment) {
  if (!appointment || appointment.childId === "family") return [];

  const feverContext = (state.feverLogs || [])
    .filter((entry) => entry.childId === appointment.childId)
    .sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt))
    .slice(0, 3)
    .map((entry) => `${entry.temperature}°${entry.unit} via ${entry.method} on ${formatCompactDate(entry.loggedAt)}${entry.symptoms?.length ? `; symptoms: ${entry.symptoms.join(", ")}` : ""}`);

  const doseContext = (state.logs || [])
    .filter((entry) => entry.childId === appointment.childId)
    .sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt))
    .slice(0, 3)
    .map((entry) => `${entry.medicationName}: ${entry.totalDose} ${entry.doseUnit} on ${formatCompactDate(entry.takenAt)}`);

  return [
    ...feverContext.map((line) => `Fever: ${line}`),
    ...doseContext.map((line) => `Dose: ${line}`)
  ];
}

function renderAppointmentsModule() {
  const main = document.querySelector("#main");
  if (!main) return;

  const state = loadState();
  state.activeTab = "appointments";
  if (!Array.isArray(state.appointments)) state.appointments = [];
  if (!state.appointmentFilterChildId) state.appointmentFilterChildId = "all";
  if (!state.appointmentFilterStatus) state.appointmentFilterStatus = "all";
  saveState(state);

  ensureAppointmentsTab();
  markAppointmentsTabActive();

  const filteredAppointments = getFilteredAppointments(state);
  const nextAppointment = filteredAppointments.find((item) => item.status !== "done") || filteredAppointments[0] || null;

  main.innerHTML = `
    <section class="grid two" aria-labelledby="appointments-title">
      <div class="panel">
        <p class="eyebrow">Appointments</p>
        <h2 id="appointments-title">Turn the “what do I need to ask?” panic into a prep brief.</h2>
        <p class="help">Track pediatrician visits, school deadlines, paperwork, and follow-up tasks. M.O.M. keeps the context tied to the right child or the whole family.</p>

        <div class="notice" style="margin: 16px 0;">
          <strong>Product frame</strong>
          <span>This module organizes caregiver notes and reminders. It does not replace calendar, clinical, school, or emergency guidance.</span>
        </div>

        <form id="appointment-form">
          <div class="field-grid">
            <label class="field">
              Child / scope
              <select name="childId">${getChildOptions(state, state.selectedChildId || "family")}</select>
            </label>
            <label class="field">
              Appointment or deadline title
              <input name="title" required maxlength="80" placeholder="Pediatrician follow-up" />
            </label>
          </div>

          <div class="field-grid">
            <label class="field">
              Type
              <select name="type">
                ${appointmentTypes.map((type) => `<option>${escapeHtml(type)}</option>`).join("")}
              </select>
            </label>
            <label class="field">
              Date and time
              <input name="startsAt" type="datetime-local" required />
            </label>
          </div>

          <div class="field-grid">
            <label class="field">
              Location
              <input name="location" maxlength="100" placeholder="Clinic, school, office, online" />
            </label>
            <label class="field">
              Provider / contact
              <input name="provider" maxlength="100" placeholder="Doctor, teacher, office name" />
            </label>
          </div>

          <label class="field">
            Questions / agenda
            <textarea name="agenda" placeholder="What do you need to ask, confirm, or remember?"></textarea>
          </label>

          <label class="field">
            Documents / forms to bring
            <textarea name="documents" placeholder="Insurance card, school form, fever summary, medication log..."></textarea>
          </label>

          <label class="field">
            Follow-up actions
            <textarea name="followUp" placeholder="What needs to happen after this appointment?"></textarea>
          </label>

          <label class="field">
            Notes
            <textarea name="note" placeholder="Optional context, parking, reminders, who is taking the child..."></textarea>
          </label>

          <div class="form-actions">
            <button class="button" type="submit">Save appointment</button>
            <button class="ghost-button" type="reset">Clear form</button>
          </div>
        </form>
      </div>

      <aside class="panel">
        <div class="section-title">
          <div>
            <p class="eyebrow">Prep board</p>
            <h2>${nextAppointment ? escapeHtml(nextAppointment.title) : "Nothing scheduled yet"}</h2>
            <p class="help">${nextAppointment ? `${escapeHtml(nextAppointment.childName)} · ${formatCompactDate(nextAppointment.startsAt)} · ${escapeHtml(statusLabels[nextAppointment.status] || nextAppointment.status)}` : "Add an appointment or deadline to start building the family operations timeline."}</p>
          </div>
        </div>

        <div class="inline-actions" style="margin-bottom: 14px;">
          <select id="appointment-child-filter" aria-label="Filter appointments by child">
            <option value="all" ${state.appointmentFilterChildId === "all" ? "selected" : ""}>All scopes</option>
            ${getChildOptions(state, state.appointmentFilterChildId)}
          </select>
          <select id="appointment-status-filter" aria-label="Filter appointments by status">
            <option value="all" ${state.appointmentFilterStatus === "all" ? "selected" : ""}>All statuses</option>
            <option value="planned" ${state.appointmentFilterStatus === "planned" ? "selected" : ""}>Planned</option>
            <option value="prep" ${state.appointmentFilterStatus === "prep" ? "selected" : ""}>Prep needed</option>
            <option value="done" ${state.appointmentFilterStatus === "done" ? "selected" : ""}>Done</option>
          </select>
          <button class="ghost-button" data-appointment-action="copy-schedule">Copy schedule summary</button>
          <button class="danger-button" data-appointment-action="clear-appointments">Clear</button>
        </div>

        <div class="timeline">
          ${filteredAppointments.length ? filteredAppointments.map((appointment) => renderAppointmentCard(state, appointment)).join("") : renderEmpty("No appointments match this filter.", "Add a visit, deadline, or task to see it here.")}
        </div>
      </aside>
    </section>
  `;

  main.focus({ preventScroll: true });
}

function renderAppointmentCard(state, appointment) {
  const contextLines = getRelevantRecentContext(state, appointment);
  const statusClass = appointment.status === "done" ? "ok-badge" : appointment.status === "prep" ? "warning-badge" : "badge";

  return `
    <article class="log-card">
      <div class="log-head">
        <div>
          <h3>${escapeHtml(appointment.title)} · ${escapeHtml(appointment.childName)}</h3>
          <p class="muted">${formatCompactDate(appointment.startsAt)} · ${escapeHtml(appointment.type)}</p>
        </div>
        <span class="${statusClass}">${escapeHtml(statusLabels[appointment.status] || appointment.status)}</span>
      </div>
      ${appointment.location || appointment.provider ? `<p class="help"><strong>Where/who:</strong> ${escapeHtml([appointment.location, appointment.provider].filter(Boolean).join(" · "))}</p>` : ""}
      ${appointment.agenda ? `<p class="help"><strong>Questions:</strong> ${escapeHtml(appointment.agenda)}</p>` : ""}
      ${appointment.documents ? `<p class="help"><strong>Bring:</strong> ${escapeHtml(appointment.documents)}</p>` : ""}
      ${appointment.followUp ? `<p class="help"><strong>Follow-up:</strong> ${escapeHtml(appointment.followUp)}</p>` : ""}
      ${appointment.note ? `<p>${escapeHtml(appointment.note)}</p>` : ""}
      ${contextLines.length ? `<div class="notice" style="margin: 12px 0;"><strong>Recent context</strong><span>${escapeHtml(contextLines.slice(0, 2).join(" · "))}</span></div>` : ""}
      <div class="log-actions">
        <button class="text-button" data-appointment-action="copy-brief" data-id="${appointment.id}">Copy prep brief</button>
        <button class="text-button" data-appointment-action="toggle-done" data-id="${appointment.id}">${appointment.status === "done" ? "Reopen" : "Mark done"}</button>
        <button class="text-button" data-appointment-action="delete-appointment" data-id="${appointment.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderEmpty(title, description) {
  return `<div class="empty-state"><h3>${escapeHtml(title)}</h3><p class="help">${escapeHtml(description)}</p></div>`;
}

function getChildLabel(state, childId) {
  if (childId === "family") return "Family";
  return state.children.find((child) => child.id === childId)?.name || "Selected child";
}

function summarizeAppointment(state, appointment) {
  const contextLines = getRelevantRecentContext(state, appointment);
  return [
    `M.O.M. appointment prep brief`,
    `${appointment.title} — ${appointment.childName}`,
    `When: ${formatCompactDate(appointment.startsAt)}`,
    `Type: ${appointment.type}`,
    appointment.location ? `Location: ${appointment.location}` : "",
    appointment.provider ? `Provider/contact: ${appointment.provider}` : "",
    appointment.agenda ? `Questions/agenda: ${appointment.agenda}` : "",
    appointment.documents ? `Documents/forms: ${appointment.documents}` : "",
    appointment.followUp ? `Follow-up actions: ${appointment.followUp}` : "",
    appointment.note ? `Notes: ${appointment.note}` : "",
    contextLines.length ? `Recent M.O.M. context: ${contextLines.join(" | ")}` : ""
  ].filter(Boolean).join("\n");
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch {
    showToast(text);
  }
}

function saveAppointment(form) {
  const state = loadState();
  const data = Object.fromEntries(new FormData(form).entries());
  const startsAt = new Date(data.startsAt);

  if (!data.title?.trim() || Number.isNaN(startsAt.getTime())) {
    showToast("Add a title and date/time.");
    return;
  }

  const childId = data.childId || "family";
  const appointment = {
    id: uid("appt"),
    childId,
    childName: getChildLabel(state, childId),
    title: data.title.trim(),
    type: data.type || "Other",
    status: data.agenda || data.documents || data.followUp ? "prep" : "planned",
    startsAt: startsAt.toISOString(),
    location: (data.location || "").trim(),
    provider: (data.provider || "").trim(),
    agenda: (data.agenda || "").trim(),
    documents: (data.documents || "").trim(),
    followUp: (data.followUp || "").trim(),
    note: (data.note || "").trim()
  };

  state.appointments = [appointment, ...(state.appointments || [])];
  state.appointmentFilterChildId = childId;
  state.appointmentFilterStatus = "all";
  state.activeTab = "appointments";
  if (childId !== "family") state.selectedChildId = childId;
  saveState(state);
  renderAppointmentsModule();
  showToast(`${appointment.title} saved.`);
}

function handleAppointmentAction(target) {
  const state = loadState();
  const action = target.dataset.appointmentAction;
  const id = target.dataset.id;

  if (action === "copy-schedule") {
    const appointments = getFilteredAppointments(state);
    if (!appointments.length) return showToast("No appointments to summarize yet.");
    const summary = [
      "M.O.M. appointment schedule summary:",
      ...appointments.map((appointment) => `- ${formatCompactDate(appointment.startsAt)} · ${appointment.childName} · ${appointment.title} · ${statusLabels[appointment.status] || appointment.status}`)
    ].join("\n");
    copyText(summary, "Schedule summary copied.");
  }

  if (action === "copy-brief") {
    const appointment = state.appointments?.find((item) => item.id === id);
    if (appointment) copyText(summarizeAppointment(state, appointment), "Prep brief copied.");
  }

  if (action === "toggle-done") {
    const appointment = state.appointments?.find((item) => item.id === id);
    if (!appointment) return;
    appointment.status = appointment.status === "done" ? "planned" : "done";
    saveState(state);
    renderAppointmentsModule();
    showToast(appointment.status === "done" ? "Marked done." : "Appointment reopened.");
  }

  if (action === "delete-appointment") {
    const appointment = state.appointments?.find((item) => item.id === id);
    if (!appointment || !confirm(`Delete ${appointment.title}?`)) return;
    state.appointments = state.appointments.filter((item) => item.id !== id);
    saveState(state);
    renderAppointmentsModule();
    showToast("Appointment deleted.");
  }

  if (action === "clear-appointments") {
    if (!state.appointments?.length) return showToast("Appointments are already empty.");
    if (!confirm("Clear all appointments and deadlines? Copy a summary first if you need a record.")) return;
    state.appointments = [];
    saveState(state);
    renderAppointmentsModule();
    showToast("Appointments cleared.");
  }
}

document.addEventListener("click", (event) => {
  const tabButton = event.target.closest?.('[data-tab="appointments"]');
  if (tabButton) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const state = loadState();
    state.activeTab = "appointments";
    saveState(state);
    renderAppointmentsModule();
    return;
  }

  const actionTarget = event.target.closest?.("[data-appointment-action]");
  if (actionTarget) {
    event.preventDefault();
    event.stopImmediatePropagation();
    handleAppointmentAction(actionTarget);
  }
}, true);

document.addEventListener("submit", (event) => {
  if (event.target?.id !== "appointment-form") return;
  event.preventDefault();
  event.stopImmediatePropagation();
  saveAppointment(event.target);
}, true);

document.addEventListener("change", (event) => {
  if (event.target.closest?.("#appointment-form")) {
    event.stopImmediatePropagation();
    return;
  }

  if (event.target?.id === "appointment-child-filter" || event.target?.id === "appointment-status-filter") {
    event.preventDefault();
    event.stopImmediatePropagation();
    const state = loadState();
    state.appointmentFilterChildId = document.querySelector("#appointment-child-filter")?.value || "all";
    state.appointmentFilterStatus = document.querySelector("#appointment-status-filter")?.value || "all";
    state.activeTab = "appointments";
    saveState(state);
    renderAppointmentsModule();
  }
}, true);

const observer = new MutationObserver(ensureAppointmentsTab);
observer.observe(document.body, { childList: true, subtree: true });

ensureAppointmentsTab();

if (loadState().activeTab === "appointments") {
  renderAppointmentsModule();
}
