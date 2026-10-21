'use strict';
/* Layout pages: master–detail selection and the self-refreshing wallboard. */
(function(){
  const {$,$$}=RA;
  document.addEventListener('click',e=>{const b=e.target.closest('[data-md]');if(!b)return;
    $$('[data-md]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));RA.setFilter('region',b.dataset.md)});
  document.addEventListener('ra:filters',()=>{const r=RA.filters.region;$$('[data-md]').forEach(x=>x.setAttribute('aria-selected',String(x.dataset.md===r)))});
  const wb=$('[data-wallboard]');
  if(wb){const clock=$('[data-wb-clock]',wb);const tick=()=>{clock.textContent='Updated '+new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})+' · refreshes every 30 s'};tick();
    setInterval(()=>{RA.emit('ra:refresh');tick()},30000)}
})();
