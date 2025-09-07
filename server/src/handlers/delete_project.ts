import { db } from '../db';
import { projectsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteProject = async (id: number): Promise<{ success: boolean }> => {
  try {
    // First check if project exists by selecting it
    const existingProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id))
      .execute();

    if (existingProject.length === 0) {
      return { success: false };
    }

    // Delete the project by ID
    await db.delete(projectsTable)
      .where(eq(projectsTable.id, id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Project deletion failed:', error);
    throw error;
  }
};