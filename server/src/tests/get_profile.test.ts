import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { profileTable } from '../db/schema';
import { getProfile } from '../handlers/get_profile';

// Test profile data
const testProfile = {
  name: 'John Doe',
  greeting: 'Hello! I\'m John.',
  email: 'john@example.com',
  linkedin_url: 'https://linkedin.com/in/johndoe',
  whatsapp_number: '+1234567890',
  about_description: 'Software developer with 5 years of experience in web development.'
};

describe('getProfile', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when no profile exists', async () => {
    const result = await getProfile();
    expect(result).toBeNull();
  });

  it('should return the profile when one exists', async () => {
    // Insert a test profile
    await db.insert(profileTable)
      .values(testProfile)
      .execute();

    const result = await getProfile();

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('John Doe');
    expect(result!.greeting).toEqual('Hello! I\'m John.');
    expect(result!.email).toEqual('john@example.com');
    expect(result!.linkedin_url).toEqual('https://linkedin.com/in/johndoe');
    expect(result!.whatsapp_number).toEqual('+1234567890');
    expect(result!.about_description).toEqual('Software developer with 5 years of experience in web development.');
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return the first profile when multiple profiles exist', async () => {
    // Insert multiple test profiles
    await db.insert(profileTable)
      .values([
        { ...testProfile, name: 'First Profile' },
        { ...testProfile, name: 'Second Profile' }
      ])
      .execute();

    const result = await getProfile();

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('First Profile');
  });

  it('should handle profile with nullable fields set to null', async () => {
    // Insert profile with null values for optional fields
    const profileWithNulls = {
      name: 'Jane Doe',
      greeting: 'Hi there!',
      email: 'jane@example.com',
      linkedin_url: null,
      whatsapp_number: null,
      about_description: 'Developer without social media links.'
    };

    await db.insert(profileTable)
      .values(profileWithNulls)
      .execute();

    const result = await getProfile();

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Jane Doe');
    expect(result!.linkedin_url).toBeNull();
    expect(result!.whatsapp_number).toBeNull();
    expect(result!.about_description).toEqual('Developer without social media links.');
  });

  it('should return profile with correct timestamp fields', async () => {
    await db.insert(profileTable)
      .values(testProfile)
      .execute();

    const result = await getProfile();

    expect(result).not.toBeNull();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
    
    // Verify timestamps are reasonably recent (within last minute)
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    
    expect(result!.created_at.getTime()).toBeGreaterThan(oneMinuteAgo.getTime());
    expect(result!.updated_at.getTime()).toBeGreaterThan(oneMinuteAgo.getTime());
  });
});