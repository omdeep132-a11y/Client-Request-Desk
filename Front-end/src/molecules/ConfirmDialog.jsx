import { useEffect } from "react";

export default function ConfirmDialog({
  open,
  request,
  onCancel,
  onConfirm,
  loading,
  error,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Create work item?
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          This will convert the request into a work item. This action cannot be
          undone.
        </p>

        <div className="mt-4 space-y-2 text-sm border-t border-b border-gray-200 py-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Customer</span>
            <span className="font-medium text-gray-900">
              {request?.customerName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Service</span>
            <span className="font-medium text-gray-900">
              {request?.service}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Scheduled</span>
            <span className="font-medium text-gray-900">
              {formatDate(request?.scheduledDate)}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md font-medium text-sm hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Creating..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}