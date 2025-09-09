"use client"

import * as React from "react"

import type { ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type Action =
  | {
      type: typeof actionTypes.ADD_TOAST
      toast: ToasterToast
    }
  | {
      type: typeof actionTypes.UPDATE_TOAST
      toast: Partial<ToasterToast>
    }
  | {
      type: typeof actionTypes.DISMISS_TOAST
      toastId?: string
    }
  | {
      type: typeof actionTypes.REMOVE_TOAST
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }

    case actionTypes.DISMISS_TOAST:
      const { toastId } = action
      // ! Side effects ! - This will be executed in a separate render cycle
      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.map((t) => (t.id === toastId ? { ...t, open: false } : t)),
        }
      }
      return {
        ...state,
        toasts: state.toasts.map((t) => ({ ...t, open: false })),
      }

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

const listeners: Array<(state: State) => void> = []

const callListeners = (state: State) => {
  listeners.forEach((listener) => {
    listener(state)
  })
}

function createToastStore() {
  let state: State = {
    toasts: [],
  }

  const getState = () => state

  const setState = (newState: Partial<State>) => {
    state = { ...state, ...newState }
    callListeners(state)
  }

  const subscribe = (listener: (state: State) => void) => {
    listeners.push(listener)
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  const dispatch = (action: Action) => {
    state = reducer(state, action)
    callListeners(state)
  }

  return {
    getState,
    setState,
    subscribe,
    dispatch,
  }
}

export const toastStore = createToastStore()

type Toast = Omit<ToasterToast, "id">

function useToast() {
  const [state, setState] = React.useState(toastStore.getState())

  React.useEffect(() => {
    return toastStore.subscribe(setState)
  }, [])

  const toast = React.useCallback((props: Toast) => {
    const id = genId()

    const update = (props: ToasterToast) =>
      toastStore.dispatch({
        type: actionTypes.UPDATE_TOAST,
        toast: { ...props, id },
      })

    const dismiss = () => toastStore.dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

    toastStore.dispatch({
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
      id: id,
      dismiss,
      update,
    }
  }, [])

  return {
    ...state,
    toast,
  }
}

const toast = {}
export { useToast, toast }
