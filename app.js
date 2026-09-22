const DAYS = ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
const SHORT = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const ORDER = ["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"];
const STORE = "doma-bevel-v1";
const state = JSON.parse(localStorage.getItem(STORE) || "{}");
if (!state.who) state.who = "me";
if (!state.meals) state.meals = {};
if (!state.shop) state.shop = {};
if (!state.ex) state.ex = {};
if (!state.extra) state.extra = {};
if (!state.mailHide) state.mailHide = {};
function save() { localStorage.setItem(STORE, JSON.stringify(state)); }
const $ = (id) => document.getElementById(id);
function todayName() { return DAYS[new Date().getDay()]; }
function portion(m) {
  const w = state.who === "wife";
  return { text: w ? m.we : m.me, k: w ? m.wk : m.mk, p: w ? m.wp : m.mp, f: w ? m.wf : m.mf, c: w ? m.wc : m.mc };
}
function mealKey(m, i) { return m.d + "|" + m.m + "|" + i; }
function person() { return DOMA.people[state.who]; }
function eatenOf(day) {
  let k = 0, p = 0;
  (DOMA.meals || []).forEach((m, i) => {
    if (m.d !== day) return;
    if (state.meals[mealKey(m, i)]) {
      const x = portion(m);
      k += x.k || 0; p += x.p || 0;
    }
  });
  k += Number(state.extra[day] || 0);
  return { k, p, extra: Number(state.extra[day] || 0) };
}
function ringSvg(pct, color) {
  const p = Math.max(0, Math.min(100, pct));
  const c = 2 * Math.PI * 28;
  const dash = (p / 100) * c;
  return `<svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="28" fill="none" stroke="#eceef2" stroke-width="7"/><circle cx="36" cy="36" r="28" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${dash} ${c}" transform="rotate(-90 36 36)"/></svg>`;
}
const ICO = {
  home: '<svg class="ic" viewBox="0 0 24 24"><path d="M4 10.5 12 4l8 6.5V20H4z"/></svg>',
  book: '<svg class="ic" viewBox="0 0 24 24"><path d="M6 5h11a2 2 0 0 1 2 2v12H8a2 2 0 0 0-2 2V5z"/><path d="M6 5a2 2 0 0 0-2 2v14"/></svg>',
  run: '<svg class="ic" viewBox="0 0 24 24"><circle cx="14" cy="5" r="2"/><path d="M6 20l3-5 3 2 3-6"/></svg>',
  mail: '<svg class="ic" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="m4 8 8 6 8-6"/></svg>'
};
function mountIcons() {
  document.querySelectorAll(".tab-pill .ico").forEach((el) => { el.innerHTML = ICO[el.dataset.ic] || ""; });
}
window.cycleWho = function () {
  state.who = state.who === "me" ? "wife" : "me";
  save();
  $("whoPill").textContent = state.who === "wife" ? "Ж" : "Я";
  renderAll();
};
window.go = function (page) {
  document.querySelectorAll(".page").forEach((p) => p.classList.toggle("on", p.id === page));
  document.querySelectorAll(".tab-pill button").forEach((b) => b.classList.toggle("on", b.dataset.page === page));
  window.scrollTo(0, 0);
};
window.toggleMeal = function (key) { state.meals[key] = !state.meals[key]; save(); renderAll(); };
window.toggleShop = function (i) { state.shop[i] = !state.shop[i]; save(); renderShop(); };
window.toggleEx = function (key) { state.ex[key] = !state.ex[key]; save(); renderGym(); };
window.hideMail = function (id) { state.mailHide[id] = true; save(); renderMail(); renderHome(); };
window.addExtra = function () {
  const day = todayName();
  const v = Number(($("extraKcal") || {}).value || 0);
  if (!v) return;
  state.extra[day] = Number(state.extra[day] || 0) + v;
  save();
  renderAll();
};
function dayChart() {
  const goal = person().kcal;
  return `<div class="bars">${ORDER.map((d, i) => {
    const e = eatenOf(d);
    const h = Math.max(6, Math.round((e.k / Math.max(goal, 1)) * 90));
    return `<div class="col"><i><em style="height:${Math.min(90, h)}px"></em></i><s>${SHORT[i]}</s></div>`;
  }).join("")}</div>`;
}
function renderHome() {
  if (!window.DOMA) { $("home").innerHTML = "<div class='card'><p>Откройте ?v=5</p></div>"; return; }
  const day = todayName();
  const per = person();
  const e = eatenOf(day);
  const kPct = Math.round((e.k / per.kcal) * 100);
  const pPct = Math.round((e.p / per.p) * 100);
  const left = Math.max(0, per.kcal - e.k);
  const segs = 24;
  const on = Math.round(Math.min(segs, (e.k / per.kcal) * segs));
  const meals = (DOMA.meals || []).map((m, i) => ({ m, i })).filter((x) => x.m.d === day);
  const mail = (DOMA.mail || []).filter((m) => !state.mailHide[m.id]).slice(0, 3);
  const now = new Date();
  $("dateTitle").textContent = "Сегодня, " + now.getDate() + " сентября";
  $("whoPill").textContent = state.who === "wife" ? "Ж" : "Я";
  $("clockChip").textContent = String(now.getHours()).padStart(2,"0") + ":" + String(now.getMinutes()).padStart(2,"0") + " · Praha";
  $("home").innerHTML = `
    <div class="card">
      <div class="rings">
        <div class="ring-wrap">${ringSvg(kPct, "#f0b429")}<b>${kPct}%</b><span>Ккал</span></div>
        <div class="ring-wrap">${ringSvg(pPct, "#3dcc7a")}<b>${pPct}%</b><span>Белок</span></div>
        <div class="ring-wrap">${ringSvg(Math.round((left / per.kcal) * 100), "#6b7cff")}<b>${left}</b><span>Осталось</span></div>
      </div>
      <p class="coach" style="margin-top:18px">${e.k < per.kcal * 0.4 ? "Отметьте съеденное или впишите ккал вручную." : e.k > per.kcal ? "Сегодня выше цели." : "Отмечайте блюда — кольца обновятся."}</p>
    </div>
    <div class="card">
      <div class="title">Потрачено / цель</div>
      <div class="meter"><div class="seg">${Array.from({length: segs}, (_,i)=>`<b class="${i<on?"on":""}"></b>`).join("")}</div><span>${e.k} / ${per.kcal}</span></div>
      <p class="hint">Галочки: ${e.k - e.extra} · вручную: ${e.extra} · белок ${e.p} / ${per.p} г</p>
      <div class="field"><input id="extraKcal" type="number" inputmode="numeric" placeholder="Добавить ккал"><button onclick="addExtra()">+</button></div>
    </div>
    <div class="card"><div class="title">Ккал по дням</div>${dayChart()}<p class="hint">Столбик — съеденное к цели ${per.kcal}.</p></div>
    <div class="card"><div class="title">Сегодня · ${day}</div>${meals.map(({m,i}) => {
      const x = portion(m); const key = mealKey(m, i); const chk = !!state.meals[key];
      return `<div class="meal ${chk?"done":""}"><input type="checkbox" ${chk?"checked":""} onchange="toggleMeal('${key}')"><div><b>${m.m} · ${m.title}</b><small>${x.text || ""}</small><div class="macros"><i>${x.k} ккал</i><i>Б ${x.p}</i></div></div><div class="kcal">${x.k}</div></div>`;
    }).join("")}</div>
    <div class="card"><div class="title">Почта</div>${mail.map((m) => `<div class="mail-row"><input type="checkbox" onchange="hideMail('${m.id}')"><div><b>${m.subject}</b><small>${m.from} · ${m.date}</small></div><a class="kcal" href="${m.link}" target="_blank">открыть</a></div>`).join("") || "<p class='hint'>Нет писем</p>"}</div>`;
}
function renderMenu() {
  const days = [...new Set((DOMA.meals || []).map((m) => m.d))];
  $("menu").innerHTML = days.map((d) => {
    const list = (DOMA.meals || []).map((m, i) => ({ m, i })).filter((x) => x.m.d === d);
    const e = eatenOf(d);
    return `<div class="card"><div class="title">${d}</div><p class="hint">Съедено ${e.k} ккал</p>${list.map(({m,i}) => {
      const x = portion(m); const key = mealKey(m, i); const chk = !!state.meals[key];
      return `<div class="meal ${chk?"done":""}"><input type="checkbox" ${chk?"checked":""} onchange="toggleMeal('${key}')"><div><b>${m.m} · ${m.title}</b><small>${x.k} ккал</small></div><div class="kcal">${x.k}</div></div>`;
    }).join("")}</div>`;
  }).join("");
}
function renderShop() {
  $("shop").innerHTML = `<div class="card"><div class="title">Закупки · ${DOMA.basket} / ${DOMA.budget} Kč</div>${(DOMA.shop||[]).map((s,i)=>`<div class="shop-item ${state.shop[i]?"got":""}"><input type="checkbox" ${state.shop[i]?"checked":""} onchange="toggleShop(${i})"><div><b>${s.name}</b><small>${s.qty} ${s.unit}</small></div><div class="kcal">${Math.round(s.qty*s.price)}</div></div>`).join("")}</div>`;
}
function renderGym() {
  $("gym").innerHTML = (DOMA.workouts || []).map((w, wi) => w.rest ? `<div class="card"><div class="title">${w.day}</div><p>${w.title}</p></div>` : `<div class="card"><div class="title">${w.day} · ${w.title}</div>${(w.ex||[]).map((e,ei)=>`<div class="ex"><input type="checkbox" ${state.ex[wi+":"+ei]?"checked":""} onchange="toggleEx('${wi}:${ei}')"><div><b>${e.n}</b><span>${e.s} × ${e.r} · ${e.w}</span></div></div>`).join("")}</div>`).join("");
}
function renderMail() {
  const mail = (DOMA.mail || []).filter((m) => !state.mailHide[m.id]);
  $("mail").innerHTML = `<div class="card"><div class="title">Важные письма</div><p class="hint">Галочка скрывает. Ссылка открывает Gmail.</p>${mail.map((m) => `<div class="mail-row"><input type="checkbox" onchange="hideMail('${m.id}')"><div><b>${m.subject}</b><small>${m.from} · ${m.date}</small></div><a class="kcal" href="${m.link}" target="_blank">Gmail</a></div>`).join("") || "<p class='hint'>Пусто</p>"}</div>`;
}
function renderAll() {
  try { renderHome(); renderMenu(); renderShop(); renderGym(); renderMail(); }
  catch (err) { $("home").innerHTML = "<div class='card'><p>"+err+"</p></div>"; }
}
mountIcons(); renderAll(); go("home");
if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js?v=5").catch(() => {});
