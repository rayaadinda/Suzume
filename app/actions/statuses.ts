'use server';

import { db } from '@/db';
import { statuses } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export type StatusData = {
  id: string;
  name: string;
  color: string;
  displayOrder: number;
};

// Helper function to get current user session
async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session.user;
}

// GET all statuses (ordered by display order)
export async function getStatuses(): Promise<StatusData[]> {
  await getCurrentUser(); // Ensure authenticated

  try {
    const allStatuses = await db
      .select({
        id: statuses.id,
        name: statuses.name,
        color: statuses.color,
        displayOrder: statuses.displayOrder,
      })
      .from(statuses)
      .orderBy(asc(statuses.displayOrder));

    return allStatuses;
  } catch (error) {
    console.error('Error fetching statuses:', error);
    throw new Error('Failed to fetch statuses');
  }
}
