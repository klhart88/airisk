/* AI provider connector. Everything that talks to a model lives here, so a different
   provider (for example a Copilot-approved model) can be swapped in by replacing this file.
   Settings (API key, model) are stored ONLY in this browser's localStorage, never synced. */
(function () {
  const KEY = "airisk.ai.v1";
  const MODELS = [
    { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5 (balanced)" },
    { id: "claude-haiku-5-5", label: "Claude Haiku 5.5 (fastest)" }
  ];

  function read() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function write(v) { localStorage.setItem(KEY, JSON.stringify(v)); }

  const AIProvider = {
    name: "Anthropic Claude",
    models: MODELS,
    settings() { const s = read(); return { key: s.key || "", model: s.model || MODELS[0].id }; },
    save(patch) { write(Object.assign(read(), patch)); },
    clearKey() { const s = read(); delete s.key; write(s); },
    isConfigured() { return !!read().key; },

    /* Streams a reply. Calls onText(fullTextSoFar) as text arrives; resolves with the final text. */
    async stream({ system, messages, maxTokens, onText, signal }) {
      const s = AIProvider.settings();
      if (!s.key) throw friendly("NO_KEY");
      let res;
      try {
        res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          signal,
          headers: {
            "content-type": "application/json",
            "x-api-key": s.key,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true"
          },
          body: JSON.stringify({ model: s.model, max_tokens: maxTokens || 400, system, messages, stream: true })
        });
      } catch (e) {
        if (e.name === "AbortError") throw e;
        throw friendly("NETWORK");
      }
      if (!res.ok) {
        let detail = "";
        try { const j = await res.json(); detail = (j.error && j.error.message) || ""; } catch (e) {}
        throw friendly(res.status, detail);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "", text = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
          if (!line.startsWith("data:")) continue;
          let ev; try { ev = JSON.parse(line.slice(5)); } catch (e) { continue; }
          if (ev.type === "content_block_delta" && ev.delta && ev.delta.type === "text_delta") {
            text += ev.delta.text; if (onText) onText(text);
          } else if (ev.type === "error") {
            throw friendly("STREAM", ev.error && ev.error.message);
          }
        }
      }
      return text;
    }
  };

  function friendly(code, detail) {
    const map = {
      NO_KEY: "Add your API key in Advisor settings first.",
      NETWORK: "Couldn't reach the AI service. Check your connection (some networks block it).",
      401: "The API key was rejected. Check it in Advisor settings.",
      403: "This API key isn't allowed to use that model.",
      404: "That model isn't available. Pick another in Advisor settings.",
      429: "Rate limit or credit limit reached. Try again shortly, or check your API account.",
      529: "The AI service is busy. Try again in a moment.",
      STREAM: "The answer was interrupted."
    };
    const msg = map[code] || ("The AI service returned an error (" + code + ").");
    const e = new Error(detail && code !== 401 ? msg + " " + detail : msg);
    e.code = code;
    return e;
  }

  window.AIProvider = AIProvider;
})();
