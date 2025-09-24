import { toast } from "sonner";

export const showSuccess = (message: string, duration: number = 3000) => { // Ajout de 'duration' avec une valeur par défaut de 3000ms
  toast.success(message, { duration });
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};