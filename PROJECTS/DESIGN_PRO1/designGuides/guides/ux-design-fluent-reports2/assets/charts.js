'use strict';
/* =====================================================================
   Prism Dashboards — chart layer (no dependencies).
   A chart is <figure class="vz" data-type="line|bar|hbar|donut|heat|tiles|gauge|pyramid">
   holding its data in a JSON <script>. Colours come from the custom
   properties in reports.css, so light, dark and high contrast all render
   from the same data. Every chart gets a legend (2+ series), a hover and
   keyboard tooltip, and a table view with CSV download.
   Bar charts take {"line":true} series as an overlaid line (combo), and
   <div class="rng" data-v="76"> draws a small progress ring.
   ===================================================================== */
(function(){
  const NS='http://www.w3.org/2000/svg';
  const all=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let CS=getComputedStyle(document.body);
  const cv=n=>CS.getPropertyValue(n).trim();
  const ctx=document.createElement('canvas').getContext('2d');
  const tw=(s,size=12,wt=400)=>{ctx.font=`${wt} ${size}px ${cv('--font')||'sans-serif'}`;return ctx.measureText(String(s)).width};
  const ICON={good:'ok',warning:'warn',serious:'warn',critical:'err'};
  const ic=n=>`<svg class="ds-ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;

  /* ---------- numbers ---------- */
  function num(x,u={},full){
    if(x==null||Number.isNaN(+x))return '—';
    const a=Math.abs(x),dp=u.dp??(a%1&&a<1000?1:0);let s;
    if(!full&&a>=1e9)s=+(a/1e9).toFixed(1)+'B';
    else if(!full&&a>=1e6)s=+(a/1e6).toFixed(a>=1e8?0:1)+'M';
    else if(!full&&a>=1e3)s=+(a/1e3).toFixed(a>=1e5?0:1)+'K';
    else s=a.toLocaleString('en-US',{minimumFractionDigits:full?dp:0,maximumFractionDigits:dp});
    return (x<0?'−':'')+(u.pre||'')+s+(u.suf||'');
  }
  function ticks(lo,hi,n){
    if(hi===lo)hi=lo+1;
    const raw=(hi-lo)/n,mag=10**Math.floor(Math.log10(raw)),e=raw/mag,st=(e>=7.5?10:e>=3.5?5:e>=1.5?2:1)*mag;
    const out=[];for(let x=Math.floor(lo/st+1e-9)*st;x<hi+st*.999;x+=st)out.push(+x.toPrecision(12));
    return out;
  }

  /* ---------- svg helpers ---------- */
  function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)if(a[k]!=null)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
  function txt(p,x,y,s,a={}){const e=el('text',{x,y,...a},p);e.textContent=s;return e}
  // 4px rounded data end, square at the baseline
  function vbar(x,w,y0,y1,r=4){const h=Math.abs(y0-y1);r=Math.min(r,w/2,h);const s=y1<y0?1:-1;
    return `M${x},${y0}V${y1+s*r}Q${x},${y1} ${x+r},${y1}H${x+w-r}Q${x+w},${y1} ${x+w},${y1+s*r}V${y0}Z`}
  function hbar(y,h,x0,x1,r=4){const w=Math.abs(x1-x0);r=Math.min(r,h/2,w);const s=x1>x0?1:-1;
    return `M${x0},${y}H${x1-s*r}Q${x1},${y} ${x1},${y+r}V${y+h-r}Q${x1},${y+h} ${x1-s*r},${y+h}H${x0}Z`}
  const rect=(x,y,w,h)=>`M${x},${y}h${w}v${h}h${-w}Z`;
  function arc(c,R,r,a0,a1){const L=a1-a0>Math.PI?1:0,p=(d,a)=>`${(c+d*Math.cos(a)).toFixed(2)},${(c+d*Math.sin(a)).toFixed(2)}`;
    return `M${p(R,a0)}A${R},${R} 0 ${L} 1 ${p(R,a1)}L${p(r,a1)}A${r},${r} 0 ${L} 0 ${p(r,a0)}Z`}
  function ink(hex){const m=/^#?([\da-f]{6})$/i.exec(hex);if(!m)return cv('--fg');const n=parseInt(m[1],16),ch=[n>>16,n>>8&255,n&255].map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});
    return .2126*ch[0]+.7152*ch[1]+.0722*ch[2]>.36?'#1a1a1a':'#ffffff'}
  const seq=(x,mn,mx)=>cv('--q'+(1+Math.round(Math.max(0,Math.min(1,(x-mn)/((mx-mn)||1)))*8)));

  /* ---------- data helpers ---------- */
  const col=(q,i)=>q.st?cv('--st-'+q.st):cv('--s'+((q.c??i+1)));
  function view(fig){const d=fig._d,n=fig._n;if(!n||!d.x||n>=d.x.length)return d;const s=d.x.length-n;
    return {...d,x:d.x.slice(s),xl:d.xl&&d.xl.slice(s),series:d.series.map(q=>({...q,v:q.v.slice(s)}))}}
  const series=(fig,d)=>(d.series||[{name:d.name||'Value',v:d.v}]).map((q,i)=>({...q,i,color:col(q,i)})).filter(q=>!fig._off.has(q.i));

  /* ---------- chrome ---------- */
  function root(fig,W,H){const s=el('svg',{viewBox:`0 0 ${W} ${H}`,width:W,height:H,role:'img','aria-label':fig.getAttribute('aria-label')||''});fig._plot.insertBefore(s,fig._tip);return s}
  function grid(svg,T,labs,Y,x0,x1){const g=el('g',{class:'vz-grid'},svg);
    T.forEach((t,i)=>{const y=Math.round(Y(t))+.5;el('line',{x1:x0,x2:x1,y1:y,y2:y,stroke:t===0||i===0?cv('--vz-axis'):cv('--vz-grid')},g);txt(g,x0-8,y+4,labs[i],{'text-anchor':'end',class:'vz-ax'})})}
  function xlabels(svg,L,X,y,pw){const w=Math.max(...L.map(s=>tw(s)))+10,step=Math.max(1,Math.ceil(w*L.length/pw)),g=el('g',{},svg);
    L.forEach((s,i)=>{if(!((L.length-1-i)%step))txt(g,X(i),y,s,{'text-anchor':'middle',class:'vz-ax'})})}
  function refLine(svg,d,Y,x0,x1,u){if(!d.ref)return;const y=Math.round(Y(d.ref.v))+.5;
    el('line',{x1:x0,x2:x1,y1:y,y2:y,stroke:cv('--fg3'),'stroke-width':1},svg);
    txt(svg,x0+4,y-6,`${d.ref.label||'Target'} ${num(d.ref.v,u)}`,{class:'vz-lb'})}

  function tip(fig,x,y,title,rows){const t=fig._tip;
    t.innerHTML=`<div class="vz-tip__t">${esc(title)}</div>`+rows.map(r=>`<div class="vz-tip__r">${r.c?`<i class="vz-k ${r.k||''}" style="--c:${r.c}"></i>`:'<i></i>'}<span>${esc(r.name)}</span><b>${esc(r.val)}</b></div>`).join('');
    t.hidden=false;const P=fig._plot,w=t.offsetWidth,h=t.offsetHeight;let l=x+16;if(l+w>P.clientWidth-4)l=x-16-w;
    t.style.left=Math.max(4,l)+'px';t.style.top=Math.max(0,Math.min(P.clientHeight-h,y-h/2))+'px'}
  const hideTip=fig=>{fig._tip.hidden=true};
  const rel=(fig,e)=>{const r=fig._plot.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]};
  // per-mark tooltip: hover, tap
  function hit(fig,node,fn,leave){const on=e=>fn(...rel(fig,e));node.addEventListener('pointermove',on);node.addEventListener('pointerdown',on);
    node.addEventListener('pointerleave',()=>{hideTip(fig);leave&&leave()})}
  // x-indexed charts: one hit area, crosshair or band highlight, arrow keys
  function hoverX(fig,svg,o){
    const g=el('g',{'pointer-events':'none'},o.under||svg);
    const area=el('rect',{x:o.ml,y:o.mt,width:o.pw,height:o.ph,fill:'transparent'},svg);
    let cur=-1;
    const show=(i,px,py)=>{cur=i;g.replaceChildren();o.mark(i,g);tip(fig,px??o.X(i),py??o.mt+o.ph/3,o.title(i),o.rows(i))};
    const hide=()=>{g.replaceChildren();hideTip(fig)};
    const idx=px=>Math.max(0,Math.min(o.n-1,o.band?Math.floor((px-o.ml)/(o.pw/o.n)):Math.round((px-o.ml)/(o.n>1?o.pw/(o.n-1):1))));
    const on=e=>{const [x,y]=rel(fig,e);show(idx(x),x,y)};
    area.addEventListener('pointermove',on);area.addEventListener('pointerdown',on);
    area.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')hide()});
    svg.setAttribute('tabindex','0');svg.setAttribute('aria-roledescription','chart, use arrow keys to read values');
    svg.addEventListener('focus',()=>show(cur<0?o.n-1:cur));svg.addEventListener('blur',hide);
    svg.addEventListener('keydown',e=>{const k={ArrowRight:1,ArrowLeft:-1,Home:-1e9,End:1e9}[e.key];
      if(k){e.preventDefault();show(Math.max(0,Math.min(o.n-1,(cur<0?o.n-1:cur)+k)))}else if(e.key==='Escape')hide()});
  }

  /* ---------- renderers ---------- */
  const R={};

  R.line=function(fig,W){
    const d=view(fig),H=+fig.dataset.h||260,u=d.unit||{},S=series(fig,d),n=d.x.length;
    const vals=S.flatMap(q=>q.v).filter(x=>x!=null);if(d.ref)vals.push(d.ref.v);
    let lo=Math.min(...vals),hi=Math.max(...vals);
    if(d.zero===false){const p=(hi-lo)*.12||1;lo-=p;hi+=p}else lo=Math.min(0,lo);
    const T=ticks(lo,hi,H<200?3:4);lo=T[0];hi=T.at(-1);
    const labs=T.map(t=>num(t,u)),ml=Math.ceil(Math.max(...labs.map(s=>tw(s))))+12;
    const endLab=q=>S.length>1?q.name:num(q.v.at(-1),u);
    let ends=S.length<=4&&W>=440,mr=ends?Math.min(140,Math.ceil(Math.max(...S.map(q=>tw(endLab(q),12,600))))+16):14;
    const mt=12,mb=28,pw=W-ml-mr,ph=H-mt-mb,X=i=>ml+(n<2?pw/2:i*pw/(n-1)),Y=x=>mt+ph-(x-lo)/(hi-lo)*ph;
    const svg=root(fig,W,H),surf=cv('--bg');
    grid(svg,T,labs,Y,ml,ml+pw);xlabels(svg,d.x,X,H-8,pw);refLine(svg,d,Y,ml,ml+pw,u);
    const base=Y(lo<=0&&hi>=0?0:lo);
    S.forEach(q=>{
      const pts=q.v.map((y,i)=>y==null?null:[X(i),Y(y)]);
      if(d.area&&pts.every(Boolean))el('path',{d:`M${pts[0][0]},${base}`+pts.map(p=>`L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('')+`L${pts.at(-1)[0]},${base}Z`,fill:q.color,'fill-opacity':.1},svg);
      let s='',pen=false;pts.forEach(p=>{if(!p){pen=false;return}s+=(pen?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1);pen=true});
      el('path',{d:s,fill:'none',stroke:q.color,'stroke-width':2,'stroke-linejoin':'round','stroke-linecap':'round'},svg);
      const e=pts.at(-1);if(e)el('circle',{cx:e[0],cy:e[1],r:4,fill:q.color,stroke:surf,'stroke-width':2},svg);
    });
    // direct end labels only when they separate; converging lines fall back to the legend
    const ys=S.map(q=>Y(q.v.at(-1))).sort((a,b)=>a-b);if(ys.some((y,i)=>i&&y-ys[i-1]<15))ends=false;
    if(ends)S.forEach(q=>txt(svg,ml+pw+10,Y(q.v.at(-1))+4,endLab(q),{class:S.length>1?'vz-lb':'vz-val'}));
    hoverX(fig,svg,{n,X,ml,mt,pw,ph,
      title:i=>d.xl?.[i]||d.x[i],
      rows:i=>S.map(q=>({c:q.color,k:'vz-k--line',name:q.name,val:num(q.v[i],u,1)})),
      mark:(i,g)=>{el('line',{x1:X(i),x2:X(i),y1:mt,y2:mt+ph,stroke:cv('--vz-axis')},g);
        S.forEach(q=>q.v[i]!=null&&el('circle',{cx:X(i),cy:Y(q.v[i]),r:5,fill:q.color,stroke:surf,'stroke-width':2},g))}});
  };

  R.bar=function(fig,W){
    const d=view(fig),H=+fig.dataset.h||260,u=d.unit||{},A=series(fig,d),n=d.x.length;
    const S=A.filter(q=>!q.line),LS=A.filter(q=>q.line);
    const tot=d.x.map((_,i)=>S.reduce((a,q)=>a+(+q.v[i]||0),0)),flat=[...(d.stack?tot:S.flatMap(q=>q.v)),...LS.flatMap(q=>q.v)];
    let lo=Math.min(0,...flat),hi=Math.max(0,...flat);if(d.ref)hi=Math.max(hi,d.ref.v);
    const T=ticks(lo,hi,H<200?3:4);lo=T[0];hi=T.at(-1);
    const labs=T.map(t=>num(t,u)),ml=Math.ceil(Math.max(...labs.map(s=>tw(s))))+12,mr=8,mt=20,mb=28,pw=W-ml-mr,ph=H-mt-mb;
    const Y=x=>mt+ph-(x-lo)/(hi-lo)*ph,band=pw/n,k=d.stack?1:Math.max(1,S.length);
    const bw=Math.max(3,Math.min(24,(band*.7-(k-1)*2)/k)),gw=k*bw+(k-1)*2,X0=i=>ml+i*band+(band-gw)/2,cx=i=>ml+(i+.5)*band;
    const svg=root(fig,W,H);grid(svg,T,labs,Y,ml,ml+pw);
    const under=el('g',{},svg);xlabels(svg,d.x,cx,H-8,pw);
    const g=el('g',{},svg),y0=Math.round(Y(0));
    d.x.forEach((_,i)=>{
      if(d.stack){let acc=0;const vis=S.filter(q=>+q.v[i]>0);
        vis.forEach((q,j)=>{const a=Y(acc),b=Y(acc+ +q.v[i]);acc+= +q.v[i];const bot=j?a-2:a;if(bot-b<.5)return;
          el('path',{d:j===vis.length-1?vbar(X0(i),bw,bot,b):rect(X0(i),b,bw,bot-b),fill:q.color},g)})}
      else S.forEach((q,j)=>{const v=+q.v[i];if(v)el('path',{d:vbar(X0(i)+j*(bw+2),bw,y0,Y(v)),fill:q.color},g)});
    });
    refLine(svg,d,Y,ml,ml+pw,u);
    const surf=cv('--bg');
    LS.forEach(q=>{el('path',{d:q.v.map((v,i)=>(i?'L':'M')+cx(i).toFixed(1)+','+Y(v).toFixed(1)).join(''),fill:'none',stroke:q.color,'stroke-width':2,'stroke-linejoin':'round','stroke-linecap':'round'},g);
      q.v.forEach((v,i)=>el('circle',{cx:cx(i),cy:Y(v),r:3,fill:q.color,stroke:surf,'stroke-width':1.5},g))});
    const cap=LS.length?null:d.stack?tot:S.length===1?S[0].v:null;
    if(cap){const mx=Math.max(...cap);cap.forEach((v,i)=>{if(v<=0||!(n<=8||v===mx||i===n-1))return;const s=num(v,u);if(tw(s,11,600)>band-2)return;
      txt(g,cx(i),Y(v)-6,s,{'text-anchor':'middle',class:'vz-val'})})}
    hoverX(fig,svg,{n,band:true,X:cx,ml,mt,pw,ph,under,
      title:i=>d.xl?.[i]||d.x[i],
      rows:i=>{const r=A.map(q=>({c:q.color,k:q.line?'vz-k--line':'',name:q.name,val:num(q.v[i],u,1)}));if(d.stack&&S.length>1)r.push({name:'Total',val:num(tot[i],u,1)});return r},
      mark:(i,g)=>el('rect',{x:ml+i*band+1,y:mt,width:band-2,height:ph,rx:4,fill:cv('--vz-hov')},g)});
  };

  R.hbar=function(fig,W){
    const d=fig._d,u=d.unit||{},S=series(fig,d),cats=d.cats,n=cats.length;
    const vals=cats.map((_,i)=>d.stack?S.reduce((a,q)=>a+(+q.v[i]||0),0):+S[0].v[i]);
    const L=vals.map((v,i)=>num(v,u)+(d.conv&&i?` · ${(v/vals[i-1]*100).toFixed(1)}%`:''));
    const rowH=+fig.dataset.row||34,bh=Math.min(d.stack?22:18,rowH-12),axis=!!d.stack;
    const ml=Math.min(W*.42,Math.ceil(Math.max(...cats.map(c=>tw(c))))+14);
    let lo=Math.min(0,...vals),hi=Math.max(0,...vals),T,mt=2,mb=axis?26:2;
    if(axis){T=ticks(0,hi,W<480?3:4);hi=T.at(-1)}
    const padL=lo<0?Math.max(...vals.map((v,i)=>v<0?tw(L[i],11,600):0))+10:0;
    const padR=axis?12:Math.max(...vals.map((v,i)=>v>=0?tw(L[i],11,600):0))+10;
    const a=ml+padL,b=W-padR,X=x=>a+(x-lo)/(hi-lo)*(b-a),H=mt+n*rowH+mb;
    const svg=root(fig,W,H),under=el('g',{},svg);
    if(axis)T.forEach(t=>{const x=Math.round(X(t))+.5;el('line',{x1:x,x2:x,y1:mt,y2:H-mb,stroke:t===0?cv('--vz-axis'):cv('--vz-grid')},svg);txt(svg,x,H-8,num(t,u),{'text-anchor':'middle',class:'vz-ax'})});
    else{const x=Math.round(X(0))+.5;el('line',{x1:x,x2:x,y1:mt,y2:H-mb,stroke:cv('--vz-axis')},svg)}
    const steps=d.ordinal?cats.map((_,i)=>cv('--o'+(1+Math.round(i*5/Math.max(1,n-1))))):null;
    cats.forEach((c,i)=>{
      const top=mt+i*rowH,y=top+(rowH-bh)/2;
      txt(svg,ml-10,top+rowH/2+4,c,{'text-anchor':'end',class:'vz-lb'});
      if(d.stack){let acc=0;const vis=S.filter(q=>+q.v[i]>0);
        vis.forEach((q,j)=>{const x0=X(acc)+(j?2:0),x1=X(acc+ +q.v[i]);acc+= +q.v[i];if(x1-x0<.5)return;
          el('path',{d:j===vis.length-1?hbar(y,bh,x0,x1):rect(x0,y,x1-x0,bh),fill:q.color},svg)})}
      else{const v=vals[i],fill=steps?steps[i]:d.signed?cv(v<0?'--dv-neg':'--dv-pos'):S[0].color;
        if(v)el('path',{d:hbar(y,bh,X(0),X(v)),fill},svg);
        txt(svg,v<0?X(v)-6:X(v)+6,top+rowH/2+4,L[i],{'text-anchor':v<0?'end':'start',class:'vz-val'})}
      const h=el('rect',{x:0,y:top,width:W,height:rowH,fill:'transparent'},svg);
      hit(fig,h,(px,py)=>{under.replaceChildren();el('rect',{x:ml-4,y:top+1,width:W-ml+4,height:rowH-2,rx:4,fill:cv('--vz-hov')},under);
        tip(fig,px,py,c,d.stack?[...S.map(q=>({c:q.color,name:q.name,val:num(q.v[i],u,1)})),{name:'Total',val:num(vals[i],u,1)}]
          :[{c:steps?steps[i]:d.signed?cv(vals[i]<0?'--dv-neg':'--dv-pos'):S[0].color,name:S[0].name,val:num(vals[i],u,1)},...(d.conv&&i?[{name:'From previous stage',val:(vals[i]/vals[i-1]*100).toFixed(1)+'%'}]:[])])},
        ()=>under.replaceChildren());
    });
  };

  R.donut=function(fig,W){
    const d=fig._d,u=d.unit||{},tot=d.v.reduce((a,b)=>a+b,0),wrap=document.createElement('div');
    wrap.className='vz-donut';fig._plot.insertBefore(wrap,fig._tip);
    const sz=Math.round(Math.min(200,Math.max(140,W*.4))),c=sz/2,Ro=c-2,ri=Ro*.62,surf=cv('--bg');
    const svg=el('svg',{viewBox:`0 0 ${sz} ${sz}`,width:sz,height:sz,role:'img','aria-label':fig.getAttribute('aria-label')||''},wrap);
    let a0=-Math.PI/2;
    d.cats.forEach((cat,i)=>{const a1=a0+d.v[i]/tot*Math.PI*2,color=cv('--s'+(i+1));
      const p=el('path',{d:arc(c,Ro,ri,a0,a1),fill:color,stroke:surf,'stroke-width':2,'stroke-linejoin':'round'},svg);
      hit(fig,p,(x,y)=>{p.setAttribute('transform',`translate(${(Math.cos((a0m))*3).toFixed(1)} ${(Math.sin(a0m)*3).toFixed(1)})`);
        tip(fig,x,y,cat,[{c:color,name:'Share',val:(d.v[i]/tot*100).toFixed(1)+'%'},{name:d.name||'Value',val:num(d.v[i],u,1)}])},()=>p.removeAttribute('transform'));
      const a0m=(a0+a1)/2;a0=a1});
    txt(svg,c,c-2,num(tot,u),{'text-anchor':'middle',class:'vz-center'});
    txt(svg,c,c+16,d.center||'Total',{'text-anchor':'middle',class:'vz-ax'});
    const ul=document.createElement('ul');ul.className='vz-dlist';
    ul.innerHTML=d.cats.map((cat,i)=>`<li><i class="vz-k" style="--c:${cv('--s'+(i+1))}"></i><span>${esc(cat)}</span><b>${num(d.v[i],u)}</b><em>${(d.v[i]/tot*100).toFixed(1)}%</em></li>`).join('');
    wrap.appendChild(ul);
  };

  // semicircle progress: {"v":76,"max":100,"label":"Complete"}
  R.gauge=function(fig,W){
    const d=fig._d,u=d.unit||{},mx=d.max||100,f=Math.max(0,Math.min(1,d.v/mx)),sz=Math.min(W,+fig.dataset.size||240);
    const c=sz/2,R0=c-4,r0=R0-Math.max(14,sz*.09),H=c+8,color=d.st?cv('--st-'+d.st):cv('--s'+(d.c||1));
    const svg=root(fig,sz,H);svg.style.margin='0 auto';
    const a=(t,R)=>{const ang=Math.PI*(1+t);return [(c+R*Math.cos(ang)).toFixed(2),(c+R*Math.sin(ang)).toFixed(2)]};
    const band=(t0,t1)=>{const [x0,y0]=a(t0,R0),[x1,y1]=a(t1,R0),[x2,y2]=a(t1,r0),[x3,y3]=a(t0,r0);
      return `M${x0},${y0}A${R0},${R0} 0 0 1 ${x1},${y1}L${x2},${y2}A${r0},${r0} 0 0 0 ${x3},${y3}Z`};
    el('path',{d:band(0,1),fill:cv('--vz-grid')},svg);
    const p=f>0?el('path',{d:band(0,f),fill:color},svg):null;
    txt(svg,c,c-10,num(d.v,u),{'text-anchor':'middle',class:'vz-center'});
    txt(svg,c,c+6,d.label||'of '+num(mx,u),{'text-anchor':'middle',class:'vz-ax'});
    if(p)hit(fig,p,(x,y)=>tip(fig,x,y,d.label||fig.getAttribute('aria-label'),[{c:color,name:d.name||'Value',val:num(d.v,u,1)},{name:'Target',val:num(mx,u,1)}]));
  };

  // stages top (narrow) to bottom (wide), equal-height slices, ordinal steps
  R.pyramid=function(fig,W){
    const d=fig._d,u=d.unit||{},n=d.cats.length,tot=d.v.reduce((a,b)=>a+b,0),wrap=document.createElement('div');
    wrap.className='vz-donut';fig._plot.insertBefore(wrap,fig._tip);
    const w=Math.round(Math.min(240,Math.max(160,W*.45))),h=Math.round(w*.86),sh=h/n,surf=cv('--bg');
    const svg=el('svg',{viewBox:`0 0 ${w} ${h}`,width:w,height:h,role:'img','aria-label':fig.getAttribute('aria-label')||''},wrap);
    const half=y=>y/h*w/2,colr=i=>cv('--o'+(6-Math.round(i*5/Math.max(1,n-1))));
    d.cats.forEach((cat,i)=>{const y0=i*sh,y1=(i+1)*sh,f=colr(i),cx=w/2;
      const p=el('path',{d:`M${cx-half(y0)},${y0}L${cx+half(y0)},${y0}L${cx+half(y1)},${y1}L${cx-half(y1)},${y1}Z`,fill:f,stroke:surf,'stroke-width':2,'stroke-linejoin':'round'},svg);
      if(i&&sh>=22)txt(svg,cx,y0+sh/2+4,num(d.v[i],u),{'text-anchor':'middle',class:'vz-cell',fill:ink(f),'pointer-events':'none'});
      hit(fig,p,(x,y)=>tip(fig,x,y,cat,[{c:f,name:d.name||'Value',val:num(d.v[i],u,1)},{name:'Share',val:(d.v[i]/tot*100).toFixed(1)+'%'}]))});
    const ul=document.createElement('ul');ul.className='vz-dlist';
    ul.innerHTML=d.cats.map((cat,i)=>`<li><i class="vz-k" style="--c:${colr(i)}"></i><span>${esc(cat)}</span><b>${num(d.v[i],u)}</b><em>${(d.v[i]/tot*100).toFixed(1)}%</em></li>`).join('');
    wrap.appendChild(ul);
  };

  R.heat=function(fig,W){
    const d=fig._d,u=d.unit||{},rows=d.rows,cols=d.cols,ch=+fig.dataset.cell||30;
    const flat=d.v.flat().filter(x=>x!=null),mn=d.min??Math.min(...flat),mx=d.max??Math.max(...flat);
    const ml=Math.ceil(Math.max(...rows.map(s=>tw(s))))+12,mt=24,cw=(W-ml)/cols.length,H=mt+rows.length*ch;
    const svg=root(fig,W,H),hl=el('g',{'pointer-events':'none'});
    const step=Math.max(1,Math.ceil((Math.max(...cols.map(s=>tw(s)))+8)/cw));
    cols.forEach((s,j)=>{if(!(j%step))txt(svg,ml+j*cw+(cw-2)/2,14,s,{'text-anchor':'middle',class:'vz-ax'})});
    const fit=cw>=38&&ch>=22&&d.labels!==false;
    rows.forEach((r,i)=>{txt(svg,ml-10,mt+i*ch+ch/2+3,r,{'text-anchor':'end',class:'vz-lb'});
      d.v[i].forEach((x,j)=>{if(x==null)return;const f=seq(x,mn,mx),cx=ml+j*cw,cy=mt+i*ch;
        const c=el('rect',{x:cx,y:cy,width:cw-2,height:ch-2,rx:3,fill:f},svg);
        if(fit)txt(svg,cx+(cw-2)/2,cy+ch/2+3,num(x,u),{'text-anchor':'middle',class:'vz-cell',fill:ink(f)});
        hit(fig,c,(px,py)=>{hl.replaceChildren();el('rect',{x:cx-1,y:cy-1,width:cw,height:ch,rx:4,fill:'none',stroke:cv('--fg'),'stroke-width':2},hl);
          tip(fig,px,py,`${r} · ${cols[j]}`,[{c:f,name:d.name||'Value',val:num(x,u,1)}])},()=>hl.replaceChildren())})});
    svg.appendChild(hl);
  };

  R.tiles=function(fig,W){
    const d=fig._d,u=d.unit||{},T=d.tiles,C=Math.max(...T.map(t=>t.c))+1,Rw=Math.max(...T.map(t=>t.r))+1;
    const sc=d.log?Math.log10:x=>x,mn=Math.min(...T.map(t=>sc(t.v))),mx=Math.max(...T.map(t=>sc(t.v))),s=Math.min(66,Math.floor(W/C)),ox=Math.floor((W-s*C)/2),H=Rw*s;
    const svg=root(fig,W,H),hl=el('g',{'pointer-events':'none'});
    T.forEach(t=>{const f=seq(sc(t.v),mn,mx),x=ox+t.c*s,y=t.r*s,k=ink(f);
      const r=el('rect',{x,y,width:s-3,height:s-3,rx:6,fill:f},svg);
      txt(svg,x+(s-3)/2,y+(s-3)/2+(s>=46?-2:4),t.id,{'text-anchor':'middle',class:'vz-tile',fill:k,'pointer-events':'none'});
      if(s>=46)txt(svg,x+(s-3)/2,y+(s-3)/2+13,num(t.v,u),{'text-anchor':'middle',class:'vz-cell',fill:k,'pointer-events':'none'});
      hit(fig,r,(px,py)=>{hl.replaceChildren();el('rect',{x:x-1,y:y-1,width:s-1,height:s-1,rx:7,fill:'none',stroke:cv('--fg'),'stroke-width':2},hl);
        tip(fig,px,py,t.name,[{c:f,name:d.name||'Value',val:num(t.v,u,1)},...(t.g!=null?[{name:'Growth',val:(t.g>0?'+':'')+t.g+'%'}]:[])])},()=>hl.replaceChildren())});
    svg.appendChild(hl);
  };

  /* ---------- legend, table, csv ---------- */
  function legend(fig){
    const d=fig._d,box=fig._legend,t=fig.dataset.type;box.replaceChildren();
    if(t==='heat'||t==='tiles'){const v=t==='tiles'?d.tiles.map(x=>x.v):d.v.flat().filter(x=>x!=null),u=d.unit||{};
      box.innerHTML=`<span class="vz-scale"><span>${num(d.min??Math.min(...v),u)}</span><i class="vz-scale__bar" aria-hidden="true"></i><span>${num(d.max??Math.max(...v),u)}</span><span class="vz-scale__n">${esc(d.name||'')}${d.log?' · log scale':''}</span></span>`;return}
    if(t==='donut'||!d.series||d.series.length<2)return;
    d.series.forEach((q,i)=>{const b=document.createElement('button');b.type='button';b.className='vz-key';b.dataset.i=i;
      b.setAttribute('aria-pressed',String(!fig._off.has(i)));b.title=`Show or hide ${q.name}`;
      b.innerHTML=`<i class="vz-k${t==='line'||q.line?' vz-k--line':''}" style="--c:${col(q,i)}"></i>${q.st?ic(ICON[q.st]):''}<span>${esc(q.name)}</span>`;box.appendChild(b)});
  }
  function grid2(fig){
    const d=view(fig),u=d.unit||{},t=fig.dataset.type;
    if(d.x){const S=d.series,h=[d.xh||'Period',...S.map(q=>q.name)],r=d.x.map((x,i)=>[d.xl?.[i]||x,...S.map(q=>num(q.v[i],u,1))]);
      if(d.stack){h.push('Total');r.forEach((row,i)=>row.push(num(S.reduce((a,q)=>a+(+q.v[i]||0),0),u,1)))}return [h,r]}
    if(t==='gauge')return [['Measure','Value','Target'],[[d.label||fig.getAttribute('aria-label')||'Value',num(d.v,u,1),num(d.max||100,u,1)]]];
    if(t==='heat')return [[d.rh||'',...d.cols],d.rows.map((r,i)=>[r,...d.v[i].map(x=>num(x,u,1))])];
    if(t==='tiles')return [['Country',d.name||'Value','Growth'],d.tiles.map(x=>[x.name,num(x.v,u,1),x.g!=null?x.g+'%':'—'])];
    if(t==='donut'){const tot=d.v.reduce((a,b)=>a+b,0);return [[d.ch||'Category',d.name||'Value','Share'],d.cats.map((c,i)=>[c,num(d.v[i],u,1),(d.v[i]/tot*100).toFixed(1)+'%'])]}
    const S=d.series||[{name:d.name||'Value',v:d.v}];
    return [[d.ch||'Category',...S.map(q=>q.name),...(d.conv?['From previous']:[])],d.cats.map((c,i)=>[c,...S.map(q=>num(q.v[i],u,1)),...(d.conv?[i?(S[0].v[i]/S[0].v[i-1]*100).toFixed(1)+'%':'—']:[])])];
  }
  function table(fig){const [h,r]=grid2(fig);
    fig._tbl.innerHTML=`<div class="ds-tablewrap"><table class="ds-table"><caption class="ds-sr">${esc(fig.getAttribute('aria-label')||'Chart data')}</caption><thead><tr>${h.map((c,i)=>`<th scope="col"${i?' class="num"':''}>${esc(c)}</th>`).join('')}</tr></thead><tbody>${r.map(row=>`<tr>${row.map((c,i)=>i?`<td class="num">${esc(c)}</td>`:`<th scope="row">${esc(c)}</th>`).join('')}</tr>`).join('')}</tbody></table></div><div class="vz__tfoot"><button type="button" class="ds-btn ds-s" data-vz-csv>${ic('download')}<span>Download CSV</span></button></div>`}
  function csv(fig){const [h,r]=grid2(fig),q=s=>/[",\n]/.test(s)?`"${String(s).replace(/"/g,'""')}"`:s;
    const body=[h,...r].map(row=>row.map(c=>q(String(c).replace(/−/g,'-'))).join(',')).join('\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body],{type:'text/csv'}));
    a.download=(fig.getAttribute('aria-label')||'chart').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'.csv';
    document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},0)}

  /* ---------- lifecycle ---------- */
  function init(fig){
    fig._d=JSON.parse(fig.querySelector('script[type="application/json"]').textContent);fig._off=new Set();
    const bar=document.createElement('div');bar.className='vz__bar';
    bar.innerHTML=`<div class="vz__legend" role="group" aria-label="Series"></div><button type="button" class="ds-btn ds-btn--subtle ds-s vz__tbtn" data-vz-table aria-pressed="false">${ic('table')}<span>Table</span></button>`;
    const plot=document.createElement('div');plot.className='vz__plot';
    const tipEl=document.createElement('div');tipEl.className='vz-tip';tipEl.hidden=true;tipEl.setAttribute('aria-hidden','true');plot.appendChild(tipEl);
    const tbl=document.createElement('div');tbl.className='vz__table';tbl.hidden=true;
    fig.append(bar,plot,tbl);Object.assign(fig,{_legend:bar.firstChild,_plot:plot,_tip:tipEl,_tbl:tbl});
    if(fig.hasAttribute('data-slice')){const p=document.querySelector('[data-period][aria-pressed="true"]');if(p)fig._n=+p.dataset.period}
    fig.addEventListener('click',e=>{const k=e.target.closest('.vz-key'),tb=e.target.closest('[data-vz-table]');
      if(k){const i=+k.dataset.i;if(fig._off.has(i))fig._off.delete(i);else if(fig._off.size<fig._d.series.length-1)fig._off.add(i);render(fig)}
      else if(tb){const on=tb.getAttribute('aria-pressed')!=='true';tb.setAttribute('aria-pressed',String(on));tb.querySelector('span').textContent=on?'Chart':'Table';
        fig._tbl.hidden=!on;fig._plot.hidden=on;if(on)table(fig);else render(fig)}
      else if(e.target.closest('[data-vz-csv]'))csv(fig)});
  }
  function render(fig){
    if(fig._plot.hidden){table(fig);legend(fig);return}
    const W=Math.floor(fig._plot.clientWidth);if(!W)return;fig._w=W;
    [...fig._plot.children].forEach(c=>c!==fig._tip&&c.remove());hideTip(fig);
    legend(fig);R[fig.dataset.type](fig,W);
  }
  function spark(n){const v=n.dataset.v.split(',').map(Number),W=n.clientWidth,H=n.clientHeight||32;if(!W)return;
    const lo=Math.min(...v),hi=Math.max(...v),X=i=>3+i*(W-10)/(v.length-1),Y=x=>H-4-(x-lo)/((hi-lo)||1)*(H-8);n.replaceChildren();
    const s=el('svg',{viewBox:`0 0 ${W} ${H}`,width:W,height:H,'aria-hidden':'true'},n);
    el('path',{d:v.map((x,i)=>(i?'L':'M')+X(i).toFixed(1)+','+Y(x).toFixed(1)).join(''),fill:'none',stroke:cv('--vz-spark'),'stroke-width':2,'stroke-linejoin':'round','stroke-linecap':'round'},s);
    el('circle',{cx:X(v.length-1),cy:Y(v.at(-1)),r:4,fill:cv(n.dataset.c||'--s1'),stroke:cv('--bg'),'stroke-width':2},s)}

  // <div class="rng" data-v="76" data-c="--s7"> — fixed-size ring, value in the middle
  function ring(n){const v=Math.max(0,Math.min(100,+n.dataset.v)),S=+n.dataset.size||52,sw=S>60?7:5,r=(S-sw)/2,C=2*Math.PI*r;n.replaceChildren();
    const s=el('svg',{viewBox:`0 0 ${S} ${S}`,width:S,height:S,'aria-hidden':'true'},n);
    el('circle',{cx:S/2,cy:S/2,r,fill:'none',stroke:cv('--vz-grid'),'stroke-width':sw},s);
    el('circle',{cx:S/2,cy:S/2,r,fill:'none',stroke:cv(n.dataset.c||'--s1'),'stroke-width':sw,'stroke-linecap':'round','stroke-dasharray':`${C*v/100} ${C}`,transform:`rotate(-90 ${S/2} ${S/2})`},s);
    txt(s,S/2,S/2+4,n.dataset.t||v+'%',{'text-anchor':'middle',class:'rng__t'})}

  const figs=all('.vz');figs.forEach(init);
  const sparks=all('.spk'),rings=all('.rng');
  function renderAll(){CS=getComputedStyle(document.body);figs.forEach(render);sparks.forEach(spark);rings.forEach(ring)}
  renderAll();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(renderAll);
  let rt;const ro=new ResizeObserver(()=>{clearTimeout(rt);rt=setTimeout(()=>{CS=getComputedStyle(document.body);
    figs.forEach(f=>{if(!f._plot.hidden&&Math.floor(f._plot.clientWidth)!==f._w)render(f)});sparks.forEach(spark)},60)});
  figs.forEach(f=>ro.observe(f));
  new MutationObserver(()=>requestAnimationFrame(renderAll)).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',renderAll)}catch(e){}

  /* chart range: <button data-period="6"> slices every figure marked data-slice */
  document.addEventListener('click',e=>{const b=e.target.closest('[data-period]');if(!b)return;
    all('[data-period]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    figs.filter(f=>f.hasAttribute('data-slice')).forEach(f=>{f._n=+b.dataset.period;render(f)});
    all('[data-period-label]').forEach(x=>x.textContent=b.dataset.periodName||b.textContent)});
})();
