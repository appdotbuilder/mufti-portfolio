import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { deleteProject } from '../handlers/delete_project';
import { eq } from 'drizzle-orm';

// Test data for creating projects
const testProject: CreateProjectInput = {
  title: 'Test Project',
  description: 'A project for testing deletion',
  image_url: 'https://example.com/image.jpg',
  github_url: 'https://github.com/test/project',
  demo_url: 'https://demo.example.com',
  technologies: ['React', 'TypeScript', 'Node.js']
};

const anotherTestProject: CreateProjectInput = {
  title: 'Another Project',
  description: 'Another project for testing',
  image_url: null,
  github_url: null,
  demo_url: null,
  technologies: ['Python', 'Django']
};

describe('deleteProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should successfully delete an existing project', async () => {
    // Create a project first
    const insertResult = await db.insert(projectsTable)
      .values({
        title: testProject.title,
        description: testProject.description,
        image_url: testProject.image_url,
        github_url: testProject.github_url,
        demo_url: testProject.demo_url,
        technologies: testProject.technologies
      })
      .returning()
      .execute();

    const projectId = insertResult[0].id;

    // Delete the project
    const result = await deleteProject(projectId);

    // Verify the operation was successful
    expect(result.success).toBe(true);

    // Verify the project no longer exists in the database
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .execute();

    expect(projects).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent project', async () => {
    // Try to delete a project with an ID that doesn't exist
    const result = await deleteProject(999);

    // Verify the operation returns false
    expect(result.success).toBe(false);
  });

  it('should only delete the specified project', async () => {
    // Create multiple projects
    const insertResults = await db.insert(projectsTable)
      .values([
        {
          title: testProject.title,
          description: testProject.description,
          image_url: testProject.image_url,
          github_url: testProject.github_url,
          demo_url: testProject.demo_url,
          technologies: testProject.technologies
        },
        {
          title: anotherTestProject.title,
          description: anotherTestProject.description,
          image_url: anotherTestProject.image_url,
          github_url: anotherTestProject.github_url,
          demo_url: anotherTestProject.demo_url,
          technologies: anotherTestProject.technologies
        }
      ])
      .returning()
      .execute();

    const firstProjectId = insertResults[0].id;
    const secondProjectId = insertResults[1].id;

    // Delete only the first project
    const result = await deleteProject(firstProjectId);

    // Verify the operation was successful
    expect(result.success).toBe(true);

    // Verify only the first project was deleted
    const firstProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, firstProjectId))
      .execute();
    expect(firstProject).toHaveLength(0);

    // Verify the second project still exists
    const secondProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, secondProjectId))
      .execute();
    expect(secondProject).toHaveLength(1);
    expect(secondProject[0].title).toBe(anotherTestProject.title);
  });

  it('should handle deletion of project with null fields', async () => {
    // Create a project with null optional fields
    const insertResult = await db.insert(projectsTable)
      .values({
        title: 'Minimal Project',
        description: 'Project with minimal data',
        image_url: null,
        github_url: null,
        demo_url: null,
        technologies: ['JavaScript']
      })
      .returning()
      .execute();

    const projectId = insertResult[0].id;

    // Delete the project
    const result = await deleteProject(projectId);

    // Verify the operation was successful
    expect(result.success).toBe(true);

    // Verify the project no longer exists
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .execute();

    expect(projects).toHaveLength(0);
  });

  it('should handle zero as a valid ID', async () => {
    // Try to delete with ID 0 (should return false since no project has ID 0)
    const result = await deleteProject(0);

    expect(result.success).toBe(false);
  });
});