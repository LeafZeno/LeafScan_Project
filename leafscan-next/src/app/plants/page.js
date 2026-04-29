"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

function PlantCard({ plant }) {
  return (
    <Link
      href={`/plant/${plant.id}`}
      className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:bg-slate-800 transition"
    >
      {plant.image_url ? (
        <img
          src={plant.image_url}
          alt={plant.name || "Plant"}
          className="w-full h-32 md:h-56 object-cover bg-slate-800 group-hover:scale-105 transition duration-500"
        />
      ) : (
        <div className="w-full h-48 md:h-56 bg-slate-800 flex items-center justify-center text-slate-500">
          No Image
        </div>
      )}

      <div className="p-3 md:p-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-300 border border-green-500/20">
            {plant.categories?.name || "Uncategorized"}
          </span>
        </div>

        <h2 className="text-base md:text-xl font-bold line-clamp-2">
          {plant.name || "Unnamed plant"}
        </h2>

        <p className="text-slate-400 italic text-sm mt-1 line-clamp-1">
          {plant.scientific_name || ""}
        </p>

        <p className="hidden md:block text-slate-300 text-sm mt-3 line-clamp-2">
          {plant.description || "No description available."}
        </p>
      </div>
    </Link>
  );
}

export default function PlantsPage() {
  const [allPlants, setAllPlants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      const [
        { data: plantsData, error: plantsError },
        { data: categoriesData, error: categoriesError },
      ] = await Promise.all([
        supabase
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
          .order("id", { ascending: true }),
        supabase
          .from("categories")
          .select("*")
          .order("id", { ascending: true }),
      ]);

      if (plantsError) {
        console.log("Plants query error:", plantsError);
        setError("Failed to load plants.");
        setLoading(false);
        return;
      }

      if (categoriesError) {
        console.log("Categories query error:", categoriesError);
      }

      setAllPlants(plantsData || []);
      setCategories(categoriesData || []);
      setLoading(false);
    }

    loadData();
  }, []);

  const filteredPlants = useMemo(() => {
    if (selectedCategory === "all") return allPlants;

    return allPlants.filter(
      (plant) => String(plant.category_id) === String(selectedCategory),
    );
  }, [allPlants, selectedCategory]);

  return (
    <AppShell>
      <section className="mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
          <p className="text-green-400 font-semibold mb-2">Explore Plants</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Plant Encyclopedia
          </h1>
          <p className="text-slate-400 max-w-2xl">
            Browse plants by category and open detailed information including
            scientific name, care instructions, and reference images.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex gap-3 overflow-x-auto pb-3">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`shrink-0 px-5 py-3 rounded-full font-semibold transition ${
              selectedCategory === "all"
                ? "bg-green-600 text-white"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800"
            }`}
          >
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(String(cat.id))}
              className={`shrink-0 px-5 py-3 rounded-full font-semibold transition ${
                String(selectedCategory) === String(cat.id)
                  ? "bg-green-600 text-white"
                  : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden animate-pulse"
            >
              <div className="h-56 bg-slate-800" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-6 bg-slate-800 rounded w-2/3" />
                <div className="h-4 bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-800 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl p-5">
          {error}
        </div>
      )}

      {!loading && !error && filteredPlants.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">
          <div className="text-5xl mb-4">🌿</div>
          <h2 className="text-2xl font-bold mb-2">No plants found</h2>
          <p className="text-slate-400">
            There are no active plants in this category yet.
          </p>
        </div>
      )}

      {!loading && !error && filteredPlants.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-5">
            <p className="text-slate-400">
              Showing{" "}
              <span className="text-white font-semibold">
                {filteredPlants.length}
              </span>{" "}
              plants
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
