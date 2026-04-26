"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function SearchCard({ plant, onClick }) {
  return (
    <Link
      href={`/plant/${plant.id}`}
      onClick={onClick}
      className="bg-[#3b3b3b] rounded-md overflow-hidden hover:bg-[#4a4a4a] transition"
    >
      {plant.image_url ? (
        <img
          src={plant.image_url}
          alt={plant.name || "Plant"}
          className="w-full h-36 object-cover"
        />
      ) : (
        <div className="w-full h-36 bg-slate-700" />
      )}

      <div className="p-3">
        <h3 className="font-bold text-white leading-tight">{plant.name}</h3>
        <p className="text-sm text-slate-300 italic mt-1">
          {plant.scientific_name || ""}
        </p>
      </div>
    </Link>
  );
}

export default function SearchOverlay({ open, onClose }) {
  const [plants, setPlants] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadPlants() {
      const { data, error } = await supabase
        .from("plants")
        .select("*")
        .eq("is_active", true)
        .order("id", { ascending: true });

      if (error) {
        console.log("Search plants error:", error);
        return;
      }

      setPlants(data || []);
    }

    if (open) loadPlants();
  }, [open]);

  const filteredPlants = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return plants.slice(0, 8);

    return plants.filter((plant) => {
      const name = (plant.name || "").toLowerCase();
      const scientific = (plant.scientific_name || "").toLowerCase();
      const model = (plant.model_label || "").toLowerCase();

      return (
        name.includes(keyword) ||
        scientific.includes(keyword) ||
        model.includes(keyword)
      );
    });
  }, [plants, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm">
      <div className="bg-[#2b2b2b] max-w-6xl mx-auto mt-0 shadow-2xl">
        <div className="flex items-center gap-5 px-6 py-4 border-b border-slate-700">
          <button
            onClick={onClose}
            className="text-3xl text-white hover:text-green-400"
          >
            ‹
          </button>

          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plants..."
            className="flex-1 bg-transparent text-2xl text-white outline-none placeholder:text-slate-400"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-3xl text-white hover:text-red-400"
            >
              ×
            </button>
          )}
        </div>

        <div className="px-6 py-4 flex gap-3 border-b border-slate-700">
          <span className="px-4 py-2 rounded-full bg-white text-slate-950 font-semibold">
            All
          </span>
          <span className="px-4 py-2 rounded-full bg-[#444] text-white font-semibold">
            Plants
          </span>
          <span className="px-4 py-2 rounded-full bg-[#444] text-white font-semibold">
            Indoor
          </span>
          <span className="px-4 py-2 rounded-full bg-[#444] text-white font-semibold">
            Foliage
          </span>
        </div>

        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-4">
            {search ? "Search Results" : "Popular Search"}
          </h2>

          {filteredPlants.length === 0 ? (
            <p className="text-slate-300">No plants found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredPlants.map((plant) => (
                <SearchCard key={plant.id} plant={plant} onClick={onClose} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
