const CACHE_NAME='quicknova-v1';
const CORE=['/','/index.html','/css/theme.css','/css/base.css','/css/layout.css','/css/components.css','/js/tools-data.js','/js/utils.js','/js/main.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))))});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET' || new URL(req.url).origin!==location.origin){return}
  e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(req,copy));return res})))});
