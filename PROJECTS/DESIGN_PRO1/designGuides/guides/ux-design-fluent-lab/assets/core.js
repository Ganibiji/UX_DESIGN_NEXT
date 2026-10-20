/* Shared utilities: popups, overlays, toasts, calendar, keyboard models */

'use strict';
/* ===================== core helpers ===================== */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const ic=(n,c='')=>`<svg class="ds-ic ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const uic=(n,c='')=>`<svg class="ui-ic ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CHECK=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 9.5 17 19 7"/></svg>`;
const SPOKES=`<svg class="ds-spin__spokes" viewBox="0 0 24 24" aria-hidden="true">${[0,1,2,3,4,5,6,7].map(i=>`<line x1="12" y1="3" x2="12" y2="7.5" transform="rotate(${i*45} 12 12)" opacity="${(0.25+i*0.107).toFixed(2)}"/>`).join('')}</svg>`;
const SC=k=>({e:'sys-f sys-e',m:'sys-a sys-m'}[k]||'sys-'+k);
const SYS={
  a:{name:'Atlassian-inspired',short:'Atlassian',tag:'Dense · productive',spec:'32px · r3–4 · 14px'},
  f:{name:'Fluent-inspired',short:'Fluent',tag:'Structured · layered',spec:'32px · r4/8 · 14px'},
  p:{name:'Apple-inspired',short:'Apple',tag:'Minimal · refined',spec:'36px · r10/14 · 15px'}
};
const KS=['a','f','p'];
let uidN=0; const uid=p=>(p||'u')+(++uidN);
const store={get(k,d){try{const v=localStorage.getItem('dsc:'+k);return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem('dsc:'+k,v)}catch(e){}}};
const S={show:store.get('show','all'),layout:store.get('layout','cols'),view:'preview',theme:store.get('theme','system'),codeSys:'a',codeFile:'html'};
const HOST_THEME=document.documentElement.getAttribute('data-theme');
const PAGES=[]; const P=o=>{PAGES.push(o);return o};
let cur=null;
const kOf=el=>el&&el.closest('[data-k]')?.dataset.k||'a';
const STATE_LABEL={default:['Default','rest'],hover:['Hover',':hover'],focus:['Focus',':focus-visible'],active:['Active / pressed',':active'],selected:['Selected','aria-selected'],disabled:['Disabled',':disabled'],loading:['Loading','aria-busy'],error:['Error','.is-error'],success:['Success','.is-success'],warning:['Warning','.is-warning'],checked:['Checked',':checked'],indeterminate:['Mixed',':indeterminate']};
const st=s=>({hover:'is-hover',focus:'is-focus',active:'is-active',selected:'is-selected',disabled:'is-disabled',loading:'is-loading',error:'is-error',success:'is-success',warning:'is-warning'}[s]||'');
const SZ={s:'ds-s',m:'',l:'ds-l'};
const SZL={s:'Small',m:'Medium',l:'Large'};
function uiToast(msg){const t=$('#ui-toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),1600)}

/* ===================== feedback: toast, snackbar ===================== */
function region(k,snack){
  const sel=`.ds-toasts.sys-${k}${snack?'.ds-toasts--snack':':not(.ds-toasts--snack)'}`;
  let r=$(sel);
  if(!r){r=document.createElement('div');r.className=`ds-toasts ${SC(k)}${snack?' ds-toasts--snack':''}`;r.dataset.k=k;r.setAttribute('role','status');r.setAttribute('aria-live','polite');document.body.append(r)}
  return r;
}
function toast(k,{title,text='',v='info',actions=''}){
  const reg=region(k);
  const icn={info:'info',success:'ok',warning:'warn',error:'err'}[v]||'info';
  const t=document.createElement('div');
  t.className=`ds-toast ds-toast--${v}`;
  t.innerHTML=`<span class="ds-toast__ic">${ic(icn)}</span><div class="ds-toast__body"><div class="ds-toast__title">${title}</div>${text?`<div class="ds-toast__text">${text}</div>`:''}${actions?`<div class="ds-toast__acts">${actions}</div>`:''}</div><button type="button" class="ds-btn ds-btn--subtle ds-ibtn ds-s" aria-label="Dismiss notification">${ic('x')}</button>`;
  reg.append(t);
  const kill=()=>{if(t.classList.contains('is-leaving'))return;t.classList.add('is-leaving');setTimeout(()=>t.remove(),200)};
  t.querySelector('.ds-ibtn').addEventListener('click',kill);
  t.querySelectorAll('.ds-btn--link').forEach(b=>b.addEventListener('click',kill));
  setTimeout(kill,4500);
  while(reg.children.length>3)reg.firstElementChild.remove();
}
function snack(k,text,action='Undo',onAct){
  const reg=region(k,true);reg.innerHTML='';
  const s=document.createElement('div');s.className='ds-snack';
  s.innerHTML=`<span>${text}</span><button type="button" class="ds-snack__act">${action}</button>`;
  reg.append(s);
  const kill=()=>{s.classList.add('is-leaving');setTimeout(()=>s.remove(),200)};
  s.querySelector('button').addEventListener('click',()=>{kill();onAct&&onAct()});
  setTimeout(kill,5000);
}

/* ===================== overlays ===================== */
const layers=[];
function openLayer(k,html,kind='modal',opener){
  const L=document.createElement('div');
  L.className=`${SC(k)} ds-layer ds-layer--${kind}`;L.dataset.k=k;
  L.innerHTML=`<div class="ds-backdrop" data-close></div>${html}`;
  document.body.append(L);layers.push(L);
  const box=L.querySelector('.ds-dialog,.ds-drawer');
  if(box){box.setAttribute('role',box.getAttribute('role')||'dialog');box.setAttribute('aria-modal','true');box.tabIndex=-1}
  requestAnimationFrame(()=>requestAnimationFrame(()=>L.classList.add('is-open')));
  const focusables=()=>$$('button:not([disabled]),[href],input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])',L).filter(e=>e.offsetParent!==null);
  setTimeout(()=>{const f=L.querySelector('[autofocus]')||focusables()[0]||box;f&&f.focus()},40);
  const close=()=>{if(L._closing)return;L._closing=true;L.classList.remove('is-open');const i=layers.indexOf(L);if(i>-1)layers.splice(i,1);setTimeout(()=>L.remove(),320);opener&&opener.focus&&opener.focus()};
  L._close=close;
  L.addEventListener('click',e=>{if(e.target.closest('[data-close]'))close()});
  L.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.stopPropagation();close()}
    if(e.key==='Tab'){const f=focusables();if(!f.length)return;const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
  });
  return L;
}

/* ===================== popups (select, menus, popovers) ===================== */
function popOf(trigger){return document.getElementById(trigger.getAttribute('aria-controls'))}
function openPop(trigger){
  closePops(trigger);
  const pop=popOf(trigger);if(!pop)return;
  pop.hidden=false;trigger.setAttribute('aria-expanded','true');pop._trigger=trigger;
  if(pop.querySelector('.ds-cal'))renderCal(pop.querySelector('.ds-cal'));
  return pop;
}
function closePop(trigger,focus){
  const pop=popOf(trigger);if(!pop)return;
  pop.hidden=true;trigger.setAttribute('aria-expanded','false');
  trigger.removeAttribute('aria-activedescendant');
  $$('.is-cur',pop).forEach(o=>o.classList.remove('is-cur'));
  if(focus)trigger.focus();
}
function closePops(except){
  $$('[aria-expanded="true"][aria-controls]').forEach(t=>{
    if(t===except)return;
    if(t.matches('.ds-acc__btn,.ds-side__item,[role="treeitem"],.nav__grp-btn,#menu-btn')||t.closest('.ds-cmd'))return;
    const pop=popOf(t);if(!pop||pop.classList.contains('ds-pop--static'))return;
    if(except&&pop.contains(except))return;
    closePop(t);
  });
  $$('.ds-pop--ctx:not([hidden])').forEach(m=>{if(!except||!m.contains(except))m.hidden=true});
}
function opts(list){return $$('.ds-opt',list).filter(o=>!o.hidden&&o.getAttribute('aria-disabled')!=='true'&&o.offsetParent!==null)}
function setCur(list,o,owner){
  $$('.is-cur',list).forEach(x=>x.classList.remove('is-cur'));
  if(!o)return;o.classList.add('is-cur');
  if(!o.id)o.id=uid('opt');
  if(owner)owner.setAttribute('aria-activedescendant',o.id);
  o.scrollIntoView({block:'nearest'});
}
function moveCur(list,dir,owner){
  const os=opts(list);if(!os.length)return;
  const i=os.findIndex(o=>o.classList.contains('is-cur'));
  let n=dir==='first'?0:dir==='last'?os.length-1:i<0?(dir>0?0:os.length-1):(i+dir+os.length)%os.length;
  setCur(list,os[n],owner);
}

/* select / listbox */
function chooseOpt(o){
  const list=o.closest('[role="listbox"]');const multi=list.getAttribute('aria-multiselectable')==='true';
  const trigger=list._trigger||document.querySelector(`[aria-controls="${list.id}"]`)||$('[aria-controls="'+list.closest('.ds-pop')?.id+'"]');
  if(multi){
    const on=o.getAttribute('aria-selected')!=='true';o.setAttribute('aria-selected',String(on));
    const host=list.closest('.ds-anchor');syncMulti(host);
    return;
  }
  $$('[aria-selected="true"]',list).forEach(x=>x.setAttribute('aria-selected','false'));
  o.setAttribute('aria-selected','true');
  const label=o.dataset.label||o.querySelector('.ds-opt__label')?.textContent||o.textContent.trim();
  const anchor=list.closest('.ds-anchor');
  const trig=anchor&&anchor.querySelector('[aria-controls]');
  if(trig){
    if(trig.tagName==='INPUT'){trig.value=label;$$('.ds-opt',list).forEach(x=>x.hidden=false)}
    else{const v=trig.querySelector('.ds-val');if(v){v.textContent=label;v.classList.remove('ds-ph')}}
    closePop(trig,true);
    trig.dispatchEvent(new CustomEvent('ds-change',{bubbles:true,detail:{value:o.dataset.value||label}}));
  }
}
function syncMulti(anchor){
  if(!anchor)return;
  const chips=anchor.querySelector('.ds-multi-chips');if(!chips)return;
  const sel=$$('.ds-opt[aria-selected="true"]',anchor);
  chips.innerHTML=sel.map(o=>`<span class="ds-tag" data-v="${esc(o.dataset.value)}">${esc(o.dataset.label)}<button type="button" class="ds-tag__x" aria-label="Remove ${esc(o.dataset.label)}">${ic('x')}</button></span>`).join('');
}

/* menus */
function focusMenu(menu,which='first'){const items=$$('[role^="menuitem"]',menu).filter(i=>i.getAttribute('aria-disabled')!=='true');if(!items.length)return;(which==='last'?items[items.length-1]:items[0]).focus()}

/* calendar */
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW=['Mo','Tu','We','Th','Fr','Sa','Su'];
const TODAY=new Date();TODAY.setHours(0,0,0,0);
const sameDay=(a,b)=>a&&b&&a.getTime()===b.getTime();
const fmtDate=d=>d?d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'';
function renderCal(cal){
  const s=cal._s||(cal._s={view:new Date(TODAY.getFullYear(),TODAY.getMonth(),1),sel:null,a:null,b:null,mode:cal.dataset.mode||'single'});
  if(cal.dataset.init&&!cal._inited){cal._inited=true;const off=+cal.dataset.init;if(s.mode==='range'){s.a=new Date(TODAY);s.b=new Date(TODAY);s.b.setDate(s.b.getDate()+off)}else{s.sel=new Date(TODAY);s.sel.setDate(s.sel.getDate()+off)}}
  const y=s.view.getFullYear(),m=s.view.getMonth();
  const first=(new Date(y,m,1).getDay()+6)%7;
  const start=new Date(y,m,1-first);
  let cells='';
  const focusDay=s.focus||s.sel||s.a||TODAY;
  for(let i=0;i<42;i++){
    const d=new Date(start);d.setDate(start.getDate()+i);
    const out=d.getMonth()!==m;
    const isSel=s.mode==='range'?(sameDay(d,s.a)||sameDay(d,s.b)):sameDay(d,s.sel);
    const inR=s.mode==='range'&&s.a&&s.b&&d>s.a&&d<s.b;
    const tab=(sameDay(d,focusDay)&&!out)||(!out&&d.getDate()===1&&!(focusDay.getMonth()===m&&focusDay.getFullYear()===y))?0:-1;
    cells+=`<button type="button" class="ds-day${out?' is-out':''}${sameDay(d,TODAY)?' is-today':''}${inR?' in-range':''}" data-t="${d.getTime()}" aria-selected="${isSel}" tabindex="${tab}" aria-label="${d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}">${d.getDate()}</button>`;
  }
  cal.innerHTML=`<div class="ds-cal__head"><button type="button" class="ds-btn ds-btn--subtle ds-ibtn ds-s" data-cal="-1" aria-label="Previous month">${ic('chev-left')}</button><span class="ds-cal__title" aria-live="polite">${MONTHS[m]} ${y}</span><button type="button" class="ds-btn ds-btn--subtle ds-ibtn ds-s" data-cal="1" aria-label="Next month">${ic('chev-right')}</button></div><div class="ds-cal__grid" role="grid">${DOW.map(d=>`<span class="ds-cal__dow" aria-hidden="true">${d}</span>`).join('')}${cells}</div>${cal.dataset.foot?`<div class="ds-cal__foot"><button type="button" class="ds-btn ds-btn--link ds-s" data-cal="today">Today</button><button type="button" class="ds-btn ds-btn--subtle ds-s" data-cal="clear">Clear</button></div>`:''}`;
}
function calPick(cal,d){
  const s=cal._s;
  const pop=cal.closest('.ds-pop');const trig=pop&&pop._trigger;
  if(s.mode==='range'){
    if(!s.a||s.b){s.a=d;s.b=null}else{if(d<s.a){s.b=s.a;s.a=d}else s.b=d}
    s.focus=d;renderCal(cal);
    const out=trig&&trig.querySelector('.ds-val');
    if(out){out.textContent=s.b?`${fmtDate(s.a)} – ${fmtDate(s.b)}`:`${fmtDate(s.a)} – Select end date`;out.classList.remove('ds-ph')}
    if(s.b&&trig){closePop(trig,true)}
    else cal.querySelector(`[data-t="${d.getTime()}"]`)?.focus();
  }else{
    s.sel=d;s.focus=d;renderCal(cal);
    const out=trig&&trig.querySelector('.ds-val');
    if(out){out.textContent=fmtDate(d);out.classList.remove('ds-ph')}
    if(trig)closePop(trig,true);else cal.querySelector(`[data-t="${d.getTime()}"]`)?.focus();
  }
}

/* tabs */
function moveInd(list){
  const ind=list.querySelector('.ds-tabind');const sel=list.querySelector('[aria-selected="true"]');
  if(!ind||!sel)return;
  const k=kOf(list);const inset=k==='p'?0:parseFloat(getComputedStyle(sel).paddingLeft)||0;
  ind.style.left=(sel.offsetLeft+inset)+'px';ind.style.width=Math.max(0,sel.offsetWidth-inset*2)+'px';
}
function selectTab(tab,focus){
  const list=tab.closest('[role="tablist"]');
  $$('[role="tab"]',list).forEach(t=>{const on=t===tab;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;const p=document.getElementById(t.getAttribute('aria-controls'));if(p)p.hidden=!on});
  moveInd(list);if(focus)tab.focus();
  list.dispatchEvent(new CustomEvent('ds-tab',{bubbles:true,detail:{tab}}));
}

/* tree */
function treeRows(tree){return $$('.ds-tree__row',tree).filter(r=>r.offsetParent!==null)}
function treeSelect(li){
  const tree=li.closest('.ds-tree');
  $$('[role="treeitem"]',tree).forEach(x=>x.setAttribute('aria-selected','false'));
  li.setAttribute('aria-selected','true');
  $$('.ds-tree__row',tree).forEach(r=>r.tabIndex=-1);
  const row=li.querySelector(':scope>.ds-tree__row');row.tabIndex=0;row.focus();
}
function treeToggle(li,force){if(!li.hasAttribute('aria-expanded'))return;const v=force!=null?force:li.getAttribute('aria-expanded')!=='true';li.setAttribute('aria-expanded',String(v))}

/* sort */
function sortTable(btn){
  const th=btn.closest('th');const table=th.closest('table');const idx=[...th.parentNode.children].indexOf(th);
  const dir=th.getAttribute('aria-sort')==='ascending'?'descending':'ascending';
  $$('th',table).forEach(h=>h.removeAttribute('aria-sort'));th.setAttribute('aria-sort',dir);
  const tb=table.tBodies[0];const rows=[...tb.rows];
  const val=r=>{const c=r.cells[idx];const v=c.dataset.v!=null?c.dataset.v:c.textContent.trim();return isNaN(+v)?v.toLowerCase():+v};
  rows.sort((a,b)=>{const x=val(a),y=val(b);return (x>y?1:x<y?-1:0)*(dir==='ascending'?1:-1)});
  rows.forEach(r=>tb.append(r));
  const live=table.closest('[data-k]')?.querySelector('.ds-sr[aria-live]');if(live)live.textContent=`Sorted by ${btn.textContent.trim()}, ${dir}`;
}

/* range slider fill */
function updRange(r){const min=+r.min||0,max=+r.max||100;const pct=((+r.value-min)/(max-min))*100;r.style.setProperty('--v',pct+'%');const out=r.closest('.ds-field')?.querySelector('.ds-slider-val');if(out)out.textContent=(r.dataset.prefix||'')+r.value+(r.dataset.unit||'')}

/* pagination */
function renderPager(nav,curP){
  const total=+nav.dataset.total;nav.dataset.cur=curP;
  const pages=[];const add=x=>pages.push(x);
  if(total<=7){for(let i=1;i<=total;i++)add(i)}
  else{add(1);if(curP>4)add('…');for(let i=Math.max(2,curP-1);i<=Math.min(total-1,curP+1);i++)add(i);if(curP<total-3)add('…');add(total)}
  nav.innerHTML=`<button type="button" class="ds-pg ds-pg--nav" data-pg="${curP-1}" aria-label="Previous page" ${curP===1?'disabled':''}>${ic('chev-left')}</button>${pages.map(x=>x==='…'?`<span class="ds-pg-ell" aria-hidden="true">…</span>`:`<button type="button" class="ds-pg" data-pg="${x}" ${x===curP?'aria-current="page"':''} aria-label="Page ${x}">${x}</button>`).join('')}<button type="button" class="ds-pg ds-pg--nav" data-pg="${curP+1}" aria-label="Next page" ${curP===total?'disabled':''}>${ic('chev-right')}</button>`;
  const per=+nav.dataset.per||10,items=+nav.dataset.items||total*per;
  const info=nav.parentElement.querySelector('[data-pager-out]');
  if(info)info.textContent=`Showing ${(curP-1)*per+1}–${Math.min(curP*per,items)} of ${items}`;
}

/* stepper */
function setStep(box,i){
  const steps=$$('.ds-step',box);i=Math.max(0,Math.min(steps.length,i));box.dataset.i=i;
  steps.forEach((s,n)=>{s.classList.toggle('is-done',n<i);s.classList.toggle('is-current',n===i);s.removeAttribute('aria-current');if(n===i)s.setAttribute('aria-current','step');const d=s.querySelector('.ds-step__dot');if(d)d.innerHTML=n<i?ic('check'):String(n+1)});
  const back=box.querySelector('[data-step="-1"]'),next=box.querySelector('[data-step="1"]');
  if(back)back.disabled=i===0;
  if(next){next.querySelector('span').textContent=i>=steps.length-1?'Finish':'Continue';next.disabled=i>=steps.length}
  const out=box.querySelector('[data-step-out]');if(out)out.textContent=i>=steps.length?'All steps complete.':`Step ${i+1} of ${steps.length}: ${steps[i].querySelector('b').textContent}`;
}

/* ===================== global delegation ===================== */
document.addEventListener('click',e=>{
  const t=e.target;
  const pageCtl=t.closest('[data-show],[data-layout],[data-view],[data-code-sys],[data-code-file]');
  if(pageCtl&&pageCtl.closest('.top,.pg-bar,.code-shell'))return; // handled by portal
  if(!t.closest('[data-k]')){closePops();return}
  const k=kOf(t);
  let el;

  // close floating things when clicking elsewhere
  if(!t.closest('.ds-anchor,.ds-pop'))closePops();

  if((el=t.closest('.ds-tab'))&&!el.disabled&&el.getAttribute('aria-disabled')!=='true'){selectTab(el);return}
  if((el=t.closest('[data-cal]'))){const cal=el.closest('.ds-cal');const s=cal._s;const v=el.dataset.cal;
    if(v==='today'){calPick(cal,new Date(TODAY));return}
    if(v==='clear'){s.sel=null;s.a=s.b=null;renderCal(cal);const trig=cal.closest('.ds-pop')?._trigger;const out=trig&&trig.querySelector('.ds-val');if(out){out.textContent=out.dataset.ph||'Select a date';out.classList.add('ds-ph')}return}
    s.view=new Date(s.view.getFullYear(),s.view.getMonth()+(+v),1);s.focus=null;renderCal(cal);cal.querySelector(`[data-cal="${v}"]`)?.focus();return}
  if((el=t.closest('.ds-day'))){calPick(el.closest('.ds-cal'),new Date(+el.dataset.t));return}
  if((el=t.closest('.ds-tag__x'))){const tag=el.closest('.ds-tag');const anchor=tag.closest('.ds-anchor');
    if(anchor){const o=$$('.ds-opt',anchor).find(o=>o.dataset.value===tag.dataset.v);if(o)o.setAttribute('aria-selected','false');syncMulti(anchor);anchor.querySelector('input')?.focus()}
    else{const wrap=tag.parentElement;tag.remove();toast(k,{title:'Label removed',text:`“${tag.textContent.trim()}” was removed from this issue.`});wrap.querySelector('.ds-tag__x')?.focus()}
    e.stopPropagation();return}
  if((el=t.closest('[data-ds="select"],[data-ds="pop"],[data-ds="date"]'))){
    if(el.getAttribute('aria-expanded')==='true')closePop(el);else{const pop=openPop(el);if(pop&&el.dataset.ds==='select'){const s=pop.querySelector('[aria-selected="true"]')||opts(pop)[0];setCur(pop,s,el)}if(pop&&el.dataset.ds==='date'){setTimeout(()=>pop.querySelector('.ds-day[tabindex="0"]')?.focus(),10)}}
    return}
  if((el=t.closest('[data-ds="menu"]'))){
    if(el.getAttribute('aria-expanded')==='true')closePop(el);else{const pop=openPop(el);if(pop)focusMenu(pop)}return}
  if((el=t.closest('.ds-opt[role="option"]'))){chooseOpt(el);return}
  if((el=t.closest('[role="menuitemcheckbox"]'))){el.setAttribute('aria-checked',String(el.getAttribute('aria-checked')!=='true'));return}
  if((el=t.closest('[role="menuitem"]'))&&el.getAttribute('aria-disabled')!=='true'){
    const menu=el.closest('.ds-pop');const label=el.querySelector('.ds-opt__label')?.textContent||el.textContent.trim();
    if(menu&&!menu.classList.contains('ds-pop--static')){if(menu.classList.contains('ds-pop--ctx'))menu.hidden=true;else{const tr=menu._trigger;tr?closePop(tr,true):menu.hidden=true}}
    toast(k,{title:label,text:el.dataset.msg||'Action ran on DS-142.',v:el.classList.contains('ds-opt--danger')?'warning':'info'});return}
  if((el=t.closest('.ds-combo-toggle'))){const inp=el.closest('.ds-control').querySelector('input');if(inp.getAttribute('aria-expanded')==='true')closePop(inp);else{openPop(inp);inp.focus()}return}
  if((el=t.closest('[data-ds="feedback"]'))){el.setAttribute('aria-busy','true');setTimeout(()=>{el.removeAttribute('aria-busy');toast(k,{title:el.dataset.title||'Issue created',text:el.dataset.text||'DS-142 “Migrate billing tables” was added to the backlog.',v:'success',actions:`<button type="button" class="ds-btn ds-btn--link ds-s">View issue</button>`})},900);return}
  if((el=t.closest('[data-ds="toast"]'))){toast(k,{title:el.dataset.title,text:el.dataset.text,v:el.dataset.v||'info',actions:el.dataset.v==='error'?`<button type="button" class="ds-btn ds-btn--link ds-s">Retry</button>`:''});return}
  if((el=t.closest('[data-ds="snack"]'))){snack(k,el.dataset.text||'3 issues archived','Undo',()=>toast(k,{title:'Restored',text:'3 issues are back in the backlog.',v:'success'}));return}
  if((el=t.closest('[data-ds="seg"] > .ds-btn'))){$$('.ds-btn',el.parentElement).forEach(b=>b.setAttribute('aria-pressed',String(b===el)));return}
  if((el=t.closest('[data-ds="toggle"]'))){el.setAttribute('aria-pressed',String(el.getAttribute('aria-pressed')!=='true'));return}
  if((el=t.closest('.ds-chip'))&&!el.closest('[data-filter]')){el.setAttribute('aria-pressed',String(el.getAttribute('aria-pressed')!=='true'));return}
  if((el=t.closest('[data-pg]'))){renderPager(el.closest('.ds-pager'),+el.dataset.pg);el.closest('[data-k]').querySelector(`.ds-pager [data-pg="${el.dataset.pg}"][aria-current]`)?.focus();return}
  if((el=t.closest('[data-step]'))){const box=el.closest('[data-steps]');setStep(box,(+box.dataset.i||0)+(+el.dataset.step));return}
  if((el=t.closest('.ds-tree__row'))){const li=el.parentElement;if(t.closest('.ds-tree__tw')||li.hasAttribute('aria-expanded')&&li.getAttribute('aria-selected')==='true')treeToggle(li);treeSelect(li);return}
  if((el=t.closest('.ds-sort'))){sortTable(el);return}
  if((el=t.closest('.ds-acc__btn'))){const on=el.getAttribute('aria-expanded')!=='true';el.setAttribute('aria-expanded',String(on));document.getElementById(el.getAttribute('aria-controls')).hidden=!on;return}
  if((el=t.closest('[data-ds="dismiss"]'))){const box=el.closest('.ds-alert,.ds-banner');box.hidden=true;const stage=box.closest('[data-k]');if(!stage.querySelector('[data-ds="restore"]')){stage.insertAdjacentHTML('beforeend',`<button type="button" class="ds-btn ds-btn--link ds-s" data-ds="restore">Show dismissed messages</button>`)}stage.querySelector('[data-ds="restore"]').focus();return}
  if((el=t.closest('[data-ds="restore"]'))){const stage=el.closest('[data-k]');$$('.ds-alert[hidden],.ds-banner[hidden]',stage).forEach(a=>a.hidden=false);el.remove();return}
  if((el=t.closest('[data-ds="progress"]'))){runProgress(el.closest('[data-k]'));return}
  if((el=t.closest('[data-ds="skel"]'))){const box=el.closest('[data-k]');const on=box.querySelector('[data-skel-real]').hidden;box.querySelector('[data-skel-real]').hidden=!on;box.querySelector('[data-skel-ph]').hidden=on;el.querySelector('span').textContent=on?'Show loading state':'Show loaded content';return}
  if((el=t.closest('[data-ds="layer"]'))){const tpl=document.getElementById(el.dataset.tpl);const L=openLayer(k,tpl.innerHTML,el.dataset.kind||'modal',el);if(el.dataset.kind==='cmd')initCmd(L);return}
  if((el=t.closest('.ds-swatch'))){const grp=el.closest('[role="radiogroup"]');$$('.ds-swatch',grp).forEach(s=>{s.setAttribute('aria-checked',String(s===el));s.tabIndex=s===el?0:-1});setColor(el.closest('[data-color]'),el.dataset.hex);return}
  if((el=t.closest('.ds-side__item'))){
    if(el.hasAttribute('aria-expanded')){const on=el.getAttribute('aria-expanded')!=='true';el.setAttribute('aria-expanded',String(on));document.getElementById(el.getAttribute('aria-controls')).hidden=!on;return}
    $$('.ds-side__item',el.closest('.ds-side')).forEach(i=>i.removeAttribute('aria-current'));el.setAttribute('aria-current','page');return}
  if((el=t.closest('.ds-hnav a'))){e.preventDefault();$$('a',el.parentElement).forEach(a=>a.removeAttribute('aria-current'));el.setAttribute('aria-current','page');return}
  if((el=t.closest('.ds-crumb,.ds-link,.ds-card--interactive a,[data-noop]'))){e.preventDefault();if(el.classList.contains('ds-crumb'))toast(k,{title:'Navigate',text:`Opens “${el.textContent.trim()}”.`});return}
  if((el=t.closest('.ds-li'))&&el.closest('[data-selectable]')){$$('.ds-li',el.parentElement).forEach(l=>l.setAttribute('aria-selected',String(l===el)));return}
  if((el=t.closest('.ds-card--interactive'))&&el.closest('[data-selectable]')){$$('.ds-card--interactive',el.closest('[data-selectable]')).forEach(c=>c.setAttribute('aria-selected',String(c===el)));return}
});

document.addEventListener('keydown',e=>{
  const t=e.target;
  if(!t.closest||!t.closest('[data-k]'))return;
  const k=kOf(t);let el;
  // tablist arrows
  if((el=t.closest('.ds-tab'))){
    const tabs=$$('[role="tab"]',el.parentElement).filter(x=>!x.disabled);const i=tabs.indexOf(el);let n=null;
    if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;
    if(n!=null){e.preventDefault();selectTab(tabs[n],true)}return}
  // select / combobox trigger
  if(t.matches('[data-ds="select"],[data-ds="combo"],[data-ds="multi"]')){
    const pop=popOf(t);const open=t.getAttribute('aria-expanded')==='true';
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!open){openPop(t);const s=pop.querySelector('[aria-selected="true"]');s&&t.dataset.ds==='select'?setCur(pop,s,t):moveCur(pop,e.key==='ArrowDown'?'first':'last',t)}else moveCur(pop,e.key==='ArrowDown'?1:-1,t);return}
    if(open&&(e.key==='Home'||e.key==='End')&&t.dataset.ds==='select'){e.preventDefault();moveCur(pop,e.key==='Home'?'first':'last',t);return}
    if(e.key==='Enter'||(e.key===' '&&t.dataset.ds==='select')){if(open){const c=pop.querySelector('.is-cur');if(c){e.preventDefault();chooseOpt(c);if(t.dataset.ds==='multi')t.value='',filterList(t)}}else if(t.dataset.ds==='select'){e.preventDefault();openPop(t);setCur(pop,pop.querySelector('[aria-selected="true"]')||opts(pop)[0],t)}return}
    if(e.key==='Escape'&&open){e.preventDefault();closePop(t,true);return}
    if(e.key==='Backspace'&&t.dataset.ds==='multi'&&!t.value){const anchor=t.closest('.ds-anchor');const sel=$$('.ds-opt[aria-selected="true"]',anchor);if(sel.length){sel[sel.length-1].setAttribute('aria-selected','false');syncMulti(anchor)}}
    if(e.key==='Tab'&&open)closePop(t);
    return}
  // menus
  if((el=t.closest('[role="menu"]'))&&t.matches('[role^="menuitem"]')){
    const items=$$('[role^="menuitem"]',el).filter(i=>i.getAttribute('aria-disabled')!=='true');const i=items.indexOf(t);
    if(e.key==='ArrowDown'){e.preventDefault();items[(i+1)%items.length].focus()}
    else if(e.key==='ArrowUp'){e.preventDefault();items[(i-1+items.length)%items.length].focus()}
    else if(e.key==='Home'){e.preventDefault();items[0].focus()}
    else if(e.key==='End'){e.preventDefault();items[items.length-1].focus()}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();t.click()}
    else if(e.key==='Escape'||e.key==='Tab'){const pop=t.closest('.ds-pop');if(pop&&!pop.classList.contains('ds-pop--static')){if(pop._trigger)closePop(pop._trigger,e.key==='Escape');else{pop.hidden=true;pop.closest('[data-ds="ctx"]')?.focus()}}if(e.key==='Escape')e.preventDefault()}
    return}
  if(t.matches('[data-ds="menu"]')&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();const pop=openPop(t);focusMenu(pop,e.key==='ArrowUp'?'last':'first');return}
  // context menu by keyboard
  if(t.matches('[data-ds="ctx"]')&&(e.key==='ContextMenu'||(e.shiftKey&&e.key==='F10'))){e.preventDefault();openCtx(t,16,16);return}
  // calendar grid keys
  if((el=t.closest('.ds-day'))){
    const cal=el.closest('.ds-cal');const d=new Date(+el.dataset.t);const map={ArrowRight:1,ArrowLeft:-1,ArrowDown:7,ArrowUp:-7};
    if(map[e.key]!=null||e.key==='PageDown'||e.key==='PageUp'){e.preventDefault();const n=new Date(d);if(map[e.key]!=null)n.setDate(d.getDate()+map[e.key]);else n.setMonth(d.getMonth()+(e.key==='PageDown'?1:-1));cal._s.focus=n;cal._s.view=new Date(n.getFullYear(),n.getMonth(),1);renderCal(cal);cal.querySelector(`[data-t="${n.getTime()}"]`)?.focus();return}
    if(e.key==='Escape'){const tr=cal.closest('.ds-pop')?._trigger;if(tr){e.preventDefault();closePop(tr,true)}}
    return}
  if(e.key==='Escape'){
    const pop=t.closest('.ds-pop,.ds-popover');if(pop&&!pop.classList.contains('ds-pop--static')){const tr=pop._trigger||document.querySelector(`[aria-controls="${pop.id}"]`);if(tr){e.preventDefault();closePop(tr,true);return}}
    if(t.matches('[data-ds="pop"],[data-ds="date"]')&&t.getAttribute('aria-expanded')==='true'){closePop(t);return}
    const tw=t.closest('.ds-tipwrap');if(tw){tw.classList.add('is-off');return}
  }
  // tree
  if((el=t.closest('.ds-tree__row'))){
    const tree=el.closest('.ds-tree');const rows=treeRows(tree);const i=rows.indexOf(el);const li=el.parentElement;
    const exp=li.getAttribute('aria-expanded');
    if(e.key==='ArrowDown'){e.preventDefault();rows[i+1]&&(rows.forEach(r=>r.tabIndex=-1),rows[i+1].tabIndex=0,rows[i+1].focus())}
    else if(e.key==='ArrowUp'){e.preventDefault();rows[i-1]&&(rows.forEach(r=>r.tabIndex=-1),rows[i-1].tabIndex=0,rows[i-1].focus())}
    else if(e.key==='ArrowRight'){e.preventDefault();if(exp==='false')treeToggle(li,true);else if(exp==='true'){const c=li.querySelector('[role="group"] .ds-tree__row');c&&(c.tabIndex=0,c.focus())}}
    else if(e.key==='ArrowLeft'){e.preventDefault();if(exp==='true')treeToggle(li,false);else{const p=li.parentElement.closest('[role="treeitem"]');p&&p.querySelector(':scope>.ds-tree__row').focus()}}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();treeSelect(li)}
    else if(e.key==='Home'){e.preventDefault();rows[0].focus()}else if(e.key==='End'){e.preventDefault();rows[rows.length-1].focus()}
    return}
  // radiogroup swatches
  if((el=t.closest('.ds-swatch'))&&['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();const all=$$('.ds-swatch',el.closest('[role="radiogroup"]'));const i=all.indexOf(el);const n=all[(i+(e.key==='ArrowRight'||e.key==='ArrowDown'?1:-1)+all.length)%all.length];n.click();n.focus();return}
  // editable cell / list selection via Enter
  if(e.key==='Enter'&&(el=t.closest('.ds-li,.ds-card--interactive'))){el.click();return}
});
document.addEventListener('focusout',e=>{const tw=e.target.closest&&e.target.closest('.ds-tipwrap');if(tw)tw.classList.remove('is-off')});
document.addEventListener('mouseout',e=>{const tw=e.target.closest&&e.target.closest('.ds-tipwrap.is-off');if(tw&&!tw.contains(e.relatedTarget))tw.classList.remove('is-off')});

function filterList(input){
  const pop=popOf(input);if(!pop)return;const q=input.value.trim().toLowerCase();let n=0;
  $$('.ds-opt',pop).forEach(o=>{const lab=o.dataset.label||o.textContent.trim();const hit=!q||lab.toLowerCase().includes(q);o.hidden=!hit;if(hit)n++;const l=o.querySelector('.ds-opt__label');if(l)l.innerHTML=q&&hit?esc(lab).replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','i'),'<mark>$1</mark>'):esc(lab)});
  let empty=pop.querySelector('.ds-empty');
  if(!n){if(!empty){empty=document.createElement('div');empty.className='ds-empty';pop.append(empty)}empty.textContent=`No matches for “${input.value}”`}else if(empty)empty.remove();
  moveCur(pop,'first',input);
}
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.matches('[data-ds="combo"],[data-ds="multi"]')){if(t.getAttribute('aria-expanded')!=='true')openPop(t);filterList(t);return}
  if(t.matches('.ds-range')){updRange(t);return}
});
document.addEventListener('focusin',e=>{const t=e.target;if(t.matches&&t.matches('[data-ds="combo"],[data-ds="multi"]')&&t.getAttribute('aria-expanded')!=='true'&&t.dataset.openOnFocus!=null){openPop(t);filterList(t)}});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.matches('.ds-drop input[type="file"]')){addFiles(t.closest('[data-k]'),[...t.files].map(f=>({name:f.name,size:f.size})));t.value='';return}
  if(t.matches('[data-color] input[type="color"]')){setColor(t.closest('[data-color]'),t.value.toUpperCase(),true);return}
  if(t.matches('[data-color] .ds-hex')){let v=t.value.trim();if(!v.startsWith('#'))v='#'+v;const f=t.closest('.ds-field');if(/^#[0-9a-f]{6}$/i.test(v)){f.classList.remove('is-error');f.querySelector('.ds-help').innerHTML='Hex value, 6 digits';setColor(t.closest('[data-color]'),v.toUpperCase(),true)}else{f.classList.add('is-error');f.querySelector('.ds-help').innerHTML=`${ic('err')}Enter 6 hex digits, for example #2F7D6A`}return}
});
document.addEventListener('contextmenu',e=>{const area=e.target.closest&&e.target.closest('[data-ds="ctx"]');if(!area)return;e.preventDefault();const r=area.getBoundingClientRect();openCtx(area,e.clientX-r.left,e.clientY-r.top)});
function openCtx(area,x,y){closePops();const m=area.querySelector('.ds-pop--ctx');m.hidden=false;const w=m.offsetWidth,h=m.offsetHeight;m.style.left=Math.min(x,area.clientWidth-w-4)+'px';m.style.top=Math.min(y,Math.max(4,area.clientHeight-h-4))+'px';focusMenu(m)}
['dragenter','dragover'].forEach(ev=>document.addEventListener(ev,e=>{const d=e.target.closest&&e.target.closest('.ds-drop');if(d)d.classList.add('is-over')}));
['dragleave','drop'].forEach(ev=>document.addEventListener(ev,e=>{const d=e.target.closest&&e.target.closest('.ds-drop');if(d)d.classList.remove('is-over')}));

function fmtSize(b){return b>1048576?(b/1048576).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB'}
function fileRow(f,done){return `<li class="ds-file">${ic('file')}<div class="ds-file__meta"><span class="ds-file__name">${esc(f.name)}</span>${done?`<span class="ds-file__sub">${fmtSize(f.size)} · Uploaded</span>`:`<div class="ds-prog ds-s"><div class="ds-prog__track" role="progressbar" aria-label="Uploading ${esc(f.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="ds-prog__bar" style="--v:0%"></div></div></div>`}</div><button type="button" class="ds-btn ds-btn--subtle ds-ibtn ds-s" aria-label="Remove ${esc(f.name)}" data-rm-file>${ic('x')}</button></li>`}
function addFiles(stage,files){
  const list=stage.querySelector('.ds-files');if(!list)return;
  files.forEach(f=>{list.insertAdjacentHTML('beforeend',fileRow(f,false));const li=list.lastElementChild;const bar=li.querySelector('.ds-prog__bar'),tr=li.querySelector('[role="progressbar"]');let v=0;const tm=setInterval(()=>{v=Math.min(100,v+8+Math.random()*18);bar.style.setProperty('--v',v+'%');tr.setAttribute('aria-valuenow',Math.round(v));if(v>=100){clearInterval(tm);li.outerHTML=fileRow(f,true)}},180)});
}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-rm-file]');if(b)b.closest('.ds-file').remove()});
function setColor(box,hex,fromInput){
  box.querySelector('.ds-color-preview').style.setProperty('--c',hex);
  const hx=box.querySelector('.ds-hex');if(hx&&!fromInput)hx.value=hex;if(hx&&fromInput)hx.value=hex;
  const nat=box.querySelector('input[type="color"]');if(nat)nat.value=hex.toLowerCase();
  const out=box.querySelector('[data-color-out]');if(out)out.textContent=hex;
  if(fromInput)$$('.ds-swatch',box).forEach(s=>{const on=s.dataset.hex.toUpperCase()===hex.toUpperCase();s.setAttribute('aria-checked',String(on))});
}
function runProgress(stage){
  $$('[data-prog-run]',stage).forEach((p,i)=>{const bar=p.querySelector('.ds-prog__bar');const tr=p.querySelector('[role="progressbar"]');const lab=p.querySelector('.ds-prog__head span');let v=0;clearInterval(p._t);p.classList.remove('ds-prog--success');
    p._t=setInterval(()=>{v=Math.min(100,v+3+Math.random()*7);bar.style.setProperty('--v',v+'%');tr.setAttribute('aria-valuenow',Math.round(v));if(lab)lab.textContent=Math.round(v)+'%';if(v>=100){clearInterval(p._t);p.classList.add('ds-prog--success');if(lab)lab.textContent='Done';const h=p.querySelector('.ds-prog__help');if(h)h.textContent='Import finished: 1,284 records'}},120+i*40)});
  $$('.ds-ring',stage).forEach(r=>{let v=0;clearInterval(r._t);r._t=setInterval(()=>{v=Math.min(100,v+4);r.style.setProperty('--v',v);r.querySelector('span').textContent=v+'%';r.setAttribute('aria-valuenow',v);if(v>=100)clearInterval(r._t)},90)});
}

/* command palette */
const CMDS=[
  {g:'Suggested',l:'Create issue',ic:'plus',kbd:'C'},{g:'Suggested',l:'Search issues',ic:'search',kbd:'/'},{g:'Suggested',l:'Assign to me',ic:'user',kbd:'I'},
  {g:'Navigation',l:'Go to Backlog',ic:'list',kbd:'G B'},{g:'Navigation',l:'Go to Board',ic:'grid',kbd:'G O'},{g:'Navigation',l:'Go to Reports',ic:'chart',kbd:'G R'},{g:'Navigation',l:'Open project settings',ic:'sliders'},
  {g:'Recent',l:'DS-142 Migrate billing tables',ic:'file'},{g:'Recent',l:'DS-139 Audit focus rings',ic:'file'},{g:'Recent',l:'Q3 roadmap review',ic:'calendar'}
];
function initCmd(L){
  const inp=L.querySelector('input');const list=L.querySelector('[role="listbox"]');const k=L.dataset.k;
  const draw=()=>{const q=inp.value.trim().toLowerCase();const hits=CMDS.filter(c=>!q||c.l.toLowerCase().includes(q));let g='';let html='';
    hits.forEach((c,i)=>{if(c.g!==g){g=c.g;html+=`<div class="ds-menu__head" role="presentation">${g}</div>`}const lab=q?esc(c.l).replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','i'),'<mark>$1</mark>'):esc(c.l);html+=`<div class="ds-opt" role="option" id="${L.dataset.k}-cmd-${i}" data-label="${esc(c.l)}">${ic(c.ic)}<span class="ds-opt__label">${lab}</span>${c.kbd?`<kbd>${c.kbd}</kbd>`:''}</div>`});
    list.innerHTML=html||`<div class="ds-empty">No commands match “${esc(inp.value)}”. Try “issue” or “go to”.</div>`;moveCur(list,'first',inp)};
  draw();
  inp.addEventListener('input',draw);
  inp.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();moveCur(list,1,inp)}else if(e.key==='ArrowUp'){e.preventDefault();moveCur(list,-1,inp)}else if(e.key==='Enter'){e.preventDefault();const c=list.querySelector('.is-cur');if(c)run(c)}});
  list.addEventListener('click',e=>{const o=e.target.closest('.ds-opt');if(o)run(o)});
  list.addEventListener('mousemove',e=>{const o=e.target.closest('.ds-opt');if(o&&!o.classList.contains('is-cur'))setCur(list,o,inp)});
  function run(o){L._close();toast(k,{title:o.dataset.label,text:'Command ran from the palette.'})}
}

/* ===================== code view helpers ===================== */
function prettyHTML(src){
  const tokens=src.replace(/>\s+</g,'><').replace(/\s{2,}/g,' ').trim().split(/(<[^>]+>)/).filter(s=>s&&s.trim());
  const voids=/^<(input|br|img|hr|use|meta|link|circle|line|path|rect|source|col)\b/i;
  const out=[];let ind=0;const pad=()=>'  '.repeat(ind);
  for(let i=0;i<tokens.length;i++){
    const t=tokens[i];
    if(t.startsWith('<svg')){let s=t;while(i+1<tokens.length&&!tokens[i].startsWith('</svg')){i++;s+=tokens[i]}out.push(pad()+s.replace(/<path d="[^"]{40,}"\/>/g,'<path d="…"/>'));continue}
    if(t.startsWith('</')){ind=Math.max(0,ind-1);out.push(pad()+t);continue}
    if(t.startsWith('<')){
      if(!voids.test(t)&&!t.endsWith('/>')&&tokens[i+1]&&!tokens[i+1].startsWith('<')&&tokens[i+2]&&tokens[i+2].startsWith('</')){out.push(pad()+t+tokens[i+1].trim()+tokens[i+2]);i+=2;continue}
      out.push(pad()+t);if(!voids.test(t)&&!t.endsWith('/>')&&!t.startsWith('<!'))ind++;continue}
    out.push(pad()+t.trim());
  }
  return out.join('\n');
}
function hlHTML(s){
  return esc(s).replace(/([\w:-]+)=(&quot;[^&]*?&quot;|"[^"]*")/g,'\u0001at\u0002$1\u0003=\u0001s\u0002$2\u0003').replace(/(&lt;\/?)([\w-]+)/g,'$1\u0001t\u0002$2\u0003').replace(/\u0001(\w+)\u0002/g,'<span class="$1">').replace(/\u0003/g,'</span>');
}
function hlCSS(s){
  return esc(s).replace(/(\/\*[\s\S]*?\*\/)/g,'\u0001c\u0002$1\u0003').replace(/^([^\s{][^{\n]*)\{/gm,'\u0001t\u0002$1\u0003{').replace(/(^|\s)(--?[\w-]+)(\s*:)/gm,'$1\u0001pr\u0002$2\u0003$3').replace(/\u0001(\w+)\u0002/g,'<span class="$1">').replace(/\u0003/g,'</span>');
}
function clsRegex(classes){return new RegExp('\\.('+classes.map(c=>c.replace(/[-]/g,'\\-')).join('|')+')(?![a-z0-9])')}
function fmtRule(t){return t.replace(/\s*\{\s*/,' {\n  ').replace(/;\s*(?=\S)/g,';\n  ').replace(/\s*\}\s*$/,'\n}')}
function cssFor(k,classes){
  const sheet=$('#ds-css').sheet;const re=clsRegex(classes);const out=[];
  for(const r of sheet.cssRules){
    if(!r.selectorText)continue;const sel=r.selectorText;
    if(!re.test(sel))continue;
    if(/\.sys-[afp]/.test(sel)&&!sel.includes('.sys-'+k))continue;
    if(/data-theme/.test(sel))continue;
    out.push(fmtRule(r.cssText));
  }
  return `/* ${SYS[k].name} — rules for ${classes.map(c=>'.'+c).join(', ')} */\n`+out.join('\n');
}
function tokenMap(k){
  const sheet=$('#ds-css').sheet;const map={};
  for(const r of sheet.cssRules){if(r.selectorText===`.sys-${k}`){for(let i=0;i<r.style.length;i++){const p=r.style[i];if(p.startsWith('--'))map[p]=r.style.getPropertyValue(p).trim()}}}
  return map;
}
function tokensFor(k,classes){
  const css=cssFor(k,classes);const map=tokenMap(k);const used=new Set();
  const visit=txt=>{for(const m of txt.matchAll(/var\((--[\w-]+)/g)){if(!used.has(m[1])&&map[m[1]]!=null){used.add(m[1]);visit(map[m[1]])}}};
  visit(css);
  const pre=`--${k}-`;const own=[...used].filter(n=>n.startsWith(pre)).sort();const alias=[...used].filter(n=>!n.startsWith(pre));
  return `/* ${SYS[k].name} — tokens this component reads */\n.sys-${k} {\n  /* design tokens */\n${own.map(n=>`  ${n}: ${map[n]};`).join('\n')}\n\n  /* semantic + component aliases */\n${alias.map(n=>`  ${n}: ${map[n]};`).join('\n')}\n}`;
}
