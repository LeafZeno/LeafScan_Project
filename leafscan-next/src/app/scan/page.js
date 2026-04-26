"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useToast } from "@/components/ui/ToastProvider";
import { supabase } from "@/lib/supabase";

export default function ScanPage() {
  const { showToast } = useToast();

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [top3, setTop3] = useState([]);
  const [error, setError] = useState("");
  const [detailUrl, setDetailUrl] = useState("");

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setTop3([]);
    setError("");
    setDetailUrl("");
  }

  async function handlePredict() {
    if (!imageFile) {
      setError("Please select an image first.");
      showToast("Please select an image first.", "error");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setTop3([]);
    setDetailUrl("");

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FLASK_API_URL}/predict`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Prediction failed.");
        showToast(data.error || "Prediction failed.", "error");
        setLoading(false);
        return;
      }

      const predictions = data.top_predictions || [];
      const best = predictions[0] || null;

      setResult({
        plant: data.plant || "Unknown result",
        confidence: best?.confidence || 0,
      });

      setTop3(predictions);

      if (data.plant && data.plant !== "Unknown plant") {
        const { data: matchedPlant, error: matchedPlantError } = await supabase
          .from("plants")
          .select("id")
          .eq("model_label", data.plant)
          .single();

        if (!matchedPlantError && matchedPlant) {
          setDetailUrl(`/plant/${matchedPlant.id}`);
        } else {
          console.log("Plant lookup error:", matchedPlantError);
        }
      }

      showToast("Scan completed.");
      setLoading(false);
    } catch (err) {
      console.log("Predict error:", err);
      setError("Failed to connect to Flask API.");
      showToast("Failed to connect to Flask API.", "error");
      setLoading(false);
    }
  }

  function getBarColor(confidence) {
    if (confidence >= 70) return "bg-green-500";
    if (confidence >= 50) return "bg-yellow-500";
    return "bg-red-500";
  }

  return (
    <AppShell className="flex items-center justify-center">
      <div className="bg-slate-700 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl text-white font-bold text-center mb-4">
          🌿 Leaf Plant Identification
        </h1>

        <input
          type="file"
          id="imageInput"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <label
          htmlFor="imageInput"
          className="block bg-slate-600 text-white text-center py-2 rounded-lg cursor-pointer mb-4 hover:bg-slate-500"
        >
          Choose Leaf Image
        </label>

        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-64 object-contain bg-slate-200 rounded mb-3"
          />
        )}

        <button
          onClick={handlePredict}
          disabled={loading}
          className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700 disabled:bg-slate-600"
        >
          {loading ? "Scanning..." : "Predict"}
        </button>

        {!loading && !result && !error && (
          <p className="text-slate-300 mt-4 text-center">
            Upload a plant image to identify it.
          </p>
        )}

        {loading && (
          <div className="text-center mt-4 text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto" />
            <p className="text-sm mt-2">Analyzing leaf...</p>
          </div>
        )}

        {result && (
          <div className="mt-4 text-white">
            <p className="text-lg">
              Top Prediction:{" "}
              <span
                className={
                  result.plant === "Unknown plant"
                    ? "text-red-400 font-semibold"
                    : "text-green-400 font-semibold"
                }
              >
                {result.plant}
              </span>
            </p>

            {detailUrl && (
              <Link
                href={detailUrl}
                className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View Details
              </Link>
            )}

            <div className="w-full bg-gray-200 rounded-full h-4 mt-3">
              <div
                className={`h-4 rounded-full ${getBarColor(result.confidence)}`}
                style={{ width: `${result.confidence}%` }}
              />
            </div>

            <p className="text-sm mt-1">
              {result.plant === "Unknown plant"
                ? `Best match confidence: ${result.confidence}% (below threshold)`
                : `Confidence: ${result.confidence}%`}
            </p>

            <div className="mt-4 text-sm">
              {top3.length > 0 ? (
                <>
                  <strong>Top 3 Predictions:</strong>
                  <ul className="mt-2 list-disc pl-5">
                    {top3.map((item, index) => (
                      <li key={index}>
                        {item.plant} — {item.confidence}%
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <strong>No predictions available.</strong>
              )}
            </div>
          </div>
        )}

        {error && <p className="text-red-400 mt-3">{error}</p>}
      </div>
    </AppShell>
  );
}
