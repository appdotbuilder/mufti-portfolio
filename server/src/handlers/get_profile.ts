import { db } from '../db';
import { profileTable } from '../db/schema';
import { type Profile } from '../schema';

export const getProfile = async (): Promise<Profile | null> => {
  try {
    // Since there should only be one profile, we can just select the first record
    const result = await db.select()
      .from(profileTable)
      .limit(1)
      .execute();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Profile retrieval failed:', error);
    throw error;
  }
};