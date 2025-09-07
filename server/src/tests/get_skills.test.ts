import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { skillsTable } from '../db/schema';
import { type CreateSkillInput } from '../schema';
import { getSkills } from '../handlers/get_skills';
import { eq } from 'drizzle-orm';

// Test skill data
const testSkills: CreateSkillInput[] = [
  {
    name: 'JavaScript',
    category: 'Programming Language'
  },
  {
    name: 'React',
    category: 'Frontend Framework'
  },
  {
    name: 'Git',
    category: null
  },
  {
    name: 'Node.js',
    category: 'Backend Runtime'
  }
];

describe('getSkills', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no skills exist', async () => {
    const result = await getSkills();

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all skills from database', async () => {
    // Insert test skills
    await db.insert(skillsTable)
      .values(testSkills)
      .execute();

    const result = await getSkills();

    expect(result).toHaveLength(4);
    expect(result[0].name).toEqual('JavaScript');
    expect(result[0].category).toEqual('Programming Language');
    expect(result[1].name).toEqual('React');
    expect(result[1].category).toEqual('Frontend Framework');
    expect(result[2].name).toEqual('Git');
    expect(result[2].category).toBeNull();
    expect(result[3].name).toEqual('Node.js');
    expect(result[3].category).toEqual('Backend Runtime');
  });

  it('should return skills with correct field types', async () => {
    // Insert a single skill
    await db.insert(skillsTable)
      .values({
        name: 'TypeScript',
        category: 'Programming Language'
      })
      .execute();

    const result = await getSkills();

    expect(result).toHaveLength(1);
    const skill = result[0];

    // Verify field types
    expect(typeof skill.id).toBe('number');
    expect(typeof skill.name).toBe('string');
    expect(skill.category).toBe('Programming Language');
    expect(skill.created_at).toBeInstanceOf(Date);
    expect(skill.id).toBeDefined();
  });

  it('should handle skills with null categories correctly', async () => {
    // Insert skills with null categories
    await db.insert(skillsTable)
      .values([
        { name: 'HTML', category: null },
        { name: 'CSS', category: null },
        { name: 'Bootstrap', category: 'CSS Framework' }
      ])
      .execute();

    const result = await getSkills();

    expect(result).toHaveLength(3);
    expect(result[0].category).toBeNull();
    expect(result[1].category).toBeNull();
    expect(result[2].category).toEqual('CSS Framework');
  });

  it('should return skills in database order', async () => {
    // Insert skills in specific order
    const skillsInOrder = [
      { name: 'First Skill', category: 'Category A' },
      { name: 'Second Skill', category: 'Category B' },
      { name: 'Third Skill', category: null }
    ];

    await db.insert(skillsTable)
      .values(skillsInOrder)
      .execute();

    const result = await getSkills();

    expect(result).toHaveLength(3);
    expect(result[0].name).toEqual('First Skill');
    expect(result[1].name).toEqual('Second Skill');
    expect(result[2].name).toEqual('Third Skill');
  });

  it('should preserve database state after query', async () => {
    // Insert test skill
    await db.insert(skillsTable)
      .values({ name: 'Test Skill', category: 'Test Category' })
      .execute();

    // Call getSkills
    await getSkills();

    // Verify skill still exists in database
    const skillsInDB = await db.select()
      .from(skillsTable)
      .where(eq(skillsTable.name, 'Test Skill'))
      .execute();

    expect(skillsInDB).toHaveLength(1);
    expect(skillsInDB[0].name).toEqual('Test Skill');
    expect(skillsInDB[0].category).toEqual('Test Category');
  });

  it('should handle large number of skills', async () => {
    // Create many skills
    const manySkills = Array.from({ length: 50 }, (_, index) => ({
      name: `Skill ${index + 1}`,
      category: index % 3 === 0 ? null : `Category ${Math.floor(index / 10) + 1}`
    }));

    await db.insert(skillsTable)
      .values(manySkills)
      .execute();

    const result = await getSkills();

    expect(result).toHaveLength(50);
    expect(result[0].name).toEqual('Skill 1');
    expect(result[49].name).toEqual('Skill 50');
    
    // Verify some have null categories
    const nullCategories = result.filter(skill => skill.category === null);
    expect(nullCategories.length).toBeGreaterThan(0);
  });
});