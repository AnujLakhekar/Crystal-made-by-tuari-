import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning" | "custom";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => string;
  removeToast: (id: string) => void;
  success: (title: string, description?: string, options?: { duration?: number; action?: ToastMessage["action"] }) => string;
  error: (title: string, description?: string, options?: { duration?: number; action?: ToastMessage["action"] }) => string;
  info: (title: string, description?: string, options?: { duration?: number; action?: ToastMessage["action"] }) => string;
  warning: (title: string, description?: string, options?: { duration?: number; action?: ToastMessage["action"] }) => string;
}

let nextId = 0;
function generateId() {
  return `toast-${++nextId}-${Date.now()}`;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  success: (title, description, options) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, title, description, type: "success", ...options }],
    }));
    return id;
  },

  error: (title, description, options) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, title, description, type: "error", ...options }],
    }));
    return id;
  },

  info: (title, description, options) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, title, description, type: "info", ...options }],
    }));
    return id;
  },

  warning: (title, description, options) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, title, description, type: "warning", ...options }],
    }));
    return id;
  },
}));

export const useToast = () => {
  const addToast = useToastStore((s) => s.addToast);
  const success = useToastStore((s) => s.success);
  const error = useToastStore((s) => s.error);
  const info = useToastStore((s) => s.info);
  const warning = useToastStore((s) => s.warning);

  return { addToast, success, error, info, warning };
};
