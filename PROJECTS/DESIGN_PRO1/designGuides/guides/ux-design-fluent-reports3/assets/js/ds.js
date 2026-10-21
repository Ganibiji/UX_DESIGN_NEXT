'use strict';
/* Design-system page demos: live token values, menus, dialogs, drawers and component states. */
(function(){
  const {$,$$,esc,ic}=RA;
  function hexes(){$$('[data-hex]').forEach(c=>{const v=getComputedStyle(c).getPropertyValue(c.dataset.hex).trim();c.textContent=`${c.dataset.hex} · ${v}`})}
  hexes();document.addEventListener('ra:theme',()=>setTimeout(hexes,20));
  document.addEventListener('click',e=>{const t=e.target;let b;
    if((b=t.closest('[data-demo-menu]'))){RA.menu(b,[{head:'Export'},{label:'PDF',icon:'print',onClick:()=>RA.toast('PDF export started',{kind:'ok'})},{label:'Excel (CSV)',icon:'document_table',onClick:()=>RA.toast('CSV export started',{kind:'ok'})},{label:'PNG image',icon:'image',onClick:()=>RA.toast('PNG export started',{kind:'ok'})},'sep',{label:'Schedule…',icon:'clock',onClick:()=>RA.toast('Scheduling opens the subscription dialog',{icon:'clock'})},{label:'Disabled item',icon:'lock_closed',disabled:true}]);return}
    if(t.closest('[data-demo-modal]')){const m=RA.modal({title:'Delete saved view?',body:'<p>“North region — weekly” will be removed for everyone it is shared with. This can’t be undone.</p>',footer:'<button class="btn" data-close>Cancel</button><button class="btn btn--danger" data-ok>Delete view</button>'});m.el.querySelector('[data-ok]').onclick=()=>{m.close();RA.toast('View deleted',{kind:'ok'})};return}
    if(t.closest('[data-demo-drawer]')){RA.drawer({title:'Order SO-24817',body:'<dl class="kv"><dt>Customer</dt><dd>Bharat Infra Projects</dd><dt>Value</dt><dd>₹18,60,000</dd><dt>Lines</dt><dd>42</dd><dt>Warehouse</dt><dd>Pune WH-1</dd><dt>Status</dt><dd><span class="st st--good">'+ic('checkmark_circle')+'Dispatched</span></dd></dl>',footer:'<button class="btn btn--primary" data-close>Close</button>'});return}
    if(t.closest('[data-demo-drawer-left]')){RA.drawer({title:'Saved views',side:'left',body:'<div class="presets"><button class="menu__i">'+ic('star')+'<span>North region — weekly</span></button><button class="menu__i">'+ic('star')+'<span>Top 10 SKUs</span></button><button class="menu__i">'+ic('star')+'<span>Overdue POs</span></button></div>'});return}
    if((b=t.closest('[data-preset]'))){$$('[data-preset]').forEach(x=>{x.setAttribute('aria-selected',String(x===b));const c=x.querySelector('.chk');c&&c.remove()});b.insertAdjacentHTML('afterbegin',ic('checkmark','chk'));b.querySelector('span[style]')?.remove();RA.setFilter('range',b.dataset.preset);return}
    if((b=t.closest('[data-state-retry]'))){const s=b.closest('.state,.kpi');const prev=s.innerHTML;s.innerHTML='<span class="spinner" role="progressbar" aria-label="Loading"></span><b>Retrying…</b>';setTimeout(()=>{s.innerHTML=prev;RA.toast('Still failing — this is the error state demo',{kind:'warn'})},1400);return}
    if(t.closest('[data-state-refresh-btn]')){const c=$('[data-state-refresh] .cc');c.classList.add('is-busy');setTimeout(()=>c.classList.remove('is-busy'),1800);return}
  });
  /* the refreshing demo starts busy, then settles so the held render is visible */
  const r=$('[data-state-refresh] .cc');if(r)setTimeout(()=>r.classList.remove('is-busy'),2600);
})();
