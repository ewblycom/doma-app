const PAGE_TITLES={home:"Главная",menu:"Меню",gym:"Зал",fin:"Деньги",shop:"Закупки",mail:"Почта"};
function setPageTitle(page){
  const el=document.getElementById("pageTitle");
  if(el) el.textContent=PAGE_TITLES[page]||"Дома";
}
function stripGymFromHome(){
  document.querySelectorAll("#home .card").forEach(function(card){
    const title=card.querySelector(".title");
    const head=title?title.textContent.trim():"";
    if(/\u0442\u0440\u0435\u043d\u0438\u0440|\u0444\u0443\u043b\u0431\u043e\u0434\u0438|\u0443\u043f\u0440\u0430\u0436\u043d\u0435\u043d|\u0437\u0430\u043b/i.test(head) || card.querySelector(".wk-grid") || card.querySelector(".gym-pick") || card.querySelector(".ex")){
      card.remove();
    }
  });
}
function polishHome(){
  const dt=document.getElementById("dateTitle"); if(dt) dt.style.display="none";
  const row=document.querySelector(".row-pills"); if(row) row.style.display="none";
  document.querySelectorAll("#home .card .title").forEach(function(el){
    if(el.textContent.trim()==="Потрачено / цель") el.textContent="Съедено / Всего";
  });
  document.querySelectorAll("#home .card").forEach(function(card){
    const title=card.querySelector(".title");
    if(title && title.textContent.indexOf("Сегодня")===0){
      card.querySelectorAll(":scope > p.hint").forEach(function(p){ p.remove(); });
    }
  });
  stripGymFromHome();
}
(function(){
  const prevGo=typeof go==="function"?go:null;
  window.go=function(page){
    if(prevGo) prevGo(page);
    setPageTitle(page);
  };
  const prevHome=typeof renderHome==="function"?renderHome:null;
  renderHome=function(){
    if(prevHome) prevHome();
    polishHome();
  };
  setPageTitle("home");
  polishHome();
})();
