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
  const prev=typeof renderHome==="function"?renderHome:null;
  renderHome=function(){
    if(prev) prev();
    polishHome();
  };
  polishHome();
})();
