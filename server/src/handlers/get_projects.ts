import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type Project } from '../schema';
import { desc } from 'drizzle-orm';

export const getProjects = async (): Promise<Project[]> => {
  try {
    // Fetch all projects ordered by created_at descending (newest first)
    const results = await db.select()
      .from(projectsTable)
      .orderBy(desc(projectsTable.created_at))
      .execute();

    // Transform the database results to match the schema
    // technologies is stored as JSON in the database but should be returned as string array
    return results.map(project => ({
      ...project,
      technologies: project.technologies as string[], // Cast JSON to string array
    }));
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }
};