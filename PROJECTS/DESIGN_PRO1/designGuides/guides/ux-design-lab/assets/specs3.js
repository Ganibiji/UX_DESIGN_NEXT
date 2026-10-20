'use strict';
/* =====================================================================
   COMPONENT SPECS 3 — Dropdown, Menu, Date Picker, Time Picker, Calendar,
   File Upload, Search, Filters, Command Bar, Timeline, Tree View, Kanban,
   Wizard, Empty State, Notifications, Avatar, Charts, Rich Text Editor
   ===================================================================== */
const S3=(o)=>Object.assign({colors:false,sizes:true},o);
const minH=h=>`<div style="min-height:${h}px">`;

/* ---------------- DROPDOWN ---------------- */
function ddRender(o,k){
  const st0=o.state;const vendors=PO.map(p=>({l:p.vendor,d:'Net 30 · Portugal'}));
  switch(o.variant){
    case 'search':{const id=uid('cb'),lid=id+'-lb';return minH(300)+`<div class="ds-field"><label class="ds-label" for="${id}">Vendor</label><div class="ds-anchor ds-block"><div class="ds-control">${ic('search')}<input id="${id}" role="combobox" data-ds="combo" data-open-on-focus aria-autocomplete="list" aria-expanded="false" aria-controls="${lid}" placeholder="Search vendors" autocomplete="off"></div><div class="ds-pop" id="${lid}" role="listbox" hidden>${vendors.map(v=>`<div class="ds-opt" role="option" aria-selected="false" data-label="${v.l}"><span class="ds-opt__main"><span class="ds-opt__label">${v.l}</span><span class="ds-opt__desc">${v.d}</span></span>${ic('check','ds-opt__tick')}</div>`).join('')}</div></div></div></div>`}
    case 'multi':return minH(300)+PAGES.find(p=>p.id==='multi-select').demo(k).replace(/min-height:300px/,'')+'</div>';
    case 'grouped':return minH(320)+SEL({label:'Account',options:[{l:'4000 · Revenue',d:'Income'},{l:'4100 · Services',d:'Income'},{l:'5000 · Cost of goods',d:'Expense'},{l:'6100 · Salaries',d:'Expense'}],sel:0,state:st0})+'</div>';
    case 'avatar':{const id=uid('as'),lid=id+'-lb';return minH(300)+`<div class="ds-field"><span class="ds-label" id="${id}-l">Approver</span><div class="ds-anchor ds-block"><button type="button" class="ds-control ds-select" data-ds="select" aria-haspopup="listbox" aria-expanded="false" aria-controls="${lid}" aria-labelledby="${id}-l">${AV('PN',2,{sz:'s'})}<span class="ds-val">Priya Nair</span>${ic('chev-down','ds-chev')}</button><div class="ds-pop" id="${lid}" role="listbox" hidden>${EMP.map((e,i)=>`<div class="ds-opt" role="option" aria-selected="${i===4}" data-label="${e.n}">${AV(e.i,e.c,{sz:'s'})}<span class="ds-opt__main"><span class="ds-opt__label">${e.n}</span><span class="ds-opt__desc">${e.r}</span></span>${ic('check','ds-opt__tick')}</div>`).join('')}</div></div></div></div>`}
    case 'button':{const m=uid('dd');return minH(320)+`<div class="ds-anchor">${B('Actions',{chev:1,attrs:`data-ds="menu" aria-haspopup="menu" aria-expanded="false" aria-controls="${m}"`})}${MENU(m)}</div></div>`}
    default:return minH(280)+SEL({label:'Status',options:[{l:'Draft',dot:''},{l:'Awaiting approval',dot:'warning'},{l:'Approved',dot:'success'},{l:'Ordered',dot:'info'},{l:'Rejected',dot:'danger'}],sel:st0==='error'?-1:1,state:st0,ph:'Choose a status',help:st0==='error'?'Status is required':''})+'</div>';
  }
}
spec(S3({id:'components/dropdowns',title:'Dropdown',noun:'Dropdown',icon:'chev-down',group:'Forms',cls:['ds-select','ds-pop','ds-opt'],
  desc:'Choose one or more values from a list, or open a list of actions.',
  dims:{variant:[['single','Single select'],['search','Searchable (combobox)'],['multi','Multi-select'],['grouped','With descriptions'],['avatar','With avatars'],['button','Action dropdown']],state:[['default','Default'],['hover','Hover'],['focus','Focus'],['disabled','Disabled'],['error','Error']]},
  def:{variant:'single',state:'default'},min:{all:'320px'},
  render:ddRender,
  anatomy:[['Trigger','.ds-select / input[role=combobox]',''],['Popup','.ds-pop','role=listbox or menu'],['Option','.ds-opt','aria-selected'],['Tick','.ds-opt__tick','']],
  cases:[{t:'Assign approver',area:'ERP',d:'People picker with role descriptions.',html:k=>ddRender({variant:'avatar',state:'default'},k)}],
  a11y:{aria:'Select-only: button + listbox with aria-activedescendant; searchable: combobox with aria-autocomplete="list".',keyboard:'↓ opens; ↑ ↓ move; Enter chooses; Esc closes.'},keys:KEYS.list,
  props:[['options','{ label, value, description? }[]','—',''],['value','string | string[]','—',''],['multiple','boolean','false',''],['searchable','boolean','false','Combobox'],['placeholder','string','Select…','']],
  matrix:[['Single select','Under ~15 options','Simple','Slow for long lists',1],['Searchable','Long lists (vendors, accounts)','Fast lookup','Needs typing',1],['Multi','Labels, recipients','Many values','Chips take space',0],['Radio group','2–5 options','All visible','Width',0]],
  rec:{v:'Single select for short lists; searchable for master data',why:'Vendors, customers and accounts number in the thousands; search is the only practical way in.'},
  decide:[['2–5 options','Radio buttons','All visible'],['6–15 options','Single select','Compact'],['Master data','Searchable combobox','Scale'],['Actions, not values','Action dropdown (menu)','Different semantics']],
  resp:{mobile:'Popups open full width; long lists become a full-screen picker.'}
}));

/* ---------------- MENU ---------------- */
function menuRender(o,k){
  const items={basic:[{l:'Edit'},{l:'Duplicate'},{l:'Archive'}],icons:[{l:'Edit',ic:'edit'},{l:'Duplicate',ic:'copy'},{l:'Export',ic:'download'}],shortcuts:[{l:'Edit',ic:'edit',kbd:'E'},{l:'Duplicate',ic:'copy',kbd:'Ctrl D'},{l:'Export',ic:'download',kbd:'Ctrl E'}],sections:MENU_ITEMS,check:[{h:'Columns'},{l:'Vendor',check:1,on:1},{l:'Owner',check:1,on:1},{l:'Cost centre',check:1}],nested:[{l:'Move to…',ic:'folder',sub:1},{l:'Change status',ic:'flag',sub:1},{l:'Copy link',ic:'link'}],destructive:[{l:'Edit',ic:'edit'},{sep:1},{l:'Cancel order',ic:'x',danger:1},{l:'Delete',ic:'trash',danger:1}]}[o.variant]||MENU_ITEMS;
  if(o.variant==='context')return PAGES.find(p=>p.id==='context-menu').demo(k);
  return MENU(uid('mn'),{stat:1,items});
}
spec(S3({id:'components/menus',title:'Menu',noun:'Menu',icon:'list',group:'Navigation',cls:['ds-pop','ds-opt','ds-menu__head','ds-menu__sep'],sizes:true,
  desc:'A list of actions. Supports icons, shortcuts, sections, toggles, submenus and destructive items.',
  dims:{variant:[['basic','Basic'],['icons','With icons'],['shortcuts','With shortcuts'],['sections','Sections'],['check','Checkable items'],['nested','With submenus'],['destructive','Destructive group'],['context','Context menu']]},
  def:{variant:'sections'},
  render:menuRender,
  anatomy:[['Surface','.ds-pop','role=menu'],['Item','.ds-opt','menuitem / menuitemcheckbox'],['Section header','.ds-menu__head',''],['Separator','.ds-menu__sep',''],['Shortcut','kbd','']],
  cases:[{t:'Row actions on a sales order',area:'ERP · Sales',d:'Destructive actions grouped last.',html:k=>menuRender({variant:'sections'},k)}],
  a11y:{aria:'role="menu" with menuitem / menuitemcheckbox; disabled items use aria-disabled.',keyboard:'↑ ↓ move; Enter activates; Esc closes and returns focus.'},keys:KEYS.menu,
  props:[['items','MenuItem[]','—',''],['trigger','ReactNode','—',''],['placement','bottom-start | bottom-end','bottom-start','']],
  matrix:[['With icons','Frequent actions','Faster recognition','Icons need meaning',1],['Shortcuts','Power users','Teaches keys','Width',1],['Nested','Large action sets','Organised','Harder to reach',0]],
  rec:{v:'Sections with icons and shortcuts; destructive last',why:'Grouping and ordering reduce mis-clicks; shortcuts teach speed.'},
  decide:[['3–7 actions','Basic or icons','Simple'],['Many actions','Sections','Scannable'],['Toggle visibility','Checkable items','State visible']],
  resp:{mobile:'Menus open as bottom sheets with 44px rows.'}
}));

/* ---------------- DATE PICKER ---------------- */
spec(S3({id:'components/date-picker',title:'Date Picker',noun:'Date picker',icon:'calendar',group:'Forms',cls:['ds-cal','ds-day'],min:{all:'340px'},
  desc:'Pick a date from a calendar, or type it. Supports inline calendars, ranges, presets and disabled dates.',
  dims:{variant:[['popover','Field + popover'],['inline','Inline calendar'],['range','Date range'],['presets','Range with presets'],['typed','Typed input']],state:[['default','Default'],['focus','Focus'],['disabled','Disabled'],['error','Error']]},
  def:{variant:'popover',state:'default'},
  render:(o,k)=>{switch(o.variant){
    case 'inline':return `<div class="ds-cal" data-mode="single" data-init="5" style="background:var(--bg);border-radius:var(--r-l);box-shadow:var(--sh-1)"></div>`;
    case 'range':return minH(440)+DATE({label:'Delivery window',range:1,init:6,state:o.state})+'</div>';
    case 'presets':return PAGES.find(p=>p.id==='date-range').demo(k);
    case 'typed':return TF({label:'Invoice date',val:'10/20/2026',lead:'calendar',help:'MM/DD/YYYY',state:o.state});
    default:return minH(440)+DATE({label:'Delivery date',init:o.state==='error'?null:5,state:o.state,help:o.state==='error'?'Choose a delivery date':'Business days only'})+'</div>';}},
  anatomy:[['Field','.ds-control','Shows formatted date'],['Popover','.ds-pop[role=dialog]',''],['Calendar','.ds-cal',''],['Day','.ds-day','aria-selected'],['Footer','.ds-cal__foot','Today / Clear']],
  cases:[{t:'Purchase order delivery date',area:'ERP',d:'Field with popover inside a form.',html:k=>`<div class="fx fx--2" style="min-height:440px">${TF({label:'Vendor',val:'Northwind Supplies'})}${DATE({label:'Delivery date',init:5})}</div>`}],
  a11y:{keyboard:'Arrows move by day / week; Page Up / Down by month; Enter picks; Esc closes.',aria:'Popover is a labelled dialog; days are buttons with full spoken dates.'},keys:[['← → ↑ ↓','Move'],['Page Up / Down','Month'],['Enter','Pick'],['Esc','Close']],
  props:[['value','Date','—',''],['min / max','Date','—','Range limits'],['disabledDates','(d) => boolean','—',''],['mode','single | range','single',''],['format','string','locale','']],
  matrix:[['Field + popover','Forms','Compact','Two steps',1],['Typed','Known dates (invoices)','Fast for experts','Format errors',1],['Inline','Scheduling','Always visible','Space',0],['Range + presets','Reports','Common ranges in one click','More UI',1]],
  rec:{v:'Field with popover, typed entry allowed',why:'Experts type; others browse; both work in one control.'},
  decide:[['Form date','Field + popover','Compact'],['Report period','Range + presets','Speed'],['Scheduling view','Inline calendar','Context']],
  resp:{mobile:'Popover becomes a full-width sheet; native date input is acceptable.'}
}));

/* ---------------- TIME PICKER ---------------- */
const T15=[];for(let h=8;h<=12;h++)for(const m of [0,15,30,45])T15.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
spec(S3({id:'components/time-picker',title:'Time Picker',noun:'Time picker',icon:'clock',group:'Forms',cls:['ds-times','ds-select'],min:{all:'320px'},
  desc:'Choose a time from fixed intervals or type it, in 12- or 24-hour format.',
  dims:{variant:[['list30','30-minute list'],['list15','15-minute list, 24h'],['typed','Typed with format'],['range','Time range']],state:[['default','Default'],['focus','Focus'],['disabled','Disabled'],['error','Error']]},
  def:{variant:'list30',state:'default'},
  render:(o,k)=>{switch(o.variant){
    case 'list15':return minH(280)+SEL({label:'Shift start',options:T15,sel:4,lead:'clock',listCls:'ds-times',state:o.state})+'</div>';
    case 'typed':return TF({label:'Meeting time',val:o.state==='error'?'25:10':'14:30',lead:'clock',state:o.state,help:o.state==='error'?'Enter a time between 00:00 and 23:59':'24-hour, HH:MM'});
    case 'range':return minH(280)+`<div class="fx fx--2">${SEL({label:'From',options:TIMES,sel:2,lead:'clock',listCls:'ds-times'})}${SEL({label:'To',options:TIMES,sel:6,lead:'clock',listCls:'ds-times'})}</div></div>`;
    default:return minH(280)+SEL({label:'Pickup time',options:TIMES,sel:o.state==='error'?-1:3,ph:'Choose a time',lead:'clock',listCls:'ds-times',state:o.state,help:o.state==='error'?'Pickup time is required':''})+'</div>';}},
  anatomy:[['Trigger','.ds-select',''],['List','.ds-times','role=listbox']],
  cases:[{t:'Warehouse pickup slot',area:'ERP · Logistics',d:'Fixed slots match dock capacity.',html:k=>minH(280)+SEL({label:'Pickup slot',options:TIMES,sel:3,lead:'clock',listCls:'ds-times'})+'</div>'}],
  keys:KEYS.list,a11y:{aria:'Listbox pattern; typed variant validates format and range.'},
  props:[['value','string','—','HH:MM'],['step','number','30','Minutes'],['format','12h | 24h','locale','']],
  matrix:[['List','Booking slots','No invalid times','Limited precision',1],['Typed','Precise times','Fast','Needs validation',1],['Range','Shifts, meetings','Clear duration','Two fields',0]],
  rec:{v:'30-minute list; typed entry for precise times',why:'Most enterprise scheduling uses slots.'},
  decide:[['Slots','List','No invalid values'],['Exact time','Typed','Precision']],
  resp:{mobile:'Use native time input or a large list.'}
}));

/* ---------------- CALENDAR ---------------- */
function calMonth(o,k){
  const y=TODAY.getFullYear(),m=TODAY.getMonth();const first=(new Date(y,m,1).getDay()+6)%7;const start=new Date(y,m,1-first);
  const EV={3:[['Sprint review','']],5:[['PO-2291 delivery','ok']],8:[['Payroll run','warn'],['Audit prep','']],12:[['Board meeting','']],16:[['Quarter close','err']],20:[['Vendor call','']],22:[['Inventory count','warn']]};
  let h=`<div class="dx-cal" role="grid" aria-label="${MONTHS[m]} ${y}">${DOW.map(d=>`<div class="dx-cal__dow" role="columnheader">${d}</div>`).join('')}`;
  for(let i=0;i<35;i++){const d=new Date(start);d.setDate(start.getDate()+i);const out=d.getMonth()!==m;const ev=!out?EV[d.getDate()%23]||[]:[];h+=`<div class="dx-cal__d${out?' is-out':''}${sameDay(d,TODAY)?' is-today':''}" role="gridcell"><span class="dx-cal__n">${d.getDate()}</span>${ev.map(([t,c])=>`<button type="button" class="dx-ev${c?' dx-ev--'+c:''}" data-ds="toast" data-title="${t}" data-text="${MONTHS[m]} ${d.getDate()}">${t}</button>`).join('')}</div>`}
  return h+'</div>';
}
spec(S3({id:'components/calendar',title:'Calendar',noun:'Calendar',icon:'calendar',group:'Data Display',cls:['dx-cal','dx-week','dx-agenda'],wideAll:true,min:{all:'560px'},
  desc:'Show events over time: month, week and agenda views for schedules, deliveries and deadlines.',
  dims:{variant:[['month','Month'],['week','Work week'],['agenda','Agenda list'],['mini','Mini calendar']]},
  def:{variant:'month'},sizes:false,
  render:(o,k)=>{switch(o.variant){
    case 'week':return `<div class="dx-week" role="grid" aria-label="Work week"><div class="hd"></div>${['Mon 19','Tue 20','Wed 21','Thu 22','Fri 23'].map(d=>`<div class="hd">${d}</div>`).join('')}${['09:00','10:00','11:00','12:00','13:00','14:00'].map((t,r)=>`<div class="h">${t}</div>${[0,1,2,3,4].map(c=>`<div>${(r===0&&c===1)?'<span class="dx-ev">Stand-up</span>':(r===2&&c===3)?'<span class="dx-ev dx-ev--warn">Inventory count</span>':(r===4&&c===0)?'<span class="dx-ev dx-ev--ok">PO-2291 delivery</span>':''}</div>`).join('')}`).join('')}</div>`;
    case 'agenda':return `<ul class="dx-agenda">${[['09:00','Sprint review','Team room 3',''],['11:30','PO-2291 delivery','Dock 3, WH-3','ok'],['14:00','Payroll approval','Finance','warn'],['16:00','Quarter close prep','Online','err']].map(([t,n,l,c])=>`<li><time>${t}</time><div><b>${n}</b><div class="ds-faint ds-small">${l}</div></div>${c?BADGE({ok:'Confirmed',warn:'Due today',err:'Deadline'}[c],{ok:'success',warn:'warning',err:'danger'}[c],{sz:'s'}):''}</li>`).join('')}</ul>`;
    case 'mini':return `<div class="ds-cal" data-mode="single" data-init="0" style="background:var(--bg);border-radius:var(--r-l);box-shadow:var(--sh-1)"></div>`;
    default:return calMonth(o,k);}},
  anatomy:[['Grid','.dx-cal','role=grid'],['Day cell','.dx-cal__d','gridcell'],['Event','.dx-ev','Button; colour + text'],['Today','.is-today','']],
  cases:[{t:'Delivery schedule',area:'ERP · Logistics',d:'Month view with delivery and deadline events.',html:k=>calMonth({},k)}],
  a11y:{aria:'Grid with column headers; events are buttons whose text includes the title; colour is supplemented by text.',keyboard:'Tab to events; Enter opens details.'},
  props:[['view','month | week | day | agenda','month',''],['events','{ start, end, title, tone }[]','—',''],['onEventClick','(e) => void','—','']],
  matrix:[['Month','Overview of deadlines','Big picture','Little detail',1],['Week','Scheduling','Time slots','Narrow',0],['Agenda','Mobile, today','Readable list','No layout of time',1]],
  rec:{v:'Month on desktop, agenda on mobile',why:'Month gives overview; agenda is readable on small screens.'},
  decide:[['Plan deliveries','Month','Overview'],['Book slots','Week','Time grid'],['Phone','Agenda','Readable']],
  resp:{desktop:'Month grid.',tablet:'Week view.',mobile:'Agenda list.'}
}));
DOCS['components/calendar'].render=((r)=>(o,k)=>o.device==='mobile'?r({...o,variant:'agenda'},k):r(o,k))(DOCS['components/calendar'].render);

/* ---------------- FILE UPLOAD ---------------- */
function upRender(o,k){
  const s=o.state;const dz=(extra='')=>`<label class="ds-drop${s==='hover'?' is-hover':''}${s==='error'?' is-error':''}"${s==='disabled'?' style="opacity:.45;pointer-events:none"':''}>${ic(s==='error'?'err':'upload','ds-drop__ic')}<span class="ds-drop__t">${s==='error'?'invoice.exe can’t be uploaded':'Drop files or <span>browse</span>'}</span><span class="ds-small ds-faint">${s==='error'?'Only PDF, PNG or CSV up to 25 MB':'PDF, PNG or CSV · up to 25 MB'}</span><input type="file" multiple aria-label="Attach files"${s==='disabled'?' disabled':''}>${extra}</label>`;
  switch(o.variant){
    case 'button':return `<div class="ds-col"><label class="ds-btn" style="width:max-content">${ic('upload')}<span>Attach file</span><input type="file" class="ds-sr" aria-label="Attach file"></label><ul class="ds-files">${fileRow({name:'quote-northwind.pdf',size:412000},true)}</ul></div>`;
    case 'inline':return `<div class="ds-row" style="gap:8px">${TF({label:'Supporting document',val:'quote-northwind.pdf',lead:'file',state:'disabled'})}${B('Replace',{sz:'s'})}</div>`;
    case 'image':return `<div class="ds-col">${dz()}<div class="ds-row" style="gap:8px">${['#2F7D6A','#3A6FD8','#C25B1F'].map((c,i)=>`<div style="width:88px;height:66px;border-radius:var(--r);background:linear-gradient(135deg,${c},color-mix(in srgb,${c} 40%,#fff));position:relative" role="img" aria-label="Product photo ${i+1}">${IB('x','Remove photo '+(i+1),{sz:'s',attrs:'style="position:absolute;top:2px;right:2px;background:var(--bg)"'})}</div>`).join('')}</div></div>`;
    default:return `<div class="ds-col">${dz()}<ul class="ds-files">${fileRow({name:'rollback-plan.pdf',size:842000},true)}${fileRow({name:'schema-diff.csv',size:2310000},true)}</ul></div>`;
  }
}
spec(S3({id:'components/upload',title:'File Upload',noun:'File upload',icon:'upload',group:'Forms',cls:['ds-drop','ds-files','ds-file'],
  desc:'Attach documents and images with drag and drop, progress and clear error messages.',
  dims:{variant:[['dropzone','Drop zone + list'],['button','Button upload'],['inline','Inline (form field)'],['image','Image upload with previews']],state:[['default','Default'],['hover','Drag over'],['error','Error'],['disabled','Disabled']]},
  def:{variant:'dropzone',state:'default'},
  render:upRender,
  anatomy:[['Drop zone','.ds-drop','Covers a real file input'],['Icon','.ds-drop__ic',''],['File list','.ds-files',''],['File row','.ds-file','Name, size, progress, remove']],
  cases:[{t:'Vendor onboarding documents',area:'ERP · Purchasing',d:'Required tax and bank documents.',html:k=>`<div class="fx fx--2">${['Tax certificate','Bank confirmation'].map(t=>`<div class="ds-field"><span class="ds-label">${t}<span class="req">*</span></span>${upRender({variant:'dropzone',state:'default'},k)}</div>`).join('')}</div>`}],
  a11y:{aria:'A real input[type=file] covers the zone so keyboard and screen readers work; each upload has a labelled progressbar.',error:'Errors name the file and the rule it broke.'},keys:[['Tab','Focus'],['Enter / Space','Open file dialog']],
  props:[['accept','string','—','MIME types'],['multiple','boolean','false',''],['maxSize','number','25MB',''],['onUpload','(files) => Promise','—','']],
  matrix:[['Drop zone','Several documents','Clear target','Space',1],['Button','One file in a form','Compact','No drag target',1],['Image','Product media','Preview','Large',0]],
  rec:{v:'Drop zone with file list',why:'Shows progress and errors per file.'},
  decide:[['Multiple documents','Drop zone','Progress per file'],['Single attachment','Button','Compact'],['Photos','Image upload','Preview']],
  resp:{mobile:'Button upload; drop zones have no drag on touch.'}
}));

/* ---------------- SEARCH ---------------- */
function srRender(o,k){
  const sz=o.variant==='global'?'ds-l':'';
  const field=(ph,extra='')=>`<div class="ds-control ds-control--search ${sz}${['focus','loading'].includes(o.state)?' '+st(o.state):''}">${ic('search')}<input type="search" aria-label="Search" placeholder="${ph}" value="${o.state==='default'?'':'laptop'}"${o.state==='disabled'?' disabled':''}>${extra}</div>`;
  switch(o.variant){
    case 'scope':return `<div style="min-height:230px"><div class="ds-row" style="gap:8px;flex-wrap:nowrap;align-items:flex-end"><div style="width:150px">${SEL({label:'Scope',options:['All','Orders','Vendors','Invoices'],sel:1})}</div><div style="flex:1"><span class="ds-label" style="margin-bottom:4px">Query</span>${field('Search orders')}</div></div></div>`;
    case 'suggest':return `<div style="min-height:220px"><div class="ds-anchor ds-block">${field('Search orders')}<div class="ds-pop" role="listbox" style="position:relative;top:4px"><div class="ds-menu__head">Suggestions</div>${['Laptop 14" · PO-2291','Laptop bags · PO-2203','Laptop stands · PO-2190'].map((t,i)=>`<div class="ds-opt${i===0?' is-cur':''}" role="option">${ic('search')}<span><mark>Laptop</mark>${t.slice(6)}</span></div>`).join('')}</div></div></div>`;
    case 'global':return `${field('Search orders, vendors, invoices, people','<span class="ds-cmd-hint"><kbd>/</kbd></span>')}`;
    case 'filters':return `<div class="ds-col">${field('Search orders')}<div class="ds-row" style="gap:6px">${chipRender({variant:'filter',icon:'tick',state:'default'},k)}</div></div>`;
    case 'results':return `<div class="ds-col">${field('Search')}<div class="ds-results">${PAGES.find(p=>p.id==='pattern-search')?SEARCH_DATA.slice(0,3).map(d=>`<a class="ds-result" href="#" data-noop style="text-decoration:none;color:inherit"><span class="ds-result__path">${d.t} · ${d.path}</span><span class="ds-result__title">${d.title.replace(/(billing)/i,'<mark>$1</mark>')}</span></a>`).join(''):''}</div></div>`;
    default:return field('Search orders');
  }
}
spec(S3({id:'components/search',title:'Search',noun:'Search',icon:'search',group:'Forms',cls:['ds-control--search','ds-result'],
  desc:'Find records by typing. From a simple field to global search with scopes and suggestions.',
  dims:{variant:[['basic','Basic'],['scope','With scope'],['suggest','With suggestions'],['global','Global search'],['filters','With filter chips'],['results','With results']],state:[['default','Empty'],['filled','With query'],['focus','Focus'],['loading','Loading'],['disabled','Disabled']]},
  def:{variant:'basic',state:'filled'},
  render:srRender,
  anatomy:[['Field','.ds-control--search',''],['Icon','.ds-ic',''],['Clear','.ds-x',''],['Suggestions','.ds-pop',''],['Result','.ds-result','Highlighted matches']],
  cases:[{t:'Global ERP search',area:'All modules',d:'Search everything from the header with “/”.',html:k=>srRender({variant:'results',state:'filled'},k)}],
  a11y:{aria:'type="search" with a label; suggestions use the combobox pattern; result counts in a polite live region.'},keys:[['/','Focus search'],['↓','Into suggestions'],['Enter','Search'],['Esc','Clear']],
  props:[['value','string','',''],['scope','string','all',''],['suggestions','Suggestion[]','—',''],['onSearch','(q) => void','—',''],['debounce','number','250','ms']],
  matrix:[['Basic','Within a list','Simple','—',1],['Scope','Large apps','Precise','Extra control',0],['Suggestions','Known items','Fast','Needs data',1],['Global','App header','Find anything','Complex results',1]],
  rec:{v:'Basic within lists; global with suggestions in the header',why:'Local search narrows the current list; global search finds anything.'},
  decide:[['Filter the current list','Basic search','Local'],['Find any record','Global with suggestions','Speed'],['Large mixed data','Scope selector','Precision']],
  resp:{mobile:'Search expands to full width from an icon.'}
}));

/* ---------------- FILTERS ---------------- */
function fiRender(o,k){
  switch(o.variant){
    case 'facets':return `<div class="ds-col" style="max-width:260px"><fieldset class="ds-choices"><legend class="ds-label">Status</legend>${['Awaiting approval','Approved','Ordered','Rejected'].map((s,i)=>CHK(`${s} <span class="ds-faint">(${[12,48,20,3][i]})</span>`,{checked:i===0})).join('')}</fieldset><fieldset class="ds-choices"><legend class="ds-label">Amount</legend>${CHK('Under $10k',{radio:1,name:'am'})}${CHK('$10k – $50k',{radio:1,name:'am',checked:1})}${CHK('Over $50k',{radio:1,name:'am'})}</fieldset>${SW('Only my orders',{on:1})}</div>`;
    case 'drawer':return drawerInner({variant:'filter'},k,true).replace('<aside class="ds-drawer','<aside style="position:relative;transform:none;max-width:360px" class="ds-drawer');
    case 'builder':return `<div class="dx-qb" data-init="qb">${[['Where','Status','is','Awaiting approval'],['And','Total','greater than','10,000'],['And','Vendor','contains','North']].map(r=>`<div class="dx-qb__row"><span>${r[0]}</span>${SEL({label:'',options:['Status','Total','Vendor','Owner'],sel:['Status','Total','Vendor'].indexOf(r[1]),sz:'s'})}${SEL({label:'',options:['is','is not','contains','greater than'],sel:['is','is not','contains','greater than'].indexOf(r[2]),sz:'s'})}<div class="ds-control ds-s"><input aria-label="Value" value="${r[3]}"></div>${IB('x','Remove condition',{sz:'s'})}</div>`).join('')}<div>${B('Add condition',{v:'subtle',sz:'s',icon:'plus',keep:1})}</div></div>`;
    case 'views':return `<div class="ds-col"><div class="dx-views" role="group" aria-label="Saved views" data-ds="seg">${['All orders','My approvals','Over $50k','Late deliveries'].map((v,i)=>B(v,{sz:'s',attrs:`aria-pressed="${i===1}"`})).join('')}${B('Save view',{v:'link',sz:'s',icon:'plus',keep:1})}</div><span class="ds-faint ds-small">My approvals · Status is Awaiting approval · Approver is me</span></div>`;
    default:return `<div class="ds-col"><div class="dx-filterbar"><button type="button" class="dx-fb-btn is-on">${ic('check')}Status: Awaiting approval</button><button type="button" class="dx-fb-btn is-on">Vendor: Northwind</button><button type="button" class="dx-fb-btn">${ic('plus')}Owner</button><button type="button" class="dx-fb-btn">${ic('plus')}Date</button>${B('Clear all',{v:'link',sz:'s'})}</div><span class="ds-faint ds-small">12 of 214 orders</span></div>`;
  }
}
spec(S3({id:'components/filters',title:'Filters',noun:'Filter',icon:'filter',group:'Forms',cls:['dx-filterbar','dx-fb-btn','dx-qb'],
  desc:'Narrow a dataset with filter bars, facets, drawers, advanced conditions and saved views.',
  dims:{variant:[['bar','Filter bar'],['facets','Faceted panel'],['drawer','Filter drawer'],['builder','Advanced conditions'],['views','Saved views']]},
  def:{variant:'bar'},min:{all:'420px'},
  render:fiRender,
  anatomy:[['Filter button','.dx-fb-btn','Dashed when empty, solid when set'],['Facet group','fieldset',''],['Condition row','.dx-qb__row','Field · operator · value'],['Result count','text','Live region']],
  cases:[{t:'Orders list with facets',area:'ERP',d:'Facets on the left, list on the right.',html:k=>`<div class="dx-split" style="grid-template-columns:240px 1fr">${fiRender({variant:'facets'},k)}${tblRender({variant:'dense',content:'text'},k)}</div>`}],
  a11y:{aria:'Facets in fieldsets; filter buttons are toggle buttons; result counts announced.'},keys:[['Space','Toggle a filter'],['Tab','Next filter']],
  props:[['filters','Filter[]','—',''],['value','Record<string,any>','{}',''],['onChange','(v) => void','—',''],['savedViews','View[]','—','']],
  matrix:[['Filter bar','Few common filters','Visible state','Limited room',1],['Facets','Catalogues, large lists','Counts guide choices','Width',1],['Drawer','Mobile, many filters','Room','Hidden until opened',0],['Builder','Analysts','Any query','Complex',0],['Saved views','Repeated tasks','One click','Needs management',1]],
  rec:{v:'Filter bar with saved views; facets for large lists',why:'Most users reuse the same few filters; facets help explore large data.'},
  decide:[['Few repeat filters','Filter bar + saved views','Speed'],['Explore large catalogue','Facets','Counts'],['Mobile','Filter drawer','Room'],['Complex conditions','Builder','Power']],
  resp:{mobile:'Bar collapses into a Filters button that opens a drawer.'}
}));

/* ---------------- COMMAND BAR ---------------- */
function cbRender(o,k){
  const b=(l,i,v='subtle')=>B(l,{v,sz:'s',icon:i,keep:1});
  switch(o.variant){
    case 'selection':return `<div class="dx-cmdbar dx-cmdbar--sel" role="toolbar" aria-label="Selection actions"><b style="padding:0 8px">3 selected</b>${b('Approve','check')}${b('Assign','user')}${b('Export','download')}<span class="grow"></span>${IB('x','Clear selection',{sz:'s'})}</div>`;
    case 'search':return `<div class="dx-cmdbar" role="toolbar" aria-label="Orders">${b('New','plus','primary')}${b('Edit','edit')}<span class="sep"></span><div class="ds-control ds-control--search ds-s" style="width:220px">${ic('search')}<input type="search" aria-label="Search orders" placeholder="Search"></div><span class="grow"></span>${b('Filter','filter')}</div>`;
    case 'floating':return `<div style="text-align:center"><div class="dx-cmdbar dx-cmdbar--float" role="toolbar" aria-label="Text formatting">${IB('bold','Bold',{sz:'s'})}${IB('italic','Italic',{sz:'s'})}${IB('link','Link',{sz:'s'})}<span class="sep"></span>${IB('message','Comment',{sz:'s'})}</div></div>`;
    case 'overflow':{const m=uid('cb');return `<div class="dx-cmdbar" role="toolbar" aria-label="Order commands">${b('New','plus','primary')}${b('Edit','edit')}<span class="grow"></span><span class="ds-anchor">${IB('more','More commands',{sz:'s',attrs:`data-ds="menu" aria-haspopup="menu" aria-expanded="false" aria-controls="${m}"`})}${MENU(m,{right:1,items:[{l:'Duplicate',ic:'copy'},{l:'Export',ic:'download'},{l:'Print',ic:'file'},{sep:1},{l:'Delete',ic:'trash',danger:1}]})}</span></div>`}
    default:return `<div class="dx-cmdbar" role="toolbar" aria-label="Order commands">${b('New order','plus','primary')}${b('Edit','edit')}${b('Duplicate','copy')}<span class="sep"></span>${b('Export','download')}${b('Share','share')}<span class="grow"></span>${b('Filter','filter')}${IB('sliders','View options',{sz:'s'})}</div>`;
  }
}
spec(S3({id:'components/command-bar',title:'Command Bar',noun:'Command bar',icon:'command',group:'Actions',cls:['dx-cmdbar'],wideAll:true,min:{all:'560px'},
  desc:'A row of commands for the current page or selection. Primary command first, overflow in a More menu.',
  dims:{variant:[['page','Page commands'],['selection','Contextual selection'],['search','With search'],['overflow','With overflow'],['floating','Floating (text)']]},
  def:{variant:'page'},
  render:cbRender,initCard:()=>{},
  anatomy:[['Bar','.dx-cmdbar','role=toolbar'],['Primary command','.ds-btn--primary',''],['Separator','.sep',''],['Overflow','More menu','']],
  cases:[{t:'Sales orders',area:'ERP · Sales',d:'Page commands switch to selection commands when rows are chosen.',html:k=>`<div class="ds-col">${cbRender({variant:'page'},k)}${cbRender({variant:'selection'},k)}</div>`}],
  a11y:{aria:'role="toolbar" with a label; icon-only commands have names.',keyboard:'Tab enters the toolbar; arrow keys may move between commands.'},keys:[['Tab','Into toolbar'],['Enter','Run command']],
  props:[['items','Command[]','—',''],['overflowItems','Command[]','—',''],['context','page | selection','page','']],
  matrix:[['Page','List and record pages','Consistent location','Can grow long',1],['Selection','Bulk work','Relevant actions only','State change',1],['Floating','Text editing','Near the content','Covers content',0]],
  rec:{v:'Page command bar that switches to selection commands',why:'Users find actions in one place; only relevant actions appear.'},
  decide:[['List page','Page commands','Consistency'],['Rows selected','Selection bar','Relevance'],['Many commands','Overflow menu','Width']],
  resp:{mobile:'Primary stays; others move into More.'}
}));

/* ---------------- TIMELINE ---------------- */
function tlRender(o,k){
  switch(o.variant){
    case 'horizontal':return `<ol class="dx-tl-h">${[['Ordered','Oct 12',1],['Picked','Oct 13',1],['Shipped','Oct 14',1],['Delivered','Oct 17',0],['Invoiced','—',0]].map(([t,d,on])=>`<li class="${on?'is-done':''}"><b>${t}</b><span class="ds-faint">${d}</span></li>`).join('')}</ol>`;
    case 'audit':return TBL(['When','Who','Field','From','To'],[['Oct 19 10:05','Maya Ruiz','Status','Awaiting approval','Approved'],['Oct 18 14:30','Priya Nair','Total','$84,200.00','$86,400.00'],['Oct 18 09:12','Liam Shah','Created','—','Draft']],{caption:'Audit log'});
    case 'comments':return `<div class="ds-col">${legacy('timeline').demo(k)}${TA({label:'Add a comment',rows:2,ph:'Mention someone with @'})}</div>`;
    default:return legacy('timeline').demo(k);
  }
}
spec(S3({id:'components/timeline',title:'Timeline',noun:'Timeline',icon:'clock',group:'Data Display',cls:['ds-tl','dx-tl-h'],
  desc:'Chronological events: activity feeds, order lifecycles, audit logs and comment threads.',
  dims:{variant:[['activity','Activity (vertical)'],['horizontal','Milestones (horizontal)'],['audit','Audit log'],['comments','With comments']]},
  def:{variant:'activity'},min:{all:'420px'},
  render:tlRender,
  anatomy:[['List','ol.ds-tl',''],['Marker','.ds-tl__mark',''],['Head','.ds-tl__head','Who + when'],['Text','.ds-tl__text','']],
  cases:[{t:'Sales order lifecycle',area:'ERP · Sales',d:'Milestones at the top of an order.',html:k=>tlRender({variant:'horizontal'},k)},{t:'Change history',area:'Finance',d:'Audit trail for a journal.',html:k=>tlRender({variant:'audit'},k)}],
  a11y:{aria:'Ordered list with time elements; markers decorative.'},
  props:[['events','{ who, what, when, tone? }[]','—',''],['orientation','vertical | horizontal','vertical',''],['groupBy','day | none','none','']],
  matrix:[['Activity','Record history','Readable','Long',1],['Milestones','Lifecycles','At a glance','Few steps only',1],['Audit log','Compliance','Exact changes','Dense',1]],
  rec:{v:'Vertical activity with grouped days; audit table for compliance',why:'People read stories; auditors read tables.'},
  decide:[['What happened recently','Activity','Narrative'],['Where an order is','Milestones','Overview'],['Who changed what','Audit log','Precision']],
  resp:{mobile:'Horizontal milestones become vertical.'}
}));

/* ---------------- TREE VIEW ---------------- */
function treeRender(o,k){
  let h=TREE();
  if(o.variant==='checkbox')h=h.replace(/<span class="ds-tree__tw/g,`<span class="ds-check" style="margin-right:2px" aria-hidden="true"><span class="ds-check__box">${CHECK}</span></span><span class="ds-tree__tw`);
  if(o.variant==='actions')h=h.replace(/(<span class="ds-tree__meta">[^<]*<\/span>)?<\/div>(<ul|<\/li>)/g,(m,meta,tail)=>`${meta||''}<span class="dx-tree-acts">${IB('plus','Add child',{sz:'s',attrs:'tabindex="-1"'})}${IB('more','More',{sz:'s',attrs:'tabindex="-1"'})}</span></div>${tail}`);
  return h;
}
spec(S3({id:'components/tree-view',title:'Tree View',noun:'Tree',icon:'tree',group:'Navigation',cls:['ds-tree','ds-tree__row','ds-tree__tw'],
  desc:'Hierarchical data that expands and collapses: projects, cost centres, warehouses, org structures.',
  dims:{variant:[['basic','Basic'],['checkbox','With checkboxes'],['actions','With row actions']]},
  def:{variant:'basic'},
  render:treeRender,
  anatomy:[['Tree','ul[role=tree]',''],['Item','li[role=treeitem]','aria-expanded, aria-selected'],['Row','.ds-tree__row','Roving focus'],['Toggle','.ds-tree__tw',''],['Meta','.ds-tree__meta','Counts']],
  cases:[{t:'Cost centre hierarchy',area:'Finance',d:'Counts show where spend sits.',html:k=>treeRender({variant:'basic'},k)}],
  a11y:{aria:'ARIA tree pattern with roving tabindex.',keyboard:'↑ ↓ move; → expands; ← collapses or goes to parent; Enter selects.'},keys:[['↑ / ↓','Move'],['→ / ←','Expand / collapse'],['Enter','Select']],
  props:[['nodes','Node[]','—',''],['selectable','single | multiple','single',''],['expanded','string[]','[]',''],['onSelect','(id) => void','—','']],
  matrix:[['Basic','Navigation','Familiar','Deep trees get long',1],['Checkboxes','Permissions, scopes','Bulk selection','Tri-state complexity',0],['Actions','Editing structures','In place','Hover-only actions need focus support',0]],
  rec:{v:'Basic tree with counts',why:'Fits navigation and selection without clutter.'},
  decide:[['Browse hierarchy','Basic','Simple'],['Assign many nodes','Checkboxes','Bulk'],['Edit structure','Row actions','In place']],
  resp:{mobile:'Drill-down list (one level per screen) instead of a tree.'}
}));

/* ---------------- KANBAN ---------------- */
const KB=[['To do',[['DS-131','Bulk export for reports','LS',3,'Medium'],['DS-125','Dashboard first paint','MR',1,'High']]],['In progress',[['DS-142','Migrate billing tables','MR',1,'High'],['DS-139','Audit focus rings','JO',4,'Medium']]],['In review',[['DS-137','Stale currency codes','AK',5,'Blocker']]],['Done',[['DS-128','Rename workspace roles','PN',2,'Low']]]];
function kbCard([key,t,i,c,p],compact){return `<div class="dx-kb__c" draggable="true" tabindex="0" data-kb-card aria-label="${key} ${t}, priority ${p}"><div class="row"><span class="ds-faint ds-mono">${key}</span>${BADGE(p,{High:'warning',Blocker:'danger',Medium:'info',Low:''}[p],{sz:'s'})}</div><b>${t}</b><div class="row meta">${AV(i,c,{sz:'s'})}<span class="dx-kb__mv">${IB('chev-left','Move left',{sz:'s',attrs:'data-kb-mv="-1"'})}${IB('chev-right','Move right',{sz:'s',attrs:'data-kb-mv="1"'})}</span></div></div>`}
function kbRender(o,k){
  const cols=KB.map(([n,cards])=>`<div class="dx-kb__col" data-kb-col="${n}" aria-label="${n}"><div class="dx-kb__h">${n}<span class="wip${o.variant==='wip'&&n==='In progress'?' over':''}">${cards.length}${o.variant==='wip'?' / '+(n==='In progress'?'2':'5'):''}</span></div>${cards.map(c=>kbCard(c)).join('')}</div>`).join('');
  if(o.variant==='swimlanes')return `<div class="ds-col">${['Billing','Platform'].map((l,li)=>`<div class="dx-kb-lane"><span class="dx-kb-lane__h">${ic('layers')}${l}</span><div class="dx-kb" data-kb>${KB.map(([n,cards])=>`<div class="dx-kb__col" data-kb-col="${n}" style="min-height:90px"><div class="dx-kb__h">${n}</div>${cards.filter((_,i)=>i%2===li).map(c=>kbCard(c)).join('')}</div>`).join('')}</div></div>`).join('')}</div>`;
  return `<div class="dx-kb${o.variant==='compact'?' dx-kb--compact':''}" data-kb>${cols}</div><p class="ds-sr" aria-live="polite" data-kb-live></p>`;
}
spec(S3({id:'components/kanban',title:'Kanban',noun:'Kanban board',icon:'grid',group:'Data Display',cls:['dx-kb','dx-kb__col','dx-kb__c'],wideAll:true,min:{all:'640px'},sizes:false,
  desc:'Cards in status columns that users move as work progresses. Drag with a mouse or move with the keyboard.',
  dims:{variant:[['board','Board'],['compact','Compact cards'],['wip','With WIP limits'],['swimlanes','Swimlanes']]},
  def:{variant:'board'},na:{size:'Cards scale with density.'},
  render:kbRender,
  initCard(st,o,k){const live=st.querySelector('[data-kb-live]');let drag=null;
    const move=(card,col)=>{col.appendChild(card);$$('[data-kb-col]',st).forEach(c=>{const w=c.querySelector('.wip');if(w){const n=c.querySelectorAll('.dx-kb__c').length;w.firstChild.textContent=n+(o.variant==='wip'?' / '+(c.dataset.kbCol==='In progress'?'2':'5'):'');w.classList.toggle('over',o.variant==='wip'&&c.dataset.kbCol==='In progress'&&n>2)}});if(live)live.textContent=`${card.querySelector('b').textContent} moved to ${col.dataset.kbCol}`;toast(k,{title:`Moved to ${col.dataset.kbCol}`,text:card.querySelector('b').textContent})};
    st.addEventListener('dragstart',e=>{const c=e.target.closest('[data-kb-card]');if(c){drag=c;c.classList.add('is-drag');e.dataTransfer.effectAllowed='move'}});
    st.addEventListener('dragend',()=>{if(drag)drag.classList.remove('is-drag');drag=null;$$('.is-over',st).forEach(c=>c.classList.remove('is-over'))});
    st.addEventListener('dragover',e=>{const col=e.target.closest('[data-kb-col]');if(col&&drag){e.preventDefault();$$('.is-over',st).forEach(c=>c!==col&&c.classList.remove('is-over'));col.classList.add('is-over')}});
    st.addEventListener('drop',e=>{const col=e.target.closest('[data-kb-col]');if(col&&drag){e.preventDefault();move(drag,col)}});
    st.addEventListener('click',e=>{const b=e.target.closest('[data-kb-mv]');if(!b)return;const card=b.closest('[data-kb-card]');const cols=$$('[data-kb-col]',card.closest('[data-kb]'));const i=cols.indexOf(card.closest('[data-kb-col]'));const n=cols[i+(+b.dataset.kbMv)];if(n){move(card,n);card.focus()}})},
  anatomy:[['Board','.dx-kb',''],['Column','.dx-kb__col','Status'],['Column header','.dx-kb__h','Count / WIP limit'],['Card','.dx-kb__c','Draggable, focusable'],['Move buttons','.dx-kb__mv','Keyboard alternative to drag']],
  cases:[{t:'Recruitment pipeline',area:'HR',d:'Candidates move through stages.',html:k=>`<div class="dx-kb">${[['Applied',['Ana Costa','Ben Okafor']],['Interview',['Chen Li']],['Offer',['Dana Park']],['Hired',[]]].map(([n,c])=>`<div class="dx-kb__col"><div class="dx-kb__h">${n}<span class="wip">${c.length}</span></div>${c.map(p=>`<div class="dx-kb__c" tabindex="0"><b>${p}</b><span class="ds-faint">Senior accountant · Lisbon</span></div>`).join('')}</div>`).join('')}</div>`}],
  a11y:{keyboard:'Cards are focusable; Move left / right buttons appear on focus so no drag is required; moves are announced.',aria:'Columns are labelled regions; card labels include key, title and priority.'},keys:[['Tab','Next card'],['Enter on ← / →','Move card between columns']],
  props:[['columns','{ id, title, wipLimit? }[]','—',''],['cards','Card[]','—',''],['onMove','(card, toColumn) => void','—',''],['swimlaneBy','string','—','']],
  matrix:[['Board','Team workflow','Visual flow','Few columns only',1],['WIP limits','Lean teams','Shows bottlenecks','Needs discipline',0],['Swimlanes','Multiple teams','Separation','Height',0]],
  rec:{v:'Board with keyboard move buttons',why:'Visual flow for teams, and drag is never the only way to move.'},
  decide:[['Track work stages','Board','Flow'],['Bottlenecks matter','WIP limits','Visibility'],['Many teams','Swimlanes','Separation'],['Bulk updates','Table instead','Speed']],
  resp:{mobile:'One column at a time with a status switcher.'}
}));

/* ---------------- WIZARD ---------------- */
spec(S3({id:'components/wizard',title:'Wizard',noun:'Wizard',icon:'steps',group:'Forms',cls:['dx-wz','dx-st','dx-st-panel'],wideAll:true,min:{all:'600px'},sizes:false,colors:false,
  desc:'A guided multi-step form with validation per step, back and forward navigation, and a review step.',
  dims:{variant:[['horizontal','Horizontal stepper'],['vertical','Vertical stepper'],['modal','In a modal']],content:[['none','Titles only'],['desc','With validation messages']]},
  def:{variant:'horizontal',content:'none'},
  render:(o,k)=>{const h=wizardHTML(WZ[o.variant==='modal'?7:o.variant==='vertical'?6:2],k,{vertical:o.variant==='vertical'});return o.variant==='modal'?ctxWrap(h,'modal',k):o.variant==='vertical'?`<div class="dx-st-side" style="grid-template-columns:1fr">${h}</div>`:h},
  anatomy:[['Stepper','.dx-st',''],['Step panel','.dx-wz__body','Fields for the step'],['Navigation','.dx-st-nav','Back / Continue'],['Review','.dx-wz__review','Summary before submit']],
  cases:WZ.slice(0,4).map((w,i)=>({t:w.t,area:w.area,d:'Interactive: Continue validates required fields.',html:k=>wizardHTML(w,k)})),
  a11y:{error:'Errors appear at the fields and on the step; focus moves to the first invalid field.',aria:'Stepper is an ordered list with aria-current="step".'},keys:[['Tab','Fields'],['Enter','Continue']],
  props:[['steps','{ title, fields }[]','—',''],['linear','boolean','true',''],['onSubmit','(values) => void','—',''],['showReview','boolean','true','']],
  matrix:[['Horizontal','Desktop, ≤ 6 steps','Overview','Labels truncate',1],['Vertical','Many steps, mobile','Room for labels','Height',1],['Modal','Short creation flows','Context kept','Limited space',0]],
  rec:{v:'Horizontal wizard with review step',why:'Shows the whole journey and lets users confirm before submitting.'},
  decide:[['3–6 ordered steps','Horizontal wizard','Overview'],['7+ steps','Vertical / sidebar','Scales'],['Experts entering data often','Single form with sections','Faster than steps']],
  resp:{mobile:'Vertical or compact stepper; one column of fields.'}
}));

/* ---------------- EMPTY STATE ---------------- */
function esRender(o,k){
  const E={first:['inbox','No purchase orders yet','Create your first order to start tracking spend.','Create order',''],search:['search','No results for “laptpo”','Check the spelling or search all modules.','Clear search',''],filter:['filter','No orders match these filters','Remove a filter to see more.','Clear filters',''],error:['err','Orders couldn’t load','The service timed out. Your filters are kept.','Retry','err'],permission:['lock','You don’t have access','Ask a workspace admin for the Procurement role.','Request access','warn'],done:['ok','All caught up','No approvals are waiting for you.','View history','ok'],offline:['cloud','You’re offline','Changes are saved on this device and sync when you reconnect.','Try again','warn']}[o.variant];
  const inline=o.layout==='inline';
  return `<div class="dx-empty${inline?' dx-empty--inline':''}${E[4]?' dx-empty--'+E[4]:''}" role="${E[4]==='err'?'alert':'status'}"><span class="dx-empty__art">${ic(E[0])}</span>${inline?'<div>':''}<h4>${E[1]}</h4><p>${E[2]}</p>${inline?'</div>':''}${B(E[3],{v:inline?'':'primary',sz:inline?'s':''})}</div>`;
}
spec(S3({id:'components/empty-states',title:'Empty State',noun:'Empty state',icon:'inbox',group:'Feedback',cls:['dx-empty'],
  desc:'Explain why there is nothing to show and what to do next.',
  dims:{variant:[['first','First use'],['search','No search results'],['filter','No filter results'],['error','Error'],['permission','No permission'],['done','All done'],['offline','Offline']],layout:[['page','Page / panel'],['inline','Inline (in a card or table)']]},
  def:{variant:'first',layout:'page'},
  render:esRender,
  anatomy:[['Container','.dx-empty','role=status / alert'],['Icon','.dx-empty__art',''],['Title','h4','What happened'],['Text','p','Why, and what to do'],['Action','.ds-btn','The next step']],
  cases:[{t:'Approvals inbox',area:'ERP',d:'Positive empty state after clearing the queue.',html:k=>esRender({variant:'done',layout:'page'},k)},{t:'Report with no data',area:'Finance',d:'Inline inside a chart card.',html:k=>panel('Expenses by category',esRender({variant:'filter',layout:'inline'},k))}],
  a11y:{aria:'role="status" (or alert for errors); the action is a real button.'},
  props:[['kind','first | search | filter | error | permission | done | offline','first',''],['title','string','—',''],['action','{ label, onClick }','—',''],['size','page | inline','page','']],
  matrix:[['First use','New modules','Guides the first action','—',1],['No results','Search and filters','Explains and recovers','—',1],['Error','Failed loads','Retry in place','—',1],['Inline','Cards, small panels','Compact','Less guidance',0]],
  rec:{v:'Page empty state with one clear action',why:'Users always know why it is empty and what to do next.'},
  decide:[['Nothing created yet','First use','Starts the journey'],['Search found nothing','No results + clear','Recovery'],['Load failed','Error + retry','Recovery']],
  resp:{mobile:'Same content, smaller icon.'}
}));

/* ---------------- NOTIFICATIONS ---------------- */
function ntRender(o,k){
  const N=[['PN',2,'<b>Priya Nair</b> approved <b>PO-2291</b>','10 min ago · Procurement',1,0],['AK',5,'<b>Aiko Kato</b> mentioned you in <b>INV-10432</b>','1 h ago · Finance',1,0],['LS',3,'<b>Liam Shah</b> requested approval for <b>EXP-88</b> ($420.00)','3 h ago · Expenses',0,1],['CI',4,'Nightly import finished: 1,284 records','Yesterday · System',0,0]];
  if(o.variant==='toast')return `<div class="ds-col">${alertRender({variant:'toast',color:'info',icon:'with',content:'action'},k)}${B('Simulate notification',{sz:'s',attrs:'data-ds="toast" data-title="Priya Nair approved PO-2291" data-text="10 min ago"'})}</div>`;
  if(o.variant==='bell')return `<div class="ds-row" style="gap:18px"><span class="dx-bell">${IB('bell','Notifications, 2 unread')}${COUNT(2,{alert:1,sz:'s'})}</span><span class="dx-bell">${IB('message','Messages')}</span></div>`;
  const one=([i,c,t,m,un,act])=>`<div class="dx-notif${un?' is-unread':''}" tabindex="0">${AV(i,c,{sz:'s'})}<div><div class="dx-notif__t">${t}</div><div class="dx-notif__m">${m}</div>${act||o.variant==='actionable'?`<div class="dx-notif__acts">${B('Approve',{v:'primary',sz:'s',attrs:'data-ds="toast" data-v="success" data-title="EXP-88 approved"'})}${B('Reject',{sz:'s'})}</div>`:''}</div>${un?'<span class="ds-sr">Unread</span><span style="width:8px;height:8px;border-radius:50%;background:var(--pri);margin-top:6px" aria-hidden="true"></span>':'<span></span>'}</div>`;
  const rows=(o.variant==='actionable'?N.filter(n=>n[5]):N).map(([i,c,t,m,un,act])=>`<div class="dx-notif${un?' is-unread':''}" tabindex="0">${AV(i,c,{sz:'s'})}<div><div class="dx-notif__t">${t}</div><div class="dx-notif__m">${m}</div>${act||o.variant==='actionable'?`<div class="dx-notif__acts">${B('Approve',{v:'primary',sz:'s',attrs:'data-ds="toast" data-v="success" data-title="EXP-88 approved"'})}${B('Reject',{sz:'s'})}</div>`:''}</div>${un?'<span class="ds-sr">Unread</span><span style="width:8px;height:8px;border-radius:50%;background:var(--pri);margin-top:6px" aria-hidden="true"></span>':'<span></span>'}</div>`).join('');
  const head=`<div class="dx-cmdbar"><b style="padding:0 6px">Notifications</b>${COUNT(2,{alert:1,sz:'s'})}<span class="grow"></span>${B('Mark all as read',{v:'link',sz:'s'})}</div>`;
  if(o.variant==='grouped')return `<div class="ctx-frame" style="max-width:440px">${head}<div class="ds-faint ds-small" style="padding:8px 12px 2px">Today</div>${N.slice(0,3).map(one).join('')}<div class="ds-faint ds-small" style="padding:8px 12px 2px">Earlier</div>${N.slice(3).map(one).join('')}</div>`;
  return `<div class="ctx-frame" style="max-width:440px">${head}${rows}</div>`;
}
spec(S3({id:'components/notifications',title:'Notifications',noun:'Notification',icon:'bell',group:'Feedback',cls:['dx-notif','dx-bell'],
  desc:'Tell users about events that need attention: a notification centre, toasts, bell badges and actionable items.',
  dims:{variant:[['center','Notification centre'],['grouped','Grouped by day'],['actionable','Actionable (approve / reject)'],['toast','Toast'],['bell','Bell with badge']]},
  def:{variant:'center'},min:{all:'380px'},
  render:ntRender,
  anatomy:[['Panel','.ctx-frame',''],['Item','.dx-notif','Unread tint + dot + hidden text'],['Actions','.dx-notif__acts','Approve / reject in place'],['Bell','.dx-bell','Count in the name']],
  cases:[{t:'Approvals from the notification centre',area:'Finance · Expenses',d:'Approve without leaving the page.',html:k=>ntRender({variant:'actionable'},k)}],
  a11y:{aria:'Unread state is in text (“Unread”), not only the dot; bell button name includes the count; new items announced via the toast live region.'},keys:[['Tab','Next notification'],['Enter','Open']],
  props:[['items','Notification[]','—',''],['unreadCount','number','0',''],['onMarkRead','(id) => void','—',''],['actions','Action[]','—','Inline actions']],
  matrix:[['Centre','History of events','Nothing lost','Must be opened',1],['Toast','Real-time events','Immediate','Ephemeral',1],['Actionable','Approvals','Fast decisions','Needs permissions check',1]],
  rec:{v:'Notification centre with actionable approvals and a bell count',why:'Approvals are the most common enterprise notification; acting in place saves navigation.'},
  decide:[['Something happened','Toast + centre entry','Immediate and kept'],['Needs a decision','Actionable notification','Act in place'],['System-wide','Banner, not notification','Everyone sees it']],
  resp:{mobile:'Full-screen notification list.'}
}));

/* ---------------- AVATAR ---------------- */
function avRender(o,k){
  const z={xs:'s',s:'s',m:'',l:'l',xl:'xl'}[o.size]||'';
  switch(o.variant){
    case 'presence':return `<div class="ds-row" style="gap:14px">${['on','away','busy','off'].map((p,i)=>AV(EMP[i].i,EMP[i].c,{sz:z,pr:p,name:`${EMP[i].n}, ${{on:'available',away:'away',busy:'busy',off:'offline'}[p]}`})).join('')}</div>`;
    case 'group':return `<div class="ds-avgroup" role="group" aria-label="Approvers, 6 people">${EMP.slice(0,4).map(e=>AV(e.i,e.c,{sz:z,name:e.n})).join('')}<span class="ds-av ds-av--more${z?' ds-'+z:''}" role="img" aria-label="2 more">+2</span></div>`;
    case 'name':return `<div class="ds-col">${EMP.slice(0,3).map(e=>`<span class="ds-who">${AV(e.i,e.c,{sz:z,name:''})}<span><b style="display:block">${e.n}</b><span class="ds-faint ds-small">${e.r}</span></span></span>`).join('')}</div>`;
    case 'square':return `<div class="ds-row" style="gap:12px">${['LED','PRC','FIN'].map((x,i)=>AV(x,i+1,{sq:1,sz:z,name:x+' project'})).join('')}</div>`;
    case 'icon':return `<div class="ds-row" style="gap:12px"><span class="ds-av ds-av--more${z?' ds-'+z:''}" role="img" aria-label="Unknown user">${ic('user')}</span><span class="ds-av${z?' ds-'+z:''}" data-c="4" role="img" aria-label="System">${ic('bolt')}</span></div>`;
    default:return `<div class="ds-row" style="gap:12px">${EMP.slice(0,4).map(e=>AV(e.i,e.c,{sz:z,name:e.n})).join('')}</div>`;
  }
}
spec(S3({id:'components/avatars',title:'Avatar',noun:'Avatar',icon:'user',group:'Data Display',cls:['ds-av','ds-avgroup','ds-av__presence'],
  desc:'Represents a person, team or project, with optional presence.',
  dims:{variant:[['initials','Initials'],['presence','With presence'],['group','Group'],['name','With name and role'],['square','Project (square)'],['icon','Icon / unknown']]},
  def:{variant:'initials'},
  render:avRender,
  anatomy:[['Avatar','.ds-av','role=img with name'],['Presence','.ds-av__presence','Status in the name'],['Group','.ds-avgroup','Overlap + count']],
  cases:[{t:'Approvers on a purchase order',area:'ERP',d:'Group shows who must approve.',html:k=>`<div class="ds-row" style="gap:12px">${avRender({variant:'group',size:'m'},k)}<span class="ds-faint ds-small">4 of 6 approved</span></div>`}],
  a11y:{aria:'role="img" with the person’s name and presence; decorative when the name is shown next to it.'},
  props:[['name','string','—','For initials and label'],['src','string','—','Photo'],['size','xs | s | m | l | xl','m',''],['presence','available | away | busy | offline','—',''],['shape','circle | square','circle','Square for projects']],
  matrix:[['Initials','People without photos','Consistent','Same initials collide',1],['Presence','Collaboration','Context','Colour-dependent without text',0],['Group','Teams, approvers','Compact','Hides names',1]],
  rec:{v:'Initials avatar with name and role in lists',why:'Names remain readable; initials scale across thousands of users.'},
  decide:[['People in lists','Avatar + name','Recognition'],['Teams in a header','Group','Compact'],['Projects','Square','Distinguishes from people']],
  resp:{mobile:'Use Medium or Large for touch targets.'}
}));

/* ---------------- CHARTS ---------------- */
function chartSVG(type,k,o={}){
  const W=520,H=220,pl=42,pr=10,pt=14,pb=30;const data=[['Jun',182],['Jul',214],['Aug',198],['Sep',246],['Oct',268],['Nov',231]];const data2=[150,170,180,190,210,205];
  const max=300;const x=i=>pl+(W-pl-pr)/data.length*(i+.5);const y=v=>pt+(H-pt-pb)*(1-v/max);const bw=(W-pl-pr)/data.length*.5;
  const grid=[0,100,200,300].map(t=>`<line class="grid" x1="${pl}" x2="${W-pr}" y1="${y(t)}" y2="${y(t)}"/><text x="${pl-6}" y="${y(t)+4}" text-anchor="end">${t}k</text>`).join('');
  const xl=data.map((d,i)=>`<text x="${x(i)}" y="${H-10}" text-anchor="middle">${d[0]}</text>`).join('');
  let body='';
  if(type==='bar')body=data.map((d,i)=>`<g tabindex="0" data-tip role="img" aria-label="${d[0]}: $${d[1]}k"><rect class="s1" x="${x(i)-bw/2}" y="${y(d[1])}" width="${bw}" height="${y(0)-y(d[1])}" rx="2"/><text class="lbl" x="${x(i)}" y="${y(d[1])-5}" text-anchor="middle">${d[1]}</text></g>`).join('');
  if(type==='stacked')body=data.map((d,i)=>{const a=Math.round(d[1]*.6),b=d[1]-a;return `<g tabindex="0" role="img" aria-label="${d[0]}: hardware $${a}k, services $${b}k"><rect class="s1" x="${x(i)-bw/2}" y="${y(a)}" width="${bw}" height="${y(0)-y(a)}"/><rect class="s2" x="${x(i)-bw/2}" y="${y(d[1])}" width="${bw}" height="${y(a)-y(d[1])}"/></g>`}).join('');
  if(type==='line'||type==='area'){const p=data.map((d,i)=>`${x(i)},${y(d[1])}`).join(' L');const p2=data2.map((v,i)=>`${x(i)},${y(v)}`).join(' L');body=(type==='area'?`<path class="ar" d="M${p} L${x(5)},${y(0)} L${x(0)},${y(0)}Z"/>`:'')+`<path class="ln" d="M${p}"/><path class="ln2" d="M${p2}"/>`+data.map((d,i)=>`<circle class="pt" cx="${x(i)}" cy="${y(d[1])}" r="3.5"><title>${d[0]}: $${d[1]}k</title></circle>`).join('')+`<text class="lbl" x="${x(5)+6}" y="${y(data[5][1])-6}">${data[5][1]}k</text>`}
  if(type==='donut'){const parts=[['Hardware',46],['Services',28],['Software',18],['Other',8]];const cls=['s1','s2','s3',''];let a=-Math.PI/2;const R=70,r=44,cx=110,cy=105;const seg=parts.map(([n,v],i)=>{const a2=a+v/100*Math.PI*2;const L=v>50?1:0;const P=(rr,ang)=>`${cx+rr*Math.cos(ang)},${cy+rr*Math.sin(ang)}`;const d=`M${P(R,a)} A${R},${R} 0 ${L} 1 ${P(R,a2)} L${P(r,a2)} A${r},${r} 0 ${L} 0 ${P(r,a)}Z`;a=a2;return `<path class="${cls[i]}" d="${d}"${i===3?' style="fill:var(--fill-p)"':''}><title>${n}: ${v}%</title></path>`}).join('');
    return `<svg class="dx-chart" viewBox="0 0 ${W} 210" role="img" aria-label="Spend by category: Hardware 46%, Services 28%, Software 18%, Other 8%">${seg}<text class="lbl" x="${cx}" y="${cy}" text-anchor="middle" style="font-size:18px">$1.84M</text><text x="${cx}" y="${cy+16}" text-anchor="middle">Q4 spend</text>${parts.map(([n,v],i)=>`<rect class="${cls[i]}" x="230" y="${50+i*28}" width="12" height="12" rx="2"${i===3?' style="fill:var(--fill-p)"':''}/><text x="250" y="${60+i*28}" style="fill:var(--fg)">${n}</text><text x="${W-20}" y="${60+i*28}" text-anchor="end" class="lbl">${v}%</text>`).join('')}</svg>`}
  return `<svg class="dx-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Spend by month, June to November, thousands of dollars">${grid}<line class="axis" x1="${pl}" x2="${W-pr}" y1="${y(0)}" y2="${y(0)}"/>${body}${xl}</svg>`;
}
function chRender(o,k){
  if(o.variant==='spark')return `<div class="ds-stats">${[['Spend','$268k',[182,214,198,246,268]],['Orders','214',[180,190,201,208,214]],['Late','7',[12,10,9,8,7]]].map(([l,v,d])=>`<div class="ds-stat"><span class="ds-stat__label">${l}</span><span class="ds-stat__value">${v}</span>${spark(d)}</div>`).join('')}</div>`;
  const leg=o.variant==='line'||o.variant==='area'?`<div class="dx-legend"><span><i style="background:var(--pri)"></i>This year</span><span><i style="background:var(--new)"></i>Last year</span></div>`:o.variant==='stacked'?`<div class="dx-legend"><span><i style="background:var(--pri)"></i>Hardware</span><span><i style="background:color-mix(in srgb,var(--pri) 45%,var(--bg))"></i>Services</span></div>`:'';
  return `<div class="dx-chart-card"><div class="dx-chart-card__h"><b>${o.variant==='donut'?'Spend by category':'Procurement spend by month'}</b>${leg}</div>${chartSVG(o.variant,k)}${o.content==='table'?`<details><summary class="ds-small">Show data table</summary>${TBL(['Month',['Spend ($k)','num']],[['Jun','182'],['Jul','214'],['Aug','198'],['Sep','246'],['Oct','268'],['Nov','231']])}</details>`:''}</div>`;
}
spec(S3({id:'components/charts',title:'Charts',noun:'Chart',icon:'chart',group:'Data Display',cls:['dx-chart','dx-legend'],min:{all:'440px'},sizes:false,
  desc:'Visualise trends and composition. Every chart has a text alternative and uses semantic tokens for colour.',
  dims:{variant:[['bar','Bar'],['line','Line (comparison)'],['area','Area'],['stacked','Stacked bar'],['donut','Donut'],['spark','Sparklines (KPI)']],content:[['plain','Chart only'],['table','With data table']]},
  def:{variant:'bar',content:'table'},na:{size:'Charts are fluid; they scale to the container.'},
  render:chRender,
  anatomy:[['SVG','.dx-chart','role=img with summary'],['Grid','.grid',''],['Series','.s1 / .ln',''],['Labels','.lbl','Direct values'],['Legend','.dx-legend','Only when 2+ series'],['Data table','details','Accessible alternative']],
  cases:[{t:'Sales pipeline dashboard',area:'CRM',d:'Trend plus composition.',html:k=>`<div class="dx-split">${panel('',chRender({variant:'line',content:'plain'},k))}${panel('',chRender({variant:'donut',content:'plain'},k))}</div>`}],
  a11y:{aria:'SVG has role="img" and a summary label; bars are focusable with values in their names; a data table is available.',contrast:'Series colours come from tokens and are labelled directly, so colour is not the only key.'},
  props:[['type','bar | line | area | stacked | donut','bar',''],['data','Series[]','—',''],['showTable','boolean','true','Text alternative'],['valueFormat','(v) => string','—','']],
  matrix:[['Bar','Comparing periods or categories','Precise','Few series',1],['Line','Trends, comparisons','Shows change','Hard with many lines',1],['Donut','Parts of a whole (≤ 5)','Composition at a glance','Imprecise',0],['Sparkline','KPI tiles','Tiny','No axis',1]],
  rec:{v:'Bar chart with direct labels and a data table',why:'Most enterprise questions compare periods; labels and tables make values exact and accessible.'},
  decide:[['Compare months','Bar','Precise'],['Trend over time','Line','Change'],['Share of total','Donut (≤ 5 parts) or stacked bar','Composition'],['KPI tile','Sparkline','Compact']],
  resp:{mobile:'Fewer x-axis labels; tables scroll; donuts stack legend below.'}
}));

/* ---------------- RICH TEXT EDITOR ---------------- */
spec(S3({id:'components/rich-text-editor',title:'Rich Text Editor',noun:'Rich text editor',icon:'pen',group:'Forms',cls:['ds-editor','ds-rte','ds-toolbar'],min:{all:'480px'},sizes:false,
  desc:'Formatted text for descriptions, comments and emails.',
  dims:{variant:[['full','Full toolbar'],['minimal','Minimal (comment)'],['readonly','Read-only rendered']]},
  def:{variant:'full'},na:{size:'Editor text uses the body size.'},
  render:(o,k)=>{if(o.variant==='readonly')return `<div class="ds-rte" style="border:1px solid var(--sep);border-radius:var(--r)"><h3>Billing v2 cut-over</h3><p>Move <b>invoices</b>, line items and tax tables to the v2 schema.</p><ul><li>Freeze writes for 10 minutes</li><li>Run the schema diff</li></ul></div>`;if(o.variant==='minimal')return `<div class="ds-editor"><div class="ds-rte" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Comment" style="min-height:70px">Looks good. @Priya can you check the tax lines?</div><div class="ds-ed-foot"><span>${IB('bold','Bold',{sz:'s'})}${IB('link','Link',{sz:'s'})}</span>${B('Comment',{v:'primary',sz:'s'})}</div></div>`;return legacy('rich-text-editor').demo(k)},
  initCard(st,o,k){if(o.variant==='full')legacy('rich-text-editor').init(st,k)},
  anatomy:[['Toolbar','.ds-toolbar','role=toolbar; toggles with aria-pressed'],['Editable area','.ds-rte','role=textbox, aria-multiline'],['Footer','.ds-ed-foot','Word count, save state']],
  cases:[{t:'Case reply to a customer',area:'CRM · Service',d:'Formatting for clear replies.',html:k=>legacy('rich-text-editor').demo(k)}],
  a11y:{aria:'Labelled multi-line textbox; toolbar toggles reflect the selection.',keyboard:'Ctrl+B / I / U; Tab leaves the editor.'},keys:[['Ctrl+B / I / U','Format'],['Tab','Leave editor']],
  props:[['value','string (HTML / Markdown)','—',''],['toolbar','full | minimal | none','full',''],['readOnly','boolean','false',''],['mentions','User[]','—','']],
  matrix:[['Full toolbar','Descriptions, emails','Complete','Busy',1],['Minimal','Comments','Light','Limited formatting',1],['Read-only','Display','Same rendering','—',1]],
  rec:{v:'Minimal editor for comments, full for documents',why:'Match tools to the length of the writing.'},
  decide:[['Comment','Minimal','Light'],['Long description','Full toolbar','Structure'],['Display','Read-only','Consistency']],
  resp:{mobile:'Toolbar scrolls; key formats only.'}
}));
