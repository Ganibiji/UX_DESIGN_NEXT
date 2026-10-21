'use strict';
/* =====================================================================
   Reports & Analytics — chart layer.
   A chart is declared once as a neutral spec (JSON inside .chart) and
   drawn by one of three adapters: ECharts, Highcharts or Chart.js. If the
   selected engine has no native form for a type, ECharts draws it and the
   card says so. Colours always come from the CSS tokens of the element
   the chart sits in, so page, card-level and per-preview themes all work.

   Spec types
     column | bar | line | area | combo | histogram | spark   (cartesian)
     pie | funnel | polar | gauge | radial | bullet
     scatter | bubble | radar | heatmap | tilemap | treemap | sankey
     waterfall | boxplot | candlestick
   ===================================================================== */
(function(){
  const {$,$$,esc,ic,fmt}=RA;
  const clone=o=>JSON.parse(JSON.stringify(o));
  const CART=['column','bar','line','area','combo','histogram','spark'];
  const isCart=t=>CART.includes(t);

  /* ---------------------------------------------------------------- theme from tokens */
  function theme(el){
    const cs=getComputedStyle(el),g=n=>cs.getPropertyValue(n).trim();
    const r=n=>Array.from({length:n.length},(_,i)=>g(n.p+(i+1)));
    return {cat:r({p:'--c',length:8}),seq:r({p:'--q',length:9}),ord:r({p:'--o',length:6}),
      neg:g('--dv-neg'),pos:g('--dv-pos'),mid:g('--dv-mid'),
      good:g('--st-good'),warn:g('--st-warn'),serious:g('--st-serious'),crit:g('--st-crit'),
      surface:g('--ch-surface')||'#fff',ink:g('--ch-ink'),ink2:g('--ch-ink2'),muted:g('--ch-muted'),grid:g('--ch-grid'),axis:g('--ch-axis'),mute:g('--ch-mute-mark'),
      font:(g('--font')||'Segoe UI, sans-serif').replace(/"/g,"'"),dark:(el.closest('[data-theme]')||document.documentElement).getAttribute('data-theme')!=='light'};
  }
  function lum(hex){const m=/^#?([\da-f]{6})$/i.exec(hex||'');if(!m)return .5;const n=parseInt(m[1],16);return [n>>16,n>>8&255,n&255].map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0)}
  const inkOn=hex=>lum(hex)>.36?'#1a1a1a':'#ffffff';
  function mix(a,b,t){const p=h=>{const n=parseInt(h.slice(1),16);return [n>>16,n>>8&255,n&255]};const x=p(a),y=p(b);return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')).join('')}
  function seqColor(T,f){f=Math.max(0,Math.min(1,f));const x=f*8,i=Math.min(7,Math.floor(x));return mix(T.seq[i],T.seq[i+1],x-i)}
  function divColor(T,f){f=Math.max(-1,Math.min(1,f));return f<0?mix(T.mid,T.neg,-f):mix(T.mid,T.pos,f)}
  const alpha=(hex,a)=>{const n=parseInt((hex||'#000000').slice(1),16);return `rgba(${n>>16},${n>>8&255},${n&255},${a})`};

  /* ---------------------------------------------------------------- spec preparation */
  const unitOf=s=>s.unit||{};
  function scaleSpec(s,f){
    const pc=u=>u&&u.suf==='%';
    const k=x=>typeof x==='number'?+(x*f).toFixed(2):x;
    const kp=(x,u)=>typeof x==='number'?(pc(u)?Math.min(u.max??100,+(x*(1+(f-1)*.3)).toFixed(1)):k(x)):x;
    if(s.series)s.series.forEach(q=>{const u=q.panel===1?s.unit2:s.unit;
      q.data=q.data.map(d=>Array.isArray(d)?(s.type==='scatter'||s.type==='bubble'?[d[0],k(d[1]),d[2]]:d.map(k)):(d&&typeof d==='object'?{...d,value:Array.isArray(d.value)?[d.value[0],k(d.value[1]),d.value[2]]:k(d.value)}:kp(d,u)))});
    if(Array.isArray(s.data))s.data=s.data.map(d=>Array.isArray(d)?(s.type==='heatmap'||s.type==='tilemap'?[d[0],d[1],d[2]==null?null:kp(d[2],s.unit)]:d.map(k)):(typeof d==='number'?k(d):d&&typeof d==='object'?{...d,value:kp(d.value,s.unit),children:d.children&&d.children.map(c=>({...c,value:k(c.value)}))}:d));
    if(s.links)s.links=s.links.map(l=>({...l,value:k(l.value)}));
    if(s.items)s.items=s.items.map(x=>({...x,value:pc(s.unit)||s.max?Math.min((x.max||s.max||100)*1.2,kp(x.value,s.unit)):k(x.value)}));
    if(s.type==='gauge'&&typeof s.value==='number')s.value=Math.min(s.max||100,+(s.value*(1+(f-1)*.4)).toFixed(1));
  }
  function prep(spec,T,f){
    const s=clone(spec);
    if(f!==1&&s.vary!==false)scaleSpec(s,f);
    if(isCart(s.type)&&s.series){
      if(s.sort){const v=s.series[0].data,ix=v.map((_,i)=>i).sort((a,b)=>s.sort==='asc'?v[a]-v[b]:v[b]-v[a]);
        s.categories=ix.map(i=>s.categories[i]);s.series.forEach(q=>q.data=ix.map(i=>q.data[i]));if(s.highlight!=null)s.highlight=ix.indexOf(s.highlight)}
      if(s.top){s.categories=s.categories.slice(0,s.top);s.series.forEach(q=>q.data=q.data.slice(0,s.top))}
      if(s.stack==='percent'){const tot=s.categories.map((_,i)=>s.series.reduce((a,q)=>a+(+q.data[i]||0),0));
        s.series.forEach(q=>q.data=q.data.map((v,i)=>tot[i]?+(v/tot[i]*100).toFixed(1):0));s.unit={suf:'%',dp:0};s.stack='normal';s.max=100}
    }
    const pal=s.palette||'cat',n=(s.series||[]).length;
    const slot=(q,i)=>T.cat[((q&&q.c)??(i+1))-1]||T.cat[i%8];
    const mono=(i,n)=>T.ord[n<=1?2:Math.round(i*5/(n-1))];
    (s.series||[]).forEach((q,i)=>{
      q.color=q.st?T[{good:'good',warn:'warn',serious:'serious',crit:'crit'}[q.st]]:q.muted?T.mute:pal==='mono'?mono(n-1-i,n):pal==='highlight'&&i!==(s.highlight??0)&&n>1?T.mute:slot(q,i);
      if(q.tone)q.color={neg:T.neg,'neg-l':mix(T.neg,T.mid,.5),'pos-l':mix(T.pos,T.mid,.5),pos:T.pos,mid:mix(T.mid,T.ink,.18)}[q.tone]||q.color;
      if(s.diverge&&q.data)q.colors=q.data.map(v=>v>=0?T.pos:T.neg);
      if(q.pst)q.colors=q.pst.map(k=>k?T[{good:'good',warn:'warn',serious:'serious',crit:'crit'}[k]]:q.color);
      if(s.highlight!=null&&n===1&&q.data)q.colors=q.data.map((_,j)=>j===s.highlight?q.color:T.mute);
    });
    s.pointColor=(i,len,d)=>{
      if(d&&d.c)return T.cat[d.c-1];
      if(d&&d.st)return T[d.st];
      if(pal==='mono')return T.ord[len<=1?2:5-Math.round(i*5/Math.max(1,len-1))];
      if(pal==='ordinal')return T.ord[Math.min(5,len<=1?2:5-Math.round(i*5/Math.max(1,len-1)))];
      if(s.highlight!=null&&i!==s.highlight)return T.mute;
      return T.cat[i%8];
    };
    s._legend=s.legend!=null?!!s.legend:(s.series?s.series.filter(q=>!q.hideLegend).length>1:true);
    s._tooltip=s.tooltip!==false;
    return s;
  }
  const kind=(s,q)=>q.type||(s.type==='line'||s.type==='spark'?'line':s.type==='area'?'area':'bar');
  const sumOf=a=>a.reduce((x,y)=>x+(+y||0),0);
  function waterfall(s){/* returns [{name,start,end,value,kind}] */
    let run=0;return s.categories.map((c,i)=>{const d=s.data[i],tot=typeof d==='object'&&d&&d.total;
      if(tot)return {name:c,start:0,end:run,value:run,kind:'total'};const v=+d;const r={name:c,start:run,end:run+v,value:v,kind:v>=0?'up':'down'};run+=v;return r});
  }
  function linReg(pts){const n=pts.length,mx=sumOf(pts.map(p=>p[0]))/n,my=sumOf(pts.map(p=>p[1]))/n;let a=0,b=0;pts.forEach(p=>{a+=(p[0]-mx)*(p[1]-my);b+=(p[0]-mx)**2});const k=b?a/b:0;return x=>my+k*(x-mx)}
  const xyOf=d=>Array.isArray(d)?d:d.value;
  /* donut centre figure scales with the plot so it never overflows the hole */
  const cu=u=>u.cur||u.suf||u.pre||u.indian?u:{...u,raw:true};
  const cfs=s=>Math.round(Math.max(13,Math.min(22,Math.min(s._w||300,s._h||240)*.07)));

  /* ================================================================ ECharts */
  const EC={name:'ECharts'};
  EC.supports=()=>true;
  EC.render=function(el,s,T,h){
    const inst=echarts.init(el,null,{renderer:'canvas'});
    inst.setOption(ecOption(s,T),true);
    inst.on('click',p=>{if(p.componentType==='series'&&!p.seriesName?.startsWith('_'))h.onSelect({name:p.name||(p.data&&p.data.name)||'',index:p.dataIndex,series:p.seriesName,value:p.value})});
    return {resize:()=>inst.resize(),dispose:()=>inst.dispose(),
      png:()=>inst.getDataURL({type:'png',pixelRatio:2,backgroundColor:T.surface}),
      resetZoom:()=>inst.dispatchAction({type:'dataZoom',start:0,end:100})};
  };
  function ecBase(s,T){
    return {backgroundColor:'transparent',animationDuration:450,animationDurationUpdate:300,aria:{enabled:true},
      textStyle:{fontFamily:T.font,color:T.ink2,fontSize:12},color:T.cat,
      tooltip:{show:s._tooltip,confine:true,backgroundColor:T.surface,borderWidth:0,padding:[8,10],textStyle:{color:T.ink,fontSize:12},extraCssText:'box-shadow:0 0 2px rgba(0,0,0,.12),0 8px 16px rgba(0,0,0,.14);border-radius:4px;'},
      legend:{show:s._legend,type:'scroll',top:0,left:0,icon:'roundRect',itemWidth:10,itemHeight:10,itemGap:16,textStyle:{color:T.ink2,fontSize:12},inactiveColor:T.axis,pageIconColor:T.ink2,pageTextStyle:{color:T.muted}}};
  }
  function ecTip(u){return {valueFormatter:v=>Array.isArray(v)?v.map(x=>fmt(x,u,1)).join(' – '):fmt(v,u,1)}}
  function ecOption(s,T){
    const o=ecBase(s,T),u=unitOf(s),t=s.type,lab={color:T.ink2,fontSize:11};
    if(isCart(t))return ecCart(s,T,o);
    if(t==='pie'||t==='polar'){
      const tot=sumOf(s.data.map(d=>d.value)),semi=!!s.semi;
      const inner=s.donut?(semi?'58%':'54%'):0,ring=semi?[inner,'96%']:[inner,'78%'];
      const mk=(arr,i0=0)=>arr.map((d,i)=>{const c=s.pointColor(i+i0,arr.length,d);return {name:d.name,value:d.value,selected:s.explode===i,itemStyle:{color:s.gradient?{type:'radial',x:.5,y:.5,r:.8,colorStops:[{offset:0,color:mix(c,'#ffffff',.25)},{offset:1,color:c}]}:c}}});
      const label={show:s.labels!==false,color:T.ink2,fontSize:11,formatter:p=>s.labelMode==='value'?`${p.name}\n${fmt(p.value,u)}`:`${p.name}\n${p.percent.toFixed(0)}%`};
      const base={type:'pie',center:semi?['50%','78%']:[s._legend&&s.legendRight?'38%':'50%','52%'],startAngle:semi?180:90,endAngle:semi?360:'auto',selectedMode:s.select?'single':(s.explode!=null?'multiple':false),selectedOffset:10,
        itemStyle:{borderColor:T.surface,borderWidth:2,borderRadius:s.flat?0:3},label,labelLine:{lineStyle:{color:T.axis},length:8,length2:8},emphasis:{scaleSize:4,label:{fontWeight:600}},avoidLabelOverlap:true};
      const series=[];
      if(s.inner){series.push({...base,name:s.innerName||'Group',radius:[0,'34%'],data:mk(s.inner),label:{show:true,position:'inner',color:'#fff',fontSize:11,formatter:'{b}'},labelLine:{show:false}});series.push({...base,name:s.name||'Detail',radius:['46%','70%'],data:mk(s.data,0)})}
      else series.push({...base,name:s.name||'Share',radius:t==='polar'?['12%','78%']:ring,roseType:t==='polar'||s.rose?'area':false,data:mk(s.data)});
      o.series=series;o.tooltip={...o.tooltip,trigger:'item',formatter:p=>`<b>${esc(p.name)}</b><br>${fmt(p.value,u,1)} · ${p.percent}%`};
      o.legend={...o.legend,type:s.legendRight?'scroll':'plain',show:s._legend,top:s.legendRight?'middle':'bottom',left:s.legendRight?'70%':'center',orient:s.legendRight?'vertical':'horizontal'};
      if(s.donut&&s.center!==false&&!s.inner)o.graphic=[{type:'group',left:'center',top:semi?'62%':(s._legend&&s.legendRight?'middle':'middle'),...(s._legend&&s.legendRight?{left:'34%'}:{}),children:[
        {type:'text',style:{text:fmt(s.centerValue??tot,cu(u)),fill:T.ink,font:`600 ${cfs(s)}px ${T.font}`,textAlign:'center'},left:'center',top:-cfs(s)*.7},
        {type:'text',style:{text:s.centerLabel||'Total',fill:T.muted,font:`12px ${T.font}`,textAlign:'center'},left:'center',top:12}]}];
      return o;
    }
    if(t==='funnel'){
      const n=s.data.length;
      o.series=[{type:'funnel',name:s.name||'Stage',sort:s.sort||'none',gap:2,left:'8%',right:s.labelsInside?'8%':'32%',top:s._legend?28:8,bottom:8,minSize:s.pyramid?'0%':'18%',funnelAlign:'center',
        label:{show:true,position:s.labelsInside?'inside':'right',color:s.labelsInside?undefined:T.ink2,fontSize:12,formatter:p=>`${p.name}  ${fmt(p.value,u)}${s.conv&&p.dataIndex?`  ·  ${(p.value/s.data[p.dataIndex-1].value*100).toFixed(0)}%`:''}`},
        labelLine:{lineStyle:{color:T.axis}},itemStyle:{borderWidth:0},
        data:s.data.map((d,i)=>{const c=s.pointColor(i,n,d);return {name:d.name,value:d.value,itemStyle:{color:c},label:s.labelsInside?{color:inkOn(c)}:undefined}})}];
      o.tooltip={...o.tooltip,trigger:'item',formatter:p=>`<b>${esc(p.name)}</b><br>${fmt(p.value,u,1)}${p.dataIndex?` · ${(p.value/s.data[0].value*100).toFixed(1)}% of first stage`:''}`};
      o.legend.show=!!s.legend;return o;
    }
    if(t==='gauge'){
      const mx=s.max||100,c=s.color?T.cat[s.color-1]:T.cat[0],ring=!!s.ring,w=s.thin?8:16;
      const bands=s.bands?s.bands.map(b=>[b[0]/mx,T[b[1]]]):null;
      o.series=[{type:'gauge',min:0,max:mx,startAngle:ring?90:200,endAngle:ring?-270:-20,radius:'92%',center:['50%',ring?'50%':'58%'],
        progress:{show:!bands,width:w,roundCap:!s.flat,itemStyle:{color:c}},axisLine:{roundCap:!s.flat&&!bands,lineStyle:{width:w,color:bands||[[1,T.grid]]}},
        pointer:{show:!!bands,length:'62%',width:5,itemStyle:{color:T.ink}},anchor:{show:!!bands,size:10,itemStyle:{color:T.ink}},
        axisTick:{show:false},splitLine:{show:!!s.ticks,length:6,distance:-w-4,lineStyle:{color:T.axis,width:1}},axisLabel:{show:!!s.ticks,distance:-w-18,color:T.muted,fontSize:10,formatter:v=>fmt(v,u)},
        title:{show:true,offsetCenter:[0,ring?'26%':'34%'],color:T.muted,fontSize:12},
        detail:{valueAnimation:true,offsetCenter:[0,ring?'-2%':bands?'62%':'2%'],color:T.ink,fontSize:ring?22:26,fontWeight:600,formatter:v=>fmt(v,u)},
        data:[{value:s.value,name:s.label||''}]}];
      if(s.target!=null)o.series[0].markLine=undefined;
      o.tooltip={...o.tooltip,trigger:'item',formatter:p=>`<b>${esc(s.label||s.name||'Value')}</b><br>${fmt(p.value,u,1)} of ${fmt(mx,u,1)}`};
      return o;
    }
    if(t==='radial'){
      const its=s.items,mx=s.max||100;
      o.polar={radius:['22%','86%'],center:['50%','52%']};
      o.angleAxis={max:mx,show:false,startAngle:90};
      o.radiusAxis={type:'category',data:its.map(x=>x.name),axisLine:{show:false},axisTick:{show:false},axisLabel:{show:true,color:T.ink2,fontSize:11,interval:0}};
      o.series=[{type:'bar',coordinateSystem:'polar',name:s.name||'Progress',roundCap:true,barWidth:s.thin?8:14,showBackground:true,backgroundStyle:{color:T.grid},
        data:its.map((x,i)=>({value:Math.min(mx,x.value),itemStyle:{color:s.pointColor(i,its.length,x)}})),label:{show:s.labels!==false,position:'start',color:T.ink2,fontSize:11,formatter:p=>fmt(its[p.dataIndex].value,u)}}];
      o.tooltip={...o.tooltip,trigger:'item',formatter:p=>`<b>${esc(its[p.dataIndex].name)}</b><br>${fmt(its[p.dataIndex].value,u,1)} of ${fmt(mx,u,1)}`};
      o.legend.show=false;return o;
    }
    if(t==='bullet'){
      const its=s.items,rg=s.ranges||[60,85,120];
      o.grid={left:8,right:24,top:s._legend?28:8,bottom:8,containLabel:true};
      o.yAxis={type:'category',data:its.map(x=>x.name),inverse:true,axisTick:{show:false},axisLine:{show:false},axisLabel:{color:T.ink2}};
      o.xAxis={type:'value',max:rg.at(-1),splitLine:{show:false},axisLabel:{color:T.muted,formatter:v=>fmt(v,u)},axisLine:{show:true,lineStyle:{color:T.axis}}};
      const shades=[mix(T.surface,T.ink,.16),mix(T.surface,T.ink,.10),mix(T.surface,T.ink,.05)];
      o.series=[...rg.map((r,i)=>({type:'bar',name:['Poor','Satisfactory','Good'][i]||'Range',stack:'r',barWidth:'62%',silent:true,itemStyle:{color:shades[i]},data:its.map(()=>r-(i?rg[i-1]:0)),tooltip:{show:false}})),
        {type:'bar',name:s.name||'Actual',barWidth:'26%',barGap:'-100%',z:3,itemStyle:{color:T.cat[0],borderRadius:[0,3,3,0]},data:its.map(x=>x.value),label:{show:s.labels!==false,position:'right',color:T.ink2,fontSize:11,formatter:p=>fmt(p.value,u)}},
        {type:'scatter',name:'Target',symbol:'rect',symbolSize:[3,22],z:4,itemStyle:{color:T.ink},data:its.map((x,i)=>[x.target,i])}];
      o.tooltip={...o.tooltip,trigger:'axis',axisPointer:{type:'shadow'},formatter:ps=>{const i=ps[0].dataIndex,x=its[i];return `<b>${esc(x.name)}</b><br>Actual: ${fmt(x.value,u,1)}<br>Target: ${fmt(x.target,u,1)}`}};
      o.legend={...o.legend,show:false};return o;
    }
    if(t==='scatter'||t==='bubble'){
      const zs=s.series.flatMap(q=>q.data.map(d=>xyOf(d)[2]||0)),zmax=Math.max(1,...zs);
      o.grid={left:8,right:24,top:s._legend?36:16,bottom:s.zoom?44:24,containLabel:true};
      const ax=(name,uu)=>({type:'value',scale:true,name,nameLocation:'middle',nameGap:30,nameTextStyle:{color:T.muted},splitLine:{lineStyle:{color:T.grid}},axisLine:{lineStyle:{color:T.axis}},axisLabel:{color:T.muted,formatter:v=>fmt(v,uu)}});
      o.xAxis=ax(s.xName,s.xUnit||{});o.yAxis={...ax(s.yName,s.yUnit||{}),nameGap:44};
      o.series=s.series.map(q=>({type:'scatter',name:q.name,data:q.data.map(d=>Array.isArray(d)?d:{name:d.name,value:d.value}),
        symbolSize:t==='bubble'?(d=>{const z=(Array.isArray(d)?d:d)[2]||0;return 8+Math.sqrt(z/zmax)*38}):(s.big?6:10),
        itemStyle:{color:q.color,opacity:t==='bubble'?.72:.88,borderColor:T.surface,borderWidth:1},emphasis:{focus:'series',itemStyle:{borderColor:T.ink,borderWidth:1.5}},
        label:{show:!!s.labels,position:'top',color:T.ink2,fontSize:11,formatter:p=>p.data&&p.data.name||''}}));
      if(s.trend){const pts=s.series[0].data.map(xyOf),f=linReg(pts),xs=pts.map(p=>p[0]),a=Math.min(...xs),b=Math.max(...xs);
        o.series.push({type:'line',name:'Trend',data:[[a,f(a)],[b,f(b)]],symbol:'none',lineStyle:{color:T.ink2,type:'dashed',width:1.5},tooltip:{show:false},silent:true})}
      if(s.quadrant){const pts=s.series.flatMap(q=>q.data.map(xyOf)),mx=sumOf(pts.map(p=>p[0]))/pts.length,my=sumOf(pts.map(p=>p[1]))/pts.length;
        o.series[0].markLine={silent:true,symbol:'none',lineStyle:{color:T.axis,type:'solid'},label:{color:T.muted,fontSize:10},data:[{xAxis:+mx.toFixed(1),label:{formatter:'avg'}},{yAxis:+my.toFixed(1),label:{formatter:'avg'}}]}}
      if(s.zoom)o.dataZoom=[{type:'inside',xAxisIndex:0},{type:'inside',yAxisIndex:0},{type:'slider',xAxisIndex:0,height:16,bottom:8,borderColor:T.grid,fillerColor:alpha(T.cat[0],.15),handleStyle:{color:T.surface,borderColor:T.axis},textStyle:{color:T.muted}}];
      o.tooltip={...o.tooltip,trigger:'item',formatter:p=>{const v=Array.isArray(p.value)?p.value:p.data.value;return `<b>${esc(p.data&&p.data.name||p.seriesName)}</b><br>${esc(s.xName||'x')}: ${fmt(v[0],s.xUnit||{},1)}<br>${esc(s.yName||'y')}: ${fmt(v[1],s.yUnit||{},1)}${v[2]!=null?`<br>${esc(s.zName||'Size')}: ${fmt(v[2],s.zUnit||{},1)}`:''}`}};
      return o;
    }
    if(t==='radar'){
      o.radar={indicator:s.indicators,shape:s.circle?'circle':'polygon',radius:'66%',center:['50%','56%'],axisName:{color:T.ink2,fontSize:11},splitLine:{lineStyle:{color:T.grid}},splitArea:{show:false},axisLine:{lineStyle:{color:T.grid}}};
      o.series=[{type:'radar',symbolSize:5,data:s.series.map(q=>({name:q.name,value:q.data,itemStyle:{color:q.color},lineStyle:{width:2,color:q.color,type:q.dashed?'dashed':'solid'},areaStyle:s.filled?{color:q.color,opacity:.14}:undefined}))}];
      o.tooltip={...o.tooltip,trigger:'item'};return o;
    }
    if(t==='heatmap'||t==='tilemap'){
      const vals=s.data.map(d=>d[2]).filter(v=>v!=null),mn=s.min??Math.min(...vals),mx=s.max??Math.max(...vals),tile=t==='tilemap';
      o.grid={left:tile?4:8,right:tile?4:16,top:8,bottom:44,containLabel:true};
      const ca=(d,inv)=>({type:'category',data:d,inverse:!!inv,splitArea:{show:false},axisLine:{show:false},axisTick:{show:false},axisLabel:{show:!tile,color:T.muted,fontSize:11}});
      o.xAxis=ca(s.x);o.yAxis=ca(s.y,true);
      o.visualMap={min:mn,max:mx,calculable:false,orient:'horizontal',left:'center',bottom:0,itemWidth:12,itemHeight:140,text:[fmt(mx,s.unit||{}),fmt(mn,s.unit||{})],textStyle:{color:T.muted,fontSize:11},
        inRange:{color:s.diverging?[T.neg,T.mid,T.pos]:T.seq}};
      o.series=[{type:'heatmap',name:s.name||'Value',data:s.data.filter(d=>d[2]!=null),itemStyle:{borderColor:T.surface,borderWidth:tile?3:2,borderRadius:tile?4:2},
        label:{show:s.labels!==false,fontSize:tile?12:10,fontWeight:tile?600:400,formatter:p=>tile?(s.codes?.[p.data[1]]?.[p.data[0]]||'')+'\n'+fmt(p.data[2],s.unit||{}):fmt(p.data[2],s.unit||{})},
        emphasis:{itemStyle:{borderColor:T.ink,borderWidth:2}}}];
      o.tooltip={...o.tooltip,trigger:'item',formatter:p=>`<b>${esc(tile?(s.names?.[p.data[1]]?.[p.data[0]]||''):s.y[p.data[1]]+' · '+s.x[p.data[0]])}</b><br>${fmt(p.data[2],s.unit||{},1)}`};
      o.legend.show=false;return o;
    }
    if(t==='treemap'){
      const n=s.data.length;
      const node=(d,i,c)=>{const col=c||s.pointColor(i,n,d);return {name:d.name,value:d.value??sumOf((d.children||[]).map(x=>x.value)),itemStyle:{color:col},label:{color:inkOn(col)},upperLabel:{color:inkOn(col)},
        children:d.children&&d.children.map((x,j)=>{const cc=mix(col,T.surface,j%2?.18:0);return {name:x.name,value:x.value,itemStyle:{color:cc},label:{color:inkOn(cc)}}})}};
      o.series=[{type:'treemap',name:s.name||'All',roam:false,nodeClick:s.drill?'zoomToNode':false,width:'100%',height:s.drill?'86%':'100%',top:0,
        breadcrumb:{show:!!s.drill,bottom:0,itemStyle:{color:T.surface,borderColor:T.axis,textStyle:{color:T.ink2}}},
        label:{fontSize:12,formatter:p=>`${p.name}\n${fmt(p.value,s.unit||{})}`},upperLabel:{show:!!s.data[0].children,height:22,fontSize:12,fontWeight:600},
        itemStyle:{borderColor:T.surface,borderWidth:2,gapWidth:2},levels:[{itemStyle:{borderColor:T.surface,borderWidth:2,gapWidth:2}},{itemStyle:{borderColor:T.surface,borderWidth:1,gapWidth:1}}],
        data:s.data.map((d,i)=>node(d,i))}];
      o.tooltip={...o.tooltip,trigger:'item',formatter:p=>`<b>${esc(p.treePathInfo?p.treePathInfo.slice(1).map(x=>x.name).join(' › '):p.name)}</b><br>${fmt(p.value,s.unit||{},1)}`};
      o.legend.show=false;return o;
    }
    if(t==='sankey'){
      const names=[...new Set(s.links.flatMap(l=>[l.source,l.target]))];
      o.series=[{type:'sankey',left:4,right:s.labelRight===false?4:110,top:8,bottom:8,nodeWidth:12,nodeGap:10,emphasis:{focus:'adjacency'},draggable:false,
        data:names.map((nm,i)=>({name:nm,itemStyle:{color:T.cat[(s.nodeColor&&s.nodeColor[nm]?s.nodeColor[nm]-1:i)%8],borderWidth:0}})),
        links:s.links,lineStyle:{color:'gradient',opacity:.32,curveness:.5},label:{color:T.ink2,fontSize:11}}];
      o.tooltip={...o.tooltip,trigger:'item',formatter:p=>p.dataType==='edge'?`${esc(p.data.source)} → ${esc(p.data.target)}<br><b>${fmt(p.data.value,s.unit||{},1)}</b>`:`<b>${esc(p.name)}</b><br>${fmt(p.value,s.unit||{},1)}`};
      o.legend.show=false;return o;
    }
    if(t==='waterfall'){
      const w=waterfall(s),hz=!!s.horizontal;
      o.grid={left:8,right:16,top:s._legend?36:16,bottom:8,containLabel:true};
      const cat={type:'category',data:s.categories,axisTick:{show:false},axisLine:{lineStyle:{color:T.axis}},axisLabel:{color:T.muted,interval:0,hideOverlap:true},inverse:hz};
      const val={type:'value',splitLine:{lineStyle:{color:T.grid}},axisLabel:{color:T.muted,formatter:v=>fmt(v,u)}};
      o.xAxis=hz?val:cat;o.yAxis=hz?cat:val;
      const bar=(name,col,pick)=>({type:'bar',name,stack:'w',barMaxWidth:36,itemStyle:{color:col,borderRadius:2},data:w.map(pick),label:{show:s.labels!==false,position:hz?'right':'top',color:T.ink2,fontSize:11,formatter:p=>p.value==null||p.value==='-'?'':fmt(name==='Decrease'?-p.value:p.value,u)}});
      o.series=[{type:'bar',name:'_base',stack:'w',silent:true,itemStyle:{color:'transparent'},tooltip:{show:false},data:w.map(x=>x.kind==='total'?0:Math.min(x.start,x.end))},
        bar('Increase',T.pos,x=>x.kind==='up'?x.value:'-'),bar('Decrease',T.neg,x=>x.kind==='down'?-x.value:'-'),bar('Total',T.muted,x=>x.kind==='total'?x.value:'-')];
      o.legend={...o.legend,data:['Increase','Decrease','Total'],show:s.legend!==false};
      o.tooltip={...o.tooltip,trigger:'axis',axisPointer:{type:'shadow'},formatter:ps=>{const x=w[ps[0].dataIndex];return `<b>${esc(x.name)}</b><br>${x.kind==='total'?'Total':'Change'}: ${fmt(x.value,u,1)}${x.kind!=='total'?`<br>Running total: ${fmt(x.end,u,1)}`:''}`}};
      return o;
    }
    if(t==='boxplot'){
      const hz=!!s.horizontal;o.grid={left:8,right:16,top:s._legend?36:16,bottom:8,containLabel:true};
      const cat={type:'category',data:s.categories,axisTick:{show:false},axisLine:{lineStyle:{color:T.axis}},axisLabel:{color:T.muted}};
      const val={type:'value',scale:true,splitLine:{lineStyle:{color:T.grid}},axisLabel:{color:T.muted,formatter:v=>fmt(v,u)},name:s.valueName,nameTextStyle:{color:T.muted}};
      o.xAxis=hz?val:cat;o.yAxis=hz?{...cat,inverse:true}:val;
      o.series=[{type:'boxplot',name:s.name||'Distribution',data:s.data,boxWidth:[10,36],itemStyle:{color:alpha(T.cat[0],.18),borderColor:T.cat[0],borderWidth:1.5},emphasis:{itemStyle:{borderWidth:2}}}];
      if(s.outliers)o.series.push({type:'scatter',name:'Outliers',data:s.outliers.map(p=>hz?[p[1],p[0]]:p),symbolSize:7,itemStyle:{color:T.cat[1]}});
      o.tooltip={...o.tooltip,trigger:'item',formatter:p=>{if(p.seriesType==='scatter')return `Outlier: ${fmt(hz?p.value[0]:p.value[1],u,1)}`;const v=p.value.slice(-5);return `<b>${esc(p.name)}</b><br>Max ${fmt(v[4],u,1)}<br>Q3 ${fmt(v[3],u,1)}<br>Median ${fmt(v[2],u,1)}<br>Q1 ${fmt(v[1],u,1)}<br>Min ${fmt(v[0],u,1)}`}};
      o.legend.show=!!s.outliers;return o;
    }
    if(t==='candlestick'){
      const d=s.data,ma=d.map((_,i)=>i<4?null:+(sumOf(d.slice(i-4,i+1).map(x=>x[1]))/5).toFixed(1));
      o.grid={left:8,right:16,top:36,bottom:48,containLabel:true};
      o.xAxis={type:'category',data:s.categories,boundaryGap:true,axisLine:{lineStyle:{color:T.axis}},axisTick:{show:false},axisLabel:{color:T.muted}};
      o.yAxis={type:'value',scale:true,splitLine:{lineStyle:{color:T.grid}},axisLabel:{color:T.muted,formatter:v=>fmt(v,u)}};
      o.series=[{type:'candlestick',name:s.name||'Price',data:d,itemStyle:{color:T.pos,color0:T.neg,borderColor:T.pos,borderColor0:T.neg}},
        {type:'line',name:'5-day average',data:ma,smooth:true,showSymbol:false,lineStyle:{width:1.5,color:T.ink2}}];
      o.dataZoom=[{type:'inside',start:40,end:100},{type:'slider',start:40,end:100,height:16,bottom:8,borderColor:T.grid,fillerColor:alpha(T.cat[0],.15),handleStyle:{color:T.surface,borderColor:T.axis},textStyle:{color:T.muted}}];
      o.legend.show=true;o.legend.data=[s.name||'Price','5-day average'];
      o.tooltip={...o.tooltip,trigger:'axis',axisPointer:{type:'cross',lineStyle:{color:T.axis},crossStyle:{color:T.axis}},formatter:ps=>{const c=ps.find(p=>p.seriesType==='candlestick');if(!c)return '';const v=c.value.slice(-4);return `<b>${esc(c.name)}</b><br>Open ${fmt(v[0],u,1)}<br>Close ${fmt(v[1],u,1)}<br>Low ${fmt(v[2],u,1)}<br>High ${fmt(v[3],u,1)}`}};
      return o;
    }
    return o;
  }
  function ecCart(s,T,o){
    const u=unitOf(s),cats=s.categories,S=s.series,hz=s.type==='bar',panels=S.some(q=>q.panel===1),spark=s.type==='spark';
    const hasBar=S.some(q=>kind(s,q)==='bar'),top=s._legend?36:(s.labels&&!hz?22:12);
    const gl=8,gr=hz&&s.labels?44:(s.labels==='end'?96:16);
    o.grid=spark?{left:2,right:2,top:4,bottom:2}:panels?[{left:gl,right:gr,top,height:'36%',containLabel:true},{left:gl,right:gr,top:'64%',bottom:s.zoom?40:8,containLabel:true}]:{left:gl,right:gr,top,bottom:s.zoom?44:8,containLabel:true};
    const catAx=gi=>({type:'category',gridIndex:gi,data:cats,show:!spark,boundaryGap:hasBar,inverse:hz,axisLine:{lineStyle:{color:T.axis}},axisTick:{show:false},axisLabel:{color:T.muted,hideOverlap:true,show:!(panels&&gi===0)}});
    const valAx=(gi,uu,name)=>({type:'value',gridIndex:gi,show:!spark,max:s.max,min:s.min,scale:s.zero===false,splitNumber:panels?3:(hz?4:5),name,nameTextStyle:{color:T.muted,align:'left'},splitLine:{lineStyle:{color:T.grid}},axisLabel:{color:T.muted,hideOverlap:true,formatter:v=>fmt(v,uu||{})}});
    if(panels){o.xAxis=[catAx(0),catAx(1)];o.yAxis=[valAx(0,u,s.panelNames?.[0]),valAx(1,s.unit2,s.panelNames?.[1])]}
    else if(hz){o.xAxis=valAx(0,u);o.yAxis=catAx(0)}else{o.xAxis=catAx(0);o.yAxis=valAx(0,u)}
    const stacked=!!s.stack,lastBar=[...S].reverse().find(q=>kind(s,q)==='bar');
    o.series=S.map((q,i)=>{
      const k=kind(s,q),gi=panels&&q.panel===1?1:0,uu=gi?s.unit2:u;
      const base={name:q.name,data:q.data.map((v,j)=>q.colors?{value:v,itemStyle:{color:q.colors[j]}}:v),xAxisIndex:gi,yAxisIndex:gi,emphasis:{focus:S.length>1?'series':'self'}};
      if(k==='range'){return null}
      if(k==='bar'&&Array.isArray(q.data.find(v=>v!=null))){const r=s.flat?0:3;return [{...base,name:'_f'+i,type:'bar',stack:'f'+i,silent:true,itemStyle:{color:'transparent'},data:q.data.map(d=>d?d[0]:null),tooltip:{show:false},barMaxWidth:hz?22:28},
          {...base,type:'bar',stack:'f'+i,barMaxWidth:hz?22:28,itemStyle:{color:q.color,borderRadius:r},data:q.data.map(d=>d?+(d[1]-d[0]).toFixed(2):null),label:{show:!!s.labels,position:hz?'right':'top',color:T.ink2,fontSize:11,formatter:p=>fmt(q.data[p.dataIndex][1],uu)}}]}
      if(k==='bar'){const end=!stacked||q===lastBar;const r=s.flat?0:4;
        return {...base,type:'bar',stack:stacked&&!q.nostack?'s':q.stack,barMaxWidth:s.type==='histogram'?undefined:(hz?22:28),barCategoryGap:s.type==='histogram'?'4%':(s.floating?'40%':'28%'),barGap:'10%',
          itemStyle:{color:q.color,borderRadius:end?(hz?[0,r,r,0]:[r,r,0,0]):0,borderColor:stacked?T.surface:undefined,borderWidth:stacked?1:0,opacity:q.ghost?.45:1},
          label:{show:!!s.labels&&(!stacked||q===lastBar||s.labels==='all'),position:stacked&&s.labels==='all'?'inside':(hz?'right':'top'),color:stacked&&s.labels==='all'?'#fff':T.ink2,fontSize:11,formatter:p=>{const v=typeof p.value==='object'?p.value.value:p.value;return v==null?'':fmt(stacked&&q===lastBar&&s.labels!=='all'?sumOf(S.filter(x=>kind(s,x)==='bar').map(x=>x.data[p.dataIndex])):v,uu)}}}}
      const area=k==='area';
      const ser={...base,type:'line',smooth:!!(s.smooth||q.smooth),step:q.step||false,symbol:'circle',symbolSize:7,showSymbol:!!s.symbols,
        lineStyle:{width:spark?1.5:2,color:q.color,type:q.dashed?'dashed':'solid'},itemStyle:{color:q.color,borderColor:T.surface,borderWidth:1.5},
        stack:stacked&&area?'a':undefined,connectNulls:false,z:3,
        areaStyle:area?{color:s.gradient||spark?{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:alpha(q.color,.32)},{offset:1,color:alpha(q.color,0)}]}:alpha(q.color,stacked?.55:.14)}:undefined,
        endLabel:{show:s.labels==='end',color:T.ink2,fontSize:11,formatter:p=>`${q.name}  ${fmt(p.value,uu)}`},
        label:{show:s.labels===true,position:'top',color:T.ink2,fontSize:10,formatter:p=>fmt(p.value,uu)}};
      return ser;
    }).flat().filter(Boolean);
    /* range band: data [[lo,hi]] -> invisible lower line + stacked delta area */
    S.forEach(q=>{if(kind(s,q)!=='range')return;
      o.series.unshift({name:q.name,type:'line',data:q.data.map(d=>d?+(d[1]-d[0]).toFixed(2):null),stack:'band',symbol:'none',lineStyle:{opacity:0},areaStyle:{color:alpha(q.color,.18)},tooltip:{show:false},z:1},
        {name:'_lo',type:'line',data:q.data.map(d=>d?d[0]:null),stack:'band',symbol:'none',lineStyle:{opacity:0},tooltip:{show:false},z:1});
      o.series.sort((a,b)=>a.name==='_lo'?-1:b.name==='_lo'?1:0)});
    const first=o.series.find(x=>!x.name?.startsWith('_'))||o.series[0];
    const ml=[];
    if(s.target)ml.push({[hz?'xAxis':'yAxis']:s.target.value,label:{formatter:`${s.target.label||'Target'} ${fmt(s.target.value,u)}`,position:'insideEndTop',color:T.ink2,fontSize:11},lineStyle:{color:T.ink2,type:'dashed',width:1.5}});
    if(s.threshold)ml.push({[hz?'xAxis':'yAxis']:s.threshold.value,label:{formatter:`${s.threshold.label||'Threshold'} ${fmt(s.threshold.value,u)}`,position:'insideEndTop',color:T.crit,fontSize:11},lineStyle:{color:T.crit,type:'solid',width:1.5}});
    if(ml.length&&first)first.markLine={silent:true,symbol:'none',data:ml};
    if(s.forecastFrom!=null&&first)first.markArea={silent:true,itemStyle:{color:alpha(T.ink,.05)},label:{color:T.muted,fontSize:11,position:'insideTop'},data:[[{xAxis:cats[s.forecastFrom],name:'Forecast'},{xAxis:cats.at(-1)}]]};
    if(s.zoom&&!spark)o.dataZoom=[{type:'inside',[hz?'yAxisIndex':'xAxisIndex']:panels?[0,1]:0},{type:'slider',[hz?'yAxisIndex':'xAxisIndex']:panels?[0,1]:0,height:16,bottom:8,borderColor:T.grid,fillerColor:alpha(T.cat[0],.15),handleStyle:{color:T.surface,borderColor:T.axis},moveHandleStyle:{color:T.axis},textStyle:{color:T.muted},dataBackground:{lineStyle:{color:T.axis},areaStyle:{color:T.grid}}}];
    o.tooltip={...o.tooltip,trigger:spark?'axis':'axis',axisPointer:{type:hasBar?'shadow':'line',lineStyle:{color:T.axis},shadowStyle:{color:T.grid,opacity:.5}},
      formatter:ps=>{ps=ps.filter(p=>!p.seriesName.startsWith('_'));if(!ps.length)return '';const i=ps[0].dataIndex;
        const rows=ps.map(p=>{const q=S.find(x=>x.name===p.seriesName)||{};const uu=q.panel===1?s.unit2:u;const raw=q.data?q.data[i]:null,v=Array.isArray(raw)?raw:(typeof p.value==='object'&&p.value?p.value.value:p.value);
          return `<div style="display:flex;gap:8px;align-items:center;min-width:160px"><span style="width:10px;height:${kind(s,q)==='bar'?10:3}px;border-radius:2px;background:${q.color}"></span><span style="flex:1">${esc(p.seriesName)}</span><b>${Array.isArray(v)?fmt(v[0],uu,1)+' – '+fmt(v[1],uu,1):fmt(v,uu,1)}</b></div>`}).join('');
        return `<b>${esc(s.labelsFull?.[i]||cats[i])}</b>${rows}`}};
    if(spark){o.legend.show=false;o.tooltip.axisPointer={type:'none'}}
    return o;
  }

  /* ================================================================ Highcharts */
  const HC={name:'Highcharts'};
  HC.supports=s=>!['candlestick','radial'].includes(s.type)&&!(s.type==='pie'&&(s.rose||s.inner&&false))&&!(s.series||[]).some(q=>q.type==='range'&&s.stack);
  HC.render=function(el,s,T,h){
    const opt=hcOption(s,T,h);
    const ch=Highcharts.chart(el,opt);
    return {resize:()=>ch.reflow(),dispose:()=>ch.destroy(),
      png:()=>{ch.exportChartLocal({type:'image/png',filename:RA.slug(s.title||'chart'),sourceWidth:el.clientWidth,sourceHeight:el.clientHeight},{chart:{backgroundColor:T.surface}});return null},
      resetZoom:()=>{ch.xAxis.forEach(a=>a.setExtremes(null,null,false));ch.yAxis.forEach(a=>a.setExtremes(null,null,false));ch.redraw();if(ch.resetZoomButton)ch.resetZoomButton=ch.resetZoomButton.destroy()}};
  };
  function hcBase(s,T,h){
    const u=unitOf(s);
    return {chart:{backgroundColor:'transparent',style:{fontFamily:T.font},spacing:[8,8,8,8],animation:{duration:450},...(s.zoom?{zooming:{type:s.type==='scatter'||s.type==='bubble'?'xy':'x',resetButton:{theme:{style:{display:'none'}}}}}:{})},
      title:{text:null},credits:{enabled:false},exporting:{enabled:false,fallbackToExportServer:false},accessibility:{enabled:true,description:s.title||''},
      colors:T.cat,
      legend:{enabled:s._legend,align:'left',verticalAlign:'top',margin:8,padding:0,itemStyle:{color:T.ink2,fontWeight:'400',fontSize:'12px'},itemHoverStyle:{color:T.ink},itemHiddenStyle:{color:T.axis},symbolRadius:2,symbolHeight:10,symbolWidth:10,squareSymbol:false,navigation:{activeColor:T.ink2,inactiveColor:T.axis,style:{color:T.muted}}},
      tooltip:{enabled:s._tooltip,backgroundColor:T.surface,borderWidth:0,borderRadius:4,shadow:{color:'rgba(0,0,0,.18)',offsetX:0,offsetY:4,width:10},style:{color:T.ink,fontSize:'12px'},outside:false,
        valueDecimals:undefined,pointFormatter:function(){return `<span style="color:${this.color}">●</span> ${esc(this.series.name)}: <b>${fmt(this.y,this.series.userOptions.u||u,1)}</b><br/>`}},
      plotOptions:{series:{animation:{duration:450},cursor:'pointer',point:{events:{click:function(){h.onSelect({name:this.name||this.category||'',index:this.index,series:this.series.name,value:this.y})}}},states:{inactive:{opacity:.35}},dataLabels:{style:{color:T.ink2,textOutline:'none',fontWeight:'600',fontSize:'11px'}}}},
      xAxis:{lineColor:T.axis,tickColor:T.axis,tickLength:0,gridLineColor:T.grid,labels:{style:{color:T.muted,fontSize:'11px'}},title:{style:{color:T.muted}}},
      yAxis:{gridLineColor:T.grid,lineColor:T.axis,labels:{style:{color:T.muted,fontSize:'11px'}},title:{text:null,style:{color:T.muted}}}};
  }
  function hcOption(s,T,h){
    const o=hcBase(s,T,h),u=unitOf(s),t=s.type;
    const fy=uu=>({formatter:function(){return fmt(this.value,uu||{})}});
    o.yAxis.labels={...o.yAxis.labels,...fy(u)};
    if(isCart(t)){
      const S=s.series,hz=t==='bar',panels=S.some(q=>q.panel===1),stacked=!!s.stack,spark=t==='spark';
      o.chart.type=hz?'bar':'column';
      o.xAxis={...o.xAxis,categories:s.categories,crosshair:S.some(q=>kind(s,q)!=='bar')?{color:T.axis,width:1}:{color:T.grid},visible:!spark,reversed:hz?false:undefined};
      const plot=(uu,extra={})=>({...o.yAxis,labels:{...o.yAxis.labels,...fy(uu)},max:s.max,min:s.min,startOnTick:s.zero!==false,softMin:s.zero===false?undefined:0,visible:!spark,...extra});
      o.yAxis=panels?[plot(u,{top:'0%',height:'44%',offset:0,title:{text:s.panelNames?.[0]||null,style:{color:T.muted}}}),plot(s.unit2,{top:'56%',height:'44%',offset:0,title:{text:s.panelNames?.[1]||null,style:{color:T.muted}}})]:plot(u);
      if(panels)o.xAxis={...o.xAxis,labels:{...o.xAxis.labels}};
      const plotLines=[];
      if(s.target)plotLines.push({value:s.target.value,color:T.ink2,width:1.5,dashStyle:'Dash',zIndex:4,label:{text:`${s.target.label||'Target'} ${fmt(s.target.value,u)}`,align:'right',x:-4,style:{color:T.ink2,fontSize:'11px'}}});
      if(s.threshold)plotLines.push({value:s.threshold.value,color:T.crit,width:1.5,zIndex:4,label:{text:`${s.threshold.label||'Threshold'} ${fmt(s.threshold.value,u)}`,align:'right',x:-4,style:{color:T.crit,fontSize:'11px'}}});
      (Array.isArray(o.yAxis)?o.yAxis[0]:o.yAxis).plotLines=plotLines;
      if(s.forecastFrom!=null)o.xAxis.plotBands=[{from:s.forecastFrom-.5,to:s.categories.length,color:alpha(T.ink,.05),label:{text:'Forecast',style:{color:T.muted,fontSize:'11px'},y:14}}];
      o.plotOptions.column={borderRadius:s.flat?0:4,borderWidth:stacked?1:0,borderColor:T.surface,pointPadding:s.type==='histogram'?0:.08,groupPadding:s.type==='histogram'?.02:.16,maxPointWidth:s.type==='histogram'?undefined:28,stacking:stacked?'normal':undefined,
        dataLabels:{enabled:!!s.labels,crop:false,overflow:'allow',formatter:function(){return fmt(stacked&&s.labels!=='all'?this.total:this.y,this.series.userOptions.u||u)},...(stacked&&s.labels!=='all'?{enabled:false}:{})}};
      o.plotOptions.bar={...o.plotOptions.column,maxPointWidth:22};
      if(stacked&&s.labels&&s.labels!=='all')(Array.isArray(o.yAxis)?o.yAxis[0]:o.yAxis).stackLabels={enabled:true,style:{color:T.ink2,textOutline:'none',fontSize:'11px'},formatter:function(){return fmt(this.total,u)}};
      o.plotOptions.line={marker:{enabled:!!s.symbols,radius:3.5,lineColor:T.surface,lineWidth:1.5,symbol:'circle'},lineWidth:spark?1.5:2,dataLabels:{enabled:s.labels===true,formatter:function(){return fmt(this.y,u)}}};
      o.plotOptions.spline=o.plotOptions.line;
      o.plotOptions.area={...o.plotOptions.line,stacking:stacked?'normal':undefined,fillOpacity:stacked?.55:.14};
      o.plotOptions.areaspline=o.plotOptions.area;
      o.plotOptions.arearange={lineWidth:0,fillOpacity:.18,marker:{enabled:false}};
      o.plotOptions.columnrange={borderRadius:s.flat?0:3,borderWidth:0,maxPointWidth:hz?22:28,dataLabels:{enabled:!!s.labels,formatter:function(){return this.point.high===this.y?fmt(this.y,u):null}}};
      o.series=S.map(q=>{const k=kind(s,q),gi=panels&&q.panel===1?1:0,smooth=s.smooth||q.smooth;
        const fl=k==='bar'&&Array.isArray(q.data.find(v=>v!=null));const type=fl?'columnrange':k==='bar'?(hz?'bar':'column'):k==='area'?(smooth?'areaspline':'area'):k==='range'?'arearange':(smooth?'spline':'line');
        const ser={type,name:q.name,yAxis:panels?gi:0,u:gi?s.unit2:u,color:q.color,data:q.colors?q.data.map((v,j)=>({y:v,color:q.colors[j]})):q.data,dashStyle:q.dashed?'ShortDash':'Solid',step:q.step?'left':undefined,opacity:q.ghost?.45:1,zIndex:k==='bar'?1:3,stacking:stacked&&!q.nostack&&(k==='bar'||k==='area')?'normal':undefined,showInLegend:!q.hideLegend};
        if(k==='area'&&(s.gradient||spark))ser.fillColor={linearGradient:{x1:0,y1:0,x2:0,y2:1},stops:[[0,alpha(q.color,.32)],[1,alpha(q.color,0)]]};
        if(k==='bar'&&!stacked)ser.borderRadius=s.flat?0:4;
        if(s.labels==='end'&&k!=='bar')ser.dataLabels={enabled:true,formatter:function(){return this.point.index===this.series.data.length-1?`${q.name} ${fmt(this.y,u)}`:null},align:'left',x:6,y:4,crop:false,overflow:'allow'};
        return ser});
      o.tooltip={...o.tooltip,shared:true,useHTML:true,headerFormat:'<b>{point.key}</b><br/>',pointFormatter:function(){const q=this.series.userOptions;const v=this.series.type==='arearange'||this.series.type==='columnrange'?`${fmt(this.low,q.u,1)} – ${fmt(this.high,q.u,1)}`:fmt(this.y,q.u,1);
        return `<span style="display:inline-block;width:10px;height:${this.series.type==='column'||this.series.type==='bar'?10:3}px;border-radius:2px;background:${this.color};margin-right:6px"></span>${esc(this.series.name)}: <b>${v}</b><br/>`}};
      if(spark){o.legend.enabled=false;o.chart.spacing=[2,2,2,2];o.tooltip.enabled=true;o.xAxis.visible=false}
      if(s.labels==='end')o.chart.marginRight=96;
      return o;
    }
    if(t==='pie'||t==='polar'){
      if(t==='polar'){
        o.chart.polar=true;o.chart.type='column';o.legend.enabled=false;
        o.xAxis={...o.xAxis,categories:s.data.map(d=>d.name),lineWidth:0,gridLineColor:T.grid,labels:{style:{color:T.ink2,fontSize:'11px'}}};
        o.yAxis={...o.yAxis,gridLineColor:T.grid,labels:{enabled:false},min:0};
        o.plotOptions.column={pointPadding:0,groupPadding:0,borderWidth:2,borderColor:T.surface,colorByPoint:true};
        o.series=[{name:s.name||'Value',colors:s.data.map((d,i)=>s.pointColor(i,s.data.length,d)),data:s.data.map(d=>({name:d.name,y:d.value}))}];
        o.tooltip={...o.tooltip,pointFormatter:function(){return `<b>${fmt(this.y,u,1)}</b>`}};return o;
      }
      const semi=!!s.semi;
      o.chart.type='pie';
      o.plotOptions.pie={innerSize:s.donut?(semi?'58%':'62%'):0,startAngle:semi?-90:0,endAngle:semi?90:undefined,center:semi?['50%','78%']:['50%','50%'],size:semi?'150%':'86%',
        borderColor:T.surface,borderWidth:2,borderRadius:s.flat?0:3,allowPointSelect:!!s.select||s.explode!=null,slicedOffset:10,showInLegend:s._legend,
        dataLabels:{enabled:s.labels!==false,distance:semi?14:16,connectorColor:T.axis,formatter:function(){return s.labelMode==='value'?`${esc(this.point.name)}<br>${fmt(this.y,u)}`:`${esc(this.point.name)} <span style="font-weight:400">${this.percentage.toFixed(0)}%</span>`},style:{color:T.ink2,textOutline:'none',fontWeight:'600',fontSize:'11px'}}};
      o.legend={...o.legend,align:s.legendRight?'right':'center',verticalAlign:s.legendRight?'middle':'bottom',layout:s.legendRight?'vertical':'horizontal'};
      const pts=(arr)=>arr.map((d,i)=>{const c=s.pointColor(i,arr.length,d);return {name:d.name,y:d.value,sliced:s.explode===i,color:s.gradient?{radialGradient:{cx:.5,cy:.5,r:.8},stops:[[0,mix(c,'#ffffff',.25)],[1,c]]}:c}});
      if(s.inner)o.series=[{name:s.innerName||'Group',size:'45%',innerSize:0,data:pts(s.inner),dataLabels:{distance:-30,style:{color:'#fff',textOutline:'none'},formatter:function(){return this.point.name}},showInLegend:false},{name:s.name||'Detail',size:'78%',innerSize:'62%',data:pts(s.data)}];
      else o.series=[{name:s.name||'Share',data:pts(s.data)}];
      o.tooltip={...o.tooltip,pointFormatter:function(){return `<b>${fmt(this.y,u,1)}</b> · ${this.percentage.toFixed(1)}%`}};
      if(s.donut&&s.center!==false&&!s.inner){const tot=sumOf(s.data.map(d=>d.value));o.title={text:`<span style="font-size:${cfs(s)}px;font-weight:600;color:${T.ink}">${fmt(s.centerValue??tot,cu(u))}</span><br><span style="font-size:12px;color:${T.muted}">${esc(s.centerLabel||'Total')}</span>`,useHTML:false,align:'center',verticalAlign:'middle',y:semi?28:(s._legend&&!s.legendRight?-8:0),floating:true,style:{fontFamily:T.font}}}
      return o;
    }
    if(t==='funnel'){
      const n=s.data.length;o.chart.type='funnel';o.legend.enabled=!!s.legend;
      o.plotOptions.funnel={neckWidth:s.pyramid?'0%':'22%',neckHeight:'0%',width:s.labelsInside?'84%':'62%',center:[s.labelsInside?'50%':'36%','50%'],reversed:false,borderWidth:2,borderColor:T.surface,
        dataLabels:{enabled:true,inside:!!s.labelsInside,softConnector:true,connectorColor:T.axis,style:{textOutline:'none',fontWeight:'600',fontSize:'12px'},formatter:function(){const i=this.point.index;return `${esc(this.point.name)}  ${fmt(this.y,u)}${s.conv&&i?` · ${(this.y/s.data[i-1].value*100).toFixed(0)}%`:''}`}}};
      o.series=[{name:s.name||'Stage',data:s.data.map((d,i)=>{const c=s.pointColor(i,n,d);return {name:d.name,y:d.value,color:c,dataLabels:{color:s.labelsInside?inkOn(c):T.ink2}}})}];
      if(s.pyramid){o.chart.type='pyramid';o.plotOptions.pyramid=o.plotOptions.funnel;}
      o.tooltip={...o.tooltip,pointFormatter:function(){return `<b>${fmt(this.y,u,1)}</b>${this.index?` · ${(this.y/s.data[0].value*100).toFixed(1)}% of first stage`:''}`}};
      return o;
    }
    if(t==='gauge'){
      const mx=s.max||100,c=s.color?T.cat[s.color-1]:T.cat[0],ring=!!s.ring,w=s.thin?'86%':'74%';
      if(s.bands){
        o.chart.type='gauge';o.pane={startAngle:-110,endAngle:110,background:null,center:['50%','62%'],size:'100%'};
        o.yAxis={min:0,max:mx,tickPositions:s.ticks?undefined:[],tickLength:0,minorTickInterval:null,lineWidth:0,labels:{enabled:!!s.ticks,distance:14,style:{color:T.muted,fontSize:'10px'},formatter:function(){return fmt(this.value,u)}},
          plotBands:s.bands.map((b,i)=>({from:i?s.bands[i-1][0]:0,to:b[0],color:T[b[1]],thickness:16}))};
        o.plotOptions.gauge={dial:{radius:'72%',backgroundColor:T.ink,baseWidth:6,topWidth:1},pivot:{backgroundColor:T.ink,radius:5},dataLabels:{y:24,borderWidth:0,useHTML:true,formatter:function(){return `<div style="text-align:center;font-family:${T.font}"><div style="font-size:24px;font-weight:600;color:${T.ink}">${fmt(this.y,u)}</div><div style="font-size:12px;color:${T.muted}">${esc(s.label||'')}</div></div>`}}};
        o.series=[{name:s.label||'Value',data:[s.value]}];return o;
      }
      o.chart.type='solidgauge';
      o.pane={startAngle:ring?0:-110,endAngle:ring?360:110,center:['50%',ring?'50%':'62%'],size:ring?'92%':'110%',background:[{backgroundColor:T.grid,innerRadius:w,outerRadius:'100%',shape:'arc',borderWidth:0}]};
      o.yAxis={min:0,max:mx,lineWidth:0,tickWidth:0,minorTickInterval:null,tickAmount:2,labels:{enabled:!!s.ticks,y:16,style:{color:T.muted}},stops:[[1,c]]};
      o.plotOptions.solidgauge={innerRadius:w,rounded:!s.flat,dataLabels:{y:ring?-18:-26,borderWidth:0,useHTML:true,formatter:function(){return `<div style="text-align:center;font-family:${T.font}"><div style="font-size:${ring?22:26}px;font-weight:600;color:${T.ink}">${fmt(this.y,u)}</div><div style="font-size:12px;color:${T.muted}">${esc(s.label||'')}</div></div>`}}};
      o.series=[{name:s.label||'Value',data:[{y:s.value,color:c}]}];
      o.tooltip={...o.tooltip,pointFormatter:function(){return `<b>${fmt(this.y,u,1)}</b> of ${fmt(mx,u,1)}`}};
      return o;
    }
    if(t==='bullet'){
      const its=s.items,rg=s.ranges||[60,85,120];
      o.chart.type='bullet';o.chart.inverted=true;o.legend.enabled=false;
      o.xAxis={...o.xAxis,categories:its.map(x=>x.name),labels:{style:{color:T.ink2,fontSize:'12px'}}};
      const shades=[mix(T.surface,T.ink,.16),mix(T.surface,T.ink,.10),mix(T.surface,T.ink,.05)];
      o.yAxis={...o.yAxis,max:rg.at(-1),gridLineWidth:0,plotBands:rg.map((r,i)=>({from:i?rg[i-1]:0,to:r,color:shades[i]})),labels:{...o.yAxis.labels,...fy(u)}};
      o.plotOptions.bullet={pointPadding:.25,borderWidth:0,color:T.cat[0],targetOptions:{width:'200%',height:3,color:T.ink,borderWidth:0},dataLabels:{enabled:s.labels!==false,inside:false,align:'left',x:4,formatter:function(){return fmt(this.y,u)},style:{color:T.ink2}}};
      o.series=[{name:s.name||'Actual',data:its.map(x=>({y:x.value,target:x.target}))}];
      o.tooltip={...o.tooltip,pointFormatter:function(){return `Actual: <b>${fmt(this.y,u,1)}</b><br/>Target: <b>${fmt(this.target,u,1)}</b>`}};
      return o;
    }
    if(t==='scatter'||t==='bubble'){
      o.chart.type=t;
      o.xAxis={...o.xAxis,title:{text:s.xName,style:{color:T.muted}},gridLineWidth:1,labels:{...o.xAxis.labels,...fy(s.xUnit)},startOnTick:false,endOnTick:false};
      o.yAxis={...o.yAxis,title:{text:s.yName,style:{color:T.muted}},labels:{...o.yAxis.labels,...fy(s.yUnit)},startOnTick:false,endOnTick:false};
      o.plotOptions.scatter={marker:{radius:s.big?3.5:5.5,symbol:'circle',lineColor:T.surface,lineWidth:1},opacity:.9,dataLabels:{enabled:!!s.labels,format:'{point.name}',y:-8}};
      o.plotOptions.bubble={minSize:10,maxSize:'18%',marker:{fillOpacity:.68,lineColor:T.surface,lineWidth:1},dataLabels:{enabled:!!s.labels,format:'{point.name}',style:{color:T.ink2,textOutline:'none',fontWeight:'600'}}};
      o.series=s.series.map(q=>({name:q.name,color:q.color,marker:{symbol:'circle'},data:q.data.map(d=>{const v=xyOf(d);return {x:v[0],y:v[1],z:v[2],name:d.name}})}));
      if(s.trend){const pts=s.series[0].data.map(xyOf),f=linReg(pts),xs=pts.map(p=>p[0]),a=Math.min(...xs),b=Math.max(...xs);
        o.series.push({type:'line',name:'Trend',data:[[a,f(a)],[b,f(b)]],color:T.ink2,dashStyle:'Dash',lineWidth:1.5,marker:{enabled:false},enableMouseTracking:false})}
      if(s.quadrant){const pts=s.series.flatMap(q=>q.data.map(xyOf)),mx=sumOf(pts.map(p=>p[0]))/pts.length,my=sumOf(pts.map(p=>p[1]))/pts.length;
        o.xAxis.plotLines=[{value:mx,color:T.axis,width:1,label:{text:'avg',style:{color:T.muted}}}];o.yAxis.plotLines=[{value:my,color:T.axis,width:1,label:{text:'avg',style:{color:T.muted}}}]}
      o.tooltip={...o.tooltip,useHTML:true,headerFormat:'',pointFormatter:function(){return `<b>${esc(this.name||this.series.name)}</b><br>${esc(s.xName||'x')}: ${fmt(this.x,s.xUnit||{},1)}<br>${esc(s.yName||'y')}: ${fmt(this.y,s.yUnit||{},1)}${this.z!=null?`<br>${esc(s.zName||'Size')}: ${fmt(this.z,s.zUnit||{},1)}`:''}`}};
      return o;
    }
    if(t==='radar'){
      const mx=Math.max(...s.indicators.map(x=>x.max));
      o.chart.polar=true;o.chart.type=s.filled?'area':'line';
      o.pane={size:'78%'};
      o.xAxis={...o.xAxis,categories:s.indicators.map(x=>x.name),tickmarkPlacement:'on',lineWidth:0,gridLineColor:T.grid,labels:{style:{color:T.ink2,fontSize:'11px'}}};
      o.yAxis={...o.yAxis,gridLineInterpolation:s.circle?'circle':'polygon',lineWidth:0,min:0,max:mx,labels:{enabled:false},gridLineColor:T.grid};
      o.plotOptions.area={fillOpacity:.14,marker:{radius:3}};o.plotOptions.line={marker:{radius:3}};
      o.series=s.series.map(q=>({name:q.name,data:q.data,color:q.color,pointPlacement:'on',dashStyle:q.dashed?'Dash':'Solid',lineWidth:2}));
      o.tooltip={...o.tooltip,shared:true};return o;
    }
    if(t==='heatmap'||t==='tilemap'){
      const tile=t==='tilemap',vals=s.data.map(d=>d[2]).filter(v=>v!=null),mn=s.min??Math.min(...vals),mx=s.max??Math.max(...vals);
      o.chart.type='heatmap';o.legend={...o.legend,enabled:true,align:'center',verticalAlign:'bottom',symbolWidth:160,symbolHeight:10,layout:'horizontal'};
      o.xAxis={...o.xAxis,categories:s.x,lineWidth:0,visible:!tile,labels:{style:{color:T.muted,fontSize:'11px'}}};
      o.yAxis={...o.yAxis,categories:s.y,reversed:true,gridLineWidth:0,visible:!tile,labels:{style:{color:T.muted,fontSize:'11px'}},title:null};
      o.colorAxis={min:mn,max:mx,stops:s.diverging?[[0,T.neg],[.5,T.mid],[1,T.pos]]:T.seq.map((c,i)=>[i/8,c]),labels:{style:{color:T.muted},formatter:function(){return fmt(this.value,s.unit||{})}}};
      o.series=[{name:s.name||'Value',borderWidth:tile?3:2,borderColor:T.surface,borderRadius:tile?4:2,data:s.data.filter(d=>d[2]!=null),
        dataLabels:{enabled:s.labels!==false,style:{textOutline:'none',fontWeight:tile?'600':'400',fontSize:tile?'12px':'10px'},color:undefined,formatter:function(){return tile?`${s.codes?.[this.point.y]?.[this.point.x]||''}<br>${fmt(this.point.value,s.unit||{})}`:fmt(this.point.value,s.unit||{})}}}];
      o.tooltip={...o.tooltip,headerFormat:'',pointFormatter:function(){return `<b>${esc(tile?(s.names?.[this.y]?.[this.x]||''):s.y[this.y]+' · '+s.x[this.x])}</b><br>${fmt(this.value,s.unit||{},1)}`}};
      return o;
    }
    if(t==='treemap'){
      const n=s.data.length,pts=[];
      s.data.forEach((d,i)=>{const c=s.pointColor(i,n,d);if(d.children){pts.push({id:'p'+i,name:d.name,color:c});d.children.forEach((x,j)=>pts.push({parent:'p'+i,name:x.name,value:x.value,color:mix(c,T.surface,j%2?.18:0)}))}else pts.push({name:d.name,value:d.value,color:c})});
      o.series=[{type:'treemap',name:s.name||'All',layoutAlgorithm:'squarified',allowTraversingTree:!!s.drill,animationLimit:1000,borderColor:T.surface,borderWidth:2,
        breadcrumbs:{buttonTheme:{fill:T.surface,style:{color:T.ink2}}},
        dataLabels:{enabled:true,style:{color:'contrast',textOutline:'none',fontWeight:'400',fontSize:'12px'},formatter:function(){return `${esc(this.point.name)}<br><b>${fmt(this.point.value,s.unit||{})}</b>`}},
        levels:[{level:1,dataLabels:{enabled:true,align:'left',verticalAlign:'top',style:{fontWeight:'600',fontSize:'12px',color:'contrast',textOutline:'none'}},borderWidth:3,borderColor:T.surface}],data:pts}];
      o.legend.enabled=false;o.tooltip={...o.tooltip,pointFormatter:function(){return `<b>${esc(this.name)}</b>: ${fmt(this.value,s.unit||{},1)}`}};
      return o;
    }
    if(t==='sankey'){
      const names=[...new Set(s.links.flatMap(l=>[l.source,l.target]))];
      o.series=[{type:'sankey',name:s.name||'Flow',keys:['from','to','weight'],nodeWidth:12,nodePadding:10,linkOpacity:.32,curveFactor:.5,
        nodes:names.map((nm,i)=>({id:nm,color:T.cat[(s.nodeColor&&s.nodeColor[nm]?s.nodeColor[nm]-1:i)%8]})),
        data:s.links.map(l=>[l.source,l.target,l.value]),dataLabels:{style:{color:T.ink2,textOutline:'none',fontWeight:'600',fontSize:'11px'}}}];
      o.legend.enabled=false;o.tooltip={...o.tooltip,pointFormatter:function(){return this.isNode?`<b>${esc(this.name)}</b>: ${fmt(this.sum,s.unit||{},1)}`:`${esc(this.from)} → ${esc(this.to)}: <b>${fmt(this.weight,s.unit||{},1)}</b>`},nodeFormatter:function(){return `<b>${esc(this.name)}</b>: ${fmt(this.sum,s.unit||{},1)}`}};
      return o;
    }
    if(t==='waterfall'){
      o.chart.type='waterfall';o.chart.inverted=!!s.horizontal;o.legend.enabled=false;
      o.xAxis={...o.xAxis,categories:s.categories};
      o.plotOptions.waterfall={upColor:T.pos,color:T.neg,borderWidth:0,borderRadius:2,lineColor:T.axis,dashStyle:'Dot',dataLabels:{enabled:s.labels!==false,formatter:function(){return fmt(this.y,u)},style:{color:T.ink2,textOutline:'none'}}};
      o.series=[{name:s.name||'Change',data:s.categories.map((c,i)=>{const d=s.data[i];return typeof d==='object'&&d&&d.total?{name:c,isIntermediateSum:i<s.categories.length-1,isSum:i===s.categories.length-1,color:T.muted}:{name:c,y:d}})}];
      o.tooltip={...o.tooltip,pointFormatter:function(){return `<b>${fmt(this.y,u,1)}</b>`}};
      return o;
    }
    if(t==='boxplot'){
      o.chart.type='boxplot';o.chart.inverted=!!s.horizontal;o.legend.enabled=!!s.outliers;
      o.xAxis={...o.xAxis,categories:s.categories};
      o.plotOptions.boxplot={fillColor:alpha(T.cat[0],.18),color:T.cat[0],lineWidth:1.5,medianWidth:3,medianColor:T.cat[0],whiskerLength:'40%',whiskerWidth:1.5,stemWidth:1.5,maxPointWidth:36};
      o.series=[{name:s.name||'Distribution',data:s.data}];
      if(s.outliers)o.series.push({type:'scatter',name:'Outliers',color:T.cat[1],data:s.outliers,marker:{radius:3.5,symbol:'circle',lineColor:T.surface,lineWidth:1}});
      o.tooltip={...o.tooltip,pointFormatter:function(){if(this.series.type==='scatter')return `Outlier: <b>${fmt(this.y,u,1)}</b>`;return `Max ${fmt(this.high,u,1)}<br/>Q3 ${fmt(this.q3,u,1)}<br/>Median <b>${fmt(this.median,u,1)}</b><br/>Q1 ${fmt(this.q1,u,1)}<br/>Min ${fmt(this.low,u,1)}`}};
      return o;
    }
    return o;
  }

  /* ================================================================ Chart.js */
  const CJ={name:'Chart.js'};
  CJ.supports=s=>!['candlestick','boxplot','radial'].includes(s.type)&&!(s.type==='pie'&&s.rose)&&!(s.type==='gauge'&&s.bands);
  const cjRef={id:'raRef',afterDatasetsDraw(c,_,o){if(!o||!o.lines)return;const g=c.ctx,a=c.chartArea;
    (o.bands||[]).forEach(b=>{const xs=c.scales.x;const x0=xs.getPixelForValue(b.from)-(xs.width/xs.ticks.length)/2,x1=a.right;g.save();g.fillStyle=b.color;g.fillRect(x0,a.top,x1-x0,a.bottom-a.top);g.fillStyle=b.ink;g.font=`11px ${o.font}`;g.fillText(b.label,x0+6,a.top+14);g.restore()});
    o.lines.forEach(l=>{const sc=c.scales[l.axis||'y'];if(!sc)return;const p=sc.getPixelForValue(l.value);g.save();g.strokeStyle=l.color;g.lineWidth=1.5;g.setLineDash(l.dash?[5,4]:[]);g.beginPath();
      if(l.horizontal){g.moveTo(p,a.top);g.lineTo(p,a.bottom)}else{g.moveTo(a.left,p);g.lineTo(a.right,p)}g.stroke();g.setLineDash([]);g.fillStyle=l.color;g.font=`11px ${o.font}`;g.textAlign='right';
      if(l.horizontal){g.textAlign='left';g.fillText(l.label,p+4,a.top+12)}else g.fillText(l.label,a.right-4,p-5);g.restore()})}};
  const cjLabels={id:'raLabels',afterDatasetsDraw(c,_,o){if(!o||!o.enabled)return;const g=c.ctx;g.save();g.font=`600 11px ${o.font}`;g.fillStyle=o.color;
    const hz=c.options.indexAxis==='y';
    if(o.stackTotal){const meta=c.getSortedVisibleDatasetMetas().filter(m=>m.type==='bar');if(!meta.length){g.restore();return}const last=meta.at(-1);
      last.data.forEach((el,i)=>{const tot=meta.reduce((a,m)=>a+(+c.data.datasets[m.index].data[i]||0),0);g.textAlign=hz?'left':'center';g.textBaseline=hz?'middle':'bottom';g.fillText(o.fmt(tot),hz?el.x+4:el.x,hz?el.y:el.y-4)});g.restore();return}
    c.getSortedVisibleDatasetMetas().forEach(m=>{if(m.type!=='bar'&&!o.points)return;if(o.only!=null&&m.index!==o.only)return;m.data.forEach((el,i)=>{const raw=c.data.datasets[m.index].data[i];const v=Array.isArray(raw)?raw[1]-raw[0]:raw;if(v==null)return;
      if(o.funnel){g.textAlign='left';g.textBaseline='middle';g.fillText(o.fmt(v,i),c.chartArea.left+c.chartArea.width/2+Math.abs(el.x-el.base)/1+8,el.y);return}
      g.textAlign=hz?'left':'center';g.textBaseline=hz?'middle':'bottom';g.fillText(o.fmt(v,i),hz?el.x+4:el.x,hz?el.y:el.y-4)})});g.restore()}};
  const cjCenter={id:'raCenter',afterDraw(c,_,o){if(!o||!o.text)return;const g=c.ctx,m=c.getDatasetMeta(0);if(!m.data[0])return;const {x,y}=m.data[0];g.save();g.textAlign='center';
    g.fillStyle=o.ink;g.font=`600 ${o.size||20}px ${o.font}`;g.fillText(o.text,x,y+(o.semi?-12:2));g.fillStyle=o.muted;g.font=`12px ${o.font}`;g.fillText(o.sub||'',x,y+(o.semi?6:20));g.restore()}};
  CJ.render=function(el,s,T,h){
    const cv=document.createElement('canvas');cv.setAttribute('role','img');cv.setAttribute('aria-label',(s.title||'Chart')+' — use View data for the table');el.appendChild(cv);
    Chart.defaults.font.family=T.font;Chart.defaults.color=T.muted;
    const cfg=cjConfig(s,T);
    cfg.options.onClick=(e,els,c)=>{if(!els.length)return;const p=els[0];const lb=c.data.labels?c.data.labels[p.index]:'';const ds=c.data.datasets[p.datasetIndex];
      h.onSelect({name:(ds.data[p.index]&&ds.data[p.index].name)||(Array.isArray(lb)?lb.join(' '):lb)||'',index:p.index,series:ds.label,value:ds.data[p.index]})};
    cfg.options.onHover=(e,els)=>{e.native&&(e.native.target.style.cursor=els.length?'pointer':'default')};
    const ch=new Chart(cv,cfg);
    return {resize:()=>ch.resize(),dispose:()=>ch.destroy(),
      png:()=>{const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;const g=c.getContext('2d');g.fillStyle=T.surface;g.fillRect(0,0,c.width,c.height);g.drawImage(cv,0,0);return c.toDataURL('image/png')},
      resetZoom:()=>{ch.resetZoom&&ch.resetZoom()}};
  };
  function cjBase(s,T){
    const u=unitOf(s);
    return {options:{responsive:true,maintainAspectRatio:false,animation:{duration:450},layout:{padding:{top:4,right:8,bottom:2,left:2}},interaction:{mode:'index',intersect:false},
      plugins:{legend:{display:s._legend,position:'top',align:'start',labels:{usePointStyle:true,pointStyle:'rectRounded',boxWidth:8,boxHeight:8,color:T.ink2,padding:12,font:{size:12}}},
        tooltip:{enabled:s._tooltip,backgroundColor:T.surface,titleColor:T.ink,bodyColor:T.ink2,borderColor:T.grid,borderWidth:1,padding:10,cornerRadius:4,usePointStyle:true,boxWidth:8,boxHeight:8,titleFont:{weight:'600'},
          callbacks:{label:c=>Array.isArray(c.raw)&&c.chart.config.type==='bar'&&!c.dataset.isWf?` ${c.dataset.label}: ${fmt(c.raw[0],c.dataset.u||u,1)} – ${fmt(c.raw[1],c.dataset.u||u,1)}`:` ${c.dataset.label}: ${fmt(Array.isArray(c.raw)?c.raw[1]-c.raw[0]:(c.raw&&typeof c.raw==='object'?(c.raw.y??c.raw.v):c.raw),c.dataset.u||u,1)}`}}},
      scales:{}},plugins:[cjRef,cjLabels,cjCenter]};
  }
  const cjAx=(T,o={})=>({grid:{color:T.grid,drawTicks:false},border:{color:T.axis,display:true},ticks:{color:T.muted,padding:6,font:{size:11}},...o});
  function cjConfig(s,T){
    const c=cjBase(s,T),u=unitOf(s),t=s.type,O=c.options;
    const zoom=s.zoom?{zoom:{wheel:{enabled:true,modifierKey:'ctrl'},drag:{enabled:true,backgroundColor:alpha(T.cat[0],.12)},pinch:{enabled:true},mode:'x'},pan:{enabled:false}}:undefined;
    if(zoom)O.plugins.zoom=zoom;
    if(isCart(t)){
      const S=s.series,hz=t==='bar',panels=S.some(q=>q.panel===1),stacked=!!s.stack,spark=t==='spark';
      c.type='bar';O.indexAxis=hz?'y':'x';
      const cat=hz?'y':'x',val=hz?'x':'y';
      O.scales[cat]=cjAx(T,{stacked,grid:{display:false},offset:S.some(q=>kind(s,q)==='bar'),display:!spark,reverse:false});
      const vy=(uu,extra={})=>cjAx(T,{stacked:stacked,beginAtZero:s.zero!==false,max:s.max,min:s.min,display:!spark,ticks:{color:T.muted,padding:6,font:{size:11},maxTicksLimit:panels?4:6,callback:v=>fmt(v,uu||{})},...extra});
      if(panels){O.scales.y=vy(u,{stack:'p',stackWeight:1,offset:true,title:{display:!!s.panelNames,text:s.panelNames?.[0]||'',color:T.muted}});O.scales.y2=vy(s.unit2,{stack:'p',stackWeight:1,offset:true,stacked:false,title:{display:!!s.panelNames,text:s.panelNames?.[1]||'',color:T.muted}});O.scales.y.stacked=stacked}
      else O.scales[val]=vy(u);
      c.data={labels:s.categories,datasets:S.map(q=>{const k=kind(s,q),gi=panels&&q.panel===1;
        if(k==='bar')return {type:'bar',label:q.name,data:q.data,u:gi?s.unit2:u,yAxisID:gi?'y2':(hz?undefined:'y'),backgroundColor:q.colors||(q.ghost?alpha(q.color,.45):q.color),borderRadius:s.flat?0:(stacked?2:4),borderSkipped:'start',borderColor:T.surface,borderWidth:stacked?{top:1,right:0,bottom:0,left:0}:0,
          maxBarThickness:s.type==='histogram'?undefined:(hz?22:28),categoryPercentage:s.type==='histogram'?1:.72,barPercentage:s.type==='histogram'?.97:.86,stack:stacked&&!q.nostack?'s':(q.stack||undefined),order:2};
        const area=k==='area'||k==='range';
        const ds={type:'line',label:q.name,u:gi?s.unit2:u,yAxisID:gi?'y2':'y',borderColor:q.color,backgroundColor:area?(s.gradient||spark?(ctx=>{const a=ctx.chart.chartArea;if(!a)return alpha(q.color,.14);const g=ctx.chart.ctx.createLinearGradient(0,a.top,0,a.bottom);g.addColorStop(0,alpha(q.color,.32));g.addColorStop(1,alpha(q.color,0));return g}):alpha(q.color,stacked?.55:.14)):q.color,
          data:k==='range'?q.data.map(d=>d?d[1]:null):q.data,borderWidth:spark?1.5:2,pointRadius:s.symbols?3:0,pointHoverRadius:5,pointBackgroundColor:q.color,pointBorderColor:T.surface,tension:s.smooth||q.smooth?.35:0,stepped:q.step?'before':false,borderDash:q.dashed?[6,4]:[],
          fill:k==='range'?'+1':area?(stacked?(S.indexOf(q)===0?'origin':'-1'):'origin'):false,stack:stacked&&area?'a':undefined,order:1,spanGaps:false};
        return ds;}).flatMap((d,i)=>{const q=S[i];if(kind(s,q)!=='range')return [d];return [d,{type:'line',label:'_lo',data:q.data.map(x=>x?x[0]:null),borderWidth:0,pointRadius:0,fill:false,order:1}]})};
      if(stacked&&S.some(q=>kind(s,q)==='area'))O.scales[val].stacked=true;
      O.plugins.legend.labels.filter=it=>!it.text.startsWith('_');
      O.plugins.tooltip.filter=it=>!it.dataset.label.startsWith('_');
      const lines=[];
      if(s.target)lines.push({value:s.target.value,color:T.ink2,dash:true,horizontal:hz,axis:hz?'x':'y',label:`${s.target.label||'Target'} ${fmt(s.target.value,u)}`});
      if(s.threshold)lines.push({value:s.threshold.value,color:T.crit,horizontal:hz,axis:hz?'x':'y',label:`${s.threshold.label||'Threshold'} ${fmt(s.threshold.value,u)}`});
      O.plugins.raRef={lines,font:T.font,bands:s.forecastFrom!=null?[{from:s.forecastFrom,color:alpha(T.ink,.05),ink:T.muted,label:'Forecast'}]:[]};
      if(s.labels&&s.labels!=='end')O.plugins.raLabels={enabled:true,font:T.font,color:T.ink2,stackTotal:stacked,fmt:v=>fmt(v,u)};
      if(s.labels==='end'){O.layout.padding.right=96;O.plugins.raLabels={enabled:true,font:T.font,color:T.ink2,points:true,fmt:(v,i)=>i===s.categories.length-1?fmt(v,u):''}}
      if(spark){O.plugins.legend.display=false;O.layout.padding=2}
      if(S.every(q=>kind(s,q)!=='bar'))c.data.datasets.forEach(d=>d.type='line');
      return c;
    }
    if(t==='pie'||t==='polar'){
      const semi=!!s.semi,n=s.data.length,cols=arr=>arr.map((d,i)=>s.pointColor(i,arr.length,d));
      if(t==='polar'){c.type='polarArea';c.data={labels:s.data.map(d=>d.name),datasets:[{label:s.name||'Value',data:s.data.map(d=>d.value),backgroundColor:cols(s.data).map(x=>alpha(x,.85)),borderColor:T.surface,borderWidth:2}]};
        O.scales.r={grid:{color:T.grid},angleLines:{color:T.grid},ticks:{display:false,backdropColor:'transparent'},pointLabels:{display:true,centerPointLabels:true,color:T.ink2,font:{size:11}}};O.interaction={mode:'nearest',intersect:true};O.plugins.legend.display=false;
        O.plugins.tooltip.callbacks.label=x=>` ${fmt(x.raw,u,1)}`;return c}
      c.type='doughnut';
      const sets=[{label:s.name||'Share',data:s.data.map(d=>d.value),backgroundColor:cols(s.data),borderColor:T.surface,borderWidth:2,borderRadius:s.flat?0:3,offset:s.data.map((_,i)=>s.explode===i?14:0),hoverOffset:8}];
      if(s.inner)sets.push({label:s.innerName||'Group',data:s.inner.map(d=>d.value),backgroundColor:cols(s.inner),borderColor:T.surface,borderWidth:2,weight:.8});
      c.data={labels:s.data.map(d=>d.name),datasets:sets};
      O.cutout=s.inner?'30%':(s.donut?'60%':0);O.rotation=semi?-90:0;O.circumference=semi?180:360;O.interaction={mode:'nearest',intersect:true};
      O.plugins.legend={...O.plugins.legend,display:s._legend,position:s.legendRight?'right':'bottom',align:'center'};
      if(s.inner)O.plugins.legend.labels.generateLabels=ch=>Chart.defaults.plugins.legend.labels.generateLabels(ch);
      O.plugins.tooltip.callbacks={label:x=>{const arr=x.datasetIndex?s.inner:s.data;const tot=sumOf(arr.map(d=>d.value));return ` ${x.datasetIndex?arr[x.dataIndex].name+': ':''}${fmt(x.raw,u,1)} · ${(x.raw/tot*100).toFixed(1)}%`}};
      if(s.donut&&s.center!==false&&!s.inner)O.plugins.raCenter={text:fmt(s.centerValue??sumOf(s.data.map(d=>d.value)),cu(u)),sub:s.centerLabel||'Total',ink:T.ink,muted:T.muted,font:T.font,semi,size:cfs(s)};
      if(semi)O.layout.padding={top:4,bottom:0};
      return c;
    }
    if(t==='funnel'){
      const n=s.data.length,cols=s.data.map((d,i)=>s.pointColor(i,n,d));
      c.type='bar';O.indexAxis='y';
      c.data={labels:s.data.map(d=>d.name),datasets:[{label:s.name||'Stage',data:s.data.map(d=>[-d.value/2,d.value/2]),backgroundColor:cols,borderRadius:2,borderSkipped:false,categoryPercentage:1,barPercentage:.94}]};
      const mx=s.data[0].value/2;
      O.scales={x:{display:false,min:-mx,max:mx*(s.labelsInside?1:1.9)},y:cjAx(T,{grid:{display:false},border:{display:false},ticks:{color:T.ink2,font:{size:12}}})};
      O.plugins.legend.display=false;O.plugins.raLabels={enabled:true,funnel:true,font:T.font,color:T.ink2,fmt:(v,i)=>`${fmt(v,u)}${s.conv&&i?` · ${(v/s.data[i-1].value*100).toFixed(0)}%`:''}`};
      O.plugins.tooltip.callbacks.label=x=>{const v=x.raw[1]-x.raw[0];return ` ${fmt(v,u,1)}${x.dataIndex?` · ${(v/s.data[0].value*100).toFixed(1)}% of first stage`:''}`};
      return c;
    }
    if(t==='gauge'){
      const mx=s.max||100,col=s.color?T.cat[s.color-1]:T.cat[0],ring=!!s.ring;
      c.type='doughnut';c.data={labels:[s.label||'Value','Remaining'],datasets:[{data:[s.value,Math.max(0,mx-s.value)],backgroundColor:[col,T.grid],borderWidth:0,borderRadius:s.flat?0:[8,0]}]};
      O.cutout=s.thin?'86%':'74%';O.rotation=ring?0:-110;O.circumference=ring?360:220;O.plugins.legend.display=false;O.interaction={mode:'nearest',intersect:true};
      O.plugins.tooltip.callbacks.label=x=>x.dataIndex?` Remaining: ${fmt(x.raw,u,1)}`:` ${fmt(x.raw,u,1)} of ${fmt(mx,u,1)}`;
      O.plugins.raCenter={text:fmt(s.value,u),sub:s.label||'',ink:T.ink,muted:T.muted,font:T.font,size:ring?22:26,semi:false};
      return c;
    }
    if(t==='bullet'){
      const its=s.items,rg=s.ranges||[60,85,120],shades=[mix(T.surface,T.ink,.16),mix(T.surface,T.ink,.10),mix(T.surface,T.ink,.05)];
      c.type='bar';O.indexAxis='y';
      c.data={labels:its.map(x=>x.name),datasets:[
        ...rg.map((r,i)=>({label:'_r'+i,data:its.map(()=>r-(i?rg[i-1]:0)),backgroundColor:shades[i],stack:'r',grouped:false,barPercentage:.9,categoryPercentage:.9,order:3})),
        {label:s.name||'Actual',data:its.map(x=>x.value),backgroundColor:T.cat[0],stack:'v',grouped:false,barPercentage:.34,categoryPercentage:.9,borderRadius:3,order:2},
        {type:'line',label:'Target',data:its.map(x=>x.target),showLine:false,pointStyle:'line',pointRadius:11,pointHoverRadius:11,pointRotation:90,borderColor:T.ink,borderWidth:3,order:1}]};
      O.scales={x:cjAx(T,{stacked:true,max:rg.at(-1),grid:{display:false},ticks:{color:T.muted,callback:v=>fmt(v,u)}}),y:cjAx(T,{stacked:true,grid:{display:false},border:{display:false},ticks:{color:T.ink2}})};
      O.plugins.legend.display=false;O.plugins.tooltip.filter=it=>!it.dataset.label.startsWith('_');
      O.plugins.raLabels={enabled:s.labels!==false,font:T.font,color:T.ink2,only:rg.length,fmt:v=>fmt(v,u)};
      return c;
    }
    if(t==='scatter'||t==='bubble'){
      const zs=s.series.flatMap(q=>q.data.map(d=>xyOf(d)[2]||0)),zmax=Math.max(1,...zs);
      c.type=t;
      c.data={datasets:s.series.map(q=>({label:q.name,data:q.data.map(d=>{const v=xyOf(d);return {x:v[0],y:v[1],r:t==='bubble'?4+Math.sqrt((v[2]||0)/zmax)*19:undefined,z:v[2],name:d.name}}),backgroundColor:alpha(q.color,t==='bubble'?.68:.88),borderColor:T.surface,borderWidth:1,pointRadius:s.big?3:5,pointHoverRadius:s.big?5:7}))};
      if(s.trend){const pts=s.series[0].data.map(xyOf),f=linReg(pts),xs=pts.map(p=>p[0]),a=Math.min(...xs),b=Math.max(...xs);c.data.datasets.push({type:'line',label:'Trend',data:[{x:a,y:f(a)},{x:b,y:f(b)}],borderColor:T.ink2,borderDash:[6,4],borderWidth:1.5,pointRadius:0})}
      O.scales={x:cjAx(T,{type:'linear',title:{display:!!s.xName,text:s.xName,color:T.muted},ticks:{color:T.muted,callback:v=>fmt(v,s.xUnit||{})}}),y:cjAx(T,{title:{display:!!s.yName,text:s.yName,color:T.muted},ticks:{color:T.muted,callback:v=>fmt(v,s.yUnit||{})}})};
      O.interaction={mode:'nearest',intersect:true};
      if(s.quadrant){const pts=s.series.flatMap(q=>q.data.map(xyOf)),mx=sumOf(pts.map(p=>p[0]))/pts.length,my=sumOf(pts.map(p=>p[1]))/pts.length;O.plugins.raRef={font:T.font,lines:[{value:my,color:T.axis,label:'avg'},{value:mx,color:T.axis,horizontal:true,axis:'x',label:'avg'}]}}
      if(zoom)O.plugins.zoom.zoom.mode='xy';
      O.plugins.tooltip.callbacks={title:x=>x[0]&&(x[0].raw.name||x[0].dataset.label),label:x=>[` ${s.xName||'x'}: ${fmt(x.raw.x,s.xUnit||{},1)}`,` ${s.yName||'y'}: ${fmt(x.raw.y,s.yUnit||{},1)}`,...(x.raw.z!=null?[` ${s.zName||'Size'}: ${fmt(x.raw.z,s.zUnit||{},1)}`]:[])]};
      return c;
    }
    if(t==='radar'){
      c.type='radar';c.data={labels:s.indicators.map(x=>x.name),datasets:s.series.map(q=>({label:q.name,data:q.data,borderColor:q.color,backgroundColor:s.filled?alpha(q.color,.14):'transparent',fill:!!s.filled,borderWidth:2,pointRadius:2.5,pointBackgroundColor:q.color,borderDash:q.dashed?[6,4]:[]}))};
      O.scales={r:{min:0,max:Math.max(...s.indicators.map(x=>x.max)),grid:{color:T.grid,circular:!!s.circle},angleLines:{color:T.grid},ticks:{display:false,backdropColor:'transparent'},pointLabels:{color:T.ink2,font:{size:11}}}};
      O.interaction={mode:'index',intersect:false};return c;
    }
    if(t==='heatmap'||t==='tilemap'){
      const tile=t==='tilemap',vals=s.data.map(d=>d[2]).filter(v=>v!=null),mn=s.min??Math.min(...vals),mx=s.max??Math.max(...vals);
      const col=v=>s.diverging?divColor(T,v/Math.max(Math.abs(mn),Math.abs(mx))):seqColor(T,(v-mn)/((mx-mn)||1));
      c.type='matrix';
      c.data={datasets:[{label:s.name||'Value',data:s.data.filter(d=>d[2]!=null).map(d=>({x:s.x[d[0]],y:s.y[d[1]],v:d[2],code:s.codes?.[d[1]]?.[d[0]],nm:s.names?.[d[1]]?.[d[0]]})),
        backgroundColor:x=>x.raw?col(x.raw.v):'transparent',borderColor:T.surface,borderWidth:tile?3:2,borderRadius:tile?4:2,
        width:({chart})=>((chart.chartArea||{}).width||0)/s.x.length-1,height:({chart})=>((chart.chartArea||{}).height||0)/s.y.length-1}]};
      O.scales={x:{type:'category',labels:s.x,offset:true,display:!tile,grid:{display:false},border:{display:false},ticks:{color:T.muted,font:{size:11}}},y:{type:'category',labels:s.y,offset:true,display:!tile,grid:{display:false},border:{display:false},ticks:{color:T.muted,font:{size:11}}}};
      O.plugins.legend.display=false;O.interaction={mode:'nearest',intersect:true};
      O.plugins.tooltip.callbacks={title:x=>tile?x[0].raw.nm:`${x[0].raw.y} · ${x[0].raw.x}`,label:x=>` ${fmt(x.raw.v,s.unit||{},1)}`};
      c.plugins.push({id:'raCells',afterDatasetsDraw(ch){if(s.labels===false)return;const g=ch.ctx,m=ch.getDatasetMeta(0);g.save();g.textAlign='center';g.textBaseline='middle';
        m.data.forEach((el,i)=>{const r=ch.data.datasets[0].data[i],bg=col(r.v);if(el.width<26||el.height<16)return;g.fillStyle=inkOn(bg);
          if(tile){g.font=`600 12px ${T.font}`;g.fillText(r.code||'',el.x+el.width/2,el.y+el.height/2-7);g.font=`11px ${T.font}`;g.fillText(fmt(r.v,s.unit||{}),el.x+el.width/2,el.y+el.height/2+8)}
          else{g.font=`10px ${T.font}`;g.fillText(fmt(r.v,s.unit||{}),el.x+el.width/2,el.y+el.height/2)}});g.restore()}});
      return c;
    }
    if(t==='treemap'){
      const n=s.data.length,nested=!!s.data[0].children,tree=[];const gcol={};
      s.data.forEach((d,i)=>{gcol[d.name]=s.pointColor(i,n,d);if(nested)d.children.forEach(x=>tree.push({group:d.name,name:x.name,value:x.value}));else tree.push({group:d.name,name:d.name,value:d.value})});
      c.type='treemap';
      c.data={datasets:[{label:s.name||'All',tree,key:'value',groups:nested?['group','name']:['name'],spacing:1,borderWidth:2,borderColor:T.surface,
        backgroundColor:x=>{if(x.type!=='data')return 'transparent';const d=x.raw._data;const g=d.group||(d.children&&d.children[0]&&d.children[0].group)||d.name;return gcol[g]||T.cat[0]},
        labels:{display:true,color:x=>{const d=x.raw&&x.raw._data;const g=d&&(d.group||d.name);return inkOn(gcol[g]||T.cat[0])},font:{size:11},formatter:x=>{const d=x.raw._data;return [d.name||d.group,fmt(x.raw.v,s.unit||{})]}},
        captions:{display:nested,color:x=>{const d=x.raw&&x.raw._data;return inkOn(gcol[d&&d.group]||T.cat[0])},font:{size:12,weight:'600'}}}]};
      O.plugins.legend.display=false;O.interaction={mode:'nearest',intersect:true};
      O.plugins.tooltip.callbacks={title:x=>{const d=x[0].raw._data;return [d.group,d.name].filter((v,i,a)=>v&&a.indexOf(v)===i).join(' › ')},label:x=>` ${fmt(x.raw.v,s.unit||{},1)}`};
      return c;
    }
    if(t==='sankey'){
      const names=[...new Set(s.links.flatMap(l=>[l.source,l.target]))],nc=nm=>T.cat[(s.nodeColor&&s.nodeColor[nm]?s.nodeColor[nm]-1:names.indexOf(nm))%8];
      c.type='sankey';
      c.data={datasets:[{label:s.name||'Flow',data:s.links.map(l=>({from:l.source,to:l.target,flow:l.value})),colorFrom:x=>alpha(nc(x.dataset.data[x.dataIndex].from),.55),colorTo:x=>alpha(nc(x.dataset.data[x.dataIndex].to),.55),colorMode:'gradient',
        color:T.ink2,borderWidth:0,nodeWidth:12,size:'max',font:{size:11}}]};
      O.plugins.legend.display=false;O.interaction={mode:'nearest',intersect:true};
      O.plugins.tooltip.callbacks={label:x=>{const r=x.raw;return ` ${r.from} → ${r.to}: ${fmt(r.flow,s.unit||{},1)}`}};
      O.layout.padding={right:8,left:4,top:4,bottom:4};
      return c;
    }
    if(t==='waterfall'){
      const w=waterfall(s),hz=!!s.horizontal;
      c.type='bar';O.indexAxis=hz?'y':'x';
      c.data={labels:s.categories,datasets:[{label:'Change',data:w.map(x=>[x.start,x.end]),backgroundColor:w.map(x=>x.kind==='total'?T.muted:x.kind==='up'?T.pos:T.neg),borderRadius:2,borderSkipped:false,maxBarThickness:36}]};
      O.scales={[hz?'y':'x']:cjAx(T,{grid:{display:false}}),[hz?'x':'y']:cjAx(T,{ticks:{color:T.muted,callback:v=>fmt(v,u)}})};
      O.plugins.legend.display=false;
      O.plugins.tooltip.callbacks.label=x=>{const r=w[x.dataIndex];return r.kind==='total'?` Total: ${fmt(r.value,u,1)}`:[` Change: ${fmt(r.value,u,1)}`,` Running total: ${fmt(r.end,u,1)}`]};
      if(s.labels!==false)O.plugins.raLabels={enabled:true,font:T.font,color:T.ink2,fmt:(v,i)=>fmt(w[i].kind==='down'?-Math.abs(v):w[i].value,u)};
      return c;
    }
    return c;
  }

  const ADAPTERS={echarts:EC,highcharts:HC,chartjs:CJ};

  /* ================================================================ data grid for View data / CSV */
  function grid(s){
    const u=unitOf(s),t=s.type,F=(v,uu)=>fmt(v,uu||u,1);
    if(isCart(t)){const h=[s.xName||'Category',...s.series.map(q=>q.name)];return [h,s.categories.map((c,i)=>[c,...s.series.map(q=>{const v=q.data[i];return Array.isArray(v)?`${F(v[0],q.panel===1?s.unit2:u)} – ${F(v[1],q.panel===1?s.unit2:u)}`:F(v,q.panel===1?s.unit2:u)})])]}
    if(['pie','funnel','polar'].includes(t)){const tot=sumOf(s.data.map(d=>d.value));return [[s.dimName||'Category',s.name||'Value','Share'],[...s.data.map(d=>[d.name,F(d.value),(d.value/tot*100).toFixed(1)+'%']),...(s.inner?s.inner.map(d=>[`${s.innerName||'Group'}: ${d.name}`,F(d.value),'']):[])]]}
    if(t==='scatter'||t==='bubble')return [['Series','Point',s.xName||'x',s.yName||'y',...(t==='bubble'?[s.zName||'Size']:[])],s.series.flatMap(q=>q.data.map((d,i)=>{const v=xyOf(d);return [q.name,d.name||`#${i+1}`,fmt(v[0],s.xUnit||{},1),fmt(v[1],s.yUnit||{},1),...(t==='bubble'?[fmt(v[2],s.zUnit||{},1)]:[])]}))];
    if(t==='radar')return [['Measure',...s.series.map(q=>q.name)],s.indicators.map((x,i)=>[x.name,...s.series.map(q=>F(q.data[i]))])];
    if(t==='heatmap'||t==='tilemap')return [[t==='tilemap'?'Location':'Row','Column','Value'],s.data.filter(d=>d[2]!=null).map(d=>t==='tilemap'?[s.names?.[d[1]]?.[d[0]]||'',s.codes?.[d[1]]?.[d[0]]||'',F(d[2],s.unit)]:[s.y[d[1]],s.x[d[0]],F(d[2],s.unit)])];
    if(t==='treemap')return [['Group','Item','Value'],s.data.flatMap(d=>d.children?d.children.map(x=>[d.name,x.name,F(x.value,s.unit)]):[[d.name,'',F(d.value,s.unit)]])];
    if(t==='sankey')return [['From','To','Value'],s.links.map(l=>[l.source,l.target,F(l.value,s.unit)])];
    if(t==='waterfall'){const w=waterfall(s);return [['Step','Change','Running total'],w.map(x=>[x.name,x.kind==='total'?'—':F(x.value),F(x.end)])]}
    if(t==='boxplot')return [['Category','Min','Q1','Median','Q3','Max'],s.categories.map((c,i)=>[c,...s.data[i].map(v=>F(v))])];
    if(t==='candlestick')return [['Date','Open','Close','Low','High'],s.categories.map((c,i)=>[c,...s.data[i].map(v=>F(v))])];
    if(t==='gauge')return [['Measure','Value','Maximum'],[[s.label||'Value',F(s.value),F(s.max||100)]]];
    if(t==='radial')return [['Item','Value','Maximum'],s.items.map(x=>[x.name,F(x.value),F(s.max||100)])];
    if(t==='bullet')return [['Measure','Actual','Target'],s.items.map(x=>[x.name,F(x.value),F(x.target)])];
    return [['Value'],[]];
  }
  const TYPE_NAME={column:'Column chart',bar:'Bar chart',line:'Line chart',area:'Area chart',combo:'Combo chart',histogram:'Histogram',spark:'Sparkline',pie:'Pie chart',funnel:'Funnel chart',polar:'Polar area chart',gauge:'Gauge',radial:'Radial bar chart',bullet:'Bullet chart',scatter:'Scatter chart',bubble:'Bubble chart',radar:'Radar chart',heatmap:'Heatmap',tilemap:'Tile map',treemap:'Treemap',sankey:'Sankey diagram',waterfall:'Waterfall chart',boxplot:'Box plot',candlestick:'Candlestick chart'};

  /* ================================================================ chart card */
  const cards=[];
  const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const c=e.target._card;c.seen=true;io.unobserve(e.target);c.render()}}),{rootMargin:'300px 0px'}):null;
  class Card{
    constructor(el){
      this.el=el;el._card=this;
      this.cc=el.closest('.cc');if(this.cc)this.cc._card=this;
      const js=el.querySelector('script[type="application/json"]');
      this.base=js?JSON.parse(js.textContent):{};this.ov={};this.drill=[];this.h=null;this.seen=!io;
      this.plot=document.createElement('div');this.plot.className='chart__plot';el.appendChild(this.plot);
      this.id=el.id||this.cc?.id||('c'+cards.length);
      let rt;new ResizeObserver(()=>{clearTimeout(rt);rt=setTimeout(()=>this.h&&this.h.resize(),60)}).observe(el);
      if(io)io.observe(el);else this.render();
    }
    get forced(){const f=this.el.closest('[data-engine]');return f?f.dataset.engine:null}
    get engine(){return this.forced||RA.engine}
    spec(){
      let s={...this.base,...this.ov};
      this.drill.forEach(k=>{const d=(s.drill||{})[k];if(d)s={...s,...d,drill:d.drill,title:(s.title||'')+' › '+k,highlight:undefined,dim:undefined}});
      if(s.dim&&RA.filters[s.dim]&&s.categories){const i=s.categories.indexOf(RA.filters[s.dim]);if(i>=0)s.highlight=i}
      if(s.dim&&RA.filters[s.dim]&&s.data&&Array.isArray(s.data)&&s.type==='pie'){const i=s.data.findIndex(d=>d.name===RA.filters[s.dim]);if(i>=0)s.explode=i}
      return s;
    }
    factor(){if(this.base.vary===false)return 1;const f={...RA.filters};if(this.base.dim)delete f[this.base.dim];if(f.range==='Last 30 days')delete f.range;Object.keys(f).forEach(k=>{if(!f[k])delete f[k]});
      const k=Object.keys(f);if(!k.length)return 1;return .72+(RA.hash(JSON.stringify(f)+'|'+this.id)%1000)/1000*.46}
    async render(){
      if(!this.seen)return;
      const s0=this.spec(),want=this.engine;let use=want,fb=false;
      if(!ADAPTERS[want].supports(s0)){use='echarts';fb=true}
      const tok=this.tok=Symbol();
      try{await RA.loadEngine(use)}catch(e){this.fail('The '+RA.ENGINES[use].name+' library could not be loaded.');return}
      if(tok!==this.tok)return;
      this.dispose();this.plot.innerHTML='';
      const T=theme(this.el),s=prep(s0,T,this.factor());s._w=this.plot.clientWidth;s._h=this.plot.clientHeight;this.prepared=s;this.used=use;
      try{this.h=ADAPTERS[use].render(this.plot,s,T,{onSelect:p=>this.select(p)})}
      catch(e){console.error(e);RA.emit('ra:chart-error',{id:this.id,e});document.documentElement.dataset.errors=(document.documentElement.dataset.errors?document.documentElement.dataset.errors+' | ':'')+`${this.id}/${use}: ${e.message} ${(e.stack||'').split(/\n/).slice(1,3).map(x=>x.trim()).join(' ')}`;this.fail('This chart could not be drawn with '+RA.ENGINES[use].name+'.');}
      const b=this.cc&&this.cc.querySelector('.eng');
      if(b){b.dataset.e=use;b.classList.toggle('is-fb',fb);b.innerHTML=`<i></i>${RA.ENGINES[use].name}${fb?' · fallback':''}`;
        b.title=fb?`${RA.ENGINES[want].name} has no native ${TYPE_NAME[s0.type]||s0.type}${s0.type==='pie'&&s0.rose?' (rose)':''}; drawn with ECharts instead.`:`Drawn with ${RA.ENGINES[use].name}`}
      this.drawDrill();
    }
    fail(msg){this.dispose();this.plot.innerHTML=`<div class="cc__err"><div>${ic('error_circle')}<p style="margin:6px 0">${esc(msg)}</p><button type="button" class="btn btn--s" data-cc-retry>Retry</button></div></div>`}
    dispose(){if(this.h){try{this.h.dispose()}catch(e){}this.h=null}}
    busy(ms=450){if(!this.cc){this.render();return}this.cc.classList.add('is-busy');clearTimeout(this.bt);this.bt=setTimeout(()=>{this.render().then(()=>this.cc.classList.remove('is-busy'))},ms)}
    select(p){
      const s=this.spec();
      if(s.drill&&s.drill[p.name]){this.drill.push(p.name);this.render();RA.toast(`Drilled into ${p.name}`,{icon:'zoom_in',text:'Use the breadcrumb above the chart to go back.'});return}
      if(s.dim&&!this.drill.length){const cur=RA.filters[s.dim];RA.setFilter(s.dim,cur===p.name?null:p.name,{source:this.id});
        RA.toast(cur===p.name?`${RA.label(s.dim)} filter cleared`:`Cross-filter: ${RA.label(s.dim)} = ${p.name}`,{icon:'filter',text:cur===p.name?'All charts show every '+s.dim+' again.':'Other charts on this page now show this slice.'});return}
      const sel=this.cc&&this.cc.querySelector('.cc__sel');
      if(sel){const v=p.value&&typeof p.value==='object'?(Array.isArray(p.value)?p.value.at(-1):p.value.y??p.value.value):p.value;sel.textContent=`Selected: ${p.name||p.series}${p.series&&p.name&&s.series&&s.series.length>1?' · '+p.series:''}${v!=null&&!Number.isNaN(+v)?' — '+fmt(+v,unitOf(s),1):''}`}
    }
    drawDrill(){
      if(!this.cc)return;let d=this.cc.querySelector('.drill');
      if(!this.drill.length){d&&d.remove();return}
      if(!d){d=document.createElement('div');d.className='drill';this.el.before(d)}
      d.innerHTML=`<button type="button" data-drill-to="0">${ic('arrow_up','ic--s')}All</button>`+this.drill.map((k,i)=>`<span>›</span>`+(i<this.drill.length-1?`<button type="button" data-drill-to="${i+1}">${esc(k)}</button>`:`<b>${esc(k)}</b>`)).join('');
    }
    viewData(){const s=prep(this.spec(),theme(this.el),this.factor()),[h,r]=grid(s);
      const m=RA.modal({title:(this.title()||'Chart')+' — data',wide:true,body:`<p class="muted" style="font:var(--t-cap)">${esc(TYPE_NAME[s.type]||s.type)} · ${r.length} rows · sample data${RA.seed()?' · filtered':''}</p><div class="dt" style="--dt-min:0;--dt-h:60vh"><div class="dt__wrap"><table><thead><tr>${h.map((c,i)=>`<th${i?' class="n"':''} scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${r.map(row=>`<tr>${row.map((c,i)=>`<td${i?' class="n"':''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`,
        footer:`<button class="btn" data-dl>${ic('arrow_download')}Download CSV</button><button class="btn btn--primary" data-close>Close</button>`});
      m.el.querySelector('[data-dl]').onclick=()=>this.exportCsv()}
    exportCsv(){const s=prep(this.spec(),theme(this.el),this.factor()),[h,r]=grid(s);RA.download(RA.slug(this.title())+'.csv',RA.csv([h,...r]),'text/csv');RA.toast('CSV downloaded',{kind:'ok',text:RA.slug(this.title())+'.csv'})}
    exportPng(){if(!this.h)return;const d=this.h.png();if(d)RA.download(RA.slug(this.title())+'.png',d);RA.toast('PNG exported',{kind:'ok',text:`Rendered by ${RA.ENGINES[this.used].name}`})}
    title(){return this.base.title||(this.cc&&this.cc.querySelector('h3')?.textContent)||'chart'}
    full(on){const c=this.cc;if(!c)return;on=on??!c.classList.contains('is-full');
      if(on){this.ph=document.createComment('ph');c.before(this.ph);document.body.appendChild(c);const sc=document.createElement('div');sc.className='full-scrim';sc.onclick=()=>this.full(false);c.before(sc);this.scrim=sc;c.classList.add('is-full');c.setAttribute('role','dialog');c.setAttribute('aria-modal','true');
        const b=c.querySelector('[data-cc-full]');if(b){b.setAttribute('aria-label','Exit full screen');b.innerHTML=ic('full_screen_minimize')}b&&b.focus()}
      else{c.classList.remove('is-full');c.removeAttribute('role');c.removeAttribute('aria-modal');this.scrim&&this.scrim.remove();if(this.ph){this.ph.replaceWith(c);this.ph=null}
        const b=c.querySelector('[data-cc-full]');if(b){b.setAttribute('aria-label','Full screen');b.innerHTML=ic('full_screen_maximize');b.focus()}}
      setTimeout(()=>this.h&&this.h.resize(),30)}
    details(){
      const s=this.spec(),p=prep(s,theme(this.el),this.factor()),T=theme(this.el);
      const cartTypes=[['column','Column'],['bar','Bar'],['line','Line'],['area','Area']],pieTypes=[['pie','Pie'],['donut','Donut'],['semi','Semi-donut']];
      const curType=s.type==='pie'?(s.semi?'semi':s.donut?'donut':'pie'):s.type;
      const typeOpts=isCart(s.type)&&s.type!=='combo'&&s.type!=='spark'?cartTypes:s.type==='pie'?pieTypes:null;
      const used=p.series?p.series.map(q=>q.color):(p.data||p.items||[]).slice?.(0,8).map((d,i)=>p.pointColor(i,(p.data||p.items).length,d))||[];
      const metrics=s.metric||(s.series?s.series.map(q=>q.name).join(', '):s.name||'Value');
      const f=Object.entries(RA.filters).filter(([k,v])=>v).map(([k,v])=>`${RA.label(k)}: ${v}`).join(' · ')||'None';
      const sw=(lbl,key,on)=>`<label class="switch"><input type="checkbox" data-dk="${key}"${on?' checked':''}><span>${lbl}</span></label>`;
      const d=RA.drawer({title:'Chart details',body:`
        <div class="dgrp"><h3>${esc(this.title())}</h3><p class="muted" style="font:var(--t-cap)">${esc(this.cc?.querySelector('.card__t p')?.textContent||'')}</p></div>
        <div class="dgrp"><dl class="kv"><dt>Chart type</dt><dd>${esc(TYPE_NAME[s.type]||s.type)}</dd><dt>Engine</dt><dd>${esc(RA.ENGINES[this.used||this.engine].name)}${this.used!==this.engine?' (fallback)':''}</dd><dt>Data source</dt><dd>${esc(s.source||'Sample ERP dataset')}</dd><dt>Metrics</dt><dd>${esc(metrics)}</dd><dt>Dimensions</dt><dd>${esc(s.dimName||s.xName||(s.dim?RA.label(s.dim):'Category'))}${s.dim?' · cross-filters the page':''}</dd><dt>Filters</dt><dd>${esc(f)}</dd><dt>Sort</dt><dd>${esc(s.sort==='desc'?'Value, descending':s.sort==='asc'?'Value, ascending':'Natural order')}</dd><dt>Aggregation</dt><dd>${esc(s.agg||'Sum')}</dd></dl></div>
        ${typeOpts?`<div class="dgrp"><h3>Display</h3><div class="field"><label for="dk-type">Chart type</label><select class="select" id="dk-type" data-dk="type">${typeOpts.map(([v,l])=>`<option value="${v}"${v===curType?' selected':''}>${l}</option>`).join('')}</select></div>
          ${isCart(s.type)?`<div class="field"><label for="dk-sort">Sort</label><select class="select" id="dk-sort" data-dk="sort"><option value="">Natural order</option><option value="desc"${s.sort==='desc'?' selected':''}>Value, descending</option><option value="asc"${s.sort==='asc'?' selected':''}>Value, ascending</option></select></div>`:''}</div>`:''}
        <div class="dgrp"><h3>Colors</h3><div class="field"><label for="dk-pal">Palette</label><select class="select" id="dk-pal" data-dk="palette"><option value="cat"${(s.palette||'cat')==='cat'?' selected':''}>Fluent categorical</option><option value="mono"${s.palette==='mono'?' selected':''}>Monochrome blue</option><option value="highlight"${s.palette==='highlight'?' selected':''}>Highlight first series</option></select></div><div class="swatches">${used.filter(Boolean).map(c=>`<i style="--c:${c}"></i>`).join('')}</div></div>
        <div class="dgrp"><h3>Legend, labels &amp; tooltip</h3>${sw('Show legend','legend',p._legend)}${sw('Show data labels','labels',!!s.labels&&s.labels!==false)}${sw('Show tooltip','tooltip',p._tooltip)}</div>
        <div class="dgrp"><h3>Spec</h3><pre class="code" style="max-height:220px">${esc(JSON.stringify(this.base,null,1).slice(0,2400))}</pre></div>`,
        footer:`<button class="btn btn--primary" data-close>Done</button><button class="btn" data-dk-reset>Reset</button><button class="btn btn--subtle" data-dk-data>${ic('table')}View data</button>`});
      d.el.addEventListener('change',e=>{const x=e.target.closest('[data-dk]');if(!x)return;const k=x.dataset.dk;
        if(k==='type'){if(s.type==='pie'){this.ov.donut=x.value!=='pie';this.ov.semi=x.value==='semi'}else this.ov.type=x.value}
        else if(k==='sort')this.ov.sort=x.value||undefined;else if(k==='palette')this.ov.palette=x.value;else this.ov[k]=x.checked;this.render()});
      d.el.querySelector('[data-dk-reset]').onclick=()=>{this.ov={};this.render();d.close();RA.toast('Chart reset to its saved definition',{icon:'arrow_reset'})};
      d.el.querySelector('[data-dk-data]').onclick=()=>{d.close();this.viewData()};
    }
    more(btn){
      const s=this.spec(),drillable=s.drill?Object.keys(s.drill):[];
      RA.menu(btn,[{label:'View data',icon:'table',onClick:()=>this.viewData()},{label:'Filter',icon:'filter',onClick:()=>RA.filterDrawer()},
        {label:drillable.length?`Drill down: ${drillable[0]}`:'Drill down',icon:'zoom_in',disabled:!drillable.length,onClick:()=>this.select({name:drillable[0]})},
        ...(s.zoom?[{label:'Reset zoom',icon:'arrow_reset',onClick:()=>{this.h&&this.h.resetZoom();RA.toast('Zoom reset',{icon:'arrow_reset'})}}]:[]),'sep',
        {label:'Export PNG',icon:'image',onClick:()=>this.exportPng()},{label:'Export CSV',icon:'arrow_download',onClick:()=>this.exportCsv()},
        {label:'Copy chart spec',icon:'copy',onClick:()=>{const t=JSON.stringify(this.base,null,2);(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>RA.toast('Chart spec copied',{kind:'ok'}),()=>RA.toast('Copy is blocked here — open Chart details to see the spec',{kind:'warn'}))}},'sep',
        {label:this.cc&&this.cc.classList.contains('is-full')?'Exit full screen':'Full screen',icon:'full_screen_maximize',onClick:()=>this.full()},{label:'Chart details',icon:'panel_right',onClick:()=>this.details()}],{label:'Chart actions'});
    }
  }

  function init(root=document){$$('.chart',root).forEach(el=>{if(!el._card)cards.push(new Card(el))})}
  function renderAll(pred){cards.forEach(c=>{if(!document.contains(c.el)){return}if(!pred||pred(c)){if(c.seen)c.render()}})}
  document.addEventListener('click',e=>{
    const t=e.target;let el,c;
    if((el=t.closest('[data-cc-more]'))&&(c=el.closest('.cc')?._card)){c.more(el);return}
    if((el=t.closest('[data-cc-full]'))&&(c=el.closest('.cc')?._card)){c.full();return}
    if((el=t.closest('[data-cc-details]'))&&(c=el.closest('.cc')?._card)){c.details();return}
    if((el=t.closest('[data-cc-data]'))&&(c=el.closest('.cc')?._card)){c.viewData();return}
    if((el=t.closest('[data-cc-retry]'))&&(c=el.closest('.cc')?._card||el.closest('.chart')?._card)){c.render();return}
    if((el=t.closest('[data-drill-to]'))&&(c=el.closest('.cc')?._card)){c.drill=c.drill.slice(0,+el.dataset.drillTo);c.render();return}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const f=$('.cc.is-full');if(f&&!document.querySelector('.layer')&&!document.querySelector('.menu'))f._card.full(false)}});
  document.addEventListener('ra:engine',()=>renderAll(c=>!c.forced));
  let tt;document.addEventListener('ra:theme',()=>{clearTimeout(tt);tt=setTimeout(()=>renderAll(),30)});
  document.addEventListener('ra:filters',e=>{cards.forEach(c=>{if(c.seen&&document.contains(c.el)&&c.base.vary!==false||c.base.dim)c.busy(380)})});
  document.addEventListener('ra:refresh',()=>cards.forEach(c=>c.seen&&document.contains(c.el)&&c.busy(650)));
  document.addEventListener('ra:layout',()=>cards.forEach(c=>c.h&&c.h.resize()));

  /* ================================================================ permutation explorer */
  /* <div class="xp" data-xp='{"spec":{...},"controls":["orient","mode",...]}'> */
  const XC={
    orient:{label:'Orientation',opts:[['column','Vertical'],['bar','Horizontal']],apply:(s,v)=>{s.type=v}},
    mode:{label:'Arrangement',opts:[['','Grouped'],['normal','Stacked'],['percent','100% stacked']],apply:(s,v)=>{s.stack=v||undefined}},
    linekind:{label:'Form',opts:[['line','Line'],['smooth','Smooth'],['area','Area'],['step','Step']],apply:(s,v)=>{s.type=v==='area'?'area':'line';s.smooth=v==='smooth';s.series.forEach(q=>q.step=v==='step')}},
    areamode:{label:'Arrangement',opts:[['','Overlap'],['normal','Stacked'],['percent','100% stacked']],apply:(s,v)=>{s.stack=v||undefined}},
    pieform:{label:'Form',opts:[['pie','Pie'],['donut','Donut'],['semi','Semi-donut'],['half','Half pie'],['rose','Rose']],apply:(s,v)=>{s.donut=v==='donut'||v==='semi';s.semi=v==='semi'||v==='half';s.rose=v==='rose'}},
    palette:{label:'Color',opts:[['cat','Fluent'],['mono','Mono'],['highlight','Highlight']],apply:(s,v)=>{s.palette=v;if(v==='highlight'&&s.series&&s.series.length===1)s.highlight=0;if(v==='highlight'&&s.data)s.highlight=0}},
    density:{label:'Data density',opts:[['s','Compact'],['m','Regular'],['l','Dense']],apply:(s,v)=>{const n={s:5,m:8,l:99}[v];if(s.categories){s.categories=s.categories.slice(0,n);s.series.forEach(q=>q.data=q.data.slice(0,n))}if(s.data&&!s.x)s.data=s.data.slice(0,{s:3,m:5,l:99}[v]);if(s.series&&(s.type==='scatter'||s.type==='bubble'))s.series=s.series.slice(0,{s:1,m:2,l:3}[v])}},
    labels:{label:'Data labels',opts:[['0','Off'],['1','On']],apply:(s,v)=>{s.labels=v==='1'}},
    legend:{label:'Legend',opts:[['1','On'],['0','Off']],apply:(s,v)=>{s.legend=v==='1'}},
    tooltip:{label:'Tooltip',opts:[['1','On'],['0','Off']],apply:(s,v)=>{s.tooltip=v==='1'}},
    target:{label:'Reference',opts:[['','None'],['t','Target'],['h','Threshold']],apply:(s,v,b)=>{s.target=v==='t'?b.ref:undefined;s.threshold=v==='h'?{...b.ref,label:'Limit'}:undefined}},
    size:{label:'Card size',opts:[['s','Small'],['m','Medium'],['l','Large']],ui:true},
    theme:{label:'Theme',opts:[['','Page'],['light','Light'],['dark','Dark'],['hc','HC']],ui:true},
    engine:{label:'Engine',opts:[['','Header'],['echarts','ECharts'],['highcharts','Highcharts'],['chartjs','Chart.js']],ui:true},
  };
  function explorer(x){
    const cfg=JSON.parse(x.dataset.xp),st={};
    const ctl=x.querySelector('.xp__ctl'),out=x.querySelector('.xp__out'),card=out.querySelector('.cc'),code=x.querySelector('.xp__code');
    cfg.controls.forEach(k=>{st[k]=(cfg.init&&cfg.init[k]!=null)?cfg.init[k]:XC[k].opts[0][0]});
    ctl.innerHTML=cfg.controls.map(k=>`<div class="field"><span class="lbl" id="xl-${k}-${x.id}">${XC[k].label}</span><div class="seg seg--s" role="group" aria-labelledby="xl-${k}-${x.id}">${XC[k].opts.map(([v,l])=>`<button type="button" data-xk="${k}" data-xv="${v}" aria-pressed="${st[k]===v}">${l}</button>`).join('')}</div></div>`).join('')+`<button type="button" class="btn btn--s" data-xreset>${ic('arrow_reset')}Reset</button>`;
    function apply(){
      const s=clone(cfg.spec);cfg.controls.forEach(k=>{if(!XC[k].ui)XC[k].apply(s,st[k],cfg)});
      out.dataset.size=st.size||'l';
      if(st.theme)card.setAttribute('data-theme',st.theme);else card.removeAttribute('data-theme');
      const host=card.querySelector('.chart');if(st.engine)host.dataset.engine=st.engine;else delete host.dataset.engine;
      const c=host._card;c.base=s;c.ov={};c.drill=[];c.seen=true;c.render();
      const diff={};cfg.controls.forEach(k=>{if(!XC[k].ui&&st[k]!==XC[k].opts[0][0])diff[k]=XC[k].opts.find(o=>o[0]===st[k])[1]});
      if(code)code.textContent=`${TYPE_NAME[s.type]||s.type} · ${Object.entries(diff).map(([k,v])=>XC[k].label+': '+v).join(' · ')||'default variant'}${st.engine?' · '+RA.ENGINES[st.engine].name:''}${st.theme?' · '+st.theme+' theme':''}`;
    }
    ctl.addEventListener('click',e=>{const b=e.target.closest('[data-xk]');if(b){st[b.dataset.xk]=b.dataset.xv;$$(`[data-xk="${b.dataset.xk}"]`,ctl).forEach(y=>y.setAttribute('aria-pressed',String(y===b)));apply()}
      if(e.target.closest('[data-xreset]')){cfg.controls.forEach(k=>{st[k]=(cfg.init&&cfg.init[k]!=null)?cfg.init[k]:XC[k].opts[0][0];$$(`[data-xk="${k}"]`,ctl).forEach(y=>y.setAttribute('aria-pressed',String(y.dataset.xv===st[k])))});apply()}});
    setTimeout(apply,0);
  }

  function boot(){init();$$('.xp[data-xp]').forEach(explorer)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.RACharts={init,cards,theme,prep,grid,ADAPTERS,TYPE_NAME,renderAll,Card};
})();
