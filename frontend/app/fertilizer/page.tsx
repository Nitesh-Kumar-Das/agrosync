"use client";
import { useState } from "react";
import { Beaker, Loader2, Lightbulb, Info } from "lucide-react";
import { apiClient, FertilizerPredictionRequest } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/contexts/LanguageContext";
function FertilizerPageContent() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FertilizerPredictionRequest>({
    temperature: 26,
    humidity: 52,
    moisture: 38,
    soilType: "Sandy",
    cropType: "Maize",
    nitrogen: 37,
    potassium: 0,
    phosphorous: 0,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ fertilizer: string; confidence: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const soilTypes = ["Sandy", "Loamy", "Black", "Red", "Clayey"];
  const cropTypes = [
    "Maize", "Sugarcane", "Cotton", "Tobacco", "Paddy", "Barley",
    "Wheat", "Millets", "Oil seeds", "Pulses", "Ground Nuts"
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
      const response = await apiClient.predictFertilizer(formData);
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const inputFields = [
    { name: "temperature", label: t.fertilizerPage.temperature, unit: "°C", type: "number", info: t.fertilizerPage.temperatureInfo },
    { name: "humidity", label: t.fertilizerPage.humidity, unit: "%", type: "number", info: t.fertilizerPage.humidityInfo },
    { name: "moisture", label: t.fertilizerPage.moisture, unit: "%", type: "number", info: t.fertilizerPage.moistureInfo },
    { name: "nitrogen", label: t.fertilizerPage.nitrogen, unit: "kg/ha", type: "number", info: t.fertilizerPage.nitrogenInfo },
    { name: "phosphorous", label: t.fertilizerPage.phosphorous, unit: "kg/ha", type: "number", info: t.fertilizerPage.phosphorousInfo },
    { name: "potassium", label: t.fertilizerPage.potassium, unit: "kg/ha", type: "number", info: t.fertilizerPage.potassiumInfo },
  ];
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-blue-100 rounded-2xl mb-4">
            <Beaker className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.fertilizerPage.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.fertilizerPage.subtitle}
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.fertilizerPage.formTitle}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  {t.fertilizerPage.soilType}
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {t.fertilizerPage.soilTypeInfo}
                    </div>
                  </div>
                </label>
                <select
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {soilTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  {t.fertilizerPage.cropType}
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {t.fertilizerPage.cropTypeInfo}
                    </div>
                  </div>
                </label>
                <select
                  name="cropType"
                  value={formData.cropType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {cropTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              {inputFields.map((field) => (
                <div key={field.name}>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.unit && <span className="text-gray-500">({field.unit})</span>}
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {field.info}
                      </div>
                    </div>
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name as keyof FertilizerPredictionRequest]}
                    onChange={handleChange}
                    step="0.01"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t.fertilizerPage.analyzing}</span>
                  </>
                ) : (
                  <>
                    <Beaker className="w-5 h-5" />
                    <span>{t.fertilizerPage.submitButton}</span>
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.fertilizerPage.resultTitle}</h2>
            {!result && !error && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Beaker className="w-16 h-16 mb-4" />
                <p className="text-lg">{t.fertilizerPage.emptyState}</p>
              </div>
            )}
            {loading && (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                <p className="text-lg text-gray-600">{t.fertilizerPage.analyzingData}</p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
            {result && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-8">
                  <div className="flex items-center justify-center mb-4">
                    <Lightbulb className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-center text-sm font-medium text-gray-600 mb-2">
                    {t.fertilizerPage.recommendedFertilizer}
                  </h3>
                  <p className="text-center text-4xl font-bold text-gray-900 mb-4 capitalize">
                    {result.fertilizer}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                    <span>{t.fertilizerPage.confidence}:</span>
                    <span className="text-2xl font-bold">{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span>🌱</span>
                    <span>{t.fertilizerPage.whyThis}</span>
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>{t.fertilizerPage.cropType}:</strong> {formData.cropType}</p>
                    <p><strong>{t.fertilizerPage.soilType}:</strong> {formData.soilType}</p>
                    <p><strong>NPK:</strong> N-{formData.nitrogen}, P-{formData.phosphorous}, K-{formData.potassium}</p>
                  </div>
                </div>
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5 text-amber-600" />
                    <span>{t.fertilizerPage.resultDescription3}</span>
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-sm mb-3">
                    {t.fertilizerPage.resultDescription} <strong>{result.fertilizer}</strong> {t.fertilizerPage.resultDescription2}
                  </p>
                  <ul className="text-gray-700 leading-relaxed space-y-1 text-sm list-disc list-inside">
                    <li>Apply fertilizer early morning or late evening</li>
                    <li>Water the field after application</li>
                    <li>Follow recommended dosage on package</li>
                    <li>Store in cool, dry place away from sunlight</li>
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
export default function FertilizerPage() {
  return (
    <ProtectedRoute>
      <FertilizerPageContent />
    </ProtectedRoute>
  );
}
