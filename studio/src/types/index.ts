import { z } from 'zod'

export interface SearchParams {
  schema?: string
  table?: string
}

export const SearchTableSchema = z.object({
  schema: z.string().default('public'),
  table: z.string().default(''),
})
