const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  return (
    <button
      className={`px-4 py-2 rounded-md font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}