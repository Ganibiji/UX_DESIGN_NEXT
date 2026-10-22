'use strict';
/* =====================================================================
   COMPONENT SPECS 2 — Tables, Data Grid, Pagination, Breadcrumb, Badge,
   Chips, Alerts, Progress, Modal, Drawer, Popover, Tooltip
   ===================================================================== */
/* ---------------- TABLES ---------------- */
const poRow=(p,o,i)=>{
  const cells=[`<a class="ds-link" href="#">${p.no}</a>`,p.vendor,p.item,BADGE(p.status[0],p.status[1],{sz:'s'})];
  if(o.content==='avatar'){const e=EMP.find(x=>x.n===p.owner)||EMP[0];cells.push(`<span class="ds-who">${AV(e.i,e.c,{sz:'s',name:e.n})}${p.owner}</span>`)}else cells.push(p.owner);
  if(o.content==='progress')cells.push(`<div class="ds-prog ds-s"><div class="ds-prog__track" role="progressbar" aria-label="Received" aria-valuenow="${[40,100,60,0,100][i]}"><div class="ds-prog__bar" style="--v:${[40,100,60,0,100][i]}%"></div></div></div>`);
  cells.push(money(p.total));
  if(o.content==='actions')cells.push(`<span style="white-space:nowrap">${IB('edit','Edit '+p.no,{sz:'s'})}${IB('more','More for '+p.no,{sz:'s'})}</span>`);
  return cells;
};
function poCols(o,sort){const c=[['PO'],['Vendor'],['Item'],['Status'],['Owner']];if(o.content==='progress')c.push(['Received']);c.push(['Total','money']);if(o.content==='actions')c.push(['<span class="ds-sr">Actions</span>','num']);return c}
function tblRender(o,k){
  const v=o.variant;const rows=PO.map((p,i)=>poRow(p,o,i));const cols=poCols(o);
  const head=(c,opts={})=>`<thead><tr>${opts.sel?`<th class="ds-cellw">${CHK('<span class="ds-sr">Select all</span>',{attrs:'data-all'})}</th>`:''}${opts.exp?'<th class="ds-cellw"><span class="ds-sr">Expand</span></th>':''}${c.map(([l,cl])=>`<th scope="col"${cl?` class="${cl}"`:''}>${opts.sort&&!/sr/.test(l)?`<button type="button" class="ds-sort">${l}${ic('arrow-up')}</button>`:l}</th>`).join('')}</tr></thead>`;
  const tr=(r,opts={},i)=>`<tr${opts.sel?' aria-selected="false"':''}>${opts.sel?`<td class="ds-cellw">${CHK(`<span class="ds-sr">Select ${PO[i].no}</span>`,{attrs:'data-row'})}</td>`:''}${opts.exp?`<td class="ds-cellw"><button type="button" class="tb-exp-btn" aria-expanded="false" aria-label="Show lines for ${PO[i].no}" data-exp="${i}">${ic('chev-right')}</button></td>`:''}${r.map((c,j)=>`<td${cols[j]&&cols[j][1]?` class="${cols[j][1]}"`:''}${opts.edit&&j===2?' class="ds-editable" tabindex="0"':''}>${c}</td>`).join('')}</tr>`;
  const T=(inner,cls='',wrap='')=>`<div class="ds-tablewrap ${wrap}"><table class="ds-table ${cls}"><caption class="ds-sr">Purchase orders</caption>${inner}</table></div>`;
  const body=(opts={})=>`<tbody>${rows.map((r,i)=>tr(r,opts,i)).join('')}</tbody>`;
  switch(v){
    case 'dense':return `<div class="dn-dense">${T(head(cols)+body())}</div>`;
    case 'comfortable':return `<div style="--row:56px">${T(head(cols)+body())}</div>`;
    case 'striped':return T(head(cols)+body(),'tb-striped');
    case 'borderless':return T(head(cols)+body(),'tb-borderless');
    case 'sortable':return T(head(cols,{sort:1})+body());
    case 'filterable':return `<div class="ds-col" data-tf>${T(head(cols)+`<tbody>${`<tr class="tb-filter">${cols.map(([l],j)=>`<td>${j<4?`<div class="ds-control ds-s"><input aria-label="Filter ${l}" placeholder="Filter" data-fcol="${j}"></div>`:''}</td>`).join('')}</tr>`}${rows.map((r,i)=>tr(r,{},i)).join('')}</tbody>`)}</div>`;
    case 'searchable':return `<div class="ds-col" data-ts><div class="ds-control ds-control--search ds-s" style="max-width:260px">${ic('search')}<input type="search" aria-label="Search purchase orders" placeholder="Search vendor, item or PO"></div>${T(head(cols)+body())}<span class="ds-faint ds-small" data-ts-count aria-live="polite">5 orders</span></div>`;
    case 'selectable':case 'bulk':return `<div class="ds-col" data-tsel><div class="ds-tbar"><span class="ds-tbar__sel" data-count>No orders selected</span><span class="grow"></span>${v==='bulk'?B('Approve',{v:'subtle',icon:'check',keep:1,attrs:'data-bulk disabled'})+B('Export',{v:'subtle',icon:'download',keep:1,attrs:'data-bulk disabled'})+B('Cancel',{v:'subtle',icon:'trash',keep:1,attrs:'data-bulk disabled'}):''}</div>${T(head(cols,{sel:1})+body({sel:1}))}</div>`;
    case 'expandable':return `<div data-texp>${T(head(cols,{exp:1})+body({exp:1}))}</div>`;
    case 'nested':return T(head(cols)+`<tbody>${rows.map((r,i)=>tr(r,{},i)+(i<2?`<tr class="tb-child"><td></td><td>↳ Line 1</td><td>${PO[i].item.split('(')[0]}</td><td>${BADGE('Open','',{sz:'s'})}</td><td></td><td class="money">${money(PO[i].total*.8)}</td></tr><tr class="tb-child"><td></td><td>↳ Line 2</td><td>Freight</td><td>${BADGE('Open','',{sz:'s'})}</td><td></td><td class="money">${money(PO[i].total*.2)}</td></tr>`:'')).join('')}</tbody>`);
    case 'grouped':{const g=[...new Set(PO.map(p=>p.status[0]))];return T(head(cols)+`<tbody>${g.map(s=>{const rs=PO.map((p,i)=>[p,i]).filter(([p])=>p.status[0]===s);return `<tr class="tb-group"><th colspan="${cols.length}" scope="rowgroup">${s} <span class="ds-faint">(${rs.length}) · ${money(rs.reduce((a,[p])=>a+p.total,0))}</span></th></tr>`+rs.map(([p,i])=>tr(rows[i],{},i)).join('')}).join('')}</tbody>`)}
    case 'inline':return `<div data-tedit>${T(head(cols)+body({edit:1}))}<p class="ds-cap" style="margin-top:6px">Double-click or press Enter on an Item cell to edit.</p></div>`;
    case 'sticky':return T(head(cols)+`<tbody>${[...rows,...rows].map((r,i)=>tr(r,{},i%5)).join('')}</tbody>`,'','tb-sticky');
    case 'stickycol':return `<div class="ds-tablewrap"><table class="ds-table tb-stickycol" style="min-width:1100px"><caption class="ds-sr">Wide orders</caption><thead><tr>${['PO','Vendor','Item','Status','Owner','Total','Cost centre','Incoterm','Currency','Created'].map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${PO.map((p,i)=>`<tr>${[p.no,p.vendor,p.item,BADGE(p.status[0],p.status[1],{sz:'s'}),p.owner,money(p.total),'CC-410','DAP','USD',p.date].map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    case 'pagination':return `<div class="ds-col">${T(head(cols)+body())}<div class="ds-row" style="justify-content:space-between"><span class="ds-faint ds-small" data-pager-out>Showing 1–5 of 214</span><nav class="ds-pager" aria-label="Pagination" data-total="43" data-items="214" data-per="5" data-init-pg="1"></nav></div></div>`;
    case 'infinite':return `<div data-tinf><div class="ds-tablewrap tb-scroll"><table class="ds-table"><caption class="ds-sr">Orders</caption>${head(cols)}${body()}</table><div class="tb-state" data-more>${SPIN('s',{label:'Loading more'})} Scroll to load more</div></div></div>`;
    case 'empty':return T(head(cols)+`<tbody><tr><td colspan="${cols.length}"><div class="dx-empty"><span class="dx-empty__art">${ic('inbox')}</span><h4>No purchase orders yet</h4><p>Create your first order to start tracking spend.</p>${B('Create order',{v:'primary',sz:'s'})}</div></td></tr></tbody>`);
    case 'loading':return T(head(cols)+`<tbody aria-busy="true">${[1,2,3,4].map(()=>`<tr>${cols.map(()=>`<td><span class="ds-skel ds-skel--line" style="--w:${60+Math.round(Math.random()*30)}%"></span></td>`).join('')}</tr>`).join('')}</tbody>`);
    case 'error':return `<div data-terr>${T(head(cols)+`<tbody><tr><td colspan="${cols.length}"><div class="dx-empty dx-empty--err"><span class="dx-empty__art">${ic('err')}</span><h4>Orders couldn’t load</h4><p>The procurement service timed out. Your filters are kept.</p>${B('Retry',{v:'primary',sz:'s',attrs:'data-retry'})}</div></td></tr></tbody>`)}</div>`;
    case 'readonly':return T(head(cols.filter(c=>!/sr/.test(c[0])))+body(),'tb-borderless');
    case 'financial':{const L=[['4000','Revenue',128450,'',''],['5000','Cost of goods',-72310,'',''],['6100','Salaries',-31200,'',''],['6200','Rent',-6500,'',''],['7000','Other income',1840,'','']];const net=L.reduce((a,r)=>a+r[2],0);return `<div class="ds-tablewrap"><table class="ds-table"><caption class="ds-sr">Profit and loss</caption><thead><tr><th scope="col">Account</th><th scope="col">Name</th><th scope="col" class="money">Oct 2026</th><th scope="col" class="money">Sep 2026</th><th scope="col" class="money">Change</th></tr></thead><tbody>${L.map(r=>{const prev=Math.round(r[2]*0.94);const ch=((r[2]-prev)/Math.abs(prev)*100).toFixed(1);return `<tr><td class="ds-mono">${r[0]}</td><td>${r[1]}</td><td class="money${r[2]<0?' neg':''}">${r[2]<0?'(':''}${money(Math.abs(r[2]))}${r[2]<0?')':''}</td><td class="money${prev<0?' neg':''}">${prev<0?'(':''}${money(Math.abs(prev))}${prev<0?')':''}</td><td class="money">${ch>0?'+':''}${ch}%</td></tr>`}).join('')}</tbody><tfoot><tr><td></td><td>Net income</td><td class="money">${money(net)}</td><td class="money">${money(Math.round(net*.94))}</td><td></td></tr></tfoot></table></div>`}
    case 'erp':return `<div class="ds-tablewrap"><table class="ds-table"><caption class="ds-sr">Inventory transactions</caption><thead><tr><th scope="col">Doc</th><th scope="col">Type</th><th scope="col">Item</th><th scope="col">Warehouse</th><th scope="col" class="num">Qty</th><th scope="col">Posted</th><th scope="col">Status</th></tr></thead><tbody>${[['GR-7712','Goods receipt','Laptop 14"','WH-3 Lisbon','+48','Oct 19','Posted','success'],['TR-3301','Transfer','Docking station','WH-3 → WH-1','−12','Oct 19','In transit','info'],['SO-5512','Delivery','Monitor 27"','WH-1 Porto','−6','Oct 18','Posted','success'],['ADJ-118','Adjustment','USB-C cable','WH-3 Lisbon','−3','Oct 18','Needs approval','warning'],['GR-7709','Goods receipt','Headset','WH-2 Faro','+120','Oct 17','Posted','success']].map(r=>`<tr><td class="ds-mono"><a class="ds-link" href="#">${r[0]}</a></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td class="num ${r[4].startsWith('−')?'neg':''}">${r[4]}</td><td>${r[5]}</td><td>${BADGE(r[6],r[7],{sz:'s'})}</td></tr>`).join('')}</tbody></table></div>`;
    default:return T(head(cols)+body());
  }
}
function tblInit(st,o,k){
  const box=st;
  const ts=box.querySelector('[data-ts]');if(ts){const inp=ts.querySelector('input');inp.addEventListener('input',()=>{const q=inp.value.toLowerCase();let n=0;$$('tbody tr',ts).forEach(r=>{const hit=r.textContent.toLowerCase().includes(q);r.hidden=!hit;if(hit)n++});ts.querySelector('[data-ts-count]').textContent=`${n} order${n===1?'':'s'}`})}
  const tf=box.querySelector('[data-tf]');if(tf)tf.addEventListener('input',()=>{const fs=$$('[data-fcol]',tf).map(i=>[+i.dataset.fcol,i.value.toLowerCase()]);$$('tbody tr:not(.tb-filter)',tf).forEach(r=>{r.hidden=!fs.every(([c,v])=>!v||r.cells[c].textContent.toLowerCase().includes(v))})});
  const sel=box.querySelector('[data-tsel]');if(sel){const all=sel.querySelector('[data-all]');const rows=()=>$$('[data-row]',sel);const sync=()=>{const n=rows().filter(c=>c.checked).length;all.checked=n&&n===rows().length;all.indeterminate=n>0&&n<rows().length;sel.querySelector('[data-count]').textContent=n?`${n} selected`:'No orders selected';$$('[data-bulk]',sel).forEach(b=>b.disabled=!n);rows().forEach(c=>c.closest('tr').setAttribute('aria-selected',String(c.checked)))};sel.addEventListener('change',e=>{if(e.target===all)rows().forEach(c=>c.checked=all.checked);sync()});sel.addEventListener('click',e=>{if(e.target.closest('[data-bulk]'))toast(k,{title:e.target.closest('[data-bulk]').textContent.trim()+' · '+rows().filter(c=>c.checked).length+' orders',v:'success'})})}
  const ex=box.querySelector('[data-texp]');if(ex)ex.addEventListener('click',e=>{const b=e.target.closest('[data-exp]');if(!b)return;const tr=b.closest('tr');const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));if(open){const p=PO[+b.dataset.exp];tr.insertAdjacentHTML('afterend',`<tr class="tb-detail"><td></td><td colspan="${tr.cells.length-1}">${kv([['Lines','1 · '+p.item],['Requested by',p.owner],['Delivery','Nov 14 · WH-3 Lisbon'],['Approval',p.status[0]]])}</td></tr>`)}else tr.nextElementSibling?.classList.contains('tb-detail')&&tr.nextElementSibling.remove()});
  const ed=box.querySelector('[data-tedit]');if(ed){const edit=td=>{if(td.querySelector('input'))return;const old=td.textContent;td.innerHTML=`<input class="ds-cell-edit" value="${esc(old)}" aria-label="Edit item">`;const i=td.firstChild;i.focus();i.select();const done=sv=>{td.textContent=sv?i.value.trim()||old:old;td.focus();if(sv&&i.value.trim()!==old)toast(k,{title:'Line updated',v:'success',text:td.textContent})};i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();done(true)}if(e.key==='Escape'){e.stopPropagation();done(false)}});i.addEventListener('blur',()=>{if(td.contains(i))done(true)})};ed.addEventListener('dblclick',e=>{const td=e.target.closest('.ds-editable');if(td)edit(td)});ed.addEventListener('keydown',e=>{const td=e.target.closest&&e.target.closest('.ds-editable');if(td&&e.target===td&&(e.key==='Enter'||e.key==='F2')){e.preventDefault();edit(td)}})}
  const inf=box.querySelector('[data-tinf]');if(inf){const sc=inf.querySelector('.tb-scroll');let page=1;sc.addEventListener('scroll',()=>{if(page>=4)return;if(sc.scrollTop+sc.clientHeight>=sc.scrollHeight-20){page++;const tb=sc.querySelector('tbody');PO.forEach((p,i)=>tb.insertAdjacentHTML('beforeend',`<tr>${poRow({...p,no:p.no.replace(/\d+$/,d=>+d-page*10)},o,i).map((c,j)=>`<td${j===5?' class="money"':''}>${c}</td>`).join('')}</tr>`));if(page>=4)sc.querySelector('[data-more]').textContent='All 20 orders loaded'}})}
  const er=box.querySelector('[data-terr]');if(er)er.addEventListener('click',e=>{if(e.target.closest('[data-retry]')){const b=e.target.closest('[data-retry]');b.setAttribute('aria-busy','true');setTimeout(()=>{er.innerHTML=tblRender({...o,variant:'basic'},k)},900)}});
}
spec({id:'components/tables',title:'Tables',noun:'Table',icon:'table',group:'Data Display',cls:['ds-table','ds-tablewrap','ds-sort'],wideAll:true,min:{all:'600px'},
  desc:'Show records in rows and columns so users can scan, compare, sort and act on them.',
  dims:{variant:[['basic','Basic'],['dense','Dense','Power users scanning many rows.'],['comfortable','Comfortable','Occasional users, touch.'],['striped','Striped','Wide rows that are hard to follow.'],['borderless','Borderless','Read-only summaries.'],['sortable','Sortable'],['filterable','Filterable (column filters)'],['searchable','Searchable'],['selectable','Selectable (multi-select)'],['bulk','Bulk actions'],['expandable','Expandable rows'],['nested','Nested rows'],['grouped','Grouped rows'],['inline','Inline edit'],['sticky','Sticky header'],['stickycol','Sticky first column'],['pagination','Pagination'],['infinite','Infinite scroll'],['empty','Empty state'],['loading','Loading'],['error','Error'],['readonly','Read-only'],['financial','Financial table'],['erp','ERP transaction table']],
    content:[['text','Text cells'],['avatar','Avatar + name'],['progress','Progress cells'],['actions','Row actions']]},
  def:{variant:'basic',content:'text'},recommend:{variant:'sortable'},colors:false,sizes:false,
  na:{size:'Tables scale through density (see Layout variants) rather than size.',color:'Colour appears only in status badges and negative numbers.',icon:'Icons appear inside cells and row actions (see Content variants).',state:'Table states (empty, loading, error) are shown in Basic variants.'},
  render:tblRender,initCard:tblInit,
  anatomy:[['Wrapper','.ds-tablewrap','Scroll container'],['Header cell','th','Sort button inside'],['Row','tr','Hover and selection'],['Cell','td','Text, badge, avatar, number'],['Footer','tfoot','Totals'],['Toolbar','.ds-tbar','Selection and bulk actions']],
  cases:[{t:'Accounts payable aging',area:'Finance',d:'Money right-aligned, overdue in words and colour.',html:k=>TBL(['Vendor',['Current','money'],['1–30','money'],['31–60','money'],['60+','money'],['Total','money']],[['Northwind Supplies','$12,400.00','$3,100.00','—','—','$15,500.00'],['Contoso Freight','$4,250.00','—','$1,900.00','—','$6,150.00'],['Litware Labs','—','—','—','<span class="neg">$8,400.00</span>','<span class="neg">$8,400.00</span>']],{foot:['Total','$16,650.00','$3,100.00','$1,900.00','$8,400.00','$30,050.00'],caption:'Aging'})},
    {t:'Leads queue',area:'CRM',d:'Selectable rows for assignment.',html:k=>tblRender({variant:'bulk',content:'text'},k)}],
  a11y:{aria:'Native table with caption and th scope; sortable headers are buttons and aria-sort sits on th; selection uses labelled checkboxes.',keyboard:'Tab through interactive cells; Enter sorts; Space toggles row selection; Enter / F2 edits an editable cell.'},
  keys:[['Tab','Next interactive cell'],['Enter','Sort or edit'],['Space','Select row'],['Esc','Cancel edit']],
  do:['Right-align numbers and use tabular figures','Keep the first column as the record identifier'],dont:['Put more than two actions per row inline','Use tables for layout'],
  props:[['columns','{ key, label, align?, sortable?, width? }[]','—','Column model'],['rows','Row[]','—','Data'],['density','comfortable | compact | dense','comfortable','Row height'],['selection','none | single | multiple','none','Selection'],['sort','{ key, dir }','—','Sort state'],['stickyHeader','boolean','false','Keeps header visible'],['emptyState','ReactNode','—','Shown when no rows'],['loading','boolean','false','Skeleton rows']],
  matrix:[['Sortable + paginated','Most ERP lists','Predictable, fast','Pagination interrupts scanning',1],['Dense','Power users','More rows per screen','Harder on touch',0],['Bulk actions','Queues, approvals','Act on many','Selection state to manage',1],['Expandable','Lines under headers','Detail on demand','Hidden content',0],['Inline edit','Quick corrections','No dialog','Validation is harder',0],['Infinite scroll','Feeds, logs','Continuous','Loses position and footer',0]],
  rec:{v:'Sortable table with pagination and row selection where actions exist',why:'Sorting and paging cover most ERP list tasks; selection with bulk actions handles queues without inline clutter.'},
  decide:[['Large ERP list','Sortable + paginated + filters','Predictable navigation'],['Approval queue','Selectable + bulk actions','Act on many at once'],['Orders with lines','Expandable or nested rows','Detail without leaving the list'],['Quick corrections','Inline edit','No dialog round-trip'],['Financial statements','Financial table with totals','Right-aligned figures, negatives in brackets']],
  resp:{desktop:'All columns.',tablet:'Hide secondary columns; horizontal scroll inside the wrapper.',mobile:'Scroll inside the wrapper or switch to a list of cards for the key fields.'},
  searchExtra:[['Expandable rows','v-basic-expandable'],['Inline edit table','v-basic-inline'],['Sticky header table','v-basic-sticky'],['Financial table','v-basic-financial'],['Bulk actions','v-basic-bulk'],['Infinite scroll table','v-basic-infinite']]
});

/* ---------------- DATA GRID ---------------- */
const legacy=id=>PAGES.find(p=>p.id===id);
function gridRender(o,k){
  if(o.variant==='editable')return legacy('data-grid').demo(k);
  if(o.variant==='frozen')return tblRender({variant:'stickycol',content:'text'},k);
  if(o.variant==='grouped')return tblRender({variant:'grouped',content:'text'},k);
  if(o.variant==='cells')return `<div class="ds-tablewrap"><table class="ds-table"><caption class="ds-sr">Cell types</caption><thead><tr><th scope="col">Text</th><th scope="col">Badge</th><th scope="col">Avatar</th><th scope="col">Progress</th><th scope="col" class="money">Currency</th><th scope="col">Date</th><th scope="col">Boolean</th></tr></thead><tbody>${PO.slice(0,4).map((p,i)=>`<tr><td>${p.no}</td><td>${BADGE(p.status[0],p.status[1],{sz:'s'})}</td><td><span class="ds-who">${AV(EMP[i].i,EMP[i].c,{sz:'s'})}${EMP[i].n}</span></td><td><div class="ds-prog ds-s"><div class="ds-prog__track"><div class="ds-prog__bar" style="--v:${[40,100,60,0][i]}%"></div></div></div></td><td class="money">${money(p.total)}</td><td>${p.date}</td><td>${i%2?ic('x'):ic('check')}</td></tr>`).join('')}</tbody></table></div>`;
  if(o.variant==='resize')return `<div class="ds-tablewrap" data-gres><table class="ds-table" style="table-layout:fixed"><caption class="ds-sr">Resizable columns</caption><thead><tr>${['PO','Vendor','Item','Total'].map((h,i)=>`<th scope="col" style="width:${[110,200,220,130][i]}px;position:relative">${h}<span role="separator" aria-orientation="vertical" aria-label="Resize ${h}" tabindex="0" data-col-res style="position:absolute;right:0;top:20%;bottom:20%;width:6px;cursor:col-resize;border-right:2px solid var(--bd)"></span></th>`).join('')}</tr></thead><tbody>${PO.map(p=>`<tr><td>${p.no}</td><td>${p.vendor}</td><td style="overflow:hidden;text-overflow:ellipsis">${p.item}</td><td class="money">${money(p.total)}</td></tr>`).join('')}</tbody></table></div>`;
  return tblRender({variant:'bulk',content:'avatar'},k);
}
spec({id:'components/data-grid',title:'Data Grid',noun:'Data grid',icon:'grid',group:'Data Display',cls:['ds-table','ds-tbar','ds-editable','ds-cell-edit'],wideAll:true,min:{all:'600px'},
  desc:'A spreadsheet-like table for heavy data work: editing, frozen columns, resizing, selection and aggregates.',
  dims:{variant:[['editable','Editable grid','Corrections and quick data entry.'],['selection','Selection + bulk','Queues and mass updates.'],['frozen','Frozen first column','Very wide records.'],['grouped','Grouped with aggregates','Totals by status or period.'],['cells','Cell types','Mixed data in one row.'],['resize','Resizable columns','User-controlled width.']]},
  def:{variant:'editable'},colors:false,sizes:false,
  na:{size:'Use density for grids.',color:'Colour is limited to statuses.',icon:'Icons live in cells.',state:'See Tables for empty, loading and error.',content:'See Cell types.'},
  render:gridRender,
  initCard(st,o,k){if(o.variant==='editable'){legacy('data-grid').init(st,k);return}tblInit(st,o,k);const g=st.querySelector('[data-gres]');if(g){g.addEventListener('pointerdown',e=>{const h=e.target.closest('[data-col-res]');if(!h)return;const th=h.parentElement;const x0=e.clientX,w0=th.offsetWidth;h.setPointerCapture(e.pointerId);const mv=ev=>th.style.width=Math.max(70,w0+ev.clientX-x0)+'px';h.addEventListener('pointermove',mv);h.addEventListener('pointerup',()=>h.removeEventListener('pointermove',mv),{once:true})});g.addEventListener('keydown',e=>{const h=e.target.closest('[data-col-res]');if(!h)return;const th=h.parentElement;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();th.style.width=Math.max(70,th.offsetWidth+(e.key==='ArrowRight'?20:-20))+'px'}})}},
  anatomy:[['Toolbar','.ds-tbar','Selection count and bulk actions'],['Header','th','Sort, resize handle'],['Editable cell','.ds-editable','Enter / double-click to edit'],['Cell editor','.ds-cell-edit','Inline input'],['Group row','.tb-group','Aggregates']],
  cases:[{t:'Price list maintenance',area:'ERP · Sales',d:'Editable grid for bulk price updates.',html:k=>legacy('data-grid').demo(k)}],
  a11y:{keyboard:'Space selects rows; Enter or F2 edits; Esc cancels; resize handles accept ← →.',aria:'Plain table semantics with labelled checkboxes; for full spreadsheet keyboard models use role="grid" with arrow-key cell navigation.'},
  keys:[['Enter / F2','Edit cell'],['Esc','Cancel'],['Space','Select row'],['← / →','Resize focused column handle']],
  props:[['columns','Column[]','—','With editable, frozen, width'],['editable','boolean | (row,col) => boolean','false','Edit permission'],['groupBy','string','—','Grouping key'],['aggregates','{ key: sum | avg | count }','—','Group totals'],['frozenColumns','number','0','Columns that stay visible']],
  matrix:[['Editable grid','Bulk corrections','Fast','Validation per cell',1],['Frozen column','Wide records','Keeps identity visible','Horizontal scroll',1],['Grouped + aggregates','Reporting lists','Totals in place','Sorting limited',0],['Resizable','Varied content','User control','Layout shifts',0]],
  rec:{v:'Editable grid with selection and a frozen identifier column',why:'Data-heavy ERP work needs in-place editing and a visible record key while scrolling wide rows.'},
  decide:[['Read and act on records','Table, not grid','Simpler'],['Edit many values quickly','Editable grid','No dialogs'],['20+ columns','Frozen first column','Keeps context']],
  resp:{desktop:'Full grid.',tablet:'Horizontal scroll with frozen first column.',mobile:'Offer a read-only list and edit in a form instead of a grid.'}
});

/* ---------------- PAGINATION ---------------- */
function pgRender(o,k){
  switch(o.variant){
    case 'simple':return `<nav class="ds-pager" aria-label="Pagination">${B('Previous',{icon:'chev-left',keep:1})}${B('Next',{v:'',attrs:''}).replace('<span>Next</span>','<span>Next</span>'+ic('chev-right'))}</nav>`;
    case 'compact':return `<nav class="ds-pager" aria-label="Pagination"><button type="button" class="ds-pg ds-pg--nav" aria-label="Previous page">${ic('chev-left')}</button><span class="ds-pager__info" style="margin:0 8px">Page 3 of 43</span><button type="button" class="ds-pg ds-pg--nav" aria-label="Next page">${ic('chev-right')}</button></nav>`;
    case 'size':return `<div class="ds-row" style="justify-content:space-between;gap:16px">${SEL({label:'Rows per page',options:['10','25','50','100'],sel:1,sz:'s'})}<span class="ds-faint ds-small" data-pager-out>Showing 51–75 of 1,068</span><nav class="ds-pager" aria-label="Pagination" data-total="43" data-items="1068" data-per="25" data-init-pg="3"></nav></div>`;
    case 'loadmore':return `<div class="ds-col" style="align-items:center"><span class="ds-faint ds-small">Showing 25 of 1,068 orders</span>${B('Load 25 more',{attrs:'data-ds="toast" data-title="25 more orders loaded"'})}</div>`;
    case 'jump':return `<div class="ds-row"><nav class="ds-pager" aria-label="Pagination" data-total="43" data-init-pg="3"></nav><label class="ds-row" style="gap:6px;font-size:var(--fs-s)">Go to page<span class="ds-control ds-s" style="width:64px"><input type="number" min="1" max="43" value="3" aria-label="Page number"></span></label></div>`;
    default:return `<div class="ds-col"><nav class="ds-pager" aria-label="Pagination" data-total="43" data-items="214" data-per="5" data-init-pg="${o.state==='first'?1:o.state==='last'?43:3}"></nav><span class="ds-faint ds-small" data-pager-out></span></div>`;
  }
}
spec({id:'components/pagination',title:'Pagination',noun:'Pagination',icon:'dots-h',group:'Navigation',cls:['ds-pager','ds-pg'],
  desc:'Move through large result sets page by page while keeping position and totals visible.',
  dims:{variant:[['numbered','Numbered'],['simple','Previous / next'],['compact','Compact (Page 3 of 43)'],['size','With page size'],['jump','With jump to page'],['loadmore','Load more']],state:[['middle','Middle page'],['first','First page'],['last','Last page']]},
  def:{variant:'numbered',state:'middle'},colors:false,
  render:pgRender,
  anatomy:[['Container','nav.ds-pager','aria-label'],['Page button','.ds-pg','aria-current on the active page'],['Ellipsis','.ds-pg-ell','Hidden from screen readers'],['Range text','[data-pager-out]','Live region']],
  cases:[{t:'Invoice list footer',area:'Finance',d:'Range text plus page size.',html:k=>pgRender({variant:'size'},k)}],
  a11y:{aria:'nav with aria-label; aria-current="page"; prev / next disabled at the ends; range announced politely.'},keys:[['Tab','Move between pages'],['Enter','Go to page']],
  props:[['page','number','1','Current page'],['total','number','—','Total pages'],['pageSize','number','25','Rows per page'],['onChange','(page) => void','—','Handler'],['variant','numbered | simple | compact','numbered','Style']],
  matrix:[['Numbered','Most lists','Jump to any page','Width',1],['Compact','Mobile, tight footers','Small','No jumping',1],['Load more','Feeds, catalogues','Continuous','No deep linking',0],['Page size','Power users','Control','More UI',0]],
  rec:{v:'Numbered with range text and page size on desktop; compact on mobile',why:'Users of ERP lists need to know where they are and how much is left.'},
  decide:[['Large ERP list','Numbered + size','Control and position'],['Mobile','Compact','Fits'],['Browsing feed','Load more','No page decision']],
  resp:{desktop:'Numbered with first / last.',tablet:'Fewer numbers around the current page.',mobile:'Compact “Page 3 of 43”.'},
  respExtra:[['Mobile compact',{variant:'compact'},'Arrows and text only.']]
});
DOCS['components/pagination'].render=(o,k)=>o.device==='mobile'&&o.variant==='numbered'?pgRender({...o,variant:'compact'},k):pgRender(o,k);

/* ---------------- BREADCRUMB ---------------- */
function bcRender(o,k){
  const items=['Procurement','Purchase orders','2026','PO-2291'];const icons=['home','folder','calendar','file'];
  const sep={chevron:"'\\203A'",slash:"'/'",arrow:"'\\2192'"}[o.variant];
  const style=sep?` style="--crumb-sep:${sep}"`:'';
  if(o.variant==='back')return `<a class="ds-link" href="#">${ic('chev-left')} Purchase orders</a>`;
  let list=items.map((t,i)=>i<items.length-1?`<li><a class="ds-crumb" href="#">${o.icon==='leading'?ic(icons[i])+' ':''}${t}</a></li>`:`<li><span aria-current="page">${o.icon==='leading'?ic(icons[i])+' ':''}${t}</span></li>`);
  if(o.variant==='collapsed'||o.device==='mobile')list=[list[0],`<li><button type="button" class="ds-btn ds-btn--subtle ds-ibtn ds-s" aria-label="Show 2 hidden levels">${ic('more')}</button></li>`,list[3]];
  if(o.variant==='dropdown'){const m=uid('bc');list[3]=`<li class="ds-anchor"><button type="button" class="ds-btn ds-btn--subtle ds-s" data-ds="menu" aria-haspopup="menu" aria-expanded="false" aria-controls="${m}" aria-current="page"><span>PO-2291</span>${ic('chev-down')}</button>${MENU(m,{items:[{l:'PO-2290'},{l:'PO-2287'},{l:'PO-2284'}],label:'Sibling orders'})}</li>`}
  return `<nav aria-label="Breadcrumb"><ol class="ds-crumbs"${style}>${list.join('')}</ol></nav>`;
}
spec({id:'components/breadcrumbs',title:'Breadcrumb',noun:'Breadcrumb',icon:'chev-right',group:'Navigation',cls:['ds-crumbs','ds-crumb'],
  desc:'Shows where a page sits in the hierarchy and links back to each parent.',
  dims:{variant:[['default','Language default'],['slash','Slash'],['chevron','Chevron'],['arrow','Arrow'],['collapsed','Collapsed middle'],['dropdown','Last level as switcher'],['back','Back link (mobile)']],icon:[['none','Text'],['leading','With icons']]},
  def:{variant:'default',icon:'none'},colors:false,
  render:bcRender,
  anatomy:[['Nav','nav[aria-label=Breadcrumb]',''],['List','ol.ds-crumbs',''],['Link','.ds-crumb',''],['Current','[aria-current=page]','Not a link'],['Separator','::before','Not read aloud']],
  cases:[{t:'Deep ERP record',area:'ERP',d:'Collapses the middle when the trail is long.',html:k=>scr('PO-2291','',kv([['Vendor','Northwind Supplies']]),{crumbs:['Procurement','Purchase orders','2026','Q4','PO-2291']})}],
  a11y:{aria:'nav aria-label="Breadcrumb", ordered list, aria-current="page"; separators are CSS so they are not announced.'},
  props:[['items','{ label, href }[]','—','Trail'],['maxItems','number','4','Collapse beyond'],['separator','slash | chevron','language','Separator']],
  matrix:[['Full trail','Desktop, 3–4 levels','Clear context','Width',1],['Collapsed','Deep hierarchies','Fits','Hidden levels',1],['Back link','Mobile','Simple','Only one level',1]],
  rec:{v:'Language default, collapsed after four levels, back link on mobile',why:'Users need the immediate parent most; long trails cost width.'},
  decide:[['Up to 4 levels','Full trail','Everything visible'],['Deeper','Collapsed middle','Keeps first and last'],['Mobile','Back link','One tap up']],
  resp:{desktop:'Full trail.',tablet:'Collapse middle levels.',mobile:'Single back link.'},respExtra:[['Mobile back link',{variant:'back'},'']]
});

/* ---------------- BADGE ---------------- */
const BCOL={primary:'info',secondary:'',success:'success',warning:'warning',danger:'danger',info:'info',neutral:'',custom:'new'};
function bdgRender(o,k){
  const v=BCOL[o.color]??'info';const z=o.size==='xs'||o.size==='s'?'s':o.size==='l'||o.size==='xl'?'l':'';
  const t={primary:'In progress',secondary:'Draft',success:'Approved',warning:'Pending',danger:'Rejected',info:'Submitted',neutral:'Archived',custom:'Beta'}[o.color]||'Submitted';
  switch(o.variant){
    case 'bold':return BADGE(t,v,{strong:1,sz:z});
    case 'outline':return `<span class="ds-badge${v?' ds-badge--'+v:''}${z?' ds-'+z:''}" style="background:transparent;box-shadow:inset 0 0 0 1px currentColor">${t}</span>`;
    case 'dot':return `<span class="ds-row" style="gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:var(--${{info:'inf',success:'ok',warning:'warn',danger:'err',new:'new','':'fg3'}[v]})"></span>${t}</span>`;
    case 'count':return `<span class="ds-row">${COUNT(o.content==='large'?'99+':12,{sz:z,alert:v==='danger'})}<span class="dx-bell">${IB('bell','Notifications, 3 unread')}${COUNT(3,{alert:1,sz:'s'})}</span></span>`;
    case 'icon':return `<span class="ds-badge${v?' ds-badge--'+v:''}${z?' ds-'+z:''}">${ic({success:'ok',warning:'warn',danger:'err'}[v]||'info')}${t}</span>`;
    default:return BADGE(t,v,{sz:z});
  }
}
spec({id:'components/badges',title:'Badge',noun:'Badge',icon:'tag',group:'Data Display',cls:['ds-badge'],colorSelf:true,
  desc:'Short labels for status, counts and categories.',
  dims:{variant:[['subtle','Subtle (lozenge)'],['bold','Bold'],['outline','Outline'],['dot','Dot + text'],['icon','Icon + text'],['count','Count']]},
  def:{variant:'subtle'},
  render:bdgRender,
  anatomy:[['Container','.ds-badge','Height --bdg-h'],['Dot / icon','.ds-dot / .ds-ic','Optional'],['Label','text','One or two words']],
  cases:[{t:'Order status column',area:'ERP',d:'Same status words everywhere.',html:k=>tblRender({variant:'basic',content:'text'},k)}],
  a11y:{aria:'Plain text; counts on icon buttons are part of the button name.',contrast:'Subtle badges use tinted backgrounds; text colour is checked against the tint, not the page.'},
  props:[['tone','info | success | warning | danger | neutral | new','neutral','Meaning'],['variant','subtle | bold | outline | dot','subtle','Emphasis'],['size','s | m | l','m','Size'],['count','number','—','Numeric badge']],
  matrix:[['Subtle','Status in tables','Calm','Low emphasis',1],['Bold','Critical states','Stands out','Noisy if repeated',0],['Dot','Dense lists, Apple-like','Minimal','Small target',0],['Count','Inbox, tabs','Compact','No meaning without context',1]],
  rec:{v:'Subtle lozenge with a status word',why:'Readable in dense tables without shouting; the word carries meaning when colour cannot.'},
  decide:[['Status in a list','Subtle','Calm, scannable'],['Blocking problem','Bold danger','Draws attention'],['Unread count','Count','Compact']],
  resp:{mobile:'Keep the same badges; avoid truncating status words.'}
});

/* ---------------- CHIPS ---------------- */
function chipRender(o,k){
  const s=o.state;const dis=s==='disabled'?' disabled':'';const cls=s==='hover'?' is-hover':s==='focus'?' is-focus':'';
  switch(o.variant){
    case 'choice':return `<div class="ds-row" role="radiogroup" aria-label="Period" data-ds="seg" style="gap:6px">${['Today','This week','This month'].map((t,i)=>`<button type="button" class="ds-chip${cls}" role="radio" aria-checked="${i===1}" aria-pressed="${i===1}"${dis}>${t}</button>`).join('')}</div>`;
    case 'input':return `<div class="ds-row" style="gap:6px">${['Northwind','Contoso','Fabrikam'].map(t=>`<span class="ds-tag">${o.icon==='leading'?ic('folder')+' ':''}${t}<button type="button" class="ds-tag__x" aria-label="Remove ${t}">${ic('x')}</button></span>`).join('')}</div>`;
    case 'assist':return `<div class="ds-row" style="gap:6px">${[['Add to calendar','calendar'],['Share','share'],['Duplicate','copy']].map(([t,i])=>`<button type="button" class="ds-chip${cls}"${dis}>${ic(i)}${t}</button>`).join('')}</div>`;
    case 'avatar':return `<div class="ds-row" style="gap:6px">${EMP.slice(0,3).map(e=>`<button type="button" class="ds-chip${cls}" aria-pressed="false"${dis} style="padding-left:3px">${AV(e.i,e.c,{sz:'s'}).replace('ds-av ','ds-av ds-av--chip ')}${e.n}</button>`).join('')}</div>`;
    default:return `<div class="ds-row" style="gap:6px" role="group" aria-label="Quick filters">${[['My orders',s==='selected'||true],['Awaiting approval',s==='selected'],['Over $10k',false]].map(([t,on])=>`<button type="button" class="ds-chip${cls}" aria-pressed="${!!on}"${dis}>${o.icon!=='none'?ic('check','ds-chip__tick'):''}${t}</button>`).join('')}</div>`;
  }
}
spec({id:'components/chips',title:'Chips',noun:'Chip',icon:'filter',group:'Data Display',cls:['ds-chip','ds-tag'],
  desc:'Compact elements for filters, choices, entered values and quick actions.',
  dims:{variant:[['filter','Filter (toggle)'],['choice','Choice (single)'],['input','Input (removable)'],['assist','Assist (action)'],['avatar','Avatar chip']],icon:[['tick','Check when selected'],['none','No icon'],['leading','Leading icon']],state:[['default','Default'],['hover','Hover'],['focus','Focus'],['selected','Selected'],['disabled','Disabled']]},
  def:{variant:'filter',icon:'tick',state:'default'},
  render:chipRender,
  anatomy:[['Container','.ds-chip','Pill or rounded'],['Check / icon','.ds-chip__tick',''],['Label','text',''],['Remove','.ds-tag__x','Input chips only']],
  cases:[{t:'Lead queue quick filters',area:'CRM',d:'Filter chips above a list.',html:k=>`<div class="ds-col">${chipRender({variant:'filter',icon:'tick',state:'default'},k)}${tblRender({variant:'basic',content:'text'},k)}</div>`}],
  a11y:{aria:'Filter chips are toggle buttons (aria-pressed); choice chips form a radiogroup; remove buttons are named.'},keys:[['Tab','Next chip'],['Space','Toggle']],
  props:[['variant','filter | choice | input | assist','filter','Behaviour'],['selected','boolean','false','State'],['onRemove','() => void','—','Input chips'],['icon','ReactNode','—','Leading icon']],
  matrix:[['Filter','Quick filters','Fast toggles','Limited options',1],['Choice','2–4 options','Visible choice','Not for many options',0],['Input','Entered values','Removable','Takes space',1]],
  rec:{v:'Filter chips with a check when selected',why:'The check shows selection without colour alone.'},
  decide:[['3–6 common filters','Filter chips','One tap'],['Many filters','Filter panel','Scales'],['Selected values in a field','Input chips','Removable']],
  resp:{mobile:'Scroll horizontally in one row.'}
});

/* ---------------- ALERTS ---------------- */
const ACOL={primary:'info',secondary:'info',success:'success',warning:'warning',danger:'error',info:'info',neutral:'info',custom:'new'};
const AMSG={info:['Sprint 42 starts tomorrow','Unestimated items move to the backlog at 09:00.'],success:['Payment received','INV-10432 was paid in full on Oct 20.'],warning:['Budget 92% used','Cost centre CC-410 has $6,880 left this quarter.'],error:['Posting failed','Journal JE-8812 is out of balance by $120.00.'],new:['New: bulk approvals','Approve up to 50 purchase orders at once.']};
function alertRender(o,k){
  const t=ACOL[o.color]||'info';const [ti,tx]=AMSG[t];const icn={info:'info',success:'ok',warning:'warn',error:'err',new:'sparkle'}[t];
  const acts=o.content==='action'?['View details']:o.content==='actions2'?['Fix now','Dismiss']:[];
  const noIcon=o.icon==='none';
  switch(o.variant){
    case 'banner':return `<div class="ds-banner${t==='error'?' ds-banner--error':t==='info'?' ds-banner--info':''}" role="${t==='error'?'alert':'status'}">${noIcon?'':ic(icn)}<span class="ds-banner__text">${ti}. ${tx}</span>${o.content==='action'?'<a href="#">Details</a>':''}${o.content!=='persistent'?IB('x','Dismiss',{sz:'s',attrs:'data-ds="dismiss"'}):''}</div>`;
    case 'toast':return `<div class="ds-toast ds-toast--${t==='new'?'info':t}" style="animation:none;max-width:400px">${noIcon?'':`<span class="ds-toast__ic">${ic(icn)}</span>`}<div class="ds-toast__body"><div class="ds-toast__title">${ti}</div>${o.content!=='title'?`<div class="ds-toast__text">${tx}</div>`:''}${acts.length?`<div class="ds-toast__acts">${acts.map(a=>`<button type="button" class="ds-btn ds-btn--link ds-s">${a}</button>`).join('')}</div>`:''}</div>${o.content!=='persistent'?`<button type="button" class="ds-btn ds-btn--subtle ds-ibtn ds-s" aria-label="Dismiss">${ic('x')}</button>`:''}</div>`;
    case 'snackbar':return `<div class="ds-snack-inline"><div class="ds-snack"><span>${ti}</span><button type="button" class="ds-snack__act">Undo</button></div></div>`;
    case 'inline':return `<p class="ds-help" style="color:var(--${{info:'inf',success:'ok',warning:'warn',error:'err',new:'new'}[t]});font-size:var(--fs)">${noIcon?'':ic(icn)}${tx}</p>`;
    default:{let h=ALERT(t==='new'?'new':t,icn,ti,o.content==='title'?'':tx,acts,{close:o.content!=='persistent'});if(noIcon)h=h.replace(/<span class="ds-alert__ic">[\s\S]*?<\/span>/,'');if(o.content==='title')h=h.replace('<p class="ds-alert__text"></p>','');return h}
  }
}
spec({id:'components/alerts',title:'Alerts',noun:'Alert',icon:'info',group:'Feedback',cls:['ds-alert','ds-banner','ds-toast','ds-snack'],colorSelf:true,
  desc:'Messages about system status or the result of an action: inline, section, banner, toast and snackbar.',
  dims:{variant:[['section','Section message','Context for a whole area.'],['inline','Inline','Next to one field or value.'],['banner','Banner','Page or app-wide condition.'],['toast','Toast','Confirms an action; disappears.'],['snackbar','Snackbar','One line with Undo.']],icon:[['with','With icon'],['none','Without icon']],content:[['text','Title + text'],['title','Title only'],['action','With action'],['actions2','Two actions'],['persistent','Persistent (no dismiss)']]},
  def:{variant:'section',icon:'with',content:'text'},sizes:false,
  na:{size:'Alerts use the body type size; emphasis comes from type and colour.'},
  leads:{color:'Colour maps to meaning: Primary and Info → information, Success, Warning, Danger → error, Custom → new feature.'},
  render:alertRender,
  anatomy:[['Container','.ds-alert','Tinted by tone'],['Icon','.ds-alert__ic','Shape differs per tone'],['Title','.ds-alert__title',''],['Text','.ds-alert__text',''],['Actions','.ds-alert__actions',''],['Dismiss','.ds-alert__close','']],
  cases:[{t:'Journal posting error',area:'Finance',d:'Section error above the form, inline error at the field.',html:k=>`<div class="ds-col">${alertRender({variant:'section',color:'danger',icon:'with',content:'action'},k)}${TF({label:'Credit total',val:'48,880.00',state:'error',help:'Must equal debit total (49,000.00)'})}</div>`},{t:'Maintenance window',area:'All modules',d:'Banner across the app.',html:k=>alertRender({variant:'banner',color:'warning',icon:'with',content:'action'},k)}],
  a11y:{aria:'Errors use role="alert"; others role="status"; toasts render into a live region and never steal focus.',error:'Each tone has its own icon shape and a title, so meaning survives without colour.'},
  props:[['tone','info | success | warning | error | new','info','Meaning'],['variant','section | inline | banner | toast | snackbar','section','Placement'],['title','string','—',''],['actions','Action[]','—',''],['dismissible','boolean','true','Shows close'],['duration','number','4500','Toast only']],
  matrix:[['Section','Explain a state of the page','Room for actions','Takes space',1],['Inline','Field-level','Precise','Easy to miss',1],['Banner','App-wide','Unmissable','Banner blindness',0],['Toast','Confirm success','Non-blocking','Disappears',1],['Snackbar','Undoable actions','Undo in place','One line only',0]],
  rec:{v:'Section message for page states, inline for fields, toast for confirmations',why:'Each placement matches the scope of the message; errors are never only toasts.'},
  decide:[['Field invalid','Inline error','Next to the problem'],['Several problems','Section message with list','Summary'],['Action succeeded','Toast','Non-blocking'],['Action can be undone','Snackbar','Undo'],['System-wide condition','Banner','Everyone sees it']],
  resp:{mobile:'Toasts span the width; banners wrap to two lines.'}
});

/* ---------------- PROGRESS ---------------- */
function prRender(o,k){
  const z=o.size==='xs'||o.size==='s'?' ds-s':o.size==='l'||o.size==='xl'?' ds-l':'';
  const lab=o.content!=='none';
  const head=lab?`<div class="ds-prog__head">Importing invoices <span>${o.state==='done'?'Done':'42%'}</span></div>`:'';
  const v=o.state==='done'?100:o.state==='error'?42:42;const cls=o.state==='error'?' ds-prog--error':o.state==='done'?' ds-prog--success':o.state==='paused'?' ds-prog--warning':'';
  const help=o.content==='detail'?`<span class="ds-prog__help">${o.state==='error'?'Stopped at row 539: invalid tax code':'539 of 1,284 records · about 1 min left'}</span>`:'';
  switch(o.variant){
    case 'indeterminate':return `<div class="ds-prog ds-prog--ind${z}">${lab?'<div class="ds-prog__head">Rebuilding search index</div>':''}<div class="ds-prog__track" role="progressbar" aria-label="Rebuilding search index"><div class="ds-prog__bar"></div></div></div>`;
    case 'segmented':return `<div class="ds-prog ds-prog--seg${z}">${lab?'<div class="ds-prog__head">Approval stages <span>2 of 4</span></div>':''}<div class="ds-prog__track" role="progressbar" aria-label="Approval stages" aria-valuenow="2" aria-valuemax="4">${[1,2,3,4].map(i=>`<i class="${i<=2?'on':''}"></i>`).join('')}</div></div>`;
    case 'buffer':return `<div class="ds-prog ds-prog--buffer${z}">${head}<div class="ds-prog__track" role="progressbar" aria-label="Uploading" aria-valuenow="42"><div class="ds-prog__buf" style="--b:70%"></div><div class="ds-prog__bar" style="--v:42%"></div></div></div>`;
    case 'ring':return `<span class="ds-ring" role="progressbar" aria-label="Sprint progress" aria-valuenow="${v}" style="--v:${v};--ring-s:${{xs:32,s:40,m:52,l:64,xl:80}[o.size]||52}px"><span>${v}%</span></span>`;
    case 'spinner':return `<div class="ds-row" style="gap:10px">${SPIN(z.trim()?z.trim().replace('ds-',''):'',{label:'Loading orders'})}${lab?'<span class="ds-muted">Loading orders…</span>':''}</div>`;
    case 'skeleton':return `<div class="ds-skel-card" aria-busy="true" aria-label="Loading"><span class="ds-skel ds-skel--circle"></span><div><span class="ds-skel ds-skel--line" style="--w:60%"></span><span class="ds-skel ds-skel--line"></span><span class="ds-skel ds-skel--line" style="--w:80%"></span></div></div>`;
    default:return `<div class="ds-prog${cls}${z}" data-prog-run>${head}<div class="ds-prog__track" role="progressbar" aria-label="Importing invoices" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v}"><div class="ds-prog__bar" style="--v:${v}%"></div></div>${help}</div>`;
  }
}
spec({id:'components/progress',title:'Progress',noun:'Progress',icon:'chart',group:'Feedback',cls:['ds-prog','ds-ring','ds-spin','ds-skel'],
  desc:'Shows that work is happening and, when known, how much is left. Includes loaders: spinners and skeletons.',
  dims:{variant:[['linear','Linear determinate'],['indeterminate','Indeterminate'],['segmented','Segmented'],['buffer','Buffer'],['ring','Circular'],['spinner','Spinner'],['skeleton','Skeleton']],state:[['running','Running'],['done','Complete'],['paused','Paused / warning'],['error','Error']],content:[['label','Label + percentage'],['detail','Label + detail'],['none','Bar only']]},
  def:{variant:'linear',state:'running',content:'detail'},
  render:prRender,
  anatomy:[['Track','.ds-prog__track','role=progressbar'],['Fill','.ds-prog__bar','Width = value'],['Label','.ds-prog__head',''],['Helper','.ds-prog__help','Remaining work']],
  cases:[{t:'Bank statement import',area:'Finance',d:'Determinate bar with records and time left.',html:k=>`<div class="ds-col">${prRender({variant:'linear',state:'running',content:'detail',size:'m'},k)}${B('Run import',{v:'primary',sz:'s',attrs:'data-ds="progress"'})}</div>`}],
  a11y:{aria:'role="progressbar" with aria-valuenow for determinate, none for indeterminate; skeleton regions use aria-busy.',motion:'Indeterminate animation stops under reduced motion; the label still says what is happening.'},
  props:[['value','number','—','0–100; omit for indeterminate'],['label','string','—','Visible label'],['tone','default | success | warning | error','default','State colour'],['size','s | m | l','m','Thickness']],
  matrix:[['Linear determinate','Imports, uploads','Shows time left','Needs a known total',1],['Indeterminate','Unknown duration','Honest','No estimate',1],['Spinner','Under 2 seconds','Small','Feels slower when long',0],['Skeleton','Page or list loading','Reduces layout shift','Only for known layouts',1]],
  rec:{v:'Linear determinate with label and detail',why:'Long enterprise jobs need an estimate and a way to tell which record failed.'},
  decide:[['Known total','Linear determinate','Estimate'],['Unknown duration','Indeterminate','Honest'],['Content loading','Skeleton','No layout jump'],['Short wait inside a button','Spinner','Local']],
  resp:{mobile:'Full-width bars; labels above.'}
});

/* ---------------- MODAL ---------------- */
function modalInner(o,k,stat){
  const tid=uid('mt');const w={small:'400px',medium:'',large:'720px',full:''}[o.variant]||'';
  const foot=(p,dang)=>`<div class="ds-dialog__foot">${B('Cancel',{v:k==='a'?'subtle':'',attrs:'data-close'})}${B(p,{v:dang?'danger':'primary',attrs:`data-close data-ok data-msg="${p}" data-text="Done." data-v="${dang?'warning':'success'}"`})}</div>`;
  let title='Edit purchase order',body=`<p>Change delivery details for PO-2291.</p>${TF({label:'Delivery date',val:'Nov 14, 2026',lead:'calendar'})}`,f=foot('Save'),icn='',cls='';
  switch(o.variant){
    case 'confirm':title='Submit PO-2291 for approval?';body='<p>Priya Nair and Finance will be notified.</p>';f=foot('Submit');break;
    case 'form':body=`<div class="fx fx--2">${TF({label:'Vendor',val:'Northwind Supplies',req:true})}${TF({label:'Total',val:'86,400',suffix:'USD'})}${TF({label:'Delivery date',val:'Nov 14, 2026',lead:'calendar'})}${TF({label:'Cost centre',val:'CC-410'})}</div>`;break;
    case 'wizard':title='New vendor';body=stRender({variant:'numbered',layout:'inline',icon:'check',scheme:'semantic',state:'active',content:'none'},k)+TF({label:'Legal name',val:'Adatum Parts Ltd'});f=`<div class="ds-dialog__foot">${B('Back')}${B('Continue',{v:'primary'})}</div>`;break;
    case 'warning':title='Budget will be exceeded';icn=ic('warn');cls='';body='<p>This order puts CC-410 $3,200 over budget. A finance override is required.</p>';f=foot('Request override');break;
    case 'destructive':title='Delete 3 purchase orders?';icn=ic('warn');cls=' ds-dialog--danger';body='<p>PO-2287, PO-2284 and PO-2280 will be permanently deleted. This can’t be undone.</p>';f=foot('Delete',1);break;
    case 'readonly':title='PO-2291';body=kv([['Vendor','Northwind Supplies'],['Total','$86,400.00'],['Status',BADGE('Approved','success')]]);f=`<div class="ds-dialog__foot">${B('Close',{attrs:'data-close'})}</div>`;break;
    case 'loading':body=`<div class="ds-skel-card" aria-busy="true"><div><span class="ds-skel ds-skel--line" style="--w:70%"></span><span class="ds-skel ds-skel--line"></span><span class="ds-skel ds-skel--block" style="--h:60px"></span></div></div>`;f=`<div class="ds-dialog__foot">${B('Cancel',{attrs:'data-close'})}${B('Save',{v:'primary',attrs:'aria-busy="true"'})}</div>`;break;
    case 'small':title='Rename view';body=TF({label:'Name',val:'My open orders'});break;
    case 'large':body=`<div class="fx fx--2">${TF({label:'Vendor',val:'Northwind Supplies'})}${TF({label:'PO number',val:'PO-2291'})}</div>${TBL(['Item',['Qty','num'],['Total','money']],[['Laptop 14"','48','$86,400.00']])}`;break;
  }
  return `<div class="ds-dialog${cls}${stat?' ds-dialog--static':''}${o.variant==='full'&&!stat?' ds-dialog--full':''}" role="${o.variant==='destructive'||o.variant==='warning'?'alertdialog':'dialog'}" aria-labelledby="${tid}"${w?` style="--dlg-w:${w}"`:''}><div class="ds-dialog__head">${icn?`<span class="ds-dialog__ic">${icn}</span>`:''}<h2 class="ds-dialog__title" id="${tid}">${title}</h2><button type="button" class="ds-btn ds-btn--subtle ds-ibtn ds-s ds-dialog__close" aria-label="Close" data-close>${ic('x')}</button></div><div class="ds-dialog__body">${body}</div>${f}</div>`;
}
spec({id:'components/modals',title:'Modal',noun:'Modal',icon:'window',group:'Overlays',cls:['ds-dialog','ds-backdrop','ds-layer'],min:{all:'360px'},
  desc:'A focused task that blocks the page until the user completes or cancels it.',
  dims:{variant:[['medium','Medium (default)'],['small','Small'],['large','Large'],['full','Full screen'],['confirm','Confirmation'],['form','Form modal'],['wizard','Wizard modal'],['warning','Warning'],['destructive','Destructive'],['readonly','Read-only'],['loading','Loading']]},
  def:{variant:'medium'},colors:false,sizes:false,na:{size:'Modal size is a variant: Small, Medium, Large, Full screen.',color:'Tone comes from Warning and Destructive variants.'},
  render:(o,k)=>{const t=uid('tpl');return `<div class="ds-col">${B('Open '+(o.variant==='medium'?'modal':o.variant+' modal'),{v:'primary',sz:'s',attrs:`data-ds="layer" data-tpl="${t}"`})}<template id="${t}">${modalInner(o,k,false)}</template>${modalInner(o,k,true)}</div>`},
  anatomy:[['Backdrop','.ds-backdrop','Blocks the page'],['Dialog','.ds-dialog','role=dialog / alertdialog'],['Title','.ds-dialog__title','aria-labelledby'],['Body','.ds-dialog__body',''],['Footer','.ds-dialog__foot','Primary + cancel'],['Close','.ds-dialog__close','Optional per language']],
  cases:[{t:'Approve with comment',area:'ERP · Procurement',d:'Confirmation with optional comment.',html:k=>modalInner({variant:'confirm'},k,true)},{t:'Delete vendor',area:'ERP',d:'Destructive confirmation names what will be lost.',html:k=>modalInner({variant:'destructive'},k,true)}],
  a11y:{aria:'role="dialog" (or alertdialog for destructive) with aria-modal and aria-labelledby.',keyboard:'Focus moves in, is trapped, Esc closes, focus returns to the trigger.',focus:'Initial focus on the first field, or on Cancel for destructive dialogs.'},
  keys:[['Tab','Cycle within the dialog'],['Esc','Close'],['Enter','Submit form modals']],
  do:['Name the action in the button: “Delete 3 orders”','Keep modals for short, focused tasks'],dont:['Open a modal from a modal','Put long multi-section forms in a modal'],
  props:[['open','boolean','false','Visibility'],['size','small | medium | large | full','medium','Width'],['tone','default | warning | danger','default','Intent'],['initialFocus','ref','first field','Focus target'],['onClose','() => void','—','Esc, backdrop, Cancel']],
  matrix:[['Medium','Most edits','Focused','Blocks context',1],['Confirmation','Irreversible steps','Prevents accidents','Friction',1],['Large / full','Complex sub-tasks','Room','Feels like a page',0],['Wizard modal','Short guided creation','Focus','Limited steps',0]],
  rec:{v:'Medium modal; Destructive confirmation for irreversible actions',why:'Short focused tasks keep context; destructive confirmations name the consequence.'},
  decide:[['Quick edit of a few fields','Medium modal','Context stays behind'],['Delete or cancel','Destructive confirmation','Safety'],['Long form','Full page or drawer','Room and URL'],['Compare with list','Drawer','List stays visible']],
  resp:{mobile:'Modals become full-screen sheets with actions at the bottom.'}
});

/* ---------------- DRAWER ---------------- */
function drawerInner(o,k,stat){
  const side={left:'left',right:'right',top:'top',bottom:'bottom'}[o.variant]||'right';const tid=uid('dr');
  let title='PO-2291 details',body=kv([['Vendor','Northwind Supplies'],['Total','$86,400.00'],['Status',BADGE('Awaiting approval','warning')]]),foot=`<div class="ds-drawer__foot">${B('Close',{attrs:'data-close'})}${B('Approve',{v:'primary',attrs:'data-close data-ok data-msg="Approved" data-text="PO-2291 approved."'})}</div>`;
  if(o.variant==='form'){title='Edit vendor';body=`${TF({label:'Legal name',val:'Northwind Supplies'})}${TF({label:'Payment terms',val:'Net 30'})}${TA({label:'Notes',rows:3})}`}
  if(o.variant==='filter'){title='Filters';body=`<fieldset class="ds-choices"><legend class="ds-label">Status</legend>${['Awaiting approval','Approved','Ordered','Rejected'].map((s,i)=>CHK(s,{checked:i<2})).join('')}</fieldset>${SEL({label:'Vendor',options:PO.map(p=>p.vendor),ph:'Any vendor'})}`;foot=`<div class="ds-drawer__foot">${B('Clear all',{v:'subtle'})}${B('Apply 2 filters',{v:'primary',attrs:'data-close'})}</div>`}
  if(o.variant==='action'){title='Bulk update';body=`<p class="ds-muted" style="margin:0">3 orders selected</p>${SEL({label:'Set status',options:['Approved','On hold','Cancelled'],sel:0})}`}
  return `<aside class="ds-drawer ds-drawer--${side}${o.variant==='compact'?' ds-drawer--compact':''}${o.variant==='full'?' ds-drawer--full':''}" role="dialog" aria-labelledby="${tid}"><div class="ds-drawer__head"><h2 id="${tid}">${title}</h2>${IB('x','Close',{sz:'s',attrs:'data-close'})}</div><div class="ds-drawer__body">${body}</div>${foot}</aside>`;
}
spec({id:'components/drawers',title:'Drawer',noun:'Drawer',icon:'panel',group:'Overlays',cls:['ds-drawer','ds-layer--drawer'],min:{all:'340px'},
  desc:'A panel that slides in from an edge for details, editing, filters or actions while the page stays in view.',
  dims:{variant:[['right','Right'],['left','Left'],['top','Top'],['bottom','Bottom'],['full','Full height, wide'],['compact','Compact'],['form','Form drawer'],['detail','Detail drawer'],['filter','Filter drawer'],['action','Action drawer']]},
  def:{variant:'right'},colors:false,sizes:false,na:{size:'Width is a variant: Compact, default, wide.',color:'Drawers use surface colours only.'},
  render:(o,k)=>{const t=uid('tpl');const pv=drawerInner(o,k,true);return `<div class="ds-col">${B('Open drawer',{v:'primary',sz:'s',attrs:`data-ds="layer" data-kind="drawer" data-tpl="${t}"`})}<template id="${t}">${drawerInner(o,k,false)}</template><div class="mini-vp" aria-hidden="true"><div class="mini-vp__page">${'<i></i>'.repeat(9)}</div><div class="mini-vp__shade"></div>${pv.replace('role="dialog"','')}</div></div>`},
  anatomy:[['Panel','.ds-drawer','Edge-attached'],['Header','.ds-drawer__head','Title + close'],['Body','.ds-drawer__body','Scrolls'],['Footer','.ds-drawer__foot','Actions']],
  cases:[{t:'Order list with detail drawer',area:'ERP · Sales',d:'Users compare rows without losing the list.',html:k=>`<div class="mini-vp" style="height:300px"><div style="position:absolute;inset:0;padding:10px">${tblRender({variant:'dense',content:'text'},k)}</div>${drawerInner({variant:'detail'},k,true)}</div>`}],
  a11y:{aria:'Same as modal: role="dialog", labelled, focus trapped, Esc closes.'},keys:[['Esc','Close'],['Tab','Cycle within']],
  props:[['side','left | right | top | bottom','right','Edge'],['size','compact | default | wide','default','Width'],['modal','boolean','true','Blocks the page'],['onClose','() => void','—','']],
  matrix:[['Right detail','Inspect a row','List stays visible','Narrow',1],['Filter drawer','Many filters on small screens','Room','Extra step',1],['Bottom','Mobile actions','Thumb reach','Small height',0],['Left','App navigation','Matches nav','Confused with nav',0]],
  rec:{v:'Right drawer for details and editing',why:'Reading order puts secondary context on the right; the list remains on the left.'},
  decide:[['Inspect or edit one row','Right drawer','Keeps list'],['Filters on mobile','Bottom or full drawer','Room'],['Global navigation','Left drawer','Matches sidebar']],
  resp:{mobile:'Drawers take the full width; bottom sheets for short actions.'}
});

/* ---------------- POPOVER ---------------- */
function popRender(o,k){
  const id=uid('pv');const pl=o.layout||'bottom';
  const content={info:`<h4>Payment terms</h4><p>Net 30 means payment is due 30 days after the invoice date.</p>`,edit:`<h4>Edit quantity</h4>${TF({label:'Quantity',val:'48',sz:'s',type:'number'})}<div class="ds-row" style="justify-content:flex-end">${B('Cancel',{v:'subtle',sz:'s',attrs:'data-pop-close'})}${B('Save',{v:'primary',sz:'s',attrs:'data-pop-close'})}</div>`,confirm:`<h4>Remove line?</h4><p>Laptop 14" × 48 will be removed.</p><div class="ds-row" style="justify-content:flex-end">${B('Keep',{v:'subtle',sz:'s',attrs:'data-pop-close'})}${B('Remove',{v:'danger',sz:'s',attrs:'data-pop-close'})}</div>`,user:`<div class="ds-row" style="gap:10px">${AV('PN',2,{pr:'on'})}<div><b>Priya Nair</b><p>Finance manager · Lisbon</p></div></div><div class="ds-row">${B('Message',{sz:'s'})}${B('Profile',{v:'subtle',sz:'s'})}</div>`}[o.variant];
  return `<div class="pop-demo"><div class="ds-anchor">${B(o.variant==='user'?'Priya Nair':o.variant==='edit'?'48':'Details',{sz:'s',icon:o.variant==='info'?'info':'',keep:1,attrs:`data-ds="pop" aria-haspopup="dialog" aria-expanded="true" aria-controls="${id}"`})}<div class="ds-popover pl-${pl}" id="${id}" role="dialog" aria-label="Popover">${content}</div></div></div>`;
}
spec({id:'components/popovers',title:'Popover',noun:'Popover',icon:'message',group:'Overlays',cls:['ds-popover'],
  desc:'Rich, interactive content anchored to a trigger. Closes on outside click or Esc.',
  dims:{variant:[['info','Information'],['edit','Inline edit'],['confirm','Confirmation'],['user','User card']],layout:[['bottom','Below'],['top','Above'],['right','Right'],['left','Left']]},
  def:{variant:'info',layout:'bottom'},colors:false,sizes:false,density:false,na:{size:'Popover width follows content (max 300px).',color:'Surface colour only.'},
  render:popRender,
  initCard(st){st.addEventListener('click',e=>{if(e.target.closest('[data-pop-close]')){const pop=e.target.closest('.ds-popover');closePop(st.querySelector(`[aria-controls="${pop.id}"]`),true)}})},
  anatomy:[['Trigger','[data-ds=pop]','aria-expanded'],['Surface','.ds-popover','role=dialog'],['Beak','::before','Per language'],['Content','h4, p, actions','']],
  cases:[{t:'Inline quantity edit',area:'ERP · Orders',d:'Edit one value without a modal.',html:k=>popRender({variant:'edit',layout:'bottom'},k)}],
  a11y:{aria:'Trigger has aria-expanded and aria-controls; popover is a labelled dialog.',keyboard:'Enter opens; Esc closes and returns focus.'},keys:[['Enter','Open'],['Esc','Close']],
  props:[['placement','top | bottom | left | right','bottom','Position'],['open','boolean','false',''],['trigger','click | focus','click','How it opens']],
  matrix:[['Information','Definitions, help','Stays open to read','Not for critical info',1],['Inline edit','One value','Fast','Single field only',1],['Confirmation','Low-risk confirms','Light','Not for destructive bulk',0]],
  rec:{v:'Click-triggered popover below the trigger',why:'Predictable placement and explicit opening suit interactive content.'},
  decide:[['Explain a term','Information popover or tooltip','Light'],['Edit one value','Inline edit popover','No modal'],['Delete many items','Modal, not popover','Needs weight']],
  resp:{mobile:'Becomes a bottom sheet.'}
});

/* ---------------- TOOLTIP ---------------- */
function tipRender(o,k){
  const pl=o.layout==='bottom'?' ds-tip--below':o.layout==='left'?' pl-left':o.layout==='right'?' pl-right':'';
  const id=uid('tp');const text={plain:'Duplicate order',shortcut:'Duplicate order<kbd>Ctrl D</kbd>',rich:'<b>Duplicate order</b>Creates a draft copy with the same lines.',disabled:'You need Approver rights to post'}[o.variant];
  const trig=o.variant==='disabled'?`<span tabindex="0" aria-describedby="${id}">${B('Post',{v:'primary',attrs:'disabled'})}</span>`:IB('copy','Duplicate order',{v:'default',attrs:`aria-describedby="${id}"`});
  return `<div class="tip-demo"><span class="ds-tipwrap">${trig}<span class="ds-tip${pl}${o.variant==='rich'?' ds-tip--rich':''}${o.state==='shown'?' is-shown':''}" role="tooltip" id="${id}">${text}</span></span></div>`;
}
spec({id:'components/tooltips',title:'Tooltip',noun:'Tooltip',icon:'info',group:'Overlays',cls:['ds-tip','ds-tipwrap'],
  desc:'A short label that explains an icon or control. Appears on hover and keyboard focus.',
  dims:{variant:[['plain','Plain'],['shortcut','With shortcut'],['rich','Rich (title + text)'],['disabled','On a disabled control']],layout:[['top','Top'],['bottom','Bottom'],['right','Right'],['left','Left']],state:[['shown','Shown'],['hidden','On hover / focus only']]},
  def:{variant:'plain',layout:'top',state:'shown'},colors:false,sizes:false,density:false,na:{size:'Tooltips use the language’s small type.',color:'Inverse or material surface only.'},
  render:tipRender,
  anatomy:[['Anchor','.ds-tipwrap',''],['Bubble','.ds-tip','role=tooltip'],['Beak','::after','Per language']],
  cases:[{t:'Toolbar icon buttons',area:'All modules',d:'Every icon-only button has a tooltip and a name.',html:k=>`<div class="tip-demo">${TIP(IB('edit','Edit'),'Edit',{kbd:'E'})}${TIP(IB('copy','Duplicate'),'Duplicate',{kbd:'Ctrl D'})}${TIP(IB('download','Export'),'Export CSV')}${TIP(IB('trash','Delete'),'Delete')}</div>`}],
  a11y:{aria:'role="tooltip" linked with aria-describedby; never the only place for essential information.',keyboard:'Shows on focus; Esc hides; stays while hovered (WCAG 1.4.13).',disabled:'Disabled buttons cannot take focus; wrap them in a focusable element so the reason can be read.'},keys:[['Tab','Show'],['Esc','Hide']],
  props:[['content','ReactNode','—','Text'],['placement','top | bottom | left | right','top',''],['delay','number','language','ms before showing'],['shortcut','string','—','Keyboard hint']],
  matrix:[['Plain','Icon buttons','Light','Short text only',1],['Shortcut','Power users','Teaches shortcuts','—',1],['Rich','Short explanations','More context','Use popover for actions',0],['On disabled','Explain why unavailable','Reduces confusion','Needs focusable wrapper',1]],
  rec:{v:'Plain tooltip above, with shortcut where one exists',why:'Short and predictable; shortcuts help power users.'},
  decide:[['Name an icon button','Plain tooltip','Required'],['Explain a disabled action','Tooltip on wrapper','Says why'],['Interactive content','Popover','Tooltips can’t hold actions']],
  resp:{mobile:'No hover: show the label as text or use a popover on tap.'}
});
