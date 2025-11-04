import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users, prompts } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}

// ===== Prompts (Team-scoped) =====
export async function listPromptsForCurrentTeam() {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  const membership = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, user.id))
    .limit(1);

  const teamId = membership[0]?.teamId;
  if (!teamId) return [];

  return await db
    .select()
    .from(prompts)
    .where(eq(prompts.teamId, teamId))
    .orderBy(desc(prompts.updatedAt));
}

export async function getPromptByIdForCurrentTeam(id: number) {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  const membership = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, user.id))
    .limit(1);

  const teamId = membership[0]?.teamId;
  if (!teamId) return null;

  const rows = await db
    .select()
    .from(prompts)
    .where(and(eq(prompts.id, id), eq(prompts.teamId, teamId)))
    .limit(1);

  return rows[0] || null;
}

export async function createPromptForCurrentTeam(input: {
  title: string;
  content: string;
  description?: string | null;
  isFavorite?: boolean;
}) {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  const membership = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, user.id))
    .limit(1);

  const teamId = membership[0]?.teamId;
  if (!teamId) throw new Error('User has no team');

  const [created] = await db
    .insert(prompts)
    .values({
      teamId,
      title: input.title,
      content: input.content,
      description: input.description ?? null,
      isFavorite: input.isFavorite ?? false,
      createdBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return created;
}

export async function updatePromptForCurrentTeam(
  id: number,
  updates: {
    title?: string;
    content?: string;
    description?: string | null;
    isFavorite?: boolean;
  }
) {
  const existing = await getPromptByIdForCurrentTeam(id);
  if (!existing) throw new Error('Prompt not found');

  const [updated] = await db
    .update(prompts)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(prompts.id, id))
    .returning();

  return updated;
}

export async function deletePromptForCurrentTeam(id: number) {
  const existing = await getPromptByIdForCurrentTeam(id);
  if (!existing) throw new Error('Prompt not found');

  const [deleted] = await db
    .delete(prompts)
    .where(eq(prompts.id, id))
    .returning();

  return deleted;
}
