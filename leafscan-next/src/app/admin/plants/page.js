"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/ToastProvider";
import ConfirmModal from "@/components/ui/ConfirmModal";

const initialForm = {
  name: "",
  scientific_name: "",
  description: "",
  care_instructions: "",
  model_label: "",
  category_id: "",
  is_active: true,
};

function PlantFormModal({
  open,
  mode,
  form,
  setForm,
  categories,
  mainImageFile,
  setMainImageFile,
  galleryFiles,
  setGalleryFiles,
  mainPreview,
  galleryPreviews,
  onClose,
  onSubmit,
  saving,
}) {
  if (!open) return null;

  function handleMainImage(e) {
    const file = e.target.files?.[0];
    if (file) setMainImageFile(file);
  }

  function handleGalleryImages(e) {
    const files = Array.from(e.target.files || []);
    setGalleryFiles(files);
  }

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {mode === "edit" ? "Edit Plant" : "Add New Plant"}
            </h2>
            <p className="text-slate-400 text-sm">
              Fill plant information and upload images.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Plant Name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Scientific Name
              </label>
              <input
                value={form.scientific_name}
                onChange={(e) =>
                  setForm({ ...form, scientific_name: e.target.value })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Model Label
              </label>
              <input
                value={form.model_label}
                onChange={(e) =>
                  setForm({ ...form, model_label: e.target.value })
                }
                placeholder="Must match class_names.json"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Category
              </label>
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-green-500"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Description
            </label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Care Instructions
            </label>
            <textarea
              rows={5}
              value={form.care_instructions}
              onChange={(e) =>
                setForm({ ...form, care_instructions: e.target.value })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Main Image
              </label>

              <input
                id="mainImageInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleMainImage}
              />

              <label
                htmlFor="mainImageInput"
                className="block text-center cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-4 py-3 font-semibold"
              >
                Choose Main Image
              </label>

              {mainPreview && (
                <img
                  src={mainPreview}
                  alt="Main preview"
                  className="mt-4 w-full h-48 object-cover rounded-2xl border border-slate-700"
                />
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Gallery Images
              </label>

              <input
                id="galleryImageInput"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleGalleryImages}
              />

              <label
                htmlFor="galleryImageInput"
                className="block text-center cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-4 py-3 font-semibold"
              >
                Choose Gallery Images
              </label>

              {galleryPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {galleryPreviews.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Gallery preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-xl border border-slate-700"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <label className="flex items-center gap-3 text-slate-300">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
              className="w-4 h-4"
            />
            Active plant
          </label>

          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 px-5 py-3 rounded-xl font-semibold"
            >
              {saving
                ? "Saving..."
                : mode === "edit"
                  ? "Update Plant"
                  : "Add Plant"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 px-5 py-3 rounded-xl font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPlantsPage() {
  const { showToast } = useToast();

  const [plants, setPlants] = useState([]);
  const [categories, setCategories] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const mainPreview = useMemo(() => {
    if (mainImageFile) return URL.createObjectURL(mainImageFile);
    if (mode === "edit" && form.image_url) return form.image_url;
    return "";
  }, [mainImageFile, form.image_url, mode]);

  const galleryPreviews = useMemo(() => {
    return galleryFiles.map((file) => URL.createObjectURL(file));
  }, [galleryFiles]);

  async function loadData() {
    setLoading(true);

    const [{ data: plantsData }, { data: categoriesData }] = await Promise.all([
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
        .order("id", { ascending: false }),
      supabase.from("categories").select("*").order("id", { ascending: true }),
    ]);

    setPlants(plantsData || []);
    setCategories(categoriesData || []);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      await loadData();
    }

    init();
  }, []);

  function openAddModal() {
    setMode("add");
    setEditingId(null);
    setForm(initialForm);
    setMainImageFile(null);
    setGalleryFiles([]);
    setModalOpen(true);
  }

  function openEditModal(plant) {
    setMode("edit");
    setEditingId(plant.id);
    setForm({
      name: plant.name || "",
      scientific_name: plant.scientific_name || "",
      description: plant.description || "",
      care_instructions: plant.care_instructions || "",
      model_label: plant.model_label || "",
      category_id: plant.category_id || "",
      is_active: plant.is_active ?? true,
      image_url: plant.image_url || "",
    });
    setMainImageFile(null);
    setGalleryFiles([]);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSaving(false);
  }

  async function uploadFile(file, folder = "plants") {
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from("plant-images")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("plant-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = form.image_url || "";

      if (mainImageFile) {
        imageUrl = await uploadFile(mainImageFile, "main");
      }

      const payload = {
        name: form.name,
        scientific_name: form.scientific_name,
        description: form.description,
        care_instructions: form.care_instructions,
        model_label: form.model_label,
        category_id: form.category_id || null,
        is_active: form.is_active,
        image_url: imageUrl,
      };

      let plantId = editingId;

      if (mode === "edit") {
        const { error } = await supabase
          .from("plants")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("plants")
          .insert(payload)
          .select("id")
          .single();

        if (error) throw error;
        plantId = data.id;
      }

      if (galleryFiles.length > 0 && plantId) {
        const galleryRows = [];

        for (let i = 0; i < galleryFiles.length; i++) {
          const url = await uploadFile(galleryFiles[i], "gallery");

          galleryRows.push({
            plant_id: plantId,
            image_url: url,
            sort_order: i + 1,
          });
        }

        const { error: galleryError } = await supabase
          .from("plant_images")
          .insert(galleryRows);

        if (galleryError) throw galleryError;
      }

      showToast(mode === "edit" ? "Plant updated." : "Plant added.");
      closeModal();
      await loadData();
    } catch (error) {
      console.log("Save plant error:", error);
      showToast("Failed to save plant.", "error");
      setSaving(false);
    }
  }

  function askDelete(id) {
    setDeleteId(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!deleteId) return;

    const { error } = await supabase.from("plants").delete().eq("id", deleteId);

    if (error) {
      showToast("Failed to delete plant.", "error");
    } else {
      showToast("Plant deleted.");
      await loadData();
    }

    setConfirmOpen(false);
    setDeleteId(null);
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Plants Management</h1>
            <p className="text-slate-400 mt-1">
              Add, edit, and manage plant records.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl font-semibold"
          >
            + Add Plant
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-slate-400">Loading plants...</div>
          ) : plants.length === 0 ? (
            <div className="p-8 text-slate-400">No plants found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-slate-800 text-slate-300">
                  <tr>
                    <th className="p-4">Image</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Scientific</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {plants.map((plant) => (
                    <tr
                      key={plant.id}
                      className="border-t border-slate-800 hover:bg-slate-800/40"
                    >
                      <td className="p-4">
                        {plant.image_url ? (
                          <img
                            src={plant.image_url}
                            alt={plant.name}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-slate-800" />
                        )}
                      </td>

                      <td className="p-4 font-semibold">{plant.name}</td>

                      <td className="p-4 text-slate-300">
                        {plant.scientific_name || "-"}
                      </td>

                      <td className="p-4 text-slate-300">
                        {plant.categories?.name || "Uncategorized"}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            plant.is_active
                              ? "bg-green-500/15 text-green-300"
                              : "bg-red-500/15 text-red-300"
                          }`}
                        >
                          {plant.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(plant)}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => askDelete(plant.id)}
                            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 font-semibold"
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
        </div>
      </div>

      <PlantFormModal
        open={modalOpen}
        mode={mode}
        form={form}
        setForm={setForm}
        categories={categories}
        mainImageFile={mainImageFile}
        setMainImageFile={setMainImageFile}
        galleryFiles={galleryFiles}
        setGalleryFiles={setGalleryFiles}
        mainPreview={mainPreview}
        galleryPreviews={galleryPreviews}
        onClose={closeModal}
        onSubmit={handleSubmit}
        saving={saving}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Delete plant?"
        message="This action will remove the plant from your database."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteId(null);
        }}
      />
    </AdminLayout>
  );
}
