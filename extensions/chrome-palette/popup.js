const DEFAULT_BASE = "http://localhost:3000";

async function getBaseUrl() {
  return new Promise((resolve) => {
    chrome.storage?.local?.get(["saas_base_url"], (res) => {
      resolve(res?.saas_base_url || DEFAULT_BASE);
    });
  });
}

async function fetchPrompts(baseUrl) {
  const res = await fetch(`${baseUrl}/api/prompts`, { credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function render(list, prompts) {
  list.innerHTML = "";
  if (!prompts.length) {
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = "No prompts. Create one in Dashboard → Prompts.";
    list.appendChild(hint);
    return;
  }
  prompts.forEach((p) => {
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `<div class="title">${p.title}</div>${p.description ? `<div class="desc">${p.description}</div>` : ""}`;
    el.onclick = () => handleUse(p, false);
    el.onauxclick = () => handleUse(p, true);
    list.appendChild(el);
  });
}

async function handleUse(prompt, paste) {
  await navigator.clipboard.writeText(prompt.content);
  if (!paste) return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => {
        const el = document.activeElement;
        if (!el) return;
        if (el.isContentEditable) {
          document.execCommand("insertText", false, text);
          return;
        }
        if ("value" in el) {
          el.value += text;
        }
      },
      args: [prompt.content]
    });
  }
}

(async function main() {
  const input = document.getElementById("q");
  const list = document.getElementById("list");
  let items = [];
  let baseUrl = await getBaseUrl();
  try {
    items = await fetchPrompts(baseUrl);
  } catch (e) {
    list.innerHTML = `<div class="hint">Auth required. Login at ${baseUrl} then reopen.</div>`;
    return;
  }
  let filtered = items.slice();
  render(list, filtered);

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    filtered = !q
      ? items
      : items.filter((p) =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
        );
    render(list, filtered);
  });

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter" && !e.shiftKey && filtered[0]) {
      await handleUse(filtered[0], false);
      window.close();
    }
    if (e.key === "Enter" && e.shiftKey && filtered[0]) {
      await handleUse(filtered[0], true);
      window.close();
    }
  });
})();


