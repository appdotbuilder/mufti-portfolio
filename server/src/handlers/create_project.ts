import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput, type Project } from '../schema';

export const createProject = async (input: CreateProjectInput): Promise<Project> => {
  try {
    // Insert project record
    const result = await db.insert(projectsTable)
      .values({
        title: input.title,
        description: input.description,
        image_url: input.image_url,
        github_url: input.github_url,
        demo_url: input.demo_url,
        technologies: input.technologies // JSON column - no conversion needed
      })
      .returning()
      .execute();

    // Return the created project
    const project = result[0];
    return {
      ...project,
      technologies: project.technologies as string[] // Ensure proper typing for JSON field
    };
  } catch (error) {
    console.error('Project creation failed:', error);
    throw error;
  }
};