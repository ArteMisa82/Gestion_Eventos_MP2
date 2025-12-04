interface Props {
  label: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function ActionButton({ label, color, onClick, disabled }: Props) {
  const base = "px-4 py-2 rounded-full border transition-all font-medium text-sm shadow-sm flex items-center gap-2";
  
  const colors: any = {
    gray: "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400",
    red: "bg-red-50 text-red-700 border-red-300 hover:bg-red-100 hover:border-red-400",
    green: "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400",
    blue: "bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100 hover:border-sky-400",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100 hover:border-indigo-400",
    rose: "bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 hover:border-rose-400",
  };

  const disabledStyles = "opacity-40 cursor-not-allowed hover:none";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${colors[color]} ${disabled ? disabledStyles : ""}`}
    >
      {label}
    </button>
  );
}