(function(){
  window.renderAll=function(){
    try{ if(typeof renderHome==="function") renderHome(); }catch(e){ console.error("home",e); }
    try{ if(typeof renderMenu==="function") renderMenu(); }catch(e){ console.error("menu",e); }
    try{ if(typeof renderShop==="function") renderShop(); }catch(e){ console.error("shop",e); }
    try{ if(typeof renderGym==="function") renderGym(); }catch(e){ console.error("gym",e); }
    try{ if(typeof renderFin==="function") renderFin(); }catch(e){ console.error("fin",e); }
  };
  if(typeof renderAll==="function") renderAll();
})();
