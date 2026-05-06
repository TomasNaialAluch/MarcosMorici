import FieldLabel from '@/components/vender/fields/FieldLabel';

interface VenderTextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'tel';
  placeholder?: string;
  autoComplete?: string;
}

export default function VenderTextField({
  id,
  label,
  value,
  onChange,
  error,
  required,
  type = 'text',
  placeholder,
  autoComplete,
}: VenderTextFieldProps) {
  return (
    <div>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-[#E0E5E9] px-3 py-2.5 text-sm text-[#1E3A5F] placeholder:text-[#5A6C7D]/60 focus:border-[#4A7C59] focus:outline-none focus:ring-1 focus:ring-[#4A7C59]"
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
