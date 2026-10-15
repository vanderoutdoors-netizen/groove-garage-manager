const CACHE='gg-manager-4b06292ebb';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
// Only the app's own files are cached. Calls to Google (sales, inventory) always go to the network.
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(e.request.method!=='GET'||url.origin!==self.location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(c=>c.match(e.request,{ignoreSearch:true}).then(hit=>{
      const net=fetch(e.request).then(res=>{ if(res&&res.ok) c.put(e.request,res.clone()); return res; }).catch(()=>hit);
      return hit||net;
    }))
  );
});
