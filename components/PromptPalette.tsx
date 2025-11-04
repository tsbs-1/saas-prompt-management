"use client";
import { useEffect, useMemo, useState } from 'react';

type Prompt = {
  id: number;
  title: string;
  description: string | null;
  content: string;
};

export default function PromptPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Prompt[]>([]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      if ((isMac && e.metaKey && e.key.toLowerCase() === 'k') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const res = await fetch('/api/prompts');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    })();
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) => p.title.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
    );
  }, [items, query]);

  function handleUse(prompt: Prompt) {
    navigator.clipboard.writeText(prompt.content);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4">
      <div className="w-full max-w-2xl rounded-md border bg-white shadow-lg">
        <input
          autoFocus
          className="w-full border-b p-3 outline-none"
          placeholder="プロンプトを検索 (⌘K / Ctrl+K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="max-h-80 overflow-auto">
          {filtered.length === 0 ? (
            <li className="p-3 text-sm text-gray-500">該当するプロンプトがありません</li>
          ) : (
            filtered.map((p) => (
              <li
                key={p.id}
                className="cursor-pointer border-b p-3 hover:bg-gray-50"
                onClick={() => handleUse(p)}
              >
                <div className="font-medium">{p.title}</div>
                {p.description ? (
                  <div className="text-xs text-gray-500">{p.description}</div>
                ) : null}
              </li>
            ))
          )}
        </ul>
        <div className="flex justify-end gap-2 p-3 text-xs text-gray-500">
          <span>Enter: コピー</span>
          <span>Esc: 閉じる</span>
        </div>
      </div>
    </div>
  );
}



