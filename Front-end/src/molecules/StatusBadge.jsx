import { statusStyles, statusLabels } from "../utils/statusColors";

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || "bg-gray-100 text-gray-700 border-gray-200";
  const label = statusLabels[status] || status;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      {label}
    </span>
  );
}