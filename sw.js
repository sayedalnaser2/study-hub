/* Study Hub service worker: keeps the app shell and the PDF viewer libraries so the site opens fast and works offline.
   Opened PDFs are stored by the page itself in the "sh-pdf" cache; this worker never touches them or any API traffic. */
var SHELL="sh-shell-v6",RT="sh-rt-v1",KEEP=[SHELL,RT,"sh-pdf"];
var FILES=["./","index.html","admin.js?v=13","manifest.webmanifest","icon.svg"];
var CDN=/^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(SHELL).then(function(c){return Promise.all(FILES.map(function(f){return c.add(f).catch(function(){})}))}).then(function(){return self.skipWaiting()}))
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return KEEP.indexOf(k)<0}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))
});
function netFirst(req,key){
  return new Promise(function(ok){
    var done=false;
    var fall=function(){return caches.match(key||req,{ignoreSearch:false}).then(function(r){return r||caches.match("index.html")})};
    var t=setTimeout(function(){if(done)return;fall().then(function(r){if(r&&!done){done=true;ok(r)}})},4000);
    fetch(req).then(function(r){
      if(done)return;done=true;clearTimeout(t);
      if(r&&r.ok){var cp=r.clone();caches.open(SHELL).then(function(c){c.put(key||req,cp)})}
      ok(r)
    },function(){if(done)return;done=true;clearTimeout(t);fall().then(function(r){ok(r||Response.error())})})
  })
}
self.addEventListener("fetch",function(e){
  var req=e.request;if(req.method!=="GET")return;
  var u=new URL(req.url);
  if(u.origin===location.origin){
    if(req.mode==="navigate"||/\/(index\.html)?$/.test(u.pathname)){e.respondWith(netFirst(req,"index.html"));return}
    e.respondWith(caches.open(SHELL).then(function(c){return c.match(req).then(function(hit){
      var net=fetch(req).then(function(r){if(r&&r.ok)c.put(req,r.clone());return r}).catch(function(){return hit});
      return hit||net})}));
    return
  }
  if(CDN.test(req.url)){
    e.respondWith(caches.open(RT).then(function(c){return c.match(req).then(function(hit){
      if(hit)return hit;
      return fetch(req).then(function(r){if(r&&(r.ok||r.type==="opaque"))c.put(req,r.clone());return r})})}))
  }
});
