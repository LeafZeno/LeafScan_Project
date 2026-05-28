"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Heart, FileSearch } from "lucide-react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

function PlantCard({ plant }) {
  return (
    <Link
      href={`/plant/${plant.id}`}
      className="min-w-[220px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:bg-slate-800 transition"
    >
      <img src={plant.image_url} className="w-full h-40 object-cover" />

      <div className="p-3">
        <h3 className="font-bold line-clamp-2">{plant.name}</h3>
        <p className="text-sm text-slate-400 italic line-clamp-1">
          {plant.scientific_name}
        </p>
      </div>
    </Link>
  );
}

function SectionRow({ title, plants }) {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({
      left: -900,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({
      left: 900,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-10 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>

        <Link href="/plants" className="text-green-400 text-sm">
          See all
        </Link>
      </div>

      {/* Left Arrow */}
      <button
        onClick={scrollLeft}
        className="absolute left-[-10px] top-[55%] -translate-y-1/2 z-20
        w-12 h-12 rounded-full bg-slate-900/90 border border-slate-700
        hover:bg-slate-800 flex items-center justify-center shadow-lg"
      >
        ‹
      </button>

      {/* Cards Row */}
      <div ref={scrollRef} className="flex gap-4 overflow-hidden scroll-smooth">
        {plants.slice(0, 8).map((p) => (
          <PlantCard key={p.id} plant={p} />
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={scrollRight}
        className="absolute right-[-10px] top-[55%] -translate-y-1/2 z-20
        w-12 h-12 rounded-full bg-slate-900/90 border border-slate-700
        hover:bg-slate-800 flex items-center justify-center shadow-lg"
      >
        ›
      </button>
    </section>
  );
}

export default function HomePage() {
  const [plants, setPlants] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);

  const touchStartX = useRef(0);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("plants")
        .select(
          `
          *,
          categories (name)
          `,
        )
        .eq("is_active", true);

      setPlants(data || []);
    }

    load();
  }, []);
  const heroPlants = useMemo(() => plants.slice(0, 5), [plants]);
  const heroPlant = plants[heroIndex];

  function nextHero() {
    setHeroIndex((prev) => (prev + 1) % heroPlants.length);
  }

  function prevHero() {
    setHeroIndex((prev) => (prev - 1 + heroPlants.length) % heroPlants.length);
  }

  function handleTouchStart(e) {
    touchStartX.current = e.changedTouches[0].screenX;
  }

  function handleTouchEnd(e) {
    const end = e.changedTouches[0].screenX;

    if (touchStartX.current - end > 50) nextHero();
    if (end - touchStartX.current > 50) prevHero();
  }

  const popular = useMemo(() => plants.slice(0, 8), [plants]);
  const latest = useMemo(() => plants.slice(-8).reverse(), [plants]);

  if (!heroPlant) {
    return (
      <AppShell>
        <div className="text-center py-20">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell className="py-6">
      {/* HERO */}
      <section
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative rounded-3xl overflow-hidden border border-slate-800 
                   h-[52vh] min-h-[360px] max-h-[520px] md:h-[480px] mb-10"
      >
        {/* BG */}
        <img
          src={heroPlant.image_url}
          className="absolute inset-0 w-full h-full object-cover 
                     transition duration-700 scale-105"
        />
        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        {/* DESKTOP */}
        <div className="hidden md:flex relative z-10 h-full flex-col justify-end p-10">
          <div className="max-w-2xl space-y-3">
            <p className="text-green-400 text-sm">
              {heroPlant.categories?.name || "Unknown"}
            </p>

            <h1 className="text-5xl font-bold line-clamp-2">
              {heroPlant.name}
            </h1>

            <p className="text-slate-300 line-clamp-2">
              {heroPlant.description}
            </p>

            <div className="flex gap-4 mt-4">
              <Link
                href={`/plant/${heroPlant.id}`}
                className="bg-green-600 px-6 py-3 rounded-xl"
              >
                View Details
              </Link>

              <button className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                <Heart />
              </button>
            </div>
          </div>
        </div>
        {/* MOBILE */}

        <div className="md:hidden absolute inset-0 z-10 flex flex-col justify-end items-center text-center pb-16">
          <p className="text-green-400 text-sm">
            {heroPlant.categories?.name || "Unknown"}
          </p>

          <h1 className="text-2xl font-bold line-clamp-2 px-4">
            {heroPlant.name}
          </h1>

          <div className="flex gap-3 mt-4">
            <Link
              href={`/plant/${heroPlant.id}`}
              className="bg-green-600 p-3 rounded-xl"
              aria-label="View plant details"
            >
              <FileSearch size={22} />
            </Link>

            <button className="bg-slate-800 p-3 rounded-xl">
              <Heart size={20} />
            </button>
          </div>
        </div>
        {/* CONTROLS */}
        <div className="absolute bottom-5 right-5 flex items-center gap-2 z-20">
          <button
            onClick={prevHero}
            className="w-10 h-10 bg-black/60 rounded-full"
          >
            ‹
          </button>

          <span>
            {heroIndex + 1} / {heroPlants.length}
          </span>

          <button
            onClick={nextHero}
            className="w-10 h-10 bg-black/60 rounded-full"
          >
            ›
          </button>
        </div>
      </section>

      {/* SECTIONS */}
      <SectionRow title="Popular Plants" plants={popular} />
      <SectionRow title="Latest Plants" plants={latest} />

      {/* CTA */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <h2 className="text-2xl font-bold mb-2">Try LeafScan AI Scanner</h2>

        <p className="text-slate-400 mb-4">
          Upload or take a leaf photo and identify plants instantly.
        </p>

        <Link href="/scan" className="bg-green-600 px-6 py-3 rounded-xl">
          Start Scanning
        </Link>
      </section>
    </AppShell>
  );
}
