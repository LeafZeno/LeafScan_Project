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
      </div>
    </Link>
  );
}

export default function PlantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { showToast } = useToast();

  const [plant, setPlant] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [images, setImages] = useState([]);
  const [relatedPlants, setRelatedPlants] = useState([]);
  const [favoriteRecordId, setFavoriteRecordId] = useState(null);
  const [favoriteLabel, setFavoriteLabel] = useState("Add to Favorites");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);

  async function setupFavoriteButton(plantId) {
    const user = await getCurrentUser();

    if (!user) {
      setFavoriteRecordId(null);
      setFavoriteLabel("Login to Save Favorite");
      return;
    }

    const { data: existingFavorite, error: checkError } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("plant_id", plantId)
      .maybeSingle();

    if (checkError) {
      console.log("Favorite check error:", checkError);
      setFavoriteRecordId(null);
      setFavoriteLabel("Favorite Unavailable");
      return;
    }

    if (existingFavorite) {
      setFavoriteRecordId(existingFavorite.id);
      setFavoriteLabel("Remove from Favorites");
    } else {
      setFavoriteRecordId(null);
      setFavoriteLabel("Add to Favorites");
    }
  }

  async function handleFavoriteClick() {
    if (!plant) return;

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
      console.log("Add favorite error:", error);
      showToast("Failed to add favorite.", "error");
      return;
    }

    showToast("Added to favorites!");
    await setupFavoriteButton(plant.id);
  }

  async function handleRemoveFavoriteConfirmed() {
    if (!favoriteRecordId || !plant) return;

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", favoriteRecordId);

    if (error) {
      console.log("Remove favorite error:", error);
      showToast("Failed to remove favorite.", "error");
    } else {
      showToast("Removed from favorites.");
      await setupFavoriteButton(plant.id);
    }

    setConfirmOpen(false);
  }

  useEffect(() => {
    async function loadPlant() {
      try {
        setLoading(true);
        setError("");

        const { data: plantData, error: plantError } = await supabase
          .from("plants")
          .select("*")
          .eq("id", id)
          .single();

        if (plantError || !plantData) {
          console.log("Plant query error:", plantError);
          setError("Plant not found.");
          setLoading(false);
          return;
        }

        setPlant(plantData);

        if (plantData.category_id) {
          const { data: categoryData } = await supabase
            .from("categories")
            .select("name")
            .eq("id", plantData.category_id)
            .single();

          setCategoryName(categoryData?.name || "");
        } else {
          setCategoryName("");
        }

        const { data: imageData, error: imageError } = await supabase
          .from("plant_images")
          .select("*")
          .eq("plant_id", plantData.id)
          .order("sort_order", { ascending: true });

        if (imageError) {
          console.log("Image query error:", imageError);
        }

        setImages(imageData || []);

        if (plantData.category_id) {
          const { data: relatedData, error: relatedError } = await supabase
            .from("plants")
            .select("*")
            .eq("category_id", plantData.category_id)
            .neq("id", plantData.id)
            .eq("is_active", true)
            .limit(4);

          if (relatedError) {
            console.log("Related query error:", relatedError);
            setRelatedPlants([]);
          } else {
            setRelatedPlants(relatedData || []);
          }
        } else {
          setRelatedPlants([]);
        }

        await setupFavoriteButton(plantData.id);
        setLoading(false);
      } catch (err) {
        console.log("Unexpected error:", err);
        setError("Something went wrong while loading plant details.");
        setLoading(false);
      }
    }

    if (id) loadPlant();
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="text-center text-slate-300">
          Loading plant details...
        </div>
      </AppShell>
    );
  }

  if (error || !plant) {
    return (
      <AppShell>
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Plant not found."}</p>
          <Link href="/plants" className="text-green-400 underline">
            Back to plants
          </Link>
        </div>
      </AppShell>
    );
  }

  const mainImage =
    plant.image_url || (images.length > 0 ? images[0].image_url : null);

  return (
    <AppShell>
      <Link
        href="/plants"
        className="inline-block mb-6 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700"
      >
        Back
      </Link>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="order-2 lg:order-1">
          <div className="flex flex-wrap gap-3 mb-4">
            {categoryName && (
              <span className="px-4 py-2 rounded-full bg-green-600/20 text-green-300 border border-green-500/30 text-sm">
                {categoryName}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {plant.name || "Unknown plant"}
          </h1>
          <p className="text-slate-300 italic text-lg mb-5">
            {plant.scientific_name || ""}
          </p>

          <p className="text-slate-200 leading-8 text-lg">
            {plant.description || "No description available."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/scan"
              className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 font-medium"
            >
              Scan Another Plant
            </Link>
            <Link
              href="/plants"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium"
            >
              Browse More Plants
            </Link>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          {mainImage ? (
            <img
              src={mainImage}
              alt={plant.name || "Plant image"}
              className="w-full h-[320px] md:h-[440px] object-cover rounded-3xl border border-slate-800 bg-slate-900"
            />
          ) : (
            <div className="w-full h-[320px] md:h-[440px] rounded-3xl border border-slate-800 bg-slate-900" />
          )}
        </div>
      </section>

      <section className="mb-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Care Instructions</h2>
          <p className="text-slate-200 leading-8 whitespace-pre-line">
            {plant.care_instructions || "No care instructions available yet."}
          </p>

          <button
            onClick={handleFavoriteClick}
            className={`mt-4 px-4 py-2 rounded font-medium ${
              favoriteLabel === "Remove from Favorites"
                ? "bg-red-600 hover:bg-red-700"
                : favoriteLabel === "Login to Save Favorite"
                  ? "bg-slate-700 hover:bg-slate-600"
                  : favoriteLabel === "Favorite Unavailable"
                    ? "bg-slate-700"
                    : "bg-yellow-500 hover:bg-yellow-600 text-slate-950"
            }`}
          >
            {favoriteLabel}
          </button>
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-10">
        <h2 className="text-2xl font-bold mb-5">Reference Images</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.length > 0 ? (
            images.map((img) =>
              img.image_url ? (
                <img
                  key={img.id}
                  src={img.image_url}
                  alt={plant.name || "Plant image"}
                  className="w-full h-60 object-cover rounded-xl bg-slate-800 border border-slate-800"
                />
              ) : (
                <div
                  key={img.id}
                  className="w-full h-60 rounded-xl bg-slate-800 border border-slate-800"
                />
              ),
            )
          ) : plant.image_url ? (
            <img
              src={plant.image_url}
              alt={plant.name || "Plant image"}
              className="w-full h-60 object-cover rounded-xl bg-slate-800 border border-slate-800"
            />
          ) : (
            <p className="text-slate-400">No reference images available.</p>
          )}
        </div>
      </section>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold">Related Plants</h2>
          <Link href="/plants" className="text-green-400 hover:underline">
            See all
          </Link>
        </div>

        {relatedPlants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedPlants.map((relatedPlant) => (
              <RelatedPlantCard key={relatedPlant.id} plant={relatedPlant} />
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No related plants found yet.</p>
        )}
      </section>

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
