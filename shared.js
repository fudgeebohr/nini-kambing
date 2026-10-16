/* ============================================================
   ✏️  SHARED SETTINGS — used by index.html and messages.html
   ============================================================ */
(function () {
  const S = {
    // Paste your Firebase Realtime Database URL here so messages from ALL guests
    // are collected in one place, e.g. "https://your-project-default-rtdb.firebaseio.com"
    // Leave empty = demo mode (messages only saved inside the browser that sent them).
    dbUrl: "https://miro-96563-default-rtdb.asia-southeast1.firebasedatabase.app",

    // Passcode for the secret messages page (change this!)
    adminPasscode: "panini",

    // Only used in demo mode
    localKey: "panini"
  };

  const base = () => S.dbUrl.replace(/\/+$/, "");

  const local = {
    read() { try { return JSON.parse(localStorage.getItem(S.localKey) || "[]"); } catch (_) { return []; } },
    write(arr) { localStorage.setItem(S.localKey, JSON.stringify(arr)); }
  };

  const Store = {
    mode() { return S.dbUrl ? "online" : "local"; },

    async add(msg) {
      if (S.dbUrl) {
        const r = await fetch(base() + "/messages.json", { method: "POST", body: JSON.stringify(msg) });
        if (!r.ok) throw new Error("save failed");
        return;
      }
      const arr = local.read();
      arr.push(Object.assign({ id: "l" + Date.now() + Math.random().toString(36).slice(2, 6) }, msg));
      local.write(arr);
    },

    async list() {
      if (S.dbUrl) {
        const r = await fetch(base() + "/messages.json");
        if (!r.ok) throw new Error("load failed");
        const data = (await r.json()) || {};
        return Object.entries(data)
          .map(([id, v]) => Object.assign({ id }, v))
          .sort((a, b) => (b.ts || 0) - (a.ts || 0));
      }
      return local.read().sort((a, b) => (b.ts || 0) - (a.ts || 0));
    },

    async remove(id) {
      if (S.dbUrl) {
        const r = await fetch(base() + "/messages/" + encodeURIComponent(id) + ".json", { method: "DELETE" });
        if (!r.ok) throw new Error("delete failed");
        return;
      }
      local.write(local.read().filter(m => m.id !== id));
    }
  };

  window.SHARED = S;
  window.MessageStore = Store;
})();