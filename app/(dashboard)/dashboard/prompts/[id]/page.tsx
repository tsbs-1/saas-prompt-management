import { getPromptByIdForCurrentTeam } from '@/lib/db/queries';
import PromptEditor from '../PromptEditor';
import { notFound } from 'next/navigation';

export default async function EditPromptPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await props.params;
  const id = Number(idStr);
  if (Number.isNaN(id)) notFound();
  const prompt = await getPromptByIdForCurrentTeam(id);
  if (!prompt) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">プロンプトを編集</h1>
      <PromptEditor mode="edit" initial={prompt} />
    </div>
  );
}



