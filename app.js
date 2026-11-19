// Головна логіка практичної роботи «Текстові поля в Python» (8 клас)
(function () {
  const STORAGE_KEY = "python_text_fields_8grade_v1";

  const SECTIONS = [
    { id: "theory", label: "1. Теоретичні знання" },
    { id: "visual", label: "2. Візуальний аналіз" },
    { id: "simulators", label: "3. Інтерактивні симулятори" },
    { id: "dnd", label: "4. Drag & Drop" },
    { id: "open", label: "5. Відкриті відповіді" },
    { id: "workshop", label: "6. Творча майстерня" },
    { id: "report", label: "7. Аналітичний звіт" }
  ];

  let state = loadState();
  let selectedDragCard = null;

  function defaultState() {
    return {
      registered: false,
      student: { lastName: "", firstName: "", className: "" },
      startedAt: "",
      finishedAt: "",
      attemptsCount: 0,
      currentSection: "theory",
      answers: {
        theory: {},
        visual: {},
        dnd: {},
        open: {}
      },
      simulators: null,
      workshop: null
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      return Object.assign(defaultState(), JSON.parse(raw));
    } catch (_) {
      return defaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      updateProgressBar();
    } catch (_) {}
  }

  function recordAttempt() {
    state.attemptsCount = (state.attemptsCount || 0) + 1;
    saveState();
  }

  function updateProgressBar() {
    const m = window.ReportModule.calculateScores(state);
    const pct = Math.min(100, Math.round((m.finalTotal / 12) * 100));
    const bar = document.getElementById("overall-progress-bar");
    const label = document.getElementById("overall-progress-label");
    if (bar) bar.style.width = pct + "%";
    if (label) label.textContent = `${m.finalTotal} / 12 балів (${pct}%)`;
  }

  function initRegistration() {
    const ln = document.getElementById("reg-lastname");
    const fn = document.getElementById("reg-firstname");
    const cl = document.getElementById("reg-class");
    const btn = document.getElementById("reg-submit");
    const form = document.getElementById("reg-form");
    const errBox = document.getElementById("reg-error");

    if (!ln || !fn || !cl || !btn || !form) return;

    if (state.student.lastName) ln.value = state.student.lastName;
    if (state.student.firstName) fn.value = state.student.firstName;
    if (state.student.className) cl.value = state.student.className;

    function clearError() {
      if (errBox) {
        errBox.textContent = "";
        errBox.classList.add("hidden");
      }
    }

    [ln, fn, cl].forEach((inp) => {
      inp.addEventListener("input", clearError);
      inp.addEventListener("change", clearError);
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          handleStart(e);
        }
      });
    });

    function handleStart(e) {
      if (e) e.preventDefault();
      const lastVal = ln.value.trim();
      const firstVal = fn.value.trim();
      const classVal = cl.value.trim();

      if (!lastVal || !firstVal || !classVal) {
        if (errBox) {
          errBox.textContent = "Будь ласка, заповніть усі три поля: прізвище, ім'я та клас.";
          errBox.classList.remove("hidden");
        }
        if (!lastVal) ln.focus();
        else if (!firstVal) fn.focus();
        else cl.focus();
        return;
      }

      clearError();
      state.student = {
        lastName: lastVal,
        firstName: firstVal,
        className: classVal
      };
      if (!state.startedAt) {
        state.startedAt = new Date().toLocaleString("uk-UA");
      }
      state.registered = true;
      state.currentSection = "theory";
      saveState();
      showWorkspace();
    }

    form.addEventListener("submit", handleStart);
    btn.addEventListener("click", handleStart);
  }

  function showWorkspace() {
    document.getElementById("screen-registration").classList.add("hidden");
    document.getElementById("screen-workspace").classList.remove("hidden");
    const badge = document.getElementById("student-badge");
    if (badge) {
      badge.textContent = `${state.student.lastName} ${state.student.firstName} (${state.student.className})`;
    }
    renderNav();
    renderSection(state.currentSection);
    updateProgressBar();
  }

  function renderNav() {
    const nav = document.getElementById("sidebar-nav");
    nav.innerHTML = SECTIONS.map((sec) => {
      const active = state.currentSection === sec.id ? "active" : "";
      return `<button type="button" data-sec="${sec.id}" class="nav-item ${active} w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-100">${sec.label}</button>`;
    }).join("");

    nav.querySelectorAll(".nav-item").forEach((b) => {
      b.addEventListener("click", () => {
        state.currentSection = b.getAttribute("data-sec");
        saveState();
        renderNav();
        renderSection(state.currentSection);
      });
    });
  }

  function renderSection(secId) {
    const host = document.getElementById("section-content");
    const idx = SECTIONS.findIndex((s) => s.id === secId);
    const numEl = document.getElementById("current-section-num");
    if (numEl) numEl.textContent = `Розділ ${idx + 1} з ${SECTIONS.length}`;

    if (secId === "theory") {
      renderTheory(host);
    } else if (secId === "visual") {
      renderVisual(host);
    } else if (secId === "simulators") {
      host.innerHTML = `<div id="simulators-container" class="space-y-4"></div>`;
      window.SimulatorsModule.initSimulators(state, saveState, recordAttempt);
    } else if (secId === "dnd") {
      renderDnd(host);
    } else if (secId === "open") {
      renderOpen(host);
    } else if (secId === "workshop") {
      host.innerHTML = `<div id="workshop-container"></div>`;
      window.FormWorkshopModule.initWorkshop(state, saveState);
    } else if (secId === "report") {
      state.finishedAt = new Date().toLocaleString("uk-UA");
      saveState();
      host.innerHTML = `<div id="report-container"></div>`;
      window.ReportModule.renderReport(state);
    }

    bindPrevNextButtons(idx);
  }

  function bindPrevNextButtons(idx) {
    const prevBtn = document.getElementById("btn-prev-section");
    const nextBtn = document.getElementById("btn-next-section");
    prevBtn.disabled = idx <= 0;
    nextBtn.textContent = idx === SECTIONS.length - 2 ? "Завершити та сформувати звіт" : "Наступний розділ";
    nextBtn.classList.toggle("hidden", idx === SECTIONS.length - 1);

    prevBtn.onclick = () => {
      if (idx > 0) {
        state.currentSection = SECTIONS[idx - 1].id;
        saveState();
        renderNav();
        renderSection(state.currentSection);
      }
    };

    nextBtn.onclick = () => {
      if (idx < SECTIONS.length - 1) {
        if (idx === SECTIONS.length - 2) {
          const ok = window.confirm("Перейти до формування підсумкового аналітичного звіту?");
          if (!ok) return;
        }
        state.currentSection = SECTIONS[idx + 1].id;
        saveState();
        renderNav();
        renderSection(state.currentSection);
      }
    };
  }

  function renderTheory(host) {
    const qs = window.WORKSHOP_DATA.theoryQuestions;
    host.innerHTML = `
      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 class="font-bold text-slate-900">Блок 1. Теоретичні знання (${qs.length} запитань)</h3>
            <p class="text-xs text-slate-600">Оберіть одну або кілька правильних відповідей залежно від умови запитання.</p>
          </div>
          <button type="button" id="check-theory-btn" class="px-4 py-2 rounded-lg bg-indigo-800 text-white text-sm font-medium hover:bg-indigo-900">Перевірити відповіді</button>
        </div>
        <div id="theory-feedback" class="text-sm font-semibold text-indigo-900"></div>
        ${qs.map((q, i) => renderSingleTheoryCard(q, i)).join("")}
      </div>
    `;

    qs.forEach((q) => {
      if (q.type === "single") {
        host.querySelectorAll(`input[name="q_${q.id}"]`).forEach((radio) => {
          radio.addEventListener("change", () => {
            state.answers.theory[q.id] = Number(radio.value);
            saveState();
          });
        });
      } else if (q.type === "multiple") {
        host.querySelectorAll(`input[data-qmulti="${q.id}"]`).forEach((chk) => {
          chk.addEventListener("change", () => {
            const vals = [];
            host.querySelectorAll(`input[data-qmulti="${q.id}"]:checked`).forEach((c) => vals.push(Number(c.value)));
            state.answers.theory[q.id] = vals;
            saveState();
          });
        });
      } else if (q.type === "matching") {
        host.querySelectorAll(`select[data-qmatch="${q.id}"]`).forEach((sel) => {
          sel.addEventListener("change", () => {
            if (!state.answers.theory[q.id]) state.answers.theory[q.id] = {};
            state.answers.theory[q.id][sel.getAttribute("data-left")] = Number(sel.value);
            saveState();
          });
        });
      }
    });

    document.getElementById("check-theory-btn").addEventListener("click", () => {
      recordAttempt();
      let correctCount = 0;
      qs.forEach((q) => {
        const ans = state.answers.theory[q.id];
        const ok = checkTheoryItem(q, ans);
        if (ok) correctCount++;
        const badge = document.getElementById(`badge_${q.id}`);
        if (badge) {
          badge.textContent = ok ? "Правильно" : "Перевірте відповідь";
          badge.className = ok
            ? "text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium"
            : "text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-medium";
        }
      });
      document.getElementById("theory-feedback").textContent = `Перевірено: правильно ${correctCount} з ${qs.length} запитань.`;
    });
  }

  function renderSingleTheoryCard(q, index) {
    const saved = state.answers.theory[q.id];
    let bodyHtml = "";
    if (q.type === "single") {
      bodyHtml = q.options.map((opt, idx) => `
        <label class="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-sm">
          <input type="radio" name="q_${q.id}" value="${idx}" ${Number(saved) === idx ? "checked" : ""} class="mt-1" />
          <span>${escapeHtml(opt)}</span>
        </label>
      `).join("");
    } else if (q.type === "multiple") {
      const arr = Array.isArray(saved) ? saved : [];
      bodyHtml = q.options.map((opt, idx) => `
        <label class="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-sm">
          <input type="checkbox" data-qmulti="${q.id}" value="${idx}" ${arr.includes(idx) ? "checked" : ""} class="mt-1" />
          <span>${escapeHtml(opt)}</span>
        </label>
      `).join("");
    } else if (q.type === "matching") {
      const mapSaved = typeof saved === "object" && saved !== null ? saved : {};
      bodyHtml = q.pairs.map((p, lIdx) => `
        <div class="grid sm:grid-cols-2 gap-2 items-center py-1.5 border-b border-slate-100 last:border-none text-sm">
          <div class="font-medium text-slate-800">${escapeHtml(p.left)}</div>
          <select data-qmatch="${q.id}" data-left="${lIdx}" class="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-sm">
            <option value="">— Оберіть відповідність —</option>
            ${q.rightOptions.map((ro, rIdx) => `<option value="${rIdx}" ${Number(mapSaved[lIdx]) === rIdx ? "selected" : ""}>${escapeHtml(ro)}</option>`).join("")}
          </select>
        </div>
      `).join("");
    }

    return `
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-xs font-semibold text-sky-700">${index + 1}. ${escapeHtml(q.topic)}</span>
          <span id="badge_${q.id}" class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">Очікує відповіді</span>
        </div>
        <p class="font-medium text-slate-900 text-sm mb-2">${escapeHtml(q.prompt)}</p>
        <div class="space-y-1">${bodyHtml}</div>
      </div>
    `;
  }

  function checkTheoryItem(q, ans) {
    if (ans === undefined || ans === null) return false;
    if (q.type === "single") return Number(ans) === q.correct[0];
    if (q.type === "multiple") {
      if (!Array.isArray(ans)) return false;
      const a = [...ans].map(Number).sort();
      const b = [...q.correct].map(Number).sort();
      return a.length === b.length && a.every((v, i) => v === b[i]);
    }
    if (q.type === "matching") {
      if (typeof ans !== "object") return false;
      return Object.keys(q.correctMap).every((k) => Number(ans[k]) === q.correctMap[k]);
    }
    return false;
  }

  function renderVisual(host) {
    const tasks = window.WORKSHOP_DATA.visualTasks;
    host.innerHTML = `
      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 class="font-bold text-slate-900">Блок 2. Візуальний аналіз інтерфейсу та станів текстових полів</h3>
            <p class="text-xs text-slate-600">Проаналізуйте схеми форм і станів віджетів або відновіть порядок дій.</p>
          </div>
          <button type="button" id="check-visual-btn" class="px-4 py-2 rounded-lg bg-indigo-800 text-white text-sm font-medium hover:bg-indigo-900">Перевірити аналіз</button>
        </div>
        <div id="visual-feedback" class="text-sm font-semibold text-indigo-900"></div>
        ${tasks.map((vt, idx) => renderVisualCard(vt, idx)).join("")}
      </div>
    `;

    tasks.forEach((vt) => {
      if (vt.kind === "typeA") {
        host.querySelectorAll(`input[name="v_${vt.id}"]`).forEach((r) => {
          r.addEventListener("change", () => {
            state.answers.visual[vt.id] = Number(r.value);
            saveState();
          });
        });
      } else if (vt.kind === "typeB") {
        host.querySelectorAll(`select[data-vstep="${vt.id}"]`).forEach((sel) => {
          sel.addEventListener("change", () => {
            const arr = [];
            host.querySelectorAll(`select[data-vstep="${vt.id}"]`).forEach((s) => arr.push(Number(s.value)));
            state.answers.visual[vt.id] = arr;
            saveState();
          });
        });
      }
    });

    document.getElementById("check-visual-btn").addEventListener("click", () => {
      recordAttempt();
      let okCount = 0;
      tasks.forEach((vt) => {
        const ans = state.answers.visual[vt.id];
        const ok = vt.kind === "typeA"
          ? Number(ans) === vt.correct
          : Array.isArray(ans) && ans.length === vt.correctOrder.length && ans.every((v, i) => Number(v) === vt.correctOrder[i]);
        if (ok) okCount++;
        const badge = document.getElementById(`vbadge_${vt.id}`);
        if (badge) {
          badge.textContent = ok ? "Правильно" : "Перевірте виконання";
          badge.className = ok
            ? "text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium"
            : "text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-medium";
        }
      });
      document.getElementById("visual-feedback").textContent = `Вірно виконано: ${okCount} з ${tasks.length} завдань.`;
    });
  }

  function renderVisualCard(vt, idx) {
    const saved = state.answers.visual[vt.id];
    let inner = "";
    if (vt.kind === "typeA") {
      inner = vt.options.map((opt, oIdx) => `
        <label class="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-sm">
          <input type="radio" name="v_${vt.id}" value="${oIdx}" ${Number(saved) === oIdx ? "checked" : ""} class="mt-1" />
          <span>${escapeHtml(opt)}</span>
        </label>
      `).join("");
    } else {
      const arr = Array.isArray(saved) ? saved : [];
      inner = vt.steps.map((stepText, sIdx) => `
        <div class="flex items-center gap-3 py-1.5 border-b border-slate-100 last:border-none text-sm">
          <select data-vstep="${vt.id}" class="border border-slate-300 rounded px-2 py-1 bg-white">
            <option value="">№</option>
            ${vt.steps.map((_, n) => `<option value="${n}" ${Number(arr[sIdx]) === n ? "selected" : ""}>Крок ${n + 1}</option>`).join("")}
          </select>
          <span>${escapeHtml(stepText)}</span>
        </div>
      `).join("");
    }

    return `
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-slate-900 text-sm">${idx + 1}. ${escapeHtml(vt.title)}</h4>
          <span id="vbadge_${vt.id}" class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">Очікує відповіді</span>
        </div>
        <div>${vt.svg}</div>
        <p class="text-sm font-medium text-slate-800">${escapeHtml(vt.prompt)}</p>
        <div class="space-y-1">${inner}</div>
      </div>
    `;
  }

  function renderDnd(host) {
    const tasks = window.WORKSHOP_DATA.dndTasks;
    host.innerHTML = `
      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 class="font-bold text-slate-900">Блок 4. Drag & Drop — відновлення алгоритмів та відповідностей</h3>
            <p class="text-xs text-slate-600">Перетягуйте картки мишею/дотиком або оберіть картку і цільову позицію.</p>
          </div>
          <button type="button" id="check-dnd-btn" class="px-4 py-2 rounded-lg bg-indigo-800 text-white text-sm font-medium hover:bg-indigo-900">Перевірити Drag & Drop</button>
        </div>
        <div id="dnd-feedback" class="text-sm font-semibold text-indigo-900"></div>
        ${tasks.map((t) => renderDndTask(t)).join("")}
      </div>
    `;

    bindDndEvents(tasks, host);
  }

  function renderDndTask(task) {
    if (!state.answers.dnd[task.id]) {
      if (task.items) {
        state.answers.dnd[task.id] = { order: task.items.map((_, i) => i), checked: false, passed: false };
      } else {
        state.answers.dnd[task.id] = { map: {}, checked: false, passed: false };
      }
    }
    const rec = state.answers.dnd[task.id];

    if (task.items) {
      const order = rec.order || task.items.map((_, i) => i);
      return `
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-slate-900 text-sm">${escapeHtml(task.title)}</h4>
            <span class="text-xs px-2.5 py-0.5 rounded-full ${rec.passed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}">${rec.passed ? "Правильно" : "Не перевірено"}</span>
          </div>
          <p class="text-xs text-slate-600">${escapeHtml(task.description)}</p>
          <div class="space-y-2" data-dnd-order="${task.id}">
            ${order.map((itemIdx, pos) => `
              <div draggable="true" data-task="${task.id}" data-pos="${pos}" class="drag-card flex items-center justify-between p-3 rounded-lg border border-slate-300 bg-slate-50 text-sm cursor-grab">
                <span><strong>${pos + 1}.</strong> ${escapeHtml(task.items[itemIdx])}</span>
                <span class="text-xs text-slate-400">⋮⋮</span>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    const mapObj = rec.map || {};
    return `
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-slate-900 text-sm">${escapeHtml(task.title)}</h4>
          <span class="text-xs px-2.5 py-0.5 rounded-full ${rec.passed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}">${rec.passed ? "Правильно" : "Не перевірено"}</span>
        </div>
        <p class="text-xs text-slate-600">${escapeHtml(task.description)}</p>
        <div class="space-y-2">
          ${task.pairs.map((p, lIdx) => {
            const assignedRight = mapObj[lIdx];
            const rightLabel = assignedRight !== undefined ? task.rightOptions[assignedRight] : "Перетягніть або оберіть характеристику";
            return `
              <div class="grid sm:grid-cols-2 gap-2 items-center">
                <div draggable="true" data-drag-pair="${task.id}:${lIdx}" class="drag-card p-2.5 rounded-lg border border-sky-200 bg-sky-50 text-sm font-medium text-slate-900 cursor-grab">${escapeHtml(p.left)}</div>
                <div data-drop-pair="${task.id}:${lIdx}" class="p-2.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-700">${escapeHtml(rightLabel)}</div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  function bindDndEvents(tasks, host) {
    host.querySelectorAll("[data-dnd-order]").forEach((listEl) => {
      const taskId = listEl.getAttribute("data-dnd-order");
      const cards = listEl.querySelectorAll(".drag-card");
      cards.forEach((card) => {
        card.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", card.getAttribute("data-pos"));
        });
        card.addEventListener("dragover", (e) => e.preventDefault());
        card.addEventListener("drop", (e) => {
          e.preventDefault();
          const fromPos = Number(e.dataTransfer.getData("text/plain"));
          const toPos = Number(card.getAttribute("data-pos"));
          swapOrder(taskId, fromPos, toPos);
        });
        card.addEventListener("click", () => {
          const pos = Number(card.getAttribute("data-pos"));
          if (!selectedDragCard) {
            selectedDragCard = { kind: "order", taskId, pos };
            card.classList.add("selected-for-move");
          } else if (selectedDragCard.kind === "order" && selectedDragCard.taskId === taskId) {
            swapOrder(taskId, selectedDragCard.pos, pos);
            selectedDragCard = null;
          } else {
            selectedDragCard = null;
            renderDnd(host);
          }
        });
      });
    });

    host.querySelectorAll("[data-drag-pair]").forEach((card) => {
      const spec = card.getAttribute("data-drag-pair");
      card.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", spec));
      card.addEventListener("click", () => {
        selectedDragCard = { kind: "pair", spec };
        host.querySelectorAll("[data-drag-pair]").forEach((c) => c.classList.remove("selected-for-move"));
        card.classList.add("selected-for-move");
      });
    });

    host.querySelectorAll("[data-drop-pair]").forEach((slot) => {
      const targetSpec = slot.getAttribute("data-drop-pair");
      slot.addEventListener("dragover", (e) => e.preventDefault());
      slot.addEventListener("drop", (e) => {
        e.preventDefault();
        assignPair(e.dataTransfer.getData("text/plain"), targetSpec);
      });
      slot.addEventListener("click", () => {
        if (selectedDragCard && selectedDragCard.kind === "pair") {
          assignPair(selectedDragCard.spec, targetSpec);
          selectedDragCard = null;
        }
      });
    });

    function swapOrder(taskId, fromPos, toPos) {
      if (Number.isNaN(fromPos) || Number.isNaN(toPos) || fromPos === toPos) return;
      const arr = state.answers.dnd[taskId].order;
      const [moved] = arr.splice(fromPos, 1);
      arr.splice(toPos, 0, moved);
      saveState();
      renderDnd(host);
    }

    function assignPair(sourceSpec, targetSpec) {
      const [sTask, sLeft] = sourceSpec.split(":");
      const [tTask, tLeft] = targetSpec.split(":");
      if (sTask !== tTask) return;
      const task = tasks.find((x) => x.id === sTask);
      if (!task) return;
      state.answers.dnd[sTask].map[Number(tLeft)] = Number(sLeft);
      saveState();
      renderDnd(host);
    }

    document.getElementById("check-dnd-btn").addEventListener("click", () => {
      recordAttempt();
      let passedTotal = 0;
      tasks.forEach((task) => {
        const rec = state.answers.dnd[task.id];
        rec.checked = true;
        if (task.items) {
          rec.passed = JSON.stringify(rec.order) === JSON.stringify(task.correctOrder);
        } else {
          rec.passed = Object.keys(task.correctMap).every((k) => Number(rec.map[k]) === task.correctMap[k]);
        }
        if (rec.passed) passedTotal++;
      });
      saveState();
      document.getElementById("dnd-feedback").textContent = `Правильно виконано: ${passedTotal} з ${tasks.length} завдань Drag & Drop.`;
      renderDnd(host);
    });
  }

  function renderOpen(host) {
    const list = window.WORKSHOP_DATA.openQuestions;
    host.innerHTML = `
      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <h3 class="font-bold text-slate-900">Блок 5. Відкриті відповіді</h3>
          <p class="text-xs text-slate-600">Сформулюйте розгорнуті відповіді власними словами та оберіть критерій самооцінювання.</p>
        </div>
        ${list.map((oq, idx) => {
          const entry = state.answers.open[oq.id] || { text: "", selfRating: "partial", autoScore: 0 };
          return `
            <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div class="font-semibold text-sm text-slate-900">${idx + 1}. ${escapeHtml(oq.prompt)}</div>
              <textarea data-open-text="${oq.id}" rows="5" placeholder="Введіть розгорнуту відповідь..." class="w-full border border-slate-300 rounded-lg p-3 text-sm">${escapeHtml(entry.text || "")}</textarea>
              <div class="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div class="flex flex-wrap gap-3">
                  <label class="inline-flex items-center gap-1">
                    <input type="radio" name="self_${oq.id}" value="full" ${entry.selfRating === "full" ? "checked" : ""} /> Відповідь повна
                  </label>
                  <label class="inline-flex items-center gap-1">
                    <input type="radio" name="self_${oq.id}" value="partial" ${entry.selfRating === "partial" ? "checked" : ""} /> Відповідь часткова
                  </label>
                  <label class="inline-flex items-center gap-1">
                    <input type="radio" name="self_${oq.id}" value="none" ${entry.selfRating === "none" ? "checked" : ""} /> Відповідь неповна або відсутня
                  </label>
                </div>
                <button type="button" data-open-check="${oq.id}" class="px-3 py-1.5 rounded-lg bg-indigo-800 text-white font-medium hover:bg-indigo-900">Попередня перевірка</button>
              </div>
              <div id="open-res-${oq.id}" class="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded p-2">
                Попередній змістовий бал: <strong>${entry.autoScore || 0}%</strong> (попередня оцінка)
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    list.forEach((oq) => {
      if (!state.answers.open[oq.id]) {
        state.answers.open[oq.id] = { text: "", selfRating: "partial", autoScore: 0 };
      }
      const ta = host.querySelector(`textarea[data-open-text="${oq.id}"]`);
      ta.addEventListener("input", () => {
        state.answers.open[oq.id].text = ta.value;
        saveState();
      });
      host.querySelectorAll(`input[name="self_${oq.id}"]`).forEach((r) => {
        r.addEventListener("change", () => {
          state.answers.open[oq.id].selfRating = r.value;
          saveState();
        });
      });
      host.querySelector(`button[data-open-check="${oq.id}"]`).addEventListener("click", () => {
        recordAttempt();
        const txt = state.answers.open[oq.id].text.trim();
        const hits = (oq.keywords || []).filter((k) => txt.toLowerCase().includes(k)).length;
        const pct = txt.length === 0 ? 0 : Math.min(100, Math.round((Math.min(1, txt.length / 110) * 50) + hits * 10));
        state.answers.open[oq.id].autoScore = pct;
        saveState();
        document.getElementById(`open-res-${oq.id}`).innerHTML = `Попередній змістовий бал: <strong>${pct}%</strong> (попередня оцінка)`;
      });
    });
  }

  function escapeHtml(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function bootstrap() {
    initRegistration();
    if (state.registered && state.student.lastName && state.student.firstName && state.student.className) {
      showWorkspace();
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();
