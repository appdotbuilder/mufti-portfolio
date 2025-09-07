import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type UpdateProjectInput, type CreateProjectInput } from '../schema';
import { updateProject } from '../handlers/update_project';
import { eq } from 'drizzle-orm';

// Helper function to create a test project
async function createTestProject(input: CreateProjectInput) {
  const result = await db.insert(projectsTable)
    .values({
      title: input.title,
      description: input.description,
      image_url: input.image_url,
      github_url: input.github_url,
      demo_url: input.demo_url,
      technologies: input.technologies
    })
    .returning()
    .execute();

  return result[0];
}

// Test data
const testProjectInput: CreateProjectInput = {
  title: 'Original Project',
  description: 'Original description',
  image_url: 'https://example.com/image.jpg',
  github_url: 'https://github.com/user/project',
  demo_url: 'https://demo.example.com',
  technologies: ['JavaScript', 'React']
};

describe('updateProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a project with all fields', async () => {
    // Create test project
    const createdProject = await createTestProject(testProjectInput);

    const updateInput: UpdateProjectInput = {
      id: createdProject.id,
      title: 'Updated Project',
      description: 'Updated description',
      image_url: 'https://example.com/new-image.jpg',
      github_url: 'https://github.com/user/updated-project',
      demo_url: 'https://updated-demo.example.com',
      technologies: ['TypeScript', 'Next.js', 'PostgreSQL']
    };

    const result = await updateProject(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(createdProject.id);
    expect(result.title).toEqual('Updated Project');
    expect(result.description).toEqual('Updated description');
    expect(result.image_url).toEqual('https://example.com/new-image.jpg');
    expect(result.github_url).toEqual('https://github.com/user/updated-project');
    expect(result.demo_url).toEqual('https://updated-demo.example.com');
    expect(result.technologies).toEqual(['TypeScript', 'Next.js', 'PostgreSQL']);
    expect(result.created_at).toEqual(createdProject.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > createdProject.updated_at).toBe(true);
  });

  it('should update only specified fields', async () => {
    // Create test project
    const createdProject = await createTestProject(testProjectInput);

    const updateInput: UpdateProjectInput = {
      id: createdProject.id,
      title: 'Partially Updated Project',
      technologies: ['Vue.js']
    };

    const result = await updateProject(updateInput);

    // Verify updated fields
    expect(result.title).toEqual('Partially Updated Project');
    expect(result.technologies).toEqual(['Vue.js']);
    
    // Verify unchanged fields
    expect(result.description).toEqual(createdProject.description);
    expect(result.image_url).toEqual(createdProject.image_url);
    expect(result.github_url).toEqual(createdProject.github_url);
    expect(result.demo_url).toEqual(createdProject.demo_url);
    expect(result.created_at).toEqual(createdProject.created_at);
    expect(result.updated_at > createdProject.updated_at).toBe(true);
  });

  it('should update nullable fields to null', async () => {
    // Create test project
    const createdProject = await createTestProject(testProjectInput);

    const updateInput: UpdateProjectInput = {
      id: createdProject.id,
      image_url: null,
      github_url: null,
      demo_url: null
    };

    const result = await updateProject(updateInput);

    // Verify nullable fields were set to null
    expect(result.image_url).toBeNull();
    expect(result.github_url).toBeNull();
    expect(result.demo_url).toBeNull();
    
    // Verify other fields remain unchanged
    expect(result.title).toEqual(createdProject.title);
    expect(result.description).toEqual(createdProject.description);
    expect(result.technologies).toEqual(Array.isArray(createdProject.technologies) ? createdProject.technologies : []);
  });

  it('should save updated project to database', async () => {
    // Create test project
    const createdProject = await createTestProject(testProjectInput);

    const updateInput: UpdateProjectInput = {
      id: createdProject.id,
      title: 'Database Updated Project',
      description: 'Database updated description'
    };

    await updateProject(updateInput);

    // Query database to verify changes were persisted
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, createdProject.id))
      .execute();

    expect(projects).toHaveLength(1);
    const dbProject = projects[0];
    expect(dbProject.title).toEqual('Database Updated Project');
    expect(dbProject.description).toEqual('Database updated description');
    expect(dbProject.updated_at).toBeInstanceOf(Date);
    expect(dbProject.updated_at > createdProject.updated_at).toBe(true);
  });

  it('should handle empty technologies array', async () => {
    // Create test project
    const createdProject = await createTestProject(testProjectInput);

    const updateInput: UpdateProjectInput = {
      id: createdProject.id,
      technologies: []
    };

    const result = await updateProject(updateInput);

    expect(result.technologies).toEqual([]);
    expect(Array.isArray(result.technologies)).toBe(true);
  });

  it('should throw error when project does not exist', async () => {
    const updateInput: UpdateProjectInput = {
      id: 999, // Non-existent ID
      title: 'This should fail'
    };

    await expect(updateProject(updateInput)).rejects.toThrow(/project with id 999 not found/i);
  });

  it('should preserve original created_at timestamp', async () => {
    // Create test project
    const createdProject = await createTestProject(testProjectInput);
    
    // Wait a moment to ensure updated_at will be different
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateProjectInput = {
      id: createdProject.id,
      title: 'Time Test Project'
    };

    const result = await updateProject(updateInput);

    // created_at should remain the same
    expect(result.created_at.getTime()).toEqual(createdProject.created_at.getTime());
    
    // updated_at should be newer
    expect(result.updated_at > createdProject.updated_at).toBe(true);
  });
});