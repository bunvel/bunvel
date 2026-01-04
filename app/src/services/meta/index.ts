import { Elysia } from 'elysia';
import { parameterizedQuery } from './src/routes/parameterized-query.route';
import { rawQuery } from './src/routes/raw-query.route';

export const metaService = new Elysia({
  name: 'Meta Service',
  detail: { description: 'Handles raw SQL queries with advanced processing' },
  prefix: '/meta',
})
.use(rawQuery)
.use(parameterizedQuery)