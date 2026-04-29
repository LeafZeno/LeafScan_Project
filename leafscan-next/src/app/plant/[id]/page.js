"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/ToastProvider";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

function RelatedPlantCard({ plant }) {
  return (
    <Link
      href={`/plant/${plant.id}`}
      className="block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:bg-slate-800 transition"
    >
      {plant.image_url ? (
        <img
          src={plant.image_url}
          alt={plant.name || "Plant"}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-slate-800" />
      )}

      <div className="p-4">
        <h3 className="font-bold line-clamp-2">{plant.name}</h3>
        <p className="text-sm text-slate-400 italic line-clamp-1">
          {plant.scientific_name}
        </p>
      </div>
    </Link>
  );
}

export default function PlantDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [plant, setPlant] = useState(null);
  const [images, setImages] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [relatedPlants, setRelatedPlants] = useState([]);
  const [favoriteRecordId, setFavoriteRecordId] = useState(null);
  const [favoriteLabel, setFavoriteLabel] = useState("Add to Favorites");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function setupFavoriteButton(plantId) {
    const user = await getCurrentUser();

    if (!user) {
      setFavoriteRecordId(null);
      setFavoriteLabel("Login to Save Favorite");
      return;
    }

    const { data, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("plant_id", plantId)
      .maybeSingle();

    if (error) {
      setFavoriteLabel("Favorite Unavailable");
      return;
    }

    if (data) {
      setFavoriteRecordId(data.id);
      setFavoriteLabel("Remove from Favorites");
    } else {
      setFavoriteRecordId(null);
      setFavoriteLabel("Add to Favorites");
    }
  }

  async function handleFavoriteClick() {
    const user = await getCurrentUser();

    if (!user) {
      showToast("Please login first.", "error");
      router.push("/login");
      return;
    }

    if (favoriteRecordId) {
      setConfirmOpen(true);
      return;
    }

    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      plant_id: plant.id,
    });

    if (error) {
      showToast("Failed to add favorite.", "error");
      return;
    }

    showToast("Added to favorites.");
    await setupFavoriteButton(plant.id);
  }

  async function handleRemoveFavoriteConfirmed() {
    if (!favoriteRecordId) return;

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", favoriteRecordId);

    if (error) {
      showToast("Failed to remove favorite.", "error");
    } else {
      showToast("Removed from favorites.");
      await setupFavoriteButton(plant.id);
    }

    setConfirmOpen(false);
  }

  useEffect(() => {
    async function loadPlant() {
      setLoading(true);
      setError("");

      const { data: plantData, error: plantError } = await supabase
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
        .eq("id", id)
        .single();

      if (plantError || !plantData) {
        console.log("Plant error:", plantError);
        setError("Plant not found.");
        setLoading(false);
        return;
      }

      setPlant(plantData);
      setCategoryName(plantData.categories?.name || "");

      const { data: imageData, error: imageError } = await supabase
        .from("plant_images")
        .select("*")
        .eq("plant_id", plantData.id)
        .order("sort_order", { ascending: true })
        .limit(6);

      if (imageError) {
        console.log("Image error:", imageError);
      }

      setImages(imageData || []);

      if (plantData.category_id) {
        const { data: relatedData } = await supabase
          .from("plants")
          .select("*")
          .eq("category_id", plantData.category_id)
          .neq("id", plantData.id)
          .eq("is_active", true)
          .limit(4);

        setRelatedPlants(relatedData || []);
      }

      await setupFavoriteButton(plantData.id);
      setLoading(false);
    }

    if (id) loadPlant();
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="text-center text-slate-300 py-20">
          Loading plant details...
        </div>
      </AppShell>
    );
  }

  if (error || !plant) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/plants" className="text-green-400 underline">
            Back to plants
          </Link>
        </div>
      </AppShell>
    );
  }

  const mainImage = plant.image_url || images[0]?.image_url || "";

  return (
    <AppShell>
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 h-[320px] md:h-[460px] mb-8">
        {mainImage && (
          <img
            src={mainImage}
            alt={plant.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6">
          {categoryName && (
            <span className="inline-block mb-3 px-4 py-1 rounded-full bg-green-500/15 text-green-300 border border-green-500/30 text-sm">
              {categoryName}
            </span>
          )}

          <h1 className="text-4xl md:text-6xl font-extrabold line-clamp-2">
            {plant.name}
          </h1>

          <p className="text-slate-300 italic text-lg mt-2">
            {plant.scientific_name}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <main className="space-y-8">
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <p className="text-slate-300 leading-8 whitespace-pre-line">
              {plant.description || "No description available."}
            </p>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">Care Instructions</h2>
            <p className="text-slate-300 leading-8 whitespace-pre-line">
              {plant.care_instructions || "No care instructions available yet."}
            </p>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-5">Image Gallery</h2>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img) => (
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt={plant.name}
                    className="w-full h-40 md:h-52 object-cover rounded-2xl border border-slate-800 bg-slate-800"
                  />
                ))}
              </div>
            ) : mainImage ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <img
                  src={mainImage}
                  alt={plant.name}
                  className="w-full h-40 md:h-52 object-cover rounded-2xl border border-slate-800 bg-slate-800"
                />
              </div>
            ) : (
              <p className="text-slate-400">No images available.</p>
            )}
          </section>
        </main>

        <aside className="space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">Quick Info</h2>

            <div className="space-y-4 text-slate-300">
              <p>
                <span className="block text-slate-500 text-sm">Category</span>
                {categoryName || "Uncategorized"}
              </p>

              <p>
                <span className="block text-slate-500 text-sm">
                  Scientific Name
                </span>
                {plant.scientific_name || "-"}
              </p>

              <p>
                <span className="block text-slate-500 text-sm">
                  Model Label
                </span>
                {plant.model_label || "-"}
              </p>
            </div>

            <button
              onClick={handleFavoriteClick}
              className={`mt-6 w-full px-5 py-3 rounded-xl font-semibold ${
                favoriteLabel === "Remove from Favorites"
                  ? "bg-red-600 hover:bg-red-700"
                  : favoriteLabel === "Login to Save Favorite"
                    ? "bg-slate-700 hover:bg-slate-600"
                    : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {favoriteLabel}
            </button>

            <button
              onClick={() => router.back()}
              className="mt-3 w-full px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold"
            >
              ← Back
            </button>
          </section>

          {relatedPlants.length > 0 && (
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h2 className="text-2xl font-bold mb-4">Related Plants</h2>

              <div className="space-y-4">
                {relatedPlants.map((related) => (
                  <RelatedPlantCard key={related.id} plant={related} />
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Remove favorite?"
        message="This will remove the plant from your favorites."
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleRemoveFavoriteConfirmed}
        onCancel={() => setConfirmOpen(false)}
      />
    </AppShell>
  );
}
