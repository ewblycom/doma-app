if(!state.pantry) state.pantry={};
window.togglePantry=function(n){ state.pantry[n]=!state.pantry[n]; save(); };
window.openRecipe=function(id){
  const c=(DOMA.catalog||[]).find(function(x){return x.id===id});
  if(!c){ openSheet("Рецепт","<p class='hint'>Нет в каталоге</p>"); return; }
  const w=state.who==="wife";
  const ings=w?c.ingsW:c.ingsM;
  const g=w?c.gW:c.gM;
  const k=w?c.wk:c.mk,p=w?c.wp:c.mp,f=w?c.wf:c.mf,cc=w?c.wc:c.mc;
  const rows=(ings||[]).map(function(x){
    const on=!!state.pantry[x.n];
    return '<div class="shop-item"><input type="checkbox" '+(on?"checked":"")+' onchange="togglePantry(\''+String(x.n).replace(/'/g,"")+'\')"><div><b>'+x.n+'</b><small>'+x.g+' г</small></div></div>';
  }).join("");
  openSheet(c.title,
    '<div class="macros"><i>'+k+' ккал</i><i>Б '+p+'</i><i>Ж '+f+'</i><i>У '+cc+'</i></div>'+
    "<p class='hint'>Порция на тарелке: <b>"+g+" г</b></p>"+
    "<div class='title'>Продукты</div>"+(rows||"<p class='hint'>нет</p>")+
    "<div class='title' style='margin-top:12px'>Приготовление</div><p>"+c.cook+"</p>"+
    (c.id==="d15"?"<p class='hint'>Пятница. Дома не готовим.</p>":"<p class='hint'>КБЖУ по граммам продуктов.</p>")
  );
};
window.toggleIng=function(key){
  const parts=String(key).split("|");
  const idx=Number(parts[parts.length-1]);
  const m=(DOMA.meals||[])[idx];
  if(m&&m.id){ openRecipe(m.id); return; }
  state.openMeal[key]=!state.openMeal[key]; save();
  if($("menu")&&$("menu").classList.contains("on")) renderMenu(); else renderHome();
};
function mealBlock(m,i,custom){
  const x=custom?{text:m.text||"",k:m.k,p:m.p,f:m.f,c:m.c}:portion(m);
  const key=custom?("c|"+m.id):mealKey(m,i);
  const chk=!!state.meals[key];
  const onch=custom?"toggleCustom('"+m.id+"')":"toggleMeal('"+key+"')";
  const tap=custom?("editCustom('"+m.id+"')"):(m.id?("openRecipe('"+m.id+"')"):("toggleIng('"+key+"')"));
  return '<div class="meal '+(chk?"done":"")+'"><input type="checkbox" '+(chk?"checked":"")+' onchange="'+onch+'"><div><b class="tap" onclick="'+tap+'">'+m.m+' · '+m.title+'</b><div class="macros"><i>'+x.k+' ккал</i><i>Б '+x.p+'</i><i>Ж '+x.f+'</i><i>У '+x.c+'</i></div><small>'+(x.text||"")+'</small></div><div class="kcal">'+x.k+'</div></div>';
}
if($("menu")) renderMenu();
