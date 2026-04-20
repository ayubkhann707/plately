import { Download, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ImportRecipeModalProps {
  onClose: () => void;
}

export default function ImportRecipeModal({ onClose }: ImportRecipeModalProps) {
  const navigate = useNavigate();
  const [importMethod, setImportMethod] = useState<
    "youtube" | "instagram" | "tiktok" | "url" | null
  >(null);
  const [urlInput, setUrlInput] = useState("");

  const importSources = [
    {
      id: "youtube",
      name: "YouTube",
      description: "Import from cooking videos",
      icon: <Download size={20} />,
    },
    {
      id: "instagram",
      name: "Instagram Reels",
      description: "Extract from Instagram videos",
      icon: <Download size={20} />,
    },
    {
      id: "tiktok",
      name: "TikTok",
      description: "Quick recipe videos",
      icon: <Download size={20} />,
    },
    {
      id: "url",
      name: "Paste URL",
      description: "Any recipe website",
      icon: <LinkIcon size={20} />,
    },
  ];

  const handleContinue = () => {
    navigate("/import");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Import a Recipe</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Choose the source, then continue to your import page
            </p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Choose a source</h3>
            <div className="grid grid-cols-2 gap-3">
              {importSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => {
                    setImportMethod(source.id as "youtube" | "instagram" | "tiktok" | "url");
                    setUrlInput("");
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    importMethod === source.id
                      ? "border-green-300 bg-green-50"
                      : "border-gray-100 hover:border-gray-200 bg-white"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center text-green-600 bg-green-50">
                    {source.icon}
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{source.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{source.description}</p>
                </button>
              ))}
            </div>
          </div>

          {importMethod && (
            <div className="space-y-4 bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <label className="block text-sm font-semibold text-gray-900">
                {importMethod === "youtube" && "YouTube link"}
                {importMethod === "instagram" && "Instagram Reel link"}
                {importMethod === "tiktok" && "TikTok link"}
                {importMethod === "url" && "Recipe URL"}
              </label>

              <input
                type="url"
                placeholder="Paste a link here..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 text-sm placeholder:text-gray-400"
              />

              <p className="text-xs text-gray-500">
                Your actual importing logic will still run on the existing <code>/import</code> page.
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-xs text-blue-700 font-medium">
              This modal is only the UI entry point. Your current backend and import page stay unchanged.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!importMethod}
            className="px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}