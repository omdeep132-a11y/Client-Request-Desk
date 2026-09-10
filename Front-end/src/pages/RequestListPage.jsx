import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import StatusFilter from "../organisms/StatusFilter";
import RequestTable from "../organisms/RequestTable";
import LoadingState from "../molecules/LoadingState";
import EmptyState from "../molecules/EmptyState";
import ErrorState from "../molecules/ErrorState";

export default function RequestListPage() {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const params = filter ? { status: filter } : {};
            const { data } = await api.get("/requests", { params });
            setRequests(data);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to load requests");
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-lg font-semibold text-gray-900">Requests</h1>
                <Link
                    to="/requests/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 transition"
                >
                    + New Request
                </Link>
            </div>

            <StatusFilter value={filter} onChange={setFilter} />

            {loading ? (
                <LoadingState />
            ) : error ? (
                <ErrorState message={error} onRetry={load} />
            ) : requests.length === 0 ? (
                <EmptyState
                    title="No requests yet"
                    description="Create your first customer request to get started."
                    action={
                        <Link
                            to="/requests/new"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 transition"
                        >
                            + New Request
                        </Link>
                    }
                />
            ) : (
                <RequestTable requests={requests} />
            )}
        </div>
    );
}