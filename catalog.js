window.DOMA=window.DOMA||{};
DOMA.catalog=[].concat(DOMA.catB||[],DOMA.catL||[],DOMA.catD||[]);
function plateOf(ings,g){ return (ings||[]).map(function(x){return x.n+" "+x.g+" г"}).join(", ")+" · тарелка "+g+" г"; }
(function applyWeek(){
  const pick=function(id){ return (DOMA.catalog||[]).find(function(x){return x.id===id}); };
  const pair={"Понедельник":{b:"b01",l:"l01",d:"d01"},"Вторник":{b:"b01",l:"l01",d:"d01"},"Среда":{b:"b02",l:"l02",d:"d03"},"Четверг":{b:"b02",l:"l02",d:"d03"},"Пятница":{b:"b09",l:"l03",d:"d15"},"Суббота":{b:"b09",l:"l03",d:"d02"},"Воскресенье":{b:"b03",l:"l08",d:"d04"}};
  const out=[];
  Object.keys(pair).forEach(function(day){
    const p=pair[day];
    ["b","l","d"].forEach(function(k){
      const c=pick(p[k]); if(!c) return;
      out.push({d:day,m:c.slot,title:c.title,id:c.id,me:plateOf(c.ingsM,c.gM),we:plateOf(c.ingsW,c.gW),mk:c.mk,mp:c.mp,mf:c.mf,mc:c.mc,wk:c.wk,wp:c.wp,wf:c.wf,wc:c.wc,how:c.cook,cost:c.cost,block:"2 дня",ingsM:c.ingsM,ingsW:c.ingsW,gM:c.gM,gW:c.gW});
    });
  });
  if(out.length) DOMA.meals=out;
  DOMA.week="23–29.09.2026 · КБЖУ по граммам";
})();
function daysToMcFriday(){ const d=new Date().getDay(); return d===5?0:(5-d+7)%7; }
function mcFridayLabel(){ const n=daysToMcFriday(); if(n===0) return "Сегодня Макпятница"; return "До Макпятницы осталось "+n+" "+(n===1?"день":n<5?"дня":"дней"); }
setTimeout(function(){ const el=document.getElementById("modePill"); if(el) el.textContent=mcFridayLabel(); },0);
