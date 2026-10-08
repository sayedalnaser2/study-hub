/* StudyBH data layer: gives the site the same calls it always used, but talks to our own Cloudflare Worker (/api). */
(function () {
  "use strict";
  var API = "";
  function post(path, body) {
    return fetch(API + path, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, body: j }; });
    });
  }
  function err(e) { return e ? { message: e.message || String(e), code: e.code || "error" } : null; }

  function QB(t) { this.q = { t: t, op: "select", cols: "*", where: [], order: [], lim: null, off: null, ret: null }; this.mode = null; }
  var P = QB.prototype;
  P.select = function (c) { if (this.q.op === "select") this.q.cols = c || "*"; else this.q.ret = c && c !== "*" ? c : "*"; return this; };
  P.insert = function (v) { this.q.op = "insert"; this.q.values = v; return this; };
  P.upsert = function (v, o) { this.q.op = "upsert"; this.q.values = v; o = o || {}; this.q.onConflict = o.onConflict || null; this.q.ignoreDup = !!o.ignoreDuplicates; return this; };
  P.update = function (v) { this.q.op = "update"; this.q.values = v; return this; };
  P.delete = function () { this.q.op = "delete"; return this; };
  ["eq", "neq", "gt", "gte", "lt", "lte"].forEach(function (op) { P[op] = function (c, v) { this.q.where.push({ c: c, op: op, v: v }); return this; }; });
  P.in = function (c, v) { this.q.where.push({ c: c, op: "in", v: v }); return this; };
  P.is = function (c, v) { this.q.where.push({ c: c, op: "is", v: v }); return this; };
  P.order = function (c, o) { this.q.order.push([c, !o || o.ascending !== false]); return this; };
  P.limit = function (n) { this.q.lim = n; return this; };
  P.range = function (a, b) { this.q.off = a; this.q.lim = b - a + 1; return this; };
  P.single = function () { this.mode = "single"; return this; };
  P.maybeSingle = function () { this.mode = "maybe"; return this; };
  P.then = function (ok, bad) {
    var self = this, q = this.q;
    var body = { t: q.t, op: q.op, cols: q.cols, where: q.where, order: q.order, lim: q.lim, off: q.off, values: q.values, onConflict: q.onConflict, ignoreDup: q.ignoreDup, ret: q.ret };
    var p = post("/api/db", body).then(function (r) {
      var j = r.body;
      if (j.error) return { data: null, error: err(j.error) };
      var d = j.data;
      if (self.mode && Array.isArray(d)) {
        if (d.length > 1 && self.mode === "single") return { data: null, error: { message: "More than one row returned", code: "PGRST116" } };
        if (d.length === 0) return self.mode === "single" ? { data: null, error: { message: "No rows found", code: "PGRST116" } } : { data: null, error: null };
        return { data: d[0], error: null };
      }
      return { data: d, error: null };
    }, function (e) { return { data: null, error: err(e) }; });
    return p.then(ok, bad);
  };

  // sign-in
  var cur = null, loaded = null, listeners = [];
  function loadSession(force) {
    if (!force && loaded) return loaded;
    loaded = fetch(API + "/api/session", { credentials: "same-origin", cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) {
      cur = j && j.user ? { user: j.user, access_token: "cookie" } : null; return cur;
    }).catch(function () { return cur; });
    return loaded;
  }
  var auth = {
    getSession: function () { return loadSession().then(function (s) { return { data: { session: s }, error: null }; }); },
    getUser: function () { return loadSession().then(function (s) { return { data: { user: s ? s.user : null }, error: null }; }); },
    onAuthStateChange: function (cb) {
      listeners.push(cb);
      loadSession().then(function (s) { try { cb("INITIAL_SESSION", s); } catch (e) {} });
      return { data: { subscription: { unsubscribe: function () { listeners = listeners.filter(function (x) { return x !== cb; }); } } } };
    },
    signInWithOAuth: function (o) {
      var next = "/";
      try { var u = new URL((o && o.options && o.options.redirectTo) || location.href, location.href); next = u.pathname + (u.search || ""); } catch (e) {}
      location.href = "/auth/google?next=" + encodeURIComponent(next);
      return Promise.resolve({ data: {}, error: null });
    },
    signOut: function () {
      return post("/api/signout").then(function () { cur = null; loaded = Promise.resolve(null); listeners.slice().forEach(function (cb) { try { cb("SIGNED_OUT", null); } catch (e) {} }); return { error: null }; });
    }
  };

  function rpc(name, args) {
    return post("/api/rpc/" + name, { args: args || {} }).then(function (r) {
      return r.body.error ? { data: null, error: err(r.body.error) } : { data: r.body.data === undefined ? null : r.body.data, error: null };
    }, function (e) { return { data: null, error: err(e) }; });
  }

  var functions = {
    invoke: function (name, o) {
      return post("/api/r2", (o && o.body) || {}).then(function (r) {
        if (r.status >= 200 && r.status < 300) return { data: r.body, error: null };
        return { data: null, error: { message: "Edge Function returned a non-2xx status code", context: { json: function () { return Promise.resolve(r.body); } } } };
      }, function (e) { return { data: null, error: { message: String(e && e.message || e), context: { json: function () { return Promise.reject(e); } } } }; });
    }
  };

  // Old files that may still live outside our bucket: read-only links.
  var storage = {
    from: function () {
      return {
        getPublicUrl: function (p) { return { data: { publicUrl: "/api/pub/" + String(p).split("/").map(encodeURIComponent).join("/") } }; },
        remove: function () { return Promise.resolve({ data: [], error: null }); },
        upload: function () { return Promise.resolve({ data: null, error: { message: "Uploads go through the new storage", code: "unsupported" } }); }
      };
    }
  };

  // Live updates: check every 30 seconds whether files or reviews changed, then re-run the callback.
  var chans = [];
  var lastVer = null;
  function poll() {
    if (!chans.length || document.hidden) return;
    fetch(API + "/api/ver", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (v) {
      var s = JSON.stringify(v);
      if (lastVer !== null && s !== lastVer) chans.forEach(function (c) { if (c.t === "files" && v.files !== JSON.parse(lastVer).files || c.t === "ratings" && v.ratings !== JSON.parse(lastVer).ratings) { try { c.cb(); } catch (e) {} } });
      lastVer = s;
    }).catch(function () {});
  }
  setInterval(poll, 30000);
  function channel() {
    var ch = { t: null, cb: null };
    var api = {
      on: function (ev, f, cb) { ch.t = f && f.table; ch.cb = cb; return api; },
      subscribe: function () { chans.push(ch); if (lastVer === null) poll(); return api; },
      _ch: ch
    };
    return api;
  }

  window.__sbClient = {
    from: function (t) { return new QB(t); }, rpc: rpc, auth: auth, functions: functions, storage: storage,
    channel: channel, removeChannel: function (c) { chans = chans.filter(function (x) { return !c || x !== c._ch; }); }
  };
  window.supabase = { createClient: function () { return window.__sbClient; } };
})();
