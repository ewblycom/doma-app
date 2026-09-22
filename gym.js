(function(){
  const PLAN=[
    {dow:1,day:"Понедельник",title:"Фулбоди 1",ex:[
      {n:"Вертикальная тяга",s:"3",r:"15"},
      {n:"Ягодичный мостик со штангой на скамье",s:"3",r:"15"},
      {n:"Лыжник с гантелями",s:"3",r:"15"},
      {n:"Горизонтальная тяга",s:"3",r:"15"},
      {n:"Сгибание голени в тренажёре",s:"3",r:"15"},
      {n:"Пресс: велосипед",s:"3",r:"15 на сторону"},
      {n:"Пресс: скалолаз",s:"3",r:"15"}
    ]},
    {dow:5,day:"Пятница",title:"Фулбоди 2",ex:[
      {n:"Приседания с гантелью",s:"3",r:"15"},
      {n:"Жим гантелей на плечи сидя",s:"3",r:"15"},
      {n:"Подъём гантелей на бицепс",s:"3",r:"15"},
      {n:"Румынская тяга",s:"3",r:"15"},
      {n:"Тяга гантелей к поясу",s:"3",r:"15"},
      {n:"Пресс: русский твист",s:"3",r:"15"},
      {n:"Пресс: складка",s:"3",r:"15"}
    ]},
    {dow:0,day:"Воскресенье",title:"Фулбоди 3",ex:[
      {n:"Выпады с гантелями",s:"3",r:"15"},
      {n:"Разгибание на трицепс в кроссовере",s:"3",r:"15"},
      {n:"«Бабочка» на грудь в тренажёре",s:"3",r:"15"},
      {n:"Ягодичный мостик со штангой на скамье",s:"3",r:"15"},
      {n:"Тяга гантели к поясу от опоры",s:"3",r:"15"},
      {n:"Пресс: подъём к ногам",s:"3",r:"15"},
      {n:"Пресс: планка на локтях",s:"3",r:"30 сек"}
    ]}
  ];
  if(typeof DOMA==="object") DOMA.workouts=PLAN;
  function gymState(){
    if(!state.gym){
      const t=isoToday();
      state.gym={view:t,from:t.slice(0,8)+"01",to:t,log:{}};
    }
    if(!state.gym.log) state.gym.log={};
    return state.gym;
  }
  function planByDate(iso){
    const d=new Date(iso+"T12:00:00");
    return PLAN.find(p=>p.dow===d.getDay())||null;
  }
  function sess(iso){
    const g=gymState();
    if(!g.log[iso]) g.log[iso]={checks:{},done:false};
    return g.log[iso];
  }
  function doneCount(iso,plan){
    const s=sess(iso);
    return (plan.ex||[]).filter((_,i)=>s.checks[i]).length;
  }
  window.toggleGymEx=function(iso,i){
    const s=sess(iso);
    s.checks[i]=!s.checks[i];
    const p=planByDate(iso);
    if(p && doneCount(iso,p)===p.ex.length) s.done=true;
    save(); renderGym();
  };
  window.markGymDone=function(iso){
    const p=planByDate(iso); if(!p) return;
    const s=sess(iso);
    s.done=!s.done;
    if(s.done) p.ex.forEach((_,i)=>s.checks[i]=true);
    save(); renderGym();
  };
  window.setGymView=function(){
    const g=gymState();
    g.view=($("gymView")||{}).value||g.view;
    save(); renderGym();
  };
  window.setGymRange=function(){
    const g=gymState();
    g.from=($("gymFrom")||{}).value||g.from;
    g.to=($("gymTo")||{}).value||g.to;
    save(); renderGym();
  };
  window.renderGym=function(){
    const box=$("gym"); if(!box) return;
    const g=gymState();
    const iso=g.view||isoToday();
    const p=planByDate(iso);
    const s=sess(iso);
    let planHtml;
    if(!p){
      planHtml='<div class="card"><div class="title">Нет тренировки</div><p class="hint">Зал по программе Maxler — понедельник, пятница и воскресенье. Выберите одну из этих дат.</p></div>';
    } else {
      const n=doneCount(iso,p);
      const rows=p.ex.map((e,i)=>'<div class="ex"><input type="checkbox" '+(s.checks[i]?"checked":"")+' onchange="toggleGymEx(\''+iso+'\','+i+')"><div><b>'+e.n+'</b><span>'+e.s+' × '+e.r+'</span></div></div>').join("");
      planHtml='<div class="card"><div class="title">'+p.day+' · '+p.title+'</div><p class="hint">Фулбоди, 3×15. Разминка до, растяжка или ролл после. '+n+' / '+p.ex.length+' упражнений.</p>'+rows+'<div class="row-btns"><button class="'+(s.done?"on":"")+'" onclick="markGymDone(\''+iso+'\')">'+(s.done?"Тренировка засчитана":"Отметить тренировку")+'</button></div></div>';
    }
    const keys=Object.keys(g.log).filter(d=>d>=g.from&&d<=g.to).sort().reverse();
    const list=keys.map(d=>{
      const pl=planByDate(d);
      const ss=g.log[d];
      const cnt=pl?doneCount(d,pl):0;
      const total=pl?pl.ex.length:0;
      const ok=ss.done|| (total&&cnt===total);
      if(!ok && cnt===0) return "";
      return '<div class="fin-row"><div><b>'+d+(pl?" · "+pl.day:"")+'</b><small>'+(pl?pl.title:"")+' · '+cnt+'/'+total+'</small></div><span class="'+(ok?"st ok":"st warn")+'">'+(ok?"сделано":"часть")+'</span></div>';
    }).join("")||'<p class="hint">В этом периоде отмеченных тренировок нет.</p>';
    const doneN=keys.filter(d=>{
      const pl=planByDate(d); const ss=g.log[d];
      return ss.done || (pl && doneCount(d,pl)===(pl.ex||[]).length && pl.ex.length);
    }).length;
    box.innerHTML=
      '<div class="card"><div class="title">Дата тренировки</div><div class="field"><input id="gymView" type="date" value="'+iso+'" onchange="setGymView()"><button onclick="setGymView()">Показать</button></div><p class="hint">Пн · Пт · Вс. Источник: Maxler, фулбоди 3 раза в неделю.</p></div>'+
      planHtml+
      '<div class="card"><div class="title">Трекер</div><p class="hint">За период выполнено: '+doneN+'</p><div class="field"><input id="gymFrom" type="date" value="'+g.from+'"><input id="gymTo" type="date" value="'+g.to+'"><button onclick="setGymRange()">Фильтр</button></div>'+list+"</div>";
  };
  if(typeof renderGym==="function") renderGym();
})();
