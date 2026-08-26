const CACHE="jiu-v4";
const ASSETS=["index.html","styles.css","app.js","manifest.webmanifest","icon.svg"];
const isLocal = self.location.hostname==="localhost"||self.location.hostname==="127.0.0.1";
self.addEventListener("install",e=>{ self.skipWaiting(); if(!isLocal){ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{})).catch(()=>{})); } });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  if(isLocal) return; // 本地预览：不走缓存，直接取磁盘最新文件，保证双写实时生效
  e.respondWith(
    fetch(e.request).then(res=>{ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); return res; })
      .catch(()=> caches.match(e.request).then(m=> m||caches.match("index.html")))
  );
});
