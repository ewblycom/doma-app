const DAYS = ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
const STORE = "doma-state-v1";
const state = load();
function load() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; } }
function save() { localStorage.setItem(STORE, JSON.stringify(state)); }
if (!state.who) state.who = "me";
if (!state.meals) state.meals = {};
if (!state.shop) state.shop = {};
if (!state.ex) state.ex = {};
if (!state.docs) state.docs = {};
const $ = (id) => document.getElementById(id);
function todayName() { return DAYS[new Date().getDay()]; }
function setWho(who) {
  state.who = who; save();
  document.querySelectorAll(".who button").forEach((b) => b.classList.toggle("on", b.dataset.who === who));
  renderAll();
}
window.setWho = setWho;
function mealKey(meal, i) { return meal.d + "|" + meal.m + "|" + i; }
function portion(meal) {
  const w = state.who === "wife";
  return { text: w ? meal.we : meal.me, k: w ? meal.wk : meal.mk, p: w ? meal.wp : meal.mp, f: w ? meal.wf : meal.mf, c: w ? meal.wc : meal.mc };
}
function mealCard(meal, i) {
  const p = portion(meal);
  const key = mealKey(meal, i);
  const done = !!state.meals[key];
  return `<article class="meal ${done ? "done" : ""}"><div class="tag">${meal.m} · ${meal.block}</div><h3>${meal.title}</h3><div class="portion">${p.text}</div><div class="macros"><i>${p.k} ккал</i><i>Б ${p.p}</i><i>Ж ${p.f}</i><i>У ${p.c}</i></div><div class="how">${meal.how}</div><label class="check"><input type="checkbox" ${done ? "checked" : ""} onchange="toggleMeal('${key}')"> Съедено</label></article>`;
}
window.toggleMeal = (key) => { state.meals[key] = !state.meals[key]; save(); renderAll(); };
window.toggleShop = (i) => { state.shop[i] = !state.shop[i]; save(); renderShop(); renderHome(); };
window.toggleEx = (key) => { state.ex[key] = !state.ex[key]; save(); renderGym(); renderHome(); };
window.toggleDoc = (i) => { state.docs[i] = !state.docs[i]; save(); renderMore(); };
function dayTotals(day) {
  return DOMA.meals.filter((m) => m.d === day).reduce((a, m) => { const p = portion(m); a.k += p.k; a.p += p.p; a.f += p.f; a.c += p.c; return a; }, {k:0,p:0,f:0,c:0});
}
function renderHome() {
  const day = todayName();
  const person = DOMA.people[state.who];
  const tot = dayTotals(day);
  const meals = DOMA.meals.filter((m) => m.d === day);
  const bought = DOMA.shop.filter((_, i) => state.shop[i]).length;
  const wo = DOMA.workouts.find((w) => w.day === day);
  $("home").innerHTML = `<div class="kpis"><div class="kpi"><b>${tot.k}</b><span>ккал сегодня · цель ${person.kcal}</span></div><div class="kpi"><b>${tot.p} г</b><span>белок · цель ${person.p} г</span></div><div class="kpi"><b>${bought}/${DOMA.shop.length}</b><span>позиций куплено</span></div><div class="kpi"><b>${DOMA.basket} Kč</b><span>корзина из ${DOMA.budget} Kč</span></div></div><div class="card"><h2>Сегодня · ${day}</h2><div class="macros"><i>Б ${tot.p}</i><i>Ж ${tot.f}</i><i>У ${tot.c}</i></div>${meals.map((m) => mealCard(m, DOMA.meals.indexOf(m))).join("")}</div><div class="card ${wo && wo.rest ? "rest" : ""}"><h2>Зал</h2><p>${wo ? (wo.rest ? wo.title : wo.title + " · " + wo.ex.length + " упражнений") : "—"}</p>${wo && !wo.rest ? `<button class="chip" onclick="go('gym')">Открыть тренировку</button>` : ""}</div>`;
}
function renderMenu() {
  const days = [...new Set(DOMA.meals.map((m) => m.d))];
  $("menu").innerHTML = days.map((d) => { const tot = dayTotals(d); const list = DOMA.meals.filter((m) => m.d === d); return `<div class="card"><h2>${d}</h2><div class="macros"><i>${tot.k} ккал</i><i>Б ${tot.p}</i><i>Ж ${tot.f}</i><i>У ${tot.c}</i></div>${list.map((m) => mealCard(m, DOMA.meals.indexOf(m))).join("")}</div>`; }).join("");
}
let shopFilter = "Все";
window.setShopFilter = (cat) => { shopFilter = cat; renderShop(); };
function renderShop() {
  const cats = ["Все", ...new Set(DOMA.shop.map((s) => s.cat))];
  const items = DOMA.shop.map((s, i) => ({...s, i})).filter((s) => shopFilter === "Все" || s.cat === shopFilter);
  const sum = DOMA.shop.reduce((a, s, i) => a + (state.shop[i] ? 0 : Math.round(s.qty * s.price)), 0);
  const left = DOMA.budget - DOMA.basket;
  let html = `<div class="card"><h2>Закупки · ${DOMA.week}</h2><div class="row"><span>Корзина</span><b>${DOMA.basket} Kč</b></div><div class="progress"><i style="width:${Math.min(100, DOMA.basket/DOMA.budget*100)}%"></i></div><div class="row"><span>Остаток бюджета</span><b>${left} Kč</b></div><div class="row"><span>Ещё не куплено</span><b>${sum} Kč</b></div></div><div class="filters">${cats.map((c) => `<button class="chip ${c===shopFilter?"on":""}" onclick="setShopFilter('${c}')">${c}</button>`).join("")}</div>`;
  let last = "";
  items.forEach((s) => {
    if (s.cat !== last) { html += `<div class="cat">${s.cat}</div>`; last = s.cat; }
    const cost = Math.round(s.qty * s.price);
    html += `<div class="shop-item ${state.shop[s.i] ? "got" : ""}"><input type="checkbox" ${state.shop[s.i]?"checked":""} onchange="toggleShop(${s.i})"><div><b>${s.name}</b><small>${s.qty} ${s.unit} · ${s.store}<br>${s.lasts}</small></div><div class="sum">${cost} Kč</div></div>`;
  });
  $("shop").innerHTML = html;
}
function renderGym() {
  $("gym").innerHTML = `<p class="hint">В таблице был план на 4 дня. Вы тренируетесь 2–3 раза — берите любые 2–3 силовых дня.</p>` +
    DOMA.workouts.map((w, wi) => {
      if (w.rest) return `<div class="card rest"><h2>${w.day}</h2><p>${w.title}</p></div>`;
      const doneN = w.ex.filter((_, ei) => state.ex[wi + ":" + ei]).length;
      return `<div class="card"><h2>${w.day} · ${w.title}</h2><div class="macros"><i>${doneN}/${w.ex.length} сделано</i></div>${w.ex.map((e, ei) => { const key = wi + ":" + ei; return `<div class="ex"><input type="checkbox" ${state.ex[key]?"checked":""} onchange="toggleEx('${key}')"><div><b>${e.n}</b><span>${e.s} × ${e.r} · ${e.w}<br>${e.t}</span></div></div>`; }).join("")}</div>`;
    }).join("");
}
function renderMore() {
  $("more").innerHTML = `<div class="install"><b>Поставить на экран iPhone.</b> Safari → Поделиться → На экран «Домой».</div><div class="card"><h2>Нормы</h2><p class="hint">${DOMA.goal}. Возраст ~32, магазины: ${DOMA.shops}.</p><div class="row"><span>Я 182 / 80 кг</span><b>2000 ккал / Б 160</b></div><div class="row"><span>Жена 168 / 75 кг</span><b>1600 ккал / Б 140</b></div></div><div class="card"><h2>Документы</h2><p class="hint">Не храните пароли и номера карт.</p>${DOMA.docs.map((d,i)=>`<div class="ex"><input type="checkbox" ${state.docs[i]?"checked":""} onchange="toggleDoc(${i})"><div><b>${d.name}</b><span>${d.cat} · ${d.fmt}${d.where ? " · " + d.where : ""}</span></div></div>`).join("")}</div><div class="card"><h2>Почта</h2><p class="hint">Метка Gmail «Дашборд/Важно». Дайджест 08:00 Prague.</p><ul class="list">${DOMA.mailKeep.map((x)=>`<li><b>${x.t}.</b> ${x.e} — ${x.a}</li>`).join("")}</ul><p class="hint">Не присылать: чеки Делимобиля, реклама, «заказ забран».</p></div><div class="card"><h2>На этом телефоне</h2><p class="hint">Галочки не синхронизируются с телефоном жены сами.</p><button class="chip" onclick="resetChecks()">Сбросить галочки недели</button></div>`;
}
window.resetChecks = () => { if (!confirm("Сбросить съедено / куплено / зал?")) return; state.meals = {}; state.shop = {}; state.ex = {}; save(); renderAll(); };
function renderAll() {
  document.querySelectorAll(".who button").forEach((b) => b.classList.toggle("on", b.dataset.who === state.who));
  renderHome(); renderMenu(); renderShop(); renderGym(); renderMore();
}
window.go = (page) => {
  document.querySelectorAll(".page").forEach((p) => p.classList.toggle("on", p.id === page));
  document.querySelectorAll(".nav button").forEach((b) => b.classList.toggle("on", b.dataset.page === page));
  window.scrollTo(0, 0);
};
renderAll(); go("home");
if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
