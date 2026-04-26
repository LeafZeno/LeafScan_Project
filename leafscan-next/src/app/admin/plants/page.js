"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import Toast from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin";

const BUCKET_NAME = "plant-images";

function getSafeFileName(fileName) {
  return fileName.replace(/\s+/g, "-").replace(/[^\w.\-]/g, "");
}

async function uploadFileToStorage(file, folder = "misc") {
  const safeName = getSafeFileName(file.name);
  const filePath = `${folder}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}

export default function AdminPlantsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });

  const [plants, setPlants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    model_label: "",
    scientific_name: "",
    category_id: "",
    description: "",
    care_instructions: "",
    is_active: true,
  });

  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  async function loadData() {
    const [
      { data: plantsData, error: plantsError },
      { data: categoriesData, error: categoriesError },
    ] = await Promise.all([
      supabase.from("plants").select("*").order("id", { ascending: true }),
      supabase.from("categories").select("*").order("id", { ascending: true }),
    ]);

    if (plantsError) {
      console.log("Plants load error:", plantsError);
      setToast({ message: "Failed to load plants.", type: "error" });
    } else {
      setPlants(plantsData || []);
    }

    if (categoriesError) {
      console.log("Categories load error:", categoriesError);
    } else {
      setCategories(categoriesData || []);
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true);

      const access = await requireAdmin();

      if (!access.ok) {
        if (access.reason === "not_logged_in") {
          router.push("/login");
          return;
        }

        if (access.reason === "not_admin") {
          setAccessError("You do not have admin access.");
          setLoading(false);
          return;
        }
      }

      await loadData();
      setLoading(false);
    }

    init();
  }, [router]);

  const filteredPlants = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return plants;

    return plants.filter((plant) => {
      const name = (plant.name || "").toLowerCase();
      const modelLabel = (plant.model_label || "").toLowerCase();
      const scientific = (plant.scientific_name || "").toLowerCase();
      return (
        name.includes(keyword) ||
        modelLabel.includes(keyword) ||
        scientific.includes(keyword)
      );
    });
  }, [plants, search]);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  function resetForm() {
    setEditingId(null);
    setForm({
      name: "",
      model_label: "",
      scientific_name: "",
      category_id: "",
      description: "",
      care_instructions: "",
      is_active: true,
    });
    setMainImageFile(null);
    setGalleryFiles([]);
  }

  function handleEdit(plant) {
    setEditingId(plant.id);
    setForm({
      name: plant.name || "",
      model_label: plant.model_label || "",
      scientific_name: plant.scientific_name || "",
      category_id: plant.category_id ? String(plant.category_id) : "",
      description: plant.description || "",
      care_instructions: plant.care_instructions || "",
      is_active: !!plant.is_active,
    });
    setMainImageFile(null);
    setGalleryFiles([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function insertPlantGalleryImages(plantId, files, folderBase) {
    if (!files || files.length === 0) return;

    const rows = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageUrl = await uploadFileToStorage(file, `${folderBase}/gallery`);

      rows.push({
        plant_id: plantId,
        image_url: imageUrl,
        sort_order: i + 1,
      });
    }

    const { error } = await supabase.from("plant_images").insert(rows);
    if (error) throw error;
  }

  async function replacePlantGalleryImages(plantId, files, folderBase) {
    if (!files || files.length === 0) return;

    const { error: deleteError } = await supabase
      .from("plant_images")
      .delete()
      .eq("plant_id", plantId);

    if (deleteError) throw deleteError;

    await insertPlantGalleryImages(plantId, files, folderBase);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const cleanName = form.name.trim();
    const cleanModelLabel = form.model_label.trim();

    if (!cleanName || !cleanModelLabel) {
      setToast({
        message: "Name and model label are required.",
        type: "error",
      });
      return;
    }

    try {
      let image_url = null;
      const folderBase = `plants/${cleanModelLabel.replace(/\s+/g, "-")}`;

      if (editingId) {
        const existingPlant = plants.find((p) => p.id === editingId);
        image_url = existingPlant?.image_url || null;

        if (mainImageFile) {
          image_url = await uploadFileToStorage(
            mainImageFile,
            `${folderBase}/main`,
          );
        }

        const { error } = await supabase
          .from("plants")
          .update({
            name: cleanName,
            model_label: cleanModelLabel,
            scientific_name: form.scientific_name.trim(),
            category_id: form.category_id ? Number(form.category_id) : null,
            description: form.description.trim(),
            care_instructions: form.care_instructions.trim(),
            image_url,
            is_active: form.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);

        if (error) throw error;

        if (galleryFiles.length > 0) {
          await replacePlantGalleryImages(editingId, galleryFiles, folderBase);
        }

        setToast({ message: "Plant updated successfully.", type: "success" });
      } else {
        if (mainImageFile) {
          image_url = await uploadFileToStorage(
            mainImageFile,
            `${folderBase}/main`,
          );
        }

        const { data: insertedPlant, error } = await supabase
          .from("plants")
          .insert({
            name: cleanName,
            model_label: cleanModelLabel,
            scientific_name: form.scientific_name.trim(),
            category_id: form.category_id ? Number(form.category_id) : null,
            description: form.description.trim(),
            care_instructions: form.care_instructions.trim(),
            image_url,
            is_active: form.is_active,
          })
          .select()
          .single();

        if (error) throw error;

        if (galleryFiles.length > 0) {
          await insertPlantGalleryImages(
            insertedPlant.id,
            galleryFiles,
            folderBase,
          );
        }

        setToast({ message: "Plant added successfully.", type: "success" });
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.log("Plant save error:", error);
      setToast({ message: "Failed to save plant.", type: "error" });
    }
  }

  function askDelete(plantId) {
    setDeleteId(plantId);
    setConfirmOpen(true);
  }

  async function handleDeleteConfirmed() {
    if (!deleteId) return;

    const { error } = await supabase.from("plants").delete().eq("id", deleteId);

    if (error) {
      console.log("Plant delete error:", error);
      setToast({ message: "Failed to delete plant.", type: "error" });
    } else {
      if (editingId === deleteId) resetForm();
      setToast({ message: "Plant deleted successfully.", type: "success" });
      await loadData();
    }

    setConfirmOpen(false);
    setDeleteId(null);
  }

  if (loading) {
    return (
      <AdminLayout title="Manage Plants" description="Loading plants...">
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Manage Plants"
      description="Add, edit, delete plants and upload images directly."
    >
      <Toast
        message={accessError || toast.message}
        type={accessError ? "error" : toast.type}
        onClose={() => {
          setAccessError("");
          setToast({ message: "", type: "success" });
        }}
      />

      {!accessError && (
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-8">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {editingId ? "Edit Plant" : "Add Plant"}
              </h2>

              {editingId && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm text-slate-300">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-slate-300">
                  Model Label
                </label>
                <input
                  type="text"
                  value={form.model_label}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      model_label: e.target.value,
                    }))
                  }
                  placeholder="Only required for ML prediction match"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-slate-300">
                  Scientific Name
                </label>
                <input
                  type="text"
                  value={form.scientific_name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      scientific_name: e.target.value,
                    }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-slate-300">
                  Category
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      category_id: e.target.value,
                    }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm text-slate-300">
                  Description
                </label>
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-slate-300">
                  Care Instructions
                </label>
                <textarea
                  rows="5"
                  value={form.care_instructions}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      care_instructions: e.target.value,
                    }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-slate-300">
                  Main Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setMainImageFile(e.target.files?.[0] || null)
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-slate-300">
                  Gallery Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setGalleryFiles(Array.from(e.target.files || []))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                />
              </div>

              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                  className="w-4 h-4"
                />
                Active plant
              </label>

              <button
                type="submit"
                className="w-full px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 font-medium"
              >
                {editingId ? "Update Plant" : "Add Plant"}
              </button>
            </form>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <h2 className="text-2xl font-bold">Plant List</h2>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search plants..."
                className="w-full md:w-80 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
              />
            </div>

            {filteredPlants.length === 0 ? (
              <p className="text-slate-400">No plants found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-800 text-slate-400 text-sm">
                    <tr>
                      <th className="py-3 pr-4">Image</th>
                      <th className="py-3 pr-4">Name</th>
                      <th className="py-3 pr-4">Model Label</th>
                      <th className="py-3 pr-4">Category</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlants.map((plant) => (
                      <tr
                        key={plant.id}
                        className="border-b border-slate-800/60"
                      >
                        <td className="py-4 pr-4">
                          {plant.image_url ? (
                            <img
                              src={plant.image_url}
                              alt={plant.name || "Plant"}
                              className="w-16 h-16 object-cover rounded-xl bg-slate-800"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-slate-800" />
                          )}
                        </td>

                        <td className="py-4 pr-4">{plant.name}</td>
                        <td className="py-4 pr-4">{plant.model_label}</td>
                        <td className="py-4 pr-4">
                          {categoryMap[plant.category_id] || "Uncategorized"}
                        </td>
                        <td className="py-4 pr-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              plant.is_active
                                ? "bg-green-600/20 text-green-300"
                                : "bg-red-600/20 text-red-300"
                            }`}
                          >
                            {plant.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(plant)}
                              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => askDelete(plant.id)}
                              className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Delete plant?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteId(null);
        }}
      />
    </AdminLayout>
  );
}
