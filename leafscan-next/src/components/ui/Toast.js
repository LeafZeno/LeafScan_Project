"use client";

export default function Toast({ message, type = "success", onClose }) {
  if (!message) return null;

  const styles =
    type === "error"
      ? "bg-red-600/20 border-red-500/30 text-red-300"
      : "bg-green-600/20 border-green-500/30 text-green-300";

  return (
    <div className={`mb-6 border rounded-2xl px-4 py-3 ${styles}`}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm">{message}</p>
        <button
          onClick={onClose}
          className="text-sm px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}
