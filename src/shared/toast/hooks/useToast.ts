import { useToastStore } from "../model/useToastStore";

export const useToast = () => {
  const open = useToastStore((s) => s.open);
  const close = useToastStore((s) => s.close);

  return {
    openToast: open,
    closeToast: close,
  };
};
