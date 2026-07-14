import { db } from "../../../core/database";
import { queryLogger } from "../../../core/logger";
import { SchemaService } from "../../rest/services/schema.service";
import { ForbiddenException } from "elysia-http-exception";

export abstract class QueryService {
  static async execute(query: string, userId: string, params?: unknown[]) {
    // 1. Read-Only Validation for `auth` schema
    // Reject any mutation commands targeting the auth schema
    const mutationRegex = /\b(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE)\b/i;
    const targetsAuth = /\bauth\./i;
    
    if (targetsAuth.test(query) && mutationRegex.test(query)) {
      throw new ForbiddenException({
        error: "Forbidden",
        message: "The 'auth' schema is read-only. Modifying its structure or data via the Studio is not allowed."
      });
    }

    try {
      // 2. Execute Query
      const result = await db.begin(async (tx: any) =>
        params ? await tx.unsafe(query, params) : await tx.unsafe(query)
      );

      // 3. Invalidate REST schema cache if it was a DDL query
      if (/\b(CREATE|DROP|ALTER)\b/i.test(query)) {
        SchemaService.invalidate();
      }

      // 4. Audit Log (Only log mutations to avoid console spam)
      if (mutationRegex.test(query)) {
        queryLogger.info({
          event: "sql.query.success",
          userId,
          query,
          params,
        });
      }

      return result;
    } catch (error) {
      queryLogger.error({
        event: "sql.query.failed",
        userId,
        query,
        params,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
