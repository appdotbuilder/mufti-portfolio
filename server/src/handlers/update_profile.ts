import { db } from '../db';
import { profileTable } from '../db/schema';
import { type UpdateProfileInput, type Profile } from '../schema';
import { sql } from 'drizzle-orm';

export const updateProfile = async (input: UpdateProfileInput): Promise<Profile> => {
  try {
    // Check if profile exists (assuming single profile system)
    const existingProfiles = await db.select()
      .from(profileTable)
      .limit(1)
      .execute();

    const now = new Date();

    if (existingProfiles.length > 0) {
      // Update existing profile
      const existingProfile = existingProfiles[0];
      
      // Build update object with only provided fields
      const updateData: any = {
        updated_at: now
      };

      if (input.name !== undefined) updateData.name = input.name;
      if (input.greeting !== undefined) updateData.greeting = input.greeting;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.linkedin_url !== undefined) updateData.linkedin_url = input.linkedin_url;
      if (input.whatsapp_number !== undefined) updateData.whatsapp_number = input.whatsapp_number;
      if (input.about_description !== undefined) updateData.about_description = input.about_description;

      const result = await db.update(profileTable)
        .set(updateData)
        .where(sql`id = ${existingProfile.id}`)
        .returning()
        .execute();

      return result[0];
    } else {
      // Create new profile - all required fields must be provided or use defaults
      const defaultProfile = {
        name: "mufti",
        greeting: "Hello! I'm mufti.",
        email: "muftipurwa4@gmail.com",
        linkedin_url: "https://linkedin.com/in/mufti",
        whatsapp_number: "+1234567890",
        about_description: "I have a background in fine arts, which I later applied in IT support. This experience sparked my passion for web development, where I now focus on blending creativity with technology."
      };

      const createData = {
        name: input.name !== undefined ? input.name : defaultProfile.name,
        greeting: input.greeting !== undefined ? input.greeting : defaultProfile.greeting,
        email: input.email !== undefined ? input.email : defaultProfile.email,
        linkedin_url: input.linkedin_url !== undefined ? input.linkedin_url : defaultProfile.linkedin_url,
        whatsapp_number: input.whatsapp_number !== undefined ? input.whatsapp_number : defaultProfile.whatsapp_number,
        about_description: input.about_description !== undefined ? input.about_description : defaultProfile.about_description,
        created_at: now,
        updated_at: now
      };

      const result = await db.insert(profileTable)
        .values(createData)
        .returning()
        .execute();

      return result[0];
    }
  } catch (error) {
    console.error('Profile update failed:', error);
    throw error;
  }
};