'use strict';
/* =====================================================================
   COMPONENT SPECS 1 — Buttons, Inputs, Forms, Stepper, Tabs, Accordion, Cards
   ===================================================================== */
const STATES_STD=[['default','Default'],['hover','Hover'],['focus','Focus'],['active','Active / pressed'],['selected','Selected'],['disabled','Disabled'],['loading','Loading']];
const stAttr=s=>s==='disabled'?' disabled':s==='selected'?' aria-pressed="true"':s==='loading'?' aria-busy="true"':'';

/* ---------------- BUTTONS ---------------- */
function bx(o,label='Create',icn='plus'){
  const map={primary:'primary',secondary:'',tertiary:'subtle',ghost:'ghost',link:'link',danger:'danger',success:'success',warning:'warning',elevated:'elevated',tonal:'tonal',pill:'primary',square:'primary'};
  const v=map[o.variant]??'primary';
  const cls=['ds-btn',v?'ds-btn--'+v:'',st(o.state),o.layout==='block'?'is-block':'',o.variant==='pill'?'shape-pill':'',o.variant==='square'?'shape-square':''].filter(Boolean).join(' ');
  if(o.icon==='only')return `<button type="button" class="${cls} ds-ibtn" aria-label="${label}"${stAttr(o.state)}>${ic(icn)}</button>`;
  let inner=`<span>${label}</span>`;
  if(o.content==='badge')inner+=COUNT(3,{sz:'s'}).replace('ds-badge ','ds-badge ds-btn__badge ');
  if(o.content==='shortcut')inner+='<kbd>Ctrl S</kbd>';
  if(o.content==='avatar')inner=AV('MR',1,{sz:'s'}).replace('ds-av ','ds-av ds-av--btn ')+inner;
  if(o.content==='number')inner=`<span>${label} 3 issues</span>`;
  if(o.content==='rich')inner=`<span style="display:grid;text-align:left;line-height:1.2"><b style="font-weight:inherit">${label}</b><small style="font-size:.78em;opacity:.8">Ships to 3 approvers</small></span>`;
  const lead=o.icon==='leading'||o.icon==='both'?ic(icn):'';const trail=o.icon==='trailing'||o.icon==='both'?ic('chev-down'):'';
  return `<button type="button" class="${cls}"${stAttr(o.state)}${o.content==='rich'?' style="height:auto;padding-block:8px"':''}>${lead}${inner}${trail}</button>`;
}
function btnRender(o,k){
  if(o.variant==='icon')return `<div class="ds-row">${bx({...o,variant:'tertiary',icon:'only'},'Edit','edit')}${bx({...o,variant:'secondary',icon:'only'},'Filter','filter')}${bx({...o,variant:'primary',icon:'only'},'Create')}</div>`;
  if(o.variant==='toggle')return `<div class="ds-row">${B('Following',{icon:'check',keep:1,cls:st(o.state),attrs:'aria-pressed="true" data-ds="toggle"'})}${B('Watch',{icon:'eye',keep:1,attrs:'aria-pressed="false" data-ds="toggle"'})}</div>`;
  if(o.variant==='split'){const m=uid('sb');return `<div class="ds-anchor"><div class="ds-split">${bx({...o,variant:'primary',icon:'none'},'Post invoice')}<button type="button" class="ds-btn ds-btn--primary" data-ds="menu" aria-haspopup="menu" aria-expanded="false" aria-controls="${m}" aria-label="More posting options">${ic('chev-down')}</button></div>${MENU(m,{items:[{l:'Post and send',ic:'mail'},{l:'Post as draft',ic:'file'},{l:'Schedule posting',ic:'calendar'}],label:'Posting options'})}</div>`}
  if(o.variant==='fab')return `<div class="ds-row" style="gap:16px"><button type="button" class="ds-btn ds-btn--primary ds-fab" aria-label="New sales order">${ic('plus')}</button><button type="button" class="ds-btn ds-btn--primary ds-fab is-ext">${ic('plus')}<span>New order</span></button></div>`;
  const labels={primary:'Create',secondary:'Cancel',tertiary:'Edit',ghost:'Export',link:'View details',danger:'Delete',success:'Approve',warning:'Override',elevated:'Assign',tonal:'Duplicate',pill:'Create',square:'Create'};
  const icons={primary:'plus',secondary:'x',tertiary:'edit',ghost:'download',link:'external',danger:'trash',success:'check',warning:'warn',elevated:'user',tonal:'copy',pill:'plus',square:'plus'};
  const one=bx(o,labels[o.variant]||'Create',icons[o.variant]||'plus');
  switch(o.layout){
    case 'group':return `<div class="ds-bgroup" role="group" aria-label="View" data-ds="seg">${['List','Board','Timeline'].map((x,i)=>B(x,{attrs:`aria-pressed="${i===0}"`})).join('')}</div>`;
    case 'toolbar':return `<div class="ds-btoolbar" role="toolbar" aria-label="Order actions">${bx({...o,variant:'primary'},'New order')}<span class="sep" role="separator"></span>${bx({...o,variant:'tertiary',icon:'leading'},'Edit','edit')}${bx({...o,variant:'tertiary',icon:'leading'},'Copy','copy')}${bx({...o,variant:'tertiary',icon:'only'},'More','more')}</div>`;
    case 'stacked':return `<div class="ds-col" style="max-width:280px">${bx({...o,layout:'block',variant:'primary'},'Approve','check')}${bx({...o,layout:'block',variant:'secondary'},'Request changes','edit')}${bx({...o,layout:'block',variant:'tertiary'},'Reject','x')}</div>`;
    case 'pair':return `<div class="ds-row" style="justify-content:flex-end">${bx({...o,variant:'secondary',icon:'none'},'Cancel')}${one}</div>`;
    default:return `<div class="ds-row">${one}</div>`;
  }
}
spec({id:'components/buttons',title:'Buttons',icon:'cursor',group:'Actions',cls:['ds-btn','ds-ibtn','ds-bgroup','ds-split','ds-fab'],
  desc:'Trigger an action. Emphasis tells the user which action matters most on the screen.',
  dims:{variant:[['primary','Primary','The single most important action in an area.'],['secondary','Secondary','Alternative or cancelling actions.'],['tertiary','Tertiary','Low-emphasis and toolbar actions.'],['ghost','Ghost (outlined)','Secondary action that needs a visible boundary.'],['link','Link','Navigation styled inside text or tight rows.'],['danger','Destructive','Deletes or irreversibly changes data.'],['success','Success','Positive completion such as Approve.'],['warning','Warning','Proceeds despite a risk, e.g. Override.'],['tonal','Tonal','Medium emphasis without competing with Primary.'],['elevated','Elevated','Floats over busy content or images.'],['icon','Icon button','Dense toolbars and row actions; needs a tooltip.'],['toggle','Toggle','On / off state such as Follow or Watch.'],['split','Split button','A default action plus related alternatives.'],['fab','FAB','One floating primary action on mobile screens.'],['pill','Pill shape','Softer brands and touch-first layouts.'],['square','Square shape','Dense grids and attached controls.']],
    layout:[['single','Single'],['pair','Primary + secondary pair','Dialog and form footers.'],['group','Button group','Mutually exclusive choices.'],['toolbar','Toolbar','Many related commands.'],['stacked','Stacked','Mobile and narrow panels.'],['block','Full width','Mobile primary action, sign-in.']],
    icon:[['none','Text only'],['leading','Icon + text'],['trailing','Text + trailing icon','Opens a menu or moves forward.'],['only','Icon only','Always with aria-label and tooltip.'],['both','Leading + trailing']],
    state:STATES_STD,
    content:[['text','Text only'],['badge','Text + badge'],['shortcut','Text + shortcut'],['avatar','Avatar + text'],['number','Number + label'],['rich','Rich content']]},
  def:{variant:'primary',layout:'single',icon:'leading',state:'default',content:'text'},
  recommend:{variant:'primary',layout:'pair',icon:'leading'},
  render:btnRender,
  anatomy:[['Container','.ds-btn','Height --h-m, radius from language'],['Leading icon','.ds-ic','Optional; 16–20px'],['Label','span','Verb first: “Create order”'],['Badge or shortcut','.ds-badge / kbd','Optional supporting content'],['Focus ring','box-shadow: var(--ring)','Language-specific']],
  form:k=>vgrid(vcard('form','footer','Form footer',`<div class="ctx-frame"><div class="ctx-frame__h">New sales order</div><div class="ctx-frame__b">${TF({label:'Customer',val:'Fabrikam Health'})}</div><div class="ctx-frame__f">${B('Save draft',{v:'subtle'})}${B('Cancel')}${B('Create order',{v:'primary',attrs:'data-ds="feedback" data-title="Sales order created" data-text="SO-5513 was created for Fabrikam Health."'})}</div></div>`,k,{wide:true,note:'Primary on the right; one primary per form.'})),
  readonly:k=>vgrid(vcard('readonly','record','Read-only record header',scr('Invoice INV-10432',`${B('Edit',{icon:'edit',keep:1})}${B('Download PDF',{v:'subtle',icon:'download',keep:1})}`,kv([['Customer','Contoso Freight'],['Amount','$12,850.00'],['Status',BADGE('Paid','success')]])),k,{wide:true,note:'On read-only screens, actions move to the header and the primary action becomes Edit.'})),
  cases:[{t:'Purchase order approval',area:'ERP · Procurement',d:'Approve is primary; Reject is destructive but secondary in weight to avoid accidents.',html:k=>scr('PO-2291 · Laptops for Lisbon office',`${B('Reject',{v:'danger'})}${B('Request changes')}${B('Approve',{v:'primary',icon:'check',keep:1,attrs:'data-ds="feedback" data-title="PO-2291 approved" data-text="Procurement can place the order."'})}`,kv([['Vendor','Northwind Supplies'],['Total','$86,400.00'],['Requested by','Liam Shah']]),{badge:BADGE('Awaiting approval','warning')})},
    {t:'Bulk actions on a sales order list',area:'ERP · Sales',d:'Tertiary buttons in a selection toolbar keep focus on the data.',html:k=>`<div class="dx-cmdbar dx-cmdbar--sel"><b style="padding:0 8px">3 selected</b>${B('Assign',{v:'subtle',icon:'user',keep:1})}${B('Export',{v:'subtle',icon:'download',keep:1})}${B('Cancel orders',{v:'subtle',icon:'trash',keep:1})}</div>`},
    {t:'Mobile sticky action bar',area:'HR · Leave request',d:'Full-width stacked buttons at the bottom for thumbs.',html:k=>`<div class="ctx-frame ctx-mobile"><div class="ctx-frame__h">Leave request</div><div class="ctx-frame__b">${kv([['Dates','Nov 3 – Nov 7'],['Days','5']])}${bx({variant:'primary',layout:'block',icon:'none',state:'default',content:'text'},'Submit request')}${bx({variant:'secondary',layout:'block',icon:'none',state:'default',content:'text'},'Save draft')}</div></div>`,wide:false}],
  a11y:{keyboard:'Tab to focus; Enter or Space activates. Split button: Down arrow opens the menu.',aria:'Native button; toggles use aria-pressed; loading uses aria-busy; icon-only needs aria-label.',touch:'Large size (40–44px) on touch screens; FAB is 56px.'},
  keys:[['Tab','Move to the button'],['Enter / Space','Activate'],['↓','Open a split button’s menu']],
  do:['Start labels with a verb: “Create order”','Use Destructive only for irreversible actions'],dont:['Place two Primary buttons side by side','Use Link style for actions that change data'],
  ddDo:k=>`<div class="ds-row" style="justify-content:flex-end">${B('Cancel',{v:'subtle'})}${B('Approve',{v:'primary'})}</div>`,ddDont:k=>`<div class="ds-row">${B('Save',{v:'primary'})}${B('Approve',{v:'primary'})}${B('Send',{v:'primary'})}</div>`,
  props:[['variant','primary | secondary | tertiary | ghost | link | danger | success | warning | tonal | elevated','secondary','Visual emphasis'],['size','xs | s | m | l | xl','m','Height and type scale'],['icon','ReactNode','—','Leading icon'],['iconPosition','start | end | only','start','Icon placement'],['loading','boolean','false','Shows spinner, sets aria-busy'],['disabled','boolean','false','Native disabled'],['pressed','boolean','—','Toggle state (aria-pressed)'],['block','boolean','false','Full width'],['onClick','() => void','—','Action handler']],
  matrix:[['Primary','Main action per area','Clear next step','Loses meaning if repeated',1],['Secondary','Cancel, back, alternatives','Visible but quiet','Can compete with Primary in dense UIs',1],['Tertiary','Toolbars, row actions','Low noise','Can be missed',1],['Destructive','Delete, cancel order','Signals risk','Overuse causes fear',0],['Split','Post / Post and send','Saves space','Hidden options',0],['FAB','Mobile create','Thumb reach','Hides content; one per screen',0]],
  rec:{v:'Primary + secondary pair, icon + text, Medium',why:'It gives one obvious next step and a safe alternative, works in every language, and the icon speeds recognition in dense ERP screens.'},
  decide:[['Main action of a form or dialog','Primary','Strongest emphasis; one per region'],['Cancel or go back','Secondary or Tertiary','Visible without competing'],['Many actions in a table toolbar','Tertiary + overflow menu','Keeps attention on data'],['Irreversible delete','Destructive + confirmation dialog','Signals risk and prevents accidents'],['One main action on mobile','Full-width or FAB','Reachable by thumb'],['Default plus variants (Post / Post and send)','Split button','Keeps the common path one click']],
  resp:{desktop:'Inline buttons with icon + text.',tablet:'Toolbars collapse secondary actions into a More menu.',mobile:'Primary becomes full width at the bottom; secondary stacks below.'},
  respExtra:[['Mobile stacked',{layout:'stacked'},'Approve / Request changes / Reject stacked for thumbs.'],['Mobile FAB',{variant:'fab'},'One floating create action.']],
  searchExtra:[['Destructive button','v-basic-danger'],['FAB','v-basic-fab'],['Split button','v-basic-split'],['Button toolbar','v-layout-toolbar'],['Full-width button','v-layout-block']]
});
DOCS['components/buttons'].render=function(o,k){if(o.device==='mobile'&&o.layout==='single')o={...o,layout:'block'};return btnRender(o,k)};

/* ---------------- INPUTS ---------------- */
function inRender(o,k){
  const id=uid('in');const s=o.state;const fieldState=['error','success','warning','disabled'].includes(s)?' '+st(s):'';
  const msgs={error:'Enter a valid PO number, e.g. PO-2291',success:'PO number is available',warning:'A similar PO exists: PO-2290',disabled:'Set by the system',readonly:'',loading:'Checking…'};
  const helpTxt=o.content==='helper'||msgs[s]?(msgs[s]||'Format: PO-0000'):'';
  const val=s==='error'?'PO-22':'PO-2291';
  if(s==='readonly')return `<div class="ds-field"><span class="ds-label">PO number</span><div class="ds-readonly-val">${val}</div></div>`;
  let lead='',trail='';
  if(o.icon==='leading'||o.icon==='both')lead=ic('file');
  if(o.icon==='trailing'||o.icon==='both')trail=ic('search');
  if(o.content==='affix'){lead=`<span class="ds-addon ds-addon--pre">PO-</span>`;trail=`<span class="ds-addon">USD</span>`}
  if(o.content==='clear')trail+=`<button type="button" class="ds-x" aria-label="Clear">${ic('x')}</button>`;
  let type='text',vv=val;
  if(o.variant==='password'){type='password';vv='secret123';trail=`<button type="button" class="ds-x" aria-label="Show password" style="width:auto;padding:0 6px;border-radius:4px;font-size:12px">Show</button>`}
  if(o.variant==='number'){type='number';vv='48'}
  if(o.variant==='search'){lead=ic('search');vv='laptops'}
  if(o.content==='placeholder')vv='';
  const ctlCls=`ds-control${['hover','focus','loading'].includes(s)?' '+st(s):''}${o.variant==='search'?' ds-control--search':''}`;
  let control;
  if(o.variant==='textarea')control=`<div class="ds-control ds-control--area${['hover','focus'].includes(s)?' '+st(s):''}"><textarea id="${id}" rows="3"${s==='disabled'?' disabled':''}>Deliver to Lisbon office, dock 3.</textarea></div>`;
  else control=`<div class="${ctlCls}">${lead}<input id="${id}" type="${type}" value="${vv}"${o.content==='placeholder'?' placeholder="PO-0000"':''}${s==='disabled'?' disabled':''}${s==='error'?' aria-invalid="true"':''}${helpTxt?` aria-describedby="${id}-h"`:''}>${trail}</div>`;
  const label=o.layout==='inline'?'':`<label class="ds-label" for="${id}">${o.variant==='password'?'Password':o.variant==='number'?'Quantity':o.variant==='textarea'?'Delivery notes':o.variant==='search'?'Search items':'PO number'}${o.content==='required'?'<span class="req">*</span>':''}</label>`;
  const counter=o.content==='counter'?`<span class="ds-cnt">7/12</span>`:'';
  const hp=o.layout==='compact'?'':helpTxt?`<p class="ds-help" id="${id}-h">${HICON[s]?ic(HICON[s]):''}${helpTxt}</p>`:'';
  const wrapCls={outlined:'in-outlined',filled:'in-filled',underline:'in-underline',borderless:'in-borderless'}[o.variant]||'';
  const fcls=`ds-field${fieldState}${o.layout==='left'?' ds-field--inline':''}${o.variant==='floating'?' ds-field--float':''}`;
  const f=`<div class="${fcls}"${o.layout==='full'?'':' style="max-width:340px"'}>${label}${control}${counter?`<div style="display:flex;justify-content:space-between">${hp||'<span></span>'}${counter}</div>`:hp}</div>`;
  if(o.layout==='inline')return `<div class="fx--inline"><div class="${fcls}"><div class="${ctlCls}">${ic('search')}<input aria-label="Search orders" value="laptops"></div></div>${B('Search',{v:'primary'})}</div>`;
  return wrapCls?`<div class="${wrapCls}">${f}</div>`:f;
}
spec({id:'components/inputs',title:'Inputs',noun:'Input',icon:'form',group:'Forms',cls:['ds-field','ds-control','ds-label','ds-help'],
  desc:'Single- and multi-line text entry with labels, help, validation and affixes.',
  dims:{variant:[['default','Language default','The design language’s own field treatment.'],['outlined','Outlined','Clear boundaries in dense forms.'],['filled','Filled','Calm forms with fewer lines.'],['underline','Underline','Minimal, document-like screens.'],['borderless','Borderless (inline edit)','Editable cells and inline headings.'],['floating','Floating label','Saves vertical space; avoid for long labels.'],['password','Password','Masked with show / hide.'],['number','Number','Quantities and amounts.'],['search','Search','Filtering and lookup.'],['textarea','Text area','Notes and descriptions.']],
    layout:[['top','Label on top','Fastest to scan; default.'],['left','Label left','Read-heavy detail screens on desktop.'],['inline','Inline (no visible label)','Filter bars; label stays for screen readers.'],['full','Full width','Mobile and single-column forms.'],['compact','Compact (no helper)','Dense grids.']],
    icon:[['none','No icon'],['leading','Leading icon'],['trailing','Trailing icon'],['both','Both']],
    state:[['default','Default'],['hover','Hover'],['focus','Focus'],['disabled','Disabled'],['readonly','Read-only'],['loading','Loading'],['error','Error'],['success','Success'],['warning','Warning']],
    content:[['plain','Plain value'],['placeholder','Placeholder only'],['helper','With helper text'],['required','Required'],['counter','Character counter'],['affix','Prefix + suffix'],['clear','Clearable']]},
  def:{variant:'default',layout:'top',icon:'none',state:'default',content:'helper'},
  recommend:{variant:'default',layout:'top',icon:'none'},colors:false,
  na:{color:'Inputs use semantic colour only for validation states. See State variants.'},
  render:inRender,
  anatomy:[['Label','.ds-label','Always visible'],['Control frame','.ds-control','Border, fill and focus'],['Input','input','Native element'],['Leading / trailing','.ds-ic / .ds-addon','Icons, units, prefixes'],['Helper / error','.ds-help','Linked with aria-describedby'],['Counter','.ds-cnt','Optional']],
  cases:[{t:'Purchase order header',area:'ERP · Procurement',d:'Two-column header with units and validation.',html:k=>scr('New purchase order','',`<div class="fx fx--2">${TF({label:'Vendor',val:'Northwind Supplies',req:true})}${TF({label:'PO number',val:'PO-2292',state:'success',help:'PO number is available'})}${TF({label:'Delivery date',val:'Nov 14, 2026',lead:'calendar'})}${TF({label:'Budget',val:'86,400',suffix:'USD'})}</div>`)},
    {t:'Lead capture',area:'CRM · Leads',d:'Email validation shows inline in words.',html:k=>scr('New lead','',`<div class="fx fx--2">${TF({label:'Company',val:'Tailspin Air'})}${TF({label:'Work email',val:'dana@tailspin',state:'error',help:'Enter a full email, for example dana@tailspin.com',lead:'mail'})}</div>`)}],
  a11y:{aria:'Visible label tied with for/id; aria-describedby for help and errors; aria-invalid on error.',error:'Error text says what is wrong and how to fix it; announced on blur or submit, not per keystroke.'},
  keys:[['Tab','Move between fields'],['Esc','Clear a search field (native)']],
  do:['Keep labels visible above the field','Show units as suffixes, not in the label'],dont:['Use placeholder text as the label','Validate on every keystroke'],
  props:[['label','string','—','Visible label (required)'],['value','string','—','Controlled value'],['appearance','default | outlined | filled | underline | borderless','default','Field treatment'],['labelPosition','top | left | hidden','top','Label layout'],['helper','string','—','Help text'],['error','string','—','Error message; sets aria-invalid'],['prefix / suffix','ReactNode','—','Affixes'],['readOnly','boolean','false','Shows value as text'],['disabled','boolean','false','Native disabled'],['maxLength','number','—','Enables the counter']],
  matrix:[['Language default','Most forms','Consistent','—',1],['Outlined','Dense ERP forms','Clear boundaries','More lines on screen',1],['Filled','Light forms, mobile','Calm','Lower contrast boundary',0],['Underline','Document-like screens','Minimal','Weak affordance for new users',0],['Borderless','Inline editing in tables','No visual noise','Discoverability',0],['Floating label','Mobile, tight space','Saves height','Long labels truncate',0]],
  rec:{v:'Language default, label on top, helper text',why:'Top labels scan fastest, survive translation and work on mobile; the language default keeps every form consistent.'},
  decide:[['Long enterprise form','Label on top, language default','Fast scanning and translation-safe'],['Detail screen with many read values','Label left','Aligns labels into a column'],['Table cell editing','Borderless','Looks like text until focused'],['Filter bar','Inline with hidden label','Saves space; label still read aloud'],['Mobile','Full width, Large size','Easier tapping and reading']],
  resp:{desktop:'Two or three columns; label on top.',tablet:'Two columns collapse to one below ~720px.',mobile:'Full width, Large size, numeric keyboards for numbers.'},
  searchExtra:[['Password field','v-basic-password'],['Floating label input','v-basic-floating'],['Input error state','v-state-error']]
});

/* ---------------- FORMS ---------------- */
function f2(fields){return fields.map(f=>typeof f==='string'?f:TF(f)).join('')}
function formRender(o,k){
  const s=o.state;const err=s==='error',ok=s==='success',dis=s==='disabled',ro=s==='readonly';
  const st2=x=>dis?'disabled':x||'';
  const base=[{label:'Vendor',val:'Northwind Supplies',req:true,state:st2()},{label:'PO number',val:err?'':'PO-2292',req:true,state:err?'error':ok?'success':st2(),help:err?'Enter a PO number':ok?'PO number is available':''},{label:'Delivery date',val:'Nov 14, 2026',lead:'calendar',state:st2()},{label:'Budget',val:'86,400',suffix:'USD',state:st2()},{label:'Cost centre',val:'CC-410 Operations',state:st2()},{label:'Requester',val:'Liam Shah',lead:'user',state:st2()}];
  if(ro)return `<div class="dx-panel">${kv([['Vendor','Northwind Supplies'],['PO number','PO-2292'],['Delivery date','Nov 14, 2026'],['Budget','$86,400.00'],['Cost centre','CC-410 Operations'],['Requester','Liam Shah']])}</div>`;
  const acts=`<div class="fx-actions span-all">${B('Cancel',{v:'subtle'})}<button type="submit" class="ds-btn ds-btn--primary"${dis?' disabled':''}><span>Save order</span></button></div>`;
  const sum=err?`<div class="fx-err-sum">${ALERT('error','err','Fix 1 field to save','PO number is required.',[],{close:false})}</div>`:ok?`<div class="fx-err-sum">${ALERT('success','ok','Order saved','PO-2292 was saved as a draft.',[],{close:false})}</div>`:'';
  let body;
  switch(o.variant){
    case 'single':body=`<form class="fx fx--1" data-form novalidate>${sum}${f2(base.slice(0,4))}${acts}</form>`;break;
    case 'three':body=`<form class="fx fx--3" data-form novalidate>${sum}${f2(base)}${acts}</form>`;break;
    case 'inline':body=`<form class="fx--inline" data-form>${TF({label:'Vendor',val:'Northwind'})}${TF({label:'From',val:'Oct 1',lead:'calendar'})}${TF({label:'To',val:'Oct 31',lead:'calendar'})}${B('Apply',{v:'primary'})}</form>`;break;
    case 'compact':body=`<div class="dn-compact sz-s"><form class="fx fx--2" data-form novalidate>${sum}${f2(base)}${acts}</form></div>`;break;
    case 'dense':body=`<div class="dn-dense sz-xs"><form class="fx fx--3" data-form novalidate>${sum}${f2(base)}${f2([{label:'Incoterm',val:'DAP'},{label:'Payment terms',val:'Net 30'},{label:'Currency',val:'USD'}])}${acts}</form></div>`;break;
    case 'sections':body=`<form class="fx fx--1" style="max-width:640px" data-form novalidate>${sum}<fieldset class="fx-sec"><legend>Vendor</legend><div class="fx fx--2">${f2(base.slice(0,2))}</div></fieldset><fieldset class="fx-sec"><legend>Delivery</legend><div class="fx fx--2">${f2(base.slice(2,4))}</div></fieldset><fieldset class="fx-sec"><legend>Accounting</legend><div class="fx fx--2">${f2(base.slice(4))}</div></fieldset>${acts}</form>`;break;
    case 'collapsible':body=`<form class="fx fx--1" style="max-width:640px" data-form novalidate>${[['Vendor',base.slice(0,2),1],['Delivery',base.slice(2,4),0],['Accounting',base.slice(4),0]].map(([t,f,open])=>{const id=uid('cs');return `<div class="fx-sec"><div class="fx-sec__h"><button type="button" aria-expanded="${!!open}" aria-controls="${id}" data-collapse>${ic('chev-down')}${t}</button></div><div class="fx fx--2" id="${id}"${open?'':' hidden'}>${f2(f)}</div></div>`}).join('')}${acts}</form>`;break;
    case 'modal':body=ctxWrap(`<form class="fx fx--2" data-form novalidate>${f2(base.slice(0,4))}</form>`,'modal',k);break;
    case 'drawer':body=ctxWrap(`<form class="fx fx--1" data-form novalidate>${f2(base.slice(0,4))}</form>`,'drawer',k);break;
    case 'wizard':body=wizardHTML(WZ[2],k);break;
    default:body=`<form class="fx fx--2" data-form novalidate>${sum}${f2(base)}${acts}</form>`;
  }
  if(o.content==='conditional')body=`<form class="fx fx--2" data-form data-cond novalidate>${TF({label:'Vendor',val:'Northwind Supplies'})}<fieldset class="ds-choices"><legend class="ds-label">Delivery method</legend>${CHK('Ship to office',{radio:1,name:'dm'+o.variant,checked:1,attrs:'value="office"'})}${CHK('Pick up at warehouse',{radio:1,name:'dm'+o.variant,attrs:'value="pickup"'})}</fieldset><div data-show-when="office" class="span-all fx fx--2">${TF({label:'Office address',val:'Av. da Liberdade 110, Lisbon'})}${TF({label:'Dock',val:'3'})}</div><div data-show-when="pickup" class="span-all" hidden>${TF({label:'Warehouse',val:'WH-3 Porto'})}</div>${acts}</form>`;
  if(o.content==='dependent')body=`<form class="fx fx--2" data-form data-dep novalidate>${SEL({label:'Country',options:['Portugal','Germany','United States'],sel:0})}${SEL({label:'Region',options:['Lisbon','Porto','Faro'],sel:0})}${TF({label:'VAT rate',val:'23%',state:'disabled',help:'Calculated from country'})}${acts}</form>`;
  if(o.content==='lines')body=`<form class="fx fx--1" style="max-width:none" data-form novalidate>${TF({label:'Vendor',val:'Northwind Supplies'})}${TBL(['Item',['Qty','num'],['Unit price','money'],['Line total','money']],[['Laptop 14"','48','$1,800.00','$86,400.00'],['Docking station','48','$210.00','$10,080.00']],{foot:['Total','','','$96,480.00'],caption:'Order lines'})}${acts}</form>`;
  return body;
}
spec({id:'components/forms',title:'Forms',noun:'Form',icon:'form',group:'Forms',cls:['fx','fx-sec','fx-actions'],wideAll:true,min:{all:'520px'},
  desc:'Collect and validate structured data. Layout follows task complexity, from one column to dense multi-column ERP forms.',
  dims:{variant:[['two','Two column','Default for desktop ERP records.'],['single','Single column','Short forms, mobile, sign-up.'],['three','Three column','Very wide screens with short fields.'],['inline','Inline','Filter bars and quick entry.'],['compact','Compact','Data-entry heavy screens.'],['dense','Dense enterprise','Power users entering many fields.'],['sections','Sections','Long records grouped by topic.'],['collapsible','Collapsible sections','Optional or advanced groups.'],['modal','Modal form','Quick create without leaving context.'],['drawer','Drawer form','Edit alongside a list.'],['wizard','Wizard form','Long, ordered processes.']],
    state:[['default','Default'],['error','Validation errors'],['success','Saved'],['disabled','Disabled'],['readonly','Read-only']],
    content:[['basic','Basic fields'],['conditional','Conditional fields','Fields appear based on a choice.'],['dependent','Dependent fields','Options change with another field.'],['lines','Line items','Repeating rows with totals.']]},
  def:{variant:'two',state:'default',content:'basic'},colors:false,sizes:false,
  na:{color:'Forms use semantic colour only in validation messages.',size:'Forms inherit control sizes; see Compact and Dense variants.',icon:'Icons belong to fields; see Inputs.'},
  render:formRender,
  initCard(st){const f=st.querySelector('[data-form]');if(!f)return;
    f.addEventListener('submit',e=>{e.preventDefault();const k=kOf(f);const req=$$('input[required]',f).filter(i=>!i.value.trim());$$('.ds-field',f).forEach(x=>x.classList.remove('is-error'));req.forEach(i=>{const fl=i.closest('.ds-field');fl.classList.add('is-error');let h=fl.querySelector('.ds-help');if(!h){fl.insertAdjacentHTML('beforeend','<p class="ds-help"></p>');h=fl.querySelector('.ds-help')}h.innerHTML=ic('err')+'This field is required'});if(req.length){req[0].focus();toast(k,{title:`Fix ${req.length} field${req.length>1?'s':''}`,v:'error',text:'Required fields are empty.'})}else toast(k,{title:'Order saved',v:'success',text:'PO-2292 was saved.'})});
    f.addEventListener('click',e=>{const b=e.target.closest('[data-collapse]');if(b){const on=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(on));document.getElementById(b.getAttribute('aria-controls')).hidden=!on}});
    if(f.dataset.cond!=null)f.addEventListener('change',e=>{if(e.target.type==='radio')$$('[data-show-when]',f).forEach(x=>x.hidden=x.dataset.showWhen!==e.target.value)});
    if(f.dataset.dep!=null)f.addEventListener('ds-change',e=>{const v=e.detail.value;const R={Portugal:[['Lisbon','Porto','Faro'],'23%'],Germany:[['Berlin','Bavaria','Hamburg'],'19%'],'United States':[['California','Texas','New York'],'Varies by state']}[v];if(!R)return;const sels=$$('[data-ds="select"]',f);if(e.target!==sels[0])return;const lb=document.getElementById(sels[1].getAttribute('aria-controls'));lb.innerHTML=R[0].map((r,i)=>`<div class="ds-opt" role="option" aria-selected="${i===0}" data-label="${r}" data-value="${r}"><span class="ds-opt__main"><span class="ds-opt__label">${r}</span></span>${ic('check','ds-opt__tick')}</div>`).join('');sels[1].querySelector('.ds-val').textContent=R[0][0];f.querySelector('input[disabled]').value=R[1]})},
  anatomy:[['Form container','form.fx','Grid with gap tokens'],['Section','fieldset.fx-sec','Groups related fields'],['Field','.ds-field','Label, control, help'],['Error summary','.ds-alert','Lists problems at the top'],['Actions','.fx-actions','Primary on the right']],
  cases:[{t:'Vendor master record',area:'ERP · Purchasing',d:'Sections keep 20+ fields manageable.',html:k=>formRender({variant:'sections',state:'default',content:'basic'},k)},{t:'Employee onboarding (HR)',area:'HR',d:'Wizard for an ordered, multi-day process.',html:k=>wizardHTML(WZ[0],k)}],
  readonly:k=>vgrid(vcard('readonly','ro','Read-only record',formRender({variant:'two',state:'readonly',content:'basic'},k),k,{wide:true,note:'Values as text; no disabled fields.'})),
  form:k=>vgrid(vcard('form','val','Validation behaviour (try Save with an empty PO number)',formRender({variant:'two',state:'error',content:'basic'},k),k,{wide:true,data:{variant:'two',state:'error',content:'basic'},spec:'components/forms'})),
  a11y:{error:'An error summary appears at the top on submit and links to each field; inline errors are tied with aria-describedby.',keyboard:'Tab order follows visual order, row by row; Enter submits from text fields.'},
  keys:[['Tab','Next field'],['Shift+Tab','Previous field'],['Enter','Submit']],
  do:['Group related fields into sections with clear headings','Put the primary action at the bottom right'],dont:['Use three columns for long labels','Disable the Save button instead of explaining errors'],
  props:[['layout','1 | 2 | 3 | inline','2','Column count'],['density','comfortable | compact | dense','comfortable','Spacing'],['sections','Section[]','—','Grouped fields'],['validateOn','submit | blur','submit','When to show errors'],['readOnly','boolean','false','Render values as text'],['onSubmit','(values) => void','—','Submit handler']],
  matrix:[['Single column','Short forms, mobile','Fast completion, fewest errors','Long on desktop',1],['Two column','ERP records on desktop','Balanced density','Order must read left→right',1],['Three column','Wide screens, short fields','High density','Hard to scan',0],['Sections','Long records','Orientation','More scrolling',1],['Wizard','Ordered processes','Focus per step','Slower for experts',0],['Modal / drawer','Quick create / edit','Keeps context','Limited space',0]],
  rec:{v:'Two-column with sections on desktop, single column on mobile',why:'ERP records are long; two columns halve the height while keeping a readable order, and sections let users jump to what they need.'},
  decide:[['Fewer than 6 fields','Single column','Fastest to complete'],['Long ERP record','Two column + sections','Density with orientation'],['Ordered process with prerequisites','Wizard','One decision at a time'],['Quick create from a list','Modal form','Keeps the list in view'],['Edit while comparing rows','Drawer form','List stays visible'],['Expert bulk entry','Dense or compact','Fewer scrolls per record']],
  resp:{desktop:'Two or three columns.',tablet:'Two columns, then one below ~720px.',mobile:'Single column, full-width controls, actions stacked at the bottom.'},
  searchExtra:[['Conditional fields','v-content-conditional'],['Dependent fields','v-content-dependent'],['Dense enterprise form','v-basic-dense'],['Drawer form','v-basic-drawer']]
});

/* ---------------- STEPPER ---------------- */
const STEPS0=[['Basic information','Name and type','user'],['Address','Billing and shipping','home'],['Contact','Phone and email','mail'],['Documents','Tax and bank proof','file'],['Review','Check and submit','eye']];
function stModel(o){
  let states=['done','done','cur','up','up'];
  const sMap={active:'cur',error:'err',warning:'warn',loading:'load',locked:'lock',disabled:'dis',skipped:'skip',optional:'cur',partial:'part',completed:'done',upcoming:'up'};
  if(o.state&&o.state!=='active'){if(o.state==='completed')states=['done','done','done','done','done'];else if(o.state==='upcoming')states=['done','done','up','up','up'];else states[2]=sMap[o.state]||'cur'}
  if(o.icon==='warning')states[2]='warn';if(o.icon==='error')states[2]='err';
  return STEPS0.map((s,i)=>({t:s[0],d:s[1],ic:s[2],s:states[i],opt:o.state==='optional'&&i===2}));
}
function stDot(st0,i,o){
  const icx={done:'check',err:'err',warn:'warn',lock:'lock'}[st0.s];
  if(o.icon==='icons'||o.icon==='icononly'||o.icon==='custom')return st0.s==='done'?ic('check'):ic(o.icon==='custom'?['user','home','phone','file','eye'][i].replace('phone','mail'):st0.ic);
  if(o.icon==='none')return st0.s==='done'?'':String(i+1);
  if(st0.s==='part')return `<span>${i+1}</span>`;
  if(icx&&o.icon!=='numicon')return ic(icx);
  return String(i+1);
}
function stBody(st0,i,o){
  let x=`<span class="dx-st__t">${o.icon==='numicon'?ic(st0.ic)+' ':''}${st0.t}${st0.opt?' <span class="dx-st__opt">(optional)</span>':''}</span>`;
  switch(o.content){
    case 'desc':x+=`<span class="dx-st__d">${st0.d}</span>`;break;
    case 'meta':x+=`<span class="dx-st__m">${['3 fields','6 fields','2 fields','2 files','—'][i]} · ${['Maya','Maya','You','—','—'][i]}</span>`;break;
    case 'status':x+=`<span class="dx-st__m">${{done:BADGE('Complete','success',{sz:'s'}),cur:BADGE('In progress','info',{sz:'s'}),up:BADGE('Not started','',{sz:'s'}),err:BADGE('Needs fixes','danger',{sz:'s'}),warn:BADGE('Check','warning',{sz:'s'})}[st0.s]||BADGE(st0.s,'',{sz:'s'})}</span>`;break;
    case 'time':x+=`<span class="dx-st__m">${['Oct 18, 09:12','Oct 18, 09:20','Now','—','—'][i]}</span>`;break;
    case 'action':x+=st0.s==='done'?`<a class="ds-link dx-st__a" href="#">Edit</a>`:'';break;
    case 'validation':x+=st0.s==='cur'||st0.s==='err'?`<span class="dx-st__v">${ic('err')}2 required fields missing</span>`:'';break;
    case 'iconc':x=`<span class="dx-st__t">${ic(st0.ic)} ${st0.t}</span>`;break;
  }
  return `<span class="dx-st__b">${x}</span>`;
}
function stList(o,steps,extra=''){
  const cls=['dx-st'];const sch=o.scheme||'same';cls.push('dx-st--'+(sch==='semantic'?'status':sch));
  const vert=o.layout==='vertical'||o.layout==='sidebar'||o.variant==='timeline'||(o.device==='mobile'&&!o.mobileMode);
  if(vert)cls.push('dx-st--v');
  if(o.variant==='circle')cls.push('dx-st--dots');if(o.variant==='line')cls.push('dx-st--line');if(o.variant==='pill')cls.push('dx-st--pill');if(o.variant==='timeline')cls.push('dx-st--timeline');if(o.variant==='card')cls.push('dx-st--card');
  if(o.layout==='top'||o.layout==='inline')cls.push('dx-st--inline');
  if(o.layout==='full')cls.push('dx-st--center');
  if(o.layout==='compact'||o.mobileMode==='compact')cls.push('dx-st--compact','dx-st--inline');
  if(o.icon==='icononly'||o.mobileMode==='icononly')cls.push('dx-st--icononly','dx-st--inline');
  return `<ol class="${cls.join(' ')}" aria-label="Progress"${extra}>${steps.map((s,i)=>`<li class="dx-st__s is-${{done:'done',cur:'cur',up:'up',err:'err',warn:'warn',load:'load',lock:'lock',dis:'dis',skip:'skip',part:'part'}[s.s]}"${s.s==='cur'?' aria-current="step"':''}>${o.variant==='line'?'<span class="dx-st__bar"></span>':''}<span class="dx-st__dot" aria-hidden="true">${stDot(s,i,o)}</span>${stBody(s,i,o)}${o.variant==='pill'&&i<steps.length-1?`<span class="dx-st__chev">${ic('chev-right')}</span>`:''}<span class="ds-sr">${{done:'Completed',cur:'Current step',up:'Not started',err:'Has errors',warn:'Needs review',load:'Saving',lock:'Locked',dis:'Unavailable',skip:'Skipped',part:'Partly complete'}[s.s]}</span></li>`).join('')}</ol>`;
}
function stPanel(steps){const c=steps.findIndex(s=>s.s!=='done');const cur=steps[c<0?steps.length-1:c];return `<div class="dx-st-panel"><h4>${cur.t}</h4><div class="fx fx--2">${TF({label:'Phone',val:'+351 21 000 4410',lead:'mail',sz:'s'})}${TF({label:'Email',val:'ap@northwind.example',sz:'s'})}</div><div class="dx-st-nav"><span class="ds-faint ds-small">Step ${c+1} of ${steps.length}</span><div class="ds-row">${B('Back',{attrs:'data-stnav="-1"'})}${B('Continue',{v:'primary',attrs:'data-stnav="1"'})}</div></div></div>`}
function stRender(o,k){
  const steps=stModel(o);
  if(o.variant==='progress'){const done=steps.filter(s=>s.s==='done').length;const cur=steps[done]||steps[steps.length-1];return `<div class="dx-stp" style="--c-done:var(--pri)"><div class="dx-stp__head"><span>Step <b>${Math.min(done+1,steps.length)}</b> of ${steps.length} · <b>${cur.t}</b></span><span>${Math.round(done/steps.length*100)}%</span></div><div class="dx-stp__track" role="progressbar" aria-label="Progress" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${steps.length}"><div class="dx-stp__fill" style="--v:${done/steps.length*100}%"></div></div><div class="dx-stp__labels">${steps.map((s,i)=>`<span class="${i===done?'on':''}">${s.t}</span>`).join('')}</div></div>`}
  if(o.layout==='compact'||o.mobileMode==='compact'){const c=steps.findIndex(s=>s.s!=='done');return `<div><div class="dx-st-compact-label"><span>Step <b>${c+1}</b> of ${steps.length}: <b>${steps[c].t}</b></span><span>Next: ${steps[c+1]?steps[c+1].t:'Submit'}</span></div>${stList({...o,layout:'compact'},steps)}</div>`}
  const list=stList(o,steps);
  if(o.device==='tablet'&&!o.mobileMode&&o.layout==='horizontal')return `<div class="dx-st-scroll">${list}</div>`;
  switch(o.layout){
    case 'top':return `<div class="ds-col" data-stbox>${list}${stPanel(steps)}</div>`;
    case 'bottom':return `<div class="ds-col" data-stbox>${stPanel(steps).replace(/<div class="dx-st-nav">[\s\S]*<\/div><\/div>$/,'</div>')}<div class="dx-st-nav" style="border-top:1px solid var(--sep);padding-top:12px">${B('Back',{attrs:'data-stnav="-1"'})}<div style="flex:1;max-width:420px">${stList({...o,layout:'inline'},steps)}</div>${B('Continue',{v:'primary',attrs:'data-stnav="1"'})}</div></div>`;
    case 'sidebar':return `<div class="dx-st-side" data-stbox><nav aria-label="Steps">${list}</nav>${stPanel(steps)}</div>`;
    case 'full':return `<div class="dx-st-band" data-stbox>${list}</div>`;
  }
  return `<div data-stbox>${list}</div>`;
}
function stNavInit(st){
  st.addEventListener('click',e=>{const b=e.target.closest('[data-stnav]');if(!b)return;const box=st;const lis=$$('.dx-st__s',box);let c=lis.findIndex(l=>!l.classList.contains('is-done'));if(c<0)c=lis.length;const n=Math.max(0,Math.min(lis.length,c+(+b.dataset.stnav)));
    lis.forEach((l,i)=>{l.className='dx-st__s '+(i<n?'is-done':i===n?'is-cur':'is-up');l.toggleAttribute('aria-current',i===n);const d=l.querySelector('.dx-st__dot');if(d&&!l.closest('.dx-st--dots,.dx-st--compact,.dx-st--timeline'))d.innerHTML=i<n?ic('check'):String(i+1);const sr=l.querySelector('.ds-sr');if(sr)sr.textContent=i<n?'Completed':i===n?'Current step':'Not started'});
    const h=st.querySelector('.dx-st-panel h4');if(h&&lis[n])h.textContent=lis[n].querySelector('.dx-st__t').textContent;const lab=st.querySelector('.dx-st-nav .ds-faint');if(lab)lab.textContent=n>=lis.length?'All steps complete':`Step ${n+1} of ${lis.length}`;if(n>=lis.length)toast(kOf(st),{title:'Submitted',v:'success',text:'All steps complete.'})});
}
/* wizard engine, reused by Stepper, Forms and Wizard pages */
const WZ=[
  {t:'Employee onboarding',area:'HR',steps:[['Basic information',[['Full name','Maya Ruiz',1],['Job title','Engineering lead',1]]],['Address',[['Street','Rua Augusta 12',1],['City','Lisbon',1]]],['Contact',[['Work email','',1],['Phone','+351 21 000 1200',0]]],['Documents',[['Tax ID','PT 500 112 004',1],['Bank IBAN','',1]]],['Review',[]],['Submit',[]]]},
  {t:'Customer creation',area:'CRM',steps:[['Company',[['Company name','Fabrikam Health',1],['Industry','Healthcare',0]]],['Billing address',[['Street','5th Ave 300',1],['City','New York',1]]],['Primary contact',[['Name','Chen Li',1],['Email','',1]]],['Credit',[['Credit limit','50,000',1],['Payment terms','Net 30',1]]],['Review',[]]]},
  {t:'Purchase order creation',area:'ERP · Procurement',steps:[['Vendor',[['Vendor','Northwind Supplies',1],['Contact','Ana Costa',0]]],['Items',[['Item','Laptop 14"',1],['Quantity','48',1]]],['Delivery',[['Delivery date','',1],['Warehouse','WH-3 Lisbon',1]]],['Approval',[['Cost centre','CC-410',1],['Approver','Priya Nair',1]]],['Review',[]]]},
  {t:'Sales order creation',area:'ERP · Sales',steps:[['Customer',[['Customer','Contoso Freight',1],['PO reference','CF-7781',0]]],['Products',[['Product','Freight insurance',1],['Quantity','12',1]]],['Pricing',[['Discount %','5',0],['Currency','USD',1]]],['Shipping',[['Ship date','',1],['Carrier','Tailspin Logistics',1]]],['Review',[]]]},
  {t:'Invoice creation',area:'Finance',steps:[['Customer',[['Customer','Litware Labs',1],['Billing email','',1]]],['Lines',[['Description','Implementation services',1],['Amount','24,000',1]]],['Tax',[['Tax code','VAT 23%',1]]],['Terms',[['Due date','Dec 1, 2026',1]]],['Review',[]]]},
  {t:'Product creation',area:'ERP · Inventory',steps:[['Basics',[['Product name','Docking station',1],['SKU','INV-1043',1]]],['Pricing',[['List price','210.00',1],['Cost','140.00',1]]],['Inventory',[['Reorder point','',1],['Warehouse','WH-3',1]]],['Media',[['Image URL','',0]]],['Review',[]]]},
  {t:'Vendor onboarding',area:'ERP · Purchasing',steps:[['Company',[['Legal name','Adatum Parts Ltd',1],['Registration no.','UK 0912 4471',1]]],['Banking',[['IBAN','',1],['SWIFT','ADTMGB2L',1]]],['Compliance',[['Tax certificate','',1]]],['Contacts',[['Accounts email','ap@adatum.example',1]]],['Review',[]]]},
  {t:'User creation',area:'Administration',steps:[['Account',[['Full name','Tomás Weber',1],['Email','',1]]],['Role',[['Role','Data engineer',1]]],['Access',[['Workspace','Ledger Migration',1]]],['Review',[]]]},
  {t:'Loan application',area:'Finance',steps:[['Applicant',[['Full name','Dana Park',1],['Date of birth','',1]]],['Income',[['Annual income','84,000',1],['Employer','Tailspin Air',1]]],['Loan',[['Amount','25,000',1],['Term (months)','36',1]]],['Documents',[['Payslip','',1]]],['Review',[]]]},
  {t:'Insurance application',area:'Finance',steps:[['Policyholder',[['Full name','Ben Okafor',1],['Policy type','Fleet vehicles',1]]],['Coverage',[['Vehicles','24',1],['Start date','',1]]],['History',[['Claims (3 yrs)','2',0]]],['Payment',[['Billing frequency','Monthly',1]]],['Review',[]]]}
];
function wizardHTML(def,k,o={}){
  const steps=def.steps;
  return `<div class="dx-wz" data-init="wizard" data-wz="${WZ.indexOf(def)}">${stList({layout:o.vertical?'vertical':'horizontal',icon:'check',content:o.content||'none',scheme:'semantic',variant:'numbered'},steps.map((s,i)=>({t:s[0],d:'',s:i===0?'cur':'up',ic:'file'})))}<div class="dx-st-panel dx-wz__body"></div></div>`;
}
INITS.wizard=(el,k)=>{
  const def=WZ[+el.dataset.wz];let cur=0;const vals={};const errs={};
  const lis=()=>$$('.dx-st__s',el);const body=el.querySelector('.dx-wz__body');
  const paint=()=>{lis().forEach((l,i)=>{const s=errs[i]?'err':i<cur?'done':i===cur?'cur':'up';l.className='dx-st__s is-'+s;l.toggleAttribute('aria-current',i===cur);l.querySelector('.dx-st__dot').innerHTML=s==='done'?ic('check'):s==='err'?ic('err'):String(i+1);const v=l.querySelector('.dx-st__v');if(v)v.remove();if(errs[i])l.querySelector('.dx-st__b').insertAdjacentHTML('beforeend',`<span class="dx-st__v">${ic('err')}${errs[i]} required field${errs[i]>1?'s':''} missing</span>`)});
    const [title,fields]=def.steps[cur];const isRev=!fields.length;
    body.innerHTML=`<h4>${title}</h4>${isRev?`<dl class="dx-wz__review">${def.steps.flatMap(s=>s[1]).map(([l])=>`<dt>${l}</dt><dd>${esc(vals[l]??def.steps.flatMap(s=>s[1]).find(f=>f[0]===l)[1]??'')||'<span class="ds-faint">—</span>'}</dd>`).join('')}</dl>`:`<div class="fx fx--2">${fields.map(([l,v,req])=>TF({label:l,val:vals[l]??v,req:!!req,attrs:`data-f="${esc(l)}"`})).join('')}</div>`}<div class="dx-st-nav"><span class="ds-faint ds-small">Step ${cur+1} of ${def.steps.length} · ${def.t}</span><div class="ds-row">${B('Back',{attrs:`data-wz-go="-1"${cur===0?' disabled':''}`})}${B(cur===def.steps.length-1?'Submit':'Continue',{v:'primary',attrs:'data-wz-go="1"'})}</div></div>`;
  };
  const save=()=>$$('[data-f]',body).forEach(i=>vals[i.dataset.f]=i.value);
  el.addEventListener('click',e=>{const b=e.target.closest('[data-wz-go]');if(!b)return;save();const dir=+b.dataset.wzGo;
    if(dir>0){const miss=$$('[data-f][required]',body).filter(i=>!i.value.trim());$$('.ds-field',body).forEach(f=>f.classList.remove('is-error'));if(miss.length){errs[cur]=miss.length;miss.forEach(i=>{const f=i.closest('.ds-field');f.classList.add('is-error');f.insertAdjacentHTML('beforeend',`<p class="ds-help">${ic('err')}${i.closest('.ds-field').querySelector('.ds-label').textContent.replace('*','')} is required</p>`)});paint();body.querySelector('[aria-invalid],.is-error input')?.focus();return}delete errs[cur];
      if(cur===def.steps.length-1){toast(k,{title:`${def.t} submitted`,v:'success',text:'Sent for approval. You can track it in Workflow.'});return}}
    cur=Math.max(0,Math.min(def.steps.length-1,cur+dir));paint();body.querySelector('input')?.focus()});
  paint();
};
const RO_FLOWS=[
  {t:'Completed workflow',area:'ERP',rows:[['Created','Liam Shah','Oct 14, 09:12','Created'],['Submitted','Liam Shah','Oct 14, 09:40','Submitted'],['Approved','Priya Nair','Oct 15, 11:02','Approved'],['Processed','System','Oct 15, 11:05','Processed'],['Completed','System','Oct 16, 08:00','Completed']]},
  {t:'Purchase approval history',area:'ERP · Procurement',rows:[['Submitted','Liam Shah','Oct 18, 09:12','Submitted'],['Manager approval','Priya Nair','Oct 18, 14:30','Approved'],['Finance approval','Maya Ruiz','Oct 19, 10:05','Approved'],['Ordered','Procurement','Oct 19, 10:20','Processed']]},
  {t:'Approval workflow (rejected and resubmitted)',area:'Finance · Expense',rows:[['Submitted','Jonas Ortiz','Oct 10, 16:00','Submitted'],['Manager review','Aiko Kato','Oct 11, 09:10','Rejected'],['Resubmitted','Jonas Ortiz','Oct 11, 12:40','Submitted'],['Manager review','Aiko Kato','Oct 11, 15:05','Approved'],['Paid','Payroll','Oct 25, 00:00','Completed']]},
  {t:'Audit workflow',area:'Finance · Journal JE-8812',rows:[['Prepared','Priya Nair','Sep 30, 17:00','Prepared'],['Reviewed','Maya Ruiz','Oct 1, 10:00','Reviewed'],['Posted','System','Oct 1, 10:01','Posted'],['Audited','External auditor','Oct 20, 14:00','Audited']]},
  {t:'Order lifecycle',area:'ERP · Sales SO-5512',rows:[['Order placed','Fabrikam Health','Oct 12','Placed'],['Picked','WH-3 Lisbon','Oct 13','Processed'],['Shipped','Tailspin Logistics','Oct 14','Shipped'],['Delivered','Carrier','Oct 17','Completed'],['Invoiced','Finance','Oct 17','Completed']]},
  {t:'Employee onboarding history',area:'HR · Liam Shah',rows:[['Offer accepted','Liam Shah','Sep 1','Completed'],['Equipment issued','IT','Sep 28','Completed'],['Accounts created','IT','Sep 29','Completed'],['Day 1 orientation','HR','Oct 1','Completed'],['30-day review','Priya Nair','Oct 31','Scheduled']]}
];
const roBadge=s=>BADGE(s,{Rejected:'danger',Scheduled:'',Submitted:'info',Prepared:'info'}[s]??'success',{sz:'s'});
const roFlow=f=>`<ol class="dx-st dx-st--v dx-st--status" aria-label="${f.t}">${f.rows.map(([t,u,ts,s])=>`<li class="dx-st__s ${s==='Scheduled'?'is-up':s==='Rejected'?'is-err':'is-done'}"><span class="dx-st__dot" aria-hidden="true">${s==='Scheduled'?'':s==='Rejected'?ic('x'):ic('check')}</span><span class="dx-st__b"><span class="dx-st__t">${t} ${roBadge(s)}</span><span class="dx-st__m">${u} · <time>${ts}</time></span></span></li>`).join('')}</ol>`;
spec({id:'components/steppers',title:'Stepper',noun:'Stepper',icon:'steps',group:'Navigation',cls:['dx-st','dx-st__s','dx-st__dot','dx-stp'],
  desc:'Shows progress through an ordered process and where the user is now. Used for multi-step forms, approvals and lifecycles.',
  overview:'The stepper is the most-varied component in enterprise UIs: it appears in onboarding, order creation, approvals and audit trails. Use the explorer to combine orientation, style, icons, colour scheme, state and content; every section below holds the others at their defaults.',
  dims:{variant:[['numbered','Numbered','Default; position is explicit.'],['circle','Circle (dots)','Compact progress where labels carry the meaning.'],['line','Line segments','Minimal headers, Apple-like.'],['pill','Pill','Breadcrumb-like flows with few steps.'],['progress','Progress bar','Long flows where only position matters.'],['timeline','Timeline','History and audit trails.'],['card','Card','Steps with rich status or ownership.']],
    layout:[['horizontal','Horizontal','Desktop forms with ≤ 6 short steps.'],['vertical','Vertical','Mobile, long labels, many steps.'],['top','Top stepper','Above a form panel.'],['bottom','Bottom stepper','Navigation next to the actions.'],['sidebar','Sidebar stepper','Long wizards that need orientation.'],['compact','Compact','Tight headers; current step named.'],['full','Full width','Centred band above a page.']],
    icon:[['none','Without icons'],['check','Check for completed'],['icons','With icons'],['numicon','Number + icon'],['icononly','Icon only'],['warning','Warning icon'],['error','Error icon'],['custom','Custom icons']],
    scheme:[['same','Same colour'],['status','Status colours'],['semantic','Semantic'],['brand','Brand'],['mono','Monochrome']],
    state:[['active','Active'],['upcoming','Upcoming'],['completed','Completed'],['disabled','Disabled'],['error','Error'],['warning','Warning'],['skipped','Skipped'],['optional','Optional'],['locked','Locked'],['loading','Loading'],['partial','Partially completed']],
    content:[['none','Text only'],['desc','Title + description'],['meta','Title + metadata'],['status','Title + status'],['iconc','Title + icon'],['time','Title + timestamp'],['action','Title + action'],['validation','Title + validation']]},
  dimLabel:{variant:'Style',layout:'Orientation',scheme:'Color scheme'},secOf:{scheme:'color'},
  def:{variant:'numbered',layout:'horizontal',icon:'check',scheme:'semantic',state:'active',content:'desc'},
  recommend:{variant:'numbered',layout:'horizontal',icon:'check'},colors:false,colorSelf:true,min:{all:'420px',layout:'520px'},wide:{layout:true},
  render:stRender,initCard:stNavInit,
  custom:{
    color:k=>{const d=defO(DOCS['components/steppers']);return vgrid([['same','Same colour','All steps use primary; calm, brand-led.'],['status','Status colours','Completed green, current blue, upcoming neutral.'],['semantic','Semantic','Status colours plus red errors and amber warnings.'],['brand','Brand colour','Marketing-facing portals.'],['mono','Monochrome','Print, reports, low-colour contexts.']].map(([v,l,n])=>vcard('color',v,l,stRender({...d,scheme:v,state:v==='semantic'?'error':'active'},k),k,{note:n,rec:v==='semantic'})).join('')+vcard('color','dark','Dark theme',stRender({...d},k),k,{theme:'dark',note:'Same tokens, dark values.'})+vcard('color','hc','High contrast',stRender({...d},k),k,{theme:'hc',note:'Black borders and stronger primary.'}),'420px')},
    state:k=>{const d=defO(DOCS['components/steppers']);const DS={active:'The step the user is on.',upcoming:'Not reached yet.',completed:'Done and editable unless locked.',disabled:'Not available in this flow.',error:'Has invalid or missing data.',warning:'Has data to review.',skipped:'Bypassed on purpose.',optional:'Can be skipped.',locked:'Requires earlier approval.',loading:'Saving or validating.',partial:'Started but not finished.'};return vgrid(DOCS['components/steppers'].dims.state.map(([v,l])=>vcard('state',v,l,stRender({...d,layout:'inline',state:v,content:'none'},k),k,{note:DS[v]})).join(''),'420px')},
    form:k=>`<div class="ds-col"><div class="picker" role="group" aria-label="Form use case" data-wzpick>${WZ.map((w,i)=>`<button type="button" aria-pressed="${i===0}" data-i="${i}">${w.t}</button>`).join('')}</div><div data-wzhost>${vcard('form','wizard',WZ[0].t,wizardHTML(WZ[0],k),k,{wide:true,sub:WZ[0].area,note:'Continue validates required fields and marks the step in error; Back keeps entered values; Review summarises everything.'})}</div><h3 class="sub-h">All ten use cases</h3>${tableHTML(['Use case','Area','Steps'],WZ.map(w=>[w.t,w.area,w.steps.map(s=>s[0]).join(' → ')]),'uc-table')}</div>`,
    readonly:k=>vgrid(RO_FLOWS.map(f=>vcard('readonly',slug(f.t),f.t,roFlow(f),k,{sub:f.area})).join(''),'360px'),
    cases:k=>{const d=defO(DOCS['components/steppers']);return vgrid([['card','Inside a card',`<div class="ds-card"><div class="ds-card__body"><b>Vendor onboarding · Adatum Parts</b>${stRender({...d,layout:'inline',content:'none'},k)}</div></div>`],['modal','Inside a modal',ctxWrap(stRender({...d,layout:'top',content:'none'},k),'modal',k)],['drawer','Inside a drawer',ctxWrap(stRender({...d,layout:'vertical',content:'desc'},k),'drawer',k)],['page','Full-page form',scr('New customer','',stRender({...d,layout:'top',content:'none'},k),{crumbs:['CRM','Customers','New']})],['dashboard','In a dashboard widget',ctxWrap(`${stRender({...d,variant:'progress'},k)}<p class="ds-faint ds-small" style="margin:0">12 vendors in onboarding · 3 blocked</p>`,'dashboard',k)],['side','In a side panel',`<div class="dx-split"><div class="dx-panel"><b>Sales order SO-5512</b>${kv([['Customer','Fabrikam Health'],['Value','$128,450.00']])}</div><div class="dx-panel"><h5>Lifecycle</h5>${roFlow(RO_FLOWS[4])}</div></div>`]].map(([v,l,h])=>vcard('case',v,l,h,k,{wide:true})).join(''),'480px')}
  },
  init(root){const p=root.querySelector('[data-wzpick]');if(!p)return;p.addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(!b)return;$$('button',p).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const w=WZ[+b.dataset.i];const k=FL();root.querySelector('[data-wzhost]').innerHTML=vcard('form','wizard',w.t,wizardHTML(w,k),k,{wide:true,sub:w.area,note:'Continue validates required fields and marks the step in error; Back keeps entered values; Review summarises everything.'});afterRender(root.querySelector('[data-wzhost]'))})},
  anatomy:[['Step list','ol.dx-st','Ordered list'],['Step','li.dx-st__s','State class is-done / is-cur / is-err …'],['Indicator','.dx-st__dot','Number, icon or dot'],['Connector','::before','Turns primary when complete'],['Title','.dx-st__t',''],['Description / meta','.dx-st__d / .dx-st__m','Optional'],['Validation','.dx-st__v','Error text on the step'],['Panel + navigation','.dx-st-panel / .dx-st-nav','When the stepper drives a form']],
  respExtra:[['Mobile compact',{mobileMode:'compact'},'“Step 3 of 5: Contact” plus dots.'],['Mobile icon-only',{mobileMode:'icononly'},'Icons in a row; labels via screen reader.']],
  resp:{desktop:'Horizontal, labels below each step.',tablet:'Horizontal; scrolls sideways when steps exceed the width.',mobile:'Vertical, or compact “Step 3 of 5” with dots.'},
  a11y:{aria:'Ordered list with aria-current="step"; each step has hidden text for its state (Completed, Has errors…).',keyboard:'Steps are not tab stops unless they are links to completed steps; Back / Continue are buttons.',error:'A step with errors shows an icon and text (“2 required fields missing”), not only red.',sr:'Announces “Step 3 of 5, Contact, current step”.'},
  keys:[['Tab','Move to Back / Continue'],['Enter','Go to next step (validates first)'],['Shift+Tab','Back to the form']],
  do:['Name steps by outcome: “Address”, not “Step 2”','Validate on Continue and mark the failing step'],dont:['Use a stepper for fewer than three steps','Let users skip required steps without explanation'],
  ddDo:k=>stRender({variant:'numbered',layout:'inline',icon:'check',scheme:'semantic',state:'error',content:'none'},k),ddDont:k=>`<ol class="dx-st dx-st--inline">${['Step 1','Step 2','Step 3','Step 4','Step 5','Step 6','Step 7','Step 8'].map((t,i)=>`<li class="dx-st__s ${i<3?'is-done':i===3?'is-cur':'is-up'}"><span class="dx-st__dot">${i+1}</span><span class="dx-st__b"><span class="dx-st__t">${t}</span></span></li>`).join('')}</ol>`,
  props:[['steps','{ title, description?, status, icon? }[]','—','Step model'],['current','number','0','Index of the active step'],['orientation','horizontal | vertical | auto','auto','auto = vertical below 600px'],['variant','numbered | dots | line | pill | progress | timeline | card','numbered','Visual style'],['colorScheme','same | status | semantic | brand | mono','semantic','State colours'],['onStepClick','(index) => void','—','Allow jumping to completed steps'],['linear','boolean','true','Must complete steps in order']],
  matrix:[['Horizontal numbered','Desktop forms, 3–6 steps','Explicit position, easy scan','Breaks with long labels',1],['Vertical','Mobile, many steps, long labels','Never truncates','Uses height',1],['Compact','Mobile headers, embedded flows','Minimal space','Hides upcoming labels',1],['Sidebar','Long wizards (7+ steps)','Orientation + jump','Needs width',0],['Progress bar','Very long flows','Simple','No step names',0],['Timeline (read-only)','Approvals, audit','Shows who and when','Not for input',1],['Card','Steps with owners or status','Rich','Heavy',0]],
  rec:{v:'Horizontal numbered stepper on desktop, vertical on mobile, semantic colours, check for completed',why:'Horizontal steps scan fastest on wide screens; on narrow screens labels need vertical space. Semantic colours make errors and warnings visible at a glance, and the check icon confirms completion without colour.'},
  decide:[['Multi-step enterprise form','Horizontal stepper on desktop, vertical on mobile','Better scanning, limited mobile width'],['More than 6 steps','Sidebar stepper','Keeps every step visible'],['Embedded in a modal or card','Compact or inline','Saves space'],['Approval history / audit','Read-only timeline','Shows people, time and outcome'],['Unknown or variable length','Progress bar','Avoids promising a fixed count'],['Steps can be done in any order','Tabs, not a stepper','A stepper implies order']],
  searchExtra:[['Vertical Stepper','v-layout-vertical'],['Approval Stepper','s-readonly'],['Form Stepper','s-form'],['Read-only Stepper','s-readonly'],['Mobile Stepper','s-responsive'],['Icon Stepper','v-icon-icons'],['Sidebar Stepper','v-layout-sidebar'],['Employee onboarding wizard','s-form'],['Purchase order wizard','s-form']]
});

/* ---------------- TABS ---------------- */
const TABI=[{l:'Overview',ic:'file',body:'PO-2291 · Northwind Supplies · $86,400.00'},{l:'Lines',ic:'list',n:12,body:'12 order lines, 3 back-ordered.'},{l:'Approvals',ic:'ok',n:2,body:'Waiting for Finance.'},{l:'Documents',ic:'folder',body:'Quote.pdf, Contract.pdf'},{l:'History',ic:'clock',body:'Created Oct 18 by Liam Shah.'}];
function tabsRender(o,k){
  let items=TABI.map(x=>({...x}));
  if(o.content==='plain')items=items.map(x=>({...x,n:undefined}));
  if(o.layout==='scroll'||o.content==='overflow')items=[...items,{l:'Receipts',ic:'inbox',body:'2 goods receipts'},{l:'Invoices',ic:'file',body:'INV-10432'},{l:'Notes',ic:'message',body:'—'}];
  if(o.state==='disabled')items[3].dis=1;
  const stateAt=o.state==='default'?-1:o.state==='disabled'?3:1;
  let h=tabs({items,state:o.state==='disabled'?'':o.state,stateAt:o.state==='disabled'?-1:stateAt,label:'Purchase order sections'});
  if(o.content==='closable')h=h.replace(/<\/span>(<span class="ds-tab__count">)?/g,m=>m).replace(/(<button type="button" class="ds-tab[^>]*>[\s\S]*?)(<\/button>)/g,(m,a,b)=>a+`<span class="ds-tab__close" aria-hidden="true">${ic('x')}</span>`+b);
  if(o.content==='overflow'){const m=uid('tm');h=h.replace('<span class="ds-tabind"',`<span class="ds-anchor tab-more"><button type="button" class="ds-tab" data-ds="menu" aria-haspopup="menu" aria-expanded="false" aria-controls="${m}">More ${ic('chev-down')}</button>${MENU(m,{right:1,items:[{l:'Receipts'},{l:'Invoices'},{l:'Notes'}],label:'More sections'})}</span><span class="ds-tabind"`);h=h.replace(/<button[^>]*>(?:(?!<\/button>)[\s\S])*?(Receipts|Invoices|Notes)<\/span>(?:(?!<\/button>)[\s\S])*?<\/button>/g,'')}
  const cls=['ds-tabs','tx-'+o.variant,o.layout==='vertical'?'tx-vertical':'',o.layout==='bottom'?'tx-bottom':'',o.layout==='scroll'?'tx-scroll':'',o.icon==='none'?'tx-noicon':o.icon==='only'?'tx-icononly':'tx-icon',o.layout==='fitted'?'tx-fitted':''].filter(Boolean).join(' ');
  if(o.device==='mobile'&&o.layout!=='vertical')return h.replace('class="ds-tabs"',`class="${cls} tx-scroll"`);
  return h.replace('class="ds-tabs"',`class="${cls}"`);
}
spec({id:'components/tabs',title:'Tabs',noun:'Tabs',icon:'columns',group:'Navigation',cls:['ds-tabs','ds-tab','ds-tablist','ds-tabind'],
  desc:'Switch between views of the same object without leaving the page.',
  dims:{variant:[['default','Language default'],['underline','Underline','Most enterprise records.'],['pill','Pill','Filters and light navigation.'],['boxed','Boxed','Document-like editors and settings.'],['segmented','Segmented','2–4 equal views or ranges.']],
    layout:[['top','Top (horizontal)'],['bottom','Bottom','Mobile apps and editors with bottom toolbars.'],['vertical','Vertical','Settings with many sections.'],['scroll','Scrollable','More tabs than width.'],['fitted','Full width (fitted)','Mobile and 2–4 tabs.']],
    icon:[['none','Text'],['text','Icon + text'],['only','Icon only']],
    state:[['default','Default'],['hover','Hover'],['focus','Focus'],['active','Pressed'],['disabled','Disabled tab']],
    content:[['badge','With badges'],['plain','Plain'],['closable','Closable'],['overflow','Overflow menu']]},
  def:{variant:'default',layout:'top',icon:'text',state:'default',content:'badge'},recommend:{variant:'underline',layout:'top'},colors:false,min:{all:'480px'},
  render:tabsRender,
  anatomy:[['Tab list','.ds-tablist','role=tablist'],['Tab','.ds-tab','role=tab, aria-selected'],['Icon','.ds-tab__ic','Optional'],['Count badge','.ds-tab__count','Optional'],['Indicator','.ds-tabind','Moves with selection'],['Panel','.ds-tabpanel','role=tabpanel']],
  cases:[{t:'Customer record',area:'CRM · Accounts',d:'Underline tabs separate the views of one customer.',html:k=>scr('Fabrikam Health',B('Edit',{icon:'edit',keep:1}),tabs({items:[{l:'Overview',body:'Annual revenue $2.4M · 3 open opportunities'},{l:'Contacts',n:6,body:'Chen Li (primary), 5 others'},{l:'Opportunities',n:3,body:'Pipeline $412,000'},{l:'Cases',n:1,body:'1 open case: billing address'}]}),{crumbs:['CRM','Accounts','Fabrikam Health']})},
    {t:'Employee profile',area:'HR',d:'Vertical tabs for many settings-like sections.',html:k=>tabsRender({variant:'default',layout:'vertical',icon:'text',state:'default',content:'plain'},k)}],
  a11y:{aria:'tablist / tab / tabpanel with aria-selected and aria-controls; roving tabindex.',keyboard:'← → move and select; Home / End jump; Tab moves into the panel.'},
  keys:[['← / →','Previous / next tab'],['Home / End','First / last tab'],['Tab','Into the panel']],
  do:['Keep labels to one or two words','Show counts when they help decide where to look'],dont:['Use tabs for sequential steps','Hide critical errors in a non-selected tab without a badge'],
  props:[['items','{ label, icon?, count?, disabled? }[]','—','Tabs'],['selected','string','first','Selected id'],['variant','underline | pill | boxed | segmented','language','Style'],['orientation','horizontal | vertical','horizontal','Layout'],['closable','boolean','false','Shows close buttons'],['overflow','scroll | menu','scroll','Too many tabs']],
  matrix:[['Underline','Records and detail pages','Quiet, scalable','Weak on touch',1],['Segmented','2–4 equal views','Clear choice','Not for many tabs',1],['Pill','Filters','Friendly','Looks like chips',0],['Boxed','Editors, documents','Strong grouping','Heavier',0],['Vertical','Settings with 6+ sections','Scales','Uses width',0]],
  rec:{v:'Underline tabs, icon + text, with counts',why:'Underline tabs are quiet enough for dense ERP records and scale to many tabs; counts tell users where data is.'},
  decide:[['Views of one record','Underline','Quiet and scalable'],['2–4 time ranges or modes','Segmented','Reads as a choice'],['Settings with many sections','Vertical tabs','Room for long labels'],['More tabs than width','Scrollable + overflow menu','Nothing hidden'],['Ordered process','Stepper, not tabs','Tabs imply free order']],
  resp:{desktop:'All tabs visible.',tablet:'Scrolls sideways; overflow menu for the rest.',mobile:'Scrollable underline tabs or a select; vertical tabs become a list.'},
  searchExtra:[['Vertical tabs','v-layout-vertical'],['Segmented control','v-basic-segmented'],['Closable tabs','v-content-closable']]
});

/* ---------------- ACCORDION ---------------- */
function accRender(o,k){
  const items=[['Vendor details','Northwind Supplies · Net 30','Registered in Portugal. Primary contact Ana Costa.'],['Delivery','Nov 14 · WH-3 Lisbon','Dock 3, between 08:00 and 12:00.'],['Accounting','CC-410 · Opex','Split 70/30 between Operations and IT.'],['Attachments','2 files','Quote.pdf, Contract.pdf']];
  const exp=o.state==='collapsed'?[]:o.layout==='multi'?[0,1]:[0];
  const chev=o.icon==='plus'?null:'chev-right';
  const cls=['ds-acc','ac-'+o.variant,o.icon==='left'||o.icon==='leading'?'ac-left':'ac-right',o.icon==='plus'?'ac-plus':''].join(' ');
  return `<div class="${cls}" data-acc-mode="${o.layout}">${items.map((it,i)=>{const id=uid('ac');const open=exp.includes(i);const dis=o.state==='disabled'&&i===3;const fh=o.state==='hover'&&i===1?' style="background:var(--hov)"':o.state==='focus'&&i===1?' style="box-shadow:inset 0 0 0 2px var(--pri)"':'';
    const icn=o.icon==='plus'?`<span class="ds-acc__chev" aria-hidden="true">${open?'−':'+'}</span>`:ic(chev,'ds-acc__chev');
    const lead=o.icon==='leading'?ic(['user','calendar','chart','folder'][i]):'';
    const meta=o.content==='meta'||o.content==='actions'?`<span class="ds-acc__meta">${it[1]}</span>`:'';
    let body=`<p>${it[2]}</p>`;if(o.content==='form'&&i===0)body=`<div style="padding:0 var(--acc-px) var(--acc-pb)"><div class="fx fx--2">${TF({label:'Vendor',val:'Northwind Supplies',sz:'s'})}${TF({label:'Payment terms',val:'Net 30',sz:'s'})}</div></div>`;if(o.content==='table'&&i===0)body=`<div style="padding:0 var(--acc-px) var(--acc-pb)">${TBL(['Item',['Qty','num']],[['Laptop 14"','48'],['Docking station','48']])}</div>`;
    if(o.layout==='nested'&&i===0)body=`<div style="padding:0 var(--acc-px) var(--acc-pb)">${accRender({...o,layout:'single',state:'collapsed',variant:'flush'},k)}</div>`;
    return `<div class="ds-acc__item${dis?' is-dis':''}"><h3 style="margin:0;font:inherit"><button type="button" class="ds-acc__btn" aria-expanded="${open}" aria-controls="${id}"${dis?' aria-disabled="true" disabled':''}${fh}>${lead}${icn}<span>${it[0]}</span>${meta}${o.content==='actions'?`<span class="ds-acc__acts">${IB('edit','Edit '+it[0],{sz:'s'})}</span>`:''}</button></h3><div class="ds-acc__panel" id="${id}"${open?'':' hidden'}><div>${body}</div></div></div>`}).join('')}</div>`;
}
spec({id:'components/accordions',title:'Accordion',noun:'Accordion',icon:'list',group:'Data Display',cls:['ds-acc','ds-acc__btn','ds-acc__panel'],
  desc:'Stacked sections that expand to reveal detail. Keeps long records and checklists scannable.',
  dims:{variant:[['default','Language default'],['bordered','Bordered'],['separated','Separated cards'],['flush','Flush (no container)'],['filled','Filled headers']],layout:[['single','Single open','Only one section open at a time.'],['multi','Multiple open'],['nested','Nested']],icon:[['right','Chevron right'],['left','Chevron left'],['plus','Plus / minus'],['leading','Leading icon']],state:[['expanded','Expanded'],['collapsed','Collapsed'],['hover','Hover'],['focus','Focus'],['disabled','Disabled section']],content:[['text','Text'],['meta','With summary'],['actions','With actions'],['form','Form inside'],['table','Table inside']]},
  def:{variant:'default',layout:'single',icon:'right',state:'expanded',content:'meta'},colors:false,min:{all:'360px'},
  render:accRender,
  initCard(st){st.addEventListener('click',e=>{const b=e.target.closest('.ds-acc__btn');if(!b)return;const acc=b.closest('.ds-acc');if(acc.dataset.accMode==='single'&&b.getAttribute('aria-expanded')!=='true')setTimeout(()=>$$(':scope > .ds-acc__item > h3 > .ds-acc__btn[aria-expanded="true"]',acc).forEach(x=>{if(x!==b){x.setAttribute('aria-expanded','false');document.getElementById(x.getAttribute('aria-controls')).hidden=true}}));if(b.querySelector('.ds-acc__chev')&&acc.classList.contains('ac-plus'))setTimeout(()=>b.querySelector('.ds-acc__chev').textContent=b.getAttribute('aria-expanded')==='true'?'−':'+')},true)},
  anatomy:[['Container','.ds-acc',''],['Header button','.ds-acc__btn','aria-expanded'],['Chevron','.ds-acc__chev','Rotates'],['Summary','.ds-acc__meta','Optional'],['Panel','.ds-acc__panel','Animated height']],
  cases:[{t:'Purchase order details',area:'ERP',d:'Sections with summaries let approvers check what matters.',html:k=>accRender({variant:'separated',layout:'multi',icon:'right',state:'expanded',content:'meta'},k)},{t:'Release checklist',area:'Projects',d:'Single-open keeps focus on one item.',html:k=>accRender({variant:'bordered',layout:'single',icon:'left',state:'expanded',content:'actions'},k)}],
  a11y:{aria:'Header is a button inside a heading with aria-expanded and aria-controls.',keyboard:'Tab between headers; Enter / Space toggles.'},keys:[['Tab','Next header'],['Enter / Space','Toggle']],
  do:['Show a summary in the header so users needn’t open each section'],dont:['Hide required fields inside collapsed sections'],
  props:[['items','{ title, summary?, content }[]','—','Sections'],['mode','single | multiple','multiple','Open behaviour'],['defaultOpen','string[]','[]','Initially open'],['variant','default | bordered | separated | flush','default','Style']],
  matrix:[['Separated','Record details','Clear grouping','More height',1],['Flush','Inside panels','Light','Weak boundaries',0],['Single open','Checklists','Focus','Extra clicks',0],['Multiple open','Comparing sections','Flexible','Long pages',1]],
  rec:{v:'Separated, multiple open, chevron right, with summaries',why:'Summaries reduce clicks; multiple-open lets approvers compare sections.'},
  decide:[['Long read-only record','Separated + summaries','Scan without opening'],['FAQ or checklist','Single open','Keeps focus'],['Inside a drawer','Flush','Avoids nested borders']],
  resp:{desktop:'Full width within content.',tablet:'Same.',mobile:'Full width; headers 48px for touch.'}
});

/* ---------------- CARDS ---------------- */
function cardRender(o,k){
  const sel=o.state==='selected'?' aria-selected="true"':'';const fs=o.state==='hover'?' data-force-hover':o.state==='focus'?' data-force-focus':'';
  const base=`ds-card${o.layout==='horizontal'?' ds-card--h':''}${o.state==='disabled'?' is-dis':''}`;
  const wrap=(inner,extra='',int=true)=>`<article class="${base}${int?' ds-card--interactive':''} ${extra}" tabindex="0"${sel}${fs} style="${o.layout==='full'?'':'max-width:340px'}">${inner}</article>`;
  if(o.state==='loading')return `<div class="ds-card" style="max-width:340px"><div class="ds-card__body"><span class="ds-skel ds-skel--line" style="--w:50%"></span><span class="ds-skel ds-skel--line"></span><span class="ds-skel ds-skel--block" style="--h:50px"></span></div></div>`;
  const app={basic:'',elevated:'cd-elevated',outlined:'cd-outlined',flat:'cd-flat'};
  switch(o.variant){
    case 'kpi':return wrap(`<div class="ds-card__body"><span class="kpi-l">Open purchase orders</span><span class="kpi-v">128</span><span class="ds-stat__delta">${ic('trend-up')}+12% <span>vs last month</span></span>${spark([90,96,101,110,118,122,128])}</div>`);
    case 'metric':return wrap(`<div class="ds-card__body"><div class="ds-card__row"><span class="kpi-l">Days payable outstanding</span>${BADGE('On target','success',{sz:'s'})}</div><span class="kpi-v">38.4 <small style="font-size:14px">days</small></span><div class="ds-prog ds-s"><div class="ds-prog__track"><div class="ds-prog__bar" style="--v:64%"></div></div></div></div>`);
    case 'profile':return wrap(`<div class="ds-card__body" style="align-items:center;text-align:center">${AV('MR',1,{sz:'l',pr:'on'})}<b>Maya Ruiz</b><span class="ds-card__text">Engineering lead · Lisbon</span><div class="ds-row" style="justify-content:center">${B('Message',{sz:'s'})}${B('Profile',{v:'subtle',sz:'s'})}</div></div>`);
    case 'product':return wrap(`<div class="ds-card__media">${ic('box')}</div><div class="ds-card__body"><span class="ds-card__eyebrow">INV-1043</span><h3 class="ds-card__title">Docking station</h3><div class="ds-card__row"><b>$210.00</b>${BADGE('148 in stock','success',{sz:'s'})}</div></div>`);
    case 'transaction':return wrap(`<div class="ds-card__body"><div class="ds-card__row"><b>INV-10432</b>${BADGE('Paid','success',{sz:'s'})}</div><dl class="ds-card__kv"><dt>Customer</dt><dd>Contoso Freight</dd><dt>Amount</dt><dd>$12,850.00</dd><dt>Paid</dt><dd>Oct 20, 2026</dd></dl></div>`);
    case 'summary':return wrap(`<div class="ds-card__body"><h3 class="ds-card__title">Q4 procurement</h3><dl class="ds-card__kv"><dt>Orders</dt><dd>214</dd><dt>Spend</dt><dd>$1.84M</dd><dt>Savings</dt><dd>$62,400</dd></dl></div><div class="ds-card__foot"><span class="grow"></span>${B('Open report',{v:'subtle',sz:'s'})}</div>`);
    case 'expandable':{const id=uid('ce');return wrap(`<div class="ds-card__body"><div class="ds-card__row"><h3 class="ds-card__title">PO-2291</h3><button type="button" class="ds-acc__btn" style="width:auto;min-height:0;padding:4px" aria-expanded="false" aria-controls="${id}">${ic('chev-down','ds-acc__chev')}<span class="ds-sr">Show lines</span></button></div><p class="ds-card__text">Northwind Supplies · $86,400.00</p><div class="ds-acc__panel" id="${id}" hidden><div>${TBL(['Item',['Qty','num']],[['Laptop 14"','48']])}</div></div></div>`,'',false)}
    case 'selectable':return `<div class="ds-cards" data-selectable role="radiogroup" aria-label="Plan">${['Standard','Express'].map((t,i)=>`<article class="${base} ds-card--interactive cd-outlined" tabindex="0" role="radio" aria-checked="${i===0}" aria-selected="${i===0}"><div class="ds-card__body"><div class="ds-card__row"><b>${t} shipping</b>${i===0?ic('ok'):''}</div><span class="ds-card__text">${i?'1–2 days · $48.00':'3–5 days · Free'}</span></div></article>`).join('')}</div>`;
    default:return wrap(`${o.content==='media'?`<div class="ds-card__media">${ic('layers')}</div>`:''}<div class="ds-card__body">${o.content==='avatar'?`<div class="ds-row" style="gap:8px">${AV('LS',3,{sz:'s'})}<span class="ds-card__eyebrow">Liam Shah · 2h ago</span></div>`:'<span class="ds-card__eyebrow">Purchase order</span>'}<h3 class="ds-card__title">PO-2291 · Laptops for Lisbon</h3><p class="ds-card__text">Northwind Supplies · 48 items · $86,400.00</p></div>${o.content==='actions'||o.content==='media'?`<div class="ds-card__foot">${BADGE('Awaiting approval','warning',{sz:'s'})}<span class="grow"></span>${B('Review',{v:'subtle',sz:'s'})}</div>`:''}`,app[o.variant]||'');
  }
}
spec({id:'components/cards',title:'Cards',noun:'Card',icon:'window',group:'Data Display',cls:['ds-card','ds-card__body','ds-card__foot'],
  desc:'A container for one object or one metric. Cards group related content and actions.',
  dims:{variant:[['basic','Basic'],['elevated','Elevated'],['outlined','Outlined'],['flat','Flat'],['metric','Metric'],['kpi','KPI'],['profile','Profile'],['product','Product'],['transaction','Transaction'],['summary','Summary'],['expandable','Expandable'],['selectable','Selectable']],layout:[['vertical','Vertical'],['horizontal','Horizontal','Media on the left.'],['full','Full width']],state:[['default','Default'],['hover','Hover'],['focus','Focus'],['selected','Selected'],['disabled','Disabled'],['loading','Loading skeleton']],content:[['text','Text'],['media','Media + actions'],['avatar','Avatar + text'],['actions','With actions']]},
  def:{variant:'basic',layout:'vertical',state:'default',content:'actions'},colors:false,
  render:cardRender,
  anatomy:[['Container','.ds-card','Radius, border, shadow by language'],['Media','.ds-card__media','Optional'],['Body','.ds-card__body','Eyebrow, title, text'],['Footer','.ds-card__foot','Status and actions']],
  cases:[{t:'Procurement dashboard',area:'ERP',d:'KPI and metric cards summarise; details live one click away.',html:k=>`<div class="ds-cards">${cardRender({variant:'kpi',layout:'vertical',state:'default'},k)}${cardRender({variant:'metric',layout:'vertical',state:'default'},k)}${cardRender({variant:'summary',layout:'vertical',state:'default'},k)}</div>`},{t:'Opportunity board',area:'CRM',d:'Transaction-style cards for deals.',html:k=>`<div class="ds-cards">${LEADS.slice(0,3).map(l=>`<article class="ds-card ds-card--interactive" tabindex="0"><div class="ds-card__body"><div class="ds-card__row"><b>${l.n}</b>${BADGE(l.s[0],l.s[1],{sz:'s'})}</div><dl class="ds-card__kv"><dt>Contact</dt><dd>${l.c}</dd><dt>Value</dt><dd>${money(l.v)}</dd></dl></div></article>`).join('')}</div>`}],
  a11y:{aria:'Interactive cards are focusable articles with a heading; selectable cards use role="radio" or aria-selected.',keyboard:'Tab to the card; Enter opens; nested buttons keep their own focus.'},keys:[['Tab','Focus the card'],['Enter','Open']],
  do:['Put the most important number or status at the top'],dont:['Nest interactive cards inside interactive cards','Use cards for tabular data'],
  props:[['variant','basic | elevated | outlined | flat','basic','Surface'],['interactive','boolean','false','Hover, focus, click'],['selected','boolean','false','Selection state'],['media','ReactNode','—','Top or side media'],['actions','ReactNode','—','Footer actions']],
  matrix:[['KPI / metric','Dashboards','Fast to scan','Little detail',1],['Outlined','Dense grids','Clear boundaries','More lines',1],['Elevated','Few highlighted items','Emphasis','Noise if overused',0],['Selectable','Plans, options','Rich choice','Takes space',0]],
  rec:{v:'Outlined or language-default cards; KPI cards on dashboards',why:'Outlines give clear boundaries without shadow noise in dense ERP layouts.'},
  decide:[['Dashboard numbers','KPI / metric card','Number first'],['Choosing between options','Selectable cards','Room for detail'],['Many records','Table, not cards','Comparison needs columns']],
  resp:{desktop:'Grid of 3–4 columns.',tablet:'2 columns.',mobile:'1 column, full width.'}
});
