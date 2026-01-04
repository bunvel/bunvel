import { getSchemas } from '@/services/schema.service';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-key';

export function useSchemas() {
  return useQuery({
    queryKey: queryKeys.schemas.all(),
    queryFn: getSchemas,
  });
}
