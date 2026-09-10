import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import RequestForm from "../organisms/RequestForm";
import LoadingState from "../molecules/LoadingState";
import ErrorState from "../molecules/ErrorState";

export default function RequestEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/requests/${id}`);
        setRequest(data);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? "This request doesn't exist or you don't have access to it."
            : err.response?.data?.error || "Failed to load request"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (payload) => {
    await api.patch(`/requests/${id}`, payload);
    navigate(`/requests/${id}`);
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Link
        to={`/requests/${id}`}
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to request
      </Link>

      <h1 className="text-lg font-semibold text-gray-900 my-4">
        Edit Request
      </h1>

      <RequestForm
        initial={request}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}