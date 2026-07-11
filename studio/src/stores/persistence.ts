import { logger } from '@/lib/logger'

export interface PersistenceOptions<T> {
  key: string
  serialize?: (value: T) => string
  deserialize?: (value: string) => T
}

export function createPersistence<T>(options: PersistenceOptions<T>) {
  const { key, serialize = JSON.stringify, deserialize = JSON.parse } = options

  const load = (): T | null => {
    if (typeof window === 'undefined') return null

    try {
      const stored = window.localStorage.getItem(key)
      return stored ? deserialize(stored) : null
    } catch (error) {
      logger.error({
        msg: `Failed to load ${key} from localStorage`,
        error,
      })
      return null
    }
  }

  const save = (value: T) => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(key, serialize(value))
    } catch (error) {
      logger.error({
        msg: `Failed to save ${key} to localStorage`,
        error,
      })
    }
  }

  const remove = () => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      logger.error({
        msg: `Failed to remove ${key} from localStorage`,
        error,
      })
    }
  }

  return { load, save, remove }
}
