const C='mimercado-v8';const A=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))))});
// ===== Avisos de quincena (sin servidor) =====
const idbGet=()=>new Promise(ok=>{const r=indexedDB.open('mimercado',2);r.onupgradeneeded=()=>{const d=r.result;for(const n of ['snaps','files','meta'])if(!d.objectStoreNames.contains(n))d.createObjectStore(n,{keyPath:'id'})};
  r.onsuccess=()=>{const t=r.result.transaction('meta','readwrite'),o=t.objectStore('meta'),q=o.get('state');q.onsuccess=()=>ok({m:q.result,o,t})};r.onerror=()=>ok({})});
const ymd=d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
function qKey(d,pd){pd=(pd||[15,30]).slice().sort((a,b)=>a-b);const [y,m]=d.split('-').map(Number),mk=(yy,mm,dd)=>`${yy}-${String(mm).padStart(2,'0')}-${String(Math.min(dd,new Date(yy,mm,0).getDate())).padStart(2,'0')}`;
  const c=[...pd.map(x=>mk(y,m,x)),...pd.map(x=>m===1?mk(y-1,12,x):mk(y,m-1,x))].filter(x=>x<=d).sort();return c[c.length-1]}
async function check(){const {m,o}=await idbGet();if(!m||m.trip)return;const td=ymd(new Date()),qk=qKey(td,m.paydays),n=m.notified||{};
  if(m.plan&&m.plan.date===td&&!n['plan'+td]){n['plan'+td]=1;await self.registration.showNotification('🛒 Hoy es día de mercado',{body:'Abre Mi Mercado para iniciar tu lista.',icon:'icon-192.png',tag:'plan',data:{ask:'si'}})}
  else if(!m.plan&&!(m.asked||{})[qk]&&!((m.lastTrip||'')>=qk)&&!n[qk]&&(new Date(td)-new Date(qk))/864e5<=6){n[qk]=1;
    await self.registration.showNotification('🗓️ Nueva quincena',{body:'¿Vas a mercar?',icon:'icon-192.png',tag:'q'+qk,data:{},actions:[{action:'si',title:'Sí'},{action:'agendar',title:'Agendar'},{action:'no',title:'No'}]})}
  m.notified=n;try{const r2=await idbGet();r2.o&&r2.o.put(m)}catch(e){}}
self.addEventListener('periodicsync',e=>{if(e.tag==='mercado-check')e.waitUntil(check())});
self.addEventListener('notificationclick',e=>{e.notification.close();const a=e.action||(e.notification.data&&e.notification.data.ask)||'';
  e.waitUntil(clients.matchAll({type:'window'}).then(ws=>{const u='./'+(a?'?ask='+a:'');for(const w of ws)if('navigate' in w)return w.navigate(u).then(c=>c&&c.focus());return clients.openWindow(u)}))});
