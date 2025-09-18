
import { ToasterToast, actionTypes } from "./types"
import { useToastContext } from "./context"
import { generateId } from "./utils"

// Custom hook to access toast functionality
export function useToast() {
  const { state, dispatch } = useToastContext()

  const toast = (props: Omit<ToasterToast, "id">) => {
    const id = generateId()

    const update = (props: ToasterToast) =>
      dispatch({
        type: actionTypes.UPDATE_TOAST,
        toast: { ...props, id },
      })

    const dismiss = () =>
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

    dispatch({
      type: actionTypes.ADD_TOAST,
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open) => {
          if (!open) dismiss()
        },
      },
    })

    return {
      id,
      dismiss,
      update,
    }
  }

  return {
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
    toasts: state.toasts,
  }
}
