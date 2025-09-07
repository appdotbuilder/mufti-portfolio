import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type UpdateProjectInput, type Project } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateProject(input: UpdateProjectInput): Promise<Project> {
  try {
    // First verify the project exists
    const existingProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, input.id))
      .execute();

    if (existingProject.length === 0) {
      throw new Error(`Project with id ${input.id} not found`);
    }

    // Prepare update data - only include defined fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.image_url !== undefined) {
      updateData.image_url = input.image_url;
    }
    if (input.github_url !== undefined) {
      updateData.github_url = input.github_url;
    }
    if (input.demo_url !== undefined) {
      updateData.demo_url = input.demo_url;
    }
    if (input.technologies !== undefined) {
      updateData.technologies = input.technologies;
    }

    // Update project record
    const result = await db.update(projectsTable)
      .set(updateData)
      .where(eq(projectsTable.id, input.id))
      .returning()
      .execute();

    const project = result[0];
    return {
      ...project,
      technologies: Array.isArray(project.technologies) ? project.technologies : []
    };
  } catch (error) {
    console.error('Project update failed:', error);
    throw error;
  }
}