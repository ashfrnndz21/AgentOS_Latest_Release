
import { actionTypes } from "./types"

// Counter for generating unique IDs
let count = 0

// Generate a unique ID for each toast
export function generateId(): string {
  return (++count).toString()
}

// Global dispatch function (will be set in the provider)
export let dispatch: React.Dispatch<any> = () => {}

// Set the global dispatch function
export const setDispatch = (newDispatch: React.Dispatch<any>) => {
  dispatch = newDispatch
}

// Map to store timeout IDs for toast removal
export const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// Function to set a timeout for removing a toast
export function setToastTimeout(id: string, removeDelay: number) {
  const timeout = setTimeout(() => {
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId: id,
    })
  }, removeDelay)

  toastTimeouts.set(id, timeout)
  return timeout
}
