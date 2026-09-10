const FILTERS = [
  { value: "", label: "All" },
  { value: "NEW", label: "New" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "CLOSED", label: "Closed" },
];

export default function StatusFilter({ value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-3 py-1.5 text-sm rounded-md border transition ${
            value === f.value
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}