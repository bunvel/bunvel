import { Elysia, t } from "elysia";
import { db } from "../../../../database";

// Helper function to safely create SQL identifiers
const ident = (name: string) => `"${name.replace(/"/g, '""')}"`;

export const tables = new Elysia()
  // List all tables
  .get("/tables", async () => {
    const tables = await db`
      SELECT 
        table_schema,
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `;
    return Response.json(tables);
  })
  // Get table metadata
  .get(
    "/tables/:schema/:table",
    async ({ params }) => {
      const { schema, table } = params;

      // Get table metadata
      const [tableInfo] = await db`
        SELECT 
          t.table_schema,
          t.table_name,
          t.table_type,
          pg_catalog.obj_description(
            (t.table_schema || '.' || t.table_name)::regclass::oid,
            'pg_class'
          ) as table_comment
        FROM information_schema.tables t
        WHERE t.table_schema = ${schema}
          AND t.table_name = ${table}
      `;

      if (!tableInfo) {
        throw new Error("Table not found");
      }

      // Get column information
      const columns = await db`
        SELECT 
          c.column_name as name,
          c.data_type as type,
          c.is_nullable = 'YES' as nullable,
          c.column_default as default_value,
          c.character_maximum_length as max_length,
          c.numeric_precision as precision,
          c.numeric_scale as scale,
          c.udt_name as udt_name,
          pg_catalog.col_description(
            (c.table_schema || '.' || c.table_name)::regclass::oid,
            c.ordinal_position
          ) as column_comment
        FROM information_schema.columns c
        WHERE c.table_schema = ${schema}
          AND c.table_name = ${table}
        ORDER BY c.ordinal_position
      `;

      // Get constraints
      const constraints = await db`
        SELECT
          tc.constraint_name as name,
          tc.constraint_type as type,
          kcu.column_name,
          ccu.table_schema as foreign_table_schema,
          ccu.table_name as foreign_table_name,
          ccu.column_name as foreign_column_name
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.table_schema = ${schema}
          AND tc.table_name = ${table}
      `;

      // Get indexes
      const indexes = await db`
        SELECT
          i.relname as index_name,
          a.attname as column_name,
          ix.indisprimary as is_primary,
          ix.indisunique as is_unique
        FROM
          pg_index ix
          JOIN pg_class t ON t.oid = ix.indrelid
          JOIN pg_class i ON i.oid = ix.indexrelid
          JOIN pg_namespace n ON n.oid = t.relnamespace
          JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
        WHERE
          t.relname = ${table}
          AND n.nspname = ${schema}
        ORDER BY
          i.relname, array_position(ix.indkey, a.attnum);
      `;

      return Response.json({
        ...tableInfo,
        columns,
        constraints,
        indexes,
      });
    },
    {
      params: t.Object({
        schema: t.String(),
        table: t.String(),
      }),
    }
  )
  // Get table data with pagination
  .get(
    "/tables/:schema/:table/data",
    async ({ params, query }) => {
      const { schema, table } = params;
      const { page = 1, pageSize = 100 } = query;
      const offset = (page - 1) * pageSize;

      // First, get the total count of records
      const [countResult] = await db.unsafe(`
        SELECT COUNT(*) as total 
        FROM ${ident(schema)}.${ident(table)}
      `);

      // Then get the paginated data
      const data = await db.unsafe(`
        SELECT * 
        FROM ${ident(schema)}.${ident(table)}
        ORDER BY id
        LIMIT ${pageSize} 
        OFFSET ${offset}
      `);

      return Response.json({
        data,
        total: Number(countResult.total),
        page,
        pageSize,
        totalPages: Math.ceil(Number(countResult.total) / pageSize),
      });
    },
    {
      params: t.Object({
        schema: t.String(),
        table: t.String(),
      }),
      query: t.Object({
        page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
        pageSize: t.Optional(
          t.Numeric({ minimum: 1, maximum: 100, default: 10 })
        ),
      }),
    }
  )
  // Create a new table
  .post(
    "/tables",
    async ({ body }) => {
      const { name, schema = "public", columns } = body;

      // Build column definitions
      const columnDefs = columns
        .map(
          (col) =>
            `${ident(col.name)} ${col.type} ${col.nullable ? "" : "NOT NULL"}`
        )
        .join(",");

      // Create table
      await db.unsafe(`
        CREATE TABLE ${ident(schema)}.${ident(name)} (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          ${columnDefs}
        )
      `);

      return Response.json({ success: true });
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        schema: t.Optional(t.String({ default: "public" })),
        columns: t.Array(
          t.Object({
            name: t.String(),
            type: t.String(),
            nullable: t.Optional(t.Boolean({ default: false })),
          }),
          { minItems: 1 }
        ),
      }),
    }
  )
  // Alter an existing table
  .patch(
    "/tables/:schema/:table",
    async ({ params, body }) => {
      const { schema, table } = params;
      const { action, column } = body;

      switch (action) {
        case "add_column":
          await db.unsafe(`
            ALTER TABLE ${ident(schema)}.${ident(table)}
            ADD COLUMN ${ident(column.name)} ${column.type} 
            ${column.nullable ? "" : "NOT NULL"}
            ${column.default ? `DEFAULT ${column.default}` : ""}
          `);
          break;

        case "drop_column":
          await db.unsafe(`
            ALTER TABLE ${ident(schema)}.${ident(table)}
            DROP COLUMN ${ident(column.name)}
          `);
          break;

        case "rename_column":
          await db.unsafe(`
            ALTER TABLE ${ident(schema)}.${ident(table)}
            RENAME COLUMN ${ident(column.oldName)} TO ${ident(column.newName)}
          `);
          break;

        default:
          throw new Error("Invalid action");
      }

      return Response.json({ success: true });
    },
    {
      params: t.Object({
        schema: t.String(),
        table: t.String(),
      }),
      body: t.Union([
        // Add column
        t.Object({
          action: t.Literal("add_column"),
          column: t.Object({
            name: t.String(),
            type: t.String(),
            nullable: t.Optional(t.Boolean()),
            default: t.Optional(t.String()),
          }),
        }),
        // Drop column
        t.Object({
          action: t.Literal("drop_column"),
          column: t.Object({
            name: t.String(),
          }),
        }),
        // Rename column
        t.Object({
          action: t.Literal("rename_column"),
          column: t.Object({
            oldName: t.String(),
            newName: t.String(),
          }),
        }),
      ]),
    }
  )
  // Drop a table
  .delete(
    "/tables/:schema/:table",
    async ({ params }) => {
      const { schema, table } = params;

      await db.unsafe(`
        DROP TABLE IF EXISTS ${ident(schema)}.${ident(table)} CASCADE
      `);

      return Response.json({ success: true });
    },
    {
      params: t.Object({
        schema: t.String(),
        table: t.String(),
      }),
    }
  );
