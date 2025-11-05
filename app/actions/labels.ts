'use server';

import { db } from '@/db';
import { labels } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export type LabelData = {
  id: string;
  name: string;
  color: string;
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

// GET all labels (for label selection)
export async function getLabels(): Promise<LabelData[]> {
  await getCurrentUser(); // Ensure authenticated

  try {
    const allLabels = await db.select({
      id: labels.id,
      name: labels.name,
      color: labels.color,
    }).from(labels);

    return allLabels;
  } catch (error) {
    console.error('Error fetching labels:', error);
    throw new Error('Failed to fetch labels');
  }
}
