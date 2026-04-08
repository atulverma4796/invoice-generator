"use client";

import { useRef, useEffect, useState } from "react";
import toast from "react-hot-toast";
import type SignaturePadLib from "signature_pad";

interface SignaturePadProps {
  signature: string;
  onChange: (dataUrl: string) => void;
}

export default function SignaturePad({ signature, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sigPadRef = useRef<SignaturePadLib | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"none" | "draw" | "upload">("none");

  useEffect(() => {
    let cancelled = false;
    if (mode === "draw" && canvasRef.current && !sigPadRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(2, 2);

      // Lazy-load signature_pad only when user actually opens the draw mode
      import("signature_pad").then((mod) => {
        if (cancelled || !canvasRef.current) return;
        const SignaturePadCtor = mod.default;
        sigPadRef.current = new SignaturePadCtor(canvas, {
          backgroundColor: "rgb(255, 255, 255)",
          penColor: "rgb(0, 0, 0)",
        });
      });
    }

    return () => {
      cancelled = true;
      if (sigPadRef.current) {
        sigPadRef.current.off();
        sigPadRef.current = null;
      }
    };
  }, [mode]);

  function handleSaveDrawing() {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const dataUrl = sigPadRef.current.toDataURL("image/png");
      onChange(dataUrl);
      setMode("none");
      sigPadRef.current = null;
    }
  }

  function handleClearDrawing() {
    sigPadRef.current?.clear();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      toast.error("Signature image must be under 1MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
      setMode("none");
    };
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    onChange("");
    setMode("none");
    sigPadRef.current = null;
  }

  // Show saved signature
  if (signature && mode === "none") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Signature
        </label>
        <div className="relative group w-fit">
          <img
            src={signature}
            alt="Signature"
            className="h-16 max-w-[240px] object-contain rounded-lg border border-gray-200 p-1 bg-white"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Drawing mode
  if (mode === "draw") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Draw Your Signature
        </label>
        <div className="border-2 border-blue-300 rounded-xl overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            className="w-full cursor-crosshair"
            style={{ height: "120px", touchAction: "none" }}
          />
        </div>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={handleSaveDrawing}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Signature
          </button>
          <button
            type="button"
            onClick={handleClearDrawing}
            className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => { setMode("none"); sigPadRef.current = null; }}
            className="px-3 py-1.5 text-gray-400 text-sm hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Default: show options
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Signature
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("draw")}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-blue-300 rounded-xl text-sm text-blue-600 font-medium hover:bg-blue-50 hover:border-blue-400 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
          </svg>
          Draw Signature
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Upload Image
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}
