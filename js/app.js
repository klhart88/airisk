/* AI Risk Competency Program — Phase 1 app (learning tracker). */
(function () {
  const P = window.PROGRAM;
  const S = window.Store;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const view = () => $("#view");

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function today() { const d = new Date(); return ymd(d); }
  function ymd(d) { const z = n => String(n).padStart(2, "0"); return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate()); }
  function addDays(dateStr, n) { const d = new Date(dateStr + "T12:00:00"); d.setDate(d.getDate() + n); return ymd(d); }
  function fmtDate(s) { if (!s) return ""; const d = new Date(s.length === 10 ? s + "T12:00:00" : s); return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); }
  function ago(s) {
    if (!s) return "never";
    const m = Math.round((Date.now() - new Date(s).getTime()) / 60000);
    if (m < 1) return "just now"; if (m < 60) return m + " min ago";
    const h = Math.round(m / 60); if (h < 24) return h + " h ago";
    return fmtDate(s);
  }
  function link(r) {
    if (r.ref) return `<a href="#/ref/${esc(r.ref)}">${esc(r.t)}</a>`;
    return r.u ? `<a href="${esc(r.u)}" target="_blank" rel="noopener">${esc(r.t)}</a>` : esc(r.t);
  }
  /* Minimal markdown: ##/### headings, paragraphs, - bullets, 1. lists (4-space nesting), tables, **bold** */
  function md(src) {
    const inline = t => esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    const lines = String(src || "").replace(/^\n+/, "").split("\n");
    let html = "", i = 0;
    const isList = l => /^\s*(- |\d+\. )/.test(l);
    while (i < lines.length) {
      const l = lines[i];
      if (!l.trim()) { i++; continue; }
      if (l.startsWith("### ")) { html += `<h3>${inline(l.slice(4))}</h3>`; i++; continue; }
      if (l.startsWith("## ")) { html += `<h2>${inline(l.slice(3))}</h2>`; i++; continue; }
      if (l.startsWith("|")) {
        const rows = []; while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
        const cells = r => r.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim());
        const body = rows.filter((r, k) => !(k === 1 && /^\|[\s:|-]+\|$/.test(r.trim())));
        html += `<div class="tablewrap"><table class="${cells(body[0]).length >= 4 ? "wide" : ""}"><thead><tr>${cells(body[0]).map(c => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${body.slice(1).map(r => `<tr>${cells(r).map(c => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
        continue;
      }
      if (isList(l)) {
        const block = []; while (i < lines.length && isList(lines[i])) block.push(lines[i++]);
        const build = items => {
          const ordered = /^\d+\. /.test(items[0].trim());
          let out = ordered ? "<ol>" : "<ul>", k = 0;
          while (k < items.length) {
            const text = items[k].trim().replace(/^(- |\d+\. )/, ""); k++;
            const kids = []; while (k < items.length && /^\s{4,}/.test(items[k])) kids.push(items[k++].replace(/^\s{4}/, ""));
            out += `<li>${inline(text)}${kids.length ? build(kids) : ""}</li>`;
          }
          return out + (ordered ? "</ol>" : "</ul>");
        };
        html += build(block); continue;
      }
      const para = []; while (i < lines.length && lines[i].trim() && !/^(#{2,3} |\|)/.test(lines[i]) && !isList(lines[i])) para.push(lines[i++]);
      html += `<p>${inline(para.join(" "))}</p>`;
    }
    return html;
  }
  function slug(s) { return s.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40); }

  /* ---------- data accessors ---------- */
  const settings = () => S.get("settings:main", {});
  const weekData = n => S.get("week:" + n, {});
  const saveWeek = (n, patch) => S.update("week:" + n, patch);

  function currentWeek() {
    const st = settings().startDate;
    if (!st) return 1;
    const days = Math.floor((new Date(today() + "T12:00:00") - new Date(st + "T12:00:00")) / 86400000);
    return Math.min(8, Math.max(1, Math.floor(days / 7) + 1));
  }

  function checklist(w) {
    const d = weekData(w.n);
    const obj = d.objectives || [];
    const res = (d.sc && d.sc.results) || {};
    const r = d.reflection || {};
    return [
      { k: "objectives", label: "Learning objectives met", done: w.objectives.every((_, i) => obj[i]) },
      { k: "selfcheck", label: "Self-check completed", done: w.selfCheck.every((_, i) => res[i]) },
      { k: "prompt", label: w.prompt.type === "teachback" ? "Teach-back " + w.prompt.n + " written" : "“Explain it” answered", done: !!(d.prompt && d.prompt.trim()) },
      { k: "artifact", label: "Portfolio artifact drafted or updated", done: !!d.artifact, manual: true },
      { k: "reflection", label: "Reflection log entry written", done: !!(r.clicked && r.unclear && r.applies) },
      { k: "rating", label: "Competency self-rating updated", done: !!d.rating, manual: true }
    ];
  }
  function weekProgress(w) { const c = checklist(w); return { done: c.filter(x => x.done).length, total: c.length }; }

  function reviewItems() { return S.list("review:").map(r => Object.assign({ id: r.id }, r.data)); }
  function dueReviews() { const t = today(); return reviewItems().filter(r => r.status !== "done" && r.due <= t); }

  function ratings() {
    return S.list("rating:").map(r => Object.assign({ id: r.id }, r.data)).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }
  function latestRating(cid) { return ratings().find(r => r.cid === cid) || null; }

  /* ---------- shell ---------- */
  const NAV = [
    { r: "", label: "Home", icon: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
    { r: "roadmap", label: "Roadmap", icon: "M4 5h16M4 12h16M4 19h10" },
    { r: "review", label: "Review", icon: "M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" },
    { r: "competency", label: "Competency", icon: "M5 20V10M12 20V4M19 20v-7" },
    { href: "advisor.html", label: "Advisor", icon: "M4 5h16v11H9l-5 4z" },
    { r: "settings", label: "Settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" }
  ];
  function route() { const h = location.hash.replace(/^#\/?/, ""); return h.split("/"); }

  function renderNav() {
    const cur = route()[0] === "week" || route()[0] === "ref" ? "roadmap" : route()[0];
    const due = dueReviews().length;
    $("#nav").innerHTML = NAV.map(n => `
      <a href="${n.href || "#/" + n.r}" class="${!n.href && cur === n.r ? "active" : ""}" aria-label="${n.label}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${n.icon}"/></svg>
        <span>${n.label}</span>${n.r === "review" && due ? `<b class="badge">${due}</b>` : ""}
      </a>`).join("");
    renderSyncChip();
  }
  function renderSyncChip() {
    const st = S.status();
    let txt, cls;
    if (!st.configured) { txt = "Local only"; cls = "muted"; }
    else if (!st.signedIn) { txt = "Not signed in"; cls = "warn"; }
    else if (!st.online) { txt = "Offline"; cls = "warn"; }
    else if (st.syncing) { txt = "Syncing…"; cls = "muted"; }
    else if (st.lastError) { txt = "Sync error"; cls = "bad"; }
    else { txt = "Synced " + ago(st.lastSync); cls = "ok"; }
    $("#sync").innerHTML = `<a href="#/settings" class="chip ${cls}">${esc(txt)}</a>`;
  }

  function render() {
    const [r, a] = route();
    window.scrollTo(0, 0);
    if (r === "roadmap") renderRoadmap();
    else if (r === "week") renderWeek(parseInt(a, 10) || 1);
    else if (r === "ref") renderRef(a);
    else if (r === "review") renderReview();
    else if (r === "competency") renderCompetency();
    else if (r === "settings") renderSettings();
    else renderHome();
    renderNav();
  }

  /* ---------- Home ---------- */
  function renderHome() {
    const cw = currentWeek();
    const w = P.weeks[cw - 1];
    const pr = weekProgress(w);
    const due = dueReviews().length;
    const st = settings();
    const weeksDone = P.weeks.filter(x => { const p = weekProgress(x); return p.done === p.total; }).length;
    view().innerHTML = `
      <h1>${esc(P.title)}</h1>
      ${st.startDate ? "" : `<div class="notice">Set your program start date in <a href="#/settings">Settings</a> so the app can track your current week.</div>`}
      <section class="card hero">
        <div class="eyebrow">This week · Week ${w.n} of 8</div>
        <h2>${esc(w.title)}</h2>
        <p>${esc(w.focus)}</p>
        ${bar(pr.done, pr.total)}
        <div class="row"><span class="muted">${pr.done} of ${pr.total} checklist items</span>
        <a class="btn primary" href="#/week/${w.n}">Open week ${w.n}</a></div>
      </section>
      <div class="grid2">
        <section class="card">
          <h3>Review queue</h3>
          <p class="big">${due}</p><p class="muted">${due === 1 ? "item" : "items"} due today</p>
          <a class="btn" href="#/review">Go to review</a>
        </section>
        <section class="card">
          <h3>Program progress</h3>
          <div class="weekdots">${P.weeks.map(x => { const p = weekProgress(x); const c = p.done === p.total ? "done" : p.done ? "part" : ""; return `<a href="#/week/${x.n}" class="${c} ${x.n === cw ? "cur" : ""}" title="Week ${x.n}: ${p.done}/${p.total}">${x.n}</a>`; }).join("")}</div>
          <p class="muted">${weeksDone} of 8 weeks complete</p>
        </section>
      </div>
      <section class="card">
        <h3>Competency snapshot</h3>
        ${P.competencies.map(c => { const l = latestRating(c.id); return `<div class="comp-row"><span>${esc(c.name)}</span><span class="levels">${levelPips(l ? l.rating : 0, c.target)}</span></div>`; }).join("")}
        <a class="btn" href="#/competency">Update ratings</a>
      </section>
      <section class="card">
        <h3>This week's sessions</h3>
        <ol class="sessions">${P.sessions.map(s => `<li><b>${s.n} — ${s.name}</b> <span class="muted">(${s.time})</span><br>${esc(s.what)}</li>`).join("")}</ol>
      </section>`;
  }
  function bar(done, total) { const p = total ? Math.round(100 * done / total) : 0; return `<div class="bar" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p}%"></i></div>`; }
  function levelPips(r, target) {
    const t = parseInt(target, 10);
    let h = "";
    for (let i = 1; i <= 5; i++) h += `<i class="pip ${i <= r ? "on" : ""} ${i === t ? "tgt" : ""}" title="${i === t ? "Target" : ""}"></i>`;
    return h + `<small>${r ? r : "–"}/${esc(target)}</small>`;
  }

  /* ---------- Roadmap ---------- */
  function renderRoadmap() {
    const cw = currentWeek();
    view().innerHTML = `
      <h1>Roadmap</h1>
      <p class="muted">Eight weeks, 3–4 hours each. Understanding comes first; the portfolio proves it.</p>
      <a class="card" href="#/ref"><div class="eyebrow">Reference</div><h3>Reference readings</h3><p class="muted small">Model, LLM and MCP server · Providers, models and hidden AI dependencies · Assessment toolkit</p></a>
      ${P.weeks.map(w => { const p = weekProgress(w); return `
        <a class="card weekcard ${w.n === cw ? "current" : ""}" href="#/week/${w.n}">
          <div class="row"><span class="eyebrow">Week ${w.n}${w.n === cw ? " · this week" : ""}</span><span class="muted">${p.done}/${p.total}</span></div>
          <h3>${esc(w.title)}</h3>
          <p class="muted small">${esc(w.deliverable)}</p>
          ${bar(p.done, p.total)}
        </a>`; }).join("")}`;
  }

  /* ---------- Reference ---------- */
  function renderRef(id) {
    const R = (window.LEARNING && window.LEARNING.references) || {};
    const doc = R[id];
    if (!doc) {
      view().innerHTML = `<h1>Reference</h1><p class="muted">Readings adapted from the program's research, used alongside the weekly core readings.</p>
        ${Object.entries(R).map(([k, d]) => `<a class="card" href="#/ref/${k}"><h3>${esc(d.title)}</h3><p class="muted small">${esc(d.source)}</p></a>`).join("")}`;
      return;
    }
    const usedIn = P.weeks.filter(w => ["core", "against", "extension"].some(g => (w.readings[g] || []).some(r => r.ref === id))).map(w => w.n);
    view().innerHTML = `
      <div class="crumbs"><a href="#/ref">Reference</a> › ${esc(doc.title)}</div>
      <article class="card reading"><h1>${esc(doc.title)}</h1><p class="muted small">${esc(doc.source)}</p>${md(doc.body)}</article>
      <div class="row gap">${usedIn.map(n => `<a class="btn small" href="#/week/${n}">Back to Week ${n}</a>`).join("")}</div>`;
  }

  /* ---------- Week ---------- */
  function renderWeek(n) {
    const w = P.weeks[Math.min(8, Math.max(1, n)) - 1];
    const d = weekData(w.n);
    const obj = d.objectives || [];
    const rd = d.readings || {};
    const sc = d.sc || { answers: {}, results: {}, shown: {} };
    const refl = d.reflection || {};
    const list = checklist(w);
    const promptLabel = w.prompt.type === "teachback" ? `Teach-back ${w.prompt.n} of 3` : "Explain it";

    const readingGroup = (key, label, items) => items && items.length ? `
      <h4>${label}</h4><ul class="checks">${items.map((r, i) => { const id = key + ":" + slug(r.t); return `
        <li><label><input type="checkbox" data-reading="${id}" ${rd[id] ? "checked" : ""}> <span>${link(r)}</span></label></li>`; }).join("")}</ul>` : "";

    view().innerHTML = `
      <div class="crumbs"><a href="#/roadmap">Roadmap</a> › Week ${w.n}</div>
      <h1>Week ${w.n}: ${esc(w.title)}</h1>
      <p class="lead">${esc(w.focus)}</p>
      <div class="weeknav">
        ${w.n > 1 ? `<a class="btn" href="#/week/${w.n - 1}">‹ Week ${w.n - 1}</a>` : "<span></span>"}
        ${w.n < 8 ? `<a class="btn" href="#/week/${w.n + 1}">Week ${w.n + 1} ›</a>` : "<span></span>"}
      </div>

      <section class="card">
        <h2>Learning objectives</h2>
        <p class="muted small">By the end of the week, be able to:</p>
        <ul class="checks">${w.objectives.map((o, i) => `<li><label><input type="checkbox" data-obj="${i}" ${obj[i] ? "checked" : ""}> <span>${esc(o)}</span></label></li>`).join("")}</ul>
      </section>

      ${w.scenario ? `<section class="card"><h2>Capstone scenario</h2><p>${esc(w.scenario)}</p><h4>Complications to work through</h4><ol>${w.complications.map(c => `<li>${esc(c)}</li>`).join("")}</ol></section>` : ""}

      ${window.LEARNING && window.LEARNING.concepts[w.n] ? `<section class="card concepts">
        <details ${d.conceptsClosed ? "" : "open"} data-concepts><summary><h2>Key concepts</h2></summary>
          <p class="muted small">The essentials for this week. Every self-check question draws on this section or the core reading.</p>
          ${md(window.LEARNING.concepts[w.n])}
        </details></section>` : ""}

      <section class="card">
        <h2>Session 1 — Learn</h2>
        ${w.spacedReview ? `<div class="callout"><b>Spaced review (10 min):</b> ${esc(w.spacedReview)}</div>` : `<div class="callout">No earlier week to review yet. Start with the core reading.</div>`}
        ${readingGroup("core", "Core reading", w.readings.core)}
        ${readingGroup("against", "Read against (project research)", w.readings.against)}
        ${readingGroup("ext", "Extension (optional)", w.readings.extension)}
        <details><summary>Topics this week</summary><ul>${w.topics.map(t => `<li>${esc(t)}</li>`).join("")}</ul></details>
      </section>

      <section class="card">
        <h2>Session 2 — Understand</h2>
        <h3>Self-check</h3>
        <p class="muted small">Answer from memory first (Key concepts covers every question), then compare. Anything you mark “Missed” goes to your review queue for next week.</p>
        ${w.selfCheck.map((q, i) => { const res = sc.results[i]; const shown = sc.shown && sc.shown[i]; return `
          <div class="qa ${res || ""}" data-q="${i}">
            <p class="q"><b>${i + 1}.</b> ${esc(q.q)}</p>
            <textarea rows="2" data-sc-answer="${i}" placeholder="Your answer">${esc(sc.answers[i] || "")}</textarea>
            ${shown || res ? `<div class="model"><b>Model answer:</b> ${esc(q.a)}</div>
              <div class="row gap">
                <button class="btn small ${res === "got" ? "selected ok" : ""}" data-grade="got" data-i="${i}">Got it</button>
                <button class="btn small ${res === "missed" ? "selected bad" : ""}" data-grade="missed" data-i="${i}">Missed</button>
              </div>` : `<button class="btn small" data-show="${i}">Show model answer</button>`}
          </div>`; }).join("")}
        <h3>${promptLabel}</h3>
        <p class="prompt">${esc(w.prompt.text)}</p>
        <textarea rows="5" data-field="prompt" placeholder="${w.prompt.type === "teachback" ? "Write it as if speaking to the Fraud/Risk director" : "About two minutes' worth, in plain language"}">${esc(d.prompt || "")}</textarea>
      </section>

      <section class="card">
        <h2>Session 3 — Apply</h2>
        <p><b>Deliverable:</b> ${esc(w.deliverable)}</p>
        <p class="muted small">Artifact templates arrive in Phase 2. Until then, draft in Word or Excel and note where it lives below.</p>
        <label class="lbl">Notes</label>
        <textarea rows="4" data-field="notes" placeholder="Working notes, links to your draft, open questions">${esc(d.notes || "")}</textarea>
        <h3>Reflection log</h3>
        <label class="lbl">What clicked</label><textarea rows="2" data-refl="clicked">${esc(refl.clicked || "")}</textarea>
        <label class="lbl">What is still unclear</label><textarea rows="2" data-refl="unclear">${esc(refl.unclear || "")}</textarea>
        <label class="lbl">How it applies at the company</label><textarea rows="2" data-refl="applies">${esc(refl.applies || "")}</textarea>
      </section>

      <section class="card">
        <h2>Completion checklist</h2>
        <ul class="checks">${list.map(c => `<li><label>
          <input type="checkbox" ${c.done ? "checked" : ""} ${c.manual ? `data-manual="${c.k}"` : "disabled"}>
          <span>${esc(c.label)}${c.manual ? "" : ' <small class="muted">(automatic)</small>'}${c.k === "rating" ? ' · <a href="#/competency">open tracker</a>' : ""}</span></label></li>`).join("")}</ul>
      </section>`;

    const root = view();
    $$("[data-obj]", root).forEach(el => el.addEventListener("change", () => {
      const cur = (weekData(w.n).objectives || []).slice(); cur[+el.dataset.obj] = el.checked; saveWeek(w.n, { objectives: cur }); refreshChecklist(w);
    }));
    $$("[data-reading]", root).forEach(el => el.addEventListener("change", () => {
      const cur = Object.assign({}, weekData(w.n).readings || {}); cur[el.dataset.reading] = el.checked; saveWeek(w.n, { readings: cur });
    }));
    $$("[data-field]", root).forEach(el => el.addEventListener("input", () => { saveWeek(w.n, { [el.dataset.field]: el.value }); refreshChecklist(w); }));
    $$("[data-refl]", root).forEach(el => el.addEventListener("input", () => {
      const cur = Object.assign({}, weekData(w.n).reflection || {}); cur[el.dataset.refl] = el.value; saveWeek(w.n, { reflection: cur }); refreshChecklist(w);
    }));
    $$("[data-sc-answer]", root).forEach(el => el.addEventListener("input", () => {
      const s = scOf(w.n); s.answers[el.dataset.scAnswer] = el.value; saveWeek(w.n, { sc: s });
    }));
    $$("[data-show]", root).forEach(el => el.addEventListener("click", () => {
      const s = scOf(w.n); s.shown[el.dataset.show] = true; saveWeek(w.n, { sc: s }); keepScroll(() => renderWeek(w.n));
    }));
    $$("[data-grade]", root).forEach(el => el.addEventListener("click", () => {
      const i = +el.dataset.i; const g = el.dataset.grade; const s = scOf(w.n); s.results[i] = g; saveWeek(w.n, { sc: s });
      const rid = `review:sc-w${w.n}-q${i}`;
      if (g === "missed") {
        const ex = S.get(rid);
        if (!ex || ex.status === "done") S.set(rid, { prompt: w.selfCheck[i].q, answer: w.selfCheck[i].a, week: w.n, source: "Self-check", due: addDays(today(), 7), count: 0, created: today(), status: "open" });
      }
      keepScroll(() => renderWeek(w.n)); renderNav();
    }));
    $$("[data-manual]", root).forEach(el => el.addEventListener("change", () => { saveWeek(w.n, { [el.dataset.manual]: el.checked }); }));
    const cc = $("[data-concepts]", root); if (cc) cc.addEventListener("toggle", () => saveWeek(w.n, { conceptsClosed: !cc.open }));
  }
  function scOf(n) { const s = weekData(n).sc || {}; return { answers: Object.assign({}, s.answers), results: Object.assign({}, s.results), shown: Object.assign({}, s.shown) }; }
  function keepScroll(fn) { const y = window.scrollY; fn(); window.scrollTo(0, y); }
  function refreshChecklist(w) {
    const list = checklist(w);
    const boxes = $$(".card:last-child .checks input", view());
    boxes.forEach((b, i) => { if (list[i] && !list[i].manual) b.checked = list[i].done; });
  }

  /* ---------- Review ---------- */
  function renderReview() {
    const t = today();
    const items = reviewItems().filter(r => r.status !== "done").sort((a, b) => a.due.localeCompare(b.due));
    const due = items.filter(r => r.due <= t);
    const later = items.filter(r => r.due > t);
    const done = reviewItems().filter(r => r.status === "done").length;
    const card = (r, isDue) => `
      <div class="card qa-review" data-id="${esc(r.id)}">
        <div class="row"><span class="eyebrow">Week ${r.week} · ${esc(r.source)}</span><span class="muted small">${isDue ? "Due" : "Due " + fmtDate(r.due)}</span></div>
        <p class="q">${esc(r.prompt)}</p>
        ${isDue ? `<details><summary>Show answer</summary><div class="model">${esc(r.answer || "No model answer saved.")}</div></details>
        <div class="row gap"><button class="btn small ok" data-rv="got">Got it</button><button class="btn small" data-rv="again">Still unclear (+7 days)</button></div>` : ""}
      </div>`;
    view().innerHTML = `
      <h1>Review queue</h1>
      <p class="muted">Questions you missed come back a week later. Each week also opens with a short review of an earlier week.</p>
      <h2>Due now (${due.length})</h2>
      ${due.length ? due.map(r => card(r, true)).join("") : `<p class="muted">Nothing due. Nice.</p>`}
      <h2>Coming up (${later.length})</h2>
      ${later.length ? later.map(r => card(r, false)).join("") : `<p class="muted">Nothing scheduled.</p>`}
      <section class="card">
        <h3>Add a concept to review</h3>
        <input id="rv-prompt" placeholder="Concept or question to revisit">
        <textarea id="rv-answer" rows="2" placeholder="Answer or notes (optional)"></textarea>
        <div class="row gap"><label class="small">Review in <select id="rv-days"><option value="3">3 days</option><option value="7" selected>1 week</option><option value="14">2 weeks</option></select></label>
        <button class="btn primary small" id="rv-add">Add</button></div>
      </section>
      <p class="muted small">${done} item${done === 1 ? "" : "s"} reviewed and closed.</p>`;
    $$("[data-rv]", view()).forEach(b => b.addEventListener("click", () => {
      const id = b.closest("[data-id]").dataset.id; const cur = S.get(id) || {};
      if (b.dataset.rv === "got") S.set(id, Object.assign({}, cur, { status: "done", closed: today() }));
      else S.set(id, Object.assign({}, cur, { due: addDays(today(), 7), count: (cur.count || 0) + 1 }));
      renderReview(); renderNav();
    }));
    $("#rv-add").addEventListener("click", () => {
      const p = $("#rv-prompt").value.trim(); if (!p) { $("#rv-prompt").focus(); return; }
      S.set("review:m-" + Date.now(), { prompt: p, answer: $("#rv-answer").value.trim(), week: currentWeek(), source: "Added by you", due: addDays(today(), +$("#rv-days").value), count: 0, created: today(), status: "open" });
      renderReview(); renderNav();
    });
  }

  /* ---------- Competency ---------- */
  function renderCompetency() {
    const all = ratings();
    view().innerHTML = `
      <h1>Competency tracker</h1>
      <p class="muted">Each rating needs both kinds of evidence: understanding (can I explain it?) and application (can I do it?).</p>
      <details class="card"><summary><b>Rating scale</b></summary><ol class="scale">${P.levels.map(l => `<li><b>${l.name}</b> — ${esc(l.desc)}</li>`).join("")}</ol></details>
      ${P.competencies.map(c => { const hist = all.filter(r => r.cid === c.id); const l = hist[0]; return `
        <section class="card comp" data-cid="${c.id}">
          <div class="row"><h3>${esc(c.name)}</h3><span class="levels">${levelPips(l ? l.rating : 0, c.target)}</span></div>
          <p class="muted small">Target ${esc(c.target)} · Understanding: ${esc(c.understanding)} · Application: ${esc(c.application)}</p>
          <details><summary>Add a rating</summary>
            <label class="lbl">Rating</label>
            <select data-f="rating">${P.levels.map(x => `<option value="${x.n}" ${l && l.rating === x.n ? "selected" : ""}>${x.n} — ${x.name}</option>`).join("")}</select>
            <label class="lbl">Understanding evidence</label><textarea rows="2" data-f="u" placeholder="${esc(c.understanding)}"></textarea>
            <label class="lbl">Application evidence</label><textarea rows="2" data-f="a" placeholder="${esc(c.application)}"></textarea>
            <button class="btn primary small" data-save>Save rating</button>
          </details>
          ${hist.length ? `<details><summary>History (${hist.length})</summary><ul class="hist">${hist.map(h => `<li><b>${h.rating}</b> · ${fmtDate(h.date)} (week ${h.week})${h.u ? `<br><span class="muted">Understanding:</span> ${esc(h.u)}` : ""}${h.a ? `<br><span class="muted">Application:</span> ${esc(h.a)}` : ""} <button class="link" data-del="${esc(h.id)}">delete</button></li>`).join("")}</ul></details>` : ""}
        </section>`; }).join("")}`;
    $$("[data-save]", view()).forEach(b => b.addEventListener("click", () => {
      const sec = b.closest("[data-cid]");
      const u = $('[data-f="u"]', sec).value.trim(), a = $('[data-f="a"]', sec).value.trim();
      if (!u || !a) { alert("Add both understanding and application evidence. A rating needs both."); return; }
      const wk = currentWeek();
      S.set("rating:" + Date.now(), { cid: sec.dataset.cid, rating: +$('[data-f="rating"]', sec).value, u, a, date: new Date().toISOString(), week: wk });
      saveWeek(wk, { rating: true });
      renderCompetency();
    }));
    $$("[data-del]", view()).forEach(b => b.addEventListener("click", () => {
      if (confirm("Delete this rating entry?")) { S.remove(b.dataset.del); renderCompetency(); }
    }));
  }

  /* ---------- Settings ---------- */
  function renderSettings() {
    const st = settings();
    const ss = S.status();
    let syncHtml;
    if (!ss.configured) {
      syncHtml = `<p>Sync is not set up, so your data is saved only on this device.</p>
        <p class="muted small">To sync between your laptop and iPhone, add your Supabase project details to <code>js/config.js</code> (see README).</p>`;
    } else if (!ss.signedIn) {
      syncHtml = `<p class="muted small">Sign in with the same account on each device. Your data stays private to your account.</p>
        <label class="lbl">Email</label><input id="au-email" type="email" autocomplete="username">
        <label class="lbl">Password</label><input id="au-pass" type="password" autocomplete="current-password">
        <div class="row gap"><button class="btn primary small" id="au-in">Sign in</button><button class="btn small" id="au-up">Create account</button></div>
        <p id="au-msg" class="small"></p>`;
    } else {
      syncHtml = `<p>Signed in as <b>${esc(ss.email)}</b>.</p>
        <p class="muted small">Last synced: ${ago(ss.lastSync)}${ss.dirty ? ` · ${ss.dirty} change${ss.dirty === 1 ? "" : "s"} waiting` : ""}${ss.online ? "" : " · offline"}</p>
        ${ss.lastError ? `<p class="bad small">Last error: ${esc(ss.lastError)}</p>` : ""}
        <div class="row gap"><button class="btn small" id="sy-now">Sync now</button><button class="btn small" id="au-out">Sign out</button></div>`;
    }
    view().innerHTML = `
      <h1>Settings</h1>
      <section class="card">
        <h2>Program schedule</h2>
        <label class="lbl">Program start date (first day of Week 1)</label>
        <input type="date" id="st-start" value="${esc(st.startDate || "")}">
        <p class="muted small">Current week: ${currentWeek()} of 8</p>
      </section>
      <section class="card"><h2>Sync</h2>${syncHtml}</section>
      <section class="card">
        <h2>Backup</h2>
        <p class="muted small">Download a copy of all your data, or restore from a copy. Restoring merges: newer entries win.</p>
        <div class="row gap"><button class="btn small" id="bk-out">Download backup</button>
        <label class="btn small">Restore from file<input type="file" id="bk-in" accept="application/json,.json" hidden></label></div>
        <p id="bk-msg" class="small"></p>
      </section>
      <section class="card">
        <h2>Quick Response Advisor</h2>
        <p class="small">Ask a question by voice and get a short answer you can say aloud. Your API key is stored only on each device; saved questions sync with your account.</p>
        <a class="btn small" href="advisor.html">Open the Advisor</a>
        <p class="muted small">Tip: on your iPhone, open the Advisor in Safari and use Share › Add to Home Screen to give it its own icon.</p>
      </section>
      <section class="card">
        <h2>Coming next</h2>
        <ul class="small">
          <li><b>Phase 2:</b> portfolio templates (Artifacts 1–6), AI dependency inventory, capstone workspace, Word and Excel exports.</li>
          <li><b>Phase 3 (remaining):</b> guided learning assistant for readings, self-checks and teach-backs.</li>
        </ul>
      </section>
      <p class="muted small center">${esc(P.version)}</p>`;

    $("#st-start").addEventListener("change", e => { S.update("settings:main", { startDate: e.target.value }); renderSettings(); renderNav(); });
    $("#bk-out").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(S.exportAll(), null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `ai-risk-backup-${today()}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
    $("#bk-in").addEventListener("change", e => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then(t => { const n = S.importAll(JSON.parse(t)); $("#bk-msg").textContent = `Restored ${n} entr${n === 1 ? "y" : "ies"}.`; })
        .catch(err => { $("#bk-msg").textContent = "Could not restore: " + err.message; });
    });
    if ($("#au-in")) {
      const msg = t => { $("#au-msg").textContent = t; };
      $("#au-in").addEventListener("click", () => S.signIn($("#au-email").value.trim(), $("#au-pass").value).then(() => renderSettings()).catch(e => msg(e.message)));
      $("#au-up").addEventListener("click", () => S.signUp($("#au-email").value.trim(), $("#au-pass").value)
        .then(needsConfirm => { if (needsConfirm) msg("Check your email to confirm the account, then sign in."); else renderSettings(); })
        .catch(e => msg(e.message)));
    }
    if ($("#sy-now")) $("#sy-now").addEventListener("click", () => S.sync().then(renderSettings));
    if ($("#au-out")) $("#au-out").addEventListener("click", () => S.signOut().then(renderSettings));
  }

  /* ---------- boot ---------- */
  window.addEventListener("hashchange", render);
  S.onChange(kind => {
    if (kind === "status") { renderSyncChip(); return; }
    if (kind === "local") { renderNav(); return; }
    // Data arrived from another device, a restore, or sign-in changed: refresh the page unless you're mid-typing.
    const a = document.activeElement;
    const typing = a && (a.tagName === "TEXTAREA" || a.tagName === "INPUT" || a.tagName === "SELECT");
    if (!typing) { const y = window.scrollY; renderBody(); window.scrollTo(0, y); } else renderNav();
  });
  function renderBody() {
    const [r, a] = route();
    if (r === "roadmap") renderRoadmap(); else if (r === "week") renderWeek(parseInt(a, 10) || 1); else if (r === "ref") { renderNav(); return; }
    else if (r === "review") renderReview(); else if (r === "competency") renderCompetency();
    else if (r === "settings") renderSettings(); else renderHome();
    renderNav();
  }
  S.initSync();
  render();
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
