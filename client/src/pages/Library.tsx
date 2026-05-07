import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Bookmark, Download } from "lucide-react";
import ImportRecipeModal from "../components/ImportRecipeModal";

export default function Library() {
  const navigate = useNavigate();
  const [showImportModal, setShowImportModal] = useState(false);

  return (
    <div className="flex flex-col min-w-0">
      <header className="bg-white border border-gray-100 rounded-3xl px-6 md:px-8 py-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Recipes</h1>
            <p className="text-sm text-gray-400 mt-1">
              Choose your posted or saved recipes
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-green-200"
          >
            <Download size={15} />
            Import Recipe
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => navigate("/library/posted")}
          className="bg-white border border-gray-100 rounded-3xl p-8 text-left shadow-sm hover:shadow-md hover:border-green-200 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-5">
            <BookOpen size={24} />
          </div>

          <h2 className="text-xl font-semibold text-gray-900">
            Posted Recipes
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Recipes you created and shared
          </p>
        </button>

        <button
          onClick={() => navigate("/library/saved")}
          className="bg-white border border-gray-100 rounded-3xl p-8 text-left shadow-sm hover:shadow-md hover:border-green-200 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-5">
            <Bookmark size={24} />
          </div>

          <h2 className="text-xl font-semibold text-gray-900">
            Saved Recipes
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Recipes you saved for later
          </p>
        </button>
      </div>

      {showImportModal && (
        <ImportRecipeModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
}