import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import RequestForm from "../organisms/RequestForm";

export default function RequestCreatePage() {
  const navigate = useNavigate();

  const handleSubmit = async (form) => {
    const { data } = await api.post("/requests", form);
    navigate(`/requests/${data._id}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Link
        to="/requests"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to requests
      </Link>

      <h1 className="text-lg font-semibold text-gray-900 my-4">
        New Request
      </h1>

      <RequestForm onSubmit={handleSubmit} submitLabel="Create request" />
    </div>
  );
}