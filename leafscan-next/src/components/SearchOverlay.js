"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function SearchCard({ plant, onClick }) {
  return (
    <Link
      href={`/plant/${plant.id}`}
      onClick={onClick}
      className="group flex gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-3 hover:bg-slate-800 transition"
    >
      {plant.image_url ? (
        <img
          src={plant.image_url}
          alt={plant.name || "Plant"}
          className="w-20 h-20 rounded-xl object-cover bg-slate-800"
        />
      ) : (
        <div className="w-20 h-20 rounded-xl bg-slate-800" />
      )}

      <div className="min-w-0 flex-1">
        <p className="text-xs text-green-400 mb-1">
          {plant.categories?.name || "Plant"}
        </p>

        <h3 className="font-bold text-white line-clamp-1 group-hover:text-green-400">
          {plant.name || "Unnamed plant"}
        </h3>

        <p className="text-sm text-slate-400 italic line-clamp-1">
          {plant.scientific_name || ""}
        </p>

        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
          {plant.description || "No description available."}
        </p>
      </div>
    </Link>
  );
}

export default function SearchOverlay({ open, onClose }) {
  const [plants, setPlants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadPlants() {
      setLoading(true);

      const { data, error } = await supabase
        .from("plants")
        .select(
          `
          *,
          categories (
            id,
            name
          )
        `,
        )
        .eq("is_active", true)
        .order("id", { ascending: true });

      if (error) {
        console.log("Search plants error:", error);
        setPlants([]);
      } else {
        setPlants(data || []);
      }

      setLoading(false);
    }

    if (open) loadPlants();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const filteredPlants = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return plants.slice(0, 8);

    return plants.filter((plant) => {
      const name = (plant.name || "").toLowerCase();
      const scientific = (plant.scientific_name || "").toLowerCase();
      const model = (plant.model_label || "").toLowerCase();
      const category = (plant.categories?.name || "").toLowerCase();

      return (
        name.includes(keyword) ||
        scientific.includes(keyword) ||
        model.includes(keyword) ||
        category.includes(keyword)
      );
    });
  }, [plants, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-md px-4 py-5">
      <div className="max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-slate-800">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200"
            aria-label="Close search"
          >
            ✕
          </button>

          <div className="flex-1 flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
            <span className="text-slate-500">🔎</span>
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plants by name, category, or scientific name..."
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="px-4 md:px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">
                {search ? "Search Results" : "Popular Plants"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {loading
                  ? "Loading plants..."
                  : `${filteredPlants.length} result${
                      filteredPlants.length !== 1 ? "s" : ""
                    }`}
              </p>
            </div>
          </div>

          <div className="max-h-[65vh] overflow-y-auto pr-1">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-24 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredPlants.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🌿</div>
                <h3 className="text-xl font-bold mb-2">No plants found</h3>
                <p className="text-slate-500">
                  Try another plant name or category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredPlants.map((plant) => (
                  <SearchCard key={plant.id} plant={plant} onClick={onClose} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
