"use client";
import { useState } from "react";
import { TrendingUp, Loader2, BarChart3, Info } from "lucide-react";
import { apiClient, YieldPredictionRequest } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/contexts/LanguageContext";
function YieldPageContent() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<YieldPredictionRequest>({
    state: "Andhra Pradesh",
    district: "ANANTAPUR",
    season: "Kharif",
    crop: "Rice",
    year: 2024,
    area: 1000,
    rainfall: 800,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ predictedYield: number; unit: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const states = [
    "Andhra Pradesh", "Karnataka", "Kerala", "Tamil Nadu", "Telangana",
    "Maharashtra", "Gujarat", "Rajasthan", "Punjab", "Haryana",
    "Uttar Pradesh", "Madhya Pradesh", "West Bengal", "Bihar"
  ];
  const seasons = ["Kharif", "Rabi", "Whole Year", "Summer", "Winter", "Autumn"];
  const crops = [
    "Rice", "Wheat", "Maize", "Cotton", "Sugarcane",
    "Jowar", "Bajra", "Groundnut", "Sunflower", "Soybean",
    "Potato", "Onion", "Tomato"
  ];
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await apiClient.predictYield(formData);
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const currentYear = new Date().getFullYear();
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-purple-100 rounded-2xl mb-4">
            <TrendingUp className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.yieldPage.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.yieldPage.subtitle}
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.yieldPage.formTitle}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  {t.yieldPage.state}
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {t.yieldPage.stateInfo}
                    </div>
                  </div>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  {t.yieldPage.district}
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {t.yieldPage.districtInfo}
                    </div>
                  </div>
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g., ANANTAPUR"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  {t.yieldPage.season}
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {t.yieldPage.seasonInfo}
                    </div>
                  </div>
                </label>
                <select
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  {seasons.map((season) => (
                    <option key={season} value={season}>
                      {season}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  {t.yieldPage.crop}
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {t.yieldPage.cropInfo}
                    </div>
                  </div>
                </label>
                <select
                  name="crop"
                  value={formData.crop}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  {crops.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  {t.yieldPage.year}
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {t.yieldPage.yearInfo}
                    </div>
                  </div>
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  min={2000}
                  max={currentYear + 5}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  {t.yieldPage.area} <span className="text-gray-500">(hectares)</span>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {t.yieldPage.areaInfo}
                    </div>
                  </div>
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  {t.yieldPage.rainfall} <span className="text-gray-500">(mm)</span>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {t.yieldPage.rainfallInfo}
                    </div>
                  </div>
                </label>
                <input
                  type="number"
                  name="rainfall"
                  value={formData.rainfall}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t.yieldPage.predicting}</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    <span>{t.yieldPage.submitButton}</span>
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.yieldPage.resultTitle}</h2>
            {!result && !error && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <TrendingUp className="w-16 h-16 mb-4" />
                <p className="text-lg">{t.yieldPage.emptyState}</p>
              </div>
            )}
            {loading && (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-4" />
                <p className="text-lg text-gray-600">{t.yieldPage.analyzingData}</p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
            {result && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-8">
                  <div className="flex items-center justify-center mb-4">
                    <BarChart3 className="w-12 h-12 text-purple-600" />
                  </div>
                  <h3 className="text-center text-sm font-medium text-gray-600 mb-2">
                    {t.yieldPage.predictedYield}
                  </h3>
                  <p className="text-center text-5xl font-bold text-gray-900 mb-2">
                    {result.predictedYield.toFixed(2)}
                  </p>
                  <p className="text-center text-xl text-purple-600 font-semibold">
                    {result.unit} {t.yieldPage.perHectare}
                  </p>
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>📍</span>
                    <span>{t.yieldPage.factors}</span>
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>{t.yieldPage.state}:</strong> {formData.district}, {formData.state}</p>
                    <p><strong>{t.yieldPage.crop}:</strong> {formData.crop}</p>
                    <p><strong>{t.yieldPage.season}:</strong> {formData.season} {formData.year}</p>
                    <p><strong>{t.yieldPage.area}:</strong> {formData.area} hectares</p>
                    <p><strong>{t.yieldPage.rainfall}:</strong> {formData.rainfall} mm</p>
                  </div>
                </div>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    <span>{t.yieldPage.predictedYield}</span>
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {t.yieldPage.resultDescription} <strong>{result.predictedYield.toFixed(2)} {result.unit}</strong> {t.yieldPage.resultDescription2}
                  </p>
                </div>
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span>💡</span>
                    <span>{t.yieldPage.resultDescription3}</span>
                  </h4>
                  <ul className="text-gray-700 leading-relaxed space-y-1 text-sm list-disc list-inside">
                    <li>Ensure proper irrigation during dry spells</li>
                    <li>Use recommended fertilizers at right time</li>
                    <li>Monitor and control pests regularly</li>
                    <li>Follow good agricultural practices</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default function YieldPage() {
  return (
    <ProtectedRoute>
      <YieldPageContent />
    </ProtectedRoute>
  );
}
