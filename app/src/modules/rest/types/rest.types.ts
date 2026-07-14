// ---------------------------------------------------------------------------
// Schema Types
// ---------------------------------------------------------------------------

export interface ColumnInfo {
  name: string;
  type: string;         // pg data_type (e.g. "integer", "text", "boolean")
  udtName: string;      // underlying type / enum name
  isNullable: boolean;
  isPrimaryKey: boolean;
  hasDefault: boolean;
  maxLength: number | null;
}

export interface ForeignKeyInfo {
  constraintName: string;
  columnName: string;
  foreignTableSchema: string;
  foreignTableName: string;
  foreignColumnName: string;
}

export interface TableInfo {
  name: string;
  schema: string;
  tableType: "BASE TABLE" | "VIEW" | "MATERIALIZED VIEW";
  columns: ColumnInfo[];
  primaryKeys: string[];
  foreignKeys: ForeignKeyInfo[];
}

export interface SchemaCache {
  tables: Map<string, TableInfo>;
  fetchedAt: number;
}

// ---------------------------------------------------------------------------
// Query Parser Types
// ---------------------------------------------------------------------------

export interface SelectASTNode {
  type: "column" | "relation";
  name: string; // column name or relation name
  alias?: string;
  children?: SelectASTNode[]; // for nested relations
}

export interface WhereNode {
  sql: string;
  params: unknown[];
}

export interface ParsedQuery {
  select: SelectASTNode[];
  where: WhereNode;
  orderBy: string;
  limit: number;
  offset: number;
}

// ---------------------------------------------------------------------------
// Query Builder Types
// ---------------------------------------------------------------------------

export interface BuildResult {
  sql: string;
  params: unknown[];
}
