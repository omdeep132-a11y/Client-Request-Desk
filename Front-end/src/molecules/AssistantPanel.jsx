import Button from "../atoms/Button";

// Rule-based suggestions. No AI. Just a lookup by status.
function getSuggestion(request, activities) {
  if (!request) return null;

  const { status, createdAt } = request;

  if (status === "NEW") {
    const ageInDays = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (ageInDays >= 7) {
      return {
        tone: "warning",
        title: "This request looks stale",
        body: `It's been ${ageInDays} days with no progress. Consider qualifying it or closing it.`,
        actions: [
          { label: "Qualify", intent: "QUALIFIED", variant: "primary" },
          { label: "Close", intent: "CLOSED", variant: "secondary" },
        ],
      };
    }

    return {
      tone: "info",
      title: "This looks like a real lead",
      body: "The request is still new. Qualify it to move it toward becoming a job.",
      actions: [
        { label: "Qualify", intent: "QUALIFIED", variant: "primary" },
      ],
    };
  }

  if (status === "QUALIFIED") {
    const alreadyConverted = activities.some(
      (a) => a.action === "WORK_ITEM_CREATED"
    );

    if (alreadyConverted) {
      return {
        tone: "success",
        title: "Work item already created",
        body: "This request has been converted. No further action is needed here.",
        actions: [],
      };
    }

    return {
      tone: "success",
      title: "Ready to become a job",
      body: "This request is qualified. Create a work item to start the actual job.",
      actions: [
        { label: "Create Work Item", intent: "CONVERT", variant: "primary" },
      ],
    };
  }

  if (status === "CLOSED") {
    return {
      tone: "muted",
      title: "No action needed",
      body: "This request is closed. No further action is suggested.",
      actions: [],
    };
  }

  return null;
}

const toneStyles = {
  info: "bg-blue-50 border-blue-200 text-blue-900",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
  success: "bg-green-50 border-green-200 text-green-900",
  muted: "bg-gray-50 border-gray-200 text-gray-700",
};

export default function AssistantPanel({
  request,
  activities,
  onAction,
  busy,
}) {
  const suggestion = getSuggestion(request, activities);

  if (!suggestion) return null;

  const styles = toneStyles[suggestion.tone] || toneStyles.info;

  return (
    <div
      className={`border rounded-lg p-5 space-y-3 ${styles}`}
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">
          🤖
        </span>
        <h2 className="text-sm font-semibold">Assistant</h2>
      </div>

      <div>
        <p className="text-sm font-medium">{suggestion.title}</p>
        <p className="text-xs opacity-80 mt-1">{suggestion.body}</p>
      </div>

      {suggestion.actions.length > 0 && (
        <div className="flex gap-2 flex-wrap pt-1">
          {suggestion.actions.map((action) => (
            <Button
              key={action.intent}
              variant={action.variant}
              onClick={() => onAction(action.intent)}
              disabled={busy}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

      <p className="text-[11px] opacity-60 pt-1">
        Suggestions are rule-based. Nothing happens until you click.
      </p>
    </div>
  );
}