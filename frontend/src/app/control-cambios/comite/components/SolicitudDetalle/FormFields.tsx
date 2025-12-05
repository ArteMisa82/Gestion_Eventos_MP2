export function FieldInput({ label, ...props }: any) {
  return (
    <div>
      <p className="text-xs text-gray-600">{label}</p>
      <input
        {...props}
        className={`mt-1 w-full border rounded-lg p-2 ${
          props.disabled && "bg-gray-100 cursor-not-allowed"
        }`}
      />
    </div>
  );
}

export function FieldSelect({ label, options, ...props }: any) {
  return (
    <div>
      <p className="text-xs text-gray-600">{label}</p>
      <select
        {...props}
        className={`mt-1 w-full border rounded-lg p-2 ${
          props.disabled && "bg-gray-100 cursor-not-allowed"
        }`}
      >
        {options.map((op: string) => (
          <option key={op}>{op}</option>
        ))}
      </select>
    </div>
  );
}