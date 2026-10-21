'use strict';
/* =====================================================================
   Reports & Analytics — application shell.
   Theme, chart-engine selection and loading, sidebar, header menus,
   dialogs / drawers / toasts, page filters and KPI refresh.
   Everything hangs off window.RA so charts.js, table.js and builder.js
   share one state and one event bus (CustomEvents on document).
   ===================================================================== */
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ic=(n,c='')=>`<svg class="ic ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const store={get(k,d){try{const v=localStorage.getItem('ra:'+k);return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem('ra:'+k,v)}catch(e){}}};
  const ROOT=document.body.dataset.root||'';
  const emit=(n,d)=>document.dispatchEvent(new CustomEvent(n,{detail:d}));

  /* errors are surfaced on <html data-errors> so automated page checks can read them */
  const errs=[];const logErr=m=>{errs.push(String(m).slice(0,240));document.documentElement.dataset.errors=errs.join(' | ')};
  addEventListener('error',e=>logErr(e.message+' @'+(e.filename||'').split('/').pop()+':'+e.lineno));
  addEventListener('unhandledrejection',e=>logErr('promise: '+(e.reason&&e.reason.message||e.reason)));

  /* ---------------------------------------------------------------- numbers */
  const INR=new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0});
  function fmt(v,u,full){
    if(v==null||v===''||Number.isNaN(+v))return '—';
    v=+v;u=u||{};const a=Math.abs(v),neg=v<0?'−':'';
    if(u.cur==='inr'){
      if(full)return (neg?'−':'')+INR.format(a);
      if(a>=1e7)return neg+'₹'+trim(a/1e7,u.dp??2)+' Cr';
      if(a>=1e5)return neg+'₹'+trim(a/1e5,u.dp??1)+' L';
      if(a>=1e3)return neg+'₹'+trim(a/1e3,1)+'K';
      return neg+'₹'+trim(a,0);
    }
    const dp=u.dp??(a<10&&a%1?1:0);let s;
    if(!full&&!u.raw&&a>=1e7&&u.indian)s=trim(a/1e7,1)+' Cr';
    else if(!full&&!u.raw&&a>=1e5&&u.indian)s=trim(a/1e5,1)+' L';
    else if(!full&&!u.raw&&a>=1e6)s=trim(a/1e6,1)+'M';
    else if(!full&&!u.raw&&a>=1e4)s=trim(a/1e3,1)+'K';
    else s=a.toLocaleString('en-IN',{minimumFractionDigits:full?dp:0,maximumFractionDigits:dp});
    return neg+(u.pre||'')+s+(u.suf||'');
  }
  function trim(x,dp){return (+x.toFixed(dp)).toLocaleString('en-IN',{maximumFractionDigits:dp})}

  /* ---------------------------------------------------------------- theme */
  const THEMES=['light','dark','hc'];
  function sysTheme(){try{return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){return 'light'}}
  function applyTheme(pref){
    const t=pref==='system'?sysTheme():pref;
    document.documentElement.setAttribute('data-theme',THEMES.includes(t)?t:'light');
    $$('[data-theme-label]').forEach(n=>n.textContent={light:'Light',dark:'Dark',hc:'High contrast',system:'System'}[pref]);
    emit('ra:theme',{theme:t});
  }
  const urlTheme=new URLSearchParams(location.search).get('theme');
  let themePref=['light','dark','hc','system'].includes(urlTheme)?urlTheme:store.get('theme','light');
  applyTheme(themePref);
  try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(themePref==='system')applyTheme('system')})}catch(e){}

  /* ---------------------------------------------------------------- chart engines */
  const ENGINES={
    echarts:{name:'ECharts',files:['vendor/echarts/echarts.min.js'],ready:()=>!!window.echarts},
    highcharts:{name:'Highcharts',files:['vendor/highcharts/highcharts.js','vendor/highcharts/highcharts-more.js','vendor/highcharts/modules/heatmap.js','vendor/highcharts/modules/treemap.js','vendor/highcharts/modules/sankey.js','vendor/highcharts/modules/funnel.js','vendor/highcharts/modules/solid-gauge.js','vendor/highcharts/modules/bullet.js','vendor/highcharts/modules/exporting.js','vendor/highcharts/modules/offline-exporting.js','vendor/highcharts/modules/export-data.js','vendor/highcharts/modules/accessibility.js'],ready:()=>!!window.Highcharts},
    chartjs:{name:'Chart.js',files:['vendor/chartjs/chart.umd.js','vendor/chartjs/hammer.min.js','vendor/chartjs/chartjs-plugin-zoom.min.js','vendor/chartjs/chartjs-chart-matrix.min.js','vendor/chartjs/chartjs-chart-treemap.min.js','vendor/chartjs/chartjs-chart-sankey.min.js'],ready:()=>!!window.Chart}
  };
  const loading={};
  function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('Could not load '+src));document.head.appendChild(s)})}
  function loadEngine(k){
    const E=ENGINES[k];if(!E)return Promise.reject(new Error('Unknown engine '+k));
    if(E.ready()&&!loading[k])return Promise.resolve();
    return loading[k]||(loading[k]=E.files.reduce((p,f)=>p.then(()=>loadScript(ROOT+'assets/'+f)),Promise.resolve()).then(()=>{if(k==='chartjs'&&window.ChartZoom&&window.Chart)Chart.register(window.ChartZoom)}));
  }
  const urlEngine=new URLSearchParams(location.search).get('engine');
  let engine=ENGINES[urlEngine]?urlEngine:store.get('engine','echarts');if(!ENGINES[engine])engine='echarts';
  function setEngine(k,quiet){
    if(!ENGINES[k])return;engine=k;store.set('engine',k);
    $$('[data-engine-set]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.engineSet===k)));
    $$('.engine-sel select').forEach(s=>s.value=k);
    emit('ra:engine',{engine:k});
    if(!quiet)toast('Charts now render with '+ENGINES[k].name,{icon:'data_usage'});
  }

  /* ---------------------------------------------------------------- page filters */
  const DEFAULT_RANGE='Last 30 days';
  const filters={range:store.get('range',DEFAULT_RANGE)};
  function seed(){const o={...filters};if(o.range===DEFAULT_RANGE)delete o.range;Object.keys(o).forEach(k=>{if(!o[k]||o[k]==='All')delete o[k]});return Object.keys(o).length?JSON.stringify(o):''}
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  /* deterministic variation for a slice: 1 when no filters apply, otherwise 0.72–1.18 */
  function vary(key){const s=seed();if(!s)return 1;return .72+(hash(s+'|'+key)%1000)/1000*.46}
  function setFilter(k,v,opts={}){
    if(v==null||v==='All'||v==='')delete filters[k];else filters[k]=v;
    if(k==='range'){store.set('range',v||DEFAULT_RANGE);$$('[data-range-label]').forEach(n=>n.textContent=v||DEFAULT_RANGE)}
    $$(`[data-filter="${k}"]`).forEach(s=>{if(s.value!==(v||'All'))s.value=v||'All'});
    renderChips();
    if(!opts.silent)emit('ra:filters',{filters:{...filters},key:k,source:opts.source});
  }
  function renderPills(){$$('[data-pill]').forEach(p=>{const v=filters[p.dataset.pill];p.classList.toggle('is-on',!!v);p.querySelector('[data-pill-v]').textContent=v||'All'})}
  function renderChips(){renderPills();
    $$('[data-chips]').forEach(box=>{
      const ks=Object.keys(filters).filter(k=>k!=='range'&&filters[k]);
      box.innerHTML=ks.map(k=>`<span class="chip">${esc(label(k))}: ${esc(filters[k])}<button type="button" data-chip-x="${k}" aria-label="Remove ${esc(label(k))} filter">${ic('dismiss')}</button></span>`).join('')+(ks.length>1?`<button type="button" class="btn btn--subtle btn--s" data-chip-clear>Clear all</button>`:'');
    });
  }
  const label=k=>k.charAt(0).toUpperCase()+k.slice(1).replace(/-/g,' ');
  function refreshKpis(){
    $$('[data-kpi]').forEach(n=>{const b=+n.dataset.kpi,u=n.dataset.u?JSON.parse(n.dataset.u):{};const f=n.dataset.fixed?1:vary('kpi:'+(n.dataset.k||b));
      n.textContent=fmt(u.suf==='%'||u.noscale?Math.min(u.max??100,b*(f>1?1+(f-1)*.25:1-(1-f)*.25)):b*f,u)});
  }

  /* ---------------------------------------------------------------- popover menus */
  let openMenu=null;
  function closeMenu(focus){if(!openMenu)return;const {el,anchor}=openMenu;el.remove();anchor&&anchor.setAttribute('aria-expanded','false');if(focus&&anchor)anchor.focus();openMenu=null}
  function place(el,anchor,align){
    const r=anchor.getBoundingClientRect(),w=el.offsetWidth,h=el.offsetHeight;
    let x=align==='start'?r.left:r.right-w;if(x+w>innerWidth-8)x=innerWidth-8-w;if(x<8)x=8;
    let y=r.bottom+4;if(y+h>innerHeight-8&&r.top-h-4>8)y=r.top-h-4;
    el.style.left=x+'px';el.style.top=Math.max(8,y)+'px';
  }
  /* items: {label, icon, onClick, href, checked, disabled, kbd} | 'sep' | {head} | {html} */
  function menu(anchor,items,o={}){
    if(openMenu&&openMenu.anchor===anchor){closeMenu();return}
    closeMenu();
    const el=document.createElement('div');el.className='menu'+(o.wide?' menu--wide':'');el.setAttribute('role','menu');
    if(o.label)el.setAttribute('aria-label',o.label);
    el.innerHTML=items.map((it,i)=>{
      if(it==='sep')return '<div class="menu__sep" role="separator"></div>';
      if(it.head)return `<div class="menu__h">${esc(it.head)}</div>`;
      if(it.html)return it.html;
      const role=it.checked!=null?'menuitemradio':'menuitem';
      const tag=it.href?`a href="${esc(it.href)}"`:'button type="button"';
      return `<${tag} class="menu__i" role="${role}" data-i="${i}"${it.checked!=null?` aria-checked="${!!it.checked}"`:''}${it.disabled?' aria-disabled="true"':''} tabindex="-1">${it.icon?ic(it.icon):''}<span>${esc(it.label)}</span>${it.kbd?`<kbd class="kbd">${esc(it.kbd)}</kbd>`:''}${it.checked?ic('checkmark','chk'):''}</${it.href?'a':'button'}>`;
    }).join('');
    document.body.appendChild(el);place(el,anchor,o.align);
    anchor.setAttribute('aria-expanded','true');openMenu={el,anchor};
    el.addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(!b)return;const it=items[+b.dataset.i];if(it.disabled){e.preventDefault();return}
      if(!it.keep)closeMenu(!it.href);it.onClick&&it.onClick(e)});
    el.addEventListener('keydown',e=>{const its=$$('.menu__i:not([aria-disabled="true"])',el);const i=its.indexOf(document.activeElement);
      if(e.key==='ArrowDown'){e.preventDefault();(its[i+1]||its[0]).focus()}else if(e.key==='ArrowUp'){e.preventDefault();(its[i-1]||its.at(-1)).focus()}
      else if(e.key==='Home'){e.preventDefault();its[0].focus()}else if(e.key==='End'){e.preventDefault();its.at(-1).focus()}
      else if(e.key==='Escape'||e.key==='Tab'){e.preventDefault();closeMenu(true)}});
    const first=$('.menu__i:not([aria-disabled="true"])',el);if(first&&!o.noFocus)first.focus();
    return el;
  }
  document.addEventListener('pointerdown',e=>{if(openMenu&&!openMenu.el.contains(e.target)&&!openMenu.anchor.contains(e.target))closeMenu()});
  addEventListener('resize',()=>closeMenu());
  document.addEventListener('scroll',e=>{if(openMenu&&!openMenu.el.contains(e.target))closeMenu()},true);

  /* ---------------------------------------------------------------- dialog + drawer */
  const layers=[];
  function layer(kind,{title,body,footer,wide,side,onClose,label}){
    const opener=document.activeElement;
    const wrap=document.createElement('div');wrap.className='layer';
    const id='ly'+Date.now().toString(36);
    const cls=kind==='drawer'?`drawer${wide?' drawer--l':''}${side==='left'?' drawer--left':''}`:`dlg${wide?' dlg--wide':''}`;
    const p=kind==='drawer'?'drawer':'dlg';
    wrap.innerHTML=`<div class="layer__scrim"></div><section class="${cls}" role="dialog" aria-modal="true" aria-labelledby="${id}"><header class="${p}__h"><h2 id="${id}">${esc(title)}</h2><button type="button" class="ibtn" data-close aria-label="Close">${ic('dismiss')}</button></header><div class="${p}__b">${body||''}</div>${footer?`<footer class="${p}__f">${footer}</footer>`:''}</section>`;
    document.body.appendChild(wrap);
    const box=wrap.querySelector('[role="dialog"]');
    const close=()=>{wrap.remove();layers.splice(layers.indexOf(rec),1);onClose&&onClose();if(opener&&opener.focus&&document.contains(opener))opener.focus()};
    const rec={wrap,close};layers.push(rec);
    wrap.addEventListener('click',e=>{if(e.target.closest('[data-close]')||e.target.classList.contains('layer__scrim'))close()});
    wrap.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();close()}
      if(e.key==='Tab'){const f=$$('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',box).filter(x=>!x.disabled&&x.offsetParent!==null);if(!f.length)return;
        if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===f.at(-1)){e.preventDefault();f[0].focus()}}});
    const af=$('[autofocus]',box)||$('.'+p+'__b button,.'+p+'__b input,.'+p+'__b select',box)||$('[data-close]',box);af&&af.focus();
    return {el:box,close};
  }
  const modal=o=>layer('dialog',o), drawer=o=>layer('drawer',o);

  /* ---------------------------------------------------------------- toast */
  function toast(title,o={}){
    let box=$('.toasts');if(!box){box=document.createElement('div');box.className='toasts';box.setAttribute('role','status');box.setAttribute('aria-live','polite');document.body.appendChild(box)}
    const t=document.createElement('div');t.className='toast'+(o.kind?' toast--'+o.kind:'');
    t.innerHTML=`${ic(o.icon||({ok:'checkmark_circle',warn:'warning',err:'error_circle'}[o.kind]||'info'))}<div><b>${esc(title)}</b>${o.text?`<span>${esc(o.text)}</span>`:''}</div><button type="button" class="ibtn ibtn--s" aria-label="Dismiss">${ic('dismiss')}</button>`;
    t.querySelector('button').onclick=()=>t.remove();box.appendChild(t);setTimeout(()=>t.remove(),o.ms||3800);
  }

  /* ---------------------------------------------------------------- downloads */
  function download(name,data,type){const a=document.createElement('a');a.href=typeof data==='string'&&data.startsWith('data:')?data:URL.createObjectURL(new Blob([data],{type:type||'text/plain'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{if(!a.href.startsWith('data:'))URL.revokeObjectURL(a.href);a.remove()},0)}
  const csv=rows=>rows.map(r=>r.map(c=>{c=String(c??'').replace(/−/g,'-');return /[",\n]/.test(c)?`"${c.replace(/"/g,'""')}"`:c}).join(',')).join('\n');
  const slug=s=>String(s||'report').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

  /* ---------------------------------------------------------------- navigation: module rail + section panel */
  const sn=$('.sn'),PATH=document.body.dataset.path||'',TITLE=document.body.dataset.title||document.title;
  const isMob=()=>innerWidth<=1023;
  function syncToggle(){$$('[data-sb-toggle]').forEach(b=>{if(b.classList.contains('hd-nav'))b.setAttribute('aria-expanded',String(document.body.classList.contains('nav-open')))})}
  function setSnHidden(h){document.body.classList.toggle('sn-hide',h);store.set('snhide',h?'1':'0');setTimeout(()=>emit('ra:layout'),230)}
  function showSec(key){
    if(!sn)return;
    $$('.sn-sec',sn).forEach(s=>s.hidden=s.dataset.sec!==key);
    $$('[data-sec-btn]').forEach(b=>b.setAttribute('aria-current',String(b.dataset.secBtn===key)));
    const b=$(`[data-sec-btn="${key}"]`);const t=$('[data-sn-title]',sn);if(b&&t)t.textContent=b.dataset.secTitle;
  }
  if(sn){
    const links=()=>$$('a.sn-i',sn);
    const norm=a=>{const u=new URL(a.getAttribute('href'),location.href);return {p:u.pathname.split('/').slice(-2).join('/'),h:u.hash}};
    const here=location.pathname.split('/').slice(-2).join('/');
    function markActive(){
      const hh=location.hash,L=links().filter(a=>!a.closest('[data-pins],[data-recent]'));
      let hit=L.filter(a=>{const n=norm(a);return n.p===here&&n.h&&n.h===hh});
      if(!hit.length)hit=L.filter(a=>{const n=norm(a);return n.p===here&&!n.h});
      if(!hit.length)hit=L.filter(a=>norm(a).p===here).slice(0,1);
      L.forEach(a=>a.removeAttribute('aria-current'));
      hit.slice(0,1).forEach(a=>a.setAttribute('aria-current','page'));
    }
    markActive();addEventListener('hashchange',markActive);
    const cur=$('.sn-sec:not([hidden]) [aria-current="page"]',sn);if(cur)cur.scrollIntoView({block:'nearest'});
    sn.addEventListener('click',e=>{const g=e.target.closest('[data-sn-group]');if(g){const o=g.getAttribute('aria-expanded')!=='true';g.setAttribute('aria-expanded',String(o));g.nextElementSibling.hidden=!o}});
    /* pinned and recent pages */
    const ICON_OF=href=>{const a=links().find(x=>x.getAttribute('href')===href);return a&&a.querySelector('use')?a.querySelector('use').getAttribute('href').slice(3):'document_table'};
    const getJ=(k,d)=>{try{return JSON.parse(store.get(k,''))||d}catch(e){return d}};
    function drawPins(){const pins=getJ('pins',[]),box=$('[data-pins]',sn),ul=$('[data-pin-list]',sn);if(!box)return;box.hidden=!pins.length;
      ul.innerHTML=pins.map(p=>`<li><a class="sn-i" href="${ROOT}${esc(p.p)}"${p.p===PATH?' aria-current="page"':''}>${ic(p.i)}<span>${esc(p.t)}</span></a></li>`).join('');
      $$('[data-star]').forEach(s=>{const on=pins.some(p=>p.p===PATH);s.setAttribute('aria-pressed',String(on));s.setAttribute('aria-label',on?'Unpin from navigation':'Pin to navigation')})}
    function drawRecent(){const r=getJ('recent',[]).filter(x=>x.p!==PATH).slice(0,6),ul=$('[data-recent]',sn);if(!ul)return;
      ul.innerHTML=r.length?r.map(p=>`<li><a class="sn-i" href="${ROOT}${esc(p.p)}">${ic(p.i)}<span>${esc(p.t)}</span></a></li>`).join(''):'<li class="sn__empty">Pages you open appear here.</li>'}
    const myIcon=(()=>{const a=links().find(x=>norm(x).p===here);return a&&a.querySelector('use')?a.querySelector('use').getAttribute('href').slice(3):'home'})();
    if(PATH){const r=getJ('recent',[]).filter(x=>x.p!==PATH);r.unshift({p:PATH,t:TITLE,i:myIcon});store.set('recent',JSON.stringify(r.slice(0,8)))}
    drawPins();drawRecent();
    document.addEventListener('click',e=>{const s=e.target.closest('[data-star]');if(!s)return;let pins=getJ('pins',[]);const on=pins.some(p=>p.p===PATH);
      pins=on?pins.filter(p=>p.p!==PATH):[...pins,{p:PATH,t:TITLE,i:myIcon}];store.set('pins',JSON.stringify(pins));drawPins();
      toast(on?'Unpinned':'Pinned to navigation',{kind:on?undefined:'ok',icon:'star',text:on?TITLE:'Find it at the top of the navigation panel.'})});
    /* panel search across every section */
    const q=$('.sn__search input',sn);
    if(q){
      q.addEventListener('input',()=>{
        const v=q.value.trim().toLowerCase();
        $$('mark',sn).forEach(m=>m.replaceWith(m.textContent));$$('.sn-i>span:first-of-type',sn).forEach(s=>s.normalize());
        const secs=$$('.sn-sec',sn);
        if(!v){$$('li,.sn__lbl',sn).forEach(x=>x.hidden=false);showSec(($('[data-sec-btn][aria-current="true"]')||{}).dataset?.secBtn||'home');$('.sn__empty',sn).hidden=true;$$('.sn-sec .sec-tag',sn).forEach(x=>x.remove());return}
        let n=0;secs.forEach(sec=>{let hit=0;$$('li',sec).forEach(li=>{const a=li.querySelector(':scope>a.sn-i');if(!a){li.hidden=false;return}const sp=a.querySelector('span');const t=sp.textContent,i=t.toLowerCase().indexOf(v);
          li.hidden=i<0;if(i>=0){hit++;sp.innerHTML=esc(t.slice(0,i))+'<mark>'+esc(t.slice(i,i+v.length))+'</mark>'+esc(t.slice(i+v.length))}});
          $$('li',sec).forEach(li=>{const g=li.querySelector(':scope>[data-sn-group]');if(g)li.hidden=!$$('li',li).some(x=>!x.hidden)});
          $$('.sn__lbl',sec).forEach(l=>{const ul=l.nextElementSibling;l.hidden=!(ul&&$$('li',ul).some(x=>!x.hidden))});
          sec.hidden=!hit;n+=hit});
        $('.sn__empty',sn).hidden=n>0;
      });
      q.addEventListener('keydown',e=>{if(e.key==='Enter'){const a=$$('.sn-sec:not([hidden]) li:not([hidden])>a.sn-i',sn)[0];if(a)location.href=a.href}if(e.key==='Escape'){q.value='';q.dispatchEvent(new Event('input'))}});
    }
  }
  syncToggle();addEventListener('resize',syncToggle);

  /* ---------------------------------------------------------------- command palette (Ctrl+K) */
  function palette(){
    if($('.cmdk'))return;
    const seen=new Set(),pages=[];
    $$('.sn-sec a.sn-i').forEach(a=>{const h=a.getAttribute('href');if(seen.has(h))return;seen.add(h);const sec=a.closest('.sn-sec');const btn=$(`[data-sec-btn="${sec&&sec.dataset.sec}"]`);
      pages.push({kind:'page',t:a.querySelector('span').textContent.trim(),s:btn?btn.dataset.secTitle:'',i:a.querySelector('use')?a.querySelector('use').getAttribute('href').slice(3):'document_table',run:()=>location.href=a.href})});
    const acts=[
      ...Object.entries(ENGINES).map(([k,E])=>({kind:'act',t:`Draw charts with ${E.name}`,s:'Chart engine',i:'data_usage',run:()=>setEngine(k)})),
      ...[['light','Light theme','weather_sunny'],['dark','Dark theme','weather_moon'],['hc','High contrast theme','dark_theme']].map(([k,t,i])=>({kind:'act',t,s:'Theme',i,run:()=>{themePref=k;store.set('theme',k);applyTheme(k)}})),
      {kind:'act',t:'Open filters',s:'This page',i:'filter',run:()=>filterDrawer()},
      {kind:'act',t:'Refresh data',s:'This page',i:'arrow_clockwise',run:()=>{emit('ra:refresh');toast('Data refreshed',{kind:'ok'})}},
      {kind:'act',t:'Pin or unpin this page',s:'This page',i:'star',run:()=>$('[data-star]')?.click()},
      {kind:'act',t:'Toggle navigation panel',s:'Layout',i:'panel_left_contract',run:()=>setSnHidden(!document.body.classList.contains('sn-hide'))},
      {kind:'act',t:'Create a new report',s:'Report builder',i:'document_add',run:()=>location.href=ROOT+'report-builder/index.html#create'},
      {kind:'act',t:'Keyboard shortcuts',s:'Help',i:'keyboard',run:()=>shortcuts()}];
    let recent=[];try{recent=JSON.parse(store.get('recent','[]'))}catch(e){}
    const wrap=document.createElement('div');wrap.className='layer';
    wrap.innerHTML=`<div class="layer__scrim"></div><div class="cmdk" role="dialog" aria-modal="true" aria-label="Search and commands"><div class="cmdk__in">${ic('search')}<input type="text" placeholder="Search pages, charts and actions…" aria-label="Search" role="combobox" aria-expanded="true" aria-controls="cmdk-list" autocomplete="off"><kbd class="kbd">Esc</kbd></div><div class="cmdk__list" id="cmdk-list" role="listbox"></div><div class="cmdk__f"><span><kbd class="kbd">↑</kbd> <kbd class="kbd">↓</kbd> move</span><span><kbd class="kbd">Enter</kbd> open</span><span><kbd class="kbd">Esc</kbd> close</span></div></div>`;
    document.body.appendChild(wrap);const inp=$('input',wrap),list=$('.cmdk__list',wrap),opener=document.activeElement;let sel=0,shown=[];
    const close=()=>{wrap.remove();opener&&opener.focus&&opener.focus()};
    function draw(){const v=inp.value.trim().toLowerCase();let groups;
      if(!v){const rec=recent.slice(0,5).map(r=>({kind:'page',t:r.t,s:'Recent',i:r.i,run:()=>location.href=ROOT+r.p}));groups=[['Recent',rec],['Actions',acts.slice(0,6)],['Pages',pages.slice(0,8)]]}
      else{const m=x=>(x.t+' '+x.s).toLowerCase().includes(v);groups=[['Pages',pages.filter(m).slice(0,10)],['Actions',acts.filter(m)]]}
      shown=[];list.innerHTML=groups.filter(g=>g[1].length).map(([g,xs])=>`<div class="cmdk__g">${g}</div>`+xs.map(x=>{const i=shown.push(x)-1;return `<button type="button" class="cmdk__i" role="option" id="ck${i}" data-ck="${i}" aria-selected="${i===sel}">${ic(x.i)}<span>${esc(x.t)}</span><small>${esc(x.s)}</small></button>`}).join('')).join('')||`<div class="menu__t">Nothing matches “${esc(inp.value)}”.</div>`;
      inp.setAttribute('aria-activedescendant',shown.length?'ck'+sel:'');const s=$(`#ck${sel}`,list);s&&s.scrollIntoView({block:'nearest'})}
    inp.addEventListener('input',()=>{sel=0;draw()});
    wrap.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}else if(e.key==='ArrowDown'){e.preventDefault();sel=Math.min(shown.length-1,sel+1);draw()}else if(e.key==='ArrowUp'){e.preventDefault();sel=Math.max(0,sel-1);draw()}else if(e.key==='Enter'){e.preventDefault();const x=shown[sel];if(x){close();x.run()}}else if(e.key==='Tab'){e.preventDefault()}});
    wrap.addEventListener('click',e=>{if(e.target.classList.contains('layer__scrim'))close();const b=e.target.closest('[data-ck]');if(b){const x=shown[+b.dataset.ck];close();x.run()}});
    wrap.addEventListener('mousemove',e=>{const b=e.target.closest('[data-ck]');if(b&&+b.dataset.ck!==sel){sel=+b.dataset.ck;$$('[data-ck]',list).forEach(x=>x.setAttribute('aria-selected',String(+x.dataset.ck===sel)))}});
    draw();inp.focus();
  }

  /* ---------------------------------------------------------------- live status, count-up, page tabs, insight jumps */
  let refreshedAt=Date.now();
  function liveTick(){const m=Math.round((Date.now()-refreshedAt)/60000);$$('[data-live-t]').forEach(n=>n.textContent=m<1?'Updated just now':`Updated ${m} min ago`)}
  setInterval(liveTick,30000);document.addEventListener('ra:refresh',()=>{refreshedAt=Date.now();liveTick()});
  function countUp(){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    $$('[data-kpi]').forEach(n=>{const b=+n.dataset.kpi,u=n.dataset.u?JSON.parse(n.dataset.u):{},t0=performance.now(),dur=700;
      const step=t=>{const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);n.textContent=fmt(b*e,{...u,dp:u.dp??(Math.abs(b)<100&&b%1?1:u.dp)});if(k<1)requestAnimationFrame(step);else refreshKpis()};requestAnimationFrame(step)});
  }
  const tabs=$('.ph-tabs');
  if(tabs){
    const as=$$('a',tabs),tg=as.map(a=>document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    const set=id=>as.forEach(a=>a.setAttribute('aria-current',String(a.getAttribute('href')==='#'+id)));
    tabs.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;e.preventDefault();const t=document.getElementById(a.getAttribute('href').slice(1));if(t){t.scrollIntoView({behavior:'smooth',block:'start'});set(t.id);history.replaceState(null,'','#'+t.id)}});
    if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>{const v=es.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(v)set(v.target.id)},{rootMargin:'-120px 0px -60% 0px'});tg.forEach(t=>io.observe(t))}
  }
  document.addEventListener('click',e=>{const b=e.target.closest('[data-goto]');if(!b)return;const t=document.getElementById(b.dataset.goto);if(!t)return;
    t.scrollIntoView({behavior:'smooth',block:'center'});t.classList.remove('flash');void t.offsetWidth;t.classList.add('flash');setTimeout(()=>t.classList.remove('flash'),1700)});

  /* ---------------------------------------------------------------- header + global clicks */
  const RANGES=['Today','Yesterday','Last 7 days','Last 30 days','This month','This quarter','This year','Last year'];
  const NOTES=[['warning','Low stock: 14 SKUs below reorder point','Inventory · 12 min ago'],['clipboard_task','6 purchase orders waiting for your approval','Procurement · 1 h ago'],['checkmark_circle','Monthly P&L report finished','Finance · 3 h ago'],['people','Q3 churn analysis was shared with you','Customers · Yesterday']];
  document.addEventListener('click',e=>{
    const t=e.target;let el;
    if((el=t.closest('[data-sb-toggle]'))){if(isMob()){document.body.classList.toggle('nav-open')}else setSnHidden(!document.body.classList.contains('sn-hide'));syncToggle();return}
    if(t.closest('.scrim')){document.body.classList.remove('nav-open');syncToggle();return}
    if((el=t.closest('[data-sec-btn]'))){const k=el.dataset.secBtn,on=el.getAttribute('aria-current')==='true';
      if(isMob()){document.body.classList.add('nav-open');showSec(k);syncToggle();return}
      if(on&&!document.body.classList.contains('sn-hide')){setSnHidden(true);return}
      showSec(k);if(document.body.classList.contains('sn-hide'))setSnHidden(false);const f=$('.sn-sec:not([hidden]) a.sn-i');f&&f.focus({preventScroll:true});return}
    if((el=t.closest('[data-cmdk]'))){palette();return}
    if((el=t.closest('[data-ws]'))){menu(el,[{head:'Company'},{label:'Mehta Industries Ltd',icon:'building',checked:true},{label:'Mehta Exports Pvt Ltd',icon:'building',onClick:()=>toast('Switching companies is part of the host ERP',{icon:'building'})},{label:'Mehta Retail LLP',icon:'building',onClick:()=>toast('Switching companies is part of the host ERP',{icon:'building'})},'sep',{head:'Financial year'},{label:'FY 2026–27',checked:true},{label:'FY 2025–26',onClick:()=>toast('FY 2025–26 needs archived data — not in this demo',{icon:'calendar_ltr'})}],{label:'Workspace',align:'start'});return}
    if((el=t.closest('[data-export-menu]'))){menu(el,[{head:'Export this page'},{label:'PDF report',icon:'print',onClick:()=>{toast('Preparing PDF…',{icon:'print'});setTimeout(print,300)}},{label:'PowerPoint slides',icon:'slide_layout',onClick:()=>toast('Slide export started',{kind:'ok',text:'One slide per chart, ready in about a minute.'})},{label:'Excel workbook (CSV)',icon:'document_table',onClick:()=>toast('Data export started',{kind:'ok',text:'One sheet per chart and table.'})},'sep',{label:'Schedule e-mail…',icon:'clock',onClick:scheduleDlg},{label:'Subscribe to alerts',icon:'alert',onClick:()=>toast('Subscribed',{kind:'ok',text:'You will get an e-mail when a KPI goes off track.'})}],{label:'Export'});return}
    if((el=t.closest('[data-pill]'))){const d=el.dataset.pill,cur=filters[d]||'All';menu(el,[{head:RA_label(d)},{label:'All '+(d==='category'?'categories':d==='status'?'statuses':d+'s'),checked:cur==='All',onClick:()=>setFilter(d,null)},'sep',...DIMS[d].map(v=>({label:v,checked:cur===v,onClick:()=>setFilter(d,v)}))],{label:RA_label(d),align:'start'});return}
    if((el=t.closest('[data-cmp-menu]'))){menu(el,[{head:'Compare with'},...['Previous period','Same period last year','Plan / budget','No comparison'].map(c=>({label:c,checked:cmpLabel===c,onClick:()=>setCmp(c)}))],{label:'Compare',align:'start'});return}
    if((el=t.closest('[data-engine-set]'))){setEngine(el.dataset.engineSet);return}
    if((el=t.closest('[data-theme-menu]'))){menu(el,[{head:'Theme'},...['light','dark','hc','system'].map(k=>({label:{light:'Light',dark:'Dark',hc:'High contrast',system:'Use system setting'}[k],icon:{light:'weather_sunny',dark:'weather_moon',hc:'dark_theme',system:'desktop'}[k],checked:themePref===k,onClick:()=>{themePref=k;store.set('theme',k);applyTheme(k)}}))],{label:'Theme'});return}
    if((el=t.closest('[data-range-menu]'))){menu(el,[{head:'Date range'},...RANGES.map(r=>({label:r,checked:(filters.range||DEFAULT_RANGE)===r,onClick:()=>{setFilter('range',r);toast('Date range: '+r,{icon:'calendar_ltr'})}})),'sep',{label:'Custom range…',icon:'calendar_ltr',onClick:customRange}],{label:'Date range'});return}
    if((el=t.closest('[data-refresh]'))){emit('ra:refresh');toast('Data refreshed',{kind:'ok',text:'All reports on this page were reloaded.'});return}
    if((el=t.closest('[data-notif]'))){menu(el,[{head:'Notifications'},...NOTES.map(n=>({html:`<div class="notif">${ic(n[0])}<div><b>${esc(n[1])}</b>${esc(n[2])}</div></div>`})),'sep',{label:'Mark all as read',icon:'checkmark',onClick:()=>{const b=$('[data-notif] .dot-badge');b&&b.remove();toast('All notifications marked as read',{kind:'ok'})}}],{wide:true,label:'Notifications'});return}
    if((el=t.closest('[data-help]'))){menu(el,[{head:'Help'},{label:'Keyboard shortcuts',icon:'keyboard',kbd:'?',onClick:shortcuts},{label:'Design system',icon:'design_ideas',href:ROOT+'design-system/index.html'},{label:'Chart library comparison',icon:'chart_multiple',href:ROOT+'libraries/index.html'},{label:'About this showcase',icon:'info',onClick:about}],{label:'Help'});return}
    if((el=t.closest('[data-user]'))){menu(el,[{html:'<div class="notif" style="grid-template-columns:40px 1fr;align-items:center"><span class="avatar avatar--l">AM</span><div><b>Ananya Mehta</b>Finance &amp; Ops Analytics · Admin</div></div>'},'sep',{label:'Profile',icon:'person',onClick:()=>toast('Profile is part of the host application',{icon:'person'})},{label:'Report subscriptions',icon:'alert',onClick:()=>toast('3 scheduled reports: Mon 08:00, monthly P&L, weekly stock',{icon:'clock'})},{label:'Settings',icon:'settings',onClick:()=>toast('Settings are part of the host application',{icon:'settings'})},'sep',{label:'Sign out',icon:'arrow_export_ltr',onClick:()=>toast('This is a static showcase — nothing to sign out of',{icon:'info'})}],{label:'Account'});return}
    if((el=t.closest('[data-chip-x]'))){setFilter(el.dataset.chipX,null);return}
    if(t.closest('[data-chip-clear]')){Object.keys(filters).forEach(k=>{if(k!=='range')delete filters[k]});$$('[data-filter]').forEach(s=>{if(s.dataset.filter!=='range')s.value='All'});renderChips();emit('ra:filters',{filters:{...filters}});return}
    if((el=t.closest('[data-toast]'))){toast(el.dataset.toast,{kind:el.dataset.kind||'ok'});return}
    if((el=t.closest('[data-open-filters]'))){filterDrawer();return}
    if((el=t.closest('[data-open-filter-modal]'))){filterModal();return}
  });
  document.addEventListener('change',e=>{
    const s=e.target.closest('[data-filter]');if(s){setFilter(s.dataset.filter,s.value,{source:'bar'});return}
    const en=e.target.closest('.engine-sel select');if(en)setEngine(en.value);
  });
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();palette();return}
    if(e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    if(e.key==='/'){const s=$('.sn__search input');if(s&&s.offsetParent){e.preventDefault();s.focus()}else{e.preventDefault();palette()}}
    else if(e.key==='?'&&!e.ctrlKey){e.preventDefault();shortcuts()}
    else if(e.key==='['&&!e.ctrlKey){$('[data-sb-toggle]')?.click()}
    else if(e.key==='Escape'&&document.body.classList.contains('nav-open')){document.body.classList.remove('nav-open');syncToggle()}
  });
  function shortcuts(){modal({title:'Keyboard shortcuts',body:`<dl class="kv"><dt><kbd class="kbd">/</kbd></dt><dd>Search reports</dd><dt><kbd class="kbd">[</kbd></dt><dd>Collapse or expand the navigation</dd><dt><kbd class="kbd">?</kbd></dt><dd>Show this list</dd><dt><kbd class="kbd">Esc</kbd></dt><dd>Close menus, drawers, dialogs and full screen charts</dd><dt><kbd class="kbd">↑ ↓</kbd></dt><dd>Move through menu items</dd><dt><kbd class="kbd">Ctrl</kbd> + wheel</dt><dd>Zoom a chart (drag to zoom on line, area and bar charts)</dd></dl>`,footer:'<button class="btn btn--primary" data-close>Close</button>'})}
  function about(){modal({title:'About this showcase',body:`<p>An enterprise Reports &amp; Analytics design system in the Fluent 2 style. Every chart is defined once as a neutral spec and drawn by the selected engine — <b>ECharts</b>, <b>Highcharts</b> or <b>Chart.js</b>.</p><div class="note">${ic('info')}<span>All figures are <b>illustrative sample data</b> for a fictional Indian manufacturer and distributor. Highcharts is free for non-commercial use only; commercial use needs a licence.</span></div>`,footer:'<button class="btn btn--primary" data-close>Close</button>'})}
  function customRange(){
    const d=new Date(2026,9,21),iso=x=>x.toISOString().slice(0,10),f=new Date(d);f.setDate(f.getDate()-29);
    const m=modal({title:'Custom date range',body:`<div class="row" style="align-items:flex-end"><div class="field grow"><label for="cr-a">From</label><input class="input" type="date" id="cr-a" value="${iso(f)}"></div><div class="field grow"><label for="cr-b">To</label><input class="input" type="date" id="cr-b" value="${iso(d)}"></div></div><p class="muted" style="font:var(--t-cap)">Sample data runs from Oct 2025 to Sep 2026.</p>`,footer:'<button class="btn" data-close>Cancel</button><button class="btn btn--primary" data-apply>Apply</button>'});
    m.el.querySelector('[data-apply]').onclick=()=>{const a=$('#cr-a').value,b=$('#cr-b').value;m.close();setFilter('range',`${a} → ${b}`)};
  }

  /* ---------------------------------------------------------------- compare-to and scheduling */
  let cmpLabel=store.get('cmp','Previous period');
  const CMP_TXT={'Previous period':'vs previous period','Same period last year':'vs last year','Plan / budget':'vs plan','No comparison':''};
  function setCmp(c){cmpLabel=c;store.set('cmp',c);$$('[data-cmp-label]').forEach(n=>n.textContent=c);$$('[data-cmp]').forEach(n=>{n.textContent=CMP_TXT[c]});
    $$('.dl').forEach(d=>d.hidden=c==='No comparison');toast('Comparison: '+c,{icon:'arrow_swap'})}
  function scheduleDlg(){const m=modal({title:'Schedule this report',body:`<div class="field"><label for="sc-to">Send to</label><input class="input" id="sc-to" value="ananya.mehta@mehta-industries.example"></div><div class="row" style="align-items:flex-end"><div class="field grow"><label for="sc-f">Frequency</label><select class="select" id="sc-f"><option>Every Monday</option><option>Daily</option><option>1st of the month</option></select></div><div class="field grow"><label for="sc-t">Time</label><select class="select" id="sc-t"><option>08:00 IST</option><option>09:00 IST</option><option>18:00 IST</option></select></div></div><div class="field"><label for="sc-fmt">Format</label><select class="select" id="sc-fmt"><option>PDF</option><option>PowerPoint</option><option>Excel</option></select></div>`,footer:'<button class="btn" data-close>Cancel</button><button class="btn btn--primary" data-ok>Schedule</button>'});
    m.el.querySelector('[data-ok]').onclick=()=>{const f=$('#sc-f').value,t=$('#sc-t').value;m.close();toast('Report scheduled',{kind:'ok',text:`${f} at ${t}.`})}}
  const RA_label=k=>k.charAt(0).toUpperCase()+k.slice(1);

  /* ---------------------------------------------------------------- filter drawer / modal (shared form) */
  const DIMS={region:['North','South','East','West','Central'],department:['Sales','Operations','Finance','Procurement','HR','IT'],warehouse:['Pune WH-1','Chennai WH-2','Gurugram WH-3','Kolkata WH-4','Ahmedabad WH-5'],category:['Electrical','Hardware','Packaging','Raw material','Spares','Consumables'],product:['Copper wire 2.5mm','MCB 32A','Steel bracket','Corrugated box L','Bearing 6204','Cable tie 300mm'],customer:['Apex Retail','Bharat Infra','Coastal Traders','Deccan Motors','Everest Pharma'],supplier:['Tata Steel','Havells','Polycab','SKF India','Uflex'],status:['Open','In progress','On hold','Completed','Cancelled']};
  function filterForm(){
    const sel=(k)=>`<div class="field"><label for="ff-${k}">${label(k)}</label><select class="select" id="ff-${k}" data-ff="${k}"><option>All</option>${DIMS[k].map(v=>`<option${filters[k]===v?' selected':''}>${esc(v)}</option>`).join('')}</select></div>`;
    return `<div class="field"><label>Date range</label><div class="seg" role="group" aria-label="Date presets" style="flex-wrap:wrap">${['Today','Yesterday','Last 7 days','Last 30 days','This month','This quarter','This year'].map(r=>`<button type="button" data-ffr="${r}" aria-pressed="${(filters.range||DEFAULT_RANGE)===r}">${r}</button>`).join('')}</div></div>${Object.keys(DIMS).map(sel).join('')}`;
  }
  function wireForm(root,close){
    let range=filters.range||DEFAULT_RANGE;
    root.addEventListener('click',e=>{const b=e.target.closest('[data-ffr]');if(b){range=b.dataset.ffr;$$('[data-ffr]',root).forEach(x=>x.setAttribute('aria-pressed',String(x===b)))}});
    return ()=>{$$('[data-ff]',root).forEach(s=>setFilter(s.dataset.ff,s.value,{silent:true}));setFilter('range',range);close();toast('Filters applied',{kind:'ok',text:seed()?'Charts now show the filtered slice.':'Showing all data.'})};
  }
  function filterDrawer(){const d=drawer({title:'Filters',body:filterForm(),footer:'<button class="btn btn--primary" data-apply>Apply</button><button class="btn" data-reset>Reset</button><button class="btn btn--subtle" data-close>Cancel</button>'});
    const apply=wireForm(d.el,d.close);$('[data-apply]',d.el).onclick=apply;$('[data-reset]',d.el).onclick=()=>{$$('[data-ff]',d.el).forEach(s=>s.value='All')}}
  function filterModal(){const d=modal({title:'Filter this report',wide:true,body:`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">${filterForm()}</div>`,footer:'<button class="btn" data-close>Cancel</button><button class="btn btn--primary" data-apply>Apply filters</button>'});
    const apply=wireForm(d.el,d.close);$('[data-apply]',d.el).onclick=apply}

  /* ---------------------------------------------------------------- tabs (generic) */
  document.addEventListener('click',e=>{const t=e.target.closest('[role="tab"]');if(!t||t.closest('[data-tabs-manual]'))return;selTab(t)});
  document.addEventListener('keydown',e=>{const t=e.target.closest('[role="tab"]');if(!t)return;const ts=$$('[role="tab"]',t.closest('[role="tablist"]'));const i=ts.indexOf(t);
    const n={ArrowRight:ts[i+1]||ts[0],ArrowLeft:ts[i-1]||ts.at(-1),Home:ts[0],End:ts.at(-1)}[e.key];if(n){e.preventDefault();n.focus();if(!t.closest('[data-tabs-manual]'))selTab(n)}});
  function selTab(t){const l=t.closest('[role="tablist"]');$$('[role="tab"]',l).forEach(x=>{const on=x===t;x.setAttribute('aria-selected',String(on));x.tabIndex=on?0:-1;const p=x.getAttribute('aria-controls')&&document.getElementById(x.getAttribute('aria-controls'));if(p)p.hidden=!on});emit('ra:layout');l.dispatchEvent(new CustomEvent('ra:tab',{bubbles:true,detail:{tab:t}}))}

  /* ---------------------------------------------------------------- sparklines (no engine needed) */
  function sparks(){
    $$('.spark[data-v]').forEach(s=>{const v=s.dataset.v.split(',').map(Number),W=s.clientWidth||160,H=s.clientHeight||32;if(!W)return;
      const cs=getComputedStyle(s),col=cs.getPropertyValue(s.dataset.c||'--c1').trim()||'#2a78d6',mut=cs.getPropertyValue('--ch-axis').trim();
      const lo=Math.min(...v),hi=Math.max(...v),X=i=>2+i*(W-6)/(v.length-1),Y=x=>H-3-(x-lo)/((hi-lo)||1)*(H-8);
      if(s.dataset.kind==='bars'){const bw=Math.max(2,(W-4)/v.length-2);s.innerHTML=`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${v.map((x,i)=>`<rect x="${(2+i*(W-4)/v.length).toFixed(1)}" y="${Y(x).toFixed(1)}" width="${bw.toFixed(1)}" height="${(H-Y(x)).toFixed(1)}" rx="1.5" fill="${i===v.length-1?col:mut}"/>`).join('')}</svg>`;return}
      const d=v.map((x,i)=>(i?'L':'M')+X(i).toFixed(1)+','+Y(x).toFixed(1)).join('');
      s.innerHTML=`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${s.dataset.area?`<path d="${d}L${X(v.length-1)},${H}L${X(0)},${H}Z" fill="${col}" opacity=".12"/>`:''}<path d="${d}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${X(v.length-1)}" cy="${Y(v.at(-1))}" r="3" fill="${col}"/></svg>`});
  }
  let st;const reSpark=()=>{clearTimeout(st);st=setTimeout(sparks,80)};
  addEventListener('resize',reSpark);document.addEventListener('ra:theme',reSpark);document.addEventListener('ra:layout',reSpark);

  /* ---------------------------------------------------------------- boot */
  function boot(){
    $$('[data-engine-set]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.engineSet===engine)));
    $$('.engine-sel select').forEach(s=>s.value=engine);
    $$('[data-range-label]').forEach(n=>n.textContent=filters.range);
    $$('[data-theme-label]').forEach(n=>n.textContent={light:'Light',dark:'Dark',hc:'High contrast',system:'System'}[themePref]);
    renderChips();sparks();refreshKpis();countUp();liveTick();
    const now=new Date(),h=now.getHours();$$('[data-greet]').forEach(n=>n.textContent=`Good ${h<12?'morning':h<17?'afternoon':'evening'}, Ananya`);
    $$('[data-today]').forEach(n=>n.textContent=now.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}));
    $$('[data-cmp-label]').forEach(n=>n.textContent=cmpLabel);if(cmpLabel!=='Previous period'){$$('[data-cmp]').forEach(n=>n.textContent=CMP_TXT[cmpLabel]);$$('.dl').forEach(d=>d.hidden=cmpLabel==='No comparison')}
  }
  document.addEventListener('ra:filters',()=>{refreshKpis()});

  window.RA={palette,showSec,$,$$,esc,ic,store,emit,fmt,ROOT,ENGINES,loadEngine,get engine(){return engine},setEngine,filters,setFilter,vary,seed,hash,menu,closeMenu,modal,drawer,toast,download,csv,slug,DIMS,label,refreshKpis,sparks,filterDrawer,filterModal};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
