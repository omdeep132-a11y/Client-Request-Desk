import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import StatusBadge from "../molecules/StatusBadge";
import ActivityTimeline from "../organisms/ActivityTimeline";
import ConfirmDialog from "../molecules/ConfirmDialog";
import AssistantPanel from "../molecules/AssistantPanel";
import LoadingState from "../molecules/LoadingState";
import ErrorState from "../molecules/ErrorState";
import { formatDate } from "../utils/formatDate";

const STATUSES = ["NEW", "QUALIFIED", "CLOSED"];

export default function RequestDetailPage() {
  const { id } = useParams();

  const [request, setRequest] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [r, a] = await Promise.all([
        api.get(`/requests/${id}`),
        api.get(`/requests/${id}/activity`),
      ]);
      setRequest(r.data);
      setActivities(a.data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "This request doesn't exist or you don't have access to it."
          : err.response?.data?.error || "Failed to load request"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (newStatus) => {
    try {
      await api.patch(`/requests/${id}`, { status: newStatus });
      setSavedMessage("Status updated");
      setTimeout(() => setSavedMessage(""), 2000);
      await load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status");
    }
  };

  const handleConvert = async () => {
    setConverting(true);
    setConvertError("");
    try {
      await api.post(`/requests/${id}/convert`);
      setConfirmOpen(false);
      await load();
    } catch (err) {
      setConvertError(
        err.response?.data?.error || "Failed to convert request"
      );
    } finally {
      setConverting(false);
    }
  };

  const handleAssistantAction = (intent) => {
    if (intent === "QUALIFIED" || intent === "CLOSED") {
      changeStatus(intent);
    } else if (intent === "CONVERT") {
      setConfirmOpen(true);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!request) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <Link
            to="/requests"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to requests
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 mt-1">
            {request.customerName}
          </h1>
        </div>
        <Link
          to={`/requests/${id}/edit`}
          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md font-medium text-sm hover:bg-gray-50 transition"
        >
          Edit
        </Link>
      </div>

      {savedMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-md p-3">
          {savedMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Service</div>
              <div className="font-medium text-gray-900">{request.service}</div>
            </div>
            <div>
              <div className="text-gray-500">Scheduled date</div>
              <div className="font-medium text-gray-900">
                {formatDate(request.scheduledDate)}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Status</div>
              <div className="mt-1">
                <StatusBadge status={request.status} />
              </div>
            </div>
            <div>
              <div className="text-gray-500">Change status</div>
              <div className="mt-1 flex gap-2 flex-wrap">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(s)}
                    disabled={request.status === s}
                    className={`px-3 py-1 text-xs rounded border transition ${
                      request.status === s
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {request.notes && (
            <div className="text-sm border-t border-gray-100 pt-4">
              <div className="text-gray-500 mb-1">Notes</div>
              <div className="text-gray-800 whitespace-pre-wrap">
                {request.notes}
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={request.status !== "QUALIFIED"}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Create Work Item
            </button>
            {request.status !== "QUALIFIED" && (
              <p className="text-xs text-gray-500 mt-2">
                Only qualified requests can be converted to a work item.
              </p>
            )}
          </div>
        </div>

        <div>
          <AssistantPanel
            request={request}
            activities={activities}
            onAction={handleAssistantAction}
            busy={converting}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Activity</h2>
        <ActivityTimeline activities={activities} />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        request={request}
        loading={converting}
        error={convertError}
        onCancel={() => {
          setConfirmOpen(false);
          setConvertError("");
        }}
        onConfirm={handleConvert}
      />
    </div>
  );
}