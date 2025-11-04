"use client";
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  mode: 'create' | 'edit';
  initial?: {
    id: number;
    title: string;
    content: string;
    description: string | null;
    isFavorite: boolean;
  } | null;
};

export default function PromptEditor({ mode, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [isFavorite, setIsFavorite] = useState(initial?.isFavorite ?? false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSave() {
    setError(null);
    const payload = {
      title,
      content,
      description: description || null,
      isFavorite,
    };
    try {
      const res = await fetch(
        mode === 'create' ? '/api/prompts' : `/api/prompts/${initial!.id}`,
        {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      startTransition(() => router.push('/dashboard/prompts'));
    } catch (e: any) {
      setError(e?.message || '保存に失敗しました');
    }
  }

  async function handleDelete() {
    if (!initial) return;
    if (!confirm('このプロンプトを削除しますか？')) return;
    try {
      const res = await fetch(`/api/prompts/${initial.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      startTransition(() => router.push('/dashboard/prompts'));
    } catch (e: any) {
      setError(e?.message || '削除に失敗しました');
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(content);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">タイトル</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">説明</Label>
          <Input
            id="description"
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="content">コンテンツ</Label>
          <textarea
            id="content"
            className="min-h-[200px] rounded-md border p-2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isFavorite}
            onChange={(e) => setIsFavorite(e.target.checked)}
          />
          お気に入り
        </label>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="flex items-center gap-2">
        <Button onClick={handleSave} disabled={isPending}>
          {mode === 'create' ? '作成' : '保存'}
        </Button>
        <Button type="button" variant="secondary" onClick={handleCopy}>
          内容をコピー
        </Button>
        {mode === 'edit' ? (
          <Button type="button" variant="destructive" onClick={handleDelete}>
            削除
          </Button>
        ) : null}
      </div>
    </div>
  );
}



