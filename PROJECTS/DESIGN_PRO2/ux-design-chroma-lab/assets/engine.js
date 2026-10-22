'use strict';
/* =====================================================================
   Enterprise UX Component Lab — page engine
   Every HTML file sets window.LAB = {page, root} and loads the same
   assets. This file builds the shell, navigation, search, favourites,
   Architect mode, the explorer and the 21-section component pages.
   ===================================================================== */
SYS.e={name:'Enterprise Neutral',short:'Enterprise',tag:'Dense · Neutral',spec:'28px · r2 · 13px'};
SYS.m={name:'Material-inspired',short:'Material',tag:'Tonal · Expressive',spec:'40px · pill · 14px'};
const LANGS=['f'],ALL4=['f'];
const CHAIN={a:['a'],f:['f'],p:['p'],e:['f','e'],m:['a','m']};
const LAB=window.LAB||{page:'index',root:''};
const ROOT=LAB.root||'';
const href=id=>ROOT+id+'.html';
const DOCS={};const SPECS=[];
function spec(o){o.kind='comp';o.noun=o.noun||o.title.replace(/s$/,'');DOCS[o.id]=o;SPECS.push(o);return o}
function doc(o){o.kind=o.kind||'doc';DOCS[o.id]=o;return o}
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const ls={get(k,d){try{const v=localStorage.getItem('chlab:'+k);return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem('chlab:'+k,v)}catch(e){}}};
const prefersDark=()=>{try{return matchMedia('(prefers-color-scheme: dark)').matches}catch(e){return false}};
const ST={lang:'f',theme:ls.get('theme',HOST_THEME==='dark'||(!HOST_THEME&&prefersDark())?'dark':'light'),arch:ls.get('arch','0')==='1'};
const FL=()=>ST.lang==='all'?'f':ST.lang;
const CMPL=()=>ST.lang==='all'?ALL4:[ST.lang];
const stageHTML=(k,html,o={})=>`<div class="lab-stage ${SC(k)}${o.cls?' '+o.cls:''}" data-k="${k}"${o.theme&&o.theme!=='page'?` data-theme="${o.theme}"`:''}${o.data?` data-o='${esc(JSON.stringify(o.data))}' data-spec="${o.spec}"`:''}>${html}</div>`;

/* ---------- CSS source for the code view (works on file:// too) ---------- */
let _sheets=null;
function sheets(){if(_sheets)return _sheets;_sheets=[];try{for(const t of [CSS_SOURCE.tokens,CSS_SOURCE.components]){const s=new CSSStyleSheet();s.replaceSync(t);_sheets.push(s)}}catch(e){}return _sheets}
function allRules(){const out=[];sheets().forEach(s=>{for(const r of s.cssRules)out.push(r)});return out}
cssFor=function(k,classes){
  const re=clsRegex(classes);const allow=CHAIN[k];const out=[];
  for(const r of allRules()){if(!r.selectorText)continue;const sel=r.selectorText;if(!re.test(sel))continue;
    const sys=[...sel.matchAll(/\.sys-([a-z])/g)].map(m=>m[1]);if(sys.length&&!sys.every(x=>allow.includes(x)))continue;if(/data-theme/.test(sel))continue;out.push(fmtRule(r.cssText))}
  return `/* ${SYS[k].name}: rules for ${classes.map(c=>'.'+c).join(', ')} */\n`+out.join('\n');
};
tokenMap=function(k){const map={};for(const r of allRules()){for(const x of CHAIN[k]){if(r.selectorText===`.sys-${x}`){for(let i=0;i<r.style.length;i++){const p=r.style[i];if(p.startsWith('--'))map[p]=r.style.getPropertyValue(p).trim()}}}}return map};
tokensFor=function(k,classes){
  const css=cssFor(k,classes);const map=tokenMap(k);const used=new Set();
  const visit=t=>{for(const m of t.matchAll(/var\((--[\w-]+)/g)){if(!used.has(m[1])&&map[m[1]]!=null){used.add(m[1]);visit(map[m[1]])}}};visit(css);
  const own=[...used].filter(n=>/^--[a-z]-/.test(n)).sort(),alias=[...used].filter(n=>!/^--[a-z]-/.test(n));
  return `/* ${SYS[k].name}: tokens this component reads */\n${CHAIN[k].map(x=>'.sys-'+x).join('')} {\n  /* design tokens */\n${own.map(n=>`  ${n}: ${map[n]};`).join('\n')}\n\n  /* semantic + component aliases */\n${alias.map(n=>`  ${n}: ${map[n]};`).join('\n')}\n}`;
};

/* ---------- variation vocabulary ---------- */
const SIZES=[['xs','XS'],['s','Small'],['m','Medium'],['l','Large'],['xl','XL']];
const COLORS=[['primary','Primary'],['secondary','Secondary'],['success','Success'],['warning','Warning'],['danger','Danger'],['info','Info'],['neutral','Neutral'],['custom','Custom semantic']];
const DENS=[['comfortable','Comfortable'],['compact','Compact'],['dense','Dense']];
const THEMES3=[['light','Light'],['dark','Dark'],['hc','High contrast']];
const CTXS=[['none','None'],['form','Form'],['readonly','Read-only'],['dashboard','Dashboard'],['list','List'],['detail','Detail'],['workflow','Workflow'],['modal','Modal'],['drawer','Drawer'],['mobile','Mobile']];
const DEVICES=[['desktop','Desktop'],['tablet','Tablet'],['mobile','Mobile']];
const DIMNAME={variant:'Variant',layout:'Layout',icon:'Icons',state:'State',content:'Content'};
const DIM2SEC={variant:'basic',layout:'layout',icon:'icon',state:'state',content:'content'};
const SECS=[['overview','Overview'],['anatomy','Anatomy'],['basic','Basic variants'],['layout','Layout variants'],['size','Size variants'],['color','Color variants'],['icon','Icon variants'],['state','State variants'],['content','Content variants'],['responsive','Responsive variants'],['theme','Theme variants'],['form','Form usage'],['readonly','Read-only usage'],['cases','Enterprise use cases'],['a11y','Accessibility'],['dodont','Do / Don’t'],['tokens','Design tokens'],['props','Component properties'],['compare','Comparison matrix'],['code','Code example'],['recommend','Recommended usage']];
const SEC_LEAD={basic:'The core forms of the component. Each is a deliberate choice, not a style option.',layout:'How the component arranges itself, plus density.',size:'XS to XL. Sizes scale height, type, padding and icons together.',color:'Semantic colour roles applied through tokens, never hard-coded.',icon:'With and without icons, and how icons carry meaning.',state:'Every interaction and data state the component supports.',content:'What the component can hold, from plain text to rich content.',responsive:'How the component changes on smaller screens, not just how it shrinks.',theme:'The same variant in light, dark and high-contrast themes.',form:'The component inside a realistic enterprise form.',readonly:'How it presents when the user can view but not change.',cases:'Real ERP, CRM, HR and finance screens that use the component.'};
const ARCH_DEFAULT={basic:['Pick the variant by role and emphasis, not by look.','One primary emphasis per region.'],layout:['Horizontal for scanning on wide screens; vertical for narrow screens or long labels.','Density is a token decision applied per module.'],size:['Medium is the default for desktop; Large for touch.','Mix at most two sizes on one screen.'],color:['Colour carries meaning: success, warning, danger, info.','Never rely on colour alone; pair with text or an icon.'],icon:['Icons support text; icon-only needs an accessible name and a tooltip.'],state:['Every state is visually distinct and announced to assistive tech.','Disabled states remain readable.'],content:['Keep labels short; move detail into descriptions or tooltips.'],responsive:['Change the layout at breakpoints; never just scale down.','Touch targets reach 44px on mobile.'],theme:['All colours come from semantic tokens, so themes need no component changes.'],form:['Follow the form’s label, help and error conventions.'],readonly:['Read-only shows values as text, not disabled controls.'],cases:['Use real data shapes: long names, large numbers, empty values.']};
const A11Y_ROWS=[['keyboard','Keyboard interaction'],['focus','Focus state'],['sr','Screen reader behaviour'],['aria','ARIA requirements'],['contrast','Colour contrast'],['disabled','Disabled state'],['error','Error messaging'],['motion','Reduced motion'],['touch','Touch target'],['mobile','Mobile accessibility']];
const A11Y_DEFAULT={keyboard:'Reachable with Tab in reading order; activates with Enter or Space.',focus:'Chroma focus: a 2px surface-coloured gap and a 2px violet ring, visible on every tinted surface and in every theme.',sr:'Announces role, name and current state.',aria:'Native elements first; ARIA only where no native element exists.',contrast:'Text and state colours come from semantic tokens; target 4.5:1 for text and 3:1 for borders and focus.',disabled:'Uses the native disabled attribute; disabled items are skipped by Tab and announced as unavailable.',error:'Errors are written in words, linked with aria-describedby and never shown by colour alone.',motion:'Transitions shorten to near zero when the OS asks for reduced motion.',touch:'At least 44 × 44px on touch: use Large size or extend the hit area.',mobile:'Works with screen readers on iOS and Android; no hover-only behaviour.'};
const DO_DEFAULT=['Use it for its intended purpose and context','Keep a clear hierarchy: one primary emphasis per area','Make every interaction keyboard and screen-reader accessible','Show every state clearly, including loading and error','Keep spacing consistent using the density tokens'];
const DONT_DEFAULT=['Invent extra variants for one-off screens','Use conflicting colours or colour as the only signal','Make interaction ambiguous (looks clickable but isn’t)','Flatten hierarchy with several equal-weight emphases','Ship states that fail contrast or lose focus visibility'];

/* ---------- context wrappers ---------- */
function ctxWrap(html,ctx,k){
  if(!ctx||ctx==='none')return html;
  const foot=`<div class="ctx-frame__f">${B('Cancel',{v:'subtle',sz:'s'})}${B('Save',{v:'primary',sz:'s'})}</div>`;
  switch(ctx){
    case 'form':return `<div class="ctx-frame"><div class="ctx-frame__h">New purchase order<small>PO-2292 · Draft</small></div><div class="ctx-frame__b">${TF({label:'Vendor',val:'Northwind Supplies',sz:'s'})}${html}</div>${foot}</div>`;
    case 'readonly':return `<div class="ctx-frame"><div class="ctx-frame__h">PO-2291 <small>Read-only · approved Oct 18</small></div><div class="ctx-frame__b">${html}</div></div>`;
    case 'dashboard':return `<div class="ctx-frame ctx-dash"><div class="ctx-frame__h">Procurement overview<small>This week</small></div><div class="ctx-frame__b">${html}</div></div>`;
    case 'list':return `<div class="ctx-frame ctx-list"><div class="ctx-frame__b">${['PO-2291 · Northwind Supplies','PO-2290 · Contoso Freight'].map((t,i)=>`<div class="ctx-row"><div class="ctx-row__t"><b>${t}</b><span>Updated ${i?'yesterday':'2h ago'}</span></div><div>${i?'':html}</div></div>`).join('')}</div></div>`;
    case 'detail':return `<div class="ctx-frame"><div class="ctx-frame__h">Sales order SO-5512</div><div class="ctx-frame__b"><dl class="dx-ro"><dt>Customer</dt><dd>Fabrikam Health</dd><dt>Value</dt><dd>$128,450.00</dd><dt>Component</dt><dd>${html}</dd></dl></div></div>`;
    case 'workflow':return `<div class="ctx-frame"><div class="ctx-frame__h">Approval · Step 2 of 4<small>Finance review</small></div><div class="ctx-frame__b">${html}</div></div>`;
    case 'modal':return `<div class="ctx-frame ctx-modal"><div class="ctx-frame__h">Edit purchase order<button type="button" class="ds-btn ds-btn--subtle ds-ibtn ds-s" aria-label="Close">${ic('x')}</button></div><div class="ctx-frame__b">${html}</div>${foot}</div>`;
    case 'drawer':return `<div class="ctx-frame ctx-drawer"><div class="ctx-frame__h">Filters<button type="button" class="ds-btn ds-btn--subtle ds-ibtn ds-s" aria-label="Close">${ic('x')}</button></div><div class="ctx-frame__b">${html}</div>${foot}</div>`;
    case 'mobile':return `<div class="ctx-frame ctx-mobile"><div class="ctx-frame__h">Ledger<small>9:41</small></div><div class="ctx-frame__b">${html}</div></div>`;
  }
  return html;
}
function renderO(sp,o,k){
  const cls=[o.size&&o.size!=='m'?'sz-'+o.size:'',o.color&&o.color!=='primary'&&!sp.colorSelf?'co-'+o.color:'',o.density&&o.density!=='comfortable'?'dn-'+o.density:''].filter(Boolean).join(' ');
  let h=sp.render(o,k);
  if(cls)h=`<div class="${cls}">${h}</div>`;
  return ctxWrap(h,o.ctx,k);
}
const defO=sp=>({size:'m',color:'primary',density:'comfortable',ctx:'none',device:'desktop',...sp.def});

/* ---------- variation card ---------- */
const favs=()=>{try{return JSON.parse(ls.get('favs','[]'))}catch(e){return[]}};
const isFav=id=>favs().some(f=>f.id===id);
function vcard(sec,val,label,html,k,o={}){
  const id=`v-${sec}-${slug(val)}`;const fid=LAB.page+'#'+id;
  return `<figure class="vx${o.wide?' vx--wide':''}" id="${id}"><figcaption class="vx__h"><b>${label}</b>${o.sub?`<small>${o.sub}</small>`:''}${o.rec?'<span class="vx__rec">Recommended</span>':''}<button type="button" class="vx__star" data-fav="${fid}" data-label="${esc(label+' · '+(DOCS[LAB.page]?.title||''))}" aria-pressed="${isFav(fid)}" aria-label="Bookmark ${esc(label)}">★</button></figcaption>${stageHTML(k,html,{cls:'vx__stage',theme:o.theme,data:o.data,spec:o.spec})}${o.note?`<p class="vx__note">${o.note}</p>`:''}<p class="arch-only vx__arch" data-measure></p></figure>`;
}
const vgrid=(cards,min)=>`<div class="vgrid"${min?` style="--vx-min:${min}"`:''}>${cards}</div>`;
const na=t=>`<p class="na">${t||'Not applicable to this component.'}</p>`;

/* ---------- section helpers ---------- */
function secWrap(id,title,lead,body,arch){
  const n=String(SECS.findIndex(s=>s[0]===id)+1).padStart(2,'0');
  return `<section class="sec" id="s-${id}"><div class="sec__h"><h2><span class="n">${n}</span>${title}</h2>${lead?`<p>${lead}</p>`:''}</div>${arch&&arch.length?`<aside class="arch-only arch-note"><h4>Why · architect notes</h4><ul>${arch.map(a=>`<li>${a}</li>`).join('')}</ul></aside>`:''}${body}</section>`;
}
function dimGrid(sp,key,sec){
  const vals=sp.dims&&sp.dims[key];if(!vals)return na(sp.na&&sp.na[sec]);
  const k=FL();const rec=sp.recommend&&sp.recommend[key];
  return vgrid(vals.map(([val,label,note])=>{const o={...defO(sp),[key]:val};return vcard(sec,val,label,renderO(sp,o,k),k,{note,rec:rec===val,wide:(sp.wide&&sp.wide[sec])||sp.wideAll,data:sp.initCard?o:null,spec:sp.id})}).join(''),sp.min&&(sp.min[sec]||sp.min.all));
}
function tableHTML(head,rows,cls=''){return `<div class="cmp-wrap"><table class="cmp ${cls}"><thead><tr>${head.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><th scope="row">${r[0]}</th>${r.slice(1).map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
function langBench(fn,wide){const ls2=CMPL();return `<div class="bench${wide||ls2.length===1?' bench--rows':''}" style="--n:${ls2.length}">${ls2.map(k=>`<section class="lab-col" data-lang="${k}" aria-label="${SYS[k].name}"><header class="lab-col__h"><i class="mk mk--${k==='e'?'f':k==='m'?'a':k}" aria-hidden="true"></i><b>${SYS[k].name}</b><span>${SYS[k].tag}</span><span class="spec">${SYS[k].spec}</span></header>${stageHTML(k,fn(k))}</section>`).join('')}</div>`}

/* ---------- the 21 sections ---------- */
function compPage(sp){
  const k=FL();const d=defO(sp);
  const nVar=Object.values(sp.dims||{}).reduce((a,v)=>a+(v?v.length:0),0)+(sp.sizes===false?0:5)+(sp.colors===false?0:8)+(sp.extraCount||0);
  const S={};
  S.overview=secWrap('overview','Overview','Choose options to compose a variation. The preview updates live.',`<div class="prose"><p>${sp.overview||sp.desc}</p></div>${explorerHTML(sp)}`,sp.arch?.overview);
  S.anatomy=secWrap('anatomy','Anatomy','The parts of the component and the class that styles each.',`<div class="split2"><ol class="anat">${(sp.anatomy||[]).map(([p,c,dsc])=>`<li><span>${p}<code>${c}</code>${dsc?`<small style="display:block;color:var(--ui-ink-3);font-size:12px">${dsc}</small>`:''}</span></li>`).join('')}</ol>${stageHTML(k,renderO(sp,d,k),{cls:'anat-stage'})}</div>`,sp.arch?.anatomy);
  ['basic','layout','icon','state','content'].forEach(sec=>{const key=Object.keys(DIM2SEC).find(x=>DIM2SEC[x]===sec);let body=(sp.custom&&sp.custom[sec])?sp.custom[sec](k):dimGrid(sp,key,sec);
    if(sec==='layout'&&sp.density!==false)body+=`<h3 class="sub-h">Density</h3>`+vgrid(DENS.map(([v,l])=>vcard('density',v,l,renderO(sp,{...d,density:v},k),k,{data:sp.initCard?{...d,density:v}:null,spec:sp.id,wide:sp.wideAll})).join(''),sp.min&&(sp.min.layout||sp.min.all));
    S[sec]=secWrap(sec,SECS.find(s=>s[0]===sec)[1],(sp.leads&&sp.leads[sec])||SEC_LEAD[sec],body,sp.arch?.[sec]||ARCH_DEFAULT[sec])});
  S.size=secWrap('size','Size variants',SEC_LEAD.size,sp.custom?.size?sp.custom.size(k):sp.sizes===false?na(sp.na?.size):vgrid(SIZES.map(([v,l])=>vcard('size',v,l,renderO(sp,{...d,size:v},k),k,{rec:v==='m',data:sp.initCard?{...d,size:v}:null,spec:sp.id,wide:sp.wideAll})).join(''),sp.min?.size||sp.min?.all),sp.arch?.size||ARCH_DEFAULT.size);
  S.color=secWrap('color','Color variants',SEC_LEAD.color,sp.custom?.color?sp.custom.color(k):sp.colors===false?na(sp.na?.color):vgrid(COLORS.map(([v,l])=>vcard('color',v,l,renderO(sp,{...d,color:v},k),k,{rec:v==='primary',data:sp.initCard?{...d,color:v}:null,spec:sp.id,wide:sp.wideAll})).join(''),sp.min?.color||sp.min?.all),sp.arch?.color||ARCH_DEFAULT.color);
  S.responsive=secWrap('responsive','Responsive variants',SEC_LEAD.responsive,sp.custom?.responsive?sp.custom.responsive(k):respHTML(sp,k),sp.arch?.responsive||ARCH_DEFAULT.responsive);
  S.theme=secWrap('theme','Theme variants',SEC_LEAD.theme,vgrid(THEMES3.map(([v,l])=>vcard('theme',v,l,renderO(sp,d,k),k,{theme:v,data:sp.initCard?d:null,spec:sp.id,wide:sp.wideAll})).join(''),sp.min?.theme||sp.min?.all),sp.arch?.theme||ARCH_DEFAULT.theme);
  S.form=secWrap('form','Form usage',SEC_LEAD.form,sp.custom?.form?sp.custom.form(k):sp.form?sp.form(k):vgrid(vcard('form','form','In a purchase order form',renderO(sp,{...d,ctx:'form'},k),k,{wide:true})),sp.arch?.form||ARCH_DEFAULT.form);
  S.readonly=secWrap('readonly','Read-only usage',SEC_LEAD.readonly,sp.custom?.readonly?sp.custom.readonly(k):sp.readonly?sp.readonly(k):vgrid(vcard('readonly','readonly','On a read-only record',renderO(sp,{...d,ctx:'readonly',state:sp.dims?.state?.some(s=>s[0]==='readonly')?'readonly':d.state},k),k,{wide:true})),sp.arch?.readonly||ARCH_DEFAULT.readonly);
  S.cases=secWrap('cases','Enterprise use cases',SEC_LEAD.cases,sp.custom?.cases?sp.custom.cases(k):(sp.cases&&sp.cases.length)?vgrid(sp.cases.map(c=>vcard('case',slug(c.t),c.t,c.html(k),k,{wide:c.wide!==false,sub:c.area,note:c.d})).join(''),'420px'):na(),sp.arch?.cases||ARCH_DEFAULT.cases);
  const a11=Object.assign({},A11Y_DEFAULT,sp.a11y||{});
  S.a11y=secWrap('a11y','Accessibility','Same behaviour in every design language.',`${tableHTML(['Topic','Requirement'],A11Y_ROWS.map(([key,l])=>[l,a11[key]]))}${sp.keys?`<div class="a11y-grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))"><div><h3>Keyboard demonstration</h3><ul>${sp.keys.map(([kk,a])=>`<li><kbd>${kk}</kbd>${a}</li>`).join('')}</ul><p style="margin:8px 0 0">Try it in the Overview preview: press Tab to enter the component.</p></div></div>`:''}`);
  S.dodont=secWrap('dodont','Do / Don’t','',`<div class="dd"><div class="do"><h3>Do</h3>${sp.ddDo?stageHTML(k,sp.ddDo(k)):''}<ul>${[...(sp.do||[]),...DO_DEFAULT].map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="dont"><h3>Don’t</h3>${sp.ddDont?stageHTML(k,sp.ddDont(k)):''}<ul>${[...(sp.dont||[]),...DONT_DEFAULT].map(x=>`<li>${x}</li>`).join('')}</ul></div></div>`);
  S.tokens=secWrap('tokens','Design tokens','Tokens the component reads, traced from the stylesheet, plus the variation tokens shared by every component.',`<div data-tokuse></div><h3 class="sub-h">Variation tokens</h3>${tableHTML(['Wrapper','Tokens it sets','Effect'],[['.sz-xs … .sz-xl','--h-m, --fs, --px-m, --ic, --chk, --av-m','Size'],['.dn-compact / .dn-dense','--gap, --pad, --row, --li-h, --th-h, --h-m','Density'],['.co-success … .co-custom','--pri, --pri-h, --pri-p, --pri-sub, --pri-txt, --on-pri','Semantic colour'],['[data-theme]','All language tokens','Light / dark / high contrast']])}`);
  S.props=secWrap('props','Component properties','The public API for implementing this component.',tableHTML(['Property','Type','Default','Description'],(sp.props||[]).map(p=>[`<code>${p[0]}</code>`,`<code>${p[1]}</code>`,`<code>${p[2]}</code>`,p[3]])));
  S.compare=secWrap('compare','Comparison matrix','Which variant fits which job, then how each design language draws it.',`${tableHTML(['Variant','Best for','Advantages','Limitations','Recommended'],(sp.matrix||[]).map(r=>[r[0],r[1],r[2],r[3],r[4]?'<span class="yes">Yes</span>':'<span class="no">Situational</span>']))}<h3 class="sub-h">Reference rendering</h3>${langBench(kk=>renderO(sp,d,kk),sp.wideAll)}`);
  S.code=secWrap('code','Code example','HTML is shared; CSS and tokens are read from the live stylesheet for the language you pick.',codeShell());
  S.recommend=secWrap('recommend','Recommended usage','Which variant should I use?',`<div class="rec-box"><small>Recommended default</small><b>${sp.rec?.v||'—'}</b><p>${sp.rec?.why||''}</p></div>${tableHTML(['Requirement','Recommended','Reason'],sp.decide||[],'decide')}`,sp.arch?.recommend);
  return `<header class="pg-head"><span class="eyebrow">Components${sp.group?' · '+sp.group:''}</span><h1>${sp.title}</h1><p>${sp.desc}</p><div class="meta-line"><span><b>${nVar}</b> variations</span><span><b>${sp.dims?.state?.length||0}</b> states</span><span>Recommended: <b>${sp.rec?.v||'—'}</b></span><span><code>.${(sp.cls||['ds'])[0]}</code></span></div><p class="lang-note">Variations shown in <b>${SYS[k].name}</b>${ST.lang==='all'?' (recommended default). Comparison sections show all four primary languages; pick one in the top bar to switch.':'.'}</p></header>
  ${archBanner(sp)}
  <nav class="docnav" aria-label="On this page">${SECS.map(([id,t],i)=>`<button type="button" data-jump="s-${id}"><b>${String(i+1).padStart(2,'0')}</b>${t}</button>`).join('')}</nav>
  ${SECS.map(([id])=>S[id]).join('')}`;
}
function archBanner(sp){
  const a=sp.archView||{};
  return `<div class="arch-only arch-banner"><h3>Architect view · ${sp.title}</h3><div class="arch-grid"><div><b>Anatomy</b>${(sp.anatomy||[]).map(x=>x[0]).join(' · ')}</div><div><b>Layout rules</b>${a.layout||'Aligns to the 8px grid; spacing from --gap and --pad.'}</div><div><b>Typography</b>${a.type||'Body --fs; labels --fs-s; weights from the language.'}</div><div><b>State model</b>${(sp.dims?.state||[]).map(s=>s[1]).join(' → ')||'—'}</div><div><b>Accessibility</b>${(sp.a11y&&sp.a11y.aria)||A11Y_DEFAULT.aria}</div><div><b>Recommended</b>${sp.rec?.v||'—'}: ${sp.rec?.why||''}</div><div><b>Anti-patterns</b>${(sp.dont||[]).slice(0,2).join('; ')||DONT_DEFAULT[0]}</div><div><b>Responsive rules</b>${sp.resp?.mobile||'Reflows to one column; touch targets 44px.'}</div><div><b>Properties</b>${(sp.props||[]).slice(0,5).map(p=>p[0]).join(', ')}</div></div></div>`;
}
function respHTML(sp,k){
  const d=defO(sp);const r=sp.resp||{};
  const frame=(dev,o,label,note)=>`<div><span>${label}</span><div class="dev dev--${dev}"><div class="dev__bar"><i></i><i></i><i></i>${dev==='desktop'?'1280':dev==='tablet'?'768':'375'}px</div>${stageHTML(k,renderO(sp,o,k),{data:sp.initCard?o:null,spec:sp.id})}</div>${note?`<p>${note}</p>`:''}</div>`;
  let h=`<div class="devs">${frame('desktop',{...d,device:'desktop'},'Desktop',r.desktop)}${frame('tablet',{...d,device:'tablet'},'Tablet',r.tablet)}${frame('mobile',{...d,device:'mobile'},'Mobile',r.mobile)}</div>`;
  if(sp.respExtra)h+=`<h3 class="sub-h">More mobile variants</h3><div class="devs" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">${sp.respExtra.map(([l,o,note])=>frame('mobile',{...d,device:'mobile',...o},l,note)).join('')}</div>`;
  return h;
}

/* ---------- explorer ---------- */
let XO=null;
function explorerHTML(sp){
  XO={...defO(sp),theme:'page'};
  const sel=(key,label,opts)=>`<label>${label}<select data-xp="${key}">${opts.map(([v,l])=>`<option value="${v}"${XO[key]===v?' selected':''}>${l}</option>`).join('')}</select></label>`;
  const dims=Object.entries(sp.dims||{}).filter(([,v])=>v).map(([key,v])=>sel(key,(sp.dimLabel&&sp.dimLabel[key])||DIMNAME[key],v));
  return `<div class="xp" data-xp-root><div class="xp__ctrls">${dims.join('')}${sp.sizes===false?'':sel('size','Size',SIZES)}${sp.colors===false?'':sel('color','Color',COLORS)}${sel('density','Density',DENS)}${sel('ctx','Context',CTXS)}${sel('theme','Theme',[['page','Page theme'],...THEMES3])}</div><div class="xp__bar"><span class="lbl">Device</span><div class="ui-seg" role="group" aria-label="Preview device">${DEVICES.map(([v,l])=>`<button type="button" data-xpdev="${v}" aria-pressed="${v==='desktop'}">${l}</button>`).join('')}</div><span class="grow"></span><button type="button" class="ui-link" data-jump="s-recommend">Which variant should I use?</button></div><div class="xp__out" data-xp-out></div><p class="xp__sum" data-xp-sum></p></div>`;
}
function xpRender(root){
  const sp=DOCS[LAB.page];const out=root.querySelector('[data-xp-out]');if(!out)return;
  const ks=CMPL();out.classList.toggle('multi',ks.length>1&&XO.device==='desktop');
  out.innerHTML=ks.map(k=>`<div class="xp__cell"><span><i class="mk mk--${k==='e'?'f':k==='m'?'a':k}"></i>${SYS[k].name}</span><div class="dev dev--${XO.device}">${stageHTML(k,renderO(sp,XO,k),{theme:XO.theme,data:sp.initCard?XO:null,spec:sp.id})}</div></div>`).join('');
  const lab=(key,list)=>{const f=(list||[]).find(x=>x[0]===XO[key]);return f?f[1]:XO[key]};
  const parts=[`Component: ${sp.title}`,...Object.entries(sp.dims||{}).filter(([,v])=>v).map(([key,v])=>`${(sp.dimLabel&&sp.dimLabel[key])||DIMNAME[key]}: ${lab(key,v)}`),sp.sizes===false?'':`Size: ${lab('size',SIZES)}`,sp.colors===false?'':`Color: ${lab('color',COLORS)}`,`Density: ${lab('density',DENS)}`,`Theme: ${XO.theme==='page'?ST.theme:XO.theme}`,`Context: ${lab('ctx',CTXS)}`,`Device: ${lab('device',DEVICES)}`].filter(Boolean);
  root.querySelector('[data-xp-sum]').textContent=parts.join('  ·  ');
  afterRender(out);
}

/* ---------- shell ---------- */
function shellHTML(){
  return `<div class="app"><aside class="nav" id="nav" aria-label="Lab navigation"><div class="nav__brand"><a href="${href('index')}" style="display:flex;gap:10px;align-items:center;text-decoration:none"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="nav__title">Chroma UX<small>Component Lab</small></span></a></div>
  <div class="nav__search"><svg class="ui-ic" aria-hidden="true"><use href="#i-search"/></svg><input id="nav-q" type="search" placeholder="Search components, variants, use cases" aria-label="Search the lab" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="srch" aria-autocomplete="list"><kbd aria-hidden="true">/</kbd><div class="srch" id="srch" role="listbox" aria-label="Search results" hidden></div></div>
  <nav class="nav__scroll" id="nav-tree" aria-label="Pages"></nav><div class="nav__foot" id="nav-foot"></div></aside><div class="scrim" id="scrim"></div>
  <div class="main"><header class="top" id="top">
    <button class="ui-iconbtn top__menu" id="menu-btn" aria-label="Open navigation" aria-expanded="false" aria-controls="nav"><svg class="ui-ic" aria-hidden="true"><use href="#i-menu"/></svg></button>
    <div class="top__primary"><label class="top__lbl" for="pg-switch">Viewing</label><select id="pg-switch" class="ui-select ui-select--primary"></select></div>
    <div class="top__secondary"><span class="top__lbl">Design language</span><span class="ui-seg"><button type="button" aria-pressed="true" tabindex="-1">Chroma</button></span></div>
    <div class="top__utility"><div class="ui-seg ui-seg--quiet" id="theme-switch" role="group" aria-label="Theme">${[['light','Light'],['dark','Dark'],['hc','High contrast']].map(([v,l])=>`<button type="button" data-theme-set="${v}" aria-pressed="${ST.theme===v}">${l}</button>`).join('')}</div><button type="button" class="arch-tg" id="arch-btn" aria-pressed="${ST.arch}">${uic('layers')}Architect view</button></div>
  </header><main class="page" id="page" tabindex="-1"></main></div></div><div class="toast-host" id="ui-toast" role="status" aria-live="polite"></div>`;
}
function navHTML(){
  const f=favs();
  let h=`<div class="nav__sec favs"><div class="nav__head">★ Favorites<span>${f.length}</span></div>${f.length?`<ul>${f.map(x=>`<li><a href="${ROOT}${x.id.replace('#','.html#')}" title="${esc(x.label)}">${esc(x.label)}</a><button type="button" data-unfav="${esc(x.id)}" aria-label="Remove ${esc(x.label)}">×</button></li>`).join('')}</ul>`:`<p class="empty">Star any variation to keep it here.</p>`}</div>`;
  NAV.forEach(([label,items])=>{h+=`<div class="nav__sec"><div class="nav__head">${label}<span>${items.length}</span></div><ul class="nav__list">${items.map(id=>{const d=DOCS[id];return d?`<li><a class="nav__link" href="${href(id)}"${id===LAB.page?' aria-current="page"':''}>${uic(d.icon||'box')}<span class="nav__txt">${d.title}</span></a></li>`:''}).join('')}</ul></div>`});
  return h;
}
function buildShell(){
  document.body.insertAdjacentHTML('afterbegin',SPRITE+shellHTML());
  $('#nav-tree').innerHTML=navHTML();
  $('#nav-foot').textContent=`${SPECS.length} components · ${NAV.find(n=>n[0]==='Patterns')[1].length} patterns · Chroma`;
  $('#pg-switch').innerHTML=NAV.map(([label,items])=>`<optgroup label="${label}">${items.filter(id=>DOCS[id]).map(id=>`<option value="${id}"${id===LAB.page?' selected':''}>${DOCS[id].title}</option>`).join('')}</optgroup>`).join('');
  const cl=$('.nav__link[aria-current]');if(cl)cl.scrollIntoView({block:'center'});
}
function applyTheme(){document.documentElement.setAttribute('data-theme',ST.theme);$$('[data-theme-set]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeSet===ST.theme)))}

/* ---------- page render ---------- */
function pagerNav(){
  const order=NAV.flatMap(n=>n[1]).filter(id=>DOCS[id]);const i=order.indexOf(LAB.page);const a=order[i-1],b=order[i+1];
  return `<nav class="pg-nav" aria-label="Previous and next">${a?`<a href="${href(a)}"><small>Previous</small><b>${DOCS[a].title}</b></a>`:''}${b?`<a class="next" href="${href(b)}"><small>Next</small><b>${DOCS[b].title}</b></a>`:''}</nav>`;
}
function renderPage(keepScroll){
  const d=DOCS[LAB.page];if(!d){$('#page').innerHTML='<div class="page-in"><p>Page not found.</p></div>';return}
  const y=window.scrollY;
  $('#page').innerHTML=`<div class="page-in">${d.kind==='comp'?compPage(d):d.render()}${pagerNav()}</div>`;
  document.title=`${d.title} · Chroma UX Component Lab`;
  afterRender($('#page'));
  if(d.kind==='comp'){xpRender($('[data-xp-root]'));const tu=$('[data-tokuse]');if(tu)setTimeout(()=>tu.innerHTML=tokenUseHTML(d),30);if(S.view==='code')fillCode2()}
  if(d.init)try{d.init($('#page'))}catch(e){console.error(e)}
  if(ST.arch)measureAll();
  observeDocnav();
  if(keepScroll)window.scrollTo(0,y);else if(location.hash){const t=document.getElementById(location.hash.slice(1));if(t)setTimeout(()=>t.scrollIntoView({block:'start'}),60)}
}
function afterRender(root){
  $$('.ds-cal',root).filter(c=>!c.closest('.ds-pop')&&!c.dataset.done).forEach(c=>{c.dataset.done=1;renderCal(c)});
  $$('.ds-multi-chips',root).forEach(c=>syncMulti(c.closest('.ds-anchor')));
  $$('.ds-range',root).forEach(updRange);
  $$('[data-o]',root).forEach(st=>{const sp=DOCS[st.dataset.spec];if(sp&&sp.initCard&&!st.dataset.inited){st.dataset.inited=1;try{sp.initCard(st,JSON.parse(st.dataset.o),st.dataset.k)}catch(e){console.error(e)}}});
  $$('[data-init]',root).forEach(el=>{if(el.dataset.inited)return;el.dataset.inited=1;const fn=INITS[el.dataset.init];if(fn)try{fn(el,kOf(el))}catch(e){console.error(e)}});
  $$('.ds-pager[data-init-pg]',root).forEach(n=>renderPager(n,+n.dataset.initPg));
  requestAnimationFrame(()=>$$('.ds-tablist',root).forEach(moveInd));
}
const INITS={};
function tokenUseHTML(sp){
  const cats=[['Colour',/color|text|surface|border|separator|hover|pressed|neutral|success|warning|danger|info|discovery|label|fill|canvas|material|stroke|divider|subtle|focus|inverse|blanket|toggle|green|orange|red|purple|primary|link|field/],['Spacing',/space|spacing/],['Typography',/font/],['Radius',/radius/],['Elevation',/shadow/],['Sizing',/height/]];
  const per={};const ks=CMPL();
  ks.forEach(k=>{const css=cssFor(k,sp.cls||[]);const map=tokenMap(k);const used=new Set();const visit=t=>{for(const m of t.matchAll(/var\((--[\w-]+)/g)){if(!used.has(m[1])&&map[m[1]]!=null){used.add(m[1]);visit(map[m[1]])}}};visit(css);
    per[k]={};[...used].filter(n=>/^--[a-z]-/.test(n)).forEach(n=>{const s=n.slice(4);const c=(/radius|shadow|font|space|spacing|height/.test(s)?cats.find(([,re])=>re.test(s)&&/radius|shadow|font|space|height/.test(re.source.slice(0,7))):null)||cats.find(([,re])=>re.test(s))||['Other'];(per[k][c[0]]=per[k][c[0]]||[]).push(n)})});
  const names=[...cats.map(c=>c[0]),'Other'].filter(c=>ks.some(k=>per[k][c]));
  if(!names.length)return `<p class="lead">Built from other components; it reads their tokens plus the shared aliases <code>--gap</code>, <code>--pad</code>, <code>--r</code> and <code>--sep</code>.</p>`;
  return `<div class="cmp-wrap"><table class="cmp tok-use"><thead><tr><th scope="col">Category</th>${ks.map(k=>`<th scope="col">${SYS[k].short}</th>`).join('')}</tr></thead><tbody>${names.map(c=>`<tr><th scope="row">${c}</th>${ks.map(k=>`<td>${(per[k][c]||[]).sort().map(n=>`<span>${n}</span>`).join('')||'—'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function fillCode2(){
  const out=$('#code-out');const sp=DOCS[LAB.page];if(!out||!sp||sp.kind!=='comp')return;
  const k=S.codeSys;const d=defO(sp);let txt;
  if(S.codeFile==='html')txt=`<!-- ${SYS[k].name}: place inside class="${SC(k)}" -->\n<div class="${SC(k)}">\n`+prettyHTML(renderO(sp,d,k)).split('\n').map(l=>'  '+l).join('\n')+'\n</div>';
  else if(S.codeFile==='css')txt=cssFor(k,sp.cls||[]);else txt=tokensFor(k,sp.cls||[]);
  out.innerHTML=S.codeFile==='html'?hlHTML(txt):hlCSS(txt);out._raw=txt;
}
function codeShell(){
  if(!LANGS.includes(S.codeSys))S.codeSys='f';if(ST.lang!=='all')S.codeSys=ST.lang;
  return `<div class="code-shell"><div class="code-shell__bar"><div class="ui-seg" role="group" aria-label="Design language">${LANGS.map(k=>`<button type="button" data-code-sys="${k}" aria-pressed="${S.codeSys===k}">${SYS[k].short}</button>`).join('')}</div><div class="ui-seg" role="group" aria-label="File">${[['html','HTML'],['css','CSS'],['tokens','Tokens']].map(([f,l])=>`<button type="button" data-code-file="${f}" aria-pressed="${S.codeFile===f}">${l}</button>`).join('')}</div><span class="grow"></span><button type="button" class="ui-btn" id="copy-code">${uic('copy')}<span>Copy</span></button></div><pre class="code" id="code-out" tabindex="0" aria-label="Source code"></pre></div>`;
}

/* ---------- architect measurements ---------- */
const MEASURE_SEL='.ds-btn,.ds-control,.dx-st,.ds-tablist,.ds-check,.ds-switch,.ds-badge,.ds-chip,.ds-tag,.ds-card,.ds-table,.ds-pager,.ds-crumbs,.ds-alert,.ds-prog,.ds-dialog,.ds-drawer,.ds-popover,.ds-tip,.ds-pop,.ds-cal,.ds-drop,.ds-tl,.ds-tree,.dx-kb,.dx-empty,.dx-notif,.ds-av,.dx-chart,.ds-editor,.ds-acc,.dx-cal,.dx-cmdbar,.dx-filterbar,.ds-list,.fx,.ctx-frame';
function measureAll(){
  $$('.vx').forEach(v=>{const out=v.querySelector('[data-measure]');const st=v.querySelector('.vx__stage');if(!out||!st)return;const el=st.querySelector(MEASURE_SEL);if(!el){out.textContent='Composite: see Design tokens.';return}
    const r=el.getBoundingClientRect(),cs=getComputedStyle(el);const rad=parseFloat(cs.borderTopLeftRadius)||0;
    out.textContent=`${'.'+([...el.classList].find(c=>/^(ds|dx)-/.test(c))||el.tagName.toLowerCase())}  ${Math.round(r.width)}×${Math.round(r.height)}  r${rad>=999?'full':Math.round(rad)}  ${parseFloat(cs.fontSize)}/${cs.fontWeight}  pad ${Math.round(parseFloat(cs.paddingTop))}·${Math.round(parseFloat(cs.paddingRight))}  gap ${cs.gap==='normal'?'—':cs.gap}`});
}

/* ---------- search ---------- */
let INDEX=null;
function buildIndex(){
  const out=[];
  NAV.forEach(([sec,items])=>items.forEach(id=>{const d=DOCS[id];if(d)out.push({l:d.title,s:sec,h:href(id),w:3})}));
  SPECS.forEach(sp=>{
    Object.entries(sp.dims||{}).forEach(([key,vals])=>(vals||[]).forEach(([v,l])=>out.push({l:`${l} ${sp.noun}`,s:`${sp.title} · ${(sp.dimLabel&&sp.dimLabel[key])||DIMNAME[key]}`,h:href(sp.id)+(DIM2SEC[key]?`#v-${DIM2SEC[key]}-${slug(v)}`:`#s-${(sp.secOf&&sp.secOf[key])||'overview'}`),w:2})));
    (sp.cases||[]).forEach(c=>out.push({l:c.t,s:`${sp.title} · use case`,h:href(sp.id)+`#v-case-${slug(c.t)}`,w:1}));
    (sp.searchExtra||[]).forEach(([l,anchor])=>out.push({l,s:sp.title,h:href(sp.id)+(anchor?'#'+anchor:''),w:2}));
    (sp.dims?.state||[]).length&&out.push({l:`${sp.noun} states`,s:sp.title,h:href(sp.id)+'#s-state',w:1});
  });
  Object.values(DOCS).forEach(d=>(d.searchExtra||[]).forEach(([l,anchor])=>d.kind!=='comp'&&out.push({l,s:d.title,h:href(d.id)+(anchor?'#'+anchor:''),w:1})));
  return out;
}
function runSearch(q){
  INDEX=INDEX||buildIndex();const box=$('#srch');const inp=$('#nav-q');
  q=q.trim().toLowerCase();if(!q){box.hidden=true;inp.setAttribute('aria-expanded','false');return}
  const words=q.split(/\s+/);
  const hits=INDEX.map(x=>{const t=(x.l+' '+x.s).toLowerCase();if(!words.every(w=>t.includes(w)))return null;let sc=x.w;if(x.l.toLowerCase().startsWith(q))sc+=5;if(x.l.toLowerCase().includes(q))sc+=2;return [sc,x]}).filter(Boolean).sort((a,b)=>b[0]-a[0]).slice(0,16).map(a=>a[1]);
  const re=new RegExp('('+words.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','gi');
  box.innerHTML=hits.length?hits.map((x,i)=>`<a href="${x.h}" role="option" id="sr-${i}"${i===0?' class="is-cur"':''}>${esc(x.l).replace(re,'<mark>$1</mark>')}<small>${esc(x.s)}</small></a>`).join(''):`<div class="none">No matches for “${esc(q)}”. Try a component name, “vertical”, “error” or “purchase order”.</div>`;
  box.hidden=false;inp.setAttribute('aria-expanded','true');if(hits.length)inp.setAttribute('aria-activedescendant','sr-0');
}

/* ---------- events ---------- */
function observeDocnav(){
  const nav=$('.docnav');if(!nav||!('IntersectionObserver' in window))return;
  const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){const id=e.target.id;$$('.docnav button').forEach(b=>b.classList.toggle('is-on',b.dataset.jump===id));const on=nav.querySelector('.is-on');if(on)on.scrollIntoView({block:'nearest',inline:'nearest'})}})},{rootMargin:'-30% 0px -65% 0px'});
  $$('.sec[id^="s-"]').forEach(s=>io.observe(s));
}
document.addEventListener('click',e=>{
  const t=e.target;let el;
  if((el=t.closest('[data-jump]'))){e.preventDefault();const target=document.getElementById(el.dataset.jump);if(target)target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});return}
  if((el=t.closest('[data-lang-set]'))){ST.lang=el.dataset.langSet;ls.set('lang',ST.lang);$$('[data-lang-set]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));renderPage(true);return}
  if((el=t.closest('[data-theme-set]'))){ST.theme=el.dataset.themeSet;ls.set('theme',ST.theme);applyTheme();const d=DOCS[LAB.page];if(d&&d.rerenderOnTheme)renderPage(true);else if(ST.arch)measureAll();return}
  if((el=t.closest('#arch-btn'))){ST.arch=!ST.arch;ls.set('arch',ST.arch?'1':'0');el.setAttribute('aria-pressed',String(ST.arch));document.body.classList.toggle('arch',ST.arch);if(ST.arch)measureAll();uiToast(ST.arch?'Architect view on':'Architect view off');return}
  if((el=t.closest('[data-fav]'))){let f=favs();const id=el.dataset.fav;if(f.some(x=>x.id===id))f=f.filter(x=>x.id!==id);else f.unshift({id,label:el.dataset.label});ls.set('favs',JSON.stringify(f.slice(0,40)));el.setAttribute('aria-pressed',String(f.some(x=>x.id===id)));$('#nav-tree').innerHTML=navHTML();uiToast(f.some(x=>x.id===id)?'Added to favorites':'Removed from favorites');return}
  if((el=t.closest('[data-unfav]'))){const f=favs().filter(x=>x.id!==el.dataset.unfav);ls.set('favs',JSON.stringify(f));$('#nav-tree').innerHTML=navHTML();const s=$(`[data-fav="${CSS.escape(el.dataset.unfav)}"]`);if(s)s.setAttribute('aria-pressed','false');return}
  if((el=t.closest('[data-xpdev]'))){XO.device=el.dataset.xpdev;$$('[data-xpdev]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));xpRender(el.closest('[data-xp-root]'));return}
  if((el=t.closest('[data-view]'))){return}
  if((el=t.closest('[data-code-sys]'))){S.codeSys=el.dataset.codeSys;$$('[data-code-sys]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));fillCode2();return}
  if((el=t.closest('[data-code-file]'))){S.codeFile=el.dataset.codeFile;$$('[data-code-file]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));fillCode2();return}
  if((el=t.closest('#copy-code'))){const out=$('#code-out');const txt=out._raw||out.textContent;const lab=el.querySelector('span');const fallback=()=>{const r=document.createRange();r.selectNodeContents(out);const s=getSelection();s.removeAllRanges();s.addRange(r);uiToast('Selected. Press Ctrl+C to copy')};try{navigator.clipboard.writeText(txt).then(()=>{lab.textContent='Copied';setTimeout(()=>lab.textContent='Copy',1500)},fallback)}catch(err){fallback()}return}
  if((el=t.closest('#menu-btn'))){const open=!document.body.classList.contains('nav-open');document.body.classList.toggle('nav-open',open);el.setAttribute('aria-expanded',String(open));return}
  if(t.closest('#scrim')){document.body.classList.remove('nav-open');$('#menu-btn').setAttribute('aria-expanded','false')}
  if(!t.closest('.nav__search')){const b=$('#srch');if(b)b.hidden=true}
});
document.addEventListener('change',e=>{const s=e.target.closest&&e.target.closest('[data-xp]');if(s){XO[s.dataset.xp]=s.value;xpRender(s.closest('[data-xp-root]'))}if(e.target.id==='pg-switch')location.href=href(e.target.value)});
document.addEventListener('keydown',e=>{
  if(e.key==='/'&&!e.target.closest('input,textarea,select,[contenteditable="true"]')){e.preventDefault();if(innerWidth<=900)document.body.classList.add('nav-open');$('#nav-q').focus()}
  if(e.target.id==='nav-q'){const box=$('#srch');const items=$$('a',box);const i=items.findIndex(a=>a.classList.contains('is-cur'));
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!items.length)return;const n=(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items.forEach(a=>a.classList.remove('is-cur'));items[n].classList.add('is-cur');items[n].scrollIntoView({block:'nearest'});e.target.setAttribute('aria-activedescendant',items[n].id)}
    if(e.key==='Enter'&&items[i]){e.preventDefault();location.href=items[i].getAttribute('href')}
    if(e.key==='Escape'){box.hidden=true;e.target.setAttribute('aria-expanded','false')}}
});
document.addEventListener('input',e=>{if(e.target.id==='nav-q')runSearch(e.target.value)});
window.addEventListener('hashchange',()=>{const t=document.getElementById(location.hash.slice(1));if(t)t.scrollIntoView({block:'start'})});
let _rt;window.addEventListener('resize',()=>{clearTimeout(_rt);_rt=setTimeout(()=>{$$('.ds-tablist').forEach(moveInd);const tp=$('#top');if(tp)document.documentElement.style.setProperty('--top-h',tp.offsetHeight+'px')},100)});

/* ---------- boot (called at the end of the last script) ---------- */
function boot(){
  document.body.dataset.show='all';
  buildShell();applyTheme();document.body.classList.toggle('arch',ST.arch);
  const tp=$('#top');if(tp)document.documentElement.style.setProperty('--top-h',tp.offsetHeight+'px');
  renderPage();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{$$('.ds-tablist').forEach(moveInd);if(ST.arch)measureAll()});
}

/* ---------- small shared builders for specs and pages ---------- */
const money=n=>'$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const kv=pairs=>`<dl class="dx-ro">${pairs.map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>`;
const scr=(title,actions,body,o={})=>`<div class="dx-screen"><div class="dx-screen__bar">${o.crumbs?`<nav aria-label="Breadcrumb" style="width:100%"><ol class="ds-crumbs">${o.crumbs.map((c,i,a)=>i<a.length-1?`<li><a class="ds-crumb" href="#">${c}</a></li>`:`<li><span aria-current="page">${c}</span></li>`).join('')}</ol></nav>`:''}<h4>${title}</h4>${o.badge||''}<div class="ds-row" style="gap:8px">${actions||''}</div></div><div class="dx-screen__body">${body}</div></div>`;
const panel=(title,body,extra='')=>`<div class="dx-panel">${title?`<h5>${title}${extra}</h5>`:''}${body}</div>`;
function TBL(cols,rows,o={}){
  return `<div class="ds-tablewrap${o.wrap?' '+o.wrap:''}"><table class="ds-table${o.cls?' '+o.cls:''}"><caption class="ds-sr">${o.caption||'Table'}</caption><thead><tr>${cols.map(c=>{const [l,cl]=Array.isArray(c)?c:[c];return `<th scope="col"${cl?` class="${cl}"`:''}>${o.sort?`<button type="button" class="ds-sort">${l}${ic('arrow-up')}</button>`:l}</th>`}).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>{const cl=Array.isArray(cols[i])?cols[i][1]:'';return `<td${cl?` class="${cl}"`:''}>${c}</td>`}).join('')}</tr>`).join('')}</tbody>${o.foot?`<tfoot><tr>${o.foot.map((c,i)=>{const cl=Array.isArray(cols[i])?cols[i][1]:'';return `<td${cl?` class="${cl}"`:''}>${c}</td>`}).join('')}</tr></tfoot>`:''}</table></div>`;
}
const PO=[
  {no:'PO-2291',vendor:'Northwind Supplies',item:'Laptops 14" (48)',total:86400,status:['Awaiting approval','warning'],date:'Oct 18',owner:'Liam Shah'},
  {no:'PO-2290',vendor:'Contoso Freight',item:'Freight services Q4',total:12850,status:['Approved','success'],date:'Oct 17',owner:'Priya Nair'},
  {no:'PO-2287',vendor:'Fabrikam Office',item:'Ergonomic chairs (30)',total:16200,status:['Ordered','info'],date:'Oct 15',owner:'Aiko Kato'},
  {no:'PO-2284',vendor:'Litware Labs',item:'Software licences',total:42000,status:['Rejected','danger'],date:'Oct 12',owner:'Maya Ruiz'},
  {no:'PO-2280',vendor:'Adatum Parts',item:'Spare parts kit',total:3940,status:['Received','success'],date:'Oct 09',owner:'Tomás Weber'}
];
const EMP=[{n:'Maya Ruiz',r:'Engineering lead',d:'Engineering',i:'MR',c:1,st:['Active','success']},{n:'Jonas Ortiz',r:'Product designer',d:'Design',i:'JO',c:4,st:['On leave','warning']},{n:'Aiko Kato',r:'Backend engineer',d:'Engineering',i:'AK',c:5,st:['Active','success']},{n:'Liam Shah',r:'Procurement analyst',d:'Operations',i:'LS',c:3,st:['Onboarding','info']},{n:'Priya Nair',r:'Finance manager',d:'Finance',i:'PN',c:2,st:['Active','success']}];
const LEADS=[{n:'Northwind Retail',c:'Ana Costa',v:48000,s:['Qualified','info'],src:'Web form'},{n:'Contoso Freight',c:'Ben Okafor',v:126000,s:['Proposal','new'],src:'Referral'},{n:'Fabrikam Health',c:'Chen Li',v:92000,s:['Negotiation','warning'],src:'Event'},{n:'Tailspin Air',c:'Dana Park',v:31000,s:['New',''],src:'Cold call'}];

