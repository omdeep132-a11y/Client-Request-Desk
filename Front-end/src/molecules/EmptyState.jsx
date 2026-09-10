export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <h3 className="text-lg font-medium text-gray-800">{title}</h3>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      {action}
    </div>
  );
}