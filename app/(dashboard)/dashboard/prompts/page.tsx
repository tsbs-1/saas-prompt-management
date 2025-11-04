import { listPromptsForCurrentTeam } from '@/lib/db/queries';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function PromptsPage() {
  const prompts = await listPromptsForCurrentTeam();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Prompts</h1>
        <Link href="/dashboard/prompts/new">
          <Button>新規作成</Button>
        </Link>
      </div>

      {prompts.length === 0 ? (
        <div className="text-sm text-muted-foreground">まだプロンプトがありません。右上の「新規作成」から追加できます。</div>
      ) : (
        <ul className="divide-y rounded-md border">
          {prompts.map((p) => (
            <li key={p.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{p.title}</div>
                {p.description ? (
                  <div className="text-sm text-muted-foreground">{p.description}</div>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboard/prompts/${p.id}`}>
                  <Button variant="secondary">編集</Button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}



