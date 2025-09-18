
import { ToasterToast, actionTypes } from "./types"
import { generateId, dispatch } from "./utils"

// Function for direct usage without hooks
export function toast(props: Omit<ToasterToast, "id">) {
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

// Export dismiss function for direct usage
export function dismissToast(toastId?: string) {
  dispatch({ type: actionTypes.DISMISS_TOAST, toastId })
}
