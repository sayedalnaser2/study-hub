(function(){
var sb=window.__sb;if(!sb)return;
var A={rev:null,revF:"todo",ok:false,role:null,tab:"overview",stats:null,stor:null,time:null,files:null,ratings:null,users:null,reports:null,admins:null,site:null,names:{},err:"",q:"",busy:false,me:null,ccRows:[],sub:{uni:"",college:"",major:"",year:""},msg:""};
window.__adm=A;
var ZIPURL="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",FREE=1073741824,KINDS=["Notes","Slides","Past paper","Summary","Worksheet","Other"];
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function nf(n){return Number(n||0).toLocaleString("en-US")}
function mb(b){b=+b||0;return b<1048576?Math.max(0,Math.round(b/1024))+" KB":b<1073741824?(b/1048576).toFixed(b<10485760?1:0)+" MB":(b/1073741824).toFixed(2)+" GB"}
function dt(t){try{return new Date(t).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}catch(e){return""}}
function dtt(t){try{return new Date(t).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}catch(e){return""}}
function nm(id){return A.names[id]||"Unknown"}
function refresh(){if(window.__sh&&document.querySelector("#adm"))window.__sh.render()}
function U(){return(window.__sh&&window.__sh.UNIS)||[]}
function isR2(p){return String(p||"").indexOf("r2:")===0}
async function r2(b){var r=await sb.functions.invoke("r2",{body:b});if(r.error||!r.data||r.data.error)throw new Error((r.data&&r.data.error)||(r.error&&r.error.message)||"R2 error");return r.data}
async function fileUrl(p){return isR2(p)?(await r2({action:"sign-download",id:p})).url:sb.storage.from("files").getPublicUrl(p).data.publicUrl}
async function rmStore(paths){var a=paths.filter(function(p){return !isR2(p)}),b=paths.filter(isR2);if(a.length){var s=await sb.storage.from("files").remove(a);if(s.error)throw s.error}for(var i=0;i<b.length;i++)await r2({action:"delete",id:b[i]})}
function uniOf(id){return U().filter(function(x){return x.id===id})[0]}
function collegeOf(u,major){var x=uniOf(u),r="";if(x)x.groups.forEach(function(g){if(g.m.indexOf(major)>-1)r=g.g});return r}
function lg(){return document.documentElement.lang==="ar"?"ar":"en"}
var sid;try{sid=localStorage.getItem("sh_sid");if(!sid){sid=(crypto.randomUUID?crypto.randomUUID():String(Math.random()).slice(2)+Date.now()).replace(/-/g,"").slice(0,32);localStorage.setItem("sh_sid",sid)}}catch(e){sid=String(Math.random()).slice(2)+Date.now()}
var uid=null;
sb.auth.getSession().then(function(r){uid=r.data&&r.data.session&&r.data.session.user.id||null}).catch(function(){});
function env(){var tz="",src="direct",dev="computer";try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||""}catch(e){}try{if(document.referrer){var h=new URL(document.referrer).hostname;if(h&&h!==location.hostname)src=h.replace(/^www\./,"")}}catch(e){}try{if(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)||window.matchMedia("(max-width:820px)").matches)dev="phone"}catch(e){}return{tz:tz.slice(0,60),src:src.slice(0,80),dev:dev,lang:lg()}}
function log(kind,ref){if(A.ok)return;try{var e=env();sb.from("page_views").insert({sid:sid,uid:uid,kind:kind,ref:String(ref).slice(0,200),dev:e.dev,lang:e.lang,tz:e.tz,src:e.src}).then(function(){},function(){})}catch(x){}}
var last="";function page(p){if(p&&p!==last){last=p;log("page",p)}}
var h0=(location.hash||"").slice(1);setTimeout(function(){page(h0&&h0!=="admin"?h0:"home")},900);
var rs=history.replaceState;history.replaceState=function(a,b,u){var r=rs.apply(this,arguments);try{var p=String(u||"").replace(/^#/,"");if(p)page(p)}catch(e){}return r};
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest('a[href^="/_blob/"]');if(a)log("open",decodeURIComponent(a.getAttribute("href").slice(7)))},true);
var tAcc={},tKey="",lastAct=Date.now(),lastTick=Date.now();
function tctx(){var S=window.__sh&&window.__sh.S;if(!S)return null;var f=S.filter||{},p=S.page||"home",sub=p==="library"&&f.subject?f.subject:"";return{page:p,uni:sub?(f.uni||""):"",major:sub?(f.major||""):"",year:sub?(f.year||""):"",subject:sub}}
function tsend(a){
var s=Math.round(a.s);if(s<1||A.ok)return;var c=a.c,e=env();
for(;s>0;s-=120){try{sb.rpc("log_time",{p_sid:sid,p_secs:Math.min(s,120),p_page:c.page,p_uni:c.uni||null,p_major:c.major||null,p_year:c.year||null,p_subject:c.subject||null,p_dev:e.dev}).then(function(){},function(){})}catch(x){}}
}
function tflush(all){Object.keys(tAcc).forEach(function(k){var a=tAcc[k];if(all||a.s>=30){delete tAcc[k];tsend(a)}})}
["mousemove","keydown","scroll","click","touchstart","wheel"].forEach(function(n){window.addEventListener(n,function(){lastAct=Date.now()},{passive:true,capture:true})});
setInterval(function(){
var now=Date.now(),dt=Math.min((now-lastTick)/1000,8);lastTick=now;
var c=tctx();if(!c)return;var k=JSON.stringify(c);
if(tKey&&k!==tKey&&tAcc[tKey]){var o=tAcc[tKey];delete tAcc[tKey];tsend(o)}
tKey=k;
if(document.visibilityState==="visible"&&now-lastAct<60000){(tAcc[k]=tAcc[k]||{c:c,s:0}).s+=dt}
tflush(false)
},5000);
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")tflush(true)});
window.addEventListener("pagehide",function(){tflush(true)});
var ann=null;
function paintBanner(){
var b=document.getElementById("sh-banner");
var on=ann&&ann.on&&(ann.text||ann.text_ar)&&(!ann.until||new Date(ann.until+"T23:59:59")>=new Date());
var txt=on?(lg()==="ar"&&ann.text_ar?ann.text_ar:(ann.text||ann.text_ar)):"";
try{if(on&&localStorage.getItem("sh_ann")===txt)on=false}catch(e){}
if(!on){if(b)b.remove();return}
if(!b){b=document.createElement("div");b.id="sh-banner";b.setAttribute("role","status");var h=document.querySelector("header.top");if(h)h.insertAdjacentElement("afterend",b);else document.body.insertBefore(b,document.body.firstChild)}
b.innerHTML="<span></span><button type=\"button\" aria-label=\"Close\">×</button>";b.firstChild.textContent=txt;
b.lastChild.onclick=function(){try{localStorage.setItem("sh_ann",txt)}catch(e){}b.remove()}
}
async function loadAnn(){try{var r=await sb.from("site_settings").select("value").eq("key","announcement").maybeSingle();ann=r.data&&r.data.value||null}catch(e){}paintBanner()}
loadAnn();new MutationObserver(paintBanner).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
async function loadCC(){
try{var r=await sb.from("custom_courses").select("id,uni,major,year,subject").order("subject").limit(1000);if(r.error)return;
A.ccRows=r.data||[];var m={};A.ccRows.forEach(function(c){var k=c.uni+"|"+c.major;((m[k]=m[k]||{})[c.year]=m[k][c.year]||[]).push(c.subject)});
var same=JSON.stringify(m)===JSON.stringify(window.__cc||{});window.__cc=m;
if(!same&&window.__sh){var pg=(location.hash||"").slice(1);if(pg!=="upload"||!document.querySelector("#file")||!document.querySelector("#file").files.length)if(!document.activeElement||!/INPUT|TEXTAREA/.test(document.activeElement.tagName))window.__sh.render()}}catch(e){}
}
loadCC();
function dlg(o){
var d=document.getElementById("sh-dlg");if(!d){d=document.createElement("dialog");d.id="sh-dlg";document.body.appendChild(d)}
d.innerHTML='<form method="dialog"><h2>'+esc(o.title)+'</h2>'+(o.intro?'<p class="sh-intro">'+esc(o.intro)+'</p>':'')+'<div id="sh-dbody">'+o.html+'</div><div class="sh-msg" role="status"></div><div class="sh-act"><button class="btn primary" id="sh-ok">'+esc(o.ok||"Save")+'</button><button type="button" class="btn" id="sh-x">Cancel</button></div></form>';
var f=d.querySelector("form"),m=d.querySelector(".sh-msg");
d.querySelector("#sh-x").onclick=function(){d.close()};
f.onsubmit=async function(ev){ev.preventDefault();var b=d.querySelector("#sh-ok");b.disabled=true;m.textContent="One moment…";try{var r=await o.run(f,m);if(r!==false)d.close();else b.disabled=false}catch(e){m.textContent=(e&&e.message)||"Something went wrong";b.disabled=false}};
if(o.init)o.init(d.querySelector("#sh-dbody"));
d.showModal();return d
}
function opts(list,sel,ph){return(ph!==undefined?'<option value="">'+esc(ph)+'</option>':'')+list.map(function(x){return'<option value="'+esc(x[0])+'"'+(x[0]===sel?' selected':'')+'>'+esc(x[1])+'</option>'}).join("")}
function casc(host,st,noYear){
function draw(){
var u=uniOf(st.uni),g=u?u.groups.filter(function(x){return x.g===st.college})[0]:null;
host.innerHTML='<label>University<select data-c="uni">'+opts(U().map(function(x){return[x.id,x.name]}),st.uni,"Choose…")+'</select></label>'+
'<label>College / school<select data-c="college"'+(u?'':' disabled')+'>'+opts(u?u.groups.map(function(x){return[x.g,x.g]}):[],st.college,"Choose…")+'</select></label>'+
'<label>Major<select data-c="major"'+(g?'':' disabled')+'>'+opts(g?g.m.map(function(x){return[x,x]}):[],st.major,"Choose…")+'</select></label>'+
'<label>Year<select data-c="year"'+(st.major&&u?'':' disabled')+'>'+opts(u&&st.major?u.years.map(function(x){return[x,x]}):[],st.year,"Choose…")+'</select></label>'
}
host.onchange=function(e){var k=e.target.getAttribute("data-c");if(!k)return;st[k]=e.target.value;var o=["uni","college","major","year"];for(var i=o.indexOf(k)+1;i<4;i++)st[o[i]]="";draw();if(host.__cb)host.__cb()};
draw();return draw
}
document.addEventListener("click",function(e){
var a=e.target.closest&&e.target.closest("[data-rp],[data-rpr]");if(!a)return;e.preventDefault();e.stopPropagation();
var fid,ru=null,label;
if(a.hasAttribute("data-rp")){fid=a.getAttribute("data-rp");label="Report this file"}else{var p=a.getAttribute("data-rpr").split(":");fid=p[0];ru=p[1];label="Report this review"}
if(!uid){if(window.__shAuth)window.__shAuth();return}
dlg({title:label,ok:"Send report",html:'<label>Reason<select name="reason"><option>Wrong subject or major</option><option>Inappropriate content</option><option>Copyright problem</option><option>Spam or unrelated</option><option>Other</option></select></label><label>Details (optional)<textarea name="note" maxlength="500" rows="3"></textarea></label>',
run:async function(f){var r=await sb.from("reports").insert({kind:ru?"review":"file",file_id:fid,review_user:ru,reason:f.reason.value,note:f.note.value.trim().slice(0,500)||null});
if(r.error){if(r.error.code==="23505")throw new Error("You already reported this.");throw new Error("Could not send. Are you signed in?")}
a.textContent="Reported";a.disabled=true;setTimeout(function(){},0)}})
},true);
async function all(t,order,asc){var out=[],i=0;for(;;){var r=await sb.from(t).select("*").order(order,{ascending:!!asc}).range(i,i+999);if(r.error)throw r.error;out=out.concat(r.data);if(r.data.length<1000)break;i+=1000}return out}
async function loadTime(){var r=await sb.rpc("admin_time");if(r.error)throw r.error;A.time=r.data}
async function loadStats(){var r=await sb.rpc("admin_stats");if(r.error)throw r.error;try{var q=await sb.rpc("admin_storage");A.stor=q.error?null:q.data}catch(e){A.stor=null}A.stats=r.data}
async function loadNames(){var r=await sb.from("profiles").select("id,name").limit(1000);if(r.data)r.data.forEach(function(p){A.names[p.id]=p.name})}
async function loadFiles(){var r=await sb.from("files").select("id,title,uni,college,major,year,subject,kind,description,uploader_id,created_at,asset_path,size_bytes,file_name,featured,hidden,content_type").order("created_at",{ascending:false}).limit(1000);if(r.error)throw r.error;A.files=r.data}
async function loadRev(){var r=await sb.from("file_reviews").select("*");if(r.error)throw r.error;A.rev={};r.data.forEach(function(x){A.rev[x.file_id]=x})}
async function loadRatings(){var r=await sb.from("ratings").select("file_id,user_id,stars,text,at").order("at",{ascending:false}).limit(1000);if(r.error)throw r.error;A.ratings=r.data}
async function loadUsers(){var r=await sb.rpc("admin_users");if(r.error)throw r.error;A.users=r.data}
async function loadReports(){var r=await sb.from("reports").select("*").order("at",{ascending:false}).limit(300);if(r.error)throw r.error;A.reports=r.data}
async function loadAdmins(){var r=await sb.rpc("admin_list");if(r.error)throw r.error;A.admins=r.data}
async function loadSite(){var r=await sb.from("site_settings").select("value").eq("key","announcement").maybeSingle();A.site=r.data&&r.data.value||{text:"",text_ar:"",on:false,until:""}}
function ready(t){
return t==="overview"?!!A.stats:t==="activity"?!!(A.files&&A.ratings&&A.users&&A.reports):t==="files"?!!A.files:t==="pdfrev"?!!(A.files&&A.rev):t==="reviews"?!!(A.ratings&&A.files):t==="reports"?!!(A.reports&&A.files&&A.ratings):t==="users"?!!A.users:t==="cleanup"?!!(A.files&&A.stats):t==="site"?!!A.site:t==="time"?!!A.time:t==="admins"?!!A.admins:true
}
async function load(t){
A.err="";
try{var P=[loadNames()];
if(t==="overview")P.push(loadStats());
if(t==="time")P.push(loadTime());
if(t==="activity")P.push(loadFiles(),loadRatings(),loadUsers(),loadReports());
if(t==="files"||t==="cleanup"||t==="pdfrev")P.push(loadFiles());
if(t==="pdfrev")P.push(loadRev());
if(t==="cleanup")P.push(loadStats());
if(t==="reviews"||t==="reports")P.push(loadRatings(),loadFiles());
if(t==="reports")P.push(loadReports());
if(t==="users")P.push(loadUsers());
if(t==="site")P.push(loadSite());
if(t==="admins")P.push(loadAdmins());
if(t==="subjects")P.push(loadCC());
await Promise.all(P)
}catch(e){A.err=(e&&e.message)||"Could not load. Did you run supabase-admin2.sql?"}
if(t==="overview"||t==="activity"||t==="reports"){try{if(!A.reports)await loadReports()}catch(e){}}
refresh()
}
function chart(d){
if(!d||!d.length)return"";
var W=640,H=190,L=34,B=24,T=8,n=d.length,mx=1;d.forEach(function(x){if(x.views>mx)mx=x.views});
var step=mx<=4?1:mx<=10?2:mx<=50?10:mx<=200?50:100;mx=Math.ceil(mx/step)*step;
var bw=(W-L)/n,g='';
for(var y=0;y<=mx;y+=step){var yy=T+(H-T-B)*(1-y/mx);g+='<line x1="'+L+'" x2="'+W+'" y1="'+yy+'" y2="'+yy+'" stroke="var(--line)"/><text x="'+(L-6)+'" y="'+(yy+4)+'" text-anchor="end" font-size="11" fill="var(--muted)">'+y+'</text>'}
d.forEach(function(x,i){
var hv=(H-T-B)*x.views/mx,hu=(H-T-B)*x.visitors/mx,xx=L+i*bw+bw*.15,w=bw*.7;
g+='<g><title>'+esc(dt(x.day))+': '+x.views+' views, '+x.visitors+' visitors</title><rect x="'+xx+'" y="'+(H-B-hv)+'" width="'+w+'" height="'+hv+'" rx="2" fill="var(--accent)" opacity=".3"/><rect x="'+(xx+w*.2)+'" y="'+(H-B-hu)+'" width="'+w*.6+'" height="'+hu+'" rx="2" fill="var(--accent)"/></g>'
});
[0,Math.floor(n/2),n-1].forEach(function(i){g+='<text x="'+(L+i*bw+bw/2)+'" y="'+(H-6)+'" text-anchor="'+(i===0?"start":i===n-1?"end":"middle")+'" font-size="11" fill="var(--muted)">'+esc(new Date(d[i].day).toLocaleDateString("en-GB",{day:"numeric",month:"short"}))+'</text>'});
return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Views and visitors per day, last 30 days" style="width:100%;height:auto;display:block">'+g+'</svg>'
}
function bars(rows,lab,val){
if(!rows||!rows.length)return'<p class="adm-none">Nothing yet.</p>';
var m=1;rows.forEach(function(r){if(r[val]>m)m=r[val]});
return'<div class="adm-bars">'+rows.map(function(r){return'<div class="adm-b"><span class="adm-bl">'+esc(lab(r))+'</span><span class="adm-bt"><i style="width:'+Math.max(2,Math.round(100*r[val]/m))+'%"></i></span><b>'+nf(r[val])+'</b></div>'}).join("")+'</div>'
}
function kpi(l,v,s){return'<div class="adm-k"><span>'+esc(l)+'</span><b>'+esc(v)+'</b>'+(s?'<em>'+esc(s)+'</em>':'')+'</div>'}
function card(t,b,x){return'<section class="adm-card"><h2>'+esc(t)+'</h2>'+(x||"")+b+'</section>'}
function loading(){return'<p class="adm-none">Loading…</p>'}
function zone(z){return z?z.replace(/_/g," "):"Unknown"}
function overview(){
var s=A.stats;if(!s)return loading();
var pg={home:"Home",library:"Library",upload:"Upload",majors:"Majors",guidelines:"Guidelines"};
var lgn={en:"English",ar:"Arabic"};
var openRep=(A.reports||[]).filter(function(r){return r.status==="open"}).length;
return'<div class="adm-kpis">'+kpi("Page views",nf(s.views),nf(s.views_today)+" today · "+nf(s.views_7d)+" in 7 days")+kpi("Unique visitors",nf(s.visitors),nf(s.visitors_today)+" today · "+nf(s.visitors_7d)+" in 7 days")+kpi("File opens",nf(s.opens),"clicks on Open")+kpi("Files",nf(s.files),mb(s.storage_bytes)+" stored")+kpi("Users",nf(s.users),nf(s.banned)+" banned")+kpi("Reviews",nf(s.reviews),"")+kpi("Open reports",nf(openRep),openRep?"see the Reports tab":"all clear")+'</div>'+
card("Views per day, last 30 days",chart(s.daily),'<p class="adm-legend"><span><i style="opacity:.3"></i>Page views</span><span><i></i>Unique visitors</span><em>Days follow Bahrain time. Your own visits are not counted.</em></p>')+
'<div class="adm-2">'+card("Most visited pages",bars(s.pages,function(r){return pg[r.page]||r.page},"views"))+card("Most opened files",bars(s.top_files,function(r){return r.title+" ("+r.uni+")"},"opens"))+'</div>'+
'<div class="adm-2">'+card("Where visitors are (time zone)",bars(s.zones,function(r){return zone(r.zone)},"visitors"),'<p class="adm-note">Estimated from each visitor’s device time zone, not their exact location.</p>')+card("Devices",bars(s.devices,function(r){return r.dev==="phone"?"Phone":"Computer"},"visitors"))+'</div>'+
'<div class="adm-2">'+card("Site language",bars(s.langs,function(r){return lgn[r.lang]||r.lang||"Unknown"},"visitors"))+card("Where they came from",bars(s.sources,function(r){return r.src==="direct"?"Direct / typed link":r.src},"visitors"))+'</div>'+
card("Files per university",bars(s.by_uni,function(r){return r.uni},"files"))
}
function activity(){
if(!ready("activity"))return loading();
var ev=[],t={};A.files.forEach(function(f){t[f.id]=f.title;ev.push({at:f.created_at,txt:"<b>"+esc(nm(f.uploader_id))+"</b> uploaded “"+esc(f.title)+"”",sub:esc(f.uni)+" · "+esc(f.major)+" · "+esc(f.year),k:"Upload"})});
A.ratings.forEach(function(v){ev.push({at:v.at,txt:"<b>"+esc(nm(v.user_id))+"</b> gave "+v.stars+"★ to “"+esc(t[v.file_id]||"a file")+"”",sub:v.text?esc(v.text):"",k:"Review"})});
A.users.forEach(function(u){ev.push({at:u.created_at,txt:"<b>"+esc(u.name||"Someone")+"</b> joined",sub:esc(u.email||""),k:"New user"})});
A.reports.forEach(function(r){ev.push({at:r.at,txt:"<b>"+esc(nm(r.reporter))+"</b> reported a "+esc(r.kind)+": "+esc(r.reason),sub:esc(r.note||""),k:"Report"})});
ev.sort(function(a,b){return new Date(b.at)-new Date(a.at)});
return ev.slice(0,80).map(function(e){return'<div class="adm-row"><div><span class="adm-tag">'+e.k+'</span><span class="adm-tx">'+e.txt+'</span>'+(e.sub?'<span>'+e.sub+'</span>':'')+'</div><span class="adm-when">'+dtt(e.at)+'</span></div>'}).join("")||'<p class="adm-none">Nothing yet.</p>'
}
function filesTab(){
if(!A.files)return loading();
var q=A.q.trim().toLowerCase();
var r=A.files.filter(function(f){return !q||(f.title+" "+f.uni+" "+f.major+" "+(f.subject||"")+" "+nm(f.uploader_id)).toLowerCase().indexOf(q)>-1});
return'<div class="adm-tools"><input type="search" id="adm-q" placeholder="Search files, subjects or uploaders" value="'+esc(A.q)+'" aria-label="Search files"><span>'+r.length+' of '+A.files.length+'</span></div><div id="adm-list">'+fileRows(r)+'</div>'
}
function fileRows(r){
if(!r.length)return'<p class="adm-none">No files.</p>';
return r.map(function(f){return'<div class="adm-row"><div><b>'+esc(f.title)+(f.featured?' <span class="adm-me">FEATURED</span>':'')+(f.hidden?' <span class="adm-ban">HIDDEN</span>':'')+'</b><span>'+esc(f.uni)+' · '+esc(f.major)+' · '+esc(f.year)+(f.subject?' · '+esc(f.subject):'')+'</span><span>By '+esc(nm(f.uploader_id))+' · '+dt(f.created_at)+' · '+mb(f.size_bytes)+'</span></div><div class="adm-a"><a class="btn small" target="_blank" rel="noopener" href="/_blob/'+esc(f.asset_path)+'">Open</a><button class="btn small" data-adm-hd="'+esc(f.id)+'">'+(f.hidden?'Unhide':'Hide')+'</button><button class="btn small" data-adm-ft="'+esc(f.id)+'">'+(f.featured?'Unfeature':'Feature')+'</button><button class="btn small" data-adm-ed="'+esc(f.id)+'">Edit</button><button class="btn small danger" data-adm-df="'+esc(f.id)+'">Delete</button></div></div>'}).join("")
}
function isPdf(f){return /pdf/i.test(f.content_type||"")||/\.pdf$/i.test(f.asset_path||"")}
var RV={queued:["WAITING",""],ok:["LOOKS FINE","adm-me"],warn:["CHECK THIS","adm-ban"],bad:["PROBLEM","adm-ban"]};
function pdfRevTab(){
if(!A.files||!A.rev)return loading();
var pd=A.files.filter(isPdf),n={todo:0,queued:0,done:0,flag:0};
pd.forEach(function(f){var v=A.rev[f.id];if(!v)n.todo++;else if(v.status==="queued")n.queued++;else{n.done++;if(v.status!=="ok")n.flag++}});
var F=A.revF,list=pd.filter(function(f){var v=A.rev[f.id];return F==="all"||(F==="todo"&&!v)||(F==="queued"&&v&&v.status==="queued")||(F==="done"&&v&&v.status!=="queued")||(F==="flag"&&v&&(v.status==="warn"||v.status==="bad"))});
var rank=function(f){var v=A.rev[f.id];return !v?3:v.status==="queued"?0:v.status==="bad"?1:v.status==="warn"?2:4};
list.sort(function(a,b){return rank(a)-rank(b)||new Date(b.created_at)-new Date(a.created_at)});
var tabs=[["todo","Not reviewed ("+n.todo+")"],["queued","Waiting ("+n.queued+")"],["done","Reviewed ("+n.done+")"],["flag","Flagged ("+n.flag+")"],["all","All ("+pd.length+")"]];
var head='<p class="adm-note">Press <b>Add to queue</b> on the PDFs you want checked (or add every new one at once). Then tell Claude in the chat: <b>“review the queue”</b>. Claude opens each waiting PDF, checks it for private information, copied or paid material and whether it matches its subject and grade, then writes what it is and what it thinks. Results appear here and only you can see them.</p>'+
'<div class="adm-tools"><div class="seg" role="group" aria-label="Filter">'+tabs.map(function(x){return'<button data-adm-rvf="'+x[0]+'" aria-pressed="'+(F===x[0])+'"><b>'+x[1]+'</b></button>'}).join("")+'</div>'+(n.todo?'<button class="btn small primary" data-adm-rq="all">Add all '+n.todo+' new PDF'+(n.todo>1?'s':'')+' to the queue</button>':'')+'</div>';
return head+(list.length?list.map(function(f){var v=A.rev[f.id],s=v&&RV[v.status];
return'<div class="adm-row"><div><b>'+esc(f.title)+(s?' <span class="'+(s[1]||"adm-tag")+'">'+s[0]+'</span>':'')+'</b><span>'+esc(f.uni)+' · '+esc(f.major)+' · '+esc(f.year)+(f.subject?' · '+esc(f.subject):'')+'</span><span>By '+esc(nm(f.uploader_id))+' · '+dt(f.created_at)+' · '+mb(f.size_bytes)+(f.hidden?' · hidden':'')+'</span>'+
(v&&v.status!=="queued"?(v.flags?'<span><b>Flags:</b> '+esc(v.flags)+'</span>':'<span><b>Flags:</b> none</span>')+(v.matches?'<span><b>Matches its subject and grade:</b> '+esc(v.matches)+'</span>':'')+(v.summary?'<p>'+esc(v.summary)+'</p>':'')+'<span>Reviewed '+dtt(v.reviewed_at)+'</span>':'')+'</div>'+
'<div class="adm-a"><a class="btn small" target="_blank" rel="noopener" href="/_blob/'+esc(f.asset_path)+'">Open</a>'+(v&&v.status==="queued"?'<button class="btn small" data-adm-rq="-'+esc(f.id)+'">Remove from queue</button>':'<button class="btn small" data-adm-rq="'+esc(f.id)+'">'+(v?'Review again':'Add to queue')+'</button>')+(v&&(v.status==="warn"||v.status==="bad")?'<button class="btn small" data-adm-hd="'+esc(f.id)+'">'+(f.hidden?'Unhide':'Hide')+'</button>':'')+'</div></div>'}).join(""):'<p class="adm-none">Nothing here.</p>')
}
async function rq(k){
var rows,r;
if(k==="all"){rows=A.files.filter(function(f){return isPdf(f)&&!A.rev[f.id]}).map(function(f){return{file_id:f.id,status:"queued",requested_at:new Date().toISOString()}})}
else if(k.charAt(0)==="-"){r=await sb.from("file_reviews").delete().eq("file_id",k.slice(1));if(r.error)throw r.error;delete A.rev[k.slice(1)];refresh();return}
else rows=[{file_id:k,status:"queued",requested_at:new Date().toISOString()}];
if(!rows.length)return;
r=await sb.from("file_reviews").upsert(rows,{onConflict:"file_id"});if(r.error)throw r.error;
await loadRev();refresh()
}
function reviewsTab(){
if(!ready("reviews"))return loading();
var t={};A.files.forEach(function(f){t[f.id]=f.title});
if(!A.ratings.length)return'<p class="adm-none">No reviews yet.</p>';
return A.ratings.map(function(v){return'<div class="adm-row"><div><b>'+"★".repeat(v.stars)+"☆".repeat(5-v.stars)+' · '+esc(nm(v.user_id))+'</b><span>On “'+esc(t[v.file_id]||"deleted file")+'” · '+dt(v.at)+'</span>'+(v.text?'<p>'+esc(v.text)+'</p>':'')+'</div><div class="adm-a"><button class="btn small danger" data-adm-dr="'+esc(v.file_id+"|"+v.user_id)+'">Delete</button></div></div>'}).join("")
}
function reportsTab(){
if(!ready("reports"))return loading();
var t={},fu={};A.files.forEach(function(f){t[f.id]=f});
if(!A.reports.length)return'<p class="adm-none">No reports. Students can report files and reviews with the Report button.</p>';
return A.reports.map(function(r){
var f=t[r.file_id],rv=r.kind==="review"?A.ratings.filter(function(v){return v.file_id===r.file_id&&v.user_id===r.review_user})[0]:null;
var what=r.kind==="file"?(f?"File “"+esc(f.title)+"” by "+esc(nm(f.uploader_id)):"File (already deleted)"):("Review by "+esc(nm(r.review_user))+(rv?": "+(rv.text?esc(rv.text):"★".repeat(rv.stars)):" (already deleted)")+(f?" on “"+esc(f.title)+"”":""));
var gone=r.kind==="file"?!f:!rv;
return'<div class="adm-row'+(r.status==="done"?' adm-done':'')+'"><div><b>'+esc(r.reason)+(r.status==="done"?' <span class="adm-me">HANDLED</span>':'')+'</b><span>'+what+'</span>'+(r.note?'<p>“'+esc(r.note)+'”</p>':'')+'<span>Reported by '+esc(nm(r.reporter))+' · '+dtt(r.at)+'</span></div><div class="adm-a">'+
(f&&r.kind==="file"?'<a class="btn small" target="_blank" rel="noopener" href="/_blob/'+esc(f.asset_path)+'">Open</a><button class="btn small" data-adm-hd="'+esc(f.id)+'">'+(f.hidden?'Unhide':'Hide')+'</button><button class="btn small" data-adm-ed="'+esc(f.id)+'">Edit</button>':'')+
(r.status==="open"&&!gone?'<button class="btn small danger" data-adm-rdel="'+r.id+'">Delete '+(r.kind==="file"?"file":"review")+'</button>':'')+
(r.status==="open"?'<button class="btn small" data-adm-rok="'+r.id+'">Dismiss</button>':'<button class="btn small" data-adm-rrm="'+r.id+'">Remove</button>')+'</div></div>'}).join("")
}
function usersTab(){
if(!A.users)return loading();
return A.users.map(function(u){var me=u.id===A.me;return'<div class="adm-row"><div><b>'+esc(u.name||"No name")+(u.banned?' <span class="adm-ban">BANNED</span>':'')+(me?' <span class="adm-me">YOU</span>':'')+'</b><span>'+esc(u.email||"")+'</span><span>Joined '+dt(u.created_at)+(u.last_sign_in?' · last seen '+dt(u.last_sign_in):'')+' · '+u.files+' files · '+u.reviews+' reviews</span></div><div class="adm-a"><button class="btn small" data-adm-rn="'+esc(u.id)+'">Rename</button>'+(me?'':'<button class="btn small" data-adm-ban="'+esc(u.id)+':'+(u.banned?0:1)+'">'+(u.banned?'Unban':'Ban')+'</button>'+((+u.files||+u.reviews)?'<button class="btn small danger" data-adm-pu="'+esc(u.id)+'">Delete content</button>':''))+'</div></div>'}).join("")
}
function subjectsTab(){
var st=A.sub,u=uniOf(st.uni),h='<p class="adm-note">Pick a programme and year. Subjects you add here appear straight away in the Upload and Library dropdowns for everyone. Official subjects (grey) come from the study plans and cannot be removed here.</p><div class="adm-casc" id="adm-sc"></div>';
if(u&&st.major&&st.year){
var off=(window.__sh.COURSES[st.uni+"|"+st.major]||{})[st.year]||[],cus=A.ccRows.filter(function(c){return c.uni===st.uni&&c.major===st.major&&c.year===st.year});
h+=card(st.major+" · "+st.year,
(off.length?'<div class="chips">'+off.map(function(s){return'<span class="chip adm-off">'+esc(s)+'</span>'}).join("")+'</div>':'<p class="adm-none">No official subjects for this programme.</p>')+
(cus.length?'<h3 class="adm-h3">Added by you</h3><div class="chips">'+cus.map(function(c){return'<span class="chip">'+esc(c.subject)+' <button class="adm-x" data-adm-cx="'+c.id+'" aria-label="Remove">×</button></span>'}).join("")+'</div>':"")+
'<h3 class="adm-h3">Add subjects</h3><textarea id="adm-cs" rows="4" placeholder="One subject per line, e.g.&#10;CS101 Introduction to Programming&#10;MATH110 Calculus I" maxlength="4000"></textarea><div class="adm-a" style="margin-top:8px"><button class="btn primary small" data-adm-cadd="1">Add</button></div>')
}
return h
}
function cleanupTab(){
if(!ready("cleanup"))return loading();
var st=A.stor||{supabase:+A.stats.storage_bytes||0,r2:0},GB=1000*1000*1000;
function meter(name,used,cap,note){var pc=Math.min(100,used/cap*100),cls=pc>=95?"bad":pc>=80?"warn":"";return'<h3 class="adm-h3">'+name+'</h3><div class="adm-meter '+cls+'"><i style="width:'+Math.max(1,pc).toFixed(1)+'%"></i></div><p class="adm-note"><b>'+mb(used)+'</b> of '+note+' ('+pc.toFixed(1)+'%). '+(pc>=80?'Getting close to the limit.':'Plenty of space left.')+'</p>'}
var h=card("Storage",meter("Supabase (older files)",+st.supabase||0,FREE,"1 GB")+meter("Cloudflare R2 (new uploads)",+st.r2||0,10*GB,"10 GB free")+'<p class="adm-note">New uploads go to Cloudflare R2 first. If R2 is unavailable or reaches 9 GB, uploads fall back to Supabase.</p>');
var big=A.files.slice().sort(function(a,b){return(+b.size_bytes||0)-(+a.size_bytes||0)}).slice(0,10);
h+=card("Biggest files",big.length?big.map(function(f){return'<div class="adm-row"><div><b>'+esc(f.title)+'</b><span>'+esc(f.uni)+' · '+esc(f.major)+' · '+esc(nm(f.uploader_id))+'</span></div><div class="adm-a"><span class="adm-size">'+mb(f.size_bytes)+'</span><button class="btn small danger" data-adm-df="'+esc(f.id)+'">Delete</button></div></div>'}).join(""):'<p class="adm-none">No files.</p>');
var g=dupes();
h+=card("Possible duplicates",g.length?g.map(function(grp){return'<div class="adm-dup">'+grp.map(function(f,i){return'<div class="adm-row"><div><b>'+esc(f.title)+(i===0?' <span class="adm-me">OLDEST</span>':'')+'</b><span>'+esc(f.file_name||"")+' · '+mb(f.size_bytes)+' · '+esc(nm(f.uploader_id))+' · '+dt(f.created_at)+'</span></div><div class="adm-a"><a class="btn small" target="_blank" rel="noopener" href="/_blob/'+esc(f.asset_path)+'">Open</a><button class="btn small danger" data-adm-df="'+esc(f.id)+'">Delete</button></div></div>'}).join("")+'</div>'}).join(""):'<p class="adm-none">No duplicates found.</p>','<p class="adm-note">Files with the same name and size, or the same title in the same programme and year.</p>');
return h
}
function dupes(){
var m1={},m2={},seen={},out=[];
A.files.forEach(function(f){if(+f.size_bytes>0&&f.file_name)(m1[f.size_bytes+"|"+f.file_name.toLowerCase()]=m1[f.size_bytes+"|"+f.file_name.toLowerCase()]||[]).push(f);
var k=(f.title||"").trim().toLowerCase()+"|"+f.uni+"|"+f.major+"|"+f.year;(m2[k]=m2[k]||[]).push(f)});
[m1,m2].forEach(function(m){Object.keys(m).forEach(function(k){var g=m[k];if(g.length<2)return;g=g.slice().sort(function(a,b){return new Date(a.created_at)-new Date(b.created_at)});var key=g.map(function(x){return x.id}).join(",");if(!seen[key]){seen[key]=1;out.push(g)}})});
return out
}
function siteTab(){
if(!A.site)return loading();var s=A.site;
return card("Announcement banner",'<p class="adm-note">Shows a message at the top of every page. Visitors can close it. Write the Arabic version too so Arabic visitors see it in Arabic.</p><form id="adm-ann" class="adm-form"><label>Message (English)<input name="text" maxlength="200" value="'+esc(s.text)+'"></label><label>Message (Arabic)<input name="text_ar" maxlength="200" dir="rtl" value="'+esc(s.text_ar)+'"></label><label>Hide after (optional)<input type="date" name="until" value="'+esc(s.until)+'"></label><label class="adm-chk"><input type="checkbox" name="on"'+(s.on?' checked':'')+'> Show the banner</label><div class="adm-a"><button class="btn primary small">Save</button></div><div class="adm-msg" id="adm-annmsg" role="status"></div></form>')
}
function adminsTab(){
if(A.role!=="owner")return'<p class="adm-none">Only the owner can manage admins.</p>';
if(!A.admins)return loading();
return card("Admins",A.admins.map(function(a){return'<div class="adm-row"><div><b>'+esc(a.email)+' <span class="'+(a.role==="owner"?"adm-me":"adm-ban adm-mod")+'">'+(a.role==="owner"?"OWNER":"MODERATOR")+'</span></b><span>Added '+dt(a.added_at)+'</span></div><div class="adm-a">'+(a.role==="owner"?'':'<button class="btn small danger" data-adm-arm="'+esc(a.email)+'">Remove</button>')+'</div></div>'}).join("")+
'<form id="adm-addadm" class="adm-form" style="margin-top:12px"><label>Add a moderator by Google / sign-in email<input type="email" name="email" required placeholder="friend@gmail.com"></label><div class="adm-a"><button class="btn primary small">Add moderator</button></div><div class="adm-msg" id="adm-admmsg" role="status"></div></form>',
'<p class="adm-note">Moderators can use every tab except Admins and Backup. They must sign in with exactly this email. Only add people you trust.</p>')
}
function backupTab(){
if(A.role!=="owner")return'<p class="adm-none">Only the owner can back up and restore.</p>';
return card("Back up everything",'<p class="adm-note">Downloads one ZIP with every file, already sorted into folders <b>University / College / Major / Year / Subject</b>, plus a <code>manifest.json</code> that remembers each file’s details, uploader, dates, reviews and added subjects. Keep it somewhere safe. Big libraries can take a few minutes; keep this tab open.</p><div class="adm-a"><button class="btn primary small" data-adm-bk="zip">Download full backup (ZIP)</button><button class="btn small" data-adm-bk="json">Data only (JSON, no files)</button></div>')+
card("Restore from a backup",'<p class="adm-note">Choose a backup ZIP. Every file goes back to the right university, college, major, year and subject on its own; nothing needs sorting. Files already on the site are skipped, so it is safe to run twice. You can also restore a plain ZIP that uses the folder layout <code>files/University/College/Major/Year/Subject/name.pdf</code>.</p><input type="file" id="adm-rf" accept=".zip,.json"><div class="adm-a" style="margin-top:8px"><button class="btn primary small" data-adm-rs="1">Restore</button></div>')+
'<pre id="adm-bklog" class="adm-log" aria-live="polite">'+esc(A.msg)+'</pre>'
}
function fmt(s){s=Math.round(+s||0);if(s<60)return s+" s";var m=Math.round(s/60);if(s<3600)return m+" min";var h=Math.floor(s/3600),mm=Math.round((s-h*3600)/60);if(mm===60){h++;mm=0}return h+" h"+(mm?" "+mm+" min":"")}
function tbars(rows,lab,val,sub){
if(!rows||!rows.length)return'<p class="adm-none">Nothing yet.</p>';
var m=1;rows.forEach(function(r){if(r[val]>m)m=r[val]});
return'<div class="adm-bars">'+rows.map(function(r){return'<div class="adm-b"><span class="adm-bl">'+esc(lab(r))+'</span><span class="adm-bt"><i style="width:'+Math.max(2,Math.round(100*r[val]/m))+'%"></i></span><b>'+fmt(r[val])+'</b></div>'}).join("")+'</div>'
}
function tchart(d,xl,tip){
if(!d||!d.length)return"";var W=640,H=170,L=8,B=22,T=6,n=d.length,mx=1;d.forEach(function(x){if(x.secs>mx)mx=x.secs});
var bw=(W-L)/n,g="";
d.forEach(function(x,i){var h=(H-T-B)*x.secs/mx,xx=L+i*bw+bw*.15,w=bw*.7;
g+='<g><title>'+esc(tip(x))+'</title><rect x="'+xx+'" y="'+(H-B-h)+'" width="'+w+'" height="'+Math.max(h,x.secs?2:0)+'" rx="2" fill="var(--accent)"/></g>';
if(xl(x,i,n))g+='<text x="'+(xx+w/2)+'" y="'+(H-6)+'" text-anchor="'+(i===n-1&&n>24?"end":"middle")+'" font-size="11" fill="var(--muted)">'+esc(xl(x,i,n))+'</text>'});
return'<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="Time chart" style="display:block">'+g+'<line x1="'+L+'" x2="'+W+'" y1="'+(H-B)+'" y2="'+(H-B)+'" stroke="var(--line)"/></svg>'
}
function dayChart(d){return tchart(d,function(x,i,n){return(i%5===0&&n-1-i>2)||i===n-1?new Date(x.day).toLocaleDateString("en-GB",{day:"numeric",month:"short"}):""},function(x){return dt(x.day)+": "+fmt(x.secs)+(x.people?" · "+x.people+" people":"")})}
function hrLab(h){h=+h;return(h%12||12)+(h<12?"am":"pm")}
function timeTab(){
var s=A.time;if(!s)return loading();
var pg={home:"Home",library:"Library",upload:"Upload",majors:"Majors",guidelines:"Guidelines",admin:"Admin"};
var mem=s.total-s.guest_secs,avg=s.members?mem/s.members:0;
var users='<div class="adm-row"><div><b>Guests (not signed in)</b><span>'+nf(s.guests)+' visitor'+(s.guests===1?'':'s')+' on this and other devices</span></div><div class="adm-a"><b class="adm-size">'+fmt(s.guest_secs)+'</b></div></div>'+
(s.users.length?s.users.map(function(u){return'<div class="adm-row"><div><b>'+esc(nm(u.uid))+'</b><span>'+nf(u.days)+' active day'+(u.days===1?'':'s')+' · first '+dt(u.first_at)+' · last active '+dtt(u.last_at)+'</span>'+(u.top_subject?'<span>Most time on: '+esc(u.top_subject)+'</span>':'')+'</div><div class="adm-a"><b class="adm-size">'+fmt(u.secs)+'</b><button class="btn small" data-adm-ut="'+esc(u.uid)+'">Details</button></div></div>'}).join(""):'<p class="adm-none">No signed-in members tracked yet.</p>');
var subs=s.subjects.length?s.subjects.map(function(r){return'<div class="adm-row"><div><b>'+esc(r.subject)+'</b><span>'+esc([r.uni,r.major,r.year].filter(Boolean).join(" · "))+'</span><span>'+nf(r.people)+' '+(r.people===1?'person':'people')+' · last '+dtt(r.last_at)+'</span></div><div class="adm-a"><b class="adm-size">'+fmt(r.secs)+'</b></div></div>'}).join(""):'<p class="adm-none">No subject time yet. It counts while someone has a subject chosen in the Library.</p>';
return'<div class="adm-kpis">'+kpi("Total time on the hub",fmt(s.total),"all visitors together")+kpi("Today",fmt(s.today),"Bahrain time")+kpi("Last 7 days",fmt(s.days7),"")+kpi("Average per member",fmt(avg),nf(s.members)+" signed-in member"+(s.members===1?"":"s"))+kpi("Guests",fmt(s.guest_secs),nf(s.guests)+" visitor"+(s.guests===1?"":"s"))+'</div>'+
card("Time per day, last 30 days",dayChart(s.daily),'<p class="adm-note">Counts only time when the site is open on screen and the visitor is actually active (idle for a minute stops the clock). Your own time as admin is not counted.</p>')+
'<div class="adm-2">'+card("Busiest hours (Bahrain time)",tchart(s.hours,function(x){return x.hr%6===0?hrLab(x.hr):""},function(x){return hrLab(x.hr)+": "+fmt(x.secs)}))+card("Time by page",tbars(s.pages,function(r){return pg[r.page]||r.page},"secs"))+'</div>'+
card("Time per user",users)+
card("Time per subject",subs,(s.no_subject?'<p class="adm-note">Another '+fmt(s.no_subject)+' was spent in the Library with no subject picked.</p>':''))
}
async function userTime(id){
var r=await sb.rpc("admin_user_time",{p_uid:id});if(r.error){A.err=r.error.message;refresh();return}
var d=r.data,pg={home:"Home",library:"Library",upload:"Upload",majors:"Majors",guidelines:"Guidelines"};
var html='<p class="adm-note">Total: <b>'+fmt(d.total)+'</b></p>'+dayChart(d.daily)+'<h3 class="adm-h3">Subjects</h3>'+(d.subjects.length?tbars(d.subjects,function(x){return x.subject+" ("+x.major+")"},"secs"):'<p class="adm-none">No subject time yet.</p>')+'<h3 class="adm-h3">Recent activity</h3>'+(d.recent.length?d.recent.map(function(x){return'<div class="adm-b"><span class="adm-bl">'+esc(dtt(x.at))+'</span><span>'+esc((pg[x.page]||x.page)+(x.subject?" · "+x.subject:"")+(x.dev==="phone"?" · phone":""))+'</span><b>'+fmt(x.secs)+'</b></div>'}).join(""):'<p class="adm-none">Nothing yet.</p>');
dlg({title:nm(id),intro:"Time on the hub (day chart follows Bahrain time)",html:html,ok:"Close",run:async function(){}})
}
var TABS=[["overview","Overview"],["time","Time"],["activity","Activity"],["files","Files"],["pdfrev","Review PDFs"],["reviews","Reviews"],["reports","Reports"],["users","Users"],["subjects","Subjects"],["cleanup","Cleanup"],["site","Site"],["admins","Admins","owner"],["backup","Backup","owner"]];
A.html=function(){
var body={overview:overview,time:timeTab,activity:activity,files:filesTab,pdfrev:pdfRevTab,reviews:reviewsTab,reports:reportsTab,users:usersTab,subjects:subjectsTab,cleanup:cleanupTab,site:siteTab,admins:adminsTab,backup:backupTab}[A.tab]();
var openN=(A.reports||[]).filter(function(r){return r.status==="open"}).length;
return'<div id="adm"><div class="pagehead"><h1>Admin</h1><p>'+(A.role==="owner"?"You are the owner.":"You are a moderator.")+' Deleting a file also removes its stored upload.</p></div>'+
'<div class="seg adm-tabs" role="group" aria-label="Admin sections">'+TABS.filter(function(t){return !t[2]||A.role===t[2]}).map(function(t){return'<button data-adm-tab="'+t[0]+'" aria-pressed="'+(A.tab===t[0])+'"><b>'+t[1]+(t[0]==="reports"&&openN?' ('+openN+')':'')+'</b></button>'}).join("")+'<button data-adm-reload="1" aria-label="Reload"><b>Reload</b></button></div>'+
(A.err?'<div class="note bad" role="alert">'+esc(A.err)+'</div>':'')+'<div class="adm-body">'+body+'</div></div>'
};
A.bind=function(){
if(!ready(A.tab)&&!A.busy){A.busy=true;load(A.tab).then(function(){A.busy=false})}
if(A.tab==="subjects"){var h=document.getElementById("adm-sc");if(h){h.__cb=refresh;casc(h,A.sub)}}
};
function two(btn,label,fn){
if(btn.dataset.sure!=="1"){btn.dataset.sure="1";btn.textContent="Click again to confirm";setTimeout(function(){if(btn){btn.dataset.sure="";btn.textContent=label}},4000);return}
btn.disabled=true;btn.textContent="Working…";fn().then(function(){},function(e){A.err=(e&&e.message)||"Failed";refresh()})
}
function dirty(){A.stats=null;A.ratings=null;A.reports=null}
async function delFile(id){
var f=A.files.filter(function(x){return x.id===id})[0];if(!f)return;
await rmStore([f.asset_path]);
var r=await sb.from("files").delete().eq("id",id);if(r.error)throw r.error;
A.files=A.files.filter(function(x){return x.id!==id});dirty();refresh()
}
async function delRev(k){
var p=k.split("|"),r=await sb.from("ratings").delete().eq("file_id",p[0]).eq("user_id",p[1]);if(r.error)throw r.error;
await sb.from("reports").update({status:"done"}).eq("file_id",p[0]).eq("review_user",p[1]);
A.ratings=A.ratings&&A.ratings.filter(function(x){return !(x.file_id===p[0]&&x.user_id===p[1])});A.stats=null;A.reports=null;refresh()
}
async function purge(u){
var r=await sb.from("files").select("id,asset_path").eq("uploader_id",u);if(r.error)throw r.error;
if(r.data.length){await rmStore(r.data.map(function(x){return x.asset_path}));
var d=await sb.from("files").delete().eq("uploader_id",u);if(d.error)throw d.error}
var q=await sb.from("ratings").delete().eq("user_id",u);if(q.error)throw q.error;
A.files=null;A.ratings=null;A.stats=null;A.reports=null;await loadUsers();refresh()
}
async function ban(u,b){var r=await sb.rpc("admin_ban",{uid:u,b:b});if(r.error)throw r.error;await loadUsers();refresh()}
function editFile(id){
var f=A.files.filter(function(x){return x.id===id})[0];if(!f)return;
var st={uni:f.uni,college:f.college||collegeOf(f.uni,f.major),major:f.major,year:f.year};
var d=dlg({title:"Edit file",html:'<label>Title<input name="title" maxlength="200" required value="'+esc(f.title)+'"></label><div class="adm-casc" id="ed-c"></div><label>Subject<input name="subject" maxlength="120" value="'+esc(f.subject||"")+'" list="ed-subs"></label><datalist id="ed-subs"></datalist><label>Type<select name="kind">'+opts(KINDS.map(function(k){return[k,k]}),f.kind)+'</select></label><label>Description<textarea name="description" rows="3" maxlength="1000">'+esc(f.description||"")+'</textarea></label>',
init:function(host){var c=host.querySelector("#ed-c");c.__cb=function(){fillSubs()};casc(c,st);function fillSubs(){var L=[],k=st.uni+"|"+st.major,o=(window.__sh.COURSES[k]||{})[st.year]||[],x=((window.__cc||{})[k]||{})[st.year]||[];host.querySelector("#ed-subs").innerHTML=o.concat(x).map(function(s){return'<option value="'+esc(s)+'">'}).join("")}fillSubs()},
run:async function(form,m){
if(!st.uni||!st.college||!st.major||!st.year){m.textContent="Choose university, college, major and year.";return false}
var row={title:form.title.value.trim(),uni:st.uni,college:st.college,major:st.major,year:st.year,subject:form.subject.value.trim()||null,kind:form.kind.value,description:form.description.value.trim()};
var r=await sb.from("files").update(row).eq("id",id);if(r.error)throw r.error;
Object.assign(f,row);refresh()}})
}
async function toggleHide(id,btn){
var f=A.files.filter(function(x){return x.id===id})[0];if(!f)return;btn.disabled=true;
var nv=!f.hidden,r=await sb.from("files").update({hidden:nv}).eq("id",id);if(r.error){A.err=r.error.message;refresh();return}
f.hidden=nv;refresh()
}
async function toggleFeat(id,btn){
var f=A.files.filter(function(x){return x.id===id})[0];if(!f)return;btn.disabled=true;
var nv=!f.featured,r=await sb.from("files").update({featured:nv}).eq("id",id);if(r.error){A.err=r.error.message;refresh();return}
f.featured=nv;refresh()
}
function renameUser(id){
var u=A.users.filter(function(x){return x.id===id})[0];if(!u)return;
dlg({title:"Rename user",intro:u.email||"",html:'<label>Display name (3 to 30 characters, must be unique)<input name="n" required minlength="3" maxlength="30" value="'+esc(u.name||"")+'"></label>',
run:async function(f){var r=await sb.rpc("admin_rename",{uid:id,n:f.n.value});if(r.error)throw r.error;A.names[id]=f.n.value.trim();await loadUsers();refresh()}})
}
async function repAct(id,act){
var rp=A.reports.filter(function(x){return String(x.id)===String(id)})[0];if(!rp)return;
if(act==="ok"){var r=await sb.from("reports").update({status:"done"}).eq("id",id);if(r.error)throw r.error;rp.status="done"}
else if(act==="rm"){var r2=await sb.from("reports").delete().eq("id",id);if(r2.error)throw r2.error;A.reports=A.reports.filter(function(x){return x!==rp})}
else if(act==="del"){if(rp.kind==="file"){await delFile(rp.file_id);return}else{await delRev(rp.file_id+"|"+rp.review_user);return}}
refresh()
}
async function saveAnn(f){
var m=document.getElementById("adm-annmsg");m.textContent="Saving…";
var v={text:f.text.value.trim(),text_ar:f.text_ar.value.trim(),until:f.until.value||"",on:f.on.checked};
var r=await sb.from("site_settings").upsert({key:"announcement",value:v,updated_at:new Date().toISOString()});
if(r.error){m.textContent=r.error.message;return}A.site=v;ann=v;try{localStorage.removeItem("sh_ann")}catch(e){}paintBanner();m.textContent="Saved."
}
async function addSubjects(){
var st=A.sub,ta=document.getElementById("adm-cs"),ls=ta.value.split("\n").map(function(s){return s.trim()}).filter(Boolean);if(!ls.length)return;
var rows=ls.map(function(s){return{uni:st.uni,major:st.major,year:st.year,subject:s.slice(0,120)}});
var r=await sb.from("custom_courses").upsert(rows,{onConflict:"uni,major,year,subject",ignoreDuplicates:true});if(r.error){A.err=r.error.message;refresh();return}
await loadCC();refresh()
}
async function delSubject(id){var r=await sb.from("custom_courses").delete().eq("id",id);if(r.error){A.err=r.error.message;refresh();return}await loadCC();refresh()}
function say(t){A.msg=t;var e=document.getElementById("adm-bklog");if(e){e.textContent=t;e.scrollTop=e.scrollHeight}}
function addl(t){say((A.msg?A.msg+"\n":"")+t)}
function loadZip(){return window.JSZip?Promise.resolve():new Promise(function(res,rej){var s=document.createElement("script");s.src=ZIPURL;s.onload=res;s.onerror=function(){rej(new Error("Could not load the ZIP tool. Check your internet connection."))};document.head.appendChild(s)})}
function safe(s){return String(s||"").replace(/[\\/:*?"<>|\u0000-\u001f]/g," ").replace(/\s+/g," ").trim().slice(0,80)||"-"}
function extOf(n){var m=/\.([A-Za-z0-9]{1,5})$/.exec(n||"");return m?m[1].toLowerCase():"bin"}
var CT={pdf:"application/pdf",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",gif:"image/gif",webp:"image/webp",svg:"image/svg+xml",txt:"text/plain",md:"text/markdown",csv:"text/csv"};
function save(blob,name){var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},4000)}
async function backup(kind){
if(A.busy)return;A.busy=true;A.msg="";
try{
say("Reading the database…");
var files=await all("files","created_at",true),ratings=await all("ratings","at",true),profiles=await all("profiles","id",true),cc=await all("custom_courses","id",true),st=await all("site_settings","key",true);
var day=new Date().toISOString().slice(0,10),man={app:"study-hub",version:1,exported_at:new Date().toISOString(),files:[],ratings:ratings,profiles:profiles,custom_courses:cc.map(function(c){return{uni:c.uni,major:c.major,year:c.year,subject:c.subject}}),site_settings:st};
if(kind==="json"){
files.forEach(function(f){f.public_url=isR2(f.asset_path)?"":sb.storage.from("files").getPublicUrl(f.asset_path).data.publicUrl});man.files=files;
save(new Blob([JSON.stringify(man,null,1)],{type:"application/json"}),"study-hub-data-"+day+".json");say("Done. Data saved (files themselves are not inside this JSON).");A.busy=false;return}
await loadZip();var zip=new JSZip(),miss=0,ok=0,used={};
for(var i=0;i<files.length;i++){
var f=files[i],u=uniOf(f.uni),col=f.college||collegeOf(f.uni,f.major),ext=extOf(f.file_name||f.asset_path);
var p="files/"+[safe(u?u.name:f.uni),safe(col),safe(f.major),safe(f.year),safe(f.subject||"General")].join("/")+"/"+safe(f.title).replace(/\.+$/,"")+" ["+f.id.slice(0,8)+"]."+ext;
addl0("Downloading "+(i+1)+" of "+files.length+": "+f.title);
try{var r=await fetch(await fileUrl(f.asset_path));if(!r.ok)throw 0;zip.file(p,await r.blob());ok++;man.files.push({zip_path:p,row:f})}
catch(e){miss++;man.files.push({zip_path:null,missing:true,row:f})}
}
zip.file("manifest.json",JSON.stringify(man,null,1));
zip.file("README.txt","Study Hub backup made "+man.exported_at+"\n\nFiles: "+ok+" saved, "+miss+" missing.\nTo restore: Admin > Backup > Restore, choose this ZIP. Every file goes back to its own university, college, major, year and subject automatically.\nFiles are also sorted into folders here so you can find them by hand.\n");
addl0("Building the ZIP…");
var blob=await zip.generateAsync({type:"blob",compression:"STORE"},function(m){addl0("Building the ZIP… "+Math.round(m.percent)+"%")});
save(blob,"study-hub-backup-"+day+".zip");say("Done. "+ok+" files saved"+(miss?", "+miss+" could not be downloaded":"")+". Size "+mb(blob.size)+".")
}catch(e){say("Backup failed: "+((e&&e.message)||e))}
A.busy=false
}
function addl0(t){var e=document.getElementById("adm-bklog");A.msg=t;if(e)e.textContent=t}
async function restore(){
var inp=document.getElementById("adm-rf"),file=inp&&inp.files[0];if(!file){say("Choose a backup file first.");return}
if(A.busy)return;A.busy=true;A.msg="";
try{
var man=null,zip=null;
if(/\.json$/i.test(file.name))man=JSON.parse(await file.text());
else{await loadZip();zip=await JSZip.loadAsync(file);var mf=zip.file("manifest.json");if(mf)man=JSON.parse(await mf.async("string"))}
var have={},names={};
(await all("files","created_at",true)).forEach(function(f){have[f.id]=1;have["p:"+f.asset_path]=1});
(await all("profiles","id",true)).forEach(function(p){names[p.id]=1});
var made=0,skip=0,bad=0,items=[];
if(man){items=man.files.filter(function(x){return x.row}).map(function(x){return{row:x.row,zp:x.zip_path}})}
else{
zip.forEach(function(p,en){if(en.dir||!/^files\//.test(p))return;var s=p.split("/").slice(1);if(s.length<5)return;var ext=extOf(s[s.length-1]);if(!CT[ext])return;
var u=U().filter(function(x){return x.name.toLowerCase()===s[0].toLowerCase()||x.id===s[0].toLowerCase()})[0];if(!u){addl("Skipped (university not recognised): "+p);bad++;return}
var col=s[1],maj=s[2];var g=u.groups.filter(function(x){return safe(x.g)===s[1]||x.g===s[1]})[0];if(g)col=g.g;var mj=g&&g.m.filter(function(x){return safe(x)===s[2]||x===s[2]})[0];if(mj)maj=mj;
var yr=u.years.filter(function(y){return y===s[3]})[0]||s[3],sub=s.length>5?s[4]:"General",title=s[s.length-1].replace(/\.[^.]+$/,"").replace(/\s*\[[0-9a-f]{8}\]$/,"");
var path=A.me+"/"+(crypto.randomUUID?crypto.randomUUID():Date.now()+""+Math.random().toString(36).slice(2))+"."+ext;
items.push({zp:p,row:{title:title,uni:u.id,college:col,major:maj,year:yr,subject:sub==="General"?null:sub,kind:"Notes",asset_path:path,content_type:CT[ext],size_bytes:0,file_name:s[s.length-1],uploader_id:A.me}})})}
addl("Found "+items.length+" files to check…");
for(var i=0;i<items.length;i++){
var it=items[i],row=Object.assign({},it.row);
if(row.id&&have[row.id]||have["p:"+row.asset_path]){skip++;continue}
try{
if(zip&&it.zp){var ze=zip.file(it.zp);if(!ze)throw new Error("file missing from ZIP");var buf=await ze.async("blob");row.size_bytes=row.size_bytes||buf.size;
var ctype=row.content_type||CT[extOf(row.asset_path)]||"application/octet-stream";
if(isR2(row.asset_path)){var sg=await r2({action:"sign-upload",size:buf.size||1,ext:extOf(row.asset_path),key:row.asset_path});var pr=await fetch(sg.url,{method:"PUT",body:buf,headers:{"Content-Type":ctype}});if(!pr.ok)throw new Error("R2 upload failed")}
else{var up=await sb.storage.from("files").upload(row.asset_path,new Blob([buf],{type:row.content_type||CT[extOf(row.asset_path)]||"application/octet-stream"}),{contentType:row.content_type||CT[extOf(row.asset_path)]||"application/octet-stream",upsert:false});
if(up.error&&!/exist/i.test(up.error.message||""))throw up.error}}
if(!names[row.uploader_id])row.uploader_id=A.me;delete row.public_url;
var ins=await sb.from("files").insert(row);if(ins.error)throw ins.error;made++;
if(made%5===0)addl0("Restored "+made+" of "+items.length+"…")
}catch(e){bad++;addl("Failed: "+(row.title||"?")+" — "+((e&&e.message)||e))}
}
var extra="";
if(man&&man.ratings&&man.ratings.length){var rr=man.ratings.filter(function(v){return names[v.user_id]}).map(function(v){return{file_id:v.file_id,user_id:v.user_id,stars:v.stars,text:v.text,at:v.at}});
for(var j=0;j<rr.length;j+=200){var q=await sb.from("ratings").upsert(rr.slice(j,j+200),{onConflict:"file_id,user_id",ignoreDuplicates:true});if(q.error){extra+=" Some reviews could not be restored.";break}}}
if(man&&man.custom_courses&&man.custom_courses.length){var q2=await sb.from("custom_courses").upsert(man.custom_courses,{onConflict:"uni,major,year,subject",ignoreDuplicates:true});if(q2.error)extra+=" Some subjects could not be restored."}
if(man&&man.site_settings&&man.site_settings.length){await sb.from("site_settings").upsert(man.site_settings.map(function(s){return{key:s.key,value:s.value}}),{onConflict:"key",ignoreDuplicates:true})}
A.files=null;A.stats=null;A.ratings=null;loadCC();
addl("Finished. "+made+" restored, "+skip+" already there"+(bad?", "+bad+" failed":"")+"."+extra)
}catch(e){say("Restore failed: "+((e&&e.message)||e))}
A.busy=false
}
document.addEventListener("click",function(e){
if(!A.ok)return;var t=e.target,x;
if(x=t.closest("[data-adm-tab]")){A.tab=x.getAttribute("data-adm-tab");if(A.tab==="pdfrev")A.rev=null;A.err="";refresh();return}
if(t.closest("[data-adm-reload]")){A.rev=null;A.stats=A.files=A.ratings=A.users=A.reports=A.admins=A.site=A.time=null;refresh();return}
if(x=t.closest("[data-adm-df]")){two(x,"Delete",function(){return delFile(x.getAttribute("data-adm-df"))});return}
if(x=t.closest("[data-adm-dr]")){two(x,"Delete",function(){return delRev(x.getAttribute("data-adm-dr"))});return}
if(x=t.closest("[data-adm-pu]")){two(x,"Delete content",function(){return purge(x.getAttribute("data-adm-pu"))});return}
if(x=t.closest("[data-adm-ban]")){var p=x.getAttribute("data-adm-ban").split(":");x.disabled=true;ban(p[0],p[1]==="1").catch(function(er){A.err=er.message;refresh()});return}
if(x=t.closest("[data-adm-rvf]")){A.revF=x.getAttribute("data-adm-rvf");refresh();return}
if(x=t.closest("[data-adm-rq]")){x.disabled=true;rq(x.getAttribute("data-adm-rq")).catch(function(er){A.err=/file_reviews/.test(er.message||"")?"Run supabase-admin7.sql first (Supabase > SQL Editor).":er.message;refresh()});return}
if(x=t.closest("[data-adm-ed]")){editFile(x.getAttribute("data-adm-ed"));return}
if(x=t.closest("[data-adm-hd]")){toggleHide(x.getAttribute("data-adm-hd"),x);return}
if(x=t.closest("[data-adm-ft]")){toggleFeat(x.getAttribute("data-adm-ft"),x);return}
if(x=t.closest("[data-adm-ut]")){userTime(x.getAttribute("data-adm-ut"));return}
if(x=t.closest("[data-adm-rn]")){renameUser(x.getAttribute("data-adm-rn"));return}
if(x=t.closest("[data-adm-rok]")){repAct(x.getAttribute("data-adm-rok"),"ok").catch(function(er){A.err=er.message;refresh()});return}
if(x=t.closest("[data-adm-rrm]")){repAct(x.getAttribute("data-adm-rrm"),"rm").catch(function(er){A.err=er.message;refresh()});return}
if(x=t.closest("[data-adm-rdel]")){two(x,x.textContent,function(){return repAct(x.getAttribute("data-adm-rdel"),"del")});return}
if(x=t.closest("[data-adm-cadd]")){addSubjects();return}
if(x=t.closest("[data-adm-cx]")){delSubject(x.getAttribute("data-adm-cx"));return}
if(x=t.closest("[data-adm-arm]")){two(x,"Remove",async function(){var r=await sb.rpc("admin_remove",{e:x.getAttribute("data-adm-arm")});if(r.error)throw r.error;await loadAdmins();refresh()});return}
if(x=t.closest("[data-adm-bk]")){backup(x.getAttribute("data-adm-bk"));return}
if(t.closest("[data-adm-rs]")){restore();return}
});
document.addEventListener("submit",async function(e){
var f=e.target;
if(f.id==="adm-ann"){e.preventDefault();saveAnn(f)}
if(f.id==="adm-addadm"){e.preventDefault();var m=document.getElementById("adm-admmsg");var r=await sb.rpc("admin_add",{e:f.email.value});if(r.error){m.textContent=r.error.message;return}await loadAdmins();refresh()}
});
document.addEventListener("input",function(e){
if(e.target.id==="adm-q"){A.q=e.target.value;var q=A.q.trim().toLowerCase(),r=A.files.filter(function(f){return !q||(f.title+" "+f.uni+" "+f.major+" "+(f.subject||"")+" "+nm(f.uploader_id)).toLowerCase().indexOf(q)>-1});document.getElementById("adm-list").innerHTML=fileRows(r)}
});
async function check(){
try{
var s=(await sb.auth.getSession()).data.session;
if(!s){A.ok=false;return}
var r=await sb.rpc("admin_role");A.role=r.data||null;A.ok=!!A.role;A.me=s.user.id;
if(A.ok&&window.__sh){window.__sh.render();if((location.hash||"")==="#admin")window.__sh.go("admin")}
}catch(e){}
}
check();sb.auth.onAuthStateChange(function(){A.ok=false;setTimeout(check,50)});
})();
