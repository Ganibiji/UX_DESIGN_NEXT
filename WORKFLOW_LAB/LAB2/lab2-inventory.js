/* =========================================================
   KAGAMI ERP · INVENTORY MODULE
   Loaded on demand by lab2-design-system.html when the
   "Inventory workflow" toggle is on. Holds only the inventory
   menu sections, mock data, workflow logic and pages. The UI
   framework, components, theming and design lab it uses live
   in the design system file.
   ========================================================= */
(function(){
'use strict';
const ROUTES_BEFORE=new Set(Object.keys(ROUTES));

/* =========================================================
   MOCK DATABASE
   ========================================================= */
const USERS=['Alex Morgan','Daniel Reyes','Priya Nair','Marcus Chen','Sofia Alvarez','Grace Okafor','Ethan Brooks','Mia Thompson'];
const IPS={'Alex Morgan':'10.24.8.112','Daniel Reyes':'10.24.9.31','Priya Nair':'10.31.2.57','Marcus Chen':'10.40.1.88','Sofia Alvarez':'10.52.4.19','Grace Okafor':'10.60.3.44','Ethan Brooks':'10.24.9.73','Mia Thompson':'10.24.8.140'};

const categories=[
 {id:'C01',code:'ELC',name:'Electronics',subs:['Laptops','Monitors','Peripherals','Audio'],status:'Active',desc:'Computers, displays and accessories'},
 {id:'C02',code:'NET',name:'Networking',subs:['Switches','Wireless','Cabling'],status:'Active',desc:'Network hardware and structured cabling'},
 {id:'C03',code:'OFF',name:'Office Supplies',subs:['Paper','Writing','Printing'],status:'Active',desc:'Consumable office stationery'},
 {id:'C04',code:'FUR',name:'Furniture',subs:['Seating','Desks','Storage'],status:'Active',desc:'Office and workplace furniture'},
 {id:'C05',code:'IND',name:'Industrial Parts',subs:['Bearings','Hydraulics','Fasteners','Power Transmission','Lubricants'],status:'Active',desc:'MRO spares for production equipment'},
 {id:'C06',code:'PKG',name:'Packaging',subs:['Cartons','Films','Tapes','Protective'],status:'Active',desc:'Shipping and protective packaging'},
 {id:'C07',code:'SAF',name:'Safety Equipment',subs:['Hand Protection','Head Protection','Visibility','Eye Protection'],status:'Active',desc:'Personal protective equipment'},
 {id:'C08',code:'LAB',name:'Lab Consumables',subs:['Solvents','Plasticware','Apparel'],status:'Active',desc:'Expiry-controlled laboratory supplies'},
 {id:'C09',code:'MHE',name:'Material Handling',subs:['Pallet Equipment','Scanning','Labeling'],status:'Active',desc:'Warehouse handling and identification equipment'}
];
const units=[
 {id:'U01',code:'EA',name:'Each',type:'Count',precision:0,status:'Active'},
 {id:'U02',code:'BOX',name:'Box',type:'Count',precision:0,status:'Active'},
 {id:'U03',code:'PK',name:'Pack',type:'Count',precision:0,status:'Active'},
 {id:'U04',code:'KG',name:'Kilogram',type:'Weight',precision:3,status:'Active'},
 {id:'U05',code:'L',name:'Liter',type:'Volume',precision:2,status:'Active'},
 {id:'U06',code:'M',name:'Meter',type:'Length',precision:2,status:'Active'},
 {id:'U07',code:'RL',name:'Roll',type:'Count',precision:0,status:'Active'},
 {id:'U08',code:'PR',name:'Pair',type:'Count',precision:0,status:'Active'},
 {id:'U09',code:'SET',name:'Set',type:'Count',precision:0,status:'Active'},
 {id:'U10',code:'CTN',name:'Carton',type:'Count',precision:0,status:'Inactive'}
];
const warehouses=[
 {id:'W1',code:'WH-CHI',name:'Chicago Central DC',address:'1200 W Fulton Market',city:'Chicago',state:'IL',country:'United States',manager:'Daniel Reyes',contact:'+1 (312) 555-0190',email:'chicago.dc@kagami-erp.com',status:'Active',type:'Distribution Center',capacity:5000},
 {id:'W2',code:'WH-DAL',name:'Dallas Distribution Center',address:'4800 Irving Blvd',city:'Dallas',state:'TX',country:'United States',manager:'Priya Nair',contact:'+1 (214) 555-0133',email:'dallas.dc@kagami-erp.com',status:'Active',type:'Distribution Center',capacity:2000},
 {id:'W3',code:'WH-NWK',name:'Newark Fulfillment Hub',address:'85 Doremus Ave',city:'Newark',state:'NJ',country:'United States',manager:'Marcus Chen',contact:'+1 (973) 555-0172',email:'newark.hub@kagami-erp.com',status:'Active',type:'Fulfillment Hub',capacity:1400},
 {id:'W4',code:'WH-LAX',name:'Los Angeles Port Warehouse',address:'2050 E Dominguez St',city:'Carson',state:'CA',country:'United States',manager:'Sofia Alvarez',contact:'+1 (310) 555-0128',email:'la.port@kagami-erp.com',status:'Active',type:'Port Warehouse',capacity:8500},
 {id:'W5',code:'WH-ATL',name:'Atlanta Regional Store',address:'3300 Fulton Industrial Blvd',city:'Atlanta',state:'GA',country:'United States',manager:'Grace Okafor',contact:'+1 (404) 555-0166',email:'atlanta.store@kagami-erp.com',status:'Active',type:'Regional Store',capacity:5400},
 {id:'W6',code:'WH-DEN',name:'Denver Overflow Facility',address:'5600 Dahlia St',city:'Commerce City',state:'CO',country:'United States',manager:'Ethan Brooks',contact:'+1 (720) 555-0105',email:'denver.overflow@kagami-erp.com',status:'Inactive',type:'Overflow',capacity:3000}
];
const locations=[];
(function(){
  const zones=[['A','Bulk storage'],['B','Pick face'],['C','Controlled'],['Q','Quarantine']];
  warehouses.forEach(w=>{
    const short=w.code.split('-')[1];
    zones.forEach(([z,zn],zi)=>{
      const racks=z==='Q'?1:(z==='C'?1:2);
      for(let r=1;r<=racks;r++){
        const shelf=String(ri(1,4)).padStart(2,'0'),bin=String(ri(1,12)).padStart(2,'0'),rack=String(r).padStart(2,'0');
        locations.push({id:'L'+(locations.length+1),warehouseId:w.id,zone:z,zoneName:zn,rack:'R'+rack,shelf:'S'+shelf,bin:'B'+bin,code:short+'-'+z+'-'+rack+'-'+shelf+'-'+bin,capacity:z==='Q'?300:(z==='C'?600:ri(12,24)*100),status:'Active'});
      }
    });
  });
})();
const SUPPLIERS={C01:'Northwind Electronics Supply',C02:'Cascade Networking Inc.',C03:'Summit Office Products',C04:'Summit Office Products',C05:'Apex Industrial Components',C06:'Pacific Packaging Co.',C07:'Guardian Safety Supply',C08:'Meridian Lab Sciences',C09:'Apex Industrial Components'};
const CUSTOMERS=['Brightline Logistics','Harbor Medical Group','Vertex Manufacturing','Lakeside University','Orion Retail Stores','Crestview Hospitality','Ironwood Construction'];
const DEPARTMENTS=['Production','Maintenance','IT Operations','Facilities','Laboratory','Administration','Shipping'];

// name, cat, sub, brand, uom, cost, price, reorder, min, max, type, invType, flags[b,s,e], shelfLife
const PRODUCT_SEED=[
 ['Premium Laptop 14-inch','C01','Laptops','Lenovo','EA',1180,1549,40,20,220,'Stockable','Trading Goods',[0,1,0]],
 ['Business Laptop 15.6-inch','C01','Laptops','Dell','EA',845,1129,35,15,200,'Stockable','Trading Goods',[0,1,0]],
 ['27-inch 4K Monitor','C01','Monitors','LG','EA',312,429,30,15,180,'Stockable','Trading Goods',[0,1,0]],
 ['24-inch FHD Monitor','C01','Monitors','Dell','EA',138,189,45,20,260,'Stockable','Trading Goods',[0,1,0]],
 ['Wireless Keyboard','C01','Peripherals','Logitech','EA',38.5,59,80,40,500,'Stockable','Trading Goods',[0,0,0]],
 ['Wireless Mouse','C01','Peripherals','Logitech','EA',21.9,34.99,100,50,600,'Stockable','Trading Goods',[0,0,0]],
 ['USB-C Docking Station','C01','Peripherals','Dell','EA',164,229,25,10,150,'Stockable','Trading Goods',[0,1,0]],
 ['Noise-Cancelling Headset','C01','Audio','Jabra','EA',129,179,30,15,160,'Stockable','Trading Goods',[0,1,0]],
 ['HDMI Cable 2m','C01','Peripherals','Belkin','EA',6.4,12.99,150,80,900,'Stockable','Trading Goods',[0,0,0]],
 ['24-Port Gigabit Switch','C02','Switches','Cisco','EA',412,569,12,6,70,'Stockable','Trading Goods',[0,1,0]],
 ['Wi-Fi 6 Access Point','C02','Wireless','Ubiquiti','EA',139,199,20,10,120,'Stockable','Trading Goods',[0,1,0]],
 ['Cat6 Patch Cable 3m','C02','Cabling','Panduit','EA',3.2,6.5,300,150,2000,'Stockable','Trading Goods',[0,0,0]],
 ['Fiber Patch Cord LC-LC 5m','C02','Cabling','Corning','EA',14.75,24,60,30,400,'Stockable','Trading Goods',[0,0,0]],
 ['A4 Copy Paper 80gsm','C03','Paper','Double A','BOX',24.5,34,120,60,800,'Consumable','Consumables',[0,0,0]],
 ['Ballpoint Pens Blue (12)','C03','Writing','Pilot','PK',5.1,8.9,90,40,600,'Consumable','Consumables',[0,0,0]],
 ['Sticky Notes 3x3 (12)','C03','Writing','Post-it','PK',9.8,15.5,70,30,450,'Consumable','Consumables',[0,0,0]],
 ['Toner Cartridge 58A','C03','Printing','HP','EA',88,129,25,10,140,'Consumable','Consumables',[1,0,0]],
 ['Ergonomic Office Chair','C04','Seating','Steelcase','EA',486,689,10,5,60,'Stockable','Finished Goods',[0,1,0]],
 ['Height-Adjustable Desk','C04','Desks','Flexispot','EA',365,519,8,4,50,'Stockable','Finished Goods',[0,1,0]],
 ['4-Drawer Filing Cabinet','C04','Storage','HON','EA',214,309,6,3,40,'Stockable','Finished Goods',[0,0,0]],
 ['Deep Groove Ball Bearing 6204','C05','Bearings','SKF','EA',7.85,13.5,200,100,1500,'Stockable','Spare Parts',[1,0,0]],
 ['Hydraulic Hose 1/2-inch','C05','Hydraulics','Parker','M',11.2,18.75,150,80,900,'Stockable','Spare Parts',[1,0,0]],
 ['Hex Bolt M10x50 Zinc (100)','C05','Fasteners','Fastenal','BOX',18.6,29,60,30,400,'Stockable','Spare Parts',[0,0,0]],
 ['V-Belt B-52','C05','Power Transmission','Gates','EA',16.4,26.5,50,25,320,'Stockable','Spare Parts',[0,0,0]],
 ['Industrial Lubricant ISO 68','C05','Lubricants','Mobil','L',8.9,14.2,200,100,1200,'Consumable','Raw Material',[1,0,1],540],
 ['Corrugated Carton 18x12x12','C06','Cartons','Uline','EA',1.45,2.6,800,400,6000,'Consumable','Consumables',[0,0,0]],
 ['Stretch Wrap 18-inch','C06','Films','Uline','RL',19.5,29.9,80,40,500,'Consumable','Consumables',[0,0,0]],
 ['Packing Tape 48mm','C06','Tapes','3M','RL',2.35,4.2,400,200,3000,'Consumable','Consumables',[0,0,0]],
 ['Bubble Wrap Roll 24-inch','C06','Protective','Uline','RL',34,52,40,20,260,'Consumable','Consumables',[0,0,0]],
 ['Nitrile Gloves Size L (100)','C07','Hand Protection','Ansell','BOX',11.9,18.5,120,60,900,'Consumable','Consumables',[1,0,1],900],
 ['Safety Helmet Class E','C07','Head Protection','MSA','EA',24.8,39,40,20,300,'Stockable','Trading Goods',[0,0,0]],
 ['Hi-Vis Safety Vest','C07','Visibility','Portwest','EA',6.9,12.5,100,50,700,'Stockable','Trading Goods',[0,0,0]],
 ['Anti-Fog Safety Goggles','C07','Eye Protection','3M','EA',9.4,15.9,80,40,500,'Stockable','Trading Goods',[0,0,0]],
 ['Isopropyl Alcohol 99% 1L','C08','Solvents','Fisher','L',12.6,21,60,30,400,'Consumable','Raw Material',[1,0,1],365],
 ['Pipette Tips 200µL (960)','C08','Plasticware','Eppendorf','BOX',42,64,30,15,200,'Consumable','Consumables',[1,0,1],730],
 ['Disposable Lab Coat (10)','C08','Apparel','Kimberly-Clark','PK',27.5,41,25,10,180,'Consumable','Consumables',[0,0,0]],
 ['Handheld Barcode Scanner','C09','Scanning','Zebra','EA',289,399,6,3,40,'Stockable','Trading Goods',[0,1,0]],
 ['Thermal Label Printer','C09','Labeling','Zebra','EA',415,579,4,2,30,'Stockable','Trading Goods',[0,1,0]],
 ['Manual Pallet Jack 2500kg','C09','Pallet Equipment','Uline','EA',372,520,3,1,20,'Stockable','Finished Goods',[0,1,0]]
];
const products=[];
const skuCounters={};
PRODUCT_SEED.forEach((p,i)=>{
  const cat=categories.find(c=>c.id===p[1]);
  skuCounters[cat.code]=(skuCounters[cat.code]||10040)+ri(1,9);
  const sku=cat.code+'-'+skuCounters[cat.code];
  const created=addDays(new Date(2025,ri(0,11),ri(1,27),ri(8,17),ri(0,59)),0);
  products.push({id:'P'+String(i+1).padStart(3,'0'),name:p[0],sku,barcode:'0'+String(7350000000000+i*7919+ri(100,999)).slice(0,12),code:'PRD-'+String(2100+i),
    categoryId:p[1],sub:p[2],brand:p[3],uom:p[4],cost:p[5],price:p[6],reorder:p[7],min:p[8],max:p[9],safety:Math.round(p[8]*0.6),type:p[10],invType:p[11],
    batch:!!p[12][0],serial:!!p[12][1],expiry:!!p[12][2],shelfLife:p[13]||0,track:true,status:i>=36?(i===38?'Inactive':'Draft'):'Active',
    tax:'Standard 8.25%',discount:i%7===0?5:0,currency:'USD',desc:p[3]+' '+p[0].toLowerCase()+' for enterprise operations. Supplied by '+SUPPLIERS[p[1]]+'.',
    defaultWarehouseId:'W1',defaultLocationId:null,bin:'',
    createdBy:pick(USERS.slice(1)),createdAt:created,updatedBy:'Alex Morgan',updatedAt:addDays(TODAY,-ri(1,40))});
});
// stock rows: {productId,warehouseId,locationId,qty,reserved,opening,received,issued,transferredIn,transferredOut,adjusted}
const stock=[];
const ledger=[];
const batches=[];
const purchaseOrders=[], grns=[], stockTransfers=[], stockAdjustments=[], goodsIssues=[], salesOrders=[], stockCounts=[];
const audit=[];
const counters={PO:4410,GRN:2860,TRF:1170,ADJ:640,GI:3320,SO:7720,CNT:118,LED:90000};
function nextNo(p){counters[p]++;const y='26';return p+'-'+y+String(counters[p]).padStart(5,'0')}
const P_BY=id=>products.find(p=>p.id===id);
const W_BY=id=>warehouses.find(w=>w.id===id);
const L_BY=id=>locations.find(l=>l.id===id);
const CAT_BY=id=>categories.find(c=>c.id===id);
const locsOf=wid=>locations.filter(l=>l.warehouseId===wid);
function defaultLoc(wid,zone){const ls=locsOf(wid);return (ls.find(l=>l.zone===(zone||'A'))||ls[0]).id}
function stockRow(pid,wid,create){
  let r=stock.find(s=>s.productId===pid&&s.warehouseId===wid);
  if(!r&&create){const p=P_BY(pid);const prefZone=p&&p.expiry?'C':(['C01','C02','C09'].includes(p&&p.categoryId)?'B':'A');r={productId:pid,warehouseId:wid,locationId:defaultLoc(wid,prefZone),qty:0,reserved:0,opening:0,received:0,issued:0,transferredIn:0,transferredOut:0,adjusted:0};stock.push(r)}
  return r;
}
const productQty=pid=>sum(stock.filter(s=>s.productId===pid),s=>s.qty);
const productReserved=pid=>sum(stock.filter(s=>s.productId===pid),s=>s.reserved);
const whQty=(pid,wid)=>{const r=stockRow(pid,wid);return r?r.qty:0};
const whAvail=(pid,wid)=>{const r=stockRow(pid,wid);return r?Math.max(0,r.qty-r.reserved):0};

/* batches (FIFO) */
function addBatch(pid,wid,qty,batchNo,expiry,date){
  if(qty<=0)return;
  const ex=batches.find(b=>b.productId===pid&&b.warehouseId===wid&&b.batch===batchNo);
  if(ex){ex.qty+=qty;return}
  batches.push({id:uid('B'),productId:pid,warehouseId:wid,batch:batchNo,expiry:expiry?toD(expiry):null,received:toD(date),qty});
}
function consumeBatches(pid,wid,qty,preferBatch){
  const out=[];let need=qty;
  let list=batches.filter(b=>b.productId===pid&&b.warehouseId===wid&&b.qty>0).sort((a,b)=>(a.expiry||a.received)-(b.expiry||b.received));
  if(preferBatch){list.sort((a,b)=>(a.batch===preferBatch?-1:0)-(b.batch===preferBatch?-1:0))}
  for(const b of list){if(need<=0)break;const t=Math.min(b.qty,need);b.qty-=t;need-=t;out.push({batch:b.batch,expiry:b.expiry,qty:t,received:b.received})}
  return out;
}
function batchCode(d){d=toD(d);return 'B'+String(d.getFullYear()).slice(2)+String(d.getMonth()+1).padStart(2,'0')+'-'+String(ri(100,999))}

/* core posting: every stock change goes through here */
function postMovement(o){
  // o: {type, pid, wid, inQty, outQty, cost, txNo, ref, user, date, bucket, locationId, batch, expiry}
  const p=P_BY(o.pid);const r=stockRow(o.pid,o.wid,true);
  const opening=r.qty;const inQ=Math.max(0,o.inQty||0);let outQ=Math.max(0,o.outQty||0);
  outQ=Math.min(outQ,r.qty+inQ);
  r.qty=opening+inQ-outQ;
  if(o.locationId&&inQ>0&&opening===0)r.locationId=o.locationId;
  const b=o.bucket;
  if(b==='opening')r.opening+=inQ;
  else if(b==='received')r.received+=inQ;
  else if(b==='issued')r.issued+=outQ;
  else if(b==='transfer'){r.transferredIn+=inQ;r.transferredOut+=outQ}
  else if(b==='adjusted')r.adjusted+=inQ-outQ;
  r.reserved=Math.min(r.reserved,r.qty);
  const cost=o.cost!=null?o.cost:p.cost;
  if(p.batch||p.expiry){
    if(inQ>0)addBatch(o.pid,o.wid,inQ,o.batch||batchCode(o.date||NOW()),o.expiry||(p.expiry&&p.shelfLife?addDays(o.date||NOW(),p.shelfLife):null),o.date||NOW());
    if(outQ>0)consumeBatches(o.pid,o.wid,outQ,o.batch);
  }
  const entry={id:'LE'+(++counters.LED),date:toD(o.date||NOW()),txNo:o.txNo,type:o.type,productId:o.pid,warehouseId:o.wid,opening,inQty:inQ,outQty:outQ,balance:r.qty,unitCost:cost,value:(inQ-outQ)*cost,ref:o.ref||'',user:o.user||CURRENT_USER.name};
  ledger.push(entry);
  return entry;
}
function logAudit(module,action,record,oldV,newV,user,date){
  const u=user||CURRENT_USER.name;
  audit.unshift({id:uid('A'),date:toD(date||NOW()),user:u,module,action,record,oldV:oldV||'—',newV:newV||'—',ip:IPS[u]||'10.24.8.112'});
}

/* =========================================================
   SEED HISTORY (all stock flows through postMovement)
   ========================================================= */
function hist(doc,status,user,date,note){(doc.history=doc.history||[]).push({status,user,date:toD(date),note:note||''})}
(function seed(){
  const START=new Date(2026,6,1,7,30);
  const ACTIVE=products.filter(p=>p.status==='Active');
  ACTIVE.forEach((p,i)=>{
    const nW=ri(1,4);
    let whs=['W1','W2','W3','W4','W5'].sort(()=>R()-.5).slice(0,nW);
    if(!whs.includes('W1')&&R()<.6)whs[0]='W1';
    p.defaultWarehouseId=whs[0];
    whs.forEach((w,k)=>{
      const q=Math.max(5,Math.round(p.max*(0.3+R()*0.3)/nW));
      postMovement({type:'Opening Balance',pid:p.id,wid:w,inQty:q,txNo:'OB-2607-'+String(i*5+k+1).padStart(4,'0'),ref:'Go-live migration',user:'Daniel Reyes',date:START,bucket:'opening',batch:'OPEN-2607',expiry:p.expiry?addDays(START,ri(85,175)):null});
    });
    const r=stockRow(p.id,whs[0]);p.defaultLocationId=r.locationId;p.bin=L_BY(r.locationId).bin;
  });
  const rowsOf=pid=>stock.filter(s=>s.productId===pid);
  const supplierCats=s=>Object.keys(SUPPLIERS).filter(k=>SUPPLIERS[k]===s);
  function seedGRN(date,opts){
    opts=opts||{};
    const sup=opts.supplier||pick(Object.values(SUPPLIERS));
    const cats=supplierCats(sup);
    const pool=ACTIVE.filter(p=>cats.includes(p.categoryId));
    if(!pool.length)return null;
    const items=[];const n=ri(1,Math.min(3,pool.length));
    const wid=opts.wid||pick(['W1','W1','W2','W3','W4','W5']);
    pool.sort(()=>R()-.5).slice(0,n).forEach(p=>{const q=Math.max(4,Math.round(p.reorder*(0.6+R()*0.9)));items.push({productId:p.id,qty:q,received:0,cost:p.cost})});
    const po={id:uid('PO'),no:nextNo('PO'),date:addDays(date,-ri(6,14)),supplier:sup,warehouseId:wid,status:'Open',expected:addDays(date,0),items,createdBy:'Mia Thompson',terms:'Net 30'};
    purchaseOrders.push(po);logAudit('Purchasing','Created',po.no,'—','Status: Open','Mia Thompson',po.date);
    if(opts.poOnly)return po;
    const g={id:uid('G'),no:nextNo('GRN'),date:toD(date),supplier:sup,poNo:po.no,warehouseId:wid,receivedBy:W_BY(wid).manager,status:'Draft',notes:'Delivery note DN-'+ri(40000,49999),createdBy:W_BY(wid).manager,createdAt:toD(date),history:[],
      items:items.map(it=>{const p=P_BY(it.productId);const rej=R()<.14?ri(1,3):0;const rec=opts.partial?Math.round(it.qty*.6):it.qty;return {productId:it.productId,ordered:it.qty,received:rec,accepted:rec-rej,rejected:rej,batch:(p.batch||p.expiry)?batchCode(date):'',expiry:p.expiry?addDays(date,p.shelfLife):null,locationId:defaultLoc(wid,p.expiry?'C':'A'),cost:it.cost}})};
    hist(g,'Draft',g.receivedBy,date,'Goods received at dock');
    grns.push(g);
    const st=opts.status||'Completed';
    if(st!=='Draft'){g.status='Pending QC';hist(g,'Pending QC',g.receivedBy,addDays(date,0),'Submitted for quality check')}
    if(st==='Accepted'||st==='Completed'){g.status='Accepted';g.qcBy='Ethan Brooks';g.qcAt=toD(date);hist(g,'Accepted','Ethan Brooks',date,sum(g.items,x=>x.rejected)?sum(g.items,x=>x.rejected)+' units rejected':'All lines passed inspection')}
    if(st==='Completed'){
      g.items.forEach(it=>{postMovement({type:'GRN',pid:it.productId,wid,inQty:it.accepted,txNo:g.no,ref:po.no,user:g.receivedBy,date,bucket:'received',batch:it.batch,expiry:it.expiry,locationId:it.locationId});const pi=po.items.find(x=>x.productId===it.productId);pi.received+=it.accepted});
      g.status='Completed';g.postedAt=toD(date);hist(g,'Completed',g.receivedBy,date,'Put away to storage');
      po.status=po.items.every(x=>x.received>=x.qty)?'Received':'Partially Received';
    }
    logAudit('Goods Receipt','Created',g.no,'—','Status: '+g.status,g.receivedBy,date);
    return g;
  }
  function seedSale(date,status){
    const wid=pick(['W1','W1','W2','W3','W4','W5']);
    const rows=stock.filter(s=>s.warehouseId===wid&&s.qty-s.reserved>3);
    if(!rows.length)return null;
    const items=[];
    rows.sort(()=>R()-.5).slice(0,ri(1,3)).forEach(r=>{const p=P_BY(r.productId);const q=Math.max(1,Math.min(r.qty-r.reserved,ri(1,Math.max(2,Math.round(p.reorder*.45)))));items.push({productId:p.id,qty:q,price:p.price})});
    const so={id:uid('SO'),no:nextNo('SO'),date:toD(date),customer:pick(CUSTOMERS),warehouseId:wid,status:status||'Shipped',items,createdBy:'Mia Thompson'};
    salesOrders.push(so);
    if(so.status==='Shipped')items.forEach(it=>postMovement({type:'Sales',pid:it.productId,wid,outQty:it.qty,txNo:so.no,ref:so.customer,user:W_BY(wid).manager,date,bucket:'issued'}));
    else items.forEach(it=>{const r=stockRow(it.productId,wid);r.reserved+=it.qty});
    return so;
  }
  function seedIssue(date,status){
    const wid=pick(['W1','W2','W3','W5']);
    const rows=stock.filter(s=>s.warehouseId===wid&&s.qty>5&&['C03','C05','C06','C07','C08'].includes(P_BY(s.productId).categoryId));
    if(!rows.length)return null;
    const dept=pick(DEPARTMENTS);
    const items=rows.sort(()=>R()-.5).slice(0,ri(1,2)).map(r=>({productId:r.productId,qty:Math.max(1,Math.min(r.qty-1,ri(2,Math.round(P_BY(r.productId).reorder*.25)+2))),batch:'',locationId:r.locationId}));
    const gi={id:uid('GI'),no:nextNo('GI'),date:toD(date),warehouseId:wid,department:dept,reference:'REQ-'+ri(5000,5999),requestedBy:pick(USERS.slice(1)),issuedBy:W_BY(wid).manager,reason:pick(['Production consumption','Preventive maintenance','Workplace supplies','Lab testing','Equipment repair']),status:'Requested',items,history:[],createdBy:W_BY(wid).manager,createdAt:toD(date)};
    hist(gi,'Requested',gi.requestedBy,date);
    goodsIssues.push(gi);
    const st=status||'Issued';
    if(st!=='Requested'){gi.status='Approved';hist(gi,'Approved',W_BY(wid).manager,date)}
    if(st==='Picked'||st==='Issued'){gi.status='Picked';hist(gi,'Picked',W_BY(wid).manager,date)}
    if(st==='Issued'){items.forEach(it=>{const p=P_BY(it.productId);const e=postMovement({type:'Goods Issue',pid:it.productId,wid,outQty:it.qty,txNo:gi.no,ref:gi.department,user:gi.issuedBy,date,bucket:'issued'});it.qty=e.outQty});gi.status='Issued';gi.postedAt=toD(date);hist(gi,'Issued',gi.issuedBy,date,'Stock deducted')}
    logAudit('Goods Issue','Created',gi.no,'—','Status: '+gi.status,gi.issuedBy,date);
    return gi;
  }
  function seedTransfer(date,status){
    const src=pick(['W1','W1','W2','W4']);
    const rows=stock.filter(s=>s.warehouseId===src&&s.qty-s.reserved>20);
    if(!rows.length)return null;
    const dst=pick(['W1','W2','W3','W4','W5'].filter(w=>w!==src));
    const items=rows.sort(()=>R()-.5).slice(0,ri(1,3)).map(r=>({productId:r.productId,qty:Math.max(2,Math.round((r.qty-r.reserved)*(0.15+R()*0.2))),batch:'',locationId:defaultLoc(dst,P_BY(r.productId).expiry?'C':'A')}));
    const t={id:uid('T'),no:nextNo('TRF'),date:toD(date),from:src,to:dst,requestedBy:W_BY(dst).manager,reason:pick(['Stock rebalancing','Replenishment','Customer demand','Consolidation']),priority:pick(['Normal','Normal','High','Low','Urgent']),status:'Draft',items,notes:'',history:[],createdBy:W_BY(dst).manager,createdAt:toD(date)};
    hist(t,'Draft',t.requestedBy,date);stockTransfers.push(t);
    const order=['Draft','Submitted','Approved','In Transit','Received','Completed'];
    const target=status||'Completed';
    if(target==='Rejected'){t.status='Submitted';hist(t,'Submitted',t.requestedBy,date);t.status='Rejected';hist(t,'Rejected',W_BY(src).manager,date,'Source stock reserved for open sales orders');}
    else{
      const ti=order.indexOf(target);
      for(let k=1;k<=ti;k++){
        const s=order[k];const d=addDays(date,k>=4?1:0);
        if(s==='In Transit')t.items.forEach(it=>{const e=postMovement({type:'Transfer',pid:it.productId,wid:src,outQty:it.qty,txNo:t.no,ref:'To '+W_BY(dst).code,user:W_BY(src).manager,date:d,bucket:'transfer'});it.qty=e.outQty});
        if(s==='Received')t.items.forEach(it=>postMovement({type:'Transfer',pid:it.productId,wid:dst,inQty:it.qty,txNo:t.no,ref:'From '+W_BY(src).code,user:W_BY(dst).manager,date:d,bucket:'transfer',locationId:it.locationId}));
        if(s==='Approved')t.approvedBy=W_BY(src).manager;
        t.status=s;hist(t,s,k>=4?W_BY(dst).manager:(k>=2?W_BY(src).manager:t.requestedBy),d);
      }
    }
    logAudit('Stock Transfer','Created',t.no,'—','Status: '+t.status,t.requestedBy,date);
    return t;
  }
  function seedAdj(date,status,forcedType){
    const wid=pick(['W1','W2','W3','W4','W5']);
    const rows=stock.filter(s=>s.warehouseId===wid&&s.qty>8);
    if(!rows.length)return null;
    const type=forcedType||pick(['Damage','Loss','Found Stock','Correction','Correction','Expiry','Decrease','Increase']);
    const sign=['Found Stock','Increase'].includes(type)?1:(type==='Correction'?(R()<.5?1:-1):-1);
    const items=rows.sort(()=>R()-.5).slice(0,ri(1,2)).map(r=>{const d=ri(1,Math.max(2,Math.round(r.qty*.06)));return {productId:r.productId,systemQty:r.qty,physicalQty:r.qty+sign*d,cost:P_BY(r.productId).cost,reason:{Damage:'Damaged in handling',Loss:'Unaccounted shrinkage','Found Stock':'Located during cycle count',Correction:'Count variance',Expiry:'Expired batch write-off',Decrease:'Sample consumption',Increase:'Return to stock'}[type]}});
    const a={id:uid('ADJ'),no:nextNo('ADJ'),date:toD(date),warehouseId:wid,type,reason:items[0].reason,reference:'CC-'+ri(1000,1999),status:'Draft',items,history:[],createdBy:W_BY(wid).manager,createdAt:toD(date)};
    hist(a,'Draft',a.createdBy,date);stockAdjustments.push(a);
    const st=status||'Posted';
    if(st==='Rejected'){a.status='Submitted';hist(a,'Submitted',a.createdBy,date);a.status='Rejected';hist(a,'Rejected','Alex Morgan',date,'Provide count sheet as evidence')}
    else{
      if(st!=='Draft'){a.status='Submitted';hist(a,'Submitted',a.createdBy,date)}
      if(st==='Approved'||st==='Posted'){a.status='Approved';a.approvedBy='Alex Morgan';hist(a,'Approved','Alex Morgan',date)}
      if(st==='Posted'){a.items.forEach(it=>{const diff=it.physicalQty-it.systemQty;const r=stockRow(it.productId,wid);it.systemQty=r.qty;it.physicalQty=r.qty+diff;postMovement({type:'Adjustment',pid:it.productId,wid,inQty:diff>0?diff:0,outQty:diff<0?-diff:0,txNo:a.no,ref:a.type,user:a.createdBy,date,bucket:'adjusted'})});a.status='Posted';a.postedAt=toD(date);hist(a,'Posted',a.createdBy,date,'Inventory updated')}
    }
    logAudit('Stock Adjustment','Created',a.no,'—','Status: '+a.status,a.createdBy,date);
    return a;
  }
  // history Jul 2 – Oct 15
  for(let d=new Date(2026,6,2);d<=new Date(2026,9,15);d=addDays(d,1)){
    if(d.getDay()===0)continue;
    const at=h=>{const x=new Date(d);x.setHours(h,ri(0,59));return x};
    if(R()<.42)seedGRN(at(ri(8,11)));
    if(R()<.75)seedSale(at(ri(9,16)));
    if(R()<.35)seedSale(at(ri(9,16)));
    if(R()<.3)seedIssue(at(ri(8,15)));
    if(R()<.16)seedTransfer(at(ri(9,14)));
    if(R()<.08)seedAdj(at(ri(14,17)));
  }
  // shape the current position: low / critical / out / overstock
  const shape={P003:.7,P010:.75,P017:.6,P021:.8,P030:.7,P034:.65,P011:.35,P025:.3,P013:0,P036:0,P006:1.25,P026:1.2};
  Object.entries(shape).forEach(([pid,f])=>{
    const p=P_BY(pid);const total=productQty(pid);
    const target=f>1?Math.round(p.max*f):Math.round(p.reorder*f);
    let delta=target-total;const d=new Date(2026,9,16,ri(9,15),ri(0,59));
    if(delta<0){rowsOf(pid).sort((a,b)=>b.qty-a.qty).forEach(r=>{if(delta>=0)return;const take=Math.min(r.qty,-delta);if(take>0){const so={id:uid('SO'),no:nextNo('SO'),date:d,customer:pick(CUSTOMERS),warehouseId:r.warehouseId,status:'Shipped',items:[{productId:pid,qty:take,price:p.price}],createdBy:'Mia Thompson'};salesOrders.push(so);postMovement({type:'Sales',pid,wid:r.warehouseId,outQty:take,txNo:so.no,ref:so.customer,user:W_BY(r.warehouseId).manager,date:d,bucket:'issued'});delta+=take}})}
    else if(delta>0){const g=seedGRN(d,{supplier:SUPPLIERS[p.categoryId],wid:p.defaultWarehouseId});if(g){}const r=stockRow(pid,p.defaultWarehouseId,true);postMovement({type:'GRN',pid,wid:p.defaultWarehouseId,inQty:delta,txNo:g?g.no:nextNo('GRN'),ref:g?g.poNo:'',user:W_BY(p.defaultWarehouseId).manager,date:d,bucket:'received'})}
  });
  // reserved quantities
  stock.forEach(r=>{if(r.qty>10&&R()<.45)r.reserved=Math.round(r.qty*(0.04+R()*0.1))});
  // open & in-flight documents (recent)
  const D=(dd,h)=>new Date(2026,9,dd,h||ri(8,16),ri(0,59));
  for(let k=0;k<4;k++)seedGRN(D(20+k),{poOnly:true});
  purchaseOrders.filter(p=>p.status==='Open').forEach(p=>{p.expected=addDays(TODAY,ri(1,9))});
  seedGRN(D(19,8),{status:'Draft'});seedGRN(D(17),{status:'Pending QC'});seedGRN(D(18),{status:'Pending QC'});seedGRN(D(16),{status:'Accepted'});
  seedTransfer(D(19,9),'Draft');seedTransfer(D(17),'Submitted');seedTransfer(D(18),'Submitted');seedTransfer(D(16),'Approved');seedTransfer(D(15),'In Transit');seedTransfer(D(12),'Rejected');
  seedAdj(D(19,9),'Draft');seedAdj(D(17),'Submitted','Damage');seedAdj(D(18),'Submitted','Correction');seedAdj(D(16),'Approved','Found Stock');seedAdj(D(10),'Rejected','Loss');
  seedIssue(D(19,9),'Requested');seedIssue(D(18),'Requested');seedIssue(D(17),'Approved');seedIssue(D(16),'Picked');
  seedSale(D(18),'Open');seedSale(D(19,9),'Open');seedSale(D(17),'Open');
  // stock counts
  stockCounts.push({id:uid('CNT'),no:nextNo('CNT'),date:D(9),warehouseId:'W2',zone:'B',status:'Completed',countedBy:'Priya Nair',lines:stock.filter(s=>s.warehouseId==='W2').slice(0,6).map(s=>({productId:s.productId,system:s.qty,counted:s.qty})),adjNo:''});
  stockCounts.push({id:uid('CNT'),no:nextNo('CNT'),date:D(19,8),warehouseId:'W1',zone:'A',status:'In Progress',countedBy:'Daniel Reyes',lines:stock.filter(s=>s.warehouseId==='W1').slice(0,8).map((s,i)=>({productId:s.productId,system:s.qty,counted:i<4?s.qty+(i===1?-2:(i===3?1:0)):null})),adjNo:''});
  // price history
  products.forEach(p=>{p.priceHistory=[];let c=+(p.cost*(0.9+R()*0.05)).toFixed(2),s=+(p.price*(0.93)).toFixed(2);const dts=[new Date(2025,11,1),new Date(2026,3,1),new Date(2026,7,1)];dts.forEach((d,i)=>{const nc=i===2?p.cost:+(c*(1+R()*0.05)).toFixed(2);const ns=i===2?p.price:+(s*(1+R()*0.04)).toFixed(2);p.priceHistory.push({date:d,cost:nc,price:ns,oldCost:c,oldPrice:s,user:i===2?'Mia Thompson':'Daniel Reyes',reason:['Annual supplier price review','Freight surcharge update','Q3 contract renewal'][i]});c=nc;s=ns})});
  // product audit seeds
  products.slice(0,36).forEach((p,i)=>{logAudit('Inventory','Created',p.sku,'—','Product created',p.createdBy,p.createdAt);if(i%3===0)logAudit('Inventory','Updated',p.sku,'Reorder level: '+Math.round(p.reorder*.8),'Reorder level: '+p.reorder,'Daniel Reyes',addDays(TODAY,-ri(3,30)))});
  products.slice(36).forEach(p=>logAudit('Inventory','Created',p.sku,'—','Product created',p.createdBy,p.createdAt));
  audit.push({id:uid('A'),date:new Date(2026,9,19,10,45),user:'Admin',module:'Inventory',action:'Updated',record:'ELC-10045',oldV:'Qty: 50',newV:'Qty: 75',ip:'10.24.0.10'});
  logAudit('Settings','Updated','Costing method','Moving average','Standard cost','Admin',new Date(2026,6,1,7,0));
  logAudit('Security','Login','Alex Morgan','—','Signed in','Alex Morgan',new Date(2026,9,19,8,2));
  audit.sort((a,b)=>b.date-a.date);
  ledger.sort((a,b)=>a.date-b.date);
})();

const notifications=[
 {id:1,type:'danger',icon:'alert',text:'Fiber Patch Cord LC-LC 5m is out of stock in all warehouses.',time:new Date(2026,9,19,9,12),route:'low-stock',unread:true},
 {id:2,type:'warning',icon:'clipboard',text:'2 goods receipts are waiting for quality check.',time:new Date(2026,9,19,8,40),route:'grn',unread:true},
 {id:3,type:'primary',icon:'transfer',text:'2 stock transfers need your approval.',time:new Date(2026,9,18,17,5),route:'stock-transfer',unread:true},
 {id:4,type:'warning',icon:'hourglass',text:'Batches of Isopropyl Alcohol 99% expire within 30 days.',time:new Date(2026,9,18,7,0),route:'expiry',unread:true},
 {id:5,type:'primary',icon:'layers',text:'Stock adjustments are pending approval in Dallas and Newark.',time:new Date(2026,9,17,15,22),route:'stock-adjustment',unread:false},
 {id:6,type:'success',icon:'checkCircle',text:'Cycle count at Dallas Distribution Center completed with no variances.',time:new Date(2026,9,9,16,30),route:'stock-count',unread:false}
];
const SETTINGS={org:'Kagami Industries, Inc.',legal:'Kagami Industries, Inc.',taxId:'84-2913376',currency:'USD',timezone:'America/Chicago',dateFormat:'DD MMM YYYY',fiscal:'January',costing:'Standard cost',negative:false,adjApproval:true,adjLimit:2500,trfApproval:true,qcRequired:true,expiryWarn:30,prefixes:{GRN:'GRN',TRF:'TRF',ADJ:'ADJ',GI:'GI'},notifyLow:true,notifyExpiry:true,notifyApproval:true,digest:'Daily',density:'comfortable',lang:'English (US)',landing:'inventory'};

/* =========================================================
   STATUS AND CELL HELPERS
   ========================================================= */
function stockStatus(qty,reorder,max){if(qty<=0)return 'Out of Stock';if(qty<=reorder*0.5)return 'Critical';if(qty<=reorder)return 'Low Stock';if(max&&qty>max)return 'Overstock';return 'Healthy'}
const pStatus=p=>stockStatus(productQty(p.id),p.reorder,p.max);
function rowStatus(r){const p=P_BY(r.productId);const n=stock.filter(s=>s.productId===r.productId).length||1;return stockStatus(r.qty,p.reorder/n,p.max/n)}
const stockValue=()=>sum(stock,s=>s.qty*P_BY(s.productId).cost);
const pValue=p=>productQty(p.id)*p.cost;
const whStock=wid=>stock.filter(s=>s.warehouseId===wid&&s.qty>0);
const whValue=wid=>sum(whStock(wid),s=>s.qty*P_BY(s.productId).cost);
const uomName=c=>{const u=units.find(u=>u.code===c);return u?u.name:c};
const CAT_COLORS={C01:['#B8430E','#FEF0E8'],C02:['#0E7490','#ECFDFF'],C03:['#B54708','#FFFAEB'],C04:['#5925DC','#F4F3FF'],C05:['#475467','#F2F4F7'],C06:['#1D4ED8','#EFF4FF'],C07:['#067647','#ECFDF3'],C08:['#C11574','#FDF2FA'],C09:['#1D2939','#EAECF0']};
function thumb(p){const c=CAT_COLORS[p.categoryId]||['#475467','#F2F4F7'];return '<span class="thumb" style="color:'+c[0]+';background:'+c[1]+'">'+esc(initials(p.name.replace(/[^A-Za-z ]/g,'')))+'</span>'}
function prodCell(p,sub){if(!p)return '<span class="muted">Deleted product</span>';return '<div class="cell-main">'+thumb(p)+'<div style="min-width:0"><b><a class="link" style="color:var(--text);font-weight:600" href="#/product-view/'+p.id+'">'+esc(p.name)+'</a></b><small>'+esc(sub!=null?sub:p.sku)+'</small></div></div>'}
function whCell(w){return w?'<div class="cell-main"><div><b>'+esc(w.name)+'</b><small>'+esc(w.code)+'</small></div></div>':'—'}
function userCell(u){return '<div class="row" style="gap:8px"><span class="avatar" style="width:24px;height:24px;font-size:10px">'+esc(initials(u))+'</span><span class="nowrap">'+esc(u)+'</span></div>'}

/* =========================================================
   DOCUMENT FLOWS
   ========================================================= */
const FLOWS={
  transfer:{steps:['Draft','Submitted','Approved','In Transit','Received','Completed'],idx:s=>({Draft:0,Submitted:1,Approved:2,'In Transit':3,Received:4,Completed:6,Rejected:1,Cancelled:0}[s]),err:s=>s==='Rejected'?2:(s==='Cancelled'?0:null)},
  adjustment:{steps:['Draft','Submitted','Approval','Posted'],idx:s=>({Draft:0,Submitted:2,Approved:3,Posted:4,Rejected:2,Cancelled:0}[s]),err:s=>s==='Rejected'?2:(s==='Cancelled'?0:null)},
  grn:{steps:['Purchase Order','Goods Receipt','Quality Check','Accepted','Putaway','Available Stock'],idx:s=>({Draft:1,'Pending QC':2,Accepted:4,Completed:6,Rejected:2,Cancelled:1}[s]),err:s=>s==='Rejected'?2:(s==='Cancelled'?1:null)},
  issue:{steps:['Request','Approval','Pick','Issue','Stock Deduction'],idx:s=>({Requested:1,Approved:2,Picked:3,Issued:5,Rejected:1,Cancelled:1}[s]),err:s=>s==='Rejected'||s==='Cancelled'?1:null}
};
function flowFor(kind,status,meta){const f=FLOWS[kind];return stepperHTML(f.steps,f.idx(status),{error:f.err(status),meta})}
function histMeta(doc,kind){const map={transfer:{Draft:0,Submitted:1,Approved:2,'In Transit':3,Received:4,Completed:5},adjustment:{Draft:0,Submitted:1,Approved:2,Posted:3},grn:{Draft:1,'Pending QC':2,Accepted:3,Completed:5},issue:{Requested:0,Approved:1,Picked:2,Issued:4}}[kind];const m=[];(doc.history||[]).forEach(h=>{if(map[h.status]!=null)m[map[h.status]]=fmtD(h.date)});if(kind==='grn'&&doc.status==='Completed')m[4]=m[5];if(kind==='issue'&&doc.status==='Issued')m[3]=m[4];return m}
function timelineHTML(history){if(!history||!history.length)return '<p class="muted">No activity recorded.</p>';return '<div class="timeline">'+history.slice().reverse().map(h=>{const t=TONE[h.status];const cls=t==='success'?'t-success':(t==='danger'?'t-danger':(t==='warning'?'t-warning':'t-primary'));return '<div class="tl-item"><span class="tl-dot '+cls+'">'+icon(t==='danger'?'x':(t==='success'?'check':'clock'),13)+'</span><div class="tl-body"><b>'+esc(h.status)+'</b> by '+esc(h.user)+(h.note?'<div class="muted">'+esc(h.note)+'</div>':'')+'<small>'+fmtDT(h.date)+'</small></div></div>'}).join('')+'</div>'}


/* =========================================================
   MENU SECTIONS, SEARCH AND QUICK CREATE
   Merged into the design system menu while the module is on.
   ========================================================= */
const INV_NAV=[
 {label:'Dashboard',icon:'home',route:'dashboard'},
 {section:true,label:'Inventory',icon:'box',id:'sec-inv',children:[
  {label:'Overview',icon:'grid',route:'inventory'},
  {label:'Inventory Workflow',icon:'flow',route:'workflow'},
  {label:'Products',icon:'tag',id:'g-prod',children:[['Product List','products'],['Create Product','product-create'],['Product Categories','categories'],['Product Units','units']]},
  {label:'Warehouses',icon:'warehouse',id:'g-wh',children:[['Warehouse List','warehouses'],['Storage Locations','locations'],['Warehouse Stock','warehouse-stock']]},
  {label:'Stock Management',icon:'layers',id:'g-stock',children:[['Stock Overview','stock'],['Stock Ledger','ledger'],['Stock Adjustment','stock-adjustment'],['Stock Transfer','stock-transfer'],['Stock Count','stock-count']]},
  {label:'Goods Receipt',icon:'receive',id:'g-grn',children:[['GRN List','grn'],['Create GRN','grn-create']]},
  {label:'Goods Issue',icon:'issue',id:'g-gi',children:[['Issue List','goods-issue'],['Create Issue','issue-create']]},
  {label:'Inventory Planning',icon:'target',id:'g-plan',children:[['Reorder Levels','reorder'],['Low Stock','low-stock'],['Expiry Tracking','expiry']]},
  {label:'Reports',icon:'chart',id:'g-rep',children:[['Inventory Valuation','reports/valuation'],['Stock Movement','reports/movement'],['Stock Aging','reports/aging'],['Warehouse Report','reports/warehouse']]},
  {label:'Audit Log',icon:'shield',route:'audit'}
 ]},
 {sep:true},
 {label:'Purchasing',icon:'cart',route:'purchasing'},
 {label:'Sales',icon:'trending',route:'sales'}
];
const INV_PAGES=[['Inventory Dashboard','inventory'],['Inventory Workflow','workflow'],['Product List','products'],['Create Product','product-create'],['Product Categories','categories'],['Product Units','units'],['Warehouse List','warehouses'],['Storage Locations','locations'],['Warehouse Stock','warehouse-stock'],['Stock Overview','stock'],['Stock Ledger','ledger'],['Stock Adjustment','stock-adjustment'],['Stock Transfer','stock-transfer'],['Stock Count','stock-count'],['GRN List','grn'],['Create GRN','grn-create'],['Goods Issue List','goods-issue'],['Create Goods Issue','issue-create'],['Reorder Levels','reorder'],['Low Stock','low-stock'],['Expiry Tracking','expiry'],['Inventory Reports','reports/valuation'],['Audit Log','audit'],['Purchase Orders','purchasing'],['Sales Orders','sales'],['My Profile','profile']];
function sidebarFoot(){
  const used=sum(stock,s=>s.qty),cap=sum(warehouses.filter(w=>w.status==='Active'),w=>w.capacity);
  const pct=Math.round(used/cap*100);
  return '<div class="sb-foot"><div class="sb-card"><b>Network capacity</b>'+fmtN(used)+' units across '+warehouses.filter(w=>w.status==='Active').length+' active sites<div class="bar '+(pct>85?'d':pct>70?'w':'')+'"><i style="width:'+pct+'%"></i></div><div class="row between mt-8"><span>'+pct+'% utilized</span><a class="link" href="#/warehouses">View sites</a></div></div></div>';
}
function searchInventory(q){
  const res=[];
  const add=(group,items)=>{if(items.length)res.push([group,items])};
    add('Products',products.filter(p=>(p.name+' '+p.sku+' '+p.barcode+' '+p.brand).toLowerCase().includes(q)).map(p=>({icon:'tag',label:p.name,sub:p.sku,route:'product-view/'+p.id})));
    add('Warehouses',warehouses.filter(w=>(w.name+' '+w.code+' '+w.city).toLowerCase().includes(q)).map(w=>({icon:'warehouse',label:w.name,sub:w.code,route:'warehouse-view/'+w.id})));
    const docs=[].concat(grns.map(g=>({icon:'receive',label:g.no,sub:'Goods receipt · '+g.status,route:'grn-view/'+g.id,s:g.no+' '+g.supplier})),stockTransfers.map(t=>({icon:'transfer',label:t.no,sub:'Transfer · '+t.status,route:'transfer-view/'+t.id,s:t.no})),stockAdjustments.map(a=>({icon:'sliders',label:a.no,sub:'Adjustment · '+a.status,route:'adjustment-view/'+a.id,s:a.no+' '+a.type})),goodsIssues.map(g=>({icon:'issue',label:g.no,sub:'Goods issue · '+g.status,route:'issue-view/'+g.id,s:g.no+' '+g.department})),purchaseOrders.map(p=>({icon:'cart',label:p.no,sub:'Purchase order · '+p.status,route:'purchasing?q='+p.no,s:p.no+' '+p.supplier})));
    add('Documents',docs.filter(d=>d.s.toLowerCase().includes(q)));
  return res;
}
function quickCreateItems(){return[
  {label:'Product',icon:'tag',onClick:()=>navigate('product-create')},
  {label:'Goods receipt',icon:'receive',onClick:()=>navigate('grn-create')},
  {label:'Stock transfer',icon:'transfer',onClick:()=>navigate('transfer-create')},
  {label:'Stock adjustment',icon:'sliders',onClick:()=>navigate('adjustment-create')},
  {label:'Goods issue',icon:'issue',onClick:()=>navigate('issue-create')},
  '-',
  {label:'Warehouse',icon:'warehouse',onClick:()=>navigate('warehouse-create')},
  {label:'Category',icon:'folder',onClick:()=>categoryModal()}
]}

/* =========================================================
   ANALYTICS HELPERS
   ========================================================= */
function valueAt(date){const d=toD(date);return stockValue()-sum(ledger.filter(e=>e.date>d),e=>e.value)}
function qtyAt(pid,date,wid){const d=toD(date);const cur=wid?whQty(pid,wid):productQty(pid);return cur-sum(ledger.filter(e=>e.productId===pid&&(!wid||e.warehouseId===wid)&&e.date>d),e=>e.inQty-e.outQty)}
function weeks(n){const out=[];const end=new Date(NOW());end.setHours(23,59,59,0);for(let i=n-1;i>=0;i--)out.push(addDays(end,-7*i));return out}
const shortD=d=>String(toD(d).getDate()).padStart(2,'0')+' '+MON[toD(d).getMonth()];
const AGE_BUCKETS=['0–30 days','31–60 days','61–90 days','91–180 days','180+ days'];
const ageIdx=a=>a<=30?0:a<=60?1:a<=90?2:a<=180?3:4;
function agingRows(){const out=[];const now=NOW();stock.forEach(r=>{if(r.qty<=0)return;let rem=r.qty;const ins=ledger.filter(e=>e.productId===r.productId&&e.warehouseId===r.warehouseId&&e.inQty>0).sort((a,b)=>b.date-a.date);const b=[0,0,0,0,0];let oldest=null;for(const e of ins){if(rem<=0)break;const t=Math.min(e.inQty,rem);rem-=t;b[ageIdx(daysBetween(e.date,now))]+=t;oldest=e.date}if(rem>0)b[4]+=rem;out.push({row:r,b,oldest,age:oldest?daysBetween(oldest,now):999})});return out}
function outflow(pid,days,wid){const from=addDays(NOW(),-days);return sum(ledger.filter(e=>e.productId===pid&&(!wid||e.warehouseId===wid)&&e.date>=from&&(e.type==='Sales'||e.type==='Goods Issue')),e=>e.outQty)}
const onOrder=pid=>sum(purchaseOrders.filter(p=>p.status==='Open'||p.status==='Partially Received'),po=>sum(po.items.filter(i=>i.productId===pid),i=>Math.max(0,i.qty-i.received)));
const activeWh=()=>warehouses.filter(w=>w.status==='Active');
const whOptions=(all)=>(all?warehouses:activeWh()).map(w=>[w.id,w.name+' ('+w.code+')']);
const prodOptions=list=>(list||products.filter(p=>p.status!=='Inactive')).map(p=>[p.id,p.name+' — '+p.sku]);
function kpi(label,value,ic,tone,foot,route){return '<div class="card kpi" '+(route?'data-go="'+route+'" role="link" tabindex="0"':'')+'><div class="kpi-top"><span class="kpi-label">'+esc(label)+'</span><span class="kpi-ico t-'+tone+'">'+icon(ic,17)+'</span></div><div class="kpi-value">'+value+'</div><div class="kpi-foot">'+foot+'</div></div>'}
function deltaHTML(p,invert){const up=p>=0;const good=invert?!up:up;return '<span class="delta '+(good?'up':'down')+'">'+icon(up?'arrowUp':'arrowDown',12)+Math.abs(p).toFixed(1)+'%</span>'}

/* =========================================================
   WORKFLOW MODEL
   ========================================================= */
function workflowModel(){
  const now=NOW();
  const act=products.filter(p=>p.status==='Active');
  const openPO=purchaseOrders.filter(p=>p.status==='Open'||p.status==='Partially Received').length;
  const draftG=grns.filter(g=>g.status==='Draft').length,qc=grns.filter(g=>g.status==='Pending QC').length,put=grns.filter(g=>g.status==='Accepted').length;
  const rej=sum(grns.filter(g=>daysBetween(g.date,now)<=30&&g.status!=='Draft'),g=>sum(g.items,i=>i.rejected));
  const avail=sum(stock,s=>Math.max(0,s.qty-s.reserved));const outs=act.filter(p=>productQty(p.id)<=0).length;
  const trf=stockTransfers.filter(t=>['Submitted','Approved','In Transit'].includes(t.status)).length;
  const so=salesOrders.filter(s=>s.status==='Open').length;
  const gi=goodsIssues.filter(g=>['Requested','Approved','Picked'].includes(g.status)).length;
  const ded=sum(ledger.filter(e=>(e.type==='Sales'||e.type==='Goods Issue')&&daysBetween(e.date,now)<=30),e=>e.outQty);
  const main=[
    {t:'Product',ic:'tag',d:'Item master with units, pricing and reorder rules',m:act.length+' active products',s:'completed',r:'products'},
    {t:'Purchase Order',ic:'cart',d:'Buyer raises an order with the supplier',m:pl(openPO,'open purchase order'),s:openPO?'pending':'completed',r:'purchasing'},
    {t:'Goods Receipt',ic:'receive',d:'Dock team receives the delivery against the PO',m:pl(draftG,'receipt')+' in draft',s:draftG?'pending':'completed',r:'grn'},
    {t:'Quality Check',ic:'clipboard',d:'Inspection accepts or rejects each received line',m:qc+' awaiting inspection · '+rej+' units rejected in 30 days',s:rej?'error':(qc?'pending':'completed'),r:'grn'},
    {t:'Warehouse Putaway',ic:'inbox',d:'Accepted goods are stored in zones and bins',m:pl(put,'receipt')+' ready for putaway',s:put?'pending':'completed',r:'grn'},
    {t:'Available Stock',ic:'box',d:'On-hand quantity less reservations',m:fmtN(avail)+' units available · '+outs+' products out of stock',s:outs?'error':'completed',r:'stock'},
    {t:'Stock Transfer',ic:'transfer',d:'Rebalance stock between warehouses',m:pl(trf,'transfer')+' in progress',s:trf?'pending':'completed',r:'stock-transfer'},
    {t:'Sales Order',ic:'trending',d:'Customer orders reserve available stock',m:pl(so,'open order')+' reserving stock',s:so?'pending':'completed',r:'sales'},
    {t:'Goods Issue',ic:'issue',d:'Picking and dispatch from storage bins',m:pl(gi,'issue')+' awaiting completion',s:gi?'pending':'completed',r:'goods-issue'},
    {t:'Stock Deduction',ic:'minus',d:'Issued quantities leave on-hand stock',m:fmtN(ded)+' units deducted in 30 days',s:'completed',r:'ledger'},
    {t:'Inventory Ledger',ic:'book',d:'Every movement is posted with quantity and value',m:fmtN(ledger.length)+' ledger entries',s:'completed',r:'ledger'}
  ];
  const ad=stockAdjustments;
  const adj=[
    {t:'Stock Adjustment',ic:'sliders',d:'Record count variances, damage, loss or found stock',m:pl(ad.filter(a=>a.status==='Draft').length,'draft'),s:ad.some(a=>a.status==='Draft')?'pending':'completed',r:'stock-adjustment'},
    {t:'Approval',ic:'shield',d:'Inventory manager reviews value and evidence',m:ad.filter(a=>a.status==='Submitted').length+' awaiting approval · '+ad.filter(a=>a.status==='Rejected').length+' rejected',s:ad.some(a=>a.status==='Rejected')?'error':(ad.some(a=>a.status==='Submitted')?'pending':'completed'),r:'stock-adjustment'},
    {t:'Inventory Update',ic:'refresh',d:'Approved differences are posted to stock',m:ad.filter(a=>a.status==='Approved').length+' approved, ready to post',s:ad.some(a=>a.status==='Approved')?'pending':'completed',r:'stock-adjustment'},
    {t:'Inventory Ledger',ic:'book',d:'Adjustment entries carry value impact',m:fmtN(ledger.filter(e=>e.type==='Adjustment').length)+' adjustment entries',s:'completed',r:'ledger?type=Adjustment'}
  ];
  return{main,adj};
}
const WF_LABEL={completed:['Completed','success'],pending:['Pending','warning'],error:['Attention','danger'],active:['In progress','info']};
function flowListHTML(steps){return '<div class="flow">'+steps.map((s,i)=>(i?'<div class="flow-conn'+(steps[i-1].s==='completed'?' done':'')+'" aria-hidden="true"><span class="line"></span></div>':'')+'<button class="flow-card '+s.s+'" data-go="'+s.r+'"><span class="flow-num">'+String(i+1).padStart(2,'0')+'</span><span class="flow-ico">'+icon(s.ic,20)+'</span><span style="min-width:0"><span class="flow-title" style="display:block">'+esc(s.t)+'</span><span class="flow-desc" style="display:block">'+esc(s.d)+'</span><span class="flow-metric" style="display:block">'+esc(s.m)+'</span></span><span class="flow-side">'+badge(WF_LABEL[s.s][0],WF_LABEL[s.s][1])+'<span class="link" style="font-size:12.5px">Open</span></span></button>').join('')+'</div>'}
function flowStripHTML(steps){return '<div class="strip">'+steps.map((s,i)=>(i?'<span class="strip-arrow" aria-hidden="true">'+icon('chevRight',16)+'</span>':'')+'<button class="strip-step '+s.s+'" data-go="'+s.r+'" title="'+esc(s.m)+'"><span class="n">Step '+(i+1)+'</span><span class="row" style="gap:6px;color:var(--text-muted)">'+icon(s.ic,16)+'<span class="t" style="color:var(--text)">'+esc(s.t)+'</span></span><span class="m">'+esc(WF_LABEL[s.s][0])+'</span></button>').join('')+'</div>'}
const legendWF='<div class="legend"><span><i style="background:var(--success)"></i>Completed — nothing waiting</span><span><i style="background:var(--warning)"></i>Pending — documents waiting</span><span><i style="background:var(--danger)"></i>Attention — exceptions to resolve</span></div>';

/* =========================================================
   PAGE: DASHBOARD
   ========================================================= */
function pageDashboard(param,q,isHome){
  const act=products.filter(p=>p.status==='Active');
  const totalQty=sum(stock,s=>s.qty),val=stockValue(),val30=valueAt(addDays(NOW(),-30));
  const low=act.filter(p=>['Low Stock','Critical'].includes(pStatus(p))),out=act.filter(p=>pStatus(p)==='Out of Stock');
  const pg=grns.filter(g=>['Draft','Pending QC','Accepted'].includes(g.status)),pt=stockTransfers.filter(t=>['Draft','Submitted','Approved','In Transit'].includes(t.status));
  const pa=stockAdjustments.filter(a=>['Draft','Submitted','Approved'].includes(a.status));const m0=new Date(NOW().getFullYear(),NOW().getMonth(),1);
  const postedMonth=stockAdjustments.filter(a=>a.status==='Posted'&&a.postedAt>=m0).length;
  const ws=weeks(16);const trend=ws.map(d=>valueAt(d));
  const w8=weeks(8);const mvIn=[],mvOut=[];w8.forEach(d=>{const s=addDays(d,-7);const es=ledger.filter(e=>e.date>s&&e.date<=d&&e.type!=='Transfer'&&e.type!=='Opening Balance');mvIn.push(sum(es,e=>e.inQty));mvOut.push(sum(es,e=>e.outQty))});
  const COLS=['var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)','var(--c6)'];
  const dist=activeWh().map((w,i)=>({label:w.name,value:whValue(w.id),color:COLS[i%6]}));
  const movers=act.map(p=>({p,v:outflow(p.id,30)})).sort((a,b)=>b.v-a.v).slice(0,6);
  const ag=agingRows();const agB=[0,0,0,0,0];ag.forEach(a=>a.b.forEach((q,i)=>agB[i]+=q*P_BY(a.row.productId).cost));
  const wf=workflowModel();
  const lowList=act.filter(p=>['Low Stock','Critical','Out of Stock'].includes(pStatus(p))).sort((a,b)=>productQty(a.id)/a.reorder-productQty(b.id)/b.reorder).slice(0,7);
  const recent=ledger.slice(-8).reverse();
  const qa=(ic,l,s,r)=>'<button class="qa" data-go="'+r+'"><span class="qa-ico">'+icon(ic,17)+'</span><span>'+icon('plus',13).replace('class="i"','class="i" style="display:inline;vertical-align:-2px"')+' '+esc(l)+'<small>'+esc(s)+'</small></span></button>';
  const body=
   '<div class="quick mb-16">'+qa('tag','Create Product','Add an item to the catalog','product-create')+qa('receive','Receive Stock','Record a goods receipt','grn-create')+qa('transfer','Stock Transfer','Move stock between sites','transfer-create')+qa('sliders','Stock Adjustment','Correct on-hand quantity','adjustment-create')+qa('issue','Goods Issue','Issue stock to a department','issue-create')+'</div>'+
   '<div class="kpis">'+
     kpi('Total Products',fmtN(products.length),'tag','primary',act.length+' active · '+(products.length-act.length)+' draft or inactive','products')+
     kpi('Total Stock Quantity',fmtN(totalQty),'layers','purple',fmtN(sum(stock,s=>s.reserved))+' units reserved','stock')+
     kpi('Inventory Value',fmtK(val),'dollar','success',deltaHTML((val-val30)/val30*100)+' vs 30 days ago','reports/valuation')+
     kpi('Low Stock Items',fmtN(low.length),'alert','warning',low.filter(p=>pStatus(p)==='Critical').length+' critical, below 50% of reorder','low-stock')+
     kpi('Out of Stock',fmtN(out.length),'xCircle','danger',out.length?esc(out.map(p=>p.name).slice(0,1).join(''))+(out.length>1?' and '+(out.length-1)+' more':''):'Every active product has stock','low-stock')+
     kpi('Pending GRNs',fmtN(pg.length),'receive','primary',pg.filter(g=>g.status==='Pending QC').length+' awaiting quality check','grn')+
     kpi('Pending Transfers',fmtN(pt.length),'transfer','purple',pt.filter(t=>t.status==='Submitted').length+' need approval · '+pt.filter(t=>t.status==='In Transit').length+' in transit','stock-transfer')+
     kpi('Stock Adjustments',fmtN(pa.length),'sliders','warning',postedMonth+' posted this month','stock-adjustment')+
   '</div>'+
   card('Inventory workflow',flowStripHTML(wf.main),{cls:'mt-16',sub:'Live status of each stage from purchasing to the ledger',actions:'<a class="btn btn-sm" href="#/workflow">'+icon('flow',15)+'Full workflow</a>'})+
   '<div class="grid g-7-5 mt-16">'+
     card('Stock value trend',lineChart({labels:ws.map(shortD),series:[{name:'Inventory value',values:trend,color:'var(--c1)'}],fmt:v=>fmtM(v,0),fmtAxis:v=>fmtK(v),zero:false,h:230,title:'Inventory value by week'}),{sub:'Weekly closing value, last 16 weeks'})+
     card('Warehouse stock distribution',donut(dist,{fmt:fmtK,center:fmtK(val),centerSub:'Total value'}),{sub:'Share of inventory value by site'})+
   '</div>'+
   '<div class="grid g-7-5 mt-16">'+
     card('Stock movement',barChart({labels:w8.map(shortD),series:[{name:'Receipts',values:mvIn,color:'var(--c2)'},{name:'Issues and sales',values:mvOut,color:'var(--c1)'}],h:220,title:'Units received and issued by week'}),{sub:'Units in and out per week, transfers excluded'})+
     card('Top moving products',hbars(movers.map(m=>({html:'<a class="link" style="color:var(--text);font-weight:500" href="#/product-view/'+m.p.id+'">'+esc(m.p.name)+'</a>',value:m.v}))),{sub:'Units issued or sold, last 30 days'})+
   '</div>'+
   '<div class="grid g-2 mt-16">'+
     card('Low stock products','<div class="table-wrap auto"><table class="tbl compact"><thead><tr><th>Product</th><th class="right">Available</th><th class="right">Reorder</th><th>Status</th><th class="act"></th></tr></thead><tbody>'+(lowList.length?lowList.map(p=>'<tr><td>'+prodCell(p)+'</td><td class="right num">'+fmtN(productQty(p.id))+'</td><td class="right num muted">'+fmtN(p.reorder)+'</td><td>'+badge(pStatus(p))+'</td><td class="act"><button class="btn btn-sm" data-reorder="'+p.id+'">Reorder</button></td></tr>').join(''):'<tr><td colspan="5"><div class="empty"><h4>Stock levels are healthy</h4><p>No active product is below its reorder level.</p></div></td></tr>')+'</tbody></table></div>',{tight:true,sub:'Below reorder level, most urgent first',actions:'<a class="btn btn-sm btn-ghost" href="#/low-stock">View all</a>'})+
     card('Inventory aging',barChart({labels:AGE_BUCKETS,series:[{name:'Value',values:agB,color:'var(--c4)'}],colors:['var(--c2)','var(--c5)','var(--c1)','var(--c3)','var(--c6)'],fmt:v=>fmtM(v,0),fmtAxis:fmtK,h:230,legend:false,title:'Inventory value by age'}),{sub:'Value of on-hand stock by receipt age (FIFO)',actions:'<a class="btn btn-sm btn-ghost" href="#/reports/aging">Aging report</a>'})+
   '</div>'+
   '<div class="grid g-7-5 mt-16">'+
     card('Warehouse summary','<div id="whSummary"></div>',{tight:true,sub:'Stock position by active site',actions:'<a class="btn btn-sm btn-ghost" href="#/warehouses">All warehouses</a>'})+
     card('Recent transactions','<div class="table-wrap auto"><table class="tbl compact"><thead><tr><th>Transaction</th><th>Product</th><th class="right">Qty</th></tr></thead><tbody>'+recent.map(e=>{const p=P_BY(e.productId);return '<tr class="clickable" data-le="'+e.id+'"><td><b class="mono" style="font-weight:600">'+esc(e.txNo)+'</b><div class="muted" style="font-size:12px">'+esc(e.type)+' · '+relTime(e.date)+'</div></td><td><span class="nowrap" style="display:block;max-width:220px;overflow:hidden;text-overflow:ellipsis">'+esc(p?p.name:'—')+'</span><span class="muted" style="font-size:12px">'+esc(W_BY(e.warehouseId).code)+'</span></td><td class="right num '+(e.inQty?'pos':'neg')+'">'+(e.inQty?'+'+fmtN(e.inQty):'−'+fmtN(e.outQty))+'</td></tr>'}).join('')+'</tbody></table></div>',{tight:true,sub:'Latest ledger postings',actions:'<a class="btn btn-sm btn-ghost" href="#/ledger">Stock ledger</a>'})+
   '</div>';
  return{title:'Inventory Dashboard',nav:isHome?'dashboard':'inventory',crumbs:isHome?[['Dashboard']]:[['Inventory','inventory'],['Overview']],
    sub:'Stock position, workflow status and movements across '+activeWh().length+' active warehouses. Figures as of '+fmtDT(NOW())+'.',
    actions:btn('Refresh','refresh','','data-refresh')+btn('Reports','chart','','data-go="reports/valuation"')+btn('Create','plus','primary','data-qc'),
    body,mount(page){
      $('[data-refresh]',page).onclick=()=>{renderRoute();toast('success','Dashboard refreshed','Figures recalculated from the latest postings.')};
      $('[data-qc]',page).onclick=e=>openMenu(e.currentTarget,quickCreateItems());
      $$('[data-reorder]',page).forEach(b=>b.onclick=()=>raisePO(P_BY(b.dataset.reorder)));
      $$('[data-le]',page).forEach(r=>r.onclick=()=>ledgerDrawer(ledger.find(e=>e.id===r.dataset.le)));
      mountTable(page,'#whSummary',{search:false,noToolbar:true,paginate:false,auto:true,loading:false,columns:whColumns().filter(c=>['code','name','products','qty','value','util'].includes(c.key)),data:()=>activeWh(),onRowClick:w=>navigate('warehouse-view/'+w.id),
        footer:rs=>['<b>Total</b>','',fmtN(sum(rs,w=>whStock(w.id).length)),fmtN(sum(rs,w=>sum(whStock(w.id),s=>s.qty))),fmtM(sum(rs,w=>whValue(w.id)),0),'']});
    }};
}
ROUTES.dashboard=(p,q)=>pageDashboard(p,q,true);
ROUTES.inventory=(p,q)=>pageDashboard(p,q,false);

/* =========================================================
   PAGE: WORKFLOW
   ========================================================= */
ROUTES.workflow=()=>{
  const wf=workflowModel();
  const dist=(name,list,flow,route)=>{const c={};list.forEach(d=>c[d.status]=(c[d.status]||0)+1);return '<div style="padding:14px 0;border-bottom:1px solid var(--border)"><div class="row between"><b style="font-weight:600">'+name+'</b><a class="link" style="font-size:12.5px" href="#/'+route+'">Open list</a></div><div class="row wrap mt-8" style="gap:6px">'+flow.map(s=>'<span class="chip">'+esc(s)+' <b class="num" style="margin-left:6px;color:var(--text)">'+(c[s]||0)+'</b></span>').join('')+'</div></div>'};
  return{title:'Inventory Workflow',crumbs:[['Inventory','inventory'],['Inventory Workflow']],sub:'How stock moves from the item master to the ledger. Each stage shows live counts; select a stage to open the documents behind it.',
    actions:btn('Refresh','refresh','','data-go="workflow"'),
    body:'<div class="grid g-7-5"><div class="stack">'+card('Procure-to-issue flow',legendWF+'<div class="mt-16">'+flowListHTML(wf.main)+'</div>',{sub:'11 stages, purchasing to inventory ledger'})+'</div><div class="stack">'+
      card('Stock adjustment flow',flowListHTML(wf.adj),{sub:'Corrections require approval before posting'})+
      card('Document status',dist('Stock transfers',stockTransfers,['Draft','Submitted','Approved','In Transit','Received','Completed','Rejected'],'stock-transfer')+dist('Stock adjustments',stockAdjustments,['Draft','Submitted','Approved','Posted','Rejected'],'stock-adjustment')+dist('Goods receipts',grns,['Draft','Pending QC','Accepted','Completed'],'grn')+'<div style="padding-top:14px">'+dist('Goods issues',goodsIssues,['Requested','Approved','Picked','Issued','Rejected'],'goods-issue').replace('border-bottom:1px solid var(--border)','')+'</div>',{sub:'Documents by lifecycle stage'})+
    '</div></div>'};
};

/* =========================================================
   PRODUCTS
   ========================================================= */
function productWarehouses(p){return stock.filter(s=>s.productId===p.id&&s.qty>0).map(s=>s.warehouseId)}
function productColumns(){return[
  {key:'sku',label:'SKU',render:p=>'<span class="mono">'+esc(p.sku)+'</span>'},
  {key:'name',label:'Product',render:p=>'<div class="cell-main">'+thumb(p)+'<div style="min-width:0"><b><a class="link" style="color:var(--text);font-weight:600" href="#/product-view/'+p.id+'">'+esc(p.name)+'</a></b><small>'+esc(p.brand)+' · '+esc(p.sub)+(p.status!=='Active'?' · <span style="color:var(--warning-text)">'+esc(p.status)+'</span>':'')+'</small></div></div>',value:p=>p.name+' '+p.brand},
  {key:'category',label:'Category',value:p=>CAT_BY(p.categoryId).name},
  {key:'warehouse',label:'Warehouse',value:p=>W_BY(p.defaultWarehouseId).code,render:p=>{const ws=productWarehouses(p);const d=W_BY(p.defaultWarehouseId);return '<span class="chip">'+esc(d.code)+'</span>'+(ws.filter(w=>w!==d.id).length?' <span class="muted" style="font-size:12px" title="'+esc(ws.map(w=>W_BY(w).code).join(', '))+'">+'+ws.filter(w=>w!==d.id).length+'</span>':'')}},
  {key:'avail',label:'Available Qty',align:'right',value:p=>productQty(p.id)-productReserved(p.id),render:p=>'<b style="font-weight:600">'+fmtN(productQty(p.id)-productReserved(p.id))+'</b> <span class="muted" style="font-size:12px">'+esc(p.uom)+'</span>'},
  {key:'reserved',label:'Reserved Qty',align:'right',value:p=>productReserved(p.id),render:p=>fmtN(productReserved(p.id))},
  {key:'reorder',label:'Reorder Level',align:'right',render:p=>fmtN(p.reorder)},
  {key:'cost',label:'Unit Cost',align:'right',render:p=>fmtM(p.cost)},
  {key:'value',label:'Stock Value',align:'right',value:p=>pValue(p),render:p=>fmtM(pValue(p))},
  {key:'status',label:'Status',value:pStatus,render:p=>badge(pStatus(p))}
]}
function deleteProduct(p,after){
  const tx=ledger.filter(e=>e.productId===p.id).length,q=productQty(p.id);
  const openDocs=[].concat(stockTransfers.filter(t=>!['Completed','Rejected','Cancelled'].includes(t.status)&&t.items.some(i=>i.productId===p.id)),grns.filter(g=>g.status!=='Completed'&&g.items.some(i=>i.productId===p.id)));
  if(tx||q>0||openDocs.length){
    openModal({type:'warning',title:'This product can’t be deleted',size:'sm',body:'<p>This product cannot be deleted because inventory transactions exist.</p><div class="callout"><b>'+esc(p.name)+'</b> ('+esc(p.sku)+') has '+fmtN(tx)+' ledger '+(tx===1?'entry':'entries')+', '+fmtN(q)+' units on hand'+(openDocs.length?' and '+openDocs.length+' open documents':'')+'. Set the product to Inactive to block new transactions.</div>',
      actions:[{label:'Close'},{label:'View Transactions',variant:'primary',icon:'history',onClick:()=>navigate('ledger?product='+p.id)}]});
    return;
  }
  confirmDialog({danger:true,title:'Delete product?',message:'Are you sure you want to delete “'+esc(p.name)+'”?<br>This action cannot be undone.',note:'<span class="mono">'+esc(p.sku)+'</span> · '+esc(CAT_BY(p.categoryId).name)+' · no stock or transactions',confirm:'Delete Product'}).then(ok=>{
    if(!ok)return;products.splice(products.indexOf(p),1);for(let i=stock.length-1;i>=0;i--)if(stock[i].productId===p.id)stock.splice(i,1);
    logAudit('Inventory','Deleted',p.sku,p.name,'—');toast('success','Product deleted','“'+p.name+'” was removed from the catalog.');after&&after();
  });
}
function productActions(p,refresh){return[
  {label:'View',icon:'eye',onClick:()=>navigate('product-view/'+p.id)},
  {label:'Edit',icon:'edit',onClick:()=>navigate('product-edit/'+p.id)},
  {label:'Duplicate',icon:'copy',onClick:()=>navigate('product-create?from='+p.id)},
  {label:'Stock History',icon:'history',onClick:()=>navigate('ledger?product='+p.id)},
  '-',
  {label:'Delete',icon:'trash',danger:true,onClick:()=>deleteProduct(p,refresh)}
]}
ROUTES.products=(param,q)=>{
  const cnt=products.length;
  return{title:'Products',crumbs:[['Inventory','inventory'],['Products','products'],['Product List']],sub:cnt+' products in the catalog · '+fmtM(stockValue(),0)+' on hand',
    actions:btn('Import','receive','','data-import')+btn('Create Product','plus','primary','data-go="product-create"'),
    body:'<section class="card" id="prodTable"></section>',
    mount(page){
      $('[data-import]',page).onclick=()=>openModal({type:'info',icon:'receive',title:'Import products',subtitle:'Bulk-load items from a spreadsheet',indent:false,body:'<p>Upload a CSV with columns <span class="mono">sku, name, category, uom, cost, price, reorder_level</span>. Rows with an existing SKU update that product.</p><div class="callout mt-16"><b>Template</b><br><span class="mono">sku,name,category,uom,cost,price,reorder_level<br>ELC-10099,USB-C Hub 7-port,Electronics,EA,24.50,39.00,40</span></div>',actions:[{label:'Close'},{label:'Copy template',variant:'primary',icon:'copy',onClick:()=>{try{navigator.clipboard.writeText('sku,name,category,uom,cost,price,reorder_level')}catch(e){}toast('success','Template copied','Paste it into your spreadsheet to start.')}}]});
      const since=d=>p=>daysBetween(p.updatedAt,NOW())<=+d;
      const t=mountTable(page,'#prodTable',{title:'Products',selectable:true,searchPlaceholder:'Search SKU, name, brand',q:q.q||'',
        columns:productColumns(),data:()=>products,
        filters:[
          {key:'cat',label:'All categories',options:categories.map(c=>[c.id,c.name]),value:q.category||'',test:(p,v)=>p.categoryId===v},
          {key:'wh',label:'All warehouses',options:whOptions(true).map(o=>[o[0],o[1].split(' (')[0]]),test:(p,v)=>p.defaultWarehouseId===v||productWarehouses(p).includes(v)},
          {key:'st',label:'Any status',options:['Active','Draft','Inactive'],test:(p,v)=>p.status===v},
          {key:'stock',label:'Any stock level',options:['Healthy','Low Stock','Critical','Out of Stock','Overstock'],value:q.stock||'',test:(p,v)=>pStatus(p)===v},
          {key:'date',label:'Updated any time',options:[['7','Updated in 7 days'],['30','Updated in 30 days'],['90','Updated in 90 days']],test:(p,v)=>since(v)(p)}
        ],
        actions:p=>productActions(p,()=>t.refresh()),onRowClick:p=>navigate('product-view/'+p.id),
        bulkActions:[
          {label:'Mark active',icon:'checkCircle',onClick:ids=>{ids.forEach(id=>{const p=P_BY(id);if(p&&p.status!=='Active'){logAudit('Inventory','Updated',p.sku,'Status: '+p.status,'Status: Active');p.status='Active';p.updatedAt=NOW();p.updatedBy=CURRENT_USER.name}});toast('success','Products updated',ids.length+' products set to Active.');t.clearSelection()}},
          {label:'Mark inactive',icon:'ban',onClick:ids=>{ids.forEach(id=>{const p=P_BY(id);if(p&&p.status!=='Inactive'){logAudit('Inventory','Updated',p.sku,'Status: '+p.status,'Status: Inactive');p.status='Inactive';p.updatedAt=NOW();p.updatedBy=CURRENT_USER.name}});toast('success','Products updated',ids.length+' products set to Inactive.');t.clearSelection()}},
          {label:'Export selected',icon:'export',onClick:ids=>exportCSV('Selected products',productColumns(),products.filter(p=>ids.includes(p.id)))},
          {label:'Delete',icon:'trash',danger:true,onClick:ids=>{const sel=products.filter(p=>ids.includes(p.id));const ok=sel.filter(p=>!ledger.some(e=>e.productId===p.id)&&productQty(p.id)<=0);const blocked=sel.length-ok.length;
            if(!ok.length){openModal({type:'warning',title:'Selected products can’t be deleted',size:'sm',body:'<p>All '+sel.length+' selected products have inventory transactions or stock on hand. Set them to Inactive instead.</p>',actions:[{label:'Close',variant:'primary'}]});return}
            confirmDialog({danger:true,title:'Delete '+ok.length+' product'+(ok.length>1?'s':'')+'?',message:ok.map(p=>'“'+esc(p.name)+'”').join(', ')+' will be permanently deleted. This action cannot be undone.',note:blocked?blocked+' other selected product'+(blocked>1?'s have':' has')+' transactions and will be kept.':'',confirm:'Delete Products'}).then(y=>{if(!y)return;ok.forEach(p=>{products.splice(products.indexOf(p),1);logAudit('Inventory','Deleted',p.sku,p.name,'—')});toast('success','Products deleted',ok.length+' deleted'+(blocked?', '+blocked+' kept':'')+'.');t.clearSelection()})}}
        ],emptyTitle:'No products yet',emptyText:'Create your first product to start tracking stock.',emptyAction:{label:'Create Product',onClick:()=>navigate('product-create')}});
    }};
};

/* ---------- product form ---------- */
function sectionHead(n,t,d){return '<div class="form-section-head"><span class="fs-num">'+n+'</span><div><h3 class="form-section-title">'+esc(t)+'</h3><p class="form-section-desc">'+esc(d)+'</p></div></div>'}
function productSections(p,mode){
  const v=k=>p?p[k]:undefined;const cat=p?CAT_BY(p.categoryId):null;const wid=(p&&p.defaultWarehouseId)||'W1';
  const editing=mode==='edit';
  const S={
  basic:'<div class="form-grid">'+
    F({name:'name',label:'Product Name',req:true,span:6,value:v('name'),ph:'e.g. Premium Laptop 14-inch'})+
    F({name:'sku',label:'SKU',req:true,span:3,value:v('sku'),pattern:'^[A-Z0-9-]{4,20}$',patternMsg:'Use 4–20 uppercase letters, digits or hyphens',hint:'Unique stock-keeping unit'})+
    F({name:'barcode',label:'Barcode',span:3,value:v('barcode'),pattern:'^[0-9]{8,14}$',patternMsg:'Barcode must be 8 to 14 digits',ph:'EAN or UPC'})+
    F({name:'code',label:'Product Code',span:3,value:v('code'),ph:'PRD-0000'})+
    F({name:'categoryId',label:'Category',type:'select',req:true,span:3,value:v('categoryId'),options:categories.filter(c=>c.status==='Active').map(c=>[c.id,c.name])})+
    F({name:'sub',label:'Subcategory',type:'select',span:3,value:v('sub'),options:cat?cat.subs:[],placeholder:'Select subcategory'})+
    F({name:'brand',label:'Brand',span:3,value:v('brand'),ph:'Manufacturer brand'})+
    F({name:'type',label:'Product Type',type:'select',req:true,span:3,value:v('type')||'Stockable',placeholder:false,options:['Stockable','Consumable','Service','Kit']})+
    F({name:'desc',label:'Description',type:'textarea',span:9,value:v('desc'),ph:'Specifications, packaging and handling notes',rows:2})+'</div>',
  inventory:'<div class="form-grid">'+
    F({name:'invType',label:'Inventory Type',type:'select',req:true,span:4,value:v('invType')||'Trading Goods',placeholder:false,options:['Trading Goods','Finished Goods','Raw Material','Spare Parts','Consumables']})+
    F({name:'uom',label:'Unit of Measure',type:'select',req:true,span:4,value:v('uom')||'EA',placeholder:false,options:units.filter(u=>u.status==='Active').map(u=>[u.code,u.name+' ('+u.code+')'])})+
    F({name:'opening',label:'Opening Stock',type:'number',span:4,min:0,value:editing?productQty(p.id):(mode==='dup'?0:0),readonly:editing,hint:editing?'Posted. Use a stock adjustment to change on-hand quantity.':'Posted to the default warehouse on save'})+
    F({name:'reorder',label:'Reorder Level',type:'number',req:true,span:3,min:0,value:v('reorder'),hint:'Triggers a low stock alert'})+
    F({name:'min',label:'Minimum Stock',type:'number',span:3,min:0,value:v('min')})+
    F({name:'max',label:'Maximum Stock',type:'number',span:3,min:0,value:v('max')})+
    F({name:'safety',label:'Safety Stock',type:'number',span:3,min:0,value:v('safety')})+'</div>',
  pricing:'<div class="form-grid">'+
    F({name:'cost',label:'Purchase Price',type:'number',req:true,span:3,min:0,step:'0.01',prefix:'$',value:v('cost')})+
    F({name:'price',label:'Selling Price',type:'number',req:true,span:3,min:0,step:'0.01',prefix:'$',value:v('price')})+
    F({name:'tax',label:'Tax',type:'select',span:2,value:v('tax')||'Standard 8.25%',placeholder:false,options:['Standard 8.25%','Reduced 5%','Exempt 0%']})+
    F({name:'discount',label:'Discount',type:'number',span:2,min:0,max:100,step:'0.5',suffix:'%',value:v('discount')||0})+
    F({name:'currency',label:'Currency',type:'select',span:2,value:v('currency')||'USD',placeholder:false,options:[['USD','USD — US dollar'],['EUR','EUR — Euro'],['GBP','GBP — Pound'],['JPY','JPY — Yen']]})+
    '<div class="s-12" id="marginBox"></div></div>',
  warehouse:'<div class="form-grid">'+
    F({name:'defaultWarehouseId',label:'Default Warehouse',type:'select',req:true,span:4,value:wid,placeholder:false,options:whOptions()})+
    F({name:'defaultLocationId',label:'Storage Location',type:'select',span:4,value:v('defaultLocationId'),options:locsOf(wid).map(l=>[l.id,l.code+' · '+l.zoneName]),placeholder:'Select location'})+
    F({name:'bin',label:'Bin',span:2,value:v('bin'),ph:'B01'})+
    F({name:'openingMirror',label:'Opening Stock',type:'number',span:2,readonly:true,value:editing?productQty(p.id):0,hint:'From inventory section'})+'</div>',
  settings:'<div class="form-grid">'+
    F({name:'track',label:'Track Inventory',type:'toggle',span:4,value:p?p.track:true,hint:'Maintain on-hand quantity and ledger'})+
    F({name:'batch',label:'Batch Tracking',type:'toggle',span:4,value:v('batch'),hint:'Record batch or lot on receipts'})+
    F({name:'serial',label:'Serial Number Tracking',type:'toggle',span:4,value:v('serial'),hint:'Capture a serial per unit'})+
    F({name:'expiry',label:'Expiry Tracking',type:'toggle',span:4,value:v('expiry'),hint:'Require expiry date on receipt'})+
    F({name:'active',label:'Active',type:'toggle',span:4,value:p?p.status!=='Inactive':true,hint:'Inactive products cannot be transacted'})+
    F({name:'shelfLife',label:'Shelf Life',type:'number',span:4,min:0,suffix:'days',value:v('shelfLife')||'',hint:'Used to default expiry dates'})+'</div>'
  };
  return S;
}
function bindProductForm(form,p){
  const cat=$('[name=categoryId]',form),sub=$('[name=sub]',form),wh=$('[name=defaultWarehouseId]',form),loc=$('[name=defaultLocationId]',form),bin=$('[name=bin]',form);
  cat.addEventListener('change',()=>{const c=CAT_BY(cat.value);sub.innerHTML=optionsHTML(c?c.subs:[],'', 'Select subcategory');const sk=$('[name=sku]',form);if(c&&!p&&(!sk.value||/^[A-Z]{3}-\d+$/.test(sk.value))){skuCounters[c.code]=skuCounters[c.code]||10040;sk.value=c.code+'-'+(skuCounters[c.code]+1)}});
  wh.addEventListener('change',()=>{loc.innerHTML=optionsHTML(locsOf(wh.value).map(l=>[l.id,l.code+' · '+l.zoneName]),'','Select location');bin.value=''});
  loc.addEventListener('change',()=>{const l=L_BY(loc.value);if(l)bin.value=l.bin});
  const op=$('[name=opening]',form),mir=$('[name=openingMirror]',form);op.addEventListener('input',()=>mir.value=op.value||0);
  const exp=$('[name=expiry]',form),sl=$('[data-field=shelfLife]',form);const syncSl=()=>sl.style.display=exp.checked?'':'none';exp.addEventListener('change',syncSl);syncSl();
  const mb=$('#marginBox',form);const syncM=()=>{const c=+$('[name=cost]',form).value,s=+$('[name=price]',form).value,d=+$('[name=discount]',form).value||0;if(!c||!s){mb.innerHTML='<div class="hint">Enter purchase and selling prices to see the margin.</div>';return}const net=s*(1-d/100);const m=(net-c)/net*100;mb.innerHTML='<div class="alert '+(m<0?'alert-danger':m<15?'alert-warning':'alert-info')+'">'+icon(m<0?'alert':'info',16)+'<span>Net selling price <b>'+fmtM(net)+'</b> · Gross margin <b>'+m.toFixed(1)+'%</b> · Markup <b>'+((net-c)/c*100).toFixed(1)+'%</b>'+(m<0?' — selling below cost':'')+'</span></div>'};
  ['cost','price','discount'].forEach(n=>$('[name='+n+']',form).addEventListener('input',syncM));syncM();
}
function productValidate(form,p){return validateForm(form,err=>{const d=formData(form);
  if(d.sku&&products.some(x=>x.sku===d.sku&&x!==p))err('sku','SKU '+d.sku+' is already used by another product');
  if(d.barcode&&products.some(x=>x.barcode===d.barcode&&x!==p))err('barcode','Barcode is already assigned to another product');
  if(d.max!=null&&d.min!=null&&d.max<=d.min)err('max','Maximum stock must be greater than minimum stock');
  if(d.min!=null&&d.reorder!=null&&d.reorder<d.min)err('reorder','Reorder level should be at least the minimum stock');
  if(d.safety!=null&&d.reorder!=null&&d.safety>d.reorder)err('safety','Safety stock cannot exceed the reorder level');
  if(d.max!=null&&d.opening&&d.opening>d.max*2)err('opening','Opening stock is more than twice the maximum stock');
})}
function productFromForm(d,p){const o=p||{};Object.assign(o,{name:d.name,sku:d.sku,barcode:d.barcode,code:d.code,categoryId:d.categoryId,sub:d.sub,brand:d.brand,type:d.type,desc:d.desc,invType:d.invType,uom:d.uom,reorder:d.reorder||0,min:d.min||0,max:d.max||0,safety:d.safety||0,cost:d.cost,price:d.price,tax:d.tax,discount:d.discount||0,currency:d.currency,defaultWarehouseId:d.defaultWarehouseId,defaultLocationId:d.defaultLocationId||null,bin:d.bin,track:d.track,batch:d.batch,serial:d.serial,expiry:d.expiry,shelfLife:d.shelfLife||0});
  o.status=d.active?(o.status==='Inactive'||!o.status?'Active':o.status):'Inactive';return o}
ROUTES['product-create']=(param,q)=>{
  const src=q.from?P_BY(q.from):null;
  const base=src?Object.assign({},src,{name:'Copy of '+src.name,sku:'',barcode:'',code:'',status:'Active'}):null;
  const S=productSections(base,src?'dup':'create');
  const sec=(n,t,d,h)=>'<div class="form-section">'+sectionHead(n,t,d)+h+'</div>';
  return{title:src?'Duplicate Product':'Create Product',crumbs:[['Inventory','inventory'],['Products','products'],[src?'Duplicate Product':'Create Product']],
    sub:src?'Copying settings from <b>'+esc(src.name)+'</b> ('+esc(src.sku)+'). Stock and history are not copied.':'Add an item to the catalog. Fields marked <span class="req">*</span> are required.',
    actions:btn('Cancel','','','data-cancel'),
    body:'<form class="card" id="pform" novalidate>'+sec(1,'Basic Information','Identifiers and classification',S.basic)+sec(2,'Inventory Information','Units and stocking rules',S.inventory)+sec(3,'Pricing','Cost, price and tax',S.pricing)+sec(4,'Warehouse','Where the product is stored by default',S.warehouse)+sec(5,'Product Settings','Tracking and lifecycle',S.settings)+
      '<div class="form-actions"><span class="muted spacer" style="align-self:center;font-size:13px">'+(src?'Duplicate of '+esc(src.sku):'New product')+'</span>'+btn('Cancel','','','type="button" data-cancel')+btn('Save & New','','','type="button" data-save="new"')+btn('Save & Close','','','type="button" data-save="close"')+btn('Save','save','primary','type="submit"')+'</div></form>',
    mount(page){
      const form=$('#pform',page);bindProductForm(form,null);let dirty=false;form.addEventListener('input',()=>dirty=true);
      const save=how=>{if(!productValidate(form,null))return;const d=formData(form);
        const p=productFromForm(d,{id:'P'+String(Date.now()).slice(-6),createdBy:CURRENT_USER.name,createdAt:NOW(),updatedBy:CURRENT_USER.name,updatedAt:NOW(),priceHistory:[{date:NOW(),cost:d.cost,price:d.price,oldCost:null,oldPrice:null,user:CURRENT_USER.name,reason:'Initial price'}]});
        products.unshift(p);const c=CAT_BY(p.categoryId);const m=/-(\d+)$/.exec(p.sku);if(m&&p.sku.startsWith(c.code))skuCounters[c.code]=Math.max(skuCounters[c.code]||0,+m[1]);
        logAudit('Inventory','Created',p.sku,'—','Product created'+(src?' (duplicate of '+src.sku+')':''));
        if(d.opening>0){stockRow(p.id,p.defaultWarehouseId,true);const r=stockRow(p.id,p.defaultWarehouseId);if(p.defaultLocationId)r.locationId=p.defaultLocationId;postMovement({type:'Opening Balance',pid:p.id,wid:p.defaultWarehouseId,inQty:d.opening,txNo:'OB-'+p.sku,ref:'Opening stock',bucket:'opening',locationId:p.defaultLocationId});logAudit('Inventory','Updated',p.sku,'Qty: 0','Qty: '+d.opening)}
        dirty=false;toast('success','Product created','“'+p.name+'” ('+p.sku+') was added'+(d.opening>0?' with '+fmtN(d.opening)+' '+p.uom+' opening stock':'')+'.',{label:'View product',onClick:()=>navigate('product-view/'+p.id)});
        if(how==='new')navigate('product-create');else if(how==='close')navigate('products');else navigate('product-edit/'+p.id);};
      form.addEventListener('submit',e=>{e.preventDefault();save('stay')});
      $$('[data-save]',page).forEach(b=>b.onclick=()=>save(b.dataset.save));
      $$('[data-cancel]',page).forEach(b=>b.onclick=()=>{if(!dirty){navigate('products');return}confirmDialog({type:'warning',title:'Discard this product?',message:'You have unsaved changes. Leaving now discards them.',confirm:'Discard changes',danger:true}).then(ok=>ok&&navigate('products'))});
    }};
};
const FIELD_LABELS={name:'Name',sku:'SKU',barcode:'Barcode',code:'Product code',categoryId:'Category',sub:'Subcategory',brand:'Brand',type:'Product type',desc:'Description',invType:'Inventory type',uom:'Unit',reorder:'Reorder level',min:'Minimum stock',max:'Maximum stock',safety:'Safety stock',cost:'Purchase price',price:'Selling price',tax:'Tax',discount:'Discount',currency:'Currency',defaultWarehouseId:'Default warehouse',defaultLocationId:'Storage location',bin:'Bin',track:'Track inventory',batch:'Batch tracking',serial:'Serial tracking',expiry:'Expiry tracking',shelfLife:'Shelf life',status:'Status'};
function fmtField(k,v){if(k==='categoryId')return (CAT_BY(v)||{}).name||'—';if(k==='defaultWarehouseId')return (W_BY(v)||{}).code||'—';if(k==='defaultLocationId')return (L_BY(v)||{}).code||'—';if(k==='cost'||k==='price')return fmtM(v);if(typeof v==='boolean')return v?'On':'Off';return v===''||v==null?'—':String(v)}
function auditFor(record){return audit.filter(a=>a.record===record)}
function auditTimeline(list){if(!list.length)return '<p class="muted">No changes recorded yet.</p>';return '<div class="timeline">'+list.map(a=>'<div class="tl-item"><span class="tl-dot '+(a.action==='Created'?'t-success':a.action==='Deleted'?'t-danger':'t-primary')+'">'+icon(a.action==='Created'?'plus':a.action==='Deleted'?'trash':'edit',13)+'</span><div class="tl-body"><b>'+esc(a.action)+'</b> by '+esc(a.user)+(a.oldV!=='—'||a.newV!=='—'?'<div class="change">'+(a.oldV!=='—'?'<del>'+esc(a.oldV)+'</del>'+icon('arrowRight',12):'')+'<ins>'+esc(a.newV)+'</ins></div>':'')+'<small>'+fmtDT(a.date)+' · '+esc(a.module)+'</small></div></div>').join('')+'</div>'}
function ledgerColumns(opts){opts=opts||{};const c=[
  {key:'date',label:'Date',render:e=>'<span class="nowrap">'+fmtDT(e.date)+'</span>',exportValue:e=>fmtDT(e.date)},
  {key:'txNo',label:'Transaction No',render:e=>'<a class="link mono" data-le="'+e.id+'">'+esc(e.txNo)+'</a>'},
  {key:'type',label:'Transaction Type',render:e=>'<span class="chip">'+esc(e.type)+'</span>'}];
  if(!opts.noProduct)c.push({key:'product',label:'Product',value:e=>{const p=P_BY(e.productId);return p?p.name+' '+p.sku:'Deleted product'},render:e=>prodCell(P_BY(e.productId)),exportValue:e=>(P_BY(e.productId)||{}).sku});
  c.push({key:'warehouse',label:'Warehouse',value:e=>W_BY(e.warehouseId).code,render:e=>'<span class="chip">'+esc(W_BY(e.warehouseId).code)+'</span>'},
  {key:'opening',label:'Opening Qty',align:'right',render:e=>fmtN(e.opening)},
  {key:'inQty',label:'In Qty',align:'right',render:e=>e.inQty?'<span class="pos">+'+fmtN(e.inQty)+'</span>':'<span class="subtle">—</span>'},
  {key:'outQty',label:'Out Qty',align:'right',render:e=>e.outQty?'<span class="neg">−'+fmtN(e.outQty)+'</span>':'<span class="subtle">—</span>'},
  {key:'balance',label:'Balance Qty',align:'right',render:e=>'<b style="font-weight:600">'+fmtN(e.balance)+'</b>'},
  {key:'unitCost',label:'Unit Cost',align:'right',render:e=>fmtM(e.unitCost)},
  {key:'value',label:'Value',align:'right',render:e=>'<span class="'+(e.value>=0?'pos':'neg')+'">'+fmtM(e.value)+'</span>'},
  {key:'ref',label:'Reference',render:e=>'<span class="muted">'+esc(e.ref)+'</span>'},
  {key:'user',label:'User',render:e=>userCell(e.user)});
  return c}
function stockRowColumns(){return[
  {key:'wh',label:'Warehouse',value:r=>W_BY(r.warehouseId).name,render:r=>whCell(W_BY(r.warehouseId))},
  {key:'loc',label:'Location',value:r=>(L_BY(r.locationId)||{}).code,render:r=>'<span class="mono">'+esc((L_BY(r.locationId)||{}).code||'—')+'</span>'},
  {key:'qty',label:'On Hand',align:'right',render:r=>fmtN(r.qty)},
  {key:'reserved',label:'Reserved',align:'right',render:r=>fmtN(r.reserved)},
  {key:'avail',label:'Available',align:'right',value:r=>r.qty-r.reserved,render:r=>'<b style="font-weight:600">'+fmtN(r.qty-r.reserved)+'</b>'},
  {key:'value',label:'Value',align:'right',value:r=>r.qty*P_BY(r.productId).cost,render:r=>fmtM(r.qty*P_BY(r.productId).cost)},
  {key:'status',label:'Status',value:rowStatus,render:r=>badge(rowStatus(r))}]}
ROUTES['product-edit']=(id)=>{
  const p=P_BY(id);if(!p)return ROUTES['not-found']();
  const S=productSections(p,'edit');
  const rows=()=>stock.filter(s=>s.productId===p.id);
  const hist=auditFor(p.sku);
  return{title:'Edit Product',nav:'products',crumbs:[['Inventory','inventory'],['Products','products'],[p.name,'product-view/'+p.id],['Edit']],
    titleHTML:'Edit Product <span class="badge '+(p.status==='Active'?'b-success':'')+'">'+esc(p.status)+'</span>',
    sub:'<span class="mono">'+esc(p.sku)+'</span> · '+esc(p.name)+' · last updated '+fmtDT(p.updatedAt)+' by '+esc(p.updatedBy),
    actions:btn('View','eye','','data-go="product-view/'+p.id+'"')+btn('Duplicate','copy','','data-go="product-create?from='+p.id+'"')+btn('Delete','trash','danger-ghost','data-del'),
    body:'<div class="grid g-main"><form class="card" id="pform" novalidate data-tabs>'+tabsHTML([['general','General'],['inventory','Inventory'],['pricing','Pricing'],['warehouses','Warehouses'],['stock','Stock',rows().length],['tx','Transactions',ledger.filter(e=>e.productId===p.id).length],['history','History',hist.length]],'general')+
      '<div class="tab-panel active" data-panel="general"><div class="form-section">'+sectionHead(1,'Basic Information','Identifiers and classification')+S.basic+'</div></div>'+
      '<div class="tab-panel" data-panel="inventory"><div class="form-section">'+sectionHead(2,'Inventory Information','Units and stocking rules')+S.inventory+'</div><div class="form-section">'+sectionHead(3,'Product Settings','Tracking and lifecycle')+S.settings+'</div></div>'+
      '<div class="tab-panel" data-panel="pricing"><div class="form-section">'+sectionHead(4,'Pricing','Cost, price and tax')+S.pricing+'</div><div class="form-section"><h3 class="form-section-title mb-16">Price history</h3><div class="table-wrap auto" style="border:1px solid var(--border);border-radius:var(--r-md)"><table class="tbl compact"><thead><tr><th>Effective</th><th class="right">Purchase price</th><th class="right">Selling price</th><th>Changed by</th><th>Reason</th></tr></thead><tbody>'+(p.priceHistory||[]).slice().reverse().map(h=>'<tr><td>'+fmtD(h.date)+'</td><td class="right num">'+fmtM(h.cost)+(h.oldCost!=null?' <span class="subtle" style="font-size:12px">from '+fmtM(h.oldCost)+'</span>':'')+'</td><td class="right num">'+fmtM(h.price)+'</td><td>'+esc(h.user)+'</td><td class="muted">'+esc(h.reason)+'</td></tr>').join('')+'</tbody></table></div></div></div>'+
      '<div class="tab-panel" data-panel="warehouses"><div class="form-section">'+sectionHead(5,'Warehouse','Default storage for receipts')+S.warehouse+'</div></div>'+
      '<div class="tab-panel" data-panel="stock"><div id="pStock"></div></div>'+
      '<div class="tab-panel" data-panel="tx"><div id="pTx"></div></div>'+
      '<div class="tab-panel" data-panel="history"><div class="card-body">'+auditTimeline(hist)+'</div></div>'+
      '<div class="form-actions"><span class="spacer"></span>'+btn('Cancel','','','type="button" data-go="product-view/'+p.id+'"')+btn('Save & Close','','','type="button" data-save="close"')+btn('Save Changes','save','primary','type="submit"')+'</div></form>'+
      '<div class="stack"><section class="card"><div class="card-head"><h2 class="card-title">Record information</h2></div><div class="card-body"><dl class="dl"><dt>Product ID</dt><dd class="mono">'+esc(p.id)+'</dd><dt>Created by</dt><dd>'+esc(p.createdBy)+'</dd><dt>Created date</dt><dd>'+fmtDT(p.createdAt)+'</dd><dt>Updated by</dt><dd>'+esc(p.updatedBy)+'</dd><dt>Updated date</dt><dd>'+fmtDT(p.updatedAt)+'</dd><dt>On hand</dt><dd>'+fmtN(productQty(p.id))+' '+esc(p.uom)+'</dd><dt>Stock status</dt><dd>'+badge(pStatus(p))+'</dd></dl></div></section>'+
      card('Recent changes',auditTimeline(hist.slice(0,5)),{sub:'Latest edits to this record'})+'</div></div>',
    mount(page){
      const form=$('#pform',page);bindProductForm(form,p);
      mountTable(page,'#pStock',{title:p.sku+' stock',search:false,columns:stockRowColumns(),data:rows,auto:true,exportable:false,columnFilter:false,noToolbar:true,paginate:false,emptyTitle:'No stock on hand',emptyText:'Receive goods or post an opening balance to create stock.'});
      mountTable(page,'#pTx',{title:p.sku+' transactions',columns:ledgerColumns({noProduct:true}),data:()=>ledger.filter(e=>e.productId===p.id).slice().reverse(),pageSize:10,emptyTitle:'No transactions',emptyText:'Movements appear here when stock is received, issued or adjusted.'});
      $('[data-del]',page).onclick=()=>deleteProduct(p,()=>navigate('products'));
      page.addEventListener('click',e=>{const a=e.target.closest('[data-le]');if(a){e.preventDefault();ledgerDrawer(ledger.find(x=>x.id===a.dataset.le))}});
      const save=how=>{if(!productValidate(form,p))return;const d=formData(form);const before=Object.assign({},p);productFromForm(d,p);
        const changes=Object.keys(FIELD_LABELS).filter(k=>String(before[k]==null?'':before[k])!==String(p[k]==null?'':p[k]));
        if(!changes.length){toast('info','No changes to save','The product already has these values.');return}
        changes.forEach(k=>logAudit('Inventory','Updated',p.sku,FIELD_LABELS[k]+': '+fmtField(k,before[k]),FIELD_LABELS[k]+': '+fmtField(k,p[k])));
        if(before.cost!==p.cost||before.price!==p.price)(p.priceHistory=p.priceHistory||[]).push({date:NOW(),cost:p.cost,price:p.price,oldCost:before.cost,oldPrice:before.price,user:CURRENT_USER.name,reason:'Manual price update'});
        p.updatedAt=NOW();p.updatedBy=CURRENT_USER.name;
        toast('success','Changes saved',changes.length+' field'+(changes.length>1?'s':'')+' updated on '+p.sku+': '+changes.slice(0,3).map(k=>FIELD_LABELS[k].toLowerCase()).join(', ')+(changes.length>3?'…':'')+'.');
        navigate(how==='close'?'products':'product-edit/'+p.id)};
      form.addEventListener('submit',e=>{e.preventDefault();save('stay')});
      $('[data-save=close]',page).onclick=()=>save('close');
    }};
};

/* ---------- product details ---------- */
ROUTES['product-view']=(id)=>{
  const p=P_BY(id);if(!p)return ROUTES['not-found']();
  const qty=productQty(p.id),res=productReserved(p.id),oo=onOrder(p.id);
  const rows=()=>stock.filter(s=>s.productId===p.id);
  const tx=()=>ledger.filter(e=>e.productId===p.id).slice().reverse();
  const purch=[];grns.forEach(g=>g.items.forEach(it=>{if(it.productId===p.id)purch.push({id:g.id+it.productId,g,it})}));
  const sales=[];salesOrders.forEach(s=>s.items.forEach(it=>{if(it.productId===p.id)sales.push({id:s.id,s,it})}));
  const ws=weeks(13);const trend=ws.map(d=>Math.max(0,qtyAt(p.id,d)));
  const COLS=['var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)','var(--c6)'];
  const st=pStatus(p);const cat=CAT_BY(p.categoryId);
  const pb=batches.filter(b=>b.productId===p.id&&b.qty>0);
  return{title:p.name,nav:'products',crumbs:[['Inventory','inventory'],['Products','products'],[p.name]],
    titleHTML:esc(p.name)+' '+badge(p.status)+' '+badge(st),
    sub:'<span class="mono">'+esc(p.sku)+'</span> · '+esc(cat.name)+' / '+esc(p.sub)+' · '+esc(p.brand),
    actions:btn('Edit','edit','','data-go="product-edit/'+p.id+'"')+btn('Delete','trash','danger-ghost','data-del')+btn('More','more','','data-more aria-haspopup="menu"'),
    body:'<div class="stat-strip mb-16"><div class="stat"><small>Available Stock</small><b>'+fmtN(qty-res)+'</b><em>'+fmtN(qty)+' on hand · '+esc(uomName(p.uom))+'</em></div><div class="stat"><small>Reserved</small><b>'+fmtN(res)+'</b><em>Open sales orders</em></div><div class="stat"><small>On Order</small><b>'+fmtN(oo)+'</b><em>Open purchase orders</em></div><div class="stat"><small>Reorder Level</small><b>'+fmtN(p.reorder)+'</b><em>Min '+fmtN(p.min)+' · Max '+fmtN(p.max)+'</em></div><div class="stat"><small>Inventory Value</small><b>'+fmtM(qty*p.cost,0)+'</b><em>at '+fmtM(p.cost)+' standard cost</em></div></div>'+
      '<section class="card" data-tabs>'+tabsHTML([['ov','Overview'],['stock','Stock',rows().length],['wh','Warehouses'],['tx','Transactions',tx().length],['po','Purchase History',purch.length],['so','Sales History',sales.length],['price','Price History'],['audit','Audit Log',auditFor(p.sku).length]],'ov')+
      '<div class="tab-panel active" data-panel="ov"><div class="card-body"><div class="grid g-7-5"><div><h3 class="card-title mb-16">Product details</h3><dl class="dl cols-2"><dt>SKU</dt><dd class="mono">'+esc(p.sku)+'</dd><dt>Barcode</dt><dd class="mono">'+esc(p.barcode||'—')+'</dd><dt>Product code</dt><dd>'+esc(p.code||'—')+'</dd><dt>Product type</dt><dd>'+esc(p.type)+'</dd><dt>Category</dt><dd>'+esc(cat.name)+'</dd><dt>Subcategory</dt><dd>'+esc(p.sub||'—')+'</dd><dt>Inventory type</dt><dd>'+esc(p.invType)+'</dd><dt>Unit</dt><dd>'+esc(uomName(p.uom))+' ('+esc(p.uom)+')</dd><dt>Purchase price</dt><dd>'+fmtM(p.cost)+'</dd><dt>Selling price</dt><dd>'+fmtM(p.price)+'</dd><dt>Tax</dt><dd>'+esc(p.tax)+'</dd><dt>Default warehouse</dt><dd>'+esc(W_BY(p.defaultWarehouseId).name)+'</dd><dt>Safety stock</dt><dd>'+fmtN(p.safety)+'</dd><dt>Tracking</dt><dd>'+([p.batch?'Batch':'',p.serial?'Serial':'',p.expiry?'Expiry':''].filter(Boolean).join(', ')||'Quantity only')+'</dd></dl><p class="muted mt-16" style="max-width:70ch">'+esc(p.desc||'')+'</p></div>'+
        '<div><h3 class="card-title">On-hand trend</h3><p class="card-sub mb-16">Weekly closing quantity, last 13 weeks</p>'+lineChart({labels:ws.map(shortD),series:[{name:'On hand',values:trend,color:'var(--c1)'},{name:'Reorder level',values:ws.map(()=>p.reorder),color:'var(--c3)',dash:true}],h:200,pl:44})+'</div></div></div></div>'+
      '<div class="tab-panel" data-panel="stock"><div id="vStock"></div>'+(pb.length?'<div class="card-body" style="border-top:1px solid var(--border)"><h3 class="card-title mb-16">Batches on hand</h3><div class="table-wrap auto"><table class="tbl compact"><thead><tr><th>Batch</th><th>Warehouse</th><th>Received</th><th>Expiry</th><th class="right">Qty</th></tr></thead><tbody>'+pb.map(b=>'<tr><td class="mono">'+esc(b.batch)+'</td><td>'+esc(W_BY(b.warehouseId).code)+'</td><td>'+fmtD(b.received)+'</td><td>'+(b.expiry?fmtD(b.expiry)+' '+badge(expStatus(b)):'—')+'</td><td class="right num">'+fmtN(b.qty)+'</td></tr>').join('')+'</tbody></table></div></div>':'')+'</div>'+
      '<div class="tab-panel" data-panel="wh"><div class="card-body">'+(rows().length?'<div class="grid g-2">'+donut(rows().map((r,i)=>({label:W_BY(r.warehouseId).name,value:r.qty,color:COLS[i%6]})),{center:fmtN(qty),centerSub:esc(p.uom)+' on hand'})+'<div class="hbars">'+rows().map(r=>{const n=rows().length;const share=p.max/n;return '<div class="hbar-row"><span class="nm"><b style="font-weight:600">'+esc(W_BY(r.warehouseId).code)+'</b> <span class="muted">'+esc((L_BY(r.locationId)||{}).code)+'</span></span><span class="vl">'+fmtN(r.qty)+' / '+fmtN(Math.round(share))+'</span><div class="bar '+(r.qty<p.reorder/n?'w':'')+'"><i style="width:'+clamp(r.qty/share*100,0,100)+'%"></i></div></div>'}).join('')+'<p class="hint">Quantity against each site’s share of maximum stock</p></div></div>':'<div class="empty"><div class="empty-ico">'+icon('warehouse',22)+'</div><h4>Not stocked in any warehouse</h4><p>Receive goods to place this product in a warehouse.</p><button class="btn btn-primary" data-go="grn-create">Create GRN</button></div>')+'</div></div>'+
      '<div class="tab-panel" data-panel="tx"><div id="vTx"></div></div>'+
      '<div class="tab-panel" data-panel="po"><div id="vPo"></div></div>'+
      '<div class="tab-panel" data-panel="so"><div id="vSo"></div></div>'+
      '<div class="tab-panel" data-panel="price"><div class="table-wrap auto"><table class="tbl"><thead><tr><th>Effective date</th><th class="right">Purchase price</th><th class="right">Change</th><th class="right">Selling price</th><th class="right">Margin</th><th>Changed by</th><th>Reason</th></tr></thead><tbody>'+(p.priceHistory||[]).slice().reverse().map(h=>{const ch=h.oldCost?((h.cost-h.oldCost)/h.oldCost*100):0;return '<tr><td>'+fmtD(h.date)+'</td><td class="right num">'+fmtM(h.cost)+'</td><td class="right num '+(ch>0?'neg':ch<0?'pos':'muted')+'">'+(h.oldCost?(ch>0?'+':'')+ch.toFixed(1)+'%':'—')+'</td><td class="right num">'+fmtM(h.price)+'</td><td class="right num">'+((h.price-h.cost)/h.price*100).toFixed(1)+'%</td><td>'+userCell(h.user)+'</td><td class="muted">'+esc(h.reason)+'</td></tr>'}).join('')+'</tbody></table></div></div>'+
      '<div class="tab-panel" data-panel="audit"><div class="card-body">'+auditTimeline(auditFor(p.sku))+'</div></div>'+
      '</section>'+
      '<section class="card mt-16"><div class="card-body"><dl class="dl cols-2"><dt>Created by</dt><dd>'+esc(p.createdBy)+'</dd><dt>Created date</dt><dd>'+fmtDT(p.createdAt)+'</dd><dt>Updated by</dt><dd>'+esc(p.updatedBy)+'</dd><dt>Updated date</dt><dd>'+fmtDT(p.updatedAt)+'</dd></dl></div></section>',
    mount(page){
      $('[data-del]',page).onclick=()=>deleteProduct(p,()=>navigate('products'));
      $('[data-more]',page).onclick=e=>openMenu(e.currentTarget,[
        {label:'Duplicate',icon:'copy',onClick:()=>navigate('product-create?from='+p.id)},
        {label:'Stock History',icon:'history',onClick:()=>navigate('ledger?product='+p.id)},
        {label:'Adjust stock',icon:'sliders',onClick:()=>navigate('adjustment-create?product='+p.id)},
        {label:'Transfer stock',icon:'transfer',onClick:()=>navigate('transfer-create?product='+p.id)},
        {label:'Raise purchase order',icon:'cart',onClick:()=>raisePO(p)},
        '-',
        {label:p.status==='Inactive'?'Mark active':'Mark inactive',icon:p.status==='Inactive'?'checkCircle':'ban',onClick:()=>{const o=p.status;p.status=o==='Inactive'?'Active':'Inactive';p.updatedAt=NOW();p.updatedBy=CURRENT_USER.name;logAudit('Inventory','Updated',p.sku,'Status: '+o,'Status: '+p.status);toast('success','Status updated',p.name+' is now '+p.status+'.');renderRoute()}}
      ]);
      mountTable(page,'#vStock',{title:p.sku+' stock',noToolbar:true,paginate:false,auto:true,columns:stockRowColumns(),data:rows,emptyTitle:'No stock on hand',emptyText:'Receive goods to create stock for this product.'});
      mountTable(page,'#vTx',{title:p.sku+' transactions',columns:ledgerColumns({noProduct:true}),data:tx,emptyTitle:'No transactions yet'});
      mountTable(page,'#vPo',{title:p.sku+' purchase history',columns:[
        {key:'date',label:'Receipt date',value:x=>x.g.date,render:x=>fmtD(x.g.date)},{key:'no',label:'GRN',value:x=>x.g.no,render:x=>'<a class="link mono" href="#/grn-view/'+x.g.id+'">'+esc(x.g.no)+'</a>'},{key:'po',label:'Purchase order',value:x=>x.g.poNo,render:x=>'<span class="mono">'+esc(x.g.poNo)+'</span>'},{key:'sup',label:'Supplier',value:x=>x.g.supplier},{key:'wh',label:'Warehouse',value:x=>W_BY(x.g.warehouseId).code},
        {key:'rec',label:'Received',align:'right',value:x=>x.it.received,render:x=>fmtN(x.it.received)},{key:'acc',label:'Accepted',align:'right',value:x=>x.it.accepted,render:x=>fmtN(x.it.accepted)},{key:'cost',label:'Unit cost',align:'right',value:x=>x.it.cost,render:x=>fmtM(x.it.cost)},{key:'st',label:'Status',value:x=>x.g.status,render:x=>badge(x.g.status)}],
        data:()=>purch.slice().sort((a,b)=>b.g.date-a.g.date),emptyTitle:'No purchases yet',emptyText:'Goods receipts for this product will be listed here.'});
      mountTable(page,'#vSo',{title:p.sku+' sales history',columns:[
        {key:'date',label:'Order date',value:x=>x.s.date,render:x=>fmtD(x.s.date)},{key:'no',label:'Sales order',value:x=>x.s.no,render:x=>'<span class="mono">'+esc(x.s.no)+'</span>'},{key:'cust',label:'Customer',value:x=>x.s.customer},{key:'wh',label:'Warehouse',value:x=>W_BY(x.s.warehouseId).code},
        {key:'qty',label:'Quantity',align:'right',value:x=>x.it.qty,render:x=>fmtN(x.it.qty)},{key:'price',label:'Unit price',align:'right',value:x=>x.it.price,render:x=>fmtM(x.it.price)},{key:'amt',label:'Amount',align:'right',value:x=>x.it.qty*x.it.price,render:x=>fmtM(x.it.qty*x.it.price)},{key:'st',label:'Status',value:x=>x.s.status,render:x=>badge(x.s.status)}],
        data:()=>sales.slice().sort((a,b)=>b.s.date-a.s.date),rowId:x=>x.s.id+x.it.productId,emptyTitle:'No sales yet',emptyText:'Sales orders for this product will be listed here.'});
      page.addEventListener('click',e=>{const a=e.target.closest('[data-le]');if(a){e.preventDefault();ledgerDrawer(ledger.find(x=>x.id===a.dataset.le))}});
    }};
};
function expStatus(b){if(!b.expiry)return 'Good';const d=daysBetween(NOW(),b.expiry);return d<0?'Expired':d<=SETTINGS.expiryWarn?'Expiring Soon':d<=90?'Within 90 Days':'Good'}
function ledgerDrawer(e){if(!e)return;const p=P_BY(e.productId);const w=W_BY(e.warehouseId);
  const docRoute={GRN:grns,'Goods Issue':goodsIssues,Transfer:stockTransfers,Adjustment:stockAdjustments}[e.type];let link='';
  if(docRoute){const d=docRoute.find(x=>x.no===e.txNo);if(d)link={GRN:'grn-view/',"Goods Issue":'issue-view/',Transfer:'transfer-view/',Adjustment:'adjustment-view/'}[e.type]+d.id}
  openDrawer({title:e.txNo,icon:'book',subtitle:esc(e.type)+' · '+fmtDT(e.date),body:'<dl class="dl"><dt>Product</dt><dd>'+(p?'<a class="link" href="#/product-view/'+p.id+'">'+esc(p.name)+'</a><br><span class="mono muted">'+esc(p.sku)+'</span>':'Deleted product')+'</dd><dt>Warehouse</dt><dd>'+esc(w.name)+'</dd><dt>Transaction type</dt><dd>'+esc(e.type)+'</dd><dt>Opening qty</dt><dd class="num">'+fmtN(e.opening)+'</dd><dt>In qty</dt><dd class="num pos">'+(e.inQty?'+'+fmtN(e.inQty):'—')+'</dd><dt>Out qty</dt><dd class="num neg">'+(e.outQty?'−'+fmtN(e.outQty):'—')+'</dd><dt>Balance qty</dt><dd class="num"><b>'+fmtN(e.balance)+'</b></dd><dt>Unit cost</dt><dd class="num">'+fmtM(e.unitCost)+'</dd><dt>Value</dt><dd class="num '+(e.value>=0?'pos':'neg')+'">'+fmtM(e.value)+'</dd><dt>Reference</dt><dd>'+esc(e.ref||'—')+'</dd><dt>Posted by</dt><dd>'+esc(e.user)+'</dd><dt>Entry ID</dt><dd class="mono">'+esc(e.id)+'</dd></dl><div class="alert alert-info mt-24">'+icon('lock',16)+'<span>Ledger entries are immutable. Post a stock adjustment to correct a balance.</span></div>',
    actions:[{label:'Close'}].concat(link?[{label:'Open document',variant:'primary',icon:'file',onClick:()=>navigate(link)}]:[])})}
function raisePO(p){
  const sug=Math.max(p.reorder,p.max-productQty(p.id)-onOrder(p.id));
  const body=el('<form novalidate><div class="form-grid">'+F({name:'supplier',label:'Supplier',type:'select',req:true,span:12,value:SUPPLIERS[p.categoryId],options:[...new Set(Object.values(SUPPLIERS))]})+F({name:'wid',label:'Deliver to',type:'select',req:true,span:6,value:p.defaultWarehouseId,placeholder:false,options:whOptions()})+F({name:'expected',label:'Expected date',type:'date',req:true,span:6,value:isoDate(addDays(NOW(),7))})+F({name:'qty',label:'Order quantity',type:'number',req:true,min:1,span:6,value:sug,suffix:p.uom,hint:'Suggested: max stock less on hand and on order'})+F({name:'cost',label:'Unit cost',type:'number',req:true,min:0,step:'0.01',prefix:'$',span:6,value:p.cost})+'</div><div class="callout mt-16"><b>'+esc(p.name)+'</b> · on hand '+fmtN(productQty(p.id))+' · on order '+fmtN(onOrder(p.id))+' · reorder at '+fmtN(p.reorder)+'</div></form>');
  openModal({type:'create',title:'Raise purchase order',subtitle:esc(p.sku)+' · '+esc(p.name),body,actions:[{label:'Cancel'},{label:'Create purchase order',variant:'primary',icon:'cart',onClick:api=>{const f=$('form',api.el);if(!validateForm(f))return false;const d=formData(f);
    const po={id:uid('PO'),no:nextNo('PO'),date:NOW(),supplier:d.supplier,warehouseId:d.wid,status:'Open',expected:new Date(d.expected),items:[{productId:p.id,qty:d.qty,received:0,cost:d.cost}],createdBy:CURRENT_USER.name,terms:'Net 30'};purchaseOrders.unshift(po);logAudit('Purchasing','Created',po.no,'—','Status: Open · '+p.sku+' × '+d.qty);
    toast('success','Purchase order created',po.no+' for '+fmtN(d.qty)+' '+p.uom+' of '+p.name+'.',{label:'Receive against it',onClick:()=>navigate('grn-create?po='+po.id)})}}]});
}

/* ---------- categories ---------- */
function categoryModal(c,after){
  const edit=!!c;const body=el('<form novalidate><div class="form-grid">'+F({name:'name',label:'Category name',req:true,span:8,value:c&&c.name})+F({name:'code',label:'SKU prefix',req:true,span:4,value:c&&c.code,pattern:'^[A-Z]{3}$',patternMsg:'Use three uppercase letters'})+F({name:'subs',label:'Subcategories',span:12,value:c?c.subs.join(', '):'',hint:'Separate with commas'})+F({name:'desc',label:'Description',type:'textarea',span:12,rows:2,value:c&&c.desc})+F({name:'active',label:'Active',type:'toggle',span:12,value:c?c.status==='Active':true,hint:'Inactive categories are hidden on new products'})+'</div></form>');
  openModal({type:edit?'edit':'create',title:edit?'Edit category':'Create category',subtitle:edit?esc(c.name):'Group products for reporting and SKU numbering',body,actions:[{label:'Cancel'},{label:edit?'Save changes':'Create category',variant:'primary',onClick:api=>{const f=$('form',api.el);
    if(!validateForm(f,err=>{const d=formData(f);if(categories.some(x=>x!==c&&x.code===d.code))err('code','Prefix '+d.code+' is already used');if(categories.some(x=>x!==c&&x.name.toLowerCase()===d.name.toLowerCase()))err('name','A category with this name exists')}))return false;
    const d=formData(f);const o=c||{id:'C'+String(categories.length+1).padStart(2,'0')};const old=c?c.name:'—';Object.assign(o,{name:d.name,code:d.code,subs:d.subs.split(',').map(s=>s.trim()).filter(Boolean),desc:d.desc,status:d.active?'Active':'Inactive'});
    if(!c)categories.push(o);logAudit('Inventory',c?'Updated':'Created','Category '+o.code,old,o.name);toast('success',c?'Category updated':'Category created','“'+o.name+'” saved.');if(after)after();else if(currentRoute&&currentRoute.name==='categories')renderRoute()}}]});
}
ROUTES.categories=()=>({title:'Product Categories',nav:'categories',crumbs:[['Inventory','inventory'],['Products','products'],['Product Categories']],sub:'Categories drive SKU prefixes, reporting groups and default suppliers.',
  actions:btn('Create Category','plus','primary','data-new'),body:'<section class="card" id="catT"></section>',
  mount(page){
    const t=mountTable(page,'#catT',{title:'Categories',columns:[
      {key:'code',label:'Prefix',render:c=>'<span class="mono">'+esc(c.code)+'</span>'},
      {key:'name',label:'Category',render:c=>'<div class="cell-main"><span class="thumb" style="color:'+(CAT_COLORS[c.id]||['#475467'])[0]+';background:'+(CAT_COLORS[c.id]||[0,'var(--surface-secondary)'])[1]+'">'+icon('folder',15)+'</span><div><b>'+esc(c.name)+'</b><small>'+esc(c.desc||'')+'</small></div></div>'},
      {key:'subs',label:'Subcategories',value:c=>c.subs.join(', '),nowrap:false,render:c=>'<div class="row wrap" style="gap:4px">'+c.subs.map(s=>'<span class="chip">'+esc(s)+'</span>').join('')+'</div>'},
      {key:'products',label:'Products',align:'right',value:c=>products.filter(p=>p.categoryId===c.id).length,render:c=>'<a class="link" href="#/products?category='+c.id+'">'+products.filter(p=>p.categoryId===c.id).length+'</a>'},
      {key:'value',label:'Stock Value',align:'right',value:c=>sum(products.filter(p=>p.categoryId===c.id),pValue),render:c=>fmtM(sum(products.filter(p=>p.categoryId===c.id),pValue),0)},
      {key:'status',label:'Status',render:c=>badge(c.status)}],data:()=>categories,
      actions:c=>[{label:'View products',icon:'eye',onClick:()=>navigate('products?category='+c.id)},{label:'Edit',icon:'edit',onClick:()=>categoryModal(c,()=>t.refresh())},'-',{label:'Delete',icon:'trash',danger:true,onClick:()=>{const n=products.filter(p=>p.categoryId===c.id).length;if(n){messageModal('warning','Category in use','<p>“'+esc(c.name)+'” can’t be deleted because '+n+' products are assigned to it. Move them to another category first.</p>',[{label:'Close'},{label:'View products',variant:'primary',onClick:()=>navigate('products?category='+c.id)}]);return}confirmDialog({danger:true,title:'Delete category?',message:'Delete “'+esc(c.name)+'”? This action cannot be undone.',confirm:'Delete category'}).then(ok=>{if(!ok)return;categories.splice(categories.indexOf(c),1);logAudit('Inventory','Deleted','Category '+c.code,c.name,'—');toast('success','Category deleted',c.name+' was removed.');t.refresh()})}}]});
    $('[data-new]',page).onclick=()=>categoryModal(null,()=>t.refresh());
  }});

/* ---------- units ---------- */
function unitModal(u,after){const edit=!!u;const body=el('<form novalidate><div class="form-grid">'+F({name:'code',label:'Code',req:true,span:4,value:u&&u.code,pattern:'^[A-Z]{1,4}$',patternMsg:'1–4 uppercase letters',readonly:edit})+F({name:'name',label:'Name',req:true,span:8,value:u&&u.name})+F({name:'type',label:'Measure type',type:'select',req:true,span:6,value:u?u.type:'Count',placeholder:false,options:['Count','Weight','Volume','Length','Area']})+F({name:'precision',label:'Decimal places',type:'number',req:true,min:0,max:4,span:6,value:u?u.precision:0})+F({name:'active',label:'Active',type:'toggle',span:12,value:u?u.status==='Active':true})+'</div></form>');
  openModal({type:edit?'edit':'create',title:edit?'Edit unit':'Create unit',subtitle:edit?esc(u.code)+' · '+esc(u.name):'Units of measure for stock quantities',body,actions:[{label:'Cancel'},{label:edit?'Save changes':'Create unit',variant:'primary',onClick:api=>{const f=$('form',api.el);if(!validateForm(f,err=>{const d=formData(f);if(!edit&&units.some(x=>x.code===d.code))err('code','Code '+d.code+' already exists')}))return false;const d=formData(f);const o=u||{id:'U'+(units.length+1)};Object.assign(o,{code:d.code,name:d.name,type:d.type,precision:d.precision,status:d.active?'Active':'Inactive'});if(!u)units.push(o);logAudit('Inventory',u?'Updated':'Created','Unit '+o.code,'—',o.name);toast('success',u?'Unit updated':'Unit created',o.code+' · '+o.name+' saved.');after()}}]})}
ROUTES.units=()=>({title:'Product Units',crumbs:[['Inventory','inventory'],['Products','products'],['Product Units']],sub:'Units of measure available on products and transactions.',actions:btn('Create Unit','plus','primary','data-new'),body:'<section class="card" id="uT"></section>',
  mount(page){const t=mountTable(page,'#uT',{title:'Units',columns:[{key:'code',label:'Code',render:u=>'<span class="mono strong">'+esc(u.code)+'</span>'},{key:'name',label:'Name'},{key:'type',label:'Measure type'},{key:'precision',label:'Decimal places',align:'right'},{key:'used',label:'Products using',align:'right',value:u=>products.filter(p=>p.uom===u.code).length},{key:'status',label:'Status',render:u=>badge(u.status)}],data:()=>units,
    actions:u=>[{label:'Edit',icon:'edit',onClick:()=>unitModal(u,()=>t.refresh())},'-',{label:'Delete',icon:'trash',danger:true,onClick:()=>{const n=products.filter(p=>p.uom===u.code).length;if(n){messageModal('warning','Unit in use','<p>'+esc(u.code)+' is used by '+n+' products and can’t be deleted. Set it to Inactive instead.</p>');return}confirmDialog({danger:true,title:'Delete unit?',message:'Delete '+esc(u.code)+' · '+esc(u.name)+'? This action cannot be undone.',confirm:'Delete unit'}).then(ok=>{if(!ok)return;units.splice(units.indexOf(u),1);logAudit('Inventory','Deleted','Unit '+u.code,u.name,'—');toast('success','Unit deleted',u.code+' removed.');t.refresh()})}}]});
  $('[data-new]',page).onclick=()=>unitModal(null,()=>t.refresh())}});

/* =========================================================
   WAREHOUSES
   ========================================================= */
const whUtil=w=>Math.round(sum(whStock(w.id),s=>s.qty)/w.capacity*100);
function utilHTML(p){return '<div class="util" style="min-width:120px"><div class="bar '+(p>90?'d':p>75?'w':'s')+'"><i style="width:'+clamp(p,0,100)+'%"></i></div><span>'+p+'%</span></div>'}
function whColumns(){return[
  {key:'code',label:'Warehouse Code',render:w=>'<span class="mono strong">'+esc(w.code)+'</span>'},
  {key:'name',label:'Warehouse Name',render:w=>'<div class="cell-main"><span class="thumb" style="background:var(--primary-soft);color:var(--primary-text)">'+icon('warehouse',16)+'</span><div><b><a class="link" style="color:var(--text);font-weight:600" href="#/warehouse-view/'+w.id+'">'+esc(w.name)+'</a></b><small>'+esc(w.type)+'</small></div></div>'},
  {key:'location',label:'Location',value:w=>w.city+', '+w.state},
  {key:'manager',label:'Manager',render:w=>userCell(w.manager)},
  {key:'products',label:'Total Products',align:'right',value:w=>whStock(w.id).length},
  {key:'qty',label:'Stock Quantity',align:'right',value:w=>sum(whStock(w.id),s=>s.qty),render:w=>fmtN(sum(whStock(w.id),s=>s.qty))},
  {key:'value',label:'Stock Value',align:'right',value:w=>whValue(w.id),render:w=>fmtM(whValue(w.id),0)},
  {key:'util',label:'Utilization',value:whUtil,render:w=>utilHTML(whUtil(w)),export:false},
  {key:'status',label:'Status',render:w=>badge(w.status)}]}
function deleteWarehouse(w,after){const q=sum(whStock(w.id),s=>s.qty);const tx=ledger.filter(e=>e.warehouseId===w.id).length;
  if(q>0||tx){openModal({type:'warning',title:'This warehouse can’t be deleted',size:'sm',body:'<p>This warehouse cannot be deleted because inventory transactions exist.</p><div class="callout"><b>'+esc(w.name)+'</b> holds '+fmtN(q)+' units across '+whStock(w.id).length+' products and has '+fmtN(tx)+' ledger entries. Set it to Inactive to stop new receipts.</div>',actions:[{label:'Close'},{label:'View Transactions',variant:'primary',icon:'history',onClick:()=>navigate('ledger?warehouse='+w.id)}]});return}
  confirmDialog({danger:true,title:'Delete warehouse?',message:'Are you sure you want to delete “'+esc(w.name)+'”? Its '+locsOf(w.id).length+' storage locations are deleted too. This action cannot be undone.',confirm:'Delete Warehouse'}).then(ok=>{if(!ok)return;warehouses.splice(warehouses.indexOf(w),1);for(let i=locations.length-1;i>=0;i--)if(locations[i].warehouseId===w.id)locations.splice(i,1);logAudit('Inventory','Deleted',w.code,w.name,'—');toast('success','Warehouse deleted',w.name+' was removed.');after&&after()})}
function whActions(w,refresh){return[{label:'View',icon:'eye',onClick:()=>navigate('warehouse-view/'+w.id)},{label:'Edit',icon:'edit',onClick:()=>navigate('warehouse-edit/'+w.id)},{label:'Duplicate',icon:'copy',onClick:()=>navigate('warehouse-create?from='+w.id)},{label:'Stock History',icon:'history',onClick:()=>navigate('ledger?warehouse='+w.id)},'-',{label:'Delete',icon:'trash',danger:true,onClick:()=>deleteWarehouse(w,refresh)}]}
ROUTES.warehouses=()=>({title:'Warehouses',crumbs:[['Inventory','inventory'],['Warehouses','warehouses'],['Warehouse List']],sub:warehouses.length+' sites · '+activeWh().length+' active · '+locations.length+' storage locations',
  actions:btn('Storage Locations','pin','','data-go="locations"')+btn('Create Warehouse','plus','primary','data-go="warehouse-create"'),
  body:'<section class="card" id="whT"></section>',
  mount(page){const t=mountTable(page,'#whT',{title:'Warehouses',selectable:true,columns:whColumns(),data:()=>warehouses,searchPlaceholder:'Search code, name, city',
    filters:[{key:'st',label:'Any status',options:['Active','Inactive'],test:(w,v)=>w.status===v},{key:'type',label:'All types',options:[...new Set(warehouses.map(w=>w.type))],test:(w,v)=>w.type===v}],
    actions:w=>whActions(w,()=>t.refresh()),onRowClick:w=>navigate('warehouse-view/'+w.id),
    bulkActions:[{label:'Mark active',icon:'checkCircle',onClick:ids=>{ids.forEach(id=>{const w=W_BY(id);if(w.status!=='Active'){logAudit('Inventory','Updated',w.code,'Status: '+w.status,'Status: Active');w.status='Active'}});toast('success','Warehouses updated',ids.length+' set to Active.');t.clearSelection()}},{label:'Mark inactive',icon:'ban',onClick:ids=>{const blocked=ids.filter(id=>whStock(id).length);if(blocked.length){messageModal('warning','Some warehouses hold stock','<p>'+blocked.map(id=>esc(W_BY(id).name)).join(', ')+' still hold stock. Transfer it out before deactivating.</p>');return}ids.forEach(id=>{const w=W_BY(id);logAudit('Inventory','Updated',w.code,'Status: '+w.status,'Status: Inactive');w.status='Inactive'});toast('success','Warehouses updated',ids.length+' set to Inactive.');t.clearSelection()}},{label:'Export selected',icon:'export',onClick:ids=>exportCSV('Selected warehouses',whColumns().filter(c=>c.export!==false),warehouses.filter(w=>ids.includes(w.id)))}],
    footer:rs=>['<b>'+rs.length+' warehouses</b>','','','',fmtN(sum(rs,w=>whStock(w.id).length)),fmtN(sum(rs,w=>sum(whStock(w.id),s=>s.qty))),fmtM(sum(rs,w=>whValue(w.id)),0),'',''],
    emptyTitle:'No warehouses yet',emptyText:'Add a warehouse to start receiving stock.',emptyAction:{label:'Create Warehouse',onClick:()=>navigate('warehouse-create')}})}});
function warehouseForm(w,mode){const v=k=>w?w[k]:'';return '<div class="form-section">'+sectionHead(1,'Warehouse details','Name, code and type')+'<div class="form-grid">'+F({name:'name',label:'Warehouse Name',req:true,span:6,value:v('name'),ph:'e.g. Phoenix Distribution Center'})+F({name:'code',label:'Warehouse Code',req:true,span:3,value:mode==='dup'?'':v('code'),pattern:'^WH-[A-Z]{3}$',patternMsg:'Use the format WH-ABC',ph:'WH-PHX',readonly:mode==='edit'})+F({name:'type',label:'Warehouse type',type:'select',req:true,span:3,value:v('type')||'Distribution Center',placeholder:false,options:['Distribution Center','Fulfillment Hub','Port Warehouse','Regional Store','Overflow','Plant Store']})+F({name:'capacity',label:'Capacity',type:'number',req:true,min:1,span:3,suffix:'units',value:v('capacity')||5000})+F({name:'status',label:'Status',type:'select',req:true,span:3,value:v('status')||'Active',placeholder:false,options:['Active','Inactive']})+'</div></div>'+
  '<div class="form-section">'+sectionHead(2,'Address','Physical site location')+'<div class="form-grid">'+F({name:'address',label:'Address',req:true,span:12,value:v('address'),ph:'Street address'})+F({name:'city',label:'City',req:true,span:4,value:v('city')})+F({name:'state',label:'State',req:true,span:4,value:v('state'),ph:'e.g. AZ'})+F({name:'country',label:'Country',type:'select',req:true,span:4,value:v('country')||'United States',placeholder:false,options:['United States','Canada','Mexico','Japan','Germany','United Kingdom']})+'</div></div>'+
  '<div class="form-section">'+sectionHead(3,'Contact','Site manager and communications')+'<div class="form-grid">'+F({name:'manager',label:'Manager',type:'select',req:true,span:4,value:v('manager'),options:USERS})+F({name:'contact',label:'Contact',req:true,span:4,value:v('contact'),pattern:'^[+0-9 ()-]{7,20}$',patternMsg:'Enter a valid phone number',ph:'+1 (602) 555-0100'})+F({name:'email',label:'Email',type:'email',req:true,span:4,value:v('email'),ph:'site@kagami-erp.com'})+'</div></div>'}
function whFormPage(w,mode,src){
  const title=mode==='edit'?'Edit Warehouse':(src?'Duplicate Warehouse':'Create Warehouse');
  return{title,nav:'warehouses',crumbs:[['Inventory','inventory'],['Warehouses','warehouses']].concat(mode==='edit'?[[w.name,'warehouse-view/'+w.id],['Edit']]:[[title]]),
    sub:mode==='edit'?'<span class="mono">'+esc(w.code)+'</span> · created '+fmtD(w.createdAt||new Date(2025,0,6))+' · '+locsOf(w.id).length+' storage locations':(src?'Copying details from '+esc(src.name)+'. Storage locations are generated for the new site.':'Register a new storage site. A default zone layout is created automatically.'),
    body:'<form class="card" id="wform" novalidate>'+warehouseForm(w,mode)+(mode!=='edit'?'<div class="form-section">'+sectionHead(4,'Default layout','Zones created with the warehouse')+'<div class="form-grid">'+F({name:'zA',label:'Zone A · Bulk storage',type:'toggle',span:3,value:true})+F({name:'zB',label:'Zone B · Pick face',type:'toggle',span:3,value:true})+F({name:'zC',label:'Zone C · Controlled',type:'toggle',span:3,value:false})+F({name:'zQ',label:'Zone Q · Quarantine',type:'toggle',span:3,value:true})+'</div></div>':'')+
      '<div class="form-actions"><span class="spacer"></span>'+btn('Cancel','','','type="button" data-go="'+(mode==='edit'?'warehouse-view/'+w.id:'warehouses')+'"')+(mode!=='edit'?btn('Save & New','','','type="button" data-save="new"'):'')+btn(mode==='edit'?'Save Changes':'Save Warehouse','save','primary','type="submit"')+'</div></form>',
    mount(page){const form=$('#wform',page);
      const save=how=>{if(!validateForm(form,err=>{const d=formData(form);if(mode!=='edit'&&warehouses.some(x=>x.code===d.code))err('code','Code '+d.code+' is already used');if(d.status==='Inactive'&&w&&whStock(w.id).length)err('status','Transfer out the '+fmtN(sum(whStock(w.id),s=>s.qty))+' units on hand before deactivating')}))return;
        const d=formData(form);
        if(mode==='edit'){const ch=['name','type','capacity','status','address','city','state','country','manager','contact','email'].filter(k=>String(w[k])!==String(d[k]));if(!ch.length){toast('info','No changes to save','');return}ch.forEach(k=>logAudit('Inventory','Updated',w.code,k+': '+w[k],k+': '+d[k]));['name','type','capacity','status','address','city','state','country','manager','contact','email'].forEach(k=>w[k]=d[k]);toast('success','Warehouse updated',ch.length+' field'+(ch.length>1?'s':'')+' changed on '+w.code+'.');navigate('warehouse-view/'+w.id);return}
        const nw={id:'W'+Date.now().toString().slice(-5),createdAt:NOW()};['name','code','type','capacity','status','address','city','state','country','manager','contact','email'].forEach(k=>nw[k]=d[k]);warehouses.push(nw);
        const short=nw.code.split('-')[1];[['A','Bulk storage','zA'],['B','Pick face','zB'],['C','Controlled','zC'],['Q','Quarantine','zQ']].forEach(([z,zn,k])=>{if(d[k])locations.push({id:'L'+(locations.length+1)+'x'+short,warehouseId:nw.id,zone:z,zoneName:zn,rack:'R01',shelf:'S01',bin:'B01',code:short+'-'+z+'-01-01-01',capacity:z==='Q'?300:1000,status:'Active'})});
        logAudit('Inventory','Created',nw.code,'—',nw.name);toast('success','Warehouse created',nw.name+' ('+nw.code+') is ready for receipts.',{label:'View warehouse',onClick:()=>navigate('warehouse-view/'+nw.id)});
        navigate(how==='new'?'warehouse-create':'warehouse-view/'+nw.id)};
      form.addEventListener('submit',e=>{e.preventDefault();save()});const sn=$('[data-save=new]',page);if(sn)sn.onclick=()=>save('new');}};
}
ROUTES['warehouse-create']=(p,q)=>{const src=q.from?W_BY(q.from):null;return whFormPage(src?Object.assign({},src,{name:'Copy of '+src.name,status:'Active'}):null,src?'dup':'create',src)};
ROUTES['warehouse-edit']=id=>{const w=W_BY(id);return w?whFormPage(w,'edit'):ROUTES['not-found']()};
ROUTES['warehouse-view']=id=>{
  const w=W_BY(id);if(!w)return ROUTES['not-found']();
  const rows=()=>stock.filter(s=>s.warehouseId===w.id&&s.qty>0);const q=sum(rows(),s=>s.qty);
  return{title:w.name,nav:'warehouses',crumbs:[['Inventory','inventory'],['Warehouses','warehouses'],[w.name]],titleHTML:esc(w.name)+' '+badge(w.status),
    sub:'<span class="mono">'+esc(w.code)+'</span> · '+esc(w.type)+' · '+esc(w.address)+', '+esc(w.city)+', '+esc(w.state),
    actions:btn('Edit','edit','','data-go="warehouse-edit/'+w.id+'"')+btn('Delete','trash','danger-ghost','data-del')+btn('Transfer stock','transfer','primary','data-go="transfer-create?from='+w.id+'"'),
    body:'<div class="stat-strip mb-16"><div class="stat"><small>Products</small><b>'+rows().length+'</b><em>with stock on hand</em></div><div class="stat"><small>Stock quantity</small><b>'+fmtN(q)+'</b><em>'+fmtN(sum(rows(),s=>s.reserved))+' reserved</em></div><div class="stat"><small>Stock value</small><b>'+fmtM(whValue(w.id),0)+'</b><em>standard cost</em></div><div class="stat"><small>Utilization</small><b>'+whUtil(w)+'%</b><em>of '+fmtN(w.capacity)+' units</em></div><div class="stat"><small>Locations</small><b>'+locsOf(w.id).length+'</b><em>'+[...new Set(locsOf(w.id).map(l=>l.zone))].length+' zones</em></div></div>'+
      '<section class="card" data-tabs>'+tabsHTML([['stock','Stock',rows().length],['loc','Storage Locations',locsOf(w.id).length],['mv','Movements'],['det','Details']],'stock')+
      '<div class="tab-panel active" data-panel="stock"><div id="wS"></div></div><div class="tab-panel" data-panel="loc"><div id="wL"></div></div><div class="tab-panel" data-panel="mv"><div id="wM"></div></div>'+
      '<div class="tab-panel" data-panel="det"><div class="card-body"><div class="grid g-2"><dl class="dl"><dt>Warehouse code</dt><dd class="mono">'+esc(w.code)+'</dd><dt>Type</dt><dd>'+esc(w.type)+'</dd><dt>Address</dt><dd>'+esc(w.address)+'<br>'+esc(w.city)+', '+esc(w.state)+'<br>'+esc(w.country)+'</dd><dt>Capacity</dt><dd>'+fmtN(w.capacity)+' units</dd></dl><dl class="dl"><dt>Manager</dt><dd>'+esc(w.manager)+'</dd><dt>Contact</dt><dd>'+esc(w.contact)+'</dd><dt>Email</dt><dd>'+esc(w.email)+'</dd><dt>Status</dt><dd>'+badge(w.status)+'</dd></dl></div><h3 class="card-title mt-24 mb-16">Audit</h3>'+auditTimeline(auditFor(w.code))+'</div></div></section>',
    mount(page){
      $('[data-del]',page).onclick=()=>deleteWarehouse(w,()=>navigate('warehouses'));
      mountTable(page,'#wS',{title:w.code+' stock',columns:[{key:'p',label:'Product',value:r=>P_BY(r.productId).name+' '+P_BY(r.productId).sku,render:r=>prodCell(P_BY(r.productId))}].concat(stockRowColumns().slice(1)),data:rows,rowId:r=>r.productId,filters:[{key:'s',label:'Any status',options:['Healthy','Low Stock','Critical','Overstock'],test:(r,v)=>rowStatus(r)===v}],onRowClick:r=>navigate('product-view/'+r.productId)});
      const lt=mountTable(page,'#wL',{title:w.code+' locations',columns:locColumns().filter(c=>c.key!=='wh'),data:()=>locsOf(w.id),actions:l=>locActions(l,()=>lt.refresh()),toolbar:btn('Add location','plus','primary sm','data-addloc')});
      $('[data-addloc]',page).onclick=()=>locationModal(null,()=>lt.refresh(),w.id);
      mountTable(page,'#wM',{title:w.code+' movements',columns:ledgerColumns().filter(c=>c.key!=='warehouse'),data:()=>ledger.filter(e=>e.warehouseId===w.id).slice().reverse()});
      page.addEventListener('click',e=>{const a=e.target.closest('[data-le]');if(a){e.preventDefault();ledgerDrawer(ledger.find(x=>x.id===a.dataset.le))}});
    }};
};

/* ---------- storage locations ---------- */
const locStock=l=>sum(stock.filter(s=>s.locationId===l.id),s=>s.qty);
function locColumns(){return[
  {key:'code',label:'Location',render:l=>'<span class="mono strong">'+esc(l.code)+'</span>'},
  {key:'wh',label:'Warehouse',value:l=>W_BY(l.warehouseId).code,render:l=>'<span class="chip">'+esc(W_BY(l.warehouseId).code)+'</span>'},
  {key:'zone',label:'Zone',value:l=>l.zone+' · '+l.zoneName},
  {key:'rack',label:'Rack'},{key:'shelf',label:'Shelf'},{key:'bin',label:'Bin'},
  {key:'capacity',label:'Capacity',align:'right',render:l=>fmtN(l.capacity)},
  {key:'cur',label:'Current Stock',align:'right',value:locStock,render:l=>fmtN(locStock(l))},
  {key:'util',label:'Fill',value:l=>locStock(l)/l.capacity,render:l=>utilHTML(Math.round(locStock(l)/l.capacity*100)),export:false},
  {key:'status',label:'Status',render:l=>badge(l.status)}]}
function locActions(l,refresh){return[{label:'Edit',icon:'edit',onClick:()=>locationModal(l,refresh)},{label:'Duplicate',icon:'copy',onClick:()=>locationModal(Object.assign({},l,{id:null,bin:'B'+String(+l.bin.slice(1)+1).padStart(2,'0')}),refresh,null,true)},'-',{label:'Delete',icon:'trash',danger:true,onClick:()=>{const q=locStock(l);if(q){messageModal('warning','Location holds stock','<p>'+esc(l.code)+' holds '+fmtN(q)+' units. Move the stock to another bin before deleting it.</p>');return}confirmDialog({danger:true,title:'Delete location?',message:'Delete storage location '+esc(l.code)+'? This action cannot be undone.',confirm:'Delete location'}).then(ok=>{if(!ok)return;locations.splice(locations.indexOf(l),1);logAudit('Inventory','Deleted',l.code,'Location','—');toast('success','Location deleted',l.code+' removed.');refresh()})}}]}
function locationModal(l,after,wid,dup){const edit=l&&!dup;const v=k=>l?l[k]:'';
  const body=el('<form novalidate><div class="form-grid">'+F({name:'warehouseId',label:'Warehouse',type:'select',req:true,span:6,value:v('warehouseId')||wid||'W1',placeholder:false,options:whOptions(),disabled:edit})+F({name:'zone',label:'Zone',type:'select',req:true,span:6,value:v('zone')||'A',placeholder:false,options:[['A','A · Bulk storage'],['B','B · Pick face'],['C','C · Controlled'],['Q','Q · Quarantine']]})+F({name:'rack',label:'Rack',req:true,span:4,value:v('rack')||'R01',pattern:'^R[0-9]{2}$',patternMsg:'Format R01'})+F({name:'shelf',label:'Shelf',req:true,span:4,value:v('shelf')||'S01',pattern:'^S[0-9]{2}$',patternMsg:'Format S01'})+F({name:'bin',label:'Bin',req:true,span:4,value:v('bin')||'B01',pattern:'^B[0-9]{2}$',patternMsg:'Format B01'})+F({name:'capacity',label:'Capacity',type:'number',req:true,min:1,span:6,suffix:'units',value:v('capacity')||1000})+F({name:'status',label:'Status',type:'select',span:6,value:v('status')||'Active',placeholder:false,options:['Active','Blocked','Inactive']})+'</div><div class="callout mt-16">Location code: <b class="mono" id="locCode"></b></div></form>');
  const upd=()=>{const d=formData(body);const w=W_BY(d.warehouseId||(l&&l.warehouseId));$('#locCode',body).textContent=(w?w.code.split('-')[1]:'')+'-'+d.zone+'-'+d.rack.slice(1)+'-'+d.shelf.slice(1)+'-'+d.bin.slice(1)};body.addEventListener('input',upd);body.addEventListener('change',upd);upd();
  openModal({type:edit?'edit':'create',title:edit?'Edit storage location':'Create storage location',subtitle:edit?esc(l.code):'Warehouse › Zone › Rack › Shelf › Bin',body,actions:[{label:'Cancel'},{label:edit?'Save changes':'Create location',variant:'primary',onClick:()=>{const code=$('#locCode',body).textContent;if(!validateForm(body,err=>{if(locations.some(x=>x.code===code&&x!==l))err('bin','Location '+code+' already exists')}))return false;const d=formData(body);const o=edit?l:{id:'L'+Date.now().toString().slice(-6),warehouseId:d.warehouseId};
    Object.assign(o,{zone:d.zone,zoneName:{A:'Bulk storage',B:'Pick face',C:'Controlled',Q:'Quarantine'}[d.zone],rack:d.rack,shelf:d.shelf,bin:d.bin,capacity:d.capacity,status:d.status,code});if(!edit)locations.push(o);logAudit('Inventory',edit?'Updated':'Created',code,edit?l.code:'—','Capacity: '+d.capacity);toast('success',edit?'Location updated':'Location created',code+' saved.');after&&after()}}]})}
ROUTES.locations=()=>({title:'Storage Locations',crumbs:[['Inventory','inventory'],['Warehouses','warehouses'],['Storage Locations']],sub:'Warehouse › Zone › Rack › Shelf › Bin hierarchy with capacity and current fill.',actions:btn('Create Location','plus','primary','data-new'),body:'<section class="card" id="lT"></section>',
  mount(page){const t=mountTable(page,'#lT',{title:'Storage locations',selectable:true,columns:locColumns(),data:()=>locations,filters:[{key:'w',label:'All warehouses',options:whOptions(true).map(o=>[o[0],o[1].split(' (')[0]]),test:(l,v)=>l.warehouseId===v},{key:'z',label:'All zones',options:[['A','A · Bulk storage'],['B','B · Pick face'],['C','C · Controlled'],['Q','Q · Quarantine']],test:(l,v)=>l.zone===v}],actions:l=>locActions(l,()=>t.refresh()),
    bulkActions:[{label:'Block',icon:'ban',onClick:ids=>{ids.forEach(id=>{const l=L_BY(id);if(l)l.status='Blocked'});toast('success','Locations blocked',ids.length+' locations blocked for putaway.');t.clearSelection()}},{label:'Unblock',icon:'checkCircle',onClick:ids=>{ids.forEach(id=>{const l=L_BY(id);if(l)l.status='Active'});toast('success','Locations active',ids.length+' locations available.');t.clearSelection()}}]});
  $('[data-new]',page).onclick=()=>locationModal(null,()=>t.refresh())}});
TONE.Blocked='warning';

/* ---------- warehouse stock ---------- */
ROUTES['warehouse-stock']=(p,q)=>{
  const aw=activeWh();
  return{title:'Warehouse Stock',crumbs:[['Inventory','inventory'],['Warehouses','warehouses'],['Warehouse Stock']],sub:'On-hand quantity by product and site.',
    body:'<section class="card" data-tabs>'+tabsHTML([['list','By warehouse'],['matrix','Matrix view']],'list')+'<div class="tab-panel active" data-panel="list"><div id="wsT"></div></div><div class="tab-panel" data-panel="matrix"><div id="wsM"></div></div></section>',
    mount(page){
      mountTable(page,'#wsT',{title:'Warehouse stock',columns:[{key:'p',label:'Product',value:r=>P_BY(r.productId).name+' '+P_BY(r.productId).sku,render:r=>prodCell(P_BY(r.productId))}].concat(stockRowColumns()),data:()=>stock.filter(s=>s.qty>0),rowId:r=>r.productId+r.warehouseId,
        filters:[{key:'w',label:'All warehouses',value:q.warehouse||'',options:aw.map(w=>[w.id,w.name]),test:(r,v)=>r.warehouseId===v},{key:'c',label:'All categories',options:categories.map(c=>[c.id,c.name]),test:(r,v)=>P_BY(r.productId).categoryId===v}],onRowClick:r=>navigate('product-view/'+r.productId),
        footer:rs=>['<b>'+rs.length+' lines</b>','','',fmtN(sum(rs,r=>r.qty)),fmtN(sum(rs,r=>r.reserved)),fmtN(sum(rs,r=>r.qty-r.reserved)),fmtM(sum(rs,r=>r.qty*P_BY(r.productId).cost),0),'']});
      const mcols=[{key:'p',label:'Product',value:x=>x.name+' '+x.sku,render:x=>prodCell(x)}].concat(aw.map(w=>({key:w.id,label:w.code,align:'right',value:x=>whQty(x.id,w.id),render:x=>{const v=whQty(x.id,w.id);return v?fmtN(v):'<span class="subtle">—</span>'}}))).concat([{key:'tot',label:'Total',align:'right',value:x=>productQty(x.id),render:x=>'<b style="font-weight:600">'+fmtN(productQty(x.id))+'</b>'},{key:'st',label:'Status',value:pStatus,render:x=>badge(pStatus(x))}]);
      mountTable(page,'#wsM',{title:'Stock matrix',columns:mcols,data:()=>products.filter(x=>x.status!=='Draft'),pageSize:25,onRowClick:x=>navigate('product-view/'+x.id),footer:rs=>['<b>Total</b>'].concat(aw.map(w=>fmtN(sum(rs,x=>whQty(x.id,w.id))))).concat([fmtN(sum(rs,x=>productQty(x.id))),''])});
    }};
};

/* =========================================================
   STOCK OVERVIEW & LEDGER
   ========================================================= */
ROUTES.stock=(p,q)=>{
  const cnt={};stock.forEach(r=>{const s=rowStatus(r);cnt[s]=(cnt[s]||0)+1});
  return{title:'Stock Overview',crumbs:[['Inventory','inventory'],['Stock Management','stock'],['Stock Overview']],sub:'Movement summary for every product and warehouse since go-live on 01 Jul 2026.',
    actions:btn('Stock Count','count','','data-go="stock-count"')+btn('Adjust Stock','sliders','','data-go="adjustment-create"')+btn('Transfer Stock','transfer','primary','data-go="transfer-create"'),
    body:'<div class="row wrap mb-16" style="gap:8px">'+['Healthy','Low Stock','Critical','Out of Stock','Overstock'].map(s=>'<button class="card row" data-stf="'+s+'" style="padding:10px 14px;gap:10px;cursor:pointer">'+badge(s)+'<b class="num" style="font-size:16px">'+(cnt[s]||0)+'</b><span class="muted" style="font-size:12.5px">lines</span></button>').join('')+'</div><section class="card" id="sT"></section>',
    mount(page){
      const t=mountTable(page,'#sT',{title:'Stock overview',columns:[
        {key:'p',label:'Product',value:r=>P_BY(r.productId).name,render:r=>prodCell(P_BY(r.productId),P_BY(r.productId).brand)},
        {key:'sku',label:'SKU',value:r=>P_BY(r.productId).sku,render:r=>'<span class="mono">'+esc(P_BY(r.productId).sku)+'</span>'},
        {key:'w',label:'Warehouse',value:r=>W_BY(r.warehouseId).code,render:r=>'<span class="chip">'+esc(W_BY(r.warehouseId).code)+'</span>'},
        {key:'l',label:'Location',value:r=>(L_BY(r.locationId)||{}).code,render:r=>'<span class="mono">'+esc((L_BY(r.locationId)||{}).code||'—')+'</span>'},
        {key:'opening',label:'Opening Qty',align:'right',render:r=>fmtN(r.opening)},
        {key:'received',label:'Received',align:'right',render:r=>r.received?'<span class="pos">+'+fmtN(r.received)+'</span>':'—'},
        {key:'issued',label:'Issued',align:'right',render:r=>r.issued?'<span class="neg">−'+fmtN(r.issued)+'</span>':'—'},
        {key:'tr',label:'Transferred',align:'right',value:r=>r.transferredIn-r.transferredOut,render:r=>{const v=r.transferredIn-r.transferredOut;return v?'<span class="'+(v>0?'pos':'neg')+'">'+(v>0?'+':'−')+fmtN(Math.abs(v))+'</span>':'—'}},
        {key:'adjusted',label:'Adjusted',align:'right',render:r=>r.adjusted?'<span class="'+(r.adjusted>0?'pos':'neg')+'">'+(r.adjusted>0?'+':'−')+fmtN(Math.abs(r.adjusted))+'</span>':'—'},
        {key:'reserved',label:'Reserved',align:'right',render:r=>fmtN(r.reserved)},
        {key:'avail',label:'Available',align:'right',value:r=>r.qty-r.reserved,render:r=>'<b style="font-weight:600">'+fmtN(r.qty-r.reserved)+'</b>'},
        {key:'st',label:'Status',value:rowStatus,render:r=>badge(rowStatus(r))}],
        data:()=>stock,rowId:r=>r.productId+'|'+r.warehouseId,pageSize:25,
        filters:[{key:'w',label:'All warehouses',options:activeWh().map(w=>[w.id,w.name]),test:(r,v)=>r.warehouseId===v},{key:'c',label:'All categories',options:categories.map(c=>[c.id,c.name]),test:(r,v)=>P_BY(r.productId).categoryId===v},{key:'s',label:'Any status',value:q.status||'',options:['Healthy','Low Stock','Critical','Out of Stock','Overstock'],test:(r,v)=>rowStatus(r)===v}],
        actions:r=>[{label:'View product',icon:'eye',onClick:()=>navigate('product-view/'+r.productId)},{label:'Stock History',icon:'history',onClick:()=>navigate('ledger?product='+r.productId+'&warehouse='+r.warehouseId)},{label:'Transfer from here',icon:'transfer',onClick:()=>navigate('transfer-create?from='+r.warehouseId+'&product='+r.productId)},{label:'Adjust',icon:'sliders',onClick:()=>navigate('adjustment-create?warehouse='+r.warehouseId+'&product='+r.productId)}],
        footer:rs=>['<b>'+rs.length+' lines</b>','','','',fmtN(sum(rs,r=>r.opening)),fmtN(sum(rs,r=>r.received)),fmtN(sum(rs,r=>r.issued)),fmtN(sum(rs,r=>r.transferredIn-r.transferredOut)),fmtN(sum(rs,r=>r.adjusted)),fmtN(sum(rs,r=>r.reserved)),fmtN(sum(rs,r=>r.qty-r.reserved)),'']});
      $$('[data-stf]',page).forEach(b=>b.onclick=()=>{const s=$('[data-dt-f=s]',page);s.value=b.dataset.stf;s.dispatchEvent(new Event('change',{bubbles:true}))});
    }};
};
ROUTES.ledger=(p,q)=>({title:'Stock Ledger',crumbs:[['Inventory','inventory'],['Stock Management','stock'],['Stock Ledger']],sub:'Immutable record of every inventory movement with running balance per product and warehouse.',
  body:'<section class="card" id="ledT"></section>',
  mount(page){
    const range=v=>e=>daysBetween(e.date,NOW())<=+v;
    mountTable(page,'#ledT',{title:'Stock ledger',columns:ledgerColumns(),data:()=>ledger.slice().reverse(),pageSize:25,searchPlaceholder:'Search transaction, product, reference',
      filters:[{key:'t',label:'All transaction types',value:q.type||'',options:['GRN','Goods Issue','Transfer','Adjustment','Sales','Purchase','Opening Balance'],test:(e,v)=>e.type===v},
        {key:'w',label:'All warehouses',value:q.warehouse||'',options:warehouses.map(w=>[w.id,w.name]),test:(e,v)=>e.warehouseId===v},
        {key:'p',label:'All products',value:q.product||'',options:products.map(x=>[x.id,x.name]),test:(e,v)=>e.productId===v},
        {key:'d',label:'All dates',options:[['7','Last 7 days'],['30','Last 30 days'],['90','Last 90 days']],test:(e,v)=>range(v)(e)}],
      footer:rs=>['<b>'+fmtN(rs.length)+' entries</b>','','','','','','<span class="pos">+'+fmtN(sum(rs,e=>e.inQty))+'</span>','<span class="neg">−'+fmtN(sum(rs,e=>e.outQty))+'</span>','','',fmtM(sum(rs,e=>e.value),0),'',''],
      emptyTitle:'No ledger entries',emptyText:'Postings from receipts, issues, transfers and adjustments appear here.'});
    page.addEventListener('click',e=>{const a=e.target.closest('[data-le]');if(a){e.preventDefault();ledgerDrawer(ledger.find(x=>x.id===a.dataset.le))}});
  }});

/* =========================================================
   LINE EDITOR (items tables on documents)
   ========================================================= */
function LineEditor(o){
  const root=el('<div><div class="table-wrap auto"><table class="tbl items-tbl"><thead><tr><th style="width:36px">#</th>'+o.cols.map(c=>'<th class="'+(c.align==='right'?'right':'')+'" style="'+(c.w?'width:'+c.w:'')+'">'+esc(c.label)+(c.req?'<span class="req">*</span>':'')+'</th>').join('')+'<th class="act"><span class="sr">Remove</span></th></tr></thead><tbody></tbody></table></div><div class="items-foot"><button type="button" class="btn btn-sm" data-add>'+icon('plus',15)+'Add item</button><div class="row wrap" data-foot style="gap:16px;font-size:13px"></div></div></div>');
  const tbody=$('tbody',root);const api={el:root,lines:o.lines&&o.lines.length?o.lines:[o.newLine()]};
  function rowEl(line,i){const tr=el('<table><tbody><tr data-i="'+i+'"><td class="ro num">'+(i+1)+'</td>'+o.rowHTML(line,i)+'<td class="act"><button type="button" class="btn btn-ghost btn-sm btn-icon" data-rm aria-label="Remove line">'+icon('trash',15)+'</button></td></tr></tbody></table>').querySelector('tr');if(o.calc)$$('[data-calc]',tr).forEach(c=>c.innerHTML=o.calc(line,c.dataset.calc));return tr}
  api.render=()=>{tbody.innerHTML='';if(!api.lines.length){tbody.innerHTML='<tr><td colspan="'+(o.cols.length+2)+'"><div class="empty" style="padding:24px"><h4>No items</h4><p>Add at least one item to this document.</p></div></td></tr>'}api.lines.forEach((l,i)=>tbody.append(rowEl(l,i)));api.foot()};
  api.foot=()=>{$('[data-foot]',root).innerHTML=o.footer?o.footer(api.lines):''};
  api.refreshRow=i=>{const old=$('tr[data-i="'+i+'"]',tbody);if(old)old.replaceWith(rowEl(api.lines[i],i));api.foot()};
  root.addEventListener('click',e=>{if(e.target.closest('[data-add]')){api.lines.push(o.newLine());api.render();const last=$('tbody tr:last-child select, tbody tr:last-child input',root);if(last)last.focus();return}
    const rm=e.target.closest('[data-rm]');if(rm){api.lines.splice(+rm.closest('tr').dataset.i,1);api.render()}});
  const onEdit=(e,full)=>{const inp=e.target.closest('[data-k]');if(!inp)return;const tr=inp.closest('tr');const i=+tr.dataset.i;const line=api.lines[i];const k=inp.dataset.k;
    line[k]=inp.type==='number'?(inp.value===''?null:Number(inp.value)):inp.value;inp.classList.remove('invalid');
    if(o.onChange)o.onChange(line,k);
    if(full&&o.rerenderOn&&o.rerenderOn.includes(k)){api.refreshRow(i);const n=$('tr[data-i="'+i+'"] [data-k="'+(o.focusAfter&&o.focusAfter[k]||k)+'"]',tbody);if(n)n.focus()}
    else{$$('[data-calc]',tr).forEach(c=>c.innerHTML=o.calc(line,c.dataset.calc));api.foot()}};
  root.addEventListener('input',e=>onEdit(e,false));root.addEventListener('change',e=>onEdit(e,true));
  api.validate=()=>{let ok=true;const seen={};$$('.invalid',root).forEach(x=>x.classList.remove('invalid'));
    if(!api.lines.length){toast('error','Add at least one item','The document has no lines.');return false}
    api.lines.forEach((l,i)=>{const tr=$('tr[data-i="'+i+'"]',tbody);const errs=o.validateLine(l,i);
      if(l.productId){if(seen[l.productId]){errs.productId='Duplicate product'}seen[l.productId]=1}
      Object.keys(errs).forEach(k=>{const f=$('[data-k="'+k+'"]',tr);if(f){f.classList.add('invalid');f.title=errs[k]}ok=false});
      if(Object.keys(errs).length&&ok===false&&!api._first)api._first=Object.values(errs)[0]});
    if(!ok){toast('error','Fix the highlighted items',api._first||'Some lines are incomplete.');api._first=null;const f=$('.invalid',root);if(f)f.focus()}
    return ok};
  api.render();return api;
}
const lineProdSelect=(line,list)=>'<select class="select" data-k="productId" aria-label="Product" style="min-width:220px">'+optionsHTML(list.map(p=>[p.id,p.name+' — '+p.sku]),line.productId,'Select product')+'</select>';
function docHeaderCard(no,status,flowHTML,actionsHTML){return '<section class="card mb-16"><div class="card-body"><div class="row between wrap" style="gap:16px;margin-bottom:20px"><div class="doc-head"><span class="doc-ico">'+icon('file',22)+'</span><div><div class="row" style="gap:10px"><b class="mono" style="font-size:16px">'+esc(no)+'</b>'+badge(status)+'</div><div class="muted" style="font-size:13px">Workflow status</div></div></div><div class="row wrap">'+actionsHTML+'</div></div>'+flowHTML+'</div></section>'}
function reasonModal(title,label,cb){const b=el('<form novalidate><div class="form-grid">'+F({name:'reason',label:label,type:'textarea',req:true,span:12,rows:3,ph:'Explain the decision for the requester'})+'</div></form>');openModal({type:'warning',title,indent:false,body:b,actions:[{label:'Cancel'},{label:'Reject',variant:'danger',onClick:()=>{if(!validateForm(b))return false;cb(formData(b).reason)}}]})}

/* =========================================================
   STOCK TRANSFER
   ========================================================= */
const trfQty=t=>sum(t.items,i=>i.qty||0);
ROUTES['stock-transfer']=(p,q)=>{
  const c=s=>stockTransfers.filter(t=>t.status===s).length;
  return{title:'Stock Transfer',crumbs:[['Inventory','inventory'],['Stock Management','stock'],['Stock Transfer']],sub:'Move stock between warehouses. Transfers need approval before dispatch.',
    actions:btn('Create Transfer','plus','primary','data-go="transfer-create"'),
    body:'<div class="kpis mb-16">'+kpi('Awaiting approval',c('Submitted'),'shield','warning','Submitted by requesting sites')+kpi('Ready to dispatch',c('Approved'),'checkCircle','primary','Approved, not yet shipped')+kpi('In transit',c('In Transit'),'truck','purple',fmtN(sum(stockTransfers.filter(t=>t.status==='In Transit'),trfQty))+' units on the road')+kpi('Completed',c('Completed'),'check','success','Since go-live')+'</div><section class="card" id="tT"></section>',
    mount(page){const t=mountTable(page,'#tT',{title:'Stock transfers',selectable:true,sort:'date',dir:-1,columns:[
      {key:'no',label:'Transfer No',render:t=>'<a class="link mono" href="#/transfer-view/'+t.id+'">'+esc(t.no)+'</a>'},
      {key:'date',label:'Date',render:t=>fmtD(t.date)},
      {key:'route',label:'Source → Destination',value:t=>W_BY(t.from).code+' '+W_BY(t.to).code,render:t=>'<span class="row" style="gap:6px"><span class="chip">'+esc(W_BY(t.from).code)+'</span>'+icon('arrowRight',14)+'<span class="chip">'+esc(W_BY(t.to).code)+'</span></span>'},
      {key:'items',label:'Items',align:'right',value:t=>t.items.length},
      {key:'qty',label:'Quantity',align:'right',value:trfQty,render:t=>fmtN(trfQty(t))},
      {key:'value',label:'Value',align:'right',value:t=>sum(t.items,i=>i.qty*P_BY(i.productId).cost),render:t=>fmtM(sum(t.items,i=>(i.qty||0)*(P_BY(i.productId)||{cost:0}).cost),0)},
      {key:'priority',label:'Priority',render:t=>badge(t.priority)},
      {key:'reason',label:'Reason'},
      {key:'requestedBy',label:'Requested By',render:t=>userCell(t.requestedBy)},
      {key:'status',label:'Status',render:t=>badge(t.status)}],data:()=>stockTransfers,onRowClick:t=>navigate('transfer-view/'+t.id),
      filters:[{key:'s',label:'Any status',value:q.status||'',options:FLOWS.transfer.steps.concat(['Rejected','Cancelled']),test:(t,v)=>t.status===v},{key:'f',label:'Any source',options:activeWh().map(w=>[w.id,w.code]),test:(t,v)=>t.from===v},{key:'d',label:'Any destination',options:activeWh().map(w=>[w.id,w.code]),test:(t,v)=>t.to===v},{key:'p',label:'Any priority',options:['Urgent','High','Normal','Low'],test:(t,v)=>t.priority===v}],
      actions:x=>[{label:'View',icon:'eye',onClick:()=>navigate('transfer-view/'+x.id)},{label:'Edit',icon:'edit',disabled:x.status!=='Draft',onClick:()=>navigate('transfer-edit/'+x.id)},{label:'Duplicate',icon:'copy',onClick:()=>duplicateDoc('transfer',x)},'-',{label:'Delete',icon:'trash',danger:true,onClick:()=>deleteDoc('transfer',x,()=>t.refresh())}],
      bulkActions:[{label:'Approve submitted',icon:'checkCircle',onClick:ids=>{let n=0;ids.forEach(id=>{const x=stockTransfers.find(t=>t.id===id);if(x&&x.status==='Submitted'){x.status='Approved';x.approvedBy=CURRENT_USER.name;hist(x,'Approved',CURRENT_USER.name,NOW());logAudit('Stock Transfer','Updated',x.no,'Status: Submitted','Status: Approved');n++}});toast(n?'success':'info',n?n+' transfers approved':'Nothing to approve',n?'Ready for dispatch.':'Only submitted transfers can be approved.');t.clearSelection()}}]})}};
};
function transferFormPage(tr,q){
  const editing=!!tr;q=q||{};
  const doc=tr?JSON.parse(JSON.stringify(tr)):{no:'TRF-26'+String(counters.TRF+1).padStart(5,'0'),date:NOW(),from:q.from||'W1',to:'',requestedBy:CURRENT_USER.name,reason:'Stock rebalancing',priority:'Normal',notes:'',items:[]};
  if(!tr&&q.product)doc.items=[{productId:q.product,qty:null,batch:'',locationId:''}];
  return{title:editing?'Edit Transfer':'Create Stock Transfer',nav:'stock-transfer',crumbs:[['Inventory','inventory'],['Stock Management','stock'],['Stock Transfer','stock-transfer'],[editing?doc.no:'Create Transfer']],
    sub:'Draft → Submitted → Approved → In Transit → Received → Completed',
    body:'<form class="card" id="tform" novalidate><div class="form-section">'+sectionHead(1,'Transfer details','Source, destination and urgency')+'<div class="form-grid">'+
      F({name:'no',label:'Transfer Number',span:3,value:doc.no,readonly:true})+F({name:'date',label:'Transfer Date',type:'date',req:true,span:3,value:isoDate(doc.date)})+
      F({name:'from',label:'Source Warehouse',type:'select',req:true,span:3,value:doc.from,placeholder:false,options:whOptions()})+F({name:'to',label:'Destination Warehouse',type:'select',req:true,span:3,value:doc.to,options:whOptions()})+
      F({name:'requestedBy',label:'Requested By',type:'select',req:true,span:3,value:doc.requestedBy,options:USERS})+F({name:'reason',label:'Reason',type:'select',req:true,span:3,value:doc.reason,placeholder:false,options:['Stock rebalancing','Replenishment','Customer demand','Consolidation','Quality hold']})+
      F({name:'priority',label:'Priority',type:'select',req:true,span:3,value:doc.priority,placeholder:false,options:['Low','Normal','High','Urgent']})+F({name:'notes',label:'Notes',span:3,value:doc.notes,ph:'Carrier, dock or handling notes'})+
      '</div></div><div class="form-section" style="padding-bottom:0">'+sectionHead(2,'Items','Quantities are checked against available stock at the source')+'</div><div id="tLines"></div>'+
      '<div class="form-actions"><span class="spacer"></span>'+btn('Cancel','','','type="button" data-go="'+(editing?'transfer-view/'+tr.id:'stock-transfer')+'"')+btn('Save Draft','save','','type="button" data-act="Draft"')+btn('Submit','send','primary','type="button" data-act="Submitted"')+'</div></form>',
    mount(page){
      const form=$('#tform',page);const from=()=>$('[name=from]',form).value,to=()=>$('[name=to]',form).value;
      const srcProducts=()=>products.filter(p=>whAvail(p.id,from())>0);
      const le=LineEditor({lines:doc.items,newLine:()=>({productId:'',qty:null,batch:'',locationId:''}),rerenderOn:['productId'],focusAfter:{productId:'qty'},
        cols:[{label:'Product',req:true},{label:'SKU'},{label:'Available Qty',align:'right'},{label:'Transfer Qty',req:true,w:'120px'},{label:'Unit'},{label:'Batch'},{label:'Destination Location'}],
        rowHTML:l=>{const p=P_BY(l.productId);const bs=p?batches.filter(b=>b.productId===p.id&&b.warehouseId===from()&&b.qty>0):[];
          return '<td>'+lineProdSelect(l,srcProducts())+'</td><td class="ro mono">'+(p?esc(p.sku):'—')+'</td><td class="ro right num">'+(p?fmtN(whAvail(p.id,from())):'—')+'</td><td><input class="input right" type="number" min="1" data-k="qty" value="'+(l.qty==null?'':l.qty)+'" aria-label="Transfer quantity"></td><td class="ro">'+(p?esc(p.uom):'')+'</td><td>'+(bs.length?'<select class="select" data-k="batch" aria-label="Batch">'+optionsHTML(bs.map(b=>[b.batch,b.batch+' · '+fmtN(b.qty)+(b.expiry?' · exp '+fmtD(b.expiry):'')]),l.batch,'FIFO (automatic)')+'</select>':'<span class="ro subtle" style="display:block;padding-top:6px">Not batch-tracked</span>')+'</td><td><select class="select" data-k="locationId" aria-label="Destination location" style="min-width:150px"'+(to()?'':' disabled')+'>'+optionsHTML(to()?locsOf(to()).map(x=>[x.id,x.code]):[],l.locationId,to()?'Default location':'Select destination first')+'</select></td>'},
        validateLine:l=>{const e={};if(!l.productId)e.productId='Select a product';const av=l.productId?whAvail(l.productId,from()):0;if(!l.qty||l.qty<1)e.qty='Enter a quantity of at least 1';else if(l.qty>av)e.qty='Only '+fmtN(av)+' available at the source';return e},
        footer:ls=>'<span class="muted">'+ls.filter(l=>l.productId).length+' items</span><span>Total quantity <b class="num">'+fmtN(sum(ls,l=>l.qty||0))+'</b></span><span>Value <b class="num">'+fmtM(sum(ls,l=>(l.qty||0)*((P_BY(l.productId)||{}).cost||0)),0)+'</b></span>'});
      $('#tLines',page).append(le.el);
      $('[name=from]',form).addEventListener('change',()=>{le.lines.splice(0,le.lines.length,{productId:'',qty:null,batch:'',locationId:''});le.render();toast('info','Items cleared','Select products available at the new source warehouse.')});
      $('[name=to]',form).addEventListener('change',()=>{le.lines.forEach(l=>l.locationId='');le.render()});
      $$('[data-act]',page).forEach(b=>b.onclick=()=>{
        const st=b.dataset.act;
        if(!validateForm(form,err=>{if(from()&&from()===to())err('to','Destination must differ from the source warehouse')}))return;
        if(!le.validate())return;
        const d=formData(form);const items=le.lines.map(l=>({productId:l.productId,qty:l.qty,batch:l.batch||'',locationId:l.locationId||defaultLoc(d.to,P_BY(l.productId).expiry?'C':'A')}));
        let t=tr;
        if(!t){t={id:uid('T'),no:nextNo('TRF'),history:[],createdBy:CURRENT_USER.name,createdAt:NOW()};stockTransfers.unshift(t);hist(t,'Draft',CURRENT_USER.name,NOW(),'Transfer created');logAudit('Stock Transfer','Created',t.no,'—','Status: Draft')}
        else logAudit('Stock Transfer','Updated',t.no,'Items: '+t.items.length,'Items: '+items.length);
        Object.assign(t,{date:new Date(d.date+'T09:00'),from:d.from,to:d.to,requestedBy:d.requestedBy,reason:d.reason,priority:d.priority,notes:d.notes,items,status:'Draft'});
        if(st==='Submitted'){t.status='Submitted';hist(t,'Submitted',CURRENT_USER.name,NOW(),'Sent for approval');logAudit('Stock Transfer','Updated',t.no,'Status: Draft','Status: Submitted')}
        toast('success',st==='Submitted'?'Transfer submitted':'Draft saved',t.no+' · '+fmtN(trfQty(t))+' units from '+W_BY(t.from).code+' to '+W_BY(t.to).code+'.');
        navigate('transfer-view/'+t.id)});
    }};
}
ROUTES['transfer-create']=(p,q)=>transferFormPage(null,q);
ROUTES['transfer-edit']=id=>{const t=stockTransfers.find(x=>x.id===id);if(!t)return ROUTES['not-found']();if(t.status!=='Draft')return ROUTES['transfer-view'](id);return transferFormPage(t)};
function transferAction(t,act){
  const from=W_BY(t.from),to=W_BY(t.to);
  const set=(s,note)=>{const o=t.status;t.status=s;hist(t,s,CURRENT_USER.name,NOW(),note);logAudit('Stock Transfer','Updated',t.no,'Status: '+o,'Status: '+s);renderRoute()};
  if(act==='submit')set('Submitted','Sent for approval'),toast('success','Transfer submitted',t.no+' is waiting for approval.');
  if(act==='approve')confirmDialog({title:'Approve '+t.no+'?',message:'Approve moving '+fmtN(trfQty(t))+' units from '+esc(from.name)+' to '+esc(to.name)+'.',confirm:'Approve'}).then(ok=>{if(ok){t.approvedBy=CURRENT_USER.name;set('Approved','Approved for dispatch');toast('success','Transfer approved',t.no+' can now be dispatched.')}});
  if(act==='reject')reasonModal('Reject '+t.no,'Reason for rejection',r=>{set('Rejected',r);toast('warning','Transfer rejected',t.no+' was returned to '+t.requestedBy+'.')});
  if(act==='cancel')confirmDialog({danger:true,title:'Cancel '+t.no+'?',message:'The transfer will be closed without moving stock.',confirm:'Cancel transfer',cancel:'Keep transfer'}).then(ok=>{if(ok){set('Cancelled','Cancelled by requester');toast('info','Transfer cancelled',t.no+' closed.')}});
  if(act==='dispatch'){const short=t.items.filter(i=>i.qty>whAvail(i.productId,t.from)+0);
    if(short.length){messageModal('error','Not enough stock to dispatch','<p>Available stock at '+esc(from.code)+' changed since approval:</p><ul style="margin-top:8px;padding-left:18px;list-style:disc">'+short.map(i=>'<li>'+esc(P_BY(i.productId).name)+': needs '+fmtN(i.qty)+', available '+fmtN(whAvail(i.productId,t.from))+'</li>').join('')+'</ul><p>Edit quantities by rejecting and re-creating the transfer, or post a stock adjustment.</p>');return}
    confirmDialog({title:'Dispatch '+t.no+'?',message:fmtN(trfQty(t))+' units leave '+esc(from.name)+' now and stay in transit until received at '+esc(to.name)+'.',confirm:'Dispatch'}).then(ok=>{if(!ok)return;t.items.forEach(i=>postMovement({type:'Transfer',pid:i.productId,wid:t.from,outQty:i.qty,txNo:t.no,ref:'To '+to.code,bucket:'transfer',batch:i.batch}));set('In Transit','Dispatched from '+from.code);toast('success','Transfer dispatched','Stock at '+from.code+' reduced by '+fmtN(trfQty(t))+' units.')})}
  if(act==='receive')confirmDialog({title:'Receive '+t.no+' at '+to.code+'?',message:'Confirm all '+fmtN(trfQty(t))+' units arrived in good condition. Stock is added to the destination locations.',confirm:'Receive stock'}).then(ok=>{if(!ok)return;t.items.forEach(i=>{const r=stockRow(i.productId,t.to,true);postMovement({type:'Transfer',pid:i.productId,wid:t.to,inQty:i.qty,txNo:t.no,ref:'From '+from.code,bucket:'transfer',locationId:i.locationId,batch:i.batch||undefined})});set('Received','Received at '+to.code);toast('success','Stock received',fmtN(trfQty(t))+' units added to '+to.name+'.')});
  if(act==='complete'){set('Completed','Transfer closed');toast('success','Transfer completed',t.no+' is closed.')}
}
ROUTES['transfer-view']=id=>{
  const t=stockTransfers.find(x=>x.id===id);if(!t)return ROUTES['not-found']();
  const A={Draft:[['Edit','edit','','edit'],['Cancel','x','danger-ghost','cancel'],['Submit','send','primary','submit']],Submitted:[['Reject','x','danger-ghost','reject'],['Approve','check','primary','approve']],Approved:[['Cancel','x','danger-ghost','cancel'],['Dispatch','truck','primary','dispatch']],'In Transit':[['Receive','receive','primary','receive']],Received:[['Complete','checkCircle','success','complete']]}[t.status]||[];
  const acts=A.map(a=>btn(a[0],a[1],a[2],'data-ta="'+a[3]+'"')).join('');
  return{title:t.no,nav:'stock-transfer',crumbs:[['Inventory','inventory'],['Stock Management','stock'],['Stock Transfer','stock-transfer'],[t.no]],titleHTML:'Stock Transfer <span class="mono" style="font-weight:600">'+esc(t.no)+'</span>',
    sub:esc(W_BY(t.from).name)+' → '+esc(W_BY(t.to).name)+' · requested by '+esc(t.requestedBy)+' on '+fmtD(t.date),
    actions:btn('Duplicate','copy','','data-dup')+btn('Print','print','','data-print'),
    body:docHeaderCard(t.no,t.status,flowFor('transfer',t.status,histMeta(t,'transfer')),acts)+
      '<div class="grid g-main"><div class="stack">'+card('Items','<div class="table-wrap auto"><table class="tbl"><thead><tr><th>Product</th><th>SKU</th><th class="right">Source on hand</th><th class="right">Transfer Qty</th><th>Unit</th><th>Batch</th><th>Destination Location</th><th class="right">Value</th></tr></thead><tbody>'+t.items.map(i=>{const p=P_BY(i.productId);return '<tr><td>'+prodCell(p)+'</td><td class="mono">'+esc(p?p.sku:'')+'</td><td class="right num">'+fmtN(whQty(i.productId,t.from))+'</td><td class="right num"><b>'+fmtN(i.qty)+'</b></td><td>'+esc(p?p.uom:'')+'</td><td class="mono">'+esc(i.batch||'FIFO')+'</td><td class="mono">'+esc((L_BY(i.locationId)||{}).code||'Default')+'</td><td class="right num">'+fmtM(i.qty*(p?p.cost:0),0)+'</td></tr>'}).join('')+'</tbody><tfoot><tr><td colspan="3"><b>Total</b></td><td class="right num">'+fmtN(trfQty(t))+'</td><td colspan="3"></td><td class="right num">'+fmtM(sum(t.items,i=>i.qty*(P_BY(i.productId)||{cost:0}).cost),0)+'</td></tr></tfoot></table></div>',{tight:true})+
      card('Ledger postings',ledger.filter(e=>e.txNo===t.no).length?'<div class="table-wrap auto"><table class="tbl compact"><thead><tr><th>Date</th><th>Warehouse</th><th>Product</th><th class="right">In</th><th class="right">Out</th><th class="right">Balance</th></tr></thead><tbody>'+ledger.filter(e=>e.txNo===t.no).map(e=>'<tr><td>'+fmtDT(e.date)+'</td><td>'+esc(W_BY(e.warehouseId).code)+'</td><td>'+esc(P_BY(e.productId).name)+'</td><td class="right num pos">'+(e.inQty?'+'+fmtN(e.inQty):'—')+'</td><td class="right num neg">'+(e.outQty?'−'+fmtN(e.outQty):'—')+'</td><td class="right num">'+fmtN(e.balance)+'</td></tr>').join('')+'</tbody></table></div>':'<div class="empty" style="padding:24px"><h4>Nothing posted yet</h4><p>Stock leaves the source when the transfer is dispatched and arrives when it is received.</p></div>',{tight:true})+
      '</div><div class="stack">'+card('Details','<dl class="dl"><dt>Transfer date</dt><dd>'+fmtD(t.date)+'</dd><dt>Source</dt><dd>'+esc(W_BY(t.from).name)+'</dd><dt>Destination</dt><dd>'+esc(W_BY(t.to).name)+'</dd><dt>Requested by</dt><dd>'+esc(t.requestedBy)+'</dd><dt>Reason</dt><dd>'+esc(t.reason)+'</dd><dt>Priority</dt><dd>'+badge(t.priority)+'</dd><dt>Approved by</dt><dd>'+esc(t.approvedBy||'—')+'</dd><dt>Notes</dt><dd>'+esc(t.notes||'—')+'</dd><dt>Created by</dt><dd>'+esc(t.createdBy)+'</dd><dt>Created date</dt><dd>'+fmtDT(t.createdAt)+'</dd></dl>')+card('Activity',timelineHTML(t.history))+'</div></div>',
    mount(page){$$('[data-ta]',page).forEach(b=>b.onclick=()=>{if(b.dataset.ta==='edit')navigate('transfer-edit/'+t.id);else transferAction(t,b.dataset.ta)});$('[data-dup]',page).onclick=()=>duplicateDoc('transfer',t);$('[data-print]',page).onclick=doPrint}};
};
function doPrint(){try{window.print()}catch(e){toast('warning','Printing unavailable','Use your browser’s print command instead.')}}
function duplicateDoc(kind,d){
  const L={transfer:[stockTransfers,'TRF','transfer-view/','Stock Transfer'],adjustment:[stockAdjustments,'ADJ','adjustment-view/','Stock Adjustment'],issue:[goodsIssues,'GI','issue-view/','Goods Issue']}[kind];
  const c=JSON.parse(JSON.stringify(d));c.id=uid('D');c.no=nextNo(L[1]);c.status=kind==='issue'?'Requested':'Draft';c.date=NOW();c.createdAt=NOW();c.createdBy=CURRENT_USER.name;c.history=[];delete c.approvedBy;delete c.postedAt;
  if(kind==='adjustment')c.items.forEach(i=>i.systemQty=whQty(i.productId,c.warehouseId));
  hist(c,c.status,CURRENT_USER.name,NOW(),'Duplicated from '+d.no);L[0].unshift(c);logAudit(L[3],'Created',c.no,'—','Duplicate of '+d.no);
  toast('success','Duplicate created',c.no+' created from '+d.no+'.');navigate(L[2]+c.id);
}
function deleteDoc(kind,d,after){
  const L={transfer:[stockTransfers,'Stock Transfer',['Draft','Rejected','Cancelled']],adjustment:[stockAdjustments,'Stock Adjustment',['Draft','Rejected']],issue:[goodsIssues,'Goods Issue',['Requested','Rejected','Cancelled']],grn:[grns,'Goods Receipt',['Draft']]}[kind];
  if(!L[2].includes(d.status)){messageModal('warning','This document can’t be deleted','<p>'+esc(d.no)+' is '+esc(d.status)+'. Only documents in '+L[2].join(', ')+' status can be deleted, because later stages create inventory transactions.</p>',[{label:'Close',variant:'primary'}]);return}
  confirmDialog({danger:true,title:'Delete '+d.no+'?',message:'Are you sure you want to delete '+esc(L[1].toLowerCase())+' '+esc(d.no)+'? This action cannot be undone.',confirm:'Delete'}).then(ok=>{if(!ok)return;L[0].splice(L[0].indexOf(d),1);logAudit(L[1],'Deleted',d.no,'Status: '+d.status,'—');toast('success','Document deleted',d.no+' was deleted.');after&&after()});
}

/* =========================================================
   STOCK ADJUSTMENT
   ========================================================= */
const ADJ_TYPES=['Increase','Decrease','Damage','Loss','Found Stock','Correction','Expiry'];
const adjDiff=i=>(i.physicalQty==null?0:i.physicalQty)-(i.systemQty||0);
const adjValue=a=>sum(a.items,i=>adjDiff(i)*(i.cost||0));
ROUTES['stock-adjustment']=(p,q)=>{
  const c=s=>stockAdjustments.filter(a=>a.status===s);
  return{title:'Stock Adjustment',crumbs:[['Inventory','inventory'],['Stock Management','stock'],['Stock Adjustment']],sub:'Correct on-hand quantities for damage, loss, found stock and count variances. Adjustments above '+fmtM(SETTINGS.adjLimit,0)+' need manager approval.',
    actions:btn('Create Adjustment','plus','primary','data-go="adjustment-create"'),
    body:'<div class="kpis mb-16">'+kpi('Drafts',c('Draft').length,'edit','primary','Not yet submitted')+kpi('Awaiting approval',c('Submitted').length,'shield','warning',fmtM(sum(c('Submitted'),adjValue),0)+' net value')+kpi('Approved, not posted',c('Approved').length,'checkCircle','purple','Ready to update inventory')+kpi('Posted this month',c('Posted').filter(a=>a.postedAt>=new Date(NOW().getFullYear(),NOW().getMonth(),1)).length,'book','success',fmtM(sum(c('Posted').filter(a=>a.postedAt>=new Date(NOW().getFullYear(),NOW().getMonth(),1)),adjValue),0)+' net value')+'</div><section class="card" id="aT"></section>',
    mount(page){const t=mountTable(page,'#aT',{title:'Stock adjustments',selectable:true,sort:'date',dir:-1,columns:[
      {key:'no',label:'Adjustment No',render:a=>'<a class="link mono" href="#/adjustment-view/'+a.id+'">'+esc(a.no)+'</a>'},{key:'date',label:'Date',render:a=>fmtD(a.date)},
      {key:'wh',label:'Warehouse',value:a=>W_BY(a.warehouseId).code,render:a=>'<span class="chip">'+esc(W_BY(a.warehouseId).code)+'</span>'},{key:'type',label:'Adjustment Type'},{key:'reason',label:'Reason',render:a=>'<span class="muted">'+esc(a.reason)+'</span>'},
      {key:'items',label:'Items',align:'right',value:a=>a.items.length},{key:'qty',label:'Net Qty',align:'right',value:a=>sum(a.items,adjDiff),render:a=>{const v=sum(a.items,adjDiff);return '<span class="'+(v>=0?'pos':'neg')+'">'+(v>0?'+':v<0?'−':'')+fmtN(Math.abs(v))+'</span>'}},
      {key:'value',label:'Value',align:'right',value:adjValue,render:a=>'<span class="'+(adjValue(a)>=0?'pos':'neg')+'">'+fmtM(adjValue(a))+'</span>'},{key:'ref',label:'Reference',value:a=>a.reference},{key:'by',label:'Created By',value:a=>a.createdBy,render:a=>userCell(a.createdBy)},{key:'status',label:'Status',render:a=>badge(a.status)}],
      data:()=>stockAdjustments,onRowClick:a=>navigate('adjustment-view/'+a.id),
      filters:[{key:'s',label:'Any status',options:['Draft','Submitted','Approved','Posted','Rejected'],test:(a,v)=>a.status===v},{key:'t',label:'All types',options:ADJ_TYPES,test:(a,v)=>a.type===v},{key:'w',label:'All warehouses',options:activeWh().map(w=>[w.id,w.code]),test:(a,v)=>a.warehouseId===v}],
      actions:a=>[{label:'View',icon:'eye',onClick:()=>navigate('adjustment-view/'+a.id)},{label:'Edit',icon:'edit',disabled:a.status!=='Draft',onClick:()=>navigate('adjustment-edit/'+a.id)},{label:'Duplicate',icon:'copy',onClick:()=>duplicateDoc('adjustment',a)},'-',{label:'Delete',icon:'trash',danger:true,onClick:()=>deleteDoc('adjustment',a,()=>t.refresh())}]})}};
};
function adjustmentFormPage(a,q){
  q=q||{};const editing=!!a;
  const doc=a?JSON.parse(JSON.stringify(a)):{no:'ADJ-26'+String(counters.ADJ+1).padStart(5,'0'),date:NOW(),warehouseId:q.warehouse||'W1',type:q.type||'Correction',reason:q.reason||'',reference:q.ref||'',items:[]};
  if(!a&&q.product){const qty=whQty(q.product,doc.warehouseId);doc.items=[{productId:q.product,systemQty:qty,physicalQty:q.qty!=null?Math.max(0,qty-Number(q.qty)):null,cost:P_BY(q.product).cost,reason:q.reason||''}]}
  return{title:editing?'Edit Adjustment':'Create Stock Adjustment',nav:'stock-adjustment',crumbs:[['Inventory','inventory'],['Stock Management','stock'],['Stock Adjustment','stock-adjustment'],[editing?doc.no:'Create Adjustment']],sub:'Draft → Submitted → Approval → Posted. Stock changes only when the adjustment is posted.',
    body:'<form class="card" id="aform" novalidate><div class="form-section">'+sectionHead(1,'Adjustment details','Where and why stock is being corrected')+'<div class="form-grid">'+
      F({name:'no',label:'Adjustment Number',span:3,value:doc.no,readonly:true})+F({name:'date',label:'Date',type:'date',req:true,span:3,value:isoDate(doc.date)})+F({name:'warehouseId',label:'Warehouse',type:'select',req:true,span:3,value:doc.warehouseId,placeholder:false,options:whOptions()})+F({name:'type',label:'Adjustment Type',type:'select',req:true,span:3,value:doc.type,placeholder:false,options:ADJ_TYPES})+
      F({name:'reason',label:'Reason',req:true,span:6,value:doc.reason,ph:'e.g. Pallet damaged by forklift in aisle 4'})+F({name:'reference',label:'Reference',span:3,value:doc.reference,ph:'Count sheet, incident or claim number'})+'<div class="s-3" id="typeHint"></div></div></div>'+
      '<div class="form-section" style="padding-bottom:0">'+sectionHead(2,'Items','Enter the physical quantity; the difference is calculated against system stock')+'</div><div id="aLines"></div>'+
      '<div class="form-actions"><span class="spacer"></span>'+btn('Cancel','','','type="button" data-go="'+(editing?'adjustment-view/'+a.id:'stock-adjustment')+'"')+btn('Save Draft','save','','type="button" data-act="Draft"')+btn('Submit for Approval','send','primary','type="button" data-act="Submitted"')+'</div></form>',
    mount(page){
      const form=$('#aform',page);const wid=()=>$('[name=warehouseId]',form).value,type=()=>$('[name=type]',form).value;
      const dir=()=>({Increase:1,'Found Stock':1,Decrease:-1,Damage:-1,Loss:-1,Expiry:-1,Correction:0}[type()]);
      const hint=()=>{const d=dir();$('#typeHint',form).innerHTML='<div class="alert '+(d>0?'alert-success':d<0?'alert-warning':'alert-info')+'" style="margin-top:22px;padding:8px 12px">'+icon(d>0?'arrowUp':d<0?'arrowDown':'refresh',15)+'<span>'+(d>0?'Physical quantity must be higher than system stock':d<0?'Physical quantity must be lower than system stock':'Quantity can move in either direction')+'</span></div>'};hint();
      const pool=()=>dir()>0?products.filter(p=>p.status==='Active'):products.filter(p=>whQty(p.id,wid())>0);
      const le=LineEditor({lines:doc.items,newLine:()=>({productId:'',systemQty:0,physicalQty:null,cost:0,reason:''}),rerenderOn:['productId'],focusAfter:{productId:'physicalQty'},
        onChange:(l,k)=>{if(k==='productId'){const p=P_BY(l.productId);l.systemQty=p?whQty(p.id,wid()):0;l.cost=p?p.cost:0}},
        cols:[{label:'Product',req:true},{label:'System Qty',align:'right'},{label:'Physical Qty',req:true,w:'120px'},{label:'Difference',align:'right'},{label:'Unit Cost',align:'right'},{label:'Adjustment Value',align:'right'},{label:'Reason'}],
        calc:(l,k)=>{const d=adjDiff(l);if(k==='diff')return l.physicalQty==null?'—':'<b class="'+(d>0?'pos':d<0?'neg':'muted')+'">'+(d>0?'+':d<0?'−':'')+fmtN(Math.abs(d))+'</b>';if(k==='val')return l.physicalQty==null?'—':'<span class="'+(d>=0?'pos':'neg')+'">'+fmtM(d*l.cost)+'</span>'},
        rowHTML:l=>'<td>'+lineProdSelect(l,pool())+'</td><td class="ro right num">'+(l.productId?fmtN(l.systemQty):'—')+'</td><td><input class="input right" type="number" min="0" data-k="physicalQty" value="'+(l.physicalQty==null?'':l.physicalQty)+'" aria-label="Physical quantity"></td><td class="ro right num" data-calc="diff">'+(l.physicalQty==null?'—':'')+'</td><td class="ro right num">'+(l.productId?fmtM(l.cost):'—')+'</td><td class="ro right num" data-calc="val"></td><td><input class="input" data-k="reason" value="'+esc(l.reason||'')+'" placeholder="Line reason" aria-label="Line reason"></td>',
        validateLine:l=>{const e={};if(!l.productId)e.productId='Select a product';if(l.physicalQty==null||l.physicalQty<0)e.physicalQty='Enter the counted quantity';else{const d=adjDiff(l),D=dir();if(d===0)e.physicalQty='Physical quantity equals system quantity';else if(D>0&&d<0)e.physicalQty=type()+' requires a higher physical quantity';else if(D<0&&d>0)e.physicalQty=type()+' requires a lower physical quantity'}return e},
        footer:ls=>{const q=sum(ls,adjDiff),v=sum(ls,l=>adjDiff(l)*l.cost);return '<span class="muted">'+ls.filter(l=>l.productId).length+' items</span><span>Net quantity <b class="num '+(q>=0?'pos':'neg')+'">'+(q>0?'+':'')+fmtN(q)+'</b></span><span>Net value <b class="num '+(v>=0?'pos':'neg')+'">'+fmtM(v)+'</b></span>'+(Math.abs(v)>SETTINGS.adjLimit?badge('Manager approval required','warning'):'')}});
      $('#aLines',page).append(le.el);
      const refreshSys=()=>{le.lines.forEach(l=>{if(l.productId)l.systemQty=whQty(l.productId,wid())});le.render()};
      $('[name=warehouseId]',form).addEventListener('change',()=>{le.lines.splice(0,le.lines.length,{productId:'',systemQty:0,physicalQty:null,cost:0,reason:''});le.render()});
      $('[name=type]',form).addEventListener('change',()=>{hint();refreshSys()});
      $$('[data-act]',page).forEach(b=>b.onclick=()=>{
        if(!validateForm(form)||!le.validate())return;const d=formData(form);
        let x=a;if(!x){x={id:uid('ADJ'),no:nextNo('ADJ'),history:[],createdBy:CURRENT_USER.name,createdAt:NOW()};stockAdjustments.unshift(x);hist(x,'Draft',CURRENT_USER.name,NOW(),'Adjustment created');logAudit('Stock Adjustment','Created',x.no,'—','Status: Draft')}
        Object.assign(x,{date:new Date(d.date+'T09:00'),warehouseId:d.warehouseId,type:d.type,reason:d.reason,reference:d.reference,status:'Draft',items:le.lines.map(l=>({productId:l.productId,systemQty:l.systemQty,physicalQty:l.physicalQty,cost:l.cost,reason:l.reason||d.reason}))});
        if(b.dataset.act==='Submitted'){x.status='Submitted';hist(x,'Submitted',CURRENT_USER.name,NOW(),'Sent for approval');logAudit('Stock Adjustment','Updated',x.no,'Status: Draft','Status: Submitted')}
        toast('success',x.status==='Submitted'?'Adjustment submitted':'Draft saved',x.no+' · net '+fmtM(adjValue(x))+'.');navigate('adjustment-view/'+x.id)});
    }};
}
ROUTES['adjustment-create']=(p,q)=>adjustmentFormPage(null,q);
ROUTES['adjustment-edit']=id=>{const a=stockAdjustments.find(x=>x.id===id);if(!a)return ROUTES['not-found']();return a.status==='Draft'?adjustmentFormPage(a):ROUTES['adjustment-view'](id)};
function adjustmentAction(a,act){
  const set=(s,note)=>{const o=a.status;a.status=s;hist(a,s,CURRENT_USER.name,NOW(),note);logAudit('Stock Adjustment','Updated',a.no,'Status: '+o,'Status: '+s);renderRoute()};
  if(act==='submit'){set('Submitted','Sent for approval');toast('success','Adjustment submitted',a.no+' is waiting for approval.')}
  if(act==='approve')confirmDialog({title:'Approve '+a.no+'?',message:'Net impact '+fmtM(adjValue(a))+' at '+esc(W_BY(a.warehouseId).name)+'. Approved adjustments can be posted to inventory.',confirm:'Approve'}).then(ok=>{if(ok){a.approvedBy=CURRENT_USER.name;set('Approved','Approved');toast('success','Adjustment approved','Post it to update stock.')}});
  if(act==='reject')reasonModal('Reject '+a.no,'Reason for rejection',r=>{set('Rejected',r);toast('warning','Adjustment rejected',a.no+' was returned to '+a.createdBy+'.')});
  if(act==='post'){const bad=a.items.filter(i=>adjDiff(i)<0&&-adjDiff(i)>whQty(i.productId,a.warehouseId));
    if(bad.length){messageModal('error','Adjustment can’t be posted','<p>Posting would make stock negative for:</p><ul style="margin-top:8px;padding-left:18px;list-style:disc">'+bad.map(i=>'<li>'+esc(P_BY(i.productId).name)+': reduce by '+fmtN(-adjDiff(i))+', on hand '+fmtN(whQty(i.productId,a.warehouseId))+'</li>').join('')+'</ul>');return}
    confirmDialog({title:'Post '+a.no+' to inventory?',message:'On-hand stock at '+esc(W_BY(a.warehouseId).name)+' changes by '+fmtN(sum(a.items,adjDiff))+' units ('+fmtM(adjValue(a))+'). Ledger entries are created and cannot be edited.',confirm:'Post adjustment'}).then(ok=>{if(!ok)return;
      a.items.forEach(i=>{const d=adjDiff(i);postMovement({type:'Adjustment',pid:i.productId,wid:a.warehouseId,inQty:d>0?d:0,outQty:d<0?-d:0,txNo:a.no,ref:a.type,bucket:'adjusted',cost:i.cost})});
      a.postedAt=NOW();set('Posted','Inventory updated');toast('success','Adjustment posted','Stock updated for '+a.items.length+' product'+(a.items.length>1?'s':'')+'.',{label:'View ledger',onClick:()=>navigate('ledger?type=Adjustment')})})}
}
ROUTES['adjustment-view']=id=>{
  const a=stockAdjustments.find(x=>x.id===id);if(!a)return ROUTES['not-found']();
  const A={Draft:[['Edit','edit','','edit'],['Delete','trash','danger-ghost','delete'],['Submit','send','primary','submit']],Submitted:[['Reject','x','danger-ghost','reject'],['Approve','check','primary','approve']],Approved:[['Post to Inventory','book','success','post']]}[a.status]||[];
  return{title:a.no,nav:'stock-adjustment',crumbs:[['Inventory','inventory'],['Stock Management','stock'],['Stock Adjustment','stock-adjustment'],[a.no]],titleHTML:'Stock Adjustment <span class="mono" style="font-weight:600">'+esc(a.no)+'</span>',sub:esc(a.type)+' at '+esc(W_BY(a.warehouseId).name)+' · '+fmtD(a.date),
    actions:btn('Duplicate','copy','','data-dup')+btn('Print','print','','data-print'),
    body:docHeaderCard(a.no,a.status,flowFor('adjustment',a.status,histMeta(a,'adjustment')),A.map(x=>btn(x[0],x[1],x[2],'data-aa="'+x[3]+'"')).join(''))+
      (Math.abs(adjValue(a))>SETTINGS.adjLimit&&a.status==='Submitted'?'<div class="alert alert-warning mb-16">'+icon('alert',16)+'<span>Net value '+fmtM(adjValue(a))+' exceeds the '+fmtM(SETTINGS.adjLimit,0)+' approval threshold. Attach count evidence before approving.</span></div>':'')+
      '<div class="grid g-main"><div class="stack">'+card('Items','<div class="table-wrap auto"><table class="tbl"><thead><tr><th>Product</th><th class="right">System Qty</th><th class="right">Physical Qty</th><th class="right">Difference</th><th class="right">Unit Cost</th><th class="right">Adjustment Value</th><th>Reason</th></tr></thead><tbody>'+a.items.map(i=>{const d=adjDiff(i);return '<tr><td>'+prodCell(P_BY(i.productId))+'</td><td class="right num">'+fmtN(i.systemQty)+'</td><td class="right num">'+fmtN(i.physicalQty)+'</td><td class="right num '+(d>=0?'pos':'neg')+'"><b>'+(d>0?'+':'−')+fmtN(Math.abs(d))+'</b></td><td class="right num">'+fmtM(i.cost)+'</td><td class="right num '+(d>=0?'pos':'neg')+'">'+fmtM(d*i.cost)+'</td><td class="muted">'+esc(i.reason)+'</td></tr>'}).join('')+'</tbody><tfoot><tr><td><b>Total</b></td><td></td><td></td><td class="right num">'+fmtN(sum(a.items,adjDiff))+'</td><td></td><td class="right num">'+fmtM(adjValue(a))+'</td><td></td></tr></tfoot></table></div>',{tight:true})+'</div>'+
      '<div class="stack">'+card('Details','<dl class="dl"><dt>Warehouse</dt><dd>'+esc(W_BY(a.warehouseId).name)+'</dd><dt>Type</dt><dd>'+esc(a.type)+'</dd><dt>Reason</dt><dd>'+esc(a.reason)+'</dd><dt>Reference</dt><dd>'+esc(a.reference||'—')+'</dd><dt>Approved by</dt><dd>'+esc(a.approvedBy||'—')+'</dd><dt>Posted</dt><dd>'+(a.postedAt?fmtDT(a.postedAt):'—')+'</dd><dt>Created by</dt><dd>'+esc(a.createdBy)+'</dd><dt>Created date</dt><dd>'+fmtDT(a.createdAt)+'</dd></dl>')+card('Activity',timelineHTML(a.history))+'</div></div>',
    mount(page){$$('[data-aa]',page).forEach(b=>b.onclick=()=>{const k=b.dataset.aa;if(k==='edit')navigate('adjustment-edit/'+a.id);else if(k==='delete')deleteDoc('adjustment',a,()=>navigate('stock-adjustment'));else adjustmentAction(a,k)});$('[data-dup]',page).onclick=()=>duplicateDoc('adjustment',a);$('[data-print]',page).onclick=doPrint}};
};

/* =========================================================
   STOCK COUNT
   ========================================================= */
ROUTES['stock-count']=()=>({title:'Stock Count',crumbs:[['Inventory','inventory'],['Stock Management','stock'],['Stock Count']],sub:'Cycle counts compare physical quantities with system stock. Variances become a correction adjustment.',
  actions:btn('Start Count','plus','primary','data-new'),body:'<section class="card" id="cT"></section>',
  mount(page){const t=mountTable(page,'#cT',{title:'Stock counts',sort:'date',dir:-1,columns:[{key:'no',label:'Count No',render:c=>'<a class="link mono" href="#/count-view/'+c.id+'">'+esc(c.no)+'</a>'},{key:'date',label:'Date',render:c=>fmtD(c.date)},{key:'wh',label:'Warehouse',value:c=>W_BY(c.warehouseId).name},{key:'zone',label:'Zone',value:c=>'Zone '+c.zone},{key:'lines',label:'Lines',align:'right',value:c=>c.lines.length},{key:'done',label:'Counted',value:c=>c.lines.filter(l=>l.counted!=null).length/c.lines.length,render:c=>utilHTML(Math.round(c.lines.filter(l=>l.counted!=null).length/c.lines.length*100))},{key:'var',label:'Variances',align:'right',value:c=>c.lines.filter(l=>l.counted!=null&&l.counted!==l.system).length},{key:'by',label:'Counted By',render:c=>userCell(c.countedBy)},{key:'adj',label:'Adjustment',value:c=>c.adjNo||'—',render:c=>c.adjNo?'<span class="mono">'+esc(c.adjNo)+'</span>':'<span class="subtle">—</span>'},{key:'status',label:'Status',render:c=>badge(c.status)}],data:()=>stockCounts,onRowClick:c=>navigate('count-view/'+c.id),actions:c=>[{label:'Open count sheet',icon:'eye',onClick:()=>navigate('count-view/'+c.id)},'-',{label:'Delete',icon:'trash',danger:true,disabled:c.status==='Completed',onClick:()=>confirmDialog({danger:true,title:'Delete '+c.no+'?',message:'The count sheet and entered quantities will be deleted. This action cannot be undone.',confirm:'Delete count'}).then(ok=>{if(ok){stockCounts.splice(stockCounts.indexOf(c),1);logAudit('Stock Count','Deleted',c.no,'In Progress','—');toast('success','Count deleted',c.no+' removed.');t.refresh()}})}],emptyTitle:'No counts yet',emptyText:'Start a cycle count for a warehouse zone.',emptyAction:{label:'Start Count',onClick:()=>$('[data-new]',page).click()}});
  $('[data-new]',page).onclick=()=>{const b=el('<form novalidate><div class="form-grid">'+F({name:'wid',label:'Warehouse',type:'select',req:true,span:6,value:'W1',placeholder:false,options:whOptions()})+F({name:'zone',label:'Zone',type:'select',req:true,span:6,value:'',placeholder:'All zones',options:[['A','A · Bulk storage'],['B','B · Pick face'],['C','C · Controlled'],['Q','Q · Quarantine']]})+F({name:'by',label:'Counter',type:'select',req:true,span:12,value:CURRENT_USER.name,options:USERS})+'</div><p class="hint mt-16">System quantities are frozen when the count sheet is created.</p></form>');
    b.querySelector('[name=zone]').removeAttribute('data-req');
    openModal({type:'create',title:'Start stock count',subtitle:'Generate a count sheet for a warehouse zone',body:b,actions:[{label:'Cancel'},{label:'Create count sheet',variant:'primary',onClick:()=>{if(!validateForm(b))return false;const d=formData(b);const rows=stock.filter(s=>s.warehouseId===d.wid&&s.qty>0&&(!d.zone||(L_BY(s.locationId)||{}).zone===d.zone));if(!rows.length){toast('warning','Nothing to count','No stock is held in that zone.');return false}
      const c={id:uid('CNT'),no:nextNo('CNT'),date:NOW(),warehouseId:d.wid,zone:d.zone||'All',status:'In Progress',countedBy:d.by,lines:rows.map(s=>({productId:s.productId,system:s.qty,counted:null})),adjNo:''};stockCounts.unshift(c);logAudit('Stock Count','Created',c.no,'—',rows.length+' lines');toast('success','Count sheet created',c.no+' with '+rows.length+' lines.');navigate('count-view/'+c.id)}}]})}}});
TONE['In Progress']='info';
ROUTES['count-view']=id=>{
  const c=stockCounts.find(x=>x.id===id);if(!c)return ROUTES['not-found']();const done=c.status==='Completed';
  return{title:c.no,nav:'stock-count',crumbs:[['Inventory','inventory'],['Stock Management','stock'],['Stock Count','stock-count'],[c.no]],titleHTML:'Count Sheet <span class="mono" style="font-weight:600">'+esc(c.no)+'</span> '+badge(c.status),sub:esc(W_BY(c.warehouseId).name)+' · Zone '+esc(c.zone)+' · counted by '+esc(c.countedBy)+' · started '+fmtDT(c.date),
    actions:done?btn('Print','print','','data-print'):btn('Save progress','save','','data-save')+btn('Complete count','checkCircle','primary','data-done'),
    body:(done?'<div class="alert alert-success mb-16">'+icon('checkCircle',16)+'<span>Count completed.'+(c.adjNo?' Variances were sent for approval as <b>'+esc(c.adjNo)+'</b>.':' No variances found.')+'</span></div>':'<div class="alert alert-info mb-16">'+icon('info',16)+'<span>Enter the physical quantity for each line. Lines with a variance are highlighted.</span></div>')+
      '<section class="card"><div class="table-wrap auto"><table class="tbl" id="cnt"><thead><tr><th>Product</th><th>Location</th><th class="right">System Qty</th><th class="right" style="width:140px">Counted Qty</th><th class="right">Variance</th><th class="right">Value</th></tr></thead><tbody>'+c.lines.map((l,i)=>{const p=P_BY(l.productId);const r=stockRow(l.productId,c.warehouseId);const v=l.counted==null?null:l.counted-l.system;return '<tr data-i="'+i+'" class="'+(v?'var-row':'')+'"><td>'+prodCell(p)+'</td><td class="mono">'+esc(r?(L_BY(r.locationId)||{}).code:'—')+'</td><td class="right num">'+fmtN(l.system)+'</td><td class="right">'+(done?'<span class="num">'+fmtN(l.counted)+'</span>':'<input class="input input-sm right" type="number" min="0" value="'+(l.counted==null?'':l.counted)+'" data-cnt aria-label="Counted quantity">')+'</td><td class="right num" data-v>'+(v==null?'<span class="subtle">—</span>':'<b class="'+(v>0?'pos':v<0?'neg':'muted')+'">'+(v>0?'+':v<0?'−':'')+fmtN(Math.abs(v))+'</b>')+'</td><td class="right num" data-val>'+(v?fmtM(v*p.cost):'—')+'</td></tr>'}).join('')+'</tbody></table></div><div class="items-foot"><span class="muted" id="cntSum"></span></div></section>',
    mount(page){
      const sumUp=()=>{const n=c.lines.filter(l=>l.counted!=null).length,v=c.lines.filter(l=>l.counted!=null&&l.counted!==l.system);$('#cntSum',page).innerHTML=n+' of '+c.lines.length+' lines counted · '+v.length+' variance'+(v.length===1?'':'s')+' · net '+fmtM(sum(v,l=>(l.counted-l.system)*P_BY(l.productId).cost))};sumUp();
      $$('[data-cnt]',page).forEach(inp=>inp.addEventListener('input',()=>{const tr=inp.closest('tr');const l=c.lines[+tr.dataset.i];l.counted=inp.value===''?null:Math.max(0,+inp.value);const v=l.counted==null?null:l.counted-l.system;tr.classList.toggle('var-row',!!v);$('[data-v]',tr).innerHTML=v==null?'<span class="subtle">—</span>':'<b class="'+(v>0?'pos':v<0?'neg':'muted')+'">'+(v>0?'+':v<0?'−':'')+fmtN(Math.abs(v))+'</b>';$('[data-val]',tr).textContent=v?fmtM(v*P_BY(l.productId).cost):'—';sumUp()}));
      const pr=$('[data-print]',page);if(pr)pr.onclick=doPrint;
      const sv=$('[data-save]',page);if(sv)sv.onclick=()=>{logAudit('Stock Count','Updated',c.no,'—',c.lines.filter(l=>l.counted!=null).length+' lines counted');toast('success','Progress saved',c.lines.filter(l=>l.counted!=null).length+' of '+c.lines.length+' lines counted.')};
      const dn=$('[data-done]',page);if(dn)dn.onclick=()=>{const miss=c.lines.filter(l=>l.counted==null).length;if(miss){messageModal('warning','Count incomplete','<p>'+miss+' lines have no counted quantity. Enter a quantity for every line, including zero for empty bins.</p>');$$('[data-cnt]',page).forEach(i=>{if(i.value==='')i.classList.add('invalid')});return}
        const vars=c.lines.filter(l=>l.counted!==l.system);
        confirmDialog({title:'Complete '+c.no+'?',message:vars.length?vars.length+' variances will be submitted as a Correction adjustment for approval.':'No variances were found. The count will be closed.',confirm:'Complete count'}).then(ok=>{if(!ok)return;
          if(vars.length){const a={id:uid('ADJ'),no:nextNo('ADJ'),date:NOW(),warehouseId:c.warehouseId,type:'Correction',reason:'Cycle count variance',reference:c.no,status:'Submitted',items:vars.map(l=>({productId:l.productId,systemQty:l.system,physicalQty:l.counted,cost:P_BY(l.productId).cost,reason:'Count variance'})),history:[],createdBy:CURRENT_USER.name,createdAt:NOW()};hist(a,'Draft',CURRENT_USER.name,NOW(),'Created from '+c.no);hist(a,'Submitted',CURRENT_USER.name,NOW(),'Sent for approval');stockAdjustments.unshift(a);c.adjNo=a.no;logAudit('Stock Adjustment','Created',a.no,'—','From count '+c.no)}
          c.status='Completed';logAudit('Stock Count','Updated',c.no,'Status: In Progress','Status: Completed');toast('success','Count completed',vars.length?c.adjNo+' created for approval.':'No variances found.');renderRoute()})};
    }};
};

/* =========================================================
   GOODS RECEIPT (GRN)
   ========================================================= */
const grnRec=g=>sum(g.items,i=>i.received||0),grnRej=g=>sum(g.items,i=>i.rejected||0);
ROUTES.grn=(p,q)=>{
  const c=s=>grns.filter(g=>g.status===s);const m0=new Date(NOW().getFullYear(),NOW().getMonth(),1);
  return{title:'Goods Receipt',crumbs:[['Inventory','inventory'],['Goods Receipt','grn'],['GRN List']],sub:'Receive deliveries against purchase orders, inspect them and put them away.',
    actions:btn('Purchase Orders','cart','','data-go="purchasing"')+btn('Create GRN','plus','primary','data-go="grn-create"'),
    body:'<div class="kpis mb-16">'+kpi('Draft receipts',c('Draft').length,'edit','primary','Being recorded at the dock')+kpi('Pending quality check',c('Pending QC').length,'clipboard','warning',fmtN(sum(c('Pending QC'),grnRec))+' units in inspection')+kpi('Ready for putaway',c('Accepted').length,'inbox','purple','Accepted, not yet stored')+kpi('Completed this month',grns.filter(g=>g.status==='Completed'&&g.date>=m0).length,'checkCircle','success',fmtN(sum(grns.filter(g=>g.status==='Completed'&&g.date>=m0),g=>sum(g.items,i=>i.accepted)))+' units put away')+'</div><section class="card" id="gT"></section>',
    mount(page){const t=mountTable(page,'#gT',{title:'Goods receipts',sort:'date',dir:-1,selectable:true,columns:[
      {key:'no',label:'GRN Number',render:g=>'<a class="link mono" href="#/grn-view/'+g.id+'">'+esc(g.no)+'</a>'},{key:'date',label:'Receipt Date',render:g=>fmtD(g.date)},{key:'supplier',label:'Supplier'},{key:'poNo',label:'Purchase Order',render:g=>'<span class="mono">'+esc(g.poNo||'Direct')+'</span>'},
      {key:'wh',label:'Warehouse',value:g=>W_BY(g.warehouseId).code,render:g=>'<span class="chip">'+esc(W_BY(g.warehouseId).code)+'</span>'},{key:'items',label:'Items',align:'right',value:g=>g.items.length},{key:'rec',label:'Received',align:'right',value:grnRec,render:g=>fmtN(grnRec(g))},{key:'rej',label:'Rejected',align:'right',value:grnRej,render:g=>grnRej(g)?'<span class="neg">'+fmtN(grnRej(g))+'</span>':'<span class="subtle">0</span>'},
      {key:'by',label:'Received By',value:g=>g.receivedBy,render:g=>userCell(g.receivedBy)},{key:'status',label:'Status',render:g=>badge(g.status)}],data:()=>grns,onRowClick:g=>navigate('grn-view/'+g.id),
      filters:[{key:'s',label:'Any status',value:q.status||'',options:['Draft','Pending QC','Accepted','Completed','Rejected'],test:(g,v)=>g.status===v},{key:'w',label:'All warehouses',options:activeWh().map(w=>[w.id,w.code]),test:(g,v)=>g.warehouseId===v},{key:'sp',label:'All suppliers',options:[...new Set(grns.map(g=>g.supplier))].sort(),test:(g,v)=>g.supplier===v}],
      actions:g=>[{label:'View',icon:'eye',onClick:()=>navigate('grn-view/'+g.id)},{label:'Edit',icon:'edit',disabled:g.status!=='Draft',onClick:()=>navigate('grn-edit/'+g.id)},{label:'Stock History',icon:'history',onClick:()=>navigate('ledger?type=GRN')},'-',{label:'Delete',icon:'trash',danger:true,onClick:()=>deleteDoc('grn',g,()=>t.refresh())}]})}};
};
function grnFormPage(g,q){
  q=q||{};const editing=!!g;
  const po0=q.po?purchaseOrders.find(p=>p.id===q.po):null;
  const doc=g?JSON.parse(JSON.stringify(g)):{no:'GRN-26'+String(counters.GRN+1).padStart(5,'0'),date:NOW(),supplier:po0?po0.supplier:'',poNo:po0?po0.no:'',warehouseId:po0?po0.warehouseId:'W1',receivedBy:CURRENT_USER.name,items:[]};
  const linesFromPO=po=>po.items.filter(i=>i.qty>i.received).map(i=>{const p=P_BY(i.productId);const rem=i.qty-i.received;return{productId:i.productId,ordered:rem,received:rem,accepted:rem,rejected:0,batch:(p.batch||p.expiry)?batchCode(NOW()):'',expiry:p.expiry&&p.shelfLife?isoDate(addDays(NOW(),p.shelfLife)):'',locationId:defaultLoc(po.warehouseId,p.expiry?'C':'A'),cost:i.cost}});
  if(po0&&!g)doc.items=linesFromPO(po0);
  doc.items.forEach(i=>{if(i.expiry&&typeof i.expiry!=='string')i.expiry=isoDate(i.expiry);else if(i.expiry&&i.expiry.length>10)i.expiry=i.expiry.slice(0,10)});
  const openPOs=purchaseOrders.filter(p=>p.status==='Open'||p.status==='Partially Received'||(g&&p.no===g.poNo));
  return{title:editing?'Edit GRN':'Create GRN',nav:'grn-create',crumbs:[['Inventory','inventory'],['Goods Receipt','grn'],[editing?doc.no:'Create GRN']],sub:'Purchase Order → Goods Receipt → Quality Check → Accepted → Putaway → Available Stock',
    body:'<form class="card" id="gform" novalidate><div class="form-section">'+sectionHead(1,'Receipt details','Delivery, supplier and receiving site')+'<div class="form-grid">'+
      F({name:'no',label:'GRN Number',span:3,value:doc.no,readonly:true})+F({name:'date',label:'Receipt Date',type:'date',req:true,span:3,value:isoDate(doc.date)})+F({name:'poNo',label:'Purchase Order',type:'select',span:3,value:doc.poNo,options:openPOs.map(p=>[p.no,p.no+' · '+p.supplier.split(' ')[0]]),placeholder:'Direct receipt (no PO)'})+F({name:'supplier',label:'Supplier',type:'select',req:true,span:3,value:doc.supplier,options:[...new Set(Object.values(SUPPLIERS))]})+
      F({name:'warehouseId',label:'Warehouse',type:'select',req:true,span:3,value:doc.warehouseId,placeholder:false,options:whOptions()})+F({name:'receivedBy',label:'Received By',type:'select',req:true,span:3,value:doc.receivedBy,options:USERS})+F({name:'status',label:'Status',span:3,value:editing?g.status:'Draft',readonly:true})+F({name:'notes',label:'Delivery note',span:3,value:doc.notes||'',ph:'Carrier delivery note number'})+'</div></div>'+
      '<div class="form-section" style="padding-bottom:0">'+sectionHead(2,'Items','Rejected quantity is received minus accepted')+'</div><div id="gLines"></div>'+
      '<div class="form-actions"><span class="spacer"></span>'+btn('Cancel','','','type="button" data-go="'+(editing?'grn-view/'+g.id:'grn')+'"')+btn('Save Draft','save','','type="button" data-act="Draft"')+btn('Submit for QC','send','primary','type="button" data-act="Pending QC"')+'</div></form>',
    mount(page){
      const form=$('#gform',page);const wid=()=>$('[name=warehouseId]',form).value;const poSel=()=>purchaseOrders.find(p=>p.no===$('[name=poNo]',form).value);
      const le=LineEditor({lines:doc.items,newLine:()=>({productId:'',ordered:null,received:null,accepted:null,rejected:0,batch:'',expiry:'',locationId:'',cost:0}),rerenderOn:['productId'],focusAfter:{productId:'received'},
        onChange:(l,k)=>{const p=P_BY(l.productId);if(k==='productId'&&p){l.cost=p.cost;l.locationId=defaultLoc(wid(),p.expiry?'C':'A');if(p.batch||p.expiry)l.batch=l.batch||batchCode(NOW());if(p.expiry&&p.shelfLife)l.expiry=isoDate(addDays(NOW(),p.shelfLife))}if(k==='received'&&(l.accepted==null||l.accepted>l.received))l.accepted=l.received;l.rejected=Math.max(0,(l.received||0)-(l.accepted||0));if(k==='received'){const tr=$('tr[data-i="'+le.lines.indexOf(l)+'"]',le.el);const a=tr&&$('[data-k=accepted]',tr);if(a)a.value=l.accepted==null?'':l.accepted}},
        cols:[{label:'Product',req:true},{label:'Ordered Qty',align:'right',w:'100px'},{label:'Received Qty',req:true,w:'110px'},{label:'Accepted Qty',w:'110px'},{label:'Rejected Qty',align:'right'},{label:'Batch'},{label:'Expiry Date'},{label:'Location'}],
        calc:l=>l.rejected?'<b class="neg">'+fmtN(l.rejected)+'</b>':'<span class="subtle">0</span>',
        rowHTML:l=>{const p=P_BY(l.productId);const fromPO=!!poSel();return '<td>'+lineProdSelect(l,products.filter(x=>x.status!=='Inactive'))+'</td><td>'+(fromPO?'<span class="ro right num" style="display:block;padding-top:6px">'+fmtN(l.ordered)+'</span>':'<input class="input right" type="number" min="0" data-k="ordered" value="'+(l.ordered==null?'':l.ordered)+'" aria-label="Ordered quantity">')+'</td><td><input class="input right" type="number" min="0" data-k="received" value="'+(l.received==null?'':l.received)+'" aria-label="Received quantity"></td><td><input class="input right" type="number" min="0" data-k="accepted" value="'+(l.accepted==null?'':l.accepted)+'" aria-label="Accepted quantity"></td><td class="ro right num" data-calc="rej"></td><td><input class="input mono" data-k="batch" value="'+esc(l.batch||'')+'" placeholder="'+(p&&(p.batch||p.expiry)?'Required':'Optional')+'" style="min-width:110px" aria-label="Batch"></td><td><input class="input" type="date" data-k="expiry" value="'+esc(l.expiry||'')+'"'+(p&&p.expiry?'':' disabled')+' aria-label="Expiry date"></td><td><select class="select" data-k="locationId" style="min-width:150px" aria-label="Location">'+optionsHTML(locsOf(wid()).map(x=>[x.id,x.code]),l.locationId,'Select location')+'</select></td>'},
        validateLine:l=>{const e={};const p=P_BY(l.productId);if(!p)e.productId='Select a product';if(l.received==null||l.received<1)e.received='Enter the received quantity';else if(l.ordered&&l.received>Math.ceil(l.ordered*1.1))e.received='Over-receipt beyond 10% tolerance of '+fmtN(l.ordered);if(l.accepted!=null&&l.accepted>(l.received||0))e.accepted='Accepted cannot exceed received';if(p&&(p.batch||p.expiry)&&!l.batch)e.batch='Batch is required for this product';if(p&&p.expiry){if(!l.expiry)e.expiry='Expiry date is required';else if(new Date(l.expiry)<=NOW())e.expiry='Expiry date must be in the future'}if(!l.locationId)e.locationId='Select a putaway location';return e},
        footer:ls=>'<span class="muted">'+ls.filter(l=>l.productId).length+' items</span><span>Received <b class="num">'+fmtN(sum(ls,l=>l.received||0))+'</b></span><span>Accepted <b class="num pos">'+fmtN(sum(ls,l=>l.accepted||0))+'</b></span><span>Rejected <b class="num neg">'+fmtN(sum(ls,l=>l.rejected||0))+'</b></span><span>Value <b class="num">'+fmtM(sum(ls,l=>(l.accepted||0)*(l.cost||0)),0)+'</b></span>'});
      $('#gLines',page).append(le.el);
      $('[name=poNo]',form).addEventListener('change',()=>{const po=poSel();if(po){$('[name=supplier]',form).value=po.supplier;$('[name=warehouseId]',form).value=po.warehouseId;le.lines.splice(0,le.lines.length,...linesFromPO(po));toast('info','Lines loaded from '+po.no,le.lines.length+' open lines from '+po.supplier+'.')}else le.lines.splice(0,le.lines.length,{productId:'',ordered:null,received:null,accepted:null,rejected:0,batch:'',expiry:'',locationId:'',cost:0});le.render()});
      $('[name=warehouseId]',form).addEventListener('change',()=>{le.lines.forEach(l=>{const p=P_BY(l.productId);l.locationId=p?defaultLoc(wid(),p.expiry?'C':'A'):''});le.render()});
      $$('[data-act]',page).forEach(b=>b.onclick=()=>{
        if(!validateForm(form,err=>{const d=formData(form);const po=poSel();if(po&&po.supplier!==d.supplier)err('supplier','Supplier must match '+po.no+' ('+po.supplier+')');if(new Date(d.date)>addDays(NOW(),1))err('date','Receipt date cannot be in the future')})||!le.validate())return;
        const d=formData(form);let x=g;
        if(!x){x={id:uid('G'),no:nextNo('GRN'),history:[],createdBy:CURRENT_USER.name,createdAt:NOW()};grns.unshift(x);hist(x,'Draft',CURRENT_USER.name,NOW(),'Goods received at dock');logAudit('Goods Receipt','Created',x.no,'—','Status: Draft')}
        Object.assign(x,{date:new Date(d.date+'T'+String(NOW().getHours()).padStart(2,'0')+':00'),supplier:d.supplier,poNo:d.poNo,warehouseId:d.warehouseId,receivedBy:d.receivedBy,notes:d.notes,status:'Draft',items:le.lines.map(l=>({productId:l.productId,ordered:l.ordered||l.received,received:l.received,accepted:l.accepted==null?l.received:l.accepted,rejected:Math.max(0,l.received-(l.accepted==null?l.received:l.accepted)),batch:l.batch,expiry:l.expiry?new Date(l.expiry):null,locationId:l.locationId,cost:l.cost}))});
        if(b.dataset.act==='Pending QC'){x.status='Pending QC';hist(x,'Pending QC',CURRENT_USER.name,NOW(),'Submitted for quality check');logAudit('Goods Receipt','Updated',x.no,'Status: Draft','Status: Pending QC')}
        toast('success',x.status==='Pending QC'?'GRN submitted for QC':'GRN saved as draft',x.no+' · '+fmtN(grnRec(x))+' units from '+x.supplier+'.');navigate('grn-view/'+x.id)});
    }};
}
ROUTES['grn-create']=(p,q)=>grnFormPage(null,q);
ROUTES['grn-edit']=id=>{const g=grns.find(x=>x.id===id);if(!g)return ROUTES['not-found']();return g.status==='Draft'?grnFormPage(g):ROUTES['grn-view'](id)};
function grnAction(g,act){
  const set=(s,note)=>{const o=g.status;g.status=s;hist(g,s,CURRENT_USER.name,NOW(),note);logAudit('Goods Receipt','Updated',g.no,'Status: '+o,'Status: '+s);renderRoute()};
  if(act==='submit'){set('Pending QC','Submitted for quality check');toast('success','Submitted for QC',g.no+' is waiting for inspection.')}
  if(act==='qc'){
    const body=el('<div><p class="muted" style="margin-bottom:12px">Record the inspection result for each line. Rejected units stay in quarantine and are not added to stock.</p><div class="table-wrap auto" style="border:1px solid var(--border);border-radius:var(--r-md)"><table class="tbl items-tbl"><thead><tr><th>Product</th><th class="right">Received</th><th style="width:120px">Accepted</th><th class="right">Rejected</th></tr></thead><tbody>'+g.items.map((i,k)=>'<tr data-k="'+k+'"><td>'+esc(P_BY(i.productId).name)+'</td><td class="ro right num">'+fmtN(i.received)+'</td><td><input class="input right" type="number" min="0" max="'+i.received+'" value="'+i.accepted+'" aria-label="Accepted quantity"></td><td class="ro right num" data-r>'+fmtN(i.rejected)+'</td></tr>').join('')+'</tbody></table></div><div class="form-grid mt-16">'+F({name:'note',label:'Inspection notes',span:12,ph:'e.g. 2 cartons crushed, outer packaging wet'})+F({name:'inspector',label:'Inspector',type:'select',span:12,value:'Ethan Brooks',placeholder:false,options:USERS})+'</div></div>');
    body.addEventListener('input',e=>{const tr=e.target.closest('tr[data-k]');if(tr){const i=g.items[+tr.dataset.k];$('[data-r]',tr).textContent=fmtN(Math.max(0,i.received-(+e.target.value||0)))}});
    openModal({type:'edit',icon:'clipboard',title:'Quality check · '+g.no,subtitle:esc(g.supplier)+' · '+fmtN(grnRec(g))+' units',size:'lg',body,actions:[{label:'Cancel'},{label:'Reject all',variant:'danger-ghost',onClick:()=>{g.items.forEach(i=>{i.accepted=0;i.rejected=i.received});g.qcBy=formData(body).inspector;g.qcAt=NOW();set('Rejected','All lines failed inspection. '+(formData(body).note||''));toast('warning','Receipt rejected',g.no+' returned to supplier.')}},{label:'Accept inspected quantities',variant:'primary',icon:'check',onClick:api=>{let bad=false;$$('tr[data-k]',body).forEach(tr=>{const i=g.items[+tr.dataset.k];const inp=$('input',tr);const v=+inp.value;if(inp.value===''||v<0||v>i.received){inp.classList.add('invalid');bad=true}});if(bad){toast('error','Check accepted quantities','Accepted must be between 0 and the received quantity.');return false}
      $$('tr[data-k]',body).forEach(tr=>{const i=g.items[+tr.dataset.k];i.accepted=+$('input',tr).value;i.rejected=i.received-i.accepted});const d=formData(body);g.qcBy=d.inspector;g.qcAt=NOW();set('Accepted',(grnRej(g)?fmtN(grnRej(g))+' units rejected. ':'All lines passed. ')+(d.note||''));toast('success','Quality check recorded',fmtN(sum(g.items,i=>i.accepted))+' accepted'+(grnRej(g)?', '+fmtN(grnRej(g))+' rejected':'')+'.')}}]});
  }
  if(act==='putaway')confirmDialog({title:'Put away '+g.no+'?',message:fmtN(sum(g.items,i=>i.accepted))+' accepted units are added to stock at '+esc(W_BY(g.warehouseId).name)+' in the assigned locations.',confirm:'Post putaway'}).then(ok=>{if(!ok)return;
    g.items.forEach(i=>{if(i.accepted>0)postMovement({type:'GRN',pid:i.productId,wid:g.warehouseId,inQty:i.accepted,txNo:g.no,ref:g.poNo||g.supplier,bucket:'received',batch:i.batch||undefined,expiry:i.expiry,locationId:i.locationId,cost:i.cost})});
    const po=purchaseOrders.find(p=>p.no===g.poNo);if(po){g.items.forEach(i=>{const pi=po.items.find(x=>x.productId===i.productId);if(pi)pi.received+=i.accepted});const o=po.status;po.status=po.items.every(x=>x.received>=x.qty)?'Received':'Partially Received';if(o!==po.status)logAudit('Purchasing','Updated',po.no,'Status: '+o,'Status: '+po.status)}
    g.postedAt=NOW();set('Completed','Put away to storage. Stock available.');toast('success','Stock received','Available stock increased by '+fmtN(sum(g.items,i=>i.accepted))+' units.',{label:'View ledger',onClick:()=>navigate('ledger?type=GRN')})});
}
ROUTES['grn-view']=id=>{
  const g=grns.find(x=>x.id===id);if(!g)return ROUTES['not-found']();
  const A={Draft:[['Edit','edit','','edit'],['Delete','trash','danger-ghost','delete'],['Submit for QC','send','primary','submit']],'Pending QC':[['Record Quality Check','clipboard','primary','qc']],Accepted:[['Put Away','inbox','success','putaway']]}[g.status]||[];
  return{title:g.no,nav:'grn',crumbs:[['Inventory','inventory'],['Goods Receipt','grn'],[g.no]],titleHTML:'Goods Receipt <span class="mono" style="font-weight:600">'+esc(g.no)+'</span>',sub:esc(g.supplier)+' · '+esc(g.poNo||'Direct receipt')+' · '+esc(W_BY(g.warehouseId).name)+' · '+fmtD(g.date),
    actions:btn('Print','print','','data-print'),
    body:docHeaderCard(g.no,g.status,flowFor('grn',g.status,histMeta(g,'grn')),A.map(x=>btn(x[0],x[1],x[2],'data-ga="'+x[3]+'"')).join(''))+
      '<div class="grid g-main"><div class="stack">'+card('Items','<div class="table-wrap auto"><table class="tbl"><thead><tr><th>Product</th><th class="right">Ordered Qty</th><th class="right">Received Qty</th><th class="right">Accepted Qty</th><th class="right">Rejected Qty</th><th>Batch</th><th>Expiry Date</th><th>Location</th></tr></thead><tbody>'+g.items.map(i=>'<tr><td>'+prodCell(P_BY(i.productId))+'</td><td class="right num">'+fmtN(i.ordered)+'</td><td class="right num">'+fmtN(i.received)+'</td><td class="right num pos">'+fmtN(i.accepted)+'</td><td class="right num '+(i.rejected?'neg':'subtle')+'">'+fmtN(i.rejected)+'</td><td class="mono">'+esc(i.batch||'—')+'</td><td>'+(i.expiry?fmtD(i.expiry):'—')+'</td><td class="mono">'+esc((L_BY(i.locationId)||{}).code||'—')+'</td></tr>').join('')+'</tbody><tfoot><tr><td><b>Total</b></td><td class="right num">'+fmtN(sum(g.items,i=>i.ordered))+'</td><td class="right num">'+fmtN(grnRec(g))+'</td><td class="right num">'+fmtN(sum(g.items,i=>i.accepted))+'</td><td class="right num">'+fmtN(grnRej(g))+'</td><td colspan="3"></td></tr></tfoot></table></div>',{tight:true})+'</div>'+
      '<div class="stack">'+card('Details','<dl class="dl"><dt>GRN number</dt><dd class="mono">'+esc(g.no)+'</dd><dt>Receipt date</dt><dd>'+fmtD(g.date)+'</dd><dt>Supplier</dt><dd>'+esc(g.supplier)+'</dd><dt>Purchase order</dt><dd class="mono">'+esc(g.poNo||'Direct')+'</dd><dt>Warehouse</dt><dd>'+esc(W_BY(g.warehouseId).name)+'</dd><dt>Received by</dt><dd>'+esc(g.receivedBy)+'</dd><dt>Inspected by</dt><dd>'+esc(g.qcBy||'—')+'</dd><dt>Delivery note</dt><dd>'+esc(g.notes||'—')+'</dd><dt>Value accepted</dt><dd class="num">'+fmtM(sum(g.items,i=>i.accepted*(i.cost||0)))+'</dd></dl>')+card('Activity',timelineHTML(g.history))+'</div></div>',
    mount(page){$$('[data-ga]',page).forEach(b=>b.onclick=()=>{const k=b.dataset.ga;if(k==='edit')navigate('grn-edit/'+g.id);else if(k==='delete')deleteDoc('grn',g,()=>navigate('grn'));else grnAction(g,k)});$('[data-print]',page).onclick=doPrint}};
};

/* =========================================================
   GOODS ISSUE
   ========================================================= */
const giQty=g=>sum(g.items,i=>i.qty||0);
ROUTES['goods-issue']=(p,q)=>{
  const c=s=>goodsIssues.filter(g=>g.status===s);
  return{title:'Goods Issue',crumbs:[['Inventory','inventory'],['Goods Issue','goods-issue'],['Issue List']],sub:'Issue stock to internal departments. Stock is deducted when the issue is posted.',
    actions:btn('Create Issue','plus','primary','data-go="issue-create"'),
    body:'<div class="kpis mb-16">'+kpi('Requested',c('Requested').length,'clock','warning','Awaiting approval')+kpi('Approved',c('Approved').length,'checkCircle','primary','Ready to pick')+kpi('Picked',c('Picked').length,'inbox','purple','Ready to issue')+kpi('Issued last 30 days',goodsIssues.filter(g=>g.status==='Issued'&&daysBetween(g.postedAt||g.date,NOW())<=30).length,'issue','success',fmtN(sum(goodsIssues.filter(g=>g.status==='Issued'&&daysBetween(g.postedAt||g.date,NOW())<=30),giQty))+' units deducted')+'</div><section class="card" id="iT"></section>',
    mount(page){const t=mountTable(page,'#iT',{title:'Goods issues',sort:'date',dir:-1,columns:[
      {key:'no',label:'Issue Number',render:g=>'<a class="link mono" href="#/issue-view/'+g.id+'">'+esc(g.no)+'</a>'},{key:'date',label:'Issue Date',render:g=>fmtD(g.date)},{key:'wh',label:'Warehouse',value:g=>W_BY(g.warehouseId).code,render:g=>'<span class="chip">'+esc(W_BY(g.warehouseId).code)+'</span>'},{key:'department',label:'Department'},{key:'reference',label:'Reference',render:g=>'<span class="mono">'+esc(g.reference)+'</span>'},
      {key:'items',label:'Items',align:'right',value:g=>g.items.length},{key:'qty',label:'Quantity',align:'right',value:giQty,render:g=>fmtN(giQty(g))},{key:'req',label:'Requested By',value:g=>g.requestedBy,render:g=>userCell(g.requestedBy)},{key:'status',label:'Status',render:g=>badge(g.status)}],data:()=>goodsIssues,onRowClick:g=>navigate('issue-view/'+g.id),
      filters:[{key:'s',label:'Any status',options:['Requested','Approved','Picked','Issued','Rejected','Cancelled'],test:(g,v)=>g.status===v},{key:'w',label:'All warehouses',options:activeWh().map(w=>[w.id,w.code]),test:(g,v)=>g.warehouseId===v},{key:'d',label:'All departments',options:DEPARTMENTS,test:(g,v)=>g.department===v}],
      actions:g=>[{label:'View',icon:'eye',onClick:()=>navigate('issue-view/'+g.id)},{label:'Edit',icon:'edit',disabled:g.status!=='Requested',onClick:()=>navigate('issue-edit/'+g.id)},{label:'Duplicate',icon:'copy',onClick:()=>duplicateDoc('issue',g)},'-',{label:'Delete',icon:'trash',danger:true,onClick:()=>deleteDoc('issue',g,()=>t.refresh())}]})}};
};
function issueFormPage(g){
  const editing=!!g;const doc=g?JSON.parse(JSON.stringify(g)):{no:'GI-26'+String(counters.GI+1).padStart(5,'0'),date:NOW(),warehouseId:'W1',department:'',reference:'',requestedBy:CURRENT_USER.name,issuedBy:'Daniel Reyes',reason:'',items:[]};
  return{title:editing?'Edit Goods Issue':'Create Goods Issue',nav:'issue-create',crumbs:[['Inventory','inventory'],['Goods Issue','goods-issue'],[editing?doc.no:'Create Issue']],sub:'Request → Approval → Pick → Issue → Stock Deduction',
    body:'<form class="card" id="iform" novalidate><div class="form-section">'+sectionHead(1,'Issue details','Who needs the stock and why')+'<div class="form-grid">'+
      F({name:'no',label:'Issue Number',span:3,value:doc.no,readonly:true})+F({name:'date',label:'Issue Date',type:'date',req:true,span:3,value:isoDate(doc.date)})+F({name:'warehouseId',label:'Warehouse',type:'select',req:true,span:3,value:doc.warehouseId,placeholder:false,options:whOptions()})+F({name:'department',label:'Department',type:'select',req:true,span:3,value:doc.department,options:DEPARTMENTS})+
      F({name:'reference',label:'Reference',span:3,value:doc.reference,ph:'Work order or request number'})+F({name:'requestedBy',label:'Requested By',type:'select',req:true,span:3,value:doc.requestedBy,options:USERS})+F({name:'issuedBy',label:'Issued By',type:'select',req:true,span:3,value:doc.issuedBy,options:USERS})+F({name:'reason',label:'Reason',req:true,span:3,value:doc.reason,ph:'e.g. Preventive maintenance'})+'</div></div>'+
      '<div class="form-section" style="padding-bottom:0">'+sectionHead(2,'Items','Issue quantity cannot exceed available stock')+'</div><div id="iLines"></div>'+
      '<div class="form-actions"><span class="spacer"></span>'+btn('Cancel','','','type="button" data-go="'+(editing?'issue-view/'+g.id:'goods-issue')+'"')+btn(editing?'Save Request':'Submit Request','send','primary','type="button" data-act')+'</div></form>',
    mount(page){
      const form=$('#iform',page);const wid=()=>$('[name=warehouseId]',form).value;
      const le=LineEditor({lines:doc.items,newLine:()=>({productId:'',qty:null,batch:'',locationId:''}),rerenderOn:['productId'],focusAfter:{productId:'qty'},
        onChange:(l,k)=>{if(k==='productId'){const r=stockRow(l.productId,wid());l.locationId=r?r.locationId:''}},
        cols:[{label:'Product',req:true},{label:'Available Qty',align:'right'},{label:'Issue Qty',req:true,w:'120px'},{label:'Batch'},{label:'Location'}],
        rowHTML:l=>{const p=P_BY(l.productId);const bs=p?batches.filter(b=>b.productId===p.id&&b.warehouseId===wid()&&b.qty>0):[];return '<td>'+lineProdSelect(l,products.filter(x=>whAvail(x.id,wid())>0))+'</td><td class="ro right num">'+(p?fmtN(whAvail(p.id,wid()))+' '+esc(p.uom):'—')+'</td><td><input class="input right" type="number" min="1" data-k="qty" value="'+(l.qty==null?'':l.qty)+'" aria-label="Issue quantity"></td><td>'+(bs.length?'<select class="select" data-k="batch" aria-label="Batch">'+optionsHTML(bs.map(b=>[b.batch,b.batch+' · '+fmtN(b.qty)]),l.batch,'FIFO (automatic)')+'</select>':'<span class="ro subtle" style="display:block;padding-top:6px">Not batch-tracked</span>')+'</td><td><select class="select" data-k="locationId" aria-label="Location" style="min-width:150px">'+optionsHTML(locsOf(wid()).map(x=>[x.id,x.code]),l.locationId,'Select location')+'</select></td>'},
        validateLine:l=>{const e={};if(!l.productId)e.productId='Select a product';const av=l.productId?whAvail(l.productId,wid()):0;if(!l.qty||l.qty<1)e.qty='Enter a quantity of at least 1';else if(l.qty>av)e.qty='Only '+fmtN(av)+' available';return e},
        footer:ls=>'<span class="muted">'+ls.filter(l=>l.productId).length+' items</span><span>Total quantity <b class="num">'+fmtN(sum(ls,l=>l.qty||0))+'</b></span><span>Value <b class="num">'+fmtM(sum(ls,l=>(l.qty||0)*((P_BY(l.productId)||{}).cost||0)),0)+'</b></span>'});
      $('#iLines',page).append(le.el);
      $('[name=warehouseId]',form).addEventListener('change',()=>{le.lines.splice(0,le.lines.length,{productId:'',qty:null,batch:'',locationId:''});le.render()});
      $('[data-act]',page).onclick=()=>{if(!validateForm(form)||!le.validate())return;const d=formData(form);let x=g;
        if(!x){x={id:uid('GI'),no:nextNo('GI'),history:[],createdBy:CURRENT_USER.name,createdAt:NOW(),status:'Requested'};goodsIssues.unshift(x);hist(x,'Requested',d.requestedBy,NOW(),'Request submitted');logAudit('Goods Issue','Created',x.no,'—','Status: Requested')}else logAudit('Goods Issue','Updated',x.no,'Items: '+g.items.length,'Items: '+le.lines.length);
        Object.assign(x,{date:new Date(d.date+'T09:00'),warehouseId:d.warehouseId,department:d.department,reference:d.reference,requestedBy:d.requestedBy,issuedBy:d.issuedBy,reason:d.reason,items:le.lines.map(l=>({productId:l.productId,qty:l.qty,batch:l.batch||'',locationId:l.locationId}))});
        toast('success','Issue request submitted',x.no+' for '+d.department+' is waiting for approval.');navigate('issue-view/'+x.id)};
    }};
}
ROUTES['issue-create']=()=>issueFormPage(null);
ROUTES['issue-edit']=id=>{const g=goodsIssues.find(x=>x.id===id);if(!g)return ROUTES['not-found']();return g.status==='Requested'?issueFormPage(g):ROUTES['issue-view'](id)};
function issueAction(g,act){
  const set=(s,note)=>{const o=g.status;g.status=s;hist(g,s,CURRENT_USER.name,NOW(),note);logAudit('Goods Issue','Updated',g.no,'Status: '+o,'Status: '+s);renderRoute()};
  if(act==='approve'){set('Approved','Approved for picking');toast('success','Issue approved',g.no+' is ready to pick.')}
  if(act==='reject')reasonModal('Reject '+g.no,'Reason for rejection',r=>{set('Rejected',r);toast('warning','Issue rejected',g.no+' returned to '+g.requestedBy+'.')});
  if(act==='cancel')confirmDialog({danger:true,title:'Cancel '+g.no+'?',message:'The request will be closed without issuing stock.',confirm:'Cancel issue',cancel:'Keep issue'}).then(ok=>{if(ok){set('Cancelled','Cancelled');toast('info','Issue cancelled',g.no+' closed.')}});
  if(act==='pick'){set('Picked','Picked from '+g.items.map(i=>(L_BY(i.locationId)||{}).code).filter(Boolean).join(', '));toast('success','Pick confirmed','Items staged for issue.')}
  if(act==='issue'){const short=g.items.filter(i=>i.qty>whQty(i.productId,g.warehouseId));if(short.length){messageModal('error','Not enough stock to issue','<p>'+short.map(i=>esc(P_BY(i.productId).name)+' needs '+fmtN(i.qty)+', on hand '+fmtN(whQty(i.productId,g.warehouseId))).join('<br>')+'</p>');return}
    confirmDialog({title:'Post '+g.no+'?',message:fmtN(giQty(g))+' units are deducted from '+esc(W_BY(g.warehouseId).name)+' and charged to '+esc(g.department)+'.',confirm:'Post issue'}).then(ok=>{if(!ok)return;g.items.forEach(i=>postMovement({type:'Goods Issue',pid:i.productId,wid:g.warehouseId,outQty:i.qty,txNo:g.no,ref:g.department,bucket:'issued',batch:i.batch||undefined}));g.postedAt=NOW();set('Issued','Stock deducted');toast('success','Goods issued','Stock reduced by '+fmtN(giQty(g))+' units.',{label:'View ledger',onClick:()=>navigate('ledger?type=Goods%20Issue')})})}
}
ROUTES['issue-view']=id=>{
  const g=goodsIssues.find(x=>x.id===id);if(!g)return ROUTES['not-found']();
  const A={Requested:[['Edit','edit','','edit'],['Cancel','x','danger-ghost','cancel'],['Reject','x','danger-ghost','reject'],['Approve','check','primary','approve']],Approved:[['Confirm Pick','inbox','primary','pick']],Picked:[['Post Issue','issue','success','issue']]}[g.status]||[];
  return{title:g.no,nav:'goods-issue',crumbs:[['Inventory','inventory'],['Goods Issue','goods-issue'],[g.no]],titleHTML:'Goods Issue <span class="mono" style="font-weight:600">'+esc(g.no)+'</span>',sub:esc(g.department)+' · '+esc(W_BY(g.warehouseId).name)+' · '+fmtD(g.date),
    actions:btn('Duplicate','copy','','data-dup')+btn('Print','print','','data-print'),
    body:docHeaderCard(g.no,g.status,flowFor('issue',g.status,histMeta(g,'issue')),A.map(x=>btn(x[0],x[1],x[2],'data-ia="'+x[3]+'"')).join(''))+
      '<div class="grid g-main"><div class="stack">'+card('Items','<div class="table-wrap auto"><table class="tbl"><thead><tr><th>Product</th><th class="right">Available Qty</th><th class="right">Issue Qty</th><th>Batch</th><th>Location</th><th class="right">Value</th></tr></thead><tbody>'+g.items.map(i=>{const p=P_BY(i.productId);return '<tr><td>'+prodCell(p)+'</td><td class="right num">'+fmtN(whAvail(i.productId,g.warehouseId))+'</td><td class="right num"><b>'+fmtN(i.qty)+'</b></td><td class="mono">'+esc(i.batch||'FIFO')+'</td><td class="mono">'+esc((L_BY(i.locationId)||{}).code||'—')+'</td><td class="right num">'+fmtM(i.qty*(p?p.cost:0))+'</td></tr>'}).join('')+'</tbody></table></div>',{tight:true})+'</div>'+
      '<div class="stack">'+card('Details','<dl class="dl"><dt>Issue date</dt><dd>'+fmtD(g.date)+'</dd><dt>Warehouse</dt><dd>'+esc(W_BY(g.warehouseId).name)+'</dd><dt>Department</dt><dd>'+esc(g.department)+'</dd><dt>Reference</dt><dd class="mono">'+esc(g.reference||'—')+'</dd><dt>Requested by</dt><dd>'+esc(g.requestedBy)+'</dd><dt>Issued by</dt><dd>'+esc(g.issuedBy)+'</dd><dt>Reason</dt><dd>'+esc(g.reason)+'</dd><dt>Posted</dt><dd>'+(g.postedAt?fmtDT(g.postedAt):'—')+'</dd></dl>')+card('Activity',timelineHTML(g.history))+'</div></div>',
    mount(page){$$('[data-ia]',page).forEach(b=>b.onclick=()=>{const k=b.dataset.ia;if(k==='edit')navigate('issue-edit/'+g.id);else issueAction(g,k)});$('[data-dup]',page).onclick=()=>duplicateDoc('issue',g);$('[data-print]',page).onclick=doPrint}};
};

/* =========================================================
   INVENTORY PLANNING
   ========================================================= */
const avgDaily=(pid,days)=>outflow(pid,days||90)/(days||90);
const LEAD_DAYS=14;
const suggestReorder=p=>Math.max(p.min,Math.ceil(avgDaily(p.id)*LEAD_DAYS+p.safety));
const daysCover=p=>{const a=avgDaily(p.id,30);const q=productQty(p.id)-productReserved(p.id);return a>0?Math.floor(q/a):null};
ROUTES.reorder=()=>{
  const pending={};
  return{title:'Reorder Levels',crumbs:[['Inventory','inventory'],['Inventory Planning','reorder'],['Reorder Levels']],sub:'Set stocking rules per product. Suggestions use average daily demand over 90 days × '+LEAD_DAYS+'-day lead time + safety stock.',
    actions:btn('Discard changes','undo','','data-reset disabled')+btn('Save changes','save','primary','data-save disabled'),
    body:'<section class="card" id="rT"></section>',
    mount(page){
      const sync=()=>{const n=Object.keys(pending).length;$('[data-save]',page).disabled=!n;$('[data-reset]',page).disabled=!n;$('[data-save] span',page).textContent=n?'Save '+n+' change'+(n>1?'s':''):'Save changes'};
      const val=(p,k)=>pending[p.id]&&pending[p.id][k]!=null?pending[p.id][k]:p[k];
      const inp=(p,k)=>'<input class="input input-sm right num" style="width:84px" type="number" min="0" data-ro="'+p.id+'" data-rk="'+k+'" value="'+val(p,k)+'" aria-label="'+k+' for '+esc(p.sku)+'">';
      const t=mountTable(page,'#rT',{title:'Reorder levels',selectable:true,pageSize:25,columns:[
        {key:'name',label:'Product',value:p=>p.name+' '+p.sku,render:p=>prodCell(p)},
        {key:'avail',label:'Available',align:'right',value:p=>productQty(p.id)-productReserved(p.id),render:p=>fmtN(productQty(p.id)-productReserved(p.id))},
        {key:'demand',label:'Avg daily demand',align:'right',value:p=>avgDaily(p.id),render:p=>avgDaily(p.id).toFixed(1)},
        {key:'min',label:'Minimum',align:'right',filter:false,render:p=>inp(p,'min'),export:true},
        {key:'reorder',label:'Reorder Level',align:'right',filter:false,render:p=>inp(p,'reorder')},
        {key:'max',label:'Maximum',align:'right',filter:false,render:p=>inp(p,'max')},
        {key:'safety',label:'Safety',align:'right',filter:false,render:p=>inp(p,'safety')},
        {key:'sug',label:'Suggested reorder',align:'right',value:suggestReorder,render:p=>{const s=suggestReorder(p);const d=s-val(p,'reorder');return fmtN(s)+(Math.abs(d)>val(p,'reorder')*0.15?' <span class="'+(d>0?'neg':'pos')+'" style="font-size:12px">'+(d>0?'+':'')+fmtN(d)+'</span>':'')}},
        {key:'st',label:'Status',value:pStatus,render:p=>badge(pStatus(p))}],
        data:()=>products.filter(p=>p.status!=='Inactive'),rowClass:p=>pending[p.id]?'changed-row':'',
        filters:[{key:'c',label:'All categories',options:categories.map(c=>[c.id,c.name]),test:(p,v)=>p.categoryId===v},{key:'s',label:'Any stock level',options:['Healthy','Low Stock','Critical','Out of Stock','Overstock'],test:(p,v)=>pStatus(p)===v}],
        bulkActions:[{label:'Apply suggested reorder level',icon:'target',onClick:ids=>{ids.forEach(id=>{const p=P_BY(id);pending[id]=Object.assign(pending[id]||{},{reorder:suggestReorder(p)})});t.clearSelection();sync();toast('info','Suggestions applied',ids.length+' products updated. Save to keep the changes.')}}]});
      page.addEventListener('input',e=>{const i=e.target.closest('[data-ro]');if(!i)return;const id=i.dataset.ro,k=i.dataset.rk;const p=P_BY(id);const v=i.value===''?0:Math.max(0,+i.value);pending[id]=pending[id]||{};if(v===p[k]){delete pending[id][k];if(!Object.keys(pending[id]).length)delete pending[id]}else pending[id][k]=v;i.closest('tr').classList.toggle('changed-row',!!pending[id]);sync()});
      $('[data-reset]',page).onclick=()=>{Object.keys(pending).forEach(k=>delete pending[k]);t.refresh();sync()};
      $('[data-save]',page).onclick=()=>{const bad=Object.keys(pending).filter(id=>{const p=P_BY(id);const m=val(p,'min'),r=val(p,'reorder'),x=val(p,'max');return !(m<=r&&r<x)});
        if(bad.length){messageModal('error','Check the stocking rules','<p>Minimum must not exceed the reorder level, and the reorder level must be below maximum, for:</p><p class="mt-8">'+bad.map(id=>'<b>'+esc(P_BY(id).name)+'</b>').join(', ')+'</p>');return}
        const n=Object.keys(pending).length;Object.entries(pending).forEach(([id,ch])=>{const p=P_BY(id);Object.entries(ch).forEach(([k,v])=>{logAudit('Inventory','Updated',p.sku,FIELD_LABELS[k]+': '+p[k],FIELD_LABELS[k]+': '+v);p[k]=v});p.updatedAt=NOW();p.updatedBy=CURRENT_USER.name;delete pending[id]});t.refresh();sync();toast('success','Reorder levels saved',n+' product'+(n>1?'s':'')+' updated.')};
    }};
};
ROUTES['low-stock']=()=>{
  const list=()=>products.filter(p=>p.status==='Active'&&['Low Stock','Critical','Out of Stock'].includes(pStatus(p)));
  const L=list();
  return{title:'Low Stock',crumbs:[['Inventory','inventory'],['Inventory Planning','reorder'],['Low Stock']],sub:L.length+' active products at or below their reorder level. Open purchase orders are shown as on order.',
    body:'<div class="kpis mb-16">'+kpi('Out of stock',L.filter(p=>pStatus(p)==='Out of Stock').length,'xCircle','danger','No available quantity')+kpi('Critical',L.filter(p=>pStatus(p)==='Critical').length,'alert','warning','Below 50% of reorder level')+kpi('Low stock',L.filter(p=>pStatus(p)==='Low Stock').length,'target','primary','At or below reorder level')+kpi('Covered by open POs',L.filter(p=>onOrder(p.id)>0).length,'cart','success',fmtN(sum(L,p=>onOrder(p.id)))+' units on order')+'</div><section class="card" id="lsT"></section>',
    mount(page){const t=mountTable(page,'#lsT',{title:'Low stock',selectable:true,sort:'cover',columns:[
      {key:'name',label:'Product',value:p=>p.name+' '+p.sku,render:p=>prodCell(p)},{key:'cat',label:'Category',value:p=>CAT_BY(p.categoryId).name},
      {key:'avail',label:'Available',align:'right',value:p=>productQty(p.id)-productReserved(p.id),render:p=>'<b>'+fmtN(productQty(p.id)-productReserved(p.id))+'</b>'},{key:'reorder',label:'Reorder Level',align:'right'},
      {key:'short',label:'Shortfall',align:'right',value:p=>Math.max(0,p.reorder-productQty(p.id)),render:p=>'<span class="neg">'+fmtN(Math.max(0,p.reorder-productQty(p.id)))+'</span>'},{key:'oo',label:'On Order',align:'right',value:p=>onOrder(p.id),render:p=>onOrder(p.id)?fmtN(onOrder(p.id)):'<span class="subtle">—</span>'},
      {key:'sug',label:'Suggested order',align:'right',value:p=>Math.max(0,p.max-productQty(p.id)-onOrder(p.id)),render:p=>fmtN(Math.max(0,p.max-productQty(p.id)-onOrder(p.id)))},
      {key:'cover',label:'Days of cover',align:'right',value:p=>{const d=daysCover(p);return d==null?9999:d},render:p=>{const d=daysCover(p);return d==null?'<span class="subtle">No demand</span>':'<span class="'+(d<7?'neg':'')+'">'+d+' days</span>'}},
      {key:'st',label:'Status',value:pStatus,render:p=>badge(pStatus(p))}],data:list,
      actions:p=>[{label:'Raise purchase order',icon:'cart',onClick:()=>raisePO(p)},{label:'Transfer stock',icon:'transfer',onClick:()=>{const src=stock.filter(s=>s.productId===p.id&&s.qty-s.reserved>0).sort((a,b)=>b.qty-a.qty)[0];navigate('transfer-create?product='+p.id+(src?'&from='+src.warehouseId:''))}},{label:'View product',icon:'eye',onClick:()=>navigate('product-view/'+p.id)},{label:'Edit reorder rules',icon:'target',onClick:()=>navigate('reorder')}],
      bulkActions:[{label:'Raise purchase orders',icon:'cart',onClick:ids=>{const by={};ids.forEach(id=>{const p=P_BY(id);const s=SUPPLIERS[p.categoryId];(by[s]=by[s]||[]).push(p)});const made=[];Object.entries(by).forEach(([s,ps])=>{const po={id:uid('PO'),no:nextNo('PO'),date:NOW(),supplier:s,warehouseId:ps[0].defaultWarehouseId,status:'Open',expected:addDays(NOW(),10),items:ps.map(p=>({productId:p.id,qty:Math.max(p.reorder,p.max-productQty(p.id)-onOrder(p.id)),received:0,cost:p.cost})),createdBy:CURRENT_USER.name,terms:'Net 30'};purchaseOrders.unshift(po);made.push(po.no);logAudit('Purchasing','Created',po.no,'—','Replenishment for '+ps.length+' products')});toast('success',made.length+' purchase order'+(made.length>1?'s':'')+' created',made.join(', ')+'.',{label:'View purchase orders',onClick:()=>navigate('purchasing')});t.clearSelection()}}],
      emptyIcon:'checkCircle',emptyTitle:'Stock levels are healthy',emptyText:'No active product is at or below its reorder level.'})}};
};
ROUTES.expiry=()=>{
  const list=()=>batches.filter(b=>b.qty>0&&b.expiry);const L=list();const val=bs=>sum(bs,b=>b.qty*P_BY(b.productId).cost);
  const ex=L.filter(b=>expStatus(b)==='Expired'),soon=L.filter(b=>expStatus(b)==='Expiring Soon'),q90=L.filter(b=>expStatus(b)==='Within 90 Days');
  return{title:'Expiry Tracking',crumbs:[['Inventory','inventory'],['Inventory Planning','reorder'],['Expiry Tracking']],sub:'Batches of expiry-controlled products on hand, earliest expiry first. Warning window: '+SETTINGS.expiryWarn+' days.',
    body:'<div class="kpis mb-16">'+kpi('Expired',ex.length+' batches','xCircle','danger',fmtM(val(ex),0)+' to write off')+kpi('Expiring in '+SETTINGS.expiryWarn+' days',soon.length+' batches','hourglass','warning',fmtM(val(soon),0)+' at risk')+kpi('Within 90 days',q90.length+' batches','calendar','primary',fmtN(sum(q90,b=>b.qty))+' units')+kpi('Tracked batches',L.length,'layers','success',products.filter(p=>p.expiry).length+' expiry-controlled products')+'</div><section class="card" id="eT"></section>',
    mount(page){mountTable(page,'#eT',{title:'Expiry tracking',sort:'expiry',columns:[
      {key:'p',label:'Product',value:b=>P_BY(b.productId).name,render:b=>prodCell(P_BY(b.productId))},{key:'batch',label:'Batch',render:b=>'<span class="mono">'+esc(b.batch)+'</span>'},
      {key:'wh',label:'Warehouse',value:b=>W_BY(b.warehouseId).code,render:b=>'<span class="chip">'+esc(W_BY(b.warehouseId).code)+'</span>'},{key:'received',label:'Received',render:b=>fmtD(b.received)},{key:'expiry',label:'Expiry Date',render:b=>fmtD(b.expiry)},
      {key:'days',label:'Days left',align:'right',value:b=>daysBetween(NOW(),b.expiry),render:b=>{const d=daysBetween(NOW(),b.expiry);return '<span class="'+(d<0?'neg':d<=SETTINGS.expiryWarn?'neg':'')+'">'+(d<0?Math.abs(d)+' days ago':d+' days')+'</span>'}},
      {key:'qty',label:'Quantity',align:'right',render:b=>fmtN(b.qty)+' '+esc(P_BY(b.productId).uom)},{key:'value',label:'Value',align:'right',value:b=>b.qty*P_BY(b.productId).cost,render:b=>fmtM(b.qty*P_BY(b.productId).cost)},{key:'st',label:'Status',value:expStatus,render:b=>badge(expStatus(b))}],data:list,
      filters:[{key:'s',label:'Any status',options:['Expired','Expiring Soon','Within 90 Days','Good'],test:(b,v)=>expStatus(b)===v},{key:'w',label:'All warehouses',options:activeWh().map(w=>[w.id,w.code]),test:(b,v)=>b.warehouseId===v}],
      actions:b=>[{label:'Write off expired stock',icon:'trash',danger:expStatus(b)==='Expired',onClick:()=>navigate('adjustment-create?type=Expiry&warehouse='+b.warehouseId+'&product='+b.productId+'&qty='+b.qty+'&reason='+encodeURIComponent('Expired batch '+b.batch)+'&ref='+b.batch)},{label:'Transfer for faster use',icon:'transfer',onClick:()=>navigate('transfer-create?from='+b.warehouseId+'&product='+b.productId)},{label:'View product',icon:'eye',onClick:()=>navigate('product-view/'+b.productId)}],
      emptyTitle:'No expiry-controlled stock',emptyText:'Batches of products with expiry tracking appear here after receipt.'})}};
};

/* =========================================================
   REPORTS
   ========================================================= */
const REPORTS=[
 {key:'valuation',label:'Inventory Valuation',icon:'dollar',desc:'Quantity and value on hand at a date'},
 {key:'movement',label:'Stock Movement',icon:'transfer',desc:'Opening, in, out and closing by product'},
 {key:'aging',label:'Stock Aging',icon:'clock',desc:'On-hand stock by receipt age (FIFO)'},
 {key:'low',label:'Low Stock',icon:'alert',desc:'Products at or below reorder level'},
 {key:'warehouse',label:'Warehouse Stock',icon:'warehouse',desc:'Position and throughput by site'},
 {key:'product',label:'Product Movement',icon:'activity',desc:'Movements by transaction type'},
 {key:'dead',label:'Dead Stock',icon:'ban',desc:'No demand in the last 90 days'},
 {key:'expiry',label:'Expiry Report',icon:'hourglass',desc:'Batches by expiry date'}];
function buildReport(key,f){
  const from=new Date(f.from+'T00:00'),to=new Date(f.to+'T23:59:59');
  const pf=p=>(!f.cat||p.categoryId===f.cat)&&(!f.pid||p.id===f.pid);
  const ps=products.filter(pf);const inR=e=>e.date>=from&&e.date<=to&&(!f.wid||e.warehouseId===f.wid)&&ps.some(p=>p.id===e.productId);
  const COLS=['var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)','var(--c6)','var(--c1)','var(--c2)','var(--c3)'];
  const pc=[{key:'name',label:'Product',value:p=>p.name,render:p=>prodCell(p)},{key:'sku',label:'SKU',render:p=>'<span class="mono">'+esc(p.sku)+'</span>'},{key:'cat',label:'Category',value:p=>CAT_BY(p.categoryId).name}];
  if(key==='valuation'){const rows=ps.map(p=>{const q=Math.max(0,qtyAt(p.id,to,f.wid));return{id:p.id,p,q,v:q*p.cost}}).filter(r=>r.q>0);const tot=sum(rows,r=>r.v);
    const byCat=categories.map((c,i)=>({label:c.name,value:sum(rows.filter(r=>r.p.categoryId===c.id),r=>r.v),color:COLS[i]})).filter(x=>x.value>0);
    return{summary:[['Inventory value',fmtM(tot,0)],['Units on hand',fmtN(sum(rows,r=>r.q))],['Products',rows.length],['As of',fmtD(to)]],chart:donut(byCat,{fmt:fmtK,center:fmtK(tot),centerSub:'Total value'}),
      columns:[{key:'name',label:'Product',value:r=>r.p.name,render:r=>prodCell(r.p)},{key:'cat',label:'Category',value:r=>CAT_BY(r.p.categoryId).name},{key:'q',label:'Quantity',align:'right',render:r=>fmtN(r.q)},{key:'uom',label:'Unit',value:r=>r.p.uom},{key:'c',label:'Unit Cost',align:'right',value:r=>r.p.cost,render:r=>fmtM(r.p.cost)},{key:'v',label:'Value',align:'right',render:r=>'<b>'+fmtM(r.v)+'</b>'},{key:'s',label:'Share',align:'right',value:r=>r.v/tot,render:r=>(r.v/tot*100).toFixed(1)+'%'}],rows,footer:rs=>['<b>Total</b>','',fmtN(sum(rs,r=>r.q)),'','',fmtM(sum(rs,r=>r.v)),'100%']}}
  if(key==='movement'){const es=ledger.filter(inR);const rows=ps.map(p=>{const pe=es.filter(e=>e.productId===p.id);return{id:p.id,p,o:qtyAt(p.id,from,f.wid),i:sum(pe,e=>e.inQty),out:sum(pe,e=>e.outQty),c:qtyAt(p.id,to,f.wid),n:pe.length}}).filter(r=>r.n||r.o||r.c);
    const wk=[];for(let d=new Date(from);d<=to;d=addDays(d,7))wk.push(new Date(d));const wi=wk.map(d=>sum(es.filter(e=>e.date>=d&&e.date<addDays(d,7)),e=>e.inQty)),wo=wk.map(d=>sum(es.filter(e=>e.date>=d&&e.date<addDays(d,7)),e=>e.outQty));
    return{summary:[['Units in',fmtN(sum(rows,r=>r.i))],['Units out',fmtN(sum(rows,r=>r.out))],['Movements',fmtN(es.length)],['Products moved',rows.filter(r=>r.n).length]],chart:barChart({labels:wk.map(shortD),series:[{name:'In',values:wi,color:'var(--c2)'},{name:'Out',values:wo,color:'var(--c1)'}],h:200}),
      columns:[{key:'name',label:'Product',value:r=>r.p.name,render:r=>prodCell(r.p)},{key:'o',label:'Opening',align:'right',render:r=>fmtN(r.o)},{key:'i',label:'In',align:'right',render:r=>r.i?'<span class="pos">+'+fmtN(r.i)+'</span>':'—'},{key:'out',label:'Out',align:'right',render:r=>r.out?'<span class="neg">−'+fmtN(r.out)+'</span>':'—'},{key:'c',label:'Closing',align:'right',render:r=>'<b>'+fmtN(r.c)+'</b>'},{key:'n',label:'Movements',align:'right'},{key:'t',label:'Turnover',align:'right',value:r=>r.out/((r.o+r.c)/2||1),render:r=>(r.out/((r.o+r.c)/2||1)).toFixed(2)+'×'}],rows,footer:rs=>['<b>Total</b>',fmtN(sum(rs,r=>r.o)),fmtN(sum(rs,r=>r.i)),fmtN(sum(rs,r=>r.out)),fmtN(sum(rs,r=>r.c)),fmtN(sum(rs,r=>r.n)),'']}}
  if(key==='aging'){const rows=agingRows().filter(a=>pf(P_BY(a.row.productId))&&(!f.wid||a.row.warehouseId===f.wid)).map(a=>({id:a.row.productId+a.row.warehouseId,a,p:P_BY(a.row.productId)}));const vb=[0,0,0,0,0];rows.forEach(r=>r.a.b.forEach((q,i)=>vb[i]+=q*r.p.cost));
    return{summary:[['Stock older than 90 days',fmtM(vb[3]+vb[4],0)],['Share of value',(sum(vb)?(vb[3]+vb[4])/sum(vb)*100:0).toFixed(1)+'%'],['Lines',rows.length],['Method','FIFO']],chart:barChart({labels:AGE_BUCKETS,series:[{name:'Value',values:vb,color:'var(--c4)'}],colors:['var(--c2)','var(--c5)','var(--c1)','var(--c3)','var(--c6)'],fmt:v=>fmtM(v,0),fmtAxis:fmtK,legend:false,h:200}),
      columns:[{key:'name',label:'Product',value:r=>r.p.name,render:r=>prodCell(r.p)},{key:'w',label:'Warehouse',value:r=>W_BY(r.a.row.warehouseId).code}].concat(AGE_BUCKETS.map((b,i)=>({key:'b'+i,label:b,align:'right',value:r=>r.a.b[i],render:r=>r.a.b[i]?fmtN(r.a.b[i]):'<span class="subtle">—</span>'}))).concat([{key:'age',label:'Oldest (days)',align:'right',value:r=>r.a.age},{key:'v',label:'Value',align:'right',value:r=>r.a.row.qty*r.p.cost,render:r=>fmtM(r.a.row.qty*r.p.cost)}]),rows,footer:rs=>['<b>Total</b>',''].concat(AGE_BUCKETS.map((_,i)=>fmtN(sum(rs,r=>r.a.b[i])))).concat(['',fmtM(sum(rs,r=>r.a.row.qty*r.p.cost))])}}
  if(key==='low'){const rows=ps.filter(p=>p.status==='Active'&&['Low Stock','Critical','Out of Stock'].includes(pStatus(p)));
    return{summary:[['Products',rows.length],['Out of stock',rows.filter(p=>pStatus(p)==='Out of Stock').length],['Total shortfall',fmtN(sum(rows,p=>Math.max(0,p.reorder-productQty(p.id))))],['On order',fmtN(sum(rows,p=>onOrder(p.id)))]],chart:hbars(rows.slice(0,8).map(p=>({label:p.name,value:Math.max(0,p.reorder-productQty(p.id)),cls:'d'}))),
      columns:pc.concat([{key:'q',label:'On hand',align:'right',value:p=>productQty(p.id)},{key:'reorder',label:'Reorder Level',align:'right'},{key:'sh',label:'Shortfall',align:'right',value:p=>Math.max(0,p.reorder-productQty(p.id))},{key:'oo',label:'On order',align:'right',value:p=>onOrder(p.id)},{key:'st',label:'Status',value:pStatus,render:p=>badge(pStatus(p))}]),rows}}
  if(key==='warehouse'){const rows=warehouses.filter(w=>!f.wid||w.id===f.wid).map(w=>{const es=ledger.filter(e=>e.warehouseId===w.id&&e.date>=from&&e.date<=to);return{id:w.id,w,n:whStock(w.id).length,q:sum(whStock(w.id),s=>s.qty),v:whValue(w.id),u:whUtil(w),i:sum(es,e=>e.inQty),o:sum(es,e=>e.outQty)}});
    return{summary:[['Sites',rows.length],['Units on hand',fmtN(sum(rows,r=>r.q))],['Value',fmtM(sum(rows,r=>r.v),0)],['Throughput',fmtN(sum(rows,r=>r.i+r.o))+' units']],chart:barChart({labels:rows.map(r=>r.w.code),series:[{name:'In',values:rows.map(r=>r.i),color:'var(--c2)'},{name:'Out',values:rows.map(r=>r.o),color:'var(--c1)'}],h:200}),
      columns:[{key:'name',label:'Warehouse',value:r=>r.w.name,render:r=>whCell(r.w)},{key:'n',label:'Products',align:'right'},{key:'q',label:'On hand',align:'right',render:r=>fmtN(r.q)},{key:'v',label:'Value',align:'right',render:r=>fmtM(r.v,0)},{key:'u',label:'Utilization',render:r=>utilHTML(r.u),exportValue:r=>r.u+'%'},{key:'i',label:'In (period)',align:'right',render:r=>fmtN(r.i)},{key:'o',label:'Out (period)',align:'right',render:r=>fmtN(r.o)},{key:'st',label:'Status',value:r=>r.w.status,render:r=>badge(r.w.status)}],rows,footer:rs=>['<b>Total</b>',fmtN(sum(rs,r=>r.n)),fmtN(sum(rs,r=>r.q)),fmtM(sum(rs,r=>r.v),0),'',fmtN(sum(rs,r=>r.i)),fmtN(sum(rs,r=>r.o)),'']}}
  if(key==='product'){const es=ledger.filter(inR);const types=['Opening Balance','GRN','Sales','Goods Issue','Transfer','Adjustment'];const rows=types.map(t=>{const te=es.filter(e=>e.type===t);return{id:t,t,n:te.length,i:sum(te,e=>e.inQty),o:sum(te,e=>e.outQty),v:sum(te,e=>e.value)}});
    const p=f.pid?P_BY(f.pid):null;let chart;
    if(p){const ws=[];for(let d=new Date(from);d<=to;d=addDays(d,7))ws.push(new Date(d));chart=lineChart({labels:ws.map(shortD),series:[{name:p.name,values:ws.map(d=>Math.max(0,qtyAt(p.id,d,f.wid))),color:'var(--c1)'}],h:200})}
    else chart=barChart({labels:rows.map(r=>r.t.replace('Opening Balance','Opening')),series:[{name:'In',values:rows.map(r=>r.i),color:'var(--c2)'},{name:'Out',values:rows.map(r=>r.o),color:'var(--c1)'}],h:200});
    return{summary:[['Scope',p?p.name:'All filtered products'],['Entries',fmtN(es.length)],['Net quantity',fmtN(sum(rows,r=>r.i-r.o))],['Net value',fmtM(sum(rows,r=>r.v),0)]],chart,
      columns:[{key:'t',label:'Transaction Type'},{key:'n',label:'Entries',align:'right'},{key:'i',label:'In Qty',align:'right',render:r=>fmtN(r.i)},{key:'o',label:'Out Qty',align:'right',render:r=>fmtN(r.o)},{key:'net',label:'Net Qty',align:'right',value:r=>r.i-r.o,render:r=>'<b class="'+(r.i-r.o>=0?'pos':'neg')+'">'+fmtN(r.i-r.o)+'</b>'},{key:'v',label:'Value',align:'right',render:r=>fmtM(r.v,0)}],rows,footer:rs=>['<b>Total</b>',fmtN(sum(rs,r=>r.n)),fmtN(sum(rs,r=>r.i)),fmtN(sum(rs,r=>r.o)),fmtN(sum(rs,r=>r.i-r.o)),fmtM(sum(rs,r=>r.v),0)]}}
  if(key==='dead'){const cut=addDays(to,-90);const rows=ps.filter(p=>productQty(p.id)>0).map(p=>{const outs=ledger.filter(e=>e.productId===p.id&&(e.type==='Sales'||e.type==='Goods Issue')&&(!f.wid||e.warehouseId===f.wid));const last=outs.length?outs[outs.length-1].date:null;return{id:p.id,p,last,q:f.wid?whQty(p.id,f.wid):productQty(p.id)}}).filter(r=>r.q>0&&(!r.last||r.last<cut));
    return{summary:[['Products',rows.length],['Units',fmtN(sum(rows,r=>r.q))],['Value tied up',fmtM(sum(rows,r=>r.q*r.p.cost),0)],['No demand since',fmtD(cut)]],chart:rows.length?hbars(rows.sort((a,b)=>b.q*b.p.cost-a.q*a.p.cost).slice(0,8).map(r=>({label:r.p.name,value:Math.round(r.q*r.p.cost)})),{fmt:v=>fmtM(v,0)}):'<div class="empty"><div class="empty-ico">'+icon('checkCircle',22)+'</div><h4>No dead stock</h4><p>Every product with stock had demand in the last 90 days.</p></div>',
      columns:pc.concat([{key:'q',label:'On hand',align:'right'},{key:'last',label:'Last issue',value:r=>r.last,render:r=>r.last?fmtD(r.last):'Never'},{key:'d',label:'Days idle',align:'right',value:r=>r.last?daysBetween(r.last,to):999,render:r=>r.last?daysBetween(r.last,to):'—'},{key:'v',label:'Value',align:'right',value:r=>r.q*r.p.cost,render:r=>fmtM(r.q*r.p.cost)}]).map(c=>c.key==='name'?{key:'name',label:'Product',value:r=>r.p.name,render:r=>prodCell(r.p)}:c.key==='sku'?{key:'sku',label:'SKU',value:r=>r.p.sku}:c.key==='cat'?{key:'cat',label:'Category',value:r=>CAT_BY(r.p.categoryId).name}:c),rows}}
  if(key==='expiry'){const rows=batches.filter(b=>b.qty>0&&b.expiry&&pf(P_BY(b.productId))&&(!f.wid||b.warehouseId===f.wid));const st=s=>rows.filter(b=>expStatus(b)===s);
    return{summary:[['Expired',st('Expired').length+' batches'],['Expiring soon',st('Expiring Soon').length+' batches'],['Value at risk',fmtM(sum(st('Expired').concat(st('Expiring Soon')),b=>b.qty*P_BY(b.productId).cost),0)],['Batches',rows.length]],
      chart:donut(['Expired','Expiring Soon','Within 90 Days','Good'].map((s,i)=>({label:s,value:sum(st(s),b=>b.qty*P_BY(b.productId).cost),color:['var(--danger)','var(--c6)','var(--c3)','var(--c2)'][i]})),{fmt:fmtK,center:String(rows.length),centerSub:'batches'}),
      columns:[{key:'p',label:'Product',value:b=>P_BY(b.productId).name,render:b=>prodCell(P_BY(b.productId))},{key:'batch',label:'Batch'},{key:'w',label:'Warehouse',value:b=>W_BY(b.warehouseId).code},{key:'expiry',label:'Expiry',render:b=>fmtD(b.expiry)},{key:'d',label:'Days left',align:'right',value:b=>daysBetween(NOW(),b.expiry)},{key:'qty',label:'Qty',align:'right'},{key:'v',label:'Value',align:'right',value:b=>b.qty*P_BY(b.productId).cost,render:b=>fmtM(b.qty*P_BY(b.productId).cost)},{key:'s',label:'Status',value:expStatus,render:b=>badge(expStatus(b))}],rows}}
}
ROUTES.reports=(key,q)=>{
  key=REPORTS.some(r=>r.key===key)?key:'valuation';const R_=REPORTS.find(r=>r.key===key);
  const f={from:q.from||isoDate(addDays(NOW(),-90)),to:q.to||isoDate(NOW()),wid:q.warehouse||'',cat:q.category||'',pid:q.product||''};
  const nav='reports/'+(['valuation','movement','aging','warehouse'].includes(key)?key:'valuation');
  return{title:'Inventory Reports',nav,crumbs:[['Inventory','inventory'],['Reports','reports/valuation'],[R_.label]],sub:R_.desc+'. Filters apply to the report and its export.',
    actions:btn('Print','print','','data-print')+btn('Export','export','primary','data-export'),
    body:'<div class="grid" style="grid-template-columns:260px minmax(0,1fr)" id="repGrid"><section class="card report-nav-card"><div class="report-nav">'+REPORTS.map(r=>'<button class="'+(r.key===key?'active':'')+'" data-rep="'+r.key+'">'+icon(r.icon,17)+'<span><b>'+esc(r.label)+'</b><small>'+esc(r.desc)+'</small></span></button>').join('')+'</div></section>'+
      '<section class="card"><div class="dt-toolbar no-print" style="gap:12px;align-items:flex-end"><label class="field" style="grid-column:auto;min-width:140px"><span class="lbl">From</span><input class="input" type="date" data-rf="from" value="'+f.from+'"'+(key==='valuation'||key==='low'||key==='expiry'||key==='aging'?' disabled':'')+'></label><label class="field" style="min-width:140px"><span class="lbl">'+(key==='valuation'?'As of':'To')+'</span><input class="input" type="date" data-rf="to" value="'+f.to+'"></label><label class="field" style="min-width:160px"><span class="lbl">Warehouse</span><select class="select" data-rf="warehouse">'+optionsHTML(whOptions(true).map(o=>[o[0],o[1].split(' (')[0]]),f.wid,'All warehouses')+'</select></label><label class="field" style="min-width:150px"><span class="lbl">Category</span><select class="select" data-rf="category">'+optionsHTML(categories.map(c=>[c.id,c.name]),f.cat,'All categories')+'</select></label><label class="field" style="min-width:180px;flex:1"><span class="lbl">Product</span><select class="select" data-rf="product">'+optionsHTML(products.filter(p=>!f.cat||p.categoryId===f.cat).map(p=>[p.id,p.name]),f.pid,'All products')+'</select></label><button class="btn btn-ghost" data-rclear>Reset</button></div><div class="sum-row" id="repSum"></div><div class="card-body" id="repChart" style="border-bottom:1px solid var(--border)"></div><div id="repTable"></div></section></div>',
    mount(page){
      const g=$('#repGrid',page);const mq=()=>{g.style.gridTemplateColumns=innerWidth<1100?'minmax(0,1fr)':'260px minmax(0,1fr)'};mq();
      const go=()=>{const v=k=>$('[data-rf="'+k+'"]',page).value;const qs=new URLSearchParams();['from','to','warehouse','category','product'].forEach(k=>{if(v(k))qs.set(k,v(k))});navigate('reports/'+key+'?'+qs.toString())};
      $$('[data-rf]',page).forEach(i=>i.addEventListener('change',()=>{if(i.dataset.rf==='to'&&$('[data-rf=from]',page).value>i.value){toast('error','Check the date range','The end date must be after the start date.');return}go()}));
      $('[data-rclear]',page).onclick=()=>navigate('reports/'+key);
      $$('[data-rep]',page).forEach(b=>b.onclick=()=>{const qs=location.hash.split('?')[1];navigate('reports/'+b.dataset.rep+(qs?'?'+qs:''))});
      const rep=buildReport(key,f);
      $('#repSum',page).innerHTML=rep.summary.map(s=>'<div><small>'+esc(s[0])+'</small><b>'+esc(s[1])+'</b></div>').join('');
      $('#repChart',page).innerHTML=rep.chart;
      const t=mountTable(page,'#repTable',{title:R_.label,columns:rep.columns,data:()=>rep.rows,rowId:r=>r.id||r.batch||r.t,pageSize:25,footer:rep.footer,emptyIcon:'chart',emptyTitle:'No data for these filters',emptyText:'Widen the date range or clear the warehouse, category or product filter.'});
      $('[data-export]',page).onclick=()=>exportCSV(R_.label,rep.columns.filter(c=>c.export!==false),t.rows());
      $('[data-print]',page).onclick=doPrint;
    }};
};

/* =========================================================
   AUDIT LOG
   ========================================================= */
ROUTES.audit=(p,q)=>({title:'Audit Log',crumbs:[['Inventory','inventory'],['Audit Log']],sub:'Every create, update and delete across inventory, with before and after values. Entries are retained for 7 years.',
  body:'<section class="card" id="auT"></section>',
  mount(page){mountTable(page,'#auT',{title:'Audit log',pageSize:25,q:q.q||'',columns:[
    {key:'date',label:'Date & Time',render:a=>'<span class="nowrap">'+fmtDT(a.date)+'</span>',exportValue:a=>fmtDT(a.date)},{key:'user',label:'User',render:a=>userCell(a.user)},{key:'module',label:'Module'},{key:'action',label:'Action',render:a=>badge(a.action)},
    {key:'record',label:'Record',render:a=>'<span class="mono">'+esc(a.record)+'</span>'},{key:'oldV',label:'Old Value',nowrap:false,render:a=>a.oldV==='—'?'<span class="subtle">—</span>':'<span class="change"><del>'+esc(a.oldV)+'</del></span>'},{key:'newV',label:'New Value',nowrap:false,render:a=>a.newV==='—'?'<span class="subtle">—</span>':'<span class="change"><ins>'+esc(a.newV)+'</ins></span>'},{key:'ip',label:'IP Address',render:a=>'<span class="mono muted">'+esc(a.ip)+'</span>'}],
    data:()=>audit,rowId:a=>a.id,
    filters:[{key:'m',label:'All modules',options:[...new Set(audit.map(a=>a.module))].sort(),test:(a,v)=>a.module===v},{key:'a',label:'All actions',options:['Created','Updated','Deleted','Login','Logout'],test:(a,v)=>a.action===v},{key:'u',label:'All users',value:q.user||'',options:[...new Set(audit.map(a=>a.user))].sort(),test:(a,v)=>a.user===v},{key:'d',label:'Any time',options:[['1','Today'],['7','Last 7 days'],['30','Last 30 days']],test:(a,v)=>daysBetween(a.date,NOW())<+v}],
    emptyTitle:'No audit entries',emptyText:'Changes to inventory records are recorded here.'})}});
TONE.Logout='neutral';

/* =========================================================
   PURCHASING & SALES
   ========================================================= */
const poQty=po=>sum(po.items,i=>i.qty),poRec=po=>sum(po.items,i=>i.received);
function poDrawer(po){openDrawer({title:po.no,icon:'cart',subtitle:esc(po.supplier)+' · '+badge(po.status),body:'<dl class="dl mb-16"><dt>Order date</dt><dd>'+fmtD(po.date)+'</dd><dt>Expected</dt><dd>'+fmtD(po.expected)+'</dd><dt>Deliver to</dt><dd>'+esc(W_BY(po.warehouseId).name)+'</dd><dt>Terms</dt><dd>'+esc(po.terms||'Net 30')+'</dd><dt>Buyer</dt><dd>'+esc(po.createdBy)+'</dd></dl><div class="table-wrap auto" style="border:1px solid var(--border);border-radius:var(--r-md)"><table class="tbl compact"><thead><tr><th>Product</th><th class="right">Ordered</th><th class="right">Received</th><th class="right">Value</th></tr></thead><tbody>'+po.items.map(i=>'<tr><td>'+esc((P_BY(i.productId)||{name:'Deleted'}).name)+'</td><td class="right num">'+fmtN(i.qty)+'</td><td class="right num">'+fmtN(i.received)+'</td><td class="right num">'+fmtM(i.qty*i.cost,0)+'</td></tr>').join('')+'</tbody></table></div><h3 class="card-title mt-24 mb-16">Receipts</h3>'+(grns.filter(g=>g.poNo===po.no).map(g=>'<a class="row between" style="padding:8px 0;border-bottom:1px solid var(--border)" href="#/grn-view/'+g.id+'"><span class="mono link">'+esc(g.no)+'</span><span class="muted">'+fmtD(g.date)+'</span>'+badge(g.status)+'</a>').join('')||'<p class="muted">No goods receipts yet.</p>'),
  actions:[{label:'Close'}].concat(po.status==='Open'||po.status==='Partially Received'?[{label:'Receive goods',variant:'primary',icon:'receive',onClick:()=>navigate('grn-create?po='+po.id)}]:[])})}
ROUTES.purchasing=(p,q)=>({title:'Purchase Orders',nav:'purchasing',crumbs:[['Purchasing','purchasing'],['Purchase Orders']],sub:'Orders placed with suppliers. Receive goods against an open order to create a GRN.',
  actions:btn('Create Purchase Order','plus','primary','data-new'),
  body:'<div class="kpis mb-16">'+kpi('Open orders',purchaseOrders.filter(x=>x.status==='Open').length,'cart','primary',fmtM(sum(purchaseOrders.filter(x=>x.status==='Open'),po=>sum(po.items,i=>i.qty*i.cost)),0)+' committed')+kpi('Partially received',purchaseOrders.filter(x=>x.status==='Partially Received').length,'receive','warning','Balance still due')+kpi('Due this week',purchaseOrders.filter(x=>x.status==='Open'&&daysBetween(NOW(),x.expected)<=7).length,'calendar','purple','Expected within 7 days')+kpi('Received',purchaseOrders.filter(x=>x.status==='Received').length,'checkCircle','success','Fully received orders')+'</div><section class="card" id="poT"></section>',
  mount(page){const t=mountTable(page,'#poT',{title:'Purchase orders',sort:'date',dir:-1,q:q.q||'',columns:[
    {key:'no',label:'PO Number',render:x=>'<a class="link mono" data-po="'+x.id+'">'+esc(x.no)+'</a>'},{key:'date',label:'Order Date',render:x=>fmtD(x.date)},{key:'supplier',label:'Supplier'},{key:'wh',label:'Deliver To',value:x=>W_BY(x.warehouseId).code,render:x=>'<span class="chip">'+esc(W_BY(x.warehouseId).code)+'</span>'},
    {key:'items',label:'Items',align:'right',value:x=>x.items.length},{key:'qty',label:'Ordered',align:'right',value:poQty,render:x=>fmtN(poQty(x))},{key:'rec',label:'Received',value:x=>poRec(x)/poQty(x),render:x=>utilHTML(Math.round(poRec(x)/poQty(x)*100))},{key:'val',label:'Value',align:'right',value:x=>sum(x.items,i=>i.qty*i.cost),render:x=>fmtM(sum(x.items,i=>i.qty*i.cost),0)},{key:'expected',label:'Expected',render:x=>fmtD(x.expected)},{key:'status',label:'Status',render:x=>badge(x.status)}],data:()=>purchaseOrders,onRowClick:poDrawer,
    filters:[{key:'s',label:'Any status',options:['Open','Partially Received','Received','Cancelled'],test:(x,v)=>x.status===v},{key:'sp',label:'All suppliers',options:[...new Set(purchaseOrders.map(x=>x.supplier))].sort(),test:(x,v)=>x.supplier===v}],
    actions:x=>[{label:'View',icon:'eye',onClick:()=>poDrawer(x)},{label:'Receive goods',icon:'receive',disabled:!(x.status==='Open'||x.status==='Partially Received'),onClick:()=>navigate('grn-create?po='+x.id)},'-',{label:'Cancel order',icon:'x',danger:true,disabled:x.status!=='Open',onClick:()=>confirmDialog({danger:true,title:'Cancel '+x.no+'?',message:'The supplier order is closed and no goods can be received against it.',confirm:'Cancel order',cancel:'Keep order'}).then(ok=>{if(ok){x.status='Cancelled';logAudit('Purchasing','Updated',x.no,'Status: Open','Status: Cancelled');toast('info','Order cancelled',x.no+' closed.');t.refresh()}})}]});
  page.addEventListener('click',e=>{const a=e.target.closest('[data-po]');if(a){e.preventDefault();poDrawer(purchaseOrders.find(x=>x.id===a.dataset.po))}});
  $('[data-new]',page).onclick=()=>{const b=el('<form novalidate><div class="form-grid">'+F({name:'pid',label:'Product',type:'select',req:true,span:12,options:prodOptions(products.filter(x=>x.status==='Active'))})+'</div><p class="hint mt-16">Supplier, quantity and price are proposed on the next step.</p></form>');openModal({type:'create',title:'Create purchase order',subtitle:'Choose the product to order',body:b,actions:[{label:'Cancel'},{label:'Continue',variant:'primary',onClick:()=>{if(!validateForm(b))return false;const pid=formData(b).pid;setTimeout(()=>raisePO(P_BY(pid)),0)}}]})}}});
TONE.Cancelled='neutral';
function soDrawer(so){openDrawer({title:so.no,icon:'trending',subtitle:esc(so.customer)+' · '+badge(so.status),body:'<dl class="dl mb-16"><dt>Order date</dt><dd>'+fmtD(so.date)+'</dd><dt>Ship from</dt><dd>'+esc(W_BY(so.warehouseId).name)+'</dd><dt>Sales rep</dt><dd>'+esc(so.createdBy)+'</dd></dl><div class="table-wrap auto" style="border:1px solid var(--border);border-radius:var(--r-md)"><table class="tbl compact"><thead><tr><th>Product</th><th class="right">Qty</th><th class="right">Price</th><th class="right">Amount</th></tr></thead><tbody>'+so.items.map(i=>'<tr><td>'+esc((P_BY(i.productId)||{name:'Deleted'}).name)+'</td><td class="right num">'+fmtN(i.qty)+'</td><td class="right num">'+fmtM(i.price)+'</td><td class="right num">'+fmtM(i.qty*i.price)+'</td></tr>').join('')+'</tbody></table></div>',actions:[{label:'Close'}]})}
function shipSO(so,after){const short=so.items.filter(i=>i.qty>whQty(i.productId,so.warehouseId));if(short.length){messageModal('error','Not enough stock to ship','<p>'+short.map(i=>esc(P_BY(i.productId).name)+' needs '+fmtN(i.qty)+', on hand '+fmtN(whQty(i.productId,so.warehouseId))).join('<br>')+'</p>');return}
  confirmDialog({title:'Ship '+so.no+'?',message:'Reserved stock is released and '+fmtN(sum(so.items,i=>i.qty))+' units are deducted from '+esc(W_BY(so.warehouseId).name)+'.',confirm:'Ship order'}).then(ok=>{if(!ok)return;so.items.forEach(i=>{const r=stockRow(i.productId,so.warehouseId);r.reserved=Math.max(0,r.reserved-i.qty);postMovement({type:'Sales',pid:i.productId,wid:so.warehouseId,outQty:i.qty,txNo:so.no,ref:so.customer,bucket:'issued'})});so.status='Shipped';logAudit('Sales','Updated',so.no,'Status: Open','Status: Shipped');toast('success','Order shipped',so.no+' to '+so.customer+'. Stock deducted.');after()})}
ROUTES.sales=()=>({title:'Sales Orders',nav:'sales',crumbs:[['Sales','sales'],['Sales Orders']],sub:'Customer orders. Open orders reserve stock; shipping deducts it through the ledger.',
  actions:btn('Create Sales Order','plus','primary','data-new'),
  body:'<div class="kpis mb-16">'+kpi('Open orders',salesOrders.filter(x=>x.status==='Open').length,'clock','warning',fmtN(sum(salesOrders.filter(x=>x.status==='Open'),s=>sum(s.items,i=>i.qty)))+' units reserved')+kpi('Shipped last 30 days',salesOrders.filter(x=>x.status==='Shipped'&&daysBetween(x.date,NOW())<=30).length,'truck','success',fmtM(sum(salesOrders.filter(x=>x.status==='Shipped'&&daysBetween(x.date,NOW())<=30),s=>sum(s.items,i=>i.qty*i.price)),0)+' revenue')+kpi('Customers',new Set(salesOrders.map(s=>s.customer)).size,'user','primary','Active accounts')+kpi('Average order',fmtM(sum(salesOrders,s=>sum(s.items,i=>i.qty*i.price))/Math.max(1,salesOrders.length),0),'dollar','purple','All orders since go-live')+'</div><section class="card" id="soT"></section>',
  mount(page){const t=mountTable(page,'#soT',{title:'Sales orders',sort:'date',dir:-1,columns:[
    {key:'no',label:'SO Number',render:x=>'<a class="link mono" data-so="'+x.id+'">'+esc(x.no)+'</a>'},{key:'date',label:'Order Date',render:x=>fmtD(x.date)},{key:'customer',label:'Customer'},{key:'wh',label:'Ship From',value:x=>W_BY(x.warehouseId).code,render:x=>'<span class="chip">'+esc(W_BY(x.warehouseId).code)+'</span>'},{key:'items',label:'Items',align:'right',value:x=>x.items.length},{key:'qty',label:'Quantity',align:'right',value:x=>sum(x.items,i=>i.qty)},{key:'val',label:'Amount',align:'right',value:x=>sum(x.items,i=>i.qty*i.price),render:x=>fmtM(sum(x.items,i=>i.qty*i.price))},{key:'status',label:'Status',render:x=>badge(x.status)}],data:()=>salesOrders,onRowClick:soDrawer,
    filters:[{key:'s',label:'Any status',options:['Open','Shipped','Cancelled'],test:(x,v)=>x.status===v},{key:'c',label:'All customers',options:CUSTOMERS,test:(x,v)=>x.customer===v}],
    actions:x=>[{label:'View',icon:'eye',onClick:()=>soDrawer(x)},{label:'Ship order',icon:'truck',disabled:x.status!=='Open',onClick:()=>shipSO(x,()=>t.refresh())},'-',{label:'Cancel order',icon:'x',danger:true,disabled:x.status!=='Open',onClick:()=>confirmDialog({danger:true,title:'Cancel '+x.no+'?',message:'Reserved stock is released back to available.',confirm:'Cancel order',cancel:'Keep order'}).then(ok=>{if(!ok)return;x.items.forEach(i=>{const r=stockRow(i.productId,x.warehouseId);if(r)r.reserved=Math.max(0,r.reserved-i.qty)});x.status='Cancelled';logAudit('Sales','Updated',x.no,'Status: Open','Status: Cancelled');toast('info','Order cancelled','Reserved stock released.');t.refresh()})}]});
  page.addEventListener('click',e=>{const a=e.target.closest('[data-so]');if(a){e.preventDefault();soDrawer(salesOrders.find(x=>x.id===a.dataset.so))}});
  $('[data-new]',page).onclick=()=>{const b=el('<form novalidate><div class="form-grid">'+F({name:'customer',label:'Customer',type:'select',req:true,span:6,options:CUSTOMERS})+F({name:'wid',label:'Ship from',type:'select',req:true,span:6,value:'W1',placeholder:false,options:whOptions()})+F({name:'pid',label:'Product',type:'select',req:true,span:8,options:prodOptions(products.filter(x=>x.status==='Active'))})+F({name:'qty',label:'Quantity',type:'number',req:true,min:1,span:4})+'</div><p class="hint mt-16" id="soAvail">Select a product to see available stock.</p></form>');
    const upd=()=>{const d=formData(b);$('#soAvail',b).textContent=d.pid?fmtN(whAvail(d.pid,d.wid))+' '+P_BY(d.pid).uom+' available at '+W_BY(d.wid).code+' · unit price '+fmtM(P_BY(d.pid).price):'Select a product to see available stock.'};b.addEventListener('change',upd);
    openModal({type:'create',title:'Create sales order',subtitle:'Stock is reserved when the order is saved',body:b,actions:[{label:'Cancel'},{label:'Create order',variant:'primary',onClick:()=>{if(!validateForm(b,err=>{const d=formData(b);if(d.pid&&d.qty>whAvail(d.pid,d.wid))err('qty','Only '+fmtN(whAvail(d.pid,d.wid))+' available at this warehouse')}))return false;const d=formData(b);const p=P_BY(d.pid);
      const so={id:uid('SO'),no:nextNo('SO'),date:NOW(),customer:d.customer,warehouseId:d.wid,status:'Open',items:[{productId:p.id,qty:d.qty,price:p.price}],createdBy:CURRENT_USER.name};salesOrders.unshift(so);stockRow(p.id,d.wid).reserved+=d.qty;logAudit('Sales','Created',so.no,'—','Reserved '+d.qty+' × '+p.sku);toast('success','Sales order created',so.no+' reserves '+fmtN(d.qty)+' '+p.uom+'.');t.refresh()}}]})}}});

ROUTES.profile=()=>{
  const mine=audit.filter(a=>a.user===CURRENT_USER.name).slice(0,8);
  return{title:'My Profile',nav:'',crumbs:[['My Profile']],sub:'Your account details and recent activity.',
    body:'<div class="grid g-main"><form class="card" id="prof" novalidate><div class="form-section"><div class="row" style="gap:16px;margin-bottom:20px"><span class="avatar lg">AM</span><div><h2 style="font-size:18px;font-weight:650">'+esc(CURRENT_USER.name)+'</h2><p class="muted">'+esc(CURRENT_USER.role)+' · '+esc(CURRENT_USER.dept)+'</p></div></div><div class="form-grid">'+F({name:'name',label:'Full name',span:6,value:CURRENT_USER.name,readonly:true,hint:'Managed by your administrator'})+F({name:'email',label:'Email',type:'email',req:true,span:6,value:CURRENT_USER.email})+F({name:'phone',label:'Phone',req:true,span:6,value:CURRENT_USER.phone,pattern:'^[+0-9 ()-]{7,20}$',patternMsg:'Enter a valid phone number'})+F({name:'location',label:'Home warehouse',type:'select',span:6,value:CURRENT_USER.location,placeholder:false,options:activeWh().map(w=>w.name)})+'</div></div><div class="form-actions"><span class="spacer"></span>'+btn('Save profile','save','primary','type="submit"')+'</div></form>'+
      card('Recent activity',auditTimeline(mine),{sub:'Your latest changes',actions:'<a class="btn btn-sm btn-ghost" href="#/audit?user=Alex%20Morgan">All activity</a>'})+'</div>',
    mount(page){const f=$('#prof',page);f.addEventListener('submit',e=>{e.preventDefault();if(!validateForm(f))return;const d=formData(f);['email','phone','location'].forEach(k=>{if(CURRENT_USER[k]!==d[k]){logAudit('Security','Updated','Profile '+k,CURRENT_USER[k],d[k]);CURRENT_USER[k]=d[k]}});toast('success','Profile saved','Your contact details are updated.')})}};
};

/* =========================================================
   REGISTER WITH THE DESIGN SYSTEM
   ========================================================= */
registerInventory({nav:INV_NAV,pages:INV_PAGES,routes:Object.keys(ROUTES).filter(k=>!ROUTES_BEFORE.has(k)),
  notifications,quickCreate:quickCreateItems,search:searchInventory,sidebarFoot,logAudit});
})();
