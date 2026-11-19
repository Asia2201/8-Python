// State Management
let studentName = localStorage.getItem('py_student_name') || '';
let quizScore = 0;
let trainerProgress = 0;

const theoryTopics = [
    { title: "1. Що таке GUI?", text: "GUI (Graphical User Interface) — це графічний інтерфейс користувача, який дозволяє взаємодіяти з програмою через вікна, кнопки та текстові поля, замість консольного тексту.", code: "import tkinter as tk
root = tk.Tk()" },
    { title: "2. Що таке текстове поле?", text: "Текстове поле — це елемент інтерфейсу (віджет), у який користувач може вводити рядок тексту зі клавіатури.", code: "entry = tk.Entry(root)" },
    { title: "3. Для чого потрібен віджет Entry?", text: "Він використовується для отримання коротких текстових даних: імен, паролів, чисел тощо.", code: "entry = Entry(root, width=20)" },
    { title: "4. Створення текстового поля", text: "Створюється за допомогою конструктора Entry(parent), після чого його треба розмістити методом pack().", code: "entry = Entry(root)
entry.pack()" },
    { title: "5. Отримання тексту з get()", text: "Метод get() повертає поточний рядок, введений користувачем у текстове поле.", code: "text = entry.get()" },
    { title: "6. Очищення поля з delete()", text: "Метод delete(first, last) видаляє символи. Зазвичай delete(0, END) очищує все поле.", code: "entry.delete(0, END)" },
    { title: "7. Вставлення тексту з insert()", text: "Метод insert(index, string) додає текст у вказану позицію (наприклад, 0 — на початок).", code: "entry.insert(0, 'Привіт!')" },
    { title: "8. Віджети Label та Button", text: "Label відображає підказки та результати, а Button викликає функції обробки при натисканні.", code: "btn = Button(root, text='ОК', command=my_func)" },
    { title: "9. Зв'язування кнопки та Entry", text: "Передаємо функцію у параметр command кнопки. Всередині функції беремо get() та оновлюємо Label.", code: "def click():
    lbl.config(text=entry.get())" },
    { title: "10. Повна проста програма", text: "Приклад зв'язки Entry + Button + Label.", code: "from tkinter import *
root = Tk()
e = Entry(root)
e.pack()
Button(root, text='Go', command=lambda: print(e.get())).pack()
root.mainloop()" }
];

const matchPairs = [
    { cmd: "Entry()", desc: "Створення текстового поля" },
    { cmd: "get()", desc: "Отримання тексту з поля" },
    { cmd: "delete()", desc: "Видалення тексту з поля" },
    { cmd: "insert()", desc: "Вставлення тексту в поле" },
    { cmd: "Button()", desc: "Створення кнопки" }
];

const quizQuestions = [
    { q: "1. Який віджет створює однорядкове текстове поле в Tkinter?", opts: ["Label()", "Entry()", "Button()"], ans: 1 },
    { q: "2. За допомогою якого методу можна зчитати вміст Entry?", opts: ["read()", "fetch()", "get()"], ans: 2 },
    { q: "3. Що робить команда entry.delete(0, END)?", opts: ["Видаляє поле", "Очищує увесь текст у полі", "Закупорює поле"], ans: 1 },
    { q: "4. Як вставити слово 'Hi' на початок поля?", opts: ["entry.insert(0, 'Hi')", "entry.add('Hi')", "entry.set('Hi')"], ans: 0 },
    { q: "5. Чи можна використовувати get() для віджета Label?", opts: ["Так", "Ні, це метод Entry"], ans: 1 },
    { q: "6. Параметр кнопки для зв'язування з функцією:", opts: ["action=", "command=", "callback="], ans: 1 },
    { q: "7. Метод для розміщення віджета у вікні:", opts: ["pack()", "place_all()", "show()"], ans: 0 },
    { q: "8. get() повертає тип даних:", opts: ["String (рядок)", "Integer (число)", "Boolean"], ans: 0 },
    { q: "9. Текстове поле в Tkinter призначене тільки для читання?", opts: ["Так", "Ні, користувач може вводити текст"], ans: 1 },
    { q: "10. Яка бібліотека відповідає за GUI в даному курсі?", opts: ["Pygame", "Tkinter", "Math"], ans: 1 }
];

document.addEventListener('DOMContentLoaded', () => {
    if (studentName) {
        document.getElementById('studentNameInput').value = studentName;
        updateHeaderUser();
    }
    renderTheory();
    renderMatchTask();
    renderQuiz();
});

function switchSection(secId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    
    document.getElementById(`sec-${secId}`).classList.add('active');
    const activeLi = Array.from(document.querySelectorAll('.nav-links li')).find(li => li.getAttribute('onclick').includes(secId));
    if (activeLi) activeLi.classList.add('active');
}

function startLearning() {
    const val = document.getElementById('studentNameInput').value.trim();
    if (!val) {
        alert("Будь ласка, введи своє ім'я!");
        return;
    }
    studentName = val;
    localStorage.setItem('py_student_name', studentName);
    updateHeaderUser();
    switchSection('theory');
}

function updateHeaderUser() {
    document.getElementById('headerUserStatus').style.display = 'block';
    document.getElementById('displayStudentName').innerText = studentName;
}

function renderTheory() {
    const container = document.getElementById('theoryContainer');
    container.innerHTML = theoryTopics.map(t => `
        <div class="card">
            <h3>${t.title}</h3>
            <p>${t.text}</p>
            <div class="code-block">${t.code}</div>
        </div>
    `).join('');
}

function renderMatchTask() {
    const container = document.getElementById('matchTaskContainer');
    container.innerHTML = matchPairs.map((p, idx) => `
        <div style="margin-bottom: 10px;">
            <strong>${p.cmd}</strong> — 
            <select id="matchSel_${idx}">
                <option value="">-- Оберіть функцію --</option>
                ${matchPairs.map(m => `<option value="${m.desc}">${m.desc}</option>`).join('')}
            </select>
        </div>
    `).join('');
}

function checkMatchTask() {
    let correct = 0;
    matchPairs.forEach((p, idx) => {
        const val = document.getElementById(`matchSel_${idx}`).value;
        if (val === p.desc) correct++;
    });
    const fb = document.getElementById('matchFeedback');
    if (correct === matchPairs.length) {
        fb.className = "feedback success";
        fb.innerText = "Чудово! Усі команди співставлено правильно!";
    } else {
        fb.className = "feedback error";
        fb.innerText = `Вірно ${correct} з ${matchPairs.length}. Спробуй ще раз!`;
    }
}

function checkTask2() {
    const val = document.getElementById('task2Select').value;
    const fb = document.getElementById('task2Feedback');
    if (val === "Entry") {
        fb.className = "feedback success";
        fb.innerText = "Правильно! Для текстового поля використовується Entry(root).";
    } else {
        fb.className = "feedback error";
        fb.innerText = "Невірно. Згадай назву віджета для введення тексту!";
    }
}

function checkTask3() {
    const val = document.getElementById('task3Input').value.trim();
    const fb = document.getElementById('task3Feedback');
    if (val.toLowerCase() === "thon") {
        fb.className = "feedback success";
        fb.innerText = "Правильно! Оскільки 'Py' (індекси 0,1) було видалено, залишилось 'thon'.";
    } else {
        fb.className = "feedback error";
        fb.innerText = "Не зовсім. 'Python' мінус перші 2 літери (0, 1, 2 не включаючи 2) = ?";
    }
}

function checkTask4() {
    const sel = document.querySelector('input[name="task4"]:checked');
    const fb = document.getElementById('task4Feedback');
    if (sel && sel.value === "get") {
        fb.className = "feedback success";
        fb.innerText = "Супер! Для зчитування даних використовують метод get().";
    } else {
        fb.className = "feedback error";
        fb.innerText = "Обери правильний варіант get()!";
    }
}

function checkTask5() {
    const val = document.getElementById('task5Select').value;
    const fb = document.getElementById('task5Feedback');
    if (val === "Button") {
        fb.className = "feedback success";
        fb.innerText = "Правильно! Кнопка створюється через Button().";
    } else {
        fb.className = "feedback error";
        fb.innerText = "Спробуй ще раз!";
    }
}

// Workshop Sims
function runSim1() {
    const val = document.getElementById('sim1Entry').value;
    document.getElementById('sim1Output').innerText = val ? `Привіт, ${val}!` : "Введи ім'я!";
}

function runSim2Show() {
    const fn = document.getElementById('sim2Fn').value;
    const ln = document.getElementById('sim2Ln').value;
    document.getElementById('sim2Output').innerText = `Результат: ${fn} ${ln}`;
}

function runSim2Clear() {
    document.getElementById('sim2Fn').value = "";
    document.getElementById('sim2Ln').value = "";
    document.getElementById('sim2Output').innerText = "";
}

function verifyCode(lvl) {
    const code = document.getElementById(`codeLevel${lvl}`).value;
    const fb = document.getElementById(`workFeedback${lvl}`);
    
    if (code.includes('Entry') && code.includes('get()')) {
        fb.className = "feedback success";
        fb.innerText = "Код перевірено успішно! Використано ключові елементи Entry та get().";
    } else {
        fb.className = "feedback error";
        fb.innerText = "У коді мають бути присутні Entry та метод get()!";
    }
}

// Quiz
function renderQuiz() {
    const container = document.getElementById('quizContainer');
    container.innerHTML = quizQuestions.map((q, idx) => `
        <div class="card">
            <h4>${q.q}</h4>
            <div style="margin-top:10px;">
                ${q.opts.map((o, oIdx) => `
                    <label style="display:block; margin-bottom:5px;">
                        <input type="radio" name="q_${idx}" value="${oIdx}"> ${o}
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function finishQuiz() {
    quizScore = 0;
    quizQuestions.forEach((q, idx) => {
        const sel = document.querySelector(`input[name="q_${idx}"]:checked`);
        if (sel && parseInt(sel.value) === q.ans) {
            quizScore++;
        }
    });

    renderReport();
    switchSection('report');
}

function renderReport() {
    document.getElementById('repStudentName').innerText = `Учень: ${studentName || "Гість"}`;
    document.getElementById('repDate').innerText = `Дата: ${new Date().toLocaleDateString('uk-UA')}`;
    document.getElementById('repScore').innerText = `${quizScore} / 10`;
    
    const percent = Math.round((quizScore / 10) * 100);
    document.getElementById('repPercent').innerText = `${percent}%`;

    let lvlText = "";
    if (quizScore >= 9) lvlText = "🏆 Супер! Ти майстер текстових полів Python!";
    else if (quizScore >= 7) lvlText = "🌟 Чудово! Ти добре засвоїв тему!";
    else if (quizScore >= 5) lvlText = "👍 Непогано! Повтори окремі команди!";
    else lvlText = "📖 Потрібно ще потренуватися!";

    document.getElementById('repLevelText').innerText = lvlText;

    // Chart.js
    const ctx = document.getElementById('scoreChart').getContext('2d');
    if (window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Правильно', 'Помилки'],
            datasets: [{
                data: [quizScore, 10 - quizScore],
                backgroundColor: ['#10b981', '#ef4444']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function resetProgress() {
    quizScore = 0;
    switchSection('welcome');
}
