interface Option<T extends string> {
  value: T;
  label: string;
}

interface VenderRadioGroupProps<T extends string> {
  name: string;
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  error?: string;
  required?: boolean;
}

export default function VenderRadioGroup<T extends string>({
  name,
  label,
  value,
  options,
  onChange,
  error,
  required,
}: VenderRadioGroupProps<T>) {
  return (
    <fieldset className="min-w-0 border-0 p-0 m-0">
      <legend className="block text-[13px] font-medium text-[#1E3A5F] mb-2">
        {label}
        {required ? <span className="text-[#D9773F]"> *</span> : null}
      </legend>
      <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const id = `${name}-${o.value}`;
          const checked = value === o.value;
          return (
            <label
              key={o.value}
              htmlFor={id}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                checked
                  ? 'border-[#1E3A5F] bg-[#1E3A5F] text-white'
                  : 'border-[#E0E5E9] bg-white text-[#1E3A5F] hover:border-[#4A7C59]'
              }`}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              {o.label}
            </label>
          );
        })}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
