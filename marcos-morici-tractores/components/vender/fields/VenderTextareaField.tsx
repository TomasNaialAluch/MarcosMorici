import FieldLabel from '@/components/vender/fields/FieldLabel';

interface VenderTextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  rows?: number;
  placeholder?: string;
}

export default function VenderTextareaField({
  id,
  label,
  value,
  onChange,
  error,
  required,
  rows = 4,
  placeholder,
}: VenderTextareaFieldProps) {
  return (
    <div>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#E0E5E9] px-3 py-2.5 text-sm text-[#1E3A5F] placeholder:text-[#5A6C7D]/60 focus:border-[#4A7C59] focus:outline-none focus:ring-1 focus:ring-[#4A7C59] resize-y min-h-[96px]"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
      />
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
