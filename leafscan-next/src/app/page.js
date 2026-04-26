"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

function truncateText(text, limit) {
  if (!text) return "";
  if (text.length <= limit) return text;
  return text.slice(0, limit) + "...";
}

function PlantCard({ plant }) {
  return (
    <Link
      href={`/plant/${plant.id}`}
      className="min-w-[260px] max-w-[260px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:bg-slate-800 transition"
    >
      {plant?.image_url ? (
        <img
          src={plant.image_url}
          alt={plant.name || "Plant"}
          className="w-full h-44 object-cover bg-slate-800"
        />
      ) : (
        <div className="w-full h-44 bg-slate-800" />
      )}

      <div className="p-4">
        <h3 className="text-lg font-semibold">
          {plant.name || "Unnamed plant"}
        </h3>
        <p className="text-sm text-slate-400 italic mt-1">
          {plant.scientific_name || ""}
        </p>
        <p className="text-sm text-slate-300 mt-3">
          {truncateText(plant.description || "No description available.", 110)}
        </p>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [allPlants, setAllPlants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const featuredPlants = useMemo(
    () => filteredPlants.slice(0, 6),
    [filteredPlants],
  );
  const heroPlant = featuredPlants[heroIndex] || filteredPlants[0] || null;

  useEffect(() => {
    async function loadData() {
      const [
        { data: plantsData, error: plantsError },
        { data: categoriesData, error: categoriesError },
      ] = await Promise.all([
        supabase
          .from("plants")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: true }),
        supabase
          .from("categories")
          .select("*")
          .order("id", { ascending: true }),
      ]);

      if (plantsError) {
        console.log(plantsError);
        setError("Failed to load plants from Supabase.");
        return;
      }

      if (categoriesError) {
        console.log(categoriesError);
      }

      const plants = plantsData || [];
      setAllPlants(plants);
      setFilteredPlants(plants);
      setCategories(categoriesData || []);
      setHeroIndex(0);
    }

    loadData();
  }, []);

  useEffect(() => {
    if (featuredPlants.length <= 1) return;

    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % featuredPlants.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [featuredPlants]);

  function handleSearch(value) {
    setSearch(value);

    const keyword = value.trim().toLowerCase();
    if (!keyword) {
      setFilteredPlants(allPlants);
      setHeroIndex(0);
      return;
    }

    const filtered = allPlants.filter((plant) => {
      const name = (plant.name || "").toLowerCase();
      const scientific = (plant.scientific_name || "").toLowerCase();
      return name.includes(keyword) || scientific.includes(keyword);
    });

    setFilteredPlants(filtered);
    setHeroIndex(0);
  }

  function filterByCategory(categoryId) {
    const filtered = allPlants.filter(
      (plant) => plant.category_id === categoryId,
    );
    setFilteredPlants(filtered);
    setSearch("");
    setHeroIndex(0);
  }

  function resetCategory() {
    setFilteredPlants(allPlants);
    setSearch("");
    setHeroIndex(0);
  }

  function prevHero() {
    if (!featuredPlants.length) return;
    setHeroIndex(
      (prev) => (prev - 1 + featuredPlants.length) % featuredPlants.length,
    );
  }

  function nextHero() {
    if (!featuredPlants.length) return;
    setHeroIndex((prev) => (prev + 1) % featuredPlants.length);
  }

  const popularPlants = filteredPlants.slice(0, 8);
  const newPlants = [...filteredPlants].reverse().slice(0, 8);

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6">
      
        <section className="relative overflow-hidden rounded-3xl bg-slate-900 min-h-[420px] flex items-end mb-10 border border-slate-800">
          {heroPlant?.image_url ? (
            <img
              src={heroPlant.image_url}
              alt={heroPlant?.name || "Featured plant"}
              className="absolute inset-0 w-full h-full object-cover opacity-40 transition-all duration-700"
            />
          ) : (
            <div className="absolute inset-0 bg-slate-800" />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

          {featuredPlants.length > 1 && (
            <>
              <button
                onClick={prevHero}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-900/70 hover:bg-slate-800 text-2xl flex items-center justify-center border border-slate-700"
              >
                &#10094;
              </button>

              <button
                onClick={nextHero}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-900/70 hover:bg-slate-800 text-2xl flex items-center justify-center border border-slate-700"
              >
                &#10095;
              </button>
            </>
          )}

          <div className="relative z-10 p-8 md:p-12 max-w-2xl">
            <p className="text-green-400 text-sm font-semibold mb-3">
              Featured Plant
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {heroPlant?.name || "No plants available yet"}
            </h1>
            <p className="text-slate-300 italic mb-4">
              {heroPlant?.scientific_name || ""}
            </p>
            <p className="text-slate-200 leading-7 mb-6">
              {truncateText(
                heroPlant?.description ||
                  "Add some plant records in Supabase to populate the homepage.",
                260,
              )}
            </p>

            <div className="flex flex-wrap gap-3">
              {heroPlant && (
                <Link
                  href={`/plant/${heroPlant.id}`}
                  className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 font-medium"
                >
                  View Details
                </Link>
              )}
              <Link
                href="/scan"
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium"
              >
                Scan Plant
              </Link>
              <Link
                href="/plants"
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium"
              >
                Browse All Plants
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Popular Plants</h2>
            <Link href="/plants" className="text-green-400 hover:underline">
              See all
            </Link>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-3 scroll-smooth">
            {popularPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">New Plants</h2>
            <Link href="/plants" className="text-green-400 hover:underline">
              See all
            </Link>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-3 scroll-smooth">
            {newPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </section>

     

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <h2 className="text-3xl font-bold mb-3">
                Need help identifying a plant?
              </h2>
              <p className="text-slate-300 max-w-2xl">
                Upload a leaf image and let LeafScan predict the plant for you,
                then jump straight into the plant details page.
              </p>
            </div>

            <Link
              href="/scan"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 font-medium"
            >
              Go to Scan Page
            </Link>
          </div>
        </section>

        {error && <div className="mt-8 text-red-400">{error}</div>}
      </main>
    </div>
  );
}
