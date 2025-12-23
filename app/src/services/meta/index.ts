import { Elysia } from 'elysia';
import { query } from './src/routes/query.route';

export const metaService = new Elysia({
  name: 'Meta Service',
  detail: { description: 'Handles raw SQL queries with advanced processing' },
  prefix: '/meta',
})
.use(query)