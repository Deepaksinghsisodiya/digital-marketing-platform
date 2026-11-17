"use client";

import { Toaster as SonnerToaster } from "sonner";

export function ToastProvider() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      theme="system"
      toastOptions={{
        className: "font-sans border border-border shadow-xl backdrop-blur-md",
      }}
    />
  );
}
