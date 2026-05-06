import FieldLabel from '@/components/vender/fields/FieldLabel';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface VenderSelectFieldProps<T extends string> {
  id: string;
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  error?: string;
  required?: boolean;
}

export default function VenderSelectField<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  error,
  required,
}: VenderSelectFieldProps<T>) {
  return (
    <div>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-lg border border-[#E0E5E9] px-3 py-2.5 text-sm text-[#1E3A5F] bg-white focus:border-[#4A7C59] focus:outline-none focus:ring-1 focus:ring-[#4A7C59]"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
