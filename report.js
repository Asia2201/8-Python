// Підрахунок балів (12-бальна шкала), аналітичний звіт, друк і експорт у PDF
window.ReportModule = (function () {
  function calculateScores(state) {
    const data = window.WORKSHOP_DATA;

    let theoryCorrect = 0;
    let theoryAnswered = 0;
    (data.theoryQuestions || []).forEach((q) => {
      const ans = state.answers.theory[q.id];
      if (ans !== undefined && ans !== null && (!Array.isArray(ans) || ans.length > 0)) {
        theoryAnswered++;
      }
      if (isTheoryCorrect(q, ans)) {
        theoryCorrect++;
      }
    });

    let visualCorrect = 0;
    let visualAnswered = 0;
    (data.visualTasks || []).forEach((vt) => {
      const ans = state.answers.visual[vt.id];
      if (ans !== undefined && ans !== null && (!Array.isArray(ans) || ans.length > 0)) {
        visualAnswered++;
      }
      if (isVisualCorrect(vt, ans)) {
        visualCorrect++;
      }
    });

    const totalItems = (data.theoryQuestions.length || 1) + (data.visualTasks.length || 1);
    const totalCorrect = theoryCorrect + visualCorrect;
    const totalAnswered = theoryAnswered + visualAnswered;
    const theoryVisualScore = Number(((totalCorrect / totalItems) * 3).toFixed(2));

    const sims = state.simulators ? Object.values(state.simulators) : [];
    const simPassedCount = sims.filter((x) => x && x.passed).length;
    const simAttemptedCount = sims.filter((x) => x && x.checked).length;
    const simScore = sims.length ? Number(((simPassedCount / sims.length) * 3).toFixed(2)) : 0;

    const dnds = data.dndTasks || [];
    let dndPassedCount = 0;
    let dndAttemptedCount = 0;
    dnds.forEach((task) => {
      const res = state.answers.dnd[task.id];
      if (res && res.checked) dndAttemptedCount++;
      if (res && res.passed) dndPassedCount++;
    });
    const dndScore = dnds.length ? Number(((dndPassedCount / dnds.length) * 1).toFixed(2)) : 0;

    const openQs = data.openQuestions || [];
    let openFilled = 0;
    let openPreliminaryPts = 0;
    openQs.forEach((oq) => {
      const entry = state.answers.open[oq.id] || {};
      const text = (entry.text || "").trim();
      if (text.length > 0) openFilled++;
      const kwHits = (oq.keywords || []).filter((kw) => text.toLowerCase().includes(kw)).length;
      const autoRatio = Math.min(1, (text.length >= 60 ? 0.5 : text.length / 120) + kwHits * 0.12);
      const selfRatio = entry.selfRating === "full" ? 1 : entry.selfRating === "partial" ? 0.5 : 0;
      const combined = text.length === 0 ? 0 : (autoRatio * 0.6 + selfRatio * 0.4);
      openPreliminaryPts += combined;
    });
    const openScore = openQs.length ? Number(((openPreliminaryPts / openQs.length) * 1).toFixed(2)) : 0;

    const workshopScore = state.workshop ? window.FormWorkshopModule.evaluateWorkshop(state.workshop) : 0;

    const rawTotal = theoryVisualScore + simScore + dndScore + openScore + workshopScore;
    const finalTotal = Math.min(12, Math.round(rawTotal));

    const accuracyPct = totalItems ? Math.round((totalCorrect / totalItems) * 100) : 0;
    const errorPct = totalAnswered ? Math.max(0, Math.round(((totalAnswered - totalCorrect) / totalAnswered) * 100)) : 0;

    return {
      theoryVisualScore,
      simScore,
      dndScore,
      openScore,
      workshopScore,
      rawTotal: Number(Math.min(12, rawTotal).toFixed(2)),
      finalTotal,
      totalItems,
      totalAnswered,
      totalCorrect,
      totalSkipped: Math.max(0, totalItems - totalAnswered),
      accuracyPct,
      errorPct,
      simsTotal: sims.length,
      simAttemptedCount,
      simPassedCount,
      dndTotal: dnds.length,
      dndAttemptedCount,
      dndPassedCount,
      openTotal: openQs.length,
      openFilled,
      openEmpty: Math.max(0, openQs.length - openFilled)
    };
  }

  function isTheoryCorrect(q, ans) {
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

  function isVisualCorrect(vt, ans) {
    if (ans === undefined || ans === null) return false;
    if (vt.kind === "typeA") return Number(ans) === vt.correct;
    if (vt.kind === "typeB") {
      if (!Array.isArray(ans) || ans.length !== vt.correctOrder.length) return false;
      return ans.every((v, i) => Number(v) === vt.correctOrder[i]);
    }
    return false;
  }

  function renderReport(state) {
    const container = document.getElementById("report-container");
    if (!container) return;
    const m = calculateScores(state);
    const s = state.student || {};
    const endTime = state.finishedAt || new Date().toLocaleString("uk-UA");
    const durationMin = computeDurationMinutes(state.startedAt);
    const previewUrl = state.workshop ? window.FormWorkshopModule.buildCanvasDataUrl(state.workshop) : "";

    container.innerHTML = `
      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 print-only-card">
        <div class="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div class="text-xs uppercase tracking-wider text-indigo-700 font-semibold">Персональний аналітичний звіт</div>
            <h3 class="text-xl font-bold text-slate-900 mt-1">Практична робота: «Текстові поля в Python» (8 клас)</h3>
            <p class="text-sm text-slate-600 mt-1">Учень/учениця: <strong>${escapeHtml(s.lastName || "")} ${escapeHtml(s.firstName || "")}</strong> | Клас: <strong>${escapeHtml(s.className || "")}</strong></p>
          </div>
          <div class="bg-indigo-900 text-white rounded-xl px-5 py-3 text-center">
            <div class="text-xs text-indigo-200">Підсумкова оцінка</div>
            <div class="text-3xl font-extrabold">${m.finalTotal} / 12</div>
            <div class="text-[11px] text-indigo-200">Точність: ${m.accuracyPct}%</div>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div class="text-xs text-slate-500">Дата та початок</div>
            <div class="font-semibold text-slate-800">${escapeHtml(state.startedAt || "—")}</div>
          </div>
          <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div class="text-xs text-slate-500">Час формування звіту</div>
            <div class="font-semibold text-slate-800">${escapeHtml(endTime)}</div>
          </div>
          <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div class="text-xs text-slate-500">Тривалість роботи</div>
            <div class="font-semibold text-slate-800">${durationMin} хв</div>
          </div>
          <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div class="text-xs text-slate-500">Кількість перевірок (спроб)</div>
            <div class="font-semibold text-slate-800">${state.attemptsCount || 0}</div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div class="p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
            <h4 class="font-bold text-slate-900">Теоретичні знання та візуальний аналіз</h4>
            <div class="flex justify-between"><span>Усього завдань:</span><strong>${m.totalItems}</strong></div>
            <div class="flex justify-between"><span>Виконано / пропущено:</span><strong>${m.totalAnswered} / ${m.totalSkipped}</strong></div>
            <div class="flex justify-between"><span>Правильних відповідей:</span><strong>${m.totalCorrect} (${m.accuracyPct}%)</strong></div>
            <div class="flex justify-between"><span>Частка помилок:</span><strong>${m.errorPct}%</strong></div>
            <div class="pt-2 border-t flex justify-between text-indigo-900 font-bold"><span>Бал за блок:</span><span>${m.theoryVisualScore} / 3</span></div>
          </div>

          <div class="p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
            <h4 class="font-bold text-slate-900">Практичні блоки (Симулятори та Drag & Drop)</h4>
            <div class="flex justify-between"><span>Симуляторів виконано / успішно:</span><strong>${m.simAttemptedCount} / ${m.simPassedCount} з ${m.simsTotal}</strong></div>
            <div class="flex justify-between"><span>Drag & Drop виконано / успішно:</span><strong>${m.dndAttemptedCount} / ${m.dndPassedCount} з ${m.dndTotal}</strong></div>
            <div class="flex justify-between"><span>Бал за симулятори:</span><strong>${m.simScore} / 3</strong></div>
            <div class="flex justify-between"><span>Бал за Drag & Drop:</span><strong>${m.dndScore} / 1</strong></div>
            <div class="pt-2 border-t flex justify-between text-indigo-900 font-bold"><span>Сумарний практичний бал:</span><span>${Number((m.simScore + m.dndScore).toFixed(2))} / 4</span></div>
          </div>

          <div class="p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
            <h4 class="font-bold text-slate-900">Відкриті відповіді (попередня оцінка)</h4>
            <div class="flex justify-between"><span>Кількість запитань:</span><strong>${m.openTotal}</strong></div>
            <div class="flex justify-between"><span>Заповнено / порожніх:</span><strong>${m.openFilled} / ${m.openEmpty}</strong></div>
            <p class="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2">Оцінка за відкриті відповіді є попередньою та може бути уточнена вчителем під час перевірки.</p>
            <div class="pt-2 border-t flex justify-between text-indigo-900 font-bold"><span>Попередній бал:</span><span>${m.openScore} / 1</span></div>
          </div>

          <div class="p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
            <h4 class="font-bold text-slate-900">Творча майстерня — власна форма</h4>
            <div class="flex justify-between"><span>Створено елементів:</span><strong>${(state.workshop && state.workshop.elements.length) || 0}</strong></div>
            <div class="flex justify-between"><span>Задіяно інструментів/дій:</span><strong>${(state.workshop && state.workshop.toolsUsed.length) || 0}</strong></div>
            <div class="flex justify-between text-indigo-900 font-bold"><span>Бал за творчу роботу:</span><span>${m.workshopScore} / 4</span></div>
            ${previewUrl ? `<img src="${previewUrl}" alt="Мініатюра створеної форми" class="w-full h-28 object-contain rounded border border-slate-200 bg-slate-50 mt-2" />` : ""}
          </div>
        </div>

        <div class="space-y-2">
          <div class="text-xs font-semibold text-slate-700">Розподіл балів за розділами (сума: ${m.finalTotal} з 12)</div>
          <div class="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
            <div style="width:${(m.theoryVisualScore / 12) * 100}%" class="bg-blue-700" title="Теорія та візуальний аналіз"></div>
            <div style="width:${(m.simScore / 12) * 100}%" class="bg-sky-500" title="Симулятори"></div>
            <div style="width:${(m.dndScore / 12) * 100}%" class="bg-indigo-500" title="Drag & Drop"></div>
            <div style="width:${(m.openScore / 12) * 100}%" class="bg-teal-500" title="Відкриті відповіді"></div>
            <div style="width:${(m.workshopScore / 12) * 100}%" class="bg-violet-600" title="Творча майстерня"></div>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 no-print">
          <button type="button" id="btn-download-pdf" class="px-4 py-2 rounded-lg bg-indigo-800 text-white text-sm font-medium hover:bg-indigo-900">Завантажити звіт у PDF</button>
          <button type="button" id="btn-download-png" class="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700">Завантажити результат у PNG</button>
          <button type="button" id="btn-print-report" class="px-4 py-2 rounded-lg bg-slate-200 text-slate-900 text-sm font-medium hover:bg-slate-300">Друк звіту</button>
        </div>
      </div>
    `;

    document.getElementById("btn-download-pdf").addEventListener("click", () => downloadPdfReport(state, m, durationMin));
    document.getElementById("btn-download-png").addEventListener("click", () => {
      if (state.workshop) {
        const url = window.FormWorkshopModule.buildCanvasDataUrl(state.workshop);
        const a = document.createElement("a");
        a.href = url;
        a.download = "rezultat-tvorchoyi-roboty.png";
        a.click();
      }
    });
    document.getElementById("btn-print-report").addEventListener("click", () => window.print());
  }

  function computeDurationMinutes(startedAt) {
    if (!startedAt) return 1;
    const parsed = Date.parse(startedAt);
    if (Number.isNaN(parsed)) return 1;
    return Math.max(1, Math.round((Date.now() - parsed) / 60000));
  }

  function downloadPdfReport(state, m, durationMin) {
    const s = state.student || {};
    const canvas = document.createElement("canvas");
    canvas.width = 1240;
    canvas.height = 1754;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#1e3a8a";
    ctx.fillRect(0, 0, canvas.width, 120);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText("Аналітичний звіт: «Текстові поля в Python» (8 клас)", 56, 70);

    ctx.fillStyle = "#0f172a";
    ctx.font = "22px sans-serif";
    const lines = [
      `Учень / учениця: ${s.lastName || ""} ${s.firstName || ""} | Клас: ${s.className || ""}`,
      `Початок роботи: ${state.startedAt || "—"} | Тривалість: ${durationMin} хв | Спроб перевірки: ${state.attemptsCount || 0}`,
      `Теорія та візуальний аналіз: ${m.theoryVisualScore} / 3 (правильно ${m.totalCorrect} з ${m.totalItems}, точність ${m.accuracyPct}%)`,
      `Симулятори: ${m.simScore} / 3 (успішно ${m.simPassedCount} з ${m.simsTotal})`,
      `Drag & Drop: ${m.dndScore} / 1 (успішно ${m.dndPassedCount} з ${m.dndTotal})`,
      `Відкриті відповіді (попередньо): ${m.openScore} / 1 (заповнено ${m.openFilled} з ${m.openTotal})`,
      `Творча майстерня: ${m.workshopScore} / 4`,
      `Підсумкова оцінка: ${m.finalTotal} / 12`
    ];
    lines.forEach((line, idx) => {
      ctx.fillText(line, 56, 190 + idx * 54);
    });

    if (window.jspdf && window.jspdf.jsPDF) {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297);
      pdf.save("zvit-tekstovi-polya-8-klas.pdf");
    } else {
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "zvit-tekstovi-polya-8-klas.png";
      a.click();
    }
  }

  function escapeHtml(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  return { calculateScores, renderReport };
})();
