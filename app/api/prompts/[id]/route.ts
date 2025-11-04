import { NextRequest } from 'next/server';
import {
  getPromptByIdForCurrentTeam,
  updatePromptForCurrentTeam,
  deletePromptForCurrentTeam,
} from '@/lib/db/queries';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (Number.isNaN(id)) return new Response('Invalid id', { status: 400 });
    const prompt = await getPromptByIdForCurrentTeam(id);
    if (!prompt) return new Response('Not found', { status: 404 });
    return Response.json(prompt);
  } catch (e: any) {
    return new Response(e?.message || 'Failed to fetch prompt', { status: 400 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (Number.isNaN(id)) return new Response('Invalid id', { status: 400 });
    const body = await req.json();

    const updated = await updatePromptForCurrentTeam(id, {
      title: body.title,
      content: body.content,
      description: body.description ?? null,
      isFavorite: body.isFavorite,
    });
    return Response.json(updated);
  } catch (e: any) {
    return new Response(e?.message || 'Failed to update prompt', { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (Number.isNaN(id)) return new Response('Invalid id', { status: 400 });
    const deleted = await deletePromptForCurrentTeam(id);
    return Response.json(deleted);
  } catch (e: any) {
    return new Response(e?.message || 'Failed to delete prompt', { status: 400 });
  }
}



