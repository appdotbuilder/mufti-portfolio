import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { getProjects } from '../handlers/get_projects';
import { type CreateProjectInput } from '../schema';

// Test project data
const testProject1: CreateProjectInput = {
  title: 'Portfolio Website',
  description: 'A personal portfolio website built with React and TypeScript',
  image_url: 'https://example.com/portfolio.png',
  github_url: 'https://github.com/user/portfolio',
  demo_url: 'https://portfolio.example.com',
  technologies: ['React', 'TypeScript', 'CSS']
};

const testProject2: CreateProjectInput = {
  title: 'E-commerce API',
  description: 'RESTful API for an e-commerce platform',
  image_url: null,
  github_url: 'https://github.com/user/ecommerce-api',
  demo_url: null,
  technologies: ['Node.js', 'Express', 'PostgreSQL']
};

const testProject3: CreateProjectInput = {
  title: 'Mobile App',
  description: 'Cross-platform mobile application',
  image_url: 'https://example.com/mobile.png',
  github_url: null,
  demo_url: 'https://app.example.com',
  technologies: ['React Native', 'JavaScript']
};

describe('getProjects', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no projects exist', async () => {
    const result = await getProjects();
    
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all projects with correct data types', async () => {
    // Insert test projects
    await db.insert(projectsTable)
      .values([
        {
          title: testProject1.title,
          description: testProject1.description,
          image_url: testProject1.image_url,
          github_url: testProject1.github_url,
          demo_url: testProject1.demo_url,
          technologies: testProject1.technologies
        },
        {
          title: testProject2.title,
          description: testProject2.description,
          image_url: testProject2.image_url,
          github_url: testProject2.github_url,
          demo_url: testProject2.demo_url,
          technologies: testProject2.technologies
        }
      ])
      .execute();

    const result = await getProjects();

    expect(result).toHaveLength(2);
    
    // Validate first project
    const project1 = result.find(p => p.title === 'Portfolio Website');
    expect(project1).toBeDefined();
    expect(project1!.title).toBe('Portfolio Website');
    expect(project1!.description).toBe(testProject1.description);
    expect(project1!.image_url).toBe('https://example.com/portfolio.png');
    expect(project1!.github_url).toBe('https://github.com/user/portfolio');
    expect(project1!.demo_url).toBe('https://portfolio.example.com');
    expect(Array.isArray(project1!.technologies)).toBe(true);
    expect(project1!.technologies).toEqual(['React', 'TypeScript', 'CSS']);
    expect(project1!.id).toBeDefined();
    expect(project1!.created_at).toBeInstanceOf(Date);
    expect(project1!.updated_at).toBeInstanceOf(Date);

    // Validate second project with null fields
    const project2 = result.find(p => p.title === 'E-commerce API');
    expect(project2).toBeDefined();
    expect(project2!.title).toBe('E-commerce API');
    expect(project2!.description).toBe(testProject2.description);
    expect(project2!.image_url).toBeNull();
    expect(project2!.github_url).toBe('https://github.com/user/ecommerce-api');
    expect(project2!.demo_url).toBeNull();
    expect(Array.isArray(project2!.technologies)).toBe(true);
    expect(project2!.technologies).toEqual(['Node.js', 'Express', 'PostgreSQL']);
  });

  it('should return projects ordered by creation date (newest first)', async () => {
    // Insert projects with slight delay to ensure different timestamps
    await db.insert(projectsTable)
      .values({
        title: testProject1.title,
        description: testProject1.description,
        image_url: testProject1.image_url,
        github_url: testProject1.github_url,
        demo_url: testProject1.demo_url,
        technologies: testProject1.technologies
      })
      .execute();

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(projectsTable)
      .values({
        title: testProject2.title,
        description: testProject2.description,
        image_url: testProject2.image_url,
        github_url: testProject2.github_url,
        demo_url: testProject2.demo_url,
        technologies: testProject2.technologies
      })
      .execute();

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(projectsTable)
      .values({
        title: testProject3.title,
        description: testProject3.description,
        image_url: testProject3.image_url,
        github_url: testProject3.github_url,
        demo_url: testProject3.demo_url,
        technologies: testProject3.technologies
      })
      .execute();

    const result = await getProjects();

    expect(result).toHaveLength(3);
    
    // Verify ordering - newest should be first (Mobile App was inserted last)
    expect(result[0].title).toBe('Mobile App');
    expect(result[1].title).toBe('E-commerce API');
    expect(result[2].title).toBe('Portfolio Website');
    
    // Verify timestamps are in descending order
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[1].created_at >= result[2].created_at).toBe(true);
  });

  it('should handle projects with empty technologies array', async () => {
    await db.insert(projectsTable)
      .values({
        title: 'Simple Project',
        description: 'A project with no technologies',
        image_url: null,
        github_url: null,
        demo_url: null,
        technologies: [] // Empty array
      })
      .execute();

    const result = await getProjects();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Simple Project');
    expect(Array.isArray(result[0].technologies)).toBe(true);
    expect(result[0].technologies).toEqual([]);
  });

  it('should handle projects with single technology', async () => {
    await db.insert(projectsTable)
      .values({
        title: 'Single Tech Project',
        description: 'A project with one technology',
        image_url: null,
        github_url: null,
        demo_url: null,
        technologies: ['JavaScript'] // Single item array
      })
      .execute();

    const result = await getProjects();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Single Tech Project');
    expect(Array.isArray(result[0].technologies)).toBe(true);
    expect(result[0].technologies).toEqual(['JavaScript']);
  });
});