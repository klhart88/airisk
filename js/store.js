/* Local-first record store with optional Supabase sync.
   Every piece of user data is a record: { id, data, updated_at, deleted }.
   Records are kept in localStorage and pushed/pulled to the app_records table. */
(function () {
  const KEY = "airisk.records.v1";
  const META = "airisk.meta.v1";
  const listeners = new Set();
  let records = load(KEY, {});
  let meta = load(META, { lastPull: null, lastSync: null, lastError: null });
  let client = null;
  let user = null;
  let syncing = false;
  let pushTimer = null;

  function load(k, fallback) {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(records));
      localStorage.setItem(META, JSON.stringify(meta));
    } catch (e) { console.warn("Could not save locally", e); }
  }
  // kind: 'local' (this device edited data), 'remote' (data arrived from sync or a restore), 'status' (sync state only)
  function emit(kind) { listeners.forEach(fn => { try { fn(kind || 'status'); } catch (e) { console.error(e); } }); }
  function now() { return new Date().toISOString(); }
  // Postgres returns microseconds (e.g. .123456+00:00); trim to milliseconds so every browser parses it.
  function iso(s) {
    if (!s) return null;
    const d = new Date(String(s).replace(/(\.\d{3})\d+/, "$1"));
    return isNaN(d) ? null : d.toISOString();
  }

  const Store = {
    get(id, fallback) {
      const r = records[id];
      return r && !r.deleted ? r.data : (fallback === undefined ? null : fallback);
    },
    set(id, data) {
      records[id] = { data, updated_at: now(), deleted: false, dirty: true };
      save(); emit('local'); schedulePush();
    },
    update(id, patch, fallback) {
      const cur = Store.get(id, fallback || {});
      Store.set(id, Object.assign({}, cur, patch));
    },
    remove(id) {
      if (!records[id]) return;
      records[id] = { data: {}, updated_at: now(), deleted: true, dirty: true };
      save(); emit('local'); schedulePush();
    },
    list(prefix) {
      return Object.keys(records)
        .filter(k => k.startsWith(prefix) && !records[k].deleted)
        .map(k => ({ id: k, data: records[k].data, updated_at: records[k].updated_at }));
    },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    /* Backup */
    exportAll() {
      return { app: "ai-risk-competency", format: 1, exported_at: now(), records };
    },
    importAll(obj) {
      if (!obj || !obj.records) throw new Error("This file is not an app backup.");
      let n = 0;
      Object.entries(obj.records).forEach(([id, r]) => {
        const mine = records[id];
        if (!mine || (r.updated_at || "") > (mine.updated_at || "")) {
          records[id] = { data: r.data, updated_at: r.updated_at || now(), deleted: !!r.deleted, dirty: true };
          n++;
        }
      });
      save(); emit('remote'); schedulePush();
      return n;
    },

    /* Sync status */
    status() {
      const dirty = Object.values(records).filter(r => r.dirty).length;
      return {
        configured: !!client, signedIn: !!user, email: user ? user.email : null,
        online: navigator.onLine, syncing, dirty,
        lastSync: meta.lastSync, lastError: meta.lastError
      };
    },

    /* Supabase */
    initSync() {
      const cfg = window.APP_CONFIG || {};
      if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) { emit(); return; }
      try {
        client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
          auth: { persistSession: true, autoRefreshToken: true, storageKey: "airisk.auth" }
        });
      } catch (e) { meta.lastError = "Supabase setup failed: " + e.message; save(); emit(); return; }
      client.auth.getSession().then(({ data }) => {
        user = data.session ? data.session.user : null; emit('auth'); Store.sync();
      });
      client.auth.onAuthStateChange((_evt, session) => {
        const was = user && user.id;
        user = session ? session.user : null;
        emit('auth');
        if (user && user.id !== was) Store.sync();
      });
      window.addEventListener("online", () => { emit(); Store.sync(); });
      window.addEventListener("offline", emit);
      document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") Store.sync(); });
      setInterval(() => Store.sync(), 60000);
    },
    async signIn(email, password) {
      if (!client) throw new Error("Sync is not configured.");
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    async signUp(email, password) {
      if (!client) throw new Error("Sync is not configured.");
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) throw error;
      return !data.session; // true when email confirmation is required
    },
    async signOut() { if (client) await client.auth.signOut(); user = null; emit(); },

    async sync() {
      if (!client || !user || !navigator.onLine || syncing) return;
      syncing = true; emit();
      try {
        // Push local changes
        const dirtyIds = Object.keys(records).filter(k => records[k].dirty);
        for (let i = 0; i < dirtyIds.length; i += 200) {
          const batch = dirtyIds.slice(i, i + 200);
          const rows = batch.map(id => ({
            user_id: user.id, id, data: records[id].data,
            updated_at: records[id].updated_at, deleted: records[id].deleted
          }));
          const { error } = await client.from("app_records").upsert(rows, { onConflict: "user_id,id" });
          if (error) throw error;
          batch.forEach(id => { if (records[id]) records[id].dirty = false; });
        }
        // Pull remote changes (small overlap window; merging is idempotent)
        let q = client.from("app_records").select("id,data,updated_at,deleted,server_updated_at")
          .order("server_updated_at", { ascending: true }).limit(1000);
        if (meta.lastPull) {
          const since = new Date(new Date(meta.lastPull).getTime() - 5000).toISOString();
          // lastPull is always stored normalized by iso()
          q = q.gte("server_updated_at", since);
        }
        const { data, error } = await q;
        if (error) throw error;
        let changed = false;
        (data || []).forEach(row => {
          const mine = records[row.id];
          const remoteTs = iso(row.updated_at) || now();
          if (!mine || (!mine.dirty && remoteTs > mine.updated_at)) {
            records[row.id] = { data: row.data, updated_at: remoteTs, deleted: row.deleted, dirty: false };
            changed = true;
          }
          const serverTs = iso(row.server_updated_at);
          if (serverTs && (!meta.lastPull || serverTs > meta.lastPull)) meta.lastPull = serverTs;
        });
        meta.lastSync = now(); meta.lastError = null;
        save();
        if (changed) emit('remote');
      } catch (e) {
        meta.lastError = (e && e.message) ? e.message : String(e);
        save();
      } finally {
        syncing = false; emit();
      }
    }
  };

  function schedulePush() {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => Store.sync(), 2000);
  }

  window.Store = Store;
})();
