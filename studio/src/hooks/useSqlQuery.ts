import Endpoints from '@/data/endpoints';
import { useState } from 'react';
import { toast } from 'sonner';

export interface QueryResult {
  [key: string]: any;
}

export const useSqlQuery = () => {
  const [query, setQuery] = useState('SELECT 1');
  const [results, setResults] = useState<QueryResult[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const executeQuery = async (sqlQuery: string) => {
    if (!sqlQuery.trim()) return;

    setIsLoading(true);
    setResults([]);
    setColumns([]);

    try {
      const response = await fetch(Endpoints.QUERY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sqlQuery.trim() }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to execute query');
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        toast('No results', {
          description: 'The query executed successfully but returned no data.',
        });
        return;
      }

      setColumns(Object.keys(data[0]));
      setResults(data);
    } catch (error: any) {
      console.error('Error executing query:', error);
      toast.error(error.message || 'Failed to execute query');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    query,
    setQuery,
    results,
    columns,
    isLoading,
    executeQuery,
  };
};

export default useSqlQuery;
