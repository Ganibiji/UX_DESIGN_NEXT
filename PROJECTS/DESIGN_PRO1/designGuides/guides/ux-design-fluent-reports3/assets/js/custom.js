'use strict';
/* Custom dashboard: reorder (drag or keyboard), resize, remove and re-add widgets; layout persists per browser. */
(function(){
  const {$,$$,esc,ic}=RA;
  const box=$('[data-cust]');if(!box)return;
  const all=$$('[data-wid]',box),byId=Object.fromEntries(all.map(n=>[n.dataset.wid,n]));
  const base=all.map(n=>({id:n.dataset.wid,span:[...n.classList].find(c=>/^s-\d+$/.test(c))}));
  let L;try{L=JSON.parse(RA.store.get('custom:layout',''))}catch(e){L=null}
  if(!L||!Array.isArray(L.items))L={items:base.map(x=>({...x})),hidden:[]};
  const SIZES=['s-4','s-6','s-8','s-12'];
  const msg=$('[data-cust-msg]');
  function apply(){
    all.forEach(n=>n.remove());
    L.items.forEach(it=>{const n=byId[it.id];if(!n)return;SIZES.concat(['s-3']).forEach(c=>n.classList.remove(c));n.classList.add(it.span);box.appendChild(n)});
    RA.store.set('custom:layout',JSON.stringify(L));
    setTimeout(()=>RA.emit('ra:layout'),30);
    msg&&(msg.textContent=`${L.items.length} widgets · ${L.hidden.length} in catalog · saved in this browser`);
  }
  let editing=false;
  function setEdit(on){editing=on;box.classList.toggle('is-edit',on);const b=$('[data-cust-edit]');b.setAttribute('aria-pressed',String(on));b.innerHTML=on?`${ic('checkmark')}Done`:`${ic('edit')}Customize`;
    all.forEach(n=>{if(on)n.setAttribute('draggable','true');else n.removeAttribute('draggable')});
    if(on)RA.toast('Customize mode',{icon:'edit',text:'Drag cards to reorder. Alt+←/→ moves the focused card.'})}
  document.addEventListener('click',e=>{const t=e.target;let n;
    if(t.closest('[data-cust-edit]')){setEdit(!editing);return}
    if(t.closest('[data-cust-reset]')){L={items:base.map(x=>({...x})),hidden:[]};apply();RA.toast('Layout reset',{icon:'arrow_reset'});return}
    if(t.closest('[data-cust-add]')){catalog();return}
    if((n=t.closest('[data-cust-rm]'))){const id=n.closest('[data-wid]').dataset.wid;L.items=L.items.filter(x=>x.id!==id);L.hidden.push(id);apply();RA.toast('Widget removed',{icon:'dismiss',text:'Bring it back from Add widget.'});return}
    if((n=t.closest('[data-cust-size]'))){const id=n.closest('[data-wid]').dataset.wid,it=L.items.find(x=>x.id===id);it.span=SIZES[(SIZES.indexOf(it.span)+1)%SIZES.length];apply();RA.toast(`Width: ${it.span.slice(2)} of 12 columns`,{icon:'arrow_maximize'});return}
  });
  function catalog(){
    const d=RA.drawer({title:'Add widget',body:L.hidden.length?'<p class="muted" style="font:var(--t-cap)">Removed widgets live here until you add them back.</p><div class="presets">'+L.hidden.map(id=>`<button type="button" class="menu__i" data-cat="${id}">${ic('add')}<span>${esc(byId[id].querySelector('h3').textContent)}</span></button>`).join('')+'</div>'
      :`<div class="state" style="min-height:160px"><div class="state__ico">${ic('apps')}</div><b>Every widget is on the dashboard</b><p>Remove one in Customize mode and it appears here.</p></div>`,footer:'<button class="btn btn--primary" data-close>Done</button>'});
    d.el.addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;const id=b.dataset.cat;L.hidden=L.hidden.filter(x=>x!==id);L.items.push(base.find(x=>x.id===id));apply();b.remove();RA.toast('Widget added',{kind:'ok'})});
  }
  let drag=null;
  box.addEventListener('dragstart',e=>{if(!editing)return;const n=e.target.closest('[data-wid]');if(!n)return;drag=n;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',n.dataset.wid)});
  box.addEventListener('dragover',e=>{if(!drag)return;e.preventDefault();const n=e.target.closest('[data-wid]');$$('.is-drop',box).forEach(x=>x!==n&&x.classList.remove('is-drop'));n&&n!==drag&&n.classList.add('is-drop')});
  box.addEventListener('drop',e=>{if(!drag)return;e.preventDefault();const n=e.target.closest('[data-wid]');$$('.is-drop',box).forEach(x=>x.classList.remove('is-drop'));
    if(n&&n!==drag){const a=L.items.findIndex(x=>x.id===drag.dataset.wid),[it]=L.items.splice(a,1),b=L.items.findIndex(x=>x.id===n.dataset.wid);L.items.splice(b,0,it);apply()}drag=null});
  box.addEventListener('dragend',()=>{drag=null;$$('.is-drop',box).forEach(x=>x.classList.remove('is-drop'))});
  box.addEventListener('keydown',e=>{if(!editing||!e.altKey||!['ArrowLeft','ArrowRight'].includes(e.key))return;const n=e.target.closest('[data-wid]');if(!n)return;e.preventDefault();
    const i=L.items.findIndex(x=>x.id===n.dataset.wid),j=i+(e.key==='ArrowRight'?1:-1);if(j<0||j>=L.items.length)return;const [it]=L.items.splice(i,1);L.items.splice(j,0,it);apply();n.querySelector('[data-cc-details]').focus()});
  apply();
})();
