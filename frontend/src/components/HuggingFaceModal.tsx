"use client";

import React, { useState } from "react";
import { X, Key, ExternalLink, Check, Cpu } from "lucide-react";

interface HuggingFaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  hfToken: string;
  setHfToken: (token: string) => void;
  hfModel: string;
  setHfModel: (model: string) => void;
}

export const HF_MODELS = [
  {
    id: "meta-llama/Llama-3.3-70B-Instruct",
    name: "Llama 3.3 70B Instruct",
    provider: "Meta",
    tag: "Recommended • 70B Parameters",
  },
  {
    id: "Qwen/Qwen2.5-72B-Instruct",
    name: "Qwen 2.5 72B Instruct",
    provider: "Alibaba Cloud",
    tag: "Top Coding & Structured JSON",
  },
  {
    id: "meta-llama/Llama-3.1-8B-Instruct",
    name: "Llama 3.1 8B Instruct",
    provider: "Meta",
    tag: "Ultra-Fast Inference",
  },
  {
    id: "mistralai/Mistral-7B-Instruct-v0.3",
    name: "Mistral 7B Instruct v0.3",
    provider: "Mistral AI",
    tag: "Reliable & Crisp",
  },
  {
    id: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
    name: "DeepSeek R1 Distill Qwen 32B",
    provider: "DeepSeek",
    tag: "Deep Reasoning",
  },
];

export const HuggingFaceModal: React.FC<HuggingFaceModalProps> = ({
  isOpen,
  onClose,
  hfToken,
  setHfToken,
  hfModel,
  setHfModel,
}) => {
  const [tempToken, setTempToken] = useState(hfToken);
  const [tempModel, setTempModel] = useState(hfModel);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setHfToken(tempToken.trim());
    setHfModel(tempModel);
    if (typeof window !== "undefined") {
      localStorage.setItem("preplab_hf_token", tempToken.trim());
      localStorage.setItem("preplab_hf_model", tempModel);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setTempToken("");
    setHfToken("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("preplab_hf_token");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white font-bold text-lg shadow-md shadow-amber-500/20">
              🤗
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hugging Face API Settings</h3>
              <p className="text-xs text-slate-400">Configure LLM inference from huggingface.co</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4">
          {/* Token input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-amber-400" />
                <span>Hugging Face Access Token</span>
              </label>

              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Get Free Token</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <input
              type="password"
              value={tempToken}
              onChange={(e) => setTempToken(e.target.value)}
              placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Saved locally in your browser. Also supported via <code className="text-amber-300">HUGGINGFACE_API_KEY</code> in <code className="text-amber-300">backend/.env</code>.
            </p>
          </div>

          {/* Model selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-amber-400" />
                <span>Select or Enter Any Hugging Face Model</span>
              </label>
              <a
                href="https://huggingface.co/models?pipeline_tag=text-generation&sort=trending"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Browse All Models</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Custom Model ID Input */}
            <div className="mb-3">
              <input
                type="text"
                value={tempModel}
                onChange={(e) => setTempModel(e.target.value)}
                placeholder="e.g. meta-llama/Llama-3.3-70B-Instruct or Qwen/Qwen2.5-Coder-32B-Instruct"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Type or paste any text-generation model from huggingface.co above, or choose a recommended preset below:
              </span>
            </div>

            {/* Preset Model Cards */}
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {HF_MODELS.map((m) => {
                const isSelected = tempModel === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setTempModel(m.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? "border-amber-500/60 bg-amber-500/10 text-white ring-1 ring-amber-500/30"
                        : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{m.name}</span>
                        <span className="text-[10px] text-slate-400">({m.provider})</span>
                      </div>
                      <span className="text-[10px] text-amber-300/80 block mt-0.5">{m.tag}</span>
                    </div>

                    {isSelected && <Check className="h-4 w-4 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-rose-400 transition"
          >
            Clear Token
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
