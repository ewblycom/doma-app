(function(){
  function habitDB(){
    if(!state.habits) state.habits={food:{},gym:{},log:[]};
    if(!state.habits.food) state.habits.food={};
    if(!state.habits.gym) state.habits.gym={};
    if(!state.habits.log) state.habits.log=[];
    return state.habits;
  }
  function bump(map,key,extra){
    if(!key) return;
    const n=String(key).trim(); if(!n) return;
    const cur=map[n]||{n:n,count:0,last:"",k:0};
    cur.count+=1; cur.last=isoToday();
    if(extra&&extra.k) cur.k=Number(extra.k)||cur.k;
    if(extra&&extra.pack) cur.pack=extra.pack;
    map[n]=cur;
  }
  function topList(map,n){
    return Object.values(map||{}).sort(function(a,b){return b.count-a.count||String(b.last).localeCompare(String(a.last));}).slice(0,n||5);
  }
  window.addExtra=function(){
    const day=todayName();
    const title=(($("extraWhat")||{}).value||"").trim();
    const k=Number(($("extraKcal")||{}).value||0);
    if(!title && !k) return;
    const h=habitDB();
    const name=title||"Перекус";
    const item={id:uid(),d:day,m:"Перекус",title:name,k:k||0,p:0,f:0,c:0,text:"добавлено вручную",how:"",own:state.who};
    if(!state.customMeals) state.customMeals=[];
    state.customMeals.push(item);
    state.meals["c|"+item.id]=true;
    bump(h.food,name,{k:k});
    h.log.push({t:"food",title:name,k:k,day:day,at:new Date().toISOString()});
    save(); renderAll();
    if(typeof renderMenu==="function") renderMenu();
  };
  window.habitAddFood=function(name){
    const rec=habitDB().food[name]; if(!rec) return;
    if($("extraWhat")) $("extraWhat").value=name;
    if($("extraKcal")) $("extraKcal").value=rec.k||0;
    addExtra();
  };
  const prevAssign=window.gymAssign;
  window.gymAssign=function(packId){
    if(prevAssign) prevAssign(packId);
    const h=habitDB();
    const pack=((state.gymDB&&state.gymDB.packs)||[]).find(function(p){return p.id===packId;});
    bump(h.gym, pack?pack.title:packId, {pack:packId});
    h.log.push({t:"gym",title:pack?pack.title:packId,day:isoToday(),at:new Date().toISOString()});
    save();
  };
  const prevAddEx=window.gymAddEx;
  window.gymAddEx=function(){
    const n=(($("gxName")||{}).value||"").trim();
    if(prevAddEx) prevAddEx();
    if(!n) return;
    const h=habitDB(); bump(h.gym,n,{});
    h.log.push({t:"gym",title:n,day:isoToday(),at:new Date().toISOString()}); save();
  };
  function foodSuggestHtml(){
    const top=topList(habitDB().food,4);
    if(!top.length) return "";
    return '<div class="habit-row">'+top.map(function(x){return '<button class="habit-chip" onclick="habitAddFood(\''+String(x.n).replace(/'/g,"")+'\')">'+x.n+(x.k?" · "+x.k:"")+"</button>";}).join("")+"</div>";
  }
  const prevPolish=typeof polishHome==="function"?polishHome:function(){};
  window.polishHome=function(){
    prevPolish();
    const inp=document.getElementById("extraKcal");
    if(!inp) return;
    const field=inp.closest(".field");
    if(!field || field.dataset.habit==="1") return;
    field.dataset.habit="1";
    field.insertAdjacentHTML("beforebegin", '<input id="extraWhat" placeholder="Что съели" style="width:100%;margin:8px 0 10px;border:0;background:#f5f5f7;border-radius:11px;padding:11px 14px;font:inherit">'+foodSuggestHtml());
    inp.placeholder="Ккал";
  };
  const prevMenu=window.renderMenu;
  if(typeof prevMenu==="function"){
    window.renderMenu=function(){
      prevMenu();
      const box=$("menu"); if(!box) return;
      const top=topList(habitDB().food,5); if(!top.length) return;
      const card=document.createElement("div"); card.className="card span";
      card.innerHTML='<div class="title">Часто едите</div><p class="hint">Попадает в план на сегодня и в счётчик.</p><div class="habit-row">'+top.map(function(x){return '<button class="habit-chip" onclick="habitAddFood(\''+String(x.n).replace(/'/g,"")+'\')">'+x.n+" · "+x.count+"×</button>";}).join("")+"</div>";
      const first=box.querySelector(".card.span");
      if(first&&first.nextSibling) box.insertBefore(card, first.nextSibling); else box.appendChild(card);
    };
  }
  const prevGym=window.renderGym;
  if(typeof prevGym==="function"){
    window.renderGym=function(){
      prevGym();
      const box=$("gym"); if(!box) return;
      box.querySelectorAll(".card .title").forEach(function(el){
        if(/^\d{4}-\d{2}-\d{2}$/.test(el.textContent.trim())) el.textContent="Тренировка";
      });
      box.querySelectorAll(".gym-pick .hint").forEach(function(el){
        el.textContent=el.textContent.replace(/^\d{4}-\d{2}-\d{2}\s*·\s*/,"");
      });
      const top=topList(habitDB().gym,4); if(!top.length) return;
      const pick=box.querySelector(".gym-pick"); if(!pick) return;
      const wrap=document.createElement("div"); wrap.className="habit-row";
      wrap.innerHTML=top.map(function(x){return '<span class="habit-chip">'+x.n+" · "+x.count+"×</span>";}).join("");
      pick.parentNode.insertBefore(wrap, pick.nextSibling);
    };
  }
  window.HABITS=habitDB;
})();
