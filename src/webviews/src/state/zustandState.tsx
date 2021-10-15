import { nanoid } from 'nanoid'
import create, { State, StateCreator, StoreApi, UseStore } from 'zustand'
import { persist, StateStorage } from 'zustand/middleware'
import VSCodeAPI from '../VSCodeAPI'

export default function createVSCodeZustand<TState extends State>(
  createState: StateCreator<TState>
): UseStore<TState> {
  const store = create(
    persist(createState, {
      name: nanoid(),
      getStorage: () => VSCodeStateStorage,
    })
  )
  store.subscribe(state => {
    VSCodeAPI.setState(state)
  })
  return store
}

const VSCodeStateStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    console.log(name, 'has been retrieved already')
    return await VSCodeAPI.getState()[name]
  },
  setItem: async (name: string, value: string): Promise<void> => {
    return VSCodeAPI.setState({
      ...VSCodeAPI.getState(),
      [name]: value,
    })
  },
}
