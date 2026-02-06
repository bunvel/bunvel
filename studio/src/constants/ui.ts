// Common button text labels
export const BUTTON_LABELS = {
  COPY: 'Copy',
  EXPORT: 'Export',
  INSERT: 'Insert',
  EDIT: 'Edit',
  DELETE: 'Delete',
  CANCEL: 'Cancel',
  CREATE_TABLE: 'Create Table',
  CREATE_SCHEMA: 'Create Schema',
  ADD_SORT: 'Add Sort',
  ADD_FILTER: 'Add Filter',
  APPLY_SORTING: 'Apply Sorting',
  APPLY_FILTERS: 'Apply Filters',
  CLEAR_ALL: 'Clear All',
} as const

// Common dropdown menu item labels
export const DROPDOWN_LABELS = {
  COPY_AS_JSON: 'Copy as JSON',
  COPY_AS_CSV: 'Copy as CSV',
  COPY_AS_SQL: 'Copy as SQL',
  EXPORT_AS_JSON: 'Export as JSON',
  EXPORT_AS_CSV: 'Export as CSV',
  EXPORT_AS_SQL: 'Export as SQL',
} as const

// Common placeholder texts
export const PLACEHOLDERS = {
  SQL_QUERY: 'Enter your SQL query here...',
  SEARCH_TABLES: 'Search tables & views...',
  SEARCH_TABLE: 'Search for a table',
  SEARCH_COLUMN: 'Search for a column',
  SEARCH_TRIGGERS: 'Search triggers...',
  SEARCH_FUNCTIONS: 'Search functions...',
  SEARCH_INDEXES: 'Search for an index',
  SEARCH_ENUMS: 'Search for an enum type',
  TABLE_NAME: 'users, products, orders',
  OPTIONAL: 'Optional',
  COLUMN_NAME: 'e.g., name',
  SCHEMA_NAME: 'Enter schema name',
  FILTER_VALUE: 'Value',
  SELECT_SCHEMA: 'Select a schema',
  SELECT_COLUMN: 'Column',
  SELECT_OPERATOR: 'Operator',
  TABLE_NAME_FK: 'Table name',
  COLUMN_NAME_FK: 'Column name',
  CHECK_CONSTRAINT: 'length("column_name") < 500',
} as const

// Common title texts
export const TITLES = {
  TOGGLE_SIDEBAR: 'Toggle Sidebar',
  CHANGE_THEME: 'Change Theme',
  MODIFIED: 'Modified',
  NEW_QUERY_TAB: 'New Query Tab',
  SELECT_COLUMN_SORT: 'Select column',
  MORE: 'More',
  CLOSE: 'Close',
  PREVIOUS_SLIDE: 'Previous slide',
  NEXT_SLIDE: 'Next slide',
  MORE_PAGES: 'More pages',
  GO_TO_FIRST_PAGE: 'Go to first page',
  GO_TO_PREVIOUS_PAGE: 'Go to previous page',
  GO_TO_NEXT_PAGE: 'Go to next page',
  GO_TO_LAST_PAGE: 'Go to last page',
  TOGGLE_THEME: 'Toggle theme',
  DELETE_TABLE: 'Delete Table',
  TRUNCATE_TABLE: 'Truncate Table',
  AN_ERROR_OCCURRED: 'An Error Occurred',
  PAGE_NOT_FOUND: 'Oops! Page Not Found',
} as const

// Common description texts
export const DESCRIPTIONS = {
  ERROR_OCCURRED: 'Something went wrong while processing your request.',
  PAGE_NOT_FOUND:
    "The page you're looking for doesn't exist or has been moved.",
  SCHEMA_NAME_RULES:
    'Schema name must start with a letter or underscore and contain only letters, numbers, or underscores',
} as const

// Screen reader labels
export const SCREEN_READER_LABELS = {
  TOGGLE_SIDEBAR: TITLES.TOGGLE_SIDEBAR,
  CLOSE: TITLES.CLOSE,
  MORE: TITLES.MORE,
  TOGGLE_THEME: TITLES.TOGGLE_THEME,
} as const

// Table form specific messages
export const TABLE_FORM_MESSAGES = {
  // Titles and labels
  CREATE_NEW_TABLE: 'Create New Table',
  TABLE_NAME: 'Table Name',
  DESCRIPTION: 'Description',
  TABLE_COLUMNS: 'Table Columns',
  FOREIGN_KEYS: 'Foreign Keys',
  COLUMN_NAME: 'Column Name',
  DATA_TYPE: 'Data Type',
  DEFAULT: 'Default',
  REFERENCED_TABLE: 'Referenced Table',
  REFERENCED_COLUMN: 'Referenced Column',
  ON_DELETE: 'On Delete',
  ON_UPDATE: 'On Update',

  // Descriptions
  DEFINE_TABLE_STRUCTURE: 'Define your table structure by adding columns',
  DEFINE_FOREIGN_KEYS: 'Define your foreign key relationships',

  // Button labels
  ADD_COLUMN: 'Add Column',
  ADD_FOREIGN_KEY: 'Add Foreign Key',
  CREATE_TABLE: 'Create Table',
  CANCEL: 'Cancel',
  CREATING: 'Creating...',
  REMOVE: 'Remove',

  // Placeholders
  SELECT_TABLE_FIRST: 'Select table first',
  SELECT_COLUMN: 'Select column',
  SELECT_REFERENCED_TABLE: 'Select referenced table',
  SELECT_REFERENCED_COLUMN: 'Select referenced column',

  // Error messages
  FOREIGN_KEY_TYPE_MISMATCH: 'Foreign key type mismatch',
  TYPE_MISMATCH_TEMPLATE: `Column "{column}" ({localType}) and referenced column "{referencedColumn}" ({referencedType}) have incompatible types.`,

  // Checkbox labels
  PRIMARY_KEY: 'Primary Key',
  UNIQUE: 'Unique',
  NULLABLE: 'Nullable',
} as const
