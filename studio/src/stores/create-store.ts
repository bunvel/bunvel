import { useSelector } from '@tanstack/react-store'
import { Store } from '@tanstack/store'

export type StoreState = Record<string, any>

export interface CreateStoreOptions<TState extends StoreState, TActions> {
  initialState: TState
  actions: (setState: (updater: (state: TState) => TState) => void, getState: () => TState) => TActions
  name?: string
}

export function createStore<TState extends StoreState, TActions>(
  options: CreateStoreOptions<TState, TActions>,
) {
  const { initialState, actions, name } = options

  const store = new Store<TState>(initialState)

  const setState = (updater: (state: TState) => TState) => {
    store.setState((prev) => updater(prev))
  }

  const getState = () => store.get()

  const storeActions = actions(setState, getState)

  // Add devtools support in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && name) {
    store.subscribe((state) => {
      ;(window as any).__TANSTACK_STORE_DEVTOOLS__?.emit?.({
        type: 'update',
        name,
        state,
      })
    })
  }

  return {
    store,
    actions: storeActions,
    useStore: <T>(selector: (state: TState) => T) => useSelector(store, selector),
  }
}
