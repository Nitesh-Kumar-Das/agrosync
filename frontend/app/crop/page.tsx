"use client";
import { useState } from "react";
import { Sprout, Loader2, Check, Info } from "lucide-react";
import { apiClient, CropPredictionRequest } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/contexts/LanguageContext";
function CropPageContent() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<CropPredictionRequest>({
    nitrogen: 90,
    phosphorus: 42,
    potassium: 43,
    temperature: 20.87,
    humidity: 82,
    ph: 6.5,
    rainfall: 202.93,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ crop: string; confidence: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value) || 0,
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await apiClient.predictCrop(formData);
      setResult(response);
    } catch (err: any) {
      setError("Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const inputFields = [
    { name: "nitrogen", label: t.cropPage.nitrogen, unit: "kg/ha", info: t.cropPage.nitrogenInfo },
    { name: "phosphorus", label: t.cropPage.phosphorus, unit: "kg/ha", info: t.cropPage.phosphorusInfo },
    { name: "potassium", label: t.cropPage.potassium, unit: "kg/ha", info: t.cropPage.potassiumInfo },
    { name: "temperature", label: t.cropPage.temperature, unit: "°C", info: t.cropPage.temperatureInfo },
    { name: "humidity", label: t.cropPage.humidity, unit: "%", info: t.cropPage.humidityInfo },
    { name: "ph", label: t.cropPage.ph, unit: "", info: t.cropPage.phInfo },
    { name: "rainfall", label: t.cropPage.rainfall, unit: "mm", info: t.cropPage.rainfallInfo },
  ];
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-green-100 rounded-2xl mb-4">
            <Sprout className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.cropPage.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.cropPage.subtitle}
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.cropPage.formTitle}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    type="number"
                    name={field.name}
                    value={formData[field.name as keyof CropPredictionRequest]}
                    onChange={handleChange}
                    step="0.01"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t.cropPage.analyzing}</span>
                  </>
                ) : (
                  <>
                    <Sprout className="w-5 h-5" />
                    <span>{t.cropPage.submitButton}</span>
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.cropPage.resultTitle}</h2>
            {!result && !error && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Sprout className="w-16 h-16 mb-4" />
                <p className="text-lg">{t.cropPage.emptyState}</p>
              </div>
            )}
            {loading && (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-16 h-16 text-green-600 animate-spin mb-4" />
                <p className="text-lg text-gray-600">{t.cropPage.analyzingData}</p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
            {result && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8">
                  <div className="flex items-center justify-center mb-4">
                    <Check className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-center text-sm font-medium text-gray-600 mb-2">
                    {t.cropPage.recommendedCrop}
                  </h3>
                  <p className="text-center text-4xl font-bold text-gray-900 mb-4 capitalize">
                    {result.crop}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                    <span>{t.cropPage.confidence}:</span>
                    <span className="text-2xl font-bold">{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    <span>{t.cropPage.whatThisMeans}</span>
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {t.cropPage.resultDescription} <strong className="capitalize">{result.crop}</strong> {t.cropPage.resultDescription2} {(result.confidence * 100).toFixed(1)}%, {t.cropPage.resultDescription3}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default function CropPage() {
  return (
    <ProtectedRoute>
      <CropPageContent />
    </ProtectedRoute>
  );
}
