export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <p className="text-sm text-red-600">{message || "Something went wrong."}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md font-medium text-sm hover:bg-gray-50 transition"
        >
          Try again
        </button>
      )}
    </div>
  );
}