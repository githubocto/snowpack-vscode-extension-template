import { Dispatch, useState } from 'react'
import VSCodeAPI from '../VSCodeAPI'

export default function useVSCodeState<S>(
  initialState: S | (() => S),
  uniqueStateKey
): [S, Dispatch<S>] {
  const [localState, setLocalState] = useState(
    VSCodeAPI.getState() || initialState
  )

  const setState = (newState: S) => {
    VSCodeAPI.setState({ ...VSCodeAPI.getState(), [uniqueStateKey]: newState })
    setLocalState(newState)
  }
  return [localState, setState]
}
