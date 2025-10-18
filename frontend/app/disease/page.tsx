"use client";
import { useState, useEffect } from "react";
import { Bug, Loader2, Upload, X, AlertTriangle, Check } from "lucide-react";
import { apiClient } from "@/lib/api";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/contexts/LanguageContext";
function DiseasePageContent() {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ disease: string; confidence: number; recommendation: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const MAX_SIZE = 10 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      setError('File size must be less than 10MB');
      return;
    }
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Only JPEG and PNG images are allowed');
      return;
    }
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError(null);
  };
  const handleRemoveFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await apiClient.detectDisease(file);
      setResult(response);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to detect disease. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const isHealthy = result?.disease.toLowerCase().includes("healthy");
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-red-100 rounded-2xl mb-4">
            <Bug className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.diseasePage.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.diseasePage.subtitle}
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.diseasePage.uploadTitle}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {!preview ? (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all">
                  <div className="flex flex-col items-center justify-center pt-7">
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-lg font-medium text-gray-700 mb-1">
                      {t.diseasePage.uploadButton}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t.diseasePage.uploadHint}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="relative">
                  <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-gray-200">
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                      setResult(null);
                      setError(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={!file || loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.diseasePage.detecting}
                  </>
                ) : (
                  <>
                    <Bug className="w-5 h-5" />
                    {t.diseasePage.detectButton}
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.diseasePage.resultTitle}</h2>
            {!result && !error && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Bug className="w-16 h-16 mb-4" />
                <p className="text-lg text-center">{t.diseasePage.emptyState}</p>
              </div>
            )}
            {loading && (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-16 h-16 text-red-600 animate-spin mb-4" />
                <p className="text-lg text-gray-600">{t.diseasePage.analyzingImage}</p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
            {result && (
              <div className="space-y-6">
                <div className={`border-2 rounded-xl p-8 ${isHealthy
                    ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                    : "bg-gradient-to-br from-red-50 to-pink-50 border-red-200"
                  }`}>
                  <div className="flex items-center justify-center mb-4">
                    {isHealthy ? (
                      <Check className="w-12 h-12 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-12 h-12 text-red-600" />
                    )}
                  </div>
                  <h3 className="text-center text-sm font-medium text-gray-600 mb-2">
                    {isHealthy ? t.diseasePage.healthyPlant : t.diseasePage.detectedDisease}
                  </h3>
                  <p className="text-center text-3xl font-bold text-gray-900 mb-4">
                    {isHealthy ? t.diseasePage.noDisease : result.disease.replace(/_/g, " ")}
                  </p>
                  <div className={`flex items-center justify-center gap-2 font-medium ${isHealthy ? "text-green-600" : "text-red-600"
                    }`}>
                    <span>{t.diseasePage.confidence}:</span>
                    <span className="text-2xl font-bold">{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>💊</span>
                    <span>{t.diseasePage.recommendation}</span>
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {result.recommendation}
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
export default function DiseasePage() {
  return (
    <ProtectedRoute>
      <DiseasePageContent />
    </ProtectedRoute>
  );
}
