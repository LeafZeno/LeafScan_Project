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

  function handleFile(file) {
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setTop3([]);
    setError("");
    setDetailUrl("");
  }

  function resetScan() {
    setImageFile(null);
    setPreviewUrl("");
    setResult(null);
    setTop3([]);
    setError("");
    setDetailUrl("");
  }

  function getStatus(resultPlant) {
    if (!resultPlant) return "empty";
    if (resultPlant.includes("Unknown")) return "unknown";
    if (resultPlant.includes("Uncertain")) return "uncertain";
    return "known";
  }

  function getBarColor(confidence) {
    if (confidence >= 70) return "bg-green-500";
    if (confidence >= 50) return "bg-yellow-500";
    return "bg-red-500";
  }

  async function handlePredict() {
    if (!imageFile) {
      showToast("Please choose or take a leaf image first.", "error");
      setError("Please choose or take a leaf image first.");
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
        throw new Error(data.error || "Prediction failed.");
      }

      const predictions = data.top_predictions || [];
      const best = predictions[0] || null;

      const finalPlant = data.plant || best?.plant || "Unknown plant";
      const confidence = data.confidence || best?.confidence || 0;

      setResult({
        plant: finalPlant,
        confidence,
        status: data.status || getStatus(finalPlant),
      });

      setTop3(predictions);

      const status = data.status || getStatus(finalPlant);

      if (status === "known" && finalPlant !== "Unknown plant") {
        const { data: matchedPlant, error: matchedPlantError } = await supabase
          .from("plants")
          .select("id")
          .eq("model_label", finalPlant)
          .maybeSingle();

        if (!matchedPlantError && matchedPlant) {
          setDetailUrl(`/plant/${matchedPlant.id}`);
        }
      }

      showToast("Scan completed.");
    } catch (err) {
      console.log("Predict error:", err);
      setError("Failed to scan image. Please try again.");
      showToast("Failed to scan image.", "error");
    }

    setLoading(false);
  }

  const status = getStatus(result?.plant);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-green-400 font-semibold mb-2">AI Plant Scanner</p>
          <h1 className="text-4xl md:text-5xl font-bold">
            Identify a Plant From a Leaf Image
          </h1>
          <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
            Upload or take a leaf photo. LeafScan will predict the closest plant
            match and show confidence scores.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8">
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit">
            <h2 className="text-2xl font-bold mb-4">Image Input</h2>

            <input
              type="file"
              id="uploadInput"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            <input
              type="file"
              id="cameraInput"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                htmlFor="uploadInput"
                className="block text-center bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl py-3 cursor-pointer font-medium"
              >
                Upload Image
              </label>

              <label
                htmlFor="cameraInput"
                className="block text-center bg-green-600 hover:bg-green-700 rounded-xl py-3 cursor-pointer font-medium"
              >
                Take Photo
              </label>
            </div>

            <div className="mt-5">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-72 object-contain bg-slate-100 rounded-2xl border border-slate-700"
                />
              ) : (
                <div className="w-full h-72 rounded-2xl border border-dashed border-slate-700 bg-slate-950 flex items-center justify-center text-slate-500 text-center px-6">
                  No image selected yet.
                </div>
              )}
            </div>

            <button
              onClick={handlePredict}
              disabled={loading}
              className="mt-5 w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? "Scanning..." : "Predict Plant"}
            </button>

            {previewUrl && (
              <button
                onClick={resetScan}
                disabled={loading}
                className="mt-3 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-60 font-medium"
              >
                Try Another Image
              </button>
            )}

            {error && (
              <p className="mt-4 text-red-400 text-sm leading-6">{error}</p>
            )}
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 min-h-[520px]">
            <h2 className="text-2xl font-bold mb-4">Scan Result</h2>

            {!loading && !result && !error && (
              <div className="h-[420px] flex items-center justify-center text-center">
                <div>
                  <div className="text-6xl mb-4">🌿</div>
                  <h3 className="text-xl font-bold mb-2">
                    Waiting for your image
                  </h3>
                  <p className="text-slate-400 max-w-md">
                    Upload or take a leaf photo to see the AI prediction result.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="h-[420px] flex items-center justify-center text-center">
                <div>
                  <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-green-500 mx-auto mb-5" />
                  <h3 className="text-xl font-bold">Analyzing image...</h3>
                  <p className="text-slate-400 mt-2">
                    The AI model is checking the leaf pattern.
                  </p>
                </div>
              </div>
            )}

            {result && !loading && (
              <div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-6">
                  <p className="text-slate-400 text-sm mb-2">Top Prediction</p>

                  <h3
                    className={`text-2xl font-bold ${
                      status === "unknown"
                        ? "text-red-400"
                        : status === "uncertain"
                          ? "text-yellow-400"
                          : "text-green-400"
                    }`}
                  >
                    {result.plant}
                  </h3>

                  <p className="text-slate-400 text-sm mt-3">
                    {status === "unknown" &&
                      "The image does not look confident enough to match one plant."}
                    {status === "uncertain" &&
                      "The model found similar matches, so this result may need manual checking."}
                    {status === "known" &&
                      "This is the most likely plant based on the uploaded image."}
                  </p>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Confidence</span>
                      <span className="font-semibold">
                        {result.confidence}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-4 rounded-full ${getBarColor(
                          result.confidence,
                        )}`}
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {detailUrl && status === "known" && (
                      <Link
                        href={detailUrl}
                        className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 font-medium"
                      >
                        View Plant Details
                      </Link>
                    )}

                    <Link
                      href="/plants"
                      className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium"
                    >
                      Browse Plants
                    </Link>
                  </div>

                  <div className="mt-5 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm leading-6">
                    AI predictions may be inaccurate. Please compare the result
                    with plant details and real plant characteristics.
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Top 3 Predictions</h3>

                  {top3.length > 0 ? (
                    <div className="space-y-4">
                      {top3.map((item, index) => (
                        <div
                          key={index}
                          className="bg-slate-950 border border-slate-800 rounded-2xl p-4"
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <p className="text-sm text-slate-400">
                                Match #{index + 1}
                              </p>
                              <h4 className="font-bold text-lg">
                                {item.plant}
                              </h4>
                            </div>

                            <span className="font-bold text-green-400">
                              {item.confidence}%
                            </span>
                          </div>

                          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-3 rounded-full ${getBarColor(
                                item.confidence,
                              )}`}
                              style={{ width: `${item.confidence}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">
                      No prediction list available.
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
