(function(){
  const PACKS=[
    {id:"fb1",title:"Фулбоди 1",ex:[
      {n:"Вертикальная тяга",s:"3",r:"15",w:""},
      {n:"Ягодичный мостик со штангой на скамье",s:"3",r:"15",w:""},
      {n:"Лыжник с гантелями",s:"3",r:"15",w:""},
      {n:"Горизонтальная тяга",s:"3",r:"15",w:""},
      {n:"Сгибание голени в тренажёре",s:"3",r:"15",w:""},
      {n:"Пресс: велосипед",s:"3",r:"15 на сторону",w:""},
      {n:"Пресс: скалолаз",s:"3",r:"15",w:""}
    ]},
    {id:"fb2",title:"Фулбоди 2",ex:[
      {n:"Приседания с гантелью",s:"3",r:"15",w:""},
      {n:"Жим гантелей на плечи сидя",s:"3",r:"15",w:""},
      {n:"Подъём гантелей на бицепс",s:"3",r:"15",w:""},
      {n:"Румынская тяга",s:"3",r:"15",w:""},
      {n:"Тяга гантелей к поясу",s:"3",r:"15",w:""},
      {n:"Пресс: русский твист",s:"3",r:"15",w:""},
      {n:"Пресс: складка",s:"3",r:"15",w:""}
    ]},
    {id:"fb3",title:"Фулбоди 3",ex:[
      {n:"Выпады с гантелями",s:"3",r:"15",w:""},
      {n:"Разгибание на трицепс в кроссовере",s:"3",r:"15",w:""},
      {n:"«Бабочка» на грудь в тренажёре",s:"3",r:"15",w:""},
      {n:"Ягодичный мостик со штангой на скамье",s:"3",r:"15",w:""},
      {n:"Тяга гантели к поясу от опоры",s:"3",r:"15",w:""},
      {n:"Пресс: подъём к ногам",s:"3",r:"15",w:""},
      {n:"Пресс: планка на локтях",s:"3",r:"30 сек",w:""}
    ]}
  ];
  const WD=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
  function mondayOf(iso){ const d=new Date(iso+"T12:00:00"); d.setDate(d.getDate()-((d.getDay()+6)%7)); return isoOf(d); }
  function addDays(iso,n){ const d=new Date(iso+"T12:00:00"); d.setDate(d.getDate()+n); return isoOf(d); }
  function gid(){ return "g-"+Date.now().toString(36)+Math.random().toString(36).slice(2,5); }
  function db(){
    if(!state.gymDB){ state.gymDB={week:mondayOf(isoToday()),sel:isoToday(),packs:JSON.parse(JSON.stringify(PACKS)),weights:{},sessions:{}}; }
    const g=state.gymDB;
    if(!g.packs||!g.packs.length) g.packs=JSON.parse(JSON.stringify(PACKS));
    if(!g.sessions) g.sessions={}; if(!g.weights) g.weights={};
    if(!g.week) g.week=mondayOf(isoToday()); if(!g.sel) g.sel=isoToday();
    return g;
  }
  function lastWeight(name){
    const g=db(); if(g.weights[name]) return g.weights[name];
    const dates=Object.keys(g.sessions).sort().reverse();
    for(const d of dates){ const it=(g.sessions[d].items||[]).find(x=>x.n===name && x.w); if(it) return it.w; }
    return "";
  }
  function clonePack(pack){
    return {id:gid(),packId:pack.id,title:pack.title,started:new Date().toISOString(),items:pack.ex.map(e=>({id:gid(),n:e.n,s:e.s,r:e.r,w:lastWeight(e.n)||e.w||"",done:false}))};
  }
  window.gymSel=function(iso){ const g=db(); g.sel=iso; save(); renderGym(); };
  window.gymWeek=function(dir){ const g=db(); g.week=addDays(g.week,dir*7); save(); renderGym(); };
  window.gymAssign=function(packId){ const g=db(); const pack=g.packs.find(p=>p.id===packId); if(!pack) return; g.sessions[g.sel]=clonePack(pack); save(); renderGym(); };
  window.gymClearDay=function(){ const g=db(); delete g.sessions[g.sel]; save(); renderGym(); };
  window.gymToggle=function(id){ const g=db(); const ses=g.sessions[g.sel]; if(!ses) return; const it=ses.items.find(x=>x.id===id); if(!it) return; it.done=!it.done; save(); renderGym(); };
  window.gymWeight=function(id,val){ const g=db(); const ses=g.sessions[g.sel]; if(!ses) return; const it=ses.items.find(x=>x.id===id); if(!it) return; it.w=val; g.weights[it.n]=val; save(); };
  window.gymAddEx=function(){
    const g=db(); let ses=g.sessions[g.sel];
    if(!ses) ses=g.sessions[g.sel]={id:gid(),packId:"custom",title:"Своя",started:new Date().toISOString(),items:[]};
    const n=(($("gxName")||{}).value||"").trim(); if(!n) return;
    const s=(($("gxSets")||{}).value||"3").trim(); const r=(($("gxReps")||{}).value||"15").trim(); const w=(($("gxW")||{}).value||"").trim();
    ses.items.push({id:gid(),n:n,s:s,r:r,w:w,done:false}); if(w) g.weights[n]=w; save(); renderGym();
  };
  window.gymDelEx=function(id){ const g=db(); const ses=g.sessions[g.sel]; if(!ses) return; ses.items=ses.items.filter(x=>x.id!==id); save(); renderGym(); };
  function weekHtml(){
    const g=db(); const cells=[];
    for(let i=0;i<7;i++){
      const iso=addDays(g.week,i); const ses=g.sessions[iso];
      const on=iso===g.sel?" on":""; const mark=ses?'<i class="wk-dot"></i>':"";
      cells.push('<button class="wk-day'+on+'" onclick="gymSel(\''+iso+'\')"><s>'+WD[i]+'</s><b>'+iso.slice(8)+'</b>'+mark+"</button>");
    }
    const end=addDays(g.week,6);
    return '<div class="card"><div class="title" style="display:flex;justify-content:space-between;align-items:center"><span>Неделя</span><span><button class="icon-btn" onclick="gymWeek(-1)">‹</button><button class="icon-btn" onclick="gymWeek(1)">›</button></span></div><p class="hint">'+g.week.slice(8)+"."+g.week.slice(5,7)+" — "+end.slice(8)+"."+end.slice(5,7)+"."+end.slice(0,4)+'</p><div class="wk-grid">'+cells.join("")+"</div></div>";
  }
  window.renderGym=function(){
    const box=$("gym"); if(!box) return; const g=db(); const ses=g.sessions[g.sel];
    const packs=g.packs.map(p=>'<button onclick="gymAssign(\''+p.id+'\')">'+p.title+"</button>").join("");
    const hero=window.GYM_HERO?'<img class="gym-hero" src="'+window.GYM_HERO+'" alt="">':'';
    let body;
    if(!ses){
      body='<div class="card"><div class="title">'+g.sel+'</div><div class="gym-pick">'+hero+'<div><p class="hint">Выберите пакет — подгрузятся упражнения.</p><div class="row-btns">'+packs+'</div></div></div></div>';
    } else {
      const n=ses.items.filter(x=>x.done).length;
      const rows=ses.items.map(it=>'<div class="ex"><input type="checkbox" '+(it.done?"checked":"")+' onchange="gymToggle(\''+it.id+'\')"><div><b>'+it.n+'</b><span>'+it.s+' × '+it.r+'</span></div><input class="ex-w" value="'+String(it.w||"").replace(/"/g,"")+'" placeholder="кг" onchange="gymWeight(\''+it.id+'\',this.value)"><button class="icon-btn" onclick="gymDelEx(\''+it.id+'\')">×</button></div>').join("");
      body='<div class="card"><div class="title">'+ses.title+'</div><div class="gym-pick">'+hero+'<div><p class="hint">'+g.sel+' · '+n+' / '+ses.items.length+'</p><div class="row-btns">'+packs+'</div></div></div>'+rows+'<div class="row-btns"><button onclick="gymClearDay()">Убрать пакет</button></div></div>';
    }
    const add='<div class="card"><div class="title">Своё упражнение</div><label class="fl">Название <input id="gxName" placeholder="Жим лёжа"></label><div class="field"><input id="gxSets" placeholder="подходы" value="3"><input id="gxReps" placeholder="повт." value="15"><input id="gxW" placeholder="вес кг"></div><div class="row-btns"><button class="on" onclick="gymAddEx()">Добавить</button></div></div>';
    const hist=Object.keys(g.sessions).sort().reverse().slice(0,24).map(d=>{ const s=g.sessions[d]; const dn=(s.items||[]).filter(x=>x.done).length; const tw=(s.items||[]).filter(x=>x.w).map(x=>x.n+": "+x.w).slice(0,3).join(" · "); return '<div class="fin-row"><div><b>'+d+' · '+s.title+'</b><small>'+dn+'/'+(s.items||[]).length+(tw?" · "+tw:"")+"</small></div></div>"; }).join("")||'<p class="hint">Журнал пуст.</p>';
    box.innerHTML=weekHtml()+body+add+'<div class="card"><div class="title">Журнал</div><p class="hint">База на устройстве: пакеты, веса, прошлые дни.</p>'+hist+"</div>";
  };
  window.GYM_DB=function(){ return db(); };
  renderGym();
})();
