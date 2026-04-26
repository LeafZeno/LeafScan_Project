"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/ToastProvider";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

function FavoriteCard({ plant, onRemove }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <Link
        href={`/plant/${plant.id}`}
        className="block hover:bg-slate-800 transition"
      >
        {plant?.image_url ? (
          <img
            src={plant.image_url}
            alt={plant.name || "Plant"}
            className="w-full h-48 object-cover bg-slate-800"
          />
        ) : (
          <div className="w-full h-48 bg-slate-800" />
        )}

        <div className="p-4">
          <h2 className="text-lg font-semibold">
            {plant.name || "Unnamed plant"}
          </h2>
          <p className="text-sm text-slate-400 italic mt-1">
            {plant.scientific_name || ""}
          </p>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <button
          onClick={() => onRemove(plant.favorite_id)}
          className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
        >
          Remove Favorite
        </button>
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedFavoriteId, setSelectedFavoriteId] = useState(null);

  async function loadFavorites() {
    const user = await getCurrentUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("favorites")
      .select(
        `
        id,
        plant_id,
        plants (
          id,
          name,
          scientific_name,
          image_url
        )
      `,
      )
      .eq("user_id", user.id);

    if (error) {
      console.log(error);
      setError("Failed to load favorites.");
      setLoading(false);
      return;
    }

    const plantsOnly = (data || [])
      .map((item) =>
        item.plants
          ? {
              ...item.plants,
              favorite_id: item.id,
            }
          : null,
      )
      .filter(Boolean);

    setFavorites(plantsOnly);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      await loadFavorites();
    }

    init();
  }, []);

  function askRemove(favoriteId) {
    setSelectedFavoriteId(favoriteId);
    setConfirmOpen(true);
  }

  async function handleRemoveConfirmed() {
    if (!selectedFavoriteId) return;

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", selectedFavoriteId);

    if (error) {
      console.log(error);
      showToast("Failed to remove favorite.", "error");
    } else {
      showToast("Removed from favorites.");
      setFavorites((prev) =>
        prev.filter((item) => item.favorite_id !== selectedFavoriteId),
      );
    }

    setConfirmOpen(false);
    setSelectedFavoriteId(null);
  }

  if (loading) {
    return (
      <AppShell>
        <div>Loading favorites...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="text-3xl font-bold mb-6">My Favorite Plants</h1>

      {error && <div className="text-red-400">{error}</div>}

      {!error && favorites.length === 0 && (
        <div className="text-slate-400">No favorites yet.</div>
      )}

      {!error && favorites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((plant) => (
            <FavoriteCard
              key={plant.favorite_id}
              plant={plant}
              onRemove={askRemove}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Remove favorite?"
        message="This plant will be removed from your favorites."
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleRemoveConfirmed}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedFavoriteId(null);
        }}
      />
    </AppShell>
  );
}
