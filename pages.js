(function(){
  function show(page){
    document.querySelectorAll(".page").forEach(function(p){
      const on=p.id===page;
      p.classList.toggle("on", on);
      p.hidden=!on;
      if(on){
        p.style.setProperty("display", (page==="home"||page==="gym")?"flex":"block", "important");
      } else {
        p.style.setProperty("display", "none", "important");
      }
    });
    document.querySelectorAll(".tab-pill button").forEach(function(b){
      b.classList.toggle("on", b.dataset.page===page);
    });
    const title=document.getElementById("pageTitle");
    const names={home:"Главная",menu:"Меню",gym:"Зал",fin:"Деньги",shop:"Закупки",mail:"Почта"};
    if(title) title.textContent=names[page]||"Дома";
    window.scrollTo(0,0);
  }
  window.go=function(page){ show(page); };
  document.querySelectorAll(".page").forEach(function(p){
    if(!p.classList.contains("on")){
      p.hidden=true;
      p.style.setProperty("display","none","important");
    }
  });
})();
