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
  function renderChips(){
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

  /* ---------------------------------------------------------------- sidebar */
  const sb=$('.sb');
  if(store.get('rail','0')==='1'&&innerWidth>1023)document.body.classList.add('sb-rail');
  function syncToggle(){const b=$('[data-sb-toggle]');if(!b)return;const mob=innerWidth<=1023;
    b.setAttribute('aria-expanded',String(mob?document.body.classList.contains('sb-open'):!document.body.classList.contains('sb-rail')));
    b.setAttribute('aria-label',mob?'Open navigation':(document.body.classList.contains('sb-rail')?'Expand navigation':'Collapse navigation'))}
  syncToggle();addEventListener('resize',syncToggle);
  if(sb){
    /* active item: exact file + hash (or file alone when no hash link matches) */
    const here=location.pathname.split('/').slice(-2).join('/'),h=location.hash;
    const links=$$('a.sb-i',sb);
    const norm=a=>{const u=new URL(a.getAttribute('href'),location.href);return {p:u.pathname.split('/').slice(-2).join('/'),h:u.hash}};
    function markActive(){
      const hh=location.hash;let hit=links.filter(a=>{const n=norm(a);return n.p===here&&n.h&&n.h===hh});
      if(!hit.length)hit=links.filter(a=>{const n=norm(a);return n.p===here&&!n.h});
      if(!hit.length)hit=links.filter(a=>norm(a).p===here).slice(0,1);
      links.forEach(a=>a.removeAttribute('aria-current'));$$('.sb-i.has-current',sb).forEach(b=>b.classList.remove('has-current'));
      hit.slice(0,1).forEach(a=>{a.setAttribute('aria-current','page');let li=a.closest('li');
        while(li&&(li=li.parentElement.closest('li'))){const g=li.querySelector(':scope>.sb-i[data-sb-group]');if(g){g.classList.add('has-current');setGroup(g,true,true)}}});
    }
    function setGroup(g,open,quiet){g.setAttribute('aria-expanded',String(open));const ul=g.nextElementSibling;if(ul)ul.hidden=!open;if(!quiet)store.set('grp:'+g.dataset.sbGroup,open?'1':'0')}
    /* groups start collapsed unless the user opened them before; markActive opens the current page's group */
    $$('[data-sb-group]',sb).forEach(g=>{const s=store.get('grp:'+g.dataset.sbGroup,null);setGroup(g,s==='1',true)});
    markActive();addEventListener('hashchange',markActive);
    const cur=$('[aria-current="page"]',sb);if(cur)cur.scrollIntoView({block:'center'});
    sb.addEventListener('click',e=>{
      const g=e.target.closest('[data-sb-group]');if(!g)return;
      if(document.body.classList.contains('sb-rail')&&innerWidth>1023){flyout(g);return}
      setGroup(g,g.getAttribute('aria-expanded')!=='true');
    });
    /* rail mode: a group icon opens a flyout with its children */
    let fly=null;
    function flyout(g){
      if(fly){const same=fly.g===g;fly.el.remove();fly=null;if(same)return}
      const ul=g.nextElementSibling;const el=document.createElement('div');el.className='sb-fly';el.setAttribute('role','menu');
      el.innerHTML=`<div class="sb-fly__h">${esc(g.textContent.trim())}</div>`+$$(':scope a.sb-i',ul).map(a=>a.outerHTML).join('');
      document.body.appendChild(el);const r=g.getBoundingClientRect();el.style.left=(r.right+6)+'px';el.style.top=Math.min(r.top,innerHeight-el.offsetHeight-8)+'px';fly={el,g};
      const f=$('a',el);f&&f.focus();
      el.addEventListener('keydown',e=>{if(e.key==='Escape'){el.remove();fly=null;g.focus()}});
    }
    document.addEventListener('pointerdown',e=>{if(fly&&!fly.el.contains(e.target)&&!fly.g.contains(e.target)){fly.el.remove();fly=null}});
    /* search: filters items, opens matching groups, highlights the match */
    const q=$('.sb__search input',sb);
    if(q){
      const items=$$('li',sb).filter(li=>li.querySelector(':scope>a.sb-i'));
      q.addEventListener('input',()=>{
        const v=q.value.trim().toLowerCase();let n=0;
        $$('li',sb).forEach(li=>li.hidden=false);$$('mark',sb).forEach(m=>m.replaceWith(m.textContent));
        $$('.sb-i>span:first-of-type',sb).forEach(s=>s.normalize());
        if(!v){$$('[data-sb-group]',sb).forEach(g=>{const s=store.get('grp:'+g.dataset.sbGroup,null);setGroup(g,s==='1',true)});$('.sb__empty',sb).hidden=true;markActive();return}
        $$('li',sb).forEach(li=>li.hidden=true);
        items.forEach(li=>{const sp=li.querySelector(':scope>a.sb-i>span');const t=sp.textContent;const i=t.toLowerCase().indexOf(v);
          if(i<0)return;n++;sp.innerHTML=esc(t.slice(0,i))+'<mark>'+esc(t.slice(i,i+v.length))+'</mark>'+esc(t.slice(i+v.length));
          let p=li;while(p){p.hidden=false;const g=p.querySelector(':scope>[data-sb-group]');if(g&&p!==li)setGroup(g,true,true);p=p.parentElement.closest('li')}});
        $('.sb__empty',sb).hidden=n>0;
      });
      q.addEventListener('keydown',e=>{if(e.key==='Enter'){const a=$$('a.sb-i',sb).find(a=>a.closest('li')&&!a.closest('li').hidden&&a.querySelector('mark'));if(a)location.href=a.href}if(e.key==='Escape'){q.value='';q.dispatchEvent(new Event('input'))}});
    }
  }

  /* ---------------------------------------------------------------- header + global clicks */
  const RANGES=['Today','Yesterday','Last 7 days','Last 30 days','This month','This quarter','This year','Last year'];
  const NOTES=[['warning','Low stock: 14 SKUs below reorder point','Inventory · 12 min ago'],['clipboard_task','6 purchase orders waiting for your approval','Procurement · 1 h ago'],['checkmark_circle','Monthly P&L report finished','Finance · 3 h ago'],['people','Q3 churn analysis was shared with you','Customers · Yesterday']];
  document.addEventListener('click',e=>{
    const t=e.target;let el;
    if((el=t.closest('[data-sb-toggle]'))){if(innerWidth<=1023){document.body.classList.toggle('sb-open')}else{document.body.classList.toggle('sb-rail');store.set('rail',document.body.classList.contains('sb-rail')?'1':'0');emit('ra:layout')}syncToggle();setTimeout(()=>emit('ra:layout'),220);return}
    if(t.closest('.scrim')){document.body.classList.remove('sb-open');syncToggle();return}
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
    if(e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    if(e.key==='/'){const s=$('.hd-search input')||$('.sb__search input');if(s&&s.offsetParent){e.preventDefault();s.focus()}}
    else if(e.key==='?'&&!e.ctrlKey){e.preventDefault();shortcuts()}
    else if(e.key==='['&&!e.ctrlKey){$('[data-sb-toggle]')?.click()}
    else if(e.key==='Escape'&&document.body.classList.contains('sb-open')){document.body.classList.remove('sb-open');syncToggle()}
  });
  function shortcuts(){modal({title:'Keyboard shortcuts',body:`<dl class="kv"><dt><kbd class="kbd">/</kbd></dt><dd>Search reports</dd><dt><kbd class="kbd">[</kbd></dt><dd>Collapse or expand the navigation</dd><dt><kbd class="kbd">?</kbd></dt><dd>Show this list</dd><dt><kbd class="kbd">Esc</kbd></dt><dd>Close menus, drawers, dialogs and full screen charts</dd><dt><kbd class="kbd">↑ ↓</kbd></dt><dd>Move through menu items</dd><dt><kbd class="kbd">Ctrl</kbd> + wheel</dt><dd>Zoom a chart (drag to zoom on line, area and bar charts)</dd></dl>`,footer:'<button class="btn btn--primary" data-close>Close</button>'})}
  function about(){modal({title:'About this showcase',body:`<p>An enterprise Reports &amp; Analytics design system in the Fluent 2 style. Every chart is defined once as a neutral spec and drawn by the selected engine — <b>ECharts</b>, <b>Highcharts</b> or <b>Chart.js</b>.</p><div class="note">${ic('info')}<span>All figures are <b>illustrative sample data</b> for a fictional Indian manufacturer and distributor. Highcharts is free for non-commercial use only; commercial use needs a licence.</span></div>`,footer:'<button class="btn btn--primary" data-close>Close</button>'})}
  function customRange(){
    const d=new Date(2026,9,21),iso=x=>x.toISOString().slice(0,10),f=new Date(d);f.setDate(f.getDate()-29);
    const m=modal({title:'Custom date range',body:`<div class="row" style="align-items:flex-end"><div class="field grow"><label for="cr-a">From</label><input class="input" type="date" id="cr-a" value="${iso(f)}"></div><div class="field grow"><label for="cr-b">To</label><input class="input" type="date" id="cr-b" value="${iso(d)}"></div></div><p class="muted" style="font:var(--t-cap)">Sample data runs from Oct 2025 to Sep 2026.</p>`,footer:'<button class="btn" data-close>Cancel</button><button class="btn btn--primary" data-apply>Apply</button>'});
    m.el.querySelector('[data-apply]').onclick=()=>{const a=$('#cr-a').value,b=$('#cr-b').value;m.close();setFilter('range',`${a} → ${b}`)};
  }

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

  /* ---------------------------------------------------------------- header search (pages from the sidebar) */
  const hs=$('[data-hd-search]');
  if(hs){
    const idx=[];const seen=new Set();
    $$('.sb a.sb-i').forEach(a=>{const h=a.getAttribute('href');if(seen.has(h))return;seen.add(h);
      const path=[];let li=a.closest('li');while(li&&(li=li.parentElement.closest('li'))){const g=li.querySelector(':scope>.sb-i');g&&path.unshift(g.textContent.trim())}
      idx.push({t:a.querySelector('span').textContent.trim(),p:path.join(' › '),h:a.href,i:a.querySelector('use')?.getAttribute('href').slice(3)||'document_table'})});
    let box=null,cur=-1,hits=[];
    const close=()=>{box&&box.remove();box=null;cur=-1;hs.setAttribute('aria-expanded','false')};
    const draw=()=>{const v=hs.value.trim().toLowerCase();if(!v){close();return}
      hits=idx.filter(x=>(x.t+' '+x.p).toLowerCase().includes(v)).slice(0,8);
      if(!box){box=document.createElement('div');box.className='menu';box.id='hd-res';box.setAttribute('role','listbox');document.body.appendChild(box);hs.setAttribute('aria-expanded','true')}
      box.innerHTML=hits.length?hits.map((x,i)=>`<a class="menu__i" role="option" id="hr${i}" href="${esc(x.h)}" aria-selected="${i===cur}"${i===cur?' style="background:var(--hover)"':''}>${ic(x.i)}<span><b style="font-weight:600">${esc(x.t)}</b><br><small class="muted">${esc(x.p||'Home')}</small></span></a>`).join(''):`<div class="menu__t">No pages match “${esc(hs.value)}”.</div>`;
      const r=hs.closest('.input').getBoundingClientRect();box.style.left=r.left+'px';box.style.top=(r.bottom+4)+'px';box.style.width=r.width+'px';box.style.maxWidth='none';
      hs.setAttribute('aria-activedescendant',cur>=0?'hr'+cur:'')};
    hs.setAttribute('role','combobox');hs.setAttribute('aria-controls','hd-res');hs.setAttribute('aria-expanded','false');hs.setAttribute('aria-autocomplete','list');
    hs.addEventListener('input',()=>{cur=-1;draw()});
    hs.addEventListener('keydown',e=>{if(!box&&e.key!=='Enter')return;
      if(e.key==='ArrowDown'){e.preventDefault();cur=Math.min(hits.length-1,cur+1);draw()}else if(e.key==='ArrowUp'){e.preventDefault();cur=Math.max(0,cur-1);draw()}
      else if(e.key==='Enter'){const x=hits[cur<0?0:cur];if(x)location.href=x.h}else if(e.key==='Escape'){hs.value='';close()}});
    document.addEventListener('pointerdown',e=>{if(box&&!box.contains(e.target)&&e.target!==hs)close()});
  }

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
    renderChips();sparks();refreshKpis();
  }
  document.addEventListener('ra:filters',()=>{refreshKpis()});

  window.RA={$,$$,esc,ic,store,emit,fmt,ROOT,ENGINES,loadEngine,get engine(){return engine},setEngine,filters,setFilter,vary,seed,hash,menu,closeMenu,modal,drawer,toast,download,csv,slug,DIMS,label,refreshKpis,sparks,filterDrawer,filterModal};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
