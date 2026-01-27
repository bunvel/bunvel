import Elysia, { t } from "elysia";
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

    return defaultProject;
  },
  {
    response: t.Object({
      id: t.String(),
      name: t.String(),
      organization: t.Object({
        id: t.String(),
        name: t.String(),
      }),
    }),
  },
);
