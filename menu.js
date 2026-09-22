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
window.toggleCustom=function(id){ state.meals["c|"+id]=!state.meals["c|"+id]; save(); renderAll(); };
window.editCustom=function(id,day){
  const m=id?(state.customMeals||[]).find(x=>x.id===id):{d:day||todayName(),m:"Обед",title:"",k:"",p:"",f:"",c:"",text:"",how:"",own:state.who};
  openSheet(id?"Своё блюдо":"Добавить блюдо",
    '<label class="fl">Название <input id="fTitle" value="'+esc(m.title||"")+'"></label>'+
    '<label class="fl">День <select id="fDay">'+ORDER.map(d=>'<option'+(m.d===d?" selected":"")+'>'+d+'</option>').join("")+'</select></label>'+
    '<label class="fl">Приём <select id="fSlot"><option>Завтрак</option><option>Обед</option><option>Перекус</option><option>Ужин</option></select></label>'+
    '<label class="fl">Ккал <input id="fK" type="number" value="'+(m.k||"")+'"></label>'+
    '<label class="fl">Белок г <input id="fP" type="number" value="'+(m.p||"")+'"></label>'+
    '<label class="fl">Жиры г <input id="fF" type="number" value="'+(m.f||"")+'"></label>'+
    '<label class="fl">Углеводы г <input id="fC" type="number" value="'+(m.c||"")+'"></label>'+
    '<label class="fl">Ингредиенты <input id="fText" value="'+esc(m.text||"")+'"></label>'+
    '<label class="fl">Короткий рецепт <input id="fHow" value="'+esc(m.how||"")+'"></label>'+
    '<div class="row-btns"><button class="on" onclick="saveCustom(\''+(id||'')+'\')">Сохранить</button>'+(id?'<button class="danger" onclick="delCustom(\''+id+'\')">Удалить</button>':'')+'</div>');
  if(m.m) $("fSlot").value=m.m;
};
window.saveCustom=function(id){
  const item={id:id||uid(),d:$("fDay").value,m:$("fSlot").value,title:$("fTitle").value.trim()||"Блюдо",k:Number($("fK").value||0),p:Number($("fP").value||0),f:Number($("fF").value||0),c:Number($("fC").value||0),text:$("fText").value.trim(),how:$("fHow").value.trim(),own:state.who};
  const i=(state.customMeals||[]).findIndex(x=>x.id===item.id);
  if(i>=0) state.customMeals[i]=item; else { state.customMeals.push(item); state.meals["c|"+item.id]=true; }
  save(); closeSheet(); renderAll();
};
window.delCustom=function(id){
  state.customMeals=state.customMeals.filter(x=>x.id!==id);
  delete state.meals["c|"+id];
  save(); closeSheet(); renderAll();
};
window.toggleIng=function(key){ state.openMeal[key]=!state.openMeal[key]; save(); if($("menu")&&$("menu").classList.contains("on")) renderMenu(); else renderHome(); };
function mealBlock(m,i,custom){
  const x=custom?{text:m.text||"",k:m.k,p:m.p,f:m.f,c:m.c}:portion(m);
  const key=custom?("c|"+m.id):mealKey(m,i);
  const chk=!!state.meals[key];
  const open=!!state.openMeal[key];
  const rec=[m.how||"",x.text||""].filter(Boolean).join(" · ");
  const onch=custom?"toggleCustom('"+m.id+"')":"toggleMeal('"+key+"')";
  return '<div class="meal '+(chk?"done":"")+'"><input type="checkbox" '+(chk?"checked":"")+' onchange="'+onch+'"><div><b class="tap" onclick="toggleIng(\''+key+'\')">'+m.m+' · '+m.title+'</b><div class="macros"><i>'+x.k+' ккал</i><i>Б '+x.p+'</i><i>Ж '+x.f+'</i><i>У '+x.c+'</i></div><div class="ing '+(open?"on":"")+'">'+(rec||"нет рецепта")+(custom?' <button class="prio mid" onclick="editCustom(\''+m.id+'\')">изм.</button>':'')+'</div></div><div class="kcal">'+x.k+'</div></div>';
}
function renderMenu(){
  const box=$("menu"); if(!box) return;
  const per=person(); const e=eatenOf(todayName());
  const pct=function(n,g){return Math.round((Number(n||0)/Math.max(g,1))*100)};
  const hero=window.MENU_HERO?'<img class="menu-hero" src="'+window.MENU_HERO+'" alt="">':'';
  const rings='<div class="card span"><div class="title">Сегодня · '+todayName()+' · '+(state.who==="wife"?"Жена":"Я")+'</div><div class="menu-kbju">'+hero+'<div class="rings rings4">'+
    '<div class="ring-wrap">'+ringSvg(pct(e.k,per.kcal),"#f0b429")+'<b>'+pct(e.k,per.kcal)+'%</b><span>Ккал '+Math.round(e.k)+'/'+per.kcal+'</span></div>'+
    '<div class="ring-wrap">'+ringSvg(pct(e.p,per.p),"#3dcc7a")+'<b>'+pct(e.p,per.p)+'%</b><span>Белок '+Math.round(e.p)+'/'+per.p+'</span></div>'+
    '<div class="ring-wrap">'+ringSvg(pct(e.f,per.f),"#f07a3a")+'<b>'+pct(e.f,per.f)+'%</b><span>Жиры '+Math.round(e.f)+'/'+per.f+'</span></div>'+
    '<div class="ring-wrap">'+ringSvg(pct(e.c,per.c),"#6b7cff")+'<b>'+pct(e.c,per.c)+'%</b><span>Углеводы '+Math.round(e.c)+'/'+per.c+'</span></div></div></div></div>';
  const days=ORDER.map(function(d){
    const list=(DOMA.meals||[]).map(function(m,i){return {m:m,i:i}}).filter(function(x){return x.m.d===d});
    const extra=(state.customMeals||[]).filter(function(m){return m.d===d&&(!m.own||m.own==="shared"||m.own===state.who)});
    const html=list.map(function(x){return mealBlock(x.m,x.i,false)}).join("")+extra.map(function(m){return mealBlock(m,0,true)}).join("");
    return '<div class="card day-card"><div class="title" style="display:flex;justify-content:space-between">'+d+' <button class="icon-btn" onclick="editCustom(\'\',\''+d+'\')">+</button></div>'+(html||"<p class='hint'>Нет блюд</p>")+"</div>";
  }).join("");
  box.innerHTML=rings+days;
}
if($("menu")) renderMenu();
