import { env } from "../../../config/env";

export abstract class ProjectService {
  static getDefaultProject() {
    return {
      id: Bun.randomUUIDv7(),
      name: env.DEFAULT_PROJECT,
      organization: {
        id: Bun.randomUUIDv7(),
        name: env.DEFAULT_ORGANIZATION,
      },
    };
  }
}
