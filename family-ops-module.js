import { formatCompactDate } from "./src/dose.js";
import { demoState, STORAGE_KEY } from "./src/seed.js";

const categories = [
  "Morning routine",
  "School",
  "Health",
  "Home",
  "Errand",
  "Meal",
  "Admin",
  "Other"
];

const statusLabels = {
  todo: "To do",
  today: "Today",
  waiting: "Waiting",
  done: "Done"
};

const priorityLabels = {
  low: "Low",
  normal: "Normal",
  high: "High"
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

function parseChecklist(value = "") {
  return String(value)
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
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
      emergencyCards: parsed.emergencyCards || clone(demoState.emergencyCards || []),
      familyTasks: parsed.familyTasks || clone(demoState.familyTasks || []),
      familyOpsFilterChildId: parsed.familyOpsFilterChildId || "all",
      familyOpsFilterStatus: parsed.familyOpsFilterStatus || "open",
      familyOpsFilterOwner: parsed.familyOpsFilterOwner || "all"
    };
  } catch (error) {
    console.warn("Could not load M.O.M. Family Ops state", error);
    return {
      ...clone(demoState),
      familyTasks: clone(demoState.familyTasks || []),
      familyOpsFilterChildId: "all",
      familyOpsFilterStatus: "open",
      familyOpsFilterOwner: "all"
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

function ensureFamilyTab() {
  const tabs = document.querySelector(".tabs");
  if (!tabs || tabs.querySelector('[data-tab="family"]')) return;

  const button = document.createElement("button");
  button.className = "tab-button";
  button.type = "button";
  button.setAttribute("role", "tab");
  button.setAttribute("aria-selected", "false");
  button.dataset.tab = "family";
  button.textContent = "Family Ops";

  const emergencyButton = tabs.querySelector('[data-tab="emergency"]') || tabs.querySelector('[data-tab="appointments"]');
  emergencyButton?.insertAdjacentElement("afterend", button) || tabs.append(button);
}

function markFamilyTabActive() {
  document.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.setAttribute("aria-selected", tab.dataset.tab === "family" ? "true" : "false");
  });
}

function getChildLabel(state, childId) {
  if (childId === "family") return "Family";
  return state.children.find((child) => child.id === childId)?.name || "Selected child";
}

function getChildOptions(state, selectedId = "family") {
  const childOptions = state.children.map((child) => (
    `<option value="${child.id}" ${child.id === selectedId ? "selected" : ""}>${escapeHtml(child.name)} · ${child.weightKg} kg</option>`
  )).join("");

  return `<option value="family" ${selectedId === "family" ? "selected" : ""}>Family / all children</option>${childOptions}`;
}

function getOwners(state) {
  return Array.from(new Set([
    "Me",
    "Partner",
    "Grandparent",
    "School",
    "Other",
    ...(state.familyTasks || []).map((task) => task.owner).filter(Boolean)
  ]));
}

function isDueToday(isoString) {
  if (!isoString) return false;
  const dueDate = new Date(isoString);
  if (Number.isNaN(dueDate.getTime())) return false;
  return dueDate.toDateString() === new Date().toDateString();
}

function isOverdue(isoString) {
  if (!isoString) return false;
  const dueDate = new Date(isoString);
  if (Number.isNaN(dueDate.getTime())) return false;
  return dueDate.getTime() < Date.now() && !isDueToday(isoString);
}

function getFilteredTasks(state) {
  let tasks = [...(state.familyTasks || [])];

  if (state.familyOpsFilterChildId !== "all") {
    tasks = tasks.filter((task) => task.childId === state.familyOpsFilterChildId);
  }

  if (state.familyOpsFilterOwner !== "all") {
    tasks = tasks.filter((task) => task.owner === state.familyOpsFilterOwner);
  }

  if (state.familyOpsFilterStatus === "open") {
    tasks = tasks.filter((task) => task.status !== "done");
  } else if (state.familyOpsFilterStatus !== "all") {
    tasks = tasks.filter((task) => task.status === state.familyOpsFilterStatus);
  }

  return tasks.sort((a, b) => {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    const statusOrder = { today: 0, todo: 1, waiting: 2, done: 3 };
    const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
    const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
    return (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)
      || (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9)
      || aDue - bDue;
  });
}

function getTodayStats(state) {
  const tasks = state.familyTasks || [];
  return {
    open: tasks.filter((task) => task.status !== "done").length,
    today: tasks.filter((task) => task.status !== "done" && (task.status === "today" || isDueToday(task.dueAt))).length,
    waiting: tasks.filter((task) => task.status === "waiting").length,
    done: tasks.filter((task) => task.status === "done").length
  };
}

function renderFamilyOpsModule() {
  const main = document.querySelector("#main");
  if (!main) return;

  const state = loadState();
  state.activeTab = "family";
  if (!Array.isArray(state.familyTasks)) state.familyTasks = [];
  if (!state.familyOpsFilterChildId) state.familyOpsFilterChildId = "all";
  if (!state.familyOpsFilterStatus) state.familyOpsFilterStatus = "open";
  if (!state.familyOpsFilterOwner) state.familyOpsFilterOwner = "all";
  saveState(state);

  ensureFamilyTab();
  markFamilyTabActive();

  const filteredTasks = getFilteredTasks(state);
  const stats = getTodayStats(state);
  const owners = getOwners(state);
  const nextTask = filteredTasks.find((task) => task.status !== "done") || filteredTasks[0] || null;

  main.innerHTML = `
    <section class="grid two" aria-labelledby="family-title">
      <div class="panel">
        <p class="eyebrow">Family Ops</p>
        <h2 id="family-title">Who needs what today?</h2>
        <p class="help">A lightweight handoff board for tasks, ownership, blockers, school/admin needs, and the tiny details that usually live in one exhausted person's head.</p>

        <div class="stat-grid" aria-label="Family task stats" style="margin: 16px 0;">
          <div class="stat"><span>Open</span><strong>${stats.open}</strong></div>
          <div class="stat"><span>Today</span><strong>${stats.today}</strong></div>
          <div class="stat"><span>Waiting</span><strong>${stats.waiting}</strong></div>
        </div>

        <div class="notice" style="margin: 16px 0;">
          <strong>Product frame</strong>
          <span>Family Ops is a coordination board, not an emergency service, clinical workflow, or legal task manager. It turns handoff chaos into visible next actions.</span>
        </div>

        <form id="family-task-form">
          <div class="field-grid">
            <label class="field">
              Child / scope
              <select name="childId">${getChildOptions(state, state.selectedChildId || "family")}</select>
            </label>
            <label class="field">
              Task title
              <input name="title" required maxlength="90" placeholder="Pack school bag / call clinic / buy formula" />
            </label>
          </div>

          <div class="field-grid">
            <label class="field">
              Category
              <select name="category">
                ${categories.map((category) => `<option>${escapeHtml(category)}</option>`).join("")}
              </select>
            </label>
            <label class="field">
              Owner
              <input name="owner" required maxlength="40" placeholder="Me, partner, grandma, school..." value="Me" />
            </label>
          </div>

          <div class="field-grid">
            <label class="field">
              Status
              <select name="status">
                <option value="today">Today</option>
                <option value="todo">To do</option>
                <option value="waiting">Waiting</option>
              </select>
            </label>
            <label class="field">
              Priority
              <select name="priority">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </label>
          </div>

          <label class="field">
            Due date / time
            <input name="dueAt" type="datetime-local" />
          </label>

          <label class="field">
            Checklist items
            <textarea name="checklist" placeholder="One per line: water bottle, school form, fever summary..."></textarea>
          </label>

          <label class="field">
            Notes / blocker
            <textarea name="note" placeholder="What does the next person need to know?"></textarea>
          </label>

          <div class="form-actions">
            <button class="button" type="submit">Add task</button>
            <button class="ghost-button" type="reset">Clear form</button>
          </div>
        </form>
      </div>

      <aside class="panel">
        <div class="section-title">
          <div>
            <p class="eyebrow">Handoff board</p>
            <h2>${nextTask ? escapeHtml(nextTask.title) : "No open tasks"}</h2>
            <p class="help">${nextTask ? `${escapeHtml(nextTask.childName)} · ${escapeHtml(nextTask.owner)} · ${escapeHtml(statusLabels[nextTask.status] || nextTask.status)}` : "Add tasks to build the shared family operating board."}</p>
          </div>
        </div>

        <div class="inline-actions" style="margin-bottom: 14px;">
          <select id="family-child-filter" aria-label="Filter tasks by child">
            <option value="all" ${state.familyOpsFilterChildId === "all" ? "selected" : ""}>All scopes</option>
            ${getChildOptions(state, state.familyOpsFilterChildId)}
          </select>
          <select id="family-status-filter" aria-label="Filter tasks by status">
            <option value="open" ${state.familyOpsFilterStatus === "open" ? "selected" : ""}>Open tasks</option>
            <option value="all" ${state.familyOpsFilterStatus === "all" ? "selected" : ""}>All statuses</option>
            <option value="today" ${state.familyOpsFilterStatus === "today" ? "selected" : ""}>Today</option>
            <option value="todo" ${state.familyOpsFilterStatus === "todo" ? "selected" : ""}>To do</option>
            <option value="waiting" ${state.familyOpsFilterStatus === "waiting" ? "selected" : ""}>Waiting</option>
            <option value="done" ${state.familyOpsFilterStatus === "done" ? "selected" : ""}>Done</option>
          </select>
          <select id="family-owner-filter" aria-label="Filter tasks by owner">
            <option value="all" ${state.familyOpsFilterOwner === "all" ? "selected" : ""}>All owners</option>
            ${owners.map((owner) => `<option value="${escapeHtml(owner)}" ${state.familyOpsFilterOwner === owner ? "selected" : ""}>${escapeHtml(owner)}</option>`).join("")}
          </select>
          <button class="ghost-button" data-family-action="copy-handoff">Copy handoff</button>
          <button class="danger-button" data-family-action="clear-tasks">Clear</button>
        </div>

        <div class="timeline">
          ${filteredTasks.length ? filteredTasks.map(renderFamilyTaskCard).join("") : renderEmpty("No tasks match this filter.", "Add a family task or loosen the filters.")}
        </div>
      </aside>
    </section>
  `;

  main.focus({ preventScroll: true });
}

function renderFamilyTaskCard(task) {
  const checklist = Array.isArray(task.checklist) ? task.checklist : [];
  const dueLabel = task.dueAt ? formatCompactDate(task.dueAt) : "No due date";
  const overdue = task.status !== "done" && isOverdue(task.dueAt);
  const statusClass = task.status === "done" ? "ok-badge" : task.status === "waiting" ? "warning-badge" : task.priority === "high" || overdue ? "warning-badge" : "badge";
  const dueText = overdue ? `${dueLabel} · overdue` : dueLabel;

  return `
    <article class="log-card">
      <div class="log-head">
        <div>
          <h3>${escapeHtml(task.title)} · ${escapeHtml(task.childName)}</h3>
          <p class="muted">${escapeHtml(task.category)} · ${escapeHtml(task.owner)} · ${escapeHtml(dueText)}</p>
        </div>
        <span class="${statusClass}">${escapeHtml(statusLabels[task.status] || task.status)} · ${escapeHtml(priorityLabels[task.priority] || task.priority)}</span>
      </div>
      ${checklist.length ? `<p class="help"><strong>Checklist:</strong> ${escapeHtml(checklist.join(" · "))}</p>` : ""}
      ${task.note ? `<p>${escapeHtml(task.note)}</p>` : ""}
      ${task.completedAt ? `<p class="help"><strong>Completed:</strong> ${formatCompactDate(task.completedAt)}</p>` : ""}
      <div class="log-actions">
        <button class="text-button" data-family-action="copy-task" data-id="${task.id}">Copy task</button>
        <button class="text-button" data-family-action="make-today" data-id="${task.id}">Make today</button>
        <button class="text-button" data-family-action="toggle-done" data-id="${task.id}">${task.status === "done" ? "Reopen" : "Mark done"}</button>
        <button class="text-button" data-family-action="delete-task" data-id="${task.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderEmpty(title, description) {
  return `<div class="empty-state"><h3>${escapeHtml(title)}</h3><p class="help">${escapeHtml(description)}</p></div>`;
}

function summarizeTask(task) {
  const checklist = Array.isArray(task.checklist) && task.checklist.length ? ` Checklist: ${task.checklist.join(", ")}.` : "";
  const due = task.dueAt ? ` Due: ${formatCompactDate(task.dueAt)}.` : "";
  const note = task.note ? ` Notes: ${task.note}.` : "";
  return `${task.childName}: ${task.title} — ${statusLabels[task.status] || task.status}, owner: ${task.owner}, priority: ${priorityLabels[task.priority] || task.priority}.${due}${checklist}${note}`;
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch {
    showToast(text);
  }
}

function saveFamilyTask(form) {
  const state = loadState();
  const data = Object.fromEntries(new FormData(form).entries());

  if (!data.title?.trim() || !data.owner?.trim()) {
    showToast("Add a task title and owner.");
    return;
  }

  const childId = data.childId || "family";
  const dueAt = data.dueAt ? new Date(data.dueAt) : null;
  const task = {
    id: uid("family"),
    childId,
    childName: getChildLabel(state, childId),
    title: data.title.trim(),
    category: data.category || "Other",
    owner: data.owner.trim(),
    status: data.status || "todo",
    priority: data.priority || "normal",
    dueAt: dueAt && !Number.isNaN(dueAt.getTime()) ? dueAt.toISOString() : "",
    checklist: parseChecklist(data.checklist),
    note: (data.note || "").trim(),
    createdAt: new Date().toISOString(),
    completedAt: ""
  };

  state.familyTasks = [task, ...(state.familyTasks || [])];
  state.familyOpsFilterChildId = childId;
  state.familyOpsFilterStatus = "open";
  state.familyOpsFilterOwner = "all";
  state.activeTab = "family";
  if (childId !== "family") state.selectedChildId = childId;
  saveState(state);
  renderFamilyOpsModule();
  showToast(`${task.title} added to Family Ops.`);
}

function updateTask(state, id, updater) {
  const task = state.familyTasks?.find((item) => item.id === id);
  if (!task) return null;
  updater(task);
  return task;
}

function handleFamilyAction(target) {
  const state = loadState();
  const action = target.dataset.familyAction;
  const id = target.dataset.id;

  if (action === "copy-handoff") {
    const tasks = getFilteredTasks(state).filter((task) => task.status !== "done");
    if (!tasks.length) return showToast("No open tasks to hand off.");
    const summary = ["M.O.M. Family Ops handoff:", ...tasks.map((task) => `- ${summarizeTask(task)}`)].join("\n");
    copyText(summary, "Family handoff copied.");
  }

  if (action === "copy-task") {
    const task = state.familyTasks?.find((item) => item.id === id);
    if (task) copyText(summarizeTask(task), "Task copied.");
  }

  if (action === "make-today") {
    const task = updateTask(state, id, (item) => {
      if (item.status !== "done") item.status = "today";
    });
    if (!task) return;
    saveState(state);
    renderFamilyOpsModule();
    showToast("Moved to today.");
  }

  if (action === "toggle-done") {
    const task = updateTask(state, id, (item) => {
      if (item.status === "done") {
        item.status = "todo";
        item.completedAt = "";
      } else {
        item.status = "done";
        item.completedAt = new Date().toISOString();
      }
    });
    if (!task) return;
    saveState(state);
    renderFamilyOpsModule();
    showToast(task.status === "done" ? "Task marked done." : "Task reopened.");
  }

  if (action === "delete-task") {
    const task = state.familyTasks?.find((item) => item.id === id);
    if (!task || !confirm(`Delete ${task.title}?`)) return;
    state.familyTasks = state.familyTasks.filter((item) => item.id !== id);
    saveState(state);
    renderFamilyOpsModule();
    showToast("Task deleted.");
  }

  if (action === "clear-tasks") {
    if (!state.familyTasks?.length) return showToast("Family Ops is already empty.");
    if (!confirm("Clear all Family Ops tasks? Copy a handoff first if you need a record.")) return;
    state.familyTasks = [];
    saveState(state);
    renderFamilyOpsModule();
    showToast("Family Ops cleared.");
  }
}

document.addEventListener("click", (event) => {
  const tabButton = event.target.closest?.('[data-tab="family"]');
  if (tabButton) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const state = loadState();
    state.activeTab = "family";
    saveState(state);
    renderFamilyOpsModule();
    return;
  }

  const actionTarget = event.target.closest?.("[data-family-action]");
  if (actionTarget) {
    event.preventDefault();
    event.stopImmediatePropagation();
    handleFamilyAction(actionTarget);
  }
}, true);

document.addEventListener("submit", (event) => {
  if (event.target?.id !== "family-task-form") return;
  event.preventDefault();
  event.stopImmediatePropagation();
  saveFamilyTask(event.target);
}, true);

document.addEventListener("change", (event) => {
  if (event.target.closest?.("#family-task-form")) {
    event.stopImmediatePropagation();
    return;
  }

  if (["family-child-filter", "family-status-filter", "family-owner-filter"].includes(event.target?.id)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const state = loadState();
    state.familyOpsFilterChildId = document.querySelector("#family-child-filter")?.value || "all";
    state.familyOpsFilterStatus = document.querySelector("#family-status-filter")?.value || "open";
    state.familyOpsFilterOwner = document.querySelector("#family-owner-filter")?.value || "all";
    state.activeTab = "family";
    saveState(state);
    renderFamilyOpsModule();
  }
}, true);

const observer = new MutationObserver(ensureFamilyTab);
observer.observe(document.body, { childList: true, subtree: true });

ensureFamilyTab();

if (loadState().activeTab === "family") {
  renderFamilyOpsModule();
}
