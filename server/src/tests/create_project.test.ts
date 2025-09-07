import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { createProject } from '../handlers/create_project';
import { eq, like } from 'drizzle-orm';

// Test inputs with various scenarios
const basicTestInput: CreateProjectInput = {
  title: 'Test Project',
  description: 'A project for testing purposes',
  image_url: null,
  github_url: null,
  demo_url: null,
  technologies: ['TypeScript', 'React']
};

const fullTestInput: CreateProjectInput = {
  title: 'Full Featured Project',
  description: 'A complete project with all fields',
  image_url: 'https://example.com/image.png',
  github_url: 'https://github.com/user/project',
  demo_url: 'https://demo.example.com',
  technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL']
};

const minimalTestInput: CreateProjectInput = {
  title: 'Minimal Project',
  description: 'Project with minimal data',
  image_url: null,
  github_url: null,
  demo_url: null,
  technologies: []
};

describe('createProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a project with basic fields', async () => {
    const result = await createProject(basicTestInput);

    // Basic field validation
    expect(result.title).toEqual('Test Project');
    expect(result.description).toEqual(basicTestInput.description);
    expect(result.image_url).toBeNull();
    expect(result.github_url).toBeNull();
    expect(result.demo_url).toBeNull();
    expect(result.technologies).toEqual(['TypeScript', 'React']);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a project with all fields populated', async () => {
    const result = await createProject(fullTestInput);

    // Validate all fields
    expect(result.title).toEqual('Full Featured Project');
    expect(result.description).toEqual(fullTestInput.description);
    expect(result.image_url).toEqual('https://example.com/image.png');
    expect(result.github_url).toEqual('https://github.com/user/project');
    expect(result.demo_url).toEqual('https://demo.example.com');
    expect(result.technologies).toEqual(['TypeScript', 'React', 'Node.js', 'PostgreSQL']);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save project to database correctly', async () => {
    const result = await createProject(fullTestInput);

    // Query the database to verify persistence
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(projects).toHaveLength(1);
    const savedProject = projects[0];
    
    expect(savedProject.title).toEqual('Full Featured Project');
    expect(savedProject.description).toEqual(fullTestInput.description);
    expect(savedProject.image_url).toEqual('https://example.com/image.png');
    expect(savedProject.github_url).toEqual('https://github.com/user/project');
    expect(savedProject.demo_url).toEqual('https://demo.example.com');
    expect(savedProject.technologies).toEqual(['TypeScript', 'React', 'Node.js', 'PostgreSQL']);
    expect(savedProject.created_at).toBeInstanceOf(Date);
    expect(savedProject.updated_at).toBeInstanceOf(Date);
  });

  it('should handle empty technologies array', async () => {
    const result = await createProject(minimalTestInput);

    expect(result.title).toEqual('Minimal Project');
    expect(result.technologies).toEqual([]);
    expect(Array.isArray(result.technologies)).toBe(true);
    
    // Verify in database
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(projects[0].technologies).toEqual([]);
  });

  it('should create multiple projects independently', async () => {
    const project1 = await createProject(basicTestInput);
    const project2 = await createProject(fullTestInput);

    expect(project1.id).not.toEqual(project2.id);
    expect(project1.title).toEqual('Test Project');
    expect(project2.title).toEqual('Full Featured Project');

    // Verify both exist in database
    const allProjects = await db.select()
      .from(projectsTable)
      .execute();

    expect(allProjects).toHaveLength(2);
    
    const titles = allProjects.map(p => p.title);
    expect(titles).toContain('Test Project');
    expect(titles).toContain('Full Featured Project');
  });

  it('should handle projects with same title but different descriptions', async () => {
    const input1: CreateProjectInput = {
      title: 'Same Title',
      description: 'First description',
      image_url: null,
      github_url: null,
      demo_url: null,
      technologies: ['React']
    };

    const input2: CreateProjectInput = {
      title: 'Same Title',
      description: 'Second description',
      image_url: null,
      github_url: null,
      demo_url: null,
      technologies: ['Vue']
    };

    const project1 = await createProject(input1);
    const project2 = await createProject(input2);

    expect(project1.id).not.toEqual(project2.id);
    expect(project1.title).toEqual(project2.title);
    expect(project1.description).toEqual('First description');
    expect(project2.description).toEqual('Second description');
    expect(project1.technologies).toEqual(['React']);
    expect(project2.technologies).toEqual(['Vue']);
  });

  it('should query projects by title pattern', async () => {
    // Create test projects
    await createProject(basicTestInput);
    await createProject(fullTestInput);
    await createProject(minimalTestInput);

    // Query projects with "Project" in title
    const projectsWithPattern = await db.select()
      .from(projectsTable)
      .where(like(projectsTable.title, '%Project%'))
      .execute();

    expect(projectsWithPattern.length).toBeGreaterThanOrEqual(3);
    
    projectsWithPattern.forEach(project => {
      expect(project.title).toMatch(/Project/);
      expect(project.created_at).toBeInstanceOf(Date);
      expect(project.updated_at).toBeInstanceOf(Date);
      expect(Array.isArray(project.technologies)).toBe(true);
    });
  });

  it('should preserve technology order in array', async () => {
    const orderedTechInput: CreateProjectInput = {
      title: 'Ordered Tech Project',
      description: 'Testing technology order preservation',
      image_url: null,
      github_url: null,
      demo_url: null,
      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker']
    };

    const result = await createProject(orderedTechInput);

    expect(result.technologies).toEqual(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker']);
    expect(result.technologies[0]).toEqual('React');
    expect(result.technologies[4]).toEqual('Docker');

    // Verify order is preserved in database
    const saved = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(saved[0].technologies).toEqual(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker']);
  });
});