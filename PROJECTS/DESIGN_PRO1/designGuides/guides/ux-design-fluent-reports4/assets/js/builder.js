'use strict';
/* =====================================================================
   Reports & Analytics — visual report builder.
   Palette → canvas (12-column grid) → properties. Widgets are plain
   objects; every change re-derives a chart spec from sample datasets
   and hands it to the shared chart layer. Undo/redo snapshots, autosave
   to localStorage, hash routes for each builder topic (#filters …).
   ===================================================================== */
(function(){
  const {$,$$,esc,ic,fmt}=RA;
  const root=$('.rb');if(!root)return;

  /* ---------------------------------------------------------------- sample datasets */
  function rng(seed){let s=seed>>>0;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
  const MONTHS=['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'];
  const REG=['North','South','East','West','Central'],CAT=['Electrical','Hardware','Packaging','Raw material','Spares','Consumables'],CH=['Distributor','Direct','E-commerce','Modern trade'];
  const WH=['Pune WH-1','Chennai WH-2','Gurugram WH-3','Kolkata WH-4','Ahmedabad WH-5'],SUP=['Tata Steel','Havells','Polycab','SKF India','Uflex','Finolex'],POST=['Approved','Pending','Received','Cancelled'];
  const SEG=['Enterprise','Mid-market','SMB','Government'];
  function sales(){const r=rng(7),out=[];MONTHS.forEach((m,mi)=>REG.forEach((g,gi)=>CAT.forEach((c,ci)=>{const base=(1+mi*.035)*(1.3-gi*.12)*(1.25-ci*.11)*(.85+r()*.3);const rev=Math.round(base*2.6e6);const ord=Math.round(base*48);out.push({month:m,region:g,category:c,channel:CH[(mi+gi+ci)%4],revenue:rev,orders:ord,qty:Math.round(ord*(8+r()*20)),cost:Math.round(rev*(.66+r()*.1))})})));return out}
  function inventory(){const r=rng(11),out=[];WH.forEach((w,wi)=>CAT.forEach((c,ci)=>{const v=Math.round((1.4-wi*.15)*(1.3-ci*.12)*(.8+r()*.4)*1.2e7);out.push({warehouse:w,category:c,stockValue:v,units:Math.round(v/(380+r()*900)),days:Math.round(28+r()*70),status:r()>.82?'Low stock':r()>.95?'Out of stock':'Healthy'})}));return out}
  function purchase(){const r=rng(5),out=[];MONTHS.forEach((m,mi)=>SUP.forEach((s,si)=>{const v=Math.round((1+mi*.02)*(1.35-si*.12)*(.8+r()*.4)*3.1e6);out.push({month:m,supplier:s,category:CAT[si%6],status:POST[Math.floor(r()*4)],poValue:v,pos:Math.round(v/2.4e5),leadDays:Math.round(9+r()*14)})}));return out}
  function customers(){const r=rng(3),out=[];MONTHS.forEach((m,mi)=>SEG.forEach((s,si)=>REG.forEach(g=>{const n=Math.round((1+mi*.02)*(1.2-si*.18)*(60+r()*40));out.push({month:m,segment:s,region:g,newCustomers:n,active:n*14,ltv:Math.round((4.2-si*.8)*(.9+r()*.2)*1e5),churn:+(2+si*.8+r()*1.5).toFixed(1)})})));return out}
  const DS={
    sales:{label:'Sales orders',rows:sales(),dims:[['month','Month'],['region','Region'],['category','Category'],['channel','Channel']],ms:[['revenue','Revenue',{cur:'inr'}],['orders','Orders',{}],['qty','Quantity',{}],['cost','Cost of goods',{cur:'inr'}]]},
    inventory:{label:'Inventory snapshot',rows:inventory(),dims:[['warehouse','Warehouse'],['category','Category'],['status','Stock status']],ms:[['stockValue','Stock value',{cur:'inr'}],['units','Units on hand',{}],['days','Days of cover',{}]]},
    purchase:{label:'Purchase orders',rows:purchase(),dims:[['month','Month'],['supplier','Supplier'],['category','Category'],['status','PO status']],ms:[['poValue','PO value',{cur:'inr'}],['pos','Purchase orders',{}],['leadDays','Lead time (days)',{}]]},
    customers:{label:'Customers',rows:customers(),dims:[['month','Month'],['segment','Segment'],['region','Region']],ms:[['newCustomers','New customers',{}],['active','Active customers',{}],['ltv','Lifetime value',{cur:'inr'}],['churn','Churn rate',{suf:'%',dp:1}]]},
  };
  const dimL=(src,k)=>(DS[src].dims.find(d=>d[0]===k)||[k,k])[1];
  const ORDER={month:MONTHS};

  /* ---------------------------------------------------------------- state */
  const VIZ=[['column','Column','data_bar_vertical'],['bar','Bar','data_bar_horizontal'],['line','Line','data_line'],['area','Area','data_area'],['pie','Donut','data_pie'],['funnel','Funnel','data_funnel'],['treemap','Treemap','data_treemap'],['combo','Combo','chart_multiple'],['table','Table','table'],['kpi','KPI','data_trending']];
  let uid=1;const W=(o)=>({id:'w'+(uid++),w:6,h:7,title:'Untitled',kind:'chart',cfg:{source:'sales',type:'column',metric:'revenue',dim:'month',series:'',agg:'sum',sort:'',top:0,filters:[],labels:false,legend:true,palette:'cat'},...o,cfg:{source:'sales',type:'column',metric:'revenue',dim:'month',series:'',agg:'sum',sort:'',top:0,filters:[],labels:false,legend:true,palette:'cat',...(o&&o.cfg||{})}});
  const TEMPLATE=()=>({title:'Monthly sales review',desc:'Revenue, orders and mix by region and category · sample data',region:'All',calcs:[{key:'margin',label:'Gross margin %',formula:'(revenue - cost) / revenue * 100',unit:{suf:'%',dp:1}},{key:'aov',label:'Average order value',formula:'revenue / orders',unit:{cur:'inr'}}],
    widgets:[W({kind:'kpi',title:'Revenue',w:3,h:3,cfg:{metric:'revenue'}}),W({kind:'kpi',title:'Orders',w:3,h:3,cfg:{metric:'orders'}}),W({kind:'kpi',title:'Gross margin %',w:3,h:3,cfg:{metric:'margin'}}),W({kind:'kpi',title:'Average order value',w:3,h:3,cfg:{metric:'aov'}}),
      W({title:'Revenue by month',w:8,h:7,cfg:{type:'column',metric:'revenue',dim:'month',series:'',labels:false}}),W({title:'Revenue by category',w:4,h:7,cfg:{type:'pie',metric:'revenue',dim:'category'}}),
      W({title:'Revenue by region and channel',w:6,h:7,cfg:{type:'bar',metric:'revenue',dim:'region',series:'channel'}}),W({kind:'table',title:'Top categories',w:6,h:7,cfg:{metric:'revenue',dim:'category',sort:'desc'}}),
      W({kind:'text',title:'Commentary',w:12,h:3,text:'Revenue grew steadily through the year, led by the North and South regions. Electrical and Hardware remain the largest categories; Consumables is the fastest-growing line. (Sample commentary — click to edit.)'})]});
  let R;const hist=[],fut=[];let sel=null,dirty=false;
  try{R=JSON.parse(RA.store.get('rb:report',''))}catch(e){R=null}
  if(!R||!R.widgets)R=TEMPLATE();
  R.widgets.forEach(w=>{const n=+String(w.id).slice(1);if(n>=uid)uid=n+1});
  const snap=()=>JSON.stringify(R);
  function commit(){hist.push(snap());if(hist.length>60)hist.shift();fut.length=0;dirty=true;save();syncUndo()}
  let svT;function save(){clearTimeout(svT);const s=$('[data-rb-saved]');s&&(s.textContent='Saving…');svT=setTimeout(()=>{RA.store.set('rb:report',snap());s&&(s.textContent='All changes saved')},500)}
  function syncUndo(){$('[data-rb-undo]').disabled=!hist.length;$('[data-rb-redo]').disabled=!fut.length}

  /* ---------------------------------------------------------------- compute */
  const SAFE=/^[\w\s+\-*/().]+$/;
  function evalCalc(formula,agg){if(!SAFE.test(formula))throw new Error('Only measures, numbers and + − × ÷ ( ) are allowed');
    const keys=Object.keys(agg).sort((a,b)=>b.length-a.length);let ex=formula;
    const toks=formula.match(/[A-Za-z_]\w*/g)||[];toks.forEach(t=>{if(!(t in agg))throw new Error(`Unknown field “${t}”`)});
    keys.forEach(k=>{ex=ex.replace(new RegExp('\\b'+k+'\\b','g'),'('+agg[k]+')')});
    const v=Function('"use strict";return ('+ex+')')();if(!isFinite(v))throw new Error('Result is not a number (division by zero?)');return v}
  function metricInfo(src,key){const m=DS[src].ms.find(x=>x[0]===key);if(m)return {label:m[1],unit:m[2],calc:null};const c=R.calcs.find(x=>x.key===key);return c?{label:c.label,unit:c.unit||{},calc:c}:{label:key,unit:{},calc:null}}
  function rowsFor(cfg){
    let rows=DS[cfg.source].rows;
    if(R.region&&R.region!=='All'&&DS[cfg.source].dims.some(d=>d[0]==='region'))rows=rows.filter(r=>r.region===R.region);
    (cfg.filters||[]).forEach(f=>{if(!f.field||f.value==='')return;rows=rows.filter(r=>{const v=r[f.field],x=isNaN(+f.value)?f.value:+f.value;return f.op==='='?String(v)===String(f.value):f.op==='≠'?String(v)!==String(f.value):f.op==='>'?v>x:f.op==='<'?v<x:true})});
    return rows;
  }
  function aggregate(rows,cfg,key){
    const info=metricInfo(cfg.source,key);
    const base=k=>{const v=rows.map(r=>+r[k]||0);if(!v.length)return 0;return {sum:v.reduce((a,b)=>a+b,0),avg:v.reduce((a,b)=>a+b,0)/v.length,count:v.length,min:Math.min(...v),max:Math.max(...v)}[cfg.agg||'sum']};
    if(info.calc){const a={};DS[cfg.source].ms.forEach(m=>{const v=rows.map(r=>+r[m[0]]||0);a[m[0]]=v.reduce((x,y)=>x+y,0)});try{return evalCalc(info.calc.formula,a)}catch(e){return NaN}}
    return base(key);
  }
  function groups(rows,dim){const ks=[...new Set(rows.map(r=>r[dim]))];if(ORDER[dim])ks.sort((a,b)=>ORDER[dim].indexOf(a)-ORDER[dim].indexOf(b));return ks}
  function specFor(w){
    const c=w.cfg,rows=rowsFor(c),info=metricInfo(c.source,c.metric),dims=groups(rows,c.dim);
    let cats=dims,series;
    if(c.series&&c.series!==c.dim&&!['pie','funnel','treemap'].includes(c.type)){const sk=groups(rows,c.series);series=sk.slice(0,8).map((k,i)=>({name:k,data:cats.map(d=>Math.round(aggregate(rows.filter(r=>r[c.dim]===d&&r[c.series]===k),c,c.metric)*10)/10)}))}
    else series=[{name:info.label,data:cats.map(d=>Math.round(aggregate(rows.filter(r=>r[c.dim]===d),c,c.metric)*10)/10)}];
    if(c.sort){const tot=cats.map((_,i)=>series.reduce((a,q)=>a+(q.data[i]||0),0));let ix=cats.map((_,i)=>i);
      ix.sort((a,b)=>c.sort==='desc'?tot[b]-tot[a]:c.sort==='asc'?tot[a]-tot[b]:String(cats[a]).localeCompare(String(cats[b])));cats=ix.map(i=>cats[i]);series.forEach(q=>q.data=ix.map(i=>q.data[i]))}
    if(c.top){cats=cats.slice(0,c.top);series.forEach(q=>q.data=q.data.slice(0,c.top))}
    const base={title:w.title,source:DS[c.source].label,metric:info.label,dimName:dimL(c.source,c.dim),xName:dimL(c.source,c.dim),agg:{sum:'Sum',avg:'Average',count:'Count',min:'Minimum',max:'Maximum'}[c.agg],unit:info.unit,labels:c.labels,legend:c.legend&&series.length>1?true:(series.length>1?false:undefined),palette:c.palette,vary:false};
    if(c.type==='pie')return {...base,type:'pie',donut:true,centerLabel:info.label,legendRight:w.w>=6,legend:c.legend&&w.w>=6,labels:c.labels,data:cats.map((k,i)=>({name:k,value:series[0].data[i]})).slice(0,6)};
    if(c.type==='funnel'){const d=cats.map((k,i)=>({name:k,value:series[0].data[i]})).sort((a,b)=>b.value-a.value).slice(0,6);return {...base,type:'funnel',palette:'ordinal',conv:true,data:d}}
    if(c.type==='treemap')return {...base,type:'treemap',data:cats.map((k,i)=>({name:k,value:series[0].data[i]}))};
    if(c.type==='combo'){const m2=c.metric==='orders'?'revenue':'orders',i2=metricInfo(c.source,m2);const ok=DS[c.source].ms.some(m=>m[0]===m2);
      if(ok)return {...base,type:'combo',unit2:i2.unit,panelNames:[info.label,i2.label],legend:true,series:[{name:info.label,type:'bar',data:series[0].data},{name:i2.label,type:'line',panel:1,c:2,data:cats.map(d=>Math.round(aggregate(rows.filter(r=>r[c.dim]===d),c,m2)))}]};
      return {...base,type:'column',categories:cats,series}}
    return {...base,type:c.type,categories:cats,series,smooth:c.type==='line'||c.type==='area',stack:c.type==='area'&&series.length>1?'normal':(c.series&&c.stacked?'normal':undefined)};
  }

  /* ---------------------------------------------------------------- render canvas */
  const grid=$('.rb-grid'),page=$('.rb-page');
  function render(){
    $('.rb-page__h h2').textContent=R.title;$('.rb-page__h p').textContent=R.desc;$('.rb-tool__t input').value=R.title;
    const keep=new Map($$('.rb-w',grid).map(n=>[n.dataset.id,n]));
    if(!R.widgets.length){grid.innerHTML=`<div class="rb-empty"><div class="state" style="min-height:0"><div class="state__ico">${ic('document_add')}</div><b>Start your report</b><p>Drag a component from the left panel onto this canvas, or click one to add it. You can also start from a template.</p><div class="row"><button type="button" class="btn btn--primary" data-rb-template>${ic('document_table')}Use “Monthly sales review”</button><button type="button" class="btn" data-rb-add="chart">${ic('data_bar_vertical')}Add a chart</button></div></div></div>`;return}
    $('.rb-empty',grid)?.remove();
    R.widgets.forEach((w,i)=>{let n=keep.get(w.id);keep.delete(w.id);if(!n){n=document.createElement('section');n.className='rb-w';n.dataset.id=w.id;n.tabIndex=0}
      n.style.gridColumn=`span ${w.w}`;n.style.gridRow=`span ${w.h}`;n.classList.toggle('is-sel',sel===w.id);n.setAttribute('aria-label',`${w.title}, ${w.kind}, ${w.w} columns wide`);
      const sig=JSON.stringify([w,R.calcs,R.region]);
      if(n._sig!==sig){n._sig=sig;fill(n,w)}
      if(grid.children[i]!==n)grid.insertBefore(n,grid.children[i]||null)});
    keep.forEach(n=>{const c=$('.chart',n);c&&c._card&&c._card.dispose();n.remove()});
  }
  function fill(n,w){
    const head=`<header class="rb-w__h"><span class="rb-w__grip" draggable="true" data-grip title="Drag to move">${ic('re_order_dots_vertical','ic--s')}</span><b>${esc(w.title)}</b><span class="rb-w__tools"><button type="button" class="ibtn ibtn--s" data-w-dup aria-label="Duplicate ${esc(w.title)}" data-tip="Duplicate">${ic('copy')}</button><button type="button" class="ibtn ibtn--s" data-w-more aria-label="More actions for ${esc(w.title)}" aria-haspopup="true" aria-expanded="false">${ic('more_vertical')}</button><button type="button" class="ibtn ibtn--s" data-w-del aria-label="Delete ${esc(w.title)}" data-tip="Delete" data-tip-pos="left">${ic('delete')}</button></span></header>`;
    let body='';
    if(w.kind==='chart'){const old=$('.chart',n);if(old&&old._card&&n._kind==='chart'){n.querySelector('.rb-w__h').outerHTML=head;const c=old._card;c.base=specFor(w);c.ov={};c.seen=true;c.render();return}
      body=`<div class="chart"><script type="application/json">${JSON.stringify(specFor(w)).replace(/</g,'\\u003c')}<\/script></div>`}
    else if(w.kind==='kpi'){const rows=rowsFor(w.cfg),info=metricInfo(w.cfg.source,w.cfg.metric),v=aggregate(rows,w.cfg,w.cfg.metric);
      const h1=rows.filter(r=>!r.month||MONTHS.indexOf(r.month)<6),h2=rows.filter(r=>!r.month||MONTHS.indexOf(r.month)>=6),a=aggregate(h1,w.cfg,w.cfg.metric),b=aggregate(h2,w.cfg,w.cfg.metric),d=a?(b-a)/Math.abs(a)*100:0;
      body=`<div class="kpi" style="padding:0;min-height:0"><div class="kpi__v" style="font:var(--t-title3)">${esc(fmt(v,Object.keys(info.unit).length?info.unit:{raw:true}))}</div><div class="kpi__m"><span class="dl ${d>=0?'dl--up':'dl--down'}">${ic(d>=0?'arrow_up':'arrow_down')}${Math.abs(d).toFixed(1)}%</span><span>H2 vs H1 · ${esc(DS[w.cfg.source].label)}</span></div></div>`}
    else if(w.kind==='table'){const s=specFor({...w,cfg:{...w.cfg,type:'column',series:''}}),info=metricInfo(w.cfg.source,w.cfg.metric),tot=s.series[0].data.reduce((a,b)=>a+b,0);
      body=`<div class="dt" style="--dt-min:0;--dt-h:100%;flex:1;min-height:0"><div class="dt__wrap" style="border-top:0"><table><thead><tr><th scope="col">${esc(dimL(w.cfg.source,w.cfg.dim))}</th><th scope="col" class="n">${esc(info.label)}</th><th scope="col" class="n">Share</th></tr></thead><tbody>${s.categories.map((c,i)=>`<tr><td>${esc(c)}</td><td class="n">${esc(fmt(s.series[0].data[i],info.unit))}</td><td class="n">${tot?(s.series[0].data[i]/tot*100).toFixed(1):0}%</td></tr>`).join('')}</tbody><tfoot><tr><td>Total</td><td class="n">${esc(fmt(tot,info.unit))}</td><td class="n">100%</td></tr></tfoot></table></div></div>`}
    else if(w.kind==='text')body=`<div class="txt" contenteditable="true" data-w-text aria-label="Text block" spellcheck="true">${esc(w.text||'Click to add commentary.')}</div>`;
    else if(w.kind==='image')body=w.src?`<img src="${esc(w.src)}" alt="${esc(w.alt||w.title)}" style="max-width:100%;max-height:100%;object-fit:contain;margin:auto;display:block">`:`<label class="img" style="cursor:pointer">${ic('image','ic--l')}<span>Click to choose an image (stays in this browser)</span><input type="file" accept="image/*" data-w-img hidden></label>`;
    n._kind=w.kind;
    n.innerHTML=head+`<div class="rb-w__b">${body}</div><span class="rb-w__rs" data-rs title="Drag to resize" aria-hidden="true"></span>`;
    if(w.kind==='chart')RACharts.init(n);
  }

  /* ---------------------------------------------------------------- properties panel */
  const props=$('.rb-props');let tab='viz';
  const TABS=[['viz','Visual'],['data','Data'],['filters','Filters'],['shape','Sort & group'],['calc','Calculations'],['format','Format']];
  function opt(list,v){return list.map(([k,l])=>`<option value="${esc(k)}"${String(k)===String(v)?' selected':''}>${esc(l)}</option>`).join('')}
  function renderProps(focusSel){
    const w=R.widgets.find(x=>x.id===sel);
    if(!w){
      props.innerHTML=`<div class="rb-props__h"><b>Report</b><p>Nothing selected — these settings apply to the whole report.</p></div><div class="rb-props__b">
        <div class="field"><label for="rp-t">Title</label><input class="input" id="rp-t" data-r="title" value="${esc(R.title)}"></div>
        <div class="field"><label for="rp-d">Description</label><textarea class="input" id="rp-d" data-r="desc">${esc(R.desc)}</textarea></div>
        <div class="field"><label for="rp-r">Report filter: region</label><select class="select" id="rp-r" data-r="region">${opt([['All','All regions'],...REG.map(r=>[r,r])],R.region)}</select><span class="hint">Applies to every widget whose data source has a region.</span></div>
        <div class="field"><label for="rp-th">Page theme</label><select class="select" id="rp-th" data-r="theme">${opt([['','Follow app'],['light','Light'],['dark','Dark']],R.theme||'')}</select></div>
        <div class="note">${ic('info')}<span>${R.widgets.length} widgets · ${R.calcs.length} calculated fields. Select a widget to edit its visual, data, filters, sorting, grouping and format.</span></div></div>`;return}
    const c=w.cfg,src=DS[c.source],chartish=w.kind==='chart',metrics=[...src.ms.map(m=>[m[0],m[1]]),...R.calcs.map(x=>[x.key,x.label+' (calculated)'])],dims=src.dims.map(d=>[d[0],d[1]]);
    const T={
      viz:`<div class="field"><span class="lbl">Visualization</span><div class="vtypes" role="group" aria-label="Visualization type">${VIZ.map(([k,l,i])=>`<button type="button" data-viz="${k}" aria-pressed="${(w.kind==='chart'?c.type:w.kind)===k}">${ic(i)}${l}</button>`).join('')}</div><span class="hint">${w.kind==='text'||w.kind==='image'?'Text and image blocks have no visualization — pick one to convert.':'Switching keeps the data, filters and sorting.'}</span></div>
        <div class="field"><label for="wp-t">Title</label><input class="input" id="wp-t" data-w="title" value="${esc(w.title)}"></div>`,
      data:`<div class="field"><label for="wp-src">Data source</label><select class="select" id="wp-src" data-c="source">${opt(Object.entries(DS).map(([k,d])=>[k,d.label]),c.source)}</select><span class="hint">${src.rows.length} rows · refreshed daily 06:00 IST (sample)</span></div>
        <div class="field"><label for="wp-m">Metric</label><select class="select" id="wp-m" data-c="metric">${opt(metrics,c.metric)}</select></div>
        <div class="field"><label for="wp-d">Dimension (category axis)</label><select class="select" id="wp-d" data-c="dim">${opt(dims,c.dim)}</select></div>
        <div class="field"><label for="wp-a">Aggregation</label><select class="select" id="wp-a" data-c="agg">${opt([['sum','Sum'],['avg','Average'],['count','Count'],['min','Minimum'],['max','Maximum']],c.agg)}</select><span class="hint">Calculated fields always aggregate their inputs with Sum first.</span></div>`,
      filters:`<p class="muted" style="font:var(--t-cap)">Widget filters narrow only this widget. The report filter (${esc(R.region==='All'?'all regions':R.region)}) applies first.</p>
        ${(c.filters||[]).map((f,i)=>`<div class="frow"><select class="select" data-f="${i}" data-fk="field" aria-label="Field">${opt([['','Field…'],...dims,...src.ms.map(m=>[m[0],m[1]])],f.field)}</select><select class="select" data-f="${i}" data-fk="op" aria-label="Operator">${opt([['=','='],['≠','≠'],['>','>'],['<','<']],f.op)}</select>${f.field&&dims.some(d=>d[0]===f.field)?`<select class="select" data-f="${i}" data-fk="value" aria-label="Value">${opt([['','Value…'],...groups(src.rows,f.field).map(v=>[v,v])],f.value)}</select>`:`<input class="input" data-f="${i}" data-fk="value" value="${esc(f.value)}" aria-label="Value" placeholder="Value">`}<button type="button" class="ibtn ibtn--s" data-f-del="${i}" aria-label="Remove filter">${ic('dismiss')}</button></div>`).join('')||'<div class="note">'+ic('filter')+'<span>No widget filters yet.</span></div>'}
        <button type="button" class="btn btn--s" data-f-add style="align-self:flex-start">${ic('add')}Add filter</button>`,
      shape:`<div class="field" id="wp-group"><label for="wp-s">Group by (series)</label><select class="select" id="wp-s" data-c="series">${opt([['','None — single series'],...dims.filter(d=>d[0]!==c.dim)],c.series)}</select><span class="hint">Splits the metric into one series per value, up to 8 (the palette limit).</span></div>
        ${c.series?`<label class="switch"><input type="checkbox" data-c="stacked"${c.stacked?' checked':''}><span>Stack the series</span></label>`:''}
        <div class="field" id="wp-sort"><label for="wp-o">Sort</label><select class="select" id="wp-o" data-c="sort">${opt([['','Natural order'],['desc','Value, high to low'],['asc','Value, low to high'],['az','Label A–Z']],c.sort)}</select></div>
        <div class="field"><label for="wp-n">Show</label><select class="select" id="wp-n" data-c="top">${opt([[0,'All values'],[5,'Top 5'],[10,'Top 10']],c.top)}</select></div>`,
      calc:`<p class="muted" style="font:var(--t-cap)">Calculated fields combine measures from the data source. They appear in the Metric list.</p>
        ${R.calcs.map((x,i)=>`<div class="calc"><div class="row"><b class="grow">${esc(x.label)}</b><button type="button" class="ibtn ibtn--s" data-calc-del="${i}" aria-label="Delete ${esc(x.label)}">${ic('delete')}</button></div><code>${esc(x.formula)}</code></div>`).join('')}
        <div class="dgrp" style="border:0"><h3>New calculated field</h3><div class="field"><label for="cf-n">Name</label><input class="input" id="cf-n" placeholder="e.g. Revenue per unit"></div>
        <div class="field"><label for="cf-f">Formula</label><textarea class="input mono" id="cf-f" placeholder="revenue / qty"></textarea><div class="row" style="gap:4px">${src.ms.map(m=>`<button type="button" class="badge badge--subtle" data-tok="${m[0]}" style="cursor:pointer">${m[0]}</button>`).join('')}</div><span class="hint" data-cf-msg>Use measure names, numbers and + − * / ( ).</span></div>
        <div class="field"><label for="cf-u">Format</label><select class="select" id="cf-u">${opt([['num','Number'],['inr','Indian rupees'],['pct','Percent']],'num')}</select></div>
        <button type="button" class="btn btn--primary btn--s" data-calc-add style="align-self:flex-start">${ic('add')}Add field</button></div>`,
      format:`${chartish?`<label class="switch"><input type="checkbox" data-c="legend"${c.legend?' checked':''}><span>Legend (2+ series)</span></label><label class="switch"><input type="checkbox" data-c="labels"${c.labels?' checked':''}><span>Data labels</span></label>
        <div class="field"><label for="wp-p">Palette</label><select class="select" id="wp-p" data-c="palette">${opt([['cat','Fluent categorical'],['mono','Monochrome blue'],['highlight','Highlight first series']],c.palette)}</select></div>`:''}
        <div class="field"><label for="wp-w">Width</label><select class="select" id="wp-w" data-w="w">${opt([[3,'Quarter (3 of 12)'],[4,'Third (4 of 12)'],[6,'Half (6 of 12)'],[8,'Two thirds (8 of 12)'],[12,'Full width']],w.w)}</select></div>
        <div class="field"><label for="wp-h">Height</label><select class="select" id="wp-h" data-w="h">${opt([[3,'Compact'],[5,'Small'],[7,'Medium'],[9,'Large'],[12,'Extra large']],w.h)}</select></div>
        <div class="row"><button type="button" class="btn btn--s" data-w-move="-1">${ic('arrow_up')}Move earlier</button><button type="button" class="btn btn--s" data-w-move="1">${ic('arrow_down')}Move later</button></div>`};
    const avail=w.kind==='chart'||w.kind==='kpi'||w.kind==='table'?TABS:TABS.filter(t=>t[0]==='viz'||t[0]==='format');
    if(!avail.some(t=>t[0]===tab))tab='viz';
    props.innerHTML=`<div class="rb-props__h"><b>${esc(w.title)}</b><p>${esc({chart:'Chart',kpi:'KPI card',table:'Table',text:'Text block',image:'Image'}[w.kind])} · ${w.w} of 12 columns</p></div>
      <div class="tabs tabs--s" role="tablist" aria-label="Properties">${avail.map(([k,l])=>`<button type="button" class="tab" role="tab" id="pt-${k}" aria-selected="${k===tab}" aria-controls="pp-${k}" tabindex="${k===tab?0:-1}" data-ptab="${k}">${l}</button>`).join('')}</div>
      ${avail.map(([k])=>`<div class="rb-props__b" role="tabpanel" id="pp-${k}" aria-labelledby="pt-${k}"${k===tab?'':' hidden'}>${T[k]}</div>`).join('')}`;
    if(focusSel){const f=$(focusSel,props);f&&setTimeout(()=>{f.scrollIntoView({block:'center'});(f.querySelector('select,input,textarea')||f).focus()},50)}
  }
  props.addEventListener('ra:tab',e=>{tab=e.detail.tab.dataset.ptab});
  props.addEventListener('change',e=>{
    const t=e.target,w=R.widgets.find(x=>x.id===sel);
    if(t.dataset.r){R[t.dataset.r]=t.value;commit();if(t.dataset.r==='theme'){if(t.value)page.setAttribute('data-theme',t.value);else page.removeAttribute('data-theme');$$('.rb-w',grid).forEach(n=>n._sig=null)}render();return}
    if(!w)return;
    if(t.dataset.w){w[t.dataset.w]=['w','h'].includes(t.dataset.w)?+t.value:t.value;commit();render();renderProps();return}
    if(t.dataset.c){const k=t.dataset.c;w.cfg[k]=t.type==='checkbox'?t.checked:(k==='top'?+t.value:t.value);
      if(k==='source'){const s=DS[t.value];w.cfg.metric=s.ms[0][0];w.cfg.dim=s.dims[0][0];w.cfg.series='';w.cfg.filters=[]}
      if(k==='dim'&&w.cfg.series===t.value)w.cfg.series='';commit();render();renderProps();return}
    if(t.dataset.f!=null){const f=w.cfg.filters[+t.dataset.f];f[t.dataset.fk]=t.value;if(t.dataset.fk==='field')f.value='';commit();render();renderProps('#pp-filters')}
  });
  props.addEventListener('input',e=>{const t=e.target;if(t.dataset.w==='title'||t.dataset.r==='title'||t.dataset.r==='desc'){const w=R.widgets.find(x=>x.id===sel);(t.dataset.w?w:R)[t.dataset.w||t.dataset.r]=t.value;clearTimeout(t._t);t._t=setTimeout(()=>{commit();render();const h=$('.rb-props__h b',props);if(h&&w)h.textContent=w.title},350)}
    if(t.id==='cf-f')validateCalc()});
  function validateCalc(){const w=R.widgets.find(x=>x.id===sel),f=$('#cf-f',props).value.trim(),m=$('[data-cf-msg]',props);if(!f){m.textContent='Use measure names, numbers and + − * / ( ).';m.parentElement.classList.remove('is-err');return false}
    try{const a={};DS[w.cfg.source].ms.forEach(x=>{a[x[0]]=DS[w.cfg.source].rows.reduce((s,r)=>s+(+r[x[0]]||0),0)});const v=evalCalc(f,a);m.textContent=`Valid · whole-dataset preview: ${fmt(v,{dp:2},true)}`;m.parentElement.classList.remove('is-err');return true}
    catch(err){m.textContent=err.message;m.parentElement.classList.add('is-err');return false}}
  props.addEventListener('click',e=>{
    const t=e.target,w=R.widgets.find(x=>x.id===sel);let b;
    if((b=t.closest('[data-viz]'))&&w){const v=b.dataset.viz;if(v==='table'||v==='kpi'){w.kind=v}else{w.kind='chart';w.cfg.type=v}if(v==='kpi'){w.w=Math.min(w.w,4);w.h=3}else if(w.h<5)w.h=7;commit();render();renderProps();return}
    if(t.closest('[data-f-add]')&&w){w.cfg.filters.push({field:'',op:'=',value:''});commit();renderProps('#pp-filters .frow:last-of-type');return}
    if((b=t.closest('[data-f-del]'))&&w){w.cfg.filters.splice(+b.dataset.fDel,1);commit();render();renderProps();return}
    if((b=t.closest('[data-tok]'))){const ta=$('#cf-f',props);ta.setRangeText((ta.value&&!/\s$/.test(ta.value)?' ':'')+b.dataset.tok+' ',ta.selectionStart,ta.selectionEnd,'end');ta.focus();validateCalc();return}
    if(t.closest('[data-calc-add]')){const n=$('#cf-n',props).value.trim(),f=$('#cf-f',props).value.trim();if(!n){$('#cf-n',props).closest('.field').classList.add('is-err');$('#cf-n',props).focus();return}if(!validateCalc()){$('#cf-f',props).focus();return}
      const u={num:{},inr:{cur:'inr'},pct:{suf:'%',dp:1}}[$('#cf-u',props).value];const key='calc_'+n.toLowerCase().replace(/\W+/g,'_');R.calcs.push({key,label:n,formula:f,unit:u});commit();renderProps();RA.toast(`“${n}” added`,{kind:'ok',text:'Pick it from Data → Metric.'});return}
    if((b=t.closest('[data-calc-del]'))){const x=R.calcs[+b.dataset.calcDel];R.calcs.splice(+b.dataset.calcDel,1);R.widgets.forEach(wi=>{if(wi.cfg.metric===x.key)wi.cfg.metric=DS[wi.cfg.source].ms[0][0]});commit();render();renderProps();return}
    if((b=t.closest('[data-w-move]'))&&w){move(w.id,+b.dataset.wMove);return}
  });

  /* ---------------------------------------------------------------- canvas interactions */
  function select(id,quiet){sel=id;$$('.rb-w',grid).forEach(n=>n.classList.toggle('is-sel',n.dataset.id===id));renderProps();if(!quiet&&id){const n=$(`.rb-w[data-id="${id}"]`,grid);n&&n.focus({preventScroll:true})}}
  function add(kind,at,o={}){const defs={chart:{title:'New chart',w:6,h:7},kpi:{kind:'kpi',title:'New KPI',w:3,h:3},table:{kind:'table',title:'New table',w:6,h:7},text:{kind:'text',title:'Text',w:12,h:3,text:'Click to add commentary.'},image:{kind:'image',title:'Image',w:4,h:5}};
    const types={'c-column':'column','c-bar':'bar','c-line':'line','c-area':'area','c-pie':'pie','c-funnel':'funnel','c-treemap':'treemap','c-combo':'combo'};
    const isC=kind.startsWith('c-');const w=W({...(isC?defs.chart:defs[kind]),...o,cfg:isC?{type:types[kind],dim:types[kind]==='pie'||types[kind]==='funnel'||types[kind]==='treemap'?'category':'month'}:{}});
    if(isC)w.title={column:'Revenue by month',bar:'Revenue by region',line:'Revenue trend',area:'Revenue by channel',pie:'Category mix',funnel:'Category ranking',treemap:'Category contribution',combo:'Revenue and orders'}[types[kind]];
    if(types[kind]==='bar')w.cfg.dim='region';if(types[kind]==='area'){w.cfg.series='channel'}
    if(at==null||at<0)R.widgets.push(w);else R.widgets.splice(at,0,w);commit();render();select(w.id);RA.toast(`${w.title} added`,{icon:'add',text:'Configure it in the properties panel.'})}
  function move(id,d){const i=R.widgets.findIndex(x=>x.id===id),j=i+d;if(j<0||j>=R.widgets.length)return;const [w]=R.widgets.splice(i,1);R.widgets.splice(j,0,w);commit();render();select(id)}
  function del(id){const i=R.widgets.findIndex(x=>x.id===id);if(i<0)return;const [w]=R.widgets.splice(i,1);if(sel===id)sel=null;commit();render();renderProps();
    RA.toast(`“${w.title}” deleted`,{icon:'delete',text:'Press Ctrl+Z or use Undo to restore it.'})}
  function dup(id){const i=R.widgets.findIndex(x=>x.id===id),w=JSON.parse(JSON.stringify(R.widgets[i]));w.id='w'+(uid++);w.title+=' (copy)';R.widgets.splice(i+1,0,w);commit();render();select(w.id)}
  root.addEventListener('click',e=>{
    const t=e.target;let b;
    if((b=t.closest('[data-rb-add]'))){add(b.dataset.rbAdd,sel?R.widgets.findIndex(x=>x.id===sel)+1:-1);return}
    if(t.closest('[data-rb-template]')){R=TEMPLATE();commit();sel=null;render();renderProps();RA.toast('Template loaded',{kind:'ok',text:R.title});return}
    const wn=t.closest('.rb-w');
    if(wn){const id=wn.dataset.id;
      if(t.closest('[data-w-del]')){del(id);return}
      if(t.closest('[data-w-dup]')){dup(id);return}
      if((b=t.closest('[data-w-more]'))){const w=R.widgets.find(x=>x.id===id);RA.menu(b,[{label:'Configure',icon:'settings',onClick:()=>select(id)},{label:'Duplicate',icon:'copy',onClick:()=>dup(id)},{label:'Move earlier',icon:'arrow_up',onClick:()=>move(id,-1)},{label:'Move later',icon:'arrow_down',onClick:()=>move(id,1)},'sep',
        ...[3,4,6,8,12].map(n=>({label:`Width ${n} of 12`,checked:w.w===n,onClick:()=>{w.w=n;commit();render();renderProps()}})),'sep',{label:'View data',icon:'table',disabled:w.kind!=='chart',onClick:()=>$('.chart',wn)?._card?.viewData()},{label:'Delete',icon:'delete',onClick:()=>del(id)}],{label:'Widget actions'});return}
      if(sel!==id)select(id,true);return}
    if(t.closest('.rb-canvas')&&!t.closest('.rb-page__h')){select(null)}
  });
  root.addEventListener('input',e=>{const tx=e.target.closest('[data-w-text]');if(!tx)return;const w=R.widgets.find(x=>x.id===tx.closest('.rb-w').dataset.id);w.text=tx.textContent;tx.closest('.rb-w')._sig=JSON.stringify([w,R.calcs,R.region]);clearTimeout(tx._t);tx._t=setTimeout(commit,600)});
  root.addEventListener('change',e=>{const f=e.target.closest('[data-w-img]');if(!f||!f.files[0])return;const w=R.widgets.find(x=>x.id===f.closest('.rb-w').dataset.id);const rd=new FileReader();rd.onload=()=>{if(rd.result.length>1.5e6){RA.toast('Image is too large to keep in this browser',{kind:'warn',text:'Pick one under ~1 MB.'});return}w.src=rd.result;w.alt=f.files[0].name;commit();render()};rd.readAsDataURL(f.files[0])});
  /* palette drag → drop, widget reorder */
  let dragKind=null,dragId=null;
  root.addEventListener('dragstart',e=>{const p=e.target.closest('[data-rb-add]');if(p){dragKind=p.dataset.rbAdd;e.dataTransfer.setData('text/plain',dragKind);e.dataTransfer.effectAllowed='copy';return}
    const g=e.target.closest('[data-grip]');if(g){const n=g.closest('.rb-w');dragId=n.dataset.id;e.dataTransfer.setData('text/plain',dragId);e.dataTransfer.effectAllowed='move';e.dataTransfer.setDragImage(n,20,20);setTimeout(()=>n.classList.add('is-drag'),0)}});
  root.addEventListener('dragend',()=>{dragKind=dragId=null;$$('.is-drag,.is-drop',grid).forEach(n=>n.classList.remove('is-drag','is-drop'));grid.classList.remove('is-over')});
  grid.addEventListener('dragover',e=>{if(!dragKind&&!dragId)return;e.preventDefault();grid.classList.add('is-over');const n=e.target.closest('.rb-w');$$('.is-drop',grid).forEach(x=>x!==n&&x.classList.remove('is-drop'));n&&n.dataset.id!==dragId&&n.classList.add('is-drop')});
  grid.addEventListener('dragleave',e=>{if(!grid.contains(e.relatedTarget))grid.classList.remove('is-over')});
  grid.addEventListener('drop',e=>{e.preventDefault();grid.classList.remove('is-over');const n=e.target.closest('.rb-w');const at=n?R.widgets.findIndex(x=>x.id===n.dataset.id):-1;
    if(dragKind){add(dragKind,at)}else if(dragId&&(!n||n.dataset.id!==dragId)){const i=R.widgets.findIndex(x=>x.id===dragId);const [w]=R.widgets.splice(i,1);const j=n?R.widgets.findIndex(x=>x.id===n.dataset.id):R.widgets.length;R.widgets.splice(j,0,w);commit();render();select(w.id);RA.toast('Widget moved',{icon:'arrow_swap'})}
    dragKind=dragId=null});
  /* resize handle: snaps to grid columns and 40px rows */
  grid.addEventListener('pointerdown',e=>{const h=e.target.closest('[data-rs]');if(!h)return;e.preventDefault();const n=h.closest('.rb-w'),w=R.widgets.find(x=>x.id===n.dataset.id);select(w.id,true);
    const gs=getComputedStyle(grid),gap=parseFloat(gs.columnGap)||12,colW=(grid.clientWidth-gap*11)/12,x0=e.clientX,y0=e.clientY,w0=w.w,h0=w.h;h.setPointerCapture(e.pointerId);
    const mv=ev=>{const nw=Math.max(2,Math.min(12,Math.round((n.offsetWidth+ev.clientX-x0+gap)/(colW+gap)))),nh=Math.max(2,Math.min(14,Math.round((h0*(40+gap)+ev.clientY-y0)/(40+gap))));if(nw!==w.w||nh!==w.h){w.w=nw;w.h=nh;n.style.gridColumn=`span ${nw}`;n.style.gridRow=`span ${nh}`}};
    const up=()=>{h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up);if(w.w!==w0||w.h!==h0){commit();renderProps();RA.toast(`Resized to ${w.w} × ${w.h}`,{icon:'arrow_maximize'})}};
    h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up)});
  /* keyboard */
  root.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!e.target.closest('input,textarea,[contenteditable="true"]')){e.preventDefault();e.shiftKey?redo():undo();return}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'&&!e.target.closest('input,textarea')){e.preventDefault();redo();return}
    const n=e.target.closest&&e.target.closest('.rb-w');if(!n||e.target!==n)return;const id=n.dataset.id;
    if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();del(id)}
    else if(e.key==='Enter'){select(id)}
    else if(e.altKey&&(e.key==='ArrowLeft'||e.key==='ArrowUp')){e.preventDefault();move(id,-1)}
    else if(e.altKey&&(e.key==='ArrowRight'||e.key==='ArrowDown')){e.preventDefault();move(id,1)}
    else if(e.shiftKey&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){e.preventDefault();const w=R.widgets.find(x=>x.id===id);w.w=Math.max(2,Math.min(12,w.w+(e.key==='ArrowRight'?1:-1)));commit();render();renderProps()}
  });
  function undo(){if(!hist.length)return;fut.push(snap());R=JSON.parse(hist.pop());$$('.rb-w',grid).forEach(n=>n._sig=null);render();if(sel&&!R.widgets.some(w=>w.id===sel))sel=null;renderProps();save();syncUndo();RA.toast('Undone',{icon:'arrow_reset'})}
  function redo(){if(!fut.length)return;hist.push(snap());R=JSON.parse(fut.pop());$$('.rb-w',grid).forEach(n=>n._sig=null);render();renderProps();save();syncUndo()}

  /* ---------------------------------------------------------------- toolbar */
  $('.rb-tool').addEventListener('click',e=>{const t=e.target;let b;
    if(t.closest('[data-rb-undo]'))undo();
    else if(t.closest('[data-rb-redo]'))redo();
    else if(t.closest('[data-rb-new]')){const m=RA.modal({title:'Create a new report?',body:'<p>This clears the canvas. Your current report stays in undo history until you leave the page.</p>',footer:'<button class="btn" data-close>Cancel</button><button class="btn btn--primary" data-ok>Create blank report</button>'});
      m.el.querySelector('[data-ok]').onclick=()=>{m.close();R={title:'Untitled report',desc:'Add a description',region:'All',calcs:R.calcs,widgets:[]};sel=null;commit();render();renderProps();location.hash='create'}}
    else if(t.closest('[data-rb-preview]')){const on=root.classList.toggle('is-preview');t.closest('[data-rb-preview]').setAttribute('aria-pressed',String(on));setTimeout(()=>RA.emit('ra:layout'),50)}
    else if(t.closest('[data-rb-export]'))exportDlg();
    else if(t.closest('[data-rb-save]')){RA.store.set('rb:report',snap());RA.toast('Report saved',{kind:'ok',text:'Stored in this browser (localStorage).'})}
    else if(t.closest('[data-rb-share]'))RA.toast('Share link copied',{kind:'ok',text:'Viewers see the report with your current filters.'});
  });
  $('.rb-tool__t input').addEventListener('input',e=>{R.title=e.target.value;$('.rb-page__h h2').textContent=R.title;clearTimeout(e.target._t);e.target._t=setTimeout(commit,400)});
  function exportDlg(){
    const w=R.widgets.find(x=>x.id===sel);let fmt_='pdf';
    const m=RA.modal({title:'Export report',body:`<div class="export-opts" role="group" aria-label="Format">
      <button type="button" data-ex="pdf" aria-pressed="true">${ic('print')}<span><b>PDF</b><span>Print layout, all widgets</span></span></button>
      <button type="button" data-ex="png" aria-pressed="false">${ic('image')}<span><b>PNG</b><span>${w&&w.kind==='chart'?'Selected chart':'Select a chart first'}</span></span></button>
      <button type="button" data-ex="csv" aria-pressed="false">${ic('document_table')}<span><b>CSV</b><span>${w&&w.kind==='chart'?'Selected chart data':'Data of every chart'}</span></span></button>
      <button type="button" data-ex="json" aria-pressed="false">${ic('code')}<span><b>Report definition</b><span>JSON, re-importable</span></span></button></div>
      <div class="field"><label for="ex-sch">Schedule</label><select class="select" id="ex-sch"><option>Don’t schedule</option><option>Every Monday 08:00 IST</option><option>1st of every month</option></select><span class="hint">Scheduled exports are emailed as PDF (simulated).</span></div>`,
      footer:'<button class="btn" data-close>Cancel</button><button class="btn btn--primary" data-go>Export</button>'});
    m.el.addEventListener('click',e=>{const b=e.target.closest('[data-ex]');if(b){fmt_=b.dataset.ex;$$('[data-ex]',m.el).forEach(x=>x.setAttribute('aria-pressed',String(x===b)))}});
    m.el.querySelector('[data-go]').onclick=()=>{const sch=$('#ex-sch',m.el).value;m.close();
      if(fmt_==='pdf'){root.classList.add('is-preview');setTimeout(()=>{print();root.classList.remove('is-preview')},300)}
      else if(fmt_==='png'){const c=w&&w.kind==='chart'&&$(`.rb-w[data-id="${w.id}"] .chart`,grid)?._card;if(c)c.exportPng();else RA.toast('Select a chart to export it as PNG',{kind:'warn'})}
      else if(fmt_==='csv'){const cs=(w&&w.kind==='chart'?[w]:R.widgets.filter(x=>x.kind==='chart'));const rows=[];cs.forEach(x=>{const [h,r]=RACharts.grid(specFor(x));rows.push([x.title],h,...r,[])});RA.download(RA.slug(R.title)+'.csv',RA.csv(rows),'text/csv');RA.toast('CSV exported',{kind:'ok',text:`${cs.length} chart${cs.length>1?'s':''}`})}
      else{RA.download(RA.slug(R.title)+'.report.json',JSON.stringify(R,null,2),'application/json');RA.toast('Report definition downloaded',{kind:'ok'})}
      if(sch!=='Don’t schedule')RA.toast('Export scheduled',{kind:'ok',text:sch})};
  }

  /* ---------------------------------------------------------------- routes */
  const ROUTES={create:{},edit:{},filters:{tab:'filters'},'data-source':{tab:'data'},visualization:{tab:'viz'},grouping:{tab:'shape',focus:'#wp-group'},sorting:{tab:'shape',focus:'#wp-sort'},calculations:{tab:'calc'},export:{dlg:true}};
  function route(){
    const k=location.hash.slice(1)||'edit',r=ROUTES[k]||ROUTES.edit;
    $$('[data-route-label]').forEach(n=>n.textContent={create:'Create report',edit:'Edit report',filters:'Filters','data-source':'Data source',visualization:'Visualization',grouping:'Grouping',sorting:'Sorting',calculations:'Calculations',export:'Export'}[k]||'Edit report');
    if(k==='create'){if(R.widgets.length&&!R._blank){hist.push(snap());R={title:'Untitled report',desc:'Add a description',region:'All',calcs:R.calcs,widgets:[],_blank:true};sel=null;syncUndo()}render();renderProps();return}
    if(!R.widgets.length){R=TEMPLATE()}
    delete R._blank;render();
    if(r.tab){tab=r.tab;const w=R.widgets.find(x=>x.kind==='chart');sel=w?w.id:null;select(sel,true);renderProps(r.focus||`#pp-${r.tab}`)}else renderProps();
    if(r.dlg)setTimeout(exportDlg,200);
  }
  addEventListener('hashchange',route);
  if(!location.hash){history.replaceState(null,'','#edit');dispatchEvent(new HashChangeEvent('hashchange'))}else route();
  syncUndo();
})();
