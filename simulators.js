// 6 інтерактивних симуляторів роботи з текстовими полями (8 клас)
window.SimulatorsModule = (function () {
  function initSimulators(state, onSave, onRecordAttempt) {
    if (!state.simulators) {
      state.simulators = {
        sim1: { text: "", masked: false, fontSize: 16, widthPx: 260, bg: "#ffffff", fg: "#0f172a", checked: false, passed: false },
        sim2: { valA: "", valB: "", result: "", checked: false, passed: false },
        sim3: { lines: [], singleText: "", checked: false, passed: false },
        sim4: { mode: "normal", maxLen: 10, sampleText: "", checked: false, passed: false },
        sim5: { name: "", role: "", preview: "", checked: false, passed: false },
        sim6: { enterPressed: false, textChanged: false, currentText: "", checked: false, passed: false }
      };
    }
    renderAll(state, onSave, onRecordAttempt);
  }

  function renderAll(state, onSave, onRecordAttempt) {
    const container = document.getElementById("simulators-container");
    if (!container) return;

    const s = state.simulators;
    container.innerHTML = `
      <!-- Симулятор 1 -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-slate-900">Симулятор 1. Властивості та оформлення текстового поля</h3>
          <span class="text-xs px-2.5 py-1 rounded-full ${s.sim1.passed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}">${s.sim1.passed ? "Виконано" : "Не перевірено"}</span>
        </div>
        <p class="text-sm text-slate-600 mb-4">Налаштуйте поле так, щоб у ньому було введено слово «Python» (не менше 6 символів), увімкнено режим прихованого введення символів та збільшено розмір шрифту до щонайменше 20 px.</p>
        <div class="grid md:grid-cols-2 gap-4 items-center">
          <div class="space-y-3 text-sm">
            <div>
              <label class="block text-slate-700 mb-1">Введіть текст у поле:</label>
              <input id="sim1-input" type="${s.sim1.masked ? "password" : "text"}" value="${escapeAttr(s.sim1.text)}" style="width:${s.sim1.widthPx}px; max-width:100%; font-size:${s.sim1.fontSize}px; background:${s.sim1.bg}; color:${s.sim1.fg};" class="border border-slate-400 rounded px-2 py-1" />
            </div>
            <div class="flex flex-wrap gap-3 items-center">
              <label class="text-xs text-slate-600">Розмір шрифту: <strong id="sim1-font-val">${s.sim1.fontSize}px</strong>
                <input id="sim1-font" type="range" min="12" max="28" value="${s.sim1.fontSize}" class="block" />
              </label>
              <label class="text-xs text-slate-600">Ширина: <strong id="sim1-width-val">${s.sim1.widthPx}px</strong>
                <input id="sim1-width" type="range" min="180" max="360" value="${s.sim1.widthPx}" class="block" />
              </label>
            </div>
            <div class="flex flex-wrap gap-4 items-center">
              <label class="inline-flex items-center gap-2 text-xs text-slate-700">
                <input id="sim1-mask" type="checkbox" ${s.sim1.masked ? "checked" : ""} /> Приховувати символи (режим пароля)
              </label>
              <label class="inline-flex items-center gap-1 text-xs text-slate-700">
                Фон: <input id="sim1-bg" type="color" value="${s.sim1.bg}" />
              </label>
              <label class="inline-flex items-center gap-1 text-xs text-slate-700">
                Текст: <input id="sim1-fg" type="color" value="${s.sim1.fg}" />
              </label>
            </div>
          </div>
          <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between min-h-[120px]">
            <div class="text-xs text-slate-500 mb-2">Стан: ${s.sim1.masked ? "символи приховані" : "звичайне відображення"}, шрифт ${s.sim1.fontSize}px</div>
            <div class="flex gap-2">
              <button type="button" id="sim1-check" class="px-3 py-1.5 rounded-lg bg-indigo-700 text-white text-xs font-medium hover:bg-indigo-800">Перевірити</button>
              <button type="button" id="sim1-reset" class="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-800 text-xs font-medium hover:bg-slate-300">Скинути</button>
            </div>
            <div id="sim1-feedback" class="text-xs mt-2 font-medium text-slate-700"></div>
          </div>
        </div>
      </div>

      <!-- Симулятор 2 -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-slate-900">Симулятор 2. Зчитування, валідація та перетворення типів</h3>
          <span class="text-xs px-2.5 py-1 rounded-full ${s.sim2.passed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}">${s.sim2.passed ? "Виконано" : "Не перевірено"}</span>
        </div>
        <p class="text-sm text-slate-600 mb-3">Введіть два цілих числа у поля та обчисліть їхній добуток (наприклад, 6 і 7). Програма перевіряє, чи обидва значення коректно перетворюються на цілі числа.</p>
        <div class="flex flex-wrap gap-3 items-center mb-3">
          <input id="sim2-a" type="text" placeholder="Перше число" value="${escapeAttr(s.sim2.valA)}" class="w-36 border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
          <span class="font-bold text-slate-500">×</span>
          <input id="sim2-b" type="text" placeholder="Друге число" value="${escapeAttr(s.sim2.valB)}" class="w-36 border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
          <button type="button" id="sim2-calc" class="px-3.5 py-1.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700">Обчислити</button>
          <button type="button" id="sim2-check" class="px-3.5 py-1.5 rounded-lg bg-indigo-700 text-white text-sm font-medium hover:bg-indigo-800">Перевірити</button>
          <button type="button" id="sim2-reset" class="px-3.5 py-1.5 rounded-lg bg-slate-200 text-slate-800 text-sm font-medium hover:bg-slate-300">Скинути</button>
        </div>
        <div id="sim2-out" class="text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800">${escapeHtml(s.sim2.result || "Результат ще не обчислено")}</div>
        <div id="sim2-feedback" class="text-xs mt-2 font-medium text-slate-700"></div>
      </div>

      <!-- Симулятор 3 -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-slate-900">Симулятор 3. Однорядкове (Entry) та багаторядкове (Text) поле</h3>
          <span class="text-xs px-2.5 py-1 rounded-full ${s.sim3.passed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}">${s.sim3.passed ? "Виконано" : "Не перевірено"}</span>
        </div>
        <p class="text-sm text-slate-600 mb-3">Додайте у багаторядковий список щонайменше 3 окремі рядки за допомогою однорядкового поля введення та кнопки додавання.</p>
        <div class="flex flex-wrap gap-2 mb-3">
          <input id="sim3-line-input" type="text" placeholder="Введіть рядок та натисніть «Додати»" value="${escapeAttr(s.sim3.singleText)}" class="flex-1 min-w-[200px] border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
          <button type="button" id="sim3-add" class="px-3.5 py-1.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700">Додати рядок</button>
          <button type="button" id="sim3-pop" class="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-800 text-sm font-medium hover:bg-slate-300">Видалити останній</button>
          <button type="button" id="sim3-check" class="px-3.5 py-1.5 rounded-lg bg-indigo-700 text-white text-sm font-medium hover:bg-indigo-800">Перевірити</button>
          <button type="button" id="sim3-reset" class="px-3.5 py-1.5 rounded-lg bg-slate-200 text-slate-800 text-sm font-medium hover:bg-slate-300">Скинути</button>
        </div>
        <div id="sim3-box" class="bg-slate-50 border border-slate-200 rounded-lg p-3 min-h-[84px] text-sm space-y-1">
          ${s.sim3.lines.length ? s.sim3.lines.map((l, idx) => `<div class="font-mono text-slate-800">${idx + 1}. ${escapeHtml(l)}</div>`).join("") : `<div class="text-slate-400">Багаторядкове поле порожнє</div>`}
        </div>
        <div id="sim3-feedback" class="text-xs mt-2 font-medium text-slate-700"></div>
      </div>

      <!-- Симулятор 4 -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-slate-900">Симулятор 4. Стан поля та обмеження довжини</h3>
          <span class="text-xs px-2.5 py-1 rounded-full ${s.sim4.passed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}">${s.sim4.passed ? "Виконано" : "Не перевірено"}</span>
        </div>
        <p class="text-sm text-slate-600 mb-3">Встановіть обмеження довжини поля на 8 символів, введіть текст завдовжки від 4 до 8 символів і переведіть поле у режим «тільки для читання» (readonly).</p>
        <div class="flex flex-wrap gap-3 items-center mb-3 text-sm">
          <label class="text-xs text-slate-700">Макс. довжина:
            <input id="sim4-maxlen" type="number" min="3" max="20" value="${s.sim4.maxLen}" class="w-16 border border-slate-300 rounded px-2 py-1 ml-1" />
          </label>
          <label class="text-xs text-slate-700">Стан:
            <select id="sim4-mode" class="border border-slate-300 rounded px-2 py-1 ml-1">
              <option value="normal" ${s.sim4.mode === "normal" ? "selected" : ""}>Активне (normal)</option>
              <option value="readonly" ${s.sim4.mode === "readonly" ? "selected" : ""}>Тільки для читання (readonly)</option>
              <option value="disabled" ${s.sim4.mode === "disabled" ? "selected" : ""}>Заблоковане (disabled)</option>
            </select>
          </label>
        </div>
        <div class="flex flex-wrap gap-2 items-center">
          <input id="sim4-input" type="text" maxlength="${s.sim4.maxLen}" ${s.sim4.mode !== "normal" ? "readonly" : ""} value="${escapeAttr(s.sim4.sampleText)}" placeholder="Введіть текст..." class="border border-slate-300 rounded-lg px-3 py-1.5 text-sm ${s.sim4.mode !== "normal" ? "bg-slate-100 text-slate-600" : "bg-white"}" />
          <span class="text-xs text-slate-500">Символів: <strong id="sim4-count">${s.sim4.sampleText.length}</strong> / ${s.sim4.maxLen}</span>
          <button type="button" id="sim4-check" class="px-3.5 py-1.5 rounded-lg bg-indigo-700 text-white text-sm font-medium hover:bg-indigo-800">Перевірити</button>
          <button type="button" id="sim4-reset" class="px-3.5 py-1.5 rounded-lg bg-slate-200 text-slate-800 text-sm font-medium hover:bg-slate-300">Скинути</button>
        </div>
        <div id="sim4-feedback" class="text-xs mt-2 font-medium text-slate-700"></div>
      </div>

      <!-- Симулятор 5 -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-slate-900">Симулятор 5. Формування та очищення результату</h3>
          <span class="text-xs px-2.5 py-1 rounded-full ${s.sim5.passed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}">${s.sim5.passed ? "Виконано" : "Не перевірено"}</span>
        </div>
        <p class="text-sm text-slate-600 mb-3">Заповніть обидва поля (назва проєкту та роль), сформуйте картку-підсумок, а потім перевірте результат.</p>
        <div class="grid sm:grid-cols-2 gap-3 mb-3">
          <input id="sim5-name" type="text" placeholder="Назва проєкту" value="${escapeAttr(s.sim5.name)}" class="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
          <input id="sim5-role" type="text" placeholder="Ваша роль у проєкті" value="${escapeAttr(s.sim5.role)}" class="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
        </div>
        <div class="flex flex-wrap gap-2 mb-3">
          <button type="button" id="sim5-build" class="px-3.5 py-1.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700">Сформувати картку</button>
          <button type="button" id="sim5-clear" class="px-3.5 py-1.5 rounded-lg bg-slate-200 text-slate-800 text-sm font-medium hover:bg-slate-300">Очистити поля</button>
          <button type="button" id="sim5-check" class="px-3.5 py-1.5 rounded-lg bg-indigo-700 text-white text-sm font-medium hover:bg-indigo-800">Перевірити</button>
          <button type="button" id="sim5-reset" class="px-3.5 py-1.5 rounded-lg bg-slate-200 text-slate-800 text-sm font-medium hover:bg-slate-300">Скинути</button>
        </div>
        <div id="sim5-preview" class="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-800">${escapeHtml(s.sim5.preview || "Картка ще не сформована")}</div>
        <div id="sim5-feedback" class="text-xs mt-2 font-medium text-slate-700"></div>
      </div>

      <!-- Симулятор 6 -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-slate-900">Симулятор 6. Події та реакція на введення</h3>
          <span class="text-xs px-2.5 py-1 rounded-full ${s.sim6.passed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}">${s.sim6.passed ? "Виконано" : "Не перевірено"}</span>
        </div>
        <p class="text-sm text-slate-600 mb-3">Введіть команду або текст у поле та натисніть клавішу <strong>Enter</strong> у цьому полі, щоб зафіксувати подію підтвердження.</p>
        <div class="flex flex-wrap gap-2 items-center mb-2">
          <input id="sim6-input" type="text" placeholder="Введіть текст і натисніть Enter" value="${escapeAttr(s.sim6.currentText)}" class="flex-1 min-w-[220px] border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
          <button type="button" id="sim6-check" class="px-3.5 py-1.5 rounded-lg bg-indigo-700 text-white text-sm font-medium hover:bg-indigo-800">Перевірити</button>
          <button type="button" id="sim6-reset" class="px-3.5 py-1.5 rounded-lg bg-slate-200 text-slate-800 text-sm font-medium hover:bg-slate-300">Скинути</button>
        </div>
        <div class="text-xs text-slate-600">
          Зміна тексту: <strong id="sim6-changed">${s.sim6.textChanged ? "так" : "ні"}</strong> | Натиснуто Enter: <strong id="sim6-enter">${s.sim6.enterPressed ? "так" : "ні"}</strong>
        </div>
        <div id="sim6-feedback" class="text-xs mt-2 font-medium text-slate-700"></div>
      </div>
    `;

    bindEvents(state, onSave, onRecordAttempt);
  }

  function bindEvents(state, onSave, onRecordAttempt) {
    const s = state.simulators;

    const s1Input = document.getElementById("sim1-input");
    const s1Font = document.getElementById("sim1-font");
    const s1Width = document.getElementById("sim1-width");
    const s1Mask = document.getElementById("sim1-mask");
    const s1Bg = document.getElementById("sim1-bg");
    const s1Fg = document.getElementById("sim1-fg");

    if (s1Input) {
      s1Input.addEventListener("input", () => {
        s.sim1.text = s1Input.value;
        onSave();
      });
      s1Font.addEventListener("input", () => {
        s.sim1.fontSize = Number(s1Font.value);
        s1Input.style.fontSize = s.sim1.fontSize + "px";
        document.getElementById("sim1-font-val").textContent = s.sim1.fontSize + "px";
        onSave();
      });
      s1Width.addEventListener("input", () => {
        s.sim1.widthPx = Number(s1Width.value);
        s1Input.style.width = s.sim1.widthPx + "px";
        document.getElementById("sim1-width-val").textContent = s.sim1.widthPx + "px";
        onSave();
      });
      s1Mask.addEventListener("change", () => {
        s.sim1.masked = s1Mask.checked;
        s1Input.type = s.sim1.masked ? "password" : "text";
        onSave();
      });
      s1Bg.addEventListener("input", () => {
        s.sim1.bg = s1Bg.value;
        s1Input.style.background = s.sim1.bg;
        onSave();
      });
      s1Fg.addEventListener("input", () => {
        s.sim1.fg = s1Fg.value;
        s1Input.style.color = s.sim1.fg;
        onSave();
      });
      document.getElementById("sim1-check").addEventListener("click", () => {
        onRecordAttempt();
        s.sim1.checked = true;
        const ok = s.sim1.text.trim().length >= 6 && s.sim1.masked && s.sim1.fontSize >= 20;
        s.sim1.passed = ok;
        document.getElementById("sim1-feedback").textContent = ok
          ? "Результат відповідає умовам завдання."
          : "Перевірте довжину тексту (≥ 6 символів), маскування символів та розмір шрифту (≥ 20px).";
        onSave();
        renderAll(state, onSave, onRecordAttempt);
      });
      document.getElementById("sim1-reset").addEventListener("click", () => {
        s.sim1 = { text: "", masked: false, fontSize: 16, widthPx: 260, bg: "#ffffff", fg: "#0f172a", checked: false, passed: false };
        onSave();
        renderAll(state, onSave, onRecordAttempt);
      });
    }

    const s2Calc = document.getElementById("sim2-calc");
    if (s2Calc) {
      s2Calc.addEventListener("click", () => {
        const aRaw = document.getElementById("sim2-a").value.trim();
        const bRaw = document.getElementById("sim2-b").value.trim();
        s.sim2.valA = aRaw;
        s.sim2.valB = bRaw;
        if (!/^-?\d+$/.test(aRaw) || !/^-?\d+$/.test(bRaw)) {
          s.sim2.result = "Помилка перетворення: введіть коректні цілі числа.";
        } else {
          const prod = parseInt(aRaw, 10) * parseInt(bRaw, 10);
          s.sim2.result = `${aRaw} * ${bRaw} = ${prod} (тип: int)`;
        }
        onSave();
        document.getElementById("sim2-out").textContent = s.sim2.result;
      });
      document.getElementById("sim2-check").addEventListener("click", () => {
        onRecordAttempt();
        s.sim2.checked = true;
        const ok = /^-?\d+$/.test(s.sim2.valA) && /^-?\d+$/.test(s.sim2.valB) && s.sim2.result.includes("(тип: int)");
        s.sim2.passed = ok;
        document.getElementById("sim2-feedback").textContent = ok
          ? "Коректно виконано зчитування та перетворення чисел."
          : "Спочатку введіть два цілих числа та натисніть «Обчислити».";
        onSave();
        renderAll(state, onSave, onRecordAttempt);
      });
      document.getElementById("sim2-reset").addEventListener("click", () => {
        s.sim2 = { valA: "", valB: "", result: "", checked: false, passed: false };
        onSave();
        renderAll(state, onSave, onRecordAttempt);
      });
    }

    const s3Add = document.getElementById("sim3-add");
    if (s3Add) {
      s3Add.addEventListener("click", () => {
        const inp = document.getElementById("sim3-line-input");
        const val = inp.value.trim();
        if (val) {
          s.sim3.lines.push(val);
          s.sim3.singleText = "";
          onSave();
          renderAll(state, onSave, onRecordAttempt);
        }
      });
      document.getElementById("sim3-pop").addEventListener("click", () => {
        s.sim3.lines.pop();
        onSave();
        renderAll(state, onSave, onRecordAttempt);
      });
      document.getElementById("sim3-check").addEventListener("click", () => {
        onRecordAttempt();
        s.sim3.checked = true;
        const ok = s.sim3.lines.length >= 3;
        s.sim3.passed = ok;
        document.getElementById("sim3-feedback").textContent = ok
          ? "Додано необхідну кількість рядків у багаторядкове поле."
          : "Додайте щонайменше 3 рядки до багаторядкового поля.";
        onSave();
        renderAll(state, onSave, onRecordAttempt);
      });
      document.getElementById("sim3-reset").addEventListener("click", () => {
        s.sim3 = { lines: [], singleText: "", checked: false, passed: false };
        onSave();
        renderAll(state, onSave, onRecordAttempt);
      });
    }

    const s4Max = document.getElementById("sim4-maxlen");
    if (s4Max) {
      s4Max.addEventListener("change", () => {
        const v = Math.min(20, Math.max(3, Number(s4Max.value) || 8));
        s.sim4.maxLen = v;
        s.sim4.sampleText = s.sim4.sampleText.slice(0, v);
        onSave();
        renderAll(state, onSave, onRecordAttempt);
      });
      document.getElementById("sim4-mode").addEventListener("change", (e) => {
        s.sim4.mode = e.target.value;
        onSave();
        renderAll(state, onSave, onRecordAttempt);
      });
      document.getElementById("sim4-input").addEventListener("input", (e) => {
        s.sim4.sampleText = e.target.value;
        document.getElementById("sim4-count").textContent = String(s.sim4.sampleText.length);
        onSave();
      });
      document.getElementById("sim4-check").addEventListener("click", () => {
        onRecordAttempt();
        s.sim4.checked = true;
        const len = s.sim4.sampleText.trim().length;
        const ok = s.sim4.maxLen === 8 && len >= 4 && len <= 8 && s.sim4.mode === "readonly";
        s.sim4.passed = ok;
        document.getElementById("sim4-feedback").textContent = ok
          ? "Параметри обмеження довжини та режиму задано правильно."
          : "Перевірте: макс. довжина = 8, довжина тексту від 4 до 8 символів, стан — «Тільки для читання (readonly)».";
        onSave();
        renderAll(state, onSave, onRecordAttempt);
      });
      document.getElementById("sim4-reset").addEventListener("click", () => {
        s.sim4 = { mode: "normal", maxLen: 10, sampleText: "", checked: false, passed: false };
        onSave();
        renderAll(state, onSave, onRecordAttempt);
      });
    }

    const s5Build = document.getElementById("sim5-build");
    if (s5Build) {
      s5Build.addEventListener("click", () => {
        const name = document.getElementById("sim5-name").value.trim();
        const role = document.getElementById("sim5-role").value.trim();
        s.sim5.name = name;
        s.sim5.role = role;
        if (!name || !role) {
          s.sim5.preview = "Заповніть обидва поля перед формуванням картки.";
        } else {
          s.sim5.preview = `Проєкт: «${name}» | Роль: ${role}`;
        }
        onSave();
        document.getElementById("sim5-preview").textContent = s.sim5.preview;
      });
      document.getElementById("sim5-clear").addEventListener("click", () => {
        document.getElementById("sim5-name").value = "";
        document.getElementById("sim5-role").value = "";
        s.sim5.name = "";
        s.sim5.role = "";
        onSave();
      });
      document.getElementById("sim5-check").addEventListener("click", () => {
        onRecordAttempt();
        s.sim5.checked = true;
        const ok = s.sim5.preview.startsWith("Проєкт: «") && s.sim5.preview.includes("| Роль:");
        s.sim5.passed = ok;
        document.getElementById("sim5-feedback").textContent = ok
          ? "Картку сформовано коректно."
          : "Введіть назву проєкту та роль і натисніть «Сформувати картку».";
        onSave();
        renderAll(state, onSave, onRecordAttempt);
      });
      document.getElementById("sim5-reset").addEventListener("click", () => {
        s.sim5 = { name: "", role: "", preview: "", checked: false, passed: false };
        onSave();
        renderAll(state, onSave, onRecordAttempt);
      });
    }

    const s6Inp = document.getElementById("sim6-input");
    if (s6Inp) {
      s6Inp.addEventListener("input", () => {
        s.sim6.currentText = s6Inp.value;
        s.sim6.textChanged = s6Inp.value.trim().length > 0;
        document.getElementById("sim6-changed").textContent = s.sim6.textChanged ? "так" : "ні";
        onSave();
      });
      s6Inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          s.sim6.currentText = s6Inp.value;
          s.sim6.textChanged = s6Inp.value.trim().length > 0;
          s.sim6.enterPressed = true;
          document.getElementById("sim6-enter").textContent = "так";
          onSave();
        }
      });
      document.getElementById("sim6-check").addEventListener("click", () => {
        onRecordAttempt();
        s.sim6.checked = true;
        const ok = s.sim6.textChanged && s.sim6.enterPressed;
        s.sim6.passed = ok;
        document.getElementById("sim6-feedback").textContent = ok
          ? "Події введення та натискання Enter зафіксовано."
          : "Введіть текст у поле та натисніть клавішу Enter у ньому.";
        onSave();
        renderAll(state, onSave, onRecordAttempt);
      });
      document.getElementById("sim6-reset").addEventListener("click", () => {
        s.sim6 = { enterPressed: false, textChanged: false, currentText: "", checked: false, passed: false };
        onSave();
        renderAll(state, onSave, onRecordAttempt);
      });
    }
  }

  function escapeAttr(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  function escapeHtml(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  return { initSimulators };
})();
