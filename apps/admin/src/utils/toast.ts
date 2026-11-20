import { toast as sonnerToast, ExternalToast } from "sonner";

/**
 * Enterprise Toast Notification System using Sonner
 * Provides clean, consistent, minimal SaaS notifications across the Admin panel.
 */

export const toast = {
  success: (message: string, options?: ExternalToast) => {
    return sonnerToast.success(message, {
      duration: 3500,
      ...options,
    });
  },

  error: (message: string, options?: ExternalToast) => {
    return sonnerToast.error(message, {
      duration: 5000,
      ...options,
    });
  },

  warning: (message: string, options?: ExternalToast) => {
    return sonnerToast.warning(message, {
      duration: 4000,
      ...options,
    });
  },

  info: (message: string, options?: ExternalToast) => {
    return sonnerToast.info(message, {
      duration: 3500,
      ...options,
    });
  },

  loading: (message: string, options?: ExternalToast) => {
    return sonnerToast.loading(message, options);
  },

  dismiss: (toastId?: number | string) => {
    sonnerToast.dismiss(toastId);
  },

  /**
   * Automatically handles asynchronous operations with pending, success, and error toasts.
   * Example:
   * await toast.promise(saveSettings(), {
   *   loading: 'Saving configuration changes...',
   *   success: 'Settings updated successfully',
   *   error: (err) => `Failed to update settings: ${err.message}`
   * });
   */
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    data: {
      loading: string;
      success: string | ((result: T) => string);
      error: string | ((err: any) => string);
    },
  ) => {
    return sonnerToast.promise(promise, data);
  },
};

export default toast;
