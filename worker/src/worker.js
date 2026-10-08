const DEF = { file_mb: 20, total_gb: 9, student_mb: 0 };
const HARD_FILE = 100 * 1024 * 1024;
const SESSION_DAYS = 30;
const enc = new TextEncoder();
const T = {
profiles: { cols: "id,name,chosen", bool: ["chosen"] },
files: { cols: "id,title,uni,college,major,year,subject,kind,description,asset_path,content_type,size_bytes,file_name,uploader_id,created_at,featured,hidden,compressed,orig_bytes", bool: ["featured", "hidden", "compressed"] },
ratings: { cols: "file_id,user_id,stars,text,at" },
reports: { cols: "id,at,reporter,kind,file_id,review_user,reason,note,status,target" },
site_settings: { cols: "key,value,updated_at", json: ["value"] },
custom_courses: { cols: "id,uni,major,year,subject" },
page_views: { cols: "id,at,sid,uid,kind,ref,dev,lang,tz,src" },
file_reviews: { cols: "file_id,status,requested_at,reviewed_at,summary,flags,matches" },
file_study: { cols: "file_id,cards,quiz,made_at", json: ["cards", "quiz"] },
copyright_reports: { cols: "id,kind,file_id,file_title,name,email,details,status,at" },
};
for (const k in T) { T[k].set = new Set(T[k].cols.split(",")); T[k].bool = T[k].bool || []; T[k].json = T[k].json || []; }
const NOW = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();
const j = (b, status = 200, extra = {}) => new Response(JSON.stringify(b), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra } });
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
async function hmac(secret, msg) {
const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
return b64u(await crypto.subtle.sign("HMAC", k, enc.encode(msg)));
}
function safeEq(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
async function sign(env, obj) { const p = b64u(enc.encode(JSON.stringify(obj))); return p + "." + (await hmac(env.SESSION_SECRET || env.GOOGLE_CLIENT_SECRET, p)); }
async function verify(env, tok) {
if (!tok || typeof tok !== "string" || !tok.includes(".")) return null;
const [p, s] = tok.split(".");
if (!safeEq(s, await hmac(env.SESSION_SECRET || env.GOOGLE_CLIENT_SECRET, p))) return null;
try { const o = JSON.parse(new TextDecoder().decode(unb64u(p))); return o.exp && o.exp < Date.now() / 1000 ? null : o; } catch { return null; }
}
function cookies(req) { const o = {}; (req.headers.get("Cookie") || "").split(";").forEach((c) => { const i = c.indexOf("="); if (i > 0) o[c.slice(0, i).trim()] = c.slice(i + 1).trim(); }); return o; }
const setCookie = (name, val, maxAge, path = "/") => `${name}=${val}; Path=${path}; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const q = (env, sql, ...args) => env.DB.prepare(sql).bind(...args);
const all = async (env, sql, ...a) => (await q(env, sql, ...a).all()).results || [];
const one = async (env, sql, ...a) => (await q(env, sql, ...a).all()).results?.[0] || null;
class Deny extends Error { constructor(m, code = "42501") { super(m); this.code = code; } }
async function getMe(req, env) {
const t = cookies(req).sh;
const s = await verify(env, t);
if (!s || !s.uid) return null;
const u = await one(env, "SELECT id,email,g_name FROM users WHERE id=?", s.uid);
return u ? { id: u.id, email: u.email, name: u.g_name } : null;
}
async function roleOf(env, me) { if (!me) return null; const r = await one(env, "SELECT role FROM admins WHERE lower(email)=lower(?)", me.email); return r ? r.role : null; }
async function ctx(req, env) {
const me = await getMe(req, env);
const role = await roleOf(env, me);
const c = { me, role, admin: !!role, owner: role === "owner" };
c.banned = async () => !!(me && (await one(env, "SELECT 1 x FROM banned WHERE user_id=?", me.id)));
c.hasName = async () => !!(me && (await one(env, "SELECT 1 x FROM profiles WHERE id=? AND chosen=1", me.id)));
return c;
}
async function getLimits(env) {
const r = await one(env, "SELECT value FROM site_settings WHERE key='limits'");
let v = {}; try { v = JSON.parse(r?.value || "{}"); } catch {}
return { file: clamp(num(v.file_mb, DEF.file_mb), 1, 100) * 1048576, cap: clamp(num(v.total_gb, DEF.total_gb), 1, 1000) * 1e9, student: Math.max(0, num(v.student_mb, DEF.student_mb)) * 1048576 };
}
function safeNext(n) { return typeof n === "string" && /^\/[A-Za-z0-9/_\-.?=&%#]*$/.test(n) && !n.startsWith("//") ? n : "/"; }
async function authStart(req, env, url) {
const state = b64u(crypto.getRandomValues(new Uint8Array(16)));
const next = safeNext(url.searchParams.get("next") || "/");
const st = await sign(env, { s: state, n: next, exp: Math.floor(Date.now() / 1000) + 600 });
const p = new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, redirect_uri: url.origin + "/auth/callback", response_type: "code", scope: "openid email profile", state, prompt: "select_account" });
return new Response(null, { status: 302, headers: { Location: "https://accounts.google.com/o/oauth2/v2/auth?" + p, "Set-Cookie": setCookie("sh_st", st, 600, "/auth"), "Cache-Control": "no-store" } });
}
async function uniqueName(env, base) {
base = (base || "Student").replace(/[^A-Za-z0-9_.؀-ۿ-]/g, "").slice(0, 20) || "Student";
let cand = base;
for (let i = 0; i < 25; i++) {
if (!(await one(env, "SELECT 1 x FROM profiles WHERE lower(name)=lower(?)", cand))) return cand;
cand = base.slice(0, 15) + "-" + (1000 + Math.floor(Math.random() * 9000));
}
return base + "-" + uuid().slice(0, 6);
}
async function authCallback(req, env, url) {
const st = await verify(env, cookies(req).sh_st);
const bad = (m) => new Response(m, { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8", "Set-Cookie": setCookie("sh_st", "", 0, "/auth") } });
if (!st || st.s !== url.searchParams.get("state")) return bad("Sign-in expired. Please go back and try again.");
const code = url.searchParams.get("code");
if (!code) return bad("Sign-in was cancelled.");
const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: url.origin + "/auth/callback", grant_type: "authorization_code" }) });
const tok = await r.json().catch(() => ({}));
if (!r.ok || !tok.id_token) return bad("Google sign-in failed.");
let p; try { p = JSON.parse(new TextDecoder().decode(unb64u(tok.id_token.split(".")[1]))); } catch { return bad("Google sign-in failed."); }
if (p.aud !== env.GOOGLE_CLIENT_ID || !["accounts.google.com", "https://accounts.google.com"].includes(p.iss) || p.exp < Date.now() / 1000 || !p.email || p.email_verified === false) return bad("Google sign-in failed.");
const email = String(p.email).toLowerCase();
let u = await one(env, "SELECT id FROM users WHERE lower(email)=?", email);
if (!u) {
const id = uuid();
await q(env, "INSERT INTO users(id,email,g_name,created_at,last_sign_in) VALUES(?,?,?,?,?)", id, email, p.name || null, NOW(), NOW()).run();
await q(env, "INSERT INTO profiles(id,name,chosen) VALUES(?,?,0)", id, await uniqueName(env, p.given_name || (p.name || "").split(" ")[0])).run();
u = { id };
} else {
await q(env, "UPDATE users SET last_sign_in=?, g_name=coalesce(?,g_name) WHERE id=?", NOW(), p.name || null, u.id).run();
if (!(await one(env, "SELECT 1 x FROM profiles WHERE id=?", u.id))) await q(env, "INSERT INTO profiles(id,name,chosen) VALUES(?,?,0)", u.id, await uniqueName(env, p.given_name)).run();
}
const sess = await sign(env, { uid: u.id, exp: Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400 });
const h = new Headers({ Location: st.n || "/", "Cache-Control": "no-store" });
h.append("Set-Cookie", setCookie("sh", sess, SESSION_DAYS * 86400));
h.append("Set-Cookie", setCookie("sh_st", "", 0, "/auth"));
return new Response(null, { status: 302, headers: h });
}
const OPS = { eq: "=", neq: "<>", gt: ">", gte: ">=", lt: "<", lte: "<=" };
function colList(t, s) {
if (!s || s === "*") return T[t].cols.split(",");
const out = s.split(",").map((x) => x.trim()).filter(Boolean);
for (const c of out) if (!T[t].set.has(c)) throw new Deny("Unknown column " + c, "42703");
return out;
}
function whereSql(t, where, bind) {
const parts = [];
for (const w of where || []) {
if (!T[t].set.has(w.c)) throw new Deny("Unknown column " + w.c, "42703");
if (w.op === "in") {
const a = Array.isArray(w.v) ? w.v.slice(0, 500) : [];
if (!a.length) { parts.push("0"); continue; }
parts.push(`${w.c} IN (${a.map(() => "?").join(",")})`); bind.push(...a.map(inVal));
} else if (OPS[w.op]) { parts.push(`${w.c} ${OPS[w.op]} ?`); bind.push(inVal(w.v)); }
else if (w.op === "is") { parts.push(w.v === null ? `${w.c} IS NULL` : `${w.c} IS NOT NULL`); }
else throw new Deny("Bad filter", "42601");
}
return parts;
}
const inVal = (v) => (v === true ? 1 : v === false ? 0 : v === undefined ? null : typeof v === "object" && v !== null ? JSON.stringify(v) : v);
function outRow(t, r, cols) {
const o = {};
for (const c of cols) {
let v = r[c];
if (T[t].bool.includes(c)) v = !!v;
else if (T[t].json.includes(c) && typeof v === "string") { try { v = JSON.parse(v); } catch {} }
o[c] = v === undefined ? null : v;
}
return o;
}
function cleanRow(t, row, allow) {
const o = {};
for (const k of Object.keys(row || {})) {
if (!T[t].set.has(k)) throw new Deny("Unknown column " + k, "42703");
if (allow && !allow.includes(k)) throw new Deny("Not allowed to set " + k);
o[k] = inVal(row[k]);
}
return o;
}
async function selectRule(t, c) {
switch (t) {
case "profiles": case "ratings": case "site_settings": case "custom_courses": return { sql: "" };
case "files": return c.admin ? { sql: "" } : { sql: "(hidden=0 OR uploader_id=?)", bind: [c.me ? c.me.id : ""] };
case "file_study": return c.admin ? { sql: "" } : { sql: "file_id IN (SELECT id FROM files WHERE hidden=0)" };
case "reports": case "file_reviews": case "copyright_reports": if (!c.admin) throw new Deny("not allowed"); return { sql: "" };
default: throw new Deny("not allowed");
}
}
async function dbHandler(body, c, env) {
const t = body.t, op = body.op;
if (!T[t]) throw new Deny("Unknown table", "42P01");
const bind = [];
if (op === "select") {
const cols = colList(t, body.cols);
const rule = await selectRule(t, c);
const parts = whereSql(t, body.where, bind);
if (rule.sql) { parts.push(rule.sql); bind.push(...(rule.bind || [])); }
let sql = `SELECT ${cols.join(",")} FROM ${t}` + (parts.length ? " WHERE " + parts.join(" AND ") : "");
const ord = (body.order || []).filter((o) => T[t].set.has(o[0])).map((o) => `${o[0]} ${o[1] ? "ASC" : "DESC"}`);
if (ord.length) sql += " ORDER BY " + ord.join(",");
const lim = clamp(num(body.lim, 1000), 1, 20000), off = Math.max(0, num(body.off, 0));
sql += ` LIMIT ${lim} OFFSET ${off}`;
const rows = (await q(env, sql, ...bind).all()).results || [];
return rows.map((r) => outRow(t, r, cols));
}
const ret = body.ret ? colList(t, body.ret) : null;
const fin = (rows) => (ret ? rows.map((r) => outRow(t, r, ret)) : null);
if (op === "insert" || op === "upsert") {
const rowsIn = Array.isArray(body.values) ? body.values : [body.values];
if (!rowsIn.length) return ret ? [] : null;
if (rowsIn.length > 500) throw new Deny("Too many rows");
const out = [];
for (const raw of rowsIn) {
let r;
switch (t) {
case "files": {
if (!c.me) throw new Deny("not signed in");
if (c.owner && raw.uploader_id) r = cleanRow(t, raw); // restoring a backup
else {
if (await c.banned()) throw new Deny("You are banned.");
if (!(await c.hasName())) throw new Deny("Choose a username first.");
r = cleanRow(t, raw, "title,uni,college,major,year,subject,kind,description,asset_path,content_type,size_bytes,file_name,compressed,orig_bytes,uploader_id".split(",")); if (r.uploader_id != null && r.uploader_id !== c.me.id) throw new Deny("not allowed"); r.uploader_id = c.me.id;
}
r.id = r.id || uuid(); r.created_at = r.created_at || NOW();
break;
}
case "ratings": {
if (!c.me) throw new Deny("not signed in");
if (c.owner && raw.user_id) r = cleanRow(t, raw);
else {
if (await c.banned()) throw new Deny("You are banned.");
if (!(await c.hasName())) throw new Deny("Choose a username first.");
r = cleanRow(t, raw, ["file_id", "stars", "text", "at", "user_id"]); if (r.user_id != null && r.user_id !== c.me.id) throw new Deny("not allowed"); r.user_id = c.me.id;
}
r.at = r.at || NOW();
break;
}
case "reports": {
if (!c.me) throw new Deny("not signed in");
if (await c.banned()) throw new Deny("You are banned.");
r = cleanRow(t, raw, ["kind", "file_id", "review_user", "reason", "note", "reporter"]); if (r.reporter != null && r.reporter !== c.me.id) throw new Deny("not allowed"); r.reporter = c.me.id; r.status = "open"; r.at = NOW();
if (String(r.reason || "").length > 40 || String(r.note || "").length > 500) throw new Deny("Too long", "23514");
break;
}
case "page_views": r = cleanRow(t, raw, ["sid", "uid", "kind", "ref", "dev", "lang", "tz", "src"]); r.uid = c.me ? c.me.id : null; if (!r.sid || String(r.sid).length > 64) throw new Deny("bad", "23514"); r.at = NOW(); break;
case "copyright_reports": r = cleanRow(t, raw, ["kind", "file_id", "file_title", "name", "email", "details", "status"]); if (r.status != null && r.status !== "open") throw new Deny("not allowed"); r.status = "open"; r.at = NOW();
if (String(r.details || "").length < 10 || String(r.details).length > 2000) throw new Deny("Details must be 10 to 2000 characters", "23514"); break;
case "site_settings": case "custom_courses": case "file_reviews": case "file_study":
if (!c.admin) throw new Deny("not allowed"); r = cleanRow(t, raw);
if (t === "site_settings") r.updated_at = r.updated_at || NOW();
if (t === "file_study") { if ((JSON.parse(r.cards || "[]")).length > 80 || (JSON.parse(r.quiz || "[]")).length > 60) throw new Deny("Too many", "23514"); }
break;
default: throw new Deny("not allowed");
}
const keys = Object.keys(r);
let sql = `INSERT INTO ${t} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`;
if (op === "upsert") {
const oc = (body.onConflict || { site_settings: "key", custom_courses: "uni,major,year,subject", ratings: "file_id,user_id", file_reviews: "file_id", file_study: "file_id" }[t] || "").split(",").filter(Boolean);
for (const k of oc) if (!T[t].set.has(k)) throw new Deny("Bad conflict key", "42703");
if (!oc.length) throw new Deny("Missing conflict key");
if (body.ignoreDup) sql += ` ON CONFLICT(${oc.join(",")}) DO NOTHING`;
else { const upd = keys.filter((k) => !oc.includes(k)); sql += upd.length ? ` ON CONFLICT(${oc.join(",")}) DO UPDATE SET ${upd.map((k) => `${k}=excluded.${k}`).join(",")}` : ` ON CONFLICT(${oc.join(",")}) DO NOTHING`; }
}
sql += " RETURNING *";
const res = await q(env, sql, ...keys.map((k) => r[k])).all();
out.push(...(res.results || []));
}
return fin(out);
}
if (op === "update") {
const vals = body.values || {};
let allow, extra = "", eb = [];
switch (t) {
case "files": case "reports": case "copyright_reports": case "site_settings": case "file_reviews": case "file_study": if (!c.admin) throw new Deny("not allowed"); allow = null; break;
case "ratings": if (!c.me) throw new Deny("not signed in"); if (await c.banned()) throw new Deny("You are banned."); allow = ["stars", "text", "at"]; extra = "user_id=?"; eb = [c.me.id]; break;
default: throw new Deny("not allowed");
}
const r = cleanRow(t, vals, allow);
const keys = Object.keys(r);
if (!keys.length) throw new Deny("Nothing to update");
const bind2 = keys.map((k) => r[k]);
const parts = whereSql(t, body.where, bind2);
if (extra) { parts.push(extra); bind2.push(...eb); }
if (!parts.length) throw new Deny("Update needs a filter");
const res = await q(env, `UPDATE ${t} SET ${keys.map((k) => k + "=?").join(",")} WHERE ${parts.join(" AND ")} RETURNING *`, ...bind2).all();
return fin(res.results || []);
}
if (op === "delete") {
const parts = whereSql(t, body.where, bind);
if (!parts.length) throw new Deny("Delete needs a filter");
switch (t) {
case "files": if (!c.me) throw new Deny("not signed in"); if (!c.admin) { parts.push("uploader_id=?"); bind.push(c.me.id); } break;
case "ratings": if (!c.me) throw new Deny("not signed in"); if (!c.admin) { parts.push("user_id=?"); bind.push(c.me.id); } break;
case "reports": case "copyright_reports": case "custom_courses": case "file_reviews": case "file_study": case "site_settings": if (!c.admin) throw new Deny("not allowed"); break;
default: throw new Deny("not allowed");
}
const res = await q(env, `DELETE FROM ${t} WHERE ${parts.join(" AND ")} RETURNING *`, ...bind).all();
return fin(res.results || []);
}
throw new Deny("Bad operation", "42601");
}
const BH = "datetime(at,'+3 hours')";
const day = (col) => `date(${col},'+3 hours')`;
function last30() { const out = []; const now = Date.now() + 3 * 3600e3; for (let i = 29; i >= 0; i--) out.push(new Date(now - i * 86400e3).toISOString().slice(0, 10)); return out; }
const adminOnly = (c) => { if (!c.admin) throw new Deny("not allowed"); };
const ownerOnly = (c) => { if (!c.owner) throw new Deny("Only the owner can do this"); };
const NAME_RE = /^[A-Za-z0-9_.؀-ۿ-]{3,20}$/;
const RESERVED = ["admin", "administrator", "moderator", "owner", "support", "staff", "studyhub", "study-hub", "study_hub", "studybh"];
const RPC = {
async admin_role(a, c) { return c.role; },
async name_available(a, c, env) { const n = String(a.n || "").trim(); return !(await one(env, "SELECT 1 x FROM profiles WHERE lower(name)=lower(?) AND id<>?", n, c.me ? c.me.id : "")); },
async set_username(a, c, env) {
if (!c.me) throw new Deny("Sign in first", "P0001");
const v = String(a.n || "").trim();
if (!NAME_RE.test(v)) throw new Deny("Use 3 to 20 letters, numbers, dots, dashes or underscores (no spaces)", "P0001");
if (RESERVED.includes(v.toLowerCase()) && !c.admin) throw new Deny("That name is reserved", "P0001");
if (await one(env, "SELECT 1 x FROM profiles WHERE id=? AND chosen=1", c.me.id)) throw new Deny("Your username is already set", "P0001");
if (await one(env, "SELECT 1 x FROM profiles WHERE lower(name)=lower(?) AND id<>?", v, c.me.id)) throw new Deny("That name is already taken", "P0001");
const r = await q(env, "UPDATE profiles SET name=?, chosen=1 WHERE id=?", v, c.me.id).run();
if (!r.meta.changes) await q(env, "INSERT INTO profiles(id,name,chosen) VALUES(?,?,1)", c.me.id, v).run();
return v;
},
async log_time(a, c, env) {
const s = Math.floor(num(a.p_secs, 0)); if (s < 1) return null;
await q(env, "INSERT INTO time_spent(at,sid,uid,page,uni,major,year,subject,dev,secs) VALUES(?,?,?,?,?,?,?,?,?,?)", NOW(), String(a.p_sid || "").slice(0, 64), c.me ? c.me.id : null, String(a.p_page || "").slice(0, 40), a.p_uni ? String(a.p_uni).slice(0, 80) : null, a.p_major ? String(a.p_major).slice(0, 120) : null, a.p_year ? String(a.p_year).slice(0, 40) : null, a.p_subject ? String(a.p_subject).slice(0, 160) : null, String(a.p_dev || "").slice(0, 12), Math.min(s, 120)).run();
return null;
},
async admin_list(a, c, env) { ownerOnly(c); return all(env, "SELECT email,role,added_at FROM admins ORDER BY role, added_at"); },
async admin_add(a, c, env) {
ownerOnly(c); const e = String(a.e || "").trim().toLowerCase();
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new Deny("Enter a valid email", "P0001");
await q(env, "INSERT OR IGNORE INTO admins(email,role) VALUES(?,'mod')", e).run(); return null;
},
async admin_remove(a, c, env) { ownerOnly(c); await q(env, "DELETE FROM admins WHERE lower(email)=lower(?) AND role<>'owner'", String(a.e || "")).run(); return null; },
async admin_ban(a, c, env) {
adminOnly(c);
if (a.uid === c.me.id) throw new Deny("You cannot ban yourself", "P0001");
if (a.b) await q(env, "INSERT OR IGNORE INTO banned(user_id) VALUES(?)", a.uid).run(); else await q(env, "DELETE FROM banned WHERE user_id=?", a.uid).run();
return null;
},
async admin_rename(a, c, env) {
adminOnly(c); const n = String(a.n || "").trim();
if (n.length < 3 || n.length > 30) throw new Deny("Name must be 3 to 30 characters", "P0001");
if (await one(env, "SELECT 1 x FROM profiles WHERE lower(name)=lower(?) AND id<>?", n, a.uid)) throw new Deny("That name is already taken", "P0001");
await q(env, "UPDATE profiles SET name=? WHERE id=?", n, a.uid).run(); return null;
},
async admin_users(a, c, env) {
adminOnly(c);
const rows = await all(env, `SELECT u.id, p.name, u.email, u.created_at, u.last_sign_in,
(SELECT count(*) FROM files f WHERE f.uploader_id=u.id) files, (SELECT count(*) FROM ratings r WHERE r.user_id=u.id) reviews,
EXISTS(SELECT 1 FROM banned b WHERE b.user_id=u.id) banned FROM users u LEFT JOIN profiles p ON p.id=u.id ORDER BY u.created_at DESC`);
return rows.map((r) => ({ ...r, banned: !!r.banned }));
},
async admin_storage(a, c, env) {
adminOnly(c);
const r = await one(env, "SELECT coalesce(sum(CASE WHEN asset_path NOT LIKE 'r2:%' THEN size_bytes END),0) supabase, coalesce(sum(CASE WHEN asset_path LIKE 'r2:%' THEN size_bytes END),0) r2 FROM files");
return r;
},
async admin_open_counts(a, c, env) {
adminOnly(c); const d = clamp(Math.floor(num(a.p_days, 30)), 1, 365);
return all(env, "SELECT ref, count(*) opens, count(DISTINCT sid) visitors FROM page_views WHERE kind='open' AND at > ? GROUP BY ref", new Date(Date.now() - d * 86400e3).toISOString());
},
async admin_stats(a, c, env) {
adminOnly(c);
const today = new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10);
const d7 = new Date(Date.now() + 3 * 3600e3 - 6 * 86400e3).toISOString().slice(0, 10);
const cnt = async (sql, ...p) => (await one(env, sql, ...p)).n || 0;
const days = last30();
const dailyRows = await all(env, `SELECT ${day("at")} d, count(*) views, count(DISTINCT sid) visitors FROM page_views WHERE kind='page' AND ${day("at")} >= ? GROUP BY d`, days[0]);
const dm = Object.fromEntries(dailyRows.map((r) => [r.d, r]));
return {
files: await cnt("SELECT count(*) n FROM files"), users: await cnt("SELECT count(*) n FROM profiles"), reviews: await cnt("SELECT count(*) n FROM ratings"), banned: await cnt("SELECT count(*) n FROM banned"),
storage_bytes: await cnt("SELECT coalesce(sum(size_bytes),0) n FROM files"),
views: await cnt("SELECT count(*) n FROM page_views WHERE kind='page'"), visitors: await cnt("SELECT count(DISTINCT sid) n FROM page_views WHERE kind='page'"),
views_today: await cnt(`SELECT count(*) n FROM page_views WHERE kind='page' AND ${day("at")}=?`, today), visitors_today: await cnt(`SELECT count(DISTINCT sid) n FROM page_views WHERE kind='page' AND ${day("at")}=?`, today),
views_7d: await cnt(`SELECT count(*) n FROM page_views WHERE kind='page' AND ${day("at")}>=?`, d7), visitors_7d: await cnt(`SELECT count(DISTINCT sid) n FROM page_views WHERE kind='page' AND ${day("at")}>=?`, d7),
opens: await cnt("SELECT count(*) n FROM page_views WHERE kind='open'"),
daily: days.map((d) => ({ day: d, views: dm[d] ? dm[d].views : 0, visitors: dm[d] ? dm[d].visitors : 0 })),
pages: await all(env, "SELECT ref page, count(*) views FROM page_views WHERE kind='page' GROUP BY ref ORDER BY 2 DESC LIMIT 10"),
top_files: await all(env, "SELECT f.title, f.uni, count(*) opens FROM page_views v JOIN files f ON f.asset_path=v.ref WHERE v.kind='open' GROUP BY f.id, f.title, f.uni ORDER BY 3 DESC LIMIT 10"),
by_uni: await all(env, "SELECT uni, count(*) files FROM files GROUP BY uni ORDER BY 2 DESC"),
zones: await all(env, "SELECT coalesce(nullif(tz,''),'Unknown') zone, count(DISTINCT sid) visitors FROM page_views WHERE kind='page' GROUP BY 1 ORDER BY 2 DESC LIMIT 10"),
devices: await all(env, "SELECT coalesce(dev,'computer') dev, count(DISTINCT sid) visitors FROM page_views WHERE kind='page' GROUP BY 1 ORDER BY 2 DESC"),
langs: await all(env, "SELECT coalesce(lang,'en') lang, count(DISTINCT sid) visitors FROM page_views WHERE kind='page' GROUP BY 1 ORDER BY 2 DESC"),
sources: await all(env, "SELECT coalesce(nullif(src,''),'direct') src, count(DISTINCT sid) visitors FROM page_views WHERE kind='page' GROUP BY 1 ORDER BY 2 DESC LIMIT 10"),
};
},
async admin_time(a, c, env) {
adminOnly(c);
const today = new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10);
const d7 = new Date(Date.now() + 3 * 3600e3 - 6 * 86400e3).toISOString().slice(0, 10);
const n = async (sql, ...p) => (await one(env, sql, ...p)).n || 0;
const days = last30();
const dr = Object.fromEntries((await all(env, `SELECT ${day("at")} d, sum(secs) secs, count(DISTINCT coalesce(uid,sid)) people FROM time_spent WHERE ${day("at")}>=? GROUP BY d`, days[0])).map((r) => [r.d, r]));
const hr = Object.fromEntries((await all(env, "SELECT cast(strftime('%H',datetime(at,'+3 hours')) AS INTEGER) h, sum(secs) secs FROM time_spent GROUP BY h")).map((r) => [r.h, r.secs]));
return {
total: await n("SELECT coalesce(sum(secs),0) n FROM time_spent"), today: await n(`SELECT coalesce(sum(secs),0) n FROM time_spent WHERE ${day("at")}=?`, today),
days7: await n(`SELECT coalesce(sum(secs),0) n FROM time_spent WHERE ${day("at")}>=?`, d7),
members: await n("SELECT count(DISTINCT uid) n FROM time_spent WHERE uid IS NOT NULL"), guests: await n("SELECT count(DISTINCT sid) n FROM time_spent WHERE uid IS NULL"),
guest_secs: await n("SELECT coalesce(sum(secs),0) n FROM time_spent WHERE uid IS NULL"),
daily: days.map((d) => ({ day: d, secs: dr[d] ? dr[d].secs : 0, people: dr[d] ? dr[d].people : 0 })),
hours: Array.from({ length: 24 }, (_, h) => ({ hr: h, secs: hr[h] || 0 })),
pages: await all(env, "SELECT coalesce(page,'?') page, sum(secs) secs FROM time_spent GROUP BY 1 ORDER BY 2 DESC"),
users: await all(env, `SELECT t.uid, sum(t.secs) secs, count(DISTINCT date(t.at,'+3 hours')) days, min(t.at) first_at, max(t.at) last_at,
(SELECT s.subject FROM time_spent s WHERE s.uid=t.uid AND s.subject IS NOT NULL GROUP BY s.subject ORDER BY sum(s.secs) DESC LIMIT 1) top_subject
FROM time_spent t WHERE t.uid IS NOT NULL GROUP BY t.uid ORDER BY 2 DESC LIMIT 300`),
subjects: await all(env, "SELECT uni,major,year,subject,sum(secs) secs,count(DISTINCT coalesce(uid,sid)) people,max(at) last_at FROM time_spent WHERE subject IS NOT NULL GROUP BY uni,major,year,subject ORDER BY 5 DESC LIMIT 300"),
no_subject: await n("SELECT coalesce(sum(secs),0) n FROM time_spent WHERE page='library' AND subject IS NULL"),
};
},
async admin_user_time(a, c, env) {
adminOnly(c); const u = a.p_uid; const days = last30();
const dr = Object.fromEntries((await all(env, `SELECT ${day("at")} d, sum(secs) secs FROM time_spent WHERE uid=? AND ${day("at")}>=? GROUP BY d`, u, days[0])).map((r) => [r.d, r.secs]));
return {
total: (await one(env, "SELECT coalesce(sum(secs),0) n FROM time_spent WHERE uid=?", u)).n,
daily: days.map((d) => ({ day: d, secs: dr[d] || 0 })),
subjects: await all(env, "SELECT uni,major,year,subject,sum(secs) secs FROM time_spent WHERE uid=? AND subject IS NOT NULL GROUP BY 1,2,3,4 ORDER BY 5 DESC LIMIT 20", u),
recent: await all(env, "SELECT at,page,subject,secs,dev FROM time_spent WHERE uid=? ORDER BY at DESC LIMIT 40", u),
};
},
};
const validKey = (k) => typeof k === "string" && k.length < 300 && !k.includes("..") && /^[0-9a-f-]{36}\/[A-Za-z0-9._-]+$/.test(k);
async function objToken(env, key, mode, uid, ttl) { return sign(env, { k: key, m: mode, u: uid || "", exp: Math.floor(Date.now() / 1000) + ttl }); }
async function r2Action(body, c, env) {
const action = body.action;
if (action === "sign-download") {
const key = String(body.id || "").replace(/^r2:/, "");
if (!validKey(key)) return [400, { error: "bad_key" }];
const row = await one(env, "SELECT hidden,uploader_id FROM files WHERE asset_path=?", "r2:" + key);
if (row && row.hidden && !(c.me && (c.me.id === row.uploader_id || c.admin))) return [403, { error: "hidden" }];
return [200, { url: "/api/obj/" + key + "?t=" + encodeURIComponent(await objToken(env, key, "get", "", 300)) }];
}
if (!c.me) return [401, { error: "not_signed_in" }];
if (action === "sign-upload") {
if (await c.banned()) return [403, { error: "banned" }];
const size = Number(body.size) || 0, lim = await getLimits(env), restoring = !!body.key;
if (restoring && !c.owner) return [403, { error: "not_allowed" }];
if (size < 1 || size > (restoring ? HARD_FILE : lim.file)) return [413, { error: "too_big", max: lim.file }];
if (!restoring) {
const total = (await one(env, "SELECT coalesce(sum(size_bytes),0) n FROM files WHERE asset_path LIKE 'r2:%'")).n;
if (total + size > lim.cap) return [507, { error: "r2_full" }];
if (lim.student > 0 && !c.admin) {
const have = (await one(env, "SELECT coalesce(sum(size_bytes),0) n FROM files WHERE uploader_id=?", c.me.id)).n;
if (have + size > lim.student) return [403, { error: "student_quota", max: lim.student }];
}
}
const ext = String(body.ext || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
let key = `${c.me.id}/${uuid()}.${ext}`;
if (restoring) { const want = String(body.key).replace(/^r2:/, ""); if (!validKey(want)) return [403, { error: "not_allowed" }]; key = want; }
return [200, { key: "r2:" + key, url: "/api/obj/" + key + "?t=" + encodeURIComponent(await objToken(env, key, "put", c.me.id, 600)) }];
}
if (action === "commit") {
const key = String(body.id || "").replace(/^r2:/, "");
if (!validKey(key) || !key.startsWith(c.me.id + "/")) return [400, { error: "bad_key" }];
const h = await env.BUCKET.head(key);
if (!h) return [404, { error: "missing" }];
const size = h.size, limFile = (await getLimits(env)).file;
if (size < 1 || size > HARD_FILE || (size > limFile && !c.admin)) { await env.BUCKET.delete(key); return [413, { error: "too_big" }]; }
return [200, { size }];
}
if (action === "delete") {
const key = String(body.id || "").replace(/^r2:/, "");
if (!validKey(key)) return [400, { error: "bad_key" }];
if (!key.startsWith(c.me.id + "/") && !c.admin) return [403, { error: "not_allowed" }];
await env.BUCKET.delete(key);
return [200, { ok: true }];
}
return [400, { error: "unknown_action" }];
}
async function objHandler(req, env, url) {
const key = decodeURIComponent(url.pathname.slice("/api/obj/".length));
if (!validKey(key)) return j({ error: "bad_key" }, 400);
const tk = await verify(env, url.searchParams.get("t"));
const want = req.method === "PUT" ? "put" : "get";
if (!tk || tk.k !== key || tk.m !== want) return j({ error: "bad_token" }, 403);
if (req.method === "PUT") {
const len = Number(req.headers.get("Content-Length") || 0);
if (len > HARD_FILE) return j({ error: "too_big" }, 413);
await env.BUCKET.put(key, req.body, { httpMetadata: { contentType: req.headers.get("Content-Type") || "application/octet-stream" } });
return j({ ok: true });
}
const range = req.headers.get("Range");
const o = await env.BUCKET.get(key, range ? { range: req.headers } : {});
if (!o) return j({ error: "not_found" }, 404);
const h = new Headers({ "Content-Type": (o.httpMetadata && o.httpMetadata.contentType) || "application/octet-stream", "Accept-Ranges": "bytes", "Cache-Control": "private, max-age=300", ETag: o.httpEtag });
if (range && o.range) { const r = o.range; const off = r.offset ?? 0, len = r.length ?? o.size - off; h.set("Content-Range", `bytes ${off}-${off + len - 1}/${o.size}`); h.set("Content-Length", String(len)); return new Response(o.body, { status: 206, headers: h }); }
h.set("Content-Length", String(o.size));
return new Response(o.body, { headers: h });
}
export default {
async fetch(req, env) {
const url = new URL(req.url);
const p = url.pathname;
try {
if (p === "/auth/google") return authStart(req, env, url);
if (p === "/auth/callback") return authCallback(req, env, url);
if (p.startsWith("/api/obj/")) return objHandler(req, env, url);
if (p.startsWith("/api/pub/")) return new Response(null, { status: 302, headers: { Location: "https://poqwmhnfruzmojgdnfcr.supabase.co/storage/v1/object/public/files/" + p.slice(9), "Cache-Control": "public, max-age=3600" } });
if (!p.startsWith("/api/")) return new Response("Not found", { status: 404 });
if (req.method === "GET" && p === "/api/session") {
const c = await ctx(req, env);
return j({ user: c.me ? { id: c.me.id, email: c.me.email, user_metadata: { name: c.me.name || "", full_name: c.me.name || "" } } : null });
}
if (req.method === "GET" && p === "/api/ver") {
const f = await one(env, "SELECT count(*) n, coalesce(max(created_at),'') m FROM files");
const r = await one(env, "SELECT count(*) n, coalesce(max(at),'') m FROM ratings");
return j({ files: f.n + f.m, ratings: r.n + r.m });
}
if (req.method !== "POST") return j({ error: "method" }, 405);
const origin = req.headers.get("Origin");
if (origin && origin !== url.origin) return j({ error: "origin" }, 403);
if (p === "/api/signout") return j({ ok: true }, 200, { "Set-Cookie": setCookie("sh", "", 0) });
const body = await req.json().catch(() => ({}));
const c = await ctx(req, env);
if (p === "/api/db") {
try { return j({ data: await dbHandler(body, c, env) }); }
catch (e) { if (e instanceof Deny) return j({ error: { message: e.message, code: e.code } }); const m = String(e.message || e); return j({ error: { message: /UNIQUE/i.test(m) ? "duplicate key value violates unique constraint" : m, code: /UNIQUE/i.test(m) ? "23505" : "500" } }); }
}
if (p.startsWith("/api/rpc/")) {
const fn = RPC[p.slice(9)];
if (!fn) return j({ error: { message: "Unknown function", code: "404" } });
try { return j({ data: await fn(body.args || {}, c, env) }); }
catch (e) { if (e instanceof Deny) return j({ error: { message: e.message, code: e.code } }); return j({ error: { message: String(e.message || e), code: "500" } }); }
}
if (p === "/api/r2") { const [st, out] = await r2Action(body, c, env); return j(out, st); }
return j({ error: "not_found" }, 404);
} catch (e) {
return j({ error: { message: String((e && e.message) || e), code: "500" } }, 500);
}
},
};
