import * as Toast from "@radix-ui/react-toast";
import { useToastStore } from "../store/ToastState";
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";

const typeConfig = {
  success: {
    icon: <CheckCircle2 size={18} className="text-green-11" />,
    accentClass: "border-l-4 border-l-green-8",
  },
  error: {
    icon: <XCircle size={18} className="text-red-11" />,
    accentClass: "border-l-4 border-l-red-8",
  },
  info: {
    icon: <Info size={18} className="text-blue-11" />,
    accentClass: "border-l-4 border-l-blue-8",
  },
  warning: {
    icon: <AlertTriangle size={18} className="text-orange-11" />,
    accentClass: "border-l-4 border-l-orange-8",
  },
  custom: {
    icon: null,
    accentClass: "",
  },
};

export default function ToastSystem() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <Toast.Provider swipeDirection="right">
      {toasts.map((toast) => {
        const config = typeConfig[toast.type] || typeConfig.custom;
        return (
          <Toast.Root
            key={toast.id}
            duration={toast.duration ?? 4000}
            onOpenChange={(open) => {
              if (!open) removeToast(toast.id);
            }}
            className={`${config.accentClass} grid grid-cols-[auto_1fr] items-start gap-x-3 rounded-md bg-[var(--gray-2)] p-4 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-hide data-[state=open]:animate-slideIn data-[swipe=end]:animate-swipeOut data-[swipe=cancel]:transition-[transform_200ms_ease-out]`}
          >
            <div className="mt-0.5">{config.icon}</div>
            <div className="flex-1">
              <Toast.Title className="m-0 text-sm font-medium text-[var(--gray-12)]">
                {toast.title}
              </Toast.Title>
              {toast.description && (
                <Toast.Description className="m-0 mt-1 text-xs leading-relaxed text-[var(--gray-11)]">
                  {toast.description}
                </Toast.Description>
              )}
            </div>
            {toast.action && (
              <Toast.Action
                asChild
                altText={toast.action.label}
                className="mt-0"
                onClick={(e) => {
                  e.preventDefault();
                  toast.action?.onClick();
                  removeToast(toast.id);
                }}
              >
                <button className="inline-flex h-7 items-center justify-center rounded bg-[var(--gray-4)] px-3 text-xs font-medium text-[var(--gray-12)] hover:bg-[var(--gray-5)] focus:outline-none focus:ring-2 focus:ring-[var(--gray-9)]">
                  {toast.action.label}
                </button>
              </Toast.Action>
            )}
          </Toast.Root>
        );
      })}
      <Toast.Viewport className="fixed bottom-0 right-0 z-[2147483647] m-0 flex w-[390px] max-w-[100vw] list-none flex-col gap-2.5 p-[25px] outline-none" />
    </Toast.Provider>
  );
}
