import { X } from "lucide-react";
import {
  mealTypes,
  dietaryOptions,
  cookTimes,
  difficulties,
} from "../constants/recipeFilters";

export type FilterState = {
  mealType: string[];
  dietary: string[];
  cookTime: string;
  difficulty: string;
  savedOnly: boolean;
  importedOnly: boolean;
};

type RecipeFilterProps = {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClose: () => void;
};

export default function RecipeFilter({
  filters,
  onFilterChange,
  onClose,
}: RecipeFilterProps) {
  function toggleArrayFilter(key: "mealType" | "dietary", value: string) {
    const currentValues = filters[key];
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    onFilterChange({
      ...filters,
      [key]: updatedValues,
    });
  }

  function setSingleFilter(key: "cookTime" | "difficulty", value: string) {
    onFilterChange({
      ...filters,
      [key]: filters[key] === value ? "" : value,
    });
  }

  function toggleBooleanFilter(key: "savedOnly" | "importedOnly") {
    onFilterChange({
      ...filters,
      [key]: !filters[key],
    });
  }

  function clearFilters() {
    onFilterChange({
      mealType: [],
      dietary: [],
      cookTime: "",
      difficulty: "",
      savedOnly: false,
      importedOnly: false,
    });
  }

  const sectionTitleClass = "text-sm font-semibold text-gray-900 mb-3";
  const chipBaseClass =
    "px-3 py-1.5 rounded-full text-sm border transition-colors";
  const chipInactiveClass =
    "bg-white border-gray-200 text-gray-600 hover:bg-gray-50";
  const chipActiveClass = "bg-green-50 border-green-300 text-green-700";

  return (
    <aside className="w-full max-w-xs bg-white border border-gray-100 rounded-2xl shadow-sm p-5 h-fit">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900">Filters</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className={sectionTitleClass}>Meal Type</h3>
          <div className="flex flex-wrap gap-2">
            {mealTypes.map((type) => {
              const isActive = filters.mealType.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleArrayFilter("mealType", type)}
                  className={`${chipBaseClass} ${
                    isActive ? chipActiveClass : chipInactiveClass
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className={sectionTitleClass}>Dietary Preferences</h3>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((option) => {
              const isActive = filters.dietary.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => toggleArrayFilter("dietary", option)}
                  className={`${chipBaseClass} ${
                    isActive ? chipActiveClass : chipInactiveClass
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className={sectionTitleClass}>Cook Time</h3>
          <div className="flex flex-wrap gap-2">
            {cookTimes.map((time) => {
              const isActive = filters.cookTime === time.value;
              return (
                <button
                  key={time.value}
                  onClick={() => setSingleFilter("cookTime", time.value)}
                  className={`${chipBaseClass} ${
                    isActive ? chipActiveClass : chipInactiveClass
                  }`}
                >
                  {time.label}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className={sectionTitleClass}>Difficulty</h3>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((difficulty) => {
              const isActive = filters.difficulty === difficulty;
              return (
                <button
                  key={difficulty}
                  onClick={() => setSingleFilter("difficulty", difficulty)}
                  className={`${chipBaseClass} ${
                    isActive ? chipActiveClass : chipInactiveClass
                  }`}
                >
                  {difficulty}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className={sectionTitleClass}>More</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleBooleanFilter("savedOnly")}
              className={`${chipBaseClass} ${
                filters.savedOnly ? chipActiveClass : chipInactiveClass
              }`}
            >
              Saved only
            </button>

            <button
              onClick={() => toggleBooleanFilter("importedOnly")}
              className={`${chipBaseClass} ${
                filters.importedOnly ? chipActiveClass : chipInactiveClass
              }`}
            >
              Imported only
            </button>
          </div>
        </section>
      </div>

      <button
        onClick={clearFilters}
        className="mt-6 w-full px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
      >
        Clear all
      </button>
    </aside>
  );
}