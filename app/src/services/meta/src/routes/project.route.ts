import Elysia from "elysia";

export const projectRoutes = new Elysia({ prefix: "/project" }).get(
  "/",
  async () => {
    const defaultProject = {
      id: Bun.randomUUIDv7(),
      name: "Default Project",
      organization: {
        id: Bun.randomUUIDv7(),
        name: "Default Organization",
      },
    };

    return Response.json(defaultProject);
  },
);
