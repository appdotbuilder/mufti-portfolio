import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  updateProfileInputSchema,
  createSkillInputSchema, 
  createProjectInputSchema,
  updateProjectInputSchema
} from './schema';

// Import handlers
import { getProfile } from './handlers/get_profile';
import { updateProfile } from './handlers/update_profile';
import { getSkills } from './handlers/get_skills';
import { createSkill } from './handlers/create_skill';
import { getProjects } from './handlers/get_projects';
import { createProject } from './handlers/create_project';
import { updateProject } from './handlers/update_project';
import { deleteProject } from './handlers/delete_project';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Profile routes
  getProfile: publicProcedure
    .query(() => getProfile()),
  
  updateProfile: publicProcedure
    .input(updateProfileInputSchema)
    .mutation(({ input }) => updateProfile(input)),

  // Skills routes
  getSkills: publicProcedure
    .query(() => getSkills()),
  
  createSkill: publicProcedure
    .input(createSkillInputSchema)
    .mutation(({ input }) => createSkill(input)),

  // Projects routes
  getProjects: publicProcedure
    .query(() => getProjects()),
  
  createProject: publicProcedure
    .input(createProjectInputSchema)
    .mutation(({ input }) => createProject(input)),
  
  updateProject: publicProcedure
    .input(updateProjectInputSchema)
    .mutation(({ input }) => updateProject(input)),
  
  deleteProject: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteProject(input.id)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`Portfolio API server listening at port: ${port}`);
}

start();