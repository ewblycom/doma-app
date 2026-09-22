(function(){
  function titleOf(card){
    const t=card.querySelector(":scope > .title");
    return t?t.textContent.trim():"";
  }
  function kind(card){
    if(card.classList.contains("mcf") || card.querySelector(".mcf-count")) return "mcf";
    const t=titleOf(card);
    if(/\u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c/.test(t)) return "cal";
    if(/\u041d\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u044f/.test(t)) return "rem";
    if(card.querySelector(".rings") && !t) return "rings";
    if(/\u0421\u044a\u0435\u0434\u0435\u043d\u043e|\u041f\u043e\u0442\u0440\u0430\u0447\u0435\u043d\u043e/.test(t)) return "eat";
    if(/\u041a\u043a\u0430\u043b \u043f\u043e \u0434\u043d\u044f\u043c/.test(t)) return "chart";
    if(/^\u0421\u0435\u0433\u043e\u0434\u043d\u044f/.test(t)) return "today";
    if(/\u041f\u043e\u0447\u0442\u0430/.test(t)) return "mail";
    return "other";
  }
  function mailList(){ return ((window.MAIL_CACHE&&MAIL_CACHE.mail)||(window.DOMA&&DOMA.mail)||[]).slice(0,5); }
  function parcelList(){ return (window.MAIL_CACHE&&MAIL_CACHE.parcels)||(window.DOMA&&DOMA.parcels)||[]; }
  function rebuildMail(){
    const left=mailList().map(function(m){return '<a class="mail-item" href="'+(m.link||"#")+'" target="_blank" rel="noopener"><b>'+m.subject+'</b><small>'+m.from+(m.date?" \u00b7 "+m.date:"")+"</small></a>";}).join("")||'<p class="hint">Писем нет.</p>';
    const right=parcelList().map(function(p){
      const ok=(state.picked&&state.picked[p.id]===true)||(!(state.picked&&state.picked[p.id]===false)&&!!p.picked);
      return '<div class="parcel"><div class="lab">'+(p.kind||"посылка")+"</div><b>"+p.title+'</b><p class="hint">'+(p.how||"")+"<br>Код: "+(p.code||"—")+"<br>Адрес: "+(p.address||"—")+(p.until?"<br>До "+p.until:"")+'</p><label><input type="checkbox" '+(ok?"checked":"")+' onchange="togglePick(\''+p.id+'\')"> '+(ok?"забрал":"ещё не забрал")+"</label>"+(p.link?'<p><a href="'+p.link+'" target="_blank">открыть</a></p>':"")+"</div>";
    }).join("")||'<p class="hint">Активных посылок нет.</p>';
    const stamp=(window.MAIL_CACHE&&MAIL_CACHE.updated)?MAIL_CACHE.updated.slice(0,16).replace("T"," "):"";
    return '<div class="card block-mail span"><div class="title">Почта</div>'+(stamp?'<p class="hint">Обновлено '+stamp+' \u00b7 каждые 6 часов</p>':'')+'<div class="mail-grid"><div class="mail-col"><div class="sub">Последние письма</div>'+left+'</div><div class="mail-col"><div class="sub">Посылки</div>'+right+"</div></div></div>";
  }
  function layoutHome(){
    const box=$("home"); if(!box) return;
    const kids=[].slice.call(box.children);
    const map={};
    kids.forEach(function(el){ map[kind(el)]=map[kind(el)]||[]; map[kind(el)].push(el); });
    function take(k){ return (map[k]||[]).shift()||null; }
    const hold=document.createElement("div");
    const mcf=take("mcf"), cal=take("cal"), rem=take("rem"), rings=take("rings"), eat=take("eat"), chart=take("chart"), today=take("today");
    if(mcf) hold.appendChild(mcf);
    const day=document.createElement("div"); day.className="card block-day"; day.innerHTML='<div class="title">День</div>';
    if(cal){ const t=cal.querySelector(":scope > .title"); if(t) t.remove(); const wrap=document.createElement("div"); wrap.className="block-sec"; while(cal.firstChild) wrap.appendChild(cal.firstChild); day.appendChild(wrap); }
    if(rem){ const t=rem.querySelector(":scope > .title"); if(t) t.remove(); const hint=rem.querySelector(":scope > p.hint"); if(hint) hint.remove(); const wrap=document.createElement("div"); wrap.className="block-sec rem-sec"; wrap.innerHTML='<div class="sub row-between"><span>Напоминания</span><button class="icon-btn" onclick="editRem(\'\')">+</button></div>'; while(rem.firstChild) wrap.appendChild(rem.firstChild); day.appendChild(wrap); }
    hold.appendChild(day);
    const food=document.createElement("div"); food.className="card block-food"; food.innerHTML='<div class="title">Питание</div>';
    [rings,eat,today,chart].forEach(function(el){ if(!el) return; const t=el.querySelector(":scope > .title"); if(t) t.remove(); const wrap=document.createElement("div"); wrap.className="block-sec"; while(el.firstChild) wrap.appendChild(el.firstChild); food.appendChild(wrap); });
    hold.appendChild(food);
    const mailHold=document.createElement("div"); mailHold.innerHTML=rebuildMail(); hold.appendChild(mailHold.firstChild);
    kids.forEach(function(el){ if(el.parentNode===box && kind(el)==="other") hold.appendChild(el); });
    box.innerHTML=""; while(hold.firstChild) box.appendChild(hold.firstChild);
  }
  const prev=typeof renderHome==="function"?renderHome:null;
  window.renderHome=function(){ if(prev) prev(); layoutHome(); };
  if($("home") && $("home").children.length) layoutHome();
})();
