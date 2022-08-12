import { writable } from 'svelte/store';


export interface ToastParams {
    message: string
    type?: 'success' | 'error' | 'warning' | 'info'
    timeout?: number
}

export interface Toast extends ToastParams {
    close: () => void
}

export const currentToasts = writable<ToastParams[]>([]);

export const toast = async (params: ToastParams) => {
    const close = () => currentToasts.update(toasts => toasts.splice(toasts.indexOf(toast), 1))
    const toast: Toast = {
        message: params.message,
        type: params.type || 'info',
        timeout: params.timeout || 3000,
        close: close
    }

    currentToasts.update(toasts => [...toasts, toast])

    await setTimeout(() => close, toast.timeout);
}