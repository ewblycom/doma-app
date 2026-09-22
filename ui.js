const PAGE_TITLES={home:"Главная",menu:"Меню",gym:"Зал",fin:"Деньги",shop:"Закупки",mail:"Почта"};
function setPageTitle(page){
  const el=document.getElementById("pageTitle");
  if(el) el.textContent=PAGE_TITLES[page]||"Дома";
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
