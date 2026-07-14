import { db } from "../../../core/database";
import { queryLogger } from "../../../core/logger";

export abstract class QueryService {
  static async execute(query: string, params?: unknown[]) {
    try {
      const result = await db.begin(async (tx: any) =>
        params ? await tx.unsafe(query, params) : await tx.unsafe(query)
      );
      return result;
    } catch (error) {
      queryLogger.error({
        event: "sql.query.failed",
        query: query,
        params: params,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
