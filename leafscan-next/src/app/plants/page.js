"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";

function PlantCard({ plant }) {
  return (
    <Link
      href={`/plant/${plant.id}`}
      className="block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:bg-slate-800 transition"
    >
      {plant?.image_url ? (
        <img
          src={plant.image_url}
          alt={plant.name || "Plant"}
          className="w-full h-56 object-cover bg-slate-800"
        />
      ) : (
        <div className="w-full h-56 bg-slate-800" />
      )}

      <div className="p-4">
        <h2 className="text-xl font-semibold">
          {plant.name || "Unnamed plant"}
        </h2>
        <p className="text-slate-400 italic mt-1">
          {plant.scientific_name || ""}
        </p>
        <p className="text-slate-300 text-sm mt-3">
          {plant.description
            ? plant.description.length > 120
              ? `${plant.description.slice(0, 120)}...`
              : plant.description
            : "No description available."}
        </p>
      </div>
    </Link>
  );
}

export default function PlantsPage() {
  const [allPlants, setAllPlants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
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
          .select("*")
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
    let result = [...allPlants];

    if (selectedCategory !== "all") {
      result = result.filter(
        (plant) => String(plant.category_id) === String(selectedCategory),
      );
    }

    return result;
  }, [allPlants, selectedCategory]);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  return (
    <AppShell>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Plant Library</h1>
          <p className="text-slate-400 mt-2">
            Browse and search all available plants
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-56 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="text-slate-300">Loading plants...</div>}

      {!loading && error && <div className="text-red-400">{error}</div>}

      {!loading && !error && filteredPlants.length === 0 && (
        <div className="text-slate-400">No plants found.</div>
      )}

      {!loading && !error && filteredPlants.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlants.map((plant) => (
            <div key={plant.id} className="flex flex-col gap-2">
              <PlantCard plant={plant} />
              <div className="text-sm text-slate-400 px-1">
                {categoryMap[plant.category_id] || "Uncategorized"}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
