/* Component builders and reference demos shared by all pages */

'use strict';
/* ===================== builders ===================== */
const B=(label,o={})=>`<button type="button" class="ds-btn${o.v?' ds-btn--'+o.v:''}${o.sz&&SZ[o.sz]?' '+SZ[o.sz]:''}${o.cls?' '+o.cls:''}"${o.attrs?' '+o.attrs:''}>${o.icon?ic(o.icon,o.keep?'':'ds-btn__lead'):''}<span>${label}</span>${o.chev?ic('chev-down','ds-btn__chev'):''}</button>`;
const IB=(icon,label,o={})=>`<button type="button" class="ds-btn ds-ibtn ds-btn--${o.v||'subtle'}${o.sz&&SZ[o.sz]?' '+SZ[o.sz]:''}${o.cls?' '+o.cls:''}" aria-label="${label}"${o.attrs?' '+o.attrs:''}>${ic(icon)}</button>`;
const TIP=(inner,text,o={})=>{const id=uid('tip');return `<span class="ds-tipwrap">${inner.replace('<button','<button aria-describedby="'+id+'"')}<span class="ds-tip${o.below?' ds-tip--below':''}${o.shown?' is-shown':''}" role="tooltip" id="${id}">${text}${o.kbd?`<kbd>${o.kbd}</kbd>`:''}</span></span>`};
const HICON={error:'err',success:'ok',warning:'warn'};
const help=(id,text,state)=>text?`<p class="ds-help" id="${id}-h">${HICON[state]?ic(HICON[state]):''}${text}</p>`:'';
const ctlState=s=>['hover','focus','loading'].includes(s)?' '+st(s):'';
function TF(o={}){
  const id=o.id||uid('tf');const s=o.state||'';
  return `<div class="ds-field${['error','success','warning','disabled'].includes(s)?' '+st(s):''}"><label class="ds-label" for="${id}">${o.label}${o.req?'<span class="req" aria-hidden="true">*</span>':''}</label><div class="ds-control${o.sz&&SZ[o.sz]?' '+SZ[o.sz]:''}${ctlState(s)}${o.cls?' '+o.cls:''}">${o.lead?ic(o.lead):''}<input id="${id}" type="${o.type||'text'}" ${o.ph?`placeholder="${o.ph}"`:''} ${o.val!=null?`value="${esc(o.val)}"`:''} ${s==='disabled'?'disabled':''} ${o.req?'required':''} ${o.help?`aria-describedby="${id}-h"`:''} ${s==='error'?'aria-invalid="true"':''} ${o.attrs||''}>${o.suffix?`<span class="ds-suffix">${o.suffix}</span>`:''}${o.trail||''}</div>${help(id,o.help,s)}</div>`;
}
function TA(o={}){
  const id=o.id||uid('ta');const s=o.state||'';
  return `<div class="ds-field${['error','success','warning','disabled'].includes(s)?' '+st(s):''}"><label class="ds-label" for="${id}">${o.label}</label><div class="ds-control ds-control--area${ctlState(s)}"><textarea id="${id}" rows="${o.rows||3}" ${o.ph?`placeholder="${o.ph}"`:''} ${s==='disabled'?'disabled':''} ${o.max?`maxlength="${o.max}" data-count`:''} aria-describedby="${id}-h">${esc(o.val||'')}</textarea></div><div style="display:flex;justify-content:space-between;gap:8px">${help(id,o.help||'',s)||'<span></span>'}${o.max?`<span class="ds-cnt" aria-live="polite">${(o.val||'').length}/${o.max}</span>`:''}</div></div>`;
}
function SEL(o={}){
  const id=o.id||uid('sel');const lid=id+'-lb';const s=o.state||'';const sel=o.sel==null?-1:o.sel;
  const opt=(x,i)=>{const l=typeof x==='string'?x:x.l;return `<div class="ds-opt" role="option" aria-selected="${i===sel}" data-label="${esc(l)}" data-value="${esc(l)}">${x.ic?ic(x.ic):''}${x.dot?`<span class="ds-badge ds-badge--${x.dot}" style="padding:0;width:8px;height:8px;border-radius:50%;background:var(--bdg-fg)"></span>`:''}<span class="ds-opt__main"><span class="ds-opt__label">${esc(l)}</span>${x.d?`<span class="ds-opt__desc">${x.d}</span>`:''}</span>${ic('check','ds-opt__tick')}</div>`};
  const lab=sel<0?(o.ph||'Select…'):(typeof o.options[sel]==='string'?o.options[sel]:o.options[sel].l);
  return `<div class="ds-field${['error','success','warning','disabled'].includes(s)?' '+st(s):''}"><span class="ds-label" id="${id}-l">${o.label}</span><div class="ds-anchor ds-block"><button type="button" id="${id}" class="ds-control ds-select${o.sz&&SZ[o.sz]?' '+SZ[o.sz]:''}${ctlState(s)}${s==='disabled'?' is-disabled':''}" data-ds="select" aria-haspopup="listbox" aria-expanded="false" aria-controls="${lid}" aria-labelledby="${id}-l ${id}" ${s==='disabled'?'disabled':''} ${o.help?`aria-describedby="${id}-h"`:''}>${o.lead?ic(o.lead):''}<span class="ds-val${sel<0?' ds-ph':''}">${esc(lab)}</span>${ic(o.updown?'updown':'chev-down','ds-chev')}</button><div class="ds-pop${o.listCls?' '+o.listCls:''}" id="${lid}" role="listbox" aria-labelledby="${id}-l" tabindex="-1" hidden>${o.options.map(opt).join('')}</div></div>${help(id,o.help,s)}</div>`;
}
const CHK=(label,o={})=>{const s=o.state||'';return `<label class="ds-check${o.radio?' ds-radio':''}${['hover','focus','active','error'].includes(s)?' '+st(s):''}${s==='selected'?' is-selected':''}"><input type="${o.radio?'radio':'checkbox'}"${o.name?` name="${o.name}"`:''}${o.checked||s==='selected'?' checked':''}${s==='disabled'||o.dis?' disabled':''}${o.attrs?' '+o.attrs:''}><span class="ds-check__box">${o.radio?'':CHECK}</span><span class="ds-check__txt">${label}${o.desc?`<small>${o.desc}</small>`:''}</span></label>`};
const SW=(label,o={})=>{const s=o.state||'';return `<label class="ds-switch${['hover','focus','active'].includes(s)?' '+st(s):''}"><input type="checkbox" role="switch"${o.on||s==='selected'?' checked':''}${s==='disabled'||o.dis?' disabled':''}><span class="ds-switch__track"></span><span>${label}</span></label>`};
const AV=(ini,c,o={})=>`<span class="ds-av${o.sz?' ds-'+o.sz:''}${o.sq?' ds-av--sq':''}" data-c="${c}" role="img" aria-label="${o.name||ini}">${ini}${o.pr?`<span class="ds-av__presence${o.pr!=='on'?' ds-av__presence--'+o.pr:''}"></span>`:''}</span>`;
const BADGE=(t,v='',o={})=>`<span class="ds-badge${v?' ds-badge--'+v:''}${o.strong?' ds-badge--strong':''}${o.sz?' ds-'+o.sz:''}"><span class="ds-dot"></span>${t}</span>`;
const COUNT=(n,o={})=>`<span class="ds-badge ds-badge--count${o.alert?' ds-badge--alert':''}${o.sz?' ds-'+o.sz:''}">${n}</span>`;
const MENU_ITEMS=[{h:'Issue'},{l:'Edit issue',ic:'edit',kbd:'E'},{l:'Duplicate',ic:'copy',kbd:'Ctrl D'},{l:'Move to…',ic:'folder',sub:1},{sep:1},{l:'Watch issue',check:1,on:1},{l:'Export as CSV',ic:'download',dis:1},{sep:1},{l:'Delete',ic:'trash',danger:1,kbd:'Del'}];
function MENU(id,o={}){
  const items=o.items||MENU_ITEMS;
  return `<div class="ds-pop${o.stat?' ds-pop--static':''}${o.ctx?' ds-pop--ctx':''}${o.right?' ds-pop--right':''}" id="${id}" role="menu" aria-label="${o.label||'Issue actions'}"${o.stat?'':' hidden'}>${items.map(x=>x.h?`<div class="ds-menu__head" role="presentation">${x.h}</div>`:x.sep?`<div class="ds-menu__sep" role="separator"></div>`:x.check?`<div class="ds-opt" role="menuitemcheckbox" aria-checked="${!!x.on}" tabindex="-1">${ic('eye')}<span class="ds-opt__label">${x.l}</span>${ic('check','ds-opt__tick')}</div>`:`<div class="ds-opt${x.danger?' ds-opt--danger':''}" role="menuitem" tabindex="-1"${x.dis?' aria-disabled="true"':''}${x.sub?' aria-haspopup="menu"':''}>${x.ic?ic(x.ic):''}<span class="ds-opt__label">${x.l}</span>${x.kbd?`<kbd>${x.kbd}</kbd>`:''}${x.sub?ic('chev-right','ds-opt__sub'):''}</div>`).join('')}</div>`;
}
function spark(data,w=120,h=28){const mx=Math.max(...data),mn=Math.min(...data);const pts=data.map((v,i)=>[i*(w/(data.length-1)),h-3-((v-mn)/(mx-mn||1))*(h-6)]);const d='M'+pts.map(p=>p.map(n=>n.toFixed(1)).join(' ')).join(' L');const last=pts[pts.length-1];return `<svg class="ds-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path class="ar" d="${d} L${w} ${h} L0 ${h}Z"/><path class="ln" d="${d}" vector-effect="non-scaling-stroke"/><circle cx="${last[0]}" cy="${last[1]}" r="2.5"/></svg>`}
const dPlus=n=>{const d=new Date(TODAY);d.setDate(d.getDate()+n);return d};

/* shared sample data */
const ISSUES=[
  {key:'DS-142',sum:'Migrate billing tables to new schema',status:['In progress','info'],who:['MR','Maya Ruiz',1],pts:8,upd:'2h ago',u:2},
  {key:'DS-139',sum:'Audit focus rings across admin console',status:['In review','new'],who:['JO','Jonas Ortiz',4],pts:3,upd:'5h ago',u:5},
  {key:'DS-137',sum:'Invoices API returns stale currency codes',status:['Blocked','danger'],who:['AK','Aiko Kato',5],pts:5,upd:'Yesterday',u:24},
  {key:'DS-131',sum:'Add bulk export to reports view',status:['To do',''],who:['LS','Liam Shah',3],pts:2,upd:'2d ago',u:48},
  {key:'DS-128',sum:'Rename workspace roles in settings',status:['Done','success'],who:['PN','Priya Nair',2],pts:1,upd:'4d ago',u:96},
  {key:'DS-125',sum:'Reduce dashboard first paint below 1.5s',status:['In progress','info'],who:['MR','Maya Ruiz',1],pts:13,upd:'5d ago',u:120}
];
const PEOPLE=[{n:'Maya Ruiz',r:'Engineering lead',i:'MR',c:1},{n:'Jonas Ortiz',r:'Product designer',i:'JO',c:4},{n:'Aiko Kato',r:'Backend engineer',i:'AK',c:5},{n:'Liam Shah',r:'QA analyst',i:'LS',c:3},{n:'Priya Nair',r:'Product manager',i:'PN',c:2},{n:'Tomás Weber',r:'Data engineer',i:'TW',c:4}];

/* comparison defaults */
const BASE_CMP=[
  ['Density','Compact','Medium','Spacious'],
  ['Corner radius','3–4px','4px controls · 8px surfaces','10px controls · 14–20px surfaces'],
  ['Borders','Visible, functional','Subtle, strong bottom edge on inputs','Hairline or none'],
  ['Shadow','Minimal, border-led','Layered elevation ramp','Soft, used rarely'],
  ['Focus','2px outline, 2px offset','2px high-contrast inset ring','4px soft tint halo'],
  ['Motion','~100ms, tint changes','150–250ms, decelerate','250–350ms, spring + scale']
];
function cmpRows(spec){const names=new Set((spec||[]).map(r=>r[0]));return [...(spec||[]),...BASE_CMP.filter(r=>!names.has(r[0]))]}
const KEYS={
  btn:[['Tab','Move focus to the button'],['Enter / Space','Activate']],
  field:[['Tab','Move between fields'],['Type','Edit the value']],
  list:[['↓ / ↑','Open and move through options'],['Enter','Choose the highlighted option'],['Esc','Close without choosing']],
  menu:[['Enter / ↓','Open the menu and focus the first item'],['↑ / ↓ · Home / End','Move between items'],['Esc','Close and return focus']],
  check:[['Tab','Move to the control'],['Space','Toggle']],
  dialog:[['Tab','Cycle focus inside the dialog'],['Esc','Close and return focus to the trigger']],
  none:[['Tab','Reach interactive children in order']]
};

/* ===================== OVERVIEW ===================== */
P({id:'overview',title:'Overview',section:'overview',icon:'home',kind:'custom',render(){
  const rating=(n)=>`<span class="dots" role="img" aria-label="${n} of 5">${[1,2,3,4,5].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}</span>`;
  const score=[['Data-dense screens (backlogs, admin tables)',5,4,2],['Keyboard-heavy power users',4,5,3],['Touch and tablet use',2,3,5],['Accessibility out of the box',4,5,4],['Brand calm / premium feel',2,3,5],['Learning curve for new users',3,4,5],['Long forms and configuration',4,5,3]];
  return `<div class="page-in">
  <section class="hero"><span class="eyebrow">Design language decision · enterprise app</span><h1>One component architecture, three design languages.</h1><p>Every component below shares the same markup, content, states and keyboard behaviour. Only the visual language changes: an Atlassian-inspired dense productivity system, a Fluent-inspired structured and layered system, and an Apple-inspired minimal and refined system. Use the style filter in the top bar to isolate one, or keep all three side by side.</p></section>
  <section class="sec"><div class="sec__h"><h2>Same screen, three languages</h2><p>An issue detail panel built from Breadcrumb, Badge, Button, Tabs, Text field and Select. Try the tabs and the select.</p></div>${benchHTML(k=>overviewScreen(k))}</section>
  <section class="sec"><div class="sec__h"><h2>Design philosophy</h2></div><div class="cmp-wrap"><table class="cmp"><thead><tr><th scope="col">Principle</th>${KS.map(k=>`<th scope="col" data-sys="${k}"><i class="mk mk--${k}"></i>${SYS[k].short}</th>`).join('')}</tr></thead><tbody>${[
    ['Core idea','Fit the most information on screen without losing hierarchy','Make structure and state obvious through layers and clear interaction feedback','Let typography and space carry hierarchy; remove everything else'],
    ['Default control height','32px (24px compact)','32px (24 / 40 alternatives)','36px (28 / 44 alternatives)'],
    ['Body text','14px Public Sans, 20px line','14px Segoe-style, 20px line','15px SF-style, 22px line, tight tracking'],
    ['Selection','Tint fill + primary text','Indicator bar + bold label','Solid fill or segmented thumb'],
    ['Inputs','Filled field, frame turns primary','White field, accent bar grows from centre','No box; hairline rule under the value'],
    ['Overlays','Flat surface, crisp shadow, dark blanket','Elevation 16–64, beaks on popovers','Translucent material with background blur'],
    ['Notifications','Flags bottom-left','Toasts bottom-right','Banners drop in top-centre']
  ].map(r=>`<tr><th scope="row">${r[0]}</th>${KS.map((k,i)=>`<td data-sys="${k}">${r[i+1]}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>
  <section class="sec"><div class="sec__h"><h2>Fit scorecard</h2><p>Our assessment of each language for common enterprise needs (5 = strongest fit).</p></div><div class="cmp-wrap"><table class="cmp score"><thead><tr><th scope="col">Need</th>${KS.map(k=>`<th scope="col" data-sys="${k}"><i class="mk mk--${k}"></i>${SYS[k].short}</th>`).join('')}</tr></thead><tbody>${score.map(r=>`<tr><th scope="row">${r[0]}</th>${KS.map((k,i)=>`<td data-sys="${k}">${rating(r[i+1])}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>
  <section class="sec"><div class="sec__h"><h2>When to choose which</h2></div><div class="verdicts">
    <div class="verdict" data-sys="a"><h3><i class="mk mk--a"></i>Atlassian-inspired</h3><p>Pick it when users live in the product all day and scan large volumes of records.</p><ul><li>Issue trackers, ops consoles, admin tables</li><li>Up to ~30% more rows per screen than the others</li><li>Weakest on touch targets and brand warmth</li></ul></div>
    <div class="verdict" data-sys="f"><h3><i class="mk mk--f"></i>Fluent-inspired</h3><p>Pick it for complex workflows with many forms, panels and keyboard-driven users.</p><ul><li>Configuration, CRM, finance back office</li><li>Strongest focus visibility and pressed feedback</li><li>Heavier visual weight from shadows</li></ul></div>
    <div class="verdict" data-sys="p"><h3><i class="mk mk--p"></i>Apple-inspired</h3><p>Pick it when clarity and calm matter more than density, or when tablets are common.</p><ul><li>Executive views, approvals, field and tablet apps</li><li>44px touch targets, generous whitespace</li><li>Needs more scrolling for dense data</li></ul></div>
  </div></section>
  <section class="sec"><div class="sec__h"><h2>Browse the lab</h2><p>${PAGES.filter(p=>p.section==='components').length} components, 5 foundations, 5 patterns.</p></div><div class="cards-grid">${groupsList().map(g=>{const first=PAGES.find(p=>p.group===g.name);return `<a class="jump" href="#${first.id}"><b>${g.name}</b><span>${g.items.map(i=>i.title).join(' · ')}</span></a>`}).join('')}</div></section>
  </div>`;
}});
function overviewScreen(k){
  const tid=uid('ov');
  return `<div class="ds-stack">
  <nav aria-label="Breadcrumb"><ol class="ds-crumbs"><li><a class="ds-crumb" href="#">Ledger Migration</a></li><li><a class="ds-crumb" href="#">Backlog</a></li><li><span aria-current="page">DS-142</span></li></ol></nav>
  <div class="ds-col" style="gap:6px"><h3 class="ds-t-h2">Migrate billing tables to new schema</h3><div class="ds-row" style="gap:8px">${BADGE('In progress','info')}<span class="ds-faint ds-small">Updated 2h ago by Maya Ruiz</span></div></div>
  <div class="ds-row">${B('Save changes',{v:'primary',icon:'check',attrs:'data-ds="feedback" data-title="Changes saved" data-text="DS-142 was updated."'})}${B('Assign',{icon:'user'})}${IB('more','More actions')}</div>
  ${tabs({id:tid,items:[{l:'Details',ic:'list',body:'Move invoices, line items and tax tables to the v2 schema without downtime.'},{l:'Activity',ic:'clock',n:12,body:'12 updates this week. Latest: Aiko attached the rollback plan.'},{l:'Linked',ic:'link',body:'Blocks DS-137 “Invoices API returns stale currency codes”.'}]})}
  <div class="ds-form-grid">${TF({label:'Summary',val:'Migrate billing tables',req:true})}${SEL({label:'Assignee',options:PEOPLE.map(p=>p.n),sel:0})}</div>
  </div>`;
}
function tabs(o){
  const id=o.id||uid('tb');const sel=o.sel||0;
  return `<div class="ds-tabs"><div class="ds-tablist" role="tablist" aria-label="${o.label||'Issue sections'}">${o.items.map((t,i)=>`<button type="button" class="ds-tab${o.stateAt===i?' '+st(o.state):''}" role="tab" id="${id}-t${i}" aria-selected="${i===sel}" aria-controls="${id}-p${i}" tabindex="${i===sel?0:-1}"${t.dis||(o.state==='disabled'&&o.stateAt===i)?' disabled':''}>${t.ic?ic(t.ic,'ds-tab__ic'):''}<span>${t.l}</span>${t.n!=null?`<span class="ds-tab__count">${t.n}</span>`:''}</button>`).join('')}<span class="ds-tabind" aria-hidden="true"></span></div>${o.noPanels?'':o.items.map((t,i)=>`<div class="ds-tabpanel" role="tabpanel" id="${id}-p${i}" aria-labelledby="${id}-t${i}" tabindex="0"${i===sel?'':' hidden'}><p>${t.body}</p></div>`).join('')}</div>`;
}

/* ===================== FOUNDATIONS ===================== */
const COLOR_TOKENS={
  a:[['Primary','--a-color-primary'],['Primary hover','--a-color-primary-hover'],['Primary pressed','--a-color-primary-pressed'],['Primary subtle','--a-color-primary-subtle'],['Text','--a-text'],['Text subtle','--a-text-subtle'],['Text subtlest','--a-text-subtlest'],['Surface','--a-surface'],['Surface sunken','--a-surface-sunken'],['Neutral fill','--a-neutral'],['Border','--a-border'],['Input border','--a-border-input'],['Success','--a-success'],['Warning','--a-warning'],['Warning bold','--a-warning-bold'],['Danger','--a-danger'],['Discovery','--a-discovery'],['Inverse','--a-inverse']],
  f:[['Brand','--f-color-primary'],['Brand hover','--f-color-primary-hover'],['Brand pressed','--f-color-primary-pressed'],['Brand subtle','--f-color-primary-subtle'],['Foreground 1','--f-text'],['Foreground 2','--f-text-2'],['Foreground 3','--f-text-3'],['Background 1','--f-surface'],['Canvas','--f-canvas'],['Subtle hover','--f-subtle-hover'],['Stroke','--f-stroke'],['Stroke accessible','--f-stroke-accessible'],['Success','--f-success'],['Warning','--f-warning'],['Danger','--f-danger'],['Discovery','--f-discovery'],['Inverse','--f-inverse'],['Divider','--f-divider']],
  p:[['Tint','--p-color-primary'],['Tint hover','--p-color-primary-hover'],['Tint pressed','--p-color-primary-pressed'],['Tint subtle','--p-color-primary-subtle'],['Label','--p-label'],['Secondary label','--p-label-2'],['Tertiary label','--p-label-3'],['Surface','--p-surface'],['Grouped background','--p-canvas'],['Fill','--p-fill'],['Separator','--p-separator'],['Material','--p-material'],['Green','--p-green'],['Orange','--p-orange'],['Red','--p-red'],['Purple','--p-purple'],['Inverse','--p-inverse'],['Border strong','--p-border-strong']]
};
P({id:'colors',title:'Colors',section:'foundations',icon:'drop',kind:'custom',render(){
  return `<div class="page-in"><header class="pg-head"><span class="eyebrow">Foundations</span><h1>Colors</h1><p>Each language owns a prefixed token set (<code>--a-*</code>, <code>--f-*</code>, <code>--p-*</code>). Values below are read live from the stylesheet, so they follow the light or dark theme.</p></header>
  <section class="sec"><div class="sec__h"><h2>Palette tokens</h2></div>${benchHTML(k=>`<div class="swatches">${COLOR_TOKENS[k].map(([n,t])=>`<div class="sw"><div class="sw__chip" style="background:var(${t})"></div><b>${n}</b><code data-tok="${t}">${t}</code></div>`).join('')}</div>`,true)}</section>
  <section class="sec"><div class="sec__h"><h2>Semantic colour in use</h2><p>The same four messages, coloured by each system's semantic tokens.</p></div>${benchHTML(k=>`<div class="ds-col">${['info','success','warning','danger','new'].map(v=>`<div class="ds-row" style="gap:10px">${BADGE({info:'Info',success:'Success',warning:'Warning',danger:'Danger',new:'Discovery'}[v],v)}${BADGE({info:'Info',success:'Success',warning:'Warning',danger:'Danger',new:'Discovery'}[v],v,{strong:1})}<span style="color:var(--${{info:'inf',success:'ok',warning:'warn',danger:'err',new:'new'}[v]})">${ic({info:'info',success:'ok',warning:'warn',danger:'err',new:'sparkle'}[v])}</span></div>`).join('')}</div>`)}</section>
  ${cmpTable([['Primary hue','Royal blue, strong','Deep cobalt, structured','Bright tint, used sparingly'],['Neutrals','Cool slate with blue bias','True greys','Translucent greys over surfaces'],['Surfaces','White on white, sunken greys','White cards on #FAFAFA canvas','White groups on grey grouped background'],['Status colour use','Bold lozenges, warning yellow','Tinted backgrounds + 1px stroke','Coloured dots and icons, little fill']])}</div>`;
},after(root){$$('[data-tok]',root).forEach(c=>{const v=getComputedStyle(c.closest('.lab-stage')).getPropertyValue(c.dataset.tok).trim();c.textContent=`${c.dataset.tok}\n${v}`;c.style.whiteSpace='pre-line'})}});

P({id:'typography',title:'Typography',section:'foundations',icon:'type',kind:'custom',render(){
  const roles=[['display','Display','Ship faster, together'],['h1','Heading 1','Quarterly planning'],['h2','Heading 2','Billing migration'],['h3','Heading 3','Acceptance criteria'],['body','Body','Move invoices, line items and tax tables to the v2 schema without downtime. Rollback stays available for 14 days.'],['small','Small','Updated 2 hours ago by Maya Ruiz'],['caption','Caption','DS-142 · 8 story points'],['eyebrow','Eyebrow','Project settings']];
  return `<div class="page-in"><header class="pg-head"><span class="eyebrow">Foundations</span><h1>Typography</h1><p>Atlassian-inspired type is compact and functional; Fluent-inspired type uses a wide, regular ramp; Apple-inspired type leans on weight and tight tracking to create hierarchy without colour.</p></header>
  <section class="sec"><div class="sec__h"><h2>Type ramp</h2><p>Measured values are read from the rendered text.</p></div>${benchHTML(k=>`<div class="ds-col" style="gap:18px">${roles.map(([r,n,t])=>`<div style="display:grid;gap:4px"><span style="font:500 11px 'JetBrains Mono',monospace;color:var(--fg3)" data-measure>${n}</span><p class="ds-t-${r}">${t}</p></div>`).join('')}</div>`)}</section>
  ${cmpTable([['Typeface','Public Sans (system fallback)','Segoe UI Variable / Open Sans','SF Pro / system, Inter fallback'],['Body','14 / 20, regular','14 / 20, regular','15 / 22, regular, −0.01em'],['Display','29px, 650 weight','40px, semibold','40px, bold, −0.025em'],['Hierarchy carried by','Size + weight steps','Size ramp, consistent weight','Weight + tracking + space'],['Labels','12px bold, subtle colour','14px semibold','13px medium, secondary']])}</div>`;
},after(root){$$('[data-measure]',root).forEach(m=>{const p=m.nextElementSibling;const cs=getComputedStyle(p);m.textContent=`${m.textContent} · ${parseFloat(cs.fontSize)}px / ${cs.lineHeight==='normal'?'normal':parseFloat(cs.lineHeight)+'px'} · ${cs.fontWeight}`})}});

P({id:'spacing',title:'Spacing',section:'foundations',icon:'ruler',kind:'custom',render(){
  const sc={a:['--a-space-050','--a-space-100','--a-space-150','--a-space-200','--a-space-300','--a-space-400'],f:['--f-space-xs','--f-space-s','--f-space-m','--f-space-l','--f-space-xl','--f-space-xxl'],p:['--p-space-1','--p-space-2','--p-space-3','--p-space-4','--p-space-5','--p-space-6','--p-space-7']};
  return `<div class="page-in"><header class="pg-head"><span class="eyebrow">Foundations</span><h1>Spacing &amp; density</h1><p>All three use an 8px base grid. The difference is which steps each language reaches for by default: Atlassian-inspired gaps sit at 8px, Fluent-inspired at 12px, Apple-inspired at 16px and above.</p></header>
  <section class="sec"><div class="sec__h"><h2>Scale</h2></div>${benchHTML(k=>`<div class="ds-col" style="gap:10px">${sc[k].map(t=>`<div style="display:grid;grid-template-columns:120px 1fr;align-items:center;gap:10px"><code style="font:11px 'JetBrains Mono',monospace;color:var(--fg3)" data-tok="${t}">${t}</code><span style="height:12px;width:var(${t});background:var(--pri);border-radius:2px;opacity:.75"></span></div>`).join('')}</div>`)}</section>
  <section class="sec"><div class="sec__h"><h2>Density in practice</h2><p>The same five rows and controls. Compare how much fits in the column.</p></div>${benchHTML(k=>`<div class="ds-stack"><div class="ds-row">${B('Create',{v:'primary'})}${B('Filter',{icon:'filter'})}${B('Export',{v:'subtle'})}</div><ul class="ds-list">${ISSUES.slice(0,5).map(i=>`<li class="ds-li"><div class="ds-li__main"><span class="ds-li__title">${i.sum}</span><span class="ds-li__sub">${i.key} · ${i.who[1]}</span></div><span class="ds-li__end">${i.pts} pts</span></li>`).join('')}</ul></div>`)}</section>
  ${cmpTable([['Base unit','8px','8px','8px'],['Default gap','8px','12px','16px'],['Section gap','16px','20px','28px'],['Card padding','12px','16px','22px'],['List row height','40px','52px','56px'],['Table row height','36px','44px','48px']])}</div>`;
},after(root){$$('[data-tok]',root).forEach(c=>{c.textContent=c.dataset.tok+' · '+getComputedStyle(c.closest('.lab-stage')).getPropertyValue(c.dataset.tok).trim()})}});

const ICON_SET=['plus','search','edit','trash','copy','filter','sliders','bell','user','users','home','folder','file','calendar','clock','upload','download','star','info','warn','ok','err','link','share','eye','refresh','lock','mail','globe','chart','tag','flag','bolt','layers','inbox','grid','list','code','image','cloud','branch','sparkle'];
P({id:'icons',title:'Icons',section:'foundations',icon:'shapes',kind:'custom',render(){
  return `<div class="page-in"><header class="pg-head"><span class="eyebrow">Foundations</span><h1>Icons</h1><p>One outline icon set, drawn three ways. Size and stroke weight come from each language's tokens: 16px at 2px stroke, 18px at 1.5px, and 17px at 1.7px.</p></header>
  <section class="sec">${benchHTML(k=>`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:${k==='a'?4:k==='f'?8:14}px">${ICON_SET.map(n=>`<div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:var(--r);color:var(--fg)" title="${n}">${ic(n)}<span style="font-size:10.5px;color:var(--fg3)">${n}</span></div>`).join('')}</div>`)}</section>
  <section class="sec"><div class="sec__h"><h2>In context</h2></div>${benchHTML(k=>`<div class="ds-row">${IB('edit','Edit')}${IB('copy','Copy')}${IB('share','Share')}${IB('trash','Delete')}${B('Upload',{icon:'upload',keep:1})}${B('Filter',{icon:'filter',keep:1,v:'subtle'})}</div>`)}</section>
  ${cmpTable([['Size (default)','16px','18–20px','17px'],['Stroke','2px','1.5px','1.7px'],['Colour','Subtle text colour','Primary colour in subtle buttons','Tint colour, matches text weight'],['Pairing with text','Icon optional on buttons','Icon + label encouraged','Text first, icon rarely']])}</div>`;
}});

P({id:'elevation',title:'Elevation',section:'foundations',icon:'elev',kind:'custom',render(){
  const lv={a:[['Flat','none'],['Raised','--a-shadow-raised'],['Overlay','--a-shadow-overlay'],['Modal','--a-shadow-modal']],f:[['Shadow 2','--f-shadow-2'],['Shadow 4','--f-shadow-4'],['Shadow 8','--f-shadow-8'],['Shadow 16','--f-shadow-16'],['Shadow 28','--f-shadow-28'],['Shadow 64','--f-shadow-64']],p:[['Flat','none'],['Soft','--p-shadow-soft'],['Float','--p-shadow-float'],['Sheet','--p-shadow-sheet']]};
  const rad={a:['--a-radius-sm','--a-radius','--a-radius-lg'],f:['--f-radius-sm','--f-radius','--f-radius-lg','--f-radius-xl'],p:['--p-radius-sm','--p-radius','--p-radius-lg','--p-radius-xl']};
  return `<div class="page-in"><header class="pg-head"><span class="eyebrow">Foundations</span><h1>Elevation &amp; shape</h1><p>Fluent-inspired depth is a deliberate six-step ramp. Atlassian-inspired depth stays crisp and close to the surface. Apple-inspired depth is rare, wide and soft, and often replaced by translucent materials.</p></header>
  <section class="sec"><div class="sec__h"><h2>Shadow levels</h2></div>${benchHTML(k=>`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:18px">${lv[k].map(([n,t])=>`<div style="height:84px;border-radius:var(--r-l);background:var(--bg);box-shadow:${t==='none'?'0 0 0 1px var(--sep)':'var('+t+')'};display:flex;flex-direction:column;justify-content:flex-end;padding:10px"><b style="font-size:12px">${n}</b><code style="font:10px 'JetBrains Mono',monospace;color:var(--fg3)">${t}</code></div>`).join('')}</div>`)}</section>
  <section class="sec"><div class="sec__h"><h2>Corner radius</h2></div>${benchHTML(k=>`<div class="ds-row" style="gap:16px;align-items:flex-end">${rad[k].map(t=>`<div style="display:grid;gap:6px;justify-items:center"><span style="width:64px;height:64px;border:2px solid var(--pri);border-radius:var(${t});background:var(--pri-sub)"></span><code style="font:10.5px 'JetBrains Mono',monospace;color:var(--fg3)" data-tok="${t}">${t}</code></div>`).join('')}</div>`)}</section>
  <section class="sec"><div class="sec__h"><h2>Materials</h2><p>A popover over busy content shows how each language separates layers.</p></div>${benchHTML(k=>`<div style="position:relative;height:170px;border-radius:var(--r-l);overflow:hidden;background:repeating-linear-gradient(135deg,var(--pri-sub) 0 14px,transparent 14px 28px),var(--bg)"><div class="ds-pop ds-pop--static" style="position:absolute;left:24px;top:24px;right:24px" role="presentation"><div class="ds-opt">${ic('edit')}<span>Edit issue</span><kbd>E</kbd></div><div class="ds-opt is-cur">${ic('copy')}<span>Duplicate</span></div><div class="ds-opt">${ic('trash')}<span>Delete</span></div></div></div>`)}</section>
  ${cmpTable([['Levels','4 (flat → modal)','6 (2 → 64)','4 (flat → sheet)'],['Card treatment','Hairline + 1px shadow','Shadow 4, no border','No shadow; contrast with grouped background'],['Overlays','Crisp shadow + dark blanket','Shadow 16–64','Blur material + light blanket'],['Radius','3 / 4 / 6px','2 / 4 / 8 / 12px','6 / 10 / 14 / 20px']])}</div>`;
},after(root){$$('[data-tok]',root).forEach(c=>{c.textContent=c.dataset.tok.replace(/^--\w-/,'')+' · '+getComputedStyle(c.closest('.lab-stage')).getPropertyValue(c.dataset.tok).trim()})}});

function cmpTable(spec,title='Comparison'){return `<section class="sec"><div class="sec__h"><h2>${title}</h2></div><div class="cmp-wrap"><table class="cmp"><thead><tr><th scope="col">Property</th>${KS.map(k=>`<th scope="col" data-sys="${k}"><i class="mk mk--${k}"></i>${SYS[k].short}</th>`).join('')}</tr></thead><tbody>${spec.map(r=>`<tr><th scope="row">${r[0]}</th>${KS.map((k,i)=>`<td data-sys="${k}">${r[i+1]}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`}

/* ===================== ACTIONS ===================== */
P({id:'button',title:'Button',group:'Actions',icon:'cursor',cls:['ds-btn'],
  desc:'Triggers an action. Primary for the main action on a surface, default for secondary, subtle for low-emphasis and toolbar actions, danger for destructive ones.',
  demo:k=>`<div class="ds-stack"><div class="ds-row">${B('Create',{v:'primary',icon:'plus',attrs:'data-ds="feedback"'})}${B('Share',{icon:'share'})}${B('Watch',{v:'subtle',icon:'eye'})}${B('Delete',{v:'danger',attrs:'data-ds="toast" data-v="warning" data-title="Delete requested" data-text="Use a confirmation dialog for destructive actions."'})}${B('Learn more',{v:'link'})}</div><div class="ds-row">${B('Following',{icon:'check',attrs:'aria-pressed="true" data-ds="toggle"'})}${B('Saving',{v:'primary',attrs:'aria-busy="true"'})}${B('Unavailable',{v:'primary',attrs:'disabled'})}</div><p class="ds-cap">Click Create to see loading, then success feedback. “Following” is a toggle button.</p></div>`,
  states:['default','hover','focus','active','selected','disabled','loading'],
  state:(k,s)=>{const a=s==='disabled'?'disabled':s==='selected'?'aria-pressed="true"':'';return `<div class="ds-row">${B('Create',{v:'primary',icon:'plus',cls:st(s),attrs:a})}${B('Cancel',{cls:st(s),attrs:a})}${B('Edit',{v:'subtle',icon:'edit',cls:st(s),attrs:a})}</div>`},
  sizes:['s','m','l'],size:(k,z)=>`<div class="ds-row">${B('Create',{v:'primary',sz:z,icon:'plus'})}${B('Cancel',{sz:z})}${B('Edit',{v:'subtle',sz:z})}</div>`,
  cmp:[['Height (S / M / L)','24 / 32 / 40px','24 / 32 / 40px','28 / 36 / 44px'],['Radius','3px','4px','10px (14px large)'],['Default button','Grey fill, no border','White, 1px stroke','Tinted grey fill, tint-coloured text'],['Primary emphasis','Strong','Strong','Moderate, semibold text'],['Leading icon','Hidden by default','Shown','Hidden; text carries meaning'],['Pressed feedback','Darker fill','Darker fill + stroke','Scale to 97%'],['Disabled','Grey fill, grey text','Grey fill + divider stroke','35% opacity']],
  a11y:'Uses a native <code>button</code>. Toggle buttons expose <code>aria-pressed</code>; loading buttons set <code>aria-busy</code> and keep their width so the layout does not jump.',keys:KEYS.btn});

P({id:'icon-button',title:'Icon Button',group:'Actions',icon:'star',cls:['ds-ibtn','ds-tip'],
  desc:'A square button with only an icon, for dense toolbars and row actions. Always carries an accessible name and a tooltip.',
  demo:k=>`<div class="ds-stack"><div class="ds-row" style="padding-top:34px">${TIP(IB('edit','Edit issue'),'Edit',{kbd:'E'})}${TIP(IB('copy','Copy link'),'Copy link')}${TIP(IB('share','Share'),'Share')}${TIP(IB('star','Star issue',{attrs:'aria-pressed="false" data-ds="toggle"'}),'Star')}${TIP(IB('more','More actions'),'More actions')}</div><div class="ds-row">${IB('plus','Create',{v:'primary'})}${IB('filter','Filter',{v:'default'})}${IB('trash','Delete',{v:'danger'})}</div><p class="ds-cap">Hover or focus to see tooltips. The star is a toggle.</p></div>`,
  states:['default','hover','focus','active','selected','disabled'],
  state:(k,s)=>{const a=s==='disabled'?'disabled':s==='selected'?'aria-pressed="true"':'';return `<div class="ds-row">${IB('edit','Edit',{cls:st(s),attrs:a})}${IB('filter','Filter',{v:'default',cls:st(s),attrs:a})}${IB('plus','Create',{v:'primary',cls:st(s),attrs:a})}</div>`},
  sizes:['s','m','l'],size:(k,z)=>`<div class="ds-row">${IB('edit','Edit',{sz:z})}${IB('filter','Filter',{v:'default',sz:z})}${IB('plus','Create',{v:'primary',sz:z})}</div>`,
  cmp:[['Shape','Square, 3px radius','Square, 4px radius','Circle'],['Icon size','16px','18px','17px'],['Default style','Transparent until hover','Transparent; icon in brand colour','Transparent; tint colour'],['Tooltip','Dark, fast (300ms)','Light with beak (250ms)','Material, delayed (600ms)']],
  a11y:'Every icon button has an <code>aria-label</code>. Tooltips are linked with <code>aria-describedby</code>, appear on focus as well as hover, and close with Esc.',keys:[...KEYS.btn,['Esc','Hide the tooltip']]});

P({id:'button-group',title:'Button Group',group:'Actions',icon:'dots-h',cls:['ds-bgroup'],
  desc:'Groups related buttons. As a single-choice group it switches a view or time range.',
  demo:k=>`<div class="ds-stack"><div class="ds-col" style="gap:6px"><span class="ds-label" id="${k}bg1">Time range</span><div class="ds-bgroup" role="group" aria-labelledby="${k}bg1" data-ds="seg">${['Day','Week','Month','Quarter'].map((x,i)=>B(x,{attrs:`aria-pressed="${i===1}"`})).join('')}</div></div><div class="ds-col" style="gap:6px"><span class="ds-label" id="${k}bg2">View</span><div class="ds-bgroup" role="group" aria-labelledby="${k}bg2" data-ds="seg">${[['List','list'],['Board','grid'],['Timeline','chart']].map((x,i)=>B(x[0],{icon:x[1],attrs:`aria-pressed="${i===0}"`})).join('')}</div></div><div class="ds-bgroup" role="group" aria-label="Issue actions">${B('Edit',{icon:'edit'})}${B('Assign',{icon:'user'})}${B('Archive',{icon:'inbox'})}</div></div>`,
  states:['default','hover','focus','disabled'],
  state:(k,s)=>`<div class="ds-bgroup" role="group" aria-label="Range">${['Day','Week','Month'].map((x,i)=>B(x,{cls:i===2?st(s):'',attrs:`aria-pressed="${i===0}"${s==='disabled'?' disabled':''}`})).join('')}</div>`,
  sizes:['s','m','l'],size:(k,z)=>`<div class="ds-bgroup" role="group" aria-label="Range">${['Day','Week','Month'].map((x,i)=>B(x,{sz:z,attrs:`aria-pressed="${i===1}"`})).join('')}</div>`,
  cmp:[['Composition','Separate buttons, 4px apart','Joined, shared 1px borders','Segmented control in a fill track'],['Selected','Blue tint + blue text','Brand subtle fill + brand stroke','White thumb with soft shadow'],['Best for','Toolbars with many actions','View switchers in forms and panels','2–5 mutually exclusive options']],
  a11y:'The wrapper is <code>role="group"</code> with a label. Single-choice groups use <code>aria-pressed</code> on each button so screen readers announce the current choice.',keys:KEYS.btn});

P({id:'split-button',title:'Split Button',group:'Actions',icon:'chev-down',cls:['ds-split','ds-pop','ds-opt'],
  desc:'A primary action with a menu of related alternatives attached to the same control.',
  demo:k=>{const m1=uid('sm'),m2=uid('sm');const items=[{l:'Publish now',ic:'bolt'},{l:'Schedule…',ic:'calendar'},{l:'Save as draft',ic:'file'}];return `<div class="ds-stack" style="min-height:170px"><div class="ds-row"><div class="ds-anchor"><div class="ds-split">${B('Publish',{v:'primary',attrs:'data-ds="feedback" data-title="Published" data-text="Release notes 4.2 are live."'})}<button type="button" class="ds-btn ds-btn--primary" data-ds="menu" aria-haspopup="menu" aria-expanded="false" aria-controls="${m1}" aria-label="More publish options">${ic('chev-down')}</button></div>${MENU(m1,{items,label:'Publish options'})}</div><div class="ds-anchor"><div class="ds-split">${B('Export')}<button type="button" class="ds-btn" data-ds="menu" aria-haspopup="menu" aria-expanded="false" aria-controls="${m2}" aria-label="More export options">${ic('chev-down')}</button></div>${MENU(m2,{items:[{l:'CSV',ic:'file'},{l:'Excel workbook',ic:'table'},{l:'PDF report',ic:'download'}],label:'Export formats'})}</div></div><p class="ds-cap">The main segment runs the default; the chevron opens alternatives.</p></div>`},
  states:['default','hover','focus','disabled'],
  state:(k,s)=>`<div class="ds-split">${B('Publish',{v:'primary',cls:st(s),attrs:s==='disabled'?'disabled':''})}<button type="button" class="ds-btn ds-btn--primary${s==='hover'?'':''}" aria-label="More options"${s==='disabled'?' disabled':''}>${ic('chev-down')}</button></div>`,
  sizes:['s','m','l'],size:(k,z)=>`<div class="ds-split">${B('Publish',{v:'primary',sz:z})}<button type="button" class="ds-btn ds-btn--primary ${SZ[z]}" aria-label="More options">${ic('chev-down')}</button></div>`,
  cmp:[['Divider','1px gap between halves','Inset hairline on primary','Inset hairline'],['Menu surface','Flat, 4px radius','8px radius, shadow 16','Blur material, 12px radius'],['Hover in menu','Grey tint','Grey rounded tint','Solid tint with white text']],
  a11y:'The chevron is a separate <code>button</code> with <code>aria-haspopup="menu"</code> and <code>aria-expanded</code>. Opening the menu moves focus to the first item.',keys:KEYS.menu});

P({id:'link',title:'Link',group:'Actions',icon:'link',cls:['ds-link'],
  desc:'Navigates to another page or resource. Use inline within text or standalone for “learn more” style navigation.',
  demo:k=>`<div class="ds-stack"><p class="ds-t-body" style="max-width:46ch">This issue blocks <a class="ds-link" href="#">DS-137</a> and is tracked in the <a class="ds-link" href="#">Q3 billing roadmap</a>.</p><div class="ds-row"><a class="ds-link" href="#">View all activity<span class="ds-link__arrow" aria-hidden="true">›</span></a><a class="ds-link" href="#">Open runbook ${ic('external')}</a><a class="ds-link is-disabled" aria-disabled="true">Archived report</a></div></div>`,
  states:['default','hover','focus','disabled'],
  state:(k,s)=>`<a class="ds-link ${st(s)}" href="#"${s==='disabled'?' aria-disabled="true"':''}>View all activity<span class="ds-link__arrow" aria-hidden="true">›</span></a>`,
  cmp:[['Underline','On hover','On hover, offset 3px','Never; opacity on hover'],['Visited','Purple','Unchanged','Unchanged'],['Trailing affordance','None','None','Chevron “›” on standalone links']],
  a11y:'Links use real <code>a</code> elements with descriptive text. Disabled links drop their <code>href</code> and set <code>aria-disabled</code>.',keys:[['Tab','Move focus'],['Enter','Follow the link']]});


'use strict';
/* ===================== FORMS ===================== */
const FIELD_STATES=['default','hover','focus','disabled','loading','error','success','warning'];
const FIELD_MSG={error:'Summary is required',success:'Name is available',warning:'Similar issue DS-131 exists',disabled:'Locked while the sprint is active',default:'Shown on the board card',hover:'Shown on the board card',focus:'Shown on the board card',loading:'Checking for duplicates…'};
P({id:'text-field',title:'Text Field',group:'Forms',icon:'form',cls:['ds-field','ds-label','ds-control','ds-help'],
  desc:'Single-line text input with label, helper text and validation. Supports leading icons and suffixes.',
  demo:k=>`<div class="ds-form-grid">${TF({label:'Summary',ph:'What needs to be done?',req:true,help:'Shown on the board card'})}${TF({label:'Reporter email',type:'email',lead:'mail',val:'maya.ruiz@ledger.example'})}${TF({label:'Budget',type:'number',val:'12500',suffix:'USD'})}${TF({label:'Issue key',val:'DS-142',state:'disabled',help:'Generated automatically'})}</div>`,
  states:FIELD_STATES,
  state:(k,s)=>TF({label:'Summary',val:s==='error'?'':'Migrate billing tables',ph:'What needs to be done?',state:s,help:FIELD_MSG[s],req:s==='error'}),
  sizes:['s','m','l'],size:(k,z)=>TF({label:'Summary',ph:'What needs to be done?',sz:z}),
  cmp:[['Field shape','Filled grey box, 1px frame','White box, darker bottom stroke','No box, hairline underline'],['Focus','Frame turns primary (2px)','Accent bar grows from centre','Underline thickens in tint'],['Label','12px bold, above','14px semibold, above','13px medium, secondary'],['Height (M)','32px','32px','36px'],['Error','Red frame + icon message','Red bar + icon message','Red underline + small text']],
  a11y:'Each input has a visible <code>label</code>. Helper and error text are linked via <code>aria-describedby</code>; invalid inputs set <code>aria-invalid="true"</code>. Required fields use the native <code>required</code> attribute plus a visual asterisk.',keys:KEYS.field});

P({id:'text-area',title:'Text Area',group:'Forms',icon:'form',cls:['ds-control--area','ds-cnt','ds-field'],
  desc:'Multi-line text input for descriptions and comments, with an optional live character count.',
  demo:k=>`<div class="ds-stack">${TA({label:'Description',val:'Move invoices, line items and tax tables to the v2 schema. Keep the read replica in sync until cut-over.',max:280,help:'Supports plain text'})}${TA({label:'Rejection reason',state:'error',help:'Add a reason so the reporter knows what to change',rows:2})}</div>`,
  states:['default','focus','disabled','error'],
  state:(k,s)=>TA({label:'Comment',val:s==='error'?'':'Looks good, ship it.',rows:2,state:s,help:s==='error'?'Comment cannot be empty':''}),
  cmp:[['Frame','Same as text field','Same as text field','Rounded 10px box (not underline)'],['Resize','Vertical','Vertical','Vertical'],['Counter','Right, small','Right, small','Right, small']],
  init(st){$$('textarea[data-count]',st).forEach(t=>t.addEventListener('input',()=>{t.closest('.ds-field').querySelector('.ds-cnt').textContent=`${t.value.length}/${t.maxLength}`}))},
  a11y:'The counter is in an <code>aria-live="polite"</code> region so assistive tech hears it without interrupting typing.',keys:KEYS.field});

P({id:'search',title:'Search',group:'Forms',icon:'search',cls:['ds-control--search','ds-x','ds-cmd-hint'],
  desc:'A search input with a leading icon, clear button and keyboard hint.',
  demo:k=>{const id=uid('s');return `<div class="ds-stack"><div class="ds-field"><label class="ds-label" for="${id}">Search issues</label><div class="ds-control ds-control--search">${ic('search')}<input id="${id}" type="search" placeholder="Search by key, title or assignee" value="billing" aria-describedby="${id}-h"><button type="button" class="ds-x" aria-label="Clear search" data-clear>${ic('x')}</button><span class="ds-cmd-hint" aria-hidden="true"><kbd>/</kbd></span></div><p class="ds-help" id="${id}-h">Press Enter to search</p></div><div class="ds-row" style="gap:6px"><span class="ds-faint ds-small">Recent:</span>${['billing','focus ring','DS-13'].map(x=>`<button type="button" class="ds-chip" data-recent>${ic('clock')}${x}</button>`).join('')}</div></div>`},
  init(st,k){const inp=st.querySelector('input[type=search]');const x=st.querySelector('[data-clear]');const sync=()=>x.hidden=!inp.value;sync();inp.addEventListener('input',sync);x.addEventListener('click',()=>{inp.value='';sync();inp.focus()});inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();toast(k,{title:`Searching for “${inp.value||'everything'}”`,text:'14 issues match in Ledger Migration.'})}});st.addEventListener('click',e=>{const c=e.target.closest('[data-recent]');if(c){e.stopPropagation();c.setAttribute('aria-pressed','false');inp.value=c.textContent.trim();sync();inp.focus()}},true)},
  states:['default','hover','focus','disabled','loading'],
  state:(k,s)=>`<div class="ds-field${s==='disabled'?' is-disabled':''}"><div class="ds-control ds-control--search${ctlState(s)}">${ic('search')}<input type="search" aria-label="Search" placeholder="Search issues"${s==='disabled'?' disabled':''} value="${s==='default'||s==='disabled'?'':'billing'}"></div></div>`,
  sizes:['s','m','l'],size:(k,z)=>`<div class="ds-control ds-control--search ${SZ[z]}">${ic('search')}<input type="search" aria-label="Search" placeholder="Search issues"></div>`,
  cmp:[['Shape','Same box as text fields','Same box as text fields','Filled rounded field (differs from text fields)'],['Clear button','Circular, appears with text','Circular, appears with text','Circular, appears with text'],['Shortcut hint','“/” key chip','“/” key chip','“/” key chip']],
  a11y:'Uses <code>type="search"</code> with a visible label. The clear button has its own accessible name and returns focus to the input.',keys:[['/','Focus search (app-level)'],['Enter','Run search'],['Esc','Clear (native)']]});

P({id:'select',title:'Select',group:'Forms',icon:'chev-down',cls:['ds-select','ds-pop','ds-opt','ds-chev'],
  desc:'Pick one value from a short list. Opens a listbox; the trigger shows the current value.',
  demo:k=>`<div class="ds-form-grid" style="min-height:240px;align-content:start">${SEL({label:'Status',options:[{l:'To do',dot:''},{l:'In progress',dot:'info'},{l:'In review',dot:'new'},{l:'Blocked',dot:'danger'},{l:'Done',dot:'success'}],sel:1})}${SEL({label:'Assignee',options:PEOPLE.map(p=>({l:p.n,d:p.r})),ph:'Unassigned'})}${SEL({label:'Sprint',options:['Sprint 41','Sprint 42'],sel:0,state:'disabled',help:'Sprint is locked'})}</div>`,
  states:['default','hover','focus','disabled','error'],
  state:(k,s)=>SEL({label:'Priority',options:['Highest','High','Medium','Low'],sel:s==='error'?-1:2,ph:'Choose a priority',state:s,help:s==='error'?'Priority is required':''}),
  sizes:['s','m','l'],size:(k,z)=>SEL({label:'Priority',options:['Highest','High','Medium','Low'],sel:2,sz:z}),
  cmp:[['Trigger','Field-style box + chevron','Field-style box + chevron','Underlined value + chevron'],['Selected option','Tint row + left bar','Bold text + left indicator','Checkmark; hover is solid tint'],['Menu radius','4px','8px','12px, blurred material'],['Option height','32px','32px','30px']],
  a11y:'Follows the ARIA select-only combobox pattern: a <code>button</code> with <code>aria-haspopup="listbox"</code> controls a <code>role="listbox"</code>; the highlighted option is exposed with <code>aria-activedescendant</code> while focus stays on the trigger.',keys:KEYS.list});

P({id:'multi-select',title:'Multi Select',group:'Forms',icon:'tag',cls:['ds-control--multi','ds-tag','ds-opt'],
  desc:'Choose several values. Selections appear as removable tags inside the field.',
  demo:k=>{const id=uid('ms'),lid=id+'-lb';const ops=['Frontend','Backend','Accessibility','Performance','Security','Design debt','Billing'];const pre=[2,6];return `<div style="min-height:300px"><div class="ds-field"><label class="ds-label" for="${id}">Labels</label><div class="ds-anchor ds-block"><div class="ds-control ds-control--multi" onclick="this.querySelector('input').focus()"><span class="ds-multi-chips" style="display:contents"></span><input id="${id}" type="text" role="combobox" data-ds="multi" data-open-on-focus aria-autocomplete="list" aria-expanded="false" aria-controls="${lid}" placeholder="Add labels…" autocomplete="off">${ic('chev-down','ds-chev')}</div><div class="ds-pop" id="${lid}" role="listbox" aria-multiselectable="true" aria-label="Labels" hidden>${ops.map((o,i)=>`<div class="ds-opt" role="option" aria-selected="${pre.includes(i)}" data-value="${o}" data-label="${o}"><span class="ds-check__box">${CHECK}</span><span class="ds-opt__label">${o}</span></div>`).join('')}</div></div><p class="ds-help">Type to filter. Backspace removes the last label.</p></div></div>`},
  cmp:[['Tags in field','Square 3px, grey','Rounded 4px with stroke','Capsules'],['Options','Checkbox + label','Checkbox + label','Checkbox; whole row tints on hover'],['Field growth','Wraps to new lines','Wraps to new lines','Wraps to new lines']],
  a11y:'An editable combobox controls a <code>listbox</code> with <code>aria-multiselectable="true"</code>. Each tag has a remove button named “Remove &lt;label&gt;”.',keys:[...KEYS.list,['Backspace','Remove the last tag when the input is empty']]});

P({id:'combobox',title:'Combobox',group:'Forms',icon:'search',cls:['ds-anchor','ds-opt','ds-combo-toggle'],
  desc:'A text input that filters a list of suggestions. Use when the list is long or the user knows what they are looking for.',
  demo:k=>{const id=uid('cb'),lid=id+'-lb';return `<div style="min-height:330px"><div class="ds-field"><label class="ds-label" for="${id}">Reviewer</label><div class="ds-anchor ds-block"><div class="ds-control">${ic('user')}<input id="${id}" type="text" role="combobox" data-ds="combo" data-open-on-focus aria-autocomplete="list" aria-expanded="false" aria-controls="${lid}" placeholder="Search people" autocomplete="off"><button type="button" class="ds-x ds-combo-toggle" tabindex="-1" aria-label="Show all people">${ic('chev-down')}</button></div><div class="ds-pop" id="${lid}" role="listbox" aria-label="People" hidden>${PEOPLE.map(p=>`<div class="ds-opt" role="option" aria-selected="false" data-label="${p.n}">${AV(p.i,p.c,{sz:'s',name:p.n})}<span class="ds-opt__main"><span class="ds-opt__label">${p.n}</span><span class="ds-opt__desc">${p.r}</span></span>${ic('check','ds-opt__tick')}</div>`).join('')}</div></div><p class="ds-help">Try “ka” or “eng”.</p></div></div>`},
  cmp:[['Match highlight','Bold match','Bold match','Bold match on tinted row'],['Empty result','Inline message','Inline message','Inline message'],['Option content','Avatar, name, role','Avatar, name, role','Avatar, name, role']],
  a11y:'Uses <code>role="combobox"</code> with <code>aria-autocomplete="list"</code>, <code>aria-expanded</code> and <code>aria-activedescendant</code>. Filtering does not move focus out of the input.',keys:KEYS.list});

P({id:'checkbox',title:'Checkbox',group:'Forms',icon:'check',cls:['ds-check','ds-check__box','ds-choices'],
  desc:'Select any number of options. Supports a mixed (indeterminate) parent state.',
  demo:k=>`<fieldset class="ds-choices" data-cb-group><legend class="ds-label">Notify me when</legend>${CHK('All events',{attrs:'data-all'})}<div class="ds-choices" style="padding-left:calc(var(--chk) + var(--chk-gap))">${CHK('An issue is assigned to me',{checked:1})}${CHK('Someone mentions me',{checked:1,desc:'Includes comments and descriptions'})}${CHK('Sprint scope changes')}</div>${CHK('Weekly digest (admin only)',{dis:1})}</fieldset>`,
  init(st){const g=st.querySelector('[data-cb-group]');const all=g.querySelector('[data-all]');const kids=$$('.ds-choices .ds-choices input',g).length?$$('.ds-choices .ds-choices input',g):$$('input:not([data-all]):not(:disabled)',g);const sync=()=>{const n=kids.filter(c=>c.checked).length;all.checked=n===kids.length;all.indeterminate=n>0&&n<kids.length};sync();g.addEventListener('change',e=>{if(e.target===all)kids.forEach(c=>c.checked=all.checked);sync()})},
  states:['default','hover','focus','active','selected','disabled','error'],
  state:(k,s)=>CHK('Someone mentions me',{state:s}),
  cmp:[['Box size','14px, 2px border','16px, 1px accessible stroke','18px, hairline + soft shadow'],['Radius','2px','2px','5px'],['Checked','Primary fill','Brand fill','Tint fill'],['Pressed','Darker border','Shrinks to 94%','Shrinks to 90%'],['Row gap','4px','8px','12px']],
  a11y:'Native <code>input type="checkbox"</code> inside a <code>label</code>, grouped in a <code>fieldset</code> with a <code>legend</code>. The parent uses the native <code>indeterminate</code> property.',keys:KEYS.check});

P({id:'radio',title:'Radio',group:'Forms',icon:'ok',cls:['ds-radio','ds-check__box','ds-choices'],
  desc:'Select exactly one option from a small set. Show all options at once.',
  demo:k=>{const n=uid('r');return `<fieldset class="ds-choices"><legend class="ds-label">Priority</legend>${[['Highest','Wakes up on-call'],['High','Next in queue'],['Medium',''],['Low','']].map((x,i)=>CHK(x[0],{radio:1,name:n,checked:i===1,desc:x[1]})).join('')}${CHK('Trivial',{radio:1,name:n,dis:1,desc:'Retired in this project'})}</fieldset>`},
  states:['default','hover','focus','active','selected','disabled','error'],
  state:(k,s)=>CHK('High priority',{radio:1,name:uid('rs'),state:s}),
  cmp:[['Size','14px','16px','18px'],['Checked','Filled + white dot','Brand ring + brand dot','Filled + white dot'],['Option spacing','4px','8px','12px']],
  a11y:'Native radios that share a <code>name</code>, inside a <code>fieldset</code>. Arrow keys move the selection within the group (native behaviour).',keys:[['Tab','Enter the group at the selected option'],['↑ / ↓','Select previous / next option']]});

P({id:'switch',title:'Switch',group:'Forms',icon:'sliders',cls:['ds-switch','ds-switch__track'],
  desc:'Turns a setting on or off immediately, without a save step.',
  demo:k=>`<div class="ds-col" style="gap:var(--choice-gap)">${SW('Email notifications',{on:1})}${SW('Auto-assign reviewers')}${SW('Show story points on cards',{on:1})}${SW('Maintenance mode',{dis:1})}</div>`,
  states:['default','hover','focus','active','selected','disabled'],
  state:(k,s)=>SW('Email notifications',{state:s}),
  cmp:[['Track','32 × 16, solid grey','40 × 20, outlined when off','46 × 28, soft fill'],['On colour','Success green','Brand blue','Success green'],['Thumb','12px white','14px, dark when off','24px white with shadow'],['Motion','150ms ease-out','200ms decelerate, stretches when pressed','320ms spring, stretches when pressed']],
  a11y:'Native checkbox with <code>role="switch"</code>, so screen readers announce “on/off”. The label text is part of the click target.',keys:KEYS.check});

P({id:'slider',title:'Slider',group:'Forms',icon:'sliders',cls:['ds-range','ds-slider-head','ds-ticks'],
  desc:'Choose a value from a continuous or stepped range.',
  demo:k=>{const a=uid('sl'),b=uid('sl');return `<div class="ds-stack"><div class="ds-field"><div class="ds-slider-head"><label class="ds-label" for="${a}">Sprint capacity</label><span class="ds-slider-val">34 pts</span></div><input class="ds-range" id="${a}" type="range" min="0" max="60" step="1" value="34" data-unit=" pts"><div class="ds-ticks" aria-hidden="true"><span>0</span><span>15</span><span>30</span><span>45</span><span>60</span></div></div><div class="ds-field"><div class="ds-slider-head"><label class="ds-label" for="${b}">Alert threshold</label><span class="ds-slider-val">80%</span></div><input class="ds-range" id="${b}" type="range" min="50" max="100" step="5" value="80" data-unit="%"></div></div>`},
  states:['default','focus','disabled'],
  state:(k,s)=>`<input class="ds-range" type="range" aria-label="Capacity" min="0" max="100" value="40"${s==='disabled'?' disabled':''}${s==='focus'?' data-force-focus':''}>`,
  cmp:[['Track','4px, grey','4px, accessible stroke','4px, translucent fill'],['Thumb','16px white disc','20px ring with brand centre','24px white disc with shadow'],['Hover','None','Thumb grows 8%','None']],
  a11y:'Native <code>input type="range"</code> with a label. The current value is mirrored as text next to the label.',keys:[['← / →','Decrease / increase by one step'],['Home / End','Minimum / maximum'],['Page Up / Down','Larger steps']]});

function DATE(o={}){
  const id=uid('dp'),pid=id+'-pop';const d=o.init!=null?dPlus(o.init):null;
  const txt=o.range?(o.init!=null?`${fmtDate(TODAY)} – ${fmtDate(dPlus(o.init))}`:'Select dates'):(d?fmtDate(d):'Select a date');
  return `<div class="ds-field${o.state==='error'?' is-error':''}${o.state==='disabled'?' is-disabled':''}"><span class="ds-label" id="${id}-l">${o.label}</span><div class="ds-anchor ds-block"><button type="button" id="${id}" class="ds-control${ctlState(o.state||'')}${o.state==='disabled'?' is-disabled':''}" data-ds="date" aria-haspopup="dialog" aria-expanded="false" aria-controls="${pid}" aria-labelledby="${id}-l ${id}"${o.state==='disabled'?' disabled':''}>${ic('calendar')}<span class="ds-val${o.init==null?' ds-ph':''}" data-ph="${o.range?'Select dates':'Select a date'}">${txt}</span></button><div class="ds-pop" id="${pid}" role="dialog" aria-label="Choose ${o.range?'dates':'date'}" hidden style="min-width:auto"><div class="ds-cal" data-mode="${o.range?'range':'single'}" ${o.init!=null?`data-init="${o.init}"`:''} data-foot="1"></div></div></div>${o.help?`<p class="ds-help">${o.state==='error'?ic('err'):''}${o.help}</p>`:''}</div>`;
}
P({id:'date-picker',title:'Date Picker',group:'Forms',icon:'calendar',cls:['ds-cal','ds-day','ds-cal__grid'],
  desc:'Pick a single date from a calendar popover. The field shows the formatted date.',
  demo:k=>`<div class="ds-stack" style="min-height:430px">${DATE({label:'Due date',init:5,help:'Format: Oct 25, 2026'})}<div><span class="ds-label" style="margin-bottom:6px">Inline calendar</span><div class="ds-cal" data-mode="single" data-init="12" style="background:var(--bg);border-radius:var(--r-l);box-shadow:var(--sh-1)"></div></div></div>`,
  states:['default','hover','focus','disabled','error'],
  state:(k,s)=>DATE({label:'Due date',init:s==='error'?null:5,state:s,help:s==='error'?'Pick a due date':''}),
  cmp:[['Day cell','32px square, 3px radius','32px, 4px radius','38px circle'],['Today','Underlined primary','Filled brand circle','Red text'],['Selected','Primary fill','Brand outline + subtle fill','Tint-filled circle'],['Week header','Uppercase, bold','Regular','Uppercase, semibold']],
  a11y:'The trigger opens a <code>role="dialog"</code> popover; focus moves to the selected or first day. Days are buttons with full spoken dates in <code>aria-label</code>.',keys:[['← → ↑ ↓','Move by day / week'],['Page Up / Down','Previous / next month'],['Enter','Pick the focused day'],['Esc','Close the calendar']]});

P({id:'date-range',title:'Date Range',group:'Forms',icon:'calendar',cls:['ds-cal','ds-day'],
  desc:'Pick a start and end date. The first click sets the start, the second sets the end.',
  demo:k=>`<div class="ds-stack" style="min-height:430px">${DATE({label:'Release window',range:1,init:9})}<div class="ds-row" style="gap:6px">${['Next 7 days','Next 14 days','This month'].map((x,i)=>`<button type="button" class="ds-chip" data-preset="${[6,13,30][i]}">${x}</button>`).join('')}</div><div class="ds-cal" data-mode="range" data-init="9" style="background:var(--bg);border-radius:var(--r-l);box-shadow:var(--sh-1)"></div></div>`,
  init(st){st.addEventListener('click',e=>{const c=e.target.closest('[data-preset]');if(!c)return;e.stopPropagation();const cal=st.querySelector(':scope .ds-stack > .ds-cal');cal._s.a=new Date(TODAY);cal._s.b=dPlus(+c.dataset.preset);cal._s.view=new Date(TODAY.getFullYear(),TODAY.getMonth(),1);renderCal(cal);const v=st.querySelector('[data-ds="date"] .ds-val');v.textContent=`${fmtDate(cal._s.a)} – ${fmtDate(cal._s.b)}`;$$('[data-preset]',st).forEach(x=>x.setAttribute('aria-pressed',String(x===c)))},true)},
  cmp:[['In-range days','Square tint band','Square tint band','Soft tint band'],['End points','Primary fill','Brand outline','Tint-filled circles'],['Presets','Chips','Chips','Chips']],
  a11y:'Same keyboard model as the date picker. The trigger text reads “start – end”, and announces “Select end date” after the first pick.',keys:[['← → ↑ ↓','Move by day / week'],['Enter','Set start, then end'],['Esc','Close']]});

const TIMES=[];for(let h=8;h<=18;h++)for(const m of [0,30]){if(h===18&&m)continue;TIMES.push(`${((h+11)%12)+1}:${m?'30':'00'} ${h<12?'AM':'PM'}`)}
P({id:'time-picker',title:'Time Picker',group:'Forms',icon:'clock',cls:['ds-times','ds-select','ds-opt'],
  desc:'Choose a time from fixed intervals. Uses the same listbox model as Select.',
  demo:k=>`<div class="ds-form-grid" style="min-height:300px;align-content:start">${SEL({label:'Stand-up time',options:TIMES,sel:3,lead:'clock',listCls:'ds-times'})}${SEL({label:'End time',options:TIMES,sel:-1,ph:'Choose a time',lead:'clock',listCls:'ds-times'})}</div>`,
  states:['default','focus','disabled','error'],
  state:(k,s)=>SEL({label:'Start time',options:TIMES,sel:s==='error'?-1:4,ph:'Choose a time',lead:'clock',listCls:'ds-times',state:s,help:s==='error'?'Start time is required':''}),
  cmp:[['Interval','30 minutes','30 minutes','30 minutes'],['List style','Left-aligned rows','Left-aligned rows','Centred, larger numerals (wheel feel)']],
  a11y:'A select-only combobox with a scrollable <code>listbox</code>; the selected time scrolls into view when opened.',keys:KEYS.list});

P({id:'file-upload',title:'File Upload',group:'Forms',icon:'upload',cls:['ds-drop','ds-files','ds-file'],
  desc:'Drop files or browse to attach them. Shows per-file progress and lets the user remove files.',
  demo:k=>`<div class="ds-stack"><div class="ds-field"><span class="ds-label">Attachments</span><label class="ds-drop">${ic('upload','ds-drop__ic')}<span class="ds-drop__t">Drop files here or <span>browse</span></span><span class="ds-small ds-faint">PDF, PNG or CSV · up to 25 MB each</span><input type="file" multiple aria-label="Attach files"></label></div><ul class="ds-files">${fileRow({name:'rollback-plan.pdf',size:842000},true)}${fileRow({name:'schema-diff-v2.csv',size:2310000},true)}</ul></div>`,
  states:['default','hover','error','disabled'],
  state:(k,s)=>`<label class="ds-drop ${s==='hover'?'is-hover':s==='error'?'is-error':''}" ${s==='disabled'?'style="opacity:.45;pointer-events:none"':''}>${ic(s==='error'?'err':'upload','ds-drop__ic')}<span class="ds-drop__t">${s==='error'?'invoice.exe is not allowed':'Drop files or <span>browse</span>'}</span><input type="file" aria-label="Attach files"${s==='disabled'?' disabled':''}></label>`,
  cmp:[['Drop zone','2px dashed frame, compact','1px dashed, 8px radius','Soft fill, no dashes, 14px radius'],['File rows','Bordered rows','Raised cards (shadow 2)','Plain rows with separators'],['Progress','6px bar','2px bar','4px bar']],
  a11y:'A real <code>input type="file"</code> covers the drop zone, so it works by keyboard and screen reader. Each upload has a <code>progressbar</code> with a label.',keys:[['Tab','Focus the drop zone'],['Enter / Space','Open the file dialog']]});

const SWATCHES=[['Spruce','#2F7D6A'],['Cobalt','#3A6FD8'],['Violet','#8A4FD8'],['Rose','#B23A62'],['Ember','#C25B1F'],['Amber','#C99A06'],['Slate','#56627A'],['Ink','#1F2430']];
P({id:'color-picker',title:'Color Picker',group:'Forms',icon:'palette',cls:['ds-swatches','ds-swatch','ds-color-preview'],
  desc:'Pick a colour from a curated palette, or enter a hex value.',
  demo:k=>{const id=uid('cp');return `<div class="ds-stack" data-color><div class="ds-field"><span class="ds-label" id="${id}-l">Project colour</span><div class="ds-swatches" role="radiogroup" aria-labelledby="${id}-l">${SWATCHES.map((s,i)=>`<button type="button" class="ds-swatch" role="radio" aria-checked="${i===0}" tabindex="${i===0?0:-1}" aria-label="${s[0]}" data-hex="${s[1]}" style="--c:${s[1]}"></button>`).join('')}</div></div><div class="ds-row" style="align-items:flex-end;flex-wrap:nowrap"><span class="ds-color-preview" style="--c:#2F7D6A" aria-hidden="true"></span>${TF({id:id+'-hex',label:'Hex',val:'#2F7D6A',cls:'',attrs:'class="ds-hex" spellcheck="false" maxlength="7"',help:'Hex value, 6 digits'})}<input type="color" class="ds-color-native" value="#2f7d6a" aria-label="Custom colour"></div></div>`},
  cmp:[['Swatch','24px square','28px, 4px radius','28px circle, grows on hover'],['Selected','Ring + check','Ring + check','Ring + check'],['Gap','4px','8px','12px']],
  a11y:'Swatches form a <code>radiogroup</code> with roving focus; arrow keys move and select. The hex field validates on change and explains the expected format.',keys:[['← → ↑ ↓','Move between swatches'],['Tab','Move to the hex field']]});


'use strict';
/* ===================== NAVIGATION ===================== */
P({id:'header',title:'Header',group:'Navigation',icon:'layout',cls:['ds-header','ds-hnav','ds-logo'],wide:true,
  desc:'The application bar: product mark, primary navigation, search and account actions.',
  demo:k=>`<header class="ds-header"><span class="ds-logo"><i aria-hidden="true"></i>Ledger</span><nav class="ds-hnav" aria-label="Primary">${['Projects','Issues','Reports','Teams'].map((x,i)=>`<a href="#"${i===0?' aria-current="page"':''}>${x}</a>`).join('')}</nav><div class="ds-header__end"><div class="ds-control ds-control--search ds-s" style="width:200px">${ic('search')}<input type="search" aria-label="Search" placeholder="Search"></div>${TIP(IB('bell','Notifications'),'Notifications',{below:1})}${TIP(IB('sliders','Settings'),'Settings',{below:1})}${AV('MR',1,{sz:'s',name:'Maya Ruiz'})}</div></header>`,
  cmp:[['Height','48px','48px','52px'],['Surface','White, bottom border','White card, shadow 4, rounded','Translucent blur material, hairline'],['Current page','3px bar at bottom edge','Bold label + bar','Bold label only'],['Nav item spacing','Tight, hover fills','4px, rounded hover','20px, text only']],
  a11y:'Primary navigation is a labelled <code>nav</code>; the current page uses <code>aria-current="page"</code>. Icon buttons carry names and tooltips.',keys:KEYS.none});

P({id:'sidebar',title:'Sidebar',group:'Navigation',icon:'panel',cls:['ds-side','ds-side__item','ds-side__head','ds-side__sub'],
  desc:'Vertical product navigation with sections, nesting, counters and a clear current item.',
  demo:k=>{const sub=uid('sub');return `<nav class="ds-side" aria-label="Workspace"><span class="ds-side__head">Workspace</span><button type="button" class="ds-side__item">${ic('home')}<span>Home</span></button><button type="button" class="ds-side__item" aria-current="page">${ic('inbox')}<span>Inbox</span><span class="ds-side__badge">${COUNT(12)}</span></button><button type="button" class="ds-side__item" aria-expanded="true" aria-controls="${sub}">${ic('folder')}<span>Projects</span>${ic('chev-right','ds-side__chev')}</button><div class="ds-side__sub" id="${sub}">${['Ledger Migration','Design System','Mobile App'].map(x=>`<button type="button" class="ds-side__item"><span>${x}</span></button>`).join('')}</div><span class="ds-side__head">Insights</span><button type="button" class="ds-side__item">${ic('chart')}<span>Reports</span></button><button type="button" class="ds-side__item">${ic('sliders')}<span>Settings</span></button></nav>`},
  cmp:[['Width','240px','260px','250px'],['Surface','Sunken grey','White, shadow 4','Translucent material'],['Current item','Tint fill + primary text','Grey fill + 3px brand bar','Grey fill, tint icon'],['Section headers','11px uppercase','12px semibold','12px semibold, grey'],['Row height','32px','36px','32px']],
  a11y:'Wrapped in a labelled <code>nav</code>. Expandable sections use <code>aria-expanded</code> and <code>aria-controls</code>; the current destination has <code>aria-current</code>.',keys:[['Tab','Move between items'],['Enter','Open the item or toggle a section']]});

P({id:'breadcrumb',title:'Breadcrumb',group:'Navigation',icon:'chev-right',cls:['ds-crumbs','ds-crumb'],
  desc:'Shows where the current page sits in the hierarchy and links to each parent.',
  demo:k=>`<div class="ds-stack"><nav aria-label="Breadcrumb"><ol class="ds-crumbs"><li><a class="ds-crumb" href="#">Projects</a></li><li><a class="ds-crumb" href="#">Ledger Migration</a></li><li><a class="ds-crumb" href="#">Backlog</a></li><li><span aria-current="page">DS-142</span></li></ol></nav><nav aria-label="Breadcrumb, collapsed"><ol class="ds-crumbs"><li><a class="ds-crumb" href="#">Projects</a></li><li><button type="button" class="ds-btn ds-btn--subtle ds-ibtn ds-s" aria-label="Show 3 hidden levels">${ic('more')}</button></li><li><a class="ds-crumb" href="#">Epics</a></li><li><span aria-current="page">Billing v2</span></li></ol></nav></div>`,
  cmp:[['Separator','Slash “/”','Chevron icon','Thin “›”'],['Parent links','Grey, underline on hover','Grey, hover fills','Tint-coloured'],['Current page','Regular text','Semibold','Medium weight']],
  a11y:'An ordered list inside <code>nav aria-label="Breadcrumb"</code>. The last item is plain text with <code>aria-current="page"</code>; separators are generated in CSS so they are not read aloud.',keys:KEYS.none});

const TAB_ITEMS=[{l:'Overview',ic:'file',body:'Move invoices, line items and tax tables to the v2 schema without downtime.'},{l:'Details',ic:'list',body:'Estimate: 8 points · Sprint 42 · Component: Billing.'},{l:'Activity',ic:'clock',n:12,body:'12 updates this week. Latest: Aiko attached the rollback plan.'},{l:'Settings',ic:'sliders',body:'Notifications and automation rules for this issue.'}];
P({id:'tabs',title:'Tabs',group:'Navigation',icon:'columns',cls:['ds-tabs','ds-tablist','ds-tab','ds-tabind','ds-tabpanel'],
  desc:'Switch between related views of the same object without leaving the page.',
  demo:k=>`<div class="ds-stack">${tabs({items:TAB_ITEMS})}${tabs({items:[{l:'Day',body:'4 issues due today.'},{l:'Week',body:'17 issues due this week.'},{l:'Month',body:'52 issues due this month.'}],sel:1,label:'Range'})}</div>`,
  states:['default','hover','focus','active','disabled'],
  state:(k,s)=>tabs({items:TAB_ITEMS.slice(0,3),noPanels:1,state:s,stateAt:s==='default'?-1:s==='focus'||s==='active'?0:1}),
  cmp:[['Indicator','2px bar on a 2px track','3px rounded bar, inset under the label','Sliding white thumb in a grey track'],['Selected label','Primary colour, semibold','Body colour, semibold, icon in brand','Semibold'],['Hover','Grey bar preview','Grey bar preview + pressed fill','Label dims'],['Height','36px','44px','30px segmented'],['Icons','Hidden','Shown','Hidden'],['Indicator motion','150ms','250ms','320ms']],
  a11y:'Implements the ARIA tabs pattern: <code>tablist</code>, <code>tab</code> with <code>aria-selected</code> and <code>aria-controls</code>, and <code>tabpanel</code>. Only the selected tab is in the tab order (roving tabindex).',keys:[['← / →','Previous / next tab (selects automatically)'],['Home / End','First / last tab'],['Tab','Move into the panel']]});

P({id:'pagination',title:'Pagination',group:'Navigation',icon:'dots-h',cls:['ds-pager','ds-pg','ds-pg-ell'],
  desc:'Move through large result sets one page at a time.',
  demo:k=>`<div class="ds-col"><nav class="ds-pager" aria-label="Pagination" data-total="12" data-items="118" data-per="10" data-init="3"></nav><span class="ds-faint ds-small" data-pager-out aria-live="polite"></span></div>`,
  init(st){$$('.ds-pager[data-init]',st).forEach(n=>renderPager(n,+n.dataset.init))},
  after(root){$$('.matrix .ds-pager[data-init]',root).forEach(n=>renderPager(n,+n.dataset.init))},
  sizes:['m'],size:(k)=>`<nav class="ds-pager" aria-label="Pagination" data-total="5" data-init="2"></nav>`,
  cmp:[['Page button','32px, 3px radius','32px, 4px radius','34px circle'],['Current page','Tint + primary text','Solid brand fill','Inverted (dark) circle'],['Prev / next','Subtle icon buttons','Outlined buttons','Tint-coloured chevrons']],
  a11y:'A labelled <code>nav</code>; the current page uses <code>aria-current="page"</code>. Previous / next are disabled at the ends. A live region announces the visible range.',keys:[['Tab','Move between pages'],['Enter','Go to page']]});

P({id:'stepper',title:'Stepper',group:'Navigation',icon:'steps',cls:['ds-steps','ds-step','ds-step__dot','ds-step__label'],
  desc:'Shows progress through a multi-step flow and where the user is now.',
  demo:k=>`<div class="ds-stack" data-steps data-i="1"><ol class="ds-steps">${[['Account','Name and email'],['Workspace','Choose a URL'],['Invite team','Optional'],['Review','Confirm details']].map(([t,d],i)=>`<li class="ds-step${i<1?' is-done':''}${i===1?' is-current':''}"${i===1?' aria-current="step"':''}><span class="ds-step__dot">${i<1?ic('check'):i+1}</span><span class="ds-step__label"><b>${t}</b><small>${d}</small></span></li>`).join('')}</ol><div class="ds-row" style="justify-content:space-between"><span class="ds-faint ds-small" data-step-out aria-live="polite">Step 2 of 4: Workspace</span><div class="ds-row">${B('Back',{attrs:'data-step="-1"'})}${B('Continue',{v:'primary',attrs:'data-step="1"'})}</div></div></div>`,
  cmp:[['Layout','Inline: disc + label on one row','Discs above labels, centred','Segmented progress bar, no discs'],['Completed','Primary disc with check','Brand disc with check','Filled segment'],['Current','Ring','Ring + shadow','Half-filled segment, bold label']],
  a11y:'An ordered list; the current step has <code>aria-current="step"</code>. Step changes are announced through a polite live region.',keys:KEYS.btn});

P({id:'menu',title:'Menu',group:'Navigation',icon:'list',cls:['ds-menu__head','ds-menu__sep','ds-opt','ds-pop'],
  desc:'A list of actions with icons, shortcuts, toggles, a submenu hint and destructive items.',
  demo:k=>MENU(uid('mn'),{stat:1}),
  cmp:[['Item height','32px','32px','30px'],['Hover','Grey row','Grey rounded row','Solid tint, white text'],['Section header','11px uppercase','12px semibold','12px semibold'],['Surface','Flat white, 4px radius','White, 8px radius, shadow 16','Blur material, 12px radius']],
  a11y:'<code>role="menu"</code> with <code>menuitem</code> and <code>menuitemcheckbox</code> children. Disabled items stay focusable-off and announce as unavailable via <code>aria-disabled</code>.',keys:KEYS.menu});

P({id:'dropdown',title:'Dropdown',group:'Navigation',icon:'chev-down',cls:['ds-anchor','ds-pop','ds-opt'],
  desc:'A button that opens a menu of actions. Use for overflow and secondary actions.',
  demo:k=>{const m=uid('dd'),m2=uid('dd');return `<div class="ds-row" style="min-height:330px;align-items:flex-start"><div class="ds-anchor">${B('Actions',{chev:1,attrs:`data-ds="menu" aria-haspopup="menu" aria-expanded="false" aria-controls="${m}"`})}${MENU(m)}</div><div class="ds-anchor"><button type="button" class="ds-btn ds-btn--subtle" data-ds="menu" aria-haspopup="menu" aria-expanded="false" aria-controls="${m2}" aria-label="Account menu">${AV('MR',1,{sz:'s',name:'Maya Ruiz'})}${ic('chev-down','ds-btn__chev')}</button>${MENU(m2,{label:'Account',items:[{h:'Maya Ruiz'},{l:'Profile',ic:'user'},{l:'Preferences',ic:'sliders'},{l:'Keyboard shortcuts',ic:'command',kbd:'?'},{sep:1},{l:'Sign out',ic:'external'}]})}</div></div>`},
  cmp:[['Trigger','Default button + chevron','Default button + chevron','Tinted button + chevron'],['Open motion','120ms fade','200ms fade + slide','220ms fade + scale']],
  a11y:'Trigger has <code>aria-haspopup="menu"</code> and <code>aria-expanded</code>. Focus moves into the menu on open and returns to the trigger on Esc.',keys:KEYS.menu});

P({id:'context-menu',title:'Context Menu',group:'Navigation',icon:'more',cls:['ds-pop--ctx','ds-ctx-area'],
  desc:'Actions for an object, opened with right-click or the keyboard context-menu key.',
  demo:k=>`<div class="ds-ctx-area" data-ds="ctx" tabindex="0" aria-label="Files. Right-click or press Shift+F10 for actions.">${['rollback-plan.pdf','schema-diff-v2.csv','ADR-012 billing.md'].map(f=>`<div class="ds-ctx-file">${ic('file')}<span>${f}</span></div>`).join('')}<p class="ds-cap" style="margin-top:auto">Right-click anywhere here, or focus and press Shift+F10.</p>${MENU(uid('cx'),{ctx:1,label:'File actions',items:[{l:'Open',ic:'eye',kbd:'Enter'},{l:'Rename',ic:'edit',kbd:'F2'},{l:'Copy link',ic:'link'},{sep:1},{l:'Delete',ic:'trash',danger:1}]})}</div>`,
  cmp:[['Position','At pointer','At pointer','At pointer'],['Surface','Same as menu','Same as menu','Same as menu (blur material)']],
  a11y:'The area is focusable and opens the menu with Shift+F10 or the ContextMenu key, so it does not depend on a mouse.',keys:[['Shift + F10','Open the context menu'],...KEYS.menu.slice(1)]});

function TREE(){
  const node=(label,icn,d,kids,o={})=>`<li role="treeitem"${kids?` aria-expanded="${!!o.open}"`:''} aria-selected="${!!o.sel}"><div class="ds-tree__row" style="--d:${d}" tabindex="${o.sel?0:-1}"><span class="ds-tree__tw${kids?'':' ds-tree__leaf'}">${ic('chev-right')}</span>${ic(icn)}<span>${label}</span>${o.meta?`<span class="ds-tree__meta">${o.meta}</span>`:''}</div>${kids?`<ul role="group">${kids}</ul>`:''}</li>`;
  return `<ul class="ds-tree" role="tree" aria-label="Project files">${node('Ledger Migration','folder',0,node('Epics','folder',1,node('Billing tables','file',2,'',{meta:'8'})+node('Invoices API','file',2,'',{sel:1,meta:'5'}),{open:1})+node('Docs','folder',1,node('Runbook.md','file',2)+node('ADR-012.md','file',2))+node('Releases','tag',1,'',{meta:'4'}),{open:1})}${node('Design System','folder',0,node('Tokens','file',1))}</ul>`;
}
P({id:'tree',title:'Tree',group:'Navigation',icon:'tree',cls:['ds-tree','ds-tree__row','ds-tree__tw'],
  desc:'Hierarchical navigation that expands and collapses. Used for project files, epics and folder structures.',
  demo:k=>TREE(),
  cmp:[['Row height','28px','32px','30px'],['Indent','16px','20px','18px'],['Selected','Tint + primary text','Grey fill + 3px brand bar, bold','Solid tint, white text'],['Folder icons','Grey','Brand colour','Tint colour']],
  a11y:'ARIA tree: <code>role="tree"</code>, <code>treeitem</code> with <code>aria-expanded</code> and <code>aria-selected</code>, nested <code>group</code>s. One row is tabbable at a time.',keys:[['↑ / ↓','Previous / next visible row'],['→','Expand, then move to first child'],['←','Collapse, then move to parent'],['Enter','Select']]});

/* ===================== DATA DISPLAY ===================== */
const issueRow=(i,o={})=>`<tr${o.sel?' aria-selected="false"':''}>${o.sel?`<td class="ds-cellw">${CHK(`<span class="ds-sr">Select ${i.key}</span>`,{attrs:'data-row'})}</td>`:''}<td><a class="ds-link" href="#">${i.key}</a></td><td${o.edit?' class="ds-editable" tabindex="0" title="Double-click to edit"':''}>${i.sum}</td><td data-v="${i.status[0]}">${BADGE(i.status[0],i.status[1])}</td><td data-v="${i.who[1]}"><span class="ds-who">${AV(i.who[0],i.who[2],{sz:'s',name:i.who[1]})}${i.who[1]}</span></td><td class="num" data-v="${i.pts}">${i.pts}</td><td data-v="${i.u}">${i.upd}</td></tr>`;
const issueHead=(o={})=>`<thead><tr>${o.sel?`<th class="ds-cellw">${CHK('<span class="ds-sr">Select all</span>',{attrs:'data-all'})}</th>`:''}${[['Key'],['Summary'],['Status'],['Assignee'],['Points','num'],['Updated']].map(([h,c])=>`<th scope="col"${c?` class="${c}"`:''}${h==='Updated'?' aria-sort="ascending"':''}><button type="button" class="ds-sort">${h}${ic('arrow-up')}</button></th>`).join('')}</tr></thead>`;
P({id:'table',title:'Table',group:'Data Display',icon:'table',cls:['ds-tablewrap','ds-table','ds-sort'],wide:true,
  desc:'Displays records in rows and columns. Columns sort on click.',
  demo:k=>`<div><div class="ds-tbl-cap"><h3 class="ds-t-h3">Backlog · Sprint 42</h3><span class="ds-faint ds-small">6 issues</span></div><div class="ds-tablewrap"><table class="ds-table"><caption class="ds-sr">Sprint 42 backlog</caption>${issueHead()}<tbody>${ISSUES.map(i=>issueRow(i)).join('')}</tbody></table></div><span class="ds-sr" aria-live="polite"></span></div>`,
  cmp:[['Row height','36px','44px','48px'],['Header','12px bold, grey, 2px rule','14px semibold, 1px rule','12px regular, tertiary grey'],['Row separation','1px lines','1px lines','Zebra stripes, no lines'],['Container','None (sits on page)','Card with shadow 4','Rounded, borderless'],['Sorted column','Bold header + arrow','Arrow','Tint-coloured header']],
  a11y:'A native <code>table</code> with a caption and <code>th scope="col"</code>. Sortable headers are buttons; <code>aria-sort</code> sits on the <code>th</code>. Sort changes are announced in a live region.',keys:[['Tab','Move to a sortable header'],['Enter','Sort / reverse sort']]});

P({id:'data-grid',title:'Data Grid',group:'Data Display',icon:'grid',cls:['ds-table','ds-tbar','ds-editable','ds-cell-edit'],wide:true,
  desc:'A table with row selection, bulk actions and inline editing.',
  demo:k=>`<div class="ds-col"><div class="ds-tbar" data-tbar><span class="ds-tbar__sel" data-count>No issues selected</span><span class="grow"></span>${B('Assign',{v:'subtle',icon:'user',keep:1,attrs:'data-bulk disabled'})}${B('Move',{v:'subtle',icon:'folder',keep:1,attrs:'data-bulk disabled'})}${B('Delete',{v:'subtle',icon:'trash',keep:1,attrs:'data-bulk disabled data-del'})}</div><div class="ds-tablewrap"><table class="ds-table"><caption class="ds-sr">Editable issues</caption>${issueHead({sel:1})}<tbody>${ISSUES.map(i=>issueRow(i,{sel:1,edit:1})).join('')}</tbody></table></div><p class="ds-cap">Select rows to enable bulk actions. Double-click or press Enter on a summary to edit it.</p><span class="ds-sr" aria-live="polite"></span></div>`,
  init(st,k){
    const all=st.querySelector('[data-all]');const rows=()=>$$('[data-row]',st);
    const sync=()=>{const n=rows().filter(c=>c.checked).length;all.checked=n&&n===rows().length;all.indeterminate=n>0&&n<rows().length;st.querySelector('[data-count]').textContent=n?`${n} selected`:'No issues selected';$$('[data-bulk]',st).forEach(b=>b.disabled=!n);rows().forEach(c=>c.closest('tr').setAttribute('aria-selected',String(c.checked)))};
    st.addEventListener('change',e=>{if(e.target===all)rows().forEach(c=>c.checked=all.checked);sync()});
    st.querySelector('[data-del]').addEventListener('click',()=>{const del=rows().filter(c=>c.checked).map(c=>c.closest('tr'));del.forEach(r=>r.hidden=true);sync();snack(k,`${del.length} issue${del.length>1?'s':''} deleted`,'Undo',()=>{del.forEach(r=>r.hidden=false);sync()});del.forEach(r=>r.querySelector('[data-row]').checked=false);sync()});
    const edit=td=>{if(td.querySelector('input'))return;const old=td.textContent;td.innerHTML=`<input class="ds-cell-edit" value="${esc(old)}" aria-label="Edit summary">`;const inp=td.firstChild;inp.focus();inp.select();const done=save=>{td.textContent=save?inp.value.trim()||old:old;td.focus();if(save&&inp.value.trim()!==old)toast(k,{title:'Summary updated',v:'success',text:td.textContent})};inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();done(true)}if(e.key==='Escape'){e.stopPropagation();done(false)}});inp.addEventListener('blur',()=>{if(td.contains(inp))done(true)})};
    st.addEventListener('dblclick',e=>{const td=e.target.closest('.ds-editable');if(td)edit(td)});
    st.addEventListener('keydown',e=>{const td=e.target.closest&&e.target.closest('.ds-editable');if(td&&e.target===td&&(e.key==='Enter'||e.key==='F2')){e.preventDefault();edit(td)}});
    sync();
  },
  cmp:[['Selected row','Tint fill','Tint fill + 3px brand edge','Solid tint row, white text'],['Bulk bar','Inline text + subtle buttons','Inline text + subtle buttons','Inline text + subtle buttons'],['Edit cell','Primary outline','Primary outline','Halo ring']],
  a11y:'Row checkboxes have hidden labels (“Select DS-142”). The select-all checkbox shows a mixed state. Editable cells are focusable and open with Enter or F2; Esc cancels.',keys:[['Space','Toggle row selection'],['Enter / F2','Edit the focused cell'],['Esc','Cancel editing']]});

P({id:'card',title:'Card',group:'Data Display',icon:'window',cls:['ds-card','ds-cards'],
  desc:'A container for a single object: a project, a report, a person.',
  demo:k=>`<div class="ds-cards" data-selectable><article class="ds-card ds-card--interactive" tabindex="0" aria-selected="true"><div class="ds-card__media">${ic('layers')}</div><div class="ds-card__body"><span class="ds-card__eyebrow">Project · LED</span><h3 class="ds-card__title">Ledger Migration</h3><p class="ds-card__text">Move billing to the v2 schema by end of Q3.</p></div><div class="ds-card__foot"><span class="ds-avgroup">${AV('MR',1,{sz:'s'})}${AV('AK',5,{sz:'s'})}${AV('JO',4,{sz:'s'})}</span><span class="grow"></span>${BADGE('On track','success')}</div></article><article class="ds-card ds-card--interactive" tabindex="0"><div class="ds-card__media">${ic('chart')}</div><div class="ds-card__body"><span class="ds-card__eyebrow">Report · weekly</span><h3 class="ds-card__title">Sprint velocity</h3><p class="ds-card__text">34 points completed, 6 above the 4-sprint average.</p></div><div class="ds-card__foot"><span class="ds-faint ds-small">Updated today</span><span class="grow"></span>${B('Open',{v:'subtle',sz:'s'})}</div></article></div>`,
  states:['default','hover','focus','selected'],
  state:(k,s)=>`<article class="ds-card ds-card--interactive" style="max-width:240px" tabindex="0"${s==='selected'?' aria-selected="true"':''} ${s==='hover'?'data-force-hover':''}${s==='focus'?' data-force-focus':''}><div class="ds-card__body"><h3 class="ds-card__title">Ledger Migration</h3><p class="ds-card__text">Billing v2 schema.</p></div></article>`,
  cmp:[['Padding','12px','16px','22px'],['Radius','4px','8px','20px'],['Separation','Raised shadow (1px)','Shadow 4 → 16 on hover','No shadow; contrast with grey background'],['Title','14px semibold','16px semibold','19px semibold, tight tracking'],['Hover','Overlay shadow','Lifts 1px','Scales 1% with soft float shadow']],
  a11y:'Cards are <code>article</code> elements with a heading. Clickable cards are focusable and respond to Enter; nested buttons keep their own names.',keys:[['Tab','Focus the card'],['Enter','Open / select']]});

P({id:'list',title:'List',group:'Data Display',icon:'list',cls:['ds-list','ds-li'],
  desc:'A vertical list of similar items with leading media, text and trailing metadata.',
  demo:k=>`<ul class="ds-list" data-selectable role="listbox" aria-label="Inbox">${[['MR',1,'Maya Ruiz assigned DS-142 to you','Migrate billing tables','2m',2],['AK',5,'Aiko Kato commented on DS-137','“Rollback plan attached”','1h',1],['JO',4,'Jonas Ortiz requested review','Audit focus rings','3h',0],['PN',2,'Priya Nair closed DS-128','Rename workspace roles','Yesterday',0]].map((r,i)=>`<li class="ds-li" role="option" tabindex="0" aria-selected="${i===0}">${AV(r[0],r[1],{name:r[0]})}<div class="ds-li__main"><span class="ds-li__title">${r[2]}</span><span class="ds-li__sub">${r[3]}</span></div><span class="ds-li__end">${r[4]}${r[5]?COUNT(r[5],{alert:1,sz:'s'}):''}${ic('chev-right','ds-li__chev')}</span></li>`).join('')}</ul>`,
  cmp:[['Row height','40px','52px','56px'],['Separators','Full-width lines','None (hover fills)','Inset, start after the avatar'],['Container','None','Card, shadow 4','Inset grouped, 14px radius'],['Trailing','Time + badge','Time + badge','Time + badge + disclosure chevron']],
  a11y:'Selectable lists use <code>role="listbox"</code> with <code>option</code> items and <code>aria-selected</code>.',keys:[['Tab','Move between items'],['Enter','Select']]});

P({id:'badge',title:'Badge',group:'Data Display',icon:'tag',cls:['ds-badge'],
  desc:'Short status labels (lozenges) and numeric counts.',
  demo:k=>`<div class="ds-stack"><div class="ds-row">${BADGE('To do')}${BADGE('In progress','info')}${BADGE('Done','success')}${BADGE('At risk','warning')}${BADGE('Blocked','danger')}${BADGE('Beta','new')}</div><div class="ds-row">${BADGE('Live','success',{strong:1})}${BADGE('Paused','warning',{strong:1})}${BADGE('Failed','danger',{strong:1})}${BADGE('New','info',{strong:1})}</div><div class="ds-row">${COUNT(3)}${COUNT(12)}${COUNT('99+',{alert:1})}<button type="button" class="ds-btn">${ic('inbox','')}<span>Inbox</span>${COUNT(12,{alert:1,sz:'s'})}</button></div></div>`,
  sizes:['s','m','l'],size:(k,z)=>`<div class="ds-row">${BADGE('In progress','info',{sz:z})}${BADGE('Done','success',{strong:1,sz:z})}${COUNT(12,{sz:z})}</div>`,
  cmp:[['Status style','Uppercase bold lozenge, 3px radius','Rounded pill with tinted stroke','Coloured dot + plain text'],['Strong variant','Bold fill (yellow for warning)','Solid fill','Solid capsule'],['Counts','Grey pill','Grey pill','Red notification capsule'],['Height','18px','20px','22px']],
  a11y:'Badges are text, not colour alone: every status has a word. Counts next to icons are included in the button’s accessible name.',keys:KEYS.none});

P({id:'tag',title:'Tag',group:'Data Display',icon:'tag',cls:['ds-tag','ds-tag__x'],
  desc:'Labels that categorise an object. Removable when the user can edit them.',
  demo:k=>`<div class="ds-stack"><div class="ds-row" style="gap:6px">${[['Billing','blue'],['Accessibility','purple'],['Performance','green'],['Needs QA','orange'],['v4.2','']].map(([t,c])=>`<span class="ds-tag${c?' ds-tag--'+c:''}">${t}<button type="button" class="ds-tag__x" aria-label="Remove ${t}">${ic('x')}</button></span>`).join('')}</div><div class="ds-row" style="gap:6px"><span class="ds-tag">Read-only</span><span class="ds-tag ds-tag--blue"><a href="#" data-noop>Linked: DS-137</a></span></div></div>`,
  cmp:[['Shape','3px radius, grey','4px radius, 1px stroke','Capsule, soft fill'],['Height','20px','24px','26px'],['Remove button','Square 16px','Square 16px','Circle 16px']],
  a11y:'Each remove button is named “Remove &lt;tag&gt;”; after removal focus moves to the next tag, and a toast confirms.',keys:[['Tab','Move to remove button'],['Enter','Remove the tag']]});

P({id:'chip',title:'Chip',group:'Data Display',icon:'filter',cls:['ds-chip'],
  desc:'Toggleable filters and quick choices.',
  demo:k=>`<div class="ds-row" style="gap:8px" role="group" aria-label="Quick filters">${[['Assigned to me',1],['Due this week',0],['High priority',1],['Has attachments',0]].map(([t,on])=>`<button type="button" class="ds-chip" aria-pressed="${!!on}">${ic('check','ds-chip__tick')}${t}</button>`).join('')}<button type="button" class="ds-chip" disabled>Archived</button></div>`,
  states:['default','hover','focus','selected','disabled'],
  state:(k,s)=>`<button type="button" class="ds-chip${s==='hover'?' is-hover':''}${s==='focus'?' is-focus':''}" aria-pressed="${s==='selected'}"${s==='disabled'?' disabled':''}>${ic('check','ds-chip__tick')}High priority</button>`,
  cmp:[['Shape','3px radius, outlined','Pill, outlined','Capsule, filled'],['Selected','Tint + primary stroke','Solid brand','Inverted (dark)'],['Height','24px','28px','32px']],
  a11y:'Toggle chips are buttons with <code>aria-pressed</code>, grouped and labelled.',keys:KEYS.check});

P({id:'avatar',title:'Avatar',group:'Data Display',icon:'user',cls:['ds-av','ds-avgroup','ds-av__presence'],
  desc:'Represents a person or a project, with optional presence.',
  demo:k=>`<div class="ds-stack"><div class="ds-row" style="gap:14px">${AV('MR',1,{sz:'xl',pr:'on',name:'Maya Ruiz, available'})}${AV('JO',4,{sz:'l',pr:'away',name:'Jonas Ortiz, away'})}${AV('AK',5,{pr:'busy',name:'Aiko Kato, busy'})}${AV('LS',3,{sz:'s',pr:'off',name:'Liam Shah, offline'})}${AV('LED',2,{sq:1,sz:'l',name:'Ledger project'})}</div><div class="ds-avgroup" role="group" aria-label="Team, 7 people">${PEOPLE.slice(0,4).map(p=>AV(p.i,p.c,{name:p.n})).join('')}<span class="ds-av ds-av--more" role="img" aria-label="3 more">+3</span></div></div>`,
  sizes:['s','m','l'],size:(k,z)=>`<div class="ds-row">${AV('MR',1,{sz:z==='m'?'':z,pr:'on'})}${AV('LED',2,{sq:1,sz:z==='m'?'':z})}</div>`,
  cmp:[['Sizes','24 / 32 / 40 / 56','24 / 32 / 48 / 64','28 / 36 / 48 / 72'],['Fill','Distinct colour per person','Distinct colour per person','Neutral grey gradient'],['Group overlap','−6px with white ring','−4px','−10px'],['Project avatar','Square, 4px radius','Square, 4px radius','Rounded square, 10px']],
  a11y:'Avatars are <code>role="img"</code> with the person’s name and presence in the label, so status is not conveyed by colour alone.',keys:KEYS.none});

P({id:'timeline',title:'Timeline',group:'Data Display',icon:'clock',cls:['ds-tl','ds-tl__item','ds-tl__mark'],
  desc:'A chronological list of events, such as issue activity or deployment history.',
  demo:k=>`<div><p class="ds-tl__day">Today</p><ol class="ds-tl">${[['Maya Ruiz','moved DS-142 to In progress','10:42','bolt',1],['Aiko Kato','attached rollback-plan.pdf','09:15','upload'],['CI','Deploy #418 passed to staging','08:03','ok'],['Jonas Ortiz','created DS-142','Yesterday','plus']].map(([w,t,tm,i,key])=>`<li class="ds-tl__item${key?' is-key':''}"><span class="ds-tl__mark">${ic(i)}</span><div class="ds-tl__body"><div class="ds-tl__head"><b>${w}</b><time class="ds-tl__time">${tm}</time></div><p class="ds-tl__text">${t}</p></div></li>`).join('')}</ol></div>`,
  cmp:[['Marker','10px dot, key events in primary','28px circle with icon','12px ring, key events thicker'],['Time','Right-aligned','After the name','After the name'],['Grouping','None','None','Day headings'],['Spacing','12px','16px','22px']],
  a11y:'An ordered list with <code>time</code> elements. Icons are decorative; the text carries the event.',keys:KEYS.none});

P({id:'accordion',title:'Accordion',group:'Data Display',icon:'list',cls:['ds-acc','ds-acc__btn','ds-acc__panel'],
  desc:'Stacked sections that expand to reveal content. Good for checklists and long settings.',
  demo:k=>`<div class="ds-acc">${[['Pre-release checks','3 of 4','Run the schema diff, confirm backups, notify finance, and freeze writes for 10 minutes.',1],['Rollback plan','Ready','Restore from the 06:00 snapshot and re-point the read replica. Owner: Aiko Kato.'],['Communication','Draft','Status page update and in-app banner 24 hours before cut-over.']].map(([t,m,b,open])=>{const id=uid('acc');return `<div class="ds-acc__item"><h3 style="margin:0;font:inherit"><button type="button" class="ds-acc__btn" aria-expanded="${!!open}" aria-controls="${id}">${ic('chev-right','ds-acc__chev')}<span>${t}</span><span class="ds-acc__meta">${m}</span></button></h3><div class="ds-acc__panel" id="${id}"${open?'':' hidden'}><div><p>${b}</p></div></div></div>`}).join('')}</div>`,
  cmp:[['Header height','36px','48px','52px'],['Chevron','Left, rotates 90°','Right, rotates 180°','Right, rotates 90°'],['Container','None, divider lines','Card, shadow 4','Inset grouped, 14px radius'],['Motion','100ms','150ms','320ms']],
  a11y:'Each header is a <code>button</code> inside a heading, with <code>aria-expanded</code> and <code>aria-controls</code>.',keys:[['Tab','Move between headers'],['Enter / Space','Expand or collapse']]});

P({id:'statistic',title:'Statistic',group:'Data Display',icon:'chart',cls:['ds-stat','ds-stats','ds-spark'],
  desc:'A key number with a label, a trend and an optional sparkline.',
  demo:k=>`<div class="ds-stats">${[['Open issues','128','',-6,'vs last week',[150,148,141,139,136,131,128],1],['Cycle time','3.4','days',-12,'faster',[4.4,4.1,4.0,3.9,3.6,3.5,3.4],1],['Escaped bugs','7','',+2,'vs last sprint',[4,6,5,5,6,5,7],0]].map(([l,v,u,d,ds,data,good])=>`<div class="ds-stat"><span class="ds-stat__label">${l}</span><span class="ds-stat__value">${v}${u?`<small>${u}</small>`:''}</span><span class="ds-stat__delta${good?'':' is-down'}">${ic(d<0?'trend-down':'trend-up')}${d>0?'+':''}${d}% <span>${ds}</span></span>${spark(data)}</div>`).join('')}</div>`,
  cmp:[['Value','24px, 650 weight','28px semibold','38px light, tight tracking'],['Label','11px uppercase','14px semibold','13px medium'],['Container','1px border','Card, shadow 4','Borderless, 20px radius']],
  a11y:'The trend is written in words (“−6% vs last week”), not only colour or arrow. Sparklines are decorative and hidden from screen readers.',keys:KEYS.none});


'use strict';
/* ===================== FEEDBACK ===================== */
const ALERTS=[['info','info','Sprint 42 starts tomorrow','Unestimated issues will be moved to the backlog at 09:00.',['Review scope','Dismiss']],['success','ok','Migration dry run passed','All 1,284 invoices matched the v2 schema.',['View report']],['warning','warn','Read replica is 40s behind','Reports may show slightly older numbers until it catches up.',['Check status']],['error','err','Export failed','The CSV exceeded 50 MB. Narrow the date range and try again.',['Retry','Change range']]];
const ALERT=(v,i,t,b,acts,o={})=>`<div class="ds-alert ds-alert--${v}" role="${v==='error'?'alert':'status'}"><span class="ds-alert__ic">${ic(i)}</span><div class="ds-alert__body"><p class="ds-alert__title">${t}</p><p class="ds-alert__text">${b}</p>${acts&&acts.length?`<div class="ds-alert__actions">${acts.map(a=>`<button type="button" class="ds-btn ds-btn--link ds-s"${a==='Dismiss'?' data-ds="dismiss"':''}>${a}</button>`).join('')}</div>`:''}</div>${o.close!==false?`<button type="button" class="ds-btn ds-btn--subtle ds-ibtn ds-s ds-alert__close" aria-label="Dismiss" data-ds="dismiss">${ic('x')}</button>`:''}</div>`;
P({id:'alert',title:'Alert',group:'Feedback',icon:'info',cls:['ds-alert'],
  desc:'An inline message about the current context. Stays until the user dismisses it or the condition changes.',
  demo:k=>`<div class="ds-col">${ALERTS.map(a=>ALERT(...a)).join('')}</div>`,
  states:['default','error','success','warning'],
  state:(k,s)=>{const a=ALERTS[{default:0,success:1,warning:2,error:3}[s]];return ALERT(a[0],a[1],a[2],a[3],[],{close:false})},
  cmp:[['Background','Tinted fill','Light tint + tinted 1px stroke','White card; icon sits in a tinted circle'],['Layout','Title above body','Title and body inline, actions right','Title above body, generous padding'],['Radius','4px','4px','14px'],['Actions','Text links','Text links aligned right','Tint links']],
  a11y:'Errors use <code>role="alert"</code>; other variants use <code>role="status"</code>. Each variant has a distinct icon and title so meaning does not rely on colour.',keys:[['Tab','Reach actions and the dismiss button']]});

const TOAST_BTNS=k=>`<div class="ds-row">${B('Info toast',{attrs:'data-ds="toast" data-v="info" data-title="Sprint 42 started" data-text="17 issues, 34 points committed."'})}${B('Success',{attrs:'data-ds="toast" data-v="success" data-title="Issue created" data-text="DS-143 was added to the backlog."'})}${B('Warning',{attrs:'data-ds="toast" data-v="warning" data-title="Approaching limit" data-text="Ledger uses 92% of its automation runs."'})}${B('Error',{attrs:'data-ds="toast" data-v="error" data-title="Couldn’t save" data-text="You are offline. Changes are kept locally."'})}</div>`;
P({id:'toast',title:'Toast',group:'Feedback',icon:'bell',cls:['ds-toast','ds-toasts'],
  desc:'A brief, non-blocking notification that confirms an action or reports a background event. Disappears on its own.',
  demo:k=>`<div class="ds-stack">${TOAST_BTNS(k)}<div class="ds-col" style="gap:6px"><span class="ds-label">At rest</span><div class="ds-toast ds-toast--success" style="animation:none;max-width:380px"><span class="ds-toast__ic">${ic('ok')}</span><div class="ds-toast__body"><div class="ds-toast__title">Issue created</div><div class="ds-toast__text">DS-143 was added to the backlog.</div><div class="ds-toast__acts"><button type="button" class="ds-btn ds-btn--link ds-s">View issue</button></div></div><button type="button" class="ds-btn ds-btn--subtle ds-ibtn ds-s" aria-label="Dismiss">${ic('x')}</button></div></div><p class="ds-cap">Live toasts appear in each language’s own corner: bottom-left, bottom-right, or top-centre.</p></div>`,
  cmp:[['Position','Bottom-left (“flags”)','Bottom-right','Top-centre, drops down'],['Surface','White, shadow overlay','White, shadow 28','Blur material, 18px radius'],['Entrance','Slide up, 200ms','Slide in from right, 300ms','Drop + scale, 450ms'],['Duration','4.5s','4.5s','4.5s']],
  a11y:'Toasts render into a <code>role="status"</code> live region so they are announced without stealing focus. Each has a dismiss button; important errors should also appear inline.',keys:[['Tab','Reach toast actions']]});

P({id:'snackbar',title:'Snackbar',group:'Feedback',icon:'message',cls:['ds-snack'],
  desc:'A one-line, dark message at the bottom of the screen, usually with a single undo action.',
  demo:k=>`<div class="ds-stack"><div class="ds-row">${B('Archive 3 issues',{attrs:'data-ds="snack" data-text="3 issues archived"'})}${B('Delete comment',{attrs:'data-ds="snack" data-text="Comment deleted"'})}</div><div class="ds-snack-inline"><div class="ds-snack"><span>3 issues archived</span><button type="button" class="ds-snack__act">Undo</button></div></div></div>`,
  cmp:[['Shape','4px radius bar','4px radius bar','Capsule'],['Height','40px','44px','46px'],['Action colour','Light primary','Light brand','Light tint']],
  a11y:'Rendered in a polite live region. The undo action is a real button and the snackbar stays for 5 seconds.',keys:[['Tab','Reach the undo action']]});

P({id:'banner',title:'Banner',group:'Feedback',icon:'flag',cls:['ds-banner'],
  desc:'A page- or app-level message, such as maintenance windows or account issues.',
  demo:k=>`<div class="ds-col"><div class="ds-banner" role="status">${ic('warn')}<span class="ds-banner__text">Scheduled maintenance Sat 02:00–03:00 UTC. Billing is read-only during this window.</span><a href="#" data-noop>Details</a>${IB('x','Dismiss',{sz:'s',attrs:'data-ds="dismiss"'})}</div><div class="ds-banner ds-banner--info" role="status">${ic('info')}<span class="ds-banner__text">You are viewing Ledger as an admin.</span><a href="#" data-noop>Switch role</a></div><div class="ds-banner ds-banner--error" role="alert">${ic('err')}<span class="ds-banner__text">Your trial ends in 2 days. Add billing details to keep your data.</span><a href="#" data-noop>Add details</a></div></div>`,
  cmp:[['Warning style','Bold yellow, full bleed','Tinted bar with stroke','Soft tint, centred text'],['Info style','Dark inverse bar','Tinted bar','Grey fill'],['Radius','0 (edge to edge)','4px','10px']],
  a11y:'Warnings and info use <code>role="status"</code>; account-blocking problems use <code>role="alert"</code>.',keys:KEYS.none});

P({id:'progress',title:'Progress',group:'Feedback',icon:'chart',cls:['ds-prog','ds-ring'],
  desc:'Shows how far a task has progressed, or that work is happening when the duration is unknown.',
  demo:k=>`<div class="ds-stack"><div class="ds-prog" data-prog-run><div class="ds-prog__head">Importing invoices <span>42%</span></div><div class="ds-prog__track" role="progressbar" aria-label="Importing invoices" aria-valuemin="0" aria-valuemax="100" aria-valuenow="42"><div class="ds-prog__bar" style="--v:42%"></div></div><span class="ds-prog__help">539 of 1,284 records</span></div><div class="ds-prog ds-prog--ind"><div class="ds-prog__head">Rebuilding search index</div><div class="ds-prog__track" role="progressbar" aria-label="Rebuilding search index"><div class="ds-prog__bar"></div></div></div><div class="ds-prog ds-prog--success"><div class="ds-prog__head">Backup <span>Done</span></div><div class="ds-prog__track" role="progressbar" aria-label="Backup" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"><div class="ds-prog__bar" style="--v:100%"></div></div></div><div class="ds-row" style="gap:16px"><span class="ds-ring" role="progressbar" aria-label="Sprint progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="68" style="--v:68"><span>68%</span></span>${B('Run import',{v:'primary',attrs:'data-ds="progress"'})}</div></div>`,
  sizes:['s','m','l'],size:(k,z)=>`<div class="ds-prog ${SZ[z]}" style="width:100%"><div class="ds-prog__track" role="progressbar" aria-label="Progress" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"><div class="ds-prog__bar" style="--v:60%"></div></div></div>`,
  cmp:[['Bar thickness','6px','2px','4px'],['Track','Neutral grey','Accessible stroke grey','Translucent fill'],['Label','12px bold above','14px semibold above + helper below','14px medium, percentage right'],['Indeterminate','Ease-in-out sweep','Ease-in-out sweep','Smooth sweep']],
  a11y:'<code>role="progressbar"</code> with <code>aria-valuenow</code> for determinate bars; indeterminate bars omit the value.',keys:KEYS.none});

const SPIN=(sz='',o={})=>`<span class="ds-spin${sz&&SZ[sz]?' '+SZ[sz]:''}${o.inv?' ds-spin--inv':''}" role="status" aria-label="${o.label||'Loading'}">${SPOKES}</span>`;
P({id:'spinner',title:'Spinner',group:'Feedback',icon:'refresh',cls:['ds-spin'],
  desc:'Indicates loading for short, indeterminate waits.',
  demo:k=>`<div class="ds-stack"><div class="ds-spin-row">${SPIN('s')}${SPIN()}${SPIN('l')}</div><div class="ds-row" style="gap:10px">${SPIN('s',{label:'Loading issues'})}<span class="ds-muted">Loading issues…</span></div><div class="ds-row">${B('Saving',{v:'primary',attrs:'aria-busy="true"'})}</div></div>`,
  sizes:['s','m','l'],size:(k,z)=>SPIN(z),
  cmp:[['Form','Thin ring, ¾ arc','Ring on a tinted track','Eight-spoke activity indicator'],['Colour','Subtle grey','Brand','Secondary grey'],['Sizes','16 / 24 / 48','20 / 32 / 56','16 / 24 / 40']],
  a11y:'Spinners carry <code>role="status"</code> and a label. Pair with visible text when the wait could exceed a second.',keys:KEYS.none});

P({id:'skeleton',title:'Skeleton',group:'Feedback',icon:'layout',cls:['ds-skel','ds-skel-card'],
  desc:'Placeholder shapes that mirror the layout while content loads.',
  demo:k=>`<div class="ds-stack"><div data-skel-ph aria-busy="true" aria-label="Loading issue"><div class="ds-skel-card"><span class="ds-skel ds-skel--circle"></span><div><span class="ds-skel ds-skel--line" style="--w:60%"></span><span class="ds-skel ds-skel--line"></span><span class="ds-skel ds-skel--line" style="--w:80%"></span></div></div><span class="ds-skel ds-skel--block" style="margin-top:14px;--h:70px"></span></div><div data-skel-real hidden><div class="ds-skel-card">${AV('MR',1,{name:'Maya Ruiz',sz:'l'})}<div><b>Maya Ruiz</b><span class="ds-muted">Migrate billing tables to new schema</span><span class="ds-faint ds-small">In progress · 8 points · updated 2h ago</span></div></div></div>${B('<span>Show loaded content</span>',{attrs:'data-ds="skel"'})}</div>`,
  cmp:[['Animation','Opacity pulse','Shimmer wave','Slow, soft pulse'],['Shape radius','3px','4px','8px'],['Line height','12px','14px','14px']],
  a11y:'The loading region has <code>aria-busy="true"</code> and a label; shapes are decorative.',keys:KEYS.none});

/* ===================== OVERLAYS ===================== */
const MODAL_INNER=(k,o={})=>`<div class="ds-dialog${o.stat?' ds-dialog--static':''}" role="dialog" aria-labelledby="${o.tid}" ${o.stat?'':'aria-modal="true"'}><div class="ds-dialog__head"><h2 class="ds-dialog__title" id="${o.tid}">Create issue</h2><button type="button" class="ds-btn ds-btn--subtle ds-ibtn ds-s ds-dialog__close" aria-label="Close" data-close>${ic('x')}</button></div><div class="ds-dialog__body">${TF({label:'Summary',ph:'What needs to be done?',req:true,attrs:o.stat?'':'autofocus'})}<div class="ds-form-grid">${TF({label:'Story points',type:'number',val:'3'})}${TF({label:'Assignee',val:'Maya Ruiz',lead:'user'})}</div></div><div class="ds-dialog__foot">${k==='f'?B('Create',{v:'primary',attrs:'data-close data-ok'})+B('Cancel',{attrs:'data-close'}):B('Cancel',{v:k==='a'?'subtle':'',attrs:'data-close'})+B('Create',{v:'primary',attrs:'data-close data-ok'})}</div></div>`;
document.addEventListener('click',e=>{const ok=e.target.closest&&e.target.closest('.ds-layer [data-ok]');if(ok){const L=ok.closest('.ds-layer');toast(L.dataset.k,{title:ok.dataset.msg||'Issue created',text:ok.dataset.text||'DS-143 was added to the backlog.',v:ok.dataset.v||'success'})}},true);
P({id:'modal',title:'Modal',group:'Overlays',icon:'window',cls:['ds-dialog','ds-backdrop','ds-layer'],
  desc:'A focused task that blocks the page until the user completes or cancels it.',
  demo:k=>{const t=uid('tpl');return `<div class="ds-stack">${B('Create issue',{v:'primary',icon:'plus',attrs:`data-ds="layer" data-tpl="${t}"`})}<template id="${t}">${MODAL_INNER(k,{tid:uid('mt')})}</template><div class="ds-col" style="gap:6px"><span class="ds-label">At rest</span>${MODAL_INNER(k,{stat:1,tid:uid('mt')})}</div></div>`},
  cmp:[['Width','480px','520px','380px'],['Radius','6px','8px','20px'],['Blanket','Dark navy, 54%','Black, 40%','Light, 22% + 2px blur'],['Surface','Opaque','Opaque, shadow 64','Translucent blur material'],['Buttons','Right: subtle Cancel, primary Create','Right: primary first, then Cancel','Full-width pair, centred text'],['Close (×)','No','Yes','No'],['Entrance','Slide up 8px, 150ms','Scale from 96%, 250ms','Scale from 108%, 300ms']],
  a11y:'<code>role="dialog"</code> with <code>aria-modal</code> and <code>aria-labelledby</code>. Focus moves inside on open, is trapped while open, and returns to the trigger on close. Esc and the backdrop close it.',keys:KEYS.dialog});

const CONFIRM_INNER=(k,o={})=>`<div class="ds-dialog ds-dialog--danger${o.stat?' ds-dialog--static':''}" role="alertdialog" aria-labelledby="${o.tid}" aria-describedby="${o.tid}-d"><div class="ds-dialog__head"><span class="ds-dialog__ic">${ic('warn')}</span><h2 class="ds-dialog__title" id="${o.tid}">Delete 3 issues?</h2></div><div class="ds-dialog__body"><p id="${o.tid}-d">DS-131, DS-128 and DS-125 and their 14 comments will be permanently deleted. This can’t be undone.</p></div><div class="ds-dialog__foot">${k==='f'?B('Delete',{v:'danger',attrs:'data-close data-ok data-msg="3 issues deleted" data-text="DS-131, DS-128 and DS-125 were deleted." data-v="warning"'})+B('Cancel',{attrs:'data-close autofocus'}):B('Cancel',{v:k==='a'?'subtle':'',attrs:'data-close autofocus'})+B('Delete',{v:'danger',attrs:'data-close data-ok data-msg="3 issues deleted" data-text="DS-131, DS-128 and DS-125 were deleted." data-v="warning"'})}</div></div>`;
P({id:'confirmation-dialog',title:'Confirmation Dialog',group:'Overlays',icon:'warn',cls:['ds-dialog--danger','ds-dialog__ic','ds-dialog__foot'],
  desc:'Asks the user to confirm a destructive or irreversible action. States the consequence plainly.',
  demo:k=>{const t=uid('tpl');return `<div class="ds-stack">${B('Delete 3 issues',{v:'danger',attrs:`data-ds="layer" data-tpl="${t}"`})}<template id="${t}">${CONFIRM_INNER(k,{tid:uid('ct')})}</template><div class="ds-col" style="gap:6px"><span class="ds-label">At rest</span>${CONFIRM_INNER(k,{stat:1,tid:uid('ct')})}</div></div>`},
  cmp:[['Icon','Warning icon beside the title','No icon, title carries meaning','Large icon above a centred title'],['Default focus','Cancel','Cancel','Cancel'],['Destructive button','Red, right','Red, first','Red, right of equal-width pair']],
  a11y:'<code>role="alertdialog"</code> with the consequence linked via <code>aria-describedby</code>. Focus starts on Cancel so Enter never deletes by accident.',keys:KEYS.dialog});

const DRAWER_INNER=(k,o={})=>`<aside class="ds-drawer ds-drawer--${k==='a'?'left':'right'}${o.stat?' ds-drawer--static':''}" role="dialog" aria-labelledby="${o.tid}"><div class="ds-drawer__head"><h2 id="${o.tid}">DS-142 details</h2>${IB('x','Close',{sz:'s',attrs:'data-close'})}</div><div class="ds-drawer__body"><dl class="ds-kv"><dt>Status</dt><dd>${BADGE('In progress','info')}</dd><dt>Assignee</dt><dd><span class="ds-who">${AV('MR',1,{sz:'s'})}Maya Ruiz</span></dd><dt>Sprint</dt><dd>Sprint 42</dd><dt>Points</dt><dd>8</dd><dt>Due</dt><dd>${fmtDate(dPlus(5))}</dd></dl>${o.stat?'':TA({label:'Comment',ph:'Add a comment…',rows:3})}</div>${o.stat?'':`<div class="ds-drawer__foot">${B('Close',{attrs:'data-close'})}${B('Save',{v:'primary',attrs:'data-close data-ok data-msg="Saved" data-text="DS-142 was updated."'})}</div>`}</aside>`;
P({id:'drawer',title:'Drawer',group:'Overlays',icon:'panel',cls:['ds-drawer','ds-layer--drawer'],
  desc:'A panel that slides in from the edge to show details or a secondary task without leaving the page.',
  demo:k=>{const t=uid('tpl');return `<div class="ds-stack">${B('Open issue details',{icon:'panel',attrs:`data-ds="layer" data-kind="drawer" data-tpl="${t}"`})}<template id="${t}">${DRAWER_INNER(k,{tid:uid('dt')})}</template><div class="ds-col" style="gap:6px"><span class="ds-label">At rest</span>${DRAWER_INNER(k,{stat:1,tid:uid('dt')})}</div></div>`},
  cmp:[['Edge','Left','Right','Right, floating 12px from edges'],['Width','400px','420px','380px'],['Radius','0','0','20px'],['Header','No divider','No divider','Hairline divider']],
  a11y:'Same dialog rules as the modal: labelled, focus trapped, Esc closes, focus returns to the trigger.',keys:KEYS.dialog});

P({id:'popover',title:'Popover',group:'Overlays',icon:'message',cls:['ds-popover'],
  desc:'Rich, interactive content anchored to a trigger. Closes when the user clicks elsewhere.',
  demo:k=>{const id=uid('pv');return `<div class="ds-popover-demo" style="display:flex;justify-content:center"><div class="ds-anchor">${B('Estimate',{icon:'info',attrs:`data-ds="pop" aria-haspopup="dialog" aria-expanded="true" aria-controls="${id}"`})}<div class="ds-popover" id="${id}" role="dialog" aria-label="Estimate help"><h4>Story points</h4><p>Use the Fibonacci scale. Anything above 13 should be split before the sprint starts.</p><div class="ds-row" style="gap:8px;justify-content:flex-end">${B('Got it',{v:'primary',sz:'s',attrs:'data-pop-close'})}</div></div></div></div>`},
  init(st){st.addEventListener('click',e=>{if(e.target.closest('[data-pop-close]')){const pop=e.target.closest('.ds-popover');const tr=st.querySelector(`[aria-controls="${pop.id}"]`);closePop(tr,true)}})},
  cmp:[['Beak','None','Yes','Yes'],['Surface','Flat, 4px radius','8px radius, shadow 16','Blur material, 14px radius'],['Offset','6px','10px','12px']],
  a11y:'Trigger has <code>aria-expanded</code> and <code>aria-controls</code>; the popover is a labelled <code>dialog</code>. Esc or an outside click closes it.',keys:[['Enter','Toggle the popover'],['Esc','Close and return focus']]});

P({id:'tooltip',title:'Tooltip',group:'Overlays',icon:'info',cls:['ds-tip','ds-tipwrap'],
  desc:'A short text label that explains an icon or control. Appears on hover and keyboard focus.',
  demo:k=>`<div class="ds-tip-demo">${TIP(IB('edit','Edit issue',{v:'default'}),'Edit issue',{kbd:'E',shown:1})}${TIP(IB('copy','Copy link'),'Copy link')}${TIP(B('Watch',{icon:'eye'}),'Get notified about changes')}${TIP(`<button type="button" class="ds-btn ds-btn--link">What is a story point?</button>`,'A relative measure of effort, not hours')}</div>`,
  cmp:[['Surface','Dark inverse, 3px radius','Light, shadow 8, with beak','Light blur material, no beak'],['Delay','300ms','250ms','600ms'],['Text','12px','12px','12px']],
  a11y:'Linked with <code>aria-describedby</code>. Shows on focus as well as hover, stays while hovered, and Esc hides it (WCAG 1.4.13).',keys:[['Tab','Show on focus'],['Esc','Hide']]});

const CMD_STATIC=k=>`<div class="ds-dialog ds-dialog--static ds-cmd" role="presentation"><div class="ds-cmd__input">${ic('search')}<input type="text" aria-label="Command (preview)" value="go to" tabindex="-1" readonly><kbd>Esc</kbd></div><div class="ds-cmd__list"><div class="ds-menu__head">Navigation</div><div class="ds-opt is-cur">${ic('list')}<span><mark>Go to</mark> Backlog</span><kbd>G B</kbd></div><div class="ds-opt">${ic('grid')}<span><mark>Go to</mark> Board</span><kbd>G O</kbd></div><div class="ds-opt">${ic('chart')}<span><mark>Go to</mark> Reports</span><kbd>G R</kbd></div></div><div class="ds-cmd__foot"><span>↑↓ to move</span><span>Enter to run</span><span>Esc to close</span></div></div>`;
P({id:'command-palette',title:'Command Palette',group:'Overlays',icon:'command',cls:['ds-cmd','ds-cmd__input','ds-cmd__list','ds-layer--cmd'],
  desc:'Keyboard-first search across commands, navigation and recent items.',
  demo:k=>{const t=uid('tpl');return `<div class="ds-stack">${B('Open command palette',{icon:'command',attrs:`data-ds="layer" data-kind="cmd" data-tpl="${t}"`})}<template id="${t}"><div class="ds-dialog ds-cmd" role="dialog" aria-label="Command palette"><div class="ds-cmd__input">${ic('search')}<input type="text" role="combobox" aria-expanded="true" aria-controls="${t}-lb" aria-autocomplete="list" placeholder="Type a command or search…" autofocus autocomplete="off"><kbd>Esc</kbd></div><div class="ds-cmd__list" role="listbox" id="${t}-lb" aria-label="Commands"></div><div class="ds-cmd__foot"><span>↑↓ to move</span><span>Enter to run</span><span>Esc to close</span></div></div></template><div class="ds-col" style="gap:6px"><span class="ds-label">At rest</span>${CMD_STATIC(k)}</div></div>`},
  cmp:[['Input size','14px, 44px row','16px, 52px row','22px light, 58px row (Spotlight-like)'],['Width','560px','600px','640px'],['Results','Dense rows','Rounded rows','Rows with solid tint highlight']],
  a11y:'The input is a <code>combobox</code> controlling a <code>listbox</code>; the highlighted result is exposed with <code>aria-activedescendant</code>. Focus is trapped while open.',keys:[['↑ / ↓','Move through results'],['Enter','Run'],['Esc','Close']]});

/* ===================== LAYOUT ===================== */
P({id:'container',title:'Container',group:'Layout',icon:'layout',cls:['ds-container'],
  desc:'Constrains content width and applies the page gutter.',
  demo:k=>`<div class="ds-col"><div class="ds-box-label"><span>Container · max-width 960px</span><span>padding: var(--pad)</span></div><div class="ds-container" style="max-width:960px;box-shadow:var(--sh-1)"><div class="ds-demo-box">Content area</div></div></div>`,
  cmp:[['Page padding','16px','20px','28px'],['Max content width','1280px (wide tables)','1200px','980px (reading width)']],
  a11y:'Purely presentational; use landmarks (<code>main</code>, <code>nav</code>) inside.',keys:KEYS.none});
P({id:'grid',title:'Grid',group:'Layout',icon:'grid',cls:['ds-grid','ds-demo-box'],wide:true,
  desc:'A 12-column grid. Gutters follow each language’s density.',
  demo:k=>`<div class="ds-col">${[[12],[6,6],[4,4,4],[8,4],[3,9],[3,3,3,3]].map(r=>`<div class="ds-grid ds-grid-demo">${r.map(s=>`<div class="ds-demo-box" style="--span:${s}">${s}</div>`).join('')}</div>`).join('')}</div>`,
  cmp:[['Gutter','8px','16px','24px'],['Columns','12','12','12']],
  a11y:'Visual order matches DOM order so reading and tab order stay logical.',keys:KEYS.none});
P({id:'stack',title:'Stack',group:'Layout',icon:'rows',cls:['ds-stack','ds-col','ds-row'],
  desc:'Spaces children evenly along one axis using the gap tokens.',
  demo:k=>`<div class="ds-row" style="align-items:flex-start;gap:24px"><div><div class="ds-box-label"><span>Stack · var(--gap)</span></div><div class="ds-col" style="width:160px">${[1,2,3].map(i=>`<div class="ds-demo-box">Item ${i}</div>`).join('')}</div></div><div><div class="ds-box-label"><span>Stack · var(--gap-l)</span></div><div class="ds-stack" style="width:160px">${[1,2,3].map(i=>`<div class="ds-demo-box">Section ${i}</div>`).join('')}</div></div></div>`,
  cmp:[['Gap','8px','12px','16px'],['Large gap','16px','20px','28px']],a11y:'Presentational.',keys:KEYS.none});
P({id:'split-pane',title:'Split Pane',group:'Layout',icon:'columns',cls:['ds-split-pane','ds-split-pane__h'],wide:true,
  desc:'Two resizable panes, for list-detail and editor-preview layouts.',
  demo:k=>`<div class="ds-split-pane" style="--split:38%"><div class="ds-split-pane__a"><b>Issues</b><ul class="ds-list" style="margin-top:8px">${ISSUES.slice(0,4).map(i=>`<li class="ds-li" style="min-height:36px"><div class="ds-li__main"><span class="ds-li__title">${i.key}</span><span class="ds-li__sub">${i.sum}</span></div></li>`).join('')}</ul></div><div class="ds-split-pane__h" role="separator" aria-orientation="vertical" aria-label="Resize panes" aria-valuemin="20" aria-valuemax="80" aria-valuenow="38" tabindex="0"></div><div class="ds-split-pane__b"><b>DS-142</b><p class="ds-muted">Drag the divider, or focus it and use the arrow keys.</p></div></div>`,
  init(st){const pane=st.querySelector('.ds-split-pane');const h=pane.querySelector('.ds-split-pane__h');const set=v=>{v=Math.max(20,Math.min(80,v));pane.style.setProperty('--split',v+'%');h.setAttribute('aria-valuenow',Math.round(v))};
    h.addEventListener('pointerdown',e=>{h.setPointerCapture(e.pointerId);h.classList.add('is-drag');const r=pane.getBoundingClientRect();const mv=ev=>set((ev.clientX-r.left)/r.width*100);const up=()=>{h.classList.remove('is-drag');h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up)};h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up)});
    h.addEventListener('keydown',e=>{const v=+h.getAttribute('aria-valuenow');if(e.key==='ArrowLeft'){e.preventDefault();set(v-5)}if(e.key==='ArrowRight'){e.preventDefault();set(v+5)}if(e.key==='Home'){e.preventDefault();set(20)}if(e.key==='End'){e.preventDefault();set(80)}})},
  cmp:[['Divider','2px line, primary on hover','6px gutter with grip','1px hairline, wide invisible hit area'],['Container','1px border','Card, shadow 4','Borderless']],
  a11y:'The divider is a focusable <code>separator</code> with <code>aria-valuenow</code>; arrow keys resize in 5% steps.',keys:[['← / →','Resize by 5%'],['Home / End','Minimum / maximum']]});
P({id:'divider',title:'Divider',group:'Layout',icon:'rows',cls:['ds-divider','ds-divider-label'],
  desc:'Separates content into groups.',
  demo:k=>`<div class="ds-col"><span>Above</span><hr class="ds-divider"><span>Below</span><div class="ds-divider-label">or continue with</div><div class="ds-row" style="align-items:stretch;height:28px"><span>Left</span><span class="ds-divider ds-divider--v" role="separator" aria-orientation="vertical"></span><span>Right</span></div></div>`,
  cmp:[['Colour','Separator grey','Divider grey','Translucent separator']],a11y:'Use <code>hr</code> or <code>role="separator"</code> when the division is meaningful.',keys:KEYS.none});
P({id:'toolbar',title:'Toolbar',group:'Layout',icon:'dots-h',cls:['ds-toolbar','ds-toolbar__sep'],
  desc:'A row of related controls with groups and separators.',
  demo:k=>`<div class="ds-toolbar" role="toolbar" aria-label="Board actions">${B('Create',{v:'primary',sz:'s',icon:'plus'})}<span class="ds-toolbar__sep" role="separator"></span>${IB('filter','Filter',{sz:'s'})}${IB('sliders','Display options',{sz:'s'})}${IB('share','Share',{sz:'s'})}<span class="grow"></span><div class="ds-control ds-control--search ds-s" style="width:150px">${ic('search')}<input type="search" aria-label="Filter board" placeholder="Filter"></div></div>`,
  cmp:[['Surface','Bordered, 4px','Raised, shadow 4, 8px','Floating material, 14px'],['Control size','Small (24px)','Small (24px)','Small (28px)']],
  a11y:'<code>role="toolbar"</code> with a label; separators use <code>role="separator"</code>.',keys:[['Tab','Move between controls']]});
P({id:'page-header',title:'Page Header',group:'Layout',icon:'layout',cls:['ds-phead'],wide:true,
  desc:'Top of a page: location, title, status, primary actions and local navigation.',
  demo:k=>`<div class="ds-phead"><nav aria-label="Breadcrumb"><ol class="ds-crumbs"><li><a class="ds-crumb" href="#">Projects</a></li><li><span aria-current="page">Ledger Migration</span></li></ol></nav><div class="ds-phead__row"><div class="ds-phead__title"><h1 class="ds-t-h1">Ledger Migration</h1><div class="ds-row" style="gap:8px">${BADGE('On track','success')}<span class="ds-faint ds-small">Lead: Maya Ruiz · Due Sep 30</span></div></div><div class="ds-phead__actions">${B('Share',{icon:'share'})}${B('Create issue',{v:'primary',icon:'plus',attrs:'data-ds="feedback"'})}</div></div>${tabs({items:[{l:'Summary',body:''},{l:'Backlog',body:''},{l:'Board',body:''},{l:'Reports',body:''}],noPanels:1,label:'Project views'})}</div>`,
  cmp:[['Title','24px, 650','28px semibold','28px bold, tight tracking'],['Bottom edge','Tabs carry the line','Divider under the block','None']],
  a11y:'One <code>h1</code> per page; breadcrumb and tabs keep their own landmarks and patterns.',keys:KEYS.none});


'use strict';
/* ===================== EDITORS ===================== */
P({id:'rich-text-editor',title:'Rich Text Editor',group:'Editors',icon:'pen',cls:['ds-editor','ds-rte','ds-ed-foot'],
  desc:'Formatted text with a toolbar for emphasis, lists, quotes and links.',
  demo:k=>`<div class="ds-editor"><div class="ds-toolbar" role="toolbar" aria-label="Formatting">${[['bold','Bold','bold','Ctrl B'],['italic','Italic','italic','Ctrl I'],['underline','Underline','underline','Ctrl U']].map(([c,l,i])=>IB(i,l,{sz:'s',attrs:`data-cmd="${c}" aria-pressed="false"`})).join('')}<span class="ds-toolbar__sep" role="separator"></span>${IB('list','Bulleted list',{sz:'s',attrs:'data-cmd="insertUnorderedList" aria-pressed="false"'})}${IB('list-ol','Numbered list',{sz:'s',attrs:'data-cmd="insertOrderedList" aria-pressed="false"'})}${IB('quote','Quote',{sz:'s',attrs:'data-cmd="formatBlock" data-arg="blockquote"'})}${IB('link','Insert link',{sz:'s',attrs:'data-cmd="createLink"'})}</div><div class="ds-rte" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Issue description" spellcheck="true"><h3>Billing v2 cut-over</h3><p>Move <b>invoices</b>, line items and tax tables to the v2 schema. Follow the <a href="#">runbook</a> step by step.</p><ul><li>Freeze writes for 10 minutes</li><li>Run the schema diff and compare totals</li></ul></div><div class="ds-ed-foot"><span data-wc></span><span>Saved just now</span></div></div>`,
  init(st,k){const rte=st.querySelector('.ds-rte');const wc=st.querySelector('[data-wc]');const count=()=>{const n=(rte.innerText.trim().match(/\S+/g)||[]).length;wc.textContent=`${n} words`};count();rte.addEventListener('input',count);
    $$('[data-cmd]',st).forEach(b=>{b.addEventListener('mousedown',e=>e.preventDefault());b.addEventListener('click',()=>{rte.focus();const c=b.dataset.cmd;if(c==='createLink'){const sel=getSelection();if(!sel.toString()){toast(k,{title:'Select text first',text:'Highlight the words you want to link.',v:'warning'});return}document.execCommand('createLink',false,'#');toast(k,{title:'Link added',text:'Points to the issue’s runbook.'})}else document.execCommand(c,false,b.dataset.arg||null);sync()})});
    const sync=()=>{const sel=getSelection();if(!sel.rangeCount||!rte.contains(sel.anchorNode))return;$$('[data-cmd][aria-pressed]',st).forEach(b=>{try{b.setAttribute('aria-pressed',String(document.queryCommandState(b.dataset.cmd)))}catch(e){}})};
    document.addEventListener('selectionchange',sync)},
  cmp:[['Toolbar','Flat, inside the border','Canvas-tinted bar','Same surface as text'],['Frame','1px border','Card with shadow 2','Borderless, soft shadow'],['Text padding','12px','16px','20px']],
  a11y:'The editable region is a labelled multi-line <code>textbox</code>. Toolbar toggles expose <code>aria-pressed</code> that tracks the current selection. Native shortcuts (Ctrl+B / I / U) work.',keys:[['Ctrl + B / I / U','Bold / italic / underline'],['Tab','Leave the editor to the next control']]});

const CODE_SAMPLE=`// Reconcile invoices after the schema migration
import { db } from './db';

export async function reconcile(batch = 500) {
  const rows = await db.invoices.find({ schema: 'v1' }).limit(batch);
  let matched = 0;
  for (const row of rows) {
    if (row.total === row.v2Total) matched++;
  }
  return { checked: rows.length, matched };
}`;
function hlJS(src){
  const re=/(\/\/[^\n]*)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|\b(import|from|export|async|function|const|let|await|for|of|if|return|new|true|false|null)\b|\b(\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)(?=\()/g;
  let out='',last=0,m;
  while((m=re.exec(src))){out+=esc(src.slice(last,m.index));const cls=m[1]?'c':m[2]?'s':m[3]?'k':m[4]?'n':'f';out+=`<span class="tk-${cls}">${esc(m[0])}</span>`;last=re.lastIndex}
  return out+esc(src.slice(last))+'\n';
}
P({id:'code-editor',title:'Code Editor',group:'Editors',icon:'code',cls:['ds-code','ds-code__gutter','ds-code__body'],wide:true,
  desc:'Editable code with line numbers and live syntax colouring.',
  demo:k=>`<div class="ds-editor"><div class="ds-toolbar" role="toolbar" aria-label="Code actions"><span class="ds-small ds-muted" style="padding:0 6px">reconcile.js</span><span class="grow"></span>${B('Format',{v:'subtle',sz:'s',attrs:'data-ds="toast" data-title="Formatted" data-text="2 lines changed."'})}${B('Run',{v:'primary',sz:'s',icon:'bolt',attrs:'data-ds="toast" data-v="success" data-title="Run finished" data-text="checked: 500, matched: 497"'})}</div><div class="ds-code"><div class="ds-code__gutter" aria-hidden="true"></div><div class="ds-code__body"><pre aria-hidden="true"></pre><textarea spellcheck="false" wrap="off" aria-label="Code editor, reconcile.js" autocapitalize="off" autocomplete="off">${esc(CODE_SAMPLE)}</textarea></div></div><div class="ds-ed-foot"><span data-pos>Ln 1, Col 1</span><span>JavaScript · Spaces: 2 · Esc then Tab leaves the editor</span></div></div>`,
  init(st){const ta=st.querySelector('textarea'),pre=st.querySelector('pre'),gut=st.querySelector('.ds-code__gutter'),pos=st.querySelector('[data-pos]');
    const draw=()=>{pre.innerHTML=hlJS(ta.value);gut.textContent=ta.value.split('\n').map((_,i)=>i+1).join('\n');const before=ta.value.slice(0,ta.selectionStart).split('\n');pos.textContent=`Ln ${before.length}, Col ${before[before.length-1].length+1}`};
    draw();ta.addEventListener('input',draw);ta.addEventListener('keyup',draw);ta.addEventListener('click',draw);
    ta.addEventListener('keydown',e=>{if(e.key==='Escape'){ta._esc=true;return}if(e.key==='Tab'&&!ta._esc){e.preventDefault();const s=ta.selectionStart;ta.setRangeText('  ',s,ta.selectionEnd,'end');draw()}else if(e.key!=='Tab')ta._esc=false})},
  cmp:[['Theme','Product colours on white','Editor-classic palette','Xcode-like palette'],['Gutter','Sunken grey','Same surface, teal numbers','Same surface, grey numbers'],['Frame','1px border','Card, shadow 2','Borderless, soft shadow']],
  a11y:'A labelled native <code>textarea</code> sits over the coloured text, so screen readers and IME input work normally. Tab indents; Esc then Tab moves focus out.',keys:[['Tab','Indent two spaces'],['Esc, then Tab','Leave the editor']]});

const JSON_SAMPLE={issue:'DS-142',status:'In progress',points:8,blocked:false,assignee:{name:'Maya Ruiz',team:'Billing'},labels:['billing','migration'],links:[{type:'blocks',key:'DS-137'}],due:null};
function jsonHTML(v,key,last){
  const k=key!=null?`<span class="k">"${esc(key)}"</span>: `:'';const comma=last?'':',';
  if(v&&typeof v==='object'){const arr=Array.isArray(v);const ent=arr?v.map((x,i)=>[null,x]):Object.entries(v);const o=arr?'[':'{',c=arr?']':'}';
    return `<li><button type="button" aria-expanded="true" aria-label="Collapse ${key||'root'}">▾</button>${k}${o}<span class="sum"> ${ent.length} ${arr?'items':'keys'} ${c}${comma}</span><ul>${ent.map(([kk,x],i)=>jsonHTML(x,kk,i===ent.length-1)).join('')}</ul><span class="close">${c}${comma}</span></li>`}
  const cls=typeof v==='string'?'s':typeof v==='number'?'n':'b';
  return `<li><span style="display:inline-block;width:14px"></span>${k}<span class="${cls}">${typeof v==='string'?'"'+esc(v)+'"':String(v)}</span>${comma}</li>`;
}
P({id:'json-viewer',title:'JSON Viewer',group:'Editors',icon:'braces',cls:['ds-json'],
  desc:'Read structured data with collapsible objects and arrays.',
  demo:k=>`<div class="ds-editor"><div class="ds-toolbar" role="toolbar" aria-label="JSON actions"><span class="ds-small ds-muted" style="padding:0 6px">GET /issues/DS-142</span><span class="grow"></span>${B('Expand all',{v:'subtle',sz:'s',attrs:'data-json="open"'})}${B('Collapse all',{v:'subtle',sz:'s',attrs:'data-json="close"'})}</div><div class="ds-json"><ul>${jsonHTML(JSON_SAMPLE,null,true)}</ul></div></div>`,
  init(st){const box=st.querySelector('.ds-json');const set=(li,open)=>{li.classList.toggle('is-collapsed',!open);const b=li.querySelector(':scope>button');b.setAttribute('aria-expanded',String(open));b.textContent=open?'▾':'▸';$$(':scope>.close',li).forEach(c=>c.hidden=!open)};
    box.addEventListener('click',e=>{const b=e.target.closest('button');if(b){const li=b.parentElement;set(li,li.classList.contains('is-collapsed'))}});
    st.addEventListener('click',e=>{const b=e.target.closest('[data-json]');if(b)$$('li',box).filter(li=>li.querySelector(':scope>button')).forEach(li=>set(li,b.dataset.json==='open'))})},
  cmp:[['Font','Mono 12.5px','Mono 12.5px','Mono 12.5px'],['Value colours','Product palette','Editor-classic','Xcode-like']],
  a11y:'Toggles are buttons with <code>aria-expanded</code>; collapsed nodes show a summary (“2 keys”).',keys:[['Tab','Move between toggles'],['Enter','Expand / collapse']]});

const SHEET=[['Jan',12400],['Feb',13850],['Mar',12990],['Apr',15420],['May',16100]];
P({id:'formula-editor',title:'Formula Editor',group:'Editors',icon:'fx',cls:['ds-fx','ds-sheet','ds-fx-result'],
  desc:'Write spreadsheet-style formulas with function suggestions, cell references and a live result.',
  demo:k=>{const id=uid('fx');return `<div class="ds-stack"><div class="ds-field"><label class="ds-label" for="${id}">Forecast formula</label><div class="ds-control ds-fx"><span class="ds-fx__tag" aria-hidden="true">fx</span><input id="${id}" value="=SUM(B2:B6)*1.2" spellcheck="false" autocomplete="off" aria-describedby="${id}-h" style="font-family:'JetBrains Mono',monospace;font-size:13px"></div><p class="ds-help" id="${id}-h">Functions: SUM, AVERAGE, MIN, MAX. Reference cells like B3 or ranges like B2:B6.</p></div><div class="ds-row" style="gap:6px" role="group" aria-label="Insert function">${['SUM','AVERAGE','MIN','MAX'].map(f=>`<button type="button" class="ds-chip" data-fn="${f}">${f}()</button>`).join('')}</div><div class="ds-fx-result"><span class="ds-muted">Result</span><b data-fx-out aria-live="polite"></b></div><div style="overflow-x:auto"><table class="ds-sheet"><thead><tr><th></th><th>A</th><th>B</th></tr></thead><tbody><tr><th>1</th><td>Month</td><td>Revenue</td></tr>${SHEET.map((r,i)=>`<tr><th>${i+2}</th><td>${r[0]}</td><td data-cell="B${i+2}">${r[1].toLocaleString('en-US')}</td></tr>`).join('')}</tbody></table></div></div>`},
  init(st){const inp=st.querySelector('input');const out=st.querySelector('[data-fx-out]');const field=inp.closest('.ds-field');const helpEl=field.querySelector('.ds-help');const baseHelp=helpEl.innerHTML;
    const vals={};SHEET.forEach((r,i)=>vals['B'+(i+2)]=r[1]);
    const evalF=()=>{let f=inp.value.trim().replace(/^=/,'').toUpperCase();const refs=new Set();
      try{f=f.replace(/(SUM|AVERAGE|MIN|MAX)\(B(\d):B(\d)\)/g,(m,fn,a,b)=>{const xs=[];for(let i=+a;i<=+b;i++){if(vals['B'+i]==null)throw new Error(`B${i} is empty`);xs.push(vals['B'+i]);refs.add('B'+i)}return {SUM:xs.reduce((s,x)=>s+x,0),AVERAGE:xs.reduce((s,x)=>s+x,0)/xs.length,MIN:Math.min(...xs),MAX:Math.max(...xs)}[fn]});
        f=f.replace(/B(\d)/g,(m,a)=>{if(vals['B'+a]==null)throw new Error(`B${a} is empty`);refs.add('B'+a);return vals['B'+a]});
        if(!/^[\d+\-*/(). ]+$/.test(f)||!f)throw new Error('Use numbers, B2–B6, + − × ÷ and the listed functions');
        const v=Function('"use strict";return ('+f+')')();if(!isFinite(v))throw new Error('Result is not a number');
        out.textContent=v.toLocaleString('en-US',{maximumFractionDigits:2});field.classList.remove('is-error');helpEl.innerHTML=baseHelp}
      catch(err){out.textContent='—';field.classList.add('is-error');helpEl.innerHTML=ic('err')+err.message}
      $$('[data-cell]',st).forEach(c=>c.classList.toggle('is-ref',refs.has(c.dataset.cell)))};
    evalF();inp.addEventListener('input',evalF);
    st.addEventListener('click',e=>{const c=e.target.closest('[data-fn]');if(!c)return;e.stopPropagation();inp.value=`=${c.dataset.fn}(B2:B6)`;evalF();inp.focus()},true)},
  cmp:[['Formula field','Same as text field','Same as text field','Underline field'],['Referenced cells','Tint + outline','Tint + outline','Tint + outline']],
  a11y:'The result is in a live region. Errors explain what is allowed instead of a generic “invalid formula”.',keys:KEYS.field});

const MD_SAMPLE=`## Release notes 4.2

Billing now runs on the **v2 schema**. Invoices load *twice as fast*.

- Bulk export for reports
- New \`reconcile()\` job
- Fixed stale currency codes

> Rollback stays available for 14 days.

Read the [migration guide](#).`;
function mdToHTML(s){
  const inline=t=>esc(t).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(m,a,b)=>`<a href="${/^(https?:|#)/.test(b)?b:'#'}" target="_blank" rel="noopener">${a}</a>`);
  const lines=s.split('\n');let html='',list=false,para=[];
  const flush=()=>{if(para.length){html+=`<p>${inline(para.join(' '))}</p>`;para=[]}};
  for(const l of lines){
    let m;
    if((m=l.match(/^(#{1,3})\s+(.*)/))){flush();if(list){html+='</ul>';list=false}html+=`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`}
    else if((m=l.match(/^[-*]\s+(.*)/))){flush();if(!list){html+='<ul>';list=true}html+=`<li>${inline(m[1])}</li>`}
    else if((m=l.match(/^>\s?(.*)/))){flush();if(list){html+='</ul>';list=false}html+=`<blockquote>${inline(m[1])}</blockquote>`}
    else if(!l.trim()){flush();if(list){html+='</ul>';list=false}}
    else{if(list){html+='</ul>';list=false}para.push(l)}
  }
  flush();if(list)html+='</ul>';return html;
}
P({id:'markdown-editor',title:'Markdown Editor',group:'Editors',icon:'file',cls:['ds-md','ds-md__out'],wide:true,
  desc:'Write Markdown on the left and see the formatted result on the right as you type.',
  demo:k=>{const id=uid('md');return `<div class="ds-editor"><div class="ds-toolbar" role="toolbar" aria-label="Markdown"><span class="ds-small ds-muted" style="padding:0 6px">release-notes.md</span><span class="grow"></span>${B('Publish',{v:'primary',sz:'s',attrs:'data-ds="feedback" data-title="Published" data-text="Release notes 4.2 are live."'})}</div><div class="ds-md"><textarea id="${id}" aria-label="Markdown source" spellcheck="false">${esc(MD_SAMPLE)}</textarea><div class="ds-md__out" aria-live="off" aria-label="Preview"></div></div></div>`},
  init(st){const ta=st.querySelector('textarea'),out=st.querySelector('.ds-md__out');const draw=()=>out.innerHTML=mdToHTML(ta.value);draw();ta.addEventListener('input',draw)},
  cmp:[['Source pane','Sunken grey','Sunken grey','Grouped background'],['Preview type','Product body type','Product body type','Product body type, larger']],
  a11y:'The source is a labelled <code>textarea</code>; the preview is a labelled region that does not announce every keystroke.',keys:KEYS.field});

/* ===================== PATTERNS ===================== */
P({id:'pattern-forms',title:'Forms',section:'patterns',icon:'form',cls:['ds-panel','ds-field','ds-alert'],wide:true,
  desc:'A complete “Create project” form: grouped sections, inline validation, an error summary and a success confirmation.',
  demo:k=>{const n=uid('pf');return `<form class="ds-panel" novalidate data-pform style="max-width:720px"><div class="ds-stack"><div><h3 class="ds-t-h2">Create project</h3><p class="ds-muted" style="margin:4px 0 0">Projects group issues, boards and reports for one team.</p></div><div data-summary hidden></div><fieldset class="ds-choices" style="gap:var(--gap-l)"><legend class="ds-t-eyebrow" style="margin-bottom:var(--gap)">Details</legend><div class="ds-form-grid">${TF({id:n+'-name',label:'Project name',req:true,ph:'For example, Ledger Migration',help:'Shown in navigation and reports'})}${TF({id:n+'-key',label:'Key',req:true,ph:'LED',help:'2–5 capital letters, used in issue keys',attrs:'maxlength="5"'})}</div>${TA({label:'Description',rows:2,ph:'What is this project for?'})}</fieldset><fieldset class="ds-choices" style="gap:var(--gap-l)"><legend class="ds-t-eyebrow" style="margin-bottom:var(--gap)">People &amp; access</legend><div class="ds-form-grid">${SEL({label:'Project lead',options:PEOPLE.map(p=>p.n),sel:0})}${DATE({label:'Start date',init:7})}</div><fieldset class="ds-choices"><legend class="ds-label">Visibility</legend>${CHK('Private',{radio:1,name:n+'-v',desc:'Only invited members'})}${CHK('Workspace',{radio:1,name:n+'-v',checked:1,desc:'Everyone in Ledger Inc.'})}</fieldset>${SW('Email the team when the project is created',{on:1})}</fieldset><div class="ds-row" style="justify-content:flex-end">${B('Cancel',{v:'subtle',attrs:'type="reset"'})}<button type="submit" class="ds-btn ds-btn--primary"><span>Create project</span></button></div></div></form>`},
  init(st,k){const f=st.querySelector('[data-pform]');const name=f.querySelector('input[id$="-name"]'),key=f.querySelector('input[id$="-key"]');let keyTouched=false;
    name.addEventListener('input',()=>{if(!keyTouched)key.value=name.value.replace(/[^A-Za-z ]/g,'').split(/\s+/).filter(Boolean).map(w=>w[0]).join('').toUpperCase().slice(0,5)||name.value.slice(0,3).toUpperCase()});
    key.addEventListener('input',()=>{keyTouched=true;key.value=key.value.toUpperCase()});
    const setErr=(inp,msg,def)=>{const fld=inp.closest('.ds-field');const h=fld.querySelector('.ds-help');fld.classList.toggle('is-error',!!msg);inp.toggleAttribute('aria-invalid',!!msg);h.innerHTML=msg?ic('err')+msg:def};
    f.addEventListener('submit',e=>{e.preventDefault();const errs=[];
      if(!name.value.trim())errs.push([name,'Enter a project name']);
      if(!/^[A-Z]{2,5}$/.test(key.value))errs.push([key,'Key must be 2–5 capital letters, for example LED']);
      setErr(name,errs.find(x=>x[0]===name)?.[1],'Shown in navigation and reports');setErr(key,errs.find(x=>x[0]===key)?.[1],'2–5 capital letters, used in issue keys');
      const sum=f.querySelector('[data-summary]');
      if(errs.length){sum.hidden=false;sum.innerHTML=`<div class="ds-alert ds-alert--error" role="alert" tabindex="-1"><span class="ds-alert__ic">${ic('err')}</span><div class="ds-alert__body"><p class="ds-alert__title">Fix ${errs.length} ${errs.length>1?'fields':'field'} to create the project</p><ul class="ds-sum-err">${errs.map(([i,m])=>`<li><a class="ds-link" href="#${i.id}" data-focus="${i.id}">${m}</a></li>`).join('')}</ul></div></div>`;sum.firstChild.focus()}
      else{sum.hidden=true;toast(k,{title:`Project “${name.value}” created`,text:`Issues will use the key ${key.value}-1, ${key.value}-2…`,v:'success'})}});
    f.addEventListener('reset',()=>{keyTouched=false;f.querySelector('[data-summary]').hidden=true;setTimeout(()=>{setErr(name,'','Shown in navigation and reports');setErr(key,'','2–5 capital letters, used in issue keys')})});
    f.addEventListener('click',e=>{const a=e.target.closest('[data-focus]');if(a){e.preventDefault();e.stopPropagation();document.getElementById(a.dataset.focus).focus()}},true)},
  cmp:[['Section headers','Small uppercase eyebrow','Semibold group label','Grey text, generous space above'],['Field rhythm','16px between fields','20px','28px'],['Error summary','Section message at top','Message bar at top','Card at top'],['Primary action','Bottom right','Bottom right','Bottom right']],
  a11y:'Errors are shown inline and summarised at the top; the summary receives focus and each entry links to its field. Fields use native validation attributes and <code>aria-invalid</code>.',keys:[['Tab','Move through fields'],['Enter','Submit from any text field']]});

P({id:'pattern-crud',title:'CRUD',section:'patterns',icon:'table',cls:['ds-table','ds-tbar','ds-dialog'],wide:true,
  desc:'Create, read, update and delete records in a table, with a modal form, confirmation and undo.',
  demo:k=>`<div class="ds-panel" data-crud><div class="ds-stack"><div class="ds-tbar"><h3 class="ds-t-h3" style="margin-right:auto">Team members</h3><div class="ds-control ds-control--search ds-s" style="width:200px">${ic('search')}<input type="search" aria-label="Filter members" placeholder="Filter by name or role" data-q></div>${B('Add member',{v:'primary',icon:'plus',attrs:'data-new'})}</div><div class="ds-tablewrap"><table class="ds-table"><caption class="ds-sr">Team members</caption><thead><tr><th scope="col">Name</th><th scope="col">Role</th><th scope="col">Access</th><th scope="col" class="num"><span class="ds-sr">Actions</span></th></tr></thead><tbody></tbody></table></div><div data-empty hidden class="ds-empty-state">${ic('users')}<b>No members match</b><span class="ds-small">Try another name, or clear the filter.</span></div></div></div>`,
  init(st,k){const box=st.querySelector('[data-crud]');const tb=box.querySelector('tbody');const q=box.querySelector('[data-q]');
    let rows=PEOPLE.slice(0,5).map((p,i)=>({id:i+1,n:p.n,r:p.r,a:['Admin','Member','Member','Viewer','Member'][i],c:p.c,i:p.i}));let nextId=10;
    const ACC={Admin:'danger',Member:'info',Viewer:''};
    const draw=()=>{const s=q.value.trim().toLowerCase();const vis=rows.filter(r=>!s||(r.n+' '+r.r).toLowerCase().includes(s));tb.innerHTML=vis.map(r=>`<tr data-id="${r.id}"><td><span class="ds-who">${AV(r.i,r.c,{sz:'s',name:r.n})}${esc(r.n)}</span></td><td>${esc(r.r)}</td><td>${BADGE(r.a,ACC[r.a])}</td><td class="num" style="white-space:nowrap">${IB('edit','Edit '+esc(r.n),{sz:'s',attrs:'data-edit'})}${IB('trash','Remove '+esc(r.n),{sz:'s',attrs:'data-del'})}</td></tr>`).join('');box.querySelector('[data-empty]').hidden=vis.length>0;box.querySelector('.ds-tablewrap').hidden=!vis.length};
    draw();q.addEventListener('input',draw);
    const form=(r)=>{const t=uid('cf');return `<form class="ds-dialog" role="dialog" aria-labelledby="${t}" novalidate><div class="ds-dialog__head"><h2 class="ds-dialog__title" id="${t}">${r?'Edit member':'Add member'}</h2><button type="button" class="ds-btn ds-btn--subtle ds-ibtn ds-s ds-dialog__close" aria-label="Close" data-close>${ic('x')}</button></div><div class="ds-dialog__body">${TF({id:t+'-n',label:'Full name',req:true,val:r?r.n:'',help:'As it appears in their profile',attrs:'autofocus'})}${TF({id:t+'-r',label:'Role',val:r?r.r:'',ph:'For example, QA analyst'})}<fieldset class="ds-choices"><legend class="ds-label">Access</legend>${['Admin','Member','Viewer'].map(a=>CHK(a,{radio:1,name:t+'-a',checked:(r?r.a:'Member')===a,attrs:`value="${a}"`})).join('')}</fieldset></div><div class="ds-dialog__foot">${k==='f'?`<button type="submit" class="ds-btn ds-btn--primary"><span>${r?'Save':'Add'}</span></button>`+B('Cancel',{attrs:'data-close'}):B('Cancel',{v:k==='a'?'subtle':'',attrs:'data-close'})+`<button type="submit" class="ds-btn ds-btn--primary"><span>${r?'Save':'Add'}</span></button>`}</div></form>`};
    const open=(r,opener)=>{const L=openLayer(k,form(r),'modal',opener);const f=L.querySelector('form');f.addEventListener('submit',e=>{e.preventDefault();const n=f.querySelector('[id$="-n"]');if(!n.value.trim()){const fld=n.closest('.ds-field');fld.classList.add('is-error');n.setAttribute('aria-invalid','true');fld.querySelector('.ds-help').innerHTML=ic('err')+'Enter a name';n.focus();return}const role=f.querySelector('[id$="-r"]').value.trim()||'Member';const acc=f.querySelector('input[type=radio]:checked').value;
      if(r){Object.assign(r,{n:n.value.trim(),r:role,a:acc});toast(k,{title:'Changes saved',text:`${r.n} is now ${acc.toLowerCase()}.`,v:'success'})}else{const ini=n.value.trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();rows.unshift({id:nextId++,n:n.value.trim(),r:role,a:acc,c:(nextId%5)+1,i:ini});toast(k,{title:'Member added',text:`${n.value.trim()} can now access Ledger Migration.`,v:'success'})}
      L._close();draw()})};
    box.addEventListener('click',e=>{const t=e.target;
      if(t.closest('[data-new]')){open(null,t.closest('button'));return}
      const tr=t.closest('tr[data-id]');if(!tr)return;const r=rows.find(x=>x.id===+tr.dataset.id);
      if(t.closest('[data-edit]'))open(r,t.closest('button'));
      if(t.closest('[data-del]')){const id=uid('cd');const L=openLayer(k,`<div class="ds-dialog ds-dialog--danger" role="alertdialog" aria-labelledby="${id}" aria-describedby="${id}-d"><div class="ds-dialog__head"><span class="ds-dialog__ic">${ic('warn')}</span><h2 class="ds-dialog__title" id="${id}">Remove ${esc(r.n)}?</h2></div><div class="ds-dialog__body"><p id="${id}-d">They will lose access to Ledger Migration. Their issues stay assigned.</p></div><div class="ds-dialog__foot">${B('Cancel',{v:k==='a'?'subtle':'',attrs:'data-close autofocus'})}${B('Remove',{v:'danger',attrs:'data-go'})}</div></div>`,'modal',t.closest('button'));
        L.querySelector('[data-go]').addEventListener('click',()=>{const idx=rows.indexOf(r);rows.splice(idx,1);L._close();draw();snack(k,`${r.n} removed`,'Undo',()=>{rows.splice(idx,0,r);draw()})})}
    })},
  cmp:[['Table density','36px rows','44px rows','48px rows'],['Row actions','Icon buttons, always visible','Icon buttons, always visible','Icon buttons, always visible'],['Delete flow','Confirm dialog → snackbar undo','Confirm dialog → snackbar undo','Confirm alert → snackbar undo']],
  a11y:'Row actions are named with the record (“Edit Maya Ruiz”). Dialogs return focus to the button that opened them. Removal offers undo.',keys:[['Tab','Move through rows and actions'],['Enter','Activate'],['Esc','Close dialogs']]});

const SEARCH_DATA=[{t:'Issue',ic:'file',title:'DS-142 Migrate billing tables to new schema',path:'Ledger Migration › Backlog',body:'Move invoices, line items and tax tables to the v2 schema.'},{t:'Issue',ic:'file',title:'DS-137 Invoices API returns stale currency codes',path:'Ledger Migration › Sprint 42',body:'Currency codes are cached for 24h in the billing service.'},{t:'Doc',ic:'pen',title:'Runbook: billing cut-over',path:'Docs › Operations',body:'Freeze writes, run the schema diff, compare totals, re-point replica.'},{t:'Doc',ic:'pen',title:'ADR-012 Billing schema v2',path:'Docs › Architecture',body:'Why invoices move to a normalised line-item table.'},{t:'Person',ic:'user',title:'Aiko Kato',path:'Backend engineer · Billing',body:'Owns the invoices API and the rollback plan.'},{t:'Issue',ic:'file',title:'DS-139 Audit focus rings across admin console',path:'Design System › Backlog',body:'Check every interactive control for a visible focus indicator.'},{t:'Doc',ic:'pen',title:'Release notes 4.2',path:'Docs › Releases',body:'Billing now runs on the v2 schema.'},{t:'Person',ic:'user',title:'Maya Ruiz',path:'Engineering lead · Billing',body:'Leads the Ledger Migration project.'}];
P({id:'pattern-search',title:'Search',section:'patterns',icon:'search',cls:['ds-result','ds-results','ds-control--search'],wide:true,
  desc:'Global search with scopes, highlighted matches, result counts and a helpful empty state.',
  demo:k=>{const id=uid('ps');return `<div class="ds-stack" data-psearch style="max-width:760px"><div class="ds-control ds-control--search ds-l">${ic('search')}<input id="${id}" type="search" aria-label="Search Ledger" value="billing" placeholder="Search issues, docs and people" autocomplete="off"></div>${tabs({items:[{l:'All'},{l:'Issues',ic:'file'},{l:'Docs',ic:'pen'},{l:'People',ic:'user'}].map(x=>({...x,body:''})),noPanels:1,label:'Search scope'})}<div class="ds-faint ds-small" data-count aria-live="polite"></div><div class="ds-results" data-results></div></div>`},
  init(st){const box=st.querySelector('[data-psearch]');const inp=box.querySelector('input');let scope='All';
    const hl=(s,q)=>q?esc(s).replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig'),'<mark>$1</mark>'):esc(s);
    const draw=()=>{const q=inp.value.trim();const ql=q.toLowerCase();const hits=SEARCH_DATA.filter(d=>(scope==='All'||d.t+'s'===scope||(scope==='People'&&d.t==='Person'))&&(!ql||(d.title+' '+d.body+' '+d.path).toLowerCase().includes(ql)));
      box.querySelector('[data-count]').textContent=q?`${hits.length} result${hits.length===1?'':'s'} for “${q}”${scope!=='All'?' in '+scope:''}`:`${hits.length} items`;
      box.querySelector('[data-results]').innerHTML=hits.length?hits.map(d=>`<a class="ds-result" href="#" data-noop style="text-decoration:none;color:inherit"><span class="ds-result__path">${ic(d.ic)} ${d.t} · ${esc(d.path)}</span><span class="ds-result__title">${hl(d.title,q)}</span><span class="ds-muted ds-small">${hl(d.body,q)}</span></a>`).join(''):`<div class="ds-empty-state">${ic('search')}<b>No results for “${esc(q)}”</b><span class="ds-small">Check the spelling, try a broader term, or search All instead of ${scope}.</span></div>`};
    inp.addEventListener('input',draw);box.addEventListener('ds-tab',e=>{scope=e.detail.tab.textContent.trim();draw()});draw()},
  cmp:[['Search field','Box, large','Box, large','Filled rounded field'],['Scopes','Underlined tabs','Tabs with icons','Segmented control'],['Results','Flat rows with dividers','Raised cards','Borderless cards on grey'],['Match highlight','Yellow marker','Bold brand text','Bold text']],
  a11y:'Result counts are announced politely. Matches are marked with <code>mark</code>, and the empty state suggests what to try next.',keys:[['Type','Results update as you type'],['← / →','Change scope']]});

P({id:'pattern-filtering',title:'Filtering',section:'patterns',icon:'filter',cls:['ds-filter-layout','ds-facets','ds-chip','ds-tag'],wide:true,
  desc:'Narrow a list with faceted filters, quick chips and removable active-filter tags.',
  demo:k=>`<div class="ds-filter-layout" data-pfilter><aside class="ds-facets" aria-label="Filters"><fieldset class="ds-choices"><legend class="ds-label">Status</legend>${['To do','In progress','In review','Blocked','Done'].map(s=>CHK(`${s} <span class="ds-faint" data-n="${s}"></span>`,{attrs:`data-status="${s}"`})).join('')}</fieldset><fieldset class="ds-choices"><legend class="ds-label">Assignee</legend>${['Maya Ruiz','Jonas Ortiz','Aiko Kato','Liam Shah','Priya Nair'].map(s=>CHK(s,{attrs:`data-who="${s}"`})).join('')}</fieldset>${SW('Only 5+ points',{})}</aside><div class="ds-stack" style="gap:var(--gap)"><div class="ds-row" style="gap:6px" data-filter role="group" aria-label="Quick filters">${[['Updated today','u24'],['Large (8+)','big']].map(([t,v])=>`<button type="button" class="ds-chip" aria-pressed="false" data-quick="${v}">${ic('check','ds-chip__tick')}${t}</button>`).join('')}</div><div class="ds-row" style="gap:6px" data-active></div><div class="ds-faint ds-small" data-count aria-live="polite"></div><ul class="ds-list" data-res></ul></div></div>`,
  init(st){const box=st.querySelector('[data-pfilter]');const f={status:new Set(),who:new Set(),quick:new Set(),five:false};
    $$('[data-n]',box).forEach(n=>n.textContent=`(${ISSUES.filter(i=>i.status[0]===n.dataset.n).length})`);
    const draw=()=>{const hits=ISSUES.filter(i=>(!f.status.size||f.status.has(i.status[0]))&&(!f.who.size||f.who.has(i.who[1]))&&(!f.five||i.pts>=5)&&(!f.quick.has('u24')||i.u<=24)&&(!f.quick.has('big')||i.pts>=8));
      box.querySelector('[data-count]').textContent=`${hits.length} of ${ISSUES.length} issues`;
      box.querySelector('[data-res]').innerHTML=hits.length?hits.map(i=>`<li class="ds-li"><div class="ds-li__main"><span class="ds-li__title">${i.key} ${i.sum}</span><span class="ds-li__sub">${i.who[1]} · ${i.pts} pts · ${i.upd}</span></div><span class="ds-li__end">${BADGE(i.status[0],i.status[1])}</span></li>`).join(''):`<li class="ds-empty-state">${ic('filter')}<b>No issues match these filters</b><button type="button" class="ds-btn ds-btn--link" data-clear-all><span>Clear all filters</span></button></li>`;
      const tags=[...[...f.status].map(s=>['status',s]),...[...f.who].map(s=>['who',s]),...(f.five?[['five','5+ points']]:[]),...[...f.quick].map(q=>['quick',q==='u24'?'Updated today':'Large (8+)',q])];
      box.querySelector('[data-active]').innerHTML=tags.length?tags.map(([t,l,v])=>`<span class="ds-tag ds-tag--blue">${l}<button type="button" class="ds-tag__x" aria-label="Remove filter ${l}" data-rm="${t}" data-v="${v||l}">${ic('x')}</button></span>`).join('')+`<button type="button" class="ds-btn ds-btn--link ds-s" data-clear-all><span>Clear all</span></button>`:''};
    box.addEventListener('change',e=>{const t=e.target;if(t.dataset.status)t.checked?f.status.add(t.dataset.status):f.status.delete(t.dataset.status);if(t.dataset.who)t.checked?f.who.add(t.dataset.who):f.who.delete(t.dataset.who);if(t.getAttribute('role')==='switch')f.five=t.checked;draw()});
    box.addEventListener('click',e=>{const c=e.target.closest('[data-quick]');if(c){const on=c.getAttribute('aria-pressed')!=='true';c.setAttribute('aria-pressed',String(on));on?f.quick.add(c.dataset.quick):f.quick.delete(c.dataset.quick);draw();return}
      const rm=e.target.closest('[data-rm]');if(rm){e.stopPropagation();const {rm:t,v}=rm.dataset;if(t==='status'){f.status.delete(v);box.querySelector(`[data-status="${v}"]`).checked=false}if(t==='who'){f.who.delete(v);box.querySelector(`[data-who="${v}"]`).checked=false}if(t==='five'){f.five=false;box.querySelector('[role=switch]').checked=false}if(t==='quick'){f.quick.delete(v);box.querySelector(`[data-quick="${v}"]`).setAttribute('aria-pressed','false')}draw();box.querySelector('[data-count]').focus?.();return}
      if(e.target.closest('[data-clear-all]')){f.status.clear();f.who.clear();f.quick.clear();f.five=false;$$('input',box).forEach(i=>i.checked=false);$$('[data-quick]',box).forEach(c=>c.setAttribute('aria-pressed','false'));draw()}},true);
    draw()},
  cmp:[['Facet panel','Compact checkbox list','Checkbox groups with 8px rhythm','Spacious groups, 12px rhythm'],['Active filters','Square tags','Rounded tags with stroke','Capsules'],['Result list','Dense rows','Card list','Inset grouped list']],
  a11y:'Facets are grouped in fieldsets. Result counts are announced politely, and every active filter can be removed individually or all at once.',keys:[['Space','Toggle a facet'],['Enter','Remove an active filter tag']]});

P({id:'pattern-master-detail',title:'Master Detail',section:'patterns',icon:'columns',cls:['ds-md-layout','ds-list','ds-kv'],wide:true,
  desc:'Browse a list on one side and see the selected record’s full detail on the other.',
  demo:k=>`<div class="ds-md-layout" data-pmd><ul class="ds-list" role="listbox" aria-label="Issues" style="align-self:start">${ISSUES.map((i,n)=>`<li class="ds-li" role="option" tabindex="${n===0?0:-1}" aria-selected="${n===0}" data-i="${n}"><div class="ds-li__main"><span class="ds-li__title">${i.key}</span><span class="ds-li__sub">${i.sum}</span></div><span class="ds-li__end">${ic('chev-right','ds-li__chev')}</span></li>`).join('')}</ul><section class="ds-panel" data-detail aria-live="polite"></section></div>`,
  init(st,k){const box=st.querySelector('[data-pmd]');const det=box.querySelector('[data-detail]');const tid=uid('md');
    const show=n=>{const i=ISSUES[n];det.innerHTML=`<div class="ds-stack"><div class="ds-detail-h"><div class="ds-col" style="gap:4px"><span class="ds-faint ds-small">${i.key}</span><h3 class="ds-t-h2">${i.sum}</h3></div><div class="ds-row">${B('Edit',{icon:'edit'})}${B('Resolve',{v:'primary',attrs:'data-ds="feedback" data-title="Resolved" data-text="'+i.key+' moved to Done."'})}</div></div><dl class="ds-kv"><dt>Status</dt><dd>${BADGE(i.status[0],i.status[1])}</dd><dt>Assignee</dt><dd><span class="ds-who">${AV(i.who[0],i.who[2],{sz:'s'})}${i.who[1]}</span></dd><dt>Points</dt><dd>${i.pts}</dd><dt>Updated</dt><dd>${i.upd}</dd></dl>${tabs({id:tid+n,items:[{l:'Description',body:`${i.sum}. Acceptance: totals match within 0.01 and no customer-visible downtime.`},{l:'Activity',body:`${i.who[1]} updated this ${i.upd}.`}]})}</div>`;$$('.ds-tablist',det).forEach(moveInd)};
    const pick=li=>{$$('.ds-li',box).forEach(x=>{x.setAttribute('aria-selected',String(x===li));x.tabIndex=x===li?0:-1});show(+li.dataset.i)};
    box.querySelector('.ds-list').addEventListener('click',e=>{const li=e.target.closest('.ds-li');if(li){e.stopPropagation();pick(li);li.focus()}},true);
    box.querySelector('.ds-list').addEventListener('keydown',e=>{const li=e.target.closest('.ds-li');if(!li)return;const all=$$('.ds-li',box);const i=all.indexOf(li);let n=null;if(e.key==='ArrowDown')n=Math.min(all.length-1,i+1);if(e.key==='ArrowUp')n=Math.max(0,i-1);if(e.key==='Home')n=0;if(e.key==='End')n=all.length-1;if(n!=null){e.preventDefault();e.stopPropagation();pick(all[n]);all[n].focus()}},true);
    show(0)},
  cmp:[['List width','280px, no gap','300px + 16px gap','300px + 20px gap'],['Selection','Tint + left bar','Tint fill','Tint fill + disclosure chevrons'],['Detail surface','Bordered panel','Raised card','Borderless rounded panel']],
  a11y:'The list is a <code>listbox</code> with roving focus; selection updates the detail region, which is announced politely.',keys:[['↑ / ↓','Move through the list and show details'],['Tab','Move into the detail panel']]});
