"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { InvoiceData } from "@/types/invoice";

interface SavedTemplatesProps {
  currentData: InvoiceData;
  onLoad: (data: InvoiceData) => void;
}

interface SavedTemplate {
  name: string;
  data: InvoiceData;
  savedAt: string;
}

const STORAGE_KEY = "invoicegen_saved_templates";
const MAX_TEMPLATES = 3;

function getSavedTemplates(): SavedTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToDisk(templates: SavedTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export default function SavedTemplates({ currentData, onLoad }: SavedTemplatesProps) {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveName, setSaveName] = useState("");

  useEffect(() => {
    setTemplates(getSavedTemplates());
  }, []);

  function handleSave() {
    if (!currentData.senderName.trim() && !currentData.clientName.trim()) {
      toast.error("Fill in at least your name or client name before saving.");
      return;
    }
    const name = saveName.trim() || `Template ${templates.length + 1}`;
    const updated = [
      ...templates,
      { name, data: currentData, savedAt: new Date().toISOString() },
    ].slice(-MAX_TEMPLATES);
    saveToDisk(updated);
    setTemplates(updated);
    setSaveName("");
    setShowSaveInput(false);
    toast.success(`Template "${name}" saved!`);
  }

  function handleDelete(index: number) {
    const name = templates[index]?.name;
    const updated = templates.filter((_, i) => i !== index);
    saveToDisk(updated);
    setTemplates(updated);
    toast.success(`Template "${name}" deleted`);
  }

  function handleLoad(index: number) {
    const t = templates[index];
    if (t) {
      onLoad(t.data);
      toast.success(`Template "${t.name}" loaded!`);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Saved Templates
        </h3>
        <span className="text-xs text-gray-400">{templates.length}/{MAX_TEMPLATES} saved</span>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100 space-y-3">
        {templates.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">
            No saved templates yet. Fill in your details and save to reuse later.
          </p>
        )}

        {templates.map((t, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-3 py-2"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{t.name}</p>
              <p className="text-xs text-gray-400">
                {t.data.senderName || "No sender"} &middot;{" "}
                {new Date(t.savedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-1.5 ml-3">
              <button
                type="button"
                onClick={() => handleLoad(i)}
                className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-md hover:bg-blue-100 transition-colors"
              >
                Load
              </button>
              <button
                type="button"
                onClick={() => handleDelete(i)}
                className="px-2 py-1 text-red-400 text-xs hover:text-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {showSaveInput ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="Template name..."
              maxLength={30}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => { setShowSaveInput(false); setSaveName(""); }}
              className="px-2 py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (templates.length >= MAX_TEMPLATES) {
                toast.error(`Maximum ${MAX_TEMPLATES} templates. Delete one to save a new one.`);
                return;
              }
              setShowSaveInput(true);
            }}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-dashed border-amber-300 rounded-lg text-sm text-amber-600 font-medium hover:bg-amber-50 hover:border-amber-400 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Save Current as Template
          </button>
        )}
      </div>
    </div>
  );
}
