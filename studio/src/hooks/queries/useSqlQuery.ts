import { executeQuery } from '@/services/sql.service';
import { useMutation } from '@tanstack/react-query';

export function useSqlQuery() {
  return useMutation({
    mutationFn: (query: string) => {
      if (!query?.trim()) {
        throw new Error('Query cannot be empty');
      }
      return executeQuery({ data: query });
    },
  });
}
