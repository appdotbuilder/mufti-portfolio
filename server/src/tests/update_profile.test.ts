import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { profileTable } from '../db/schema';
import { type UpdateProfileInput } from '../schema';
import { updateProfile } from '../handlers/update_profile';
import { eq } from 'drizzle-orm';

describe('updateProfile', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('creating new profile', () => {
    it('should create a new profile when none exists', async () => {
      const input: UpdateProfileInput = {
        name: 'John Doe',
        greeting: 'Hello, World!',
        email: 'john@example.com',
        about_description: 'I am a developer.'
      };

      const result = await updateProfile(input);

      expect(result.name).toBe('John Doe');
      expect(result.greeting).toBe('Hello, World!');
      expect(result.email).toBe('john@example.com');
      expect(result.about_description).toBe('I am a developer.');
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });

    it('should use defaults for missing required fields when creating new profile', async () => {
      const input: UpdateProfileInput = {
        name: 'Jane Smith'
      };

      const result = await updateProfile(input);

      expect(result.name).toBe('Jane Smith');
      expect(result.greeting).toBe("Hello! I'm mufti.");
      expect(result.email).toBe('muftipurwa4@gmail.com');
      expect(result.linkedin_url).toBe('https://linkedin.com/in/mufti');
      expect(result.whatsapp_number).toBe('+1234567890');
      expect(result.about_description).toBe("I have a background in fine arts, which I later applied in IT support. This experience sparked my passion for web development, where I now focus on blending creativity with technology.");
    });

    it('should handle null values correctly when creating profile', async () => {
      const input: UpdateProfileInput = {
        name: 'Test User',
        email: 'test@example.com',
        greeting: 'Hi there!',
        about_description: 'Test description',
        linkedin_url: null,
        whatsapp_number: null
      };

      const result = await updateProfile(input);

      expect(result.name).toBe('Test User');
      expect(result.email).toBe('test@example.com');
      expect(result.linkedin_url).toBeNull();
      expect(result.whatsapp_number).toBeNull();
    });
  });

  describe('updating existing profile', () => {
    beforeEach(async () => {
      // Create an initial profile
      await db.insert(profileTable).values({
        name: 'Original Name',
        greeting: 'Original Greeting',
        email: 'original@example.com',
        linkedin_url: 'https://linkedin.com/in/original',
        whatsapp_number: '+0000000000',
        about_description: 'Original description',
        created_at: new Date(),
        updated_at: new Date()
      }).execute();
    });

    it('should update existing profile with new values', async () => {
      const input: UpdateProfileInput = {
        name: 'Updated Name',
        greeting: 'Updated Greeting',
        email: 'updated@example.com'
      };

      const result = await updateProfile(input);

      expect(result.name).toBe('Updated Name');
      expect(result.greeting).toBe('Updated Greeting');
      expect(result.email).toBe('updated@example.com');
      // Should keep original values for fields not updated
      expect(result.linkedin_url).toBe('https://linkedin.com/in/original');
      expect(result.whatsapp_number).toBe('+0000000000');
      expect(result.about_description).toBe('Original description');
    });

    it('should update only provided fields', async () => {
      const input: UpdateProfileInput = {
        name: 'Only Name Updated'
      };

      const result = await updateProfile(input);

      expect(result.name).toBe('Only Name Updated');
      // All other fields should remain unchanged
      expect(result.greeting).toBe('Original Greeting');
      expect(result.email).toBe('original@example.com');
      expect(result.linkedin_url).toBe('https://linkedin.com/in/original');
      expect(result.whatsapp_number).toBe('+0000000000');
      expect(result.about_description).toBe('Original description');
    });

    it('should set fields to null when explicitly provided', async () => {
      const input: UpdateProfileInput = {
        linkedin_url: null,
        whatsapp_number: null
      };

      const result = await updateProfile(input);

      expect(result.linkedin_url).toBeNull();
      expect(result.whatsapp_number).toBeNull();
      // Other fields should remain unchanged
      expect(result.name).toBe('Original Name');
      expect(result.email).toBe('original@example.com');
    });

    it('should update the updated_at timestamp', async () => {
      // Get original profile first
      const originalProfile = await db.select()
        .from(profileTable)
        .limit(1)
        .execute();

      const originalUpdatedAt = originalProfile[0].updated_at;

      // Wait a small amount to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const input: UpdateProfileInput = {
        name: 'Updated Name'
      };

      const result = await updateProfile(input);

      expect(result.updated_at).toBeInstanceOf(Date);
      expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should persist changes to database', async () => {
      const input: UpdateProfileInput = {
        name: 'Database Test',
        email: 'database@test.com'
      };

      const result = await updateProfile(input);

      // Verify in database
      const profiles = await db.select()
        .from(profileTable)
        .where(eq(profileTable.id, result.id))
        .execute();

      expect(profiles).toHaveLength(1);
      expect(profiles[0].name).toBe('Database Test');
      expect(profiles[0].email).toBe('database@test.com');
    });
  });

  describe('edge cases', () => {
    it('should handle empty input object', async () => {
      const input: UpdateProfileInput = {};

      const result = await updateProfile(input);

      // Should create new profile with all defaults
      expect(result.name).toBe('mufti');
      expect(result.greeting).toBe("Hello! I'm mufti.");
      expect(result.email).toBe('muftipurwa4@gmail.com');
    });

    it('should handle updating with empty strings', async () => {
      const input: UpdateProfileInput = {
        name: '',
        greeting: '',
        email: 'test@example.com',
        about_description: ''
      };

      const result = await updateProfile(input);

      expect(result.name).toBe('');
      expect(result.greeting).toBe('');
      expect(result.email).toBe('test@example.com');
      expect(result.about_description).toBe('');
    });
  });
});