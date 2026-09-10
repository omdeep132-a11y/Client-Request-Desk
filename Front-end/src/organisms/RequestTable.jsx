import { Link } from "react-router-dom";
import StatusBadge from "../molecules/StatusBadge";
import { formatDate } from "../utils/formatDate";

export default function RequestTable({ requests }) {
  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Service</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Scheduled</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr
              key={r._id}
              className="border-t border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-3 font-medium text-gray-900">
                {r.customerName}
              </td>
              <td className="px-4 py-3 text-gray-700">{r.service}</td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-4 py-3 text-gray-700">
                {formatDate(r.scheduledDate)}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  to={`/requests/${r._id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}