"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import Toast from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin";

export default function AdminCategoriesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [categories, setCategories] = useState([]);

  const [formName, setFormName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  async function loadCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.log("Categories load error:", error);
      setToast({ message: "Failed to load categories.", type: "error" });
      return;
    }

    setCategories(data || []);
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

      await loadCategories();
      setLoading(false);
    }

    init();
  }, [router]);

  function resetForm() {
    setFormName("");
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const cleanName = formName.trim();
    if (!cleanName) {
      setToast({ message: "Category name is required.", type: "error" });
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("categories")
        .update({ name: cleanName })
        .eq("id", editingId);

      if (error) {
        console.log("Category update error:", error);
        setToast({ message: "Failed to update category.", type: "error" });
        return;
      }

      setToast({ message: "Category updated successfully.", type: "success" });
    } else {
      const { error } = await supabase
        .from("categories")
        .insert({ name: cleanName });

      if (error) {
        console.log("Category insert error:", error);
        setToast({ message: "Failed to add category.", type: "error" });
        return;
      }

      setToast({ message: "Category added successfully.", type: "success" });
    }

    resetForm();
    await loadCategories();
  }

  function handleEdit(category) {
    setEditingId(category.id);
    setFormName(category.name || "");
    setToast({ message: "", type: "success" });
  }

  function askDelete(categoryId) {
    setDeleteId(categoryId);
    setConfirmOpen(true);
  }

  async function handleDeleteConfirmed() {
    if (!deleteId) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", deleteId);

    if (error) {
      console.log("Category delete error:", error);
      setToast({
        message: "Failed to delete category. It may still be used by plants.",
        type: "error",
      });
    } else {
      if (editingId === deleteId) resetForm();
      setToast({ message: "Category deleted successfully.", type: "success" });
      await loadCategories();
    }

    setConfirmOpen(false);
    setDeleteId(null);
  }

  if (loading) {
    return (
      <AdminLayout
        title="Manage Categories"
        description="Loading categories..."
      >
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Manage Categories"
      description="Add, edit, and remove plant categories."
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
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? "Edit Category" : "Add Category"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm text-slate-300">
                  Category Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 font-medium"
                >
                  {editingId ? "Update Category" : "Add Category"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">Category List</h2>

            {categories.length === 0 ? (
              <p className="text-slate-400">No categories found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-800 text-slate-400 text-sm">
                    <tr>
                      <th className="py-3 pr-4">ID</th>
                      <th className="py-3 pr-4">Name</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr
                        key={category.id}
                        className="border-b border-slate-800/60"
                      >
                        <td className="py-4 pr-4">{category.id}</td>
                        <td className="py-4 pr-4">{category.name}</td>
                        <td className="py-4 pr-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => askDelete(category.id)}
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
        title="Delete category?"
        message="This action cannot be undone. If this category is used by plants, deletion may fail."
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
