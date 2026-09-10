import { formatDateTime } from "../utils/formatDate";

const actionLabels = {
  REQUEST_CREATED: "created this request",
  REQUEST_UPDATED: "updated this request",
  STATUS_CHANGED: (m) => `changed status from ${m?.from} to ${m?.to}`,
  WORK_ITEM_CREATED: "converted this request to a work item",
};

export default function ActivityTimeline({ activities }) {
  if (!activities || activities.length === 0) {
    return <p className="text-sm text-gray-500">No activity yet.</p>;
  }

  return (
    <ol className="relative border-l border-gray-200 ml-3 space-y-6">
      {activities.map((a) => {
        const label = actionLabels[a.action];
        const text =
          typeof label === "function" ? label(a.metadata) : label || a.action;
        return (
          <li key={a._id} className="ml-6">
            <span className="absolute -left-1.5 w-3 h-3 bg-blue-500 rounded-full" />
            <p className="text-sm text-gray-800">
              <span className="font-medium">{a.userId?.name || "Someone"}</span>{" "}
              {text}
            </p>
            <p className="text-xs text-gray-500">
              {formatDateTime(a.createdAt)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}