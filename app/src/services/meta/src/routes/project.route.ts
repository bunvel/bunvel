import Elysia from "elysia";
import { env } from "../../../../utils/config";

export const projectRoutes = new Elysia({ prefix: "/project" }).get(
  "/",
  async () => {
    const defaultProject = {
      id: Bun.randomUUIDv7(),
      name: env.DEFAULT_PROJECT,
      organization: {
        id: Bun.randomUUIDv7(),
        name: env.DEFAULT_ORGANIZATION,
      },
    };

    return Response.json(defaultProject);
  },
);
