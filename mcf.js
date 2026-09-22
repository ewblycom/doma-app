function mcfColor(n){
  const t=1-Math.max(0,Math.min(6,n))/6;
  const r=Math.round(226+(61-226)*t);
  const g=Math.round(75+(204-75)*t);
  const b=Math.round(75+(122-75)*t);
  return "rgb("+r+","+g+","+b+")";
}
function mcfBanner(){
  const n=typeof daysToMcFriday==="function"?daysToMcFriday():((5-new Date().getDay()+7)%7);
  const today=n===0;
  const word=n===1?"день":(n>1&&n<5?"дня":"дней");
  const fill=Math.round((1-n/6)*100);
  const col=mcfColor(n);
  const days=today?"сегодня":(n+" "+word);
  return '<div class="mcf" onclick="go(\'menu\')">'+
    '<div class="mcf-left"><div class="mcf-kicker">До Макпятницы осталось</div>'+
    '<div class="mcf-days" style="color:'+col+'">'+days+'</div>'+
    '<div class="mcf-bar"><i style="width:'+fill+'%;background:'+col+'"></i></div></div>'+
    '<div class="mcf-pic" title="Макпятница"></div></div>';
}
(function(){
  const prev=typeof renderHome==="function"?renderHome:null;
  renderHome=function(){
    if(prev) prev();
    const box=$("home"); if(!box) return;
    if(box.querySelector(".mcf")) return;
    box.insertAdjacentHTML("afterbegin", mcfBanner());
  };
  if($("home")) renderHome();
})();
