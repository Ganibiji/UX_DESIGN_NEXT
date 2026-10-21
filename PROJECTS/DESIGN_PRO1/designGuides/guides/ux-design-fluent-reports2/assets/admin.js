'use strict';
/* =====================================================================
   Prism Dashboards — shell behaviours (theme, navigation, toasts).
   Component behaviour (menus, selects, dialogs, toasts, tabs, sorting,
   calendar) comes from core.js; this file wires the admin-specific parts.
   ===================================================================== */
(function(){
  const store={get(k,d){try{const v=localStorage.getItem('dashboards:'+k);return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem('reports:'+k,v)}catch(e){}}};
  const host=document.documentElement.getAttribute('data-theme');
  const dark=(()=>{try{return matchMedia('(prefers-color-scheme: dark)').matches}catch(e){return false}})();
  let theme=store.get('theme',host==='dark'||(!host&&dark)?'dark':'light');
  const applyTheme=()=>{document.documentElement.setAttribute('data-theme',theme);$$('[data-set-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.setTheme===theme)))};
  applyTheme();
  if(store.get('nav','open')==='collapsed'&&innerWidth>900)document.body.classList.add('nav-collapsed');
  const k='f';

  document.addEventListener('click',e=>{
    const t=e.target;let el;
    if((el=t.closest('[data-set-theme]'))){theme=el.dataset.setTheme;store.set('theme',theme);applyTheme();return}
    if((el=t.closest('[data-nav-toggle]'))){if(innerWidth<=900){const o=!document.body.classList.contains('nav-open');document.body.classList.toggle('nav-open',o);el.setAttribute('aria-expanded',String(o))}else{const c=!document.body.classList.contains('nav-collapsed');document.body.classList.toggle('nav-collapsed',c);store.set('nav',c?'collapsed':'open');el.setAttribute('aria-expanded',String(!c))}return}
    if(t.closest('.ad-scrim')){document.body.classList.remove('nav-open');return}
    if((el=t.closest('[data-mark-read]'))){$$('.dx-notif.is-unread').forEach(n=>{n.classList.remove('is-unread');n.querySelector('.ds-sr')?.remove();n.querySelector('[data-dot]')?.remove()});$$('[data-unread-count]').forEach(c=>c.remove());toast(k,{title:'All notifications marked as read',v:'success'});return}
    if((el=t.closest('.dx-notif[data-read-one]'))){el.classList.remove('is-unread');el.querySelector('[data-dot]')?.remove();return}
    if((el=t.closest('[data-copy]'))){const v=el.dataset.copy;try{navigator.clipboard.writeText(v).then(()=>toast(k,{title:'Copied to clipboard',v:'success'}),()=>toast(k,{title:'Copy this value',text:v}))}catch(err){toast(k,{title:'Copy this value',text:v})}return}
    if((el=t.closest('[data-save]'))){toast(k,{title:el.dataset.save||'Changes saved',v:'success'});return}
  });
  document.addEventListener('keydown',e=>{
    if((e.key==='/'||(e.key==='k'&&(e.ctrlKey||e.metaKey)))&&!e.target.closest('input,textarea,select,[contenteditable="true"]')){const s=document.querySelector('.ad-search input');if(s){e.preventDefault();s.focus()}}
    if(e.key==='Escape'&&document.body.classList.contains('nav-open'))document.body.classList.remove('nav-open');
  });

  /* table search: <input data-table-search="#tableId"> */
  $$('[data-table-search]').forEach(inp=>{const tb=document.querySelector(inp.dataset.tableSearch);const out=inp.dataset.count?document.querySelector(inp.dataset.count):null;inp.addEventListener('input',()=>{const q=inp.value.trim().toLowerCase();let n=0;$$('tbody tr',tb).forEach(r=>{const hit=!q||r.textContent.toLowerCase().includes(q);r.hidden=!hit;if(hit)n++});if(out)out.textContent=`${n} result${n===1?'':'s'}`})});
  /* status filter tabs: tablist with data-filter-table, tabs with data-status */
  $$('[data-filter-table]').forEach(list=>{const tb=document.querySelector(list.dataset.filterTable);list.addEventListener('ds-tab',e=>{const s=e.detail.tab.dataset.status;$$('tbody tr',tb).forEach(r=>r.hidden=s!=='all'&&r.dataset.status!==s)})});
  /* row selection + bulk bar: table[data-select] with checkbox [data-all] and [data-row] */
  $$('[data-select]').forEach(box=>{const all=box.querySelector('[data-all]');const rows=()=>$$('[data-row]',box);const bar=document.querySelector(box.dataset.select);
    const sync=()=>{const n=rows().filter(c=>c.checked).length;if(all){all.checked=n>0&&n===rows().length;all.indeterminate=n>0&&n<rows().length}rows().forEach(c=>c.closest('tr').setAttribute('aria-selected',String(c.checked)));if(bar){bar.hidden=!n;const c=bar.querySelector('[data-sel-count]');if(c)c.textContent=`${n} selected`}};
    box.addEventListener('change',e=>{if(e.target===all)rows().forEach(c=>c.checked=all.checked);sync()});
    if(bar)bar.addEventListener('click',e=>{const b=e.target.closest('[data-bulk]');if(b){toast(k,{title:`${b.dataset.bulk}: ${rows().filter(c=>c.checked).length} items`,v:'success'});rows().forEach(c=>c.checked=false);sync()}});sync()});
  /* simple validation: form[data-validate] */
  $$('form[data-validate]').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();let bad=[];$$('[required]',f).forEach(i=>{const fl=i.closest('.ds-field');const ok=i.type==='email'?/^\S+@\S+\.\S+$/.test(i.value):!!i.value.trim();fl?.classList.toggle('is-error',!ok);i.toggleAttribute('aria-invalid',!ok);let h=fl?.querySelector('.ds-help');if(!ok){if(!h&&fl){fl.insertAdjacentHTML('beforeend','<p class="ds-help"></p>');h=fl.querySelector('.ds-help')}if(h){h.dataset.orig??=h.textContent;h.innerHTML=ic('err')+(i.type==='email'&&i.value?'Enter a valid email address':`${(fl.querySelector('.ds-label')?.textContent||'This field').replace('*','').trim()} is required`)}bad.push(i)}else if(h&&h.dataset.orig!=null){h.textContent=h.dataset.orig}});
    if(bad.length){bad[0].focus();toast(k,{title:`Fix ${bad.length} field${bad.length>1?'s':''}`,v:'error'});return}
    const L=f.closest('.ds-layer');if(L&&L._close)L._close();toast(k,{title:f.dataset.validate||'Saved',v:'success'});if(f.dataset.redirect)setTimeout(()=>location.href=f.dataset.redirect,700)}));
  /* forms inside dialog templates are cloned on open; wire them when a layer appears */
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1&&n.classList.contains('ds-layer'))$$('form[data-validate]',n).forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const bad=$$('[required]',f).filter(i=>!i.value.trim());$$('.ds-field',f).forEach(x=>x.classList.remove('is-error'));bad.forEach(i=>i.closest('.ds-field')?.classList.add('is-error'));if(bad.length){bad[0].focus();return}n._close();toast(k,{title:f.dataset.validate||'Saved',v:'success'})}))}))).observe(document.body,{childList:true});
  /* kanban: drag and drop + keyboard move buttons */
  $$('[data-kanban]').forEach(st=>{let drag=null;const move=(card,col)=>{col.appendChild(card);$$('[data-kb-col]',st).forEach(c=>{const w=c.querySelector('.wip');if(w)w.textContent=c.querySelectorAll('.dx-kb__c').length});toast(k,{title:`Moved to ${col.dataset.kbCol}`,text:card.querySelector('b').textContent})};
    st.addEventListener('dragstart',e=>{const c=e.target.closest('.dx-kb__c');if(c){drag=c;c.classList.add('is-drag')}});st.addEventListener('dragend',()=>{drag&&drag.classList.remove('is-drag');drag=null;$$('.is-over',st).forEach(c=>c.classList.remove('is-over'))});
    st.addEventListener('dragover',e=>{const col=e.target.closest('[data-kb-col]');if(col&&drag){e.preventDefault();$$('.is-over',st).forEach(c=>c!==col&&c.classList.remove('is-over'));col.classList.add('is-over')}});st.addEventListener('drop',e=>{const col=e.target.closest('[data-kb-col]');if(col&&drag){e.preventDefault();move(drag,col)}});
    st.addEventListener('click',e=>{const b=e.target.closest('[data-kb-mv]');if(!b)return;const card=b.closest('.dx-kb__c');const cols=$$('[data-kb-col]',st);const i=cols.indexOf(card.closest('[data-kb-col]'));const n=cols[i+(+b.dataset.kbMv)];if(n){move(card,n);card.focus()}})});
  /* permissions matrix: track changes */
  $$('[data-perm]').forEach(t=>{const save=document.querySelector(t.dataset.perm);t.addEventListener('change',()=>{if(save){save.disabled=false;save.querySelector('span').textContent='Save changes'}});save&&save.addEventListener('click',()=>{save.disabled=true;save.querySelector('span').textContent='Saved'})});

  /* sidebar groups: button[data-nav-group] opens and closes its submenu; the choice is remembered,
     but the group holding the current page always starts open */
  $$('[data-nav-group]').forEach(b=>{const sub=document.getElementById(b.getAttribute('aria-controls'));
    const set=o=>{b.setAttribute('aria-expanded',String(o));sub.hidden=!o};
    if(store.get('grp:'+b.dataset.navGroup,'open')==='closed'&&!sub.querySelector('[aria-current="page"]'))set(false);
    b.addEventListener('click',()=>{const o=b.getAttribute('aria-expanded')!=='true';set(o);store.set('grp:'+b.dataset.navGroup,o?'open':'closed')})});

  /* first paint for core components */
  $$('.ds-cal').filter(c=>!c.closest('.ds-pop')).forEach(renderCal);
  $$('.ds-pager[data-init-pg]').forEach(n=>renderPager(n,+n.dataset.initPg));
  $$('.ds-range').forEach(updRange);
  const tabsInit=()=>$$('.ds-tablist').forEach(moveInd);
  requestAnimationFrame(tabsInit);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(tabsInit);
  let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(tabsInit,100)});
})();
