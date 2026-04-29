"use client";

import { TemplateId, CustomStyle, FontStyle } from "@/types/invoice";
import { TEMPLATES, COLOR_PRESETS } from "@/lib/templates";

interface TemplateSelectorProps {
  selected: TemplateId;
  customStyle: CustomStyle;
  onSelect: (id: TemplateId, style: CustomStyle) => void;
  onCustomStyleChange: (style: CustomStyle) => void;
}

export default function TemplateSelector({
  selected,
  customStyle,
  onSelect,
  onCustomStyleChange,
}: TemplateSelectorProps) {
  function handleTemplateSelect(id: TemplateId) {
    const t = TEMPLATES[id];
    onSelect(id, {
      primaryColor: t.primaryColor,
      accentColor: t.accentColor,
      fontStyle: t.fontStyle,
    });
  }

  return (
    <div className="space-y-5">
      {/* Template Presets */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Choose Template
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
          {Object.values(TEMPLATES).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTemplateSelect(t.id)}
              className={`group relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                selected === t.id
                  ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <div className="w-full h-2 rounded-full" style={{ backgroundColor: t.primaryColor }} />
              <div
                className="w-full h-6 rounded-md border border-black/5"
                style={{ backgroundColor: t.headerBg }}
              />
              <div className="w-full space-y-0.5">
                <div className="h-0.5 rounded bg-gray-200 w-full" />
                <div className="h-0.5 rounded bg-gray-200 w-3/4" />
              </div>
              <span className="text-[10px] font-semibold text-gray-600 mt-0.5">{t.name}</span>
              {selected === t.id && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Color Customization */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Customize Colors
        </label>

        {/* Quick Presets */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Quick color presets</p>
          <div className="flex flex-wrap gap-1.5">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() =>
                  onCustomStyleChange({
                    ...customStyle,
                    primaryColor: preset.primary,
                    accentColor: preset.accent,
                  })
                }
                className={`group relative w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${
                  customStyle.primaryColor === preset.primary
                    ? "border-gray-900 shadow-md"
                    : "border-transparent hover:border-gray-300"
                }`}
                style={{ backgroundColor: preset.primary }}
                title={preset.name}
              >
                {customStyle.primaryColor === preset.primary && (
                  <svg className="w-3.5 h-3.5 text-white absolute inset-0 m-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Color Pickers */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Primary Color
            </label>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="color"
                  value={customStyle.primaryColor}
                  onChange={(e) =>
                    onCustomStyleChange({ ...customStyle, primaryColor: e.target.value })
                  }
                  className="w-9 h-9 rounded-lg cursor-pointer border-2 border-white shadow-sm"
                />
              </div>
              <input
                type="text"
                value={customStyle.primaryColor}
                onChange={(e) =>
                  onCustomStyleChange({ ...customStyle, primaryColor: e.target.value })
                }
                onFocus={(e) => e.target.select()}
                className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={7}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customStyle.accentColor}
                onChange={(e) =>
                  onCustomStyleChange({ ...customStyle, accentColor: e.target.value })
                }
                className="w-9 h-9 rounded-lg cursor-pointer border-2 border-white shadow-sm"
              />
              <input
                type="text"
                value={customStyle.accentColor}
                onChange={(e) =>
                  onCustomStyleChange({ ...customStyle, accentColor: e.target.value })
                }
                onFocus={(e) => e.target.select()}
                className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={7}
              />
            </div>
          </div>
        </div>

        {/* Font Style */}
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Font Style
          </label>
          <div className="flex gap-2">
            {(["sans", "serif"] as FontStyle[]).map((fs) => (
              <button
                key={fs}
                type="button"
                onClick={() => onCustomStyleChange({ ...customStyle, fontStyle: fs })}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                  customStyle.fontStyle === fs
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
                style={{ fontFamily: fs === "serif" ? "Georgia, serif" : "system-ui, sans-serif" }}
              >
                {fs === "sans" ? "Sans-Serif" : "Serif"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
