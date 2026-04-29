"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export default function PlantDetailPage() {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlant = async () => {
      const { data, error } = await supabase
        .from("plants")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setPlant(data);
      setLoading(false);
    };

    fetchPlant();
  }, [id]);

  if (loading)
    return (
      <div className="text-center mt-20 text-slate-400">Loading plant...</div>
    );

  if (!plant)
    return (
      <div className="text-center mt-20 text-red-400">Plant not found</div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* HERO IMAGE */}
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src={plant.image_url}
          alt={plant.name}
          className="w-full h-[250px] md:h-[400px] object-cover"
        />

        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* text on image */}
        <div className="absolute bottom-4 left-4">
          <span className="text-green-400 text-sm font-semibold">
            {plant.category}
          </span>
          <h1 className="text-2xl md:text-4xl font-bold text-white">
            {plant.name}
          </h1>
          <p className="text-slate-300 italic">{plant.scientific_name}</p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mt-6 grid md:grid-cols-3 gap-6">
        {/* LEFT (MAIN INFO) */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-slate-900 p-5 rounded-xl">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-slate-300 leading-relaxed">
              {plant.description || "No description available."}
            </p>
          </div>

          {/* Future: care instructions */}
          <div className="bg-slate-900 p-5 rounded-xl">
            <h2 className="text-lg font-semibold mb-2">Care Tips</h2>
            <ul className="text-slate-300 space-y-1">
              <li>🌱 Light: Indirect sunlight</li>
              <li>💧 Water: Moderate</li>
              <li>🌡 Temperature: 18–30°C</li>
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE PANEL */}
        <div className="space-y-4">
          <div className="bg-slate-900 p-5 rounded-xl">
            <h2 className="text-lg font-semibold mb-3">Quick Info</h2>

            <div className="space-y-2 text-slate-300 text-sm">
              <p>
                <span className="text-slate-400">Category:</span>{" "}
                {plant.category}
              </p>
              <p>
                <span className="text-slate-400">Scientific:</span>{" "}
                {plant.scientific_name}
              </p>
            </div>
          </div>

          <button
            onClick={() => window.history.back()}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
