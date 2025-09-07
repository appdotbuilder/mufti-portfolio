import { z } from 'zod';

// Profile schema for the main profile information
export const profileSchema = z.object({
  id: z.number(),
  name: z.string(),
  greeting: z.string(),
  email: z.string().email(),
  linkedin_url: z.string().url().nullable(),
  whatsapp_number: z.string().nullable(),
  about_description: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Profile = z.infer<typeof profileSchema>;

// Input schema for creating/updating profile
export const updateProfileInputSchema = z.object({
  name: z.string().optional(),
  greeting: z.string().optional(),
  email: z.string().email().optional(),
  linkedin_url: z.string().url().nullable().optional(),
  whatsapp_number: z.string().nullable().optional(),
  about_description: z.string().optional()
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

// Skill schema
export const skillSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Skill = z.infer<typeof skillSchema>;

// Input schema for creating skills
export const createSkillInputSchema = z.object({
  name: z.string(),
  category: z.string().nullable()
});

export type CreateSkillInput = z.infer<typeof createSkillInputSchema>;

// Project schema
export const projectSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  image_url: z.string().nullable(),
  github_url: z.string().url().nullable(),
  demo_url: z.string().url().nullable(),
  technologies: z.array(z.string()),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Project = z.infer<typeof projectSchema>;

// Input schema for creating projects
export const createProjectInputSchema = z.object({
  title: z.string(),
  description: z.string(),
  image_url: z.string().nullable(),
  github_url: z.string().url().nullable(),
  demo_url: z.string().url().nullable(),
  technologies: z.array(z.string())
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

// Input schema for updating projects
export const updateProjectInputSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().nullable().optional(),
  github_url: z.string().url().nullable().optional(),
  demo_url: z.string().url().nullable().optional(),
  technologies: z.array(z.string()).optional()
});

export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;