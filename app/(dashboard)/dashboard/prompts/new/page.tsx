import PromptEditor from '../PromptEditor';

export default async function NewPromptPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">新規プロンプト</h1>
      <PromptEditor mode="create" />
    </div>
  );
}



