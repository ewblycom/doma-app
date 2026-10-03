const DAYS=["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
const SHORT=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const ORDER=["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"];
const MONTHS=["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"];
const STORE="doma-bevel-v2";
function isoToday(){
  const d=new Date();
  return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
}
function isoOf(d){
  return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
}
function uid(){ return "id-"+Date.now().toString(36); }
function esc(s){ return String(s||"").split('"').join(""); }
const state=JSON.parse(localStorage.getItem(STORE)||localStorage.getItem("doma-bevel-v1")||"{}");
if(!state.who) state.who="me";
if(!state.meals) state.meals={};
if(!state.shop) state.shop={};
if(!state.ex) state.ex={};
if(!state.extra) state.extra={};
if(!state.mailHide) state.mailHide={};
if(!state.openMeal) state.openMeal={};
if(!state.events) state.events=[];
if(!state.reminders) state.reminders=[{id:"r1",date:isoToday(),time:"12:00",title:"Вода и творог",prio:"mid",done:false}];
if(!state.picked) state.picked={};
if(!state.cal){
  const n=new Date();
  state.cal={y:n.getFullYear(),m:n.getMonth(),sel:isoToday()};
}
if(!state.fin){
  state.fin={
    txs:[],
    rec:[],
    accounts:[
      {id:"joint",name:"Совместный",kind:"joint",balance:0},
      {id:"save",name:"Накопительный",kind:"save",balance:0},
      {id:"pillow",name:"Подушка",kind:"pillow",balance:0}
    ],
    plans:[
      {cat:"продукты",limit:3000},
      {cat:"жильё",limit:0},
      {cat:"транспорт",limit:0},
      {cat:"подписки",limit:0},
      {cat:"другое",limit:0}
    ],
    debts:[],
    from:isoToday().slice(0,8)+"01",
    to:isoToday()
  };
}
function save(){ localStorage.setItem(STORE, JSON.stringify(state)); }
const $=id=>document.getElementById(id);
function todayName(){ return DAYS[new Date().getDay()]; }
function portion(m){
  const w=state.who==="wife";
  return {text:w?m.we:m.me,k:w?m.wk:m.mk,p:w?m.wp:m.mp,f:w?m.wf:m.mf,c:w?m.wc:m.mc};
}
function mealKey(m,i){ return m.d+"|"+m.m+"|"+i; }
function person(){ return DOMA.people[state.who]; }
if(!state.customMeals) state.customMeals=[];
function eatenOf(day){
  let k=0,p=0,f=0,c=0;
  (DOMA.meals||[]).forEach((m,i)=>{
    if(m.d!==day||!state.meals[mealKey(m,i)]) return;
    const x=portion(m); k+=x.k||0; p+=x.p||0; f+=x.f||0; c+=x.c||0;
  });
  (state.customMeals||[]).forEach(m=>{
    if(m.d!==day||!state.meals["c|"+m.id]) return;
    if(m.own&&m.own!=="shared"&&m.own!==state.who) return;
    k+=Number(m.k||0); p+=Number(m.p||0); f+=Number(m.f||0); c+=Number(m.c||0);
  });
  k+=Number(state.extra[day]||0);
  return {k,p,f,c,extra:Number(state.extra[day]||0)};
}
function ringSvg(pct,color){
  const p=Math.max(0,Math.min(100,pct));
  const c=2*Math.PI*28;
  return '<svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="28" fill="none" stroke="#eceef2" stroke-width="7"/><circle cx="36" cy="36" r="28" fill="none" stroke="'+color+'" stroke-width="7" stroke-linecap="round" stroke-dasharray="'+(p/100)*c+' '+c+'" transform="rotate(-90 36 36)"/></svg>';
}
const ICO={
  home:'<svg class="ic" viewBox="0 0 24 24"><path d="M4 10.5 12 4l8 6.5V20H4z"/></svg>',
  book:'<svg class="ic" viewBox="0 0 24 24"><path d="M6 5h11a2 2 0 0 1 2 2v12H8a2 2 0 0 0-2 2V5z"/></svg>',
  run:'<svg class="ic" viewBox="0 0 24 24"><circle cx="14" cy="5" r="2"/><path d="M6 20l3-5 3 2 3-6"/></svg>',
  mail:'<svg class="ic" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/></svg>',
  cash:'<svg class="ic" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M12 10v4M8 12h8"/></svg>'
};
function mountIcons(){
  document.querySelectorAll(".tab-pill .ico").forEach(el=>{ el.innerHTML=ICO[el.dataset.ic]||""; });
}
window.cycleWho=function(){ state.who=state.who==="me"?"wife":"me"; save(); renderAll(); };
window.go=function(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.toggle("on", p.id===page));
  document.querySelectorAll(".tab-pill button").forEach(b=>b.classList.toggle("on", b.dataset.page===page));
  window.scrollTo(0,0);
};
window.toggleMeal=function(key){ state.meals[key]=!state.meals[key]; save(); renderAll(); };
window.toggleIng=function(key){ state.openMeal[key]=!state.openMeal[key]; save(); renderHome(); };
window.toggleShop=function(i){ state.shop[i]=!state.shop[i]; save(); renderShop(); };
window.toggleEx=function(key){ state.ex[key]=!state.ex[key]; save(); renderGym(); };
window.hideMail=function(id){ state.mailHide[id]=true; save(); renderHome(); };
window.addExtra=function(){
  const day=todayName();
  const v=Number(($("extraKcal")||{}).value||0);
  if(!v) return;
  state.extra[day]=Number(state.extra[day]||0)+v;
  save(); renderAll();
};
function parcelPicked(id){
  if(state.picked[id]===true) return true;
  if(state.picked[id]===false) return false;
  const p=(DOMA.parcels||[]).find(x=>x.id===id);
  return !!(p&&p.picked);
}
window.togglePick=function(id){ state.picked[id]=!parcelPicked(id); save(); renderHome(); };
window.closeSheet=function(){ $("sheet").hidden=true; };
function openSheet(title,html){
  $("sheetTitle").textContent=title;
  $("sheetBody").innerHTML=html;
  $("sheet").hidden=false;
}
window.shiftMonth=function(d){
  state.cal.m+=d;
  if(state.cal.m<0){ state.cal.m=11; state.cal.y--; }
  if(state.cal.m>11){ state.cal.m=0; state.cal.y++; }
  save(); renderHome();
};
window.pickDay=function(iso){ state.cal.sel=iso; save(); renderHome(); };
function eventsOn(iso){ return (state.events||[]).filter(e=>e.date===iso); }
function prioLabel(p){ return p==="hi"?"высокий":p==="lo"?"низкий":"средний"; }
window.editEvent=function(id){
  const e=id?state.events.find(x=>x.id===id):{date:state.cal.sel,time:"10:00",title:"",note:""};
  openSheet(id?"Мероприятие":"Новое мероприятие",
    '<label class="fl">Название <input id="fTitle" value="'+esc(e.title)+'"></label>'+
    '<label class="fl">Дата <input id="fDate" type="date" value="'+(e.date||state.cal.sel)+'"></label>'+
    '<label class="fl">Время <input id="fTime" type="time" value="'+(e.time||"10:00")+'"></label>'+
    '<label class="fl">Заметка <input id="fNote" value="'+esc(e.note||"")+'"></label>'+
    '<div class="row-btns"><button class="on" onclick="saveEvent(\''+(id||"")+'\')">Сохранить</button>'+
    (id?'<button class="danger" onclick="delEvent(\''+id+'\')">Удалить</button>':'')+'</div>');
};
window.saveEvent=function(id){
  const item={id:id||uid(),title:$("fTitle").value.trim()||"Событие",date:$("fDate").value,time:$("fTime").value,note:$("fNote").value.trim()};
  const i=state.events.findIndex(x=>x.id===item.id);
  if(i>=0) state.events[i]=item; else state.events.push(item);
  save(); closeSheet(); renderHome();
};
window.delEvent=function(id){ state.events=state.events.filter(x=>x.id!==id); save(); closeSheet(); renderHome(); };
window.editRem=function(id){
  const r=id?state.reminders.find(x=>x.id===id):{date:state.cal.sel,time:"09:00",title:"",prio:"mid"};
  openSheet("Напоминание",
    '<p class="hint">Видят и правят оба на этом устройстве.</p>'+
    '<label class="fl">Текст <input id="fTitle" value="'+esc(r.title)+'"></label>'+
    '<label class="fl">Дата <input id="fDate" type="date" value="'+(r.date||state.cal.sel)+'"></label>'+
    '<label class="fl">Время <input id="fTime" type="time" value="'+(r.time||"09:00")+'"></label>'+
    '<label class="fl">Приоритет <select id="fPrio">'+
    '<option value="hi"'+(r.prio==="hi"?" selected":"")+'>высокий</option>'+
    '<option value="mid"'+(r.prio==="mid"?" selected":"")+'>средний</option>'+
    '<option value="lo"'+(r.prio==="lo"?" selected":"")+'>низкий</option></select></label>'+
    '<div class="row-btns"><button class="on" onclick="saveRem(\''+(id||"")+'\')">Сохранить</button>'+
    (id?'<button class="danger" onclick="delRem(\''+id+'\')">Удалить</button>':'')+'</div>');
};
window.saveRem=function(id){
  const item={id:id||uid(),title:$("fTitle").value.trim()||"Напоминание",date:$("fDate").value,time:$("fTime").value,prio:$("fPrio").value,done:false};
  const i=state.reminders.findIndex(x=>x.id===item.id);
  if(i>=0) state.reminders[i]=Object.assign({},state.reminders[i],item); else state.reminders.push(item);
  save(); closeSheet(); renderHome();
};
window.delRem=function(id){ state.reminders=state.reminders.filter(x=>x.id!==id); save(); closeSheet(); renderHome(); };
window.toggleRem=function(id){ const r=state.reminders.find(x=>x.id===id); if(r) r.done=!r.done; save(); renderHome(); };
function renderCal(){
  const y=state.cal.y,m=state.cal.m,sel=state.cal.sel;
  const first=new Date(y,m,1);
  const start=(first.getDay()+6)%7;
  const dim=new Date(y,m+1,0).getDate();
  const prev=new Date(y,m,0).getDate();
  let cells=SHORT.map(d=>'<div class="wd">'+d+'</div>').join("");
  for(let i=0;i<42;i++){
    let day,iso,mute=false;
    if(i<start){ day=prev-start+i+1; iso=isoOf(new Date(m===0?y-1:y,m===0?11:m-1,day)); mute=true; }
    else if(i>=start+dim){ day=i-start-dim+1; iso=isoOf(new Date(m===11?y+1:y,m===11?0:m+1,day)); mute=true; }
    else { day=i-start+1; iso=isoOf(new Date(y,m,day)); }
    const has=eventsOn(iso).length+(state.reminders||[]).filter(r=>r.date===iso).length>0;
    cells+='<button class="cal-day '+(mute?"mute":"")+(iso===sel?" on":"")+'" onclick="pickDay(\''+iso+'\')">'+day+(has?"<i class='dot'></i>":"")+"</button>";
  }
  return '<div class="cal-nav"><button class="icon-btn" onclick="shiftMonth(-1)">‹</button><b>'+MONTHS[m]+" "+y+'</b><button class="icon-btn" onclick="shiftMonth(1)">›</button></div><div class="cal-grid">'+cells+"</div>";
}
function dayChart(){
  const goal=person().kcal;
  return '<div class="bars">'+ORDER.map((d,i)=>{
    const e=eatenOf(d);
    const h=Math.max(6,Math.round((e.k/Math.max(goal,1))*90));
    return '<div class="col"><i><em style="height:'+Math.min(90,h)+'px"></em></i><s>'+SHORT[i]+"</s></div>";
  }).join("")+"</div>";
}
function renderHome(){
  if(!window.DOMA){ $("home").innerHTML="<div class='card'><p>Нет данных</p></div>"; return; }
  const day=todayName();
  const per=person();
  const e=eatenOf(day);
  const kPct=Math.round((e.k/per.kcal)*100);
  const pPct=Math.round((e.p/per.p)*100);
  const left=Math.max(0,per.kcal-e.k);
  const segs=24;
  const onN=Math.round(Math.min(segs,(e.k/per.kcal)*segs));
  const meals=(DOMA.meals||[]).map((m,i)=>({m,i})).filter(x=>x.m.d===day);
  const iso=state.cal.sel;
  const evs=eventsOn(iso);
  const parcels=DOMA.parcels||[];
  const mail=(DOMA.mail||[]).filter(m=>!state.mailHide[m.id]);
  const now=new Date();
  if($("whoPill")) $("whoPill").textContent=state.who==="wife"?"Ж":"Я";
  let evHtml=evs.map(ev=>'<div class="mail-row"><div class="kcal">'+(ev.time||"—")+'</div><div><b>'+ev.title+'</b><small>'+(ev.note||"")+'</small></div><button class="prio mid" onclick="editEvent(\''+ev.id+'\')">изм.</button></div>').join("");
  if(!evHtml) evHtml='<p class="hint">На '+iso+" мероприятий нет.</p>";
  let remHtml=(state.reminders||[]).map(r=>'<div class="mail-row"><input type="checkbox" '+(r.done?"checked":"")+' onchange="toggleRem(\''+r.id+'\')"><div><b>'+r.title+"</b><small>"+r.date+" · "+(r.time||"")+'</small></div><button class="prio '+(r.prio||"mid")+'" onclick="editRem(\''+r.id+'\')">'+prioLabel(r.prio)+"</button></div>").join("");
  let mealHtml=meals.map(({m,i})=>{
    const x=portion(m); const key=mealKey(m,i); const chk=!!state.meals[key]; const open=!!state.openMeal[key];
    return '<div class="meal"><input type="checkbox" '+(chk?"checked":"")+' onchange="toggleMeal(\''+key+'\')"><div><b class="tap" onclick="toggleIng(\''+key+'\')">'+m.m+" · "+m.title+'</b><small>'+(x.text||"")+'</small><div class="ing '+(open?"on":"")+'">'+(m.how||"")+(m.src?" · "+m.src:"")+'</div></div><div class="kcal">'+x.k+"</div></div>";
  }).join("");
  let parHtml=parcels.map(p=>{
    const ok=parcelPicked(p.id);
    return '<div class="parcel"><div class="lab">'+p.kind+"</div><b>"+p.title+'</b><p class="hint">Код: '+p.code+"<br>Адрес: "+p.address+"<br>До "+p.until+'</p><label><input type="checkbox" '+(ok?"checked":"")+' onchange="togglePick(\''+p.id+'\')"> '+(ok?"забрал":"ещё не забрал")+'</label><p><a href="'+p.link+'" target="_blank">открыть заказ</a></p></div>';
  }).join("");
  let mailHtml=mail.map(m=>'<div class="mail-row"><input type="checkbox" onchange="hideMail(\''+m.id+'\')"><div><b>'+m.subject+"</b><small>"+m.from+'</small></div><a href="'+m.link+'" target="_blank">Gmail</a></div>').join("");
  let segsHtml="";
  for(let i=0;i<segs;i++) segsHtml+='<b class="'+(i<onN?"on":"")+'"></b>';
  $("home").innerHTML=
    (typeof mcfBanner==="function"?mcfBanner():"")+
    '<div class="card"><div class="title" style="display:flex;justify-content:space-between">Календарь <button class="icon-btn" onclick="editEvent(\'\')">+</button></div>'+renderCal()+evHtml+"</div>"+
    '<div class="card"><div class="title" style="display:flex;justify-content:space-between">Напоминания · оба <button class="icon-btn" onclick="editRem(\'\')">+</button></div><p class="hint">Общий список на этом устройстве.</p>'+remHtml+"</div>"+
    '<div class="card"><div class="rings"><div class="ring-wrap">'+ringSvg(kPct,"#f0b429")+"<b>"+kPct+'%</b><span>Ккал</span></div><div class="ring-wrap">'+ringSvg(pPct,"#3dcc7a")+"<b>"+pPct+'%</b><span>Белок</span></div><div class="ring-wrap">'+ringSvg(Math.round((left/per.kcal)*100),"#6b7cff")+"<b>"+left+'</b><span>Осталось</span></div></div></div>'+
    '<div class="card"><div class="title">Съедено / Всего</div><div class="meter"><div class="seg">'+segsHtml+"</div><span>"+e.k+" / "+per.kcal+'</span></div><div class="field"><input id="extraKcal" type="number" placeholder="Ккал"><button onclick="addExtra()">+</button></div></div>'+
    '<div class="card"><div class="title">Ккал по дням</div>'+dayChart()+"</div>"+
    '<div class="card"><div class="title">Меню недели</div><p class="hint">'+(DOMA.week||"")+' · корзина ~'+(DOMA.basket||"—")+' Kč + McD ~360. Пт ужин дома не готовим.</p></div>'+
    '<div class="card"><div class="title">Сегодня · '+day+'</div>'+mealHtml+"</div>"+
    '<div class="card"><div class="title">Почта · посылки</div>'+parHtml+mailHtml+"</div>";
}
window.toggleCustom=function(id){ state.meals["c|"+id]=!state.meals["c|"+id]; save(); renderAll(); };
window.editCustom=function(id,day){
  const m=id?(state.customMeals||[]).find(x=>x.id===id):{d:day||todayName(),m:"Обед",title:"",k:"",p:"",f:"",c:"",text:"",how:"",own:state.who};
  openSheet(id?"Своё блюдо":"Добавить блюдо",
    '<label class="fl">Название <input id="fTitle" value="'+esc(m.title||"")+'"></label>'+
    '<label class="fl">День <select id="fDay">'+ORDER.map(d=>'<option'+(m.d===d?" selected":"")+">"+d+"</option>").join("")+"</select></label>"+
    '<label class="fl">Приём <select id="fSlot"><option'+(m.m==="Завтрак"?" selected":"")+'>Завтрак</option><option'+(m.m==="Обед"?" selected":"")+'>Обед</option><option'+(m.m==="Перекус"?" selected":"")+'>Перекус</option><option'+(m.m==="Ужин"?" selected":"")+'>Ужин</option></select></label>'+
    '<label class="fl">Ккал <input id="fK" type="number" value="'+(m.k||"")+'"></label>'+
    '<label class="fl">Белок г <input id="fP" type="number" value="'+(m.p||"")+'"></label>'+
    '<label class="fl">Жиры г <input id="fF" type="number" value="'+(m.f||"")+'"></label>'+
    '<label class="fl">Углеводы г <input id="fC" type="number" value="'+(m.c||"")+'"></label>'+
    '<label class="fl">Ингредиенты <input id="fText" value="'+esc(m.text||"")+'"></label>'+
    '<label class="fl">Короткий рецепт <input id="fHow" value="'+esc(m.how||"")+'"></label>'+
    '<div class="row-btns"><button class="on" onclick="saveCustom(\''+(id||"")+'\')">Сохранить</button>'+(id?'<button class="danger" onclick="delCustom(\''+id+'\')">Удалить</button>':'')+"</div>");
};
window.saveCustom=function(id){
  const item={id:id||uid(),d:$("fDay").value,m:$("fSlot").value,title:$("fTitle").value.trim()||"Блюдо",k:Number($("fK").value||0),p:Number($("fP").value||0),f:Number($("fF").value||0),c:Number($("fC").value||0),text:$("fText").value.trim(),how:$("fHow").value.trim(),own:state.who};
  const i=(state.customMeals||[]).findIndex(x=>x.id===item.id);
  if(i>=0) state.customMeals[i]=item; else { if(!state.customMeals) state.customMeals=[]; state.customMeals.push(item); state.meals["c|"+item.id]=true; }
  save(); closeSheet(); renderAll();
};
window.delCustom=function(id){
  state.customMeals=(state.customMeals||[]).filter(x=>x.id!==id);
  delete state.meals["c|"+id];
  save(); closeSheet(); renderAll();
};
function mealBlock(m,i,custom){
  const x=custom?{text:m.text,k:m.k,p:m.p,f:m.f,c:m.c}:{...portion(m)};
  const key=custom?("c|"+m.id):mealKey(m,i);
  const chk=!!state.meals[key];
  const open=!!state.openMeal[key];
  const tog=custom?("toggleCustom(\'"+m.id+"\')"):("toggleMeal(\'"+key+"\')");
  const rec=(custom?(m.how||""):(m.how||""))+(x.text?((custom&&m.how?" · ":"")+x.text):"");
  return '<div class="meal '+(chk?"done":"")+'"><input type="checkbox" '+(chk?"checked":"")+" onchange=\""+tog+"\"><div><b class=\"tap\" onclick=\"toggleIng(\'"+key+"\')\">"+m.m+" · "+m.title+'</b><div class="macros"><i>'+x.k+' ккал</i><i>Б '+x.p+'</i><i>Ж '+x.f+'</i><i>У '+x.c+'</i></div><div class="ing '+(open?"on":"")+'">'+(rec||"нет рецепта")+(custom?' <button class="prio mid" onclick="editCustom(\''+m.id+'\')">изм.</button>':"")+"</div></div><div class=\"kcal\">"+x.k+"</div></div>";
}
function renderMenu(){
  const box=$("menu"); if(!box) return;
  const per=person();
  const e=eatenOf(todayName());
  const rings=
    '<div class="card span"><div class="title">Сегодня · '+todayName()+' · '+(state.who==="wife"?"Жена":"Я")+'</div><div class="rings rings4">'+
    '<div class="ring-wrap">'+ringSvg(Math.round((e.k/per.kcal)*100),"#f0b429")+"<b>"+Math.round((e.k/per.kcal)*100)+'%</b><span>Ккал '+e.k+"/"+per.kcal+"</span></div>"+
    '<div class="ring-wrap">'+ringSvg(Math.round((e.p/per.p)*100),"#3dcc7a")+"<b>"+Math.round((e.p/per.p)*100)+'%</b><span>Белок '+e.p+"/"+per.p+"</span></div>"+
    '<div class="ring-wrap">'+ringSvg(Math.round((e.f/per.f)*100),"#f07a3a")+"<b>"+Math.round((e.f/per.f)*100)+'%</b><span>Жиры '+Math.round(e.f)+"/"+per.f+"</span></div>"+
    '<div class="ring-wrap">'+ringSvg(Math.round((e.c/per.c)*100),"#6b7cff")+"<b>"+Math.round((e.c/per.c)*100)+'%</b><span>Углеводы '+Math.round(e.c)+"/"+per.c+"</span></div></div></div>";
  const days=ORDER.map(d=>{
    const list=(DOMA.meals||[]).map((m,i)=>({m,i})).filter(x=>x.m.d===d);
    const extra=(state.customMeals||[]).filter(m=>m.d===d&&(!m.own||m.own==="shared"||m.own===state.who));
    const meals=list.map(({m,i})=>mealBlock(m,i,false)).join("")+extra.map(m=>mealBlock(m,0,true)).join("");
    return '<div class="card day-card"><div class="title" style="display:flex;justify-content:space-between">'+d+' <button class="icon-btn" onclick="editCustom(\'\',\''+d+'\')">+</button></div>'+(meals||"<p class='hint'>Нет блюд</p>")+"</div>";
  }).join("");
  box.innerHTML=rings+days;
}
function renderShop(){
  const list=DOMA.shop||[];
  const sum=list.reduce(function(a,s){return a+(Number(s.price)||0)*(Number(s.qty)||0);},0);
  $("shop").innerHTML='<div class="card"><div class="title">Закупки · '+(DOMA.week||"")+'</div><p class="hint">Корзина ~'+Math.round(sum)+' Kč из '+(DOMA.budget||3000)+' Kč. Пятничный ужин McD отдельно ~360 Kč на двоих, в список продуктов не входит.</p>'+list.map((s,i)=>{
    const line=Math.round((Number(s.price)||0)*(Number(s.qty)||0));
    return '<div class="shop-item"><input type="checkbox" '+(state.shop[i]?"checked":"")+" onchange=\"toggleShop("+i+")\"><div><b>"+s.name+"</b><small>"+(s.qty||"")+" "+(s.unit||"")+" · "+s.price+" Kč · "+line+" Kč · "+(s.store||"")+(s.lasts?" · "+s.lasts:"")+"</small></div></div>";
  }).join("")+"</div>";
}
function renderGym(){
  $("gym").innerHTML=(DOMA.workouts||[]).map((w,wi)=>'<div class="card"><div class="title">'+w.day+" · "+w.title+"</div>"+(w.ex||[]).map((e,ei)=>'<div class="ex"><input type="checkbox" onchange="toggleEx(\''+wi+":"+ei+'\')"><div><b>'+e.n+"</b></div></div>").join("")+"</div>").join("");
}
const FIN_CATS=["продукты","жильё","транспорт","здоровье","зал","подписки","кафе","зарплата","другое"];
function kc(n){ return Math.round(Number(n)||0).toLocaleString("cs-CZ")+" Kč"; }
function finVisible(t){
  return !t.own || t.own==="shared" || t.own===state.who;
}
function accBy(id){ return (state.fin.accounts||[]).find(a=>a.id===id); }
function applyTx(t,sign){
  const a=accBy(t.acc||"joint");
  if(!a) return;
  const amt=Number(t.amount)||0;
  a.balance += sign * (t.kind==="in"?amt:-amt);
}
function periodTx(){
  const f=state.fin.from, to=state.fin.to;
  return (state.fin.txs||[]).filter(t=>finVisible(t)&&t.date>=f&&t.date<=to);
}
function catSpend(list){
  const m={};
  list.filter(t=>t.kind==="out").forEach(t=>{ m[t.cat]=(m[t.cat]||0)+Number(t.amount||0); });
  return m;
}
function nextBillDate(day){
  const now=new Date();
  let y=now.getFullYear(), m=now.getMonth();
  const d=Math.min(Number(day)||1,28);
  let dt=new Date(y,m,d);
  if(isoOf(dt)<isoToday()) dt=new Date(y,m+1,d);
  return isoOf(dt);
}
window.setFinRange=function(){
  state.fin.from=$("finFrom").value||state.fin.from;
  state.fin.to=$("finTo").value||state.fin.to;
  save(); renderFin();
};
window.editTx=function(id){
  const t=id?(state.fin.txs||[]).find(x=>x.id===id):{kind:"out",amount:"",cat:"продукты",date:isoToday(),note:"",acc:"joint",own:"shared"};
  const accs=(state.fin.accounts||[]).map(a=>'<option value="'+a.id+'"'+(t.acc===a.id?" selected":"")+">"+a.name+"</option>").join("");
  openSheet(id?"Операция":"Доход / расход",
    '<label class="fl">Тип <select id="fKind"><option value="out"'+(t.kind==="out"?" selected":"")+'>расход</option><option value="in"'+(t.kind==="in"?" selected":"")+'>доход</option></select></label>'+
    '<label class="fl">Сумма Kč <input id="fAmt" type="number" value="'+(t.amount||"")+'"></label>'+
    '<label class="fl">Категория <select id="fCat">'+FIN_CATS.map(c=>'<option'+(t.cat===c?" selected":"")+">"+c+"</option>").join("")+"</select></label>"+
    '<label class="fl">Дата <input id="fDate" type="date" value="'+(t.date||isoToday())+'"></label>'+
    '<label class="fl">Счёт <select id="fAcc">'+accs+"</select></label>"+
    '<label class="fl">Чьё <select id="fOwn"><option value="shared"'+(t.own==="shared"?" selected":"")+'>общее</option><option value="me"'+(t.own==="me"?" selected":"")+'>только я</option><option value="wife"'+(t.own==="wife"?" selected":"")+'>только жена</option></select></label>'+
    '<label class="fl">Заметка <input id="fNote" value="'+esc(t.note||"")+'"></label>'+
    '<div class="row-btns"><button class="on" onclick="saveTx(\''+(id||"")+'\')">Сохранить</button>'+(id?'<button class="danger" onclick="delTx(\''+id+'\')">Удалить</button>':'')+"</div>");
};
window.saveTx=function(id){
  const old=id?(state.fin.txs||[]).find(x=>x.id===id):null;
  if(old) applyTx(old,-1);
  const item={id:id||uid(),kind:$("fKind").value,amount:Number($("fAmt").value||0),cat:$("fCat").value,date:$("fDate").value,acc:$("fAcc").value,own:$("fOwn").value,note:$("fNote").value.trim()};
  if(old){ Object.assign(old,item); } else { state.fin.txs.push(item); }
  applyTx(item,1);
  save(); closeSheet(); renderFin();
};
window.delTx=function(id){
  const t=(state.fin.txs||[]).find(x=>x.id===id);
  if(t) applyTx(t,-1);
  state.fin.txs=(state.fin.txs||[]).filter(x=>x.id!==id);
  save(); closeSheet(); renderFin();
};
window.editAcc=function(id){
  const a=id?accBy(id):{name:"",kind:"save",balance:0};
  openSheet(id?"Счёт":"Новый счёт",
    '<label class="fl">Название <input id="fTitle" value="'+esc(a.name||"")+'"></label>'+
    '<label class="fl">Тип <select id="fKind"><option value="joint">совместный</option><option value="save">накопительный</option><option value="pillow">подушка</option><option value="personal">личный</option></select></label>'+
    '<label class="fl">Баланс Kč <input id="fAmt" type="number" value="'+(a.balance||0)+'"></label>'+
    '<div class="row-btns"><button class="on" onclick="saveAcc(\''+(id||"")+'\')">Сохранить</button>'+(id&&a.id!=="joint"?'<button class="danger" onclick="delAcc(\''+id+'\')">Удалить</button>':'')+"</div>");
  if(a.kind) $("fKind").value=a.kind;
};
window.saveAcc=function(id){
  const item={id:id||uid(),name:$("fTitle").value.trim()||"Счёт",kind:$("fKind").value,balance:Number($("fAmt").value||0)};
  const i=(state.fin.accounts||[]).findIndex(x=>x.id===item.id);
  if(i>=0) state.fin.accounts[i]=item; else state.fin.accounts.push(item);
  save(); closeSheet(); renderFin();
};
window.delAcc=function(id){
  state.fin.accounts=state.fin.accounts.filter(a=>a.id!==id);
  save(); closeSheet(); renderFin();
};
window.editPlan=function(){
  const rows=(state.fin.plans||[]).map((p,i)=>'<label class="fl">'+p.cat+' <input id="pl'+i+'" type="number" value="'+(p.limit||0)+'"></label>').join("");
  openSheet("План трат на месяц", rows+'<div class="row-btns"><button class="on" onclick="savePlans()">Сохранить</button></div>');
};
window.savePlans=function(){
  (state.fin.plans||[]).forEach((p,i)=>{ p.limit=Number(($("pl"+i)||{}).value||0); });
  save(); closeSheet(); renderFin();
};
window.editRec=function(id){
  const r=id?(state.fin.rec||[]).find(x=>x.id===id):{title:"",amount:"",cat:"подписки",day:1,acc:"joint"};
  openSheet("Ежемесячный платёж",
    '<p class="hint">Появится напоминание в календаре.</p>'+
    '<label class="fl">Название <input id="fTitle" value="'+esc(r.title||"")+'"></label>'+
    '<label class="fl">Сумма Kč <input id="fAmt" type="number" value="'+(r.amount||"")+'"></label>'+
    '<label class="fl">Категория <select id="fCat">'+FIN_CATS.map(c=>'<option'+(r.cat===c?" selected":"")+">"+c+"</option>").join("")+"</select></label>"+
    '<label class="fl">День месяца <input id="fDay" type="number" min="1" max="28" value="'+(r.day||1)+'"></label>'+
    '<label class="fl">Счёт <select id="fAcc">'+(state.fin.accounts||[]).map(a=>'<option value="'+a.id+'"'+(r.acc===a.id?" selected":"")+">"+a.name+"</option>").join("")+"</select></label>"+
    '<div class="row-btns"><button class="on" onclick="saveRec(\''+(id||"")+'\')">Сохранить</button>'+(id?'<button class="danger" onclick="delRec(\''+id+'\')">Удалить</button>':'')+"</div>");
};
window.saveRec=function(id){
  const item={id:id||uid(),title:$("fTitle").value.trim()||"Платёж",amount:Number($("fAmt").value||0),cat:$("fCat").value,day:Number($("fDay").value||1),acc:$("fAcc").value};
  const i=(state.fin.rec||[]).findIndex(x=>x.id===item.id);
  if(i>=0) state.fin.rec[i]=item; else state.fin.rec.push(item);
  const due=nextBillDate(item.day);
  const rem={id:"fin-"+item.id,title:"Платёж: "+item.title+" · "+kc(item.amount),date:due,time:"09:00",prio:"hi",done:false};
  const ri=state.reminders.findIndex(x=>x.id===rem.id);
  if(ri>=0) state.reminders[ri]=rem; else state.reminders.push(rem);
  save(); closeSheet(); renderFin(); renderHome();
};
window.delRec=function(id){
  state.fin.rec=(state.fin.rec||[]).filter(x=>x.id!==id);
  state.reminders=state.reminders.filter(x=>x.id!=="fin-"+id);
  save(); closeSheet(); renderFin(); renderHome();
};
window.editDebt=function(id){
  const d=id?(state.fin.debts||[]).find(x=>x.id===id):{dir:"gave",person:"",amount:"",left:"",due:"",note:""};
  openSheet("Долг",
    '<label class="fl">Направление <select id="fKind"><option value="gave"'+(d.dir==="gave"?" selected":"")+'>мы дали</option><option value="took"'+(d.dir==="took"?" selected":"")+'>мы взяли</option></select></label>'+
    '<label class="fl">Кто <input id="fTitle" value="'+esc(d.person||"")+'"></label>'+
    '<label class="fl">Сумма Kč <input id="fAmt" type="number" value="'+(d.amount||"")+'"></label>'+
    '<label class="fl">Осталось Kč <input id="fLeft" type="number" value="'+(d.left!=null?d.left:d.amount||"")+'"></label>'+
    '<label class="fl">До <input id="fDate" type="date" value="'+(d.due||"")+'"></label>'+
    '<label class="fl">Заметка <input id="fNote" value="'+esc(d.note||"")+'"></label>'+
    '<div class="row-btns"><button class="on" onclick="saveDebt(\''+(id||"")+'\')">Сохранить</button>'+(id?'<button class="danger" onclick="delDebt(\''+id+'\')">Удалить</button>':'')+"</div>");
};
window.saveDebt=function(id){
  const item={id:id||uid(),dir:$("fKind").value,person:$("fTitle").value.trim()||"Человек",amount:Number($("fAmt").value||0),left:Number($("fLeft").value||0),due:$("fDate").value,note:$("fNote").value.trim()};
  const i=(state.fin.debts||[]).findIndex(x=>x.id===item.id);
  if(i>=0) state.fin.debts[i]=item; else state.fin.debts.push(item);
  save(); closeSheet(); renderFin();
};
window.delDebt=function(id){
  state.fin.debts=(state.fin.debts||[]).filter(x=>x.id!==id);
  save(); closeSheet(); renderFin();
};
function renderFin(){
  const box=$("fin"); if(!box) return;
  const txs=periodTx();
  const income=txs.filter(t=>t.kind==="in").reduce((s,t)=>s+Number(t.amount||0),0);
  const spend=txs.filter(t=>t.kind==="out").reduce((s,t)=>s+Number(t.amount||0),0);
  const by=catSpend(txs);
  const gave=(state.fin.debts||[]).filter(d=>d.dir==="gave").reduce((s,d)=>s+Number(d.left||0),0);
  const took=(state.fin.debts||[]).filter(d=>d.dir==="took").reduce((s,d)=>s+Number(d.left||0),0);
  const net=income-spend+gave-took;
  const accHtml=(state.fin.accounts||[]).map(a=>'<div class="fin-row"><div><b>'+a.name+'</b><small class="hint">'+a.kind+'</small></div><button class="kcal" onclick="editAcc(\''+a.id+'\')">'+kc(a.balance)+'</button></div>').join("");
  const planHtml=(state.fin.plans||[]).map(p=>{
    const used=by[p.cat]||0; const lim=Number(p.limit)||0; const pct=lim?Math.min(100,Math.round(used/lim*100)):0;
    const left=lim-used;
    return '<div class="fin-row"><div><b>'+p.cat+'</b><small>'+kc(used)+(lim?" / "+kc(lim):"")+(lim?" · осталось "+kc(left):"")+'</small><div class="barline"><i class="'+(lim&&used>lim?"over":"")+'" style="width:'+pct+'%"></i></div></div></div>';
  }).join("");
  const recHtml=(state.fin.rec||[]).map(r=>'<div class="fin-row"><div><b>'+r.title+'</b><small>'+r.day+' число · '+r.cat+'</small></div><button class="kcal" onclick="editRec(\''+r.id+'\')">'+kc(r.amount)+'</button></div>').join("")||'<p class="hint">Нет ежемесячных.</p>';
  const debtHtml=(state.fin.debts||[]).map(d=>'<div class="fin-row"><div><b>'+(d.dir==="gave"?"дали ":"взяли ")+d.person+'</b><small>'+(d.due?"до "+d.due:"")+" · осталось "+kc(d.left)+'</small></div><button class="kcal" onclick="editDebt(\''+d.id+'\')">'+kc(d.amount)+'</button></div>').join("")||'<p class="hint">Долгов нет.</p>';
  const txHtml=(state.fin.txs||[]).filter(finVisible).slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,40).map(t=>'<div class="fin-row"><div><b>'+t.cat+'</b><small>'+t.date+(t.note?" · "+t.note:"")+(t.own&&t.own!=="shared"?" · лично":"")+'</small></div><button class="amt '+t.kind+'" onclick="editTx(\''+t.id+'\')">'+(t.kind==="in"?"+":"−")+kc(t.amount)+'</button></div>').join("")||'<p class="hint">Пока нет операций.</p>';
  const report=Object.keys(by).sort((a,b)=>by[b]-by[a]).map(c=>'<div class="fin-row"><b>'+c+'</b><span class="amt out">'+kc(by[c])+'</span></div>').join("")||'<p class="hint">Нет расходов за период.</p>';
  box.innerHTML=
    '<div class="card span"><div class="title">Сводка</div><div class="fin-sum"><div class="tile"><div class="lab">Доход</div><div class="num amt in">'+kc(income)+'</div></div><div class="tile"><div class="lab">Расход</div><div class="num amt out">'+kc(spend)+'</div></div><div class="tile"><div class="lab">Нам должны</div><div class="num">'+kc(gave)+'</div></div><div class="tile"><div class="lab">Мы должны</div><div class="num">'+kc(took)+'</div></div></div><p class="hint">Итог с долгами: <b>'+kc(net)+'</b>. Личные операции видит только свой профиль (Я/Ж).</p><div class="field"><input id="finFrom" type="date" value="'+state.fin.from+'"><input id="finTo" type="date" value="'+state.fin.to+'"><button onclick="setFinRange()">Период</button></div><div class="row-btns"><button class="on" onclick="editTx(\'\')">+ операция</button></div></div>'+
    '<div class="card"><div class="title" style="display:flex;justify-content:space-between">Счета <button class="icon-btn" onclick="editAcc(\'\')">+</button></div>'+accHtml+"</div>"+
    '<div class="card"><div class="title" style="display:flex;justify-content:space-between">План категорий <button class="icon-btn" onclick="editPlan()">✎</button></div>'+planHtml+"</div>"+
    '<div class="card"><div class="title" style="display:flex;justify-content:space-between">Ежемесячные <button class="icon-btn" onclick="editRec(\'\')">+</button></div>'+recHtml+"</div>"+
    '<div class="card"><div class="title" style="display:flex;justify-content:space-between">Долги <button class="icon-btn" onclick="editDebt(\'\')">+</button></div>'+debtHtml+"</div>"+
    '<div class="card"><div class="title">Отчёт по категориям</div>'+report+"</div>"+
    '<div class="card span"><div class="title">Операции</div>'+txHtml+"</div>";
}
function renderAll(){
  try{ if(typeof renderHome==="function") renderHome(); }catch(err){ console.error(err); if($("home")) $("home").insertAdjacentHTML("beforeend","<div class='card'><p>"+err+"</p></div>"); }
  try{ if(typeof renderMenu==="function") renderMenu(); }catch(err){ console.error(err); }
  try{ if(typeof renderShop==="function") renderShop(); }catch(err){ console.error(err); }
  try{ if(typeof renderGym==="function") renderGym(); }catch(err){ console.error(err); }
  try{ if(typeof renderFin==="function") renderFin(); }catch(err){ console.error(err); }
}
mountIcons();
renderAll();
go("home");
if("serviceWorker" in navigator){
  navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister()));
}
