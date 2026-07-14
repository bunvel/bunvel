import Elysia, { t } from "elysia";
import { ProjectService } from "../services/project.service";

export const projectRoutes = new Elysia({ prefix: "/project" }).get(
  "/",
  async () => {
    return ProjectService.getDefaultProject();
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
  }
);
