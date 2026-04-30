"use client";

import { Toaster } from "react-hot-toast";

/**
 * Root-level Toaster mounted in the layout so every route can call
 * `toast.success/error(...)` from any client component.
 */
export default function AppToaster() {
  return <Toaster position="top-right" toastOptions={{ duration: 3000 }} />;
}
