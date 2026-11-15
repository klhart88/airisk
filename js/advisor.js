/* Quick Response Advisor — self-contained module.
   Depends on: AIProvider (js/ai-provider.js). Optional: Store (sync) and PROGRAM (tags).
   Without Store it saves history to localStorage, so this file can run as a standalone page. */
(function () {
  const AI = window.AIProvider;
  const P = window.PROGRAM || null;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const SYSTEM = [
    "You are an experienced AI Governance & Risk Manager at a large enterprise. A colleague, often a fraud or risk leader, has just asked the user a question in conversation. The user needs a short answer they can say aloud right now.",
    "",
    "How to answer:",
    "- 3 to 5 sentences, roughly 60 to 110 words, in plain conversational English, spoken in the first person as the advisor.",
    "- No headings, bullet points, markdown, or preamble. Do not restate the question.",
    "- Lead with the direct answer. Then give the single most important consideration. Add a practical next step only if it comes naturally.",
    "- Mention a framework or standard (for example NIST AI RMF, ISO/IEC 42001, the EU AI Act) only when it genuinely helps answer the question.",
    "- Be accurate and measured. If the honest answer depends on facts you don't have, say what it depends on. If it needs a legal or compliance determination, say so briefly.",
    "- Never invent company-specific facts, policies, vendor details or statistics.",
    "",
    "Perspective you hold (use only when relevant):",
    "- AI-enabled applications are assessed on four layers: the application and its AI capability; the model provider and dependencies; data grounding and retrieval; integrations, MCP servers and tool access.",
    "- Approving an application is not approving its AI. A vendor app can embed a model provider outside the company's approved AI environment, such as its Copilot ecosystem.",
    "- Model provider status: approved provider means standard review; a new provider needs a provider assessment or exception; an undisclosed or uncontrolled provider means withholding approval until there is transparency and adequate controls.",
    "- A new AI feature, a new integration or MCP connection, a model or provider change, or a vendor acquisition should trigger reassessment.",
    "- Key vendor questions: which models, hosted where, what data is sent, retention, training use, sub-processors, and notice of model changes."
  ].join("\n");

  /* ---------- records (synced Store if present, else localStorage) ---------- */
  const LOCAL = "airisk.qra.local.v1";
  const Records = window.Store ? {
    list: () => window.Store.list("qra:").map(r => Object.assign({ id: r.id }, r.data)),
    get: id => window.Store.get(id),
    set: (id, d) => window.Store.set(id, d),
    remove: id => window.Store.remove(id),
    onChange: fn => window.Store.onChange(k => { if (k === "remote") fn(); })
  } : (function () {
    const all = () => { try { return JSON.parse(localStorage.getItem(LOCAL) || "{}"); } catch (e) { return {}; } };
    const put = o => localStorage.setItem(LOCAL, JSON.stringify(o));
    return {
      list: () => Object.entries(all()).map(([id, d]) => Object.assign({ id }, d)),
      get: id => all()[id] || null,
      set: (id, d) => { const o = all(); o[id] = d; put(o); },
      remove: id => { const o = all(); delete o[id]; put(o); },
      onChange: () => {}
    };
  })();

  /* ---------- state ---------- */
  let view = "ask";            // ask | history | settings
  let recog = null, listening = false, finalText = "", interim = "";
  let controller = null;
  let lastAnswer = "", lastQuestion = "", busy = false, errorMsg = "";
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  function setStatus(t) { const el = $("#qra-status"); if (el) el.textContent = t; }

  /* ---------- views ---------- */
  function render() {
    $$(".qra-tabs button").forEach(b => b.classList.toggle("active", b.dataset.view === view));
    if (view === "history") return renderHistory();
    if (view === "settings") return renderSettings();
    renderAsk();
  }

  function renderAsk() {
    if (!AI.isConfigured()) { renderSettings(true); return; }
    $("#qra-main").innerHTML = `
      <div class="qra-q">
        <textarea id="qra-text" rows="3" placeholder="${SR ? "Tap Record and ask the question" : "Type the question"}">${esc(lastQuestion)}</textarea>
      </div>
      <div class="qra-controls">
        ${SR ? `<button id="qra-rec" class="qra-rec ${listening ? "on" : ""}" aria-label="${listening ? "Stop recording" : "Record"}"><span></span>${listening ? "Stop" : "Record"}</button>` : ""}
        <button id="qra-ask" class="btn primary">Ask</button>
        <button id="qra-clear" class="btn">Clear</button>
      </div>
      <p id="qra-status" class="qra-status">${busy ? "Thinking…" : listening ? "Listening…" : "Ready"}</p>
      <p class="qra-note">Don't include confidential company, customer or vendor details.</p>
      ${errorMsg ? `<div class="qra-error">${esc(errorMsg)}</div>` : ""}
      <div id="qra-answer" class="qra-answer ${lastAnswer || busy ? "" : "empty"}">
        <div id="qra-answer-text">${esc(lastAnswer)}</div>
        ${lastAnswer || busy ? `<p class="qra-label">Educational assistance — not formal audit, legal or compliance advice.</p>` : ""}
      </div>`;
    if (!SR) setStatus("Voice isn't available in this browser — type the question instead.");
    $("#qra-ask").addEventListener("click", () => ask($("#qra-text").value));
    $("#qra-clear").addEventListener("click", () => { stopListening(true); if (controller) controller.abort(); lastQuestion = ""; lastAnswer = ""; errorMsg = ""; busy = false; renderAsk(); });
    $("#qra-text").addEventListener("input", e => { lastQuestion = e.target.value; });
    $("#qra-text").addEventListener("keydown", e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ask(e.target.value); });
    if (SR) $("#qra-rec").addEventListener("click", () => listening ? stopListening(false) : startListening());
  }

  /* ---------- voice ---------- */
  function startListening() {
    if (controller) controller.abort();
    finalText = ""; interim = ""; lastAnswer = ""; errorMsg = "";
    recog = new SR();
    recog.lang = "en-US";
    recog.continuous = true;
    recog.interimResults = true;
    recog.onresult = e => {
      interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t; else interim += t;
      }
      const box = $("#qra-text"); if (box) box.value = (finalText + interim).trim();
      lastQuestion = (finalText + interim).trim();
    };
    recog.onerror = e => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") errorMsg = "Microphone access was blocked. Allow it in your browser settings, or type the question.";
      else if (e.error !== "aborted" && e.error !== "no-speech") errorMsg = "Voice capture error (" + e.error + "). You can type the question instead.";
    };
    recog.onend = () => {
      const wasListening = listening;
      listening = false;
      const q = (finalText + interim).trim();
      if (wasListening && q && !recog._cancel) ask(q); else renderAsk();
    };
    try { recog.start(); listening = true; renderAsk(); }
    catch (e) { errorMsg = "Couldn't start voice capture. Type the question instead."; renderAsk(); }
  }
  function stopListening(cancel) {
    if (!recog || !listening) return;
    recog._cancel = !!cancel;
    try { recog.stop(); } catch (e) {}
  }

  /* ---------- ask ---------- */
  async function ask(q) {
    q = (q || "").trim();
    if (!q) { setStatus("Record or type a question first."); return; }
    if (controller) controller.abort();
    controller = new AbortController();
    lastQuestion = q; lastAnswer = ""; errorMsg = ""; busy = true;
    renderAsk();
    const started = Date.now();
    try {
      const text = await AI.stream({
        system: SYSTEM,
        messages: [{ role: "user", content: q }],
        maxTokens: 400,
        signal: controller.signal,
        onText: t => { lastAnswer = t; const el = $("#qra-answer-text"); if (el) el.textContent = t; }
      });
      lastAnswer = text.trim();
      busy = false;
      if (lastAnswer) {
        const at = new Date().toISOString();
        Records.set("qra:" + Date.now(), { q, a: lastAnswer, at, model: AI.settings().model });
      }
      renderAsk();
      setStatus("Saved to history · " + ((Date.now() - started) / 1000).toFixed(1) + "s");
    } catch (e) {
      busy = false;
      if (e.name === "AbortError") return;
      errorMsg = e.message;
      renderAsk();
    }
  }

  /* ---------- history ---------- */
  let search = "", editing = null;
  function currentWeek() {
    const st = window.Store ? (window.Store.get("settings:main", {}) || {}).startDate : null;
    if (!st) return 1;
    const days = Math.floor((Date.now() - new Date(st + "T00:00:00").getTime()) / 86400000);
    return Math.min(8, Math.max(1, Math.floor(days / 7) + 1));
  }
  function ymd(d) { const z = n => String(n).padStart(2, "0"); return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate()); }

  function renderHistory() {
    const term = search.toLowerCase();
    const items = Records.list()
      .filter(r => !term || (r.q + " " + r.a).toLowerCase().includes(term))
      .sort((a, b) => (b.at || "").localeCompare(a.at || ""));
    const weekOpts = sel => `<option value="">Week…</option>` + (P ? P.weeks.map(w => `<option value="${w.n}" ${+sel === w.n ? "selected" : ""}>Week ${w.n}</option>`).join("") : "");
    const compOpts = sel => `<option value="">Competency…</option>` + (P ? P.competencies.map(c => `<option value="${c.id}" ${sel === c.id ? "selected" : ""}>${esc(c.name)}</option>`).join("") : "");
    $("#qra-main").innerHTML = `
      <input id="qra-search" type="search" placeholder="Search questions and answers" value="${esc(search)}">
      <p class="muted small">${items.length} saved</p>
      ${items.map(r => editing === r.id ? `
        <div class="card qra-item" data-id="${esc(r.id)}">
          <label class="lbl">Question</label><textarea rows="2" data-e="q">${esc(r.q)}</textarea>
          <label class="lbl">Answer</label><textarea rows="5" data-e="a">${esc(r.a)}</textarea>
          <div class="row gap"><button class="btn primary small" data-act="save">Save</button><button class="btn small" data-act="cancel">Cancel</button></div>
        </div>` : `
        <details class="card qra-item" data-id="${esc(r.id)}">
          <summary><span class="qra-item-q">${esc(r.q)}</span><span class="muted small">${new Date(r.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}${r.tag && r.tag.week ? " · Week " + r.tag.week : ""}</span></summary>
          <p>${esc(r.a)}</p>
          ${P ? `<div class="row gap qra-tags"><select data-tag="week">${weekOpts(r.tag && r.tag.week)}</select><select data-tag="cid">${compOpts(r.tag && r.tag.cid)}</select></div>` : ""}
          <div class="row gap">
            ${window.Store ? `<button class="btn small" data-act="review" ${r.reviewed ? "disabled" : ""}>${r.reviewed ? "In review queue" : "Add to review queue"}</button>` : ""}
            <button class="btn small" data-act="edit">Edit</button>
            <button class="btn small" data-act="del">Delete</button>
          </div>
        </details>`).join("") || `<p class="muted">No saved questions${term ? " match your search" : " yet"}.</p>`}`;
    $("#qra-search").addEventListener("input", e => { search = e.target.value; const pos = e.target.selectionStart; renderHistory(); const s = $("#qra-search"); s.focus(); s.setSelectionRange(pos, pos); });
    $$("[data-act]").forEach(b => b.addEventListener("click", e => {
      e.preventDefault();
      const id = b.closest("[data-id]").dataset.id; const r = Records.get(id) || {};
      const act = b.dataset.act;
      if (act === "edit") { editing = id; renderHistory(); }
      else if (act === "cancel") { editing = null; renderHistory(); }
      else if (act === "save") {
        const box = b.closest("[data-id]");
        Records.set(id, Object.assign({}, r, { q: $('[data-e="q"]', box).value.trim(), a: $('[data-e="a"]', box).value.trim() }));
        editing = null; renderHistory();
        const d = $(`[data-id="${CSS.escape(id)}"]`); if (d) d.open = true;
      } else if (act === "del") { if (confirm("Delete this saved question?")) { Records.remove(id); renderHistory(); } }
      else if (act === "review") {
        const due = new Date(); due.setDate(due.getDate() + 7);
        window.Store.set("review:" + id.replace(":", "-"), { prompt: r.q, answer: r.a, week: (r.tag && +r.tag.week) || currentWeek(), source: "Advisor", due: ymd(due), count: 0, created: ymd(new Date()), status: "open" });
        Records.set(id, Object.assign({}, r, { reviewed: true }));
        renderHistory(); const d = $(`[data-id="${CSS.escape(id)}"]`); if (d) d.open = true;
      }
    }));
    $$("[data-tag]").forEach(s => s.addEventListener("change", () => {
      const id = s.closest("[data-id]").dataset.id; const r = Records.get(id) || {};
      const tag = Object.assign({}, r.tag); tag[s.dataset.tag] = s.value || null;
      Records.set(id, Object.assign({}, r, { tag }));
    }));
  }

  /* ---------- settings ---------- */
  function renderSettings(first) {
    const s = AI.settings();
    const ss = window.Store ? window.Store.status() : null;
    $("#qra-main").innerHTML = `
      ${first ? `<div class="notice">Add your Claude API key to start. It's stored only in this browser on this device and sent only to Anthropic.</div>` : ""}
      <section class="card">
        <h2>AI connection</h2>
        <label class="lbl">Claude API key</label>
        <input id="qra-key" type="password" autocomplete="off" placeholder="${s.key ? "Saved ••••" + esc(s.key.slice(-4)) : "sk-ant-…"}">
        <label class="lbl">Model</label>
        <select id="qra-model">${AI.models.map(m => `<option value="${m.id}" ${m.id === s.model ? "selected" : ""}>${esc(m.label)}</option>`).join("")}
          ${AI.models.some(m => m.id === s.model) ? "" : `<option value="${esc(s.model)}" selected>${esc(s.model)}</option>`}</select>
        <details><summary class="small">Use a different model ID</summary><input id="qra-model-custom" placeholder="model ID" value=""></details>
        <div class="row gap"><button class="btn primary small" id="qra-save">Save</button>${s.key ? `<button class="btn small" id="qra-remove">Remove key from this device</button>` : ""}</div>
        <p id="qra-msg" class="small"></p>
      </section>
      ${ss ? `<section class="card"><h2>History sync</h2><p class="small muted">${ss.signedIn ? "Saved questions sync to your account (" + esc(ss.email) + "). The API key never syncs." : "Not signed in: saved questions stay on this device. Sign in from the main app's Settings."}</p></section>` : ""}
      <p class="center small"><a href="index.html">Open the full app</a></p>`;
    $("#qra-save").addEventListener("click", () => {
      const k = $("#qra-key").value.trim();
      const custom = $("#qra-model-custom").value.trim();
      const patch = { model: custom || $("#qra-model").value };
      if (k) patch.key = k;
      if (!k && !s.key) { $("#qra-msg").textContent = "Enter your API key."; return; }
      AI.save(patch);
      view = "ask"; render();
    });
    if ($("#qra-remove")) $("#qra-remove").addEventListener("click", () => { if (confirm("Remove the API key from this device?")) { AI.clearKey(); renderSettings(true); } });
  }

  /* ---------- boot ---------- */
  $$(".qra-tabs button").forEach(b => b.addEventListener("click", () => { view = b.dataset.view; editing = null; render(); }));
  Records.onChange(() => { if (view === "history" && !editing && document.activeElement.id !== "qra-search") renderHistory(); });
  if (window.Store) window.Store.initSync();
  render();
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
