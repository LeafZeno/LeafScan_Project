"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOutUser } from "@/lib/auth";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuth } from "@/components/AuthProvider";

export default function AuthButtons() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, refreshAuth } = useAuth();

  async function handleLogout() {
    const ok = await signOutUser();

    if (ok) {
      await refreshAuth();
      showToast("Logged out successfully.");
      router.push("/");
      router.refresh();
    }
  }

  if (user) {
    return (
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-3 rounded-md font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition"
      >
        🚪 Logout
      </button>
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
