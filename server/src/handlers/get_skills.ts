import { db } from '../db';
import { skillsTable } from '../db/schema';
import { type Skill } from '../schema';

export const getSkills = async (): Promise<Skill[]> => {
  try {
    // Fetch all skills from the database
    const result = await db.select()
      .from(skillsTable)
      .execute();

    // Return skills with proper field mapping
    return result.map(skill => ({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      created_at: skill.created_at
    }));
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    throw error;
  }
};