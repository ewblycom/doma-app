const DAYS = ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
const STORE = "doma-state-v2";
const state = JSON.parse(localStorage.getItem(STORE) || "{}");
if (!state.who) state.who = "me";
if (!state.meals) state.meals = {};
if (!state.shop) state.shop = {};
if (!state.ex) state.ex = {};
function save(){ localStorage.setItem(STORE, JSON.stringify(state)); }
const $ = (id) => document.getElementById(id);
function todayName(){ return DAYS[new Date().getDay()]; }
function portion(m){
  const w = state.who === "wife";
  return { text: w ? m.we : m.me, k: w ? m.wk : m.mk, p: w ? m.wp : m.mp, f: w ? m.wf : m.mf, c: w ? m.wc : m.mc };
}
window.setWho = function(who){
  state.who = who; save();
  document.querySelectorAll(".who button").forEach((b)=>b.classList.toggle("on", b.dataset.who===who));
  renderAll();
};
window.go = function(page){
  document.querySelectorAll(".page").forEach((p)=>p.classList.toggle("on", p.id===page));
  document.querySelectorAll(".dock button, .rail-nav button").forEach((b)=>b.classList.toggle("on", b.dataset.page===page));
  window.scrollTo(0,0);
};
window.toggleMeal = function(key){ state.meals[key]=!state.meals[key]; save(); renderAll(); };
window.toggleShop = function(i){ state.shop[i]=!state.shop[i]; save(); renderShop(); renderHome(); };
window.toggleEx = function(key){ state.ex[key]=!state.ex[key]; save(); renderGym(); };
function mealCard(m,i){
  const p = portion(m);
  const key = m.d+"|"+m.m+"|"+i;
  const done = !!state.meals[key];
  return `<article class="meal ${done?"done":""}"><div class="tag">${m.m}</div><h3>${m.title}</h3><div class="portion">${p.text||""}</div><div class="macros"><i>${p.k} ккал</i><i>Б ${p.p}</i><i>Ж ${p.f}</i><i>У ${p.c}</i></div><div class="how">${m.how||""}</div><label class="check"><input type="checkbox" ${done?"checked":""} onchange="toggleMeal('${key}')"> Съедено</label></article>`;
}
function dayTotals(day){
  return (DOMA.meals||[]).filter((m)=>m.d===day).reduce((a,m)=>{ const p=portion(m); a.k+=p.k||0; a.p+=p.p||0; a.f+=p.f||0; a.c+=p.c||0; return a; },{k:0,p:0,f:0,c:0});
}
function renderHome(){
  if (!window.DOMA){ $("home").innerHTML="<div class='card'><p>Нет data.js. Откройте https://ewblycom.github.io/doma-app/?v=4</p></div>"; return; }
  const day = todayName();
  const person = DOMA.people[state.who];
  const tot = dayTotals(day);
  const meals = DOMA.meals.filter((m)=>m.d===day);
  const bought = (DOMA.shop||[]).filter((_,i)=>state.shop[i]).length;
  const wo = (DOMA.workouts||[]).find((w)=>w.day===day);
  if ($("helloTitle")) $("helloTitle").textContent = "Привет";
  if ($("helloSub")) $("helloSub").textContent = (state.who==="wife"?"Порции жены":"Твои порции")+" · "+day;
  $("home").innerHTML = `
    <div class="kpis">
      <div class="kpi"><b>${tot.k}</b><span>ккал · цель ${person.kcal}</span></div>
      <div class="kpi"><b>${tot.p} г</b><span>белок · цель ${person.p} г</span></div>
      <div class="kpi"><b>${bought}/${(DOMA.shop||[]).length}</b><span>куплено</span></div>
      <div class="kpi"><b>${DOMA.basket} Kč</b><span>из ${DOMA.budget} Kč</span></div>
    </div>
    <div class="card"><h2>Сегодня · ${day}</h2>${meals.map((m,i)=>mealCard(m, DOMA.meals.indexOf(m))).join("")}</div>
    <div class="card"><h2>Зал</h2><p>${wo ? wo.title : "—"}</p>${wo && !wo.rest ? `<button class="chip on" onclick="go('gym')">Открыть</button>`:""}</div>
    <div class="card"><h2>Почта</h2>${(DOMA.mail||[]).map(m=>`<p><a href="${m.link}" target="_blank">${m.subject}</a></p>`).join("")||"<p class='hint'>Пусто</p>"}</div>`;
}
function renderMenu(){
  const days = [...new Set((DOMA.meals||[]).map(m=>m.d))];
  $("menu").innerHTML = days.map(d=>{
    const tot = dayTotals(d);
    return `<div class="card"><h2>${d}</h2><div class="macros"><i>${tot.k} ккал</i><i>Б ${tot.p}</i></div>${DOMA.meals.filter(m=>m.d===d).map(m=>mealCard(m, DOMA.meals.indexOf(m))).join("")}</div>`;
  }).join("");
}
function renderShop(){
  $("shop").innerHTML = (DOMA.shop||[]).map((s,i)=>`<div class="shop-item ${state.shop[i]?"got":""}"><input type="checkbox" ${state.shop[i]?"checked":""} onchange="toggleShop(${i})"><div><b>${s.name}</b><small>${s.qty} ${s.unit} · ${s.store}</small></div><div class="sum">${Math.round(s.qty*s.price)} Kč</div></div>`).join("");
}
function renderGym(){
  $("gym").innerHTML = (DOMA.workouts||[]).map((w,wi)=>{
    if (w.rest) return `<div class="card rest"><h2>${w.day}</h2><p>${w.title}</p></div>`;
    return `<div class="card"><h2>${w.day} · ${w.title}</h2>${(w.ex||[]).map((e,ei)=>`<div class="ex"><input type="checkbox" ${state.ex[wi+":"+ei]?"checked":""} onchange="toggleEx('${wi}:${ei}')"><div><b>${e.n}</b><span>${e.s} × ${e.r} · ${e.w}</span></div></div>`).join("")}</div>`;
  }).join("");
}
function renderMore(){
  $("more").innerHTML = `<div class="install"><b>Обновите страницу:</b> откройте <a href="https://ewblycom.github.io/doma-app/?v=4">ewblycom.github.io/doma-app/?v=4</a></div><div class="card"><h2>Нормы</h2><p>Я 2000 / Б 160 · Жена 1600 / Б 140</p></div>`;
}
function renderAll(){
  try {
    renderHome(); renderMenu(); renderShop(); renderGym(); renderMore();
  } catch(e) {
    if ($("home")) $("home").innerHTML = "<div class='card'><h2>Ошибка</h2><p>"+e+"</p></div>";
  }
}
renderAll(); go("home");
