import Endpoints from '@/data/endpoints';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface DatabaseSchema {
  schema_name: string;
}

export interface DatabaseTable {
  table_name: string;
  schema_name: string;
}

const useDatabaseSchema = () => {
  const [schemas, setSchemas] = useState<DatabaseSchema[]>([]);
  const [tables, setTables] = useState<Record<string, DatabaseTable[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchemas = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(Endpoints.QUERY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            SELECT nspname as schema_name
            FROM pg_catalog.pg_namespace
            WHERE nspname NOT LIKE 'pg_%' 
            AND nspname != 'information_schema'
            AND nspname != 'pg_catalog'
            ORDER BY nspname;
          `
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch database schemas');
      }

      const data = await response.json();
      setSchemas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching schemas:', err);
      setError('Failed to load database schemas');
      toast.error('Failed to load database schemas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTablesForSchema = async (schemaName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(Endpoints.QUERY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            SELECT 
              table_name,
              '${schemaName}' as schema_name
            FROM information_schema.tables 
            WHERE table_schema = '${schemaName}'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
          `
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tables for schema: ${schemaName}`);
      }

      const data = await response.json();
      setTables(prev => ({
        ...prev,
        [schemaName]: Array.isArray(data) ? data : []
      }));
    } catch (err) {
      console.error(`Error fetching tables for schema ${schemaName}:`, err);
      setError(`Failed to load tables for schema: ${schemaName}`);
      toast.error(`Failed to load tables for schema: ${schemaName}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load schemas on mount
  useEffect(() => {
    fetchSchemas();
  }, []);

  return {
    schemas,
    tables,
    isLoading,
    error,
    fetchSchemas,
    fetchTablesForSchema,
  };
};

export default useDatabaseSchema;
