"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOutUser } from "@/lib/auth";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";
import ConfirmModal from "./ui/ConfirmModal";

export default function AuthButtons() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, loading, refreshAuth } = useAuth();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  async function handleLogout() {
    const ok = await signOutUser();

    setLogoutModalOpen(false)

    if (ok) {
      await refreshAuth();
      showToast("Logged out successfully.");
      router.push("/");
      router.refresh();
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-3 rounded-md font-semibold text-slate-400">
        ...
      </div>
    )
  }

  if (user) {
    return (
      <>
      <button
        onClick={() => setLogoutModalOpen(true)}
        className="flex items-center gap-2 px-4 py-3 rounded-md font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition"
      >
        🚪 Logout
      </button>

      <ConfirmModal
        open={logoutModalOpen}
        title="Logout?"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalOpen(false)}
      />
      </>
    );
  }

  return (
    <Link
      href="/login"
      className="flex items-center gap-2 px-4 py-3 rounded-md font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition"
    >
      🔐 Sign in
    </Link>
  );
}
