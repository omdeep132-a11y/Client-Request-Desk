export default function Textarea({ className = "", error, ...props }) {
  return (
    <textarea
      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? "border-red-400" : "border-gray-300"
      } ${className}`}
      {...props}
    />
  );
}