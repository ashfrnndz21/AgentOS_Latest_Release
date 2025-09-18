
import * as React from "react"
import { State, Action } from "./types"
import { reducer } from "./reducer"
import { setDispatch } from "./utils"

// Create context for toast state management
export const ToastContext = React.createContext<{
  state: State
  dispatch: React.Dispatch<Action>
}>({
  state: { toasts: [] },
  dispatch: () => {},
})

// Provider component for toast context
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatchAction] = React.useReducer(reducer, { toasts: [] })
  
  // Update the global dispatch reference
  React.useEffect(() => {
    setDispatch(dispatchAction)
  }, [dispatchAction])
  
  return (
    <ToastContext.Provider value={{ state, dispatch: dispatchAction }}>
      <div id="toast-provider" style={{ display: 'none' }} />
      {children}
    </ToastContext.Provider>
  )
}

// Hook for accessing toast context
export function useToastContext() {
  const context = React.useContext(ToastContext)
  
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider")
  }
  
  return context
}
