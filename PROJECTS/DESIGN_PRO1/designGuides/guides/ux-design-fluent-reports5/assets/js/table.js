'use strict';
/* =====================================================================
   Reports & Analytics — enterprise report table.
   <div class="dt" data-dt><script type="application/json">{columns,rows,...}</script></div>
   Search, status filter, sort, pagination, column chooser, column resize,
   sticky header / first column, grouping with subtotals and expand /
   collapse, totals row, selection, inline row actions and CSV export.
   ===================================================================== */
(function(){
  const {$,$$,esc,ic,fmt}=RA;
  const ST={good:'checkmark_circle',warn:'warning',serious:'warning',crit:'error_circle',info:'info'};
  const val=(r,c)=>r[c.key];
  function cell(c,v,cfg){
    if(v==null||v==='')return '<span class="muted">—</span>';
    switch(c.type){
      case 'inr':return esc(fmt(v,{cur:'inr'},true));
      case 'inrs':return esc(fmt(v,{cur:'inr'}));
      case 'num':return esc(fmt(v,{raw:true,dp:c.dp??0},true));
      case 'pct':return esc(fmt(v,{suf:'%',dp:c.dp??1},true));
      case 'growth':{const up=v>=0;return `<span class="gr ${up?'up':'down'}">${ic(up?'arrow_up':'arrow_down')}${esc(fmt(Math.abs(v),{suf:'%',dp:1},true))}</span>`}
      case 'status':{const k=(cfg.statusMap||{})[v]||'info';return `<span class="st st--${k}">${ic(ST[k])}${esc(v)}</span>`}
      case 'prod':return `<span class="prod"><i aria-hidden="true">${esc(String(v).split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase())}</i><span>${esc(v)}</span></span>`;
      case 'bar':return `<span style="display:flex;align-items:center;gap:8px"><span class="meter" style="flex:1"><i style="width:${Math.min(100,v)}%"></i></span><span class="num" style="width:40px;text-align:right">${esc(fmt(v,{suf:'%',dp:0}))}</span></span>`;
      default:return esc(v);
    }
  }
  const isNum=c=>['inr','inrs','num','pct','growth','bar'].includes(c.type);
  const csvVal=(c,v)=>v==null?'':(c.type==='inr'||c.type==='inrs'||c.type==='num')?v:(c.type==='pct'||c.type==='growth'?(+v).toFixed(1):v);

  class DT{
    constructor(el){
      this.el=el;el._dt=this;
      const cfg=this.cfg=JSON.parse(el.querySelector('script[type="application/json"]').textContent);
      this.cols=cfg.columns.map(c=>({...c,hidden:!!c.hidden}));
      this.rows=cfg.rows.map((r,i)=>({...r,_id:i}));
      this.st={q:'',sort:cfg.sort||null,page:1,size:cfg.pageSize||10,group:cfg.groupBy||'',collapsed:new Set(),status:'All',sel:new Set()};
      this.statusCol=this.cols.find(c=>c.type==='status');
      el.innerHTML=this.shell();this.wire();this.render();
    }
    shell(){
      const c=this.cfg,grp=this.cols.filter(x=>x.group);
      return `<div class="dt__bar">
        <label class="input" style="width:240px"><svg class="ic" aria-hidden="true"><use href="#i-search"/></svg><input type="search" placeholder="Search ${esc(c.noun||'rows')}" aria-label="Search ${esc(c.noun||'rows')}" data-q></label>
        ${this.statusCol?`<select class="select" data-status aria-label="Filter by ${esc(this.statusCol.label)}"><option value="All">All ${esc(this.statusCol.label.toLowerCase())}</option>${[...new Set(this.rows.map(r=>r[this.statusCol.key]))].map(v=>`<option>${esc(v)}</option>`).join('')}</select>`:''}
        ${grp.length?`<select class="select" data-group aria-label="Group rows by"><option value="">No grouping</option>${grp.map(g=>`<option value="${g.key}"${this.st.group===g.key?' selected':''}>Group by ${esc(g.label.toLowerCase())}</option>`).join('')}</select>`:''}
        <span class="muted" style="font:var(--t-cap)" data-count aria-live="polite"></span><span class="grow"></span>
        <span data-selbar hidden class="row" style="gap:4px"><b style="font:var(--t-cap);font-weight:600" data-selcount></b><button type="button" class="btn btn--s" data-export-sel>${ic('arrow_download')}Export selected</button><button type="button" class="btn btn--s btn--subtle" data-clear-sel>Clear</button></span>
        <button type="button" class="btn btn--s" data-cols aria-haspopup="true" aria-expanded="false">${ic('layout_column_three')}Columns</button>
        <button type="button" class="btn btn--s" data-csv>${ic('arrow_download')}Export</button>
      </div>
      <div class="dt__wrap" tabindex="0" aria-label="${esc(c.caption||'Report table')}, scrollable"><table><caption class="sr">${esc(c.caption||'Report table')}</caption><colgroup></colgroup><thead></thead><tbody></tbody><tfoot></tfoot></table></div>
      <div class="dt__pg"></div>`;
    }
    wire(){
      const el=this.el;
      $('[data-q]',el).addEventListener('input',e=>{this.st.q=e.target.value.trim().toLowerCase();this.st.page=1;this.render()});
      $('[data-status]',el)?.addEventListener('change',e=>{this.st.status=e.target.value;this.st.page=1;this.render()});
      $('[data-group]',el)?.addEventListener('change',e=>{this.st.group=e.target.value;this.st.collapsed.clear();this.st.page=1;this.render()});
      el.addEventListener('click',e=>{
        const t=e.target;let b;
        if((b=t.closest('[data-sort]'))){const k=b.dataset.sort,s=this.st.sort;this.st.sort=!s||s.key!==k?{key:k,dir:'desc'}:s.dir==='desc'?{key:k,dir:'asc'}:null;this.render();$(`[data-sort="${k}"]`,el)?.focus();return}
        if((b=t.closest('[data-grp]'))){const k=b.dataset.grp;this.st.collapsed.has(k)?this.st.collapsed.delete(k):this.st.collapsed.add(k);this.render();$(`[data-grp="${CSS.escape(k)}"]`,el)?.focus();return}
        if((b=t.closest('[data-pg]'))){this.st.page=+b.dataset.pg;this.render();return}
        if(t.closest('[data-cols]')){this.colMenu(t.closest('[data-cols]'));return}
        if(t.closest('[data-csv]')){this.exportCsv(this.filtered());return}
        if(t.closest('[data-export-sel]')){this.exportCsv(this.rows.filter(r=>this.st.sel.has(r._id)),'selected');return}
        if(t.closest('[data-clear-sel]')){this.st.sel.clear();this.render();return}
        if((b=t.closest('[data-rowact]'))){this.rowMenu(b,+b.dataset.rowact);return}
      });
      el.addEventListener('change',e=>{const t=e.target;
        if(t.matches('[data-selall]')){const ids=this.pageRows.map(r=>r._id);ids.forEach(i=>t.checked?this.st.sel.add(i):this.st.sel.delete(i));this.render();return}
        if(t.matches('[data-sel]')){const i=+t.dataset.sel;t.checked?this.st.sel.add(i):this.st.sel.delete(i);this.render()}
        if(t.matches('[data-size]')){this.st.size=+t.value;this.st.page=1;this.render()}});
      /* column resize */
      el.addEventListener('pointerdown',e=>{const h=e.target.closest('.rs');if(!h)return;e.preventDefault();const th=h.closest('th'),c=this.cols.find(x=>x.key===th.dataset.k),x0=e.clientX,w0=th.offsetWidth;h.classList.add('is-on');h.setPointerCapture(e.pointerId);
        const mv=ev=>{c.w=Math.max(72,w0+ev.clientX-x0);this.colgroup()};const up=()=>{h.classList.remove('is-on');h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up)};
        h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up)});
      el.addEventListener('keydown',e=>{const h=e.target.closest('.rs');if(!h)return;const c=this.cols.find(x=>x.key===h.closest('th').dataset.k);
        if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();c.w=Math.max(72,(c.w||h.closest('th').offsetWidth)+(e.key==='ArrowRight'?16:-16));this.colgroup()}});
    }
    vis(){return this.cols.filter(c=>!c.hidden)}
    filtered(){
      const {q,status,sort}=this.st;let r=this.rows;
      if(q)r=r.filter(x=>this.cols.some(c=>String(x[c.key]??'').toLowerCase().includes(q)));
      if(status!=='All'&&this.statusCol)r=r.filter(x=>x[this.statusCol.key]===status);
      if(sort){const c=this.cols.find(x=>x.key===sort.key),d=sort.dir==='asc'?1:-1;r=[...r].sort((a,b)=>{const x=a[sort.key],y=b[sort.key];return (isNum(c)?(x-y):String(x).localeCompare(String(y)))*d})}
      return r;
    }
    agg(rows,c){if(!c.agg)return null;const v=rows.map(r=>+r[c.key]||0);if(!v.length)return null;return c.agg==='avg'?v.reduce((a,b)=>a+b,0)/v.length:v.reduce((a,b)=>a+b,0)}
    colgroup(){const W={prod:220,inr:150,inrs:120,num:110,pct:100,growth:110,status:150,bar:160};
      $('table',this.el).style.minWidth=(this.vis().reduce((a,c)=>a+(c.w||W[c.type]||140),0)+(this.cfg.select?44:0)+(this.cfg.actions!==false?56:0))+'px';
      $('colgroup',this.el).innerHTML=(this.cfg.select?'<col style="width:44px">':'')+this.vis().map(c=>`<col style="width:${c.w?c.w+'px':c.width||'auto'}">`).join('')+(this.cfg.actions!==false?'<col style="width:56px">':'')}
    render(){
      const el=this.el,V=this.vis(),rows=this.filtered(),st=this.st,cfg=this.cfg,sel=!!cfg.select,act=cfg.actions!==false;
      this.colgroup();
      const stk=i=>i===0&&cfg.sticky!==false?' stk':'';
      $('thead',el).innerHTML=`<tr>${sel?`<th scope="col" class="stk" style="left:0"><input type="checkbox" data-selall aria-label="Select all rows on this page"></th>`:''}${V.map((c,i)=>{const s=st.sort&&st.sort.key===c.key?st.sort.dir:null;
        return `<th scope="col" data-k="${c.key}" class="${isNum(c)?'n':''}${sel?'':stk(i)}"${s?` aria-sort="${s==='asc'?'ascending':'descending'}"`:''} style="position:sticky">${c.sort===false?esc(c.label):`<button type="button" class="sortb" data-sort="${c.key}" aria-label="${esc(c.label)}, sort">${isNum(c)?ic('arrow_up'):''}<span>${esc(c.label)}</span>${isNum(c)?'':ic('arrow_up')}</button>`}<span class="rs" tabindex="0" role="separator" aria-orientation="vertical" aria-label="Resize ${esc(c.label)} column"></span></th>`}).join('')}${act?'<th scope="col"><span class="sr">Actions</span></th>':''}</tr>`;
      $$('thead th .sortb .ic',el).forEach(i=>i.style.transform='');
      const row=r=>`<tr${st.sel.has(r._id)?' class="is-sel" aria-selected="true"':''}>${sel?`<td class="stk"><input type="checkbox" data-sel="${r._id}"${st.sel.has(r._id)?' checked':''} aria-label="Select ${esc(r[V[0].key])}"></td>`:''}${V.map((c,i)=>`<td class="${isNum(c)?'n':''}${sel?'':stk(i)}">${cell(c,val(r,c),cfg)}</td>`).join('')}${act?`<td><button type="button" class="ibtn ibtn--s rowact" data-rowact="${r._id}" aria-label="Actions for ${esc(r[V[0].key])}" aria-haspopup="true" aria-expanded="false">${ic('more_vertical')}</button></td>`:''}</tr>`;
      let body='';const span=V.length+(sel?1:0)+(act?1:0);
      if(st.group){
        const g=st.group,groups=[...new Set(rows.map(r=>r[g]))];
        groups.forEach(k=>{const gr=rows.filter(r=>r[g]===k),open=!st.collapsed.has(String(k));
          body+=`<tr class="grp" aria-expanded="${open}">${sel?'<td class="stk"></td>':''}${V.map((c,i)=>i===0?`<td class="${sel?'':'stk'}"><button type="button" data-grp="${esc(k)}" aria-expanded="${open}">${ic('chevron_down')}${esc(k)} <span class="muted" style="font-weight:400">(${gr.length})</span></button></td>`:`<td class="${isNum(c)?'n':''}">${c.agg?cell(c,this.agg(gr,c),cfg):''}</td>`).join('')}${act?'<td></td>':''}</tr>`;
          if(open)body+=gr.map(row).join('')});
        this.pageRows=rows;$('.dt__pg',el).innerHTML=`<span>${groups.length} groups · ${rows.length} rows</span><span class="grow"></span><button type="button" class="btn btn--s btn--subtle" data-expall>${ic('chevron_down')}Expand all</button><button type="button" class="btn btn--s btn--subtle" data-colall>${ic('chevron_right')}Collapse all</button>`;
        $('[data-expall]',el).onclick=()=>{st.collapsed.clear();this.render()};$('[data-colall]',el).onclick=()=>{groups.forEach(k=>st.collapsed.add(String(k)));this.render()};
      }else{
        const pages=Math.max(1,Math.ceil(rows.length/st.size));st.page=Math.min(st.page,pages);
        const pr=this.pageRows=rows.slice((st.page-1)*st.size,st.page*st.size);body=pr.map(row).join('');
        const a=rows.length?(st.page-1)*st.size+1:0,b=Math.min(rows.length,st.page*st.size);
        const nums=[];for(let i=1;i<=pages;i++){if(i===1||i===pages||Math.abs(i-st.page)<=1)nums.push(i);else if(nums.at(-1)!=='…')nums.push('…')}
        $('.dt__pg',el).innerHTML=`<label class="row" style="gap:6px">Rows per page <select class="select select--s" data-size>${[5,10,25,50].map(n=>`<option${n===st.size?' selected':''}>${n}</option>`).join('')}</select></label><span>${a}–${b} of ${rows.length}</span><span class="grow"></span>
          <nav class="pages" aria-label="Pagination"><button type="button" data-pg="${st.page-1}"${st.page<=1?' disabled':''} aria-label="Previous page">${ic('chevron_left','ic--s')}</button>${nums.map(n=>n==='…'?'<button type="button" disabled>…</button>':`<button type="button" data-pg="${n}"${n===st.page?' aria-current="page"':''}>${n}</button>`).join('')}<button type="button" data-pg="${st.page+1}"${st.page>=pages?' disabled':''} aria-label="Next page">${ic('chevron_right','ic--s')}</button></nav>`;
      }
      if(!rows.length)body=`<tr class="dt__empty"><td colspan="${span}"><div>${ic('search')}<p style="margin:4px 0"><b>No matching rows</b></p><p>Try a different search or clear the status filter.</p></div></td></tr>`;
      $('tbody',el).innerHTML=body;
      const hasAgg=V.some(c=>c.agg);
      $('tfoot',el).innerHTML=hasAgg&&rows.length?`<tr>${sel?'<td class="stk"></td>':''}${V.map((c,i)=>`<td class="${isNum(c)?'n':''}${!sel&&i===0?' stk':''}">${i===0?`Total (${rows.length})`:c.agg?cell(c,this.agg(rows,c),cfg):''}</td>`).join('')}${act?'<td></td>':''}</tr>`:'';
      $('[data-count]',el).textContent=`${rows.length} of ${this.rows.length} ${this.cfg.noun||'rows'}`;
      const sb=$('[data-selbar]',el);sb.hidden=!st.sel.size;$('[data-selcount]',el).textContent=`${st.sel.size} selected`;
      const sa=$('[data-selall]',el);if(sa&&this.pageRows){const n=this.pageRows.filter(r=>st.sel.has(r._id)).length;sa.checked=n>0&&n===this.pageRows.length;sa.indeterminate=n>0&&n<this.pageRows.length}
    }
    colMenu(btn){
      const items=[{head:'Show columns'},...this.cols.map((c,i)=>({label:c.label,checked:!c.hidden,keep:true,disabled:i===0,onClick:e=>{c.hidden=!c.hidden;const it=e.target.closest('.menu__i');it.setAttribute('aria-checked',String(!c.hidden));it.querySelector('.chk')?it.querySelector('.chk').remove():it.insertAdjacentHTML('beforeend',ic('checkmark','chk'));this.render()}})),'sep',{label:'Show all columns',icon:'eye',onClick:()=>{this.cols.forEach(c=>c.hidden=false);this.render()}},{label:'Reset column widths',icon:'arrow_reset',onClick:()=>{this.cols.forEach(c=>c.w=null);this.render()}}];
      RA.menu(btn,items,{label:'Columns'});
    }
    rowMenu(btn,id){
      const r=this.rows.find(x=>x._id===id),V=this.cols;
      RA.menu(btn,[{label:'View details',icon:'eye',onClick:()=>RA.drawer({title:String(r[V[0].key]),body:`<dl class="kv">${V.map(c=>`<dt>${esc(c.label)}</dt><dd>${cell(c,r[c.key],this.cfg)}</dd>`).join('')}</dl><div class="note">${ic('info')}<span>Row detail drawer — in a live app this opens the source record.</span></div>`,footer:'<button class="btn btn--primary" data-close>Close</button>'})},
        {label:'Edit',icon:'edit',onClick:()=>RA.toast('Edit opens the source document',{icon:'edit',text:String(r[V[0].key])})},
        {label:'Export row',icon:'arrow_download',onClick:()=>this.exportCsv([r],'row')},'sep',
        {label:'Remove from report',icon:'delete',onClick:()=>{const i=this.rows.indexOf(r);this.rows.splice(i,1);this.render();RA.toast('Row removed',{icon:'delete',text:'Refresh the page to restore sample data.'})}}],{label:'Row actions'});
    }
    exportCsv(rows,suffix){const V=this.vis();RA.download(RA.slug(this.cfg.caption||'report')+(suffix?'-'+suffix:'')+'.csv',RA.csv([V.map(c=>c.label),...rows.map(r=>V.map(c=>csvVal(c,r[c.key])))]),'text/csv');RA.toast(`Exported ${rows.length} rows`,{kind:'ok',text:'CSV, visible columns only'})}
  }
  function init(root=document){$$('[data-dt]',root).forEach(el=>{if(!el._dt)new DT(el)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init());else init();
  window.RATable={init,DT};
})();
