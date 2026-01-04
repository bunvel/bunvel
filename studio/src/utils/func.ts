import { createServerFn } from '@tanstack/react-start'
import { READONLY_SCHEMAS } from './constant'

export const isReadonlySchema = (schema?: string): boolean => {
  return schema ? READONLY_SCHEMAS.includes(schema) : false
}

export const getEnv = createServerFn().handler(async () => {
  const DEFAULT_ORG = process.env.VITE_STUDIO_DEFAULT_ORGANIZATION

  const DEFAULT_PROJECT = process.env.VITE_STUDIO_DEFAULT_PROJECT

  const API_URL = process.env.VITE_API_URL

  const BUNVEL_STUDIO_URL = process.env.VITE_BUNVEL_STUDIO_URL

  return { DEFAULT_ORG, DEFAULT_PROJECT, API_URL, BUNVEL_STUDIO_URL }
})

export const Env = await getEnv()
