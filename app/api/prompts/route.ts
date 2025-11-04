import { NextRequest } from 'next/server';
import {
  listPromptsForCurrentTeam,
  createPromptForCurrentTeam,
} from '@/lib/db/queries';

export async function GET() {
  try {
    const list = await listPromptsForCurrentTeam();
    return Response.json(list);
  } catch (e: any) {
    return new Response(e?.message || 'Failed to fetch prompts', {
      status: 401,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.title || !body?.content) {
      return new Response('title and content are required', { status: 400 });
    }

    const created = await createPromptForCurrentTeam({
      title: String(body.title),
      content: String(body.content),
      description: body.description ? String(body.description) : null,
      isFavorite: Boolean(body.isFavorite ?? false),
    });
    return Response.json(created, { status: 201 });
  } catch (e: any) {
    return new Response(e?.message || 'Failed to create prompt', {
      status: 400,
    });
  }
}



