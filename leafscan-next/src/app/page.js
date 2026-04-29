"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

function truncateText(text, limit) {
  if (!text) return "";
  if (text.length <= limit) return text;
  return text.slice(0, limit) + "...";
}

function PlantCard({ plant }) {
  return (
    <Link
      href={`/plant/${plant.id}`}
      className="min-w-[220px] max-w-[220px] md:min-w-0 md:max-w-none bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:bg-slate-800 transition"
    >
      {plant.image_url ? (
        <img
          src={plant.image_url}
          alt={plant.name || "Plant"}
          className="w-full h-36 md:h-44 object-cover bg-slate-800"
        />
      ) : (
        <div className="w-full h-36 md:h-44 bg-slate-800" />
      )}

      <div className="p-3">
        <h3 className="font-bold text-white leading-tight line-clamp-2">
          {plant.name || "Unnamed plant"}
        </h3>
        <p className="text-sm text-slate-400 italic mt-1 line-clamp-1">
          {plant.scientific_name || ""}
        </p>
      </div>
    </Link>
  );
}

function SectionRow({ title, plants }) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link href="/plants" className="text-green-400 hover:underline text-sm">
          See all
        </Link>
      </div>

      <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto md:overflow-visible pb-3">
        {plants.map((plant) => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [plants, setPlants] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlants() {
      setLoading(true);

      const { data, error } = await supabase
        .from("plants")
        .select("*")
        .eq("is_active", true)
        .order("id", { ascending: true });

      if (error) {
        console.log("Home plants error:", error);
        setPlants([]);
      } else {
        setPlants(data || []);
      }

      setLoading(false);
    }

    loadPlants();
  }, []);

  const heroPlant = plants[heroIndex] || plants[0];

  const popularPlants = useMemo(() => plants.slice(0, 8), [plants]);
  const latestPlants = useMemo(() => plants.slice(-8).reverse(), [plants]);

  function nextHero() {
    if (plants.length === 0) return;
    setHeroIndex((prev) => (prev + 1) % plants.length);
  }

  function prevHero() {
    if (plants.length === 0) return;
    setHeroIndex((prev) => (prev - 1 + plants.length) % plants.length);
  }

  if (loading) {
    return (
      <AppShell>
        <div className="text-center text-slate-300 py-20">
          Loading LeafScan...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell className="py-6">
      {!heroPlant ? (
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold mb-3">LeafScan</h1>
          <p className="text-slate-400">No plants available yet.</p>
        </div>
      ) : (
        <>
          <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 h-[520px] md:h-[460px] mb-10">
            {heroPlant.image_url && (
              <img
                src={heroPlant.image_url}
                alt={heroPlant.name || "Featured plant"}
                className="absolute inset-0 w-full h-full object-cover opacity-55"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-transparent" />

            <button
              onClick={prevHero}
              className="absolute z-30 left-3 md:left-5 top-[46%] md:top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/75 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl"
              aria-label="Previous featured plant"
            >
              ‹
            </button>

            <button
              onClick={nextHero}
              className="absolute z-30 right-3 md:right-5 top-[46%] md:top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/75 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl"
              aria-label="Next featured plant"
            >
              ›
            </button>

            <div className="relative z-10 h-full p-6 md:p-12 max-w-2xl flex flex-col justify-end md:justify-center">
              <p className="text-green-400 font-semibold mb-2">
                Featured Plant
              </p>

              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-3 line-clamp-2 max-w-[90%]">
                {heroPlant.name}
              </h1>

              <p className="text-slate-300 italic mb-4 line-clamp-1">
                {heroPlant.scientific_name || ""}
              </p>

              <p className="text-slate-100 leading-7 mb-6 max-w-xl line-clamp-4 md:line-clamp-3">
                {truncateText(heroPlant.description, 180)}
              </p>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pb-10 md:pb-0">
                <Link
                  href={`/plant/${heroPlant.id}`}
                  className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 font-semibold text-center"
                >
                  View Details
                </Link>

                <Link
                  href="/scan"
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-center"
                >
                  Scan Plant
                </Link>

                <Link
                  href="/plants"
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-center"
                >
                  Browse Plants
                </Link>
              </div>
            </div>

            <div className="absolute z-30 bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
              {plants.slice(0, 5).map((plant, index) => (
                <button
                  key={plant.id}
                  onClick={() => setHeroIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full ${
                    index === heroIndex ? "bg-white" : "bg-white/40"
                  }`}
                  aria-label={`Go to featured plant ${index + 1}`}
                />
              ))}
            </div>
          </section>

          <SectionRow title="Popular Plants" plants={popularPlants} />

          <SectionRow title="Latest Plants" plants={latestPlants} />

          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Try LeafScan AI Scanner
                </h2>
                <p className="text-slate-400">
                  Upload or take a leaf photo and get prediction results with
                  confidence scores.
                </p>
              </div>

              <Link
                href="/scan"
                className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-center font-semibold"
              >
                Start Scanning
              </Link>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}