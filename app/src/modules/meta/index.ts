import { Elysia } from "elysia";
import { projectRoutes } from "./controllers/project.controller";
import { queryRoutes } from "./controllers/query.controller";
import { auth } from "../auth";

export const metaService = new Elysia({
  name: "Meta Service",
  detail: { description: "Handles raw SQL queries with advanced processing" },
  prefix: "/meta",
})
  .onBeforeHandle(async ({ request, set }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session || !session.user) {
      set.status = 401;
      return "Unauthorized";
    }
    if ((session.user as any).role !== "admin") {
      set.status = 403;
      return "Forbidden: Admin access required";
    }
  })
  .use(queryRoutes)
  .use(projectRoutes);
