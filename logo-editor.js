// Блок 6. Творча майстерня — конструктор власної форми / міні-інтерфейсу з текстовими полями
window.FormWorkshopModule = (function () {
  function initWorkshop(state, onSave) {
    if (!state.workshop) {
      state.workshop = {
        conceptTitle: "",
        elements: [],
        history: [],
        redoStack: [],
        selectedId: null,
        testMode: false,
        testInputs: {},
        testOutput: "",
        toolsUsed: [],
        score: 0
      };
    }
    render(state, onSave);
  }

  function pushHistory(w) {
    w.history.push(JSON.stringify(w.elements));
    if (w.history.length > 30) w.history.shift();
    w.redoStack = [];
  }

  function addToolUsed(w, toolName) {
    if (!w.toolsUsed.includes(toolName)) {
      w.toolsUsed.push(toolName);
    }
  }

  function evaluateWorkshop(w) {
    let pts = 0;
    const hasTitle = w.conceptTitle.trim().length >= 3;
    const distinctTypes = new Set(w.elements.map((el) => el.type)).size;
    const hasStyling = w.elements.some((el) => el.bgColor !== "#ffffff" || el.fontSize >= 15 || el.borderColor !== "#94a3b8");
    const hasInputAndAction = w.elements.some((el) => el.type === "entry" || el.type === "text" || el.type === "password") &&
      (w.elements.some((el) => el.type === "button") || Boolean(w.testOutput));

    if (hasTitle) pts += 1;
    if (distinctTypes >= 3) pts += 1;
    if (hasStyling) pts += 1;
    if (hasInputAndAction) pts += 1;
    w.score = Math.min(4, pts);
    return w.score;
  }

  function render(state, onSave) {
    const root = document.getElementById("workshop-container");
    if (!root) return;
    const w = state.workshop;
    evaluateWorkshop(w);

    const selected = w.elements.find((e) => e.id === w.selectedId) || null;

    root.innerHTML = `
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Творча майстерня — власна форма з текстовими полями</h3>
            <p class="text-sm text-slate-600">Створіть форму (наприклад, анкету, калькулятор чи форму реєстрації), налаштуйте елементи та перевірте роботу у режимі тестування.</p>
          </div>
          <div class="text-right">
            <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
              Балів за творчу роботу: ${w.score} / 4
            </span>
          </div>
        </div>

        <div class="grid sm:grid-cols-3 gap-3">
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold text-slate-700 mb-1">Назва / ідея вашої форми або міні-програми:</label>
            <input id="ws-concept" type="text" value="${escapeAttr(w.conceptTitle)}" placeholder="Наприклад: Реєстрація до шкільного IT-клубу" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div class="flex items-end gap-2">
            <button type="button" id="ws-toggle-test" class="w-full px-3 py-2 rounded-lg text-sm font-medium ${w.testMode ? "bg-emerald-600 text-white" : "bg-sky-600 text-white hover:bg-sky-700"}">
              ${w.testMode ? "Режим тестування (увімк.)" : "Перейти до тестування"}
            </button>
          </div>
        </div>

        <!-- Панель інструментів -->
        <div class="flex flex-wrap gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
          <button type="button" data-add="label" class="ws-add px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs font-medium hover:bg-slate-100">+ Мітка (Label)</button>
          <button type="button" data-add="entry" class="ws-add px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs font-medium hover:bg-slate-100">+ Поле Entry</button>
          <button type="button" data-add="password" class="ws-add px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs font-medium hover:bg-slate-100">+ Поле пароля</button>
          <button type="button" data-add="text" class="ws-add px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs font-medium hover:bg-slate-100">+ Поле Text</button>
          <button type="button" data-add="button" class="ws-add px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs font-medium hover:bg-slate-100">+ Кнопка дії</button>
          <span class="border-l border-slate-300 mx-1"></span>
          <button type="button" id="ws-undo" class="px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs hover:bg-slate-100">Скасувати</button>
          <button type="button" id="ws-redo" class="px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs hover:bg-slate-100">Повторити</button>
          <button type="button" id="ws-delete" class="px-2.5 py-1.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs hover:bg-rose-100">Видалити обраний</button>
          <button type="button" id="ws-clear" class="px-2.5 py-1.5 rounded bg-slate-200 text-slate-800 text-xs hover:bg-slate-300">Очистити макет</button>
        </div>

        <!-- Робоче полотно та властивості -->
        <div class="grid lg:grid-cols-3 gap-4">
          <div class="lg:col-span-2">
            <div id="ws-canvas" class="relative w-full h-[380px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden">
              ${w.elements.length === 0 ? `<div class="h-full flex items-center justify-center text-sm text-slate-400 p-6 text-center">Додайте елементи з панелі вище та перетягніть їх у потрібне місце на полотні.</div>` : ""}
              ${w.elements.map((el) => renderElementHtml(el, el.id === w.selectedId, w.testMode, w.testInputs[el.id] || "")).join("")}
            </div>
          </div>

          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-sm">
            <h4 class="font-bold text-slate-800">Властивості обраного елемента</h4>
            ${selected ? `
              <div>
                <label class="block text-xs text-slate-600 mb-1">Підпис / текст / плейсхолдер:</label>
                <input id="ws-prop-label" type="text" value="${escapeAttr(selected.label)}" class="w-full border border-slate-300 rounded px-2.5 py-1.5 text-sm bg-white" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs text-slate-600 mb-1">Ширина (px):</label>
                  <input id="ws-prop-w" type="number" min="90" max="420" value="${selected.width}" class="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white" />
                </div>
                <div>
                  <label class="block text-xs text-slate-600 mb-1">Шрифт (px):</label>
                  <input id="ws-prop-fs" type="number" min="11" max="24" value="${selected.fontSize}" class="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white" />
                </div>
              </div>
              <div class="flex gap-3 items-center">
                <label class="text-xs text-slate-600">Фон: <input id="ws-prop-bg" type="color" value="${selected.bgColor}" /></label>
                <label class="text-xs text-slate-600">Рамка: <input id="ws-prop-bd" type="color" value="${selected.borderColor}" /></label>
              </div>
            ` : `<p class="text-xs text-slate-500">Клацніть по елементу на полотні, щоб змінити його параметри.</p>`}

            <hr class="border-slate-200" />
            <div class="text-xs text-slate-700 font-semibold">Перевірка роботи форми:</div>
            <button type="button" id="ws-run-test" class="w-full px-3 py-1.5 rounded-lg bg-indigo-700 text-white text-xs font-medium hover:bg-indigo-800">Зчитати дані та сформувати вивід</button>
            <div id="ws-test-output" class="p-2.5 rounded bg-white border border-slate-200 text-xs font-mono text-slate-800 min-h-[54px]">${escapeHtml(w.testOutput || "Вивід ще не сформовано")}</div>
          </div>
        </div>

        <!-- Експорт -->
        <div class="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          <button type="button" id="ws-export-png" class="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800">Завантажити макет у PNG</button>
          <button type="button" id="ws-export-json" class="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-medium hover:bg-slate-50">Зберегти проєкт (JSON)</button>
        </div>
      </div>
    `;

    bindWorkshopEvents(state, onSave);
  }

  function renderElementHtml(el, isSelected, testMode, testVal) {
    const ring = isSelected ? "ring-2 ring-sky-600" : "";
    const baseStyle = `left:${el.x}px; top:${el.y}px; width:${el.width}px; font-size:${el.fontSize}px; background:${el.bgColor}; border-color:${el.borderColor};`;
    if (el.type === "label") {
      return `<div data-id="${el.id}" style="${baseStyle}" class="ws-item absolute cursor-move px-2 py-1 rounded border font-semibold text-slate-900 ${ring}">${escapeHtml(el.label)}</div>`;
    }
    if (el.type === "button") {
      return `<button type="button" data-id="${el.id}" style="${baseStyle}" class="ws-item absolute cursor-move px-3 py-1.5 rounded border font-medium text-white bg-blue-700 ${ring}">${escapeHtml(el.label)}</button>`;
    }
    if (el.type === "text") {
      return `<textarea data-id="${el.id}" rows="3" style="${baseStyle}" ${testMode ? "" : "readonly"} placeholder="${escapeAttr(el.label)}" class="ws-item absolute rounded border p-1.5 text-slate-900 ${testMode ? "cursor-text" : "cursor-move"} ${ring}">${escapeHtml(testVal)}</textarea>`;
    }
    const inputType = el.type === "password" ? "password" : "text";
    return `<input data-id="${el.id}" type="${inputType}" style="${baseStyle}" ${testMode ? "" : "readonly"} value="${escapeAttr(testVal)}" placeholder="${escapeAttr(el.label)}" class="ws-item absolute rounded border px-2 py-1 text-slate-900 ${testMode ? "cursor-text" : "cursor-move"} ${ring}" />`;
  }

  function bindWorkshopEvents(state, onSave) {
    const w = state.workshop;

    document.getElementById("ws-concept").addEventListener("input", (e) => {
      w.conceptTitle = e.target.value;
      evaluateWorkshop(w);
      onSave();
    });

    document.getElementById("ws-toggle-test").addEventListener("click", () => {
      w.testMode = !w.testMode;
      addToolUsed(w, "test_mode");
      onSave();
      render(state, onSave);
    });

    document.querySelectorAll(".ws-add").forEach((btn) => {
      btn.addEventListener("click", () => {
        pushHistory(w);
        const type = btn.getAttribute("data-add");
        addToolUsed(w, "add_" + type);
        const defaults = {
          label: "Заголовок форми",
          entry: "Введіть значення",
          password: "Пароль",
          text: "Багаторядковий опис...",
          button: "Підтвердити"
        };
        const idx = w.elements.length;
        const id = "el_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
        w.elements.push({
          id,
          type,
          label: defaults[type] || "Елемент",
          x: 24 + (idx % 3) * 20,
          y: 24 + (idx * 48) % 280,
          width: type === "text" ? 240 : 190,
          fontSize: 14,
          bgColor: type === "button" ? "#1d4ed8" : "#ffffff",
          borderColor: "#94a3b8"
        });
        w.selectedId = id;
        evaluateWorkshop(w);
        onSave();
        render(state, onSave);
      });
    });

    document.getElementById("ws-undo").addEventListener("click", () => {
      if (!w.history.length) return;
      w.redoStack.push(JSON.stringify(w.elements));
      w.elements = JSON.parse(w.history.pop());
      evaluateWorkshop(w);
      onSave();
      render(state, onSave);
    });

    document.getElementById("ws-redo").addEventListener("click", () => {
      if (!w.redoStack.length) return;
      w.history.push(JSON.stringify(w.elements));
      w.elements = JSON.parse(w.redoStack.pop());
      evaluateWorkshop(w);
      onSave();
      render(state, onSave);
    });

    document.getElementById("ws-delete").addEventListener("click", () => {
      if (!w.selectedId) return;
      pushHistory(w);
      w.elements = w.elements.filter((e) => e.id !== w.selectedId);
      w.selectedId = null;
      evaluateWorkshop(w);
      onSave();
      render(state, onSave);
    });

    document.getElementById("ws-clear").addEventListener("click", () => {
      pushHistory(w);
      w.elements = [];
      w.selectedId = null;
      w.testInputs = {};
      w.testOutput = "";
      evaluateWorkshop(w);
      onSave();
      render(state, onSave);
    });

    const canvas = document.getElementById("ws-canvas");
    let dragging = null;
    canvas.querySelectorAll(".ws-item").forEach((elNode) => {
      const id = elNode.getAttribute("data-id");
      elNode.addEventListener("pointerdown", (e) => {
        w.selectedId = id;
        addToolUsed(w, "select_move");
        if (w.testMode && (elNode.tagName === "INPUT" || elNode.tagName === "TEXTAREA")) {
          onSave();
          return;
        }
        pushHistory(w);
        const rect = canvas.getBoundingClientRect();
        const item = w.elements.find((x) => x.id === id);
        dragging = {
          item,
          offsetX: e.clientX - rect.left - item.x,
          offsetY: e.clientY - rect.top - item.y,
          maxX: Math.max(10, rect.width - item.width - 10),
          maxY: Math.max(10, rect.height - 40)
        };
        elNode.setPointerCapture(e.pointerId);
      });

      elNode.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const rect = canvas.getBoundingClientRect();
        dragging.item.x = Math.min(dragging.maxX, Math.max(8, Math.round(e.clientX - rect.left - dragging.offsetX)));
        dragging.item.y = Math.min(dragging.maxY, Math.max(8, Math.round(e.clientY - rect.top - dragging.offsetY)));
        elNode.style.left = dragging.item.x + "px";
        elNode.style.top = dragging.item.y + "px";
      });

      elNode.addEventListener("pointerup", () => {
        if (dragging) {
          dragging = null;
          onSave();
        }
      });

      if (elNode.tagName === "INPUT" || elNode.tagName === "TEXTAREA") {
        elNode.addEventListener("input", () => {
          w.testInputs[id] = elNode.value;
          onSave();
        });
      }
    });

    const propLabel = document.getElementById("ws-prop-label");
    if (propLabel && w.selectedId) {
      const item = w.elements.find((x) => x.id === w.selectedId);
      propLabel.addEventListener("input", () => {
        item.label = propLabel.value;
        addToolUsed(w, "style");
        evaluateWorkshop(w);
        onSave();
      });
      document.getElementById("ws-prop-w").addEventListener("change", (e) => {
        item.width = Math.min(420, Math.max(90, Number(e.target.value) || 180));
        addToolUsed(w, "style");
        onSave();
        render(state, onSave);
      });
      document.getElementById("ws-prop-fs").addEventListener("change", (e) => {
        item.fontSize = Math.min(24, Math.max(11, Number(e.target.value) || 14));
        addToolUsed(w, "style");
        evaluateWorkshop(w);
        onSave();
        render(state, onSave);
      });
      document.getElementById("ws-prop-bg").addEventListener("input", (e) => {
        item.bgColor = e.target.value;
        addToolUsed(w, "style");
        evaluateWorkshop(w);
        onSave();
      });
      document.getElementById("ws-prop-bd").addEventListener("input", (e) => {
        item.borderColor = e.target.value;
        addToolUsed(w, "style");
        evaluateWorkshop(w);
        onSave();
      });
    }

    document.getElementById("ws-run-test").addEventListener("click", () => {
      const fields = w.elements.filter((e) => e.type === "entry" || e.type === "text" || e.type === "password");
      const values = fields.map((f) => `${f.label}: "${w.testInputs[f.id] || ""}"`);
      w.testOutput = values.length ? values.join(" | ") : "Додайте поле Entry або Text для зчитування значень.";
      addToolUsed(w, "run_test");
      evaluateWorkshop(w);
      onSave();
      document.getElementById("ws-test-output").textContent = w.testOutput;
    });

    document.getElementById("ws-export-png").addEventListener("click", () => {
      exportCanvasPng(w);
    });

    document.getElementById("ws-export-json").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify({ conceptTitle: w.conceptTitle, elements: w.elements, testOutput: w.testOutput }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "forma-tekstovi-polya.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function buildCanvasDataUrl(w) {
    const c = document.createElement("canvas");
    c.width = 800;
    c.height = 500;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.fillStyle = "#1e3a8a";
    ctx.fillRect(0, 0, c.width, 48);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(w.conceptTitle || "Власна форма з текстовими полями (8 клас)", 20, 30);

    w.elements.forEach((el) => {
      const x = Math.min(560, Math.max(20, el.x * 1.1));
      const y = Math.min(430, Math.max(64, el.y * 1.1 + 52));
      const width = el.width;
      ctx.fillStyle = el.type === "button" ? "#1d4ed8" : (el.bgColor || "#ffffff");
      ctx.strokeStyle = el.borderColor || "#94a3b8";
      ctx.lineWidth = 1.5;
      const h = el.type === "text" ? 64 : 34;
      ctx.fillRect(x, y, width, h);
      ctx.strokeRect(x, y, width, h);

      ctx.fillStyle = el.type === "button" ? "#ffffff" : "#0f172a";
      ctx.font = `${el.fontSize || 14}px sans-serif`;
      const displayVal = w.testInputs[el.id] ? (el.type === "password" ? "•".repeat(w.testInputs[el.id].length) : w.testInputs[el.id]) : el.label;
      ctx.fillText(String(displayVal).slice(0, 36), x + 10, y + 22);
    });

    return c.toDataURL("image/png");
  }

  function exportCanvasPng(w) {
    const url = buildCanvasDataUrl(w);
    const a = document.createElement("a");
    a.href = url;
    a.download = "forma-8-klas.png";
    a.click();
  }

  function escapeAttr(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  function escapeHtml(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  return { initWorkshop, evaluateWorkshop, buildCanvasDataUrl };
})();
