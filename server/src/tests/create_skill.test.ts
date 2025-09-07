import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { skillsTable } from '../db/schema';
import { type CreateSkillInput } from '../schema';
import { createSkill } from '../handlers/create_skill';
import { eq } from 'drizzle-orm';

describe('createSkill', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a skill with category', async () => {
    const testInput: CreateSkillInput = {
      name: 'JavaScript',
      category: 'Programming Languages'
    };

    const result = await createSkill(testInput);

    // Basic field validation
    expect(result.name).toEqual('JavaScript');
    expect(result.category).toEqual('Programming Languages');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a skill without category', async () => {
    const testInput: CreateSkillInput = {
      name: 'Problem Solving',
      category: null
    };

    const result = await createSkill(testInput);

    // Basic field validation
    expect(result.name).toEqual('Problem Solving');
    expect(result.category).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save skill to database', async () => {
    const testInput: CreateSkillInput = {
      name: 'TypeScript',
      category: 'Programming Languages'
    };

    const result = await createSkill(testInput);

    // Query using proper drizzle syntax
    const skills = await db.select()
      .from(skillsTable)
      .where(eq(skillsTable.id, result.id))
      .execute();

    expect(skills).toHaveLength(1);
    expect(skills[0].name).toEqual('TypeScript');
    expect(skills[0].category).toEqual('Programming Languages');
    expect(skills[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple skills with different categories', async () => {
    const skillInputs: CreateSkillInput[] = [
      { name: 'React', category: 'Frontend Frameworks' },
      { name: 'Node.js', category: 'Backend Technologies' },
      { name: 'Leadership', category: null }
    ];

    const results = await Promise.all(
      skillInputs.map(input => createSkill(input))
    );

    expect(results).toHaveLength(3);
    
    // Verify each skill was created correctly
    expect(results[0].name).toEqual('React');
    expect(results[0].category).toEqual('Frontend Frameworks');
    
    expect(results[1].name).toEqual('Node.js');
    expect(results[1].category).toEqual('Backend Technologies');
    
    expect(results[2].name).toEqual('Leadership');
    expect(results[2].category).toBeNull();

    // Verify all skills were saved to database
    const allSkills = await db.select().from(skillsTable).execute();
    expect(allSkills).toHaveLength(3);
  });

  it('should handle skills with same name but different categories', async () => {
    const skill1: CreateSkillInput = {
      name: 'Testing',
      category: 'Quality Assurance'
    };

    const skill2: CreateSkillInput = {
      name: 'Testing',
      category: 'Software Development'
    };

    const result1 = await createSkill(skill1);
    const result2 = await createSkill(skill2);

    expect(result1.name).toEqual('Testing');
    expect(result1.category).toEqual('Quality Assurance');
    expect(result2.name).toEqual('Testing');
    expect(result2.category).toEqual('Software Development');
    expect(result1.id).not.toEqual(result2.id);

    // Verify both skills exist in database
    const skills = await db.select().from(skillsTable).execute();
    expect(skills).toHaveLength(2);
  });
});